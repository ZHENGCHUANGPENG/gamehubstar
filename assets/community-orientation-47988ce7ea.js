import legacy from './community-legacy-landscape-5cef0ec6ce.js';
import {declaredOrientation} from './community-client-972a9b470c.js';
const cache=new Map(),pending=new Map();let active=0;const waiting=[];
function pump(){while(active<4&&waiting.length){active++;const task=waiting.shift();task().finally(()=>{active--;pump();});}}
export function orientationOf(g){return declaredOrientation(g)||cache.get(g.thumb)||(legacy.has(String(g.id))?'landscape':null);}
// New records only: at most four thumbnail probes, one per URL. Landscape is
// the legacy/error fallback; explicit orientation always wins over cover art.
export function resolveOrientation(g){const known=orientationOf(g);if(known)return Promise.resolve(known);if(!g.thumb||typeof Image==='undefined')return Promise.resolve('landscape');if(pending.has(g.thumb))return pending.get(g.thumb);
 const promise=new Promise(resolve=>{waiting.push(()=>new Promise(done=>{const img=new Image();let finished=false;const finish=result=>{if(finished)return;finished=true;clearTimeout(timer);img.onload=img.onerror=null;cache.set(g.thumb,result);pending.delete(g.thumb);resolve(result);done();};const timer=setTimeout(()=>finish('landscape'),10000);img.onload=()=>finish(img.naturalHeight>img.naturalWidth*1.15?'portrait':'landscape');img.onerror=()=>finish('landscape');img.src=g.thumb;}));pump();});pending.set(g.thumb,promise);return promise;}
