'use strict';
// ======================================================================
//  Laço principal
// ======================================================================
let last=performance.now(),autosave=0,menuSpin=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(G.state==='play'){
    if(wasPressed('Escape'))setState('pause');else if(wasPressed('Tab')||wasPressed('KeyI'))setState('inv');if(wasPressed('KeyV'))toggleView();
    updateDay(dt);updatePlayer(dt);updateInteraction(dt);updateBuild();updateStats(dt);updateCreatures(dt);updateEvents(dt);modeTick(dt);
    autosave+=dt;if(autosave>60){autosave=0;save(true);}
  }else{
    if(G.state==='inv'){if(wasPressed('Escape')||wasPressed('Tab')||wasPressed('KeyI'))setState('play');if(invDirty)renderInventory();}
    else if(G.state==='pause'&&wasPressed('Escape'))setState('play');
    const menuLike=['menu','modes','settings','profile','achv'].includes(G.state)&&SETTINGS_FROM!=='pause';if(menuLike||G.state==='loading')hand.visible=false;
    if(menuLike){menuSpin+=dt*0.05;camera.position.set(Math.sin(menuSpin)*30,H(0,0)+14,Math.cos(menuSpin)*30);camera.lookAt(0,H(0,0)+4,0);applyDay();}
    else updatePlayer(0);
  }
  if(G.state==='dead'){updateDay(dt);updateCreatures(dt);}
  if(G.state==='play'||G.state==='inv'||G.state==='pause'||G.state==='dead')updateWeather(dt);else updateParticles(0);
  updateVegVisibility(dt);updateMusic();updateLights();updateForges(dt);
  pressed.clear();
  // efeitos
  const t=now/1000;
  for(const n of nodes){if(n.shake>0){n.shake-=dt;}}
  for(let i=fallers.length-1;i>=0;i--){const f=fallers[i];f.life-=dt;if(f.ang<1.5){f.speed+=dt*2.8;const st2=Math.min(f.speed*dt,1.5-f.ang);f.g.rotateOnWorldAxis(f.axis,-st2);f.ang+=st2;}if(f.life<=0){chips(new THREE.Vector3(f.g.position.x+f.away.x*3,f.g.position.y+0.5,f.g.position.z+f.away.z*3),0x4d7333,14);scene.remove(f.g);fallers.splice(i,1);}}
  for(let i=chipList.length-1;i>=0;i--){const c=chipList[i];c.life-=dt;c.vy-=12*dt;c.c.position.x+=c.vx*dt;c.c.position.y+=c.vy*dt;c.c.position.z+=c.vz*dt;c.c.rotation.x+=dt*8;if(c.life<=0){scene.remove(c.c);chipList.splice(i,1);}}
  const nowS=performance.now()/1000;if((nowS*2|0)%2===0)for(const n of nodes)if(!n.alive&&nowS>n.respawnAt){if(Math.hypot(n.x-P.x,n.z-P.z)<15||remoteDepleted(nodes.indexOf(n)))n.respawnAt=nowS+20;else respawnNode(n);}
  const fires=campfires().sort((a,b)=>Math.hypot(a.g.position.x-P.x,a.g.position.z-P.z)-Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z));
  fireLights.forEach((l,i)=>{const f=fires[i];if(f){l.position.set(f.g.position.x,f.g.position.y+0.9,f.g.position.z);l.intensity=2.2+noise(t*6,i*10)*1.2;}else l.intensity=0;});
  for(const f of fires){f.timer+=f.raw>0&&G.state==='play'?dt:0;if(f.raw>0&&f.timer>=6){f.timer=0;f.raw--;f.cooked++;}(f.g.userData.flames||[]).forEach((c,i)=>{const nn=noise(t*7+i*3.1,i);c.scale.set(1,0.7+nn*0.7,1);c.rotation.y=t*2+i;});}
  for(const pk of pickups)if(pk.led)pk.led.visible=(t%1.2)<0.6;
  if(flash>0)flash=Math.max(0,flash-dt);if(hitMarker>0)hitMarker-=dt;
  U_TIME.value=t;WATER_NORMAL.offset.set(t*0.006,t*0.004);
  updateGrass();updateSky(dt);updateSparks(dt,fires);updateRemote(dt);netSend();
  if(!['menu','loading','modes','settings','profile','achv'].includes(G.state))renderHud();
  fpsN++;if(now-fpsT>1000){fpsV=fpsN;fpsN=0;fpsT=now;}
  renderer.render(scene,camera);}

let fpsN=0,fpsT=0,fpsV=0;
// forja: funde minério com o tempo
function updateForges(dt){if(G.state!=='play')return;for(const f of forges()){const q=f.ore.cobre+f.ore.ferro;if(!q){f.timer=0;continue;}f.timer+=dt;if(f.timer>=8){f.timer=0;const k=f.ore.cobre?'cobre':'ferro';f.ore[k]--;f.ingots[k]++;}}}
// carrega os modelos dos animais (Quaternius, CC0)
function loadAnimals(onP){if(!THREE.GLTFLoader)return Promise.resolve();const names=['Deer','Stag','Fox','Wolf','Alpaca','Horse','Bull'];let done=0;const L=new THREE.GLTFLoader();
  return Promise.all(names.map(n=>new Promise(res=>{L.load('assets/animals/'+n+(IN_CLAUDE?'.gltf.json':'.glb'),gl=>{const box=new THREE.Box3().setFromObject(gl.scene);GLTF_ANIMALS[n]={scene:gl.scene,clips:gl.animations,height:Math.max(0.1,box.max.y-box.min.y)};done++;onP(done/names.length);res();},undefined,()=>{done++;onP(done/names.length);res();});})));}
// nas páginas do Claude os modelos vão em JSON (o Claude não serve arquivos binários)
const IN_CLAUDE=!!(window.claude&&window.claude.use);
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
async function boot(){
  setLoading(0.05,'Gerando o relevo do Vale…');await nextFrame();applyQuality();
  setLoading(0.2,'Carregando árvores, pedras e plantas…');
  try{const [bin,info]=await Promise.all([IN_CLAUDE?fetch('assets/nature/nature_pack.b64.json').then(r=>r.json()).then(j=>{const s=atob(j.b64);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}):fetch('assets/nature/nature_pack.bin').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}),fetch('assets/nature/nature_pack.json').then(r=>r.json())]);decodeNature(bin,info);}catch(e){console.warn('Pacote da natureza indisponível; usando modelos simples');}
  setLoading(0.4,'Carregando os animais…');await loadAnimals(p=>setLoading(0.4+p*0.4,'Carregando os animais…'));
  setLoading(0.85,'Espalhando a vida pelo Vale…');await nextFrame();populateWorld();
  setLoading(1,'Pronto');await nextFrame();
  applyDay();renderQuests();refreshHeld();$('loading').style.display='none';setState('menu');requestAnimationFrame(frame);
  window.__eraZero={updateForges,updateEvents,hitNode,hitCreature,openChest,chests,interactables,useTreasureMap,treasureAt,digTreasure,startMeteor,EVENT,pieces,placePiece,forges,ITEMS,QUALITY,SETTINGS,applyQuality,serialize,G,P,nodes,creatures,pieces,setState,newGame,load,save,give:(id,n)=>invAdd(id,n),H,camera,NET,VIEW,MOUSE,WEATHER,SPECIES,makeCreature,biomeAt,POIS,CAVES,enterCave,exitCave,setWeather,unlockAch,PROFILE:()=>PROFILE,EFX,equipItem,upsertPeerForTest:upsertPeer};
  netInit();cloudInit();registerSW();window.__eraZero.ready=true;}
// ---------------- versão instalável: offline, atualizações e botão de instalar
function standalone(){return /^https?:$/.test(location.protocol)&&!(window.claude&&window.claude.use)&&!!document.querySelector('link[rel=manifest]');}
function registerSW(){if(!('serviceWorker' in navigator)||!standalone())return;
  navigator.serviceWorker.register('sw.js').then(reg=>{const watch=w=>w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate(w);});
    if(reg.waiting&&navigator.serviceWorker.controller)showUpdate(reg.waiting);reg.addEventListener('updatefound',()=>watch(reg.installing));setInterval(()=>reg.update().catch(()=>{}),30*60*1000);}).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!wantReload)return;wantReload=false;location.reload();});}
let wantReload=false;
function showUpdate(w){$('updBar').style.display='block';$('bUpd').onclick=()=>{if(G.state==='play'||G.state==='pause'||G.state==='inv')save(true);wantReload=true;setTimeout(()=>w.postMessage('skip'),300);};}
let installEvt=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$('bInstall').style.display='block';});
$('bInstall').onclick=async()=>{if(!installEvt)return;installEvt.prompt();try{await installEvt.userChoice;}catch(e){}installEvt=null;$('bInstall').style.display='none';};

boot();
