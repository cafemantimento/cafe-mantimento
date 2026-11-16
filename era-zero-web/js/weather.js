'use strict';
// ======================================================================
//  Clima, biomas atuais, descobertas, música e sons de ambiente
// ======================================================================
const W_DEF={
  limpo:{name:'Céu limpo',fog:1,cloud:0.85,sun:1,temp:0,rain:0,snow:0,sand:0,wind:0.25},
  nublado:{name:'Nublado',fog:1.35,cloud:1.5,sun:0.6,temp:-2,rain:0,snow:0,sand:0,wind:0.45},
  chuva:{name:'Chuva',fog:1.5,cloud:1.8,sun:0.35,temp:-4,rain:0.65,snow:0,sand:0,wind:0.55},
  tempestade:{name:'Tempestade',fog:1.9,cloud:2,sun:0.18,temp:-6,rain:1,snow:0,sand:0,wind:1,lightning:1},
  neblina:{name:'Neblina',fog:2.8,cloud:1.2,sun:0.55,temp:-2,rain:0,snow:0,sand:0,wind:0.1},
  neve:{name:'Neve',fog:1.4,cloud:1.6,sun:0.5,temp:-5,rain:0,snow:0.55,sand:0,wind:0.45},
  nevasca:{name:'Nevasca',fog:3,cloud:2,sun:0.3,temp:-10,rain:0,snow:1,sand:0,wind:1},
  areia:{name:'Tempestade de areia',fog:2.8,cloud:0.8,sun:0.6,temp:2,rain:0,snow:0,sand:1,wind:1},
};
const WEATHER={type:'limpo',f:Object.assign({},W_DEF.limpo),timer:90,flash:0,biome:'temperada',biomeTick:0,poiTick:0};
function rollWeather(biome){const w=(BIOME_INFO[biome]||BIOME_INFO.temperada).weather;let tot=0;for(const k in w)tot+=w[k];let r=Math.random()*tot;for(const k in w){if(r<w[k])return k;r-=w[k];}return 'limpo';}
function setWeather(t){if(!W_DEF[t])return;if(t!==WEATHER.type&&G.state==='play'&&t!=='limpo')toast(W_DEF[t].name,'var(--muted)');WEATHER.type=t;WEATHER.timer=150+Math.random()*200;}
// partículas: chuva, neve e areia (em volta da câmera)
const RAIN_N=isTouch?900:2200,SNOW_N=isTouch?1200:2600;
const rainGeo=new THREE.BufferGeometry();const rainPos=new Float32Array(RAIN_N*6);rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xaabbcc,transparent:true,opacity:0.45,fog:true}));rain.frustumCulled=false;scene.add(rain);
for(let i=0;i<RAIN_N;i++){const x=(Math.random()-0.5)*60,y=Math.random()*30,z=(Math.random()-0.5)*60;rainPos.set([x,y,z,x,y-0.8,z],i*6);}
const snowGeo=new THREE.BufferGeometry();const snowPos=new Float32Array(SNOW_N*3);snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const snowMat=new THREE.PointsMaterial({color:0xffffff,size:0.12,transparent:true,opacity:0.9});const snow=new THREE.Points(snowGeo,snowMat);snow.frustumCulled=false;scene.add(snow);
for(let i=0;i<SNOW_N;i++)snowPos.set([(Math.random()-0.5)*60,Math.random()*30,(Math.random()-0.5)*60],i*3);
let rainOrigin=new THREE.Vector3();
function updateParticles(dt){const f=WEATHER.f,cp=camera.position;const off=P.cave;
  rain.visible=!off&&f.rain>0.02;snow.visible=!off&&(f.snow>0.02||f.sand>0.02);
  if(rain.visible){rain.material.opacity=0.45*f.rain;const n=Math.floor(RAIN_N*f.rain);
    for(let i=0;i<RAIN_N;i++){const o=i*6;if(i>n){rainPos[o+1]=rainPos[o+4]=-999;continue;}let y=rainPos[o+1]-dt*24;let x=rainPos[o],z=rainPos[o+2];
      if(y<cp.y-8||y<-500){y=cp.y+14+Math.random()*10;x=cp.x+(Math.random()-0.5)*60;z=cp.z+(Math.random()-0.5)*60;}
      const wx=f.wind*dt*3;x+=wx;rainPos[o]=x;rainPos[o+1]=y;rainPos[o+2]=z;rainPos[o+3]=x-f.wind*0.3;rainPos[o+4]=y-0.9;rainPos[o+5]=z;}
    rainGeo.attributes.position.needsUpdate=true;}
  if(snow.visible){const sand=f.sand>f.snow;snowMat.color.set(sand?0xd8b070:0xffffff);snowMat.size=sand?0.08:0.12;snowMat.opacity=0.9*Math.max(f.snow,f.sand);const n=Math.floor(SNOW_N*Math.max(f.snow,f.sand));
    for(let i=0;i<SNOW_N;i++){const o=i*3;if(i>n){snowPos[o+1]=-999;continue;}let x=snowPos[o],y=snowPos[o+1],z=snowPos[o+2];
      y-=dt*(sand?0.6:1.4);x+=dt*(sand?14:f.wind*3)+Math.sin(y*0.7+i)*dt*0.4;z+=Math.cos(x*0.3+i)*dt*0.3;
      if(y<cp.y-6||y<-500||Math.abs(x-cp.x)>32||Math.abs(z-cp.z)>32){y=cp.y+Math.random()*22;x=cp.x+(Math.random()-0.5)*60;z=cp.z+(Math.random()-0.5)*60;}
      snowPos[o]=x;snowPos[o+1]=y;snowPos[o+2]=z;}snowGeo.attributes.position.needsUpdate=true;}}
// ---------------- atualização geral
function updateWeather(dt){const W=WEATHER;
  // bioma atual e descobertas
  W.biomeTick-=dt;if(W.biomeTick<=0){W.biomeTick=0.5;const b=P.cave?'caverna':biomeAt(P.x,P.z);
    if(b!==W.biome){W.biome=b;if(G.state==='play'){markDiscovered(b);const ok=!P.cave&&((BIOME_INFO[b]||{}).weather||{})[W.type];if(!P.cave&&(!ok||Math.random()<0.5))setWeather(rollWeather(b));}playMusic(BIOME_INFO[b].music);}
    W.poiTick-=0.5;if(W.poiTick<=0&&G.state==='play'){W.poiTick=2;for(const p of POIS){if(!G.discovered['poi_'+p.id]&&Math.hypot(P.x-p.x,P.z-p.z)<26&&!P.cave){G.discovered['poi_'+p.id]=1;toast('Local descoberto: '+p.name,'var(--amber)');sfx('discover');}}}}
  // troca de clima
  W.timer-=dt;if(W.timer<=0)setWeather(rollWeather(W.biome==='caverna'?'temperada':W.biome));
  let target=W_DEF[P.cave?'limpo':W.type];
  // neblina da manhã em florestas e no pântano
  const morning=G.hour>4.5&&G.hour<8.5&&['temperada','pantano','tropical'].includes(W.biome)&&(W.type==='limpo'||W.type==='nublado');
  const k=Math.min(1,dt*0.12);for(const key in W.f){if(key==='name')continue;const tv=(target[key]||0)*(key==='fog'&&morning?2.4:1);W.f[key]=lerp(W.f[key]||0,tv,k);}
  // relâmpagos
  if(W.f.lightning>0.5&&!P.cave&&Math.random()<dt*0.06){W.flash=1;const d=1+Math.random()*2.5;setTimeout(()=>sfx('thunder',{vol:0.5+Math.random()*0.5}),d*1000);}
  W.flash=Math.max(0,W.flash-dt*3);
  updateParticles(dt);updateAmbience(dt);}
function markDiscovered(b){if(!b||G.discovered[b])return;G.discovered[b]=1;PROFILE.biomes[b]=1;saveProfile();
  if(G.state==='play'&&b!=='temperada')banner('NOVO BIOMA: '+BIOME_INFO[b].name.toUpperCase(),b==='caverna'?'Cristais, minérios e segredos no subsolo.':'Explore para encontrar recursos, animais e segredos próprios desta região.');
  if(b==='caverna'){questAdvance('caverna',1);unlockAch('caverna');}else questAdvance('biomas',1);
  const surf=Object.keys(PROFILE.biomes).filter(k=>k!=='caverna').length;if(surf>=3)unlockAch('biomas3');if(surf>=7)unlockAch('biomas7');}
// temperatura do lugar: depende do bioma, da hora e do clima
function biomeTemp(day){const b=P.cave?'caverna':WEATHER.biome;const i=BIOME_INFO[b]||BIOME_INFO.temperada;const alt=P.cave?0:Math.max(0,(P.y-35)*0.15);return lerp(i.tmin,i.tmax,day)+WEATHER.f.temp-alt;}

// ---------------- sons de ambiente (gerados no navegador)
const AMB={ready:false};
function ambInit(){if(AMB.ready||!AC)return;AMB.ready=true;const mk=(type,freq,q)=>{const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||0.7;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(BUS.amb);s.start();return {g,f};};
  AMB.wind=mk('lowpass',420,0.5);AMB.rain=mk('highpass',1800,0.4);AMB.river=mk('bandpass',900,0.6);AMB.waves=mk('lowpass',300,0.4);AMB.t=0;AMB.bird=3;AMB.night=2;}
function updateAmbience(dt){if(!AC||!BUS)return;ambInit();const f=WEATHER.f,b=WEATHER.biome,t=AC.currentTime;const play=G.state==='play'||G.state==='inv';const on=play&&!P.cave?1:0;
  const set=(n,v)=>AMB[n].g.gain.setTargetAtTime(v,t,0.6);
  set('wind',on*(0.04+f.wind*0.22+(b==='neve'?0.08:0)+Math.max(0,(P.y-40)*0.003)));set('rain',on*f.rain*0.35);
  set('river',on*clamp(1-riverDist(P.x,P.z)/26,0,1)*0.22);set('waves',on*(b==='ilhas'?0.25:0)*(0.6+Math.sin(t*0.5)*0.4));
  if(P.cave&&play){AMB.drip=(AMB.drip||2)-dt;if(AMB.drip<0){AMB.drip=1.5+Math.random()*3;animalVoice('drip',0.5);}}
  if(!on)return;
  const night=isNight();AMB.bird-=dt;AMB.night-=dt;
  if(!night&&AMB.bird<0&&f.rain<0.3&&['temperada','tropical','savana','ilhas','pantano'].includes(b)){AMB.bird=1.5+Math.random()*(b==='tropical'?2:5);animalVoice(b==='tropical'&&Math.random()<0.4?'tropicalbird':'chirp',0.25+Math.random()*0.3);}
  if(night&&AMB.night<0){AMB.night=0.8+Math.random()*2;animalVoice(b==='pantano'?'croak':'cricket',0.2+Math.random()*0.15);}}
