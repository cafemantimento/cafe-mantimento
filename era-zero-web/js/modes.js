'use strict';
// ======================================================================
//  Modos de jogo (cada modo tem o seu próprio save)
// ======================================================================
const MODES={
  sobrevivencia:{name:'Sobrevivência',drain:1,harm:1,desc:'O jogo completo: fome, sede, frio, predadores e as eras do Vale.'},
  exploracao:{name:'Exploração',drain:0.5,harm:0.5,desc:'Necessidades pela metade e animais só atacam se provocados. Objetivo: descobrir todos os biomas, locais e cavernas.'},
  desafio:{name:'Desafio',drain:1.4,harm:1.3,desc:'Mais difícil: predadores mais agressivos e objetivos com prazo. Recompensa exclusiva: Medalha do Desafio.'},
  construcao:{name:'Construção',drain:0,harm:0,desc:'Criativo: sem fome, sem dano e fabricação grátis. Construa a base dos seus sonhos.'},
  coop:{name:'Cooperativo',drain:1,harm:1,desc:'Sobrevivência com os amigos no mesmo Vale. Metas em equipe e lista de quem está jogando.'},
};
const CHALLENGES=[
  ['era2','Chegue à Era II até o dia 6',()=>G.era>=2&&G.day<=6,()=>G.day>6&&G.era<2],
  ['pred','Abata 3 predadores (lobo, onça, urso, jacaré)',()=>(G.predKills||0)>=3],
  ['biomas','Descubra 3 biomas',()=>surfaceDiscovered()>=3],
  ['baus','Abra 3 baús',()=>Object.keys(G.opened||{}).filter(k=>!k.startsWith('tesouro')).length>=3],
  ['dia5','Sobreviva até o dia 5',()=>G.day>=5],
];
function surfaceDiscovered(){return BIOMES.filter(b=>G.discovered[b]).length;}
function exploreGoals(){return [
  ['Biomas descobertos',surfaceDiscovered(),BIOMES.length],
  ['Locais visitados',POIS.filter(p=>G.discovered['poi_'+p.id]).length,POIS.length],
  ['Baús abertos',Object.keys(G.opened||{}).filter(k=>!k.startsWith('tesouro')).length,chests.length],
  ['Anotações lidas',Object.keys(G.secrets||{}).length,6]];}
function coopGoals(){const mine=pieces.length,team=mine+remotePieces().length;return [
  ['Peças construídas pela equipe',team,40],['Jogadores no Vale',1+NET.peers.size,2]];}
let modeT=0;
function modeTick(dt){modeT-=dt;if(modeT>0)return;modeT=2;
  if(G.mode==='desafio'){G.challenge=G.challenge||{};let changed=false;
    for(const [id,label,ok,fail] of CHALLENGES){if(G.challenge[id])continue;if(fail&&fail()){G.challenge[id]='falhou';changed=true;toast('Desafio perdido: '+label,'var(--red)');}else if(ok()){G.challenge[id]='ok';changed=true;toast('Desafio cumprido: '+label,'var(--green)');sfx('done');}}
    if(changed){renderQuests();if(CHALLENGES.every(c=>G.challenge[c[0]]==='ok'))unlockAch('desafio');}}
  if(G.mode==='exploracao'||G.mode==='coop')renderQuests();}
function modeOnDay(){if(G.mode==='desafio')modeT=0;}
function modeStartKit(){if(G.mode==='construcao'){for(const id of ['machado_ferro','picareta_ferro','tocha'])invAdd(id,1);for(const id of ['fundacao','parede','porta','teto'])invAdd(id,20);invAdd('fogueira',3);invAdd('forja',2);invAdd('bau',2);invAdd('saco',1);}
  if(G.mode==='exploracao'){invAdd('tocha',1);invAdd('cantil_couro',1);}}
