"""Gera a versão Netlify (site estático) a partir de chl/loja-chl.html.
Uso: python3 build.py <catalogo.json> <saida_dir> <senha_salt> <senha_hash>"""
import sys,os,json,shutil,re
SRC=os.path.join(os.path.dirname(__file__),'..','loja-chl.html')
cat_path,OUT,SALT,HASH=sys.argv[1:5]
L=open(SRC,encoding='utf-8').read().split('\n')
def seg(a,b): return '\n'.join(L[a-1:b])          # linhas a..b (1-based, inclusive)
def find(s,start=1):
    for i in range(start-1,len(L)):
        if s in L[i]: return i+1
    raise SystemExit('marcador não encontrado: '+s)
# marcadores
iStyleEnd=find('</style>'); iLoja=find('<!-- ===================== LOJA'); iGate=find('<!-- ===================== ACESSO AO PAINEL')
iAdm=find('<!-- ===================== ÁREA DO LOJISTA'); iScrim=find('<div class="scrim"'); iScript=find('<script>',iScrim)
iImg=find('/* imagem:'); iLojaJs=find('/* ---------- loja ----------',iScript); iPed=find('/* ---------- pedido ----------',iScript)
iAce=find('/* ---------- acesso ao painel',iScript); iRot=find('/* ---------- roteamento',iScript); iDad=find('/* ---------- dados:',iScript)
iAdmJs=find('/* ---------- área do lojista',iScript); iPla=find('/* ---------- planilhas',iScript); iCfg=find('/* ---------- configurações',iScript); iIni=find('/* ---------- início',iScript)
head=seg(1,iStyleEnd); svg=seg(iStyleEnd+1,iLoja-1)
title_meta='<title>CHL Distribuidora</title>\n<meta name="claude:viewport-fit-sides" content="cover">'
assert head.startswith(title_meta)
headrest=head[len(title_meta):]
xlsx='<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>'
base_css='<style>body{margin:0}img{max-width:100%}</style>'
def doc(title,desc,extra_head,body,robots=False):
    return ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
      f'<title>{title}</title>\n<meta name="description" content="{desc}">\n<meta name="theme-color" content="#090c12">\n'
      +('<meta name="robots" content="noindex,nofollow">\n' if robots else '')+
      '<link rel="icon" href="img/favicon.png">\n'+extra_head+'\n'+base_css+'\n</head>\n<body>\n'+body+'\n</body>\n</html>\n')
helpers=seg(iScript+1,iImg-1)   # "(function(){" + utilitários + estado
imagem=seg(iImg,iLojaJs-1).replace('src="${esc(p.foto)}"','src="${esc(srcOf(p.foto))}"')
loja=seg(iLojaJs,iPed-1); pedido=seg(iPed,iAce-1)
dados=seg(iDad,iAdmJs-1); idx=[l for l in dados.split('\n') if l.startswith('function indexProducts')][0]
admin=seg(iAdmJs,iPla-1).replace('src="${esc(p.foto)}"','src="${esc(srcOf(p.foto))}"')
plan=seg(iPla,iCfg-1)
# ---------------- LOJA (index.html) ----------------
store_html=seg(iLoja,iGate-1)+'\n'+seg(iScrim,iScript-1)
store_js='\n'.join(['<script>',helpers,'const srcOf=f=>f;',imagem,loja,pedido,idx,r'''
function applyWa(){$('#heroWa').href=waUrl('Olá! Vim pelo site da CHL e gostaria de um orçamento.');$('#ctWa').href=waUrl('Olá! Vim pelo site da CHL.');$('#ctPhone').textContent=fmtPhone(S.wa);updateSend()}
renderStore();renderCart();applyWa();
(async()=>{
  try{const r=await fetch('dados/catalogo.json',{cache:'no-cache'});if(!r.ok)throw 0;const d=await r.json();
    if(d.whatsapp){S.wa=String(d.whatsapp);applyWa()}
    S.products=(d.produtos||[]).map(p=>({...p,nome:String(p.nome??'')}));
  }catch(e){const n=$('#storeNote');n.hidden=false;n.textContent='Não foi possível carregar o catálogo agora. Peça pelo WhatsApp enquanto isso.'}
  S.loaded=true;indexProducts();renderStore();renderCart();
})();
})();
</script>'''])
store=doc('CHL Distribuidora · Chaves e peças automotivas','Distribuidora de chaves e peças automotivas para chaveiros. 20 anos de mercado, envio para todo o Brasil. Santa Gertrudes - SP.',
          headrest.replace(xlsx,''),svg+'\n'+store_html+'\n'+store_js)
# ---------------- PAINEL (painel.html) ----------------
adm_html=seg(iGate,iScrim-1)
adm_html=adm_html.replace('<div id="gateView" class="gate" hidden>','<div id="gateView" class="gate">')
adm_html=adm_html.replace('<a href="#inicio">← Voltar para a loja</a>','<a href="./">← Voltar para a loja</a>')
adm_html=adm_html.replace('<a class="btn btn-line" href="#inicio">Ver loja</a>','<span class="label" id="dirty" hidden style="color:var(--warn);align-self:center">● Alterações não publicadas</span><a class="btn btn-line" href="./" target="_blank" rel="noopener">Ver loja</a><button class="btn btn-red" id="exportSite" type="button">Baixar atualização do site</button>')
adm_html=adm_html.replace('<div class="kpis">','<div class="note" id="draftNote" hidden style="margin-top:22px"></div>\n    <div class="kpis">',1)
pw_start=adm_html.index('<div class="panel">\n        <h3>Senha do painel</h3>')
pw_end=adm_html.index('</div>\n    </div>\n  </div>\n</div>',pw_start)
adm_html=adm_html[:pw_start]+'''<div class="panel">
        <h3>Como publicar as mudanças</h3>
        <p>1. Faça as alterações aqui (preços, fotos, planilha). Elas ficam guardadas neste navegador como rascunho.<br>2. Clique em <b>Baixar atualização do site</b>. Vem um arquivo .zip com a pasta <b>dados</b> (e <b>fotos</b>, se houver fotos novas).<br>3. Descompacte por cima da pasta do site, substituindo os arquivos, e envie a pasta inteira de novo no Netlify.</p>
        <button class="btn btn-line" id="exportJson" type="button">Baixar só o catalogo.json</button>
        <button class="btn btn-ghost" id="discardDraft" type="button">Descartar rascunho e recarregar do site</button>
      </div>'''+adm_html[pw_end:]
adm_html=adm_html.replace('Os pedidos do carrinho são enviados para este número.','Os pedidos do carrinho são enviados para este número. Vale depois de baixar e publicar a atualização.')
gate_js=r'''
/* ---------- senha (verificada no navegador) ---------- */
const ACC={salt:'__SALT__',hash:'__HASH__'};
async function derive(pwd,salt){const enc=new TextEncoder();const key=await crypto.subtle.importKey('raw',enc.encode(pwd),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:150000,hash:'SHA-256'},key,256);return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('')}
let fails=0,lockUntil=0;
$('#gateMsg').textContent='Digite a senha para abrir o painel.';$('#gateForm').hidden=false;$('#gPwd2').hidden=true;
$('#gateForm').addEventListener('submit',async e=>{e.preventDefault();const err=$('#gErr');
  if(Date.now()<lockUntil){err.textContent=`Muitas tentativas. Aguarde ${Math.ceil((lockUntil-Date.now())/1000)} segundos.`;return}
  const h=await derive($('#gPwd').value,ACC.salt);
  if(h===ACC.hash){fails=0;S.unlocked=true;ss.set('chl-painel',h);$('#gPwd').value='';route()}
  else{fails++;$('#gPwd').value='';err.textContent='Senha incorreta.';if(fails>=5){lockUntil=Date.now()+30000;fails=0;err.textContent='Senha incorreta. Aguarde 30 segundos para tentar de novo.'}}});
$('#lockBtn').onclick=()=>{S.unlocked=false;ss.del('chl-painel');route()};
function route(){$('#gateView').hidden=S.unlocked;$('#adminView').hidden=!S.unlocked;if(S.unlocked)renderAdmin();else setTimeout(()=>$('#gPwd').focus(),50)}
'''.replace('__SALT__',SALT).replace('__HASH__',HASH)
store_js_p=r'''
/* ---------- rascunho local + fotos no navegador ---------- */
const IDB={d:null,open(){return this.d||(this.d=new Promise((res,rej)=>{const r=indexedDB.open('chl-painel',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async tx(mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction('f',mode);const s=t.objectStore('f');const out=fn(s);t.oncomplete=()=>res(out&&out.result);t.onerror=()=>rej(t.error)})},
 put(k,v){return this.tx('readwrite',s=>s.put(v,k))},get(k){return this.tx('readonly',s=>s.get(k))},clear(){return this.tx('readwrite',s=>s.clear())}};
const BLOB={};const srcOf=f=>BLOB[f]||f;
function renderStore(){} function renderCart(){} function openCart(){}
function payload(){return{atualizado:new Date().toISOString(),whatsapp:S.wa,produtos:S.products.map(({_s,_b,...r})=>r)}}
function setDirty(v){S.dirty=v;$('#dirty').hidden=!v;try{localStorage.setItem('chl-painel-dirty',v?'1':'')}catch(e){}}
function saveDraft(){try{localStorage.setItem('chl-painel-rascunho',JSON.stringify(payload()))}catch(e){toast('O navegador não conseguiu guardar o rascunho. Baixe a atualização agora.')}setDirty(true)}
async function saveChunk(){}
async function persist(b,msg){saveDraft();if(msg)toast(msg);return true}
function pickChunk(){return 'x'}
'''+idx+'\n'
admin_p=admin+r'''
$('#photoInput').onchange=async e=>{
  const f=e.target.files[0],p=byId(photoTarget);if(!f||!p)return;
  try{const blob=await shrink(f);const path='fotos/'+p.id.replace(/[^A-Za-z0-9_-]/g,'-')+'.jpg';await IDB.put(path,blob);if(BLOB[path])URL.revokeObjectURL(BLOB[path]);BLOB[path]=URL.createObjectURL(blob);p.foto=path;afterLocalChange();persist([],'Foto adicionada. Ela vai junto na próxima atualização.')}
  catch(err){toast('Não foi possível usar essa imagem. Tente outra.')}
};
'''
plan_p=plan.replace("async function saveFile(name,blob){if(!S.downloads)return;try{await S.downloads.save({filename:name,data:blob})}catch(e){if(e&&e.code!=='declined')toast('Não foi possível baixar o arquivo agora.')}}",
 "function saveFile(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}")
assert 'S.downloads' not in plan_p
plan_p=plan_p.replace("afterLocalChange();\n  const list=[...touched]","afterLocalChange();saveDraft();\n  const list=[...touched]")
boot_p=r'''
/* ---------- configurações e publicação ---------- */
$('#cfgSave').onclick=()=>{const d=$('#cfgWa').value.replace(/\D/g,'');if(d.length<10){toast('Número incompleto. Inclua o DDD.');return}S.wa=d.startsWith('55')&&d.length>11?d:'55'+d;saveDraft();toast('Número salvo no rascunho')};
$('#exportJson').onclick=()=>{saveFile('catalogo.json',new Blob([JSON.stringify(payload())],{type:'application/json'}));toast('Coloque o arquivo na pasta dados do site')};
$('#exportSite').onclick=async()=>{
  if(!window.JSZip){toast('O gerador de .zip não carregou. Use “Baixar só o catalogo.json”.');return}
  const zip=new JSZip();zip.file('dados/catalogo.json',JSON.stringify(payload()));let nf=0;
  for(const p of S.products){if(p.foto&&p.foto.startsWith('fotos/')){const b=await IDB.get(p.foto).catch(()=>null);if(b){zip.file(p.foto,b);nf++}}}
  const blob=await zip.generateAsync({type:'blob'});saveFile('atualizacao-site-chl.zip',blob);setDirty(false);
  toast(`Atualização baixada${nf?` com ${nf} foto${nf>1?'s':''}`:''}. Descompacte na pasta do site e envie no Netlify.`)};
let discArm=0;$('#discardDraft').onclick=async e=>{if(Date.now()-discArm>3000){discArm=Date.now();e.target.textContent='Toque de novo para descartar';setTimeout(()=>{e.target.textContent='Descartar rascunho e recarregar do site'},3000);return}
  try{localStorage.removeItem('chl-painel-rascunho')}catch(x){}setDirty(false);await IDB.clear().catch(()=>{});location.reload()};
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));$$('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==t.dataset.tab)});
/* ---------- início ---------- */
S.admin=true;S.assets=true;$('#tplBtn').hidden=false;$('#exportBtn').hidden=false;
if(ss.get('chl-painel')===ACC.hash)S.unlocked=true;
route();
(async()=>{
  let d=null,draft=null;
  try{draft=JSON.parse(localStorage.getItem('chl-painel-rascunho')||'null')}catch(e){}
  try{const r=await fetch('dados/catalogo.json',{cache:'no-cache'});if(r.ok)d=await r.json()}catch(e){}
  const src=draft||d;
  if(!src){const n=$('#draftNote');n.hidden=false;n.textContent='Não encontrei o arquivo dados/catalogo.json. Abra o painel pelo endereço do site no Netlify.';return}
  if(draft){const n=$('#draftNote');n.hidden=false;n.textContent=`Você está editando um rascunho salvo neste navegador (${new Date(draft.atualizado).toLocaleString('pt-BR')}). Baixe a atualização e publique no Netlify para os clientes verem.`;setDirty((()=>{try{return !!localStorage.getItem('chl-painel-dirty')}catch(e){return true}})())}
  if(src.whatsapp)S.wa=String(src.whatsapp);$('#cfgWa').value=fmtPhone(S.wa);
  S.products=(src.produtos||[]).map(p=>({...p,nome:String(p.nome??'')}));
  for(const p of S.products){if(p.foto&&p.foto.startsWith('fotos/')){const b=await IDB.get(p.foto).catch(()=>null);if(b)BLOB[p.foto]=URL.createObjectURL(b)}}
  S.loaded=true;indexProducts();renderAdmin();
})();
addEventListener('beforeunload',e=>{if(S.dirty){e.preventDefault();e.returnValue=''}});
})();
</script>'''
# remove a ligação das abas e de exportação já feita no bloco de planilhas/área (mantidas), evita duplicar abas
admin_p=admin_p.replace("$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));$$('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==t.dataset.tab)});",'')
painel_js='\n'.join(['<script>',helpers,store_js_p,imagem,gate_js,admin_p,plan_p,boot_p])
jszip='<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>'
painel=doc('CHL · Área do lojista','Painel interno da CHL Distribuidora.',headrest.replace(xlsx,'<script src="js/xlsx.full.min.js"></script>\n<script src="js/jszip.min.js"></script>'),
           svg+'\n'+adm_html+'\n<div class="toast" id="toast" role="status"></div>\n'+painel_js,robots=True)
# ---------------- saída ----------------
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT+'/dados')
open(OUT+'/index.html','w',encoding='utf-8').write(store)
open(OUT+'/painel.html','w',encoding='utf-8').write(painel)
shutil.copy(cat_path,OUT+'/dados/catalogo.json')
base=os.path.join(os.path.dirname(__file__),'..')
shutil.copytree(base+'/sprites',OUT+'/sprites')
os.makedirs(OUT+'/img')
for f in ['logo-circulo.png','favicon.png','estoque-prateleiras.jpg','estoque-gavetas.jpg','treinamento.jpg']: shutil.copy(base+'/img/'+f,OUT+'/img/'+f)
shutil.copytree(os.path.join(os.path.dirname(__file__),'js'),OUT+'/js')
open(OUT+'/_headers','w').write('/dados/*\n  Cache-Control: no-cache\n/painel.html\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n')
print('ok')
