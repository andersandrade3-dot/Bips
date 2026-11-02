/* POST & BEEP LAB - Consulta rápida, protocolo de segurança e encerramento */
(function () {
  const U = PBL.ui, D = PBL.data, A = PBL.audio, V = PBL.views;
  const $ = U.$, ic = U.icon;

  /* =====================================================================
     CENTRAL DE CONSULTA RÁPIDA
     ===================================================================== */
  const NOT_FOUND = 'Código não identificado na base de consulta. Verifique o modelo da placa-mãe ou consulte o manual do fabricante.';

  function matches(c, f) {
    if (f.maker && c.maker !== f.maker) return false;
    if (f.type && c.biosType !== f.type) return false;
    const s = f.shorts, l = f.longs;
    if (f.len === 'none') return !f.repeat && !f.alt && c.kind === 'none';
    if (f.alt) return c.kind === 'alt' && s === 0 && l === 0;
    if (f.repeat) return (c.kind === 'repeat' || c.kind === 'continuous') && s === 0 && l === 0;
    if (f.len === 'cont') return c.kind === 'continuous' || c.kind === 'repeat';
    if (c.kind !== 'count') return false;
    if (s === 0 && l === 0) return false;
    if (c.lengthUnspecified) {
      if (f.len === 'mixed') return false;
      return c.shorts + c.longs === s + l;
    }
    return c.shorts === s && c.longs === l;
  }

  V.quick = {
    title: 'Central de consulta rápida',
    render(root) {
      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Instrumento de Bancada</span><h2>Central de consulta rápida</h2><p>Informe os parâmetros do sinal acústico para localizar correspondências na base didática.</p></div></header>' +
        U.muteBanner() +

        '<div class="quick">' +
        '<div class="card q-form">' +
        '<div class="grid2">' +
        '<div class="field"><label for="q-maker">Fabricante / origem</label><select id="q-maker" class="select"><option value="">Qualquer fabricante</option><option value="generic">Placa-mãe comercial (AMI / Award)</option><option value="dell">Dell</option><option value="ibm">IBM</option></select></div>' +
        '<div class="field"><label for="q-type">Desenvolvedor da BIOS</label><select id="q-type" class="select"><option value="">Qualquer BIOS</option><option value="ami">AMI</option><option value="award">Award</option><option value="proprietary">Proprietária (Dell / IBM)</option></select></div>' +
        '<div class="field"><label for="q-len">Estrutura dos pulsos</label><select id="q-len" class="select"><option value="short">Apenas bipes curtos</option><option value="long">Apenas bipes longos</option><option value="mixed">Combinados (longos + curtos)</option><option value="cont">Contínuo / sem contagem fixa</option><option value="none">Ausência de bipes</option></select></div>' +
        '<div class="field" id="f-single"><label id="lbl-single" for="q-count">Quantidade de bipes curtos</label><div class="stepper"><button type="button" data-step="q-count" data-d="-1" aria-label="Reduzir">&minus;</button><input id="q-count" type="number" min="1" max="12" value="1"><button type="button" data-step="q-count" data-d="1" aria-label="Aumentar">+</button></div></div>' +
        '</div>' +

        '<div class="grid2 hidden mt" id="f-mixed">' +
        '<div class="field"><label for="q-long">Bipes longos</label><div class="stepper"><button type="button" data-step="q-long" data-d="-1" aria-label="Reduzir longos">&minus;</button><input id="q-long" type="number" min="1" max="12" value="1"><button type="button" data-step="q-long" data-d="1" aria-label="Aumentar longos">+</button></div></div>' +
        '<div class="field"><label for="q-short">Bipes curtos</label><div class="stepper"><button type="button" data-step="q-short" data-d="-1" aria-label="Reduzir curtos">&minus;</button><input id="q-short" type="number" min="1" max="12" value="2"><button type="button" data-step="q-short" data-d="1" aria-label="Aumentar curtos">+</button></div></div>' +
        '</div>' +

        '<div class="switches">' +
        '<label class="switch"><input type="checkbox" id="q-rep"><span>Repetição contínua dos pulsos</span></label>' +
        '<label class="switch"><input type="checkbox" id="q-alt"><span>Alternância de frequência (tons altos e baixos)</span></label>' +
        '</div>' +

        '<p class="muted small" id="q-help">Nos registros Dell desta base, a identificação utiliza exclusivamente a quantidade total de pulsos.</p>' +
        '<div class="row wrap gap mt">' +
        '<button type="button" class="btn primary" id="q-go">' + ic('search') + '<span>Consultar código</span></button>' +
        '<button type="button" class="btn ghost" id="q-clear">Limpar parâmetros</button>' +
        '</div></div>' +

        '<div id="q-res"><div class="card placeholder"><h3>Aguardando parâmetros</h3><p>Defina a estrutura do sinal e acione <b>Consultar código</b>.</p></div></div>' +
        '</div>' +

        '<div class="callout warn">' + ic('alert-circle') + '<span>Resultados com finalidade didática. Confirme sempre a hipótese por testes de bancada e pela documentação específica da placa-mãe.</span></div>' +
        U.navFooter('quick');

      U.refreshIcons();
      const res = $('#q-res');
      const clamp = (id, min) => Math.max(min, Math.min(12, parseInt($('#' + id).value, 10) || min));

      function syncMode() {
        const len = $('#q-len').value;
        $('#f-single').classList.toggle('hidden', len === 'mixed' || len === 'cont' || len === 'none');
        $('#f-mixed').classList.toggle('hidden', len !== 'mixed');
        const lbl = $('#lbl-single');
        if (lbl) lbl.textContent = len === 'long' ? 'Quantidade de bipes longos' : 'Quantidade de bipes curtos';
      }

      U.$$('[data-step]', root).forEach((b) => b.onclick = () => {
        const i = $('#' + b.dataset.step);
        const min = parseInt(i.min, 10) || 1;
        i.value = Math.max(min, Math.min(12, (parseInt(i.value, 10) || min) + +b.dataset.d));
      });

      $('#q-len').onchange = () => {
        const v = $('#q-len').value;
        if (v === 'none') { $('#q-rep').checked = false; $('#q-alt').checked = false; }
        syncMode();
      };
      $('#q-rep').onchange = (e) => { if (e.target.checked && $('#q-len').value !== 'cont') { $('#q-len').value = 'cont'; syncMode(); } };
      $('#q-alt').onchange = (e) => { if (e.target.checked && $('#q-len').value !== 'cont') { $('#q-len').value = 'cont'; syncMode(); } };

      function search() {
        A.stop();
        const len = $('#q-len').value;
        let shorts = 0, longs = 0;
        if (len === 'short') shorts = clamp('q-count', 1);
        else if (len === 'long') longs = clamp('q-count', 1);
        else if (len === 'mixed') { longs = clamp('q-long', 1); shorts = clamp('q-short', 1); }

        const f = {
          maker: $('#q-maker').value,
          type: $('#q-type').value,
          len, shorts, longs,
          repeat: $('#q-rep').checked,
          alt: $('#q-alt').checked
        };
        const found = D.codes.filter((c) => matches(c, f));
        if (!found.length) {
          res.innerHTML = '<div class="card notfound"><p>' + NOT_FOUND + '</p></div>';
        } else {
          res.innerHTML =
            '<div class="sec-head" style="margin-top:0"><h3>Correspondências localizadas</h3><span>' + found.length + ' registro(s)</span></div>' +
            '<div class="results">' +
            found.map((c) =>
              '<article class="card result-card">' +
              '<div class="rc-head">' +
              '<button type="button" class="play" data-play="' + c.id + '" aria-label="Ouvir ' + c.label + '">' + ic('play') + '</button>' +
              '<div><span class="bios-tag">' + D.bios[c.bios].name + '</span><b>' + c.label + '</b>' + A.viz(c.spec) + '</div>' +
              '</div>' +
              '<h4>' + c.meaning + '</h4>' +
              '<div><span class="comp-chip">' + c.component + '</span></div>' +
              '<p class="muted small">' + c.diag + '</p>' +
              '</article>'
            ).join('') +
            '</div>';
          U.refreshIcons();
        }
        if (window.innerWidth < 960 && res.scrollIntoView) {
          res.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      res.addEventListener('click', (e) => {
        const p = e.target.closest('[data-play]'); if (!p) return;
        const c = D.codes.find((x) => x.id === p.dataset.play);
        A.play(c.spec, { viz: $('.bviz', p.closest('.result-card')) });
      });

      $('#q-go').onclick = search;
      $('#q-clear').onclick = () => {
        ['q-maker', 'q-type'].forEach((i) => $('#' + i).value = '');
        $('#q-len').value = 'short'; $('#q-count').value = 1; $('#q-long').value = 1; $('#q-short').value = 2;
        $('#q-rep').checked = false; $('#q-alt').checked = false;
        syncMode();
        res.innerHTML = '<div class="card placeholder"><h3>Aguardando parâmetros</h3><p>Defina a estrutura do sinal e acione <b>Consultar código</b>.</p></div>';
      };

      syncMode();
    },
    destroy() { A.stop(); }
  };

  /* =====================================================================
     PROTOCOLO DE SEGURANÇA E BOAS PRÁTICAS
     ===================================================================== */
  V.safety = {
    title: 'Protocolo de segurança',
    render(root) {
      const total = D.safety.length;
      root.innerHTML =
        '<header class="page-head"><div><span class="kicker">Normas de Bancada</span><h2>Segurança antes da manutenção</h2><p>Procedimentos obrigatórios de proteção elétrica, mecânica e eletrostática prévios à abertura do equipamento.</p></div></header>' +

        '<div class="card safety-head">' +
        '<div><b>Lista de verificação pré-intervenção</b><p class="muted small" id="sf-msg">Marque cada procedimento verificado na bancada.</p></div>' +
        '<div class="row gap wrap"><span class="sf-badge" id="sf-count">0 / ' + total + '</span>' +
        '<button type="button" class="btn ghost sm" id="sf-toggle-all">Marcar todos</button></div>' +
        '</div>' +

        '<div class="safety-grid">' +
        D.safety.map((s, i) =>
          '<label class="card safety-card" data-i="' + i + '">' +
          '<input type="checkbox" data-sf="' + i + '">' +
          '<div class="sf-ic">' + ic(s.icon) + '</div>' +
          '<div class="grow"><b>' + s.title + '</b><p>' + s.text + '</p></div>' +
          '<span class="sf-check" aria-hidden="true">' + ic('check') + '</span>' +
          '</label>'
        ).join('') +
        '</div>' +

        '<div class="card note">' +
        '<h3>Interpretação técnica de códigos sonoros</h3>' +
        '<p>Códigos de bipe indicam <b>hipóteses operacionais</b> sujeitas a variações de fabricante, topologia da placa-mãe e versão de BIOS/UEFI. Todo diagnóstico deve ser validado empiricamente por inspeção física, configuração mínima, medição elétrica e teste com componentes de referência.</p>' +
        '</div>' +
        U.navFooter('safety');

      U.refreshIcons();
      const boxes = U.$$('[data-sf]', root);
      const btnAll = $('#sf-toggle-all');
      const update = () => {
        const n = boxes.filter((b) => b.checked).length;
        $('#sf-count').textContent = n + ' / ' + total;
        $('#sf-msg').textContent = n === total
          ? 'Protocolo preventivo integralmente verificado.'
          : 'Marque cada procedimento verificado na bancada.';
        btnAll.textContent = n === total ? 'Desmarcar todos' : 'Marcar todos';
        boxes.forEach((b) => b.closest('.safety-card').classList.toggle('checked', b.checked));
      };

      boxes.forEach((b) => b.onchange = () => { A.sfx('click'); update(); });
      btnAll.onclick = () => {
        const allChecked = boxes.every((b) => b.checked);
        boxes.forEach((b) => { b.checked = !allChecked; });
        A.sfx('click');
        update();
      };
      update();
    }
  };

  /* =====================================================================
     TELA DE ENCERRAMENTO
     ===================================================================== */
  V.final = {
    title: 'Encerramento',
    render(root) {
      root.innerHTML =
        '<div class="card finale">' +
        '<span class="kicker">Síntese Formativa</span>' +
        '<h1>PARABÉNS! VOCÊ CONCLUIU O TREINAMENTO POST &amp; BEEP LAB.</h1>' +
        '<blockquote>“Um bom técnico não troca peças por tentativa. Ele investiga, testa e diagnostica.”</blockquote>' +

        '<div class="fin-pillars">' +
        '<div class="fp-card"><span class="mod-code">01</span><b>Isolamento e ESD</b><small>Desenergização completa e controle de descarga eletrostática antes do manuseio.</small></div>' +
        '<div class="fp-card"><span class="mod-code">02</span><b>Leitura do POST</b><small>Observação sistemática de alimentação, vídeo, indicadores luminosos e bipes.</small></div>' +
        '<div class="fp-card"><span class="mod-code">03</span><b>Contexto de BIOS</b><small>Identificação exata do fabricante e do firmware antes de consultar tabelas.</small></div>' +
        '<div class="fp-card"><span class="mod-code">04</span><b>Validação empírica</b><small>Execução de testes progressivos antes de condenar qualquer componente.</small></div>' +
        '</div>' +

        '<div class="row wrap gap center-row mt">' +
        '<a class="btn primary" href="#/dashboard">Voltar à visão geral</a>' +
        '<a class="btn ghost" href="#/m5">Simulador de bancada</a>' +
        '<a class="btn ghost" href="#/m7">Avaliação final</a>' +
        '</div>' +
        '</div>' +
        U.navFooter('final');
    }
  };
})();
