'use strict';
// ======================================================================
//  Estados, salvar e carregar
// ======================================================================
const SAVE_KEY='erazero_save_v1';
function hasSave(){if(CLOUD.data)return true;try{return !!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}
function save(silent){const data={v:1,p:[P.x,P.y,P.z,P.yaw],st:G.stats,inv:G.inv,hour:G.hour,day:G.day,quest:G.quest,eraDone:G.eraDone,respawn:G.respawn,
  pieces:pieces.map(p=>({id:p.id,pos:[p.g.position.x,p.g.position.y,p.g.position.z],rot:p.g.rotation.y,cell:p.cell,edge:p.edge,floorTop:p.floorTop}))};
  data.at=Date.now();const json=JSON.stringify(data);let ok=false;try{localStorage.setItem(SAVE_KEY,json);ok=true;}catch(e){}
  cloudSave(json).then(c=>{if(!silent)toast(c?'Jogo salvo na sua conta':ok?'Jogo salvo neste navegador':'Não foi possível salvar',c||ok?'var(--green)':'var(--red)');else if(c||ok)toast(c?'Salvo automaticamente na sua conta':'Salvo automaticamente','var(--muted)');});return ok;}
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVE_KEY));}catch(e){}
  if(CLOUD.data&&(!d||(CLOUD.data.at||0)>(d.at||0)))d=CLOUD.data;if(!d)return false;
  clearPieces();for(const p of d.pieces||[])if(ITEMS[p.id])placePiece(p.id,new THREE.Vector3(p.pos[0],p.pos[1],p.pos[2]),p.rot,p.cell,p.edge,p.floorTop,true);
  G.inv=(d.inv||[]).map(s=>s&&ITEMS[s.id]?{id:s.id,n:s.n}:null);while(G.inv.length<32)G.inv.push(null);
  Object.assign(G.stats,d.st||{});G.stats.dead=false;if(G.stats.hp<=0)G.stats.hp=50;
  G.hour=d.hour||8;G.day=d.day||1;G.quest=QUESTS.map((q,i)=>(d.quest&&d.quest[i])||0);G.eraDone=!!d.eraDone;G.respawn=d.respawn||G.respawn;
  [P.x,P.y,P.z,P.yaw]=d.p;P.y+=0.2;P.vx=P.vz=P.vy=0;invChanged();renderQuests();return true;}
function newGame(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}CLOUD.data=null;NET.buildDirty=true;
  clearPieces();G.inv=new Array(32).fill(null);G.stats=Object.assign(G.stats,{hp:100,food:100,water:100,stam:100,dead:false});G.hour=8;G.day=1;G.quest=QUESTS.map(()=>0);G.eraDone=false;
  G.respawn={x:0,y:H(0,0)+0.2,z:0};P.x=0;P.z=0;P.y=H(0,0)+0.2;P.yaw=-0.35;P.pitch=0;G.sel=0;invChanged();renderQuests();
  setState('play');banner('DIA 1',isTouch?'Você acordou sozinho no Vale. Pegue galhos e pedras do chão com USAR, depois golpeie árvores e rochas.':'Você acordou sozinho no Vale. Pegue galhos e pedras do chão com E, depois golpeie árvores e rochas.');}
function setState(s){G.state=s;if(s==='play')NET.synced=false;['menu','pause','dead','inv'].forEach(id=>$(id).classList.toggle('on',s===id));
  $('hud').style.display=s==='menu'||s==='loading'?'none':'block';
  if(s==='play'){canvas.focus();}
  else if(locked&&s!=='play'){try{document.exitPointerLock();}catch(e){}}
  if(s==='inv'){picked=-1;infoSlot=-1;invDirty=true;renderInventory();}
  if(s==='menu'){$('bContinue').style.display=hasSave()?'block':'none';$('nameIn').value=myName();}
  mouseL=false;touchAtk=false;}
$('nameIn').addEventListener('change',()=>setName($('nameIn').value));$('nameIn').addEventListener('keydown',e=>e.stopPropagation());
$('bContinue').onclick=()=>{audioInit();setName($('nameIn').value);if(load()){setState('play');banner(`DIA ${G.day}`,'Jogo carregado.');}else newGame();};
$('bNew').onclick=()=>{audioInit();setName($('nameIn').value);newGame();};
$('bResume').onclick=()=>setState('play');
$('bSave').onclick=()=>save();
$('bMenu').onclick=()=>{save(true);setState('menu');};
$('bRespawn').onclick=()=>{const st=G.stats;st.hp=60;st.food=Math.max(st.food,60);st.water=Math.max(st.water,60);st.stam=100;st.dead=false;P.x=G.respawn.x;P.y=G.respawn.y;P.z=G.respawn.z;P.vy=0;setState('play');};
$('closeInv').onclick=()=>setState('play');
