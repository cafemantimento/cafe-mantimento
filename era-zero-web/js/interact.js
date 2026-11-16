'use strict';
// ======================================================================
//  Mira e interação
// ======================================================================
function raySphere(o,d,cx,cy,cz,r){const ox=o.x-cx,oy=o.y-cy,oz=o.z-cz;const b=ox*d.x+oy*d.y+oz*d.z;const c=ox*ox+oy*oy+oz*oz-r*r;const h=b*b-c;if(h<0)return Infinity;const t=-b-Math.sqrt(h);return t>=0?t:(c<0?0:Infinity);}
const REACH=3.6;
function pick(){const {o,d}=aimRay();let best={t:REACH+0.001,kind:null};
  const consider=(t,kind,obj,extra)=>{if(t<best.t)best=Object.assign({t,kind,obj},extra||{});};
  const inCave=!!P.cave;nodesNear(P.x,P.z,8,n=>{if(!n.alive||!!n.cave!==inCave)return;for(const [hy,hr] of n.hit)consider(raySphere(o,d,n.x,n.y+hy,n.z,hr),'node',n);});
  for(const c of creatures){const p=c.g.position;if(Math.hypot(p.x-P.x,p.z-P.z)>12)continue;const sp=c.sp;const hh=sp.h||(sp.p&&(sp.p.h||sp.p.size||sp.p.len*0.2))||0.4;const big=sp.p&&sp.p.len?sp.p.len:hh;
    const r=clamp(Math.max(hh,big*0.5)*0.55,0.25,2.5);consider(raySphere(o,d,p.x,p.y+(sp.habitat==='water'?0:hh*0.55),p.z,r),'creature',c);
    consider(raySphere(o,d,p.x+Math.sin(c.g.rotation.y)*big*0.45,p.y+hh*0.6,p.z+Math.cos(c.g.rotation.y)*big*0.45,r*0.7),'creature',c);}
  for(const it of interactables){if(Math.hypot(it.x-P.x,it.z-P.z)>6||Math.abs(it.y-P.y)>8)continue;consider(raySphere(o,d,it.x,it.y,it.z,it.r),'inter',it);}
  const tr=treasureAt();if(tr&&Math.hypot(tr.x-P.x,tr.z-P.z)<4)consider(raySphere(o,d,tr.x,tr.y+0.2,tr.z,1.2),'treasure',tr);
  for(const pk of pickups){if(Math.hypot(pk.x-P.x,pk.z-P.z)>6)continue;consider(raySphere(o,d,pk.x,pk.y+0.15,pk.z,0.5),'pickup',pk);}
  const ph=pieceHit(o,d,REACH);if(ph)consider(ph.distance,'piece',ph.object.userData.piece);
  if(d.y<-0.05&&!inCave){const t=(WATER-o.y)/d.y;if(t>0&&t<REACH){const x=o.x+d.x*t,z=o.z+d.z*t;if(H(x,z)<WATER-0.05)consider(t,'water',null);}}
  const tt=inCave?Infinity:terrainHit(o,d,REACH);if(tt<best.t&&best.kind!=='water')best={t:tt,kind:null};
  best.point=o.clone().addScaledVector(d,Math.min(best.t,REACH));return best;}

function hitPrompt(n,d){const def=NODE_DEFS[n.type]||{};const tool=d&&d.tool;const verb=n.type==='bush'||n.type==='reed'?'Colher':def.tool==='axe'?'Cortar':'Quebrar';let tip='';
  if(def.needs==='pick'&&tool!=='pick')tip='  (precisa de picareta)';else if(def.tool==='axe'&&tool!=='axe')tip='  (machado rende mais)';else if(def.tool==='pick'&&tool!=='pick')tip='  (picareta rende mais)';
  return `[${isTouch?'GOLPEAR':'Clique'}] ${verb} ${n.name}${tip}`;}
let nextSwing=0,hitMarker=0;const fallers=[];
// o que cada golpe dá: [item, quantidade com a ferramenta certa, sem ela, chance]
const NODE_DROPS={tree:[['madeira',3,1],['fibra',1,0,0.15]],palm:[['madeira',2,1],['coco',1,1,0.3]],willow:[['madeira',3,1],['fibra',1,1,0.3]],
  rock:[['pedra',3,1],['silex',1,1,0.2]],cobre:[['minerio_cobre',2,0],['pedra',1,0,0.5]],ferro:[['minerio_ferro',2,0],['pedra',1,0,0.5]],cristal:[['cristal',1,0]],
  cactus:[['fibra',2,1],['polpa_cacto',1,1,0.6]],bush:[['frutinha',2,2],['fibra',2,2]],reed:[['fibra',3,3]],scrap:[['sucata',2,1]]};
function hitNode(n,d,point){const def=NODE_DEFS[n.type]||{};const tool=d&&d.kind==='tool'?d.tool:null;const good=def.tool&&tool===def.tool;
  if(def.needs&&tool!==def.needs){toast('Você precisa de uma picareta para isso','var(--muted)');sfx('rock',{good:false});return;}
  const eff=good?(d.eff||1):1;n.hp-=(n.type==='bush'||n.type==='reed')?10:(good?25:12)*eff;
  const e=EFX();for(const [id,ng,nb,ch] of (NODE_DROPS[n.type]||[])){if(ch&&Math.random()>ch)continue;let q=good?ng:nb;if(n.type==='cristal'&&d&&d.glow)q*=2;if(!q)continue;if(e.gather&&Math.random()<e.gather)q++;give(id,q);}
  if(n.type==='cactus'&&!tool){damage(2);toast('Os espinhos machucam!','var(--red)');}
  const snd=n.type==='palm'||n.type==='willow'||n.type==='cactus'?'tree':n.type==='cobre'||n.type==='ferro'||n.type==='cristal'?'rock':n.type==='reed'?'bush':n.type;
  sfx(snd,{good});chips(point,def.tool==='axe'?0x9e734a:n.type==='bush'||n.type==='reed'?0x4d8033:n.type==='cobre'?0xd08050:n.type==='cristal'?0x7fe8ff:n.type==='scrap'?0x80503a:0x999999);n.shake=0.18;
  if(n.hp<=0)depleteNode(n);}
function depleteNode(n,remote){n.alive=false;n.respawnAt=performance.now()/1000+(n.cave?900:300);if(!remote){NET.myDepl.push([n.idx,performance.now()/1000]);NET.deplDirty=true;}
  if(n.tall&&n.inst){const [im]=n.inst[0];const mesh=new THREE.Mesh(im.geometry,im.material);mesh.castShadow=true;mesh.matrixAutoUpdate=false;mesh.matrix.copy(n.mtx);mesh.matrix.setPosition(0,0,0);
    const g=new THREE.Group();g.position.set(n.x,n.y-0.05,n.z);g.add(mesh);scene.add(g);
    const away=new THREE.Vector3(n.x-P.x,0,n.z-P.z).normalize();fallers.push({g,axis:new THREE.Vector3(away.z,0,-away.x),ang:0,speed:0.2,life:2.6,away});}
  if(n.mesh)n.mesh.visible=false;
  for(const [m,i] of (n.inst||[])){m.setMatrixAt(i,ZERO);m.instanceMatrix.needsUpdate=true;}}
function respawnNode(n){n.alive=true;n.hp=n.max;if(n.mesh)n.mesh.visible=!n.cave||P.cave;(n.inst||[]).forEach(([m,i],k)=>{m.setMatrixAt(i,n.mtxs[k]);m.instanceMatrix.needsUpdate=true;});}
const chipGeo=new THREE.BoxGeometry(0.05,0.05,0.05);const chipList=[];
function chips(p,color,count){const m=mat(color);for(let i=0;i<(count||6);i++){const c=new THREE.Mesh(chipGeo,m);c.position.copy(p);scene.add(c);chipList.push({c,vx:(Math.random()-0.5)*4,vy:2+Math.random()*2.5,vz:(Math.random()-0.5)*4,life:0.9});}}

let prompt='';
function updateInteraction(dt){prompt='';if(G.state!=='play'||G.stats.dead)return;
  for(let i=0;i<8;i++)if(wasPressed('Digit'+(i+1)))selectSlot(i);
  const tg=pick();const d=selDef();
  if(tg.kind==='pickup'){prompt=`[E] ${tg.obj.story?'Examinar':'Pegar'} ${tg.obj.name}`;if(wasPressed('KeyE'))takePickup(tg.obj);}
  else if(tg.kind==='water'){const e=EFX();prompt='[E] Beber água'+(e.canteen&&G.water<e.canteen?'  e encher o cantil':'');if(wasPressed('KeyE')){G.stats.water=Math.min(100,G.stats.water+25);if(e.canteen){G.water=e.canteen;}toast(e.canteen?`Você bebeu água e encheu o cantil (${G.water}/${e.canteen})`:'Você bebeu água','var(--cyan)');sfx('drink');}}
  else if(tg.kind==='inter'){prompt=tg.obj.prompt();if(wasPressed('KeyE'))tg.obj.use();}
  else if(tg.kind==='treasure'){prompt='[E] Cavar o tesouro';if(wasPressed('KeyE'))digTreasure();}
  else if(tg.kind==='piece'){const p=tg.obj;
    if(p.id==='fogueira'){const have=invCount('carne_crua');prompt=p.cooked>0?`[E] Pegar ${p.cooked} Carne Assada`+(p.raw>0?`  (assando mais ${p.raw})`:''):have>0?`[E] Colocar ${have} Carne Crua para assar`:p.raw>0?`Assando carne... ${p.raw} restante(s)`:'Fogueira: aquece e assa carne crua';
      if(wasPressed('KeyE')){if(p.cooked>0){const left=invAdd('carne_assada',p.cooked);const got=p.cooked-left;p.cooked=left;if(got){questAdvance('assar',got);toast(`+${got} Carne Assada`,'var(--amber)');sfx('pick');}}else if(have>0&&invRemove('carne_crua',have)){p.raw+=have;toast(`Assando ${have} carne(s)...`,'var(--amber)');}}}
    else if(p.id==='forja'){const cu=invCount('minerio_cobre'),fe=invCount('minerio_ferro'),ing=p.ingots.cobre+p.ingots.ferro,q=p.ore.cobre+p.ore.ferro;
      prompt=ing>0?`[E] Pegar ${ing} lingote(s)`+(q?`  (fundindo mais ${q})`:''):cu+fe>0?`[E] Colocar minério na forja (${cu} cobre, ${fe} ferro)`:q?`Fundindo... ${q} restante(s)`:'Forja: funde minério de cobre e de ferro';
      if(wasPressed('KeyE')){if(ing>0){for(const k of ['cobre','ferro']){const n=p.ingots[k];if(n){const left=invAdd('lingote_'+k,n);p.ingots[k]=left;if(n-left){questAdvance('lingote',n-left);toastGather('lingote_'+k,n-left);}}}sfx('metal');}
        else if(cu+fe>0){if(cu)invRemove('minerio_cobre',cu);if(fe)invRemove('minerio_ferro',fe);p.ore.cobre+=cu;p.ore.ferro+=fe;toast('A forja começou a fundir','var(--amber)');sfx('fire');}}}
    else if(p.id==='bau'){prompt='[E] Abrir baú';if(wasPressed('KeyE')){openStorage(p);}}
    else if(p.id==='saco'){prompt=isNight()?'[E] Dormir até o amanhecer':'[E] Definir ponto de renascimento';if(wasPressed('KeyE'))useBag(p);}
    if(!build.id){if(p.remote)prompt+=(prompt?'\n':'')+`Construção de ${p.owner}`;else{prompt+=(prompt?'\n':'')+`[X] Desmontar ${ITEMS[p.id].name}`;if(wasPressed('KeyX'))demolish(p);}}}
  $('tDem').style.display=isTouch&&tg.kind==='piece'&&!build.id?'flex':'none';
  if(build.id)return;
  if(tg.kind==='node'&&!prompt)prompt=hitPrompt(tg.obj,d);
  if(tg.kind==='creature'){const c=tg.obj;prompt=c.state==='dead'?`[${isTouch?'GOLPEAR':'Clique'}] Tirar carne e couro do ${c.name} (${c.harvest})`:`[${isTouch?'GOLPEAR':'Clique'}] Atacar ${c.name}   ${Math.ceil(c.hp)}/${c.max}`;}
  const now=performance.now()/1000;
  if((mouseL||touchAtk||wasPressed('Mouse0'))&&now>=nextSwing){nextSwing=now+0.55;swingT=0;sfx('swing');NET.swing++;if(localAv)localAv.swingT=0;
    if((tg.kind==='node'||tg.kind==='creature')&&useStam(3)){hitMarker=0.12;if(tg.kind==='node')hitNode(tg.obj,d,tg.point);else hitCreature(tg.obj,d,tg.point);}}
  if((wasPressed('KeyF')||wasPressed('Mouse2'))&&d&&d.kind==='food')eat(G.sel);
  if((wasPressed('KeyF')||wasPressed('Mouse2'))&&d&&d.id==='mapa_tesouro')useTreasureMap(G.sel);
  if(wasPressed('KeyG'))drinkCanteen();}
function takePickup(pk){if(invAdd(pk.item,pk.n)>0){toast('Inventário cheio','var(--red)');return;}toastGather(pk.item,pk.n);onGathered(pk.item,pk.n);
  if(pk.extra&&invAdd(pk.extra,1)===0)toastGather(pk.extra,1);
  if(pk.item==='fragmento_meteoro')unlockAch('meteoro');
  if(pk.story==='radio'){questAdvance('radio',1);banner('UM SINAL NO RÁDIO','Entre chiados, uma voz gravada repete: "...aqui é a Estação Aurora... a rede caiu... quem ouvir, siga para o leste...". Alguém, ou alguma coisa, ainda está transmitindo.');}
  scene.remove(pk.g);pickups.splice(pickups.indexOf(pk),1);sfx('pick');}
function demolish(p){if(p.remote){toast('Essa construção é de '+p.owner,'var(--red)');return;}NET.buildDirty=true;if(isFound(p.id)&&pieces.some(o=>o!==p&&(isWall(o.id)||isRoof(o.id))&&o.cell&&o.cell[0]===p.cell[0]&&o.cell[1]===p.cell[1])){toast('Desmonte antes as paredes e o teto desta fundação','var(--red)');return;}
  removePiece(p);if(invAdd(p.id,1)===0)toast('Desmontado: '+ITEMS[p.id].name,'var(--muted)');sfx('place');}
function useBag(p){G.respawn={x:p.g.position.x,y:p.g.position.y+0.3,z:p.g.position.z};
  if(isNight()){if(hostileNear(P.x,P.z,25)){toast('Não dá para dormir com lobos por perto!','var(--red)');return;}
    if(G.hour>=6){G.day++;onDay();}G.hour=6.2;G.stats.stam=100;banner('BOM DIA','Você dormiu e acordou descansado.');}
  else toast('Ponto de renascimento definido','var(--cyan)');}
function eat(slot){const s=G.inv[slot];if(!s)return;const d=ITEMS[s.id];if(d.kind!=='food')return;const st=G.stats;
  st.food=clamp(st.food+d.hunger,0,100);st.water=clamp(st.water+d.thirst,0,100);if(d.hp<0)damage(-d.hp);else st.hp=clamp(st.hp+d.hp,0,100);
  invRemoveSlot(slot,1);toast('Comeu: '+d.name,'var(--amber)');sfx('pick');}
function selectSlot(i){G.sel=i;refreshHeld();}
