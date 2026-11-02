/* POST & BEEP LAB - Preferências assistivas (som, aparência e tamanho de fonte) */
(function () {
  const KEY = 'postbeeplab.prefs.v2';
  const FONTS = ['normal', 'large', 'xlarge'];
  const FONT_NAMES = ['Normal (100%)', 'Conforto (108%)', 'Grande (116%)'];
  const S = {};
  const listeners = [];
  let state;

  const fresh = () => ({
    sound: true,
    volume: 0.6,
    theme: 'light', // 'light' (claro moderno) | 'soft' (ardósia suave, não muito escuro)
    fontScale: 0,   // 0 = normal, 1 = conforto, 2 = grande
    simDoneCount: 0
  });

  function applyDOM() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    const root = document.documentElement;
    const isSoft = state.theme === 'soft';
    root.dataset.theme = isSoft ? 'soft' : 'light';
    root.dataset.font = FONTS[state.fontScale] || 'normal';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isSoft ? '#1b1e24' : '#f7f8fa');
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh();
    } catch (e) {
      state = fresh();
    }
    if (state.theme !== 'soft' && state.theme !== 'light') state.theme = 'light';
    if (![0, 1, 2].includes(state.fontScale)) state.fontScale = 0;
    applyDOM();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* armazenamento indisponível */ }
  }

  function emit() { listeners.forEach((fn) => fn(state)); }

  load();

  S.get = () => state;
  S.subscribe = (fn) => listeners.push(fn);
  S.setPref = function (k, v) {
    state[k] = v;
    applyDOM();
    save();
    emit();
  };
  S.cycleFont = function () {
    state.fontScale = (state.fontScale + 1) % 3;
    applyDOM();
    save();
    emit();
    return FONT_NAMES[state.fontScale];
  };
  S.toggleTheme = function () {
    state.theme = state.theme === 'light' ? 'soft' : 'light';
    applyDOM();
    save();
    emit();
    return state.theme;
  };
  S.fontLabel = () => FONT_NAMES[state.fontScale] || FONT_NAMES[0];
  S.hasSimDone = () => (state.simDoneCount || 0) > 0;
  S.incrementSimDone = function () {
    state.simDoneCount = (state.simDoneCount || 0) + 1;
    save();
    emit();
    return state.simDoneCount;
  };

  PBL.store = S;
})();
