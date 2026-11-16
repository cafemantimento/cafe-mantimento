'use strict';
// ======================================================================
//  Personagens (você em 3ª pessoa e os amigos)
// ======================================================================
const VIEW={tp:false};
function toggleView(){VIEW.tp=!VIEW.tp;toast(VIEW.tp?'Câmera em 3ª pessoa':'Câmera em 1ª pessoa','var(--muted)');}
const AV_COLORS=[0x3f8fd9,0xd9573f,0x4fb36a,0xd9b03f,0x9a5fd9,0x3fc9c9,0xd95fa4,0xe08a3a];
function cleanName(n){const v=String(n==null?'':n).replace(/[^\p{L}\p{N} _.\-]/gu,'').trim().slice(0,16);return v||'Jogador';}
function myName(){try{return cleanName(localStorage.getItem('erazero_name'));}catch(e){return 'Jogador';}}
function myColor(){try{let c=localStorage.getItem('erazero_color');if(c===null){c=String(Math.floor(Math.random()*AV_COLORS.length));localStorage.setItem('erazero_color',c);}return +c||0;}catch(e){return 0;}}
function setName(v){const n=cleanName(v);try{localStorage.setItem('erazero_name',n);}catch(e){}NET.sent.n=null;}
function roundRect(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function labelSprite(text,color){const t=canvasTex(256,(x)=>{x.font='bold 34px Rajdhani, Arial, sans-serif';const w=Math.min(244,x.measureText(text).width+30);x.fillStyle='rgba(8,14,20,0.75)';roundRect(x,(256-w)/2,96,w,56,12);x.fill();
  x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.fillText(text,128,125);});
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,toneMapped:false,fog:false}));sp.scale.set(1.8,1.8,1);sp.renderOrder=10;return sp;}
function makeAvatar(ci,name){const col=AV_COLORS[((ci|0)%AV_COLORS.length+AV_COLORS.length)%AV_COLORS.length];
  const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  const shirt=mat(col),pants=mat(0x39404d),hair=mat(0x2e2219),boots=mat(0x2a2420),bag=mat(0x6b4a2a),eye=mat(0x161616);
  const legs=[],arms=[];
  for(const sx of [-1,1]){const l=new THREE.Group();l.position.set(0.12*sx,0.88,0);body.add(l);box(l,0,-0.4,0,0.17,0.8,0.2,pants);box(l,0,-0.83,-0.04,0.19,0.12,0.28,boots);legs.push(l);}
  box(body,0,1.2,0,0.5,0.62,0.28,shirt);box(body,0,0.9,0,0.49,0.08,0.29,mat(0x2a2a2a));box(body,0,1.24,0.2,0.38,0.44,0.16,bag);
  for(const sx of [-1,1]){const a=new THREE.Group();a.position.set(0.33*sx,1.46,0);body.add(a);box(a,0,-0.26,0,0.14,0.56,0.16,shirt);box(a,0,-0.6,0,0.13,0.14,0.14,MAT.skin);arms.push(a);}
  const head=new THREE.Group();head.position.set(0,1.73,0);body.add(head);box(head,0,0,0,0.34,0.34,0.34,MAT.skin);box(head,0,0.16,0.02,0.36,0.1,0.38,hair);box(head,0,0.02,0.17,0.36,0.3,0.06,hair);
  box(head,-0.08,0.03,-0.175,0.05,0.05,0.02,eye);box(head,0.08,0.03,-0.175,0.05,0.05,0.02,eye);
  const held=new THREE.Group();held.position.set(0,-0.64,-0.05);held.rotation.x=-Math.PI/2;arms[1].add(held);
  const label=labelSprite(name||'Jogador','#'+new THREE.Color(col).getHexString());label.position.y=2.3;g.add(label);
  scene.add(g);return {g,body,legs,arms,head,held,label,phase:0,swingT:1,heldId:'~',ci,name,col};}
function setAvatarHeld(a,d){const id=d?d.id:'';if(a.heldId===id)return;a.heldId=id;while(a.held.children.length)a.held.remove(a.held.children[0]);if(d)a.held.add(buildHeld(d,true));}
function setAvatarName(a,name){a.g.remove(a.label);a.label=labelSprite(name,'#'+new THREE.Color(a.col).getHexString());a.label.position.y=2.3;a.g.add(a.label);a.name=name;}
function animateAvatar(a,speed,dt){const run=Math.min(1,speed/5);a.phase+=dt*Math.min(speed,8)*1.9;const sw=Math.sin(a.phase)*(0.25+run*0.45)*Math.min(1,speed/1.2);
  a.legs[0].rotation.x=sw;a.legs[1].rotation.x=-sw;a.arms[0].rotation.x=-sw*0.8;a.arms[1].rotation.x=sw*0.8;
  a.body.position.y=Math.abs(Math.sin(a.phase))*0.05*Math.min(1,speed/1.5);a.body.rotation.x=run*0.08;
  if(a.swingT<1){a.swingT=Math.min(1,a.swingT+dt/0.42);const k=a.swingT<0.35?a.swingT/0.35:1-(a.swingT-0.35)/0.65;a.arms[1].rotation.x=-2.4*Math.sin(k*Math.PI/2)+0.6*(1-k);}}
const localAv=makeAvatar(myColor(),'');localAv.label.visible=false;localAv.g.visible=false;
