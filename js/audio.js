/* POST & BEEP LAB - Síntese acústica via Web Audio API e representação de pulsos */
(function () {
  const A = {};
  let ctx = null, master = null, filter = null, compressor = null;
  let volume = 0.9, enabled = true, unlocked = false;
  let timers = [], nodes = [], playToken = 0;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();

        // Compressor de dinâmica para maximizar a audibilidade em alto-falantes de smartphones
        compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-16, ctx.currentTime);
        compressor.knee.setValueAtTime(10, ctx.currentTime);
        compressor.ratio.setValueAtTime(5, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.1, ctx.currentTime);

        master = ctx.createGain();
        master.gain.setValueAtTime(volume, ctx.currentTime);

        filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(5000, ctx.currentTime);

        master.connect(filter);
        filter.connect(compressor);
        compressor.connect(ctx.destination);
      } catch (e) {
        return null;
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // Desbloqueio universal do Web Audio API para navegadores móveis (iOS Safari e Android)
  A.unlock = function () {
    const c = ensure();
    if (!c) return;
    if (c.state === 'suspended') {
      c.resume().catch(() => {});
    }
    if (!unlocked) {
      try {
        const buf = c.createBuffer(1, 1, 22050);
        const src = c.createBufferSource();
        src.buffer = buf;
        src.connect(c.destination);
        src.start(0);
        unlocked = true;
      } catch (e) {}
    }
  };

  // Registra o desbloqueio no primeiro gesto de interação do usuário
  if (typeof document !== 'undefined') {
    const triggerUnlock = function () {
      A.unlock();
      ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach((evt) => {
        document.removeEventListener(evt, triggerUnlock, true);
      });
    };
    ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach((evt) => {
      document.addEventListener(evt, triggerUnlock, true);
    });
  }

  A.events = function (spec) {
    const ev = [];
    const SH = 0.16, LO = 0.55, GAP = 0.17;
    let t = 0.05;
    if (spec === '0') return { events: [], total: 1.2, silent: true };
    if (spec === 'C') { ev.push({ t, d: 2.6, f: 1000, kind: 'cont' }); return { events: ev, total: 2.7 }; }
    if (spec === 'R') {
      for (let i = 0; i < 8; i++) { ev.push({ t, d: 0.2, f: 1000, kind: 'rep' }); t += 0.4; }
      return { events: ev, total: t, loop: true };
    }
    if (spec === 'H') {
      for (let i = 0; i < 12; i++) { ev.push({ t, d: 0.1, f: 2600, kind: 'hi' }); t += 0.19; }
      return { events: ev, total: t, loop: true };
    }
    if (spec === 'A') {
      for (let i = 0; i < 8; i++) { ev.push({ t, d: 0.26, f: i % 2 ? 600 : 2200, kind: i % 2 ? 'lo' : 'hi' }); t += 0.29; }
      return { events: ev, total: t, loop: true };
    }
    if (spec === 'W') {
      for (let i = 0; i < 6; i++) { ev.push({ t, d: 0.42, f: i % 2 ? 1350 : 850, kind: i % 2 ? 'hi' : 'lo' }); t += 0.44; }
      return { events: ev, total: t, loop: true };
    }
    for (const ch of spec) {
      const d = ch === 'L' ? LO : SH;
      ev.push({ t, d, f: 1000, kind: ch === 'L' ? 'long' : 'short' });
      t += d + GAP;
    }
    return { events: ev, total: t };
  };

  /* Notação técnica concisa para leitura assistiva */
  A.describe = function (spec) {
    if (spec === '0') return 'Sem emissão sonora';
    if (spec === 'C') return 'Tom contínuo';
    if (spec === 'R') return 'Pulsos curtos repetidos';
    if (spec === 'H') return 'Alta frequência repetida (2.6 kHz)';
    if (spec === 'A') return 'Frequência alternada (agudo / grave)';
    if (spec === 'W') return 'Modulação de dois tons (sirene)';
    const parts = [];
    let i = 0;
    while (i < spec.length) {
      const ch = spec[i];
      let n = 0;
      while (i < spec.length && spec[i] === ch) { n++; i++; }
      parts.push(n + (ch === 'L' ? (n === 1 ? ' longo' : ' longos') : (n === 1 ? ' curto' : ' curtos')));
    }
    return parts.join(' + ');
  };

  A.viz = function (spec, extraClass) {
    const cls = extraClass || '';
    const desc = A.describe(spec);
    const { events, loop, silent } = A.events(spec);
    if (silent) {
      return '<div class="bviz-wrap ' + cls + '" role="img" aria-label="' + desc + '">' +
        '<div class="bviz" data-spec="0"><span class="bviz-none">silêncio</span></div></div>';
    }
    const bars = events.map((e, i) => {
      let w = Math.max(7, Math.round(e.d * 56));
      if (e.kind === 'cont') w = 124;
      const h = e.kind === 'hi' ? 22 : e.kind === 'lo' ? 11 : 16;
      return '<span class="b ' + e.kind + '" data-i="' + i + '" style="width:' + w + 'px;height:' + h + 'px"></span>';
    }).join('');
    const tail = loop ? '<span class="bviz-more">…</span>' : (spec === 'C' ? '<span class="bviz-more">→</span>' : '');
    const hideTxt = cls.indexOf('compact') !== -1;
    return '<div class="bviz-wrap ' + cls + '" role="img" aria-label="Padrão de pulso: ' + desc + '">' +
      '<div class="bviz" data-spec="' + spec + '">' + bars + tail + '</div>' +
      (hideTxt ? '' : '<span class="bviz-txt">' + desc + '</span>') +
      '</div>';
  };

  A.setVolume = function (v) {
    volume = Math.max(0, Math.min(1, v));
    if (master && ctx) master.gain.setValueAtTime(volume, ctx.currentTime);
  };
  A.setEnabled = function (b) {
    enabled = !!b;
    if (!enabled) A.stop();
  };
  A.isEnabled = () => enabled;

  A.stop = function () {
    playToken++;
    timers.forEach(clearTimeout); timers = [];
    nodes.forEach((n) => { try { n.stop(); } catch (e) { } });
    nodes = [];
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.bviz .b.on').forEach((b) => b.classList.remove('on'));
      document.querySelectorAll('.is-beeping').forEach((e) => e.classList.remove('is-beeping'));
    }
  };

  function tone(freq, start, dur, type, peak, freq2) {
    const c = ensure(); if (!c) return;
    try {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, start);
      if (freq2) o.frequency.linearRampToValueAtTime(freq2, start + dur);

      // Ganho calibrado para excelente audibilidade em celular (padrão 0.65)
      const p = (peak == null ? 0.65 : peak);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(p, start + 0.006);
      g.gain.setValueAtTime(p, start + Math.max(0.01, dur - 0.012));
      g.gain.linearRampToValueAtTime(0.0001, start + dur);

      o.connect(g);
      g.connect(master);
      o.start(start);
      o.stop(start + dur + 0.02);
      nodes.push(o);
      o.onended = () => { nodes = nodes.filter((n) => n !== o); };
    } catch (e) {}
  }

  A.play = function (spec, opts) {
    opts = opts || {};
    A.stop();
    const my = ++playToken;
    const { events, total, silent } = A.events(spec);
    if (silent) {
      if (opts.onEnd) setTimeout(opts.onEnd, 300);
      return total;
    }
    if (!enabled) return total;

    const c = ensure();
    const bars = opts.viz ? opts.viz.querySelectorAll('.b') : [];

    const schedule = () => {
      if (my !== playToken) return;
      const base = c ? c.currentTime + 0.05 : 0;
      events.forEach((e, i) => {
        if (c) tone(e.f, base + e.t, e.d, 'square', 0.65);
        timers.push(setTimeout(() => {
          if (my !== playToken) return;
          if (bars[i]) bars[i].classList.add('on');
          if (opts.speaker) opts.speaker.classList.add('is-beeping');
        }, (e.t + 0.05) * 1000));
        timers.push(setTimeout(() => {
          if (my !== playToken) return;
          if (bars[i]) bars[i].classList.remove('on');
          if (opts.speaker) opts.speaker.classList.remove('is-beeping');
        }, (e.t + e.d + 0.05) * 1000));
      });

      timers.push(setTimeout(() => {
        if (my !== playToken) return;
        if (opts.onEnd) opts.onEnd();
      }, (total + 0.1) * 1000));
    };

    if (c && c.state === 'suspended') {
      c.resume().then(() => {
        if (my === playToken) schedule();
      }).catch(() => {
        if (my === playToken) schedule();
      });
    } else {
      schedule();
    }

    return total;
  };

  A.sfx = function (kind) {
    if (!enabled) return;
    const c = ensure(); if (!c) return;

    const playSeq = () => {
      const t = c.currentTime + 0.01;
      const seq = {
        click: [[640, 0, 0.04]],
        ok: [[640, 0, 0.09], [860, 0.09, 0.14]],
        bad: [[240, 0, 0.14], [180, 0.13, 0.20]],
        power: [[180, 0, 0.45, 680]]
      }[kind] || [];
      seq.forEach((s) => tone(s[0], t + s[1], s[2], 'triangle', 0.45, s[3]));
    };

    if (c.state === 'suspended') {
      c.resume().then(playSeq).catch(() => {});
    } else {
      playSeq();
    }
  };

  PBL.audio = A;
})();
