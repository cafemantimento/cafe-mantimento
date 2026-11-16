'use strict';
// ======================================================================
//  Dia e noite
// ======================================================================
const cNightTop=new THREE.Color(0x050915),cNightMid=new THREE.Color(0x101a2e),cDayTop=new THREE.Color(0x3a6ea8),cDayMid=new THREE.Color(0xb3cde0),cDusk=new THREE.Color(0xe08a5c),cGroundD=new THREE.Color(0xd9c7a8),cGroundN=new THREE.Color(0x0b0d12);
const tmpC=new THREE.Color(),tmpC2=new THREE.Color();
function onDay(){questAdvance('noite',G.day>=2?1:0);}
function updateDay(dt){G.hour+=24/G.dayLen*dt;if(G.hour>=24){G.hour-=24;G.day++;onDay();banner(`DIA ${G.day}`,'Você sobreviveu a mais uma noite.');}applyDay();}
function applyDay(){const elev=(G.hour/24)*360-90;const s=Math.sin(elev*Math.PI/180);const day=clamp(s*2.5,0,1);const dusk=clamp(1-Math.abs(s)*4,0,1);
  const az=160*Math.PI/180;
  let dir;if(s>-0.02){const e=Math.max(elev,2)*Math.PI/180;dir=new THREE.Vector3(Math.cos(e)*Math.sin(az),Math.sin(e),Math.cos(e)*Math.cos(az));sun.intensity=1.9*clamp(s*4+0.05,0,1);sun.color.setRGB(1,lerp(0.62,0.96,clamp(s*2.2,0,1)),lerp(0.38,0.9,clamp(s*2.2,0,1)));}
  else{const e=Math.max(-elev,8)*Math.PI/180,a2=340*Math.PI/180;dir=new THREE.Vector3(Math.cos(e)*Math.sin(a2),Math.sin(e),Math.cos(e)*Math.cos(a2));sun.intensity=0.35*clamp(-s*4,0,1);sun.color.setRGB(0.62,0.72,1);}
  sun.position.set(P.x+dir.x*120,P.y+dir.y*120,P.z+dir.z*120);sun.target.position.set(P.x,P.y,P.z);
  sunDisk.position.copy(camera.position).addScaledVector(dir,520);sunDisk.material.color.set(s>-0.02?0xfff2cf:0xdde6ff);sunDisk.scale.setScalar(s>-0.02?1:0.6);
  skyMat.uniforms.top.value.copy(cNightTop).lerp(cDayTop,day);
  skyMat.uniforms.mid.value.copy(cNightMid).lerp(cDayMid,day).lerp(cDusk,dusk*0.75);
  skyMat.uniforms.bot.value.copy(cGroundN).lerp(cGroundD,day);
  sky.position.copy(camera.position);stars.position.copy(camera.position);stars.material.opacity=clamp(1-day*3,0,1)*0.9;
  hemi.intensity=lerp(0.25,0.95,day)+dusk*0.1;hemi.color.copy(cNightMid).lerp(new THREE.Color(0xcfe2ff),day).convertSRGBToLinear();hemi.groundColor.set(0x14110c).lerp(new THREE.Color(0x5a4c33),day).convertSRGBToLinear();
  scene.fog.color.copy(skyMat.uniforms.mid.value).convertSRGBToLinear();scene.fog.density=lerp(0.011,0.0045,day);
  ambientTemp=lerp(7,25,day)+dusk*2;SKYS.day=day;SKYS.dusk=dusk;SKYS.sunUp=s>-0.02;}
