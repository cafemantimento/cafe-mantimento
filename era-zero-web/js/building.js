'use strict';
// ======================================================================
//  Peças de construção
// ======================================================================
const CELL=3,WALLH=3,FDEPTH=1.4;
const isFound=id=>id==='fundacao',isWall=id=>id==='parede'||id==='porta',isRoof=id=>id==='teto',isGrid=id=>isFound(id)||isWall(id)||isRoof(id);
const buildGroup=new THREE.Group();scene.add(buildGroup);
const pieces=[];const foundations=new Map(),walls=new Set(),roofs=new Set();
const ck=(x,z)=>x+':'+z;
const ghostOk=new THREE.MeshBasicMaterial({color:lin(0x5fe1ff),transparent:true,opacity:0.38,depthWrite:false});
const ghostBad=new THREE.MeshBasicMaterial({color:lin(0xff4a4a),transparent:true,opacity:0.38,depthWrite:false});
function pieceVisual(id,ghost){const g=new THREE.Group();const parts=[];
  const B=(x,y,z,sx,sy,sz,m,solid)=>{const b=box(g,x,y,z,sx,sy,sz,ghost?ghostOk:m);if(ghost){b.castShadow=false;b.receiveShadow=false;}if(solid)parts.push([x,y,z,sx,sy,sz]);return b;};
  if(id==='fundacao'){B(0,-FDEPTH/2-0.05,0,CELL,FDEPTH-0.1,CELL,MAT.woodDark,true);B(0,-0.05,0,CELL,0.1,CELL,MAT.wood,true);if(!ghost)for(let i=0;i<6;i++)B(-1.25+i*0.5,0.003,0,0.03,0.01,CELL-0.02,MAT.woodDark);}
  else if(id==='parede'){B(0,WALLH/2,0,CELL,WALLH,0.2,MAT.wood,true);B(-1.42,WALLH/2,0,0.18,WALLH,0.26,MAT.woodDark);B(1.42,WALLH/2,0,0.18,WALLH,0.26,MAT.woodDark);}
  else if(id==='porta'){B(-1.05,WALLH/2,0,0.9,WALLH,0.2,MAT.wood,true);B(1.05,WALLH/2,0,0.9,WALLH,0.2,MAT.wood,true);B(0,2.6,0,1.2,0.8,0.2,MAT.wood,true);B(-1.42,WALLH/2,0,0.18,WALLH,0.26,MAT.woodDark);B(1.42,WALLH/2,0,0.18,WALLH,0.26,MAT.woodDark);}
  else if(id==='teto'){B(0,0.1,0,CELL+0.1,0.2,CELL+0.1,MAT.wood,true);if(!ghost)for(let i=0;i<3;i++)B(-1+i,-0.06,0,0.12,0.12,CELL,MAT.woodDark);}
  else if(id==='fogueira'){for(let i=0;i<8;i++){const a=i*Math.PI/4;const s=sph(g,Math.cos(a)*0.5,0.08,Math.sin(a)*0.5,0.24,0.16,0.2,ghost?ghostOk:MAT.stone);s.rotation.y=-a;}
    cyl(g,0,0.12,0,0.1,0.76,0.1,ghost?ghostOk:MAT.woodDark,Math.PI/2,0.5,0);cyl(g,0,0.15,0,0.1,0.76,0.1,ghost?ghostOk:MAT.woodDark,Math.PI/2,-0.7,0);
    if(!ghost){const fl=[];for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(0.18-i*0.02,0.6-i*0.08,6),i===0?MAT.flameCore:MAT.flame);c.position.set((i-1.5)*0.08,0.45,(i%2)*0.08-0.04);g.add(c);fl.push(c);}g.userData.flames=fl;}}
  else if(id==='saco'){B(0,0.08,0,0.9,0.16,2,MAT.cloth);B(0,0.17,0.75,0.6,0.12,0.35,MAT.crate);B(0,0.17,-0.2,0.92,0.04,1.2,MAT.woodDark);}
  else if(id==='forja'){B(0,0.55,0,1.6,1.1,1.3,MAT.stone,true);B(0,1.3,0,1.1,0.5,0.9,MAT.concreteDark);B(0.45,2.0,0.2,0.35,1.4,0.35,MAT.stone);B(0,0.55,0.66,0.6,0.4,0.05,ghost?ghostOk:new THREE.MeshBasicMaterial({color:lin(0xff7a2a)}));
    if(!ghost)g.userData.forge=true;}
  else if(id==='bau'){B(0,0.32,0,1.1,0.64,0.7,MAT.crate,true);B(0,0.7,0,1.14,0.14,0.74,MAT.woodDark);B(0,0.45,0.36,0.16,0.2,0.04,MAT.metal);}
  if(ghost)g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  return {g,parts};}
function placePiece(id,pos,rotY,cell,edge,floorTop,silent){const {g,parts}=pieceVisual(id,false);g.position.copy(pos);g.rotation.y=rotY;buildGroup.add(g);g.updateMatrixWorld(true);
  const p={id,g,cell,edge,floorTop,boxes:[],raw:0,cooked:0,timer:0,ore:{cobre:0,ferro:0},ingots:{cobre:0,ferro:0},store:id==='bau'?new Array(16).fill(null):null};g.userData.piece=p;g.traverse(o=>o.userData.piece=p);
  const swap=Math.abs(Math.sin(rotY))>0.5;
  for(const [x,y,z,sx,sy,sz] of parts){const wx=swap?z:x,wz=swap?x:z,ex=swap?sz:sx,ez=swap?sx:sz;
    p.boxes.push({minx:pos.x+wx-ex/2,maxx:pos.x+wx+ex/2,minz:pos.z+wz-ez/2,maxz:pos.z+wz+ez/2,miny:pos.y+y-sy/2,maxy:pos.y+y+sy/2,piece:p});}
  for(const b of p.boxes)boxColliders.push(b);
  if(isFound(id))foundations.set(ck(cell[0],cell[1]),floorTop);else if(isWall(id))walls.add(edge);else if(isRoof(id))roofs.add(ck(cell[0],cell[1]));
  pieces.push(p);if(!silent){questShelter();sfx('place');NET.buildDirty=true;if(id==='forja')questAdvance('forja',1);if(id==='bau')questAdvance('bau',1);PROFILE.built=(PROFILE.built||0)+1;}return p;}
function removePiece(p){buildGroup.remove(p.g);for(const b of p.boxes){const i=boxColliders.indexOf(b);if(i>=0)boxColliders.splice(i,1);}
  if(isFound(p.id))foundations.delete(ck(p.cell[0],p.cell[1]));else if(isWall(p.id))walls.delete(p.edge);else if(isRoof(p.id))roofs.delete(ck(p.cell[0],p.cell[1]));
  pieces.splice(pieces.indexOf(p),1);}
function clearPieces(){while(pieces.length)removePiece(pieces[0]);}
function questShelter(){const s=Math.min(1,foundations.size)+Math.min(4,walls.size)+Math.min(1,roofs.size);const i=QUESTS.findIndex(q=>q[0]==='abrigo');if(G.era===1&&s>G.quest[i])questAdvance('abrigo',s-G.quest[i]);if(s>=6)unlockAch('abrigo');}
function forges(){return pieces.filter(p=>p.id==='forja');}
function campfires(){return pieces.filter(p=>p.id==='fogueira').concat(remotePieces().filter(p=>p.id==='fogueira'));}
function topAt(c){const k=ck(c[0],c[1]);return foundations.has(k)?foundations.get(k):RF.get(k);}

// luzes de fogueira (reaproveitadas para não travar)
const fireLights=[];for(let i=0;i<3;i++){const l=new THREE.PointLight(0xff9a50,0,15,1.6);scene.add(l);fireLights.push(l);}

// ======================================================================
//  Construção
// ======================================================================
const build={id:null,ghost:null,yaw:0,cur:null};
function setBuildPiece(id){if(id===build.id)return;build.id=id;if(build.ghost){scene.remove(build.ghost);build.ghost=null;}
  if(id){build.ghost=pieceVisual(id,true).g;build.ghost.visible=false;scene.add(build.ghost);}}
function setGhost(ok){build.ghost.traverse(o=>{if(o.isMesh)o.material=ok?ghostOk:ghostBad;});}
const cellOf=(x,z)=>[Math.floor(x/CELL),Math.floor(z/CELL)];
const cellCenter=(c,y)=>new THREE.Vector3(c[0]*CELL+CELL/2,y||0,c[1]*CELL+CELL/2);
function cornerHeights(c){const ctr=cellCenter(c);let mn=1e9,mx=-1e9;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const h=H(ctr.x+dx*1.45,ctr.z+dz*1.45);mn=Math.min(mn,h);mx=Math.max(mx,h);}return [mn,mx];}
const raycaster=new THREE.Raycaster();
function aimRay(){const cp=camera.getWorldPosition(new THREE.Vector3());let dd;if(!isTouch){raycaster.setFromCamera(new THREE.Vector2(MOUSE.x,MOUSE.y),camera);dd=raycaster.ray.direction.clone();}else dd=new THREE.Vector3(0,0,-1).applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));
  if(VIEW.tp){const head=new THREE.Vector3(P.x,P.y+1.6,P.z);const t=Math.max(0,head.clone().sub(cp).dot(dd));return {o:cp.clone().addScaledVector(dd,t),d:dd};}
  if(!isTouch)return {o:cp,d:dd};const o=cp;const d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));return {o,d};}
function terrainHit(o,d,max){let prev=0;for(let t=0.2;t<=max;t+=0.2){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(y<H(x,z)){let a=prev,b=t;for(let k=0;k<8;k++){const m=(a+b)/2;if(o.y+d.y*m<H(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}return b;}prev=t;}return Infinity;}
function pieceHit(o,d,max){raycaster.set(o,d);raycaster.far=max;const hits=raycaster.intersectObjects([...buildGroup.children,...remoteGroup.children],true);return hits.length?hits[0]:null;}
function computePlacement(){const id=build.id;const {o,d}=aimRay();const RANGE=7;
  const tt=terrainHit(o,d,RANGE);const ph=pieceHit(o,d,RANGE);
  let hit=null;if(ph&&ph.distance<tt)hit={t:ph.distance,point:ph.point,piece:ph.object.userData.piece,normal:ph.face?ph.face.normal.clone().transformDirection(ph.object.matrixWorld):new THREE.Vector3(0,1,0)};
  else if(tt<Infinity){const p=o.clone().addScaledVector(d,tt);hit={t:tt,point:p,piece:null,normal:normalAt(p.x,p.z)};}
  const fail=(pos,rot,why)=>({has:true,ok:false,pos,rot,why});
  if(isFound(id)){if(!hit)return {has:false};let cell=cellOf(hit.point.x,hit.point.z),top;
    if(hit.piece&&isFound(hit.piece.id)){const c=cellCenter(hit.piece.cell);const lx=hit.point.x-c.x,lz=hit.point.z-c.z;const dir=Math.abs(lx)>Math.abs(lz)?[lx>0?1:-1,0]:[0,lz>0?1:-1];cell=[hit.piece.cell[0]+dir[0],hit.piece.cell[1]+dir[1]];top=hit.piece.floorTop;}
    else{const pc=cellOf(P.x,P.z);if(pc[0]===cell[0]&&pc[1]===cell[1]){if(Math.abs(d.x)>Math.abs(d.z))cell=[cell[0]+(d.x>0?1:-1),cell[1]];else cell=[cell[0],cell[1]+(d.z>0?1:-1)];}const [mn,mx]=cornerHeights(cell);if(mx-mn>1.8)return fail(cellCenter(cell,mx),0,'Terreno inclinado demais');top=mx+0.15;}
    const [mn,mx]=cornerHeights(cell);const pos=cellCenter(cell,top);const r={has:true,ok:false,pos,rot:0,cell,floorTop:top};
    if(foundations.has(ck(cell[0],cell[1]))||RF.has(ck(cell[0],cell[1])))return Object.assign(r,{why:'Já existe uma fundação aqui'});
    if(mx>top+0.4)return Object.assign(r,{why:'O chão aqui é mais alto que o piso'});
    if(top-mn>FDEPTH+0.6)return Object.assign(r,{why:'Muito alto em relação ao chão'});
    if(mn<WATER-0.3)return Object.assign(r,{why:'Não dá para construir na água'});
    if(Math.abs(P.x-pos.x)<1.9&&Math.abs(P.z-pos.z)<1.9&&P.y<top+0.2)return Object.assign(r,{why:'Saia de cima do lugar da fundação'});
    r.ok=true;return r;}
  if(isWall(id)){if(!hit)return {has:false};const pt=hit.point.clone().addScaledVector(d,-0.05);const cell=cellOf(pt.x,pt.z);const top=topAt(cell);
    if(top===undefined)return fail(new THREE.Vector3(pt.x,hit.point.y,pt.z),0,'Paredes precisam de uma fundação');
    const c=cellCenter(cell);const lx=pt.x-(c.x-1.5),lz=pt.z-(c.z-1.5);const n=3-lz,s=lz,e=3-lx,w=lx;const best=Math.min(n,s,e,w);let key,pos,rot;
    if(best===n){key=`${cell[0]}:${cell[1]}:H`;pos=new THREE.Vector3(c.x,top,c.z+1.5);rot=0;}
    else if(best===s){key=`${cell[0]}:${cell[1]-1}:H`;pos=new THREE.Vector3(c.x,top,c.z-1.5);rot=0;}
    else if(best===e){key=`${cell[0]}:${cell[1]}:V`;pos=new THREE.Vector3(c.x+1.5,top,c.z);rot=Math.PI/2;}
    else{key=`${cell[0]-1}:${cell[1]}:V`;pos=new THREE.Vector3(c.x-1.5,top,c.z);rot=Math.PI/2;}
    const r={has:true,ok:!walls.has(key)&&!RW.has(key),pos,rot,cell,edge:key,floorTop:top};if(!r.ok)r.why='Já existe uma parede aqui';return r;}
  if(isRoof(id)){const pt=hit?hit.point.clone().addScaledVector(d,-0.05):o.clone().addScaledVector(d,4);const cell=cellOf(pt.x,pt.z);const top=topAt(cell);
    if(top===undefined){if(!hit)return {has:false};return fail(cellCenter(cell,pt.y),0,'O teto precisa de uma fundação embaixo');}
    const r={has:true,ok:!roofs.has(ck(cell[0],cell[1]))&&!RR.has(ck(cell[0],cell[1])),pos:cellCenter(cell,top+WALLH),rot:0,cell,floorTop:top};if(!r.ok)r.why='Já existe um teto aqui';return r;}
  if(!hit)return {has:false};
  const rot=P.yaw+build.yaw;const pos=hit.point.clone();
  if(hit.normal.y<0.7)return fail(pos,rot,'Superfície inclinada demais');
  if(pos.y<WATER-0.1)return fail(pos,rot,'Não dá para colocar na água');
  const rad=id==='saco'?1.0:0.7;
  for(const p of pieces){if(isFound(p.id)||isRoof(p.id))continue;for(const b of p.boxes){const cx=clamp(pos.x,b.minx,b.maxx),cz=clamp(pos.z,b.minz,b.maxz);if(Math.hypot(pos.x-cx,pos.z-cz)<rad*0.6&&pos.y<b.maxy)return fail(pos,rot,'Tem algo no caminho');}
    if(!p.boxes.length&&Math.hypot(pos.x-p.g.position.x,pos.z-p.g.position.z)<rad+0.4)return fail(pos,rot,'Tem algo no caminho');}
  for(const n of nodes){if(!n.alive||n.r===0)continue;if(Math.hypot(pos.x-n.x,pos.z-n.z)<n.r+rad*0.6)return fail(pos,rot,'Tem algo no caminho');}
  return {has:true,ok:true,pos,rot};}
function updateBuild(){if(!build.id||G.state!=='play'){if(build.ghost)build.ghost.visible=false;return;}
  if(wasPressed('KeyR'))build.yaw+=Math.PI/4;
  const c=computePlacement();build.cur=c;build.ghost.visible=!!c.has;
  if(c.has){build.ghost.position.copy(c.pos);build.ghost.rotation.y=c.rot;setGhost(c.ok);}
  if(c.has&&c.ok&&wasPressed('Mouse0')&&invCount(build.id)>0){const id=build.id;placePiece(id,c.pos,c.rot,c.cell,c.edge,c.floorTop);invRemove(id,1);if(id==='fogueira')questAdvance('fogueira',1);}}
