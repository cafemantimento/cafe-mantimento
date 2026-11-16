'use strict';
// ======================================================================
//  Interface
// ======================================================================
const PAL={k:'#1b1410',w:'#8a5a2b',W:'#c08a4a',d:'#5a3a1c',s:'#8d9196',S:'#c9cdd1',g:'#5b5f64',f:'#343a4a',F:'#8a94b8',r:'#c8323c',R:'#ff8080',m:'#e58080',M:'#a33d3d',b:'#8a4a1e',B:'#cf9550',l:'#5d8f2e',L:'#a3d65f',G:'#2f5a1a',o:'#ff9a2a',y:'#ffe066',c:'#3fb8d6',C:'#bff3ff',n:'#1f6f86',u:'#9a5530',U:'#d99a62',h:'#8c5c38',H:'#c08d58',e:'#4f6e45',E:'#8fb27a',p:'#eadcbc'};
const ICONS={
madeira:["","","","..kkkkkkkkkkk...",".kWWWWWWWWWkWk..","kwwwwwwwwwkWdWk.","kwdwwwwdwwkWddWk","kwwwwdwwwwkWddWk","kdwwwwwwwdkWdWk.",".kddddddddkkWk..","..kkkkkkkkk.kk.."],
pedra:["","","","......kkkk......","....kkSSSskk....","...kSSSsssssk...","..kSSsssssssk...","..kSssssssgssk..",".kssssssssggsk..",".ksssSsssgggsk..",".kgsssssgggggk..",".kggsssgggggk...","..kkggggggkk....","....kkkkkk......"],
fibra:["","....l.....L.....","....lL...lL..l..",".....lL..lL.lL..",".....lL.lL.lL...","......lLlLlL....","......lLLLl.....","......kddk......","......kWWk......","......lLLl......",".....lL.lLl.....","....lL...lLl....","...lL.....lL....","...l.......l...."],
silex:["","..........k.....",".........kFk....","........kFFk....",".......kFffk....","......kFfffk....",".....kFffffk....","....kFfffffk....","....kFffffffk...","...kFfffffffk...","...kffffffffk...","....kfffffkk....",".....kkkkk......"],
sucata:["","......kkkk......","..kk..kUUk..kk..",".kUUkkkuuukkUUk.",".kUuuuuuuuuuuuk.","..kuuukkkkuuuk..",".kkuuk....kuukk.","kUuuk......kuuUk","kuuuk......kuuuk",".kkuuk....kuukk.","..kuuukkkkuuuk..",".kUuuuuuuuuuuUk.",".kUUkkkuuukkUUk.","..kk..kuuk..kk..","......kkkk......"],
couro:["",".kk..........kk.","kHHk........kHHk",".kHHkkkkkkkkHHk.","..khhhhhhhhhhk..","..khHhhhhhhhhk..",".khhhhhhhhHhhhk.",".khhhhhhhhhhhhk.",".khhhhHhhhhhhhk.","..khhhhhhhhhhk..","..khhhhhhHhhhk..",".kHHkhhhhhhkHHk.","kHHk.kkkkkk.kHHk",".kk..........kk."],
frutinha:["",".......lL.......","......lLLl......",".......kk.......","....kk.kk.kk....","...kRrk.kkRrk...","..kRrrrkkRrrrk..","..krrrrkkrrrrk..","...krrkRrkrrk...","....kkRrrrkk....","...kkrrrrrrk....","..kRrkrrrrkRrk..","..krrrkkkkrrrk..","...krrk..krrk...","....kk....kk...."],
carne_crua:["","","....kkkkkk......","...kmmRmmmkk....","..kmmmmmmmmmk...",".kmmMmmmmmRmmk..",".kmmmmmmmmmmmk..",".kRmmmmMmmmmmkk.",".kmmmmmmmmMmmkSk","..kmmmmmmmmmkSSk","...kkmmmmmkkSSk.",".....kkkkk.kSk..","...........kk..."],
machado_pedra:["","..........kkk...",".........kSSsk..","........kSSsssk.",".......kSkssssk.","......kWkksssgk.",".....kWdk.kssgk.","....kWdk...kkk..","...kWdk.........","..kWdk..........",".kWdk...........","kWdk............","kdk.............",".k.............."],
picareta_pedra:["",".....kkkkkk.....","...kkSSSSSskk...","..ksSkkkkkksgk..",".ksgk....kWkgk..",".kgk....kWdk.kk.",".kk....kWdk.....","......kWdk......",".....kWdk.......","....kWdk........","...kWdk.........","..kWdk..........",".kWdk...........",".kdk............","..k............."],
lanca:[".............kk.","............kFFk","...........kFffk","..........kFffk.",".........kfffk..","........kkfkk...",".......kLkk.....","......kWdk......",".....kWdk.......","....kWdk........","...kWdk.........","..kWdk..........",".kWdk...........","kWdk............","kdk.............",".k.............."],
fundacao:["","","","......kkkk......","....kkCCCCkk....","..kkCCccccCCkk..","kkCCccccccccCCkk","kcCccccccccccCck","knccCccccccCccnk","knnnccccccccnnnk",".kknnnccccnnnkk.","...kknnnnnnkk...",".....kknnkk.....",".......kk......."],
parede:["","..kkkkkkkkkkkk..","..kCckCckCckCk..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..kcckcckcckck..","..knnknnknnknk..","..kkkkkkkkkkkk.."],
porta:["","..kkkkkkkkkkkk..","..kCckCckCckCk..","..kcckcckcckck..","..kcckkkkkkcck..","..kcck....kcck..","..kcck....kcck..","..kcck....kcck..","..kcck....kcck..","..kcck....kcck..","..kcck....kcck..","..knnk....knnk..","..kkkk....kkkk.."],
teto:["","",".......kk.......","......kCCk......",".....kCccCk.....","....kCccccCk....","...kCccccccCk...","..kCccccccccCk..",".kCccccccccccCk.","kCccccccccccccCk","kkkkkkkkkkkkkkkk","..kcck....kcck..","..knnk....knnk..","..kkkk....kkkk.."],
fogueira:["","........y.......",".......yo.......","......yooy......",".....yoooyo.....","....oyoyyooo....","....ooyyyyoo....",".....oyyyyo.....","..kk..oooo..kk..","..kWkkkkkkkkWk..","...kWWdkkdWWk...","..kkdWWkkWWdkk..",".kWWkkdWWdkkWWk.",".kdk..kkkk..kdk.","..k..........k.."],
saco:["","","....kkkkkkkk....","...kppppppppk...","...kpppppppkk...","...kkkkkkkkkk...","...kEEEEEEEEk...","...keeeeeeeek...","...kEeeeeeeEk...","...keeeeeeeek...","...keeeeeeeek...","...kEeeeeeeEk...","...keeeeeeeek...","...kkkkkkkkkk..."],
};
ICONS.carne_assada=ICONS.carne_crua.map(r=>r.replace(/m/g,'b').replace(/R/g,'B').replace(/M/g,'d'));
const iconCache={};
function iconURL(id){if(id in iconCache)return iconCache[id];const rows=ICONS[id];if(!rows){iconCache[id]=null;return null;}
  const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');const off=Math.floor((16-rows.length)/2);
  rows.forEach((row,j)=>{for(let i=0;i<16;i++){const ch=row[i];if(!ch||ch==='.')continue;x.fillStyle=PAL[ch]||'#f0f';x.fillRect(i,j+Math.max(0,off),1,1);}});
  return iconCache[id]=c.toDataURL();}

const ico=d=>{const u=iconURL(d.id);return `<div class="ico">${u?`<img src="${u}" alt="">`:d.short}</div>`;};
function hexA(hex,a){const c=new THREE.Color(hex);return `rgba(${Math.round(c.r*255*0.75)},${Math.round(c.g*255*0.75)},${Math.round(c.b*255*0.75)},${a+0.35})`;}
function slotHTML(i,s,withKey){const d=s?ITEMS[s.id]:null;return (withKey?`<span class="k">${i+1}</span>`:'')+(d?ico(d)+(d.max>1?`<span class="n">${s.n}</span>`:''):'');}
const hot=$('hotbar');for(let i=0;i<8;i++){const el=document.createElement('div');el.className='slot';el.addEventListener('click',()=>selectSlot(i));el.addEventListener('touchstart',e=>{e.preventDefault();selectSlot(i);},{passive:false});hot.appendChild(el);}
let lastHot='';
function renderHotbar(){const key=G.sel+'|'+G.inv.slice(0,8).map(s=>s?s.id+s.n:'').join(',');if(key===lastHot)return;lastHot=key;
  [...hot.children].forEach((el,i)=>{el.className='slot'+(i===G.sel?' sel':'');el.innerHTML=slotHTML(i,G.inv[i],true);});
  const d=selDef();$('selname').textContent=d?d.name.toUpperCase():'MÃOS LIVRES';}
function renderQuests(){$('questTitle').textContent=G.eraDone?'Era I concluída!':'Primeiros Passos';
  let shown=0;$('questList').innerHTML=QUESTS.map((q,i)=>{const done=G.quest[i]>=q[2];if(isTouch&&(done||shown>=2))return '';shown++;return `<div class="obj${done?' done':''}"><i></i><span>${q[1]}</span>${q[2]>1?`<small>${G.quest[i]}/${q[2]}</small>`:''}</div>`;}).join('');}
const toasts=[];
function toast(text,color){const el=document.createElement('div');el.className='panel toast';el.style.borderLeftColor=color||'var(--cyan)';el.style.color=color&&color!=='var(--muted)'?color:'var(--fg)';el.textContent=text;$('toasts').appendChild(el);
  toasts.push({el,until:performance.now()/1000+4.5});if(toasts.length>6){toasts[0].el.remove();toasts.shift();}}
function toastGather(id,n){const k='g_'+id;const ex=toasts.find(t=>t.key===k);if(ex){ex.n+=n;ex.el.textContent=`+${ex.n} ${ITEMS[id].name}`;ex.until=performance.now()/1000+3;return;}
  toast(`+${n} ${ITEMS[id].name}`,'var(--cyan)');const t=toasts[toasts.length-1];t.key=k;t.n=n;t.until=performance.now()/1000+3;if(id!=='madeira'&&id!=='pedra')sfx('pick');}
let bannerUntil=0;
function banner(t,p){const b=$('banner');b.querySelector('h2').textContent=t;const pe=b.querySelector('p');pe.textContent=p||'';pe.style.display=p?'block':'none';b.style.display='block';b.style.opacity=1;bannerUntil=performance.now()/1000+7;}
const DIRS=['N','NE','L','SE','S','SO','O','NO'];
const WATER_PTS=[];for(let x=-HALF+30;x<HALF-30;x+=6)for(let z=-HALF+30;z<HALF-30;z+=6)if(H(x,z)<WATER-0.4)WATER_PTS.push([x,z]);
let waterHint='',waterTick=0;
function updateWaterHint(){let best=null,bd=1e9;for(const w of WATER_PTS){const d=(w[0]-P.x)**2+(w[1]-P.z)**2;if(d<bd){bd=d;best=w;}}
  if(!best){waterHint='';return;}const d=Math.sqrt(bd);if(d<8){waterHint='';return;}let a=Math.atan2(best[0]-P.x,-(best[1]-P.z))*180/Math.PI;if(a<0)a+=360;waterHint=`Água: ${DIRS[Math.round(a/45)%8]} ${Math.round(d)}m`;}
function renderHud(){const st=G.stats;
  const bar=(f,v,val)=>{$(f).style.width=clamp(val,0,100)+'%';$(v).textContent=Math.ceil(val);};
  bar('fHp','vHp',st.hp);bar('fFood','vFood',st.food);bar('fWater','vWater',st.water);bar('fStam','vStam',st.stam);
  const t=st.temp;$('fTemp').style.width=clamp((t+5)/45*100,0,100)+'%';$('fTemp').style.background=t<10?'var(--water)':t>30?'var(--hp)':'var(--amber)';$('vTemp').textContent=Math.round(t)+'°';
  const th=$('temphint');const msg=t<10?'Você está com frio. Fique perto de uma fogueira ou de um abrigo.':st.nearFire?'Aquecido pela fogueira':st.sheltered?'Protegido no abrigo':'';th.textContent=msg;th.style.display=msg?'block':'none';th.style.color=t<10?'var(--water)':'var(--muted)';
  let yaw=(-P.yaw*180/Math.PI)%360;if(yaw<0)yaw+=360;waterTick-=1;if(waterTick<=0){waterTick=30;updateWaterHint();}$('compass').textContent=`${DIRS[Math.round(yaw/45)%8]}  ·  ${Math.round(yaw)%360}°`+(waterHint&&G.stats.water<75?`   ·   ${waterHint}`:'');
  const hh=Math.floor(G.hour),mm=Math.floor((G.hour%1)*60);$('clock').innerHTML=`DIA ${G.day} · <em>${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}</em> · ${isNight()?'Noite':'Dia'}`;
  const pe=$('prompt');pe.textContent=prompt;pe.style.display=prompt&&G.state==='play'?'block':'none';
  $('cross').className=hitMarker>0?'hit':'';if(isTouch)$('cross').style.display='block';else{const c=$('cross').style;c.display=hitMarker>0?'block':'none';c.left=MOUSE.px+'px';c.top=MOUSE.py+'px';}
  if(!isTouch){pe.style.left=(MOUSE.px+20)+'px';pe.style.top=(MOUSE.py+20)+'px';pe.style.transform='none';pe.style.textAlign='left';}$('whoName').textContent=myName().toUpperCase();renderOnline();
  const bb=$('build');if(build.id&&G.state==='play'){bb.style.display='block';$('buildName').textContent=ITEMS[build.id].name;const c=build.cur;const ok=c&&c.has&&c.ok;
    $('buildSt').textContent=!c||!c.has?'Mire no chão para posicionar':ok?(isTouch?'CONSTRUIR para colocar':'[Clique] Construir')+(isGrid(build.id)?'':(isTouch?' · GIRAR':'   [R] Girar')):c.why;$('buildSt').style.color=ok?'var(--green)':'var(--red)';}else bb.style.display='none';
  renderHotbar();
  const pr=questProgress();$('eraFill').style.width=(pr*100)+'%';$('eraPct').textContent=`ERA I · ${Math.round(pr*100)}%`;
  const low=st.hp<25?0.12+Math.sin(performance.now()/250)*0.05:0;$('flash').style.opacity=Math.max(flash*0.6,low);
  const now=performance.now()/1000;for(let i=toasts.length-1;i>=0;i--){const tt=toasts[i];const left=tt.until-now;tt.el.style.opacity=clamp(left/0.6,0,1);if(left<=0){tt.el.remove();toasts.splice(i,1);}}
  if(bannerUntil){const left=bannerUntil-now;$('banner').style.opacity=clamp(left/1.2,0,1);if(left<=0){$('banner').style.display='none';bannerUntil=0;}}}

// ---------------- inventário e fabricação
let picked=-1,infoSlot=-1;
function buildInvGrid(){const mk=(parent,from)=>{parent.innerHTML='';for(let i=from;i<from+(from===0?8:24);i++){const el=document.createElement('div');el.className='slot';el.dataset.i=i;
  el.addEventListener('click',()=>invClick(i));el.addEventListener('contextmenu',e=>{e.preventDefault();eat(i);});parent.appendChild(el);}};mk($('gHot'),0);mk($('gBag'),8);}
buildInvGrid();
function invClick(i){if(picked<0){if(G.inv[i]){picked=i;infoSlot=i;}}else{if(picked!==i)invSwap(picked,i);picked=-1;infoSlot=i;}invDirty=true;refreshHeld();}
function renderInventory(){document.querySelectorAll('#inv .slot').forEach(el=>{const i=+el.dataset.i;el.className='slot'+(i===picked?' pick':'');el.innerHTML=slotHTML(i,G.inv[i],i<8);});
  const s=infoSlot>=0?G.inv[infoSlot]:null;const d=s?ITEMS[s.id]:null;const info=$('info');
  info.innerHTML=d?`<div><b>${d.name}</b><br>${d.desc}</div>`+(d.kind==='food'?`<button class="primary" id="eatBtn">Comer</button>`:''):'<div style="color:var(--muted)">Nenhum item selecionado.</div>';
  const eb=$('eatBtn');if(eb)eb.onclick=()=>{eat(infoSlot);};
  $('recList').innerHTML='';
  for(const [id,cost] of RECIPES){const d2=ITEMS[id];const can=Object.keys(cost).every(k=>invCount(k)>=cost[k]);const row=document.createElement('div');row.className='rec'+(can?' can':'');
    row.innerHTML=ico(d2)+`<div class="mid"><b style="color:${can?'var(--fg)':'var(--muted)'}">${d2.name}</b><div class="costs">${Object.keys(cost).map(k=>`<span class="${invCount(k)>=cost[k]?'ok':'no'}">${invCount(k)}/${cost[k]} ${ITEMS[k].name}</span>`).join('')}</div></div>`;
    const b=document.createElement('button');b.textContent='Fabricar';if(can)b.className='primary';b.disabled=!can;b.onclick=()=>craft(id,cost);row.appendChild(b);$('recList').appendChild(row);}
  invDirty=false;}
function craft(id,cost){if(!Object.keys(cost).every(k=>invCount(k)>=cost[k]))return;for(const k in cost)invRemove(k,cost[k]);
  if(invAdd(id,1)>0){for(const k in cost)invAdd(k,cost[k]);toast('Inventário cheio','var(--red)');return;}
  toast('Fabricado: '+ITEMS[id].name,'var(--cyan)');sfx('craft');if(id==='machado_pedra')questAdvance('machado',1);}
