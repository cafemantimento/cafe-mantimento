'use strict';
// ======================================================================
//  Contas e nuvem
//  - Dentro do Claude: a conta Claude do jogador (dados privados por pessoa)
//  - Versão independente: Firebase Authentication + Cloud Firestore (firebase.js)
//  - Sem login: convidado (salva só neste aparelho)
//  Sempre salva primeiro no aparelho; envia para a nuvem quando der e nunca
//  troca um progresso mais novo por um mais velho.
// ======================================================================
const ACCOUNT={kind:'convidado',uid:null,name:'',email:'',provider:null,online:navigator.onLine!==false};
const CLOUD={db:null,uid:null,data:null};// compatibilidade com o código antigo
// provedor Claude (capacidade db do artifact)
const ClaudeProvider={
  async init(){if(!window.claude||!window.claude.use)return false;const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user)return false;
    const id=await user.id();if(!id)return false;this.db=db;this.uid=id;CLOUD.db=db;CLOUD.uid=id;let me=null;try{me=await user.me();}catch(e){}
    Object.assign(ACCOUNT,{kind:'claude',uid:id,name:(me&&me.name)||'',provider:this});return true;},
  async get(key){const s=await this.db.collection('data/users/'+this.uid).doc(key).get();if(!s.exists)return null;const d=s.data();return d&&typeof d.json==='string'?{json:d.json,at:d.at||0}:null;},
  async put(key,json,at){await this.db.collection('data/users/'+this.uid).doc(key).set({json,at});return true;},
};
function localKey(k){return 'erazero_v3_'+(ACCOUNT.uid||'convidado')+'_'+k;}
function localGet(k){try{const s=localStorage.getItem(localKey(k));return s?JSON.parse(s):null;}catch(e){return null;}}
function localPut(k,obj){try{localStorage.setItem(localKey(k),JSON.stringify(obj));return true;}catch(e){return false;}}
const PENDING=new Set();
async function cloudGet(key){if(!ACCOUNT.provider)return null;try{return await ACCOUNT.provider.get(key);}catch(e){return null;}}
async function cloudPut(key,json,at,knownAt){const pr=ACCOUNT.provider;if(!pr)return false;
  try{// não sobrescreve um progresso mais novo salvo por outro aparelho
    const remote=await pr.get(key);if(remote&&remote.at>at&&remote.at>(knownAt||0)){NEWER[key]=remote;return 'newer';}
    await pr.put(key,json,at);PENDING.delete(key);return true;}catch(e){PENDING.add(key);return false;}}
const NEWER={};
async function syncPending(){for(const key of [...PENDING]){const l=localGet(key);if(l&&l.json)await cloudPut(key,l.json,l.at,l.at);}}
addEventListener('online',()=>{ACCOUNT.online=true;syncPending();toast('Conexão de volta: sincronizando o progresso','var(--muted)');});
addEventListener('offline',()=>{ACCOUNT.online=false;});
setInterval(()=>{if(PENDING.size&&navigator.onLine!==false)syncPending();},30000);
async function cloudSaveProfile(){const json=JSON.stringify(PROFILE);const at=PROFILE.at||Date.now();localPut('profile',{json,at});if(ACCOUNT.provider)cloudPut('profile',json,at,at);}
async function loadProfileFromCloud(){const l=localGet('profile'),r=await cloudGet('profile');const best=[l,r].filter(Boolean).sort((a,b)=>b.at-a.at)[0];
  if(best){try{const p=JSON.parse(best.json);if((p.at||0)>=(PROFILE.at||0)){PROFILE=p;PROFILE.ach=PROFILE.ach||{};PROFILE.species=PROFILE.species||{};PROFILE.biomes=PROFILE.biomes||{};}}catch(e){}}}
async function accountReady(){if(ACCOUNT.uid){await loadProfileFromCloud();await refreshSlots();}renderAccount();if(G.state==='menu')setState('menu');}
async function cloudInit(){try{if(await ClaudeProvider.init()){await accountReady();return;}}catch(e){}
  if(typeof firebaseInit==='function'){try{await firebaseInit();}catch(e){}}renderAccount();}
async function cloudSave(){return false;}// antigo; substituído por saveSlot
