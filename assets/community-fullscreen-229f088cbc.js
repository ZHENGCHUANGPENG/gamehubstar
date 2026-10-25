// Desktop: native browser fullscreen (original behavior, restored).
// Mobile/tablet: in-flow theater mode (Codex behavior, unchanged).
// Branching: base passes {orientation, device} as the second argument; other
// callers may pass only ref, in which case device is read from the player DOM
// (data-device) or defaults to theater when unknown, so existing tests keep passing.
// Desktop native fullscreen uses ONLY requestFullscreen + fullscreenchange sync.
// It does NOT use body fixed styling, viewport variables, orientation lock, or
// scroll locking -- those were the mobile workarounds that caused tap bugs.
// Mobile theater behavior is unchanged: toggle expanded state, add/remove
// body.theater-mode, scroll-align the card after layout. No browser fullscreen.
export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export function createFullscreen(React,environment=globalThis.window,doc=globalThis.document){return function useFullscreen(ref,opts){
 const device=opts?.device||ref?.current?.dataset?.device||ref?.current?.closest?.('.community-game-player')?.dataset?.device||ref?.current?.closest?.('[data-device]')?.dataset?.device||null;
 const isDesktop=device==='desktop';
 const [expanded,setExpanded]=React.useState(false);
 React.useEffect(()=>{
  if(isDesktop)return;
  if(!expanded||!doc?.body||!environment)return;
  const body=doc.body,previous=body.classList.contains('theater-mode');body.classList.add('theater-mode');
  const align=()=>{const card=ref?.current?.closest('.player-card')||ref?.current;if(card)environment.scrollTo({top:Math.max(0,(environment.scrollY||0)+card.getBoundingClientRect().top-4),behavior:'smooth'});};
  const frame=environment.requestAnimationFrame(align);
  return()=>{environment.cancelAnimationFrame(frame);if(!previous)body.classList.remove('theater-mode');};
 },[expanded,ref,isDesktop]);
 React.useEffect(()=>{
  if(!isDesktop||!doc?.addEventListener)return;
  const changed=()=>{
   const fsEl=doc.fullscreenElement||doc.webkitFullscreenElement;
   if(!fsEl)setExpanded(false);
   else if(ref?.current&&(fsEl===ref.current||ref.current.contains?.(fsEl)))setExpanded(true);
  };
  doc.addEventListener('fullscreenchange',changed);doc.addEventListener('webkitfullscreenchange',changed);
  return()=>{doc.removeEventListener('fullscreenchange',changed);doc.removeEventListener('webkitfullscreenchange',changed);};
 },[isDesktop,ref]);
 const enterFullscreen=async()=>{
  if(isDesktop){
   const el=ref?.current;
   const request=el?.requestFullscreen||el?.webkitRequestFullscreen;
   if(request){try{await request.call(el);setExpanded(true);return;}catch{}}
   setExpanded(true);return;
  }
  setExpanded(true);
 };
 const exitFullscreen=()=>{
  if(isDesktop){
   const fsEl=doc?.fullscreenElement||doc?.webkitFullscreenElement;
   if(fsEl){try{Promise.resolve((doc.exitFullscreen||doc.webkitExitFullscreen)?.call(doc)).catch(()=>{});}catch{}}
  }
  setExpanded(false);
 };
 return{expanded,enterFullscreen,exitFullscreen,hint:''};
};}
