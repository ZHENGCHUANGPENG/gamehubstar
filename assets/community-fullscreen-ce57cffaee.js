// In-page expand only. No browser requestFullscreen, no orientation lock, no fixed body,
// no viewport CSS variables. The stage stays in normal document flow; responsive CSS
// sizes it. This keeps iframe focus and touch coordinates stable and avoids every
// global-fullscreen click bug (stale viewport on iOS rotation, fixed-body offset, etc).
export function requestedOrientation(value){return value==='portrait'||value==='landscape'?value:null;}
export function createFullscreen(React){return function useFullscreen(ref,{orientation,device}){
 const [expanded,setExpanded]=React.useState(false);
 const enterFullscreen=async()=>{setExpanded(true);};
 const exitFullscreen=()=>{setExpanded(false);};
 return{expanded,enterFullscreen,exitFullscreen,hint:''};
};}
