'use strict';

const $ = id => document.getElementById(id);
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');
if (isTouch) $('menuHelp').textContent = 'Joystick à esquerda para andar · arraste à direita para olhar · botões para golpear, pular e usar';
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>v<a?a:v>b?b:v, smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};

// ======================================================================
//  Aleatório e ruído
// ======================================================================
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R=rng(2031);
const perm=new Uint8Array(512);{const p=[];for(let i=0;i<256;i++)p.push(i);for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));const t=p[i];p[i]=p[j];p[j]=t;}for(let i=0;i<512;i++)perm[i]=p[i&255];}
function grad(h,x,y){switch(h&7){case 0:return x+y;case 1:return -x+y;case 2:return x-y;case 3:return -x-y;case 4:return x;case 5:return -x;case 6:return y;default:return -y;}}
function fade(t){return t*t*t*(t*(t*6-15)+10);}
function noise(x,y){const fx=Math.floor(x),fy=Math.floor(y);const X=fx&255,Y=fy&255;x-=fx;y-=fy;const u=fade(x),v=fade(y);const a=perm[X]+Y,b=perm[X+1]+Y;
  const r=lerp(lerp(grad(perm[a],x,y),grad(perm[b],x-1,y),u),lerp(grad(perm[a+1],x,y-1),grad(perm[b+1],x-1,y-1),u),v);return clamp(r*0.5+0.5,0,1);}
function fbm(x,y,o){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=noise(x*f,y*f)*a;n+=a;a*=.5;f*=2.03;}return s/n;}

// ======================================================================
//  Itens, receitas e missões
// ======================================================================
const ITEMS={};
function item(id,name,short,color,kind,extra){ITEMS[id]=Object.assign({id,name,short,color,kind,max:100,tool:null,dmg:6,rarity:0},extra||{});}
item('madeira','Madeira','MAD','#9e6e3d','res',{desc:'Corte árvores para conseguir. Um machado rende mais.'});
item('pedra','Pedra','PED','#9ea3a8','res',{desc:'Quebre rochas para conseguir. Uma picareta rende mais.'});
item('fibra','Fibra','FIB','#8cb852','res',{desc:'Colete em arbustos. Serve para amarrar ferramentas e construções.'});
item('silex','Sílex','SLX','#4d5261','res',{desc:'Pedra afiada. Sai das rochas, principalmente com machado.'});
item('sucata','Sucata de Metal','SUC','#9e6142','res',{desc:'Restos do mundo antigo. Será essencial na Era Industrial.'});
item('couro','Couro','COU','#8c5c38','res',{desc:'Tirado de animais abatidos.'});
item('frutinha','Frutinhas','FRU','#c72e47','food',{max:30,hunger:8,thirst:4,hp:0,desc:'Mata um pouco a fome e a sede.'});
item('carne_crua','Carne Crua','CRU','#d95961','food',{max:30,hunger:10,thirst:0,hp:-6,desc:'Comer crua faz mal. Asse numa fogueira.'});
item('carne_assada','Carne Assada','ASS','#a65729','food',{max:30,hunger:38,thirst:0,hp:4,desc:'Comida de verdade. Mata bastante a fome.'});
item('machado_pedra','Machado de Pedra','MCH','#8c99a8','tool',{max:1,tool:'axe',dmg:22,desc:'Corta árvores muito mais rápido.'});
item('picareta_pedra','Picareta de Pedra','PIC','#8c99a8','tool',{max:1,tool:'pick',dmg:20,desc:'Quebra rochas e sucata muito mais rápido.'});
item('lanca','Lança','LAN','#8c99a8','tool',{max:1,tool:'spear',dmg:34,desc:'Arma para caçar e se defender de lobos.'});
item('fundacao','Fundação de Madeira','FUN','#5fe1ff','piece',{max:20,desc:'Base de toda construção. Encaixa numa grade de 3 metros.'});
item('parede','Parede de Madeira','PAR','#5fe1ff','piece',{max:20,desc:'Encaixa na borda de uma fundação.'});
item('porta','Parede com Porta','PRT','#5fe1ff','piece',{max:20,desc:'Parede com passagem para entrar no abrigo.'});
item('teto','Teto de Madeira','TET','#5fe1ff','piece',{max:20,desc:'Cobre uma fundação. Abrigo coberto protege do frio.'});
item('fogueira','Fogueira','FOG','#5fe1ff','piece',{max:20,desc:'Aquece, ilumina a noite e assa carne.'});
item('saco','Saco de Dormir','SAC','#5fe1ff','piece',{max:20,desc:'Define onde você renasce. À noite, permite dormir até o amanhecer.'});
const RECIPES=[
  ['tocha',{madeira:3,fibra:2}],['casaco_pele',{couro:6,fibra:4}],['botas_couro',{couro:4,fibra:2}],['cantil_couro',{couro:3,fibra:2}],
  ['machado_pedra',{madeira:4,pedra:3,fibra:4}],
  ['picareta_pedra',{madeira:4,pedra:4,fibra:4,silex:1}],
  ['lanca',{madeira:6,silex:2,fibra:6}],
  ['fogueira',{madeira:8,pedra:6}],
  ['fundacao',{madeira:12,fibra:4}],
  ['parede',{madeira:8,fibra:3}],
  ['porta',{madeira:8,fibra:3}],
  ['teto',{madeira:8,fibra:3}],
  ['saco',{fibra:15,couro:3}],
  ['forja',{pedra:20,madeira:10,silex:4},2],['bau',{madeira:20,lingote_cobre:2},2],['machado_ferro',{madeira:4,lingote_ferro:3,couro:1},2],
  ['picareta_ferro',{madeira:4,lingote_ferro:3,lingote_cobre:1},2],['lampiao',{lingote_cobre:2,fibra:2,cristal:1},2],['amuleto_colheita',{fragmento_meteoro:3,lingote_ferro:2},2],
];
const QUESTS2=[
  ['forja','Construa uma Forja',1],['cobre','Minere minério de cobre',8],['ferro','Minere minério de ferro',8],['lingote','Funda lingotes na forja',6],
  ['ferramenta','Fabrique uma ferramenta de ferro',1],['bau','Construa um Baú',1],['caverna','Explore uma caverna subterrânea',1],['biomas','Descubra 4 biomas',4],
];
const QUESTS=[
  ['madeira','Colete madeira',15],['pedra','Colete pedra',10],['machado','Fabrique um Machado de Pedra',1],
  ['fogueira','Construa uma Fogueira',1],['abrigo','Erga um abrigo (fundação, 4 paredes, teto)',6],
  ['assar','Cace e asse carne na fogueira',1],['noite','Sobreviva à primeira noite',1],['radio','Investigue as ruínas ao norte',1],
];

// ======================================================================
//  Estado do jogo
// ======================================================================
const G={
  state:'loading', inv:new Array(40).fill(null), sel:0,
  stats:{hp:100,food:100,water:100,stam:100,temp:20,nearFire:false,sheltered:false,dead:false},
  hour:8, day:1, dayLen:1200, quest:QUESTS.map(q=>0), quest2:QUESTS2.map(q=>0), era:1, eraDone:false, era2Done:false, respawn:null,
  mode:'sobrevivencia', equip:{mochila:null,botas:null,amuleto:null,acessorio:null,roupa:null}, opened:{}, discovered:{}, secrets:{}, water:0, kills:0, seenSpecies:{}, treasure:null,
};

// ---------------- inventário
function invCount(id){let n=0;for(const s of G.inv)if(s&&s.id===id)n+=s.n;return n;}
function invAdd(id,n){const d=ITEMS[id];let left=n;
  for(const s of G.inv){if(left<=0)break;if(s&&s.id===id&&s.n<d.max){const a=Math.min(left,d.max-s.n);s.n+=a;left-=a;}}
  const hotFirst=d.kind!=='res';
  const cap=invCap();for(let k=0;k<cap&&left>0;k++){const i=hotFirst?k:(k+8)%cap;if(G.inv[i])continue;const a=Math.min(left,d.max);G.inv[i]={id,n:a};left-=a;}
  if(left!==n)invChanged();return left;}
function invRemove(id,n){if(invCount(id)<n)return false;let left=n;for(let i=G.inv.length-1;i>=0&&left>0;i--){const s=G.inv[i];if(!s||s.id!==id)continue;const t=Math.min(left,s.n);s.n-=t;left-=t;if(s.n<=0)G.inv[i]=null;}invChanged();return true;}
function invRemoveSlot(i,n){const s=G.inv[i];if(!s)return;s.n-=n;if(s.n<=0)G.inv[i]=null;invChanged();}
function invSwap(a,b){if(a===b)return;const A=G.inv[a],B=G.inv[b];
  if(A&&B&&A.id===B.id){const m=ITEMS[A.id].max;const mv=Math.min(A.n,m-B.n);B.n+=mv;A.n-=mv;if(A.n<=0)G.inv[a]=null;}else{G.inv[a]=B;G.inv[b]=A;}invChanged();}
let invDirty=true;
function invChanged(){invDirty=true;refreshHeld();}
function give(id,n){const left=invAdd(id,n);const got=n-left;if(got>0){toastGather(id,got);onGathered(id,got);}if(left>0)toast('Inventário cheio','var(--red)');return got;}
const selDef=()=>G.inv[G.sel]?ITEMS[G.inv[G.sel].id]:null;

// ---------------- missões (as eras são etapas no mesmo mundo)
const curQ=()=>G.era>=2?QUESTS2:QUESTS,curP=()=>G.era>=2?G.quest2:G.quest;
function questAdvance(id,n){const Q=curQ(),Pg=curP();const i=Q.findIndex(q=>q[0]===id);if(i<0)return;const t=Q[i][2];if(Pg[i]>=t)return;
  Pg[i]=Math.min(t,Pg[i]+n);if(Pg[i]>=t){toast('Objetivo concluído: '+Q[i][1],'var(--green)');sfx('done');}
  renderQuests();
  if(G.era===1&&!G.eraDone&&QUESTS.every((q,k)=>G.quest[k]>=q[2])){G.eraDone=true;G.era=2;
    banner('ERA II: INDUSTRIAL','O Vale continua o mesmo, mas agora você sabe trabalhar o metal. Construa uma forja e procure cobre e ferro nas montanhas, no deserto e nas cavernas.');
    unlockAch('era1');syncEra2();renderQuests();}
  else if(G.era===2&&!G.era2Done&&QUESTS2.every((q,k)=>G.quest2[k]>=q[2])){G.era2Done=true;banner('ERA II CONCLUÍDA','Metal, ferramentas e exploração. A Era Elétrica é a próxima atualização.');unlockAch('era2');renderQuests();}}
// objetivos da Era II que já podem estar cumpridos quando a era começa
function syncEra2(){const d=Object.keys(G.discovered).filter(k=>k!=='caverna').length;if(d)questAdvance('biomas',d);if(G.discovered.caverna)questAdvance('caverna',1);}
function onGathered(id,n){if(id==='madeira')questAdvance('madeira',n);if(id==='pedra')questAdvance('pedra',n);if(id==='minerio_cobre')questAdvance('cobre',n);if(id==='minerio_ferro')questAdvance('ferro',n);
  const d=ITEMS[id];if(d&&d.rarity>=3)unlockAch('raro');if(d&&d.rarity>=4)unlockAch('lendario');}
function questProgress(){const Q=curQ(),Pg=curP();let s=0;Q.forEach((q,i)=>s+=Math.min(1,Pg[i]/q[2]));return s/Q.length;}
