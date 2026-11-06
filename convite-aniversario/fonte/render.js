const {chromium}=require('playwright');const {spawn}=require('child_process');const http=require('http');const fs=require('fs');const path=require('path');
const mode=process.argv[2]||'preview';
const srv=http.createServer((q,r)=>{const p=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end()}
 const ext=path.extname(p);r.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'}[ext]||'application/octet-stream'});r.end(d)})}).listen(8765);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('console',m=>console.log('PAGE',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/scene.html');await p.waitForFunction('window.ready',null,{timeout:60000});
if(mode==='preview'){for(const t of process.argv.slice(3).map(Number)){await p.evaluate(t=>renderAt(t),t);await p.screenshot({path:`prev_${t}.jpg`,type:'jpeg',quality:80});}}
else{const FPS=30,DUR=31;const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+FPS,'-c:v','mjpeg','-i','-','-i','mix.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-profile:v','high','-r',''+FPS,'-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out.mp4'],{stdio:['pipe','inherit','inherit']});
 const t0=Date.now();for(let f=0;f<FPS*DUR;f++){await p.evaluate(t=>renderAt(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%60==0)console.log('frame',f,((Date.now()-t0)/1000).toFixed(0)+'s');}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));}
await b.close();srv.close();})();
