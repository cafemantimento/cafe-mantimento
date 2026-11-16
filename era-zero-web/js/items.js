'use strict';
// ======================================================================
//  Itens novos, raridade, equipamentos, baús, tesouros, eventos e conquistas
// ======================================================================
const RARITY=[{name:'Comum',color:'#a3adb6'},{name:'Incomum',color:'#5fd06a'},{name:'Raro',color:'#4da6ff'},{name:'Épico',color:'#b26bff'},{name:'Lendário',color:'#ffb547'},{name:'Mítico',color:'#ff5fa2'}];
const EQUIP_SLOTS={mochila:'Mochila',botas:'Botas',amuleto:'Amuleto',acessorio:'Acessório',roupa:'Roupa'};
// recursos da Era II e do mundo novo
item('minerio_cobre','Minério de Cobre','CU','#d08050','res',{rarity:1,desc:'Veios alaranjados nas montanhas, no deserto e nas cavernas. Precisa de picareta. Funda na forja.'});
item('minerio_ferro','Minério de Ferro','FE','#9a7a70','res',{rarity:1,desc:'Veios avermelhados nas montanhas nevadas e nas cavernas. Precisa de picareta. Funda na forja.'});
item('lingote_cobre','Lingote de Cobre','LCU','#e08a50','res',{rarity:1,desc:'Feito na forja. Base de lampiões, baús e peças da Era II.'});
item('lingote_ferro','Lingote de Ferro','LFE','#b0b4bc','res',{rarity:1,desc:'Feito na forja. Ferramentas de ferro são muito mais eficientes.'});
item('cristal','Cristal da Caverna','CRI','#7fe8ff','res',{rarity:2,desc:'Brilha sozinho. Só existe nas cavernas subterrâneas.'});
item('fragmento_meteoro','Fragmento de Meteoro','MET','#ff7a3a','res',{rarity:3,max:20,desc:'Caiu do céu numa chuva de meteoros. Metal raro, quente ao toque.'});
item('coco','Coco','COC','#8a5a2a','food',{max:30,hunger:10,thirst:16,hp:0,desc:'Dos coqueiros das ilhas e da selva. Mata a fome e a sede.'});
item('polpa_cacto','Polpa de Cacto','CAC','#7ab85a','food',{max:30,hunger:3,thirst:14,hp:-1,desc:'Água no meio do deserto. Os espinhos machucam um pouco.'});
item('peixe_assado','Peixe Assado','PXA','#d0905a','food',{max:30,hunger:30,thirst:4,hp:6,desc:'Leve e nutritivo.'});
item('peixe_cru','Peixe Cru','PXC','#9ab8d0','food',{max:30,hunger:8,thirst:2,hp:-3,desc:'Asse na fogueira antes de comer.'});
// ferramentas e peças da Era II
item('machado_ferro','Machado de Ferro','MFE','#b0b4bc','tool',{max:1,tool:'axe',dmg:30,eff:1.6,rarity:1,desc:'Corta árvores muito mais rápido que o de pedra.'});
item('picareta_ferro','Picareta de Ferro','PFE','#b0b4bc','tool',{max:1,tool:'pick',dmg:28,eff:1.6,rarity:1,desc:'Quebra pedra e metal muito mais rápido.'});
item('picareta_cristal','Picareta de Cristal','PCR','#7fe8ff','tool',{max:1,tool:'pick',dmg:32,eff:2.0,rarity:5,glow:true,desc:'Mítica. Brilha no escuro e tira o dobro de cristais. Rara de encontrar.'});
item('tocha','Tocha','TOC','#ffb547','tool',{max:1,tool:'torch',dmg:8,light:12,desc:'Segure para iluminar a noite e as cavernas.'});
item('forja','Forja','FOR','#5fe1ff','piece',{max:5,era:2,desc:'Funde minério em lingotes. Coloque o minério com E e espere.'});
item('bau','Baú','BAU','#5fe1ff','piece',{max:5,era:2,desc:'Guarda até 16 pilhas de itens. Abra com E.'});
// equipamentos especiais (efeitos equilibrados: ajudam, mas não decidem o jogo sozinhos)
item('mochila_explorador','Mochila de Explorador','MOC','#4da6ff','equip',{max:1,slot:'mochila',rarity:2,fx:{slots:8},desc:'+8 espaços no inventário. Encontrada em baús ou como recompensa de exploração.'});
item('bussola_avancada','Bússola Avançada','BUS','#4da6ff','equip',{max:1,slot:'acessorio',rarity:2,fx:{compass:1},desc:'A bússola passa a apontar o ponto de interesse mais próximo que você ainda não visitou.'});
item('cantil_couro','Cantil de Couro','CAN','#5fd06a','equip',{max:1,slot:'acessorio',rarity:1,fx:{canteen:5},desc:'Guarda 5 goles de água. Encha olhando para a água com E e beba com G.'});
item('cantil_viajante','Cantil do Viajante','CVI','#b26bff','equip',{max:1,slot:'acessorio',rarity:3,fx:{canteen:12,thirst:0.85},desc:'Guarda 12 goles e mantém a água fresca: a sede baixa 15% mais devagar.'});
item('lampiao','Lampião','LAM','#5fd06a','equip',{max:1,slot:'acessorio',rarity:1,fx:{light:18},desc:'Ilumina 18 m à sua volta. Feito na forja.'});
item('lanterna_longo','Lanterna de Longo Alcance','LAN','#b26bff','equip',{max:1,slot:'acessorio',rarity:3,fx:{light:20,beam:45},desc:'Facho de luz de 45 m para onde você olha. Perfeita para cavernas e noites sem lua.'});
item('kit_construcao','Kit de Construção Avançado','KIT','#b26bff','equip',{max:1,slot:'acessorio',rarity:3,fx:{build:0.75},desc:'Peças de construção custam 25% menos material.'});
item('botas_couro','Botas de Couro','BOT','#a3adb6','equip',{max:1,slot:'botas',rarity:0,fx:{speed:1.04},desc:'+4% de velocidade.'});
item('botas_exploracao','Botas de Exploração','BEX','#4da6ff','equip',{max:1,slot:'botas',rarity:2,fx:{speed:1.08,sprint:0.85},desc:'+8% de velocidade e correr gasta 15% menos energia.'});
item('amuleto_colheita','Amuleto da Colheita','AMC','#ffb547','equip',{max:1,slot:'amuleto',rarity:4,fx:{gather:0.25},desc:'Lendário. 25% de chance de ganhar 1 recurso a mais em cada golpe.'});
item('amuleto_folego','Amuleto do Fôlego','AMF','#ffb547','equip',{max:1,slot:'amuleto',rarity:4,fx:{drain:0.8},desc:'Lendário. Fome, sede e energia caem 20% mais devagar.'});
item('medalha_desafio','Medalha do Desafio','MDL','#4da6ff','equip',{max:1,slot:'amuleto',rarity:2,fx:{dmg:1.08},desc:'Prêmio do modo Desafio. +8% de dano.'});
item('casaco_pele','Casaco de Pele','CAS','#a3adb6','equip',{max:1,slot:'roupa',rarity:0,fx:{warm:12},desc:'+12 °C contra o frio. Essencial nas montanhas nevadas.'});
item('manto_aurora','Manto da Aurora','MNT','#ff5fa2','equip',{max:1,slot:'roupa',rarity:5,fx:{warm:16,speed:1.04,light:8},desc:'Mítico. +16 °C contra o frio, +4% de velocidade e um brilho suave à noite.'});
item('mapa_tesouro','Mapa do Tesouro','MAP','#4da6ff','use',{max:5,rarity:2,desc:'Use (F) para marcar na bússola o lugar de um tesouro enterrado. Cave com E quando chegar lá.'});
// raridades dos itens antigos
for(const id of ['lanca','saco','couro'])ITEMS[id].rarity=Math.max(ITEMS[id].rarity,id==='lanca'?1:0);

// ---------------- efeitos dos equipamentos
function EFX(){const e={slots:0,compass:0,canteen:0,thirst:1,light:0,beam:0,build:1,speed:1,sprint:1,gather:0,drain:1,dmg:1,warm:0};
  for(const k in G.equip){const id=G.equip[k];const d=id&&ITEMS[id];if(!d||!d.fx)continue;const f=d.fx;
    e.slots+=f.slots||0;e.compass=Math.max(e.compass,f.compass||0);e.canteen=Math.max(e.canteen,f.canteen||0);e.light=Math.max(e.light,f.light||0);e.beam=Math.max(e.beam,f.beam||0);
    e.thirst*=f.thirst||1;e.build*=f.build||1;e.speed*=f.speed||1;e.sprint*=f.sprint||1;e.gather+=f.gather||0;e.drain*=f.drain||1;e.dmg*=f.dmg||1;e.warm+=f.warm||0;}
  return e;}
function invCap(){return 32+(EFX().slots||0);}
function equipItem(slotIdx){const s=G.inv[slotIdx];if(!s)return;const d=ITEMS[s.id];if(d.kind!=='equip')return;const prev=G.equip[d.slot];
  G.inv[slotIdx]=prev?{id:prev,n:1}:null;G.equip[d.slot]=d.id;if(d.fx&&d.fx.canteen)G.water=Math.min(G.water,d.fx.canteen);
  toast(`Equipado: ${d.name}`,RARITY[d.rarity].color);sfx('equip');invChanged();updateGearLights();}
function unequip(slot){const id=G.equip[slot];if(!id)return;
  if(slot==='mochila'){for(let i=32;i<40;i++)if(G.inv[i]){toast('Esvazie os espaços extras da mochila antes de tirá-la','var(--red)');return;}}
  G.equip[slot]=null;if(invAdd(id,1)>0){G.equip[slot]=id;toast('Inventário cheio','var(--red)');return;}sfx('equip');invChanged();updateGearLights();}
// luz da tocha, do lampião, da lanterna e do manto
const gearLight=new THREE.PointLight(0xffd9a0,0,18,1.6);scene.add(gearLight);
const beam=new THREE.SpotLight(0xfff2d8,0,45,0.42,0.5,1.4);scene.add(beam);scene.add(beam.target);
function updateGearLights(){}
function updateLights(){const e=EFX(),d=selDef();let r=e.light;if(d&&d.light)r=Math.max(r,d.light);if(d&&d.glow)r=Math.max(r,6);
  const dark=P.cave?1:clamp(1-SKYS.day*1.4,0,1);
  gearLight.distance=r||1;gearLight.intensity=r?1.5*Math.max(dark,0.15)*(d&&d.tool==='torch'?0.9+noise(performance.now()/120,1)*0.3:1):0;gearLight.color.set(d&&d.tool==='torch'?0xffb060:d&&d.glow?0x7fe8ff:0xffe2b8);
  gearLight.position.set(P.x,P.y+1.7,P.z);
  beam.intensity=e.beam?2.2*Math.max(dark,0.1):0;beam.distance=e.beam||1;beam.position.copy(camera.position);
  const fw=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);beam.target.position.copy(camera.position).addScaledVector(fw,10);}
// cantil
function drinkCanteen(){const e=EFX();if(!e.canteen){toast('Você não tem um cantil equipado','var(--muted)');return;}if(G.water<=0){toast('Cantil vazio. Encha olhando para a água e apertando E','var(--muted)');return;}
  G.water--;G.stats.water=Math.min(100,G.stats.water+22);sfx('drink');toast(`Gole do cantil (${G.water}/${e.canteen})`,'var(--cyan)');}

// ---------------- baús e saque por raridade
const LOOT=[
  [['madeira',8],['pedra',8],['fibra',8],['silex',3],['couro',2],['carne_assada',2],['tocha',1],['botas_couro',1],['cantil_couro',1]],
  [['couro',4],['minerio_cobre',5],['minerio_ferro',4],['cantil_couro',1],['casaco_pele',1],['mapa_tesouro',1],['lanca',1]],
  [['mochila_explorador',1],['bussola_avancada',1],['botas_exploracao',1],['mapa_tesouro',1],['cristal',3],['lingote_ferro',3]],
  [['lanterna_longo',1],['kit_construcao',1],['cantil_viajante',1],['fragmento_meteoro',2]],
  [['amuleto_colheita',1],['amuleto_folego',1]],
  [['picareta_cristal',1],['manto_aurora',1]],
];
// chance de cada raridade por nível do baú (1 a 5)
const LOOT_ODDS={1:[60,32,8,0,0,0],2:[30,42,22,6,0,0],3:[10,30,38,18,4,0],4:[0,15,35,32,15,3],5:[0,0,20,40,30,10]};
function rollRarity(tier){const o=LOOT_ODDS[tier]||LOOT_ODDS[1];let r=Math.random()*100;for(let i=0;i<o.length;i++){if(r<o[i])return i;r-=o[i];}return 0;}
function rollLoot(tier){const out=[];const n=2+Math.floor(Math.random()*2)+(tier>=3?1:0);
  for(let k=0;k<n;k++){const rar=rollRarity(tier);const pool=LOOT[rar];const [id,q]=pool[Math.floor(Math.random()*pool.length)];out.push([id,Math.max(1,Math.round(q*(0.6+Math.random()*0.8)))]);}
  return out;}
function grantItems(list,source){let best=0;for(const [id,n] of list){const d=ITEMS[id];const left=invAdd(id,n);const got=n-left;if(got>0){best=Math.max(best,d.rarity);
    if(d.rarity>=2)toast(`★ ${RARITY[d.rarity].name.toUpperCase()}: ${d.name}`,RARITY[d.rarity].color);else toastGather(id,got);onGathered(id,got);}
    if(left>0)toast('Inventário cheio: '+d.name+' ficou para trás','var(--red)');}
  if(best>=3)sfx('rare');else sfx('coins');return best;}
function openChest(c){G.opened=G.opened||{};if(G.opened[c.id]){toast('Este baú já foi aberto','var(--muted)');return;}
  G.opened[c.id]=1;const loot=rollLoot(c.tier);grantItems(loot);PROFILE.chests=(PROFILE.chests||0)+1;saveProfile();
  if(PROFILE.chests>=1)unlockAch('bau1');if(PROFILE.chests>=5)unlockAch('bau5');
  c.g.children[1].rotation.x=-0.9;c.g.children[1].position.set(0,0.85,-0.3);chips(new THREE.Vector3(c.x,c.y+0.8,c.z),0xffd860,10);}
function markSecret(id){if(G.secrets[id])return;G.secrets[id]=1;PROFILE.secrets=(PROFILE.secrets||0)+1;saveProfile();if(PROFILE.secrets>=3)unlockAch('segredos');}

// ---------------- tesouro enterrado (mapa do tesouro)
const TREASURE_SPOTS=[[-262,262],[-345,340],[300,-150],[120,-320],[-310,-120],[200,330],[-120,180],[340,250]];
function useTreasureMap(slot){const left=TREASURE_SPOTS.filter((t,i)=>!G.opened['tesouro'+i]);if(!left.length){toast('Você já encontrou todos os tesouros','var(--muted)');return;}
  const t=left[Math.floor(Math.random()*left.length)];const i=TREASURE_SPOTS.indexOf(t);G.treasure=i;invRemoveSlot(slot,1);
  toast('O mapa mostra um X. A bússola agora aponta para o tesouro.','var(--amber)');sfx('map');}
function treasureAt(){if(G.treasure==null)return null;const t=TREASURE_SPOTS[G.treasure];return {x:t[0],z:t[1],y:H(t[0],t[1])};}
function digTreasure(){const t=treasureAt();if(!t)return;const i=G.treasure;G.opened['tesouro'+i]=1;G.treasure=null;
  banner('TESOURO ENCONTRADO','Um baú antigo, enterrado há muito tempo.');grantItems(rollLoot(5));unlockAch('tesouro');chips(new THREE.Vector3(t.x,t.y+0.3,t.z),0x8a6a40,16);}

// ---------------- evento: chuva de meteoros
const EVENT={meteor:null,checkedDay:0};
function updateEvents(dt){
  if(G.state!=='play'||P.cave)return;
  if(isNight()&&G.hour>21&&EVENT.checkedDay!==G.day){EVENT.checkedDay=G.day;if(Math.random()<0.35)startMeteor();}
  const m=EVENT.meteor;if(!m)return;m.t+=dt;
  if(m.streak){m.streak.position.addScaledVector(m.vel,dt);m.streak.material.opacity=Math.max(0,1-m.t/3);if(m.t>2.6&&!m.landed){m.landed=true;landMeteor(m);}}
  if(!isNight()&&G.hour>9&&m.landed)clearMeteor();}
function startMeteor(){for(let k=0;k<20;k++){const a=Math.random()*6.28,d=60+Math.random()*90;const x=clamp(P.x+Math.cos(a)*d,-HALF+40,HALF-40),z=clamp(P.z+Math.sin(a)*d,-HALF+40,HALF-40);
    if(H(x,z)<WATER+1)continue;const streak=new THREE.Mesh(new THREE.CylinderGeometry(0.15,1.2,26,6),new THREE.MeshBasicMaterial({color:lin(0xffa050),transparent:true,toneMapped:false,fog:false}));
    const start=new THREE.Vector3(x+80,H(x,z)+180,z-40);streak.position.copy(start);const vel=new THREE.Vector3(x,H(x,z),z).sub(start).divideScalar(2.6);streak.lookAt(start.clone().add(vel));streak.rotateX(Math.PI/2);scene.add(streak);
    EVENT.meteor={x,z,t:0,streak,vel,landed:false,objs:[]};banner('CHUVA DE METEOROS','Algo caiu do céu não muito longe daqui. Procure o brilho alaranjado.');sfx('thunder',{vol:0.6});return;}}
function landMeteor(m){scene.remove(m.streak);const y=H(m.x,m.z);const g=new THREE.Group();g.position.set(m.x,y,m.z);scene.add(g);
  const rock=new THREE.Mesh(lumpy(1,0.35,77),new THREE.MeshLambertMaterial({color:lin(0x3a2a24),emissive:lin(0xff5a1a),emissiveIntensity:0.6}));rock.scale.set(1.6,1.1,1.4);g.add(rock);
  const l=new THREE.PointLight(0xff7a3a,2,25,1.6);l.position.y=2;g.add(l);m.objs.push(g);
  for(let k=0;k<3;k++){const a=k*2.1,x=m.x+Math.cos(a)*3,z=m.z+Math.sin(a)*3,yy=H(x,z);const pg=new THREE.Group();pg.position.set(x,yy,z);scene.add(pg);
    const fm=new THREE.Mesh(lumpy(0,0.3,90+k),new THREE.MeshLambertMaterial({color:lin(0xff7a3a),emissive:lin(0xc84a10)}));fm.scale.setScalar(0.25);fm.position.y=0.2;pg.add(fm);
    pickups.push({g:pg,x,y:yy,z,item:'fragmento_meteoro',n:1,name:'Fragmento de Meteoro'});m.objs.push(pg);}
  chips(new THREE.Vector3(m.x,y+1,m.z),0xff8a40,24);sfx('thunder',{vol:1});}
function clearMeteor(){const m=EVENT.meteor;for(const o of m.objs){scene.remove(o);const i=pickups.findIndex(p=>p.g===o);if(i>=0)pickups.splice(i,1);}EVENT.meteor=null;}

// ---------------- perfil e conquistas (individuais por conta)
const PROFILE_KEY='erazero_profile_v1';
let PROFILE=(()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY))||{};}catch(e){return {};}})();
PROFILE.ach=PROFILE.ach||{};PROFILE.species=PROFILE.species||{};PROFILE.biomes=PROFILE.biomes||{};
const ACH={
  machado:{name:'Primeira Ferramenta',desc:'Fabrique um machado de pedra.',reward:['botas_couro',1]},
  noite:{name:'Sobrevivente',desc:'Sobreviva à primeira noite.',reward:['cantil_couro',1]},
  abrigo:{name:'Lar Doce Lar',desc:'Erga um abrigo completo.',reward:['kit_construcao',1]},
  cacador:{name:'Caçador',desc:'Abata 5 animais.',reward:['mapa_tesouro',1]},
  bau1:{name:'Curioso',desc:'Abra o seu primeiro baú.'},
  bau5:{name:'Saqueador',desc:'Abra 5 baús.',reward:['mapa_tesouro',1]},
  biomas3:{name:'Andarilho',desc:'Descubra 3 biomas.',reward:['bussola_avancada',1]},
  biomas7:{name:'Explorador do Vale',desc:'Descubra todos os biomas da superfície.',reward:['mochila_explorador',1]},
  caverna:{name:'Espeleólogo',desc:'Entre numa caverna subterrânea.',reward:['tocha',1]},
  era1:{name:'Era Primitiva',desc:'Conclua a Era I.',reward:['botas_exploracao',1]},
  era2:{name:'Era Industrial',desc:'Conclua a Era II.',reward:['amuleto_folego',1]},
  raro:{name:'Colecionador',desc:'Consiga um item Épico ou melhor.'},
  lendario:{name:'Lenda Viva',desc:'Consiga um item Lendário ou melhor.'},
  tesouro:{name:'Caça ao Tesouro',desc:'Desenterre um tesouro.'},
  naturalista:{name:'Naturalista',desc:'Aviste 15 espécies de animais.',reward:['lanterna_longo',1]},
  segredos:{name:'Guardião de Segredos',desc:'Leia 3 anotações escondidas.'},
  dia10:{name:'Veterano',desc:'Chegue ao dia 10.',reward:['cantil_viajante',1]},
  desafio:{name:'Desafiante',desc:'Complete todos os objetivos do modo Desafio.',reward:['medalha_desafio',1]},
  meteoro:{name:'Caçador de Estrelas',desc:'Pegue um fragmento de meteoro.'},
};
function saveProfile(){PROFILE.at=Date.now();try{localStorage.setItem(PROFILE_KEY,JSON.stringify(PROFILE));}catch(e){}if(typeof cloudSaveProfile==='function')cloudSaveProfile();}
function unlockAch(id){const a=ACH[id];if(!a||PROFILE.ach[id])return;PROFILE.ach[id]=Date.now();saveProfile();
  banner('CONQUISTA: '+a.name.toUpperCase(),a.desc+(a.reward?` Recompensa: ${ITEMS[a.reward[0]].name}.`:''));sfx('achievement');
  if(a.reward&&G.state!=='menu')grantItems([a.reward]);}
function seeSpecies(id){if(!PROFILE.species[id]){PROFILE.species[id]=1;saveProfile();if(Object.keys(PROFILE.species).length>=15)unlockAch('naturalista');}}
