// In-place expand only. The hook ONLY toggles expanded state; CSS sizes the stage.
// No browser fullscreen API, no orientation lock, no fixed body, no viewport variables,
// NO rotate, NO fixed overlay, NO breakout. The card stays in normal document flow.
// On expand/collapse, window resize events are dispatched (immediately, mid-transition,
// and after the .35s height transition completes) so the game canvas re-adapts to the
// new box size. The iframe's own window also fires resize automatically when its box
// changes size. Users play landscape games by physically rotating the phone; no
// browser fullscreen or CSS rotation is involved.
export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export function createFullscreen(React){return function useFullscreen(ref,{orientation,device}){
 const [expanded,setExpanded]=React.useState(false);
 React.useEffect(()=>{
   try{
     const fire=()=>{try{window.dispatchEvent(new Event('resize'));}catch{}};
     const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame(fire):null;
     const t1=setTimeout(fire,120);
     const t2=setTimeout(fire,400);
     return()=>{if(raf!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(raf);clearTimeout(t1);clearTimeout(t2);};
   }catch{return undefined;}
 },[expanded]);
 const enterFullscreen=async()=>{setExpanded(true);};
 const exitFullscreen=()=>{setExpanded(false);};
 return{expanded,enterFullscreen,exitFullscreen,hint:''};
};}
