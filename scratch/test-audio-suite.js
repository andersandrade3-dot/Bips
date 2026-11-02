const fs = require('fs');

console.log('=== TESTE DE AUDIO MULTIPLATAFORMA (ANDROID / DESKTOP / IOS) ===');

// Test 1: iOS Simulator Environment
{
  const mockWindow = {
    PBL: {},
    navigator: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      audioSession: { type: 'ambient' }
    }
  };

  class MockAudio {
    constructor() {
      this.src = '';
      this.volume = 1;
      this.currentTime = 0;
      this.events = {};
    }
    setAttribute(k, v) {}
    play() {
      return Promise.resolve();
    }
    pause() {}
  }

  const mockDoc = {
    addEventListener: (evt, fn) => {},
    removeEventListener: (evt, fn) => {},
    querySelectorAll: () => []
  };

  // Mock global Blob and URL for node environment
  global.Blob = class {
    constructor(parts, opts) { this.parts = parts; this.type = opts ? opts.type : ''; }
  };
  global.URL = {
    createObjectURL: (blob) => 'blob:mock-url-' + Math.random(),
    revokeObjectURL: (url) => {}
  };
  global.Audio = MockAudio;

  const code = fs.readFileSync('scratch/test-audio-new.js', 'utf8');
  new Function('window', 'document', 'navigator', code)(mockWindow, mockDoc, mockWindow.navigator);

  const A = mockWindow.PBL.audio;
  if (!A) throw new Error('Audio object not created in iOS context');

  console.log('[OK] audioSession configurado para:', mockWindow.navigator.audioSession.type);
  if (mockWindow.navigator.audioSession.type !== 'playback') {
    throw new Error('Falha ao configurar audioSession.type para playback');
  }

  // Test play in iOS
  const total = A.play('LSS');
  console.log('[OK] A.play(\"LSS\") gerado no iOS com duração:', total.toFixed(2), 'segundos');

  A.sfx('power');
  console.log('[OK] A.sfx(\"power\") executado com sucesso no iOS');

  A.stop();
  console.log('[OK] A.stop() executado com sucesso no iOS');
}

// Test 2: Android / Desktop WebAudio Environment
{
  class MockOscillator {
    constructor() {
      this.frequency = { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
      this.type = 'square';
    }
    connect() {}
    start() {}
    stop() {}
  }

  class MockGain {
    constructor() {
      this.gain = { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
    }
    connect() {}
  }

  class MockDynamicsCompressor {
    constructor() {
      this.threshold = { setValueAtTime: () => {} };
      this.knee = { setValueAtTime: () => {} };
      this.ratio = { setValueAtTime: () => {} };
      this.attack = { setValueAtTime: () => {} };
      this.release = { setValueAtTime: () => {} };
    }
    connect() {}
  }

  class MockAudioContext {
    constructor() {
      this.currentTime = 0.5;
      this.state = 'running';
      this.destination = {};
    }
    createOscillator() { return new MockOscillator(); }
    createGain() { return new MockGain(); }
    createDynamicsCompressor() { return new MockDynamicsCompressor(); }
    createBiquadFilter() { return { frequency: { setValueAtTime: () => {} }, type: 'lowpass', connect: () => {} }; }
    createBuffer() { return {}; }
    createBufferSource() { return { connect: () => {}, start: () => {} }; }
    resume() { return Promise.resolve(); }
  }

  const mockWindow = {
    PBL: {},
    AudioContext: MockAudioContext,
    navigator: {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      platform: 'Linux armv8l'
    }
  };

  const mockDoc = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => []
  };

  const code = fs.readFileSync('scratch/test-audio-new.js', 'utf8');
  new Function('window', 'document', 'navigator', code)(mockWindow, mockDoc, mockWindow.navigator);

  const A = mockWindow.PBL.audio;
  const total = A.play('SSS');
  console.log('[OK] A.play(\"SSS\") executado no Android via WebAudio com duração:', total.toFixed(2), 'segundos');
  A.sfx('ok');
  console.log('[OK] A.sfx(\"ok\") executado no Android com sucesso');
}

console.log('=== TODOS OS TESTES DE SIMULAÇÃO DE ÁUDIO FORAM APROVADOS COM SUCESSO! ===');

