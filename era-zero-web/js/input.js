'use strict';
// ======================================================================
//  Entrada (teclado, mouse e toque)
// ======================================================================
const keys={};let mouseL=false,lookDX=0,lookDY=0,locked=false,lockFailed=false;
const pressed=new Set();const press=k=>pressed.add(k);const wasPressed=k=>pressed.has(k);
addEventListener('keydown',e=>{if(e.code==='Tab'||e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();if(!keys[e.code])press(e.code);keys[e.code]=true;audioInit();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouseL=false;});
const MOUSE={x:0,y:0,px:0,py:0,in:false,rdrag:false};
canvas.addEventListener('mousedown',e=>{audioInit();if(G.state!=='play')return;canvas.focus();
  if(e.button===0)mouseL=true,press('Mouse0');if(e.button===2)MOUSE.rdrag=true;});
canvas.addEventListener('mouseenter',()=>{MOUSE.in=true;});canvas.addEventListener('mouseleave',()=>{MOUSE.in=false;});
addEventListener('mouseup',e=>{if(e.button===0)mouseL=false;if(e.button===2)MOUSE.rdrag=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
let lockAt=0;
addEventListener('mousemove',e=>{if(isTouch)return;MOUSE.px=e.clientX;MOUSE.py=e.clientY;MOUSE.x=e.clientX/innerWidth*2-1;MOUSE.y=-(e.clientY/innerHeight*2-1);MOUSE.in=true;
  if(G.state!=='play')return;const mx=e.movementX||0,my=e.movementY||0;if(Math.abs(mx)>200||Math.abs(my)>200)return;if(MOUSE.rdrag){lookDX+=mx;lookDY+=my;}});
addEventListener('wheel',e=>{if(G.state!=='play')return;selectSlot((G.sel+(e.deltaY>0?1:7))%8);},{passive:true});
function requestLock(){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{lockFailed=true;});}catch(err){lockFailed=true;}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;lockAt=performance.now();});
document.addEventListener('pointerlockerror',()=>{lockFailed=true;});

// toque
const joy={id:null,ox:0,oy:0,x:0,y:0},look={id:null,lx:0,ly:0};let touchAtk=false,touchRun=false;
canvas.addEventListener('touchstart',e=>{audioInit();for(const t of e.changedTouches){if(t.clientX<innerWidth*0.42&&joy.id===null){joy.id=t.identifier;joy.ox=t.clientX;joy.oy=t.clientY;joy.x=0;joy.y=0;const j=$('joy');j.style.display='block';j.style.left=t.clientX+'px';j.style.top=t.clientY+'px';}
  else if(look.id===null){look.id=t.identifier;look.lx=t.clientX;look.ly=t.clientY;}}e.preventDefault();},{passive:false});
canvas.addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===joy.id){let dx=t.clientX-joy.ox,dy=t.clientY-joy.oy;const d=Math.hypot(dx,dy),m=55;if(d>m){dx*=m/d;dy*=m/d;}joy.x=dx/m;joy.y=dy/m;$('joy').firstChild.style.transform=`translate(${dx}px,${dy}px)`;}
  else if(t.identifier===look.id){lookDX+=(t.clientX-look.lx)*1.6;lookDY+=(t.clientY-look.ly)*1.6;look.lx=t.clientX;look.ly=t.clientY;}}e.preventDefault();},{passive:false});
const endTouch=e=>{for(const t of e.changedTouches){if(t.identifier===joy.id){joy.id=null;joy.x=joy.y=0;$('joy').style.display='none';$('joy').firstChild.style.transform='';}if(t.identifier===look.id)look.id=null;}};
canvas.addEventListener('touchend',endTouch);canvas.addEventListener('touchcancel',endTouch);
function holdBtn(id,on,off){const b=$(id);b.addEventListener('touchstart',e=>{e.preventDefault();audioInit();b.classList.add('on');on();},{passive:false});
  const up=e=>{e.preventDefault();b.classList.remove('on');if(off)off();};b.addEventListener('touchend',up);b.addEventListener('touchcancel',up);
  b.addEventListener('mousedown',e=>{e.preventDefault();on();});b.addEventListener('mouseup',()=>{if(off)off();});}
holdBtn('tAtk',()=>{touchAtk=true;press('Mouse0');},()=>{touchAtk=false;});
holdBtn('tJump',()=>press('Space'));
holdBtn('tUse',()=>press('KeyE'));
holdBtn('tEat',()=>press('KeyF'));
holdBtn('tRot',()=>press('KeyR'));
holdBtn('tDem',()=>press('KeyX'));
$('tRun').addEventListener('touchstart',e=>{e.preventDefault();touchRun=!touchRun;$('tRun').classList.toggle('on',touchRun);},{passive:false});
$('tInv').addEventListener('click',()=>setState('inv'));
$('tCam').addEventListener('click',()=>toggleView());
$('tDrink').addEventListener('click',()=>drinkCanteen());
$('tPause').addEventListener('click',()=>setState('pause'));
function updateTouchContext(){const d=selDef();$('tEat').style.display=d&&d.kind==='food'?'flex':'none';$('tRot').style.display=build.id&&!isGrid(build.id)?'flex':'none';$('tAtk').textContent=build.id?'CONSTRUIR':'GOLPEAR';}
