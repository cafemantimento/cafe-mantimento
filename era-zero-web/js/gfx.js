'use strict';
// ======================================================================
//  Gráficos extras: grama, balanço das árvores, nuvens, brilho do sol, faíscas, detalhes
// ======================================================================
const U_TIME={value:0};
const SKYS={day:1,dusk:0,sunUp:true};
function addSway(m,amount,minY){m.onBeforeCompile=sh=>{sh.uniforms.uTime=U_TIME;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',
`#include <begin_vertex>
#ifdef USE_INSTANCING
  vec3 swp=vec3(instanceMatrix[3][0],0.0,instanceMatrix[3][2]);
#else
  vec3 swp=vec3(modelMatrix[3][0],0.0,modelMatrix[3][2]);
#endif
  float swa=max(position.y-${minY.toFixed(2)},0.0)*${amount.toFixed(3)};
  transformed.x+=sin(uTime*1.7+swp.x*0.31+swp.z*0.23)*swa;
  transformed.z+=cos(uTime*1.3+swp.z*0.29+swp.x*0.11)*swa*0.6;`);};}
addSway(MAT.pine,0.03,2.5);addSway(MAT.leaf,0.028,3.0);

// grama em volta do jogador
const GRASS_N=isTouch?3600:8500,GRASS_R=isTouch?38:52,GRASS_CELL=Math.sqrt(Math.PI*GRASS_R*GRASS_R/GRASS_N);
const grassMesh=(()=>{const pos=[],col=[],nor=[];const base=lin(0x2b4f18),tip=lin(0xa6d260);const gr=rng(5);
  for(let b=0;b<6;b++){const a=gr()*Math.PI,ox=(gr()-0.5)*0.25,oz=(gr()-0.5)*0.25,w=0.035+gr()*0.025,h=0.28+gr()*0.3,lean=(gr()-0.5)*0.18;
    const cx=Math.cos(a)*w,cz=Math.sin(a)*w;pos.push(ox-cx,0,oz-cz, ox+cx,0,oz+cz, ox+lean,h,oz+lean*0.5, ox+cx,0,oz+cz, ox-cx,0,oz-cz, ox+lean,h,oz+lean*0.5);
    for(let q=0;q<2;q++)col.push(base.r,base.g,base.b,base.r,base.g,base.b,tip.r,tip.g,tip.b);for(let k=0;k<6;k++)nor.push(0,1,0);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  const m=new THREE.MeshLambertMaterial({vertexColors:true});addSway(m,0.22,0.0);
  const im=new THREE.InstancedMesh(g,m,GRASS_N);im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(GRASS_N*3),3);im.frustumCulled=false;im.receiveShadow=true;im.count=0;scene.add(im);
  const c=new THREE.Color();for(let i=0;i<GRASS_N;i++){c.setHSL(0.24+Math.random()*0.06,0.45,0.42+Math.random()*0.18).convertSRGBToLinear();im.setColorAt(i,c);}return im;})();
let grassCX=1e9,grassCZ=1e9;
function hash2(i,j){const h=Math.sin(i*127.1+j*311.7)*43758.5453;return h-Math.floor(h);}
function updateGrass(){const cx=G.state==='menu'?0:P.x,cz=G.state==='menu'?0:P.z;if(Math.hypot(cx-grassCX,cz-grassCZ)<GRASS_R*0.15)return;grassCX=cx;grassCZ=cz;
  const C=GRASS_CELL,i0=Math.floor((cx-GRASS_R)/C),i1=Math.floor((cx+GRASS_R)/C),j0=Math.floor((cz-GRASS_R)/C),j1=Math.floor((cz+GRASS_R)/C);let n=0;const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
  for(let i=i0;i<=i1&&n<GRASS_N;i++)for(let j=j0;j<=j1&&n<GRASS_N;j++){const x=(i+hash2(i,j))*C,z=(j+hash2(j,i))*C;const d=Math.hypot(x-cx,z-cz);if(d>GRASS_R)continue;
    const h=H(x,z);if(h<WATER+1.5||h>38)continue;if(noise(x*0.045+OX,z*0.045+OZ)>0.6)continue;if(Math.hypot(x-ruins.x,z-ruins.z)<22)continue;if(slope(x,z)>30)continue;
    if(topAt(cellOf(x,z))!==undefined)continue;
    const f=smooth((GRASS_R-d)/8)*(0.7+hash2(i+7,j+3)*0.7);e.set(0,hash2(i,j+9)*6.28,0);q.setFromEuler(e);v.set(x,h-0.03,z);sc.set(f,f*(0.8+hash2(j,i+5)*0.6),f);m.compose(v,q,sc);grassMesh.setMatrixAt(n++,m);}
  grassMesh.count=n;grassMesh.instanceMatrix.needsUpdate=true;}

// flores, pedrinhas e troncos caídos (só enfeite)
(function decor(){const r2=rng(77);const fl=new THREE.OctahedronGeometry(0.07,0);const N=isTouch?900:1800;
  const flowers=new THREE.InstancedMesh(fl,new THREE.MeshLambertMaterial({color:0xffffff}),N);flowers.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);flowers.count=0;scene.add(flowers);
  const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.01,0.01,0.22,3),mat(0x3d6b22),N);stems.count=0;scene.add(stems);
  const cols=[0xffe066,0xffffff,0xb48cff,0xff6b8a,0xffa64d].map(c=>lin(c));const m4=new THREE.Matrix4();
  for(let k=0;k<N*3&&flowers.count<N;k++){const x=(r2()*2-1)*(HALF-40),z=(r2()*2-1)*(HALF-40);const h=H(x,z);if(h<WATER+1.6||h>32||slope(x,z)>24||noise(x*0.045+OX,z*0.045+OZ)>0.58)continue;
    const cl=Math.floor(noise(x*0.02,z*0.02)*cols.length*1.6)%cols.length;const i=flowers.count++;stems.count++;
    flowers.setMatrixAt(i,M(x,h+0.22,z,0,r2()*3,0));flowers.setColorAt(i,cols[cl]);stems.setMatrixAt(i,M(x,h+0.11,z));}
  flowers.instanceMatrix.needsUpdate=true;stems.instanceMatrix.needsUpdate=true;if(flowers.instanceColor)flowers.instanceColor.needsUpdate=true;
  const pg=lumpy(0,0.3,21);const pebbles=new THREE.InstancedMesh(pg,mat(0x8a8a8c),700);pebbles.count=0;pebbles.receiveShadow=true;scene.add(pebbles);
  for(let k=0;k<2000&&pebbles.count<700;k++){const x=(r2()*2-1)*(HALF-35),z=(r2()*2-1)*(HALF-35);const h=H(x,z);if(h<WATER-0.5||slope(x,z)>35)continue;const s=0.08+r2()*0.16;pebbles.setMatrixAt(pebbles.count++,M(x,h+s*0.3,z,r2(),r2()*6,r2(),s*1.3,s*0.7,s));}
  pebbles.instanceMatrix.needsUpdate=true;
  const logs=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25,0.28,1,7),MAT.bark,50);logs.count=0;logs.castShadow=true;logs.receiveShadow=true;scene.add(logs);
  for(let k=0;k<400&&logs.count<50;k++){const x=(r2()*2-1)*(HALF-45),z=(r2()*2-1)*(HALF-45);const h=H(x,z);if(h<WATER+1.5||slope(x,z)>15||Math.hypot(x,z)<12)continue;const L=2.5+r2()*3;logs.setMatrixAt(logs.count++,M(x,h+0.18,z,0,r2()*6,Math.PI/2,1,L,1));}
  logs.instanceMatrix.needsUpdate=true;})();

// nuvens
function canvasTex(N,draw){const c=document.createElement('canvas');c.width=c.height=N;draw(c.getContext('2d'),N);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;}
const cloudTex=canvasTex(512,(x,N)=>{const r=rng(31);for(let k=0;k<70;k++){const cx=r()*N,cy=r()*N,rad=30+r()*70;for(const dx of [-N,0,N])for(const dy of [-N,0,N]){
  const g=x.createRadialGradient(cx+dx,cy+dy,0,cx+dx,cy+dy,rad);g.addColorStop(0,'rgba(255,255,255,0.55)');g.addColorStop(0.6,'rgba(255,255,255,0.18)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx+dx-rad,cy+dy-rad,rad*2,rad*2);}}});
cloudTex.wrapS=cloudTex.wrapT=THREE.RepeatWrapping;cloudTex.repeat.set(3,3);
const clouds=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:0.9,toneMapped:false}));
clouds.rotation.x=Math.PI/2;clouds.renderOrder=-0.5;scene.add(clouds);
const glowTex=canvasTex(128,(x,N)=>{const g=x.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(0.2,'rgba(255,210,150,0.55)');g.addColorStop(1,'rgba(255,180,120,0)');x.fillStyle=g;x.fillRect(0,0,N,N);});
const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true,toneMapped:false}));sunGlow.scale.set(260,260,1);scene.add(sunGlow);
const cDay=new THREE.Color(0xffffff),cDuskCloud=new THREE.Color(0xffb38a),cNightCloud=new THREE.Color(0x2a3550);
function updateSky(dt){clouds.position.set(camera.position.x,camera.position.y+170,camera.position.z);cloudTex.offset.x+=dt*0.0025;cloudTex.offset.y+=dt*0.001;
  clouds.material.color.copy(cNightCloud).lerp(cDay,SKYS.day).lerp(cDuskCloud,SKYS.dusk*0.6);clouds.material.opacity=0.55+SKYS.day*0.35;
  sunGlow.position.copy(sunDisk.position);sunGlow.material.opacity=SKYS.sunUp?0.55+SKYS.dusk*0.4:0.18;sunGlow.scale.setScalar(SKYS.sunUp?260+SKYS.dusk*140:120);
  sunGlow.material.color.set(SKYS.sunUp?0xffffff:0x9fb4ff);}

// faíscas da fogueira
const SPARK_N=40;const sparkGeo=new THREE.BufferGeometry();const sparkPos=new Float32Array(SPARK_N*3);sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));
const sparks=new THREE.Points(sparkGeo,new THREE.PointsMaterial({color:lin(0xffa040),size:0.09,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sparks.frustumCulled=false;scene.add(sparks);
const sparkData=[];for(let i=0;i<SPARK_N;i++)sparkData.push({life:0,vx:0,vy:0,vz:0});
function updateSparks(dt,fires){const f=fires&&fires[0];const near=f&&Math.hypot(f.g.position.x-P.x,f.g.position.z-P.z)<35;sparks.visible=!!near;if(!near)return;
  for(let i=0;i<SPARK_N;i++){const s=sparkData[i];s.life-=dt;if(s.life<=0){s.life=0.6+Math.random()*1.2;sparkPos[i*3]=f.g.position.x+(Math.random()-0.5)*0.3;sparkPos[i*3+1]=f.g.position.y+0.4;sparkPos[i*3+2]=f.g.position.z+(Math.random()-0.5)*0.3;s.vx=(Math.random()-0.5)*0.5;s.vy=1+Math.random()*1.5;s.vz=(Math.random()-0.5)*0.5;}
    sparkPos[i*3]+=s.vx*dt+Math.sin(U_TIME.value*3+i)*0.004;sparkPos[i*3+1]+=s.vy*dt;sparkPos[i*3+2]+=s.vz*dt;}
  sparkGeo.attributes.position.needsUpdate=true;}
