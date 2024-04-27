"use strict"

let cobaan = {}

o3dv.javascript_ui = async aa=>{
	let lih = ru.lihat
	let que = ru.que
	let v3 = wgpuMatrix.vec3
	let m3 = wgpuMatrix.mat3
	let m4 = wgpuMatrix.mat4
	let w = o3dv.canv.width
	let h = o3dv.canv.height
	
	let persp = m4.identity()
	let cam = m4.identity()
	let view = m4.identity()//hasil dari persp*cam 
	
    m4.perspective(
        .9,//rad
        w/h,
        .01,      // zNear
        Number.MAX_SAFE_INTEGER,//999.01,   // zFar
        persp,
    );
	
	//change z to 1-z
	m4.invert(persp,persp,)
		m4.translate(persp,[0,0,1,],persp)
		m4.scale(persp,[1,1,-1,],persp,)
	m4.invert(persp,persp,)
	//it wokkkkkk, HOW?? 
	
	//suara
	let audheli = null
	let auddrum = null
	let audhutan = null
	let acx = new AudioContext()
	let gainheli = acx.createGain()
	let gainhutan = acx.createGain()
	let audbufheli = acx.createBufferSource();
	let audbufdrum
	let audbufhutan = acx.createBufferSource();
	
	;{
		let src = que('#rotorwav')[0].href
		audheli = await fetch(src)
		audheli = await audheli.arrayBuffer()
		audheli = await acx.decodeAudioData(audheli)
		
		src = que('#blinkwav')[0].href
		auddrum = await fetch(src)
		auddrum = await auddrum.arrayBuffer()
		auddrum = await acx.decodeAudioData(auddrum)
		
		src = que('#hutanwav')[0].href
		audhutan = await fetch(src)
		audhutan = await audhutan.arrayBuffer()
		audhutan = await acx.decodeAudioData(audhutan)
	}
	
	audbufheli.buffer = audheli;
	audbufheli.connect(gainheli).connect(acx.destination);
	audbufheli.loop = true
	
	gainhutan.gain.value = 2
	audbufhutan.buffer = audhutan;
	audbufhutan.connect(gainhutan).connect(acx.destination);
	audbufhutan.loop = true
	
	let camges = m4.identity()
	let rang = 0
	let camreset = ()=>{
		m4.identity(camges)
		m4.rotateY(camges,.4,camges,)
		m4.scale(camges,Array(3).fill(3333),camges,)
		rang = -.5
	}
	camreset()
	let fcam = ()=>{
		m4.copy(camges,cam,)
		m4.rotateX(cam,rang,cam,)
		m4.translate(cam,[0,0,3,],cam,)
		m4.invert(cam,cam,)
		m4.mul(persp,cam,view,)
		o3dv.updcam(view)
	}
	fcam()
	
	;{
		let src = que('#tamanbin')[0].href
		//let f = await fetch('../Poly Landhep/v1/js/taman.bin')
		let f = await fetch(src)
		f = await f.arrayBuffer()
		readbin(f)
		lih(f)
	}
	//return 0
	
	
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;   ;;;;;;;;;;;;;;;   ;;;;;;;;
	;;;;;;;;   ;;;;;;;;;;;;;;;   ;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;                 ;;;;;;;;;;
	;;;;;;;;;;;               ;;;;;;;;;;;
	;;;;;;;;;;;;;;         ;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	
	//render
	let putar = 0
	let step = 0
	let dt = 0
	let tunda = 0
	let anigetar = false
	fcam()
	//let cgawal = m4.copy(camges)
	let v3p0 = v3.create()//v3 pinjam
	let v3p1 = v3.create()//v3 pinjam
	let v3p2 = v3.create()//v3 pinjam
	let m4p0 = m4.identity()//m4 pinjam
	
	//helikopter
	let mhe = m4.identity()//helikopter
	let mro = m4.identity()//rotor
	let arge = v3.create()//arahgerak
	let kecepatan = v3.create()
	
	//drum
	let mdrum = m4.identity()
	let drumdipegang = false
	
	//ayunan
	let jarakayun = .1
	
	addEventListener('wheel',e=>{
		if(document.pointerLockElement === docele){
			let s = 1.001**(e.deltaY)
			m4.scale(camges,[s,s,s,],camges,)
		}
	},)
	let docele = document.documentElement
	addEventListener('mousemove',e=>{
		if(document.pointerLockElement === docele){
			rang += -e.movementY*.01
			
			let pi = Math.PI
			rang = Math.max(Math.min(pi/2,rang,),-pi/2,)
			m4.rotateY(camges,-e.movementX*.01,camges,)
		}
	},)
	addEventListener('mousedown',e=>{
		try{
			audbufheli.start(acx.currentTime)
			audbufhutan.start(acx.currentTime)
		}catch(e){}
		if(document.pointerLockElement === docele){//berhenti
			document.exitPointerLock()
		}else if(e.target === que('#mulai')[0]){
			docele.requestPointerLock()
		}
	},)
	document.addEventListener('pointerlockchange',()=>{
		let c = que('#uihelp')[0].classList
		let s = 'hilang'
		
		if(document.pointerLockElement === docele){
			c.add(s)
		}else{
			c.remove(s)
		}
		
	})
	
	let keycodes = {//87 65 83 68
		[87]:'w'	,
		[65]:'a'	,
		[83]:'s'	,
		[68]:'d'	,
		[81]:'q',
		[69]:'e',
	}
	let key = {}
	
	let fkey = e=>{
 		//lih(e.keyCode)
		if(
			(document.activeElement !== document.body) ||
			e.ctrlKey ||
			e.shiftKey ||
			e.altKey
		){return}
		let keyini = keycodes[e.keyCode]
		let awal = key[keyini]
		if(awal === undefined){return}
		let akhir = e.type === 'keydown'
		let berubah = awal !== akhir
		key[keyini] = akhir
		
		//-=-=-=-=-=-=-=-=-=-=-=-=-=-=
		if(key.w && berubah){arge[2] = 1} else
		if(key.s && berubah){arge[2] = -1} else
		if((!key.w || !key.s) && berubah){arge[2] = 0}
		
		if(key.a && berubah){arge[0] = 1} else
		if(key.d && berubah){arge[0] = -1} else
		if((!key.a || !key.d) && berubah){arge[0] = 0}
		
		if(key.q && berubah){arge[1] = 1} else
		if(key.e && berubah){arge[1] = -1} else
		if((!key.q || !key.e) && berubah){arge[1] = 0}
		
		v3.normalize(arge,arge,)
		v3.scale(arge,9,arge,)
	}
	for(let code in keycodes){
		key[keycodes[code]] = false
	}
	addEventListener('keydown',fkey,)
	addEventListener('keyup',fkey,)
	
	let drumpindah = ()=>{
		m4.translation([
			(Math.random()-.5)*99999,
			(Math.random()-.5)*99999,
			(Math.random()-.5)*99999,
		],mdrum,)
		o3dv.setmat3d(5,...mdrum,)
	}
	drumpindah()
	let playauddrum = ()=>{
		audbufdrum = acx.createBufferSource()
		audbufdrum.buffer = auddrum;
		audbufdrum.connect(acx.destination);
		audbufdrum.start(0)
	}
	
	o3dv.render = dtini=>{//return 0
		dt += dtini
		dt = Math.min(dt,1000,)
		if(step < tunda){
			step++
			return
		}
		
		//mat3d bukan helikopter
		let m = m4.identity()
		let mpo = m4.identity()
		let getar = m4.identity()
		let putarawal = putar
		putar += 1.9*dt*.001
		let wei = Math.random()
		let wg = anigetar?(putar*wei+putarawal*(1-wei)):putar//waktu getar
		let ayun = Math.sin(wg)*jarakayun
		
		for(let a = 12;a < 15;a++){
			if(!anigetar){break}
			let u = 15//ukuran
			getar[a] += (Math.random()*2-1)*u
		}
		m4.translate(mpo,[0,1811,0,],mpo,)
		m4.copy(mpo,m,)
		m4.translate(m,[0,0,-555,],m,)
		m4.rotateX(m,ayun,m,)
		m4.invert(mpo,mpo,)
		m4.mul(m,mpo,m,)
		m4.mul(m,getar,m,)
		
		o3dv.setmat3d(1,...m,)
		
		let mpohon = m4.identity()
		let mpohges = m4.identity()
		
		m4.translate(mpohon,[
			Math.sin(wg*.2)*1111,
		0,0,],mpohon,)
		m4.rotateZ(mpohon,
			Math.sin(5+wg*2.4)*.01
			+Math.sin(5+wg*.4)*.1
		,mpohon,)
		m4.scale(mpohon,[
			1+Math.sin(wg*2.4)*.02,
		1,1,],mpohon,)
		o3dv.setmat3d(2,...mpohon,)
		o3dv.setmat3d(2,...mpohon,)
		
		//mat2d
		let s0 = m3.identity()//batas sungai 0
		let s1 = m3.identity()//batas sungai 1
		
		m3.translate(s0,[0,Math.sin(wg*.7)*222,],s0,)
		m3.translate(s1,[0,-Math.sin(wg*.7)*155,],s1,)
		o3dv.setmat2d(0,...s0,)
		o3dv.setmat2d(1,...s1,)
		
		//warna sungai
		o3dv.te.setcolor(1,0x0000aaff+Math.floor(0x55*(
			Math.sin(wg*.4)*.5+1
		))*0x00010000)
		
		//helikopter
		v3.lerp(kecepatan,arge,.07,kecepatan,)
		v3.scale(kecepatan,dt,v3p0,)
		//m4.translate(mhe,[0,0,11.1*dt,],mhe,)
		m4.translate(mhe,v3p0,mhe,)
		//ikuti arah kamera
			//cari arah helikopter
			m4.getAxis(mhe,2,v3p0,)	;v3.normalize(v3p0,v3p0,)//+z
			m4.getAxis(camges,2,v3p1,)	;v3.normalize(v3p1,v3p1,)	;v3.negate(v3p1,v3p1,)//-z
			
			let arah = v3.cross(v3p0,v3p1,v3p2,)[1] < 0
			let jarak = v3.dist(v3p0,v3p1,)
			let puhe = jarak*.01*(arah?-1:1)//putarheli
			puhe = Math.min(puhe,.001,)
			puhe = Math.max(puhe,-.001,)
			
			m4.rotateY(mhe,puhe*dt,mhe,)
		m4.rotateY(mro,.01*dt,mro,)
		
		m4.mul(mhe,mro,m4p0,)
		o3dv.setmat3d(3,...mhe,)
		o3dv.setmat3d(4,...m4p0,)
		
		//drum
		if(drumdipegang){
			m4.translate(mhe,[0,-666,0,],mdrum,)
			o3dv.setmat3d(5,...mdrum,)
			
			m4.getTranslation(mdrum,v3p0,)
			if(!(drumdipegang = (2222 < v3.len(v3p0,)))){
				drumpindah()
				jarakayun += .5
				playauddrum()
				setTimeout(playauddrum,77,)
			}
		}else{
			m4.getTranslation(mhe,v3p0,)
			m4.getTranslation(mdrum,v3p1,)
			if(drumdipegang = (v3.dist(v3p0,v3p1,) < 2222)){
				playauddrum()
			}
		}
		
		//cam
			//reset posisi camges
			m4.getTranslation(camges,v3p0,)
			v3.negate(v3p0,v3p0,)
			m4.translation(v3p0,m4p0,)
			m4.mul(m4p0,camges,camges,)
			
			//ikut helikopter
			m4.getTranslation(mhe,v3p0,)
			m4.translation(v3p0,m4p0,)
			m4.mul(m4p0,camges,camges,)
		//
		fcam()
		o3dv.updcam(view)
		
		//suara heli
		m4.getAxis(camges,2,v3p0,)
		let gval = v3.len(v3p0)*.00007
		gval = Math.max(gval,0,)
		gval = Math.min(gval,1,)
		gainheli.gain.value = 1-gval
		
		//
		dt = step = 0
	}
}