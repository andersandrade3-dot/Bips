/* POST & BEEP LAB - Diagramas vetoriais técnicos (CAD / Esquemático de Hardware) */
(function () {
  const B = {};

  function fan(cx, cy, r, stroke, blades) {
    let s = '<g class="spin" style="transform-origin:' + cx + 'px ' + cy + 'px">';
    const n = blades || 5;
    for (let i = 0; i < n; i++) {
      s += '<ellipse cx="' + cx + '" cy="' + (cy - r * 0.5) + '" rx="' + (r * 0.18) + '" ry="' + (r * 0.4) + '" fill="#2d323e" stroke="' + stroke + '" stroke-width="0.9" transform="rotate(' + (i * 360 / n) + ' ' + cx + ' ' + cy + ')"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.22) + '" fill="#181a20" stroke="' + stroke + '" stroke-width="1.2"/></g>';
  }
  B.fan = fan;

  /* ---------- Esquemático arquitetural da placa-mãe (viewBox 640x430) ---------- */
  B.board = function (opts) {
    opts = opts || {};
    let atxPins = '';
    for (let i = 0; i < 12; i++) {
      atxPins += '<rect x="428" y="' + (56 + i * 12) + '" width="8" height="8" rx="1" fill="#181a20" stroke="#525866" stroke-width="0.8"/>' +
        '<rect x="441" y="' + (56 + i * 12) + '" width="8" height="8" rx="1" fill="#181a20" stroke="#525866" stroke-width="0.8"/>';
    }
    let vrm = '';
    [[94, 76], [94, 100], [94, 124], [94, 148], [122, 38], [150, 38], [178, 38], [206, 38]].forEach((p) => {
      vrm += '<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 6) + '" width="12" height="12" rx="2" fill="#252934" stroke="#525866" stroke-width="1"/>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.2" fill="#7c8496"/>';
    });
    let ramSlots = '';
    for (let i = 0; i < 4; i++) {
      const x = 270 + i * 16;
      ramSlots += '<rect x="' + x + '" y="52" width="11" height="166" rx="1.5" fill="#14161b" stroke="#454b59" stroke-width="1"/>';
      if (i < 2) {
        ramSlots += '<rect x="' + (x + 1) + '" y="56" width="9" height="158" rx="1" fill="#26332d" stroke="#4d7c66" stroke-width="1"/>';
        ramSlots += '<rect x="' + (x + 2) + '" y="50" width="7" height="3" fill="#d4a843"/><rect x="' + (x + 2) + '" y="217" width="7" height="3" fill="#d4a843"/>';
      }
    }
    let gpuFins = '';
    for (let i = 0; i < 10; i++) {
      gpuFins += '<line x1="' + (242 + i * 11) + '" y1="342" x2="' + (242 + i * 11) + '" y2="386" stroke="#454b59" stroke-width="2"/>';
    }
    const psuCable =
      '<path d="M456 82 C478 82 478 90 500 90" class="cable" stroke="#d4a843"/>' +
      '<path d="M456 112 C478 112 478 118 500 118" class="cable" stroke="#7c8496"/>' +
      '<path d="M456 142 C478 142 478 146 500 146" class="cable" stroke="#525866"/>' +
      '<path d="M456 172 C478 172 478 174 500 174" class="cable" stroke="#3c414e"/>';

    return '<svg class="board' + (opts.interactive ? ' interactive' : '') + '" viewBox="0 0 640 430" role="img" aria-label="Esquemático técnico da placa-mãe e fonte ATX">' +
      /* Placa principal PCB */
      '<rect class="pcb" data-comp="mobo" x="12" y="12" width="458" height="406" rx="10" fill="#181a20" stroke="#363b47" stroke-width="1.5"/>' +
      /* Furos de fixação da PCB */
      '<circle cx="26" cy="26" r="4" fill="#121318" stroke="#454b59"/><circle cx="456" cy="26" r="4" fill="#121318" stroke="#454b59"/>' +
      '<circle cx="26" cy="404" r="4" fill="#121318" stroke="#454b59"/><circle cx="456" cy="404" r="4" fill="#121318" stroke="#454b59"/>' +
      /* Trilhas de barramento */
      '<g class="traces"><path d="M238 98 H270"/><path d="M238 122 H270"/><path d="M238 146 H258 V232 H272"/><path d="M170 188 V264 H272"/><path d="M298 302 V334"/><path d="M326 278 H356"/><path d="M202 188 V310 H272"/><path d="M408 278 H424 V208"/><path d="M58 198 V232"/><path d="M58 282 V334"/></g>' +
      vrm +
      /* Painel traseiro E/S / Teclado */
      '<g class="comp" data-comp="kbd" id="c-kbd"><rect class="hit" x="16" y="34" width="72" height="164" rx="6"/>' +
      '<rect x="22" y="42" width="28" height="20" rx="2" fill="#252934" stroke="#525866"/><rect x="22" y="68" width="28" height="20" rx="2" fill="#252934" stroke="#525866"/><rect x="22" y="94" width="28" height="20" rx="2" fill="#252934" stroke="#525866"/><rect x="22" y="120" width="28" height="20" rx="2" fill="#252934" stroke="#525866"/><rect x="22" y="146" width="28" height="32" rx="2" fill="#252934" stroke="#525866"/>' +
      '<text class="lbl muted-lbl" x="55" y="55">PS/2</text><text class="lbl muted-lbl" x="55" y="81">USB</text><text class="lbl muted-lbl" x="55" y="107">USB</text><text class="lbl muted-lbl" x="55" y="133">LAN</text><text class="lbl muted-lbl" x="55" y="165">I/O</text>' +
      '<circle class="led" cx="79" cy="43" r="4.5"/></g>' +
      /* PC Speaker */
      '<g class="comp" data-comp="spk" id="c-spk"><rect class="hit" x="16" y="210" width="74" height="86" rx="6"/>' +
      '<circle cx="52" cy="246" r="19" fill="#222630" stroke="#687082" stroke-width="1.4"/><circle cx="52" cy="246" r="9" fill="#15171d" stroke="#525866"/><circle cx="52" cy="246" r="2.8" fill="#d4a843"/>' +
      '<path class="wave w1" d="M76 235 Q84 246 76 257"/><path class="wave w2" d="M82 229 Q93 246 82 263"/>' +
      '<text class="lbl" x="52" y="285" text-anchor="middle">SPEAKER</text><circle class="led" cx="80" cy="219" r="4.5"/></g>' +
      /* Soquete CPU + Cooler */
      '<g class="comp" data-comp="cpu" id="c-cpu"><rect class="hit" x="104" y="50" width="136" height="146" rx="8"/>' +
      '<rect x="114" y="60" width="116" height="116" rx="6" fill="#20242e" stroke="#525866" stroke-width="1.2"/><rect x="130" y="76" width="84" height="84" rx="4" fill="#282d39" stroke="#687082" stroke-width="1"/>' +
      fan(172, 118, 36, '#7c8496', 5) +
      '<text class="lbl" x="172" y="189" text-anchor="middle">CPU SOCKET</text><circle class="led" cx="230" cy="59" r="4.5"/></g>' +
      /* Bancos DIMM RAM */
      '<g class="comp" data-comp="ram" id="c-ram"><rect class="hit" x="262" y="42" width="82" height="194" rx="6"/>' + ramSlots +
      '<text class="lbl" x="303" y="230" text-anchor="middle">DIMM DDR</text><circle class="led" cx="335" cy="50" r="4.5"/></g>' +
      /* Chipset / Placa-mãe */
      '<g class="comp" data-comp="mobo" id="c-mobo"><rect class="hit" x="262" y="244" width="82" height="76" rx="6"/>' +
      '<rect x="272" y="254" width="56" height="44" rx="4" fill="#232732" stroke="#687082" stroke-width="1.2"/>' +
      '<line x1="278" y1="262" x2="322" y2="262" stroke="#3c414e"/><line x1="278" y1="290" x2="322" y2="290" stroke="#3c414e"/>' +
      '<text class="lbl muted-lbl" x="300" y="280" text-anchor="middle">CHIPSET</text>' +
      '<text class="lbl" x="302" y="313" text-anchor="middle">PLACA-MÃE</text><circle class="led" cx="335" cy="252" r="4.5"/></g>' +
      /* BIOS ROM + Bateria CR2032 */
      '<g class="comp" data-comp="bios" id="c-bios"><rect class="hit" x="348" y="240" width="116" height="98" rx="6"/>' +
      '<rect x="356" y="262" width="48" height="32" rx="3" fill="#20242e" stroke="#687082" stroke-width="1.2"/><circle cx="363" cy="269" r="2" fill="#d4a843"/><text class="lbl" x="380" y="282" text-anchor="middle">BIOS</text>' +
      '<circle cx="432" cy="292" r="20" fill="#cfd4dc" stroke="#687082" stroke-width="1.5"/><circle cx="432" cy="292" r="14" fill="none" stroke="#9aa2b1" stroke-width="0.8"/><text class="lbl dark" x="432" y="295" text-anchor="middle">CR2032</text>' +
      '<text class="lbl" x="406" y="330" text-anchor="middle">BIOS / CMOS</text><circle class="led" cx="455" cy="249" r="4.5"/></g>' +
      /* Placa de vídeo PCIe */
      '<g class="comp" data-comp="gpu" id="c-gpu"><rect class="hit" x="20" y="326" width="356" height="84" rx="6"/>' +
      '<rect x="116" y="394" width="248" height="8" rx="1.5" fill="#14161b" stroke="#525866"/>' +
      '<rect x="30" y="334" width="336" height="58" rx="5" fill="#222630" stroke="#687082" stroke-width="1.3"/><rect x="23" y="330" width="7" height="66" rx="1" fill="#9aa2b1"/>' +
      fan(90, 363, 22, '#7c8496', 7) + fan(168, 363, 22, '#7c8496', 7) + gpuFins +
      '<text class="lbl" x="242" y="406" text-anchor="middle">PCIe · VÍDEO</text><circle class="led" cx="366" cy="335" r="4.5"/></g>' +
      /* Conector ATX 24p + Fonte ATX */
      '<g class="comp" data-comp="psu" id="c-psu"><rect class="hit" x="420" y="46" width="44" height="168" rx="5"/><rect class="hit" x="494" y="44" width="138" height="186" rx="8"/>' +
      '<rect x="424" y="50" width="30" height="154" rx="2.5" fill="#282d39" stroke="#687082" stroke-width="1.2"/>' + atxPins + psuCable +
      '<rect x="500" y="50" width="126" height="172" rx="8" fill="#1d2028" stroke="#525866" stroke-width="1.5"/>' +
      fan(563, 124, 42, '#687082', 7) +
      '<text class="lbl" x="563" y="210" text-anchor="middle">FONTE ATX</text><text class="lbl muted-lbl" x="439" y="218" text-anchor="middle">24P</text>' +
      '<circle class="led" cx="617" cy="59" r="4.5"/></g>' +
      '</svg>';
  };

  B.setState = function (svgRoot, id, state) {
    const g = svgRoot.querySelector('#c-' + id);
    if (!g) return;
    g.classList.remove('ok', 'fail', 'scan');
    if (state) g.classList.add(state);
  };
  B.clearStates = function (svgRoot) {
    svgRoot.querySelectorAll('.comp').forEach((g) => g.classList.remove('ok', 'fail', 'scan'));
  };

  /* ---------- Esquemáticos técnicos por componente (viewBox 240x140) ---------- */
  B.art = function (id) {
    const wrap = (inner) => '<svg class="art" viewBox="0 0 240 140" aria-hidden="true">' + inner + '</svg>';
    switch (id) {
      case 'ram': {
        let chips = '', gold = '';
        for (let i = 0; i < 8; i++) chips += '<rect class="blink" style="animation-delay:' + (i * 0.22) + 's" x="' + (34 + i * 22) + '" y="48" width="16" height="30" rx="1.5" fill="#181a20" stroke="#525866" stroke-width="1"/>';
        for (let i = 0; i < 22; i++) if (i !== 11) gold += '<rect x="' + (24 + i * 8.8) + '" y="96" width="5.5" height="10" rx="0.8" fill="#d4a843"/>';
        return wrap('<rect x="20" y="36" width="200" height="62" rx="3" fill="#23302a" stroke="#4d7c66" stroke-width="1.3"/>' + chips + gold +
          '<text x="120" y="24" text-anchor="middle" class="art-t">MÓDULO DIMM DDR · CONTATOS E CHIPS DRAM</text>' +
          '<text x="120" y="124" text-anchor="middle" class="art-sub">CHANFRO DE ALINHAMENTO MECÂNICO</text>');
      }
      case 'cpu': {
        let pins = '';
        for (let i = 0; i < 11; i++) pins += '<rect x="' + (27 + i * 6.8) + '" y="108" width="3.5" height="6" fill="#d4a843"/>';
        return wrap('<rect x="22" y="28" width="82" height="80" rx="5" fill="#232732" stroke="#687082" stroke-width="1.3"/><rect x="36" y="42" width="54" height="52" rx="3" fill="#cfd4dc"/><text x="63" y="72" text-anchor="middle" class="art-t dark">IHS / CPU</text>' + pins +
          '<path class="flow-line" d="M108 68 H136"/><circle cx="180" cy="68" r="42" fill="#1d2028" stroke="#525866" stroke-width="1.4"/>' + fan(180, 68, 38, '#7c8496', 5) +
          '<text x="180" y="126" text-anchor="middle" class="art-sub">DISSIPAÇÃO ATIVA</text>');
      }
      case 'gpu': {
        let gold = '';
        for (let i = 0; i < 14; i++) gold += '<rect x="' + (96 + i * 8) + '" y="112" width="4.5" height="9" fill="#d4a843"/>';
        return wrap('<rect x="18" y="28" width="204" height="84" rx="6" fill="#222630" stroke="#687082" stroke-width="1.4"/>' + fan(72, 70, 27, '#7c8496', 7) + fan(148, 70, 27, '#7c8496', 7) +
          '<rect x="10" y="32" width="8" height="76" rx="1" fill="#9aa2b1"/>' + gold +
          '<text x="196" y="74" text-anchor="middle" class="art-t">GPU</text><text x="120" y="18" text-anchor="middle" class="art-t">ADAPTADOR GRÁFICO PCI EXPRESS</text>');
      }
      case 'mobo': {
        return wrap('<rect x="24" y="14" width="192" height="112" rx="6" fill="#181a20" stroke="#454b59" stroke-width="1.4"/>' +
          '<path class="flow-line" d="M72 54 H114 V86 H148"/><path class="flow-line" d="M72 94 H104 V108 H186"/><path class="flow-line" d="M154 36 V86"/>' +
          '<rect x="38" y="30" width="34" height="34" rx="3" fill="#282d39" stroke="#687082"/><text x="55" y="50" text-anchor="middle" class="art-t">CPU</text>' +
          '<rect x="130" y="72" width="36" height="28" rx="3" fill="#232732" stroke="#687082"/><text x="148" y="89" text-anchor="middle" class="art-t">PCH</text>' +
          '<rect x="172" y="24" width="7" height="38" fill="#26332d" stroke="#4d7c66"/><rect x="183" y="24" width="7" height="38" fill="#26332d" stroke="#4d7c66"/>');
      }
      case 'bios': {
        let pins = '';
        for (let i = 0; i < 4; i++) pins += '<rect x="24" y="' + (40 + i * 13) + '" width="8" height="5" fill="#9aa2b1"/><rect x="104" y="' + (40 + i * 13) + '" width="8" height="5" fill="#9aa2b1"/>';
        return wrap('<rect x="32" y="32" width="72" height="56" rx="3" fill="#20242e" stroke="#687082" stroke-width="1.4"/>' + pins + '<circle cx="41" cy="41" r="2.2" fill="#d4a843"/><text x="68" y="64" text-anchor="middle" class="art-t">SPI ROM</text>' +
          '<text x="68" y="106" text-anchor="middle" class="art-sub">FIRMWARE BIOS/UEFI</text>' +
          '<circle class="pulse-c" cx="178" cy="60" r="32" fill="none" stroke="#60a5fa" stroke-width="1"/><circle cx="178" cy="60" r="27" fill="#cfd4dc" stroke="#687082" stroke-width="1.5"/><text x="178" y="59" text-anchor="middle" class="art-t dark">CR2032</text><text x="178" y="72" text-anchor="middle" class="art-t dark">3.0 V</text>' +
          '<text x="178" y="106" text-anchor="middle" class="art-sub">RETENÇÃO CMOS</text>');
      }
      case 'psu': {
        return wrap('<rect x="24" y="14" width="192" height="106" rx="7" fill="#1d2028" stroke="#525866" stroke-width="1.4"/><circle cx="88" cy="67" r="37" fill="#15171d" stroke="#3c414e"/>' + fan(88, 67, 34, '#687082', 7) +
          '<text x="144" y="42" class="art-t">+12.0 V</text><rect class="pbar" x="144" y="47" width="54" height="5" rx="2.5" fill="#d4a843"/>' +
          '<text x="144" y="69" class="art-t">+5.0 V</text><rect class="pbar" x="144" y="74" width="54" height="5" rx="2.5" fill="#60a5fa"/>' +
          '<text x="144" y="96" class="art-t">+3.3 V</text><rect class="pbar" x="144" y="101" width="54" height="5" rx="2.5" fill="#4ade80"/>' +
          '<text x="120" y="133" text-anchor="middle" class="art-sub">LINHAS REGULADAS DC · SINAL POWER GOOD</text>');
      }
      case 'spk':
      default:
        return wrap('<rect x="44" y="48" width="28" height="44" rx="3" fill="#252934" stroke="#687082" stroke-width="1.3"/><path d="M72 48 L110 24 V116 L72 92 Z" fill="#1d2028" stroke="#687082" stroke-width="1.4"/>' +
          '<path class="wave w1" d="M128 50 Q144 70 128 90"/><path class="wave w2" d="M144 38 Q168 70 144 102"/><path class="wave w3" d="M160 26 Q192 70 160 114"/>' +
          '<text x="120" y="132" text-anchor="middle" class="art-sub">TRANSDUTOR PIEZOELÉTRICO (HEADER SPEAKER)</text>');
    }
  };

  /* Escrita sequencial em terminal */
  B.runLines = function (el, lines, onEnd) {
    el.innerHTML = '';
    let at = 0;
    lines.forEach((ln) => {
      at += ln.wait == null ? 340 : ln.wait;
      PBL.ui.later(() => {
        const d = document.createElement('div');
        d.className = 'tl ' + (ln.cls || '');
        d.innerHTML = ln.t;
        el.appendChild(d);
        el.scrollTop = el.scrollHeight;
        if (ln.fn) ln.fn();
      }, at);
    });
    if (onEnd) PBL.ui.later(onEnd, at + 260);
    return at;
  };

  PBL.boards = B;
})();
