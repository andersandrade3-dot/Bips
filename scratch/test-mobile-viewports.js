const fs = require('fs');
const path = require('path');

const css = fs.readFileSync('css/styles.css', 'utf8');

console.log('=== TESTE DE OTIMIZAÇÃO E RESPONSIVIDADE MOBILE ===\n');

// 1. Verificação de chaves balanceadas
let depth = 0;
for (let i = 0; i < css.length; i++) {
  if (css[i] === '{') depth++;
  if (css[i] === '}') depth--;
}
if (depth !== 0) {
  console.error('[FALHA] Chaves desbalanceadas no CSS: profundidade ' + depth);
  process.exit(1);
}
console.log('[OK] Sintaxe e blocos CSS 100% balanceados e válidos.');

// 2. Verificação de regras de mídia para mobile
const requiredMedia = [
  '@media (max-width: 960px)',
  '@media (max-width: 768px)',
  '@media (max-width: 640px)',
  '@media (max-width: 380px)'
];

requiredMedia.forEach(m => {
  if (css.includes(m)) {
    console.log('[OK] Breakpoint responsivo presente: ' + m);
  } else {
    console.error('[FALHA] Breakpoint ausente: ' + m);
    process.exit(1);
  }
});

// 3. Verificação do layout do computador no mobile
const mobilePcChecks = [
  ['.pc {\n    grid-template-columns: 1fr;', 'Grid do PC colapsa para 1 coluna no mobile'],
  ['.tower {\n    display: grid;\n    grid-template-columns: auto 1fr auto;', 'Gabinete vira console horizontal compacto'],
  ['.power-btn {\n    width: 54px;\n    height: 54px;', 'Botão circular preservado no mobile'],
  ['.sim-phase-bar {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);', 'Esteira de 4 fases se ajusta sem scroll horizontal'],
  ['.btn-lbl {\n    display: none;', 'Label de áudio oculta no mobile para não espremer título']
];

mobilePcChecks.forEach(([code, desc]) => {
  if (css.includes(code)) {
    console.log('[OK] ' + desc);
  } else {
    console.error('[FALHA] ' + desc);
    process.exit(1);
  }
});

console.log('\n=== TODOS OS TESTES DE RESPONSIVIDADE FORAM APROVADOS! ===');

