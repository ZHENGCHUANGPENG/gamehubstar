// Launch is independent of iframe load events. Resizing never resets a session.
export function playerOrientation(game={}) {
 const value=String(game.orientation||'unverified').toLowerCase();
 return ['portrait','landscape','both'].includes(value)?value:'unverified';
}
export function ratioFor(orientation,device){return orientation==='portrait'?'9 / 16':orientation==='landscape'?'16 / 9':device==='desktop'?'16 / 9':'9 / 16';}
export function needsRotation(orientation,device,isPortrait){return device!=='desktop'&&orientation==='landscape'&&isPortrait;}
export function createPlayerSession(React,environment=globalThis.window){return function usePlayerSession({orientation,device}){
 const read=()=>environment?.matchMedia?.('(orientation: portrait)').matches??false;
 const [portrait,setPortrait]=React.useState(read),[started,setStarted]=React.useState(false),[waiting,setWaiting]=React.useState(false);
 const locked=React.useRef(false);
 React.useEffect(()=>{const query=environment?.matchMedia?.('(orientation: portrait)');const update=()=>setPortrait(read());if(query?.addEventListener)query.addEventListener('change',update);else query?.addListener?.(update);environment?.addEventListener?.('resize',update);update();return()=>{if(query?.removeEventListener)query.removeEventListener('change',update);else query?.removeListener?.(update);environment?.removeEventListener?.('resize',update);};},[]);
 const rotate=needsRotation(orientation,device,portrait);
 const launch=(waitForRotation=false)=>{if(locked.current)return true;if(rotate&&waitForRotation){setWaiting(true);return false;}locked.current=true;setWaiting(false);setStarted(true);return true;};
 React.useEffect(()=>{if(waiting&&!rotate)launch();},[waiting,rotate]);
 return{started,waiting,rotate,launch};
};}
