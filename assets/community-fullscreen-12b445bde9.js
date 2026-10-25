// In-page expand only. The hook ONLY toggles expanded state; CSS sizes the stage.
// No browser fullscreen API, no orientation lock, no fixed body, no viewport variables,
// NO rotate, NO fixed overlay, NO breakout. The card stays in normal document flow.
// On expand/collapse, a window resize event is dispatched (after layout settles) so
// the game canvas re-adapts to the new box size. The iframe's own window also fires
// resize automatically when its box changes size.
export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export function createFullscreen(React){return function useFullscreen(ref,{orientation,device}){
 const [expanded,setExpanded]=React.useState(false);
 React.useEffect(()=>{
   try{
     const fire=()=>{try{window.dispatchEvent(new Event('resize'));}catch{}};
     const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame(fire):null;
     const t=setTimeout(fire,120);
     return()=>{if(raf!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(raf);clearTimeout(t);};
   }catch{return undefined;}
 },[expanded]);
 const enterFullscreen=async()=>{setExpanded(true);};
 const exitFullscreen=()=>{setExpanded(false);};
 return{expanded,enterFullscreen,exitFullscreen,hint:''};
};}
