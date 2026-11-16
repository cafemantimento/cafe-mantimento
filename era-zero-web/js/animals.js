'use strict';
// ======================================================================
//  Vida selvagem: espécies, modelos, animações, comportamento e habitat
// ======================================================================
const creatures=[];
const GLTF_ANIMALS={};// nome -> {scene, clips, height}
// habitat: land | water | air | insect ; act: dia | noite | sempre ; aggro: 0 nunca, 1 se provocado, 2 se chegar perto, 3 caça o jogador
const SPECIES={
  veado:{name:'Veado',gltf:'Deer',h:1.55,hp:55,walk:1.6,run:8,diet:'herb',aggro:0,act:'dia',habitat:'land',biomes:{temperada:5,savana:2,neve:1},group:[1,3],drops:{carne_crua:4,couro:3},voice:'bleat'},
  cervo:{name:'Cervo',gltf:'Stag',h:1.9,hp:80,walk:1.5,run:7.5,diet:'herb',aggro:1,dmg:12,act:'dia',habitat:'land',biomes:{temperada:3,neve:2},group:[1,1],drops:{carne_crua:5,couro:4},voice:'bleat'},
  raposa:{name:'Raposa',gltf:'Fox',h:0.65,hp:30,walk:2,run:8.5,diet:'carn',prey:['coelho','esquilo','sapo'],aggro:1,dmg:5,act:'sempre',habitat:'land',biomes:{temperada:3,deserto:2,neve:1},group:[1,1],drops:{carne_crua:1,couro:2},voice:'yip'},
  lobo:{name:'Lobo',gltf:'Wolf',h:0.95,hp:55,walk:2.2,run:8,diet:'carn',prey:['veado','coelho','javali','lhama'],aggro:3,dmg:9,act:'noite',habitat:'land',biomes:{temperada:2,neve:4},group:[2,3],drops:{carne_crua:2,couro:3},voice:'growl'},
  lhama:{name:'Lhama das Montanhas',gltf:'Alpaca',h:1.7,hp:60,walk:1.3,run:6,diet:'herb',aggro:1,dmg:6,act:'dia',habitat:'land',biomes:{neve:3,savana:1},group:[2,4],drops:{carne_crua:3,couro:4},voice:'hum'},
  cavalo:{name:'Cavalo Selvagem',gltf:'Horse',h:1.75,hp:90,walk:1.8,run:10,diet:'herb',aggro:0,act:'dia',habitat:'land',biomes:{savana:4,temperada:1},group:[2,4],drops:{carne_crua:5,couro:4},voice:'neigh'},
  bufalo:{name:'Búfalo',gltf:'Bull',h:1.7,hp:140,walk:1.3,run:7,diet:'herb',aggro:1,dmg:18,act:'dia',habitat:'land',biomes:{savana:4},group:[2,4],drops:{carne_crua:7,couro:5},voice:'moo'},
  urso:{name:'Urso',proc:'quad',hp:160,walk:1.3,run:7,diet:'omni',prey:['veado','javali','peixe'],aggro:2,dmg:20,act:'dia',habitat:'land',biomes:{temperada:1,neve:1},group:[1,1],drops:{carne_crua:7,couro:6},voice:'roar',
    p:{len:1.9,h:1.15,legH:0.55,legW:0.3,head:0.55,snout:0.25,ears:'round',tail:0.1,body:0x4a3020,dark:0x2a1a10,belly:0x5a4030}},
  javali:{name:'Javali',proc:'quad',hp:60,walk:1.6,run:6.5,diet:'omni',aggro:1,dmg:7,act:'sempre',habitat:'land',biomes:{temperada:3,tropical:1},group:[1,3],drops:{carne_crua:4,couro:2},voice:'grunt',
    p:{len:1.3,h:0.75,legH:0.4,legW:0.16,head:0.45,snout:0.3,ears:'small',tail:0.15,tusks:1,body:0x5a4030,dark:0x33241a,belly:0x6a5040}},
  coelho:{name:'Coelho',proc:'quad',hp:10,walk:1.6,run:9,diet:'herb',aggro:0,act:'sempre',habitat:'land',hop:1,biomes:{temperada:4,savana:2,neve:1},group:[1,3],drops:{carne_crua:1,couro:1},voice:'squeak',
    p:{len:0.45,h:0.3,legH:0.12,legW:0.08,head:0.2,snout:0.05,ears:'long',tail:0.08,body:0x9a8a78,dark:0x6a5a48,belly:0xd8d0c0}},
  esquilo:{name:'Esquilo',proc:'quad',hp:8,walk:2,run:7,diet:'herb',aggro:0,act:'dia',habitat:'land',hop:1,biomes:{temperada:4},group:[1,2],drops:{carne_crua:1},voice:'squeak',
    p:{len:0.32,h:0.2,legH:0.09,legW:0.06,head:0.15,snout:0.04,ears:'small',tail:0.4,bushy:1,body:0xb05a2a,dark:0x7a3a1a,belly:0xe0c0a0}},
  onca:{name:'Onça-pintada',proc:'quad',hp:90,walk:1.8,run:9.5,diet:'carn',prey:['capivara','macaco','javali','veado'],aggro:3,dmg:16,act:'noite',habitat:'land',biomes:{tropical:3,pantano:1},group:[1,1],drops:{carne_crua:4,couro:4},voice:'roar',
    p:{len:1.6,h:0.75,legH:0.45,legW:0.14,head:0.38,snout:0.12,ears:'round',tail:0.8,spots:1,body:0xd8a040,dark:0x2a1a10,belly:0xf0e0c0}},
  capivara:{name:'Capivara',proc:'quad',hp:45,walk:1.1,run:5,diet:'herb',aggro:0,act:'sempre',habitat:'land',water:1,biomes:{pantano:5,tropical:1,temperada:0.5},group:[2,5],drops:{carne_crua:3,couro:2},voice:'squeak',
    p:{len:1.1,h:0.6,legH:0.25,legW:0.14,head:0.38,snout:0.2,ears:'small',tail:0,body:0x7a5a3a,dark:0x5a4028,belly:0x8a6a48}},
  jacare:{name:'Jacaré',proc:'quad',hp:120,walk:0.8,run:5,diet:'carn',prey:['capivara','sapo','peixe'],aggro:2,dmg:18,act:'noite',habitat:'land',water:1,biomes:{pantano:3},group:[1,1],drops:{carne_crua:5,couro:6},voice:'hiss',
    p:{len:3.0,h:0.38,legH:0.16,legW:0.14,head:0.35,snout:0.8,ears:'none',tail:1.6,croc:1,body:0x3a4a2a,dark:0x2a3420,belly:0x8a8a60}},
  macaco:{name:'Macaco',proc:'quad',hp:25,walk:2,run:7,diet:'herb',aggro:1,dmg:4,act:'dia',habitat:'land',biomes:{tropical:5},group:[2,4],drops:{carne_crua:1,couro:1},voice:'screech',
    p:{len:0.6,h:0.55,legH:0.3,legW:0.08,head:0.28,snout:0.08,ears:'round',tail:0.7,monkey:1,body:0x6a4a2a,dark:0x3a2a1a,belly:0xc0a080}},
  tartaruga:{name:'Tartaruga',proc:'turtle',hp:40,walk:0.4,run:0.8,diet:'herb',aggro:0,act:'sempre',habitat:'land',water:1,biomes:{pantano:2,ilhas:3},group:[1,2],drops:{carne_crua:2},voice:'none'},
  sapo:{name:'Sapo',proc:'frog',hp:5,walk:1,run:3,diet:'herb',aggro:0,act:'noite',habitat:'land',water:1,hop:1,biomes:{pantano:5,tropical:1},group:[2,4],drops:{},voice:'croak'},
  cobra:{name:'Cobra',proc:'snake',hp:20,walk:0.8,run:2.5,diet:'carn',prey:['sapo','coelho'],aggro:2,dmg:10,aggroDist:3.5,act:'sempre',habitat:'land',biomes:{tropical:2,deserto:3,pantano:1},group:[1,1],drops:{carne_crua:1,couro:1},voice:'hiss'},
  pinguim:{name:'Pinguim',proc:'penguin',hp:20,walk:0.7,run:1.8,diet:'carn',aggro:0,act:'dia',habitat:'land',water:1,biomes:{neve:3},group:[3,6],drops:{carne_crua:1},voice:'honk'},
  coruja:{name:'Coruja',proc:'bird',hp:12,walk:4,run:9,diet:'carn',aggro:0,act:'noite',habitat:'air',biomes:{temperada:3,neve:1},group:[1,1],drops:{},voice:'hoot',
    p:{size:0.35,wing:0.5,body:0x7a5a3a,dark:0x4a3020,belly:0xd8c0a0,beak:0x3a3020,owl:1}},
  tucano:{name:'Tucano',proc:'bird',hp:8,walk:5,run:10,diet:'herb',aggro:0,act:'dia',habitat:'air',biomes:{tropical:4},group:[1,2],drops:{},voice:'croakbird',
    p:{size:0.28,wing:0.45,body:0x151515,dark:0x101010,belly:0xf8f0d0,beak:0xff8a20,bigBeak:1}},
  papagaio:{name:'Papagaio',proc:'bird',hp:8,walk:5,run:11,diet:'herb',aggro:0,act:'dia',habitat:'air',biomes:{tropical:4,ilhas:2},group:[2,3],drops:{},voice:'squawk',
    p:{size:0.26,wing:0.45,body:0xd02020,dark:0x2050d0,belly:0xf0d020,beak:0x303030}},
  aguia:{name:'Águia',proc:'bird',hp:25,walk:7,run:13,diet:'carn',aggro:0,act:'dia',habitat:'air',high:1,biomes:{neve:2,savana:3,deserto:2},group:[1,1],drops:{},voice:'screech',
    p:{size:0.55,wing:1.1,body:0x5a3a20,dark:0x3a2410,belly:0xf0f0e8,beak:0xf0c020,eagle:1}},
  borboleta:{name:'Borboleta',proc:'butterfly',hp:1,walk:1.5,run:3,diet:'herb',aggro:0,act:'dia',habitat:'insect',biomes:{tropical:5,temperada:3,savana:1},group:[3,6],drops:{},voice:'none'},
  peixe:{name:'Peixe',proc:'fish',hp:6,walk:1.2,run:4,diet:'herb',aggro:0,act:'sempre',habitat:'water',depth:1.2,biomes:{pantano:3,temperada:3,tropical:2,ilhas:3,savana:1,neve:1,deserto:0.5},group:[3,5],drops:{peixe_cru:1},voice:'none',
    p:{len:0.45,body:0xc0c8d0,dark:0x506070,fin:0xe08040}},
  golfinho:{name:'Golfinho',proc:'fish',hp:60,walk:3,run:9,diet:'carn',aggro:0,act:'dia',habitat:'water',depth:5,jump:1,biomes:{ilhas:3},group:[2,4],drops:{},voice:'click',
    p:{len:2.4,body:0x7088a0,dark:0x405870,fin:0x506880,dolphin:1}},
  tubarao:{name:'Tubarão',proc:'fish',hp:120,walk:2.5,run:7,diet:'carn',aggro:0,act:'sempre',habitat:'water',depth:6,biomes:{ilhas:2},group:[1,1],drops:{},voice:'none',
    p:{len:3.2,body:0x707a84,dark:0x50585f,fin:0x60686f,shark:1}},
  baleia:{name:'Baleia',proc:'fish',hp:600,walk:1.5,run:3,diet:'herb',aggro:0,act:'sempre',habitat:'water',depth:9,whale:1,biomes:{ilhas:1},group:[1,1],drops:{},voice:'whale',
    p:{len:11,body:0x2a3a5a,dark:0x1a2438,fin:0x2a3a5a,whale:1}},
};
// ---------------- construtores de modelos (estilo low-poly do jogo)
function quadModel(p){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const mb=mat(p.body),md=mat(p.dark),mbel=mat(p.belly);const L=p.len,Hh=p.h;
  const legs=[];const by=p.legH+Hh*0.45;
  sph(body,0,by,0,Hh*0.95*(p.croc?1.6:1),Hh*0.9,L*0.95,mb);sph(body,0,by-Hh*0.18,0,Hh*0.8*(p.croc?1.5:1),Hh*0.55,L*0.8,mbel);
  const head=new THREE.Group();head.position.set(0,by+Hh*(p.croc?0:0.25),L*0.5);body.add(head);
  sph(head,0,0,p.head*0.3,p.head*(p.croc?1.1:1),p.head*0.85*(p.croc?0.6:1),p.head,mb);
  if(p.snout)box(head,0,-p.head*0.15,p.head*0.55+p.snout*0.5,p.head*(p.croc?0.8:0.55),p.head*(p.croc?0.3:0.45),p.snout,p.croc?md:mbel);
  if(p.ears==='long'){box(head,0.07,p.head*0.7,p.head*0.1,0.05,0.28,0.06,mb,-0.2);box(head,-0.07,p.head*0.7,p.head*0.1,0.05,0.28,0.06,mb,-0.2);}
  else if(p.ears==='round'){sph(head,p.head*0.38,p.head*0.45,0,p.head*0.3,p.head*0.3,p.head*0.15,md);sph(head,-p.head*0.38,p.head*0.45,0,p.head*0.3,p.head*0.3,p.head*0.15,md);}
  else if(p.ears==='small'){box(head,p.head*0.3,p.head*0.45,0,p.head*0.2,p.head*0.25,p.head*0.08,md);box(head,-p.head*0.3,p.head*0.45,0,p.head*0.2,p.head*0.25,p.head*0.08,md);}
  if(p.tusks){box(head,0.12,-0.1,p.head*0.8,0.04,0.14,0.04,MAT.tusk,-0.5);box(head,-0.12,-0.1,p.head*0.8,0.04,0.14,0.04,MAT.tusk,-0.5);}
  const eyeM=MAT.eye;const e1=new THREE.Mesh(SPHG,p.croc?eyeM:mat(0x111111));e1.scale.setScalar(Math.max(0.035,p.head*0.13));e1.position.set(p.head*0.32,p.head*0.15,p.head*0.75);head.add(e1);const e2=e1.clone();e2.position.x*=-1;head.add(e2);
  if(p.spots)for(let k=0;k<10;k++)sph(body,(Math.random()-0.5)*Hh*1.6,by+Hh*0.2*Math.random(),(Math.random()-0.5)*L*1.4,0.08,0.06,0.08,md);
  const lx=Hh*0.45*(p.croc?1.6:1),lz=L*0.36;
  for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const pv=new THREE.Group();pv.position.set(sx*lx,p.legH+0.02,sz*lz);body.add(pv);
    const ll=p.legH*(p.monkey&&sz>0?1.3:1);box(pv,0,-ll/2,0,p.legW,ll,p.legW,md);if(p.croc)pv.rotation.z=sx*0.6;legs.push(pv);}
  let tail=null;if(p.tail>0.05){tail=new THREE.Group();tail.position.set(0,by+(p.croc?-0.05:Hh*0.1),-L*0.5);body.add(tail);
    const tw=p.bushy?0.16:p.croc?0.3:0.06;box(tail,0,p.bushy?p.tail*0.4:0,-p.tail/2,tw,p.bushy?tw*1.6:tw*(p.croc?0.7:1),p.tail,p.bushy?mb:md,p.bushy?-0.9:p.croc?0:0.4);}
  return {g,body,legs,head,tail,kind:'quad'};}
function turtleModel(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);sph(body,0,0.22,0,0.7,0.36,0.85,mat(0x5a6a2a));sph(body,0,0.12,0,0.62,0.12,0.75,mat(0xa0a060));
  const head=new THREE.Group();head.position.set(0,0.18,0.42);body.add(head);sph(head,0,0,0.05,0.14,0.12,0.18,mat(0x7a8a50));const legs=[];
  for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const pv=new THREE.Group();pv.position.set(sx*0.25,0.1,sz*0.25);body.add(pv);box(pv,0,-0.04,0,0.12,0.1,0.16,mat(0x7a8a50));legs.push(pv);}
  return {g,body,legs,head,kind:'quad'};}
function frogModel(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const m=mat(0x4a9a3a),mb=mat(0xd0e0a0);sph(body,0,0.08,0,0.16,0.1,0.18,m);sph(body,0,0.05,0.02,0.13,0.06,0.14,mb);
  const e=mat(0x111111);sph(body,0.05,0.14,0.07,0.04,0.04,0.04,e);sph(body,-0.05,0.14,0.07,0.04,0.04,0.04,e);const legs=[];
  for(const sx of [1,-1]){const pv=new THREE.Group();pv.position.set(sx*0.08,0.05,-0.05);body.add(pv);box(pv,0,-0.02,0,0.06,0.04,0.12,m);legs.push(pv);}return {g,body,legs,kind:'frog'};}
function snakeModel(){const g=new THREE.Group(),segs=[];const a=mat(0x5a7a2a),b=mat(0xc0b040);
  for(let i=0;i<12;i++){const s=new THREE.Group();g.add(s);const r=0.07*(1-i/16);sph(s,0,r,0,r*2,r*1.6,r*2.4,i%3?a:b);segs.push(s);}
  const e=mat(0x111111);sph(segs[0],0.03,0.09,0.06,0.02,0.02,0.02,e);sph(segs[0],-0.03,0.09,0.06,0.02,0.02,0.02,e);return {g,body:g,segs,kind:'snake',trail:[]};}
function penguinModel(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const k=mat(0x161a20),w=mat(0xf0f0f0),o=mat(0xf0a020);
  sph(body,0,0.38,0,0.34,0.62,0.3,k);sph(body,0,0.35,0.06,0.26,0.5,0.22,w);const head=new THREE.Group();head.position.set(0,0.72,0);body.add(head);sph(head,0,0,0,0.22,0.2,0.2,k);
  box(head,0,-0.02,0.13,0.06,0.04,0.1,o);const wings=[];for(const sx of [1,-1]){const pv=new THREE.Group();pv.position.set(sx*0.17,0.55,0);body.add(pv);box(pv,sx*0.02,-0.18,0,0.04,0.36,0.14,k);wings.push(pv);}
  const legs=[];for(const sx of [1,-1]){const pv=new THREE.Group();pv.position.set(sx*0.08,0.08,0.04);body.add(pv);box(pv,0,-0.04,0.04,0.08,0.04,0.14,o);legs.push(pv);}
  return {g,body,head,wings,legs,kind:'penguin'};}
function birdModel(p){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const s=p.size;const mb=mat(p.body),md=mat(p.dark),mbel=mat(p.belly);
  sph(body,0,0,0,s*0.9,s*0.85,s*1.5,mb);sph(body,0,-s*0.15,s*0.1,s*0.7,s*0.55,s*1.1,mbel);const head=new THREE.Group();head.position.set(0,s*(p.owl?0.55:0.35),s*0.7);body.add(head);
  sph(head,0,0,0,s*(p.owl?0.9:0.6),s*(p.owl?0.8:0.55),s*(p.owl?0.8:0.6),p.eagle?mbel:mb);
  box(head,0,-s*0.08,s*(p.bigBeak?0.65:0.35),s*0.18,s*(p.bigBeak?0.28:0.14),s*(p.bigBeak?0.8:0.3),mat(p.beak));
  const em=p.owl?MAT.eye:mat(0x111111);sph(head,s*0.22,s*0.1,s*0.25,s*(p.owl?0.22:0.1),s*(p.owl?0.22:0.1),s*0.08,em);sph(head,-s*0.22,s*0.1,s*0.25,s*(p.owl?0.22:0.1),s*(p.owl?0.22:0.1),s*0.08,em);
  const wings=[];for(const sx of [1,-1]){const pv=new THREE.Group();pv.position.set(sx*s*0.4,s*0.15,0);body.add(pv);box(pv,sx*p.wing*0.5,0,0,p.wing,s*0.06,s*1.1,md);wings.push(pv);}
  box(body,0,0,-s*1.0,s*0.5,s*0.06,s*0.6,md);return {g,body,head,wings,kind:'bird'};}
function butterflyModel(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const cols=[0xffa020,0x40a0ff,0xff60c0,0xffe040,0xf0f0f0];const c=new THREE.MeshLambertMaterial({color:lin(cols[Math.floor(Math.random()*cols.length)]),side:THREE.DoubleSide});
  box(body,0,0,0,0.012,0.012,0.08,mat(0x222222));const wings=[];for(const sx of [1,-1]){const pv=new THREE.Group();body.add(pv);const w=new THREE.Mesh(new THREE.PlaneGeometry(0.09,0.08),c);w.rotation.x=-Math.PI/2;w.position.x=sx*0.048;pv.add(w);wings.push(pv);}
  return {g,body,wings,kind:'butterfly'};}
function fishModel(p){const g=new THREE.Group(),body=new THREE.Group();g.add(body);const L=p.len;const mb=mat(p.body),md=mat(p.dark),mf=mat(p.fin);
  sph(body,0,0,0,L*(p.whale?0.3:0.22),L*(p.whale?0.25:0.2),L,mb);sph(body,0,-L*0.06,L*0.05,L*(p.whale?0.26:0.18),L*0.1,L*0.8,p.whale?mat(0x8a98a8):mat(0xe0e4e8));
  if(p.dolphin)box(body,0,-L*0.02,L*0.55,L*0.08,L*0.06,L*0.2,mb);
  if(p.shark||p.dolphin)box(body,0,L*0.17,-L*0.05,L*0.03,L*0.2,L*0.2,mf,-0.5);
  const tail=new THREE.Group();tail.position.set(0,0,-L*0.5);body.add(tail);box(tail,0,0,-L*0.12,p.whale||p.dolphin?L*0.5:L*0.04,p.whale||p.dolphin?L*0.03:L*0.3,L*0.2,mf);
  const e=mat(0x111111);sph(body,L*0.13,L*0.04,L*0.35,L*0.03,L*0.03,L*0.03,e);sph(body,-L*0.13,L*0.04,L*0.35,L*0.03,L*0.03,L*0.03,e);
  return {g,body,tail,kind:'fish'};}
function makeModel(sp){
  if(sp.gltf&&GLTF_ANIMALS[sp.gltf]){const A=GLTF_ANIMALS[sp.gltf];const sc=THREE.SkeletonUtils.clone(A.scene);const s=sp.h/A.height;sc.scale.setScalar(s);
    sc.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;}});const g=new THREE.Group();g.add(sc);
    const mixer=new THREE.AnimationMixer(sc);const acts={};for(const c of A.clips)acts[c.name]=mixer.clipAction(c);
    const find=(...names)=>{for(const n of names){const k=Object.keys(acts).find(a=>a.toLowerCase()===n.toLowerCase());if(k)return acts[k];}for(const n of names){const k=Object.keys(acts).find(a=>a.toLowerCase().includes(n.toLowerCase()));if(k)return acts[k];}return null;};
    const map={idle:find('Idle'),walk:find('Walk'),run:find('Gallop','Run'),eat:find('Eating'),attack:find('Attack'),death:find('Death'),sleep:find('Idle_Headlow','Idle_2_HeadLow','HeadLow'),hit:find('HitReact')};
    if(map.death){map.death.setLoop(THREE.LoopOnce);map.death.clampWhenFinished=true;}if(map.attack)map.attack.setLoop(THREE.LoopOnce);if(map.hit)map.hit.setLoop(THREE.LoopOnce);
    return {g,body:sc,kind:'gltf',mixer,acts:map,cur:null};}
  if(sp.gltf){// sem o modelo: usa um quadrúpede no mesmo estilo
    const base={len:sp.h*0.9,h:sp.h*0.45,legH:sp.h*0.45,legW:sp.h*0.08,head:sp.h*0.22,snout:sp.h*0.1,ears:'small',tail:sp.h*0.2,body:0x8a6a48,dark:0x5a4030,belly:0xb09070};
    return quadModel(base);}
  switch(sp.proc){case 'quad':return quadModel(sp.p);case 'turtle':return turtleModel();case 'frog':return frogModel();case 'snake':return snakeModel();case 'penguin':return penguinModel();
    case 'bird':return birdModel(sp.p);case 'butterfly':return butterflyModel();case 'fish':return fishModel(sp.p);}
  return quadModel(SPECIES.javali.p);}
function playAct(m,name,fade){const a=m.acts&&m.acts[name];if(!a||m.cur===a)return;if(m.cur)m.cur.fadeOut(fade||0.25);a.reset().fadeIn(fade||0.25).play();m.cur=a;}

// ---------------- água e terreno para os animais
const WATER_SPOTS=[];for(let x=-HALF+20;x<HALF-20;x+=8)for(let z=-HALF+20;z<HALF-20;z+=8){const h=H(x,z);if(h<WATER-0.3&&h>WATER-3)WATER_SPOTS.push([x,z]);}
function nearestWater(x,z,maxD){let best=null,bd=maxD*maxD;for(const w of WATER_SPOTS){const d=(w[0]-x)**2+(w[1]-z)**2;if(d<bd){bd=d;best=w;}}return best;}
function walkable(x,z){return Math.abs(x)<HALF-30&&Math.abs(z)<HALF-30&&H(x,z)>WATER+0.25&&slope(x,z)<36;}
function swimmable(x,z,depth){return Math.abs(x)<HALF*1.4&&Math.abs(z)<HALF*1.4&&H(x,z)<WATER-depth;}
function blockedC(x,z,r){let hit=false;nodesNear(x,z,r+3,n=>{if(hit||!n.alive||n.r===0||n.cave)return;const dx=x-n.x,dz=z-n.z,rr=n.r+r;if(dx*dx+dz*dz<rr*rr)hit=true;});if(hit)return true;
  for(const b of boxColliders){if(x>b.minx-r&&x<b.maxx+r&&z>b.minz-r&&z<b.maxz+r&&b.maxy>H(x,z)+0.4)return true;}return false;}

// ---------------- criação, nascimento e remoção
function makeCreature(id,x,z,y){const sp=SPECIES[id];const m=makeModel(sp);const g=m.g;
  const yy=y!=null?y:sp.habitat==='water'?WATER-sp.depth*0.6:H(x,z);g.position.set(x,yy,z);g.rotation.y=Math.random()*6.28;scene.add(g);
  const c={id,sp,name:sp.name,kind:id,m,g,body:m.body,hp:sp.hp,max:sp.hp,state:'idle',timer:Math.random()*3,think:Math.random(),target:null,phase:Math.random()*6,
    hunger:20+Math.random()*50,thirst:Math.random()*50,energy:60+Math.random()*40,home:[x,z],hurt:0,harvest:0,deadAt:0,atk:0,provoked:false,alt:yy,voiceT:3+Math.random()*10};
  if(sp.habitat==='air'){c.alt=H(x,z)+(sp.p&&sp.p.eagle?35:12)+Math.random()*8;g.position.y=c.alt;c.state='fly';}
  if(sp.habitat==='insect'){c.alt=H(x,z)+0.8;g.position.y=c.alt;c.state='fly';}
  creatures.push(c);return c;}
function removeCreature(c){scene.remove(c.g);const i=creatures.indexOf(c);if(i>=0)creatures.splice(i,1);}
function pickSpecies(biome,water,night){let tot=0;const opts=[];
  for(const id in SPECIES){const sp=SPECIES[id];const w=sp.biomes[biome];if(!w)continue;if((sp.habitat==='water')!==water)continue;
    let k=w;if(sp.act==='noite'&&!night)k*=0.25;if(sp.act==='dia'&&night)k*=sp.habitat==='insect'?0:0.3;if(G.mode==='desafio'&&sp.aggro>=2)k*=1.6;if(k<=0)continue;opts.push([id,k]);tot+=k;}
  let r=Math.random()*tot;for(const [id,k] of opts){if(r<k)return id;r-=k;}return null;}
let spawnTick=0,howlT=20;
function spawnAround(){const q=QUALITY();const alive=creatures.length;if(alive>=q.animals)return;
  for(let t=0;t<6;t++){const a=Math.random()*6.283,d=55+Math.random()*95;const x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(Math.abs(x)>HALF*1.2||Math.abs(z)>HALF*1.2)continue;
    const h=H(x,z),water=h<WATER-1;const biome=Math.abs(x)>HALF-20||Math.abs(z)>HALF-20?'ilhas':biomeAt(x,z);const id=pickSpecies(biome,water,isNight());if(!id)continue;const sp=SPECIES[id];
    if(sp.habitat==='water'&&!swimmable(x,z,sp.depth))continue;if(sp.habitat==='land'&&!walkable(x,z))continue;
    if(sp.water&&!nearestWater(x,z,40))continue;
    const n=sp.group[0]+Math.floor(Math.random()*(sp.group[1]-sp.group[0]+1));
    for(let k=0;k<n&&creatures.length<q.animals+4;k++){const ox=x+(Math.random()-0.5)*6,oz=z+(Math.random()-0.5)*6;
      if(sp.habitat==='land'&&!walkable(ox,oz))continue;if(sp.habitat==='water'&&!swimmable(ox,oz,sp.depth))continue;makeCreature(id,ox,oz);}
    return;}}

// ---------------- comportamento
function cState(c,s,t){c.state=s;c.timer=t!=null?t:3+Math.random()*4;}
function threatNear(c){if(G.stats.dead||G.state!=='play')return false;const dx=P.x-c.g.position.x,dz=P.z-c.g.position.z;const d=Math.hypot(dx,dz);
  const fear=c.sp.aggro>=2?0:(c.sp.hp<30?14:10)*(P.sprint?1.6:1);return d<fear;}
function wantsPlayer(c,dist){const sp=c.sp;if(G.stats.dead||G.state!=='play'||P.cave)return false;if(G.mode==='construcao')return false;
  if(c.provoked&&sp.aggro>=1)return dist<35;if(G.mode==='exploracao')return false;
  const night=isNight();if(sp.aggro===3)return dist<(night?28:12)*(G.mode==='desafio'?1.4:1);if(sp.aggro===2)return dist<(sp.aggroDist||7);return false;}
function think(c){const sp=c.sp,p=c.g.position;const dx=P.x-p.x,dz=P.z-p.z,dist=Math.hypot(dx,dz);
  if(c.state==='dead')return;
  if(sp.habitat==='water'||sp.habitat==='air'||sp.habitat==='insect')return;
  if(wantsPlayer(c,dist)){c.state='attack';return;}
  if(c.state==='attack'&&!wantsPlayer(c,dist)){cState(c,'idle',2);}
  if(threatNear(c)&&c.state!=='attack'){c.state='flee';c.timer=5;c.fleeFrom=[P.x,P.z];return;}
  // predadores fogem? não; presas fogem de predadores próximos
  if(sp.diet!=='carn'){for(const o of creatures){if(o===c||o.state==='dead'||!o.sp.prey||o.sp.prey.indexOf(c.id)<0)continue;const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<12){c.state='flee';c.timer=5;c.fleeFrom=[o.g.position.x,o.g.position.z];return;}}}
  if(['flee','hunt','eat','drink','sleep','graze'].includes(c.state)&&c.timer>0)return;
  const night=isNight(),rest=(sp.act==='dia'&&night)||(sp.act==='noite'&&!night&&G.hour>9&&G.hour<16);
  if(rest&&c.energy<70){cState(c,'sleep',20+Math.random()*20);return;}
  if(c.thirst>70){const w=nearestWater(p.x,p.z,70);if(w){c.target=[w[0],w[1]];cState(c,'toWater',20);return;}}
  if(c.hunger>60){
    if(sp.prey){let best=null,bd=40;for(const o of creatures){if(o===c||o.state==='dead'||sp.prey.indexOf(o.id)<0)continue;const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<bd){bd=d;best=o;}}
      if(best){c.prey=best;cState(c,'hunt',25);return;}}
    if(sp.diet!=='carn'){let bush=null,bd=25;nodesNear(p.x,p.z,25,n=>{if(n.alive&&n.type==='bush'){const d=Math.hypot(n.x-p.x,n.z-p.z);if(d<bd){bd=d;bush=n;}}});
      if(bush){c.food=bush;c.target=[bush.x,bush.z];cState(c,'toFood',15);return;}cState(c,'graze',5+Math.random()*4);return;}}
  if(Math.random()<0.6){for(let k=0;k<6;k++){const a=Math.random()*6.28,d=5+Math.random()*16;let x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;
      if(Math.hypot(x-c.home[0],z-c.home[1])>45){x=c.home[0]+(Math.random()-0.5)*20;z=c.home[1]+(Math.random()-0.5)*20;}
      if(walkable(x,z)){c.target=[x,z];cState(c,'wander',12);return;}}}
  cState(c,'idle',2+Math.random()*4);}
function moveTo(c,tx,tz,speed,dt){const p=c.g.position;const want=Math.atan2(tx-p.x,tz-p.z);let diff=want-c.g.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));c.g.rotation.y+=clamp(diff,-5*dt,5*dt);
  const r=c.sp.h?c.sp.h*0.3:0.4;
  for(const off of [0,0.7,-0.7,1.4,-1.4,2.1,-2.1]){const a=c.g.rotation.y+off;const nx=p.x+Math.sin(a)*speed*dt,nz=p.z+Math.cos(a)*speed*dt;
    if(walkable(nx,nz)&&!blockedC(nx,nz,r)){p.x=nx;p.z=nz;p.y=H(nx,nz);if(off)c.g.rotation.y+=off*Math.min(1,dt*4);return true;}}
  return false;}
function updateCreature(c,dt){const sp=c.sp,p=c.g.position,m=c.m;const dx=P.x-p.x,dz=P.z-p.z,dist=Math.hypot(dx,dz);
  if(c.hurt>0){c.hurt-=dt;}
  if(c.state==='dead'){if(m.kind==='gltf'){m.mixer.update(dt);}return;}
  c.hunger=Math.min(100,c.hunger+dt*0.35);c.thirst=Math.min(100,c.thirst+dt*0.3);c.energy=c.state==='sleep'?Math.min(100,c.energy+dt*3):Math.max(0,c.energy-dt*0.15);
  c.think-=dt;if(c.think<=0){c.think=0.5+Math.random()*0.4;think(c);}c.timer-=dt;
  let speed=0,anim='idle';
  if(dist<25)seeSpecies(c.id);
  // voz
  c.voiceT-=dt;if(c.voiceT<=0){c.voiceT=6+Math.random()*12;const vol=clamp(1-dist/38,0,1);if(vol>0.03&&G.state==='play'&&sp.voice!=='none'&&!(c.state==='sleep'))animalVoice(sp.voice,vol*(sp.hp>100?1:0.75));}
  if(sp.habitat==='air'){updateFlyer(c,dt,dist);return;}
  if(sp.habitat==='insect'){updateInsect(c,dt);return;}
  if(sp.habitat==='water'){updateSwimmer(c,dt,dist);return;}
  switch(c.state){
    case 'idle':anim='idle';break;
    case 'graze':anim='eat';if(c.timer<=0){c.hunger=Math.max(0,c.hunger-40);cState(c,'idle',1);}break;
    case 'wander':speed=sp.walk;anim='walk';if(!c.target||c.timer<=0||Math.hypot(c.target[0]-p.x,c.target[1]-p.z)<1.2)cState(c,'idle',2+Math.random()*3);break;
    case 'toWater':case 'toFood':speed=sp.walk*1.2;anim='walk';if(c.target&&Math.hypot(c.target[0]-p.x,c.target[1]-p.z)<(c.state==='toWater'?7:2.2)){
        if(c.state==='toWater'){cState(c,'drink',4);}else{cState(c,'eat',4);}}else if(c.timer<=0)cState(c,'idle',2);break;
    case 'drink':anim='eat';if(c.timer<=0){c.thirst=0;cState(c,'idle',1);}break;
    case 'eat':anim='eat';if(c.timer<=0){c.hunger=Math.max(0,c.hunger-60);if(c.food&&c.food.alive){c.food.hp-=20;if(c.food.hp<=0)depleteNode(c.food,true);}c.food=null;cState(c,'idle',1);}break;
    case 'sleep':anim='sleep';if(c.timer<=0||threatNear(c))cState(c,'idle',1);break;
    case 'flee':{speed=sp.run;anim='run';const f=c.fleeFrom||[P.x,P.z];const ax=p.x-f[0],az=p.z-f[1],al=Math.hypot(ax,az)||1;c.target=[p.x+ax/al*10,p.z+az/al*10];if(c.timer<=0)cState(c,'idle',1);break;}
    case 'hunt':{const pr=c.prey;if(!pr||pr.state==='dead'||creatures.indexOf(pr)<0||c.timer<=0){cState(c,'idle',2);break;}speed=sp.run*0.9;anim='run';c.target=[pr.g.position.x,pr.g.position.z];
      if(Math.hypot(pr.g.position.x-p.x,pr.g.position.z-p.z)<1.6){killCreature(pr,false);c.hunger=0;c.prey=null;cState(c,'eat',6);}break;}
    case 'attack':{speed=sp.run;anim='run';c.target=[P.x,P.z];c.atk-=dt;const reach=(sp.h||0.8)*0.9+1.1;
      if(dist<reach){speed=0;anim='attack';if(c.atk<=0&&!G.stats.dead){c.atk=1.3;damage((sp.dmg||8)*(G.mode==='desafio'?1.3:1));c.hurt=0.15;if(m.kind==='gltf'&&m.acts.attack){m.cur=null;playAct(m,'attack',0.1);}}}
      if(dist>45){c.provoked=false;cState(c,'idle',3);}break;}}
  if(speed>0&&c.target){if(!moveTo(c,c.target[0],c.target[1],speed,dt)&&c.state==='wander')cState(c,'idle',1);}
  if(sp.water&&H(p.x,p.z)<WATER)p.y=Math.max(p.y,WATER-0.3);
  animateCreature(c,dt,speed,anim);}
function animateCreature(c,dt,speed,anim){const m=c.m;
  if(m.kind==='gltf'){if(anim==='attack'&&m.cur===m.acts.attack&&m.cur.isRunning()){}else playAct(m,anim==='run'?'run':anim==='walk'?'walk':anim==='eat'?'eat':anim==='sleep'?'sleep':'idle');
    if(m.cur)m.cur.timeScale=anim==='walk'?clamp(speed/c.sp.walk,0.6,1.6):anim==='run'?clamp(speed/c.sp.run*1.2,0.6,1.6):1;
    if(Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)<140)m.mixer.update(dt);return;}
  c.phase+=dt*(speed>0.1?speed*(c.sp.hop?5:3.2):1.5);
  if(m.kind==='quad'||m.kind==='frog'){const sw=speed>0.1?Math.sin(c.phase)*0.6:0;
    if(c.sp.hop){m.body.position.y=speed>0.1?Math.abs(Math.sin(c.phase))*0.15:0;m.legs.forEach((l,i)=>l.rotation.x=speed>0.1?(i<2?-0.6:0.6)*Math.abs(Math.sin(c.phase)):0);}
    else if(m.legs.length===4){m.legs[0].rotation.x=sw;m.legs[3].rotation.x=sw;m.legs[1].rotation.x=-sw;m.legs[2].rotation.x=-sw;m.body.position.y=Math.abs(Math.sin(c.phase))*0.03*Math.min(speed,3);}
    if(m.head){m.head.rotation.x=anim==='eat'?0.6+Math.sin(c.phase*3)*0.1:anim==='sleep'?0.3:Math.sin(c.phase*0.3)*0.05;}
    if(m.tail)m.tail.rotation.y=Math.sin(c.phase*(c.id==='onca'?1:2.5))*0.4;
    m.body.rotation.z=anim==='sleep'?(c.sp.proc==='quad'?0.0:0):0;if(anim==='sleep')m.body.position.y=-0.08*(c.sp.p?c.sp.p.h:0.5);}
  else if(m.kind==='snake'){const p=c.g.position;m.trail.unshift([p.x,p.z]);if(m.trail.length>60)m.trail.pop();
    m.segs.forEach((s,i)=>{const t=m.trail[Math.min(m.trail.length-1,i*3)]||[p.x,p.z];s.position.set(t[0]-p.x,0,t[1]-p.z);s.position.applyAxisAngle(new THREE.Vector3(0,1,0),-c.g.rotation.y);s.position.x+=Math.sin(c.phase*2-i*0.7)*0.06*(speed>0?1:0.3);});}
  else if(m.kind==='penguin'){m.body.rotation.z=speed>0.1?Math.sin(c.phase*2)*0.15:0;m.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*(0.2+Math.sin(c.phase*3)*0.15));}}
function updateFlyer(c,dt,dist){const sp=c.sp,p=c.g.position,m=c.m;const night=isNight();const resting=(sp.act==='noite'&&!night)||(sp.act==='dia'&&night);
  if(dist<8&&c.state==='perch'){c.state='fly';c.alt=H(p.x,p.z)+14;}
  if(resting&&c.state==='fly'&&Math.random()<dt*0.05){c.state='perch';}
  if(c.state==='perch'){const g=H(p.x,p.z);p.y=lerp(p.y,g+0.15,Math.min(1,dt*2));m.wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*0.1);return;}
  c.phase+=dt;if(!c.target||Math.random()<dt*0.1){const a=Math.random()*6.28;c.target=[c.home[0]+Math.cos(a)*40,c.home[1]+Math.sin(a)*40];}
  const want=Math.atan2(c.target[0]-p.x,c.target[1]-p.z);let diff=want-c.g.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));c.g.rotation.y+=clamp(diff,-1.2*dt,1.2*dt);
  const sp2=c.sp.walk;p.x+=Math.sin(c.g.rotation.y)*sp2*dt;p.z+=Math.cos(c.g.rotation.y)*sp2*dt;const ground=H(p.x,p.z);c.alt=Math.max(c.alt,ground+6);p.y=lerp(p.y,c.alt+Math.sin(c.phase*0.7)*1.5,Math.min(1,dt));
  c.body.rotation.z=-clamp(diff,-0.6,0.6);const flap=sp.p&&sp.p.eagle?Math.sin(c.phase*2.2)*0.25:Math.sin(c.phase*14)*0.7;m.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*flap);}
function updateInsect(c,dt){const p=c.g.position,m=c.m;c.phase+=dt*18;if(isNight()){removeCreature(c);return;}
  if(!c.target||Math.random()<dt*0.5)c.target=[c.home[0]+(Math.random()-0.5)*12,c.home[1]+(Math.random()-0.5)*12];
  const a=Math.atan2(c.target[0]-p.x,c.target[1]-p.z);c.g.rotation.y=a;p.x+=Math.sin(a)*1.4*dt;p.z+=Math.cos(a)*1.4*dt;p.y=H(p.x,p.z)+0.8+Math.sin(c.phase*0.15)*0.4;
  m.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(c.phase)*1.1);}
function updateSwimmer(c,dt,dist){const sp=c.sp,p=c.g.position,m=c.m;c.phase+=dt*(sp.whale?1.2:4);
  if(!c.target||c.timer<=0||Math.hypot(c.target[0]-p.x,c.target[1]-p.z)<2){for(let k=0;k<8;k++){const a=Math.random()*6.28,d=6+Math.random()*(sp.whale?60:20);const x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(swimmable(x,z,sp.depth)){c.target=[x,z];c.timer=15;break;}}}
  const flee=dist<6&&sp.hp<20;let speed=flee?sp.run:sp.walk;if(c.target){const want=flee?Math.atan2(p.x-P.x,p.z-P.z):Math.atan2(c.target[0]-p.x,c.target[1]-p.z);let diff=want-c.g.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));c.g.rotation.y+=clamp(diff,-1.5*dt,1.5*dt);
    const nx=p.x+Math.sin(c.g.rotation.y)*speed*dt,nz=p.z+Math.cos(c.g.rotation.y)*speed*dt;if(swimmable(nx,nz,sp.depth*0.6)){p.x=nx;p.z=nz;}else c.timer=0;}
  let y=WATER-Math.min(sp.depth*0.6,(WATER-H(p.x,p.z))*0.5);
  if(sp.jump){c.jt=(c.jt||5+Math.random()*6)-dt;if(c.jt<0){c.jt=6+Math.random()*8;c.jv=6;}if(c.jv!=null){c.jy=(c.jy||0)+c.jv*dt;c.jv-=12*dt;if(c.jy<0){c.jy=0;c.jv=null;}y=Math.max(y,WATER-0.3+c.jy);}}
  if(sp.whale){c.surf=(c.surf||12)-dt;if(c.surf<0){y=WATER-0.8;if(c.surf<-4)c.surf=14+Math.random()*10;if(c.surf>-0.1&&dist<120)animalVoice('whale',clamp(1-dist/120,0,1));}}
  p.y=lerp(p.y,y,Math.min(1,dt*2));m.body.rotation.x=c.jv!=null?-c.jv*0.08:0;if(m.tail)m.tail.rotation.y=Math.sin(c.phase)*0.5;}

// ---------------- dano, morte e coleta
function killCreature(c,byPlayer){c.state='dead';c.deadAt=performance.now()/1000;const d=c.sp.drops;c.harvest=Object.values(d).reduce((a,b)=>a+b,0)?Math.max(2,Math.ceil(c.sp.hp/30)):0;
  if(c.m.kind==='gltf'){if(c.m.acts.death){c.m.cur&&c.m.cur.fadeOut(0.1);c.m.acts.death.reset().play();c.m.cur=c.m.acts.death;}}
  else{c.g.rotation.z=Math.PI/2;c.g.position.y+=c.sp.p?c.sp.p.h*0.5:0.15;}
  if(c.sp.habitat==='air'||c.sp.habitat==='water'){c.g.position.y=c.sp.habitat==='water'?WATER-0.2:H(c.g.position.x,c.g.position.z)+0.2;}
  if(byPlayer){G.kills=(G.kills||0)+1;PROFILE.kills=(PROFILE.kills||0)+1;saveProfile();if(PROFILE.kills>=5)unlockAch('cacador');
    if(c.harvest)toast(`${c.name} abatido. Golpeie para tirar ${Object.keys(d).map(k=>ITEMS[k].name.toLowerCase()).join(' e ')}.`,'var(--amber)');}}
function hitCreature(c,d,point){const tool=d&&d.kind==='tool'?d.tool:null;
  if(c.state==='dead'){if(c.harvest<=0)return;c.harvest--;for(const k in c.sp.drops){const n=Math.ceil(c.sp.drops[k]/Math.max(2,Math.ceil(c.sp.hp/30)));if(n>0&&(k!=='couro'||Math.random()<(tool?0.8:0.5)))give(k,tool?n:Math.max(1,n-1));}
    sfx('flesh');chips(point,0x991f1f,4);if(c.harvest<=0)removeCreature(c);return;}
  const dmg=(d&&d.kind==='tool'?d.dmg:6)*EFX().dmg;c.hp-=dmg;c.hurt=0.2;sfx('flesh');setTimeout(()=>animalVoice(c.sp.voice==='none'?'squeak':c.sp.voice,0.9),60);chips(point,0x991f1f,5);
  if(c.m.kind==='gltf'&&c.m.acts.hit&&c.hp>0){c.m.acts.hit.reset().play();}
  if(c.hp<=0){killCreature(c,true);return;}
  c.provoked=true;if(c.sp.aggro>=1)c.state='attack';else{c.state='flee';c.timer=6;c.fleeFrom=[P.x,P.z];}}
function hostileNear(x,z,r){return creatures.some(c=>c.state==='attack'&&Math.hypot(c.g.position.x-x,c.g.position.z-z)<r);}
function updateCreatures(dt){const now=performance.now()/1000;
  for(const c of creatures.slice()){const p=c.g.position;const d=Math.hypot(p.x-P.x,p.z-P.z);
    if((c.state==='dead'&&now-c.deadAt>120)||d>210||P.cave){removeCreature(c);continue;}
    updateCreature(c,dt);}
  howlT-=dt;if(howlT<=0){howlT=25+Math.random()*30;if(isNight()&&G.state==='play'&&!P.cave&&['temperada','neve'].includes(biomeAt(P.x,P.z)))animalVoice('howl',0.35);}
  spawnTick-=dt;if(spawnTick<=0&&!P.cave){const few=creatures.length<QUALITY().animals*0.5;spawnTick=few?0.25:1.0;spawnAround();if(few)spawnAround();}}
