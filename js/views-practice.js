/* POST & BEEP LAB - Módulos práticos: Simulador (05), Desafio do Técnico (06) e Avaliação (07) */
(function () {
  const U = PBL.ui, D = PBL.data, S = PBL.store, A = PBL.audio, B = PBL.boards, V = PBL.views;
  const $ = U.$, ic = U.icon;

  const biosBtns = () => Object.values(D.bios).map((b) =>
    '<button type="button" class="opt" data-bios="' + b.id + '"><span>' + b.name + '</span><small class="muted">' + (b.maker === 'generic' ? 'Firmware' : 'OEM') + '</small></button>'
  ).join('');

  /* =====================================================================
     MÓDULO 05 - LABORATÓRIO DE SIMULAÇÃO
     ===================================================================== */
  V.m5 = {
    title: '05 · Laboratório de simulação',
    render(root) {
      let deck = [], cur = null, state = 'off', ticket = 0;
      const next = () => { if (!deck.length) deck = U.shuffle(D.scenarios); return deck.pop(); };

      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Módulo 05 · Simulação de Bancada</span><h2>Laboratório de simulação</h2><p>Assuma a bancada de manutenção. Acione o botão POWER no gabinete do computador, acompanhe o POST e conclua cada fase sequencialmente para liberar a próxima.</p></div></header>' +
        U.muteBanner() +

        '<div class="sim-phase-bar" id="phase-bar" aria-label="Etapas da simulação">' +
        '<div class="p-step active" id="pstep-1"><span class="p-num">01</span><div class="p-info"><b>Fase 1 · Energização</b><small>Ligar o computador</small></div></div>' +
        '<div class="p-sep"></div>' +
        '<div class="p-step locked" id="pstep-2"><span class="p-num">02</span><div class="p-info"><b>Fase 2 · Autoteste POST</b><small>Inspeção de vídeo e áudio</small></div></div>' +
        '<div class="p-sep"></div>' +
        '<div class="p-step locked" id="pstep-3"><span class="p-num">03</span><div class="p-info"><b>Fase 3 · Firmware</b><small>Validação da BIOS</small></div></div>' +
        '<div class="p-sep"></div>' +
        '<div class="p-step locked" id="pstep-4"><span class="p-num">04</span><div class="p-info"><b>Fase 4 · Diagnóstico</b><small>Conduta técnica</small></div></div>' +
        '</div>' +

        '<section class="sim">' +
        '<div class="card sim-pc">' +
        '<div class="pc-desk">' +
        '<div class="pc" id="pc">' +

        /* Monitor de mesa com tela CRT e pedestal */
        '<div class="monitor">' +
        '<div class="mon-frame">' +
        '<div class="mon-cam"></div>' +
        '<div class="crt" id="sim-crt">' +
        '<div class="crt-in" id="sim-screen"><div class="tl dim">Equipamento desenergizado.</div></div>' +
        '<div class="crt-msg">SEM SINAL DE VÍDEO</div>' +
        '<div class="crt-scanlines"></div>' +
        '</div>' +
        '<div class="mon-chin">' +
        '<span class="mon-brand">POST &amp; BEEP LAB · MONITOR</span>' +
        '<span class="mon-led" id="mon-pwr-led" title="Indicador de energia do monitor"></span>' +
        '</div></div>' +
        '<div class="stand"></div>' +
        '<div class="stand-base"></div>' +
        '</div>' +

        /* Gabinete Torre Desktop */
        '<div class="tower" id="tower">' +
        '<div class="tw-top">' +
        '<div class="leds" title="Indicadores luminosos do painel">' +
        '<span class="led-wrap"><i class="led" id="led-pwr"></i><small>PWR</small></span>' +
        '<span class="led-wrap"><i class="led" id="led-hdd"></i><small>HDD</small></span>' +
        '</div>' +
        '<div class="spk-box" id="sim-spk" title="PC Speaker (Transdutor piezoelétrico)">' +
        ic('volume-2') +
        '<span class="wv w1"></span><span class="wv w2"></span><span class="wv w3"></span>' +
        '</div>' +
        '</div>' +

        '<div class="tw-bays">' +
        '<div class="tw-slot opt-drive"><span class="drive-tray"></span><span class="drive-led"></span></div>' +
        '<div class="tw-slot s2"></div>' +
        '</div>' +

        '<div class="tw-vents"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +

        '<div class="tw-power-zone">' +
        '<button type="button" class="power-btn" id="sim-power" aria-label="Acionar botão Power do computador">' +
        '<div class="power-ring"></div>' +
        ic('power') +
        '<span>POWER</span>' +
        '</button>' +
        '<span class="tw-hint" id="sim-hint">Pressione POWER para ligar</span>' +
        '</div>' +
        '</div>' +

        '</div></div>' +
        '</div>' +

        /* Painel lateral do chamado e das fases ativas */
        '<div class="card sim-panel" id="sim-panel">' +
        '<div class="placeholder">' +
        '<span class="kicker">Fase 1 · Prontidão da bancada</span>' +
        '<h3 class="mt-xs">Equipamento em espera</h3>' +
        '<p>Pressione o botão <b>POWER</b> no gabinete da torre para ligar o computador e iniciar a rotina de inicialização.</p>' +
        '</div>' +
        '</div>' +
        '</section>' +
      U.navFooter('m5', { lockNext: !S.hasSimDone(), lockMsg: 'Conclua ao menos um diagnóstico completo para avançar' });

      U.refreshIcons();
      const pc = $('#pc'), screen = $('#sim-screen'), crt = $('#sim-crt'), panel = $('#sim-panel'), spk = $('#sim-spk');
      const monLed = $('#mon-pwr-led'), powerBtn = $('#sim-power'), hint = $('#sim-hint');

      function setPhase(n) {
        for (let i = 1; i <= 4; i++) {
          const el = $('#pstep-1'.replace('1', i));
          if (!el) continue;
          el.className = 'p-step ' + (i < n ? 'done' : i === n ? 'active' : 'locked');
        }
      }

      function powerOff() {
        U.clearTimers(); A.stop();
        pc.classList.remove('on'); crt.classList.remove('nosignal');
        if (monLed) monLed.classList.remove('on');
        screen.innerHTML = '<div class="tl dim">Equipamento desenergizado.</div>';
        state = 'off';
        powerBtn.disabled = false;
        powerBtn.classList.remove('on', 'running');
        powerBtn.innerHTML = '<div class="power-ring"></div>' + ic('power') + '<span>POWER</span>';
        hint.textContent = 'Pressione POWER para ligar';
        setPhase(1);
        U.refreshIcons();
      }

      function power() {
        if (state !== 'off') return;
        A.unlock();
        state = 'post'; cur = next(); ticket++;
        pc.classList.add('on');
        if (monLed) monLed.classList.add('on');
        powerBtn.classList.add('running');
        powerBtn.disabled = true;
        powerBtn.innerHTML = '<div class="power-ring"></div>' + ic('loader', 'spin') + '<span>POST</span>';
        hint.textContent = 'Autoteste POST em andamento...';
        A.sfx('power');

        setPhase(2);

        panel.innerHTML =
          '<div class="stage-guide">' +
          '<span class="kicker">Fase 2 em execução</span>' +
          '<h3>Executando o Power-On Self-Test...</h3>' +
          '<p>Observe o comportamento na tela do monitor e atente-se à emissão de pulsos acústicos no PC Speaker do gabinete.</p>' +
          '<div class="sim-phase-lock"><small>' + ic('lock') + ' A Fase 03 / Diagnóstico só será liberada após a conclusão dos testes de hardware.</small></div>' +
          '</div>';
        U.refreshIcons();

        const normal = cur.id === 'sc2';
        const lines = [
          { t: 'POST &amp; BEEP LAB BIOS v2.4', cls: 'hl', wait: 360 },
          { t: 'Inicializando barramentos de sistema...', wait: 440 },
          { t: 'Processador CPU .......... detectado', wait: 480 }
        ];
        if (normal) {
          lines.push(
            { t: 'Memória DRAM 16 GB ....... <b class="okt">OK</b>' },
            { t: 'Adaptador de Vídeo PCIe .. <b class="okt">OK</b>' },
            { t: 'POST concluído sem erros. Carregando sistema...', cls: 'okt', wait: 420 }
          );
        } else {
          lines.push({ t: 'Inspecionando subsistemas essenciais...', wait: 580, fn: () => crt.classList.add('nosignal') });
        }
        B.runLines(screen, lines, showCase);
      }

      function showCase() {
        state = 'case';
        powerBtn.classList.remove('running');
        powerBtn.classList.add('on');
        powerBtn.innerHTML = '<div class="power-ring"></div>' + ic('power') + '<span>ON</span>';
        hint.textContent = 'Equipamento energizado · Analise os sinais';

        panel.innerHTML =
          '<div class="os">' +
          '<div class="os-top"><span class="os-n">ORDEM DE SERVIÇO #' + String(ticket).padStart(3, '0') + '</span></div>' +
          '<p class="os-text">' + cur.symptoms + '</p>' +
          '<div class="os-audio">' + A.viz(cur.spec) +
          '<button type="button" class="btn ghost sm" id="hear">' + ic('volume-2') + '<span>Repetir sinal no PC Speaker</span></button>' +
          '</div></div>' +
          '<div id="stage"></div>';

        U.refreshIcons();
        const hear = () => A.play(cur.spec, { viz: $('.os .bviz', panel), speaker: spk });
        $('#hear').onclick = hear;
        U.later(hear, 280);

        if (cur.needsBios) {
          setPhase(3);
          stageBios();
        } else {
          setPhase(4);
          stageQuestion(false);
        }

        if (window.innerWidth < 960 && panel.scrollIntoView) {
          U.later(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140);
        }
      }

      function stageBios() {
        const st = $('#stage');
        st.innerHTML =
          '<div class="stage">' +
          '<h4><span class="sn">Fase 03</span> Identificação do firmware / fabricante</h4>' +
          '<p class="muted small">Diferentes desenvolvedores utilizam tabelas de bipes distintas. Analise a evidência antes de abrir o diagnóstico:</p>' +
          '<div class="callout"><span>' + D.biosHints[cur.bios] + '</span></div>' +
          '<div class="opts grid-2">' + biosBtns() + '</div>' +
          '<div id="bios-fb"></div>' +
          '<div class="sim-phase-lock mt-xs"><small>' + ic('lock') + ' A Fase 04 (Diagnóstico Técnico) permanece bloqueada até a validação do firmware.</small></div>' +
          '</div>';

        U.refreshIcons();
        U.$$('[data-bios]', st).forEach((b) => b.onclick = () => {
          if (b.dataset.bios === cur.bios) {
            A.sfx('ok');
            U.$$('[data-bios]', st).forEach((x) => { x.disabled = true; if (x.dataset.bios === cur.bios) x.classList.add('right'); });
            $('#bios-fb').innerHTML = '<div class="inline-fb ok">Firmware validado com sucesso: <b>' + D.bios[cur.bios].full + '</b>. Liberando a Fase 04...</div>';
            setPhase(4);
            U.later(() => stageQuestion(true), 400);
          } else {
            A.sfx('bad'); b.classList.add('wrong'); b.disabled = true;
            $('#bios-fb').innerHTML = '<div class="inline-fb bad">Fabricante incompatível com a evidência técnica observada. Revise o indício acima.</div>';
          }
        });
      }

      function stageQuestion(afterBios) {
        const st = $('#stage');
        const lockNote = $('.sim-phase-lock', st);
        if (lockNote) lockNote.remove();

        const holder = document.createElement('div');
        holder.className = 'stage';
        holder.innerHTML = '<h4><span class="sn">' + (afterBios ? 'Fase 04' : 'Fase 04') + '</span> ' + cur.question + '</h4><div class="q-body"></div><div id="sim-fb"></div>';
        st.appendChild(holder);
        const body = $('.q-body', holder);

        if (cur.kind === 'order') {
          U.orderWidget(body, { steps: cur.steps, order: cur.order, onSubmit: (ok) => finish(ok) });
        } else {
          const opts = U.shuffle(cur.options.map((t, i) => ({ t, ok: i === cur.answer })));
          body.innerHTML = '<div class="opts col">' + opts.map((o, i) => '<button type="button" class="opt" data-i="' + i + '">' + o.t + '</button>').join('') + '</div>';
          U.$$('.opt', body).forEach((b) => b.onclick = () => {
            const ok = opts[+b.dataset.i].ok;
            U.$$('.opt', body).forEach((x) => { x.disabled = true; if (opts[+x.dataset.i].ok) x.classList.add('right'); });
            if (!ok) b.classList.add('wrong');
            finish(ok);
          });
        }
        if (holder.scrollIntoView) holder.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function finish(ok) {
        state = 'done';
        setPhase(5); // Marca todas as fases como concluídas
        S.incrementSimDone();
        A.sfx(ok ? 'ok' : 'bad');

        $('#sim-fb').innerHTML = U.feedback({
          ok,
          title: ok ? 'Diagnóstico consistente · Fase concluída' : 'Hipótese incorreta · Análise técnica',
          explain: cur.explain,
          component: cur.component,
          procedure: cur.procedure
        }) +
          '<div class="sim-done-box">' +
          '<p class="muted small">Atendimento da Ordem de Serviço #' + String(ticket).padStart(3, '0') + ' concluído. Você já pode prosseguir para o próximo chamado ou avançar para o Módulo 06.</p>' +
          '<div class="row wrap gap mt">' +
          '<button type="button" class="btn primary" id="sim-next">' + ic('rotate-ccw') + '<span>Avançar para a próxima fase / Novo chamado</span></button>' +
          '<a class="btn ghost" href="#/m3">Consultar tabelas (Módulo 03)</a>' +
        '</div></div>';

        U.refreshIcons();
        U.unlockNavNext('m6');

        $('#sim-next').onclick = () => {
          powerOff();
          panel.innerHTML =
            '<div class="placeholder">' +
            '<span class="kicker">Chamado #' + String(ticket).padStart(3, '0') + ' finalizado</span>' +
            '<h3 class="mt-xs">Próxima fase liberada</h3>' +
            '<p>Pressione novamente o botão <b>POWER</b> no gabinete da torre para receber o próximo chamado de bancada.</p>' +
            '</div>';
          U.refreshIcons();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      }

      if (powerBtn) powerBtn.addEventListener('click', power);
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     MÓDULO 06 - DESAFIO DO TÉCNICO (4 ETAPAS ESTRUTURADAS)
     ===================================================================== */
  const LEVELS = [
    { n: 1, code: 'NÍVEL 01', name: 'Iniciante', desc: 'Identificação de padrões primários e distinção de inicialização normal.' },
    { n: 2, code: 'NÍVEL 02', name: 'Intermediário', desc: 'Falhas clássicas de memória DRAM, adaptador gráfico e integridade de BIOS.' },
    { n: 3, code: 'NÍVEL 03', name: 'Avançado', desc: 'Interpretação cruzada entre tabelas AMI, Award, Dell e IBM.' },
    { n: 4, code: 'NÍVEL 04', name: 'Especialista', desc: 'Análise combinada de histórico de manutenção, sintomas térmicos/elétricos e bipes.' }
  ];
  const GROUPS = [['cpu', 'heat', 'fan'], ['gpu', 'lcd'], ['bios', 'cmos'], ['ram']];

  function buildSteps(c) {
    const f = D.faults[c.fault];
    const group = GROUPS.find((g) => g.includes(c.fault)) || [c.fault];
    const others = Object.keys(D.faults).filter((k) => !group.includes(k)).map((k) => D.faults[k]);
    const own = { error: c.error || f.error, comp: f.comp, proc: c.proc || f.proc, fix: c.fix || f.fix };
    const mk = (key, title, q) => {
      const distr = U.shuffle(Array.from(new Set(others.map((o) => o[key])))).filter((x) => x !== own[key]).slice(0, 3);
      return { key, title, q, correct: own[key], opts: U.shuffle([own[key]].concat(distr)) };
    };
    const code = D.codes.find((x) => x.bios === c.bios && x.spec === c.spec);
    const b = D.bios[c.bios];
    return [
      Object.assign(mk('error', 'Hipótese diagnóstica', 'Qual anomalia corresponde ao relato técnico e ao código emitido?'),
        { why: code ? 'Na referência ' + b.name + ', “' + code.label + '” indica: ' + code.meaning + '.' : 'Hipótese compatível com o conjunto de sintomas reportados.' }),
      Object.assign(mk('comp', 'Subsistema envolvido', 'Qual componente deve ser priorizado na inspeção?'),
        { why: 'Subsistema diretamente relacionado: ' + f.comp + '.' }),
      Object.assign(mk('proc', 'Verificação inicial', 'Qual procedimento de triagem deve ser executado primeiro?'),
        { why: 'Prioriza-se sempre a verificação não invasiva, segura e de menor complexidade.' }),
      Object.assign(mk('fix', 'Ação corretiva', 'Confirmada a causa nos testes de bancada, qual é a medida adequada?'),
        { why: 'A intervenção corretiva é aplicada somente após validação empírica da falha.' })
    ];
  }

  V.m6 = {
    title: '06 · Desafio do técnico',
    render(root) {
      const decks = {};
      const stage = document.createElement('div');
      root.appendChild(stage);
      const navBox = document.createElement('div');
      navBox.innerHTML = U.navFooter('m6');
      root.appendChild(navBox);

      function levels() {
        A.stop();
        stage.innerHTML =
          '<header class="page-head"><div><span class="kicker">Módulo 06 · Estudos de Caso</span><h2>Desafio do técnico</h2><p>Conduza o atendimento técnico em quatro decisões encadeadas: hipótese, componente, verificação inicial e solução.</p></div></header>' +
          U.muteBanner() +
          '<div class="levels">' +
          LEVELS.map((l) =>
            '<button type="button" class="card level" data-level="' + l.n + '">' +
            '<div class="lv-top"><span class="mod-code">' + l.code + '</span>' + ic('arrow-up-right') + '</div>' +
            '<h3>' + l.name + '</h3>' +
            '<p>' + l.desc + '</p>' +
            '<span class="lv-go">Iniciar estudo de caso</span>' +
            '</button>'
          ).join('') +
          '</div>';

        U.refreshIcons();
        U.$$('[data-level]', stage).forEach((b) => b.onclick = () => round(+b.dataset.level));
      }

      function round(level) {
        const lv = LEVELS[level - 1];
        if (!decks[level] || !decks[level].length) decks[level] = U.shuffle(D.cases.filter((c) => c.level === level));
        const c = decks[level].pop();
        const steps = buildSteps(c), res = [];
        const bios = D.bios[c.bios];
        const who = c.bios === 'dell' || c.bios === 'ibm'
          ? 'Equipamento <b>' + bios.name + '</b> (firmware proprietário).'
          : 'Placa-mãe com firmware <b>BIOS ' + bios.name + '</b>.';
        const story = c.complaint + ' Ao energizar o equipamento na bancada, ouve-se <b>' + c.beepText + '</b>. ' + who;

        function showStep(i) {
          const s = steps[i];
          stage.innerHTML =
            '<div class="round-head">' +
            '<button type="button" class="btn ghost sm" id="back">' + ic('arrow-left') + '<span>Níveis</span></button>' +
            '<span class="rh-title">' + lv.code + ' · ' + lv.name + '</span>' +
            '<div class="step-pills" aria-label="Etapa ' + (i + 1) + ' de 4">' +
            steps.map((x, k) => '<span class="sp ' + (k < i ? (res[k] ? 'ok' : 'bad') : k === i ? 'cur' : '') + '">' + (k + 1) + '</span>').join('') +
            '</div></div>' +

            '<div class="card story">' +
            '<span class="kicker">Relato de entrada</span>' +
            '<p class="mt-xs">' + story + '</p>' +
            (c.extra ? '<div class="callout mt"><span>' + c.extra + '</span></div>' : '') +
            '<div class="os-audio mt">' + A.viz(c.spec) + '<button type="button" class="btn ghost sm" id="hear">' + ic('volume-2') + '<span>Ouvir sinal</span></button></div>' +
            '</div>' +

            '<div class="card question">' +
            '<span class="q-type">Etapa ' + (i + 1) + ' de 4 — ' + s.title + '</span>' +
            '<h3 class="q-text">' + s.q + '</h3>' +
            '<div class="opts col">' + s.opts.map((o, k) => '<button type="button" class="opt" data-k="' + k + '">' + o + '</button>').join('') + '</div>' +
            '<div id="step-fb"></div>' +
            '</div>';

          U.refreshIcons();
          $('#back').onclick = levels;
          $('#hear').onclick = () => A.play(c.spec, { viz: $('.story .bviz', stage) });
          U.$$('.opt', stage).forEach((b) => b.onclick = () => {
            const ok = s.opts[+b.dataset.k] === s.correct;
            res[i] = ok; A.sfx(ok ? 'ok' : 'bad');
            U.$$('.opt', stage).forEach((x) => { x.disabled = true; if (s.opts[+x.dataset.k] === s.correct) x.classList.add('right'); });
            if (!ok) b.classList.add('wrong');
            $('#step-fb').innerHTML =
              '<div class="inline-fb ' + (ok ? 'ok' : 'bad') + '">' +
              (ok ? '<b>Correto.</b> ' : '<b>Incorreto.</b> ') + s.why +
              '</div>' +
              '<button type="button" class="btn primary mt" id="cont"><span>' + (i < 3 ? 'Próxima etapa' : 'Concluir análise') + '</span>' + ic('arrow-right') + '</button>';
            U.refreshIcons();
            $('#cont').onclick = () => (i < 3 ? showStep(i + 1) : summary());
          });
        }

        function summary() {
          const right = res.filter(Boolean).length;
          stage.innerHTML =
            '<div class="card summary">' +
            '<span class="kicker">' + lv.code + ' · Síntese do atendimento</span>' +
            '<h2>' + right + ' de 4 etapas corretas</h2>' +
            '<p class="sum-sub">Confira abaixo o encadeamento técnico esperado para este atendimento.</p>' +
            '<ul class="sum-steps">' +
            steps.map((s, k) =>
              '<li class="' + (res[k] ? 'ok' : 'bad') + '">' +
              ic(res[k] ? 'check' : 'alert-circle') +
              '<div><small>0' + (k + 1) + ' · ' + s.title + '</small><b>' + s.correct + '</b></div>' +
              '</li>'
            ).join('') +
            '</ul>' +
            '<div class="callout"><span>Códigos sonoros delimitam hipóteses iniciais; a substituição de componentes exige comprovação prévia por testes.</span></div>' +
            '<div class="row wrap gap mt">' +
            '<button type="button" class="btn primary" id="again">' + ic('rotate-ccw') + '<span>Novo caso neste nível</span></button>' +
            '<button type="button" class="btn ghost" id="lv">Alterar nível</button>' +
            '</div></div>';

          U.refreshIcons();
          $('#again').onclick = () => round(level);
          $('#lv').onclick = levels;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        showStep(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      levels();
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     MÓDULO 07 - AVALIAÇÃO FINAL (20 QUESTÕES + RELATÓRIO DIAGNÓSTICO)
     ===================================================================== */
  const TYPE_LABEL = {
    mc: 'Múltipla escolha',
    tf: 'Verdadeiro ou falso',
    match: 'Associação técnica',
    seq: 'Identificação sonora',
    case: 'Estudo de caso',
    order: 'Sequenciamento de conduta'
  };
  const TOTAL = 20;

  V.m7 = {
    title: '07 · Avaliação final',
    render(root) {
      const stage = document.createElement('div');
      root.appendChild(stage);
      const navBox = document.createElement('div');
      navBox.innerHTML = U.navFooter('m7');
      root.appendChild(navBox);

      function intro() {
        const formats = [
          'Múltipla escolha conceitual',
          'Julgamento verdadeiro ou falso',
          'Associação entre código e subsistema',
          'Identificação auditiva de sequências',
          'Estudos de caso de manutenção',
          'Ordenação de procedimentos de bancada'
        ];
        stage.innerHTML =
          '<header class="page-head"><div><span class="kicker">Módulo 07 · Verificação de Aprendizagem</span><h2>Avaliação final</h2><p>Exame composto por ' + TOTAL + ' questões selecionadas do banco técnico, cobrindo POST, códigos de firmware, arquitetura e segurança.</p></div></header>' +
          U.muteBanner() +
          '<div class="card quiz-intro">' +
          '<h3>Estrutura da avaliação</h3>' +
          '<div class="qi-grid">' + formats.map((f, i) => '<div class="qi-i"><span class="mod-code">0' + (i + 1) + '</span><span>' + f + '</span></div>').join('') + '</div>' +
          '<p class="muted small">Cada item apresenta análise comentada imediatamente após a resposta. Ao término, é emitido o relatório diagnóstico com nota de 0,0 a 10,0 e indicação de módulos para revisão.</p>' +
          '<div><button type="button" class="btn primary xl" id="q-start"><span>Iniciar avaliação</span>' + ic('arrow-right') + '</button></div>' +
          '</div>';

        U.refreshIcons();
        $('#q-start').onclick = start;
      }

      function pickQuiz(total) {
        const picked = new Set();
        const out = [];
        ['tf', 'match', 'seq', 'case', 'order'].forEach((tp) => {
          U.shuffle(D.quiz.filter((q) => q.type === tp)).slice(0, 2).forEach((q) => {
            if (!picked.has(q)) { picked.add(q); out.push(q); }
          });
        });
        U.shuffle(D.quiz.filter((q) => !picked.has(q))).slice(0, Math.max(0, total - out.length)).forEach((q) => out.push(q));
        return U.shuffle(out);
      }

      function start() {
        const qs = pickQuiz(TOTAL);
        const answers = [];
        let idx = 0;

        function show() {
          A.stop();
          const q = qs[idx];
          const topic = D.topicInfo[q.topic] || { label: 'Geral' };
          stage.innerHTML =
            '<div class="card quiz">' +
            '<div class="quiz-top">' +
            '<span class="q-counter">Questão <b>' + String(idx + 1).padStart(2, '0') + '</b> / ' + TOTAL + '</span>' +
            '<span class="q-topic">' + topic.label + '</span>' +
            '</div>' +
            '<span class="q-type">' + TYPE_LABEL[q.type] + '</span>' +
            '<h3 class="q-text">' + q.q + '</h3>' +
            '<div id="q-body"></div>' +
            '<div id="q-fb"></div>' +
            '</div>';

          const body = $('#q-body');
          const done = (ok, extraHTML) => {
            answers.push({ q, ok });
            A.sfx(ok ? 'ok' : 'bad');
            $('#q-fb').innerHTML = U.feedback({
              ok,
              title: ok ? 'Resposta correta' : 'Resposta incorreta',
              explain: q.explain + (extraHTML || '')
            }) +
              '<button type="button" class="btn primary mt" id="q-next"><span>' +
              (idx + 1 < TOTAL ? 'Próxima questão' : 'Emitir relatório diagnóstico') +
              '</span>' + ic('arrow-right') + '</button>';

            U.refreshIcons();
            $('#q-next').onclick = () => { idx++; idx < TOTAL ? show() : report(answers); };
            if ($('#q-fb').scrollIntoView) $('#q-fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          };

          if (q.type === 'mc' || q.type === 'case') {
            const opts = U.shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer })));
            body.innerHTML = '<div class="opts col">' + opts.map((o, i) => '<button type="button" class="opt" data-i="' + i + '">' + o.t + '</button>').join('') + '</div>';
            U.$$('.opt', body).forEach((b) => b.onclick = () => {
              const ok = opts[+b.dataset.i].ok;
              U.$$('.opt', body).forEach((x) => { x.disabled = true; if (opts[+x.dataset.i].ok) x.classList.add('right'); });
              if (!ok) b.classList.add('wrong');
              done(ok);
            });
          } else if (q.type === 'tf') {
            body.innerHTML = '<div class="opts grid-2">' +
              '<button type="button" class="opt" data-v="1">Verdadeiro</button>' +
              '<button type="button" class="opt" data-v="0">Falso</button>' +
              '</div>';
            U.$$('.opt', body).forEach((b) => b.onclick = () => {
              const ok = (b.dataset.v === '1') === q.answer;
              U.$$('.opt', body).forEach((x) => { x.disabled = true; if ((x.dataset.v === '1') === q.answer) x.classList.add('right'); });
              if (!ok) b.classList.add('wrong');
              done(ok);
            });
          } else if (q.type === 'seq') {
            const opts = U.shuffle(q.pool);
            body.innerHTML =
              '<div class="mb"><button type="button" class="btn ghost sm" id="q-play">' + ic('volume-2') + '<span>Ouvir sequência</span></button></div>' +
              '<div class="seq-opts">' +
              opts.map((s, i) => '<button type="button" class="seq-opt" data-s="' + s + '"><b>Alternativa ' + 'ABCD'[i] + '</b>' + A.viz(s) + '</button>').join('') +
              '</div>';
            U.refreshIcons();
            $('#q-play').onclick = () => A.play(q.spec);
            U.later(() => A.play(q.spec), 260);
            U.$$('.seq-opt', body).forEach((b) => b.onclick = () => {
              const ok = b.dataset.s === q.spec;
              U.$$('.seq-opt', body).forEach((x) => { x.disabled = true; if (x.dataset.s === q.spec) x.classList.add('right'); });
              if (!ok) b.classList.add('wrong');
              done(ok);
            });
          } else if (q.type === 'match') {
            body.innerHTML = '<div class="match">' +
              q.items.map((it, i) =>
                '<div class="match-row">' +
                '<div class="m-code"><button type="button" class="play sm" data-p="' + i + '" aria-label="Ouvir padrão">' + ic('play') + '</button>' +
                '<div>' + (it.label ? '<b class="m-lbl">' + U.esc(it.label) + '</b>' : '') + A.viz(it.spec) + '</div></div>' +
                '<select class="select" data-m="' + i + '" aria-label="Subsistema para ' + U.esc(it.label || 'item') + '">' +
                '<option value="">Selecionar subsistema...</option>' +
                q.opts.map((o) => '<option value="' + o + '">' + D.compLabel[o] + '</option>').join('') +
                '</select></div>'
              ).join('') +
              '</div>' +
              '<button type="button" class="btn primary mt" id="q-check" disabled>Confirmar associações</button>';

            U.refreshIcons();
            const sels = U.$$('select', body), chk = $('#q-check');
            sels.forEach((s) => s.onchange = () => { chk.disabled = sels.some((x) => !x.value); });
            U.$$('[data-p]', body).forEach((p) => p.onclick = () => A.play(q.items[+p.dataset.p].spec, { viz: U.$$('.bviz', body)[+p.dataset.p] }));
            chk.onclick = () => {
              let all = true;
              sels.forEach((s, i) => {
                const good = s.value === q.items[i].ans; if (!good) all = false;
                s.disabled = true; s.classList.add(good ? 'right' : 'wrong');
              });
              chk.remove();
              done(all, '<br><small><b>Correspondência:</b> ' + q.items.map((it) => it.label + ' &rarr; ' + D.compLabel[it.ans]).join(' · ') + '</small>');
            };
          } else if (q.type === 'order') {
            U.orderWidget(body, { steps: q.steps, order: q.order, onSubmit: (ok) => done(ok) });
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        show();
      }

      function report(answers) {
        const total = answers.length, correct = answers.filter((a) => a.ok).length;
        const pct = Math.round((correct / total) * 100), grade = ((correct / total) * 10).toFixed(1);
        const byTopic = {};
        answers.forEach((a) => {
          const t = a.q.topic;
          byTopic[t] = byTopic[t] || { c: 0, t: 0 };
          byTopic[t].t++;
          if (a.ok) byTopic[t].c++;
        });
        const review = Object.keys(byTopic).filter((t) => byTopic[t].c < byTopic[t].t);
        const msg = pct >= 90
          ? 'Domínio consistente dos fundamentos de POST, interpretação de códigos de firmware e conduta de bancada.'
          : pct >= 70
            ? 'Bom aproveitamento técnico. Recomenda-se revisar pontualmente os tópicos listados abaixo.'
            : pct >= 50
              ? 'Aproveitamento intermediário. Consulte os comentários das questões incorretas e retome os módulos indicados.'
              : 'Recomenda-se revisar os módulos fundamentais antes de realizar uma nova verificação.';

        stage.innerHTML =
          '<div class="card report">' +
          '<div class="rep-head">' +
          U.scoreRing(pct, grade, 'nota / 10') +
          '<div class="grow">' +
          '<span class="kicker">Resultado consolidado</span>' +
          '<h2>Relatório diagnóstico da avaliação</h2>' +
          '<p class="lead">' + msg + '</p>' +
          '<div class="rep-stats">' +
          '<span><small>Nota</small><b>' + grade + '</b></span>' +
          '<span><small>Aproveitamento</small><b>' + pct + '%</b></span>' +
          '<span><small>Corretas</small><b class="g">' + correct + '</b></span>' +
          '<span><small>Incorretas</small><b class="r">' + (total - correct) + '</b></span>' +
          '</div></div></div>' +

          '<div class="review">' +
          '<h4>Tópicos recomendados para revisão</h4>' +
          (review.length
            ? '<div class="review-list">' + review.map((t) => {
              const inf = D.topicInfo[t];
              return '<a class="review-item" href="#/' + inf.module + '"><div><b>' + inf.label + '</b><small>' + inf.moduleName + ' · ' + byTopic[t].c + '/' + byTopic[t].t + ' acertos</small></div>' + ic('arrow-up-right') + '</a>';
            }).join('') + '</div>'
            : '<p class="muted small">Integralidade de acertos em todos os tópicos avaliados.</p>') +
          '</div>' +

          '<div class="rep-cols">' +
          '<div><h4>Questões corretas (' + correct + ')</h4><ul class="rep-list ok">' +
          (answers.map((a, i) => a.ok ? '<li><b>' + String(i + 1).padStart(2, '0') + '.</b> ' + a.q.q + '</li>' : '').join('') || '<li class="muted">Nenhum registro.</li>') +
          '</ul></div>' +
          '<div><h4>Questões incorretas (' + (total - correct) + ')</h4><ul class="rep-list bad">' +
          (answers.map((a, i) => !a.ok ? '<li><b>' + String(i + 1).padStart(2, '0') + '.</b> ' + a.q.q + '<small>' + a.q.explain + '</small></li>' : '').join('') || '<li class="muted">Nenhum registro.</li>') +
          '</ul></div>' +
          '</div>' +

          '<div class="row wrap gap mt">' +
          '<button type="button" class="btn primary" id="q-again">' + ic('rotate-ccw') + '<span>Nova tentativa</span></button>' +
          '<a class="btn ghost" href="#/final">Encerramento do treinamento</a>' +
          '<a class="btn ghost" href="#/dashboard">Visão geral</a>' +
          '</div></div>';

        U.refreshIcons();
        $('#q-again').onclick = intro;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      intro();
    },
    destroy() { A.stop(); }
  };
})();
