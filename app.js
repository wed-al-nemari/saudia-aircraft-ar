/* SAUDIA Aircraft AR — procedural educational model, not an official 3D aircraft asset. */
const $=id=>document.getElementById(id);
const details={cockpit:['قمرة القيادة','منها يدير الطيارون الرحلة ويتابعون أجهزة الملاحة والاتصالات.'],wing:['الأجنحة','يساعد شكل الجناح على توليد قوة الرفع أثناء حركة الطائرة.'],engine:['المحركات','تولّد المحركات قوة الدفع اللازمة لتحريك الطائرة إلى الأمام.'],tail:['الذيل','يساعد الذيل على ثبات الطائرة والتحكم في اتجاهها.'],fuselage:['جسم الطائرة','يحتوي على مقصورة الركاب ويربط بين الأجنحة والذيل والمقدمة.']};
let mode='',scene=null,model=null,scale=1,rx=-12,ry=-25,drag=false,moved=false,startX=0,startY=0,lastPinch=0;
const make=(tag,attrs={},parent)=>{const el=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(parent)parent.appendChild(el);return el};
function part(parent,id,pos){const m=make('a-entity',{position:pos,'data-part':id},parent);make('a-sphere',{radius:'.13',color:'#d6b76e','material':'metalness:.4;roughness:.3'},m);make('a-torus',{radius:'.19','radius-tubular':'.012',color:'#f8e8ac',rotation:'90 0 0'},m);m.addEventListener('click',()=>showInfo(id));m.querySelectorAll('a-sphere,a-torus').forEach(child=>{child.setAttribute('class','hotspot');child.setAttribute('data-part',id);child.addEventListener('click',e=>{e.stopPropagation();showInfo(id)})});}
function buildPlane(root){
  // Original detailed educational 3D model. All geometry is generated locally.
  const plane=make('a-entity',{},root);
  const group=new THREE.Group();plane.object3D.add(group);
  const white=new THREE.MeshPhysicalMaterial({color:0xf4f7f5,metalness:.16,roughness:.38,clearcoat:.42,side:THREE.DoubleSide});
  const underside=new THREE.MeshStandardMaterial({color:0xcbd6d6,metalness:.2,roughness:.52,side:THREE.DoubleSide});
  const teal=new THREE.MeshPhysicalMaterial({color:0x087568,metalness:.2,roughness:.32,clearcoat:.4,side:THREE.DoubleSide});
  const dark=new THREE.MeshStandardMaterial({color:0x193e4b,metalness:.16,roughness:.3,side:THREE.DoubleSide});
  const glass=new THREE.MeshPhysicalMaterial({color:0x163f51,metalness:.3,roughness:.14,clearcoat:1,side:THREE.DoubleSide});
  const gold=new THREE.MeshStandardMaterial({color:0xc5a86b,metalness:.55,roughness:.35,side:THREE.DoubleSide});
  const fan=new THREE.MeshStandardMaterial({color:0x657b81,metalness:.75,roughness:.3,side:THREE.DoubleSide});
  const add=(geo,mat,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{let m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);m.scale.set(...scale);group.add(m);return m};
  // Axis: nose at z=-3.55, tail at z=+3.15; fuselage section varies smoothly.
  const profile=[[0,-3.52],[.11,-3.48],[.25,-3.29],[.36,-2.98],[.43,-2.55],[.46,-2.1],[.48,-1.6],[.49,-.6],[.49,.7],[.47,1.6],[.42,2.15],[.33,2.63],[.19,3.03],[.05,3.24],[0,3.3]];
  const verts=[],idx=[];let rings=profile.length,N=48;
  for(let j=0;j<rings;j++){let [r,z]=profile[j];for(let k=0;k<N;k++){let ang=k/N*Math.PI*2;verts.push(r*Math.cos(ang),r*Math.sin(ang)*.92,z)}}
  for(let j=0;j<rings-1;j++)for(let k=0;k<N;k++){let a=j*N+k,b=j*N+(k+1)%N,c=(j+1)*N+k,d=(j+1)*N+(k+1)%N;idx.push(a,b,c,b,d,c)}
  let fus=new THREE.BufferGeometry();fus.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));fus.setIndex(idx);fus.computeVertexNormals();add(fus,white);
  // Sweep colored lower fuselage stripe as thin curved panels.
  for(let side of [-1,1]){let stripe=[];for(let z=-2.6;z<2.4;z+=.12){let r=.475*(z>1.5?Math.max(.65,1-(z-1.5)*.24):1);stripe.push([side*r*.94,-.16,z],[side*r*.87,-.235,z]);}let v=[],ix=[];stripe.forEach(q=>v.push(...q));for(let i=0;i<stripe.length-2;i+=2)ix.push(i,i+1,i+2,i+1,i+3,i+2);let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();add(g,teal)}
  function prism(points,thick,mat){let v=[],ind=[];points.forEach(([x,z])=>v.push(x,-thick/2,z));points.forEach(([x,z])=>v.push(x,thick/2,z));let n=points.length;for(let i=1;i<n-1;i++){ind.push(0,i,i+1,n,n+i+1,n+i)}for(let i=0;i<n;i++){let j=(i+1)%n;ind.push(i,j,n+j,i,n+j,n+i)}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ind);g.computeVertexNormals();return add(g,mat)}
  // Swept tapered wings, with upward winglets and flaps.
  for(let side of [-1,1]){
    prism([[side*.3,-.88],[side*1.0,-.95],[side*3.05,.47],[side*3.17,.83],[side*2.66,.83],[side*.34,.52]],.11,white);
    prism([[side*.9,.12],[side*2.67,.78],[side*2.58,.86],[side*.9,.35]],.012,underside);
    add(new THREE.BoxGeometry(.075,.43,.25),teal,[side*3.06,.18,.69],[0,0,side*-.22]);
    // pylons, two engines each with metallic rims and recessed fan blades
    for(let [ex,ez,rad] of [[1.14,-.35,.265],[1.91,.07,.235]]){
      let x=side*ex;
      add(new THREE.BoxGeometry(.105,.23,.48),underside,[x,-.23,ez+.13]);
      add(new THREE.CylinderGeometry(rad*.9,rad,1.02,32),white,[x,-.49,ez],[Math.PI/2,0,0]);
      add(new THREE.CylinderGeometry(rad*.77,rad*.77,.05,32),dark,[x,-.49,ez-.53],[Math.PI/2,0,0]);
      add(new THREE.TorusGeometry(rad*.79,.024,10,40),gold,[x,-.49,ez-.565]);
      add(new THREE.CylinderGeometry(rad*.28,rad*.28,.05,16),fan,[x,-.49,ez-.565],[Math.PI/2,0,0]);
      for(let i=0;i<12;i++){let t=i*Math.PI/6;add(new THREE.BoxGeometry(rad*.64,.014,.015),fan,[x+Math.cos(t)*rad*.35,-.49+Math.sin(t)*rad*.35,ez-.59],[0,0,t]);}
    }
    prism([[side*.16,2.32],[side*1.32,2.87],[side*1.46,3.04],[side*.2,2.85]],.07,white);
    // passenger windows along both sides
    for(let z=-2.3;z<2.36;z+=.215){let radius=z>1.7?.43-(z-1.7)*.12:.48;add(new THREE.SphereGeometry(.047,10,8),glass,[side*radius*.985,.13,z],[0,0,0],[.25,.8,1]);}
    // cockpit side windows
    add(new THREE.SphereGeometry(.18,20,12),glass,[side*.205,.16,-3.04],[0,side*.4,0],[.58,.55,1.15]);
    // doors
    for(let z of [-2.15,1.83]){let door=add(new THREE.PlaneGeometry(.22,.47),underside,[side*.476,.015,z],[0,side*Math.PI/2,0]);door.material=underside;}
  }
  // Swept upright tail with a recognizable stylized green/gold motif (not official logo).
  let tailShape=new THREE.Shape();[[2.07,.2],[2.48,1.48],[3.02,1.76],[3.22,1.77],[3.13,.22]].forEach(([z,y],i)=>i?tailShape.lineTo(z,y):tailShape.moveTo(z,y));tailShape.closePath();let tg=new THREE.ExtrudeGeometry(tailShape,{depth:.075,bevelEnabled:true,bevelSize:.02,bevelThickness:.012,bevelSegments:2});tg.rotateY(Math.PI/2); // geometry coordinates transformed: x originally z, y stays y, extrusion faces x
  // Instead build vertical fin in x=0 plane explicitly.
  function finGeo(){let coords=[[0,.12,2.1],[0,1.48,2.56],[0,1.67,3.02],[0,1.67,3.19],[0,.12,3.15]],v=[],id=[];for(let x of [-.045,.045])coords.forEach(p=>v.push(x,p[1],p[2]));for(let i=1;i<4;i++){id.push(0,i,i+1,5,5+i+1,5+i)}for(let i=0;i<5;i++){let j=(i+1)%5;id.push(i,j,5+j,i,5+j,5+i)}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(id);g.computeVertexNormals();return g}add(finGeo(),teal);
  // Gold emblem detail on tail, visible on both sides.
  for(let side of [-1,1]){for(let i=0;i<3;i++){let curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.057,.85+i*.12,2.63),new THREE.Vector3(side*.058,1.02+i*.1,2.82),new THREE.Vector3(side*.059,1.1+i*.09,3.01)]);add(new THREE.TubeGeometry(curve,18,.013,6,false),gold)}
    // SAUDIA lettering on both sides, using canvas texture for clean legibility.
    let canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;let ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle='#174e62';ctx.font='bold 145px Arial';ctx.textAlign='center';ctx.fillText('SAUDIA',512,175);let texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;let mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false});add(new THREE.PlaneGeometry(1.55,.39),mat,[side*.495,.205,-1.05],[0,side*Math.PI/2,0]);}
  // Radar nose and belly antenna details
  add(new THREE.SphereGeometry(.055,16,10),dark,[0,0,-3.51]);
  for(let z of [-.5,1.55])add(new THREE.ConeGeometry(.065,.22,12),underside,[0,-.48,z],[Math.PI,0,0]);
  // Hotspots remain HTML/A-Frame entities so existing raycaster and buttons work.
  part(plane,'cockpit','0 .73 -2.95');part(plane,'wing','2.05 .3 .3');part(plane,'engine','-1.14 -.05 -.42');part(plane,'tail','0 1.9 2.95');part(plane,'fuselage','0 .8 0');
  return plane;
}
function showInfo(id){$('infoTitle').textContent=details[id][0];$('infoText').textContent=details[id][1];$('info').classList.remove('hidden')}
function update(){if(!model)return;model.setAttribute('rotation',`${rx} ${ry} 0`);model.setAttribute('scale',`${scale} ${scale} ${scale}`)}
function setupTouch(){const host=$('viewer');const isUI=e=>!!e.target.closest?.('.bar,.part-list,.panel,.status,button');host.style.touchAction='none';host.addEventListener('pointerdown',e=>{if(isUI(e))return;drag=true;moved=false;startX=e.clientX;startY=e.clientY;try{host.setPointerCapture(e.pointerId)}catch(_){}},{passive:true});host.addEventListener('pointerup',()=>drag=false);host.addEventListener('pointercancel',()=>drag=false);host.addEventListener('pointermove',e=>{if(!drag||isUI(e))return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;ry+=dx*.55;rx=Math.max(-85,Math.min(85,rx+dy*.4));startX=e.clientX;startY=e.clientY;update();},{passive:true});host.addEventListener('wheel',e=>{if(isUI(e))return;e.preventDefault();scale=Math.max(.07,Math.min(2.5,scale*(e.deltaY<0?1.07:.93)));update()},{passive:false});host.addEventListener('touchmove',e=>{if(e.touches.length===2){const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(lastPinch)scale=Math.max(.07,Math.min(2.5,scale*d/lastPinch));lastPinch=d;update();e.preventDefault()}},{passive:false});host.addEventListener('touchend',()=>lastPinch=0)}
function setupHotspotPicking(){const host=$('sceneHost');let down=null;host.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});host.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>12){down=null;return}down=null;if(!scene||!model||e.target.closest?.('button,.panel,.part-list,.bar'))return;const camera=scene.camera;if(!camera)return;const canvas=scene.canvas||host.querySelector('canvas');if(!canvas)return;const rect=canvas.getBoundingClientRect();const p=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(p,camera);const hits=[];model.querySelectorAll('[data-part]').forEach(el=>{if(el.object3D&&el.object3D.visible)el.object3D.traverse(o=>{if(o.isMesh&&o.visible){o.userData.partId=el.getAttribute('data-part');hits.push(o)}})});const hit=ray.intersectObjects(hits,false)[0];if(hit?.object?.userData?.partId)showInfo(hit.object.userData.partId)});}
function start(which){mode=which;$('home').classList.add('hidden');$('viewer').classList.add('active');$('viewer').classList.toggle('ar-mode',which==='ar');$('sceneHost').innerHTML='';scale=which==='ar'?.18:1;rx=-12;ry=-25;
const sceneAttrs=which==='ar'?{'mindar-image':'imageTargetSrc: ./assets/targets.mind; autoStart: true; uiLoading: yes; uiScanning: yes; uiError: yes',embedded:'',renderer:'alpha: true; antialias: true; colorManagement: true','vr-mode-ui':'enabled: false','device-orientation-permission-ui':'enabled: false'}:{embedded:'',renderer:'alpha: true; antialias: true','vr-mode-ui':'enabled: false'};
scene=make('a-scene',sceneAttrs,$('sceneHost'));const activeScene=scene;
make('a-entity',{light:'type: ambient; color: #fff; intensity: 1.6'},scene);make('a-entity',{light:'type: directional; color: #fff; intensity: 1.8',position:'-1 4 3'},scene);
let anchor=scene;if(which==='ar'){anchor=make('a-entity',{'mindar-image-target':'targetIndex: 0'},scene);anchor.addEventListener('targetFound',()=>{if(scene!==activeScene)return;$('status').textContent='✓ تم التعرف على الصورة! يظهر النموذج فوقها الآن';if(model){model.object3D.visible=true;$('status').textContent='✓ تم التعرف على الصورة • النموذج ظاهر فوقها'}});anchor.addEventListener('targetLost',()=>{if(scene!==activeScene)return;$('status').textContent='لإعادة التتبع، تُوجَّه الكاميرا نحو الصورة المرجعية'});make('a-camera',{position:'0 0 0','look-controls':'enabled: false',cursor:'fuse: false; rayOrigin: mouse','raycaster':'far: 10000; objects: [data-part]'},scene);$('status').textContent='توجيه الكاميرا نحو الصورة المرجعية'}else{make('a-camera',{position:'0 1.8 10','look-controls':'enabled: false',cursor:'rayOrigin: mouse','raycaster':'objects: [data-part]'},scene);$('status').textContent='وضع العرض 3D • يمكن تدوير الطائرة بالسحب'}
// Wait until A-Frame has initialized its entity/object3D graph before adding raw Three.js meshes.
const initModel=()=>{if(scene!==activeScene||model)return;model=make('a-entity',{position:which==='ar'?'0 0 .08':'0 0 0'},anchor);const build=()=>{if(scene!==activeScene||!model)return;try{buildPlane(model);update();$('info').classList.add('hidden');if(which==='ar'){$('status').textContent='النموذج جاهز • وجّه الكاميرا إلى الصورة';}}catch(err){console.error('AR model error',err);$('status').textContent='تعذر بناء النموذج: '+String(err.message||err).slice(0,85)}};if(model.hasLoaded)build();else model.addEventListener('loaded',build,{once:true})};
if(scene.hasLoaded)initModel();else scene.addEventListener('loaded',initModel,{once:true});


}
function close(){if(scene){try{if(mode==='ar'&&scene.systems['mindar-image-system'])scene.systems['mindar-image-system'].stop()}catch(e){}try{scene.pause();scene.remove()}catch(e){}scene=null;model=null}$('viewer').classList.remove('active');$('viewer').classList.remove('ar-mode');$('home').classList.remove('hidden')}
$('startAR').onclick=async()=>{try{const response=await fetch('assets/targets.mind',{method:'HEAD'});if(!response.ok)throw Error('missing');start('ar')}catch(e){alert('لتفعيل MindAR: يلزم استخدام أداة Compile في توثيق MindAR لإنشاء ملف targets.mind من الصورة المرجعية، ثم وضعه في مجلد assets ورفع الملفات إلى GitHub. يمكن تجربة الطائرة 3D بدون كاميرا.')}};
$('startPreview').onclick=()=>start('preview');$('back').onclick=close;$('reset').onclick=()=>{scale=mode==='ar'?.18:1;rx=-12;ry=-25;update()};$('zoomIn').onclick=()=>{scale=Math.min(2.5,scale*1.15);update()};$('zoomOut').onclick=()=>{scale=Math.max(.07,scale/1.15);update()};$('closeInfo').onclick=()=>$('info').classList.add('hidden');document.querySelectorAll('[data-part]').forEach(el=>el.onclick=()=>showInfo(el.dataset.part));setupTouch();setupHotspotPicking();
