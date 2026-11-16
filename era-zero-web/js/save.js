'use strict';
// ======================================================================
//  Estados, salvar e carregar (um save por modo de jogo)
// ======================================================================
const SAVE_VERSION=3;
const SLOTS={};// modo -> {at, day, era}
function slotKey(mode){return 'save_'+(mode||G.mode);}
function hasSave(){return Object.keys(SLOTS).length>0||!!legacySave();}
function legacySave(){try{return JSON.parse(localStorage.getItem('erazero_save_v1'));}catch(e){return null;}}
async function refreshSlots(){for(const m in MODES){const l=localGet(slotKey(m)),r=await cloudGet(slotKey(m));const best=[l,r].filter(Boolean).sort((a,b)=>b.at-a.at)[0];
    if(best){try{const d=JSON.parse(best.json);SLOTS[m]={at:best.at,day:d.day,era:d.era||1,src:best===r?'nuvem':'aparelho',json:best.json};}catch(e){}}else delete SLOTS[m];}
  renderSlots();}
function serialize(){const pos=P.cave?[P.cave.x,H(P.cave.x,P.cave.z+3)+0.3,P.cave.z+3,0]:[P.x,P.y,P.z,P.yaw];
  return {v:SAVE_VERSION,mode:G.mode,at:Date.now(),p:pos,st:G.stats,inv:G.inv,equip:G.equip,water:G.water,hour:G.hour,day:G.day,quest:G.quest,quest2:G.quest2,era:G.era,eraDone:G.eraDone,era2Done:G.era2Done,
    respawn:G.respawn,opened:G.opened,discovered:G.discovered,secrets:G.secrets,kills:G.kills,predKills:G.predKills,treasure:G.treasure,challenge:G.challenge,weather:WEATHER.type,
    pieces:pieces.map(p=>({id:p.id,pos:[p.g.position.x,p.g.position.y,p.g.position.z],rot:p.g.rotation.y,cell:p.cell,edge:p.edge,floorTop:p.floorTop,store:p.store,ore:p.ore,ingots:p.ingots}))};}
let lastLoadedAt=0;
function save(silent){const data=serialize();const json=JSON.stringify(data);const key=slotKey();const ok=localPut(key,{json,at:data.at});SLOTS[G.mode]={at:data.at,day:G.day,era:G.era,json};
  if(!ACCOUNT.provider){if(!silent)toast(ok?'Jogo salvo neste aparelho':'Não foi possível salvar',ok?'var(--green)':'var(--red)');else if(ok)toast('Salvo automaticamente','var(--muted)');return ok;}
  cloudPut(key,json,data.at,lastLoadedAt).then(r=>{if(r===true)lastLoadedAt=data.at;
    if(r==='newer')toast('Existe um progresso mais novo deste modo em outro aparelho. Ele não foi substituído; volte ao menu para carregá-lo.','var(--amber)');
    else if(!silent)toast(r?'Jogo salvo na sua conta':'Salvo neste aparelho. Envia para a nuvem quando a internet voltar.',r?'var(--green)':'var(--amber)');
    else if(r)toast('Salvo automaticamente na sua conta','var(--muted)');});return ok;}
function applyData(d){
  clearPieces();for(const p of d.pieces||[])if(ITEMS[p.id]){const pc=placePiece(p.id,new THREE.Vector3(p.pos[0],p.pos[1],p.pos[2]),p.rot,p.cell,p.edge,p.floorTop,true);
    if(p.store&&pc.store)pc.store=p.store.map(s=>s&&ITEMS[s.id]?{id:s.id,n:s.n}:null);if(p.ore)pc.ore=p.ore;if(p.ingots)pc.ingots=p.ingots;}
  G.inv=(d.inv||[]).map(s=>s&&ITEMS[s.id]?{id:s.id,n:s.n}:null);while(G.inv.length<40)G.inv.push(null);
  G.equip=Object.assign({mochila:null,botas:null,amuleto:null,acessorio:null,roupa:null},d.equip||{});G.water=d.water||0;
  Object.assign(G.stats,d.st||{});G.stats.dead=false;if(G.stats.hp<=0)G.stats.hp=50;
  G.hour=d.hour||8;G.day=d.day||1;G.quest=QUESTS.map((q,i)=>(d.quest&&d.quest[i])||0);G.quest2=QUESTS2.map((q,i)=>(d.quest2&&d.quest2[i])||0);
  G.era=d.era||(d.eraDone?2:1);G.eraDone=!!d.eraDone;G.era2Done=!!d.era2Done;G.respawn=d.respawn||{x:0,y:H(0,0)+0.2,z:0};
  G.opened=d.opened||{};G.discovered=d.discovered||{};G.secrets=d.secrets||{};G.kills=d.kills||0;G.predKills=d.predKills||0;G.treasure=d.treasure==null?null:d.treasure;G.challenge=d.challenge||{};
  for(const c of chests)if(G.opened[c.id]){c.g.children[1].rotation.x=-0.9;c.g.children[1].position.set(0,0.85,-0.3);}
  P.cave=null;[P.x,P.y,P.z,P.yaw]=d.p||[0,H(0,0),0,0];P.y=Math.max(P.y,H(P.x,P.z))+0.2;P.vx=P.vz=P.vy=0;
  if(d.weather&&W_DEF[d.weather])setWeather(d.weather);invChanged();renderQuests();}
// converte o save antigo (mundo de 400 m) para o mundo novo
function migrateV1(d){const refund={};for(const p of d.pieces||[])refund[p.id]=(refund[p.id]||0)+1;
  const out={v:3,mode:'sobrevivencia',at:d.at||Date.now(),p:[0,H(0,0)+0.2,0,0],st:d.st,inv:d.inv,hour:d.hour,day:d.day,quest:d.quest,era:d.eraDone?2:1,eraDone:d.eraDone,pieces:[]};
  out._refund=refund;return out;}
async function load(mode){G.mode=mode||G.mode;let best=null;
  const l=localGet(slotKey()),r=await cloudGet(slotKey());best=[l,r].filter(Boolean).sort((a,b)=>b.at-a.at)[0];
  let d=null;if(best){try{d=JSON.parse(best.json);}catch(e){}}
  if(!d&&G.mode==='sobrevivencia'){const old=legacySave()||(await cloudGet('save'));const od=old&&old.json?JSON.parse(old.json):old;if(od&&od.v===1)d=migrateV1(od);}
  if(!d)return false;applyData(d);lastLoadedAt=d.at||0;
  if(d._refund){let any=false;for(const id in d._refund)if(ITEMS[id]){invAdd(id,d._refund[id]);any=true;}try{localStorage.removeItem('erazero_save_v1');}catch(e){}
    if(any)setTimeout(()=>banner('O VALE CRESCEU','O mundo agora tem 8 biomas. Suas construções voltaram para o inventário para você reconstruir onde quiser.'),400);save(true);}
  return true;}
function resetWorldState(){for(const n of nodes)if(!n.alive)respawnNode(n);for(const c of chests){c.g.children[1].rotation.x=0;c.g.children[1].position.set(0,0.66,0);}for(const c of creatures.slice())removeCreature(c);if(P.cave)exitCave(P.cave);}
function newGame(mode){G.mode=mode||G.mode;NET.buildDirty=true;resetWorldState();
  clearPieces();G.inv=new Array(40).fill(null);G.equip={mochila:null,botas:null,amuleto:null,acessorio:null,roupa:null};G.water=0;
  G.stats=Object.assign(G.stats,{hp:100,food:100,water:100,stam:100,dead:false});G.hour=8;G.day=1;G.quest=QUESTS.map(()=>0);G.quest2=QUESTS2.map(()=>0);G.era=1;G.eraDone=false;G.era2Done=false;
  G.opened={};G.discovered={};G.secrets={};G.kills=0;G.predKills=0;G.treasure=null;G.challenge={};
  G.respawn={x:0,y:H(0,0)+0.2,z:0};P.x=0;P.z=0;P.y=H(0,0)+0.2;P.yaw=-0.35;P.pitch=0;P.cave=null;G.sel=0;modeStartKit();invChanged();renderQuests();setWeather('limpo');lastLoadedAt=0;
  setState('play');save(true);
  banner(MODES[G.mode].name.toUpperCase()+' · DIA 1',G.mode==='construcao'?'Modo criativo: você começa com ferramentas e peças. Construa à vontade.':isTouch?'Você acordou sozinho no Vale. Pegue galhos e pedras do chão com USAR, depois golpeie árvores e rochas.':'Você acordou sozinho no Vale. Pegue galhos e pedras do chão com E, depois golpeie árvores e rochas.');}
function setState(s){G.state=s;if(s==='play')NET.synced=false;['menu','pause','dead','inv','modes','settings','profile','achv'].forEach(id=>{const el=$(id);if(el)el.classList.toggle('on',s===id);});
  $('hud').style.display=['menu','loading','modes','settings','profile','achv'].includes(s)?'none':'block';
  if(s==='play'){canvas.focus();}
  else if(locked&&s!=='play'){try{document.exitPointerLock();}catch(e){}}
  if(s==='inv'){picked=-1;infoSlot=-1;invDirty=true;renderInventory();sfx('invopen');}
  if(s==='menu'){$('bContinue').style.display=hasSave()?'block':'none';$('nameIn').value=myName();renderSlots();playMusic('menu');}
  if(s==='play')playMusic(BIOME_INFO[WEATHER.biome].music);
  if(s==='settings')renderSettings();if(s==='modes')renderModes();if(s==='profile')renderProfile();if(s==='achv')renderAchievements();
  mouseL=false;touchAtk=false;}
$('nameIn').addEventListener('change',()=>setName($('nameIn').value));$('nameIn').addEventListener('keydown',e=>e.stopPropagation());
async function continueGame(){audioInit();setName($('nameIn').value);const modes=Object.keys(SLOTS).sort((a,b)=>SLOTS[b].at-SLOTS[a].at);const m=modes[0]||'sobrevivencia';
  if(await load(m)){setState('play');banner(`${MODES[G.mode].name.toUpperCase()} · DIA ${G.day}`,'Jogo carregado.');}else newGame(m);}
$('bContinue').onclick=continueGame;
$('bNew').onclick=()=>{audioInit();setName($('nameIn').value);setState('modes');};
$('bResume').onclick=()=>setState('play');
$('bSave').onclick=()=>save();
$('bMenu').onclick=()=>{save(true);setState('menu');};
$('bRespawn').onclick=()=>{const st=G.stats;st.hp=60;st.food=Math.max(st.food,60);st.water=Math.max(st.water,60);st.stam=100;st.dead=false;if(P.cave)exitCave(P.cave);P.x=G.respawn.x;P.y=G.respawn.y;P.z=G.respawn.z;P.vy=0;setState('play');};
$('closeInv').onclick=()=>setState('play');
