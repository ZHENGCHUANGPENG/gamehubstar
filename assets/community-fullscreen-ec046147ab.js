// In-flow expansion only. No browser fullscreen, orientation lock, scroll lock,
// portals, body styling, fixed positioning, or iframe remounts.
export function createFullscreen(React,environment=globalThis.window,doc=globalThis.document){return function useExpansion(ref){
 const [expanded,setExpanded]=React.useState(false);
 React.useEffect(()=>{
  if(!expanded||!doc?.body||!environment)return;
  const body=doc.body,previous=body.classList.contains('theater-mode');body.classList.add('theater-mode');
  // Wait for the header/padding CSS update before aligning the in-flow card.
  const align=()=>{const card=ref?.current?.closest('.player-card')||ref?.current;if(card)environment.scrollTo({top:Math.max(0,(environment.scrollY||0)+card.getBoundingClientRect().top-4),behavior:'smooth'});};
  const frame=environment.requestAnimationFrame(align);
  return()=>{environment.cancelAnimationFrame(frame);if(!previous)body.classList.remove('theater-mode');};
 },[expanded,ref]);
 return{expanded,enterFullscreen:()=>setExpanded(true),exitFullscreen:()=>setExpanded(false),hint:''};
};}
