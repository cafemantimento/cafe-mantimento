'use strict';
// ======================================================================
//  Login com Firebase (versão independente: navegador, PWA, Windows, Android)
//  Cadastro com nome, e-mail e senha; entrar; sair; recuperar senha.
//  As senhas ficam com o Firebase Authentication (o jogo nunca as guarda).
//  Dados em users/{uid}/data/{documento}, protegidos por firestore.rules.
// ======================================================================
const FB={ready:false,auth:null,db:null,user:null,err:''};
function fbConfigured(){return !!(window.ERA_ZERO_FIREBASE&&window.ERA_ZERO_FIREBASE.apiKey);}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
const FirebaseProvider={
  async get(key){const s=await FB.db.collection('users').doc(FB.user.uid).collection('data').doc(key).get();if(!s.exists)return null;const d=s.data();return d&&typeof d.json==='string'?{json:d.json,at:d.at||0}:null;},
  async put(key,json,at){await FB.db.collection('users').doc(FB.user.uid).collection('data').doc(key).set({json,at:Math.floor(at)});return true;},
};
async function firebaseInit(){
  if(!fbConfigured()||(window.claude&&window.claude.use)||!/^https?:|^app:/.test(location.protocol))return false;
  try{await loadScript('js/lib/firebase/firebase-app-compat.js');await loadScript('js/lib/firebase/firebase-auth-compat.js');await loadScript('js/lib/firebase/firebase-firestore-compat.js');}
  catch(e){FB.err='Não foi possível carregar o login.';renderAccount();return false;}
  firebase.initializeApp(window.ERA_ZERO_FIREBASE);FB.auth=firebase.auth();FB.db=firebase.firestore();
  try{await FB.db.enablePersistence({synchronizeTabs:true});}catch(e){}// funciona offline e sincroniza depois
  try{await FB.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);}catch(e){}
  FB.ready=true;
  FB.auth.onAuthStateChanged(async u=>{FB.user=u;
    if(u){Object.assign(ACCOUNT,{kind:'firebase',uid:u.uid,name:u.displayName||'',email:u.email||'',provider:FirebaseProvider});if(u.displayName)setName(u.displayName);}
    else Object.assign(ACCOUNT,{kind:'convidado',uid:null,name:'',email:'',provider:null});
    for(const k in SLOTS)delete SLOTS[k];await accountReady();if(G.state==='profile')renderProfile();});
  return true;}
const FB_ERRORS={'auth/api-key-not-valid.-please-pass-a-valid-api-key.':'A configuração do Firebase está incorreta (firebase-config.js).','auth/operation-not-allowed':'Ative o login por e-mail e senha no console do Firebase.','auth/invalid-email':'E-mail inválido.','auth/missing-password':'Digite a senha.','auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.','auth/email-already-in-use':'Já existe uma conta com esse e-mail.',
  'auth/invalid-credential':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/user-not-found':'Não existe conta com esse e-mail.','auth/too-many-requests':'Muitas tentativas. Espere um pouco e tente de novo.','auth/network-request-failed':'Sem conexão com a internet.'};
function fbMsg(e){return FB_ERRORS[e&&e.code]||'Não deu certo: '+((e&&e.message)||'erro desconhecido');}
function firebaseAccountHTML(){
  if(!fbConfigured())return '<p>Jogando como convidado: o progresso fica só neste aparelho.</p><p class="acct">O login com e-mail e senha aparece aqui quando o jogo é configurado com um projeto Firebase (arquivo firebase-config.js).</p>';
  if(!FB.ready)return `<p>${FB.err||'Conectando ao serviço de contas…'}</p>`;
  if(FB.user)return `<p>Conectado como <b>${escapeHtml(FB.user.displayName||'Jogador')}</b> (${escapeHtml(FB.user.email||'')}). Seu progresso, inventário e conquistas ficam na sua conta e funcionam em qualquer aparelho.</p><p class="acct">ID do jogador: ${FB.user.uid.slice(0,8)}…</p><div class="mrow"><button id="fbOut">Sair da conta</button></div>`;
  return `<p>Entre ou crie uma conta para salvar o progresso na nuvem e continuar em outro aparelho.</p>
    <div class="form"><input id="fbName" placeholder="Nome (só para criar conta)" maxlength="16" autocomplete="nickname"><input id="fbEmail" type="email" placeholder="E-mail" autocomplete="email"><input id="fbPass" type="password" placeholder="Senha (mínimo 6 caracteres)" autocomplete="current-password">
    <div class="mrow"><button class="primary" id="fbIn">Entrar</button><button id="fbUp">Criar conta</button><button id="fbReset">Esqueci a senha</button></div><div class="acct" id="fbMsg"></div></div>`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function firebaseBind(){const msg=t=>{const m=$('fbMsg');if(m)m.textContent=t;};const val=id=>($(id)&&$(id).value||'').trim();
  for(const id of ['fbName','fbEmail','fbPass'])if($(id))$(id).addEventListener('keydown',e=>e.stopPropagation());
  if($('fbIn'))$('fbIn').onclick=async()=>{msg('Entrando…');try{await FB.auth.signInWithEmailAndPassword(val('fbEmail'),$('fbPass').value);msg('');}catch(e){msg(fbMsg(e));}};
  if($('fbUp'))$('fbUp').onclick=async()=>{msg('Criando conta…');try{const c=await FB.auth.createUserWithEmailAndPassword(val('fbEmail'),$('fbPass').value);const n=cleanName(val('fbName')||myName());await c.user.updateProfile({displayName:n});setName(n);ACCOUNT.name=n;msg('');renderProfile();}catch(e){msg(fbMsg(e));}};
  if($('fbReset'))$('fbReset').onclick=async()=>{if(!val('fbEmail')){msg('Digite o seu e-mail acima.');return;}try{await FB.auth.sendPasswordResetEmail(val('fbEmail'));msg('Enviamos um link para redefinir a senha no seu e-mail.');}catch(e){msg(fbMsg(e));}};
  if($('fbOut'))$('fbOut').onclick=async()=>{if(G.state!=='menu'&&G.state!=='profile')save(true);await FB.auth.signOut();};}
