'use strict';
// ======================================================================
//  Interface: missões por era e modo, inventário com raridade, equipamentos,
//  baú, menus de modos, configurações, perfil e conquistas
// ======================================================================
const rarC=d=>RARITY[d.rarity||0].color;
// ícone com moldura da raridade
function ico(d){const u=iconURL(d.id);const r=d.rarity||0;return `<div class="ico r${r}" style="border-color:${rarC(d)}">${u?`<img src="${u}" alt="">`:`<span style="color:${rarC(d)}">${d.short}</span>`}</div>`;}
function renderQuests(){const Q=curQ(),Pg=curP();const done=G.era>=2?G.era2Done:G.eraDone;
  $('questTitle').textContent=G.era>=2?(done?'Era II concluída!':'A Era Industrial'):'Primeiros Passos';
  document.querySelector('#quest .eyebrow').textContent=`Missão · Era ${G.era>=2?'II':'I'} · ${MODES[G.mode].name}`;
  let shown=0;let html=Q.map((q,i)=>{const d=Pg[i]>=q[2];if(isTouch&&(d||shown>=2))return '';shown++;return `<div class="obj${d?' done':''}"><i></i><span>${q[1]}</span>${q[2]>1?`<small>${Math.floor(Pg[i])}/${q[2]}</small>`:''}</div>`;}).join('');
  if(G.mode==='desafio'){G.challenge=G.challenge||{};html+=`<div class="eyebrow" style="margin-top:10px;color:var(--amber)">Desafios</div>`+CHALLENGES.map(([id,label])=>{const st=G.challenge[id];return `<div class="obj${st?' done':''}" style="${st==='falhou'?'color:var(--red)':''}"><i></i><span>${label}${st==='falhou'?' (perdido)':''}</span></div>`;}).join('');}
  if(G.mode==='exploracao')html+=`<div class="eyebrow" style="margin-top:10px;color:var(--amber)">Exploração</div>`+exploreGoals().map(([l,a,b])=>`<div class="obj${a>=b?' done':''}"><i></i><span>${l}</span><small>${a}/${b}</small></div>`).join('');
  if(G.mode==='coop')html+=`<div class="eyebrow" style="margin-top:10px;color:var(--amber)">Equipe</div>`+coopGoals().map(([l,a,b])=>`<div class="obj${a>=b?' done':''}"><i></i><span>${l}</span><small>${Math.min(a,b)}/${b}</small></div>`).join('')+
    [...NET.peers.values()].map(pe=>`<div class="obj"><span style="color:var(--cyan)">● ${pe.name}</span><small>${Math.round(Math.hypot(pe.tx-P.x,pe.tz-P.z))} m</small></div>`).join('');
  $('questList').innerHTML=html;
  const eraDots=document.querySelectorAll('.eradots div');eraDots.forEach((el,i)=>{el.className=i<G.era-1?'done':i===G.era-1?'cur':'';});
  document.querySelector('#status .era').textContent=G.era>=2?'II':'I';}
// ---------------- inventário
let picked=-1,infoSlot=-1;const STORE={p:null};
function buildInvGrid(){const mk=(parent,from,to)=>{parent.innerHTML='';for(let i=from;i<to;i++){const el=document.createElement('div');el.className='slot';el.dataset.i=i;
  el.addEventListener('click',()=>invClick(i));el.addEventListener('contextmenu',e=>{e.preventDefault();quickUse(i);});parent.appendChild(el);}};mk($('gHot'),0,8);mk($('gBag'),8,40);
  const eq=$('gEquip');eq.innerHTML='';for(const k in EQUIP_SLOTS){const el=document.createElement('div');el.className='slot eq';el.dataset.slot=k;el.title=EQUIP_SLOTS[k];el.addEventListener('click',()=>{if(G.equip[k]){infoEquip=k;infoSlot=-1;invDirty=true;renderInventory();}});eq.appendChild(el);}
  const st=$('gStore');st.innerHTML='';for(let i=0;i<16;i++){const el=document.createElement('div');el.className='slot';el.addEventListener('click',()=>storeClick(i));st.appendChild(el);}}
let infoEquip=null;
function quickUse(i){const s=G.inv[i];if(!s)return;const d=ITEMS[s.id];if(d.kind==='food')eat(i);else if(d.kind==='equip')equipItem(i);else if(d.id==='mapa_tesouro')useTreasureMap(i);}
function invClick(i){if(STORE.p&&G.inv[i]&&picked<0){const s=G.inv[i];const k=STORE.p.store.findIndex(x=>x&&x.id===s.id&&x.n<ITEMS[s.id].max);const e=k>=0?k:STORE.p.store.findIndex(x=>!x);
    if(e<0){toast('O baú está cheio','var(--red)');return;}if(STORE.p.store[e]){const room=ITEMS[s.id].max-STORE.p.store[e].n;const mv=Math.min(room,s.n);STORE.p.store[e].n+=mv;s.n-=mv;if(s.n<=0)G.inv[i]=null;}else{STORE.p.store[e]=s;G.inv[i]=null;}sfx('invopen');invChanged();return;}
  if(i>=invCap()&&!G.inv[i]){toast('Espaço extra: equipe uma mochila para usar','var(--muted)');return;}
  if(picked<0){if(G.inv[i]){picked=i;infoSlot=i;infoEquip=null;}}else{if(picked!==i&&!(i>=invCap()))invSwap(picked,i);picked=-1;infoSlot=i;}invDirty=true;refreshHeld();}
function storeClick(k){const s=STORE.p&&STORE.p.store[k];if(!s)return;const left=invAdd(s.id,s.n);if(left===s.n){toast('Inventário cheio','var(--red)');return;}if(left>0)s.n=left;else STORE.p.store[k]=null;sfx('invopen');invChanged();}
function openStorage(p){STORE.p=p;setState('inv');}
function renderInventory(){const cap=invCap();
  document.querySelectorAll('#gHot .slot,#gBag .slot').forEach(el=>{const i=+el.dataset.i;el.className='slot'+(i===picked?' pick':'')+(i>=cap?' locked':'');el.innerHTML=slotHTML(i,G.inv[i],i<8);});
  document.querySelectorAll('#gEquip .slot').forEach(el=>{const k=el.dataset.slot,id=G.equip[k];el.innerHTML=id?ico(ITEMS[id]):`<span class="eqlbl">${EQUIP_SLOTS[k]}</span>`;});
  $('storeBox').style.display=STORE.p?'block':'none';if(STORE.p)document.querySelectorAll('#gStore .slot').forEach((el,k)=>{el.innerHTML=slotHTML(k,STORE.p.store[k],false);});
  const info=$('info');let d=null,where='';if(infoEquip&&G.equip[infoEquip]){d=ITEMS[G.equip[infoEquip]];where='eq';}else if(infoSlot>=0&&G.inv[infoSlot]){d=ITEMS[G.inv[infoSlot].id];where='inv';}
  if(d){const r=RARITY[d.rarity||0];let btn='';if(where==='eq')btn=`<button id="actBtn">Tirar</button>`;else if(d.kind==='food')btn=`<button class="primary" id="actBtn">Comer</button>`;else if(d.kind==='equip')btn=`<button class="primary" id="actBtn">Equipar</button>`;else if(d.id==='mapa_tesouro')btn=`<button class="primary" id="actBtn">Usar</button>`;
    info.innerHTML=`<div><b style="color:${r.color}">${d.name}</b> <span class="rar" style="color:${r.color};border-color:${r.color}">${r.name}</span>${d.slot?` <span class="rar">${EQUIP_SLOTS[d.slot]}</span>`:''}<br>${d.desc||''}</div>`+btn;
    const b=$('actBtn');if(b)b.onclick=()=>{if(where==='eq'){unequip(infoEquip);infoEquip=null;}else quickUse(infoSlot);invDirty=true;renderInventory();};}
  else info.innerHTML='<div style="color:var(--muted)">Clique num item para ver os detalhes. Clique com o botão direito para usar ou equipar.</div>';
  const e=EFX();$('effects').textContent=[e.speed>1?`Velocidade +${Math.round((e.speed-1)*100)}%`:'',e.warm?`Calor +${e.warm}°C`:'',e.gather?`Colheita +${Math.round(e.gather*100)}%`:'',e.drain<1?`Gasto −${Math.round((1-e.drain)*100)}%`:'',e.canteen?`Cantil ${G.water}/${e.canteen}`:'',e.build<1?`Construção −${Math.round((1-e.build)*100)}%`:'',e.light?`Luz ${e.beam||e.light} m`:''].filter(Boolean).join(' · ')||'Sem efeitos de equipamento.';
  $('recTitle').textContent=`Fabricação · Era ${G.era>=2?'II':'I'}`+(G.mode==='construcao'?' · grátis':'');
  $('recList').innerHTML='';
  for(const [id,cost0,era] of RECIPES){const d2=ITEMS[id];const cost=recipeCost(id,cost0);const lock=(era||1)>G.era;const can=!lock&&Object.keys(cost).every(k=>invCount(k)>=cost[k]);const row=document.createElement('div');row.className='rec'+(can?' can':'')+(lock?' lock':'');
    row.innerHTML=ico(d2)+`<div class="mid"><b style="color:${can?rarC(d2):'var(--muted)'}">${d2.name}</b><div class="costs">${lock?'<span class="no">Desbloqueia na Era II</span>':Object.keys(cost).map(k=>`<span class="${invCount(k)>=cost[k]?'ok':'no'}">${invCount(k)}/${cost[k]} ${ITEMS[k].name}</span>`).join('')}</div></div>`;
    const b=document.createElement('button');b.textContent=lock?'Bloqueado':'Fabricar';if(can)b.className='primary';b.disabled=!can;b.onclick=()=>craft(id,cost);row.appendChild(b);$('recList').appendChild(row);}
  invDirty=false;}
function recipeCost(id,cost){if(G.mode==='construcao')return {};const c={};const k=ITEMS[id].kind==='piece'?EFX().build:1;for(const i in cost)c[i]=Math.max(1,Math.ceil(cost[i]*k));return c;}
function craft(id,cost){if(!Object.keys(cost).every(k=>invCount(k)>=cost[k]))return;for(const k in cost)invRemove(k,cost[k]);
  if(invAdd(id,1)>0){for(const k in cost)invAdd(k,cost[k]);toast('Inventário cheio','var(--red)');return;}
  const d=ITEMS[id];toast('Fabricado: '+d.name,rarC(d));sfx('craft');if(id==='machado_pedra'){questAdvance('machado',1);unlockAch('machado');}
  if(id==='machado_ferro'||id==='picareta_ferro')questAdvance('ferramenta',1);onGathered(id,0);}
// ---------------- menu: saves, modos, configurações, perfil, conquistas
function fmtDate(t){try{return new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
function renderSlots(){const el=$('slotInfo');if(!el)return;const m=Object.keys(SLOTS).sort((a,b)=>SLOTS[b].at-SLOTS[a].at)[0];
  el.textContent=m?`Último jogo: ${MODES[m].name} · Era ${SLOTS[m].era>=2?'II':'I'} · Dia ${SLOTS[m].day} · ${SLOTS[m].src==='nuvem'?'salvo na conta':'salvo neste aparelho'} · ${fmtDate(SLOTS[m].at)}`:legacySave()?'Save da versão anterior encontrado: use Continuar para trazê-lo.':'';
  $('bContinue').style.display=hasSave()?'block':'none';}
function renderModes(){const box=$('modeList');box.innerHTML='';for(const m in MODES){const s=SLOTS[m];const card=document.createElement('div');card.className='modecard';
  card.innerHTML=`<b>${MODES[m].name}</b><p>${MODES[m].desc}</p><small>${s?`Salvo: Era ${s.era>=2?'II':'I'} · Dia ${s.day} · ${fmtDate(s.at)}`:'Nenhum jogo salvo'}</small>`;
  const row=document.createElement('div');row.className='mrow';
  if(s){const c=document.createElement('button');c.className='primary';c.textContent='Continuar';c.onclick=async()=>{audioInit();if(await load(m)){setState('play');banner(`${MODES[m].name.toUpperCase()} · DIA ${G.day}`,'Jogo carregado.');}};row.appendChild(c);}
  const n=document.createElement('button');n.textContent=s?'Recomeçar':'Começar';if(!s)n.className='primary';
  n.onclick=()=>{if(s&&n.dataset.ok!=='1'){n.dataset.ok='1';n.textContent='Apagar e recomeçar?';return;}audioInit();newGame(m);};row.appendChild(n);card.appendChild(row);box.appendChild(card);}}
function renderSettings(){const q=$('qualBtns');q.innerHTML='';for(const k in QPROFILES){const b=document.createElement('button');b.textContent=QPROFILES[k].label;if(SETTINGS.quality===k)b.className='primary';b.onclick=()=>{SETTINGS.quality=k;saveSettings();applyQuality();renderSettings();};q.appendChild(b);}
  for(const k of ['master','music','sfx','amb','sens']){const el=$('set_'+k);el.value=SETTINGS[k];el.oninput=()=>{SETTINGS[k]=+el.value;saveSettings();applyVolumes();};}
  $('set_fps').checked=!!SETTINGS.fps;$('set_fps').onchange=()=>{SETTINGS.fps=$('set_fps').checked;saveSettings();};}
function renderAccount(){const el=$('acctLine');if(!el)return;
  el.textContent=ACCOUNT.kind==='claude'?`Conta Claude${ACCOUNT.name?': '+ACCOUNT.name:''} · progresso salvo na sua conta`:ACCOUNT.kind==='firebase'?`Conta: ${ACCOUNT.email||ACCOUNT.name} · progresso salvo na nuvem`:'Jogando como convidado · progresso salvo só neste aparelho';}
function renderProfile(){renderAccount();const st=$('profStats');const surf=Object.keys(PROFILE.biomes).filter(k=>k!=='caverna').length;
  st.innerHTML=[['Conquistas',Object.keys(PROFILE.ach).length+'/'+Object.keys(ACH).length],['Biomas descobertos',surf+'/7'],['Espécies avistadas',Object.keys(PROFILE.species).length+'/'+Object.keys(SPECIES).length],['Animais abatidos',PROFILE.kills||0],['Baús abertos',PROFILE.chests||0],['Peças construídas',PROFILE.built||0]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('profAcct').innerHTML=ACCOUNT.kind==='claude'?`<p>Você está jogando com a sua <b>conta Claude</b>. Seu progresso, inventário e conquistas ficam salvos nela, separados dos de qualquer outra pessoa, e você pode continuar em outro aparelho entrando com a mesma conta.</p>`:
    (typeof firebaseAccountHTML==='function'?firebaseAccountHTML():'<p>Jogando como convidado: o progresso fica só neste aparelho.</p>');
  if(typeof firebaseBind==='function')firebaseBind();
  const sp=$('profSpecies');sp.innerHTML=Object.keys(SPECIES).map(k=>`<span class="${PROFILE.species[k]?'seen':''}">${PROFILE.species[k]?SPECIES[k].name:'???'}</span>`).join('');}
function renderAchievements(){$('achList').innerHTML=Object.keys(ACH).map(k=>{const a=ACH[k],got=PROFILE.ach[k];return `<div class="ach${got?' got':''}"><b>${got?'★':'☆'} ${a.name}</b><p>${a.desc}</p>${a.reward?`<small>Recompensa: <span style="color:${rarC(ITEMS[a.reward[0]])}">${ITEMS[a.reward[0]].name}</span></small>`:''}</div>`;}).join('');}
$('bModesBack').onclick=()=>setState('menu');$('bSettings').onclick=()=>{SETTINGS_FROM='menu';setState('settings');};$('bSetBack').onclick=()=>setState(SETTINGS_FROM||'menu');
$('bProfile').onclick=()=>setState('profile');$('bProfBack').onclick=()=>setState('menu');$('bAch').onclick=()=>setState('achv');$('bAchBack').onclick=()=>setState('menu');
$('bPauseSettings').onclick=()=>{SETTINGS_FROM='pause';setState('settings');};
let SETTINGS_FROM='menu';
// ---------------- loading
function setLoading(p,label){const b=$('loadBar');if(b)b.style.width=Math.round(p*100)+'%';const l=$('loadLbl');if(l&&label)l.textContent=label;}
buildInvGrid();
