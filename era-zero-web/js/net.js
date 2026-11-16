'use strict';
// ======================================================================
//  Multiplayer (sala ao vivo do Claude): jogadores, construções e árvores
// ======================================================================
const remoteGroup=new THREE.Group();scene.add(remoteGroup);
const RF=new Map(),RW=new Set(),RR=new Set();
const NET={room:null,peers:new Map(),last:0,sent:{},swing:0,myDepl:[],deplDirty:true,buildDirty:true,synced:false,warnedCap:false,lastTime:0};
const CODE={fundacao:'F',parede:'W',porta:'D',teto:'T',fogueira:'C',saco:'S'};const DECODE={};for(const k in CODE)DECODE[CODE[k]]=k;
function remotePieces(){const out=[];for(const pe of NET.peers.values())for(const p of pe.pieces)out.push(p);return out;}
function remoteDepleted(i){for(const pe of NET.peers.values())if(pe.depl.indexOf(i)>=0)return true;return false;}
function rebuildRemoteKeys(){RF.clear();RW.clear();RR.clear();for(const p of remotePieces()){if(isFound(p.id))RF.set(ck(p.cell[0],p.cell[1]),p.floorTop);else if(isWall(p.id))RW.add(p.edge);else if(isRoof(p.id))RR.add(ck(p.cell[0],p.cell[1]));}grassCX=1e9;}
function clearRemotePieces(pe){for(const p of pe.pieces){remoteGroup.remove(p.g);for(const b of p.boxes){const i=boxColliders.indexOf(b);if(i>=0)boxColliders.splice(i,1);}}pe.pieces=[];}
function buildRemotePieces(pe,str){clearRemotePieces(pe);
  for(const e of str.split(';').slice(0,250)){const f=e.split(',');const id=DECODE[f[0]];if(!id)continue;const x=+f[1],y=+f[2],z=+f[3],r=+f[4];
    if(![x,y,z,r].every(Number.isFinite)||Math.abs(x)>HALF||Math.abs(z)>HALF||y<-10||y>200)continue;
    let cell=null,edge=null,floorTop=y;
    if(isFound(id))cell=cellOf(x,z);else if(isRoof(id)){cell=cellOf(x,z);floorTop=y-WALLH;}
    else if(isWall(id)){if(Math.abs(Math.sin(r))<0.5){cell=[Math.floor(x/CELL),Math.round(z/CELL)-1];edge=`${cell[0]}:${cell[1]}:H`;}else{cell=[Math.round(x/CELL)-1,Math.floor(z/CELL)];edge=`${cell[0]}:${cell[1]}:V`;}}
    const {g,parts}=pieceVisual(id,false);g.position.set(x,y,z);g.rotation.y=r;remoteGroup.add(g);
    const p={id,g,cell,edge,floorTop,boxes:[],raw:0,cooked:0,timer:0,remote:true,owner:pe.name};g.traverse(o=>o.userData.piece=p);
    const swap=Math.abs(Math.sin(r))>0.5;for(const [bx,by,bz,sx,sy,sz] of parts){const wx=swap?bz:bx,wz=swap?bx:bz,ex=swap?sz:sx,ez=swap?sx:sz;const b={minx:x+wx-ex/2,maxx:x+wx+ex/2,minz:z+wz-ez/2,maxz:z+wz+ez/2,miny:y+by-sy/2,maxy:y+by+sy/2,piece:p};p.boxes.push(b);boxColliders.push(b);}
    pe.pieces.push(p);}
  rebuildRemoteKeys();}
function upsertPeer(rp){const pr=rp.presence||{};let pe=NET.peers.get(rp.peer);
  if(pr.v!==1){if(pe)removePeer(rp.peer);return;}
  const name=cleanName(pr.n);
  if(!pe){pe={id:rp.peer,name,av:makeAvatar(pr.c,name),pieces:[],bstr:null,depl:[],tx:0,ty:0,tz:0,tr:0,sw:pr.s,first:true,lx:0,lz:0};NET.peers.set(rp.peer,pe);toast(`${name} entrou no Vale`,'var(--green)');sfx('join');}
  if(name!==pe.name){pe.name=name;setAvatarName(pe.av,name);for(const p of pe.pieces)p.owner=name;}
  if(Array.isArray(pr.p)&&pr.p.length===3&&pr.p.every(Number.isFinite)){pe.tx=clamp(pr.p[0],-HALF,HALF);pe.ty=clamp(pr.p[1],-20,200);pe.tz=clamp(pr.p[2],-HALF,HALF);if(pe.first){pe.av.g.position.set(pe.tx,pe.ty,pe.tz);pe.lx=pe.tx;pe.lz=pe.tz;pe.first=false;}}
  if(Number.isFinite(pr.r))pe.tr=pr.r;
  setAvatarHeld(pe.av,typeof pr.h==='string'&&ITEMS[pr.h]?ITEMS[pr.h]:null);
  if(Number.isFinite(pr.s)&&pr.s!==pe.sw){pe.sw=pr.s;pe.av.swingT=0;}
  if(typeof pr.b==='string'&&pr.b!==pe.bstr){pe.bstr=pr.b;buildRemotePieces(pe,pr.b);}
  if(Array.isArray(pr.x)){pe.depl=pr.x.filter(Number.isInteger).slice(0,80);for(const i of pe.depl){const n=nodes[i];if(n&&n.alive)depleteNode(n,true);}}
  if(!NET.synced&&G.state==='play'&&Number.isFinite(pr.t)&&pr.t>=0&&pr.t<24){G.hour=pr.t;G.day=Math.max(G.day,(pr.d|0)||1);NET.synced=true;}}
function removePeer(id){const pe=NET.peers.get(id);if(!pe)return;scene.remove(pe.av.g);clearRemotePieces(pe);NET.peers.delete(id);rebuildRemoteKeys();toast(`${pe.name} saiu do Vale`,'var(--muted)');}
function updateRemote(dt){for(const pe of NET.peers.values()){const g=pe.av.g;const k=Math.min(1,dt*10);
    g.position.x=lerp(g.position.x,pe.tx,k);g.position.z=lerp(g.position.z,pe.tz,k);g.position.y=lerp(g.position.y,pe.ty,k);
    let dr=pe.tr-g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));g.rotation.y+=dr*k;
    const sp=dt>0?Math.hypot(g.position.x-pe.lx,g.position.z-pe.lz)/dt:0;pe.lx=g.position.x;pe.lz=g.position.z;pe.spd=lerp(pe.spd||0,sp,Math.min(1,dt*8));
    animateAvatar(pe.av,pe.spd,dt);}}
const r2f=v=>Math.round(v*100)/100;
function netSend(){const room=NET.room;if(!room)return;const now=performance.now();
  if(G.state==='menu'||G.state==='loading'){if(NET.sent.v===1){room.presence({v:0}).catch(()=>{});NET.sent={};NET.buildDirty=true;NET.deplDirty=true;}return;}
  if(now-NET.last<100)return;NET.last=now;
  const patch={};const put=(k,v)=>{const ov=NET.sent[k];if(JSON.stringify(ov)!==JSON.stringify(v)){patch[k]=v;NET.sent[k]=v;}};
  put('v',1);put('n',myName());put('c',myColor());put('p',[r2f(P.x),r2f(P.y),r2f(P.z)]);put('r',r2f(P.yaw));
  const d=selDef();put('h',d?d.id:'');put('s',NET.swing);
  if(NET.buildDirty){NET.buildDirty=false;put('b',encodeBuild());}
  const ts=now/1000;if(NET.deplDirty||ts-NET.lastDepl>10){NET.deplDirty=false;NET.lastDepl=ts;NET.myDepl=NET.myDepl.filter(e=>ts-e[1]<300).slice(-60);put('x',NET.myDepl.map(e=>e[0]));}
  if(ts-NET.lastTime>5){NET.lastTime=ts;put('t',r2f(G.hour));put('d',G.day);}
  if(Object.keys(patch).length)room.presence(patch).catch(()=>{});}
function encodeBuild(){const out=[];let len=0;for(let i=pieces.length-1;i>=0;i--){const p=pieces[i];const e=`${CODE[p.id]},${r2f(p.g.position.x)},${r2f(p.g.position.y)},${r2f(p.g.position.z)},${r2f(p.g.rotation.y)}`;
    if(len+e.length+1>2900){if(!NET.warnedCap){NET.warnedCap=true;toast('Seus amigos veem só as suas construções mais recentes (limite do multiplayer)','var(--amber)');}break;}out.push(e);len+=e.length+1;}return out.reverse().join(';');}
async function netInit(){try{if(!window.claude||!window.claude.use)return;const room=await window.claude.use('room');if(!room)return;NET.room=room;
  room.onPeers(ch=>{for(const p of ch.left)removePeer(p.peer);for(const p of ch.joined.concat(ch.updated)){if(p.sameTab||p.kind!=='viewer')continue;upsertPeer(p);}},
    ()=>{NET.room=null;for(const id of [...NET.peers.keys()])removePeer(id);});}catch(e){NET.room=null;}}
function renderOnline(){const el=$('online');if(!NET.room){el.style.display='none';return;}el.style.display='flex';const n=NET.peers.size;
  $('onlineTxt').textContent=n?`${n+1} jogadores no Vale`:'Online · só você';}
