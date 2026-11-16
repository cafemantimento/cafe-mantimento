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

function hexA(hex,a){const c=new THREE.Color(hex);return `rgba(${Math.round(c.r*255*0.75)},${Math.round(c.g*255*0.75)},${Math.round(c.b*255*0.75)},${a+0.35})`;}
function slotHTML(i,s,withKey){const d=s?ITEMS[s.id]:null;return (withKey?`<span class="k">${i+1}</span>`:'')+(d?ico(d)+(d.max>1?`<span class="n">${s.n}</span>`:''):'');}
const hot=$('hotbar');for(let i=0;i<8;i++){const el=document.createElement('div');el.className='slot';el.addEventListener('click',()=>selectSlot(i));el.addEventListener('touchstart',e=>{e.preventDefault();selectSlot(i);},{passive:false});hot.appendChild(el);}
let lastHot='';
function renderHotbar(){const key=G.sel+'|'+G.inv.slice(0,8).map(s=>s?s.id+s.n:'').join(',');if(key===lastHot)return;lastHot=key;
  [...hot.children].forEach((el,i)=>{el.className='slot'+(i===G.sel?' sel':'');el.innerHTML=slotHTML(i,G.inv[i],true);});
  const d=selDef();$('selname').textContent=d?d.name.toUpperCase():'MÃOS LIVRES';}
const toasts=[];
function toast(text,color){const el=document.createElement('div');el.className='panel toast';el.style.borderLeftColor=color||'var(--cyan)';el.style.color=color&&color!=='var(--muted)'?color:'var(--fg)';el.textContent=text;$('toasts').appendChild(el);
  toasts.push({el,until:performance.now()/1000+4.5});if(toasts.length>6){toasts[0].el.remove();toasts.shift();}}
function toastGather(id,n){const k='g_'+id;const ex=toasts.find(t=>t.key===k);if(ex){ex.n+=n;ex.el.textContent=`+${ex.n} ${ITEMS[id].name}`;ex.until=performance.now()/1000+3;return;}
  toast(`+${n} ${ITEMS[id].name}`,'var(--cyan)');const t=toasts[toasts.length-1];t.key=k;t.n=n;t.until=performance.now()/1000+3;if(id!=='madeira'&&id!=='pedra')sfx('pick');}
let bannerUntil=0;
function banner(t,p){const b=$('banner');b.querySelector('h2').textContent=t;const pe=b.querySelector('p');pe.textContent=p||'';pe.style.display=p?'block':'none';b.style.display='block';b.style.opacity=1;bannerUntil=performance.now()/1000+7;}
const DIRS=['N','NE','L','SE','S','SO','O','NO'];
function dirTo(x,z){let a=Math.atan2(x-P.x,-(z-P.z))*180/Math.PI;if(a<0)a+=360;return `${DIRS[Math.round(a/45)%8]} ${Math.round(Math.hypot(x-P.x,z-P.z))}m`;}
const WATER_PTS=[];for(let x=-HALF+30;x<HALF-30;x+=6)for(let z=-HALF+30;z<HALF-30;z+=6)if(H(x,z)<WATER-0.4)WATER_PTS.push([x,z]);
let waterHint='',waterTick=0;
function updateWaterHint(){let best=null,bd=1e9;for(const w of WATER_PTS){const d=(w[0]-P.x)**2+(w[1]-P.z)**2;if(d<bd){bd=d;best=w;}}
  if(!best){waterHint='';return;}const d=Math.sqrt(bd);if(d<8){waterHint='';return;}let a=Math.atan2(best[0]-P.x,-(best[1]-P.z))*180/Math.PI;if(a<0)a+=360;waterHint=`Água: ${DIRS[Math.round(a/45)%8]} ${Math.round(d)}m`;}
function renderHud(){const st=G.stats;
  const bar=(f,v,val)=>{$(f).style.width=clamp(val,0,100)+'%';$(v).textContent=Math.ceil(val);};
  bar('fHp','vHp',st.hp);bar('fFood','vFood',st.food);bar('fWater','vWater',st.water);bar('fStam','vStam',st.stam);
  const t=st.temp;$('fps').style.display=SETTINGS.fps?'block':'none';if(SETTINGS.fps)$('fps').textContent=fpsV+' FPS';
  $('biomeLbl').textContent=(BIOME_INFO[WEATHER.biome]||BIOME_INFO.temperada).name+(P.cave?'':' · '+W_DEF[WEATHER.type].name);
  $('tDrink').style.display=isTouch&&EFX().canteen?'flex':'none';
  $('fTemp').style.width=clamp((t+5)/45*100,0,100)+'%';$('fTemp').style.background=t<10?'var(--water)':t>30?'var(--hp)':'var(--amber)';$('vTemp').textContent=Math.round(t)+'°';
  const th=$('temphint');const msg=t<10?(t<0?'Congelando! Fogueira, abrigo ou um casaco de pele.':'Você está com frio. Fique perto de uma fogueira ou de um abrigo.'):t>34?'Calor forte: a sede aumenta rápido.':st.nearFire?'Aquecido pela fogueira':st.sheltered?'Protegido no abrigo':'';th.textContent=msg;th.style.display=msg?'block':'none';th.style.color=t<10?'var(--water)':'var(--muted)';
  let yaw=(-P.yaw*180/Math.PI)%360;if(yaw<0)yaw+=360;waterTick-=1;if(waterTick<=0){waterTick=30;updateWaterHint();}let extra='';const tr=treasureAt();if(tr)extra=`   ·   Tesouro: ${dirTo(tr.x,tr.z)}`;else if(EFX().compass&&!P.cave){let bp=null,bd=1e9;for(const p of POIS){if(G.discovered['poi_'+p.id])continue;const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;bp=p;}}if(bp)extra=`   ·   ${bp.name}: ${dirTo(bp.x,bp.z)}`;}
  if(!extra&&waterHint&&G.stats.water<75&&!P.cave)extra=`   ·   ${waterHint}`;$('compass').textContent=`${DIRS[Math.round(yaw/45)%8]}  ·  ${Math.round(yaw)%360}°`+extra;
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
