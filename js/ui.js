/* POST & BEEP LAB - Utilitários de interface e componentes técnicos */
(function () {
  const U = {};

  U.$ = (s, r) => (r || document).querySelector(s);
  U.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  U.icon = (name, cls) => '<i data-lucide="' + name + '"' + (cls ? ' class="' + cls + '"' : '') + '></i>';
  U.refreshIcons = function () {
    if (window.lucide && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) { }
    }
  };
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Temporizadores associados à tela ativa */
  let bag = [];
  U.later = function (fn, ms) { const id = setTimeout(fn, ms); bag.push(id); return id; };
  U.clearTimers = function () { bag.forEach(clearTimeout); bag = []; };

  /* Notificação discreta */
  U.toast = function (msg) {
    const root = U.$('#toasts'); if (!root) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2400);
    setTimeout(() => t.remove(), 2800);
  };

  /* Barra discreta exibida somente quando o áudio está silenciado */
  U.muteBanner = function () {
    if (PBL.audio.isEnabled()) return '';
    return '<div class="mute-banner" role="status">' +
      '<div class="mb-txt">' + U.icon('volume-x') + '<span>Áudio silenciado. Acompanhe os sinais pelos diagramas de pulso ou reative o som.</span></div>' +
      '<button type="button" class="btn sm ghost" data-enable-sound>Ativar áudio</button>' +
      '</div>';
  };

  /* Retorno técnico de questões e diagnósticos */
  U.feedback = function (o) {
    return '<div class="feedback ' + (o.ok ? 'ok' : 'bad') + '" role="region" aria-label="Análise da resposta">' +
      '<div class="fb-head">' + U.icon(o.ok ? 'check-circle-2' : 'alert-circle') + '<strong>' + o.title + '</strong></div>' +
      '<p class="fb-text">' + o.explain + '</p>' +
      (o.component || o.procedure
        ? '<div class="fb-meta">' +
        (o.component ? '<div class="fb-row"><small>Subsistema associado</small><b>' + o.component + '</b></div>' : '') +
        (o.procedure ? '<div class="fb-row"><small>Conduta recomendada</small><b>' + o.procedure + '</b></div>' : '') +
        '</div>'
        : '') +
      '</div>';
  };

  /* Ordenação de procedimentos técnicos */
  U.orderWidget = function (root, cfg) {
    const steps = U.shuffle(cfg.steps);
    let picks = [], done = false;
    root.innerHTML = '<div class="order">' +
      '<p class="order-hint">Selecione os procedimentos válidos na sequência exata de execução. Há alternativas inadequadas que devem ser descartadas.</p>' +
      '<div class="order-grid">' +
      '<div class="order-col"><h4>Procedimentos listados</h4><div class="order-pool"></div></div>' +
      '<div class="order-col"><h4>Sequência definida</h4><ol class="order-seq"></ol></div>' +
      '</div>' +
      '<div class="order-actions">' +
      '<button type="button" class="btn ghost sm" data-undo disabled>' + U.icon('undo-2') + ' Desfazer</button>' +
      '<button type="button" class="btn ghost sm" data-clear disabled>' + U.icon('rotate-ccw') + ' Limpar</button>' +
      '<button type="button" class="btn primary" data-confirm disabled>Confirmar sequência</button>' +
      '</div></div>';

    const pool = U.$('.order-pool', root),
      seq = U.$('.order-seq', root),
      btnConfirm = U.$('[data-confirm]', root),
      btnUndo = U.$('[data-undo]', root),
      btnClear = U.$('[data-clear]', root);

    function render() {
      const avail = steps.filter((s) => !picks.includes(s.id));
      pool.innerHTML = avail.length
        ? avail.map((s) => '<button type="button" class="order-item" data-add="' + s.id + '"><span class="oi-plus">+</span><span>' + U.esc(s.text) + '</span></button>').join('')
        : '<div class="order-empty">Todos os itens foram alocados.</div>';

      seq.innerHTML = picks.length
        ? picks.map((id, i) => {
          const s = steps.find((x) => x.id === id);
          let cls = '';
          if (done) cls = cfg.order[i] === id ? 'right' : 'wrong';
          return '<li class="order-picked ' + cls + '">' +
            '<span class="op-num">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<span class="op-txt">' + U.esc(s.text) + '</span>' +
            (done ? '' : '<button type="button" class="op-del" data-del="' + id + '" aria-label="Remover etapa ' + (i + 1) + '">&times;</button>') +
            '</li>';
        }).join('')
        : '<li class="order-empty">Nenhuma etapa selecionada.</li>';

      btnConfirm.disabled = done || picks.length === 0;
      btnUndo.disabled = done || picks.length === 0;
      btnClear.disabled = done || picks.length === 0;
    }

    root.addEventListener('click', (e) => {
      if (done) return;
      const add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
      if (add) { picks.push(add.dataset.add); PBL.audio.sfx('click'); render(); }
      else if (del) { picks = picks.filter((p) => p !== del.dataset.del); PBL.audio.sfx('click'); render(); }
      else if (e.target.closest('[data-undo]')) { picks.pop(); PBL.audio.sfx('click'); render(); }
      else if (e.target.closest('[data-clear]')) { picks = []; PBL.audio.sfx('click'); render(); }
      else if (e.target.closest('[data-confirm]')) {
        done = true;
        const ok = picks.length === cfg.order.length && picks.every((p, i) => p === cfg.order[i]);
        render();
        const right = '<div class="order-answer"><b>Sequência técnica de referência</b><ol>' +
          cfg.order.map((id) => '<li>' + U.esc(steps.find((x) => x.id === id).text) + '</li>').join('') +
          '</ol></div>';
        root.querySelector('.order').insertAdjacentHTML('beforeend', right);
        U.$('.order-actions', root).remove();
        U.$('.order-hint', root).remove();
        cfg.onSubmit(ok);
      }
    });
    render();
    U.refreshIcons();
  };

  /* Anel minimalista de nota na avaliação final */
  U.scoreRing = function (pct, label, sub) {
    const r = 46, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<div class="score-ring"><svg viewBox="0 0 112 112" aria-hidden="true">' +
      '<circle cx="56" cy="56" r="' + r + '" class="sr-bg"/>' +
      '<circle cx="56" cy="56" r="' + r + '" class="sr-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 56 56)"/>' +
      '</svg><div class="sr-center"><b>' + label + '</b><small>' + (sub || '') + '</small></div></div>';
  };

  /* Paginação editorial entre módulos */
  const FLOW = [
    { id: 'dashboard', code: '00', label: 'Visão geral' },
    { id: 'm1', code: '01', label: 'Conhecendo o POST' },
    { id: 'm2', code: '02', label: 'Códigos de bipes' },
    { id: 'm3', code: '03', label: 'BIOS e fabricantes' },
    { id: 'm4', code: '04', label: 'Componentes e falhas' },
    { id: 'm5', code: '05', label: 'Laboratório de simulação' },
    { id: 'm6', code: '06', label: 'Desafio do técnico' },
    { id: 'm7', code: '07', label: 'Avaliação final' },
    { id: 'quick', code: 'REF', label: 'Consulta rápida' },
    { id: 'safety', code: 'SEG', label: 'Protocolo de segurança' },
    { id: 'final', code: 'FIM', label: 'Encerramento' }
  ];

    U.navFooter = function (currentId, opts) {
      opts = opts || {};
      const idx = FLOW.findIndex((f) => f.id === currentId);
      if (idx === -1) return '';
      const prev = idx > 0 ? FLOW[idx - 1] : null;
      const next = idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
      let nextHTML = '<a class="snav-card next" href="#/dashboard"><small>Início &rarr;</small><b><span>00</span>Visão geral</b></a>';
      if (next) {
        if (opts.lockNext) {
          nextHTML = '<div class="snav-card next locked" id="snav-next" data-target="' + next.id + '" title="' + (opts.lockMsg || 'Conclua a fase atual para prosseguir') + '">' +
            '<small>Próximo · Bloqueado</small>' +
            '<b><span>' + next.code + '</span>' + next.label + ' ' + U.icon('lock') + '</b>' +
            '<span class="snav-lock-hint">' + (opts.lockMsg || 'Conclua a fase atual para liberar') + '</span>' +
            '</div>';
        } else {
          nextHTML = '<a class="snav-card next" id="snav-next" href="#/' + next.id + '"><small>Próximo &rarr;</small><b><span>' + next.code + '</span>' + next.label + '</b></a>';
        }
      }
      return '<nav class="step-nav" aria-label="Navegação sequencial">' +
        (prev
          ? '<a class="snav-card prev" href="#/' + prev.id + '"><small>&larr; Anterior</small><b><span>' + prev.code + '</span>' + prev.label + '</b></a>'
          : '<span class="snav-spacer"></span>') +
        nextHTML +
        '</nav>';
    };

    U.unlockNavNext = function (nextId) {
      const el = document.getElementById('snav-next');
      if (!el || !el.classList.contains('locked')) return;
      const item = FLOW.find((f) => f.id === nextId) || { code: '06', label: 'Desafio do técnico' };
      el.outerHTML = '<a class="snav-card next unlocked" id="snav-next" href="#/' + nextId + '">' +
        '<small>Próximo liberado &rarr;</small>' +
        '<b><span>' + item.code + '</span>' + item.label + ' ' + U.icon('arrow-right') + '</b>' +
        '<span class="snav-unlocked-hint">Fase concluída com sucesso</span>' +
        '</a>';
      U.refreshIcons();
      U.toast('Nova fase liberada: Módulo ' + item.code);
    };

    PBL.ui = U;
  }) ();
