const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
console.log('=== VERIFICAÇÃO DO SIMULADOR E REQUISITOS v3 ===\n');

// 1. Sintaxe de todos os arquivos JS
const jsFiles = [
  'js/data.js',
  'js/audio.js',
  'js/store.js',
  'js/ui.js',
  'js/boards.js',
  'js/views-learn.js',
  'js/views-practice.js',
  'js/views-tools.js',
  'js/app.js'
];

jsFiles.forEach((rel) => {
  const p = path.join(baseDir, rel);
  const code = fs.readFileSync(p, 'utf8');
  try {
    new vm.Script(code, { filename: rel });
    console.log('[OK] Sintaxe JS: ' + rel);
  } catch (err) {
    console.error('[ERRO] Falha de sintaxe em ' + rel + ':', err);
    process.exit(1);
  }
});

// 2. Verificação de zero emojis (permitindo apenas caracteres normais e pontuação básica)
const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const allFiles = jsFiles.concat(['index.html', 'css/styles.css']);
let emojiFound = false;

allFiles.forEach((rel) => {
  const p = path.join(baseDir, rel);
  const text = fs.readFileSync(p, 'utf8');
  const match = text.match(emojiRegex);
  if (match) {
    console.error('[FALHA] Emoji detectado em ' + rel + ': ' + match[0]);
    emojiFound = true;
  }
});
if (!emojiFound) {
  console.log('[OK] Verificação de zero emojis: 100% limpo em todos os arquivos.');
} else {
  process.exit(1);
}

// 3. Verificação do layout do computador no simulador (Módulo 5)
const practiceCode = fs.readFileSync(path.join(baseDir, 'js/views-practice.js'), 'utf8');
const requiredElements = [
  'pc-desk',
  'monitor',
  'mon-frame',
  'crt',
  'stand',
  'stand-base',
  'tower',
  'tw-top',
  'led-pwr',
  'led-hdd',
  'sim-spk',
  'wv w1',
  'tw-bays',
  'tw-vents',
  'power-btn',
  'sim-power',
  'sim-phase-bar',
  'pstep-1',
  'pstep-2',
  'pstep-3',
  'pstep-4'
];

requiredElements.forEach((el) => {
  if (!practiceCode.includes(el)) {
    console.error('[FALHA] Elemento do computador ou da barra de fases ausente em views-practice.js: ' + el);
    process.exit(1);
  }
});
console.log('[OK] Elementos do computador realista e da esteira de fases confirmados em views-practice.js.');

// 4. Verificação de regras CSS no styles.css
const cssText = fs.readFileSync(path.join(baseDir, 'css/styles.css'), 'utf8');
const cssSelectors = [
  '.sim-phase-bar',
  '.p-step.locked',
  '.p-step.active',
  '.p-step.done',
  '.pc-desk',
  '.pc',
  '.monitor',
  '.mon-frame',
  '.stand',
  '.stand-base',
  '.tower',
  '.spk-box.is-beeping',
  '.power-btn',
  '.power-btn.on',
  '.snav-card.locked',
  '.snav-card.unlocked'
];

cssSelectors.forEach((sel) => {
  if (!cssText.includes(sel)) {
    console.error('[FALHA] Seletor CSS ausente em styles.css: ' + sel);
    process.exit(1);
  }
});
console.log('[OK] Todos os estilos do computador, animações e fases confirmados em styles.css.');

console.log('\n=== TODAS AS VERIFICAÇÕES FORAM CONCLUÍDAS COM SUCESSO! ===');

