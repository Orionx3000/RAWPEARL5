// ─── ASCII DICTIONARY (expanded — 60+ synthesis types) ─────────────────
const ASCII_DICTIONARY = {
  // PUNCTUATION — each with unique envelope
  '.':{type:'pluck',wave:'sine',attack:0.001,decay:0.08,harmonics:0,filter:'none'},
  ',':{type:'tick',color:'white',attack:0.0005,decay:0.02,filter:'highpass'},
  '-':{type:'drone',wave:'sine',attack:0.3,decay:0.8,harmonics:0.1,filter:'none'},
  '_':{type:'sub',wave:'sine',attack:0.5,decay:2.0,harmonics:0,filter:'lowpass',subBass:true},
  "'":{type:'blip',wave:'sine',attack:0.001,decay:0.03,harmonics:0,filter:'none'},
  ':':{type:'pad',wave:'pulse',attack:0.2,decay:1.0,width:0.6,harmonics:0.3,filter:'lowpass'},
  ';':{type:'staccato',wave:'triangle',attack:0.01,decay:0.15,harmonics:0.4,filter:'none'},
  '!':{type:'explosive',wave:'sawtooth',attack:0.002,decay:0.25,harmonics:0.8,filter:'highpass'},
  '?':{type:'samplehold',color:'white',filter:'bandpass',resonance:0.6,rate:30},
  '~':{type:'fmlfo',modIndex:2.0,harmonicRatio:0.5,attack:0.1,decay:0.5},
  '`':{type:'ping',wave:'sine',attack:0.001,decay:0.04,harmonics:0,freqMult:3.0},
  '^':{type:'riser',wave:'sawtooth',attack:0.001,decay:0.6,harmonics:0.5,sweepUp:true},
  '|':{type:'gateburst',wave:'pulse',attack:0.001,decay:0.05,width:0.05,harmonics:0.7},
  '*':{type:'noiseburst',color:'white',attack:0.002,decay:0.12,filter:'bandpass',resonance:0.3},
  '&':{type:'crunch',wave:'sawtooth',attack:0.01,decay:0.2,harmonics:1.5,distortion:0.9},
  '$':{type:'bitcrush',wave:'square',attack:0.02,decay:0.18,harmonics:2.0,crushBits:4},
  '+':{type:'ringmod',wave:'sine',attack:0.01,decay:0.35,harmonics:1.0,modFreq:880},
  '=':{type:'sustain',action:'tie'},
  '#':{type:'crash',color:'white',attack:0.001,decay:0.8,filter:'highpass',resonance:0.2},
  '@':{type:'sweepnoise',color:'pink',attack:0.05,decay:0.6,filter:'bandpass',resonance:0.8},
  '%':{type:'fmscream',modIndex:12.0,harmonicRatio:4.0,attack:0.001,decay:0.2},
  '>':{type:'faller',wave:'sawtooth',attack:0.01,decay:0.6,harmonics:0.5,sweepDown:true},
  '<':{type:'swell',wave:'sine',attack:0.6,decay:0.3,harmonics:0,filter:'lowpass'},

  // CORE OSCILLATORS — distinct wave architectures
  'O':{type:'squarewave',wave:'square',attack:0.02,decay:0.4,harmonics:0.8,filter:'none'},
  'X':{type:'sawcore',wave:'sawtooth',attack:0.01,decay:0.35,harmonics:1.2,filter:'none'},
  'V':{type:'trianglecore',wave:'triangle',attack:0.03,decay:0.5,harmonics:0.6,filter:'none'},
  'I':{type:'pulsethin',wave:'pulse',attack:0.01,decay:0.2,width:0.08,harmonics:0.9},
  'U':{type:'supersaw',detuneCount:7,detuneAmount:12,attack:0.05,decay:0.6,filter:'lowpass'},
  'Y':{type:'wavetable',morphAxis:0.5,attack:0.05,decay:0.4,filter:'none'},
  'Z':{type:'phasemod',modIndex:3.0,harmonicRatio:1.5,attack:0.02,decay:0.3},
  'J':{type:'dual',wave1:'sine',wave2:'triangle',detune:7,attack:0.02,decay:0.4},
  'T':{type:'sweepsaw',wave:'sawtooth',attack:0.02,decay:0.5,harmonics:1.0,sweepUp:true,filter:'lowpass'},
  'L':{type:'layered',wave1:'sawtooth',wave2:'pulse',detune:5,mix:0.6,attack:0.02,decay:0.35},

  // DENSE — chaos, noise, fm
  'W':{type:'fmmetal',modIndex:7.0,harmonicRatio:2.8,attack:0.002,decay:0.25},
  'M':{type:'distorted',wave:'sawtooth',attack:0.003,decay:0.12,harmonics:2.0,distortion:1.2},
  'Q':{type:'resonator',freq:440,q:20,attack:0.01,decay:0.5},

  // BLOCKS — granular continuum
  '█':{type:'granular',density:1.0,grainSize:0.12,spread:0.5,filter:'lowpass'},
  '▓':{type:'granular',density:0.8,grainSize:0.06,spread:0.4},
  '▒':{type:'granular',density:0.5,grainSize:0.025,spread:0.25,filter:'bandpass'},
  '░':{type:'granular',density:0.2,grainSize:0.012,spread:0.1},

  // NUMBERS — harmonic partials + filter character
  '0':{type:'subbass',wave:'sine',attack:0.15,decay:1.0,harmonics:0,filter:'lowpass'},
  '1':{type:'fundamental',wave:'sine',attack:0.05,decay:0.5,harmonics:1.0},
  '2':{type:'octave',wave:'sine',attack:0.05,decay:0.4,harmonics:2.0,filter:'bandpass'},
  '3':{type:'twelfth',wave:'pulse',attack:0.04,decay:0.35,width:0.4,harmonics:3.0},
  '4':{type:'doubleoctave',wave:'sine',attack:0.04,decay:0.3,harmonics:4.0,filter:'highpass'},
  '5':{type:'majorthird',wave:'triangle',attack:0.03,decay:0.28,harmonics:5.0},
  '6':{type:'sweet',wave:'triangle',attack:0.03,decay:0.25,harmonics:6.0},
  '7':{type:'dissonant',wave:'square',attack:0.02,decay:0.2,harmonics:7.0},
  '8':{type:'rich',wave:'sawtooth',attack:0.02,decay:0.15,harmonics:8.0},
  '9':{type:'denseharm',wave:'sawtooth',attack:0.01,decay:0.12,harmonics:9.0,filter:'highpass'},

  // PHYSICAL MODELS
  'H':{type:'string',material:'nylon',attack:0.002,decay:1.2,harmonics:0.3},
  'R':{type:'bell',material:'metal',attack:0.001,decay:1.8,strike:0.6},
  'K':{type:'kick',toneFreq:60,noiseMix:0.3,attack:0.001,decay:0.3},
  'S':{type:'snare',toneFreq:180,noiseMix:0.6,attack:0.001,decay:0.2},
  'C':{type:'clap',layers:5,attack:0.002,decay:0.15,filter:'highpass'},
  'B':{type:'bongo',toneFreq:220,attack:0.001,decay:0.08},
  'P':{type:'formant',vowel:'a',attack:0.02,decay:0.5,filter:'bandpass'},
  'E':{type:'formant',vowel:'e',attack:0.02,decay:0.5,filter:'bandpass'},
  'F':{type:'formant',vowel:'i',attack:0.02,decay:0.5,filter:'bandpass'},
  'G':{type:'formant',vowel:'o',attack:0.02,decay:0.5,filter:'bandpass'},
  'A':{type:'formant',vowel:'u',attack:0.02,decay:0.5,filter:'bandpass'},

  // HATS / CYMBALS
  'N':{type:'hat',color:'white',attack:0.001,decay:0.06,filter:'highpass'},
  'D':{type:'hatopen',color:'white',attack:0.001,decay:0.3,filter:'highpass'},
  'w':{type:'ride',color:'pink',attack:0.001,decay:0.6,filter:'bandpass'},

  // ENVELOPES / MODIFIERS
  '/':{type:'env',action:'ramp_up',target:'filter_cutoff'},
  '\\':{type:'env',action:'ramp_down',target:'filter_cutoff'},
  '(':{type:'env',action:'gate_open',target:'amplitude'},
  ')':{type:'env',action:'gate_close',target:'amplitude'},
  '[':{type:'loop',action:'start'},
  ']':{type:'loop',action:'end'},
  '{':{type:'block',action:'begin'},
  '}':{type:'block',action:'end'},

  // lowercase letters — softer/hybrid variants
  'a':{type:'softsine',wave:'sine',attack:0.05,decay:0.5,harmonics:0.1,filter:'lowpass'},
  'b':{type:'softpulse',wave:'pulse',attack:0.03,decay:0.4,width:0.3,harmonics:0.3},
  'c':{type:'softtriangle',wave:'triangle',attack:0.04,decay:0.45,harmonics:0.2},
  'd':{type:'softdual',wave1:'sine',wave2:'triangle',detune:3,attack:0.04,decay:0.5},
  'e':{type:'formantsoft',vowel:'e',attack:0.04,decay:0.6,filter:'bandpass'},
  'f':{type:'formantsoft',vowel:'i',attack:0.03,decay:0.5,filter:'bandpass'},
  'g':{type:'softgranular',density:0.15,grainSize:0.02,spread:0.15},
  'h':{type:'softstring',material:'nylon',attack:0.01,decay:1.0,harmonics:0.2},
  'i':{type:'softpulse',wave:'pulse',attack:0.02,decay:0.25,width:0.15,harmonics:0.4},
  'j':{type:'softdual',wave1:'triangle',wave2:'sine',detune:2,attack:0.03,decay:0.35},
  'k':{type:'kicksoft',toneFreq:50,noiseMix:0.15,attack:0.005,decay:0.4},
  'l':{type:'softsaw',wave:'sawtooth',attack:0.03,decay:0.3,harmonics:0.5,filter:'lowpass'},
  'm':{type:'softpad',wave:'pulse',attack:0.3,decay:1.5,width:0.5,harmonics:0.2,filter:'lowpass'},
  'n':{type:'softnoise',color:'white',attack:0.02,decay:0.3,filter:'bandpass',resonance:0.2},
  'o':{type:'softsquare',wave:'square',attack:0.04,decay:0.4,harmonics:0.5,filter:'lowpass'},
  'p':{type:'softpluck',wave:'triangle',attack:0.002,decay:0.12,harmonics:0.3},
  'q':{type:'softresonator',freq:330,q:10,attack:0.05,decay:0.6},
  'r':{type:'softbell',material:'glass',attack:0.005,decay:1.2,strike:0.3},
  's':{type:'softsnare',toneFreq:150,noiseMix:0.4,attack:0.003,decay:0.25},
  't':{type:'softsweep',wave:'triangle',attack:0.04,decay:0.5,harmonics:0.3,sweepUp:true},
  'u':{type:'softsupersaw',detuneCount:5,detuneAmount:8,attack:0.08,decay:0.8,filter:'lowpass'},
  'v':{type:'softtriangle',wave:'triangle',attack:0.04,decay:0.5,harmonics:0.4},
  'w':{type:'ride',color:'pink',attack:0.001,decay:0.6,filter:'bandpass'},
  'x':{type:'softsaw',wave:'sawtooth',attack:0.03,decay:0.4,harmonics:0.6},
  'y':{type:'softwavetable',morphAxis:0.3,attack:0.08,decay:0.6,filter:'none'},
  'z':{type:'softphase',modIndex:1.5,harmonicRatio:1.2,attack:0.05,decay:0.5},
};

// ─── COMPILER ─────────────────────────────────────────────────────────
function compileLinearSequence(trackString, bpm, stepsPerBeat) {
  bpm = bpm || 120;
  stepsPerBeat = stepsPerBeat || 4;
  const stepDuration = (60 / bpm) / stepsPerBeat;
  const sequence = [];
  const chars = trackString.split('');
  let currentTime = 0.0;
  chars.forEach((char, index) => {
    if (char === ' ' || char === '') { currentTime += stepDuration; return; }
    const dspData = ASCII_DICTIONARY[char];
    if (dspData) sequence.push({ time:currentTime, stepIndex:index, character:char, instructions:dspData });
    currentTime += stepDuration;
  });
  return sequence;
}

function compileMatrixBlock(layerArray, bpm, stepsPerBeat) {
  bpm = bpm || 120; stepsPerBeat = stepsPerBeat || 4;
  const stepDuration = (60 / bpm) / stepsPerBeat;
  const sequence = [];
  const maxLen = layerArray.reduce((m, l) => Math.max(m, (l && l.length) || 0), 0);
  if (maxLen === 0) return sequence;
  for (let step = 0; step < maxLen; step++) {
    const time = step * stepDuration;
    const stepEvents = [];
    for (let ly = 0; ly < 3; ly++) {
      const ch = (layerArray[ly] && layerArray[ly][step]) || ' ';
      if (ch !== ' ') stepEvents.push({ layer:['top','mid','bottom'][ly], instructions:getInstructionForChar(ch), char:ch });
    }
    if (stepEvents.length > 0) sequence.push({ time, stepIndex:step, events:stepEvents });
  }
  return sequence;
}

function getInstructionForChar(ch) {
  if (ASCII_DICTIONARY[ch]) return ASCII_DICTIONARY[ch];
  if (ch >= 'A' && ch <= 'Z') return { type:'oscfallback', wave:'sawtooth', attack:0.03+Math.random()*0.04, decay:0.2+Math.random()*0.3, harmonics:0.5+Math.random()*1.5 };
  if (ch >= 'a' && ch <= 'z') return { type:'oscfallback', wave:'triangle', attack:0.04+Math.random()*0.05, decay:0.3+Math.random()*0.3, harmonics:0.3+Math.random()*0.8 };
  if (ch >= '0' && ch <= '9') return { type:'oscfallback', wave:'sine', attack:0.05, decay:0.4, harmonics:parseInt(ch)||1 };
  return { type:'oscfallback', wave:'sine', attack:0.05, decay:0.3, harmonics:0.2 };
}

function compileNodePattern(node, bpm) {
  if (!node.pattern || node.pattern.length < 3) return [];
  return compileMatrixBlock(node.pattern, bpm || node.bpm || 120, 4);
}

// ─── DENSITY CALCULATOR ───────────────────────────────────────────────
let _densityCanvas = null, _densityCtx = null;
function ensureDensityCanvas() {
  if (!_densityCanvas) {
    _densityCanvas = document.createElement('canvas');
    _densityCanvas.width = 50; _densityCanvas.height = 50;
    _densityCanvas.style.display = 'none';
    document.body.appendChild(_densityCanvas);
    _densityCtx = _densityCanvas.getContext('2d', { willReadFrequently: true });
  }
  return _densityCtx;
}
function calculateDensity(char) {
  try {
    const ctx = ensureDensityCanvas();
    ctx.clearRect(0, 0, 50, 50);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '30px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(char, 25, 25);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    let filled = 0;
    for (let i = 0; i < data.length; i += 4) { if (data[i] > 128) filled++; }
    return Math.min(filled / 250 * 100, 99.9);
  } catch(e) { return 0; }
}
const DENSITY_RANGES = [
  { max:5,    cls:'VOID',         color:'#4444ff', desc:'Pure sine wave or deep sub-bass.' },
  { max:15,   cls:'ARCHITECTURE', color:'#44aaff', desc:'Structural control / routing.' },
  { max:30,   cls:'CORE OSC',     color:'#44ff44', desc:'Triangle, Square, geometric waves.' },
  { max:45,   cls:'MATRIX',       color:'#aaff44', desc:'Micro-sequencer / polyrhythms.' },
  { max:75,   cls:'CHAOS',        color:'#ff8800', desc:'FM, noise, distortion, resonance.' },
  { max:100,  cls:'MONOLITH',     color:'#ff2222', desc:'Granular synthesis wall.' }
];
function getDensityMapping(density) {
  for (const r of DENSITY_RANGES) if (density <= r.max) return r;
  return DENSITY_RANGES[DENSITY_RANGES.length - 1];
}

// ─── WEB AUDIO PLAYER ─────────────────────────────────────────────────
const BASE_FREQ = 65.41;
function charToPitch(char, stepIndex, rootMidi, scaleIntervals) {
  if (!scaleIntervals || scaleIntervals.length === 0) return BASE_FREQ;
  const noteIndex = (char ? char.charCodeAt(0) : 0) % scaleIntervals.length;
  const octave = Math.floor(stepIndex / 12);
  const semitone = rootMidi + scaleIntervals[noteIndex] + octave * 12;
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

function createNoiseBuffer(ctx, color) {
  const sr = ctx.sampleRate;
  const len = sr * 0.5;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  if (color === 'pink') {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < len; i++) {
      const w = data[i];
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520;
      b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
    }
  }
  return buf;
}

function makeDistortionCurve(k) {
  const samples = 256;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) { const x = (i * 2) / samples - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  return curve;
}

class AsciiPlayer {
  constructor() {
    this.ctx = null;
    this.scheduled = [];
    this.startTime = 0;
    this.playing = false;
    this.currentStep = 0;
    this.totalSteps = 16;
    this.onStep = null;
    this.intervalId = null;
    this.rootMidi = 48;
    this.scaleIntervals = [0,2,4,5,7,9,11];
  }

  ensureContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  play(compiledEvents, bpm) {
    this.stop();
    this.ensureContext();
    this.playing = true;
    this.startTime = this.ctx.currentTime + 0.05;
    this.totalSteps = compiledEvents.length > 0 ? compiledEvents[compiledEvents.length-1].stepIndex + 1 : 0;
    compiledEvents.forEach(evt => {
      if (evt.character && evt.instructions) this.scheduleChar(evt.character, evt.instructions, evt.time);
      else if (evt.events) evt.events.forEach(e => this.scheduleChar(e.char, e.instructions, evt.time));
    });
    const stepTime = (60 / bpm) / 4;
    this.currentStep = 0;
    if (this.onStep) this.onStep(0);
    this.intervalId = setInterval(() => {
      if (!this.playing) return;
      const elapsed = this.ctx.currentTime - this.startTime;
      const newStep = Math.floor(elapsed / stepTime);
      if (newStep !== this.currentStep && newStep < this.totalSteps) { this.currentStep = newStep; if (this.onStep) this.onStep(newStep); }
      if (newStep >= this.totalSteps - 1) { this.currentStep = 0; if (this.onStep) this.onStep(0); }
    }, 50);
  }

  _getFreq(char) { return charToPitch(char, 0, this.rootMidi, this.scaleIntervals); }
  _makeADSR(t, attack, decay, amp) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp||0.3, t + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);
    return g;
  }
  _connectChain(src, inst, t, dest) {
    let chain = src;
    if (inst.distortion) {
      const s = this.ctx.createWaveShaper(); s.curve = makeDistortionCurve(inst.distortion * 40);
      chain.connect(s); chain = s;
    }
    if (inst.filter && inst.filter !== 'none') {
      const f = this.ctx.createBiquadFilter(); f.type = inst.filter;
      f.frequency.setValueAtTime(inst.filter==='lowpass'?200:inst.filter==='highpass'?3000:1500, t);
      if (inst.resonance) f.Q.setValueAtTime(inst.resonance * 10, t);
      chain.connect(f); chain = f;
    }
    chain.connect(dest);
    dest.connect(this.ctx.destination);
  }

  scheduleChar(char, inst, time) {
    const ctx = this.ctx, t = this.startTime + time;
    const attack = inst.attack || 0.01, decay = inst.decay || 0.1;
    const freq = this._getFreq(char);

    // ---- PLUCK ----
    if (inst.type === 'pluck') {
      const o = ctx.createOscillator(); o.type = inst.wave||'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.25);
      this._connectChain(o, inst, t, g); o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- TICK ----
    else if (inst.type === 'tick') {
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.02);
      this._connectChain(src, inst, t, g); src.start(t); src.stop(t+0.03); this.scheduled.push(src);
    }
    // ---- DRONE ----
    else if (inst.type === 'drone') {
      const o = ctx.createOscillator(); o.type = inst.wave||'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.2);
      this._connectChain(o, inst, t, g); o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o);
    }
    // ---- SUB ----
    else if (inst.type === 'sub') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*0.5, t);
      const g = this._makeADSR(t, attack, decay, 0.4);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(80, t);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o);
    }
    // ---- BLIP ----
    else if (inst.type === 'blip') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*2, t);
      const g = this._makeADSR(t, attack, decay, 0.1); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.04); this.scheduled.push(o);
    }
    // ---- PAD ----
    else if (inst.type === 'pad') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.15);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(800, t);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o);
    }
    // ---- STACCATO ----
    else if (inst.type === 'staccato') {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.2); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- EXPLOSIVE ----
    else if (inst.type === 'explosive') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.35);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(2000, t);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- SAMPLEHOLD ----
    else if (inst.type === 'samplehold') {
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0, t);
      const rate = inst.rate||30;
      for (let s = 0; s < 10; s++) { const gt = t + s * (1/rate); gain.gain.setValueAtTime(Math.random()*0.3, gt); gain.gain.linearRampToValueAtTime(0, gt+0.01); }
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(1000, t); f.Q.setValueAtTime(5, t);
      src.connect(f); f.connect(gain); gain.connect(ctx.destination);
      src.start(t); src.stop(t+0.5); this.scheduled.push(src);
    }
    // ---- FMLFO ----
    else if (inst.type === 'fmlfo') {
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.setValueAtTime(freq, t);
      const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||0.5), t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(freq*(inst.modIndex||2), t);
      mod.connect(mg); mg.connect(carrier.frequency);
      const g = this._makeADSR(t, attack, decay, 0.15); carrier.connect(g); g.connect(ctx.destination);
      mod.start(t); carrier.start(t); mod.stop(t+attack+decay+0.05); carrier.stop(t+attack+decay+0.05); this.scheduled.push(mod, carrier);
    }
    // ---- PING ----
    else if (inst.type === 'ping') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*(inst.freqMult||3), t);
      const g = this._makeADSR(t, attack, decay, 0.08); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.02); this.scheduled.push(o);
    }
    // ---- RISER ----
    else if (inst.type === 'riser') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq*0.5, t); o.frequency.linearRampToValueAtTime(freq*4, t+decay);
      const g = this._makeADSR(t, attack, decay, 0.2); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+decay+0.05); this.scheduled.push(o);
    }
    // ---- GATEBURST ----
    else if (inst.type === 'gateburst') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.3);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(inst.width?50+inst.width*2000:200, t);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.02); this.scheduled.push(o);
    }
    // ---- NOISEBURST ----
    else if (inst.type === 'noiseburst') {
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = this._makeADSR(t, attack, decay, 0.25);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(2000, t); f.Q.setValueAtTime(3, t);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.03); this.scheduled.push(src);
    }
    // ---- CRUNCH ----
    else if (inst.type === 'crunch') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.3);
      const s = ctx.createWaveShaper(); s.curve = makeDistortionCurve(50);
      o.connect(s); s.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- BITCRUSH ----
    else if (inst.type === 'bitcrush') {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.25);
      const bits = inst.crushBits||4; const steps = Math.pow(2,bits);
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) curve[i] = Math.round((i/128-1)*steps)/steps;
      const s = ctx.createWaveShaper(); s.curve = curve;
      o.connect(s); s.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- RINGMOD ----
    else if (inst.type === 'ringmod') {
      const c = ctx.createOscillator(); c.type = 'sine'; c.frequency.setValueAtTime(freq, t);
      const m = ctx.createOscillator(); m.type = 'sine'; m.frequency.setValueAtTime(inst.modFreq||880, t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(1, t);
      const g = this._makeADSR(t, attack, decay, 0.15);
      m.connect(mg); mg.connect(c.frequency);
      c.connect(g); g.connect(ctx.destination);
      m.start(t); c.start(t); m.stop(t+attack+decay+0.05); c.stop(t+attack+decay+0.05); this.scheduled.push(m,c);
    }
    // ---- CRASH ----
    else if (inst.type === 'crash') {
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = this._makeADSR(t, attack, decay, 0.2);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(4000, t);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.1); this.scheduled.push(src);
    }
    // ---- SWEEPNOSE ----
    else if (inst.type === 'sweepnoise') {
      const buf = createNoiseBuffer(ctx, inst.color||'pink');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = this._makeADSR(t, attack, decay, 0.2);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(200, t); f.frequency.linearRampToValueAtTime(4000, t+decay); f.Q.setValueAtTime(8, t);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.1); this.scheduled.push(src);
    }
    // ---- FMSCREAM ----
    else if (inst.type === 'fmscream') {
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.setValueAtTime(freq, t);
      const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||4), t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(freq*(inst.modIndex||12), t);
      mod.connect(mg); mg.connect(carrier.frequency);
      const g = this._makeADSR(t, attack, decay, 0.25); carrier.connect(g); g.connect(ctx.destination);
      mod.start(t); carrier.start(t); mod.stop(t+attack+decay+0.05); carrier.stop(t+attack+decay+0.05); this.scheduled.push(mod,carrier);
    }
    // ---- FALLER ----
    else if (inst.type === 'faller') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq*4, t); o.frequency.linearRampToValueAtTime(freq*0.25, t+decay);
      const g = this._makeADSR(t, attack, decay, 0.25); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+decay+0.05); this.scheduled.push(o);
    }
    // ---- SWELL ----
    else if (inst.type === 'swell') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.25);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(100, t); f.frequency.linearRampToValueAtTime(2000, t+attack);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o);
    }
    // ---- SQUAREWAVE ----
    else if (inst.type === 'squarewave') {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.3); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- SAWCORE ----
    else if (inst.type === 'sawcore') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.3); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- TRIANGLECORE ----
    else if (inst.type === 'trianglecore') {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.25); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- PULSETHIN ----
    else if (inst.type === 'pulsethin') {
      if (ctx.createPeriodicWave) {
        const real = new Float32Array(512); const imag = new Float32Array(512);
        for (let i = 0; i < 512; i++) { imag[i] = Math.sin(i * inst.width * Math.PI) / (i+1); }
        const pw = ctx.createPeriodicWave(real, imag, {disableNormalization:false});
        const o = ctx.createOscillator(); o.setPeriodicWave(pw); o.frequency.setValueAtTime(freq, t);
        const g = this._makeADSR(t, attack, decay, 0.25); o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
      } else { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
        const g = this._makeADSR(t, attack, decay, 0.25); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.4); this.scheduled.push(o); }
    }
    // ---- SUPERSAW ----
    else if (inst.type === 'supersaw') {
      const count = inst.detuneCount||7; const detune = inst.detuneAmount||12;
      for (let i = 0; i < count; i++) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t); o.detune.setValueAtTime((i-count/2)*detune, t);
        const g = this._makeADSR(t, attack, decay, 0.15/count); this._connectChain(o, inst, t, g); o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
      }
    }
    // ---- WAVETABLE ----
    else if (inst.type === 'wavetable') {
      const sr = ctx.sampleRate; const len = Math.round(sr*0.02);
      const buf = ctx.createBuffer(1, len, sr); const data = buf.getChannelData(0);
      const morph = inst.morphAxis||0.5;
      for (let i = 0; i < len; i++) {
        const phase = i/len; const s = Math.sin(phase*Math.PI*2);
        const sq = s>0?1:-1; const tr = 2*Math.abs(2*(phase-Math.floor(phase+0.5)))-1;
        const saw = 2*(phase-Math.floor(phase+0.5));
        data[i] = s*(1-morph) + (saw*morph*0.5+sq*morph*0.3+tr*morph*0.2);
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.setValueAtTime(freq/55, t);
      const g = this._makeADSR(t, attack, decay, 0.2); src.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.05); this.scheduled.push(src);
    }
    // ---- PHASEMOD ----
    else if (inst.type === 'phasemod') {
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.setValueAtTime(freq, t);
      const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||1.5), t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(inst.modIndex||3, t);
      mod.connect(mg); mg.connect(carrier.frequency);
      const g = this._makeADSR(t, attack, decay, 0.2); carrier.connect(g); g.connect(ctx.destination);
      mod.start(t); carrier.start(t); mod.stop(t+attack+decay+0.05); carrier.stop(t+attack+decay+0.05); this.scheduled.push(mod,carrier);
    }
    // ---- DUAL ----
    else if (inst.type === 'dual') {
      const o1 = ctx.createOscillator(); o1.type = inst.wave1||'sine'; o1.frequency.setValueAtTime(freq, t);
      const o2 = ctx.createOscillator(); o2.type = inst.wave2||'triangle'; o2.frequency.setValueAtTime(freq, t); o2.detune.setValueAtTime(inst.detune||7, t);
      const g = this._makeADSR(t, attack, decay, 0.2); o1.connect(g); o2.connect(g); g.connect(ctx.destination);
      o1.start(t); o2.start(t); o1.stop(t+attack+decay+0.05); o2.stop(t+attack+decay+0.05); this.scheduled.push(o1,o2);
    }
    // ---- SWEEPSAW ----
    else if (inst.type === 'sweepsaw') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq*0.5, t); o.frequency.linearRampToValueAtTime(freq*2, t+decay*0.7);
      const g = this._makeADSR(t, attack, decay, 0.2);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(200, t); f.frequency.linearRampToValueAtTime(4000, t+decay*0.5);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- LAYERED ----
    else if (inst.type === 'layered') {
      const o1 = ctx.createOscillator(); o1.type = inst.wave1||'sawtooth'; o1.frequency.setValueAtTime(freq, t);
      const o2 = ctx.createOscillator(); o2.type = inst.wave2||'pulse'; o2.frequency.setValueAtTime(freq*0.5, t); o2.detune.setValueAtTime(inst.detune||5, t);
      const g = this._makeADSR(t, attack, decay, 0.2); const g2 = this._makeADSR(t, attack, decay, 0.1);
      o1.connect(g); o2.connect(g2); g.connect(ctx.destination); g2.connect(ctx.destination);
      o1.start(t); o2.start(t); o1.stop(t+0.4); o2.stop(t+0.4); this.scheduled.push(o1,o2);
    }
    // ---- FMMETAL ----
    else if (inst.type === 'fmmetal') {
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.setValueAtTime(freq, t);
      const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||2.8), t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(freq*(inst.modIndex||7), t);
      mod.connect(mg); mg.connect(carrier.frequency);
      const g = this._makeADSR(t, attack, decay, 0.15);

      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(500, t);
      carrier.connect(f); f.connect(g); g.connect(ctx.destination);
      mod.start(t); carrier.start(t); mod.stop(t+0.3); carrier.stop(t+0.3); this.scheduled.push(mod,carrier);
    }
    // ---- DISTORTED ----
    else if (inst.type === 'distorted') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.35);
      const s = ctx.createWaveShaper(); s.curve = makeDistortionCurve(70);
      o.connect(s); s.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.15); this.scheduled.push(o);
    }
    // ---- RESONATOR ----
    else if (inst.type === 'resonator') {
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(inst.freq||freq, t); f.Q.setValueAtTime(inst.q||20, t);
      const g = this._makeADSR(t, attack, decay, 0.15);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.1); this.scheduled.push(src);
    }
    // ---- GRANULAR ----
    else if (inst.type === 'granular') {
      const density = inst.density||0.5; const grainLen = inst.grainSize||0.05; const spread = inst.spread||0.2;
      const numGrains = Math.round(density*10);
      for (let g = 0; g < numGrains; g++) {
        const gt = t+Math.random()*spread; const gLen = grainLen*(0.5+Math.random());
        const buf = ctx.createBuffer(1, Math.max(1, Math.round(ctx.sampleRate*gLen)), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*(1-i/data.length);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const gGain = ctx.createGain(); gGain.gain.setValueAtTime(0.12, gt); gGain.gain.exponentialRampToValueAtTime(0.001, gt+gLen);
        this._connectChain(src, inst, t, gGain);
        src.start(gt); this.scheduled.push(src);
      }
    }
    // ---- SUBBASS ----
    else if (inst.type === 'subbass') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*0.25, t);
      const g = this._makeADSR(t, attack, decay, 0.4);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(60, t);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o);
    }
    // ---- FUNDAMENTAL ----
    else if (inst.type === 'fundamental') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.25); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- OCTAVE / DOUBLE OCTAVE / TWELFTH / MAJOR THIRD / SWEET / DISSONANT / RICH / DENSE HARM ----
    else if (['octave','doubleoctave','twelfth','majorthird','sweet','dissonant','rich','denseharm'].includes(inst.type)) {
      const harmonicN = inst.harmonics||1;
      const o = ctx.createOscillator(); o.type = inst.wave||'sine'; o.frequency.setValueAtTime(freq*harmonicN, t);
      const g = this._makeADSR(t, attack, decay, 0.2); this._connectChain(o, inst, t, g); o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- STRING ----
    else if (inst.type === 'string') {
      const sr = ctx.sampleRate; const delayLen = Math.round(sr/freq);
      const buf = ctx.createBuffer(1, delayLen, sr); const data = buf.getChannelData(0);
      for (let i = 0; i < delayLen; i++) data[i] = (Math.random()*2-1)*0.5;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.setValueAtTime(1, t);
      const delay = ctx.createDelay(1); delay.delayTime.setValueAtTime(delayLen/sr, t);
      const fb = ctx.createGain(); fb.gain.setValueAtTime(0.85, t);
      const g = this._makeADSR(t, 0.01, inst.decay||1.2, 0.2);
      src.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+1.5); this.scheduled.push(src);
    }
    // ---- BELL ----
    else if (inst.type === 'bell') {
      const partials = [1, 2.76, 4.54, 6.26, 8.02, 10.1];
      partials.forEach((ratio, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*ratio, t);
        const g = ctx.createGain(); const a = 0.001; const d = inst.decay||1.8; const amp = Math.max(0.01, 0.3-i*0.04);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t+a); g.gain.exponentialRampToValueAtTime(0.001, t+d);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t+d+0.05); this.scheduled.push(o);
      });
    }
    // ---- KICK ----
    else if (inst.type === 'kick') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(inst.toneFreq||60, t); o.frequency.exponentialRampToValueAtTime(30, t+0.15);
      const g = this._makeADSR(t, 0.002, 0.3, 0.5);
      const noise = createNoiseBuffer(ctx, 'white');
      const ns = ctx.createBufferSource(); ns.buffer = noise;
      const ng = this._makeADSR(t, 0.001, 0.08, (inst.noiseMix||0.3)*0.4);
      const nf = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(3000, t);
      ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.35); ns.start(t); ns.stop(t+0.1); this.scheduled.push(o,ns);
    }
    // ---- SNARE ----
    else if (inst.type === 'snare') {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(inst.toneFreq||180, t);
      const g = this._makeADSR(t, 0.002, 0.15, 0.2);
      const buf = createNoiseBuffer(ctx, 'white');
      const ns = ctx.createBufferSource(); ns.buffer = buf;
      const ng = this._makeADSR(t, 0.001, 0.15, (inst.noiseMix||0.6)*0.3);
      const nf = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(2000, t);
      ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.2); ns.start(t); ns.stop(t+0.2); this.scheduled.push(o,ns);
    }
    // ---- CLAP ----
    else if (inst.type === 'clap') {
      const layers = inst.layers||5;
      for (let i = 0; i < layers; i++) {
        const buf = createNoiseBuffer(ctx, 'white');
        const src = ctx.createBufferSource(); src.buffer = buf;
        const gt = t + i * 0.008;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, gt); g.gain.linearRampToValueAtTime(0.15, gt+0.002); g.gain.exponentialRampToValueAtTime(0.001, gt+0.08);
        const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(3000, gt);
        src.connect(f); f.connect(g); g.connect(ctx.destination);
        src.start(gt); src.stop(gt+0.1); this.scheduled.push(src);
      }
    }
    // ---- BONGO ----
    else if (inst.type === 'bongo') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(inst.toneFreq||220, t); o.frequency.exponentialRampToValueAtTime(80, t+0.06);
      const g = this._makeADSR(t, 0.001, 0.08, 0.35); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.1); this.scheduled.push(o);
    }
    // ---- FORMANT ----
    else if (inst.type === 'formant') {
      const vowels = {a:[800,1200,2400],e:[500,1800,2500],i:[300,2200,3000],o:[450,900,2200],u:[300,700,2000]};
      const formants = vowels[inst.vowel]||vowels.a;
      const buf = createNoiseBuffer(ctx, 'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = this._makeADSR(t, attack, decay, 0.15);
      let chain = src;
      formants.forEach(fq => {
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(fq, t); f.Q.setValueAtTime(5, t);
        chain.connect(f); chain = f;
      });
      chain.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+attack+decay+0.1); this.scheduled.push(src);
    }
    // ---- HAT / OPEN HAT / RIDE ----
    else if (inst.type === 'hat' || inst.type === 'hatopen' || inst.type === 'ride') {
      const buf = createNoiseBuffer(ctx, inst.color||'white');
      const src = ctx.createBufferSource(); src.buffer = buf;
      const d = inst.type==='hatopen'?0.3:inst.type==='ride'?0.6:0.06;
      const g = this._makeADSR(t, attack||0.001, d, 0.2);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(inst.type==='ride'?2000:7000, t);
      if (inst.filter==='bandpass') { f.type='bandpass'; f.frequency.setValueAtTime(1000, t); }
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t+d+0.05); this.scheduled.push(src);
    }
    // ---- ENVELOPE / LOOP / BLOCK / SUSTAIN ----
    else if (['env','loop','block','sustain'].includes(inst.type)) {
      // No direct audio — visual/control only
    }
    // ---- FALLBACK oscillator ----
    else if (inst.type === 'oscfallback') {
      const o = ctx.createOscillator(); o.type = inst.wave||'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, 0.15); o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o);
    }
    // ---- ALL SOFT VARIANTS (softsine, softpulse, softtriangle, softdual, etc.) ----
    else if (inst.type.startsWith('soft')) {
      const baseType = inst.type.replace('soft','');
      if (baseType === 'sine') { const o = ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.15); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.5); this.scheduled.push(o); }
      else if (baseType === 'pulse') { const o = ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.15); const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(400, t); o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.5); this.scheduled.push(o); }
      else if (baseType === 'triangle') { const o = ctx.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.15); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.5); this.scheduled.push(o); }
      else if (baseType === 'dual') { const o1=ctx.createOscillator(); o1.type='sine'; o1.frequency.setValueAtTime(freq, t); const o2=ctx.createOscillator(); o2.type='triangle'; o2.frequency.setValueAtTime(freq, t); o2.detune.setValueAtTime(inst.detune||3, t); const g = this._makeADSR(t, attack, decay, 0.15); o1.connect(g); o2.connect(g); g.connect(ctx.destination); o1.start(t); o2.start(t); o1.stop(t+0.5); o2.stop(t+0.5); this.scheduled.push(o1,o2); }
      else if (baseType === 'saw') { const o = ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.15); const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(800, t); o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.5); this.scheduled.push(o); }
      else if (baseType === 'square') { const o = ctx.createOscillator(); o.type='square'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.15); const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(600, t); o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.5); this.scheduled.push(o); }
      else if (baseType === 'pad') { const o = ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, attack, decay, 0.12); const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(400, t); o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+attack+decay+0.1); this.scheduled.push(o); }
      else if (baseType === 'noise') { const buf = createNoiseBuffer(ctx, 'white'); const src = ctx.createBufferSource(); src.buffer = buf; const g = this._makeADSR(t, attack, decay, 0.08); const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(1000, t); src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t+0.3); this.scheduled.push(src); }
      else if (baseType === 'pluck') { const o = ctx.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(freq, t); const g = this._makeADSR(t, 0.002, 0.12, 0.12); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.15); this.scheduled.push(o); }
      else if (baseType === 'granular') { const numGrains = Math.round((inst.density||0.15)*5); for (let g=0;g<numGrains;g++) { const gt=t+Math.random()*0.1; const gLen=0.01+Math.random()*0.02; const buf=ctx.createBuffer(1,Math.round(ctx.sampleRate*gLen),ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length); const src=ctx.createBufferSource(); src.buffer=buf; const gG=ctx.createGain(); gG.gain.setValueAtTime(0.08,gt); gG.gain.exponentialRampToValueAtTime(0.001,gt+gLen); src.connect(gG); gG.connect(ctx.destination); src.start(gt); this.scheduled.push(src); } }
      else if (baseType === 'string') { const sr=ctx.sampleRate; const delayLen=Math.round(sr/freq); const buf=ctx.createBuffer(1,delayLen,sr); const d=buf.getChannelData(0); for(let i=0;i<delayLen;i++) d[i]=(Math.random()*2-1)*0.3; const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true; const delay=ctx.createDelay(1); delay.delayTime.setValueAtTime(delayLen/sr, t); const fb=ctx.createGain(); fb.gain.setValueAtTime(0.7, t); const g=this._makeADSR(t, 0.01, 1.0, 0.1); src.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t+1.2); this.scheduled.push(src); }
      else if (baseType === 'sweep') { const o=ctx.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(freq*0.5, t); o.frequency.linearRampToValueAtTime(freq*2, t+decay*0.6); const g=this._makeADSR(t, attack, decay, 0.12); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o); }
      else if (baseType === 'supersaw') { const count=inst.detuneCount||5; const detune=inst.detuneAmount||8; for(let i=0;i<count;i++) { const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(freq, t); o.detune.setValueAtTime((i-count/2)*detune, t); const g=this._makeADSR(t, attack, decay, 0.08/count); const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(600, t); o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+attack+decay+0.05); this.scheduled.push(o); } }
      else if (baseType === 'wavetable') { const sr=ctx.sampleRate; const len=Math.round(sr*0.02); const buf=ctx.createBuffer(1,len,sr); const d=buf.getChannelData(0); const m=inst.morphAxis||0.3; for(let i=0;i<len;i++) { const p=i/len; const s=Math.sin(p*Math.PI*2); const tr=2*Math.abs(2*(p-Math.floor(p+0.5)))-1; d[i]=s*(1-m*0.5)+tr*m*0.5; } const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true; src.playbackRate.setValueAtTime(freq/55, t); const g=this._makeADSR(t, attack, decay, 0.15); src.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t+attack+decay+0.05); this.scheduled.push(src); }
      else if (baseType === 'phase') { const carrier=ctx.createOscillator(); carrier.type='sine'; carrier.frequency.setValueAtTime(freq, t); const mod=ctx.createOscillator(); mod.type='sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||1.2), t); const mg=ctx.createGain(); mg.gain.setValueAtTime(inst.modIndex||1.5, t); mod.connect(mg); mg.connect(carrier.frequency); const g=this._makeADSR(t, attack, decay, 0.15); carrier.connect(g); g.connect(ctx.destination); mod.start(t); carrier.start(t); mod.stop(t+0.5); carrier.stop(t+0.5); this.scheduled.push(mod,carrier); }
      else if (baseType === 'bell') { const partials=[1,2.0,3.2,4.5]; partials.forEach((ratio,i)=>{ const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(freq*ratio, t); const gg=ctx.createGain(); const a=0.005; const d=inst.decay||1.2; gg.gain.setValueAtTime(0,t); gg.gain.linearRampToValueAtTime(0.1-i*0.02,t+a); gg.gain.exponentialRampToValueAtTime(0.001,t+d); o.connect(gg); gg.connect(ctx.destination); o.start(t); o.stop(t+d+0.05); this.scheduled.push(o); }); }
      else if (baseType === 'snare') { const o=ctx.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(inst.toneFreq||150, t); const g=this._makeADSR(t, 0.003, 0.25, 0.12); const buf=createNoiseBuffer(ctx,'white'); const ns=ctx.createBufferSource(); ns.buffer=buf; const ng=this._makeADSR(t, 0.002, 0.2, (inst.noiseMix||0.4)*0.2); const nf=ctx.createBiquadFilter(); nf.type='highpass'; nf.frequency.setValueAtTime(2000, t); ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.3); ns.start(t); ns.stop(t+0.25); this.scheduled.push(o,ns); }
      else if (baseType === 'resonator') { const buf=createNoiseBuffer(ctx,'white'); const src=ctx.createBufferSource(); src.buffer=buf; const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(inst.freq||freq, t); f.Q.setValueAtTime(inst.q||10, t); const g=this._makeADSR(t, attack, decay, 0.08); src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t+attack+decay+0.1); this.scheduled.push(src); }
      else { const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(freq, t); const g=this._makeADSR(t, attack, decay, 0.1); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.3); this.scheduled.push(o); }
    }
  }

  stop() {
    this.playing = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    this.scheduled.forEach(src => { try { src.stop(); } catch(e){} });
    this.scheduled = [];
    this.currentStep = 0;
  }
}
