'use strict';
// ======================================================================
//  Configurações (qualidade gráfica, volumes, sensibilidade)
// ======================================================================
const SETTINGS_KEY='erazero_settings_v1';
const SETTINGS=Object.assign({quality:matchMedia('(pointer: coarse)').matches?'baixo':'medio',master:0.9,music:0.45,sfx:0.9,amb:0.7,sens:1,fps:false},
  (()=>{try{return JSON.parse(localStorage.getItem(SETTINGS_KEY))||{};}catch(e){return {};}})());
const QPROFILES={
  baixo:{label:'Baixo',pr:1,shadow:1024,treeDist:170,rockDist:110,decorDist:45,grass:0.45,animals:20,far:420,lod:2,fog:1.25},
  medio:{label:'Médio',pr:1.25,shadow:2048,treeDist:260,rockDist:160,decorDist:70,grass:0.75,animals:32,far:650,lod:1,fog:1},
  alto:{label:'Alto',pr:1.5,shadow:2048,treeDist:380,rockDist:220,decorDist:95,grass:1,animals:42,far:900,lod:1,fog:0.85},
  ultra:{label:'Ultra',pr:2,shadow:4096,treeDist:520,rockDist:300,decorDist:120,grass:1.25,animals:55,far:1200,lod:1,fog:0.7},
};
function QUALITY(){return QPROFILES[SETTINGS.quality]||QPROFILES.medio;}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(SETTINGS));}catch(e){}}
let terrainLod=0;
function applyQuality(){const q=QUALITY();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,q.pr));
  sun.shadow.mapSize.set(q.shadow,q.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
  camera.far=q.far;camera.updateProjectionMatrix();resize();const ss=Math.min(1,q.far*0.88/600);sky.scale.setScalar(ss);stars.scale.setScalar(ss);
  if(terrainLod!==q.lod){buildTerrain(q.lod);terrainLod=q.lod;}
  vegTick=0;grassCX=1e9;}
