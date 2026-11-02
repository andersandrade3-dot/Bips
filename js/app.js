/* POST & BEEP LAB - Roteamento, navegação responsiva e preferências */
(function () {
  const U = PBL.ui, D = PBL.data, S = PBL.store, A = PBL.audio;
  const $ = U.$, ic = U.icon;

  PBL.footerHTML =
    '<div class="foot-in">' +
    '<b>POST &amp; BEEP LAB · Material educacional</b>' +
    '<span>Desenvolvido por Professor Anderson Andrade</span>' +
    '<span>Disciplina: Arquitetura, Montagem e Manutenção de Computadores</span>' +
    '</div>';

  let current = null;

  function closeNav() {
    document.body.classList.remove('nav-open');
  }

  function buildNav() {
    const nav = $('#nav');
    const item = (href, iconName, label) =>
      '<a class="nav-item" data-route="' + href + '" href="#/' + href + '">' +
      ic(iconName) + '<span>' + label + '</span></a>';

    nav.innerHTML =
      item('dashboard', 'layout-grid', 'Visão geral') +
      '<div class="nav-sec">Módulos</div>' +
      D.modules.map((m) =>
        '<a class="nav-item" data-route="' + m.id + '" href="#/' + m.id + '">' +
        '<span class="nv-code">' + m.code + '</span>' +
        '<span class="nv-title">' + m.title + '</span>' +
        '</a>'
      ).join('') +
      '<div class="nav-sec">Referência</div>' +
      item('quick', 'search', 'Consulta rápida') +
      item('safety', 'shield-check', 'Segurança') +
      item('final', 'check-circle-2', 'Encerramento') +
      '<button type="button" class="nav-item nav-btn" id="btn-intro">' +
      ic('power') + '<span>Tela de abertura</span></button>';

    $('#btn-intro').onclick = () => {
      closeNav();
      PBL.intro.show();
    };
    updateChrome();
  }

  function updateChrome() {
    const st = S.get();
    const sndIcon = $('#sound-icon'), sndLbl = $('#sound-lbl'), sndBtn = $('#btn-sound');
    if (sndIcon) sndIcon.innerHTML = ic(st.sound ? 'volume-2' : 'volume-x');
    if (sndLbl) sndLbl.textContent = st.sound ? 'Áudio' : 'Mudo';
    if (sndBtn) {
      sndBtn.classList.toggle('muted-btn', !st.sound);
      sndBtn.title = st.sound ? 'Silenciar áudio' : 'Ativar áudio';
    }

    const thIcon = $('#theme-icon'), thBtn = $('#btn-theme');
    if (thIcon) thIcon.innerHTML = ic(st.theme === 'soft' ? 'sun' : 'moon');
    if (thBtn) thBtn.title = st.theme === 'soft' ? 'Alternar para tema claro' : 'Alternar para tema grafite';

    const fBtn = $('#btn-font');
    if (fBtn) fBtn.title = 'Escala de texto: ' + S.fontLabel();

    if (st.sound) {
      U.$$('.mute-banner').forEach((el) => el.remove());
    }
    U.refreshIcons();
  }

  const router = PBL.router = {
    route() {
      const name = (location.hash.replace(/^#\//, '') || 'dashboard').split('?')[0];
      const view = PBL.views[name];
      if (!view) { location.hash = '#/dashboard'; return; }
      if (current && current.destroy) current.destroy();
      U.clearTimers(); A.stop();
      current = view;

      const root = $('#view');
      root.innerHTML = '';
      root.className = 'view enter';
      view.render(root);
      U.refreshIcons();

      $('#page-title').textContent = view.title || 'POST & BEEP LAB';
      U.$$('.nav-item').forEach((a) => a.classList.toggle('active', a.dataset.route === name));
      U.$$('[data-bnav]').forEach((a) => a.classList.toggle('active', a.dataset.bnav === name));
      closeNav();
      window.scrollTo(0, 0);
    }
  };

  function setSound(on) {
    S.setPref('sound', on);
    A.setEnabled(on);
    if (on) A.sfx('ok');
    U.toast(on ? 'Áudio ativado' : 'Áudio silenciado');
  }

  function init() {
    A.setEnabled(S.get().sound);
    A.setVolume(S.get().volume);
    $('#foot').innerHTML = PBL.footerHTML;
    buildNav();
    S.subscribe(updateChrome);

    window.addEventListener('hashchange', () => {
      if (!$('#app').classList.contains('hidden')) router.route();
    });

    $('#btn-menu').onclick = () => document.body.classList.toggle('nav-open');
    if ($('#btn-close-nav')) $('#btn-close-nav').onclick = closeNav;
    $('#nav-scrim').onclick = closeNav;
    if ($('#btn-bnav-menu')) {
      $('#btn-bnav-menu').onclick = () => document.body.classList.toggle('nav-open');
    }

    $('#btn-sound').onclick = () => setSound(!S.get().sound);

    if ($('#btn-font')) {
      $('#btn-font').onclick = () => {
        const lbl = S.cycleFont();
        A.sfx('click');
        U.toast('Escala de texto: ' + lbl);
      };
    }

    if ($('#btn-theme')) {
      $('#btn-theme').onclick = () => {
        const t = S.toggleTheme();
        A.sfx('click');
        U.toast(t === 'soft' ? 'Tema grafite ativado' : 'Tema claro ativado');
      };
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-enable-sound]')) setSound(true);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    $('#brand').onclick = () => { location.hash = '#/dashboard'; };
    $('#brand').onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = '#/dashboard'; }
    };

    const params = new URLSearchParams(location.search);
    PBL.intro.mount();
    if (sessionStorage.getItem('pbl-started') || params.get('skipIntro') === '1') {
      U.clearTimers();
      $('#intro').classList.add('gone');
      $('#app').classList.remove('hidden');
      router.route();
    }
    U.refreshIcons();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
