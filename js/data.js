/* POST & BEEP LAB - Base de conteúdo educacional (PT-BR) */
window.PBL = window.PBL || {};

(function () {
  const D = {};

  /* ---------- Módulos da trilha ---------- */
  D.modules = [
    { id: 'm1', n: 1, code: '01', tag: 'Inicialização', title: 'Conhecendo o POST', desc: 'Etapas elétricas e lógicas do Power-On Self-Test, da energização à entrega ao sistema.', icon: 'activity' },
    { id: 'm2', n: 2, code: '02', tag: 'Sinalização', title: 'Entendendo os códigos de bipes', desc: 'Funcionamento do PC Speaker, duração dos pulsos sonoros e reconhecimento auditivo.', icon: 'volume-2' },
    { id: 'm3', n: 3, code: '03', tag: 'Firmware', title: 'BIOS e fabricantes', desc: 'Tabelas de referência AMI, Award, Dell e IBM com síntese sonora e orientação técnica.', icon: 'table-2' },
    { id: 'm4', n: 4, code: '04', tag: 'Arquitetura', title: 'Diagnóstico de falhas de hardware', desc: 'Estudo dos subsistemas da placa-mãe, sintomas críticos e procedimentos de inspeção.', icon: 'cpu' },
    { id: 'm5', n: 5, code: '05', tag: 'Bancada', title: 'Laboratório de simulação', desc: 'Simulação de ordens de serviço com análise de sintomas, identificação de BIOS e testes.', icon: 'terminal' },
    { id: 'm6', n: 6, code: '06', tag: 'Casos clínicos', title: 'Desafio do técnico', desc: 'Raciocínio diagnóstico estruturado em quatro etapas e quatro níveis de complexidade.', icon: 'sliders-horizontal' },
    { id: 'm7', n: 7, code: '07', tag: 'Verificação', title: 'Avaliação final', desc: 'Vinte questões técnicas com correção comentada e mapeamento de tópicos para revisão.', icon: 'clipboard-check' }
  ];

  /* ---------- Fabricantes / BIOS ---------- */
  D.bios = {
    ami: {
      id: 'ami', name: 'AMI', full: 'AMI BIOS (American Megatrends)', maker: 'generic', type: 'ami', icon: 'cpu',
      intro: 'A American Megatrends Inc. fornece firmware para ampla variedade de placas-mãe comerciais. Como fabricantes de placas personalizam o código-base, um mesmo padrão sonoro pode apresentar variações entre revisões.'
    },
    award: {
      id: 'award', name: 'Award', full: 'Award BIOS (Phoenix-Award)', maker: 'generic', type: 'award', icon: 'layers',
      intro: 'Muito difundida em placas-mãe de diferentes marcas e posteriormente integrada à Phoenix Technologies, a linha Award concentra seus sinais sonoros em falhas críticas de vídeo, memória principal e processador.'
    },
    dell: {
      id: 'dell', name: 'Dell', full: 'Dell (BIOS proprietária)', maker: 'dell', type: 'proprietary', icon: 'monitor',
      intro: 'Fabricantes OEM costumam implementar tabelas próprias de diagnóstico. Nos equipamentos Dell listados nesta referência didática, a contagem de bipes identifica o subsistema afetado.'
    },
    ibm: {
      id: 'ibm', name: 'IBM', full: 'IBM (BIOS proprietária)', maker: 'ibm', type: 'proprietary', icon: 'server',
      intro: 'A arquitetura IBM PC estabeleceu convenções históricas do POST — entre elas o pulso curto único indicando autoteste concluído sem erros aparentes.'
    }
  };

  D.compLabel = {
    ram: 'Memória RAM', cpu: 'Processador (CPU)', gpu: 'Placa de vídeo', mobo: 'Placa-mãe',
    bios: 'BIOS / CMOS', psu: 'Fonte / alimentação', kbd: 'Teclado / controlador',
    cool: 'Refrigeração', lcd: 'Tela LCD', post: 'POST normal / sem falha'
  };

  /* ---------- Códigos de bipes ----------
     spec: S = curto, L = longo, C = contínuo, R = repetidos, H = repetidos agudos,
           A = alternando agudo/grave, W = sirene de dois tons, 0 = sem bipes */
  D.codes = [];
  const kindOf = { '0': 'none', C: 'continuous', R: 'repeat', H: 'repeat', A: 'alt', W: 'alt' };
  function code(bios, label, spec, meaning, compKey, component, diag, opt) {
    const shorts = (spec.match(/S/g) || []).length;
    const longs = (spec.match(/L/g) || []).length;
    D.codes.push(Object.assign({
      id: bios + '-' + D.codes.length, bios, label, spec, meaning, compKey, component, diag,
      shorts, longs, kind: kindOf[spec] || 'count',
      maker: D.bios[bios].maker, biosType: D.bios[bios].type
    }, opt || {}));
  }
  const n = (k) => 'S'.repeat(k);

  // AMI
  code('ami', '1 bip curto', n(1), 'Falha na atualização da DRAM', 'ram', 'Memória RAM (refresh da DRAM)',
    'Desligue e desconecte o PC, reencaixe os módulos de RAM, teste um módulo por vez e em outro slot. Atenção: em versões modernas de AMI, 1 bip curto costuma indicar POST normal; confirme no manual da placa.');
  code('ami', '2 bipes curtos', n(2), 'Falha no circuito de paridade', 'ram', 'Memória RAM / circuito de paridade',
    'Reencaixe os módulos, teste um módulo por vez e verifique se a memória é compatível com a placa. Se o erro persistir com módulos bons, a falha pode estar no controlador de memória.');
  code('ami', '3 bipes curtos', n(3), 'Falha na memória RAM de base 64 K', 'ram', 'Memória RAM (primeiros 64 KB)',
    'A BIOS não conseguiu usar nem a área inicial da RAM. Reencaixe e limpe os contatos do módulo, teste em outro slot e, se possível, com outro módulo sabidamente bom.');
  code('ami', '4 bipes curtos', n(4), 'Falha no temporizador do sistema', 'mobo', 'Placa-mãe (timer do sistema)',
    'Remova periféricos e teste com configuração mínima (CPU, 1 módulo de RAM, vídeo). Limpe o CMOS. Só suspeite da placa-mãe depois de eliminar outras causas.');
  code('ami', '5 bipes curtos', n(5), 'Falha no processador', 'cpu', 'Processador (CPU)',
    'Verifique o encaixe do processador, a fixação do cooler, o conector de energia da CPU e a compatibilidade com a placa/versão da BIOS. Teste outra CPU compatível se disponível.');
  code('ami', '6 bipes curtos', n(6), 'Erro no controlador de teclado Gate A20', 'kbd', 'Controlador de teclado / chipset',
    'Desconecte e reconecte o teclado, teste outro teclado e outra porta. Remova outros periféricos USB/PS2. Persistindo, o problema pode estar no controlador da placa-mãe.');
  code('ami', '7 bipes curtos', n(7), 'Erro de exceção no modo virtual', 'cpu', 'Processador / placa-mãe',
    'Limpe o CMOS, restaure a BIOS para o padrão e teste com configuração mínima. Verifique CPU e RAM antes de concluir qualquer coisa sobre a placa-mãe.');
  code('ami', '8 bipes curtos', n(8), 'Falha no teste de leitura/gravação da memória do visor', 'gpu', 'Placa de vídeo (memória de vídeo)',
    'Reencaixe a placa de vídeo, verifique o conector de energia auxiliar e teste outro slot ou outra placa. Em vídeo integrado, teste a RAM e a placa-mãe.');
  code('ami', '9 bipes curtos', n(9), 'Falha no checksum da ROM BIOS', 'bios', 'Chip da BIOS (ROM)',
    'Limpe o CMOS e restaure o padrão. Se persistir, a BIOS pode estar corrompida: consulte o fabricante sobre recuperação (BIOS Flashback, regravação) ou troca do chip.');
  code('ami', '10 bipes curtos', n(10), 'Erro relacionado à memória CMOS', 'bios', 'CMOS / bateria CR2032',
    'Meça a tensão da bateria CMOS (cerca de 3 V), substitua se estiver baixa, e reconfigure data, hora e opções da BIOS.');
  code('ami', '11 bipes curtos', n(11), 'Erro na memória cache', 'cpu', 'Cache do processador / placa-mãe',
    'Restaure as configurações padrão da BIOS, reencaixe a CPU e teste com outro processador compatível, quando possível.');
  code('ami', '1 longo + 2 curtos', 'LSS', 'Problema de memória na placa de vídeo', 'gpu', 'Placa de vídeo (memória de vídeo)',
    'Reencaixe a placa de vídeo, confira cabos de vídeo e alimentação PCIe, teste outra saída/monitor e outra placa para comparar.');
  code('ami', '1 longo + 3 curtos', 'LSSS', 'Falha de memória convencional/estendida', 'ram', 'Memória RAM (convencional/estendida)',
    'Teste um módulo de RAM por vez, em slots diferentes, e verifique se a velocidade e o tipo (DDR) são compatíveis.');
  code('ami', '1 longo + 8 curtos', 'LSSSSSSSS', 'Falha no teste de exibição/rastreamento', 'gpu', 'Placa de vídeo / conexão com o monitor',
    'Verifique o cabo e o monitor, reencaixe a placa de vídeo e teste outra placa ou o vídeo integrado.');
  code('ami', 'Sirene de dois tons', 'W', 'Baixa velocidade da ventoinha da CPU ou problema de tensão', 'cool', 'Ventoinha da CPU / alimentação',
    'Desligue o PC. Verifique se o cooler gira livremente, se está conectado ao conector CPU_FAN e se há poeira acumulada. Verifique também tensões de alimentação.');

  // Award
  code('award', '1 longo + 2 curtos', 'LSS', 'Erro de vídeo', 'gpu', 'Placa de vídeo / circuito de vídeo',
    'Verifique o encaixe da placa de vídeo e os cabos do monitor. Teste em outro monitor e, se possível, com outra placa.');
  code('award', '1 longo + 3 curtos', 'LSSS', 'Placa de vídeo não detectada ou defeituosa', 'gpu', 'Placa de vídeo',
    'Reencaixe a placa no slot, confira a alimentação auxiliar e teste outro slot/placa. Em placas com vídeo integrado, teste a saída da placa-mãe.');
  code('award', 'Bipes repetidos continuamente', 'R', 'Possível problema de RAM', 'ram', 'Memória RAM',
    'Reencaixe os módulos, teste um por vez, teste outros slots e verifique compatibilidade (tipo, frequência, capacidade).');
  code('award', 'Bipes repetidos de alta frequência', 'H', 'Possível superaquecimento do processador', 'cool', 'Processador / cooler',
    'Desligue imediatamente. Verifique o cooler (gira? bem fixado?), o acúmulo de poeira e a pasta térmica. Só religue após corrigir a refrigeração.');
  code('award', 'Bipes alternando frequências altas e baixas', 'A', 'Possível problema no processador', 'cpu', 'Processador (CPU)',
    'Verifique o encaixe e a alimentação da CPU, o cooler e a compatibilidade. Teste com outro processador compatível se disponível.');

  // Dell (o número de bipes identifica o problema; duração não é especificada na tabela)
  const dell = { lengthUnspecified: true };
  code('dell', '1 bip', n(1), 'Corrupção ou falha da ROM da BIOS', 'bios', 'Chip da BIOS (ROM)',
    'Limpe o CMOS e restaure o padrão. Consulte o manual do modelo sobre recuperação de BIOS.', dell);
  code('dell', '2 bipes', n(2), 'Memória RAM não detectada', 'ram', 'Memória RAM',
    'Reencaixe os módulos, teste um por vez, teste outros slots e verifique a compatibilidade.', dell);
  code('dell', '3 bipes', n(3), 'Falha na placa-mãe', 'mobo', 'Placa-mãe',
    'Teste com configuração mínima, inspecione capacitores e curtos, desconecte periféricos. Confirme com peças boas antes de concluir.', dell);
  code('dell', '4 bipes', n(4), 'Falha na memória RAM', 'ram', 'Memória RAM',
    'Teste cada módulo separadamente, em slots diferentes, e substitua o módulo que falhar no teste.', dell);
  code('dell', '5 bipes', n(5), 'Falha na bateria CMOS', 'bios', 'Bateria CMOS (CR2032)',
    'Meça e substitua a bateria CMOS, depois reconfigure data, hora e opções da BIOS.', dell);
  code('dell', '6 bipes', n(6), 'Falha na placa de vídeo', 'gpu', 'Placa de vídeo',
    'Reencaixe a placa, confira a alimentação e os cabos, e teste outra placa ou monitor.', dell);
  code('dell', '7 bipes', n(7), 'Processador com defeito', 'cpu', 'Processador (CPU)',
    'Confira o encaixe da CPU, o cooler e a alimentação. Teste outra CPU compatível, se possível.', dell);
  code('dell', '8 bipes', n(8), 'Falha no LCD', 'lcd', 'Tela LCD / cabo da tela',
    'Conecte um monitor externo para verificar se o equipamento inicia. Verifique o cabo flat da tela antes de pensar em trocar o painel.', dell);

  // IBM
  code('ibm', 'Sem bipes', '0', 'Possível problema de inicialização', 'psu', 'Fonte, placa-mãe ou alto-falante interno',
    'Verifique alimentação, cabos, se o PC Speaker está conectado e se há outros indicadores (LEDs, ventoinhas). Ausência de bipes não significa ausência de erro.');
  code('ibm', '1 bip curto', n(1), 'POST normal', 'post', 'Nenhum (inicialização normal)',
    'Não há falha indicada. Se o equipamento não exibe imagem, investigue o monitor, o cabo e a placa de vídeo.');
  code('ibm', '2 bipes curtos', n(2), 'Erro POST, verificar código na tela', 'post', 'Depende da mensagem exibida na tela',
    'Leia o código/mensagem de erro apresentado no vídeo e consulte o manual para identificar o componente envolvido.');
  code('ibm', 'Bip contínuo', 'C', 'Possível falta de energia, placa solta ou curto-circuito', 'psu', 'Fonte / placa mãe / placas de expansão',
    'Desligue, desconecte da tomada, reencaixe placas e memórias, remova periféricos e teste com configuração mínima. Teste a fonte com um testador.');
  code('ibm', '1 longo + 1 curto', 'LS', 'Problema na placa-mãe', 'mobo', 'Placa-mãe',
    'Teste com configuração mínima e componentes sabidamente bons. Inspecione visualmente capacitores e conectores.');
  code('ibm', '1 longo + 2 curtos', 'LSS', 'Problema de vídeo', 'gpu', 'Placa de vídeo',
    'Verifique encaixe, cabos e monitor. Teste outra placa de vídeo ou monitor.');
  code('ibm', '3 longos', 'LLL', 'Erro no teclado ou controlador', 'kbd', 'Teclado / controlador de teclado',
    'Reconecte o teclado, teste outro teclado/porta e verifique se há teclas presas.');

  /* ---------- POST: etapas ---------- */
  D.postSteps = [
    { title: 'Energização do sistema', icon: 'power', text: 'A fonte estabiliza as linhas de tensão, envia o sinal Power Good e a placa-mãe libera o barramento.' },
    { title: 'Execução da BIOS/UEFI', icon: 'microchip', text: 'O processador lê o vetor inicial do firmware para configurar registradores e controladores básicos.' },
    { title: 'Rotina do POST', icon: 'activity', text: 'O Power-On Self-Test inspeciona a integridade mínima dos circuitos indispensáveis ao boot.' },
    { title: 'Inspeção de componentes', icon: 'scan-search', text: 'Processador, memória DRAM, chipset, subsistema de vídeo e controladores de entrada são verificados em sequência.' },
    { title: 'Decisão de boot', icon: 'flag', text: 'Sem falhas críticas, o controle passa ao carregador do sistema operacional; havendo erro, o firmware sinaliza por bipes, códigos visuais ou LEDs.' }
  ];

  D.postChecks = [
    { id: 'cpu', label: 'Processador (CPU)', line: 'CPU / registradores ................' },
    { id: 'ram', label: 'Memória RAM', line: 'DRAM 16384 MB DDR4 .................' },
    { id: 'mobo', label: 'Placa-mãe / chipset', line: 'Chipset / barramentos ..............' },
    { id: 'gpu', label: 'Subsistema de vídeo', line: 'Controlador de vídeo PCIe ..........' },
    { id: 'kbd', label: 'Controlador de E/S', line: 'Teclado e portas essenciais ........' }
  ];

  D.postFailures = {
    none: { label: 'Operação normal (sem falhas)', spec: 'S', msg: 'POST concluído. Transferindo execução ao sistema operacional.' },
    ram: { label: 'Falha na memória RAM', spec: 'SSS', msg: 'FALHA CRÍTICA: memória principal não detectada ou sem resposta.' },
    cpu: { label: 'Falha no processador', spec: 'SSSSS', msg: 'FALHA CRÍTICA: erro de inicialização da CPU. Execução interrompida.' },
    gpu: { label: 'Falha na placa de vídeo', spec: 'LSS', msg: 'FALHA DE VÍDEO: adaptador gráfico não inicializado.' },
    mobo: { label: 'Falha na placa-mãe', spec: 'SSSS', msg: 'FALHA DE SISTEMA: temporizador ou circuito lógico inoperante.' },
    kbd: { label: 'Erro no controlador de teclado', spec: 'LLL', msg: 'ERRO DE E/S: falha no controlador de teclado.' }
  };

  /* ---------- Módulo 2: conteúdo e sons ---------- */
  D.beepFaq = [
    { icon: 'help-circle', q: 'O que são os códigos de bipes (Beep Codes)?', a: 'São padrões acústicos formados por pulsos curtos e longos emitidos pelo firmware durante o POST. Funcionam como diagnóstico primário de baixo nível quando o subsistema de vídeo ainda não está operacional.' },
    { icon: 'monitor-off', q: 'Por que o computador utiliza sinais sonoros ao ligar?', a: 'Nos primeiros instantes da energização — ou diante de defeito em RAM, CPU ou placa de vídeo — não há saída gráfica disponível. O canal sonoro permite reportar a etapa exata em que o autoteste parou.' },
    { icon: 'volume-2', q: 'Qual é o papel do alto-falante interno (PC Speaker)?', a: 'Trata-se de um transdutor piezoelétrico (buzzer) conectado diretamente ao header SPEAKER da placa-mãe. Ele opera por pulsos elétricos simples comandados pelo firmware, sem depender de driver ou placa de som.' },
    { icon: 'clock', q: 'Como diferenciar um bip curto de um bip longo?', a: 'Pela duração temporal do pulso. Um bip curto dura uma fração de segundo (cerca de 150 ms), enquanto um bip longo sustenta o tom por aproximadamente meio segundo ou mais.' },
    { icon: 'repeat', q: 'O que costuma indicar um bip contínuo?', a: 'Em diversas tabelas técnicas, um tom ininterrupto ou repetido indefinidamente aponta anomalia de alimentação elétrica, mau encaixe severo de memória ou curto em placas de expansão.' },
    { icon: 'layers', q: 'Por que os códigos mudam entre fabricantes?', a: 'Não há norma única para sinalização acústica de POST. Desenvolvedores de firmware (AMI, Award/Phoenix) e fabricantes OEM (Dell, IBM, HP, Lenovo) definem mapeamentos próprios conforme a arquitetura e a versão da BIOS.' }
  ];

  D.sounds = [
    { id: 's1', label: 'Bip curto', spec: 'S', note: 'IBM e diversas placas atuais: POST concluído. AMI clássica: falha de refresh da DRAM.' },
    { id: 's2', label: 'Bip longo', spec: 'L', note: 'Pulso de maior duração, geralmente combinado a pulsos curtos na composição de códigos.' },
    { id: 's3', label: 'Dois bipes curtos', spec: 'SS', note: 'IBM: erro de POST acompanhado de código em tela. AMI: falha no circuito de paridade.' },
    { id: 's4', label: 'Três bipes curtos', spec: 'SSS', note: 'AMI: falha de leitura/gravação nos primeiros 64 KB da memória RAM.' },
    { id: 's5', label: 'Um longo e dois curtos', spec: 'LSS', note: 'AMI, Award e IBM: anomalia associada ao adaptador ou à memória de vídeo.' },
    { id: 's6', label: 'Bip contínuo', spec: 'C', note: 'IBM: possível falha de alimentação, placa mal encaixada ou curto-circuito.' },
    { id: 's7', label: 'Frequências alternadas', spec: 'A', note: 'Award: alerta associado a falha no processador.' }
  ];

  /* ---------- Módulo 4: componentes ---------- */
  D.components = {
    ram: {
      name: 'Memória RAM', icon: 'memory-stick', tag: 'Memória principal volátil (DRAM)',
      what: 'A memória RAM (Random Access Memory) é a memória rápida e volátil onde o processador guarda temporariamente os programas e os dados em uso. Quando o computador é desligado, o conteúdo da RAM é perdido.',
      how: 'Cada bit é guardado em uma minúscula célula (capacitor + transistor) que precisa ser atualizada milhares de vezes por segundo (refresh). Durante o POST, a BIOS lê o chip SPD de cada módulo para descobrir tipo, capacidade e velocidade, e testa e configura o controlador de memória. Sem memória funcional, o firmware não consegue continuar a inicialização.',
      notDetected: 'Quando a RAM não é detectada, o POST é interrompido: o computador liga (ventoinhas giram, LEDs acendem), mas não há imagem. Dependendo do fabricante, ocorrem bipes de memória e o LED de diagnóstico da placa (DRAM) pode acender.',
      symptoms: ['Tela preta ao ligar', 'Falha no POST', 'Reinicializações constantes', 'Bipes (repetidos ou curtos, conforme a BIOS)', 'Telas azuis e travamentos aleatórios'],
      procedures: ['Desligar e desconectar o computador da tomada', 'Verificar o encaixe da memória (as travas laterais devem fechar)', 'Testar um módulo por vez', 'Testar outros slots compatíveis', 'Verificar compatibilidade (tipo DDR, frequência, capacidade) e o estado dos módulos'],
      extras: [{ title: 'Dica de bancada', text: 'Pequenos resíduos nos contatos dourados podem causar mau contato. Limpe com cuidado e sem tocar nos contatos com os dedos.' }]
    },
    cpu: {
      name: 'Processador (CPU)', icon: 'cpu', tag: 'Unidade central de processamento',
      what: 'A CPU (Central Processing Unit) executa as instruções dos programas, faz cálculos e coordena as demais partes do sistema. É a primeira peça a executar o código do firmware quando o computador liga.',
      how: 'A CPU lê o endereço inicial da BIOS, executa o código de inicialização e controla o restante do POST. Ela gera calor intenso, por isso precisa de dissipador, pasta térmica e cooler. Também recebe alimentação dedicada da fonte pelo conector EPS/CPU de 4 ou 8 pinos.',
      symptoms: ['Computador não inicia ou liga e desliga em segundos', 'Sem imagem e sem POST', 'Bipes de processador (em tabelas que preveem isso)', 'Desligamentos por temperatura', 'Lentidão extrema por redução de frequência (thermal throttling)'],
      procedures: ['Desligar e desconectar o computador', 'Conferir se o conector de energia da CPU (EPS) está firme', 'Verificar fixação do cooler e se a ventoinha gira', 'Inspecionar o encaixe e os pinos do soquete', 'Verificar compatibilidade da CPU com a placa-mãe e a versão da BIOS'],
      extras: [
        { title: 'Superaquecimento', text: 'Poeira, pasta térmica ressecada ou ventoinha parada elevam a temperatura. Ao passar do limite, o computador reduz o desempenho ou desliga para se proteger. Algumas BIOS emitem bipes agudos de alerta.' },
        { title: 'Cooler mal instalado', text: 'Se o cooler não encosta corretamente na CPU (travas soltas, película plástica esquecida), o calor não é dissipado e o computador desliga logo após ligar.' },
        { title: 'Alimentação inadequada', text: 'Conector EPS desconectado ou fonte sem capacidade suficiente impedem a CPU de iniciar. O computador pode ligar e desligar sem exibir vídeo.' }
      ]
    },
    gpu: {
      name: 'Placa de vídeo', icon: 'monitor', tag: 'Processamento e saída gráfica',
      what: 'A GPU (Graphics Processing Unit) processa as imagens e envia o sinal para o monitor. Pode ser integrada ao processador/placa-mãe ou ser uma placa dedicada, encaixada no slot PCI Express.',
      how: 'Durante o POST, a BIOS procura a placa de vídeo, inicializa a sua memória (VRAM) e prepara a saída de imagem. Se a placa falha, o computador pode ligar normalmente, mas sem imagem; é aí que os bipes de vídeo (como "1 longo + 2 curtos") ajudam.',
      symptoms: ['Ausência de vídeo ("sem sinal")', 'Bipes de vídeo', 'Artefatos na imagem e travamentos em jogos', 'Ventoinha da placa a toda velocidade sem imagem'],
      procedures: ['Desligar e desconectar o computador', 'Verificar se o monitor está ligado na saída da placa de vídeo, e não na da placa-mãe', 'Reencaixar a placa no slot PCIe e conferir o cabo de vídeo', 'Conferir os conectores de alimentação auxiliar (6/8 pinos)', 'Testar outro monitor/cabo, outro slot ou o vídeo integrado'],
      extras: [
        { title: 'Ausência de vídeo', text: 'Antes de condenar a placa, descarte o monitor, o cabo e a entrada selecionada no monitor.' },
        { title: 'Alimentação da placa', text: 'Placas potentes exigem cabos PCIe da fonte. Sem eles, a placa não inicia e o POST pode emitir bipes ou ficar sem imagem.' },
        { title: 'Memória de vídeo', text: 'Falhas na VRAM geram artefatos (manchas, pontos coloridos) e podem produzir bipes de memória de vídeo nas tabelas de AMI.' }
      ]
    },
    mobo: {
      name: 'Placa-mãe', icon: 'circuit-board', tag: 'Barramentos, VRM e interconexão',
      what: 'A placa-mãe é a placa de circuito principal. Ela conecta CPU, memória, placa de vídeo, armazenamento e periféricos, distribui energia recebida da fonte e abriga a BIOS/UEFI.',
      how: 'Trilhas de cobre, o chipset e os reguladores de tensão (VRM) permitem que os componentes conversem e recebam a tensão correta. Os slots e conectores padronizam o encaixe de cada peça.',
      symptoms: ['Computador sem sinal de vida mesmo com fonte boa', 'Reinicializações sem causa aparente', 'Capacitores estufados ou vazando', 'Slots ou portas que deixam de funcionar', 'Bipes de placa-mãe em algumas tabelas'],
      procedures: ['Desligar e desconectar o computador', 'Inspecionar visualmente capacitores, conectores e marcas de queimado', 'Verificar espaçadores e parafusos: a placa não pode tocar o gabinete', 'Testar com configuração mínima (CPU, 1 RAM, vídeo, fonte)', 'Confirmar com peças sabidamente boas antes de concluir que a placa falhou'],
      extras: [
        { title: 'Curtos-circuitos', text: 'Parafusos soltos, espaçadores no lugar errado ou cabos mal encaixados podem causar curto e impedir a inicialização.' },
        { title: 'Falhas no firmware', text: 'Uma BIOS corrompida (por atualização interrompida, por exemplo) pode impedir o POST. Alguns modelos têm recursos de recuperação.' },
        { title: 'Problemas de alimentação', text: 'Os reguladores de tensão (VRM) transformam a energia da fonte. Se falharem, CPU e RAM não recebem a tensão correta.' }
      ]
    },
    bios: {
      name: 'BIOS / CMOS', icon: 'microchip', tag: 'Firmware de inicialização e parâmetros',
      what: 'A BIOS (Basic Input/Output System) é o firmware gravado em um chip da placa-mãe. É o primeiro programa executado ao ligar: inicializa o hardware, executa o POST e entrega o controle ao sistema operacional.',
      how: 'As configurações (data, hora, ordem de boot) ficam em uma pequena memória CMOS, mantida por uma bateria de lítio do tipo CR2032 (cerca de 3 V). Sem a bateria, o computador perde data e hora e volta às configurações padrão.',
      symptoms: ['Data e hora incorretas a cada boot', 'Mensagem de "CMOS checksum error"', 'Computador não encontra o disco de boot', 'Bipes de CMOS/BIOS em algumas tabelas'],
      procedures: ['Acessar a BIOS (teclas como DEL, F2, F10 ou ESC)', 'Medir a tensão da bateria CMOS (deve estar próxima de 3 V)', 'Substituir a bateria CR2032, se necessário', 'Restaurar as configurações padrão (Load Defaults)', 'Conferir a ordem de boot'],
      extras: [
        { title: 'BIOS x UEFI', text: 'A UEFI é a evolução da BIOS: interface gráfica, suporte a discos acima de 2 TB (GPT), inicialização mais rápida e recursos como Secure Boot. A BIOS tradicional usa o modo legado (MBR).' },
        { title: 'Configurações de inicialização', text: 'A ordem de boot define de qual dispositivo o computador tentará iniciar (SSD, HD, pen drive, rede). Uma ordem incorreta pode causar a mensagem de "disco de boot não encontrado".' }
      ]
    },
    psu: {
      name: 'Fonte de alimentação', icon: 'zap', tag: 'Conversão AC/DC e linhas de tensão',
      what: 'A fonte converte a corrente alternada da tomada (110/220 V) em tensões contínuas de baixa tensão para os componentes do computador.',
      how: 'Fornece as tensões de +12 V (CPU, placa de vídeo, ventoinhas, motores), +5 V e +3,3 V (lógica, memória, periféricos), além de sinais de controle como o Power Good, que informa à placa-mãe que as tensões estão estáveis e o POST pode começar.',
      symptoms: ['Computador não liga ou liga e desliga', 'Reinicializações sob carga', 'Ruídos anormais, cheiro de queimado', 'Bipes contínuos (em algumas tabelas)'],
      procedures: ['Desligar e desconectar o cabo de alimentação', 'Conferir conectores ATX 24 pinos e EPS firmes', 'Testar com testador de fontes ou multímetro, com cuidado', 'Isolar a falha: desconectar componentes e testar com configuração mínima', 'Substituir por fonte compatível; nunca abrir a fonte'],
      extras: [
        { title: 'Fonte defeituosa x computador sem POST', text: 'Se nada acende e não há ventoinhas girando, a suspeita recai sobre a fonte, o cabo ou a tomada. Se tudo liga (luzes, ventoinhas), mas não há imagem nem bipes, a fonte provavelmente funciona, e o problema pode estar em RAM, CPU, vídeo ou placa-mãe.' },
        { title: 'Cuidado', text: 'A fonte mantém tensões perigosas mesmo desligada da tomada. Nunca abra a carcaça.' }
      ]
    },
    spk: {
      name: 'Alto-falante interno (PC Speaker)', icon: 'volume-2', tag: 'Transdutor acústico de diagnóstico',
      what: 'Pequeno buzzer ligado ao conector SPEAKER da placa-mãe. É usado pelo firmware para emitir os bipes de diagnóstico.',
      how: 'O firmware envia um sinal elétrico simples, gerando um tom de frequência fixa. Não depende da placa de som nem do sistema operacional, por isso funciona mesmo quando quase nada mais está funcionando.',
      symptoms: ['Nenhum som no POST (speaker desconectado ou defeituoso)', 'Impossibilidade de ouvir os códigos de bipe'],
      procedures: ['Verificar se o speaker está conectado ao header correto', 'Testar com outro speaker/buzzer', 'Lembrar: muitas placas e notebooks modernos não possuem speaker; use LEDs de diagnóstico e códigos na tela'],
      extras: [{ title: 'Veja também', text: 'No Módulo 2 você ouve e visualiza cada padrão sonoro.' }]
    }
  };

  /* ---------- Falhas: base para o Desafio do Técnico ---------- */
  D.faults = {
    ram: { error: 'Falha ou ausência de detecção da memória RAM', comp: 'Memória RAM', proc: 'Desligar, desconectar da tomada e reencaixar os módulos de RAM', fix: 'Limpar os contatos, testar um módulo por vez e em outro slot; substituir o módulo defeituoso ou incompatível', topic: 'ram' },
    gpu: { error: 'Falha de vídeo / placa de vídeo não detectada', comp: 'Placa de vídeo', proc: 'Reencaixar a placa de vídeo e conferir cabo de vídeo e alimentação auxiliar', fix: 'Testar outro cabo, monitor, slot ou placa; substituir a placa se o defeito for confirmado', topic: 'video' },
    cpu: { error: 'Falha no processador ou em sua alimentação', comp: 'Processador (CPU)', proc: 'Verificar o encaixe do processador, o cooler e o conector de energia da CPU', fix: 'Reinstalar corretamente; testar outra CPU compatível; substituir se confirmado', topic: 'cpu' },
    heat: { error: 'Superaquecimento do processador', comp: 'Cooler / dissipador do processador', proc: 'Desligar e verificar se o cooler gira, está bem fixado e se há poeira', fix: 'Limpar a poeira, trocar a pasta térmica e reinstalar ou substituir o cooler', topic: 'cpu' },
    fan: { error: 'Ventoinha da CPU lenta ou problema de tensão', comp: 'Ventoinha da CPU / alimentação', proc: 'Verificar se o cooler gira livremente e se está no conector CPU_FAN', fix: 'Limpar e lubrificar ou trocar a ventoinha; verificar as tensões da fonte', topic: 'cpu' },
    cmos: { error: 'Bateria CMOS descarregada', comp: 'Bateria CMOS (BIOS/CMOS)', proc: 'Medir a tensão da bateria CMOS (cerca de 3 V)', fix: 'Substituir a bateria CR2032 e reconfigurar data, hora e BIOS', topic: 'bios' },
    bios: { error: 'ROM da BIOS corrompida ou checksum inválido', comp: 'Chip da BIOS (firmware)', proc: 'Limpar o CMOS e restaurar as configurações padrão', fix: 'Recuperar ou regravar a BIOS conforme o manual do fabricante, ou substituir o chip', topic: 'bios' },
    kbd: { error: 'Erro no teclado ou no controlador de teclado', comp: 'Teclado / controlador', proc: 'Desconectar e reconectar o teclado, testando outra porta', fix: 'Trocar o teclado; persistindo, investigar o controlador na placa-mãe', topic: 'hardware' },
    mobo: { error: 'Falha em circuito da placa-mãe', comp: 'Placa-mãe', proc: 'Desconectar periféricos e testar com configuração mínima', fix: 'Confirmar com peças boas; reparar ou substituir a placa-mãe', topic: 'hardware' },
    psu: { error: 'Falta de energia, fonte inadequada ou curto-circuito', comp: 'Fonte de alimentação', proc: 'Desligar, desconectar e testar a fonte com testador de fontes ou multímetro', fix: 'Isolar curtos, reencaixar conectores e substituir a fonte por uma compatível (nunca abrir)', topic: 'hardware' },
    lcd: { error: 'Falha no LCD ou no cabo da tela', comp: 'Tela LCD / cabo flat', proc: 'Conectar um monitor externo para verificar se o equipamento inicia', fix: 'Reencaixar o cabo flat; substituir o cabo ou o painel se confirmado', topic: 'hardware' },
    post_ok: { error: 'POST concluído normalmente (ausência de imagem externa ao POST)', comp: 'Monitor / cabo de vídeo externo', proc: 'Verificar se o monitor está ligado na tomada e se o cabo de vídeo está firme', fix: 'Ligar ou reconectar o monitor e selecionar a entrada de vídeo correta', topic: 'video' }
  };

  /* Casos do Desafio do Técnico, por nível (1 a 4) */
  const cs = (level, bios, fault, complaint, beepText, spec, extra, over) =>
    Object.assign({ level, bios, fault, complaint, beepText, spec, extra: extra || '' }, over || {});
  D.cases = [
    // Nível 1
    cs(1, 'ibm', 'post_ok', 'O cliente diz que o computador liga e o LED do disco pisca normalmente, mas o monitor permanece apagado (com o LED do monitor desligado).', 'um bip curto', 'S'),
    cs(1, 'dell', 'ram', 'O cliente diz que o computador liga, mas a tela fica preta.', 'dois bipes', 'SS'),
    cs(1, 'dell', 'gpu', 'O cliente informa que o computador liga, as luzes acendem, mas o monitor mostra "sem sinal".', 'seis bipes', 'SSSSSS'),
    cs(1, 'dell', 'cmos', 'O cliente reclama que a data e a hora do computador voltam para 2000 toda vez que ele é ligado.', 'cinco bipes', 'SSSSS'),
    cs(1, 'ibm', 'kbd', 'O cliente diz que o computador liga, mas trava antes de carregar o sistema.', 'três bipes longos', 'LLL'),
    cs(1, 'dell', 'cpu', 'O computador liga, as ventoinhas giram, mas não há imagem.', 'sete bipes', 'SSSSSSS'),
    // Nível 2
    cs(2, 'ami', 'ram', 'O cliente informa que o computador liga e não aparece imagem.', 'três bipes curtos', 'SSS'),
    cs(2, 'ami', 'gpu', 'O cliente informa que o computador liga, mas não aparece imagem.', 'um bip longo seguido de dois bipes curtos', 'LSS'),
    cs(2, 'award', 'ram', 'O cliente diz que o computador liga e fica apitando sem parar, sem iniciar.', 'bipes repetidos continuamente', 'R'),
    cs(2, 'ami', 'bios', 'O cliente conta que fez uma atualização de BIOS que foi interrompida por queda de energia e agora o computador não inicia.', 'nove bipes curtos', 'SSSSSSSSS'),
    cs(2, 'award', 'gpu', 'O cliente trocou a placa de vídeo e agora o computador liga sem imagem.', 'um bip longo seguido de três bipes curtos', 'LSSS'),
    cs(2, 'dell', 'bios', 'O cliente relata que o computador não inicia depois de uma falha de energia durante a atualização do firmware.', 'um bip', 'S'),
    // Nível 3
    cs(3, 'ami', 'cpu', 'O computador liga, mas não passa do POST e não exibe imagem.', 'cinco bipes curtos', 'SSSSS'),
    cs(3, 'ibm', 'mobo', 'O computador liga, mas não apresenta imagem nem inicia o sistema.', 'um bip longo seguido de um curto', 'LS'),
    cs(3, 'ibm', 'psu', 'O computador acende as luzes, mas não inicia.', 'um bip contínuo', 'C'),
    cs(3, 'ami', 'fan', 'O computador inicia, mas emite um alarme estranho e o cliente diz que o cooler faz muito barulho.', 'uma sirene de dois tons', 'W'),
    cs(3, 'award', 'heat', 'O cliente diz que o computador liga, apita e desliga sozinho em poucos segundos.', 'bipes repetidos de alta frequência', 'H'),
    cs(3, 'award', 'cpu', 'O computador liga, mas não inicia.', 'bipes que alternam entre frequências altas e baixas', 'A'),
    cs(3, 'ami', 'kbd', 'O cliente diz que o computador trava na inicialização logo após conectar um teclado novo.', 'seis bipes curtos', 'SSSSSS'),
    cs(3, 'dell', 'lcd', 'O notebook liga, o LED de energia acende, mas a tela permanece preta.', 'oito bipes', 'SSSSSSSS'),
    cs(3, 'dell', 'mobo', 'O cliente conta que o computador parou de ligar do nada.', 'três bipes', 'SSS'),
    // Nível 4
    cs(4, 'award', 'heat', 'O computador desliga sozinho alguns segundos depois de ligar.',
      'bipes repetidos de alta frequência', 'H',
      'Informações adicionais: o gabinete fica dentro de um armário fechado, a ventoinha do cooler está coberta de poeira e o cliente nunca fez manutenção.'),
    cs(4, 'ami', 'gpu', 'O computador liga e as ventoinhas giram, mas o monitor não mostra nada.',
      'um bip longo seguido de dois bipes curtos', 'LSS',
      'Informações adicionais: o cliente instalou uma placa de vídeo dedicada hoje e o cabo de alimentação auxiliar de 8 pinos ficou sem ser conectado. O monitor está ligado na saída da placa.',
      { proc: 'Conferir se o cabo de alimentação auxiliar PCIe está conectado à placa de vídeo', fix: 'Conectar o cabo PCIe de 8 pinos da fonte e confirmar que a fonte tem potência suficiente para a placa' }),
    cs(4, 'dell', 'ram', 'O computador liga, mas não passa do POST.',
      'quatro bipes', 'SSSS',
      'Informações adicionais: ontem o cliente instalou um segundo pente de memória de outra marca e outra velocidade.',
      { error: 'Memória RAM incompatível ou com falha', proc: 'Remover o módulo novo e testar com um módulo por vez', fix: 'Usar módulos compatíveis (mesmo tipo DDR e frequências suportadas) e substituir o módulo que falhar no teste' }),
    cs(4, 'ibm', 'psu', 'O computador não inicia depois da troca da placa de vídeo.',
      'um bip contínuo', 'C',
      'Informações adicionais: a fonte original tem 300 W e a nova placa de vídeo exige uma fonte bem mais potente, com conectores PCIe.',
      { error: 'Fonte com potência insuficiente ou conector mal encaixado', proc: 'Verificar a potência da fonte e os conectores de energia da placa de vídeo', fix: 'Substituir por fonte de potência adequada e com conectores PCIe compatíveis' }),
    cs(4, 'ami', 'cmos', 'O computador reinicia a data para uma data antiga e pede para pressionar F1.',
      'dez bipes curtos', 'SSSSSSSSSS',
      'Informações adicionais: o equipamento tem mais de 8 anos e já ficou semanas desligado da tomada.'),
    cs(4, 'ami', 'cpu', 'O computador não exibe imagem logo após a troca do processador.',
      'cinco bipes curtos', 'SSSSS',
      'Informações adicionais: o novo processador é de geração mais recente do que a placa-mãe oficialmente suporta, e a BIOS nunca foi atualizada.',
      { error: 'Processador incompatível com a placa-mãe/versão da BIOS', proc: 'Consultar a lista de CPUs compatíveis do fabricante e a versão da BIOS instalada', fix: 'Atualizar a BIOS com a CPU antiga ou substituir por um processador compatível' }),
    cs(4, 'ami', 'ram', 'O computador mostra tela preta ao ligar e ocorre uma sequência de bipes.',
      'um bip longo seguido de três bipes curtos', 'LSSS',
      'Informações adicionais: o cliente limpou o gabinete ontem e retirou os módulos de memória para soprar a poeira.',
      { proc: 'Desligar, desconectar e reencaixar os módulos de memória até ouvir o clique das travas' })
  ];

  /* ---------- Módulo 5: cenários do simulador ---------- */
  D.biosHints = {
    ami: 'Ao ligar, aparece rapidamente o logotipo "American Megatrends" na tela de inicialização.',
    award: 'A tela inicial exibe "Award Modular BIOS" no topo.',
    dell: 'O gabinete tem a etiqueta "Dell" e a BIOS pertence ao fabricante do equipamento.',
    ibm: 'O gabinete tem a etiqueta "IBM" e a BIOS pertence ao fabricante do equipamento.'
  };

  D.scenarios = [
    {
      id: 'sc1', kind: 'mc', bios: 'ami', needsBios: true, topic: 'beeps', sub: 'ram', diag: true,
      symptoms: 'O computador liga, mas não apresenta imagem. Ele emite 3 bipes curtos.', spec: 'SSS',
      question: 'Qual componente deve ser investigado primeiro?',
      options: ['Memória RAM', 'Fonte de alimentação', 'Teclado', 'Disco rígido'], answer: 0,
      explain: 'Na tabela da AMI, 3 bipes curtos indicam falha na memória RAM de base 64 K. A BIOS não consegue usar a RAM nem para as etapas iniciais, por isso não há imagem.',
      component: 'Memória RAM', procedure: 'Desligue e desconecte o PC, reencaixe o módulo de RAM, teste um módulo por vez e em outros slots.'
    },
    {
      id: 'sc2', kind: 'mc', bios: 'ibm', needsBios: true, topic: 'codes', sub: 'bios', diag: false,
      symptoms: 'O computador liga e emite 1 bip curto. Em seguida, o sistema operacional começa a carregar.', spec: 'S',
      question: 'O que esse sinal pode representar em determinados sistemas?',
      options: ['POST concluído normalmente', 'Falha grave do processador', 'Placa de vídeo queimada', 'Disco rígido danificado'], answer: 0,
      explain: 'Em equipamentos IBM (e em muitas BIOS), 1 bip curto sinaliza POST normal. Lembre-se: o significado depende do fabricante, e em outras tabelas 1 bip pode indicar falha.',
      component: 'Nenhum (inicialização normal)', procedure: 'Nenhuma ação necessária. Se faltar imagem, investigue monitor, cabo e placa de vídeo.'
    },
    {
      id: 'sc3', kind: 'mc', bios: 'award', needsBios: true, topic: 'beeps', sub: 'ram', diag: true,
      symptoms: 'O computador apresenta bipes repetidos e não inicia.', spec: 'R',
      question: 'Qual componente pode estar apresentando problemas?',
      options: ['Memória RAM', 'Mouse', 'Placa de som', 'Unidade de DVD'], answer: 0,
      explain: 'Na tabela didática da Award, bipes repetidos continuamente indicam possível problema de RAM. Por ser "possível", é preciso confirmar com testes.',
      component: 'Memória RAM', procedure: 'Reencaixar os módulos, testar um por vez, testar outros slots e verificar compatibilidade.'
    },
    {
      id: 'sc4', kind: 'mc', bios: 'ami', needsBios: true, topic: 'codes', sub: 'bios', diag: true,
      symptoms: 'O computador apresenta 1 bip longo e 2 curtos.', spec: 'LSS',
      question: 'Qual problema pode estar relacionado a esse código?',
      options: ['Problema de memória na placa de vídeo', 'Falha no processador', 'Bateria CMOS fraca', 'Falha na ventoinha da CPU'], answer: 0,
      explain: 'Na AMI, 1 longo + 2 curtos indica problema de memória na placa de vídeo. O padrão é parecido em outras BIOS (Award e IBM), mas sempre confirme.',
      component: 'Placa de vídeo', procedure: 'Reencaixar a placa de vídeo, conferir cabos e alimentação PCIe e testar outro monitor/placa.'
    },
    {
      id: 'sc5', kind: 'mc', bios: 'award', needsBios: true, topic: 'beeps', sub: 'cpu', diag: true,
      symptoms: 'O computador liga, apresenta bipes de alta frequência e desliga.', spec: 'H',
      question: 'Qual condição deve ser investigada?',
      options: ['Superaquecimento do processador', 'Falha no teclado', 'Disco cheio', 'Mouse desconectado'], answer: 0,
      explain: 'Na Award, bipes repetidos de alta frequência indicam possível superaquecimento do processador. O desligamento automático é uma proteção térmica.',
      component: 'Processador / cooler', procedure: 'Verificar se o cooler gira e está bem fixado, limpar poeira e conferir a pasta térmica antes de religar.'
    },
    {
      id: 'sc6', kind: 'mc', bios: 'dell', needsBios: true, topic: 'codes', sub: 'bios', diag: true,
      symptoms: 'O computador Dell liga com 5 bipes. Ao acessar a BIOS (quando consegue), a data está sempre errada.', spec: 'SSSSS',
      question: 'Qual componente deve ser verificado primeiro?',
      options: ['Bateria CMOS', 'Placa de vídeo', 'Memória RAM', 'Teclado'], answer: 0,
      explain: 'Na tabela Dell usada aqui, 5 bipes indicam falha na bateria CMOS. A data errada reforça a suspeita, mas a bateria deve ser medida e testada.',
      component: 'Bateria CMOS (CR2032)', procedure: 'Medir a tensão da bateria (cerca de 3 V), substituir se estiver baixa e reconfigurar a BIOS.'
    },
    {
      id: 'sc7', kind: 'mc', bios: 'ibm', needsBios: true, topic: 'codes', sub: 'bios', diag: false,
      symptoms: 'O computador IBM liga e emite um bip contínuo, sem exibir imagem.', spec: 'C',
      question: 'Qual das causas abaixo é compatível com esse código na tabela IBM?',
      options: ['Possível falta de energia, placa solta ou curto-circuito', 'POST normal', 'Erro no teclado', 'Falha na bateria CMOS'], answer: 0,
      explain: 'Na tabela IBM, o bip contínuo indica possível falta de energia, placa solta ou curto-circuito. Desligue e desconecte antes de qualquer verificação.',
      component: 'Fonte / placas de expansão / placa-mãe', procedure: 'Desconectar, reencaixar placas e memórias, remover periféricos e testar a fonte.'
    },
    {
      id: 'sc8', kind: 'mc', bios: 'ami', needsBios: true, topic: 'codes', sub: 'bios', diag: true,
      symptoms: 'O computador inicia e, em seguida, emite uma sirene de dois tons.', spec: 'W',
      question: 'O que deve ser investigado primeiro, segundo a tabela AMI?',
      options: ['Ventoinha da CPU lenta ou problema de tensão', 'Placa de vídeo sem memória', 'Memória cache', 'Teclado'], answer: 0,
      explain: 'Na AMI, a sirene de dois tons indica baixa velocidade da ventoinha da CPU ou problema de tensão.',
      component: 'Ventoinha da CPU / alimentação', procedure: 'Desligue, verifique se o cooler gira livremente, se está no conector CPU_FAN e limpe a poeira.'
    },
    {
      id: 'sc9', kind: 'mc', bios: 'dell', needsBios: true, topic: 'beeps', sub: 'ram', diag: true,
      symptoms: 'Um computador Dell liga, mas não mostra imagem. Ele emite 2 bipes.', spec: 'SS',
      question: 'O que a tabela Dell associa a esse código?',
      options: ['Memória RAM não detectada', 'Falha na placa de vídeo', 'Processador com defeito', 'Falha no LCD'], answer: 0,
      explain: 'Na tabela Dell desta aula, 2 bipes indicam memória RAM não detectada.',
      component: 'Memória RAM', procedure: 'Reencaixar a RAM, testar um módulo por vez e em outros slots.'
    },
    {
      id: 'sc10', kind: 'mc', bios: 'ibm', needsBios: true, topic: 'codes', sub: 'bios', diag: false,
      symptoms: 'Um PC IBM emite 3 bipes longos logo após ligar.', spec: 'LLL',
      question: 'Qual componente a tabela IBM relaciona a esse código?',
      options: ['Teclado ou controlador', 'Memória RAM', 'Placa de vídeo', 'Fonte'], answer: 0,
      explain: 'Na tabela IBM, 3 bipes longos apontam erro no teclado ou controlador.',
      component: 'Teclado / controlador', procedure: 'Reconectar o teclado, testar outro teclado/porta e verificar teclas presas.'
    },
    {
      id: 'o1', kind: 'order', topic: 'diag', sub: 'ram', diag: true, spec: 'R', bios: 'award', needsBios: false,
      symptoms: 'Um computador com BIOS Award liga e emite bipes repetidos, sem imagem. Suspeita-se da memória RAM.',
      question: 'Escolha os procedimentos corretos, na ordem em que devem ser executados.',
      steps: [
        { id: 'a', text: 'Desligar o computador e desconectar o cabo de alimentação' },
        { id: 'b', text: 'Aplicar proteção contra eletricidade estática (ESD) e abrir o gabinete' },
        { id: 'c', text: 'Verificar o encaixe dos módulos de memória' },
        { id: 'd', text: 'Testar um módulo por vez' },
        { id: 'e', text: 'Testar o módulo em outros slots compatíveis' },
        { id: 'x', text: 'Retirar a memória com o computador ligado para ver se o erro muda', wrong: true },
        { id: 'y', text: 'Trocar a placa-mãe imediatamente', wrong: true }
      ],
      order: ['a', 'b', 'c', 'd', 'e'],
      explain: 'O diagnóstico começa pela segurança (desligar e desconectar), depois pela verificação mais simples (encaixe) e só então pelos testes comparativos (módulo a módulo e slot a slot). Retirar peças com o equipamento energizado e trocar a placa sem testar são erros graves.',
      component: 'Memória RAM', procedure: 'Siga: desligar → ESD → encaixe → um módulo por vez → outros slots.'
    },
    {
      id: 'o2', kind: 'order', topic: 'diag', sub: 'video', diag: true, spec: 'LSS', bios: 'ami', needsBios: false,
      symptoms: 'O computador liga, mas o monitor mostra "sem sinal" e o PC emite 1 bip longo e 2 curtos (BIOS AMI).',
      question: 'Escolha os procedimentos corretos, na ordem em que devem ser executados.',
      steps: [
        { id: 'a', text: 'Conferir se o monitor está ligado, com cabo firme e entrada correta' },
        { id: 'b', text: 'Desligar o computador e desconectar o cabo de alimentação' },
        { id: 'c', text: 'Reencaixar a placa de vídeo e conferir a alimentação auxiliar' },
        { id: 'd', text: 'Testar outro monitor, outro cabo ou outra placa de vídeo' },
        { id: 'x', text: 'Formatar o disco rígido', wrong: true },
        { id: 'y', text: 'Abrir a fonte de alimentação para inspecionar', wrong: true }
      ],
      order: ['a', 'b', 'c', 'd'],
      explain: 'Comece pelo mais simples e sem abrir nada (monitor, cabo, entrada). Depois, com segurança, reencaixe e confira a alimentação da placa. Por fim, compare com outros componentes. Formatar o disco não tem relação com o POST, e abrir a fonte é perigoso.',
      component: 'Placa de vídeo', procedure: 'Siga: monitor/cabo → desligar → reencaixar e alimentar a placa → testar alternativas.'
    },
    {
      id: 'o3', kind: 'order', topic: 'diag', sub: 'cpu', diag: true, spec: 'H', bios: 'award', needsBios: false,
      symptoms: 'Um computador com BIOS Award liga, emite bipes agudos repetidos e desliga sozinho.',
      question: 'Escolha os procedimentos corretos, na ordem em que devem ser executados.',
      steps: [
        { id: 'a', text: 'Desligar e desconectar o computador, aguardando o resfriamento' },
        { id: 'b', text: 'Verificar se o cooler está bem fixado e se a ventoinha gira' },
        { id: 'c', text: 'Limpar a poeira do dissipador e das ventoinhas' },
        { id: 'd', text: 'Verificar o estado da pasta térmica e substituir, se necessário' },
        { id: 'e', text: 'Religar e monitorar a temperatura na BIOS' },
        { id: 'x', text: 'Continuar ligando e desligando para ver se melhora', wrong: true },
        { id: 'y', text: 'Remover o cooler com o computador ligado', wrong: true }
      ],
      order: ['a', 'b', 'c', 'd', 'e'],
      explain: 'Superaquecimento exige interromper o uso, inspecionar a refrigeração, limpar, renovar a pasta térmica e só então religar monitorando a temperatura. Insistir em ligar pode danificar o processador.',
      component: 'Processador / cooler', procedure: 'Siga: desligar → cooler → limpar → pasta térmica → religar e monitorar.'
    },
    {
      id: 'o4', kind: 'order', topic: 'diag', sub: 'psu', diag: true, spec: '0', bios: null, needsBios: false,
      symptoms: 'Um computador não dá nenhum sinal de vida ao apertar o botão Power: sem luzes, sem ventoinhas, sem bipes.',
      question: 'Escolha os procedimentos corretos, na ordem em que devem ser executados.',
      steps: [
        { id: 'a', text: 'Verificar a tomada, o cabo de energia e a chave da fonte' },
        { id: 'b', text: 'Conferir os conectores ATX 24 pinos e EPS na placa-mãe, com o PC desconectado' },
        { id: 'c', text: 'Testar com outra fonte compatível ou com testador de fontes' },
        { id: 'd', text: 'Testar o botão Power e o cabo do painel frontal' },
        { id: 'x', text: 'Abrir a carcaça da fonte para procurar o defeito', wrong: true },
        { id: 'y', text: 'Reinstalar o sistema operacional', wrong: true }
      ],
      order: ['a', 'b', 'd', 'c'],
      explain: 'Sem nenhum sinal de vida, comece pelo básico: energia na tomada. Depois, confira conectores e o botão Power, e por último teste a fonte com um testador ou outra fonte. Nunca abra a fonte, e reinstalar o sistema não resolve falta de energia.',
      component: 'Fonte de alimentação', procedure: 'Siga: tomada/cabo → conectores → botão Power → teste da fonte.'
    },
    {
      id: 'o5', kind: 'order', topic: 'diag', sub: 'bios', diag: true, spec: 'SSSSS', bios: 'dell', needsBios: false,
      symptoms: 'Um computador Dell emite 5 bipes e perde a data e a hora toda vez que é desligado da tomada.',
      question: 'Escolha os procedimentos corretos, na ordem em que devem ser executados.',
      steps: [
        { id: 'a', text: 'Desligar e desconectar o computador' },
        { id: 'b', text: 'Localizar a bateria CMOS na placa-mãe e medir a tensão (cerca de 3 V)' },
        { id: 'c', text: 'Substituir a bateria CR2032 por uma nova' },
        { id: 'd', text: 'Reconfigurar data, hora e opções da BIOS' },
        { id: 'x', text: 'Trocar a placa de vídeo', wrong: true },
        { id: 'y', text: 'Trocar a fonte de alimentação sem testar', wrong: true }
      ],
      order: ['a', 'b', 'c', 'd'],
      explain: 'A bateria CMOS mantém data, hora e configurações. O procedimento é medir antes de trocar, substituir e então reconfigurar a BIOS.',
      component: 'Bateria CMOS', procedure: 'Siga: desligar → medir → trocar CR2032 → reconfigurar.'
    }
  ];

  /* ---------- Módulo 7: Quiz (pool > 20) ---------- */
  const T = true, F = false;
  D.quiz = [
    { type: 'mc', topic: 'post', q: 'O que significa a sigla POST?', options: ['Power-On Self-Test', 'Primary Operating System Tool', 'Program Output Status Table', 'Power Off Safe Transfer'], answer: 0, explain: 'POST significa Power-On Self-Test, o autoteste executado ao ligar o computador.' },
    { type: 'mc', topic: 'post', q: 'Em que momento o POST é executado?', options: ['Logo após ligar, antes de carregar o sistema operacional', 'Somente depois de abrir o Windows', 'Apenas quando o usuário solicita', 'Somente ao instalar um programa'], answer: 0, explain: 'O POST é executado pelo firmware logo depois que o computador recebe energia, antes de o sistema operacional ser carregado.' },
    { type: 'tf', topic: 'post', q: 'O POST é executado pelo firmware (BIOS/UEFI) e verifica componentes essenciais como CPU, RAM e vídeo.', answer: T, explain: 'Verdadeiro. O firmware testa CPU, memória, vídeo e outros dispositivos essenciais antes de iniciar o sistema.' },
    { type: 'mc', topic: 'beeps', q: 'Qual é a função do alto-falante interno (PC Speaker)?', options: ['Emitir bipes de diagnóstico do POST', 'Reproduzir músicas e vídeos', 'Amplificar o microfone', 'Resfriar a placa de vídeo'], answer: 0, explain: 'O PC Speaker é um buzzer simples usado pelo firmware para emitir bipes de diagnóstico, mesmo sem vídeo.' },
    { type: 'tf', topic: 'beeps', q: 'Todos os fabricantes de BIOS usam exatamente os mesmos códigos de bipes.', answer: F, explain: 'Falso. Os códigos variam conforme o fabricante, o modelo e a versão do firmware.' },
    { type: 'seq', topic: 'beeps', q: 'Ouça a sequência sonora e escolha a representação correta.', spec: 'SSS', pool: ['S', 'SS', 'SSS', 'LS'], explain: 'Foram três bipes curtos seguidos.' },
    { type: 'seq', topic: 'beeps', q: 'Ouça o som e identifique a sequência.', spec: 'LSS', pool: ['LLS', 'LSS', 'SSL', 'SSS'], explain: 'Foram um bip longo seguido de dois curtos.' },
    { type: 'seq', topic: 'beeps', q: 'Ouça o padrão sonoro e selecione a representação correspondente.', spec: 'LS', pool: ['LS', 'SL', 'SS', 'LSS'], explain: 'Foi emitido um bip longo seguido de um bip curto (padrão clássico de placa-mãe na tabela IBM).' },
    { type: 'match', topic: 'codes', sub: 'bios', q: 'Associe cada código AMI ao componente mais provavelmente envolvido.', items: [{ label: '5 bipes curtos', spec: 'SSSSS', ans: 'cpu' }, { label: '1 longo + 2 curtos', spec: 'LSS', ans: 'gpu' }, { label: '10 bipes curtos', spec: 'SSSSSSSSSS', ans: 'bios' }, { label: '3 bipes curtos', spec: 'SSS', ans: 'ram' }], opts: ['ram', 'cpu', 'gpu', 'mobo', 'bios', 'psu'], explain: 'AMI: 5 curtos = processador; 1 longo + 2 curtos = vídeo; 10 curtos = memória CMOS (BIOS/CMOS); 3 curtos = RAM de base 64 K.' },
    { type: 'match', topic: 'codes', sub: 'bios', q: 'Associe cada código Dell ao componente envolvido.', items: [{ label: '2 bipes', spec: 'SS', ans: 'ram' }, { label: '5 bipes', spec: 'SSSSS', ans: 'bios' }, { label: '6 bipes', spec: 'SSSSSS', ans: 'gpu' }, { label: '7 bipes', spec: 'SSSSSSS', ans: 'cpu' }], opts: ['ram', 'cpu', 'gpu', 'mobo', 'bios', 'psu'], explain: 'Dell: 2 bipes = RAM não detectada; 5 = bateria CMOS; 6 = vídeo; 7 = processador.' },
    { type: 'match', topic: 'codes', sub: 'ram', q: 'Associe cada código Award ou IBM ao componente mais provável.', items: [{ label: 'Award: bipes repetidos', spec: 'R', ans: 'ram' }, { label: 'Award: alternando frequências', spec: 'A', ans: 'cpu' }, { label: 'IBM: bip contínuo', spec: 'C', ans: 'psu' }, { label: 'IBM: 1 longo + 1 curto', spec: 'LS', ans: 'mobo' }], opts: ['ram', 'cpu', 'gpu', 'mobo', 'bios', 'psu'], explain: 'Award: bipes repetidos = RAM; frequências alternadas = CPU. IBM: bip contínuo = alimentação/placa solta/curto; 1 longo + 1 curto = placa-mãe.' },
    { type: 'mc', topic: 'codes', sub: 'bios', q: 'Na tabela didática da AMI, 9 bipes curtos indicam:', options: ['Falha no checksum da ROM BIOS', 'Falha no teclado', 'Falha na ventoinha da CPU', 'Problema na memória de vídeo'], answer: 0, explain: 'Na AMI, 9 curtos = falha no checksum da ROM BIOS, ou seja, firmware possivelmente corrompido.' },
    { type: 'mc', topic: 'hardware', sub: 'ram', q: 'Ao suspeitar de falha na memória RAM, qual deve ser o primeiro cuidado?', options: ['Desligar e desconectar o computador da tomada', 'Retirar a memória com o PC ligado', 'Formatar o disco', 'Atualizar o sistema operacional'], answer: 0, explain: 'Antes de qualquer manipulação, desligue e desconecte o computador. Isso protege você e o equipamento.' },
    { type: 'case', topic: 'diag', sub: 'video', q: 'Estudo de caso: um PC com BIOS Award liga, as ventoinhas giram, mas o monitor fica sem sinal. O PC emite 1 bip longo e 2 curtos. Qual é a hipótese principal?', options: ['Erro de vídeo (placa de vídeo, cabo ou conexão)', 'Falha na bateria CMOS', 'Disco rígido sem sistema', 'Teclado desconectado'], answer: 0, explain: 'Na Award, 1 longo + 2 curtos indica erro de vídeo. Verifique cabo, monitor, encaixe e alimentação da placa.' },
    { type: 'case', topic: 'diag', sub: 'cpu', q: 'Estudo de caso: um computador Award liga, emite bipes agudos e desliga sozinho. O cooler está cheio de poeira. Qual é a melhor hipótese?', options: ['Superaquecimento do processador', 'Falha do teclado', 'Memória cache corrompida no HD', 'Monitor queimado'], answer: 0, explain: 'Bipes repetidos de alta frequência na Award apontam possível superaquecimento. A poeira no cooler reforça essa hipótese.' },
    { type: 'order', topic: 'diag', sub: 'ram', q: 'Ordene os procedimentos para diagnosticar uma suspeita de falha de RAM.', steps: [{ id: 'a', text: 'Desligar e desconectar o computador' }, { id: 'b', text: 'Verificar o encaixe dos módulos' }, { id: 'c', text: 'Testar um módulo por vez' }, { id: 'd', text: 'Testar outros slots compatíveis' }, { id: 'x', text: 'Trocar a fonte sem testar', wrong: true }], order: ['a', 'b', 'c', 'd'], explain: 'Segurança primeiro, depois encaixe, depois testes módulo a módulo e slot a slot.' },
    { type: 'tf', topic: 'safety', q: 'É seguro retirar módulos de memória enquanto o computador está ligado.', answer: F, explain: 'Falso. Nunca retire componentes com o computador energizado: há risco de danos e de choque.' },
    { type: 'mc', topic: 'safety', q: 'Por que utilizar uma pulseira antiestática (ESD) durante a manutenção?', options: ['Para evitar que a eletricidade estática danifique componentes', 'Para aumentar a velocidade do PC', 'Para aquecer a placa-mãe', 'Para limpar a poeira'], answer: 0, explain: 'A descarga eletrostática, imperceptível para nós, pode danificar chips e circuitos.' },
    { type: 'mc', topic: 'hardware', sub: 'bios', q: 'Qual é a principal função da bateria CMOS?', options: ['Manter data, hora e configurações da BIOS', 'Alimentar o monitor', 'Resfriar o processador', 'Carregar o sistema operacional'], answer: 0, explain: 'A bateria CR2032 mantém a memória CMOS, que guarda data, hora e configurações da BIOS.' },
    { type: 'mc', topic: 'hardware', sub: 'bios', q: 'Qual afirmação descreve corretamente a diferença entre BIOS e UEFI?', options: ['A UEFI é a evolução da BIOS, com interface gráfica, GPT e Secure Boot', 'A UEFI é um tipo de memória RAM', 'A BIOS só existe em notebooks', 'A UEFI substitui a fonte de alimentação'], answer: 0, explain: 'A UEFI é o firmware moderno, com suporte a discos GPT, Secure Boot e inicialização mais rápida.' },
    { type: 'tf', topic: 'safety', q: 'Um código de bipe, sozinho, comprova que um componente está queimado.', answer: F, explain: 'Falso. O bipe indica uma possível falha; o diagnóstico precisa ser confirmado por testes.' },
    { type: 'mc', topic: 'hardware', sub: 'psu', q: 'Todas as luzes e ventoinhas ligam, mas não há imagem nem bipes. O que isso sugere sobre a fonte?', options: ['Ela provavelmente está fornecendo energia; o problema pode estar em outro componente', 'A fonte com certeza está queimada', 'O monitor é a única causa possível', 'A BIOS é sempre a culpada'], answer: 0, explain: 'Se a máquina energiza, a fonte funciona ao menos parcialmente. Investigue RAM, CPU, vídeo e placa-mãe.' },
    { type: 'case', topic: 'diag', sub: 'psu', q: 'Estudo de caso: um PC IBM emite um bip contínuo. Qual hipótese é compatível com a tabela didática?', options: ['Falta de energia, placa solta ou curto-circuito', 'POST normal', 'Erro de teclado', 'Bateria CMOS descarregada'], answer: 0, explain: 'Na tabela IBM, bip contínuo = possível falta de energia, placa solta ou curto-circuito.' },
    { type: 'order', topic: 'diag', sub: 'video', q: 'Ordene os procedimentos para uma suspeita de falha de vídeo.', steps: [{ id: 'a', text: 'Conferir monitor, cabo e entrada de vídeo' }, { id: 'b', text: 'Desligar e desconectar o computador' }, { id: 'c', text: 'Reencaixar a placa de vídeo e conferir a alimentação' }, { id: 'd', text: 'Testar outra placa ou outro monitor' }, { id: 'x', text: 'Abrir a fonte para procurar o defeito', wrong: true }], order: ['a', 'b', 'c', 'd'], explain: 'Do mais simples ao mais específico, sempre com segurança.' },
    { type: 'tf', topic: 'codes', sub: 'bios', q: 'Na tabela IBM, 1 bip curto indica POST normal.', answer: T, explain: 'Verdadeiro. Em IBM, 1 bip curto sinaliza POST normal.' },
    { type: 'mc', topic: 'hardware', sub: 'cpu', q: 'Um cooler mal instalado pode causar:', options: ['Superaquecimento e desligamentos do computador', 'Aumento da memória RAM', 'Atualização automática da BIOS', 'Melhora na qualidade do vídeo'], answer: 0, explain: 'Sem contato correto com a CPU, o calor não é dissipado e o computador pode desligar para se proteger.' },
    { type: 'mc', topic: 'hardware', sub: 'video', q: 'Uma placa de vídeo potente não exibe imagem. Qual verificação é importante?', options: ['Conferir o cabo de alimentação auxiliar PCIe da placa', 'Trocar o teclado', 'Substituir o disco rígido', 'Reinstalar o navegador'], answer: 0, explain: 'Placas potentes exigem cabos de energia da fonte. Sem eles, podem não iniciar.' },
    { type: 'case', topic: 'diag', sub: 'bios', q: 'Estudo de caso: um computador Dell emite 5 bipes e a data volta sempre ao ano 2000. Qual componente verificar primeiro?', options: ['Bateria CMOS', 'Placa de vídeo', 'Memória RAM', 'Teclado'], answer: 0, explain: 'Na tabela Dell, 5 bipes = falha na bateria CMOS. A data errada reforça a hipótese; meça e substitua a bateria.' },
    { type: 'order', topic: 'diag', sub: 'cpu', q: 'Ordene os procedimentos para investigar um computador que emite bipes agudos e desliga por superaquecimento.', steps: [{ id: 'a', text: 'Desligar, desconectar da tomada e aguardar resfriar' }, { id: 'b', text: 'Verificar fixação do cooler e giro da ventoinha' }, { id: 'c', text: 'Limpar a poeira e renovar a pasta térmica se necessário' }, { id: 'd', text: 'Religar e acompanhar a temperatura na BIOS' }, { id: 'x', text: 'Retirar o cooler com o PC ligado', wrong: true }], order: ['a', 'b', 'c', 'd'], explain: 'Com segurança, verifique a fixação e limpeza do sistema de refrigeração antes de religar e monitorar a temperatura.' },
    { type: 'mc', topic: 'beeps', q: 'Qual é a diferença entre bip curto e bip longo?', options: ['A duração do som', 'A cor do LED', 'O volume do monitor', 'O tipo de disco'], answer: 0, explain: 'A diferença está na duração: o bip longo dura cerca de três vezes mais que o curto.' }
  ];

  D.topicInfo = {
    post: { label: 'POST', module: 'm1', moduleName: '01 · Conhecendo o POST' },
    beeps: { label: 'Bipes', module: 'm2', moduleName: '02 · Códigos de bipes' },
    codes: { label: 'Fabricantes', module: 'm3', moduleName: '03 · BIOS e fabricantes' },
    hardware: { label: 'Hardware', module: 'm4', moduleName: '04 · Componentes e falhas' },
    diag: { label: 'Diagnóstico', module: 'm5', moduleName: '05 · Laboratório de simulação' },
    safety: { label: 'Segurança', module: 'safety', moduleName: 'Protocolo de segurança' }
  };

  /* ---------- Segurança ---------- */
  D.safety = [
    { icon: 'power-off', title: 'Desligar o computador', text: 'Encerre o sistema operacional e desligue o equipamento antes de iniciar qualquer abertura de gabinete.' },
    { icon: 'plug-zap', title: 'Desconectar o cabo de alimentação', text: 'Remova o cabo da rede elétrica. A placa-mãe permanece parcialmente energizada (5V Standby) enquanto conectada à tomada.' },
    { icon: 'zap-off', title: 'Descarregar eletricidade estática', text: 'Toque no chassi metálico desenergizado antes de manusear módulos ou placas e evite superfícies que acumulem carga.' },
    { icon: 'shield-check', title: 'Utilizar proteção ESD', text: 'Pulseira e manta antiestáticas dissipam cargas eletrostáticas capazes de degradar circuitos integrados CMOS.' },
    { icon: 'alert-triangle', title: 'Nunca remover peças com o sistema energizado', text: 'Desconectar memórias, placas de expansão ou cabos sob tensão provoca curtos-circuitos e danos irreversíveis.' },
    { icon: 'hand', title: 'Respeitar o chanfro e a guia mecânica', text: 'Conectores e slots possuem orientação única. Diante de resistência anormal, revise o alinhamento antes de pressionar.' },
    { icon: 'layers', title: 'Confirmar compatibilidade técnica', text: 'Verifique geração DDR, soquete, lista de suporte da versão de BIOS e capacidade real da fonte de alimentação.' },
    { icon: 'ban', title: 'Jamais abrir a fonte de alimentação', text: 'Capacitores primários retêm alta tensão mesmo após a desconexão da tomada. Fontes defeituosas devem ser substituídas.' },
    { icon: 'search', title: 'Não condenar peças apenas pelo código sonoro', text: 'O bipe aponta um subsistema suspeito, não um laudo definitivo. Isole a causa por reencaixe, limpeza e teste cruzado.' }
  ];

  PBL.data = D;
})();

