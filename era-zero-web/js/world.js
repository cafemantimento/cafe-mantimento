'use strict';
// ======================================================================
//  Mundo: relevo
// ======================================================================
const SIZE=400,HALF=200,WATER=6,SEG=160,STEP=SIZE/SEG;
const lake={x:85,z:-55,r:55},ruins={x:-20,z:125};
const OX=R()*1000,OZ=R()*1000;
function rawH(x,z){const u=x+HALF,v=z+HALF;
  const n=fbm(u*0.0055+OX,v*0.0055+OZ,5);let h=2+n*26;h+=(noise(u*0.035+OZ,v*0.035+OX)-0.5)*2.5;
  const d=Math.max(Math.abs(x),Math.abs(z))/HALF;if(d>0.72){const t=(d-0.72)/0.28;const ridge=1-Math.abs(noise(u*0.02+OX,v*0.02+OZ)*2-1);h+=t*t*(45+ridge*25);}
  const ld=Math.hypot(x-lake.x,z-lake.z);if(ld<lake.r)h=lerp(h,1.5,smooth(1-ld/lake.r));
  const sd=Math.hypot(x,z);if(sd<45)h=lerp(h,11,smooth(1-sd/45)*0.9);
  const pd=Math.hypot(x-26,z+24);if(pd<17)h=lerp(h,3.2,smooth(1-pd/17));
  const pd2=Math.hypot(x+70,z-40);if(pd2<20)h=lerp(h,3.0,smooth(1-pd2/20));
  const rd=Math.hypot(x-ruins.x,z-ruins.z);if(rd<40)h=lerp(h,13,smooth(1-rd/40)*0.95);
  return Math.max(h,0.5);}
const HG=new Float32Array((SEG+1)*(SEG+1));
for(let j=0;j<=SEG;j++)for(let i=0;i<=SEG;i++)HG[j*(SEG+1)+i]=rawH(-HALF+i*STEP,-HALF+j*STEP);
function H(x,z){let fx=(x+HALF)/STEP,fz=(z+HALF)/STEP;fx=clamp(fx,0,SEG-0.0001);fz=clamp(fz,0,SEG-0.0001);
  const i=Math.floor(fx),j=Math.floor(fz);fx-=i;fz-=j;const W=SEG+1;
  const h00=HG[j*W+i],h10=HG[j*W+i+1],h01=HG[(j+1)*W+i],h11=HG[(j+1)*W+i+1];
  return fx>fz? h00+(h10-h00)*fx+(h11-h10)*fz : h00+(h11-h01)*fx+(h01-h00)*fz;}
function slope(x,z){const e=1.0;const dx=H(x+e,z)-H(x-e,z),dz=H(x,z+e)-H(x,z-e);return Math.atan(Math.hypot(dx,dz)/(2*e))*180/Math.PI;}
function normalAt(x,z){const e=0.5;return new THREE.Vector3(H(x-e,z)-H(x+e,z),2*e,H(x,z-e)-H(x,z+e)).normalize();}

const WATER_NORMAL=(function(){const N=128,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');const img=x.createImageData(N,N);
  const hf=(i,j)=>{let v=0;for(const [f,a] of [[4,1],[8,0.5],[16,0.25]]){v+=a*Math.sin((i/N)*Math.PI*2*f*0.5+Math.cos((j/N)*Math.PI*2*f*0.25)*2)*Math.cos((j/N)*Math.PI*2*f*0.5);}return v;};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=hf((i+1)%N,j)-hf((i-1+N)%N,j),dz=hf(i,(j+1)%N)-hf(i,(j-1+N)%N);const n=new THREE.Vector3(-dx*2,1,-dz*2).normalize();const o=(j*N+i)*4;img.data[o]=(n.x*0.5+0.5)*255;img.data[o+1]=(n.z*0.5+0.5)*255;img.data[o+2]=(n.y*0.5+0.5)*255;img.data[o+3]=255;}
  x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,70);return t;})();
(function buildTerrain(){
  const W=SEG+1,pos=new Float32Array(SEG*SEG*6*3),col=new Float32Array(SEG*SEG*6*3);let o=0;
  const cGrass=new THREE.Color(0x4f7a2e),cGrass2=new THREE.Color(0x6a8f34),cDirt=new THREE.Color(0x7a6040),cRock=new THREE.Color(0x77787a),cSand=new THREE.Color(0xc2b07e),tmp=new THREE.Color();
  const vr=rng(99);
  const put=(x,y,z,c)=>{pos[o]=x;pos[o+1]=y;pos[o+2]=z;col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;o+=3;};
  const tri=(ax,az,bx,bz,cx,cz)=>{
    const ay=HG[az*W+ax],by=HG[bz*W+bx],cy=HG[cz*W+cx];
    const X=i=>-HALF+i*STEP;
    const v1=new THREE.Vector3(X(bx)-X(ax),by-ay,X(bz)-X(az)),v2=new THREE.Vector3(X(cx)-X(ax),cy-ay,X(cz)-X(az));const n=v1.cross(v2).normalize();
    const h=(ay+by+cy)/3,mx=(X(ax)+X(bx)+X(cx))/3,mz=(X(az)+X(bz)+X(cz))/3;
    const patch=noise(mx*0.045+OX,mz*0.045+OZ);
    if(h<WATER+1.4)tmp.copy(cSand);
    else if(n.y<0.8||h>40)tmp.copy(cRock).lerp(cDirt,n.y>0.7?0.3:0);
    else if(patch>0.62)tmp.copy(cDirt).lerp(cGrass,0.25);
    else tmp.copy(cGrass).lerp(cGrass2,noise(mx*0.12,mz*0.12));
    if(h>=WATER+1.4&&h<WATER+2.2)tmp.lerp(cSand,0.5);
    const k=0.92+vr()*0.12;tmp.multiplyScalar(k).convertSRGBToLinear();
    put(X(ax),ay,X(az),tmp);put(X(bx),by,X(bz),tmp);put(X(cx),cy,X(cz),tmp);};
  for(let j=0;j<SEG;j++)for(let i=0;i<SEG;i++){tri(i,j,i+1,j+1,i+1,j);tri(i,j,i,j+1,i+1,j+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.receiveShadow=true;scene.add(m);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(SIZE,SIZE),new THREE.MeshPhongMaterial({color:lin(0x1c5d72),transparent:true,opacity:0.84,shininess:140,specular:lin(0xd8ecff),normalMap:WATER_NORMAL,normalScale:new THREE.Vector2(0.45,0.45)}));
  water.rotation.x=-Math.PI/2;water.position.y=WATER;scene.add(water);
})();

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
  cloth:mat(0x476641),crate:mat(0x80613a),metal:mat(0xb3b8bf)};
function box(parent,x,y,z,sx,sy,sz,m,rx,ry,rz){const b=new THREE.Mesh(BOXG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.rotation.set(rx||0,ry||0,rz||0);b.castShadow=true;b.receiveShadow=true;parent.add(b);return b;}
const BOXG=new THREE.BoxGeometry(1,1,1),CYLG=new THREE.CylinderGeometry(0.5,0.5,1,8),SPHG=new THREE.SphereGeometry(0.5,10,8);
function cyl(parent,x,y,z,sx,sy,sz,m,rx,ry,rz){const b=new THREE.Mesh(CYLG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.rotation.set(rx||0,ry||0,rz||0);b.castShadow=true;parent.add(b);return b;}
function sph(parent,x,y,z,sx,sy,sz,m){const b=new THREE.Mesh(SPHG,m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.castShadow=true;parent.add(b);return b;}

// ======================================================================
//  Mundo: árvores, rochas, arbustos, itens, ruínas
// ======================================================================
const nodes=[];        // recursos que se golpeiam
const pickups=[];      // itens soltos no chão
const boxColliders=[]; // caixas sólidas (ruínas e construções)
const ZERO=new THREE.Matrix4().makeScale(0,0,0);

function tryPoint(minH,maxSlope,avoidSpawn,avoidRuins){for(let t=0;t<30;t++){const x=-HALF+30+R()*(SIZE-60),z=-HALF+30+R()*(SIZE-60);const h=H(x,z);
  if(h<minH||slope(x,z)>maxSlope||Math.hypot(x,z)<avoidSpawn||Math.hypot(x-ruins.x,z-ruins.z)<avoidRuins)continue;return [x,h,z];}return null;}

function instanced(geo,material,count){const m=new THREE.InstancedMesh(geo,material,count);m.castShadow=true;m.receiveShadow=true;m.userData.n=0;scene.add(m);return m;}
function addInst(mesh,matrix,color){const i=mesh.userData.n++;mesh.setMatrixAt(i,matrix);if(color)mesh.setColorAt(i,color);return i;}

(function populate(){
  const trunkG=new THREE.CylinderGeometry(0.22,0.3,4.4,7);trunkG.translate(0,2.2,0);
  const pineG=merge([[new THREE.ConeGeometry(2.5,2.8,8),M(0,3.4,0)],[new THREE.ConeGeometry(1.9,2.5,8),M(0,4.9,0,0,0.4)],[new THREE.ConeGeometry(1.3,2.2,8),M(0,6.2,0,0,0.8)]]);
  const oakG=merge([[lumpy(1,0.18,1),M(0,4.6,0,0,0,0,2.6,2.0,2.6)],[lumpy(1,0.2,2),M(1.3,4.0,0.6,0,0,0,1.6,1.4,1.6)],[lumpy(1,0.2,3),M(-1.1,4.2,-0.7,0,0,0,1.7,1.5,1.7)]]);
  const rockG=lumpy(1,0.22,5);
  const bushG=merge([[lumpy(1,0.25,7),M(0,0.55,0,0,0,0,0.9,0.65,0.9)],[lumpy(1,0.25,8),M(0.45,0.45,0.2,0,0,0,0.6,0.5,0.6)]]);
  const berryG=new THREE.SphereGeometry(0.13,6,5);
  const N=430;
  const trunks=instanced(trunkG,MAT.bark,N),pines=instanced(pineG,MAT.pine,N),oaks=instanced(oakG,MAT.leaf,N);
  const rocks=instanced(rockG,MAT.rock,200),bushes=instanced(bushG,MAT.bush,180),berries=instanced(berryG,MAT.berry,180*8);
  const col=new THREE.Color();
  for(let i=0;i<N;i++){const p=tryPoint(WATER+1.2,30,9,30);if(!p)continue;const isPine=R()<0.65||p[1]>25;const s=0.8+R()*0.5,ry=R()*6.28;
    const mtx=M(p[0],p[1]-0.2,p[2],0,ry,0,s);const ti=addInst(trunks,mtx);
    col.setHSL(isPine?0.33:0.26,0.35+R()*0.15,0.5+R()*0.15).convertSRGBToLinear();
    const crown=isPine?pines:oaks;const ci=addInst(crown,mtx,col);
    nodes.push({type:'tree',name:isPine?'Pinheiro':'Árvore',x:p[0],y:p[1],z:p[2],s,ry,r:0.45*s,max:100,hp:100,alive:true,inst:[[trunks,ti],[crown,ci]],mtx,isPine});}
  for(let i=0;i<190;i++){const p=tryPoint(WATER+0.3,40,7,25);if(!p)continue;const s=0.9+R()*1.2;const sx=s*(1+R()*0.4),sy=s*(0.6+R()*0.3);
    const mtx=M(p[0],p[1]+s*0.2,p[2],R()*0.3-0.15,R()*6.28,R()*0.3-0.15,sx,sy,s);col.setHSL(0.08,0.04,0.45+R()*0.15).convertSRGBToLinear();const ri=addInst(rocks,mtx,col);
    nodes.push({type:'rock',name:'Rocha',x:p[0],y:p[1],z:p[2],s,r:Math.max(sx,s)*0.98,hy:sy*0.6,max:100,hp:100,alive:true,inst:[[rocks,ri]],mtx});}
  for(let i=0;i<180;i++){const p=tryPoint(WATER+0.6,28,5,15);if(!p)continue;const s=0.8+R()*0.4,ry=R()*6.28;const mtx=M(p[0],p[1],p[2],0,ry,0,s);
    const bi=addInst(bushes,mtx);const bl=[];const br=rng(i+50);
    for(let k=0;k<8;k++){const d=new THREE.Vector3(br()-0.5,br()*0.6,br()-0.5).normalize().multiplyScalar(0.85*s);bl.push([berries,addInst(berries,M(p[0]+d.x,p[1]+0.55*s+d.y,p[2]+d.z,0,0,0,s))]);}
    nodes.push({type:'bush',name:'Arbusto de Frutinhas',x:p[0],y:p[1],z:p[2],s,r:0,max:40,hp:40,alive:true,inst:[[bushes,bi]].concat(bl),mtx});}
  for(const m of [trunks,pines,oaks,rocks,bushes,berries]){m.count=m.userData.n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  // guarda as matrizes originais para renascer
  for(const n of nodes)n.mtxs=n.inst.map(([m,i])=>{const t=new THREE.Matrix4();m.getMatrixAt(i,t);return t;});

  // galhos e pedras soltas
  const stickG=merge([[CYLG,M(0,0.06,0,Math.PI/2,0,0,0.07,0.6,0.07)],[CYLG,M(0.12,0.08,0.1,Math.PI/2,0.7,0,0.05,0.4,0.05)]]);
  for(let i=0;i<150;i++){const spread=i<44?50:HALF-40;const x=(R()*2-1)*spread,z=(R()*2-1)*spread;const h=H(x,z);if(h<WATER+0.3||slope(x,z)>30)continue;
    const g=new THREE.Group();g.position.set(x,h,z);g.rotation.y=R()*6.28;scene.add(g);
    if(i%2===0){const m=new THREE.Mesh(stickG,MAT.woodDark);m.castShadow=true;g.add(m);pickups.push({g,x,y:h,z,item:'madeira',n:2,name:'Galhos'});}
    else{const fl=R()<0.35;const m=new THREE.Mesh(rockG,MAT.rock);m.scale.set(0.28,0.18,0.24);m.position.y=0.08;m.castShadow=true;g.add(m);
      if(fl){const f=new THREE.Mesh(rockG,MAT.concreteDark);f.scale.set(0.14,0.1,0.12);f.position.set(0.2,0.06,0.05);g.add(f);}
      pickups.push({g,x,y:h,z,item:'pedra',n:2,extra:fl?'silex':null,name:fl?'Pedras e Sílex':'Pedras'});}}

  // ruínas
  const rg=new THREE.Group();const ry0=H(ruins.x,ruins.z);rg.position.set(ruins.x,0,ruins.z);scene.add(rg);
  const block=(lx,ly,lz,sx,sy,sz,m,rx,ryy,rz,solid)=>{const gy=H(ruins.x+lx,ruins.z+lz);const b=box(rg,lx,gy+ly-0.15,lz,sx,sy,sz,m,rx,ryy,rz);
    if(solid)boxColliders.push({minx:ruins.x+lx-sx/2,maxx:ruins.x+lx+sx/2,minz:ruins.z+lz-sz/2,maxz:ruins.z+lz+sz/2,miny:gy+ly-0.15-sy/2,maxy:gy+ly-0.15+sy/2});return b;};
  block(-8,4,6,10,8,0.6,MAT.concrete,0,0,0,true);block(-13,3,1,0.6,6,10,MAT.concrete,0,0,0,true);block(-3.5,2,2,0.6,4,8,MAT.concrete,0,0,0.07,true);
  block(-8,8.2,3,10,0.4,6,MAT.concreteDark,0.1,0,-0.05);
  for(let i=0;i<4;i++)block(-11+i*2.5,5.5,6.32,1.2,1.4,0.05,MAT.glass);
  block(8,3,8,0.8,6,0.8,MAT.concrete,0,0,0,true);block(14,2,8,0.8,4,0.8,MAT.concrete,0,0,0,true);
  block(11,1.2,4,7,0.5,5,MAT.concreteDark,-0.2,0.14,0.26);block(4,0.6,-6,3,1.2,1.2,MAT.concrete,0,0.5,0.08);block(-6,0.5,-9,1.5,1,1.5,MAT.concreteDark,0.17,0.35,0);
  const car=new THREE.Group();car.position.set(3,H(ruins.x+3,ruins.z-1),-1);car.rotation.set(0,0.6,0.05);rg.add(car);
  box(car,0,0.75,0,1.9,0.8,4.2,MAT.rust);box(car,0,1.45,-0.3,1.7,0.7,2.2,MAT.rust);box(car,0,1.45,0.82,1.6,0.6,0.05,MAT.glass,-0.5);
  for(const [wx,wz] of [[-0.95,1.3],[0.95,1.3],[-0.95,-1.3],[0.95,-1.3]])cyl(car,wx,0.35,wz,0.7,0.12,0.7,MAT.concreteDark,0,0,Math.PI/2);
  boxColliders.push({minx:ruins.x+1.2,maxx:ruins.x+4.8,minz:ruins.z-3.2,maxz:ruins.z+1.2,miny:ry0-1,maxy:ry0+1.9});
  block(-2,0.3,12,0.3,0.3,9,MAT.rust,0,1.2,0);
  const scrapG=lumpy(1,0.45,11);
  for(let i=0;i<6;i++){const a=(i*60+15)*Math.PI/180,d=9+R()*8;const x=ruins.x+Math.sin(a)*d,z=ruins.z+Math.cos(a)*d,y=H(x,z);
    const m=new THREE.Mesh(scrapG,MAT.rust);m.position.set(x,y,z);m.scale.set(1.4,0.7,1.2);m.castShadow=true;scene.add(m);
    nodes.push({type:'scrap',name:'Monte de Sucata',x,y,z,s:1.2,r:1.1,max:80,hp:80,alive:true,mesh:m});}
  // rádio
  const cx=ruins.x-6,cz=ruins.z+1.5,cy=H(cx,cz);box(scene,cx,cy+0.45,cz,0.9,0.9,0.9,MAT.crate);
  const rad=new THREE.Group();rad.position.set(cx,cy+0.9,cz);scene.add(rad);box(rad,0,0.15,0,0.5,0.3,0.2,MAT.concreteDark);cyl(rad,0.18,0.45,0,0.03,0.4,0.03,MAT.metal,0,0,-0.35);
  const led=new THREE.Mesh(SPHG,MAT.led);led.scale.setScalar(0.06);led.position.set(0.15,0.2,0.105);rad.add(led);
  pickups.push({g:rad,x:cx,y:cy+0.9,z:cz,item:'sucata',n:3,name:'Rádio Quebrado',story:'radio',led});
})();
