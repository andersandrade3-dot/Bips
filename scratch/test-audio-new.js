/* POST & BEEP LAB - Síntese acústica híbrida (Web Audio API + HTML5 Media Audio para iOS) */
(function () {
  const A = {};
  let ctx = null, master = null, filter = null, compressor = null;
  let volume = 0.9, enabled = true, unlocked = false;
  let timers = [], nodes = [], playToken = 0;
  let activeBlobUrl = null;

  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  function setupAudioSession() {
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
      try { navigator.audioSession.type = 'playback'; } catch (e) {}
    }
  }
  setupAudioSession();

  let iosPlayer = null;
  function getIOSPlayer() {
    if (!iosPlayer && typeof Audio !== 'undefined') {
      try {
        iosPlayer = new Audio();
        iosPlayer.setAttribute('playsinline', '');
        iosPlayer.setAttribute('webkit-playsinline', '');
        iosPlayer.preload = 'auto';
      } catch (e) {}
    }
    return iosPlayer;
  }

  function synthesizeWav(evList, totalDuration, sampleRate) {
    sampleRate = sampleRate || 22050;
    const numSamples = Math.ceil(sampleRate * (totalDuration + 0.08));
    const dataSize = numSamples * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const attack = Math.floor(sampleRate * 0.005);
    const release = Math.floor(sampleRate * 0.008);
    const vol = 0.85;

    evList.forEach((e) => {
      const startIdx = Math.floor(e.t * sampleRate);
      const endIdx = Math.min(numSamples, Math.floor((e.t + e.d) * sampleRate));
      const durSamples = endIdx - startIdx;
      for (let i = 0; i < durSamples; i++) {
        const idx = startIdx + i;
        if (idx >= numSamples) break;
        const t = i / sampleRate;
        let freq = e.f;
        if (e.f2) freq = e.f + (e.f2 - e.f) * (i / durSamples);

        const phase = (t * freq) % 1;
        const wave = phase < 0.5 ? 1 : -1;

        let env = 1;
        if (i < attack) env = i / attack;
        else if (i > durSamples - release) env = (durSamples - i) / release;

        const sample = Math.max(-1, Math.min(1, wave * env * vol));
        view.setInt16(44 + idx * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    });

    return buffer;
  }

  const sfxCache = {};
  function initSFXCache() {
    if (typeof Blob === 'undefined' || typeof URL === 'undefined') return;
    const defs = {
      click: { ev: [{ t: 0, d: 0.04, f: 640 }], tot: 0.05 },
      ok: { ev: [{ t: 0, d: 0.09, f: 640 }, { t: 0.09, d: 0.14, f: 860 }], tot: 0.24 },
      bad: { ev: [{ t: 0, d: 0.14, f: 240 }, { t: 0.13, d: 0.20, f: 180 }], tot: 0.35 },
      power: { ev: [{ t: 0, d: 0.45, f: 180, f2: 680 }], tot: 0.46 }
    };
    for (const [k, v] of Object.entries(defs)) {
      try {
        const buf = synthesizeWav(v.ev, v.tot);
        sfxCache[k] = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
      } catch (e) {}
    }
  }
  initSFXCache();

  function ensure() {
    setupAudioSession();
    if (!ctx) {
      const AC = (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch (e) {
        return null;
      }

      try {
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
        try {
          if (!master) {
            master = ctx.createGain();
            master.gain.setValueAtTime(volume, ctx.currentTime);
          }
          master.connect(ctx.destination);
        } catch (err) {}
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  A.unlock = function () {
    setupAudioSession();
    const c = ensure();
    if (c && c.state === 'suspended') {
      c.resume().catch(() => {});
    }

    const p = getIOSPlayer();
    if (p && !unlocked) {
      try {
        p.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';
        p.volume = 0.01;
        const prom = p.play();
        if (prom && prom.then) {
          prom.then(() => {
            unlocked = true;
            p.pause();
          }).catch(() => {});
        }
      } catch (e) {}
    }

    if (c && !unlocked) {
      try {
        const buf = c.createBuffer(1, 1, 22050);
        const src = c.createBufferSource();
        src.buffer = buf;
        src.connect(c.destination);
        src.start(0);
        if (c.state === 'running') unlocked = true;
      } catch (e) {}
    }
  };

  if (typeof document !== 'undefined') {
    const unlockHandler = function () {
      A.unlock();
      if (unlocked) {
        ['click', 'touchend', 'touchstart', 'pointerdown', 'pointerup', 'keydown'].forEach((evt) => {
          document.removeEventListener(evt, unlockHandler, true);
        });
      }
    };
    ['click', 'touchend', 'touchstart', 'pointerdown', 'pointerup', 'keydown'].forEach((evt) => {
      document.addEventListener(evt, unlockHandler, true);
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
    if (iosPlayer) iosPlayer.volume = volume;
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
    if (iosPlayer) {
      try {
        iosPlayer.pause();
        iosPlayer.currentTime = 0;
      } catch (e) {}
    }
    if (activeBlobUrl && typeof URL !== 'undefined') {
      try { URL.revokeObjectURL(activeBlobUrl); } catch (e) {}
      activeBlobUrl = null;
    }
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

    A.unlock();

    const bars = opts.viz ? opts.viz.querySelectorAll('.b') : [];

    events.forEach((e, i) => {
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

    if (isIOS && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      try {
        const wavBuffer = synthesizeWav(events, total);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        activeBlobUrl = URL.createObjectURL(blob);
        const p = getIOSPlayer();
        if (p) {
          p.pause();
          p.volume = volume;
          p.src = activeBlobUrl;
          p.currentTime = 0;
          const prom = p.play();
          if (prom && prom.catch) prom.catch(() => {});
        }
      } catch (e) {}
    } else {
      const c = ensure();
      const schedule = () => {
        if (my !== playToken) return;
        const base = c ? c.currentTime + 0.05 : 0;
        events.forEach((e) => {
          if (c) tone(e.f, base + e.t, e.d, 'square', 0.65);
        });
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
    }

    return total;
  };

  A.sfx = function (kind) {
    if (!enabled) return;
    A.unlock();

    if (isIOS && sfxCache[kind]) {
      const p = getIOSPlayer();
      if (p) {
        try {
          p.pause();
          p.volume = volume;
          p.src = sfxCache[kind];
          p.currentTime = 0;
          const prom = p.play();
          if (prom && prom.catch) prom.catch(() => {});
        } catch (e) {}
      }
    } else {
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
    }
  };

  if (typeof window !== 'undefined') {
    if (!window.PBL) window.PBL = {};
    window.PBL.audio = A;
  }
})();

