/* POST & BEEP LAB - Apresentação, visão geral e módulos 01 a 04 */
(function () {
  const U = PBL.ui, D = PBL.data, S = PBL.store, A = PBL.audio, B = PBL.boards;
  const V = PBL.views = {};
  const $ = U.$, ic = U.icon;

  /* =====================================================================
     TELA INICIAL (APRESENTAÇÃO E POST)
     ===================================================================== */
  PBL.intro = {
    mount() {
      const root = $('#intro');
      const chipsList = [
        ['cpu', 'CPU'],
        ['ram', 'RAM'],
        ['mobo', 'Placa-mãe'],
        ['gpu', 'Vídeo'],
        ['kbd', 'Teclado']
      ];
      root.innerHTML =
        '<div class="intro-inner">' +
        '<div class="intro-text">' +
        '<span class="kicker">Arquitetura, Montagem e Manutenção de Computadores</span>' +
        '<h1 class="title">POST &amp; BEEP LAB</h1>' +
        '<p class="subtitle">“Descubra o que seu computador está tentando dizer.”</p>' +
        '<p class="intro-lead">Ambiente virtual para estudo do Power-On Self-Test, interpretação de códigos sonoros de BIOS e diagnóstico estruturado de hardware.</p>' +
        '<div class="intro-cta"><button type="button" class="btn primary xl" id="btn-start"><span>INICIAR LABORATÓRIO</span>' + ic('arrow-right') + '</button></div>' +
        '<p class="credit">Crédito do projeto: <span>Professor Anderson Andrade</span></p>' +
        '</div>' +

        '<div class="intro-pc">' +
        '<div class="term-window">' +
        '<div class="tw-head"><span class="tw-dots"><i></i><i></i><i></i></span><span class="tw-title">post-monitor — bios v2.4</span></div>' +
        '<div class="crt"><div class="crt-in" id="intro-screen"></div>' +
        '<button type="button" class="crt-off" id="intro-off">' + ic('power') + '<small>Reiniciar sequência POST</small></button>' +
        '</div></div>' +
        '<div class="chips" id="intro-chips">' +
        chipsList.map((c) => '<div class="chip" data-chip="' + c[0] + '"><span class="chip-dot"></span><span>' + c[1] + '</span></div>').join('') +
        '</div></div>' +
        '</div>' +
        '<footer class="foot">' + (PBL.footerHTML || '') + '</footer>';

      U.refreshIcons();
      const screen = $('#intro-screen'), off = $('#intro-off');
      const markChip = (id) => () => { const c = $('[data-chip="' + id + '"]', root); if (c) c.classList.add('ok'); };
      const play = () => {
        U.clearTimers();
        U.$$('.chip', root).forEach((c) => c.classList.remove('ok'));
        off.classList.add('hidden');
        screen.innerHTML = '';
        B.runLines(screen, [
          { t: 'POST &amp; BEEP LAB FIRMWARE v2.4', cls: 'hl', wait: 380 },
          { t: 'Copyright (C) Prof. Anderson Andrade', cls: 'dim', wait: 220 },
          { t: 'Executando Power-On Self-Test...', wait: 480 },
          { t: 'CPU / Registradores ...... <b class="okt">OK</b>', fn: markChip('cpu') },
          { t: 'DRAM 16384 MB DDR4 ....... <b class="okt">OK</b>', fn: markChip('ram') },
          { t: 'Chipset / Barramentos .... <b class="okt">OK</b>', fn: markChip('mobo') },
          { t: 'Adaptador PCIe VGA ....... <b class="okt">OK</b>', fn: markChip('gpu') },
          { t: 'Controlador E/S .......... <b class="okt">OK</b>', fn: markChip('kbd') },
          { t: 'Autoteste concluído sem falhas.', cls: 'okt', wait: 460 },
          { t: 'Sistema pronto_', cls: 'hl blink', wait: 400 }
        ], () => U.later(() => { off.classList.remove('hidden'); U.later(play, 2200); }, 3800));
      };
      off.addEventListener('click', play);
      U.later(play, 450);

      $('#btn-start').addEventListener('click', () => {
        U.clearTimers();
        A.unlock();
        A.play('S');
        root.classList.add('leaving');
        setTimeout(() => {
          root.classList.add('gone');
          root.classList.remove('leaving');
          $('#app').classList.remove('hidden');
          sessionStorage.setItem('pbl-started', '1');
          if (!location.hash || location.hash === '#/') location.hash = '#/dashboard';
          PBL.router.route();
        }, 300);
      });
    },
    show() {
      A.stop(); U.clearTimers();
      const root = $('#intro');
      $('#app').classList.add('hidden');
      root.classList.remove('gone', 'leaving');
      PBL.intro.mount();
    }
  };

  /* =====================================================================
     VISÃO GERAL (PAINEL CENTRAL)
     ===================================================================== */
  V.dashboard = {
    title: 'Visão geral',
    render(root) {
      const mods = D.modules.map((m) =>
        '<a class="module" href="#/' + m.id + '">' +
        '<div class="mod-top">' +
        '<span class="mod-code">' + m.code + '</span>' +
        '<span class="mod-tag">' + m.tag + '</span>' +
        '<span class="mod-go">' + ic('arrow-up-right') + '</span>' +
        '</div>' +
        '<h4>' + m.title + '</h4>' +
        '<p>' + m.desc + '</p>' +
        '</a>'
      ).join('');

      root.innerHTML =
        '<section class="dash-hero">' +
        '<div class="dh-copy">' +
        '<span class="kicker">Caderno de Laboratório</span>' +
        '<h2>Diagnóstico de inicialização e códigos sonoros</h2>' +
        '<p>Percorra os sete módulos na sequência sugerida ou acesse diretamente a bancada de simulação e as tabelas de firmware.</p>' +
        '</div>' +
        '<div class="dh-actions">' +
        '<a class="btn primary" href="#/m1"><span>Iniciar pelo Módulo 01</span>' + ic('arrow-right') + '</a>' +
        '<a class="btn ghost" href="#/m5">' + ic('terminal') + '<span>Simulador de bancada</span></a>' +
        '</div>' +
        '</section>' +

        '<section class="quick-strip" aria-label="Acesso direto">' +
        '<a class="qcard" href="#/quick"><div class="qc-ic">' + ic('search') + '</div><div><b>Consulta rápida de bipes</b><small>Busca por fabricante, BIOS e padrão</small></div></a>' +
        '<a class="qcard" href="#/m5"><div class="qc-ic">' + ic('terminal') + '</div><div><b>Simulador de diagnóstico</b><small>Ordens de serviço em PC virtual</small></div></a>' +
        '<a class="qcard" href="#/m7"><div class="qc-ic">' + ic('clipboard-check') + '</div><div><b>Avaliação diagnóstica</b><small>20 questões comentadas e revisão</small></div></a>' +
        '</section>' +

        '<section>' +
        '<div class="sec-head"><h3>Trilha de estudo</h3><span>7 módulos</span></div>' +
        '<div class="trail">' + mods + '</div>' +
        '</section>' +

        '<section>' +
        '<div class="sec-head"><h3>Instrumentos e protocolo</h3></div>' +
        '<div class="tools">' +
        '<a class="card tool" href="#/quick"><div class="tool-ic">' + ic('search') + '</div><div><b>Central de consulta rápida</b><p>Identificação de códigos por duração, contagem e frequência.</p></div></a>' +
        '<a class="card tool" href="#/safety"><div class="tool-ic">' + ic('shield-check') + '</div><div><b>Protocolo de segurança</b><p>Nove procedimentos preventivos antes da intervenção física.</p></div></a>' +
        '<a class="card tool" href="#/final"><div class="tool-ic">' + ic('check-circle-2') + '</div><div><b>Síntese do treinamento</b><p>Diretrizes fundamentais de investigação técnica em bancada.</p></div></a>' +
        '</div>' +
        '</section>';

      U.refreshIcons();
    }
  };

  /* =====================================================================
     MÓDULO 01 - CONHECENDO O POST
     ===================================================================== */
  V.m1 = {
    title: '01 · Conhecendo o POST',
    render(root) {
      const steps = D.postSteps.map((s, i) =>
        '<li class="pstep" data-step="' + i + '" role="button" tabindex="0">' +
        '<span class="pn">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<div><b>Etapa ' + (i + 1) + ' — ' + s.title + '</b><p>' + s.text + '</p></div>' +
        '</li>'
      ).join('');

      const failOpts = Object.keys(D.postFailures).map((k) =>
        '<option value="' + k + '">' + (k === 'none' ? 'Condição: Operação normal' : 'Simular: ' + D.postFailures[k].label) + '</option>'
      ).join('');

      const hw = D.postChecks.map((c) =>
        '<li data-hw="' + c.id + '"><span class="dot"></span><span class="hw-lbl">' + c.label + '</span><em>aguardando</em></li>'
      ).join('');

      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Módulo 01 · Inicialização</span><h2>Conhecendo o POST</h2><p>Sequência elétrica e lógica executada entre o acionamento do botão Power e o carregamento do sistema operacional.</p></div></header>' +
        U.muteBanner() +

        '<div class="three">' +
        '<div class="card info"><span class="info-num">01 / Definição</span><h4>O que é o POST</h4><p><b>Power-On Self-Test</b> é a rotina de autoteste executada imediatamente após a energização para validar os subsistemas indispensáveis antes do boot.</p></div>' +
        '<div class="card info"><span class="info-num">02 / Execução</span><h4>Papel do firmware</h4><p>Conduzido pela <b>BIOS</b> ou <b>UEFI</b> gravada na memória não volátil da placa-mãe, responsável por inicializar barramentos e controladores.</p></div>' +
        '<div class="card info"><span class="info-num">03 / Diagnóstico</span><h4>Reporte de falhas</h4><p>Diante de erro crítico, o avanço é interrompido e a falha é reportada por <b>códigos sonoros</b>, mensagens visuais ou LEDs de depuração.</p></div>' +
        '</div>' +

        '<section class="post-lab">' +
        '<div class="card post-stage">' +
        '<div class="stage-top">' +
        '<div><h3>Inspeção da placa-mãe</h3><p class="muted small">Selecione uma condição de teste e acione a rotina do POST.</p></div>' +
        '<div class="stage-controls">' +
        '<label class="sr-only" for="post-fail">Condição de teste</label>' +
        '<select id="post-fail" class="select" aria-label="Selecionar condição de teste">' + failOpts + '</select>' +
        '<button type="button" class="btn primary" id="post-run">' + ic('play') + '<span>Executar POST</span></button>' +
        '</div></div>' +
        '<div class="board-wrap" id="post-board">' + B.board() + '</div>' +
        '<div class="legend">' +
        '<span><i class="lg scan"></i>Em verificação</span>' +
        '<span><i class="lg ok"></i>Aprovado</span>' +
        '<span><i class="lg fail"></i>Falha detectada</span>' +
        '</div>' +
        '<div id="post-result"></div>' +
        '<div class="post-bottom">' +
        '<div class="card inner"><h4>Subsistemas verificados</h4><ul class="hwlist" id="post-hw">' + hw + '</ul></div>' +
        '<div class="terminal"><div class="term-bar"><span>Saída serial do POST</span></div><div class="term-body" id="post-term"><div class="tl dim">Aguardando execução do POST...</div></div></div>' +
        '</div></div>' +

        '<div class="card post-steps"><h3>Etapas da inicialização</h3><p class="muted small">Selecione uma etapa para destacar os circuitos correspondentes:</p><ol>' + steps + '</ol></div>' +
        '</section>' +
        U.navFooter('m1');

      U.refreshIcons();

      const svg = $('svg.board', root), term = $('#post-term'), stepEls = U.$$('.pstep', root);
      const runBtn = $('#post-run'), resultEl = $('#post-result');
      let running = false;

      function setStep(i) {
        stepEls.forEach((el, k) => { el.classList.toggle('active', k === i); el.classList.toggle('done', k < i); });
      }
      function setHw(id, state, text) {
        const li = $('[data-hw="' + id + '"]', root);
        li.className = state || '';
        $('em', li).textContent = text;
      }
      function line(t, cls) {
        const d = document.createElement('div');
        d.className = 'tl ' + (cls || '');
        d.innerHTML = t;
        term.appendChild(d);
        term.scrollTop = term.scrollHeight;
      }

      function run() {
        if (running) return;
        running = true; A.stop(); U.clearTimers();
        B.clearStates(svg); svg.classList.remove('on');
        resultEl.innerHTML = ''; term.innerHTML = '';
        D.postChecks.forEach((c) => setHw(c.id, '', 'aguardando'));
        const fault = $('#post-fail').value;
        runBtn.disabled = true; $('span', runBtn).textContent = 'Executando...';
        let t = 0;
        const at = (ms, fn) => { t += ms; U.later(fn, t); };

        at(180, () => { setStep(0); svg.classList.add('on'); A.sfx('power'); B.setState(svg, 'psu', 'scan'); line('[PWR] Acionamento recebido. Estabilizando linhas DC...'); });
        at(820, () => { B.setState(svg, 'psu', 'ok'); line('[PWR] Sinal Power Good ativo. Placa-mãe energizada.', 'okt'); });
        at(720, () => { setStep(1); B.setState(svg, 'bios', 'scan'); line('[ROM] Lendo vetor inicial do firmware BIOS/UEFI...'); });
        at(820, () => { B.setState(svg, 'bios', 'ok'); line('[ROM] Firmware inicializado.', 'okt'); });
        at(620, () => { setStep(2); line('[POST] Rotina Power-On Self-Test em execução.', 'hl'); });
        at(520, () => setStep(3));

        let failed = false;
        D.postChecks.forEach((c) => {
          if (failed) return;
          at(600, () => { B.setState(svg, c.id, 'scan'); setHw(c.id, 'scan', 'testando'); line('[POST] Inspecionando: ' + c.label + '...'); });
          const bad = fault === c.id;
          at(680, () => {
            if (bad) { B.setState(svg, c.id, 'fail'); setHw(c.id, 'fail', 'falha'); line('[POST] ' + c.label + ': FALHA', 'bad'); }
            else { B.setState(svg, c.id, 'ok'); setHw(c.id, 'ok', 'ok'); line('[POST] ' + c.label + ': OK', 'okt'); }
          });
          if (bad) failed = true;
        });

        at(720, () => {
          setStep(4);
          const f = D.postFailures[fault];
          const ok = fault === 'none';
          line(f.msg, ok ? 'okt' : 'bad');
          resultEl.innerHTML = '<div class="result ' + (ok ? 'ok' : 'bad') + '">' +
            ic(ok ? 'check-circle-2' : 'alert-circle') +
            '<div class="grow"><b>' + (ok ? 'Autoteste concluído — inicialização prossegue' : 'POST interrompido — ' + f.label) + '</b><p>' +
            (ok
              ? 'Todos os subsistemas essenciais responderam dentro dos parâmetros. Em diversos equipamentos, um pulso curto confirma a conclusão normal do POST.'
              : 'Com a interrupção da rotina, o firmware sinaliza a anomalia pelo PC Speaker (padrão ilustrativo abaixo, sujeito à tabela do fabricante):') +
            '</p>' +
            '<div class="res-audio">' + A.viz(f.spec) + '<button type="button" class="btn ghost sm" id="post-hear">' + ic('volume-2') + '<span>Ouvir código</span></button></div>' +
            '</div></div>';
          U.refreshIcons();
          $('#post-hear').onclick = () => A.play(f.spec, { viz: $('.bviz', resultEl), speaker: $('#c-spk', svg) });
          A.play(f.spec, { viz: $('.bviz', resultEl), speaker: $('#c-spk', svg) });
          running = false;
          runBtn.disabled = false;
          runBtn.innerHTML = ic('rotate-ccw') + '<span>Executar POST novamente</span>';
          U.refreshIcons();
        });
      }

      runBtn.addEventListener('click', run);
      stepEls.forEach((el, k) => {
        const pick = () => {
          if (running) return;
          setStep(k);
          B.clearStates(svg);
          svg.classList.add('on');
          const focusMap = [['psu'], ['bios'], ['bios', 'cpu'], ['cpu', 'ram', 'mobo', 'gpu', 'kbd'], ['spk']];
          (focusMap[k] || []).forEach((id) => B.setState(svg, id, 'scan'));
          line('[ETAPA ' + (k + 1) + '] ' + D.postSteps[k].title + ': ' + D.postSteps[k].text, 'hl');
        };
        el.addEventListener('click', pick);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      setStep(-1);
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     MÓDULO 02 - ENTENDENDO OS CÓDIGOS DE BIPES
     ===================================================================== */
  V.m2 = {
    title: '02 · Códigos de bipes',
    render(root) {
      const faq = D.beepFaq.map((f, i) =>
        '<details class="faq card"' + (i === 0 ? ' open' : '') + '>' +
        '<summary><span class="faq-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + f.q + '</span>' + ic('chevron-down', 'chev') + '</summary>' +
        '<p>' + f.a + '</p></details>'
      ).join('');

      const sounds = D.sounds.map((s) =>
        '<button type="button" class="sound" data-sound="' + s.id + '">' +
        '<div class="sound-top"><b>' + s.label + '</b><span class="snd-play">' + ic('play') + '</span></div>' +
        A.viz(s.spec) +
        '<small>' + s.note + '</small>' +
        '</button>'
      ).join('');

      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Módulo 02 · Sinalização Acústica</span><h2>O que são os beeps?</h2><p>Fundamentos da comunicação sonora de baixo nível durante o autoteste de inicialização.</p></div></header>' +
        U.muteBanner() +

        '<section class="faqs">' + faq + '</section>' +

        '<section class="card speaker-lab">' +
        '<div><h3>Localização e atuação do PC Speaker</h3>' +
        '<p>O <b>PC Speaker</b> é um transdutor piezoelétrico acoplado diretamente ao barramento lógico da placa-mãe. Sua operação independe de sistema operacional, placa de som ou adaptador de vídeo.</p>' +
        '<div class="callout" id="spk-info">' + ic('volume-2') + '<span>Selecione o componente <b>SPEAKER</b> demarcado no esquemático ou utilize o acionador abaixo.</span></div>' +
        '<button type="button" class="btn ghost mt" id="btn-test-spk">' + ic('play') + '<span>Testar pulso do PC Speaker</span></button>' +
        '</div>' +
        '<div class="board-wrap">' + B.board({ interactive: true }) + '</div>' +
        '</section>' +

        '<section class="card panel">' +
        '<div class="panel-head">' +
        '<div><h3>Sintetizador de padrões sonoros</h3><p class="muted small">Síntese em tempo real via Web Audio API com diagrama temporal de pulsos.</p></div>' +
        '<div class="vol-box">' +
        '<label for="vol">Volume</label>' +
        '<input id="vol" type="range" min="0" max="1" step="0.05" value="' + S.get().volume + '">' +
        '<button type="button" class="btn ghost sm" id="stop">' + ic('square') + '<span>Parar</span></button>' +
        '</div></div>' +
        '<div class="now" id="now"><div><small>Sinal ativo</small><b id="now-name">Selecione um padrão abaixo</b></div><div id="now-viz"></div></div>' +
        '<div class="sounds">' + sounds + '</div>' +
        '<div class="callout compact mt">' + ic('info') + '<span><b>Observação para iPhone / iOS:</b> O sintetizador utiliza canal de reprodução de mídia. Caso o aparelho esteja com a chave lateral física de modo silencioso ativada, o áudio é reproduzido respeitando o volume principal de mídia do iOS.</span></div>' +
        '</section>' +

        '<section class="card train">' +
        '<h3>Exercício de percepção auditiva</h3>' +
        '<p>Reproduza a sequência oculta e identifique a estrutura correspondente pela cadência dos pulsos.</p>' +
        '<div id="train"></div>' +
        '</section>' +
        U.navFooter('m2');

      U.refreshIcons();

      const svg = $('svg.board', root);
      svg.classList.add('on');
      $('#c-spk', svg).classList.add('focus');
      const info = $('#spk-info', root);

      const triggerSpeaker = () => {
        A.play('S', { speaker: $('#c-spk', svg) });
        info.innerHTML = ic('volume-2') + '<span><b>Transdutor acionado:</b> o firmware chaveia diretamente o header SPEAKER em cerca de 1 kHz, permitindo diagnóstico mesmo sem sinal de vídeo.</span>';
        U.refreshIcons();
      };

      $('#btn-test-spk').onclick = triggerSpeaker;
      svg.addEventListener('click', (e) => {
        const g = e.target.closest('[data-comp]'); if (!g) return;
        const id = g.dataset.comp;
        if (id === 'spk') triggerSpeaker();
        else {
          info.innerHTML = ic('info') + '<span><b>' + (D.components[id] ? D.components[id].name : 'Este circuito') + '</b> não atua na emissão sonora do POST. Selecione o bloco <b>SPEAKER</b> à esquerda.</span>';
          U.refreshIcons();
        }
      });

      const nowName = $('#now-name'), nowViz = $('#now-viz');
      U.$$('[data-sound]', root).forEach((b) => b.addEventListener('click', () => {
        const s = D.sounds.find((x) => x.id === b.dataset.sound);
        nowName.textContent = s.label;
        nowViz.innerHTML = A.viz(s.spec, 'big');
        U.$$('.sound', root).forEach((x) => x.classList.remove('playing'));
        b.classList.add('playing');
        A.play(s.spec, { viz: $('.bviz', nowViz), speaker: $('#c-spk', svg), onEnd: () => b.classList.remove('playing') });
      }));

      $('#stop').onclick = () => { A.stop(); U.$$('.sound', root).forEach((x) => x.classList.remove('playing')); };
      $('#vol').oninput = (e) => { A.setVolume(+e.target.value); S.setPref('volume', +e.target.value); };

      const train = $('#train');
      function newTrain() {
        const pool = D.sounds.filter((s) => s.id !== 's2');
        const correct = U.pick(pool);
        const opts = U.shuffle([correct].concat(U.shuffle(pool.filter((s) => s !== correct)).slice(0, 3)));
        train.innerHTML =
          '<div class="train-bar"><button type="button" class="btn primary" id="t-play">' + ic('volume-2') + '<span>Reproduzir sinal oculto</span></button></div>' +
          '<div class="opts grid-2">' + opts.map((o) => '<button type="button" class="opt" data-o="' + o.id + '">' + o.label + '</button>').join('') + '</div>' +
          '<div id="t-fb"></div>';
        U.refreshIcons();
        $('#t-play').onclick = () => A.play(correct.spec);
        U.$$('.opt', train).forEach((b) => b.onclick = () => {
          const ok = b.dataset.o === correct.id;
          U.$$('.opt', train).forEach((x) => { x.disabled = true; if (x.dataset.o === correct.id) x.classList.add('right'); });
          if (!ok) b.classList.add('wrong');
          A.sfx(ok ? 'ok' : 'bad');
          $('#t-fb').innerHTML =
            '<div class="inline-fb ' + (ok ? 'ok' : 'bad') + ' mt">' +
            (ok ? '<b>Identificação exata.</b> ' : '<b>Padrão divergente.</b> ') +
            'Sinal emitido: <b>' + correct.label + '</b>. ' + correct.note +
            '</div>' +
            '<div class="row wrap gap mt">' + A.viz(correct.spec) +
            '<button type="button" class="btn ghost sm" id="t-next">' + ic('rotate-ccw') + '<span>Nova sequência</span></button></div>';
          U.refreshIcons();
          $('#t-next').onclick = newTrain;
        });
      }
      newTrain();
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     MÓDULO 03 - CÓDIGOS DE BIP POR FABRICANTE
     ===================================================================== */
  V.m3 = {
    title: '03 · BIOS e fabricantes',
    render(root) {
      let tab = 'ami', q = '', comp = '', maker = '';
      const compKeys = Object.keys(D.compLabel);

      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Módulo 03 · Tabelas de Firmware</span><h2>Códigos de bip por fabricante</h2><p>Referências didáticas de sinalização acústica para firmwares AMI, Award e equipamentos Dell e IBM.</p></div></header>' +
        U.muteBanner() +
        '<div class="callout warn">' + ic('alert-circle') + '<span><b>Nota técnica:</b> os códigos variam conforme fabricante, modelo da placa-mãe e revisão do firmware. Utilize estas tabelas como referência didática, consultando sempre a documentação oficial do equipamento.</span></div>' +

        '<div class="tabs" role="tablist" aria-label="Fabricante ou desenvolvedor de BIOS">' +
        Object.values(D.bios).map((b) =>
          '<button type="button" class="tab" role="tab" data-tab="' + b.id + '"><span>' + b.name + '</span><em>' + D.codes.filter((c) => c.bios === b.id).length + '</em></button>'
        ).join('') +
        '<button type="button" class="tab" role="tab" data-tab="all"><span>Comparar todos</span><em>' + D.codes.length + '</em></button>' +
        '</div>' +

        '<div class="card filters filters-3">' +
        '<div class="field"><label for="f-q">Busca textual</label><input id="f-q" class="input" type="search" placeholder="Filtrar por sintoma, código ou peça..."></div>' +
        '<div class="field"><label for="f-m">Origem do firmware</label><select id="f-m" class="select"><option value="">Todas as origens</option><option value="generic">Firmware comercial (AMI / Award)</option><option value="dell">OEM Dell</option><option value="ibm">OEM IBM</option></select></div>' +
        '<div class="field"><label for="f-c">Subsistema</label><select id="f-c" class="select"><option value="">Todos os subsistemas</option>' + compKeys.map((k) => '<option value="' + k + '">' + D.compLabel[k] + '</option>').join('') + '</select></div>' +
        '</div>' +

        '<div id="m3-body"></div>' +
        U.navFooter('m3');

      U.refreshIcons();
      const body = $('#m3-body');

      function draw() {
        U.$$('.tab', root).forEach((t) => {
          const active = t.dataset.tab === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        const list = D.codes.filter((c) =>
          (tab === 'all' || c.bios === tab) &&
          (!maker || c.maker === maker) &&
          (!comp || c.compKey === comp) &&
          (!q || (c.label + ' ' + c.meaning + ' ' + c.component + ' ' + c.diag + ' ' + D.bios[c.bios].name).toLowerCase().includes(q))
        );

        const introHTML = tab === 'all'
          ? '<div class="card bios-intro"><h3>Comparativo entre fabricantes (' + list.length + ' registros)</h3><p>Um mesmo padrão acústico pode indicar eventos distintos conforme o desenvolvedor da BIOS. A identificação prévia do firmware é indispensável antes de qualquer intervenção.</p></div>'
          : '<div class="card bios-intro"><h3>' + D.bios[tab].full + '</h3><p>' + D.bios[tab].intro + '</p></div>';

        body.innerHTML = introHTML +
          '<div class="code-table">' +
          '<div class="ct-head"><span>Padrão sonoro</span><span>Significado</span><span>Subsistema</span><span>Conduta inicial de diagnóstico</span></div>' +
          (list.length
            ? list.map((c) =>
              '<article class="ct-row">' +
              '<div class="ct-code">' +
              '<button type="button" class="play" data-play="' + c.id + '" aria-label="Reproduzir ' + c.label + '">' + ic('play') + '</button>' +
              '<div>' +
              (tab === 'all' ? '<span class="bios-tag">' + D.bios[c.bios].name + '</span>' : '') +
              '<b class="ct-title">' + c.label + '</b>' +
              A.viz(c.spec) +
              '</div></div>' +
              '<div class="ct-m"><small class="lbl-m">Significado</small><b>' + c.meaning + '</b></div>' +
              '<div class="ct-c"><small class="lbl-m">Subsistema</small><span class="comp-chip">' + c.component + '</span></div>' +
              '<div class="ct-d"><small class="lbl-m">Conduta de diagnóstico</small><p>' + c.diag + '</p></div>' +
              '</article>'
            ).join('')
            : '<div class="card empty">Nenhum registro corresponde aos critérios selecionados.<div class="mt"><button type="button" class="btn ghost sm" id="btn-reset-m3">Limpar filtros</button></div></div>') +
          '</div>';

        U.refreshIcons();
        const rst = $('#btn-reset-m3', body);
        if (rst) rst.onclick = () => { q = ''; comp = ''; maker = ''; $('#f-q').value = ''; $('#f-m').value = ''; $('#f-c').value = ''; draw(); };
      }

      body.addEventListener('click', (e) => {
        const p = e.target.closest('[data-play]'); if (!p) return;
        const c = D.codes.find((x) => x.id === p.dataset.play);
        const row = p.closest('.ct-row');
        U.$$('.ct-row', body).forEach((r) => r.classList.remove('playing'));
        row.classList.add('playing');
        A.play(c.spec, { viz: $('.bviz', row), onEnd: () => row.classList.remove('playing') });
      });

      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-tab]'); if (!t) return;
        tab = t.dataset.tab; A.stop();
        if (tab !== 'all' && maker && D.bios[tab].maker !== maker) { maker = ''; $('#f-m').value = ''; }
        draw();
      });

      $('#f-q').oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); };
      $('#f-m').onchange = (e) => { maker = e.target.value; if (maker && tab !== 'all' && D.bios[tab].maker !== maker) tab = 'all'; draw(); };
      $('#f-c').onchange = (e) => { comp = e.target.value; draw(); };

      draw();
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     MÓDULO 04 - COMPONENTES E SUAS FALHAS
     ===================================================================== */
  V.m4 = {
    title: '04 · Componentes e falhas',
    render(root) {
      const order = ['ram', 'cpu', 'gpu', 'mobo', 'bios', 'psu', 'spk'];
      const pills = order.map((id) => {
        const c = D.components[id];
        return '<button type="button" class="chip-btn" data-pick="' + id + '">' +
          '<span>' + c.name.replace(' (PC Speaker)', '') + '</span>' +
          '</button>';
      }).join('');

      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Módulo 04 · Arquitetura de Hardware</span><h2>Componentes e falhas críticas</h2><p>Selecione um subsistema na barra abaixo ou diretamente sobre o esquemático da placa-mãe.</p></div></header>' +

        '<div class="comp-pills" role="tablist" aria-label="Subsistemas da placa-mãe">' + pills + '</div>' +

        '<section class="comp-lab">' +
        '<div class="card board-card">' +
        '<div class="bc-head"><b>Esquemático da placa-mãe</b><small class="muted">Seleção interativa</small></div>' +
        '<div class="board-wrap" id="m4-board">' + B.board({ interactive: true }) + '</div>' +
        '</div>' +
        '<div class="card comp-detail" id="m4-detail"></div>' +
        '</section>' +
        U.navFooter('m4');

      const svg = $('svg.board', root), detail = $('#m4-detail');
      svg.classList.add('on');

      function select(id, scrollOnMobile) {
        const c = D.components[id]; if (!c) return;
        U.$$('.comp', svg).forEach((g) => g.classList.toggle('active', g.dataset.comp === id));
        U.$$('[data-pick]', root).forEach((b) => {
          const active = b.dataset.pick === id;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        detail.innerHTML =
          '<div class="cd-head"><div><span class="kicker">' + c.tag + '</span><h3>' + c.name + '</h3></div></div>' +
          '<div class="cd-art">' + B.art(id) + '</div>' +
          '<div class="cd-sec"><h4>Função técnica</h4><p>' + c.what + '</p></div>' +
          '<div class="cd-sec"><h4>Atuação durante o POST</h4><p>' + c.how + '</p></div>' +
          (c.notDetected ? '<div class="cd-sec"><h4>Comportamento na ausência de detecção</h4><p>' + c.notDetected + '</p></div>' : '') +
          '<div class="cd-sec"><h4>Sintomas associados</h4><div class="tags">' + c.symptoms.map((s) => '<span class="tag">' + s + '</span>').join('') + '</div></div>' +
          '<div class="cd-sec"><h4>Protocolo inicial de verificação</h4><ol class="checks">' +
          c.procedures.map((p) => '<li><label><input type="checkbox"><span>' + p + '</span></label></li>').join('') +
          '</ol></div>' +
          (c.extras || []).map((x) => '<div class="cd-extra"><b>' + x.title + '</b><p>' + x.text + '</p></div>').join('') +
          (id === 'spk' ? '<div class="mt"><a class="btn ghost sm" href="#/m2">' + ic('volume-2') + '<span>Ouvir padrões no Módulo 02</span></a></div>' : '');

        U.refreshIcons();
        if (scrollOnMobile && window.innerWidth < 960 && detail.scrollIntoView) {
          detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      svg.addEventListener('click', (e) => {
        const g = e.target.closest('[data-comp]');
        if (g && D.components[g.dataset.comp]) select(g.dataset.comp, true);
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pick]');
        if (b) select(b.dataset.pick, true);
      });

      select('ram', false);
    }
  };
})();
