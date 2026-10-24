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
  if (warning) return { kind: 'mobile_unavailable', label: titleKey(game.title) === 'snake warz' ? 'Loading issue' : 'Desktop only', warning };
  if (explicitUnavailable.test(controls)) return {
    kind: 'mobile_unavailable', label: 'Desktop only',
    warning: 'The game instructions report a mobile compatibility limitation.',
  };
  if (touchInstructions.test(controls)) return {
    kind: 'touch_declared', label: 'Mobile friendly',
    warning: 'Touch controls are described by the provider; mobile play has not been verified.',
  };
  if (keyboardInstructions.test(controls)) return {
    kind: 'desktop_likely', label: 'Desktop only',
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
  if (titleKey(game?.title) === 'snake warz') return 'Mobile unavailable · Desktop compatibility unverified';
  switch (classifyGame(game).kind) {
    case 'mobile_unavailable':
    case 'desktop_likely': return 'Desktop browsers only';
    case 'touch_declared': return 'Desktop, mobile, and tablet browsers';
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
  function DeviceIcon({ kind }) {
    const common = { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
    if (kind === 'mobile') return jsxs('svg', { ...common, children: [
      jsx('rect', { x: 6, y: 2, width: 12, height: 20, rx: 3, fill: '#fff4df' }),
      jsx('rect', { x: 8, y: 5, width: 8, height: 11, rx: 1.2, fill: '#b8ddcf', stroke: 'none' }),
      jsx('path', { d: 'M11 19h2' }),
    ] });
    if (kind === 'desktop') return jsxs('svg', { ...common, children: [
      jsx('rect', { x: 2, y: 3, width: 20, height: 14, rx: 3, fill: '#d4e4e7' }),
      jsx('path', { d: 'M12 17v5M8 22h8M6 7h12', stroke: '#95714e' }),
    ] });
    if (kind === 'warning') return jsxs('svg', { ...common, children: [
      jsx('path', { d: 'M10 4a2.3 2.3 0 0 1 4 0l8 14a2.3 2.3 0 0 1-2 3H4a2.3 2.3 0 0 1-2-3Z', fill: '#ffd98b' }),
      jsx('path', { d: 'M12 9v5m0 3h.01' }),
    ] });
    return jsxs('svg', { ...common, children: [
      jsx('circle', { cx: 12, cy: 12, r: 10, fill: '#f6ecdc' }),
      jsx('path', { d: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01' }),
    ] });
  }
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
    const [open, setOpen] = React.useState(false);
    const container = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      const close = event => { if (!container.current?.contains(event.target)) setOpen(false); };
      const escape = event => { if (event.key === 'Escape') setOpen(false); };
      document.addEventListener('pointerdown', close);
      document.addEventListener('keydown', escape);
      return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
    }, [open]);
    if (device === 'desktop') return null;
    return jsxs('div', { ref: container, className: 'device-filter-menu', children: [
      jsx('button', { type: 'button', className: 'icon-button device-filter-trigger',
        'aria-label': 'Filter games by device', 'aria-expanded': open, 'aria-controls': 'device-filter-options',
        title: mobileOnly ? 'Mobile games only' : 'All games', onClick: () => setOpen(value => !value), children:
          jsxs('svg', { viewBox: '0 0 24 24', width: 19, height: 19, fill: 'none', stroke: 'currentColor', strokeWidth: 2,
            strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, children: [
              jsx('path', { d: 'M4 6h16M4 12h16M4 18h16' }),
              jsx('circle', { cx: 9, cy: 6, r: 2, fill: 'var(--filter-knob, #fff5df)' }),
              jsx('circle', { cx: 15, cy: 12, r: 2, fill: 'var(--filter-knob, #fff5df)' }),
              jsx('circle', { cx: 8, cy: 18, r: 2, fill: 'var(--filter-knob, #fff5df)' }),
            ] }) }),
      open && jsxs('div', { id: 'device-filter-options', role: 'group', 'aria-label': 'Game device filter', className: 'device-filter-popover', children: [
        jsx('strong', { children: 'Show games' }),
        ...[{ value: true, label: 'Mobile only', detail: 'Includes unverified games', icon: 'mobile' },
          { value: false, label: 'All games', detail: 'Includes desktop games', icon: 'desktop' }].map(option =>
          jsxs('button', { type: 'button', 'aria-pressed': mobileOnly === option.value,
            onClick: () => { setMobileOnly(option.value); setOpen(false); }, children: [
              jsx(DeviceIcon, { kind: option.icon }),
              jsxs('span', { children: [jsx('b', { children: option.label }), jsx('small', { children: option.detail })] }),
              jsx('span', { className: 'device-option-check', 'aria-hidden': true, children: mobileOnly === option.value ? '✓' : '' }),
            ] }, option.label)),
      ] }),
    ] });
  }
  function Platform({ game }) {
    const result = classifyGame(game);
    return jsxs('div', { className: 'device-platform', title: result.warning, children: [
      jsx('span', { children: platformText(game) }),
      result.kind === 'touch_declared' && jsx('small', { children: 'Touch support listed in the game instructions.' }),
      result.kind === 'desktop_likely' && jsx('small', { children: 'Keyboard controls listed; no touch alternative provided.' }),
    ] });
  }
  function Warning({ game }) {
    const { device } = useDevice();
    const result = classifyGame(game);
    if (device === 'desktop' || !['mobile_unavailable', 'desktop_likely'].includes(result.kind)) return null;
    const keyboardGame = result.kind === 'desktop_likely' || /keyboard|aiming controls/i.test(result.warning);
    const loadingIssue = titleKey(game.title) === 'snake warz';
    return jsxs('aside', { className: 'device-warning', role: 'note', children: [
      jsx('span', { className: 'device-warning-icon', 'aria-hidden': true, children: jsx(DeviceIcon, { kind: loadingIssue ? 'warning' : 'desktop' }) }),
      jsxs('div', { children: [jsx('strong', { children: loadingIssue ? 'Game loading issue' : 'Please play this game on a computer' }),
        jsx('p', { children: loadingIssue ? result.warning : keyboardGame
          ? 'This game needs a keyboard and mouse and cannot be played properly on a phone. Please use a computer.'
          : 'This game does not currently work properly on mobile. Please use a computer.' })] }),
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
  function RecentCard({ game, onOpen }) {
    const limited = blockedClass(game);
    return jsxs('button', { className: 'continue-tile' + limited, onClick: () => onOpen(game), title: `Continue ${game.title}`, children: [
      jsx('img', { src: game.thumb, alt: game.title }),
    ] });
  }
  function NextCard({ game, onOpen }) {
    const limited = blockedClass(game);
    return jsxs('button', { className: 'device-next-card' + limited, onClick: () => onOpen(game), children: [
      jsx('img', { src: game.thumb, alt: '', loading: 'lazy' }), jsx('strong', { children: game.title }),
    ] });
  }
  function Search({ query, setQuery, searchIcon: SearchIcon }) {
    const [open, setOpen] = React.useState(false);
    const panel = React.useRef(null);
    const trigger = React.useRef(null);
    const input = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      input.current?.focus({ preventScroll: true });
      const outside = event => {
        if (!panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false);
      };
      const escape = event => {
        if (event.key === 'Escape') { setOpen(false); trigger.current?.focus({ preventScroll: true }); }
      };
      document.addEventListener('pointerdown', outside);
      document.addEventListener('keydown', escape);
      return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, [open]);
    return jsxs(runtime.Fragment, { children: [
      jsxs('form', { ref: panel, id: 'mobile-game-search', role: 'search', 'aria-label': 'Search games',
        className: `search-box compact-search${open ? ' compact-search--open' : ''}`,
        onSubmit: event => { event.preventDefault(); input.current?.blur(); }, children: [
          jsx(SearchIcon, { size: 18, 'aria-hidden': true }),
          jsx('input', { ref: input, type: 'search', value: query, onChange: event => setQuery(event.target.value),
            placeholder: 'Search games and categories', 'aria-label': 'Search games', autoComplete: 'off' }),
          jsx('button', { type: 'button', className: 'compact-search-close', 'aria-label': 'Close search',
            onClick: () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }, children: '×' }),
        ] }),
      jsx('button', { ref: trigger, type: 'button', className: 'icon-button mobile-search-trigger',
        'aria-label': open ? 'Close search' : 'Open search', 'aria-expanded': open, 'aria-controls': 'mobile-game-search',
        onClick: () => setOpen(value => !value), children: jsx(SearchIcon, { size: 20, 'aria-hidden': true }) }),
    ] });
  }
  return { Provider, useDevice, useList, FilterToggle, Platform, Warning, Controls, RecentCard, NextCard, Search, blockedClass, platformText };
}
