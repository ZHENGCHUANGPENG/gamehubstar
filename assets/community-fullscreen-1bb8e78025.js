// In-page expand only. No browser fullscreen API, no orientation lock, no fixed body,
// no viewport CSS variables. The stage stays in normal document flow except for the
// portrait-landscape rotate case (CSS fixed positioning only, no browser APIs).
// This keeps iframe focus and touch coordinates stable.
export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export function createFullscreen(React){return function useFullscreen(ref,{orientation,device}){
 const [expanded,setExpanded]=React.useState(false);
 const enterFullscreen=async()=>{setExpanded(true);};
 const exitFullscreen=()=>{setExpanded(false);};
 return{expanded,enterFullscreen,exitFullscreen,hint:''};
};}
