export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export async function requestGameFullscreen(element,orientation,environment=globalThis.window){
 let native=false,locked=false;const request=element?.requestFullscreen||element?.webkitRequestFullscreen;
 if(request)try{await request.call(element);native=true;}catch{}
 const direction=requestedOrientation(orientation);
 if(direction&&environment?.screen?.orientation?.lock)try{await environment.screen.orientation.lock(direction);locked=true;}catch{}
 return{native,locked};
}
export function manualRotationHint(orientation,device,isPortrait,locked=false){
 if(device==='desktop'||locked||!requestedOrientation(orientation)||(orientation==='portrait')===isPortrait)return '';
 return `For ${orientation} fullscreen, turn your phone ${orientation==='landscape'?'sideways':'upright'}. If it does not rotate, turn off your phone’s orientation lock.`;
}
export function createFullscreen(React,environment=globalThis.window,doc=globalThis.document){return function useFullscreen(ref,{orientation,device}){
 const [expanded,setExpanded]=React.useState(false),[hint,setHint]=React.useState('');
 const active=React.useRef(false),nativeSeen=React.useRef(false),locked=React.useRef(false),savedFocus=React.useRef(null),sequence=React.useRef(0);
 const fullscreenElement=()=>doc?.fullscreenElement||doc?.webkitFullscreenElement;
 const unlock=()=>{try{environment?.screen?.orientation?.unlock?.();}catch{}};
 const closeNative=()=>{if(fullscreenElement()!==ref.current)return;try{Promise.resolve((doc.exitFullscreen||doc.webkitExitFullscreen)?.call(doc)).catch(()=>{});}catch{}};
 const exitFullscreen=()=>{sequence.current++;active.current=false;nativeSeen.current=false;setExpanded(false);setHint('');closeNative();unlock();};
 const updateHint=()=>{const portrait=(environment?.visualViewport?.height||environment?.innerHeight)>(environment?.visualViewport?.width||environment?.innerWidth);setHint(active.current?manualRotationHint(orientation,device,portrait,locked.current):'');};
 const enterFullscreen=async()=>{
  if(active.current)return;const ticket=++sequence.current;active.current=true;nativeSeen.current=false;locked.current=false;savedFocus.current=doc?.activeElement;setExpanded(true);updateHint();
  const result=await requestGameFullscreen(ref.current,orientation,environment);
  if(ticket!==sequence.current||!active.current){closeNative();unlock();return;}
  nativeSeen.current=result.native;locked.current=result.locked;updateHint();
 };
 React.useEffect(()=>{const changed=()=>{if(fullscreenElement()===ref.current)nativeSeen.current=true;else if(nativeSeen.current)exitFullscreen();};doc?.addEventListener('fullscreenchange',changed);doc?.addEventListener('webkitfullscreenchange',changed);return()=>{active.current=false;sequence.current++;doc?.removeEventListener('fullscreenchange',changed);doc?.removeEventListener('webkitfullscreenchange',changed);closeNative();unlock();};},[ref]);
 React.useEffect(()=>{
  if(!expanded)return;const body=doc.body,html=doc.documentElement,stage=ref.current,x=environment.scrollX,y=environment.scrollY,keys=['overflow','position','top','left','right','width'];
  const saved=Object.fromEntries(keys.map(key=>[key,body.style[key]])),htmlOverflow=html.style.overflow;
  html.style.overflow='hidden';Object.assign(body.style,{overflow:'hidden',position:'fixed',top:`${-y}px`,left:'0',right:'0',width:'100%'});body.classList.add('game-fullscreen');
  const resize=()=>{stage?.style.setProperty('--game-viewport-width',`${environment.visualViewport?.width||environment.innerWidth}px`);stage?.style.setProperty('--game-viewport-height',`${environment.visualViewport?.height||environment.innerHeight}px`);updateHint();};
  const key=e=>{if(e.key==='Escape')exitFullscreen();};resize();environment.addEventListener('resize',resize);environment.addEventListener('orientationchange',resize);environment.visualViewport?.addEventListener('resize',resize);environment.addEventListener('keydown',key);
  return()=>{environment.removeEventListener('resize',resize);environment.removeEventListener('orientationchange',resize);environment.visualViewport?.removeEventListener('resize',resize);environment.removeEventListener('keydown',key);body.classList.remove('game-fullscreen');Object.assign(body.style,saved);html.style.overflow=htmlOverflow;stage?.style.removeProperty('--game-viewport-width');stage?.style.removeProperty('--game-viewport-height');savedFocus.current?.focus?.({preventScroll:true});environment.scrollTo(x,y);};
 },[expanded,ref,orientation,device]);
 return{expanded,enterFullscreen,exitFullscreen,hint};
};}
