// In-flow expansion only. No browser fullscreen, orientation lock, scroll lock,
// portals, body styling, fixed positioning, or iframe remounts.
export function createFullscreen(React){return function useExpansion(){
 const [expanded,setExpanded]=React.useState(false);
 return{expanded,enterFullscreen:()=>setExpanded(true),exitFullscreen:()=>setExpanded(false),hint:''};
};}
