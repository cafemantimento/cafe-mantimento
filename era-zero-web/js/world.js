'use strict';
// ======================================================================
//  Mundo: relevo e biomas (800 x 800 m)
// ======================================================================
const SIZE=800,HALF=400,WATER=6,STEP=2.5,SEG=SIZE/STEP,CHUNK=100,NCH=SIZE/CHUNK;
const OX=R()*1000,OZ=R()*1000;
const BIOMES=['temperada','neve','deserto','savana','tropical','pantano','ilhas'];
const BIOME_INFO={
  temperada:{name:'Floresta Temperada',tmin:7,tmax:25,weather:{limpo:5,nublado:3,chuva:2,tempestade:0.6,neblina:1.2},music:'temperada'},
  neve:{name:'Montanhas Nevadas',tmin:-14,tmax:2,weather:{limpo:2,nublado:3,neve:4,nevasca:1.2,neblina:1},music:'neve'},
  deserto:{name:'Deserto',tmin:6,tmax:41,weather:{limpo:7,nublado:1,areia:1.3},music:'deserto'},
  savana:{name:'Savana',tmin:15,tmax:33,weather:{limpo:6,nublado:2,tempestade:1},music:'savana'},
  tropical:{name:'Floresta Tropical',tmin:21,tmax:32,weather:{limpo:3,nublado:2,chuva:4,tempestade:1.5,neblina:1},music:'tropical'},
  pantano:{name:'Pântano',tmin:11,tmax:27,weather:{nublado:3,chuva:3,neblina:4,tempestade:0.6},music:'pantano'},
  ilhas:{name:'Ilhas Tropicais',tmin:20,tmax:31,weather:{limpo:6,nublado:2,chuva:2,tempestade:0.8},music:'ilhas'},
  caverna:{name:'Caverna Subterrânea',tmin:11,tmax:13,weather:{limpo:1},music:'caverna'},
};
const ISLANDS=[{x:-262,z:262,r:46,h:14},{x:-338,z:182,r:30,h:10},{x:-196,z:342,r:36,h:12},{x:-345,z:340,r:42,h:16},{x:-150,z:330,r:22,h:8}];
const RIVER=[[30,-375],[-5,-260],[-50,-150],[-75,-55],[-100,40],[-150,110],[-205,165],[-250,215]];
const POIS=[
  {id:'ruinas',name:'Ruínas da Cidade',x:-20,z:-125,biome:'temperada'},
  {id:'posto',name:'Posto Abandonado',x:300,z:-40,biome:'deserto'},
  {id:'cabana',name:'Cabana do Guarda',x:70,z:-300,biome:'neve'},
  {id:'templo',name:'Templo de Pedra',x:20,z:320,biome:'tropical'},
  {id:'palafita',name:'Palafita do Pântano',x:-300,z:-10,biome:'pantano'},
  {id:'torre',name:'Torre de Vigia',x:280,z:280,biome:'savana'},
  {id:'naufragio',name:'Naufrágio',x:-262,z:242,biome:'ilhas'},
  {id:'cav_neve',name:'Caverna do Gelo',x:-70,z:-275,biome:'neve',cave:0},
  {id:'cav_deserto',name:'Caverna do Cânion',x:335,z:95,biome:'deserto',cave:1},
  {id:'cav_selva',name:'Caverna da Selva',x:-75,z:290,biome:'tropical',cave:2},
];
const S=t=>smooth(t);
function warp(x,z){return [x+(noise(x*0.006+11,z*0.006+3)-0.5)*90,z+(noise(x*0.006+7,z*0.006+19)-0.5)*90];}
function biomeWeights(x,z){const [wx,wz]=warp(x,z);
  const snow=S((-wz-170)/70),des=S((wx-170)/70)*S((170-wz)/80)*(1-snow),sav=S((wx-90)/70)*S((wz-130)/70),
    trop=S((wz-190)/70)*S((110-wx)/70)*S((wx+150)/70),swamp=S((-wx-170)/70)*S((140-wz)/80)*(1-snow),isl=S((-wx-110)/70)*S((wz-120)/70);
  let tot=snow+des+sav+trop+swamp+isl;const temp=Math.max(0,1-tot);tot+=temp;
  return [temp/tot,snow/tot,des/tot,sav/tot,trop/tot,swamp/tot,isl/tot];}
function hTemp(x,z){return 4+fbm(x*0.0055+OX,z*0.0055+OZ,5)*18+(noise(x*0.035+OZ,z*0.035+OX)-0.5)*2.5;}
function hSnow(x,z){const r=1-Math.abs(noise(x*0.012+OX,z*0.012+OZ)*2-1),r2=1-Math.abs(noise(x*0.03+OZ,z*0.03+OX)*2-1);return 20+r*r*46+r2*9+fbm(x*0.006,z*0.006,3)*10;}
function hDes(x,z){const d=Math.sin(x*0.045+noise(x*0.01,z*0.01)*6)*Math.cos(z*0.02)*2.2;const mesa=S((noise(x*0.008+40,z*0.008+5)-0.68)/0.04)*13;return 9+d+fbm(x*0.004+9,z*0.004,3)*6+mesa;}
function hSav(x,z){return 8.5+fbm(x*0.005+3,z*0.005+8,4)*7;}
function hTrop(x,z){return 7+fbm(x*0.008+5,z*0.008+1,5)*22;}
function hSwamp(x,z){return WATER-0.2+(fbm(x*0.03+1,z*0.03+2,3)-0.5)*3.4;}
function hIsl(x,z){let h=-7+noise(x*0.02,z*0.02)*2;for(const I of ISLANDS){const d=Math.hypot(x-I.x,z-I.z)/I.r;if(d<1)h=Math.max(h,-7+(1-d*d)*(I.h+7)+(noise(x*0.05,z*0.05)-0.5)*3*(1-d));}return h;}
const HFN=[hTemp,hSnow,hDes,hSav,hTrop,hSwamp,hIsl];
function riverDist(x,z){let best=1e9;for(let i=0;i<RIVER.length-1;i++){const [ax,az]=RIVER[i],[bx,bz]=RIVER[i+1];const dx=bx-ax,dz=bz-az;const t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);const d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<best)best=d;}return best;}
function rawH(x,z){const w=biomeWeights(x,z);let h=0;for(let i=0;i<7;i++)if(w[i]>0.001)h+=w[i]*HFN[i](x,z);
  const d=Math.max(Math.abs(x),Math.abs(z))/HALF;if(d>0.86){const t=(d-0.86)/0.14;h+=t*t*60*(1-w[6]);}
  const rd=riverDist(x,z)+(noise(x*0.05,z*0.05)-0.5)*4;if(rd<14)h=lerp(h,Math.min(h,WATER-1.8),S(1-rd/14));
  const sd=Math.hypot(x,z);if(sd<45)h=lerp(h,11,S(1-sd/45)*0.9);
  const pd=Math.hypot(x-26,z+24);if(pd<17)h=lerp(h,3.2,S(1-pd/17));
  for(const p of POIS){const dd=Math.hypot(x-p.x,z-p.z);if(dd<24){const base=p.id==='naufragio'?WATER+1.2:Math.max(WATER+2,p.flat||(p.flat=HFN[BIOMES.indexOf(p.biome)](p.x,p.z)));h=lerp(h,base,S(1-dd/24)*0.92);}}
  return Math.max(h,-9);}
const HG=new Float32Array((SEG+1)*(SEG+1));
for(let j=0;j<=SEG;j++)for(let i=0;i<=SEG;i++)HG[j*(SEG+1)+i]=rawH(-HALF+i*STEP,-HALF+j*STEP);
function H(x,z){let fx=(x+HALF)/STEP,fz=(z+HALF)/STEP;fx=clamp(fx,0,SEG-0.0001);fz=clamp(fz,0,SEG-0.0001);
  const i=Math.floor(fx),j=Math.floor(fz);fx-=i;fz-=j;const W=SEG+1;
  const h00=HG[j*W+i],h10=HG[j*W+i+1],h01=HG[(j+1)*W+i],h11=HG[(j+1)*W+i+1];
  return fx>fz? h00+(h10-h00)*fx+(h11-h10)*fz : h00+(h11-h01)*fx+(h01-h00)*fz;}
function slope(x,z){const e=1.0;const dx=H(x+e,z)-H(x-e,z),dz=H(x,z+e)-H(x,z-e);return Math.atan(Math.hypot(dx,dz)/(2*e))*180/Math.PI;}
function normalAt(x,z){const e=0.5;return new THREE.Vector3(H(x-e,z)-H(x+e,z),2*e,H(x,z-e)-H(x,z+e)).normalize();}
// mapa de biomas em grade de 10 m (consulta rápida)
const BGN=SIZE/10+1,BG=new Uint8Array(BGN*BGN);
for(let j=0;j<BGN;j++)for(let i=0;i<BGN;i++){const w=biomeWeights(-HALF+i*10,-HALF+j*10);let b=0;for(let k=1;k<7;k++)if(w[k]>w[b])b=k;BG[j*BGN+i]=b;}
function biomeIdx(x,z){const i=clamp(Math.round((x+HALF)/10),0,BGN-1),j=clamp(Math.round((z+HALF)/10),0,BGN-1);return BG[j*BGN+i];}
function biomeAt(x,z){return BIOMES[biomeIdx(x,z)];}

const WATER_NORMAL=(function(){const N=128,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');const img=x.createImageData(N,N);
  const hf=(i,j)=>{let v=0;for(const [f,a] of [[4,1],[8,0.5],[16,0.25]]){v+=a*Math.sin((i/N)*Math.PI*2*f*0.5+Math.cos((j/N)*Math.PI*2*f*0.25)*2)*Math.cos((j/N)*Math.PI*2*f*0.5);}return v;};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=hf((i+1)%N,j)-hf((i-1+N)%N,j),dz=hf(i,(j+1)%N)-hf(i,(j-1+N)%N);const n=new THREE.Vector3(-dx*2,1,-dz*2).normalize();const o=(j*N+i)*4;img.data[o]=(n.x*0.5+0.5)*255;img.data[o+1]=(n.z*0.5+0.5)*255;img.data[o+2]=(n.y*0.5+0.5)*255;img.data[o+3]=255;}
  x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(140,140);return t;})();

// ---------------- terreno em blocos (carregamento por região)
const BCOL={temperada:[0x4f7a2e,0x6a8f34],neve:[0xe6edf2,0xd3dde6],deserto:[0xd8b878,0xc9a35f],savana:[0xa9a24c,0xc0a95c],tropical:[0x2e7a2a,0x45922f],pantano:[0x4b5a2c,0x5b4a30],ilhas:[0x5a9a3a,0x6fae45]};
const terrainChunks=[];
function buildTerrain(lod){
  for(const c of terrainChunks)scene.remove(c);terrainChunks.length=0;
  const W=SEG+1,tmp=new THREE.Color(),cRock=new THREE.Color(0x77787a),cDirt=new THREE.Color(0x7a6040),cSand=new THREE.Color(0xd2bf8a),cSnow=new THREE.Color(0xeef3f7),cWet=new THREE.Color(0x6b5c40);
  const bc=BIOMES.map(b=>[new THREE.Color(BCOL[b][0]),new THREE.Color(BCOL[b][1])]);const vr=rng(99);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  const cells=CHUNK/STEP;
  for(let cz=0;cz<NCH;cz++)for(let cx=0;cx<NCH;cx++){
    const n=cells/lod,pos=new Float32Array(n*n*18),col=new Float32Array(n*n*18);let o=0;
    const put=(i,j,c)=>{pos[o]=-HALF+i*STEP;pos[o+1]=HG[j*W+i];pos[o+2]=-HALF+j*STEP;col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;o+=3;};
    const tri=(ai,aj,bi,bj,ci,cj)=>{const ay=HG[aj*W+ai],by=HG[bj*W+bi],cy=HG[cj*W+ci];
      const X=i=>-HALF+i*STEP;const v1=new THREE.Vector3(X(bi)-X(ai),by-ay,X(bj)-X(aj)),v2=new THREE.Vector3(X(ci)-X(ai),cy-ay,X(cj)-X(aj));const nn=v1.cross(v2).normalize();
      const h=(ay+by+cy)/3,mx=(X(ai)+X(bi)+X(ci))/3,mz=(X(aj)+X(bj)+X(cj))/3;const w=biomeWeights(mx,mz);
      tmp.setRGB(0,0,0);const nz=noise(mx*0.12,mz*0.12);for(let k=0;k<7;k++)if(w[k]>0.001){tmp.r+=w[k]*lerp(bc[k][0].r,bc[k][1].r,nz);tmp.g+=w[k]*lerp(bc[k][0].g,bc[k][1].g,nz);tmp.b+=w[k]*lerp(bc[k][0].b,bc[k][1].b,nz);}
      const patch=noise(mx*0.045+OX,mz*0.045+OZ);if(w[0]+w[4]>0.5&&patch>0.64)tmp.lerp(cDirt,0.6);
      if(h<WATER-0.3)tmp.lerp(cWet,0.7);else if(h<WATER+1.4&&w[5]<0.5)tmp.lerp(cSand,0.85);else if(h<WATER+2.2&&w[5]<0.5)tmp.lerp(cSand,0.4);
      if(nn.y<0.78||h>48)tmp.lerp(cRock,nn.y<0.7?0.9:0.55);
      if(w[1]>0.3&&(h>26||nn.y>0.8))tmp.lerp(cSnow,clamp(w[1]*1.3,0,1)*(nn.y<0.72?0.3:0.95));
      if(h>62)tmp.lerp(cSnow,0.8);
      const k=0.93+vr()*0.11;tmp.multiplyScalar(k).convertSRGBToLinear();put(ai,aj,tmp);put(bi,bj,tmp);put(ci,cj,tmp);};
    const i0=cx*cells,j0=cz*cells;
    for(let j=j0;j<j0+cells;j+=lod)for(let i=i0;i<i0+cells;i+=lod){tri(i,j,i+lod,j+lod,i+lod,j);tri(i,j,i,j+lod,i+lod,j+lod);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.userData.chunk=[cx,cz];scene.add(m);terrainChunks.push(m);}
}
const waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(SIZE*3,SIZE*3),new THREE.MeshPhongMaterial({color:lin(0x1c5d72),transparent:true,opacity:0.84,shininess:140,specular:lin(0xd8ecff),normalMap:WATER_NORMAL,normalScale:new THREE.Vector2(0.45,0.45)}));
waterMesh.rotation.x=-Math.PI/2;waterMesh.position.y=WATER;scene.add(waterMesh);

// ======================================================================
//  Utilidades de geometria
// ======================================================================
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_s=new THREE.Vector3();
function M(x,y,z,rx,ry,rz,sx,sy,sz){_e.set(rx||0,ry||0,rz||0);_q.setFromEuler(_e);return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q,new THREE.Vector3(sx==null?1:sx,sy==null?(sx==null?1:sx):sy,sz==null?(sx==null?1:sx):sz));}
function merge(list){let total=0;const parts=list.map(([g,m])=>{let q=g.index?g.toNonIndexed():g.clone();q.applyMatrix4(m);total+=q.attributes.position.count;return q;});
  const pos=new Float32Array(total*3);let o=0;for(const q of parts){pos.set(q.attributes.position.array,o);o+=q.attributes.position.array.length;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.computeVertexNormals();return geo;}
function lumpy(detail,amp,seed){const g=new THREE.IcosahedronGeometry(1,detail);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const h=Math.sin(x*12.9898+y*78.233+z*37.719+seed*13.37)*43758.5453;const d=1+((h-Math.floor(h))-0.5)*2*amp;p.setXYZ(i,x*d,y*d,z*d);}
  g.computeVertexNormals();return g;}
const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:lin(c)},o||{}));
const MAT={bark:mat(0x5c4029),pine:mat(0x29522b),leaf:mat(0x4d7530),rock:mat(0x8a8a8c),bush:mat(0x3d6b29),berry:mat(0xcc1f33),
  wood:mat(0x9c7a4e),woodDark:mat(0x614226),stone:mat(0x737476),concrete:mat(0x8c8a85),concreteDark:mat(0x555557),rust:mat(0x73402a),glass:mat(0x2e3c42),
  skin:mat(0xc28f6b),boar:mat(0x5a4030),boarDark:mat(0x33241a),snout:mat(0xbf8073),tusk:mat(0xebe5d1),wolf:mat(0x6b6b70),wolfDark:mat(0x38383d),
  flame:new THREE.MeshBasicMaterial({color:lin(0xff8a2a)}),flameCore:new THREE.MeshBasicMaterial({color:lin(0xffe08a)}),eye:new THREE.MeshBasicMaterial({color:lin(0xffcc33)}),led:new THREE.MeshBasicMaterial({color:lin(0xff3322)}),
  cloth:mat(0x476641),crate:mat(0x80613a),metal:mat(0xb3b8bf),sandstone:mat(0xc9a46a),sandDark:mat(0x9c7a4a),mossStone:mat(0x6f7a5e),gold:mat(0xe0b040),
  crystal:new THREE.MeshLambertMaterial({color:lin(0x7fe8ff),emissive:lin(0x2aa8d8)}),crystal2:new THREE.MeshLambertMaterial({color:lin(0xd08cff),emissive:lin(0x8a3ad8)}),
  caveRock:mat(0x6a6466),ice:mat(0xbfe6f5)};
function box(parent,x,y,z,sx,sy,sz,m,rx,ry,rz){const b=new THREE.Mesh(BOXG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.rotation.set(rx||0,ry||0,rz||0);b.castShadow=true;b.receiveShadow=true;parent.add(b);return b;}
const BOXG=new THREE.BoxGeometry(1,1,1),CYLG=new THREE.CylinderGeometry(0.5,0.5,1,8),SPHG=new THREE.SphereGeometry(0.5,10,8);
function cyl(parent,x,y,z,sx,sy,sz,m,rx,ry,rz){const b=new THREE.Mesh(CYLG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.rotation.set(rx||0,ry||0,rz||0);b.castShadow=true;parent.add(b);return b;}
function sph(parent,x,y,z,sx,sy,sz,m){const b=new THREE.Mesh(SPHG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.castShadow=true;parent.add(b);return b;}

// ======================================================================
//  Mundo: vegetação, recursos e pontos de interesse
// ======================================================================
const nodes=[];        // recursos que se golpeiam
const pickups=[];      // itens soltos no chão
const boxColliders=[]; // caixas sólidas (ruínas e construções)
const interactables=[];// baús, entradas de caverna, tesouros: {x,y,z,r,prompt(),use()}
const ZERO=new THREE.Matrix4().makeScale(0,0,0);
const ruins=POIS[0];
// grade espacial dos recursos (consultas rápidas de colisão e mira)
const NGRID=new Map(),NG=16;
function ngKey(x,z){return Math.floor(x/NG)+','+Math.floor(z/NG);}
function addNode(n){n.idx=nodes.length;nodes.push(n);const k=ngKey(n.x,n.z);let a=NGRID.get(k);if(!a)NGRID.set(k,a=[]);a.push(n);return n;}
function nodesNear(x,z,r,fn){const i0=Math.floor((x-r)/NG),i1=Math.floor((x+r)/NG),j0=Math.floor((z-r)/NG),j1=Math.floor((z+r)/NG);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=NGRID.get(i+','+j);if(a)for(const n of a)fn(n);}}
function instanced(geo,material,count){const m=new THREE.InstancedMesh(geo,material,count);m.castShadow=true;m.receiveShadow=true;m.userData.n=0;scene.add(m);return m;}
function addInst(mesh,matrix,color){const i=mesh.userData.n++;mesh.setMatrixAt(i,matrix);if(color)mesh.setColorAt(i,color);return i;}

// Tipos de recurso: o que cada golpe dá e qual ferramenta rende mais
const NODE_DEFS={
  tree:{name:'Árvore',tool:'axe',hp:100},
  palm:{name:'Coqueiro',tool:'axe',hp:90},
  willow:{name:'Salgueiro',tool:'axe',hp:100},
  rock:{name:'Rocha',tool:'pick',hp:100},
  cobre:{name:'Veio de Cobre',tool:'pick',hp:130,needs:'pick'},
  ferro:{name:'Veio de Ferro',tool:'pick',hp:150,needs:'pick'},
  cristal:{name:'Cristal da Caverna',tool:'pick',hp:120,needs:'pick'},
  cactus:{name:'Cacto',tool:'axe',hp:50},
  bush:{name:'Arbusto de Frutinhas',tool:null,hp:40},
  reed:{name:'Juncos',tool:null,hp:30},
  scrap:{name:'Monte de Sucata',tool:'pick',hp:80},
};

// ---------------- modelos da natureza (Quaternius, CC0)
const NAT={geo:{},info:null,ok:false};
const matVeg=new THREE.MeshLambertMaterial({vertexColors:true}),matSolid=new THREE.MeshLambertMaterial({vertexColors:true});
const matCrystal=new THREE.MeshLambertMaterial({vertexColors:true,emissive:lin(0x1a6a8a)});
function decodeNature(buf,info){NAT.info=info;
  for(const name in info){const m=info[name];const n=m.n;const q=new Int16Array(buf,m.off,n*3);const p=new Float32Array(n*3);for(let i=0;i<n*3;i++)p[i]=q[i]*m.scale;
    const c=new Uint8Array(buf,m.coff,n*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(new Uint8Array(c),3,true));
    g.computeVertexNormals();g.computeBoundingSphere();NAT.geo[name]=g;}
  NAT.ok=true;}
// Se o pacote não carregar, cria modelos simples equivalentes (o jogo continua funcionando)
function fallbackModel(kind){const g=kind==='rock'?lumpy(1,0.22,5):kind==='bush'?lumpy(1,0.25,7):merge([[new THREE.CylinderGeometry(0.06,0.09,1.4,6),M(0,0.7,0)],[new THREE.ConeGeometry(0.6,1.6,7),M(0,1.8,0)]]);
  const n=g.attributes.position.count,c=new Uint8Array(n*3),col=kind==='rock'?[120,120,122]:[60,110,50];for(let i=0;i<n;i++){c[i*3]=col[0];c[i*3+1]=col[1];c[i*3+2]=col[2];}
  if(kind==='rock'){g.scale(0.5,0.35,0.5);g.translate(0,0.25,0);}
  g.setAttribute('color',new THREE.BufferAttribute(c,3,true));g.computeBoundingSphere();return g;}
function natGeo(name){if(NAT.geo[name])return NAT.geo[name];const k=/Rock/.test(name)?'rock':/Bush|Plant|Flower|Grass|Wheat|Lily/.test(name)?'bush':'tree';return NAT.geo[name]=fallbackModel(k);}
function natH(name){return NAT.info&&NAT.info[name]?NAT.info[name].h:2;}
function natR(name){return NAT.info&&NAT.info[name]?NAT.info[name].r:0.6;}

// Densidade por célula de 6 m em cada bioma: [modelo(s), probabilidade, escala, tipo de recurso ou null (enfeite), extra]
const VEG={
  temperada:[[['CommonTree_1','CommonTree_2','CommonTree_3','CommonTree_5'],0.085,[2.6,3.4],'tree'],[['BirchTree_1','BirchTree_2','BirchTree_3'],0.025,[2.4,3],'tree'],[['PineTree_1','PineTree_2','PineTree_3'],0.03,[2.6,3.3],'tree'],
    [['BushBerries_1','BushBerries_2'],0.028,[1.2,1.5],'bush'],[['Rock_1','Rock_2','Rock_3','Rock_4','Rock_5','Rock_6','Rock_7'],0.022,[1.6,2.8],'rock'],[['Rock_Moss_1','Rock_Moss_2','Rock_Moss_3'],0.008,[1.6,2.6],'rock'],
    [['Bush_1','Bush_2'],0.03,[1.2,1.6],null],[['Plant_1','Plant_3','Plant_4','Flowers'],0.12,[1.0,1.5],null],[['TreeStump','TreeStump_Moss'],0.006,[1.3,1.7],null],[['Rock_4','Rock_6'],0.0025,[1.8,2.4],'ferro']],
  neve:[[['PineTree_Snow_1','PineTree_Snow_2','PineTree_Snow_3'],0.1,[2.6,3.6],'tree'],[['Rock_Snow_1','Rock_Snow_2','Rock_Snow_3'],0.035,[1.8,3],'rock'],[['Bush_Snow_1'],0.02,[1.2,1.6],null],
    [['Rock_4','Rock_5','Rock_6'],0.013,[1.8,2.6],'ferro'],[['Rock_2','Rock_7'],0.006,[1.8,2.6],'cobre'],[['TreeStump_Snow'],0.006,[1.3,1.6],null]],
  deserto:[[['Cactus_1','Cactus_2','Cactus_3','Cactus_4'],0.03,[1.8,2.6],'cactus'],[['CactusFlowers_2','CactusFlowers_3'],0.008,[1.6,2.2],'cactus'],[['Rock_1','Rock_3','Rock_5','Rock_7'],0.02,[1.8,3.2],'rock'],
    [['Rock_2','Rock_4','Rock_6'],0.013,[1.8,2.8],'cobre'],[['Rock_6'],0.003,[2,2.6],'ferro']],
  savana:[[['CommonTree_4','CommonTree_5'],0.014,[2.8,3.4],'tree',{sy:0.62,tint:0xd8d090}],[['Wheat'],0.16,[1.1,1.6],null],[['Grass','Grass_2'],0.08,[1.2,1.8],null],[['Rock_1','Rock_5'],0.01,[1.6,2.6],'rock'],
    [['BushBerries_2'],0.008,[1.2,1.4],'bush'],[['Bush_2'],0.012,[1.2,1.6],null],[['Rock_2'],0.003,[2,2.6],'cobre']],
  tropical:[[['PalmTree_1','PalmTree_3','PalmTree_4'],0.045,[2.2,2.8],'palm'],[['CommonTree_1','CommonTree_2'],0.055,[3.4,4.4],'tree',{tint:0x9fe08a}],[['Plant_2','Plant_4','Plant_5'],0.25,[1.5,2.4],null],
    [['Flowers','Plant_1'],0.06,[1.2,1.6],null],[['BushBerries_1'],0.02,[1.3,1.6],'bush'],[['Rock_Moss_1','Rock_Moss_2','Rock_Moss_3'],0.014,[1.6,2.6],'rock']],
  pantano:[[['Willow_1','Willow_2','Willow_3'],0.055,[2.6,3.4],'willow'],[['Plant_3','Plant_5'],0.1,[1.2,1.8],null],[['Grass_2'],0.05,[1.4,2],'reed',{tint:0x8aa060}],[['Grass','Grass_2'],0.14,[1.2,1.9],null,{tint:0x9ab070}],
    [['Rock_Moss_1','Rock_Moss_3'],0.01,[1.6,2.4],'rock'],[['TreeStump_Moss'],0.01,[1.3,1.7],null],[['BushBerries_2'],0.01,[1.2,1.5],'bush']],
  ilhas:[[['PalmTree_1','PalmTree_2','PalmTree_3','PalmTree_4'],0.07,[2.2,2.8],'palm'],[['Rock_1','Rock_3'],0.012,[1.6,2.6],'rock'],[['Bush_1'],0.02,[1.2,1.5],null],[['Plant_1','Plant_4'],0.05,[1.2,1.8],null],[['BushBerries_1'],0.01,[1.2,1.4],'bush']],
};
const vegChunks=[];// {cx,cz,meshes:[{mesh,kind}]}
function populateWorld(){
  const rr=rng(4242),buckets=new Map(),colr=new THREE.Color();
  const bucket=(name,cx,cz,kind,mat)=>{const k=name+'|'+cx+'|'+cz;let b=buckets.get(k);if(!b)buckets.set(k,b={name,cx,cz,kind,mat,items:[]});return b;};
  const nearPoi=(x,z,r)=>POIS.some(p=>Math.hypot(x-p.x,z-p.z)<r);
  const C=6;
  for(let gz=-HALF+12;gz<HALF-12;gz+=C)for(let gx=-HALF+12;gx<HALF-12;gx+=C){
    const bi=biomeIdx(gx,gz),b=BIOMES[bi];const list=VEG[b];
    for(const [models,prob,sc,res,extra] of list){if(rr()>prob)continue;
      const x=gx+rr()*C,z=gz+rr()*C,h=H(x,z);const isLily=models[0]==='Lilypad';
      if(!isLily&&h<WATER+(res==='reed'?0.1:0.8))continue;if(slope(x,z)>(res==='rock'||res==='cobre'||res==='ferro'?38:30))continue;
      if(Math.hypot(x,z)<(res?9:5)||nearPoi(x,z,res?16:10)||riverDist(x,z)<(res?9:7))continue;
      const name=models[Math.floor(rr()*models.length)],s=lerp(sc[0],sc[1],rr()),ry=rr()*6.283,sy=extra&&extra.sy?extra.sy:1;
      const mtx=M(x,h-0.05,z,0,ry,0,s,s*sy,s);const cx=clamp(Math.floor((x+HALF)/CHUNK),0,NCH-1),cz=clamp(Math.floor((z+HALF)/CHUNK),0,NCH-1);
      const kind=res==='rock'||res==='cobre'||res==='ferro'?'rock':res?'tree':'decor';
      const tint=res==='cobre'?0xffa070:res==='ferro'?0xb08878:extra&&extra.tint?extra.tint:null;
      if(tint)colr.set(tint).convertSRGBToLinear();else{const v=0.9+rr()*0.2;colr.setRGB(v,v,v);}
      const bk=bucket(name,cx,cz,kind,kind==='rock'?matSolid:matVeg);bk.items.push({mtx,col:colr.clone(),res,x,z,h,s,sy,ry,name});}}
  // lírios d'água no pântano
  for(let k=0;k<1400;k++){const x=-HALF+rr()*SIZE,z=-HALF+rr()*SIZE,h=H(x,z);if(biomeAt(x,z)!=='pantano'||h>WATER-0.15||h<WATER-2.5)continue;
    const cx=clamp(Math.floor((x+HALF)/CHUNK),0,NCH-1),cz=clamp(Math.floor((z+HALF)/CHUNK),0,NCH-1);const s=1.3+rr()*0.8;
    bucket('Lilypad',cx,cz,'decor',matVeg).items.push({mtx:M(x,WATER-0.02,z,0,rr()*6.28,0,s),col:new THREE.Color(1,1,1),res:null});}
  // cria as malhas instanciadas por bloco e os recursos
  for(const b of buckets.values()){const geo=natGeo(b.name);const m=new THREE.InstancedMesh(geo,b.mat,b.items.length);
    m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(b.items.length*3),3);m.castShadow=b.kind!=='decor';m.receiveShadow=true;
    b.items.forEach((it,i)=>{m.setMatrixAt(i,it.mtx);m.setColorAt(i,it.col);
      if(it.res){const def=NODE_DEFS[it.res],h=natH(it.name)*it.s*it.sy,r=natR(it.name)*it.s;
        const isTree=it.res==='tree'||it.res==='palm'||it.res==='willow';
        const hit=isTree?[[1.0,0.7],[2.2,0.7]]:it.res==='cactus'?[[h*0.5,Math.max(0.5,r*0.7)]]:it.res==='bush'||it.res==='reed'?[[0.5,0.85]]:[[h*0.45,Math.max(0.6,r*0.95)]];
        addNode({type:it.res,name:def.name,x:it.x,y:it.h,z:it.z,s:it.s,ry:it.ry,r:isTree?0.32*it.s:it.res==='cactus'?0.3*it.s:it.res==='bush'||it.res==='reed'?0:r*0.85,
          hit,max:def.hp,hp:def.hp,alive:true,inst:[[m,i]],mtx:it.mtx,model:b.name,tall:isTree});}});
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;
    // esfera de recorte do bloco (para não desenhar o que está fora da visão)
    m.frustumCulled=true;m.userData.center=new THREE.Vector3(-HALF+(b.cx+0.5)*CHUNK,10,-HALF+(b.cz+0.5)*CHUNK);
    scene.add(m);let ch=vegChunks.find(c=>c.cx===b.cx&&c.cz===b.cz);if(!ch)vegChunks.push(ch={cx:b.cx,cz:b.cz,meshes:[]});ch.meshes.push({mesh:m,kind:b.kind});}
  for(const n of nodes)n.mtxs=n.inst.map(([m,i])=>{const t=new THREE.Matrix4();m.getMatrixAt(i,t);return t;});
  // InstancedMesh em r128 usa a esfera da geometria: cria uma esfera que cobre o bloco
  for(const ch of vegChunks)for(const e of ch.meshes){const src=e.mesh.geometry,g=new THREE.BufferGeometry();for(const k in src.attributes)g.setAttribute(k,src.attributes[k]);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(-HALF+(ch.cx+0.5)*CHUNK,20,-HALF+(ch.cz+0.5)*CHUNK),CHUNK*0.75+20);e.mesh.geometry=g;}
  // galhos e pedras soltas
  const stickG=merge([[CYLG,M(0,0.06,0,Math.PI/2,0,0,0.07,0.6,0.07)],[CYLG,M(0.12,0.08,0.1,Math.PI/2,0.7,0,0.05,0.4,0.05)]]);const rockG=natGeo('Rock_3');
  for(let i=0;i<520;i++){const spread=i<60?55:HALF-30;const x=(rr()*2-1)*spread,z=(rr()*2-1)*spread;const h=H(x,z);const b=biomeAt(x,z);if(h<WATER+0.3||slope(x,z)>30)continue;
    const g=new THREE.Group();g.position.set(x,h,z);g.rotation.y=rr()*6.28;scene.add(g);
    if(i%2===0&&b!=='deserto'&&b!=='neve'){const m=new THREE.Mesh(stickG,MAT.woodDark);m.castShadow=true;g.add(m);pickups.push({g,x,y:h,z,item:'madeira',n:2,name:'Galhos'});}
    else{const fl=rr()<0.35;const m=new THREE.Mesh(rockG,matSolid);m.scale.setScalar(0.45);g.add(m);pickups.push({g,x,y:h,z,item:'pedra',n:2,extra:fl?'silex':null,name:fl?'Pedras e Sílex':'Pedras'});}}
  buildPOIs(rr);buildCaves(rr);
}
// visibilidade por distância (qualidade gráfica define o alcance)
let vegTick=0;
function updateVegVisibility(dt){vegTick-=dt;if(vegTick>0)return;vegTick=0.4;const q=QUALITY();const cp=camera.position;
  for(const ch of vegChunks){const dx=Math.max(0,Math.abs(cp.x-(-HALF+(ch.cx+0.5)*CHUNK))-CHUNK/2),dz=Math.max(0,Math.abs(cp.z-(-HALF+(ch.cz+0.5)*CHUNK))-CHUNK/2);const d=Math.hypot(dx,dz);
    for(const e of ch.meshes)e.mesh.visible=!P.cave&&d<(e.kind==='decor'?q.decorDist:e.kind==='rock'?q.rockDist:q.treeDist);}
  for(const t of terrainChunks)t.visible=!P.cave;}

// ---------------- pontos de interesse (com baús e segredos)
const chests=[];
function addChest(x,y,z,id,tier,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;scene.add(g);
  box(g,0,0.3,0,1.1,0.6,0.7,MAT.crate);box(g,0,0.66,0,1.14,0.14,0.74,MAT.woodDark);box(g,0,0.45,0.36,0.16,0.2,0.04,MAT.gold);
  for(const sx of [-0.5,0.5])box(g,sx,0.35,0,0.06,0.62,0.72,MAT.metal);
  const c={id,x,y,z,g,tier};chests.push(c);
  interactables.push({x,y:y+0.4,z,r:0.9,kind:'chest',ref:c,
    prompt:()=>G.opened&&G.opened[id]?'Baú vazio':'[E] Abrir baú',
    use:()=>openChest(c)});return c;}
function lore(x,y,z,title,text,id){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);box(g,0,0.02,0,0.5,0.04,0.36,mat(0xe8dcc0));
  interactables.push({x,y:y+0.1,z,r:0.6,kind:'lore',prompt:()=>'[E] Ler anotação',use:()=>{banner(title,text);if(id)markSecret(id);}});}
function buildPOIs(rr){
  // ruínas (Era I: rádio)
  const rx=ruins.x,rz=ruins.z;const rg=new THREE.Group();rg.position.set(rx,0,rz);scene.add(rg);
  const block=(lx,ly,lz,sx,sy,sz,m,rx2,ryy,rz2,solid)=>{const gy=H(rx+lx,rz+lz);const b=box(rg,lx,gy+ly-0.15,lz,sx,sy,sz,m,rx2,ryy,rz2);
    if(solid)boxColliders.push({minx:rx+lx-sx/2,maxx:rx+lx+sx/2,minz:rz+lz-sz/2,maxz:rz+lz+sz/2,miny:gy+ly-0.15-sy/2,maxy:gy+ly-0.15+sy/2});return b;};
  block(-8,4,6,10,8,0.6,MAT.concrete,0,0,0,true);block(-13,3,1,0.6,6,10,MAT.concrete,0,0,0,true);block(-3.5,2,2,0.6,4,8,MAT.concrete,0,0,0.07,true);
  block(-8,8.2,3,10,0.4,6,MAT.concreteDark,0.1,0,-0.05);for(let i=0;i<4;i++)block(-11+i*2.5,5.5,6.32,1.2,1.4,0.05,MAT.glass);
  block(8,3,8,0.8,6,0.8,MAT.concrete,0,0,0,true);block(14,2,8,0.8,4,0.8,MAT.concrete,0,0,0,true);block(11,1.2,4,7,0.5,5,MAT.concreteDark,-0.2,0.14,0.26);
  const car=new THREE.Group();car.position.set(3,H(rx+3,rz-1),-1);car.rotation.set(0,0.6,0.05);rg.add(car);
  box(car,0,0.75,0,1.9,0.8,4.2,MAT.rust);box(car,0,1.45,-0.3,1.7,0.7,2.2,MAT.rust);box(car,0,1.45,0.82,1.6,0.6,0.05,MAT.glass,-0.5);
  for(const [wx,wz] of [[-0.95,1.3],[0.95,1.3],[-0.95,-1.3],[0.95,-1.3]])cyl(car,wx,0.35,wz,0.7,0.12,0.7,MAT.concreteDark,0,0,Math.PI/2);
  boxColliders.push({minx:rx+1.2,maxx:rx+4.8,minz:rz-3.2,maxz:rz+1.2,miny:H(rx,rz)-1,maxy:H(rx,rz)+1.9});
  const scrapG=lumpy(1,0.45,11);
  for(let i=0;i<6;i++){const a=(i*60+15)*Math.PI/180,d=10+rr()*7;const x=rx+Math.sin(a)*d,z=rz+Math.cos(a)*d,y=H(x,z);
    const m=new THREE.Mesh(scrapG,MAT.rust);m.position.set(x,y,z);m.scale.set(1.4,0.7,1.2);m.castShadow=true;scene.add(m);
    addNode({type:'scrap',name:'Monte de Sucata',x,y,z,s:1.2,r:1.1,hit:[[0.3,1.2]],max:80,hp:80,alive:true,mesh:m});}
  const cx=rx-6,cz=rz+1.5,cy=H(cx,cz);box(scene,cx,cy+0.45,cz,0.9,0.9,0.9,MAT.crate);
  const rad=new THREE.Group();rad.position.set(cx,cy+0.9,cz);scene.add(rad);box(rad,0,0.15,0,0.5,0.3,0.2,MAT.concreteDark);cyl(rad,0.18,0.45,0,0.03,0.4,0.03,MAT.metal,0,0,-0.35);
  const led=new THREE.Mesh(SPHG,MAT.led);led.scale.setScalar(0.06);led.position.set(0.15,0.2,0.105);rad.add(led);
  pickups.push({g:rad,x:cx,y:cy+0.9,z:cz,item:'sucata',n:3,name:'Rádio Quebrado',story:'radio',led});
  addChest(rx+6,H(rx+6,rz-4),rz-4,'ruinas',1,0.4);
  // posto abandonado (deserto)
  let p=POIS[1],y=H(p.x,p.z);const pg=new THREE.Group();pg.position.set(p.x,y,p.z);scene.add(pg);
  const solid=(g,x,yy,z,sx,sy,sz,m)=>{box(g,x,yy,z,sx,sy,sz,m);const wx=g.position.x+x,wz=g.position.z+z;boxColliders.push({minx:wx-sx/2,maxx:wx+sx/2,minz:wz-sz/2,maxz:wz+sz/2,miny:g.position.y+yy-sy/2,maxy:g.position.y+yy+sy/2});};
  solid(pg,0,1.6,-4,8,3.2,0.4,MAT.sandstone);solid(pg,-4,1.6,0,0.4,3.2,8,MAT.sandstone);solid(pg,4,0.9,1,0.4,1.8,6,MAT.sandDark);box(pg,0,3.3,-2,8.4,0.25,4.4,MAT.rust,0.05);
  box(pg,6,2.5,6,0.25,5,0.25,MAT.rust);box(pg,6,5,6,1.6,0.9,0.1,MAT.rust);lore(p.x-2,y,p.z-2,'DIÁRIO DO POSTO','"Dia 112. A água do poço secou. Fomos para as cavernas do cânion, ao sul daqui. Lá embaixo os cristais brilham sozinhos."','lore_posto');
  addChest(p.x+1.5,y,p.z-2.6,'posto',2,0);
  // cabana do guarda (neve)
  p=POIS[2];y=H(p.x,p.z);const cg=new THREE.Group();cg.position.set(p.x,y,p.z);scene.add(cg);
  solid(cg,0,1.4,-3,6,2.8,0.3,MAT.woodDark);solid(cg,-3,1.4,0,0.3,2.8,6,MAT.woodDark);solid(cg,3,1.4,0,0.3,2.8,6,MAT.woodDark);solid(cg,-1.9,1.4,3,2.2,2.8,0.3,MAT.woodDark);solid(cg,1.9,1.4,3,2.2,2.8,0.3,MAT.woodDark);
  box(cg,0,3.1,0,6.8,0.3,6.8,MAT.ice,0.08);box(cg,0,0.05,0,5.8,0.1,5.8,MAT.wood);lore(p.x+1,y+0.1,p.z-1,'BILHETE DO GUARDA','"As Sentinelas não sobem até aqui por causa do frio. Deixei suprimentos no baú. Fique perto do fogo à noite ou não acorda."','lore_cabana');
  addChest(p.x-1.6,y+0.1,p.z-1.8,'cabana',2,0);
  // templo de pedra (selva)
  p=POIS[3];y=H(p.x,p.z);const tg=new THREE.Group();tg.position.set(p.x,y,p.z);scene.add(tg);
  for(let k=0;k<4;k++){const s=12-k*2.6;solid(tg,0,0.6+k*1.2,0,s,1.2,s,k%2?MAT.mossStone:MAT.stone);}
  box(tg,0,5.6,0,2.4,1.6,2.4,MAT.mossStone);lore(p.x+5,y,p.z+7,'INSCRIÇÃO ANTIGA','"Quem subir os quatro degraus verá o que a selva guarda." (Há um baú no topo do templo.)','lore_templo');
  addChest(p.x,y+4.8,p.z,'templo',3,0);
  // palafita (pântano)
  p=POIS[4];y=Math.max(H(p.x,p.z),WATER);const sg=new THREE.Group();sg.position.set(p.x,y,p.z);scene.add(sg);
  for(const [sx,sz] of [[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]])box(sg,sx,0.8,sz,0.3,2.4,0.3,MAT.woodDark);
  solid(sg,0,1.9,0,6,0.25,6,MAT.wood);box(sg,0,3.4,-2.8,6,2.6,0.2,MAT.wood);box(sg,0,4.8,0,6.6,0.2,6.6,MAT.woodDark,0.12);
  for(let k=0;k<5;k++){const ys=0.4*k;box(sg,0,ys+0.1,4+k*0.8,1.4,0.15,0.6,MAT.wood);boxColliders.push({minx:p.x-0.7,maxx:p.x+0.7,minz:p.z+3.7+k*0.8,maxz:p.z+4.3+k*0.8,miny:y-2,maxy:y+ys+0.17});}
  addChest(p.x,y+2.02,p.z-1.5,'palafita',2,0);lore(p.x+1.5,y+2.04,p.z+1,'CARTA MOLHADA','"Os jacarés dormem de dia na beira da água. Nunca atravesse o rio à noite."','lore_palafita');
  // torre de vigia (savana)
  p=POIS[5];y=H(p.x,p.z);const wg=new THREE.Group();wg.position.set(p.x,y,p.z);scene.add(wg);
  for(const [sx,sz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])box(wg,sx,4,sz,0.3,8,0.3,MAT.woodDark);
  solid(wg,0,8,0,4,0.25,4,MAT.wood);box(wg,0,10,0,4.6,0.2,4.6,MAT.woodDark);
  for(let k=0;k<16;k++){const yy=0.5*k+0.3;box(wg,0,yy,2.2+(k%2)*0.01,1.2,0.12,0.4,MAT.wood);boxColliders.push({minx:p.x-0.6,maxx:p.x+0.6,minz:p.z+2.0,maxz:p.z+2.4,miny:y,maxy:y+yy+0.06});}
  addChest(p.x,y+8.13,p.z-0.8,'torre',3,0);
  // naufrágio (ilha)
  p=POIS[6];y=Math.max(H(p.x,p.z),WATER-0.3);const ng=new THREE.Group();ng.position.set(p.x,y,p.z);ng.rotation.set(0.12,0.7,0.25);scene.add(ng);
  box(ng,0,1,0,3.4,1.6,10,MAT.woodDark);box(ng,0,1.9,-1,3,0.2,7,MAT.wood);cyl(ng,0,4.5,-1,0.25,6,0.25,MAT.woodDark,0.3);box(ng,0.6,5,-0.6,0.05,3,2.4,mat(0xd8d0b8),0.3);
  boxColliders.push({minx:p.x-3,maxx:p.x+3,minz:p.z-5,maxz:p.z+5,miny:y-1,maxy:y+1.8});
  addChest(p.x+3.2,H(p.x+3.2,p.z+3),p.z+3,'naufragio',4,0.3);lore(p.x-3,H(p.x-3,p.z+4),p.z+4,'LIVRO DE BORDO','"Rota para a Estação Aurora perdida. Enterrei o mapa do tesouro onde as palmeiras formam um círculo na ilha maior."','lore_naufragio');
}
// ---------------- cavernas subterrâneas
const CAVES=[];const CAVE_Y=-140;
function buildCaves(rr){
  for(const p of POIS.filter(q=>q.cave!=null)){const y=H(p.x,p.z);
    // entrada na superfície
    const eg=new THREE.Group();eg.position.set(p.x,y,p.z);scene.add(eg);
    const rk=natGeo('Rock_6');for(const [ax,az,s] of [[-2.6,0,3.2],[2.6,0,3.2],[0,-0.6,3.6]]){const m=new THREE.Mesh(rk,matSolid);m.position.set(ax,az>-0.1?0:1.6,az);m.scale.setScalar(s);m.castShadow=true;eg.add(m);}
    const hole=new THREE.Mesh(new THREE.CircleGeometry(1.6,16),new THREE.MeshBasicMaterial({color:0x050505}));hole.position.set(0,1.4,0.4);eg.add(hole);
    const ic={x:p.x,z:p.z,cx:p.x,cz:p.z,y:CAVE_Y,poi:p,crystals:[]};CAVES.push(ic);
    interactables.push({x:p.x,y:y+1.4,z:p.z+0.4,r:1.8,kind:'cave',prompt:()=>`[E] Entrar: ${p.name}`,use:()=>enterCave(ic)});
    // interior: chão, cúpula, cristais, minérios, baú e saída
    const R0=42,floorG=new THREE.CircleGeometry(R0,48,0,Math.PI*2);floorG.rotateX(-Math.PI/2);const fp=floorG.attributes.position;
    for(let i=0;i<fp.count;i++){fp.setY(i,caveFloorAt(ic,fp.getX(i)+p.x,fp.getZ(i)+p.z)-CAVE_Y);}floorG.computeVertexNormals();
    const fl=new THREE.Mesh(floorG,MAT.caveRock);fl.position.set(p.x,CAVE_Y,p.z);fl.receiveShadow=true;scene.add(fl);
    const dome=new THREE.Mesh(lumpy(2,0.12,40+p.cave),new THREE.MeshLambertMaterial({color:lin(0x3a3638),side:THREE.BackSide}));dome.position.set(p.x,CAVE_Y,p.z);dome.scale.set(R0+4,16,R0+4);scene.add(dome);
    ic.meshes=[fl,dome];
    for(let k=0;k<26;k++){const a=rr()*6.28,d=8+rr()*30;const x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,fy=caveFloorAt(ic,x,z);
      const cr=new THREE.Group();cr.position.set(x,fy,z);scene.add(cr);const mm=k%3?MAT.crystal:MAT.crystal2;
      for(let c=0;c<4;c++){const s=0.4+rr()*0.6;const cm=new THREE.Mesh(new THREE.ConeGeometry(0.3*s,1.6*s,5),mm);cm.position.set((rr()-0.5)*0.6,0.7*s,(rr()-0.5)*0.6);cm.rotation.set((rr()-0.5)*0.6,0,(rr()-0.5)*0.6);cr.add(cm);}
      ic.meshes.push(cr);addNode({type:'cristal',name:'Cristal da Caverna',x,y:fy,z,s:1,r:0.6,hit:[[0.7,0.8]],max:120,hp:120,alive:true,mesh:cr,cave:true});ic.crystals.push([x,fy+1.2,z,mm===MAT.crystal?0x5fe1ff:0xc080ff]);}
    for(let k=0;k<10;k++){const a=rr()*6.28,d=10+rr()*28;const x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,fy=caveFloorAt(ic,x,z);const t=k%2?'ferro':'cobre';
      const m=new THREE.Mesh(natGeo('Rock_4'),new THREE.MeshLambertMaterial({vertexColors:true,color:t==='cobre'?lin(0xffa070):lin(0xb08878)}));m.position.set(x,fy,z);m.scale.setScalar(2.2);scene.add(m);ic.meshes.push(m);
      addNode({type:t,name:NODE_DEFS[t].name,x,y:fy,z,s:2.2,r:1.2,hit:[[0.8,1.2]],max:NODE_DEFS[t].hp,hp:NODE_DEFS[t].hp,alive:true,mesh:m,cave:true});}
    addChest(p.x+18,caveFloorAt(ic,p.x+18,p.z-6),p.z-6,'caverna'+p.cave,4,0);
    const exitY=caveFloorAt(ic,p.x,p.z-36);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.25,8,24),new THREE.MeshBasicMaterial({color:lin(0xfff0c0)}));ring.position.set(p.x,exitY+1.8,p.z-36);scene.add(ring);ic.meshes.push(ring);
    interactables.push({x:p.x,y:exitY+1.8,z:p.z-36,r:2,kind:'caveExit',prompt:()=>'[E] Voltar para a superfície',use:()=>exitCave(ic)});
    for(const m of ic.meshes)m.visible=false;}
}
function caveFloorAt(c,x,z){return CAVE_Y+(noise(x*0.08+c.poi.cave*5,z*0.08)-0.5)*1.6;}
const caveLights=[];for(let i=0;i<3;i++){const l=new THREE.PointLight(0x7fe0ff,0,22,1.5);scene.add(l);caveLights.push(l);}
function enterCave(c){P.cave=c;for(const m of c.meshes)m.visible=true;P.x=c.x;P.z=c.z-30;P.y=caveFloorAt(c,P.x,P.z)+0.2;P.vy=0;P.yaw=Math.PI;
  c.crystals.slice(0,3).forEach((cr,i)=>{caveLights[i].position.set(cr[0],cr[1],cr[2]);caveLights[i].color.set(cr[3]);caveLights[i].intensity=2.6;caveLights[i].distance=34;});
  markDiscovered('caverna');banner(c.poi.name.toUpperCase(),'Um mundo escondido embaixo da terra. Cristais, minérios e o que mais estiver guardado aqui.');sfx('place');}
function exitCave(c){for(const m of c.meshes)m.visible=false;P.cave=null;for(const l of caveLights)l.intensity=0;P.x=c.x;P.z=c.z+3;P.y=H(P.x,P.z)+0.3;P.vy=0;P.yaw=0;}
function caveGround(x,z){const c=P.cave;return caveFloorAt(c,x,z);}
