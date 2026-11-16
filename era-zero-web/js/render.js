'use strict';
// ======================================================================
//  Three.js: cena
// ======================================================================
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!isTouch,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouch?1.25:1.5));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(76,1,0.05,1200);
camera.rotation.order='YXZ';
scene.add(camera);
scene.fog=new THREE.FogExp2(0x9fb0c0,0.005);

function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const ui=clamp(Math.min(w/1600,h/900),isTouch?0.5:0.62,1);document.documentElement.style.setProperty('--ui',ui.toFixed(3));}
addEventListener('resize',resize);resize();

const hemi=new THREE.HemisphereLight(0xbfd8ff,0x4a3f2a,0.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1.2);
sun.castShadow=true;sun.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);
Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:260});sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);

// céu em degradê
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:new THREE.Color(0x3a6ea8)},mid:{value:new THREE.Color(0xa8c4dc)},bot:{value:new THREE.Color(0xd9c7a8)}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 mid;uniform vec3 bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(mid,top,pow(clamp(h*1.6,0.0,1.0),0.8)):mix(mid,bot,clamp(-h*4.0,0.0,1.0));gl_FragColor=vec4(c,1.0);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(600,24,16),skyMat);sky.renderOrder=-1;scene.add(sky);
const sunDisk=new THREE.Mesh(new THREE.SphereGeometry(14,16,12),new THREE.MeshBasicMaterial({color:0xfff2cf,fog:false}));scene.add(sunDisk);
const stars=(()=>{const g=new THREE.BufferGeometry();const p=[];const r=rng(7);for(let i=0;i<700;i++){const u=r()*Math.PI*2,v=Math.acos(r()*0.95);p.push(Math.sin(v)*Math.cos(u)*550,Math.cos(v)*550,Math.sin(v)*Math.sin(u)*550);}
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const m=new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,fog:false,transparent:true,opacity:0});const s=new THREE.Points(g,m);scene.add(s);return s;})();
