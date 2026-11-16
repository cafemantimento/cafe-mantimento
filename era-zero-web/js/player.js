'use strict';
// ======================================================================
//  Jogador
// ======================================================================
const P={x:0,y:H(0,0)+0.1,z:0,yaw:-0.35,pitch:0,vy:0,vx:0,vz:0,grounded:true,sprint:false};
G.respawn={x:0,y:H(0,0)+0.2,z:0};
// item na mão
const hand=new THREE.Group();hand.position.set(0.38,-0.36,-0.62);hand.rotation.set(0.14,0.2,0);camera.add(hand);
let handItem=null,handId='~',swingT=1,bob=0;
function buildHeld(d,forAvatar){const H2=new THREE.Group();
  if(!d){if(!forAvatar)box(H2,0,-0.05,0,0.11,0.11,0.28,MAT.skin);}
  else if(d.tool==='axe'){cyl(H2,0,0.05,0,0.045,0.6,0.045,MAT.wood);box(H2,0.07,0.3,0,0.18,0.12,0.06,MAT.stone);}
  else if(d.tool==='pick'){cyl(H2,0,0.05,0,0.045,0.6,0.045,MAT.wood);box(H2,0,0.32,0,0.36,0.06,0.06,MAT.stone,0,0,0.14);}
  else if(d.tool==='spear'){cyl(H2,0,0.15,-0.1,0.035,1.2,0.035,MAT.wood,-1.2);box(H2,0,0.36,-0.7,0.05,0.05,0.16,MAT.concreteDark,0.35,0,0.8);}
  else if(d.kind==='piece'){box(H2,0,0,0,0.22,0.02,0.3,new THREE.MeshBasicMaterial({color:lin(0x5fe1ff),transparent:true,opacity:0.7}),0.5);}
  else{const m=mat(new THREE.Color(d.color));(d.kind==='food'?sph:box)(H2,0,0,0,0.13,0.13,0.13,m);}
  H2.traverse(o=>{if(o.isMesh)o.castShadow=!!forAvatar;});return H2;}
function refreshHeld(){const d=selDef();const id=d?d.id:'';if(id===handId)return;handId=id;if(handItem)hand.remove(handItem);handItem=buildHeld(d,false);hand.add(handItem);
  if(localAv)setAvatarHeld(localAv,d);
  setBuildPiece(d&&d.kind==='piece'?d.id:null);
  updateTouchContext();}

// ======================================================================
//  Sobrevivência
// ======================================================================
function useStam(a){if(G.stats.stam<a)return false;G.stats.stam-=a;G.stats.stamDelay=0.8;return true;}
let flash=0;
function damage(a,silent){const st=G.stats;if(st.dead)return;st.hp-=a;if(!silent){flash=0.45;sfx('hurt');}if(st.hp<=0){st.hp=0;st.dead=true;setState('dead');}}
const isNight=()=>G.hour<6||G.hour>=19;
let ambientTemp=20,shelterCheck=0;
function updateStats(dt){const st=G.stats;if(st.dead)return;
  st.nearFire=campfires().some(p=>Math.hypot(p.g.position.x-P.x,p.g.position.z-P.z)<7);
  shelterCheck-=dt;if(shelterCheck<=0){shelterCheck=0.5;st.sheltered=boxColliders.some(b=>b.piece&&P.x>b.minx&&P.x<b.maxx&&P.z>b.minz&&P.z<b.maxz&&b.miny>P.y+1.5&&b.miny<P.y+6);}
  st.temp=ambientTemp+(st.nearFire?15:0)+(st.sheltered?6:0);const cold=st.temp<10;
  st.food=Math.max(0,st.food-(cold?0.11:0.07)*dt);st.water=Math.max(0,st.water-0.1*dt);
  if(st.stamDelay>0)st.stamDelay-=dt;else st.stam=Math.min(100,st.stam+(cold?7:14)*dt);
  let drain=0;if(st.food<=0)drain+=1;if(st.water<=0)drain+=1.2;if(cold)drain+=0.35;
  if(drain>0)damage(drain*dt,true);else if(st.food>40&&st.water>40&&st.hp<100)st.hp=Math.min(100,st.hp+0.6*dt);}

// ======================================================================
//  Movimento e colisão
// ======================================================================
const PR=0.35;
function groundAt(x,y,z){let g=H(x,z);for(const b of boxColliders){if(x>b.minx-0.05&&x<b.maxx+0.05&&z>b.minz-0.05&&z<b.maxz+0.05&&b.maxy<=y+0.5&&b.maxy>g)g=b.maxy;}return g;}
function collide(nx,nz,y){
  for(const n of nodes){if(!n.alive||n.r===0)continue;const dx=nx-n.x,dz=nz-n.z,rr=n.r+PR;const d2=dx*dx+dz*dz;if(d2<rr*rr&&d2>1e-6){const d=Math.sqrt(d2);nx=n.x+dx/d*rr;nz=n.z+dz/d*rr;}}
  for(const b of boxColliders){if(b.maxy<=y+0.5||b.miny>=y+1.75)continue;const cx=clamp(nx,b.minx,b.maxx),cz=clamp(nz,b.minz,b.maxz);let dx=nx-cx,dz=nz-cz;const d2=dx*dx+dz*dz;
    if(d2<PR*PR){if(d2>1e-8){const d=Math.sqrt(d2);nx=cx+dx/d*PR;nz=cz+dz/d*PR;}else{const l=nx-b.minx,r=b.maxx-nx,f=nz-b.minz,k=b.maxz-nz;const m=Math.min(l,r,f,k);if(m===l)nx=b.minx-PR;else if(m===r)nx=b.maxx+PR;else if(m===f)nz=b.minz-PR;else nz=b.maxz+PR;}}}
  for(const c of creatures){if(c.state==='dead')continue;const p=c.g.position;const dx=nx-p.x,dz=nz-p.z,rr=0.7+PR;const d2=dx*dx+dz*dz;if(d2<rr*rr&&d2>1e-6){const d=Math.sqrt(d2);nx=p.x+dx/d*rr;nz=p.z+dz/d*rr;}}
  return [nx,nz];}
function updatePlayer(dt){const control=G.state==='play'&&!G.stats.dead;
  if(control){const sens=isTouch?0.0042:0.0042;P.yaw-=lookDX*sens;P.pitch=clamp(P.pitch-lookDY*sens,-1.45,1.45);
    if(!isTouch){let ty=0,tp=0;if(keys.ArrowLeft)ty+=1;if(keys.ArrowRight)ty-=1;if(keys.ArrowUp)tp+=1;if(keys.ArrowDown)tp-=1;
      if(MOUSE.in&&!MOUSE.rdrag){const ex=Math.abs(MOUSE.x),ey=Math.abs(MOUSE.y);if(ex>0.84)ty-=Math.sign(MOUSE.x)*Math.min(1,(ex-0.84)/0.13);if(ey>0.86)tp+=Math.sign(MOUSE.y)*Math.min(1,(ey-0.86)/0.12)*0.6;}
      P.yaw+=ty*2.6*dt;P.pitch=clamp(P.pitch+tp*1.6*dt,-1.45,1.45);}}
  lookDX=0;lookDY=0;
  let ix=0,iz=0;if(control){ix=(keys.KeyD?1:0)-(keys.KeyA?1:0);iz=(keys.KeyW?1:0)-(keys.KeyS?1:0);if(joy.id!==null){ix=joy.x;iz=-joy.y;}const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l;}}
  const st=G.stats;P.sprint=control&&(keys.ShiftLeft||keys.ShiftRight||touchRun)&&iz>0.1&&st.stam>1;if(P.sprint){st.stam-=14*dt;st.stamDelay=0.8;}
  let speed=P.sprint?7.5:4.5;if(st.food<=0||st.water<=0)speed*=0.8;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  const tx=(rx*ix+fx*iz)*speed,tz=(rz*ix+fz*iz)*speed;const acc=(P.grounded?14:3)*speed*dt;
  const dvx=tx-P.vx,dvz=tz-P.vz,dl=Math.hypot(dvx,dvz);if(dl<=acc){P.vx=tx;P.vz=tz;}else{P.vx+=dvx/dl*acc;P.vz+=dvz/dl*acc;}
  if(P.grounded&&control&&wasPressed('Space')&&useStam(8))P.vy=Math.sqrt(1.3*2*20),P.grounded=false;
  P.vy-=20*dt;
  let nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;
  // não entrar na água funda
  if(H(nx,nz)<WATER-1.1&&H(nx,nz)<H(P.x,P.z)){nx=P.x;nz=P.z;}
  [nx,nz]=collide(nx,nz,P.y);
  nx=clamp(nx,-HALF+20,HALF-20);nz=clamp(nz,-HALF+20,HALF-20);
  // não subir encostas íngremes demais
  const gNew=groundAt(nx,P.y,nz);if(gNew>P.y+0.5&&slope(nx,nz)>48){nx=P.x;nz=P.z;}
  P.x=nx;P.z=nz;
  let ny=P.y+P.vy*dt;const g=groundAt(P.x,P.y,P.z);
  for(const b of boxColliders){if(P.x>b.minx&&P.x<b.maxx&&P.z>b.minz&&P.z<b.maxz&&P.y+1.8<=b.miny+0.05&&ny+1.8>b.miny){ny=b.miny-1.8;P.vy=Math.min(P.vy,0);}}
  if(ny<=g){ny=g;P.vy=0;P.grounded=true;}else if(ny>g+0.05)P.grounded=false;
  if(P.grounded&&g>P.y&&g-P.y<0.55)ny=lerp(P.y,g,Math.min(1,dt*18));
  P.y=ny;
  // pouso
  if(P.grounded&&!P.wasGrounded&&P.fallV<-7){P.land=Math.min(0.22,-P.fallV*0.018);sfx('step');}
  P.fallV=P.vy<0?P.vy:P.fallV;if(P.grounded)P.fallV=0;P.wasGrounded=P.grounded;
  P.land=Math.max(0,(P.land||0)-dt*0.9);
  // passos e balanço da câmera
  const moving=control&&(Math.abs(ix)+Math.abs(iz))>0.05&&P.grounded;const prevB=bob;
  bob=moving?bob+dt*(P.sprint?11.5:7.5):lerp(bob,Math.round(bob/Math.PI)*Math.PI,Math.min(1,dt*6));
  if(moving&&Math.floor(bob/Math.PI)!==Math.floor(prevB/Math.PI))sfx('step',{wood:P.y>H(P.x,P.z)+0.12});
  const amp=moving?(P.sprint?0.075:0.045):0;P.bobAmp=lerp(P.bobAmp||0,amp,Math.min(1,dt*8));
  const by=Math.abs(Math.sin(bob))*P.bobAmp-P.land,roll=Math.sin(bob)*P.bobAmp*0.12;
  P.speedNow=Math.hypot(P.vx,P.vz);
  const fovT=P.sprint&&moving?84:76;if(Math.abs(camera.fov-fovT)>0.05){camera.fov=lerp(camera.fov,fovT,Math.min(1,dt*6));camera.updateProjectionMatrix();}
  if(VIEW.tp){
    const head=new THREE.Vector3(P.x,P.y+1.62,P.z);const fwd=new THREE.Vector3(-Math.sin(P.yaw)*Math.cos(P.pitch),Math.sin(P.pitch),-Math.cos(P.yaw)*Math.cos(P.pitch));
    const right=new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));let dist=3.4;
    for(let t=0.4;t<=3.4;t+=0.2){const q=head.clone().addScaledVector(fwd,-t).addScaledVector(right,0.45*(t/3.4));if(q.y<H(q.x,q.z)+0.25){dist=Math.max(0.6,t-0.3);break;}}
    camera.position.copy(head).addScaledVector(fwd,-dist).addScaledVector(right,0.45*(dist/3.4));camera.position.y+=0.15;
    camera.rotation.set(P.pitch,P.yaw,0);hand.visible=false;
    if(localAv){localAv.g.visible=true;localAv.g.position.set(P.x,P.y,P.z);localAv.g.rotation.y=P.yaw;animateAvatar(localAv,P.speedNow,dt);}
  }else{
    camera.position.set(P.x,P.y+1.65+by,P.z);camera.rotation.set(P.pitch,P.yaw,roll);hand.visible=true;if(localAv)localAv.g.visible=false;
  }
  // golpe de acordo com a ferramenta
  const d=selDef();const tool=d?(d.tool||d.kind):'hand';let sw=0;if(swingT<1){swingT=Math.min(1,swingT+dt/0.42);const k=swingT<0.35?swingT/0.35:1-(swingT-0.35)/0.65;sw=Math.sin(k*Math.PI/2);}
  let px=0.38+Math.cos(bob)*0.014,py=-0.36+Math.abs(Math.sin(bob))*0.02,pz=-0.62,hx=0.14,hy=0.2,hz=0;
  if(tool==='axe'){hx-=1.5*sw;hz+=0.6*sw;px-=0.14*sw;py+=0.06*sw;}
  else if(tool==='pick'){hx-=1.9*sw;py+=0.1*sw;pz-=0.1*sw;}
  else if(tool==='spear'){pz-=0.5*sw;py+=0.05*sw;px-=0.1*sw;}
  else if(tool==='hand'){pz-=0.32*sw;px-=0.16*sw;py+=0.06*sw;hx-=0.25*sw;}
  else{hx-=0.8*sw;pz-=0.1*sw;}
  hand.position.set(px,py,pz);hand.rotation.set(hx,hy,hz);}
