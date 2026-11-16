'use strict';
// ======================================================================
//  Mira e interação
// ======================================================================
function raySphere(o,d,cx,cy,cz,r){const ox=o.x-cx,oy=o.y-cy,oz=o.z-cz;const b=ox*d.x+oy*d.y+oz*d.z;const c=ox*ox+oy*oy+oz*oz-r*r;const h=b*b-c;if(h<0)return Infinity;const t=-b-Math.sqrt(h);return t>=0?t:(c<0?0:Infinity);}
const REACH=3.6;
function pick(){const {o,d}=aimRay();let best={t:REACH+0.001,kind:null};
  const consider=(t,kind,obj,extra)=>{if(t<best.t)best=Object.assign({t,kind,obj},extra||{});};
  for(const n of nodes){if(!n.alive)continue;const dx=n.x-P.x,dz=n.z-P.z;if(dx*dx+dz*dz>64)continue;
    if(n.type==='tree'){consider(raySphere(o,d,n.x,n.y+1.1*n.s,n.z,0.75*n.s),'node',n);consider(raySphere(o,d,n.x,n.y+2.3*n.s,n.z,0.7*n.s),'node',n);}
    else if(n.type==='rock')consider(raySphere(o,d,n.x,n.y+n.hy*0.6,n.z,n.r*1.05),'node',n);
    else if(n.type==='bush')consider(raySphere(o,d,n.x,n.y+0.55*n.s,n.z,0.9*n.s),'node',n);
    else consider(raySphere(o,d,n.x,n.y+0.3,n.z,1.2),'node',n);}
  for(const c of creatures){const p=c.g.position;if(Math.hypot(p.x-P.x,p.z-P.z)>8)continue;consider(raySphere(o,d,p.x,p.y+0.7,p.z,0.85),'creature',c);consider(raySphere(o,d,p.x+Math.sin(c.g.rotation.y)*0.7,p.y+0.75,p.z+Math.cos(c.g.rotation.y)*0.7,0.55),'creature',c);}
  for(const pk of pickups){if(Math.hypot(pk.x-P.x,pk.z-P.z)>6)continue;consider(raySphere(o,d,pk.x,pk.y+0.15,pk.z,0.5),'pickup',pk);}
  const ph=pieceHit(o,d,REACH);if(ph)consider(ph.distance,'piece',ph.object.userData.piece);
  if(d.y<-0.05){const t=(WATER-o.y)/d.y;if(t>0&&t<REACH){const x=o.x+d.x*t,z=o.z+d.z*t;if(H(x,z)<WATER-0.05)consider(t,'water',null);}}
  const tt=terrainHit(o,d,REACH);if(tt<best.t&&best.kind!=='water')best={t:tt,kind:null};
  best.point=o.clone().addScaledVector(d,Math.min(best.t,REACH));return best;}

function hitPrompt(n,d){const tool=d&&d.tool;const verb=n.type==='tree'?'Cortar':n.type==='bush'?'Colher':'Quebrar';let tip='';
  if(n.type==='tree'&&tool!=='axe')tip='  (machado rende mais)';if((n.type==='rock'||n.type==='scrap')&&tool!=='pick')tip='  (picareta rende mais)';
  return `[${isTouch?'GOLPEAR':'Clique'}] ${verb} ${n.name}${tip}`;}
let nextSwing=0,hitMarker=0;const fallers=[];
function hitNode(n,d,point){const tool=d&&d.kind==='tool'?d.tool:null;const pref=n.type==='tree'?'axe':(n.type==='rock'||n.type==='scrap')?'pick':null;const good=pref&&tool===pref;
  n.hp-=n.type==='bush'?10:good?25:12;
  if(n.type==='tree'){give('madeira',good?3:1);if(Math.random()<0.15)give('fibra',1);}
  else if(n.type==='rock'){give('pedra',good?3:1);if(Math.random()<(tool==='axe'?0.5:good?0.25:0.1))give('silex',1);}
  else if(n.type==='bush'){give('frutinha',2);give('fibra',2);}
  else give('sucata',good?2:1);
  sfx(n.type,{good});chips(point,n.type==='tree'?0x9e734a:n.type==='bush'?0x4d8033:n.type==='scrap'?0x80503a:0x999999);n.shake=0.18;
  if(n.hp<=0)depleteNode(n);}
function depleteNode(n,remote){n.alive=false;n.respawnAt=performance.now()/1000+300;if(!remote){NET.myDepl.push([nodes.indexOf(n),performance.now()/1000]);NET.deplDirty=true;}
  if(n.type==='tree'){const g=new THREE.Group();const isP=n.isPine;g.position.set(n.x,n.y-0.2,n.z);scene.add(g);
    const inner=new THREE.Group();g.add(inner);inner.rotation.y=n.ry;inner.scale.setScalar(n.s);
    const tr=n.inst[0][0],cr=n.inst[1][0];const a=new THREE.Mesh(tr.geometry,MAT.bark),b=new THREE.Mesh(cr.geometry,isP?MAT.pine:MAT.leaf);a.castShadow=b.castShadow=true;inner.add(a,b);
    const away=new THREE.Vector3(n.x-P.x,0,n.z-P.z).normalize();fallers.push({g,axis:new THREE.Vector3(away.z,0,-away.x),ang:0,speed:0.2,life:2.6,away});}
  if(n.mesh)n.mesh.visible=false;
  for(const [m,i] of (n.inst||[])){m.setMatrixAt(i,ZERO);m.instanceMatrix.needsUpdate=true;}}
function respawnNode(n){n.alive=true;n.hp=n.max;if(n.mesh)n.mesh.visible=true;(n.inst||[]).forEach(([m,i],k)=>{m.setMatrixAt(i,n.mtxs[k]);m.instanceMatrix.needsUpdate=true;});}
const chipGeo=new THREE.BoxGeometry(0.05,0.05,0.05);const chipList=[];
function chips(p,color,count){const m=mat(color);for(let i=0;i<(count||6);i++){const c=new THREE.Mesh(chipGeo,m);c.position.copy(p);scene.add(c);chipList.push({c,vx:(Math.random()-0.5)*4,vy:2+Math.random()*2.5,vz:(Math.random()-0.5)*4,life:0.9});}}

function hitCreature(c,d,point){const tool=d&&d.kind==='tool'?d.tool:null;
  if(c.state==='dead'){if(c.harvest<=0)return;c.harvest--;give('carne_crua',tool?2:1);if(Math.random()<(tool?0.7:0.4))give('couro',1);sfx('flesh');chips(point,0x991f1f,4);if(c.harvest<=0)removeCreature(c);return;}
  c.hp-=d&&d.kind==='tool'?d.dmg:6;c.hurt=0.2;sfx('flesh');setTimeout(()=>sfx(c.kind==='boar'?'squeal':'yelp'),60);chips(point,0x991f1f,5);
  if(c.hp<=0){c.state='dead';c.deadAt=performance.now()/1000;c.harvest=c.kind==='boar'?4:3;c.g.rotation.z=Math.PI/2;c.g.position.y+=0.35;c.legs.forEach(l=>l.rotation.x=0);toast(`${c.name} abatido. Golpeie para tirar carne e couro.`,'var(--amber)');return;}
  if(c.kind==='boar'){if(Math.random()<0.35&&Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)<2.6)damage(6);c.state='flee';c.timer=6;}else c.state='chase';}
function removeCreature(c){scene.remove(c.g);creatures.splice(creatures.indexOf(c),1);}

let prompt='';
function updateInteraction(dt){prompt='';if(G.state!=='play'||G.stats.dead)return;
  for(let i=0;i<8;i++)if(wasPressed('Digit'+(i+1)))selectSlot(i);
  const tg=pick();const d=selDef();
  if(tg.kind==='pickup'){prompt=`[E] ${tg.obj.story?'Examinar':'Pegar'} ${tg.obj.name}`;if(wasPressed('KeyE'))takePickup(tg.obj);}
  else if(tg.kind==='water'){prompt='[E] Beber água';if(wasPressed('KeyE')){G.stats.water=Math.min(100,G.stats.water+25);toast('Você bebeu água','var(--cyan)');sfx('pick');}}
  else if(tg.kind==='piece'){const p=tg.obj;
    if(p.id==='fogueira'){const have=invCount('carne_crua');prompt=p.cooked>0?`[E] Pegar ${p.cooked} Carne Assada`+(p.raw>0?`  (assando mais ${p.raw})`:''):have>0?`[E] Colocar ${have} Carne Crua para assar`:p.raw>0?`Assando carne... ${p.raw} restante(s)`:'Fogueira: aquece e assa carne crua';
      if(wasPressed('KeyE')){if(p.cooked>0){const left=invAdd('carne_assada',p.cooked);const got=p.cooked-left;p.cooked=left;if(got){questAdvance('assar',got);toast(`+${got} Carne Assada`,'var(--amber)');sfx('pick');}}else if(have>0&&invRemove('carne_crua',have)){p.raw+=have;toast(`Assando ${have} carne(s)...`,'var(--amber)');}}}
    else if(p.id==='saco'){prompt=isNight()?'[E] Dormir até o amanhecer':'[E] Definir ponto de renascimento';if(wasPressed('KeyE'))useBag(p);}
    if(!build.id){if(p.remote)prompt+=(prompt?'\n':'')+`Construção de ${p.owner}`;else{prompt+=(prompt?'\n':'')+`[X] Desmontar ${ITEMS[p.id].name}`;if(wasPressed('KeyX'))demolish(p);}}}
  $('tDem').style.display=isTouch&&tg.kind==='piece'&&!build.id?'flex':'none';
  if(build.id)return;
  if(tg.kind==='node'&&!prompt)prompt=hitPrompt(tg.obj,d);
  if(tg.kind==='creature'){const c=tg.obj;prompt=c.state==='dead'?`[${isTouch?'GOLPEAR':'Clique'}] Tirar carne e couro do ${c.name} (${c.harvest})`:`[${isTouch?'GOLPEAR':'Clique'}] Atacar ${c.name}   ${Math.ceil(c.hp)}/${c.max}`;}
  const now=performance.now()/1000;
  if((mouseL||touchAtk||wasPressed('Mouse0'))&&now>=nextSwing){nextSwing=now+0.55;swingT=0;sfx('swing');NET.swing++;if(localAv)localAv.swingT=0;
    if((tg.kind==='node'||tg.kind==='creature')&&useStam(3)){hitMarker=0.12;if(tg.kind==='node')hitNode(tg.obj,d,tg.point);else hitCreature(tg.obj,d,tg.point);}}
  if((wasPressed('KeyF')||wasPressed('Mouse2'))&&d&&d.kind==='food')eat(G.sel);}
function takePickup(pk){if(invAdd(pk.item,pk.n)>0){toast('Inventário cheio','var(--red)');return;}toastGather(pk.item,pk.n);onGathered(pk.item,pk.n);
  if(pk.extra&&invAdd(pk.extra,1)===0)toastGather(pk.extra,1);
  if(pk.story==='radio'){questAdvance('radio',1);banner('UM SINAL NO RÁDIO','Entre chiados, uma voz gravada repete: "...aqui é a Estação Aurora... a rede caiu... quem ouvir, siga para o leste...". Alguém, ou alguma coisa, ainda está transmitindo.');}
  scene.remove(pk.g);pickups.splice(pickups.indexOf(pk),1);sfx('pick');}
function demolish(p){if(p.remote){toast('Essa construção é de '+p.owner,'var(--red)');return;}NET.buildDirty=true;if(isFound(p.id)&&pieces.some(o=>o!==p&&(isWall(o.id)||isRoof(o.id))&&o.cell&&o.cell[0]===p.cell[0]&&o.cell[1]===p.cell[1])){toast('Desmonte antes as paredes e o teto desta fundação','var(--red)');return;}
  removePiece(p);if(invAdd(p.id,1)===0)toast('Desmontado: '+ITEMS[p.id].name,'var(--muted)');sfx('place');}
function useBag(p){G.respawn={x:p.g.position.x,y:p.g.position.y+0.3,z:p.g.position.z};
  if(isNight()){if(creatures.some(c=>c.kind==='wolf'&&c.state!=='dead'&&Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z)<25)){toast('Não dá para dormir com lobos por perto!','var(--red)');return;}
    if(G.hour>=6){G.day++;onDay();}G.hour=6.2;G.stats.stam=100;banner('BOM DIA','Você dormiu e acordou descansado.');}
  else toast('Ponto de renascimento definido','var(--cyan)');}
function eat(slot){const s=G.inv[slot];if(!s)return;const d=ITEMS[s.id];if(d.kind!=='food')return;const st=G.stats;
  st.food=clamp(st.food+d.hunger,0,100);st.water=clamp(st.water+d.thirst,0,100);if(d.hp<0)damage(-d.hp);else st.hp=clamp(st.hp+d.hp,0,100);
  invRemoveSlot(slot,1);toast('Comeu: '+d.name,'var(--amber)');sfx('pick');}
function selectSlot(i){G.sel=i;refreshHeld();}
