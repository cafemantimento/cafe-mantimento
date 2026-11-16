'use strict';
// ======================================================================
//  Save na conta Claude (vai junto para qualquer navegador)
// ======================================================================
const CLOUD={db:null,uid:null,data:null};let cloudBusy=false;
async function cloudInit(){try{if(!window.claude||!window.claude.use)return;const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user)return;
  const id=await user.id();if(!id)return;CLOUD.db=db;CLOUD.uid=id;
  const snap=await db.collection('data/users/'+id).doc('save').get();if(snap.exists){const d=snap.data();if(d&&typeof d.json==='string'){try{CLOUD.data=JSON.parse(d.json);}catch(e){}}}
  $('saveNote').textContent='O jogo salva sozinho a cada minuto, na sua conta Claude.';if(G.state==='menu')setState('menu');}catch(e){CLOUD.db=null;}}
async function cloudSave(json){if(!CLOUD.db||!CLOUD.uid||cloudBusy)return false;cloudBusy=true;
  try{await CLOUD.db.collection('data/users/'+CLOUD.uid).doc('save').set({json,at:Date.now()});CLOUD.data=JSON.parse(json);return true;}catch(e){return false;}finally{cloudBusy=false;}}
