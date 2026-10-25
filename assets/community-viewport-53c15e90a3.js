// A real landscape iframe viewport, uniformly scaled by the browser. No
// synthetic touches, injected keyboard events, or cross-origin DOM access.
export const LANDSCAPE_VIEWPORT={width:960,height:540};
export function viewportScale(width,height){return Math.max(0.001,Math.min(width/960,height/540));}
export function createViewport(React){return function useGameViewport(ref,orientation,device){
 const effect=React.useLayoutEffect||React.useEffect;
 effect(()=>{const root=ref.current,screen=root?.querySelector('.player-screen');if(!screen||device==='desktop'||orientation!=='landscape')return;
  const resize=()=>{root.style.setProperty('--game-input-scale',String(viewportScale(screen.clientWidth,screen.clientHeight)));};resize();
  const timers=[];
  const onOrientation=()=>{resize();timers.push(setTimeout(resize,150));timers.push(setTimeout(resize,400));};
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(screen);window.addEventListener('resize',resize);window.addEventListener('orientationchange',onOrientation);
  return()=>{timers.forEach(clearTimeout);observer?.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('orientationchange',onOrientation);root.style.removeProperty('--game-input-scale');};
 },[ref,orientation,device]);
};}
