import controlsIndex from './controls-index-e51f2a6a1f.js';

// Temporary controls-based filtering only. No device-support claims are written
// to the database. Keep unknown games visible during the transition period.
export const STRICT_MOBILE_FILTER = false;

export function detectDevice(nav = globalThis.navigator, viewport = globalThis.window) {
  if (!nav || !viewport) return 'desktop';
  const ua = nav.userAgent || '';
  const touch = (nav.maxTouchPoints || 0) > 0 || 'ontouchstart' in viewport;
  const ipad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && nav.maxTouchPoints > 1);
  if (ipad || /Android/i.test(ua) && !/Mobile/i.test(ua)) return 'tablet';
  if (/Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  if (touch && viewport.innerWidth < 768) return 'mobile';
  return 'desktop';
}

const explicitUnavailable = /desktop\s*(?:only|exclusive)|(?:pc|computer)[ -]only|(?:mobile|touch|touchscreen|touch controls)[^.!?\n]{0,65}(?:not\s+(?:(?:currently|yet)\s+)?(?:supported|working|responding|playable|available)|unsupported|unavailable|unresponsive|does\s*not\s*work|doesn.t\s*work|cannot|can.t)|(?:not\s+(?:currently\s+)?supported|unsupported|not\s+playable)[^.!?\n]{0,35}(?:mobile|phone|touch)|移动端[^。\n]{0,35}(?:不支持|无法|无反应)|手机[^。\n]{0,35}(?:不支持|无法|无反应)/i;
const touchInstructions = /\b(?:taps?|tapping|swipes?|swiping|touchscreen|touch-screen|touch\s+(?:the|and|to|controls?|buttons?|screen|players?)|on[ -]screen\s+(?:controls?|buttons?|joystick)|(?:virtual|left|right)\s+(?:joystick|buttons?))\b|\b(?:mobile|phone|tablet)\s*:\s*(?!not\b|unsupported\b|unavailable\b)\S|触屏|触摸|虚拟摇杆/i;
const keyboardInstructions = /\b(?:WASD|W\s*[,/]\s*A\s*[,/]\s*S\s*[,/]\s*D|W\s+A\s+S\s+D|arrow\s+keys?|keyboard|space\s*bar|spacebar|right[ -]click|mouse\s+(?:wheel|look)|pointer\s*lock)\b|方向键|键盘|鼠标右键/i;
// These six warnings were explicitly identified by the site owner. This is a
// front-end display exception, not a new real-device test or database update.
const ownerWarnings = new Map([
  ['parkourcraft', 'Keyboard and mouse controls are required.'],
  ['brutal battle royale', 'The supplied Unity build has a mobile compatibility warning.'],
  ['nextboot horror', 'Keyboard and mouse controls are required.'],
  ['squid sniper', 'The required aiming controls are not available on touchscreens.'],
  ['snake warz', 'A game-loading error has been reported; desktop compatibility is also unverified.'],
  ['noob vs zombies forest', 'Touch controls have been reported as unresponsive.'],
  ['noob vs zombies forest biome', 'Touch controls have been reported as unresponsive.'],
]);
function titleKey(title = '') {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export function controlsFor(game = {}) {
  return typeof game.controls === 'string' ? game.controls : controlsIndex[String(game.id)] || '';
}
export function classifyGame(game = {}) {
  const controls = controlsFor(game);
  const warning = ownerWarnings.get(titleKey(game.title));
  if (warning) return { kind: 'mobile_unavailable', label: 'Mobile unavailable', warning };
  if (explicitUnavailable.test(controls)) return {
    kind: 'mobile_unavailable', label: 'Mobile unavailable',
    warning: 'The game instructions report a mobile compatibility limitation.',
  };
  if (touchInstructions.test(controls)) return {
    kind: 'touch_declared', label: 'Touch controls listed',
    warning: 'Touch controls are described by the provider; mobile play has not been verified.',
  };
  if (keyboardInstructions.test(controls)) return {
    kind: 'desktop_likely', label: 'Desktop controls',
    warning: 'The instructions list keyboard or mouse controls without a touch alternative. Mobile play may not work.',
  };
  return { kind: 'unverified', label: 'Unverified', warning: 'Device compatibility has not been verified.' };
}
export function visibleGames(games, device, mobileOnly, strict = STRICT_MOBILE_FILTER) {
  if (device === 'desktop' || !mobileOnly) return games;
  return games.filter(game => {
    const kind = classifyGame(game).kind;
    return kind === 'touch_declared' || (!strict && kind === 'unverified');
  });
}
export function platformText(game) {
  switch (classifyGame(game).kind) {
    case 'mobile_unavailable': return 'Mobile play unavailable · Desktop compatibility follows the game instructions';
    case 'desktop_likely': return 'Keyboard / mouse controls listed · Mobile compatibility unverified';
    case 'touch_declared': return 'Desktop / touch controls: see instructions · Mobile compatibility unverified';
    default: return 'Browser game · Device compatibility unverified';
  }
}
export function splitControls(value = '') {
  const text = String(value);
  const markers = [...text.matchAll(/\b(Desktop|PC|Mobile)\s*:/gi)];
  if (!markers.some(m => /desktop|pc/i.test(m[1])) || !markers.some(m => /mobile/i.test(m[1]))) {
    return { intro: '', sections: [{ label: '', text }] };
  }
  return {
    intro: text.slice(0, markers[0].index).trim(),
    sections: markers.map((m, i) => ({
      label: /mobile/i.test(m[1]) ? 'Mobile controls' : 'Desktop controls',
      text: text.slice(m.index + m[0].length, markers[i + 1]?.index ?? text.length).trim(),
    })),
  };
}

export function createDeviceSupport(React, runtime) {
  const { jsx, jsxs } = runtime;
  const Context = React.createContext(null);
  function Provider({ children }) {
    const [device] = React.useState(() => detectDevice());
    const [mobileOnly, setMobileOnly] = React.useState(true);
    const filter = React.useCallback(list => visibleGames(list, device, mobileOnly), [device, mobileOnly]);
    const value = React.useMemo(() => ({ device, mobileOnly, setMobileOnly, filter }), [device, mobileOnly, filter]);
    return jsx(Context.Provider, { value, children });
  }
  function useDevice() { return React.useContext(Context); }
  function useList(list) {
    const { filter } = useDevice();
    return React.useMemo(() => filter(list), [list, filter]);
  }
  function FilterToggle() {
    const { device, mobileOnly, setMobileOnly } = useDevice();
    if (device === 'desktop') return null;
    return jsxs('section', { className: 'device-filter', 'aria-label': 'Game device filter', children: [
      jsxs('div', { className: 'device-filter-copy', children: [
        jsx('strong', { children: mobileOnly ? 'Touch-friendly browsing' : 'Showing all games' }),
        jsx('small', { children: 'Based on game instructions, not real-device verification.' }),
      ] }),
      jsxs('button', { type: 'button', role: 'switch', 'aria-checked': mobileOnly,
        'aria-label': 'Hide games with desktop-only controls',
        className: 'device-filter-toggle', onClick: () => setMobileOnly(v => !v), children: [
          jsx('span', { className: 'device-switch-track', children: jsx('span', {}) }),
          jsx('span', { children: mobileOnly ? 'Hide desktop games' : 'Show all' }),
        ] }),
    ] });
  }
  function Badge({ game }) {
    const result = classifyGame(game);
    const icon = result.kind === 'touch_declared' ? '▣' : result.kind === 'unverified' ? '?' : '▰';
    return jsxs('span', { className: `device-badge device-badge--${result.kind}`,
      title: result.warning, 'aria-label': `${result.label}. ${result.warning}`, children: [
        jsx('span', { 'aria-hidden': true, children: icon }), jsx('span', { children: result.label }),
      ] });
  }
  function Warning({ game }) {
    const { device } = useDevice();
    const result = classifyGame(game);
    if (device === 'desktop' || !['mobile_unavailable', 'desktop_likely'].includes(result.kind)) return null;
    return jsxs('aside', { className: 'device-warning', role: 'note', children: [
      jsx('span', { 'aria-hidden': true, children: '⚠' }),
      jsxs('div', { children: [jsx('strong', { children: 'This game may not work on your mobile device' }),
        jsx('p', { children: result.warning + ' Try a desktop browser or choose a game with touch controls.' })] }),
    ] });
  }
  function Controls({ game }) {
    const original = controlsFor(game);
    const classified = classifyGame(game);
    const hasWarning = classified.kind === 'mobile_unavailable';
    // Render existing warning prefixes as English callouts without altering the
    // original controls value returned by the API or stored in the index.
    const display = hasWarning ? original.replace(/^【[^】]*】\s*/, '') : original;
    const split = splitControls(display);
    return jsxs('div', { className: 'device-controls', children: [
      hasWarning && jsx('p', { className: 'device-controls-warning', children: classified.warning }),
      split.intro && jsx('p', { className: hasWarning ? 'device-controls-warning' : '', children: split.intro }),
      jsx('div', { className: split.sections.length > 1 ? 'device-controls-columns' : '',
        children: split.sections.map((section, i) => jsxs('div', { className: 'device-controls-section', children: [
          section.label && jsx('h3', { children: section.label }),
          jsx('p', { children: section.text }),
        ] }, i)),
      }),
    ] });
  }
  function blockedClass(game) {
    const { device } = useDevice();
    const kind = classifyGame(game).kind;
    return device !== 'desktop' && ['mobile_unavailable', 'desktop_likely'].includes(kind) ? ' device-card--limited' : '';
  }
  return { Provider, useDevice, useList, FilterToggle, Badge, Warning, Controls, blockedClass, platformText };
}
