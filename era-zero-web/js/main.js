'use strict';
// ======================================================================
//  Laço principal
// ======================================================================
let last=performance.now(),autosave=0,menuSpin=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(G.state==='play'){
    if(wasPressed('Escape'))setState('pause');else if(wasPressed('Tab')||wasPressed('KeyI'))setState('inv');if(wasPressed('KeyV'))toggleView();
    updateDay(dt);updatePlayer(dt);updateInteraction(dt);updateBuild();updateStats(dt);updateCreatures(dt);
    autosave+=dt;if(autosave>60){autosave=0;save(true);}
  }else{
    if(G.state==='inv'){if(wasPressed('Escape')||wasPressed('Tab')||wasPressed('KeyI'))setState('play');if(invDirty)renderInventory();}
    else if(G.state==='pause'&&wasPressed('Escape'))setState('play');
    if(G.state==='menu'){hand.visible=false;menuSpin+=dt*0.05;camera.position.set(Math.sin(menuSpin)*30,H(0,0)+14,Math.cos(menuSpin)*30);camera.lookAt(0,H(0,0)+4,0);applyDay();}
    else updatePlayer(0);
  }
  if(G.state==='dead'){updateDay(dt);updateCreatures(dt);}
  pressed.clear();
  // efeitos
  const t=now/1000;
  for(const n of nodes){if(n.shake>0){n.shake-=dt;}}
  for(let i=fallers.length-1;i>=0;i--){const f=fallers[i];f.life-=dt;if(f.ang<1.5){f.speed+=dt*2.8;const st2=Math.min(f.speed*dt,1.5-f.ang);f.g.rotateOnWorldAxis(f.axis,-st2);f.ang+=st2;}if(f.life<=0){chips(new THREE.Vector3(f.g.position.x+f.away.x*3,f.g.position.y+0.5,f.g.position.z+f.away.z*3),0x4d7333,14);scene.remove(f.g);fallers.splice(i,1);}}
  for(let i=chipList.length-1;i>=0;i--){const c=chipList[i];c.life-=dt;c.vy-=12*dt;c.c.position.x+=c.vx*dt;c.c.position.y+=c.vy*dt;c.c.position.z+=c.vz*dt;c.c.rotation.x+=dt*8;if(c.life<=0){scene.remove(c.c);chipList.splice(i,1);}}
  const nowS=performance.now()/1000;for(const n of nodes)if(!n.alive&&nowS>n.respawnAt){if(Math.hypot(n.x-P.x,n.z-P.z)<15||remoteDepleted(nodes.indexOf(n)))n.respawnAt=nowS+20;else respawnNode(n);}
  const fires=campfires().sort((a,b)=>Math.hypot(a.g.position.x-P.x,a.g.position.z-P.z)-Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z));
  fireLights.forEach((l,i)=>{const f=fires[i];if(f){l.position.set(f.g.position.x,f.g.position.y+0.9,f.g.position.z);l.intensity=2.2+noise(t*6,i*10)*1.2;}else l.intensity=0;});
  for(const f of fires){f.timer+=f.raw>0&&G.state==='play'?dt:0;if(f.raw>0&&f.timer>=6){f.timer=0;f.raw--;f.cooked++;}(f.g.userData.flames||[]).forEach((c,i)=>{const nn=noise(t*7+i*3.1,i);c.scale.set(1,0.7+nn*0.7,1);c.rotation.y=t*2+i;});}
  for(const pk of pickups)if(pk.led)pk.led.visible=(t%1.2)<0.6;
  if(flash>0)flash=Math.max(0,flash-dt);if(hitMarker>0)hitMarker-=dt;
  U_TIME.value=t;WATER_NORMAL.offset.set(t*0.006,t*0.004);
  updateGrass();updateSky(dt);updateSparks(dt,fires);updateRemote(dt);netSend();
  if(G.state!=='menu'&&G.state!=='loading')renderHud();
  renderer.render(scene,camera);}

// início
applyDay();renderQuests();refreshHeld();
$('loading').style.display='none';
setState('menu');
requestAnimationFrame(frame);
window.__eraZero={G,P,nodes,creatures,pieces,setState,newGame,give:(id,n)=>invAdd(id,n),H,camera,NET,VIEW,MOUSE,upsertPeerForTest:upsertPeer};
netInit();cloudInit();window.__eraZero.ready=true;
