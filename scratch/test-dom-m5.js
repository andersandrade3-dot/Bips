const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');

// Ambiente DOM simulado
const listeners = {};
const elements = {};

class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
      add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      },
      contains: (c) => this.classList._classes.has(c)
    };
    this.children = [];
    this.innerHTML = '';
    this.style = {};
    this.attributes = {};
    this.eventListeners = {};
  }
  addEventListener(event, fn) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(f => f !== fn);
    }
  }
  click() {
    (this.eventListeners['click'] || []).forEach(fn => fn({ target: this, preventDefault() { }, closest: () => null }));
  }
  querySelector(sel) {
    return mockQuery(this, sel);
  }
  querySelectorAll(sel) {
    return mockQueryAll(this, sel);
  }
}

function mockQuery(root, sel) {
  if (sel.startsWith('#')) {
    const id = sel.slice(1);
    if (root.id === id) return root;
    for (const ch of root.children) {
      const res = mockQuery(ch, sel);
      if (res) return res;
    }
  }
  return null;
}
function mockQueryAll() { return []; }

console.log('[TESTE DOM] Inicializando simulação de execução de Módulo 5...');

// Leitura dos scripts
const dataCode = fs.readFileSync(path.join(baseDir, 'js/data.js'), 'utf8');
const audioCode = fs.readFileSync(path.join(baseDir, 'js/audio.js'), 'utf8');
const storeCode = fs.readFileSync(path.join(baseDir, 'js/store.js'), 'utf8');
const uiCode = fs.readFileSync(path.join(baseDir, 'js/ui.js'), 'utf8');
const boardsCode = fs.readFileSync(path.join(baseDir, 'js/boards.js'), 'utf8');
const learnCode = fs.readFileSync(path.join(baseDir, 'js/views-learn.js'), 'utf8');
const practiceCode = fs.readFileSync(path.join(baseDir, 'js/views-practice.js'), 'utf8');

const ctx = {
  window: {},
  document: {
    documentElement: { dataset: {} },
    createElement: (tag) => new MockElement(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => { }
  },
  localStorage: { getItem: () => null, setItem: () => { } },
  sessionStorage: { getItem: () => null, setItem: () => { } },
  location: { hash: '#/m5', search: '' },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  PBL: {}
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(dataCode, ctx);
vm.runInContext(audioCode, ctx);
vm.runInContext(storeCode, ctx);
vm.runInContext(uiCode, ctx);
vm.runInContext(boardsCode, ctx);
vm.runInContext(learnCode, ctx);
vm.runInContext(practiceCode, ctx);

console.log('[OK] Módulos carregados no contexto virtual.');
if (ctx.PBL.views && ctx.PBL.views.m5) {
  console.log('[OK] View V.m5 presente com título: ' + ctx.PBL.views.m5.title);

  // Testar montagem da renderização
  const rootMock = new MockElement('main', 'view');
  ctx.document.querySelector = (sel) => {
    const id = sel.replace(/^#/, '');
    return new MockElement('div', id);
  };
  ctx.PBL.views.m5.render(rootMock);

  const html = rootMock.innerHTML;
  const assertions = [
    ['sim-phase-bar', 'Barra de esteira de fases'],
    ['Fase 1 · Energização', 'Etapa 1'],
    ['Fase 2 · Autoteste POST', 'Etapa 2'],
    ['Fase 3 · Firmware', 'Etapa 3'],
    ['Fase 4 · Diagnóstico', 'Etapa 4'],
    ['pc-desk', 'Mesa de bancada'],
    ['monitor', 'Monitor de mesa'],
    ['mon-frame', 'Moldura do monitor'],
    ['mon-led', 'LED do monitor'],
    ['stand', 'Pedestal do monitor'],
    ['tower', 'Gabinete Torre'],
    ['led-pwr', 'LED de energia PWR'],
    ['led-hdd', 'LED do disco HDD'],
    ['spk-box', 'PC Speaker'],
    ['wv w1', 'Ondas acústicas do transdutor'],
    ['tw-bays', 'Baias ópticas'],
    ['tw-vents', 'Aletas de ventilação'],
    ['power-btn', 'Botão mecânico circular POWER']
  ];

  let allGood = true;
  assertions.forEach(([frag, label]) => {
    if (html.includes(frag)) {
      console.log('  + ' + label + ': OK');
    } else {
      console.error('  - FALHA: ' + label + ' (' + frag + ')');
      allGood = false;
    }
  });

  if (allGood) {
    console.log('\n[SUCESSO] O computador e todas as 4 fases sequenciais estão devidamente montados e integrados!');
  } else {
    process.exit(1);
  }
} else {
  console.error('[ERRO] View V.m5 não encontrada.');
  process.exit(1);
}