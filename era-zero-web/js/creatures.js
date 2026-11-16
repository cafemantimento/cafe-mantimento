'use strict';
// ======================================================================
//  Animais
// ======================================================================
const creatures=[];
function makeCreature(kind,x,z){const g=new THREE.Group();const body=new THREE.Group();g.add(body);g.position.set(x,H(x,z),z);g.rotation.y=R()*6.28;scene.add(g);const legs=[];
  const leg=(px,py,pz,th,len,m)=>{const pv=new THREE.Group();pv.position.set(px,py,pz);body.add(pv);box(pv,0,-len/2,0,th,len,th,m);legs.push(pv);};
  let c;
  if(kind==='boar'){sph(body,0,0.62,0,0.75,0.7,1.3,MAT.boar);box(body,0,0.95,-0.05,0.12,0.12,0.9,MAT.boarDark);const head=box(body,0,0.62,0.72,0.45,0.42,0.45,MAT.boar);
    cyl(body,0,0.58,1.0,0.25,0.13,0.25,MAT.snout,Math.PI/2);box(body,0.13,0.55,0.95,0.04,0.14,0.04,MAT.tusk,-0.5);box(body,-0.13,0.55,0.95,0.04,0.14,0.04,MAT.tusk,-0.5);
    box(body,0.14,0.85,0.65,0.09,0.15,0.04,MAT.boarDark);box(body,-0.14,0.85,0.65,0.09,0.15,0.04,MAT.boarDark);
    for(const [lx,lz] of [[0.2,0.4],[-0.2,0.4],[0.2,-0.4],[-0.2,-0.4]])leg(lx,0.45,lz,0.16,0.45,MAT.boarDark);
    c={kind,name:'Javali',max:60,walk:1.6,run:6.5};}
  else{sph(body,0,0.8,0,0.55,0.6,1.35,MAT.wolf);box(body,0,1.05,0.78,0.38,0.36,0.42,MAT.wolf);box(body,0,0.98,1.06,0.2,0.17,0.3,MAT.wolfDark);
    box(body,0.11,1.32,0.72,0.08,0.17,0.04,MAT.wolfDark,0,0,-0.17);box(body,-0.11,1.32,0.72,0.08,0.17,0.04,MAT.wolfDark,0,0,0.17);
    const e1=new THREE.Mesh(SPHG,MAT.eye);e1.scale.setScalar(0.06);e1.position.set(0.1,1.1,0.99);body.add(e1);const e2=e1.clone();e2.position.x=-0.1;body.add(e2);
    box(body,0,0.95,-0.85,0.12,0.12,0.6,MAT.wolfDark,-0.6);
    for(const [lx,lz] of [[0.15,0.5],[-0.15,0.5],[0.15,-0.5],[-0.15,-0.5]])leg(lx,0.6,lz,0.12,0.6,MAT.wolfDark);
    c={kind,name:'Lobo',max:50,walk:2.2,run:7.2};}
  Object.assign(c,{g,body,legs,hp:c.max,state:'idle',timer:R()*3,target:null,phase:0,atk:0,hurt:0,harvest:0,deadAt:0});
  creatures.push(c);return c;}
function blockedC(x,z,r){for(const n of nodes){if(!n.alive||n.r===0)continue;const dx=x-n.x,dz=z-n.z;if(dx>5||dx<-5||dz>5||dz<-5)continue;const rr=n.r+r;if(dx*dx+dz*dz<rr*rr)return true;}
  for(const b of boxColliders){if(x>b.minx-r&&x<b.maxx+r&&z>b.minz-r&&z<b.maxz+r&&b.maxy>H(x,z)+0.4)return true;}return false;}
function walkable(x,z){return Math.abs(x)<HALF-45&&Math.abs(z)<HALF-45&&H(x,z)>WATER+0.4&&slope(x,z)<32;}
function spawnCreature(kind,nearX,nearZ,minR,maxR,awayFrom){for(let t=0;t<20;t++){let x,z;
  if(nearX!=null){const a=R()*6.28,d=minR+R()*(maxR-minR);x=nearX+Math.cos(a)*d;z=nearZ+Math.sin(a)*d;}
  else{x=(R()*2-1)*170;z=(R()*2-1)*170;if(awayFrom&&Math.hypot(x-awayFrom.x,z-awayFrom.z)<awayFrom.d)continue;}
  if(!walkable(x,z)||slope(x,z)>28)continue;return makeCreature(kind,x,z);}return null;}
for(let i=0;i<10;i++)spawnCreature('boar',null,null,0,0,{x:0,z:0,d:30});

// ======================================================================
//  Animais: comportamento
// ======================================================================
let spawnTick=0,howlT=20;
function updateCreatures(dt){const now=performance.now()/1000;
  for(const c of creatures.slice()){const p=c.g.position;const dx=P.x-p.x,dz=P.z-p.z,dist=Math.hypot(dx,dz);
    if(c.hurt>0){c.hurt-=dt;c.body.scale.setScalar(1+c.hurt*0.4);}else c.body.scale.setScalar(1);
    if(c.state==='dead'){if(now-c.deadAt>90)removeCreature(c);continue;}
    c.voice=(c.voice==null?2+Math.random()*6:c.voice)-dt;if(c.voice<=0&&G.state==='play'){const vol=clamp(1-dist/32,0,1);c.voice=c.kind==='wolf'&&c.state==='chase'?2.5+Math.random()*2:5+Math.random()*9;if(vol>0.02)sfx(c.kind==='boar'?'grunt':c.state==='chase'?'growl':'growl',{vol});}
    c.timer-=dt;let speed=0;
    if(c.state==='idle'){if(c.timer<=0){for(let k=0;k<8;k++){const a=Math.random()*6.28,d=6+Math.random()*12;const x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(walkable(x,z)){c.target=[x,z];c.state='wander';c.timer=12;break;}}if(c.state==='idle')c.timer=2;}}
    else if(c.state==='wander'){speed=c.walk;if(c.timer<=0||Math.hypot(c.target[0]-p.x,c.target[1]-p.z)<1){c.state='idle';c.timer=2+Math.random()*4;}}
    else if(c.state==='flee'){speed=c.run;c.target=[p.x-dx/(dist||1)*10,p.z-dz/(dist||1)*10];if(c.timer<=0){c.state='idle';c.timer=2;}}
    else if(c.state==='chase'){speed=c.run;c.target=[P.x,P.z];c.atk-=dt;if(dist<2.1){speed=0;if(c.atk<=0&&!G.stats.dead){c.atk=1.3;damage(9);c.hurt=0.15;}}if(dist>45){c.state='idle';c.timer=3;}}
    if(c.kind==='wolf'&&c.state!=='chase'&&!G.stats.dead&&dist<(isNight()?26:12))c.state='chase';
    if(G.stats.dead&&c.state==='chase'){c.state='idle';c.timer=4;}
    if(speed>0&&c.target){const tx=c.target[0]-p.x,tz=c.target[1]-p.z;const want=Math.atan2(tx,tz);let diff=want-c.g.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));c.g.rotation.y+=clamp(diff,-6*dt,6*dt);
      let moved=false;for(const off of [0,0.7,-0.7,1.4,-1.4,2.1,-2.1]){const a=c.g.rotation.y+off;const nx=p.x+Math.sin(a)*speed*dt,nz=p.z+Math.cos(a)*speed*dt;
        if(walkable(nx,nz)&&!blockedC(nx,nz,0.55)){p.x=nx;p.z=nz;p.y=H(nx,nz);if(off)c.g.rotation.y+=off*Math.min(1,dt*4);moved=true;break;}}
      if(!moved&&c.state!=='chase'){c.target=[p.x-tx,p.z-tz];c.timer=Math.min(c.timer,2);}}
    if(speed>0.1)c.phase+=dt*speed*3.2;const sw=speed>0.1?Math.sin(c.phase)*0.55:0;
    if(c.legs.length===4){c.legs[0].rotation.x=sw;c.legs[3].rotation.x=sw;c.legs[1].rotation.x=-sw;c.legs[2].rotation.x=-sw;}
    c.body.position.y=Math.abs(Math.sin(c.phase))*0.04*Math.min(speed,3);}
  howlT-=dt;if(howlT<=0){howlT=25+Math.random()*30;if(isNight()&&G.state==='play')sfx('howl',{vol:0.35});}
  spawnTick-=dt;if(spawnTick<=0){spawnTick=8;
    const boars=creatures.filter(c=>c.kind==='boar'&&c.state!=='dead').length,wolves=creatures.filter(c=>c.kind==='wolf'&&c.state!=='dead').length;
    if(boars<10)spawnCreature('boar',null,null,0,0,{x:P.x,z:P.z,d:60});
    if(isNight()&&wolves<3&&Math.random()<0.45)spawnCreature('wolf',P.x,P.z,40,55);
    if(!isNight())for(const c of creatures.slice())if(c.kind==='wolf'&&c.state!=='dead'&&Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)>60)removeCreature(c);}}
