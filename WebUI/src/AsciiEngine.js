// ─── ASCII DSP DICTIONARY (Unified Glossary) ────────────────────────
// Built from TMB 3-Layer Database + Hellenic channel types
import { dspScope } from './components/MathSandbox.jsx';
import TMB from './data/TMB_DATABASE.json';

// ─── TMB CORE DICTIONARY ──────────────────────────────────────────────
// Main grid symbols — each has three domains (t/m/b) mapped by layer position.
const TMB_SYMBOLS = TMB.symbols || {};
export const ASCII_DICTIONARY = {};

// Flatten TMB 3-domain entries into flat param objects for backward compat
Object.entries(TMB_SYMBOLS).forEach(([char, data]) => {
  if (char === ' ') return;
  ASCII_DICTIONARY[char] = { ...(data.t || {}), ...(data.m || {}), ...(data.b || {}), desc: data.desc };
});

export function parseBase36(char) {
  if (!char || char === ' ') return null;
  const c = char.toLowerCase();
  if (c >= '0' && c <= '9') return parseInt(c, 10);
  if (c >= 'a' && c <= 'z') return c.charCodeAt(0) - 87; // a=10, z=35
  return null;
}

export function compileLinearSequence(trackString, bpm = 120, stepsPerBeat = 4) {
  const stepDuration = (60 / bpm) / stepsPerBeat;
  const sequence = [];
  let currentTime = 0.0;
  for (const char of trackString) {
    if (char !== ' ' && char !== '') {
      const dspData = ASCII_DICTIONARY[char];
      if (dspData) sequence.push({ time:currentTime, stepIndex:sequence.length, character:char, instructions:dspData });
    }
    currentTime += stepDuration;
  }
  return sequence;
}

export function compileMatrixBlock(layerArray, channelType, bpm = 120, stepsPerBeat = 4) {
  const stepDuration = (60 / bpm) / stepsPerBeat;
  const sequence = [];
  const maxLen = layerArray.reduce((m, l) => Math.max(m, (l && l.length) || 0), 0);
  if (maxLen === 0) return sequence;
  
  // State memory for inheritance
  let currentDelay = 4;
  let currentReverb = 15;
  let currentLFO = { dir: 'up', rate: 4 };
  
  // Structural Parsing State
  let playheadStep = 0;
  let dir = 1;
  let loopStart = -1;
  let loopCount = 0;
  let maxLoop = 0;
  let executionTime = 0.0;
  
  let iterations = 0;
  while (playheadStep >= 0 && playheadStep < maxLen && iterations < 1000) {
    iterations++; // Safety break to prevent infinite loops
    
    const topChar = (layerArray[0] && layerArray[0][playheadStep]) || ' ';
    const midChar = (layerArray[1] && layerArray[1][playheadStep]) || ' ';
    const botChar = (layerArray[2] && layerArray[2][playheadStep]) || ' ';
    
    // Structural Modifiers (can appear in any layer)
    const structCheck = [topChar, midChar, botChar];
    if (structCheck.includes('<')) { dir = -1; playheadStep += dir; continue; }
    if (structCheck.includes('>')) { dir = 1; playheadStep += dir; continue; }
    if (structCheck.includes('{')) { loopStart = playheadStep; loopCount = 0; }
    if (structCheck.includes('}')) {
      // Check next char in top layer for multiplier 'x'
      const nextT = (layerArray[0] && layerArray[0][playheadStep + 1]) || ' ';
      const nextM = (layerArray[1] && layerArray[1][playheadStep + 1]) || ' ';
      if (nextT === 'x' || nextM === 'x') {
        const valChar = layerArray[0] ? layerArray[0][playheadStep + 2] : '4';
        maxLoop = parseBase36(valChar) || 4;
        if (loopCount < maxLoop - 1) {
          loopCount++;
          playheadStep = loopStart !== -1 ? loopStart : 0;
          continue;
        } else {
          // Loop finished, skip past the 'xN'
          playheadStep += 3;
          continue;
        }
      }
    }
    
    if (topChar === ' ' && midChar === ' ' && botChar === ' ' && !structCheck.includes('|')) {
      playheadStep += dir;
      executionTime += stepDuration;
      continue;
    }
    
    // Core parameters from Dictionary
    const baseChar = midChar !== ' ' ? midChar : (topChar !== ' ' ? topChar : botChar);
    let instructions = { ...getInstructionForChar(baseChar) };
    
    if (channelType) { instructions.type = channelType; }
    
    // Look ahead in Top layer for operators and Base-36 values
    const topChars = layerArray[0] || [];
    const tC = topChar;
    const nextTC = topChars[playheadStep + 1] || ' ';
    const b36Val = parseBase36(nextTC);

    // Apply modifiers from dictionary mapping (if they exist as modifiers)
    const topDict = ASCII_DICTIONARY[tC] || {};
    const midDict = ASCII_DICTIONARY[midChar] || {};
    const botDict = ASCII_DICTIONARY[botChar] || {};
    
    Object.assign(instructions, midDict, botDict, topDict);

    let microTimingOffset = 0;
    
    // Parameterize Top Layer Effects with Base-36 values
    if (tC === '+') {
      if (b36Val !== null) microTimingOffset = (b36Val / 36) * stepDuration;
    }
    if (tC === '~' || instructions.hasDelay) {
      if (b36Val !== null) currentDelay = b36Val;
      instructions.delaySend = currentDelay / 36;
    }
    if (tC === '*' || instructions.hasReverb) {
      if (b36Val !== null) currentReverb = b36Val;
      instructions.reverbSend = currentReverb / 36;
    }
    if (tC === '"' || instructions.hasRatchet) {
      instructions.ratchet = b36Val !== null ? b36Val : 2;
    }
    if (tC === '[' || tC === ']' || instructions.hasChopper) {
      instructions.chopper = b36Val !== null ? b36Val : 8;
    }
    if (tC === '^' || instructions.hasLFOUp) {
      currentLFO = { dir: 'up', rate: b36Val !== null ? b36Val : 4 };
      instructions.lfo = currentLFO;
    }
    if (tC === 'v' || instructions.hasLFODown) {
      currentLFO = { dir: 'down', rate: b36Val !== null ? b36Val : 4 };
      instructions.lfo = currentLFO;
    }
    if (tC === '?' || instructions.hasProbability) {
      const prob = b36Val !== null ? (b36Val / 35) : 0.5;
      instructions.chance = prob;
    }
    if (tC === '%' && nextTC === 'B') {
      // Bala-tor macro
      const eqId = topChars[playheadStep + 2] || 'T';
      const densStr = topChars[playheadStep + 3] || '9';
      const densVal = parseBase36(densStr) || 9;
      instructions.balator = { eqId, density: densVal };
    }
    
    const isTie = instructions.tie || baseChar === '-' || baseChar === '_' || baseChar === '═';
    if (isTie && sequence.length > 0) {
      // Extend the duration of the last scheduled note instead of triggering a new one.
      const lastEventGroup = sequence[sequence.length - 1];
      if (lastEventGroup.events && lastEventGroup.events.length > 0) {
        const lastInst = lastEventGroup.events[0].instructions;
        lastInst.sustainTime = (lastInst.sustainTime || stepDuration) + stepDuration;
        
        // Apply sub bass modifiers if it's the '_' char
        if (baseChar === '_') {
          lastInst.subEmphasis = true;
          lastInst.filterCutoff = 0.2;
        }
      }
    } else {
      instructions.sustainTime = stepDuration;
      sequence.push({ time: executionTime + microTimingOffset, stepIndex: playheadStep, events: [{ char: baseChar, instructions }] });
    }
    
    playheadStep += dir;
    executionTime += stepDuration;
  }
  return sequence;
}

export function getInstructionForChar(ch) {
  if (ASCII_DICTIONARY[ch]) return ASCII_DICTIONARY[ch];
  if (ch >= 'A' && ch <= 'Z') return { harmonics: 2.0, velocity: 0.8 };
  if (ch >= 'a' && ch <= 'z') return { harmonics: 1.0, velocity: 0.6 };
  if (ch >= '0' && ch <= '9') return { harmonics: parseInt(ch)||1, velocity: 0.7 };
  return { velocity: 0.5 };
}

export function compileNodePattern(node, bpm) {
  if (!node.pattern || node.pattern.length < 3) return [];
  // Use the node's anchor if present (e.g. Greek symbol as channel type)
  return compileMatrixBlock(node.pattern, node.type, bpm || node.bpm || 120, 4);
}

// ─── DENSITY CALCULATOR ───────────────────────────────────────────────
let _densityCanvas = null, _densityCtx = null;
function ensureDensityCtx() {
  if (!_densityCanvas) {
    _densityCanvas = document.createElement('canvas');
    _densityCanvas.width = 50; _densityCanvas.height = 50;
    _densityCanvas.style.display = 'none';
    document.body.appendChild(_densityCanvas);
    _densityCtx = _densityCanvas.getContext('2d', { willReadFrequently: true });
  }
  return _densityCtx;
}
export function calculateDensity(char) {
  try {
    const ctx = ensureDensityCtx();
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
export const DENSITY_RANGES = [
  { max:5,    cls:'VOID',         color:'#4444ff', desc:'Pure sine wave or deep sub-bass.' },
  { max:15,   cls:'ARCHITECTURE', color:'#44aaff', desc:'Structural control / routing.' },
  { max:30,   cls:'CORE OSC',     color:'#44ff44', desc:'Triangle, Square, geometric waves.' },
  { max:45,   cls:'MATRIX',       color:'#aaff44', desc:'Micro-sequencer / polyrhythms.' },
  { max:75,   cls:'CHAOS',        color:'#ff8800', desc:'FM, noise, distortion, resonance.' },
  { max:100,  cls:'MONOLITH',     color:'#ff2222', desc:'Granular synthesis wall.' }
];
export function getDensityMapping(density) {
  for (const r of DENSITY_RANGES) if (density <= r.max) return r;
  return DENSITY_RANGES[DENSITY_RANGES.length - 1];
}

// ─── WEB AUDIO PLAYER ─────────────────────────────────────────────────
const BASE_FREQ = 65.41;
export function charToPitch(char, stepIndex, rootMidi = 48, scaleIntervals = [0,2,4,5,7,9,11]) {
  if (!scaleIntervals || scaleIntervals.length === 0) return BASE_FREQ;
  const noteIndex = (char ? char.charCodeAt(0) : 0) % scaleIntervals.length;
  const octave = Math.floor(stepIndex / 12);
  const semitone = rootMidi + scaleIntervals[noteIndex] + octave * 12;
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

const _noiseBufferCache = {};

export function createNoiseBuffer(ctx, color = 'white') {
  if (_noiseBufferCache[color]) return _noiseBufferCache[color];

  const sr = ctx.sampleRate;
  const len = sr * 1.0; // 1 second loop is enough
  const buf = ctx.createBuffer(2, len, sr);
  const dataL = buf.getChannelData(0);
  const dataR = buf.getChannelData(1);
  for (let i = 0; i < len; i++) {
    const r = Math.random() * 2 - 1;
    dataL[i] = r; dataR[i] = r;
  }
  if (color === 'pink') {
    let b0L=0,b1L=0,b2L=0,b3L=0,b4L=0,b5L=0,b6L=0;
    let b0R=0,b1R=0,b2R=0,b3R=0,b4R=0,b5R=0,b6R=0;
    for (let i = 0; i < len; i++) {
      const wL = dataL[i], wR = dataR[i];
      b0L=0.99886*b0L+wL*0.0555179; b1L=0.99332*b1L+wL*0.0750759; b2L=0.96900*b2L+wL*0.1538520;
      b3L=0.86650*b3L+wL*0.3104856; b4L=0.55000*b4L+wL*0.5329522; b5L=-0.7616*b5L-wL*0.0168980;
      dataL[i]=(b0L+b1L+b2L+b3L+b4L+b5L+b6L+wL*0.5362)*0.11; b6L=wL*0.115926;
      
      b0R=0.99886*b0R+wR*0.0555179; b1R=0.99332*b1R+wR*0.0750759; b2R=0.96900*b2R+wR*0.1538520;
      b3R=0.86650*b3R+wR*0.3104856; b4R=0.55000*b4R+wR*0.5329522; b5R=-0.7616*b5R-wR*0.0168980;
      dataR[i]=(b0R+b1R+b2R+b3R+b4R+b5R+b6R+wR*0.5362)*0.11; b6R=wR*0.115926;
    }
  }
  _noiseBufferCache[color] = buf;
  return buf;
}

export function makeDistortionCurve(k) {
  const samples = 256;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) { const x = (i * 2) / samples - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  return curve;
}

// ─── SCALES & AFFINITY ────────────────────────────────────────────────
export const SCALES = {
  none:      [],
  chromatic: [0,1,2,3,4,5,6,7,8,9,10,11],
  major:     [0,2,4,5,7,9,11],
  minor:     [0,2,3,5,7,8,10],
  dorian:    [0,2,3,5,7,9,10],
  phrygian:  [0,1,3,5,7,8,10],
  lydian:    [0,2,4,6,7,9,11],
  mixolydian:[0,2,4,5,7,9,10],
  locrian:   [0,1,3,5,6,8,10],
  pentatonic:[0,2,4,7,9],
  blues:     [0,3,5,6,7,10]
};
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export const MICROTONAL_SCALES = {
  '24-TET (Quarter Tones)': [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1150],
  '31-TET (Meantone)': [0, 38.7, 77.4, 116.1, 154.8, 193.5, 232.3, 271.0, 309.7, 348.4, 387.1, 425.8, 464.5, 503.2, 541.9, 580.6, 619.4, 658.1, 696.8, 735.5, 774.2, 812.9, 851.6, 890.3, 929.0, 967.7, 1006.5, 1045.2, 1083.9, 1122.6, 1161.3],
  '53-TET (Mercator)': [0, 22.6, 45.3, 67.9, 90.6, 113.2, 135.8, 158.5, 181.1, 203.8, 226.4, 249.1, 271.7, 294.3, 317.0, 339.6, 362.3, 384.9, 407.5, 430.2, 452.8, 475.5, 498.1, 520.8, 543.4, 566.0, 588.7, 611.3, 634.0, 656.6, 679.2, 701.9, 724.5, 747.2, 769.8, 792.5, 815.1, 837.7, 860.4, 883.0, 905.7, 928.3, 950.9, 973.6, 996.2, 1018.9, 1041.5, 1064.2, 1086.8, 1109.4, 1132.1, 1154.7],
  'Maqam Bayati (Arabic)': [0, 150, 300, 500, 700, 850, 1000],
  'Maqam Hijaz (Arabic)': [0, 100, 400, 500, 700, 850, 1000],
  'Shruti (Indian)': [0, 54, 112, 182, 204, 294, 316, 386, 408, 498, 520, 590, 612, 702, 756, 814, 884, 906, 996, 1018, 1088, 1110],
  'Pelog (Gamelan)': [0, 120, 270, 540, 670, 780, 950],
  'Slendro (Gamelan)': [0, 240, 480, 720, 960],
  'Bohlen-Pierce': [0, 146.3, 292.6, 438.9, 585.2, 731.5, 877.8, 1024.1, 1170.4, 1316.7, 1463.0, 1609.3, 1755.6],
  'Hirajoshi (Japanese)': [0, 200, 300, 700, 800],
  '17-TET (Middle East)': [0, 70.6, 141.2, 211.8, 282.4, 352.9, 423.5, 494.1, 564.7, 635.3, 705.9, 776.5, 847.1, 917.6, 988.2, 1058.8, 1129.4],
};

export function parseCommand(cmd) {
  cmd = cmd.trim();
  const euclidMatch = cmd.match(/^euclid\s*\(\s*(\S)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (euclidMatch) return { type:'euclid', ch:euclidMatch[1], pulses:parseInt(euclidMatch[2]), steps:parseInt(euclidMatch[3]) };
  const fillMatch = cmd.match(/^fill\s*\(\s*(\S)\s*\)$/i);
  if (fillMatch) return { type:'fill', ch:fillMatch[1] };
  const randomMatch = cmd.match(/^random\s*\(\s*(\S+)\s*\)$/i);
  if (randomMatch) return { type:'random', chars:randomMatch[1] };
  const patternMatch = cmd.match(/^pattern\s*\(\s*(\S+)\s*,\s*(\d+)\s*\)$/i);
  if (patternMatch) return { type:'pattern', ch:patternMatch[1], steps:parseInt(patternMatch[2]) };
  const scaleMatch = cmd.match(/^scale\s*\(\s*([\d,\s]+)\s*\)$/i);
  if (scaleMatch) return { type:'scale', notes:scaleMatch[1].split(',').map(Number) };
  const sweepMatch = cmd.match(/^sweep\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)$/i);
  if (sweepMatch) return { type:'sweep', param:sweepMatch[1], from:sweepMatch[2], to:sweepMatch[3] };
  const gateMatch = cmd.match(/^gate\s*\(\s*(on|off|1|0)\s*\)$/i);
  if (gateMatch) return { type:'gate', val:gateMatch[1] === 'on' || gateMatch[1] === '1' };
  const clearMatch = cmd.match(/^clear$/i);
  if (clearMatch) return { type:'clear' };
  return null;
}

export function applyCommandToNode(node, command) {
  const steps = node.steps || 16;
  if (!node.pattern) node.pattern = Array.from({length:3}, () => Array(steps).fill(''));
  switch (command.type) {
    case 'fill':
      for (let l = 0; l < 3; l++)
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = command.ch;
      break;
    case 'clear':
      for (let l = 0; l < 3; l++)
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = '';
      break;
    case 'euclid': {
      const { ch, pulses } = command;
      for (let l = 0; l < 3; l++) {
        const seq = euclideanRhythm(pulses, steps);
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = seq[i] ? ch : '';
      }
      break;
    }
    case 'random': {
      const chars = command.chars;
      for (let l = 0; l < 3; l++)
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = chars[Math.floor(Math.random() * chars.length)];
      break;
    }
    case 'pattern': {
      const p = command.ch.repeat(Math.ceil(steps / command.ch.length)).slice(0, steps);
      for (let l = 0; l < 3; l++)
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = p[i];
      break;
    }
    case 'scale': {
      const notes = command.notes;
      for (let l = 0; l < 3; l++)
        for (let i = 0; i < steps; i++)
          node.pattern[l][i] = String(notes[i % notes.length]);
      break;
    }
    case 'gate': {
      node.affinityGate = command.val;
      break;
    }
  }
}

export function euclideanRhythm(pulses, steps) {
  const result = Array(steps).fill(0);
  if (pulses === 0) return result;
  const bucket = Array(steps).fill(0);
  for (let i = 0; i < steps; i++) bucket[i] = i * pulses / steps;
  const indices = bucket.map((v, i) => ({v, i})).sort((a,b) => a.v - b.v);
  for (let p = 0; p < pulses; p++) result[indices[p].i] = 1;
  return result;
}

// ─── CHARACTER PARAMS MAP ─────────────────────────────────────────────
export const CHAR_PARAMS_ALL = [
  'model', 'gate', 'velocity', 'chance', 'tune', 'decay', 'cutoff',
  'resonance', 'distortion', 'delaySend', 'reverbSend', 'pan', 'tie',
  'slide', 'ratchet', 'arp', 'glitch', 'attack', 'release', 'sustain', 'highpass'
];

export const CHAR_PARAM_RANGES = {
  velocity: { min: 0, max: 1.0, step: 0.05, default: 0.8 },
  chance:   { min: 0, max: 1.0, step: 0.05, default: 1.0 },
  model:    { min: 1, max: 100, step: 1, default: 1 },
  gate:     { min: 0.05, max: 1.0, step: 0.05, default: 0.5 },
  sustain:  { min: 0.0, max: 1.0, step: 0.05, default: 0.8 },
  tune:     { min: 20, max: 120, step: 1, default: 60 },
  decay:    { min: 0.01, max: 1.0, step: 0.01, default: 0.15 },
  ratchet:  { min: 1, max: 8, step: 1, default: 1 },
  arp:      { min: 0, max: 4, step: 1, default: 0 },
  glitch:   { min: 0, max: 1, step: 0.05, default: 0 },
  distortion: { min: 0, max: 100, step: 1, default: 0 },
  highpass: { min: 1000, max: 12000, step: 100, default: 8000 },
  cutoff:    { min: 100, max: 12000, step: 10, default: 12000 },
  resonance: { min: 0, max: 50, step: 0.5, default: 5 },
  attack:   { min: 0.01, max: 2.0, step: 0.01, default: 0.5 },
  release:  { min: 0.1, max: 4.0, step: 0.1, default: 2.0 },
  delaySend: { min: 0, max: 1, step: 0.05, default: 0.0 },
  reverbSend: { min: 0, max: 1, step: 0.05, default: 0.0 },
  tie:      { min: 0, max: 1, step: 1, default: 0 },
  slide:    { min: 0, max: 1, step: 1, default: 0 },
  pan:      { min: -1.0, max: 1.0, step: 0.05, default: 0.0 },
  fmAmount: { min: 0, max: 1000, step: 10, default: 0 },
  wavefold: { min: 0, max: 1.0, step: 0.05, default: 0 },
  tilt:     { min: -1.0, max: 1.0, step: 0.05, default: 0 },
  spread:   { min: 0, max: 1.0, step: 0.05, default: 0 },
  click:    { min: 0, max: 1, step: 0.05, default: 0.5 },
  bodyMix:    { min: 0, max: 1, step: 0.05, default: 0.5 },
  pitchEnvRise: { min: 0, max: 0.001, step: 0.00001, default: 0.0001 },
  pitchEnvFall: { min: 0, max: 0.1, step: 0.001, default: 0.02 },
  noiseMix:   { min: 0, max: 1, step: 0.05, default: 0.5 },
  noiseType:  { values: ['white', 'pink', 'blue'], default: 'white' },
  reverbSend: { min: 0, max: 1, step: 0.05, default: 0.0 },
  clip:      { min: 0, max: 1, step: 0.01, default: 0.6 },
  spike:     { min: 0, max: 1, step: 0.01, default: 0.6 },
  glitch:    { min: 0, max: 0.5, step: 0.01, default: 0.3 },
  detuneCount: { min: 1, max: 32, step: 1, default: 7 },
  detuneAmount: { min: 0, max: 64, step: 1, default: 12 },
  notch:      { min: 1000, max: 10000, step: 100, default: 2000 },
  chord:     { min: 1, max: 9, step: 1, default: 3 },
  layers:    { min: 1, max: 12, step: 1, default: 5 },
  components: { min: 1, max: 12, step: 1, default: 3 },
  open:      { min: 0, max: 1, step: 0.01, default: 0 },
  highpass:  { min: 2000, max: 20000, step: 100, default: 8000 },
  cutoff:    { min: 500, max: 20000, step: 10, default: 2000 },
  envelopeType: { values: ['envelope', 'gate'], default: 'envelope' },
  bowVelocity: { min: 0, max: 1, step: 0.05, default: 0.8 },
  bowPressure: { min: 0, max: 1, step: 0.05, default: 0.5 },
  bowBrightness: { min: 0, max: 1, step: 0.05, default: 0.5 },
  bowFinger: { values: ['thumb', 'index', 'middle', 'ring', 'pinky'], default: 'index' },
  bowFingerBase: { values: ['Open', 'Half', 'Closed'], default: 'Half' },
  deviationPressing: { min: 0, max: 0.3, step: 0.01, default: 0.1 },
  windmillSpeed: { min: 0, max: 1, step: 0.05, default: 0.5 },
  windType: { values: ['Forerunner', 'Phantom', 'Gantry', 'Overformant'], default: 'Overformant' },
  windSystem: { values: ['Piston A', 'Piston B', 'Rotary'], default: 'Rotary' },
  slightRocking: { min: 0, max: 0.4, step: 0.01, default: 0.2 },
  pistonQuench: { min: 0, max: 0.5, step: 0.01, default: 0.1 },
  reedVortex: { min: 0, max: 0.5, step: 0.01, default: 0.2 },
  valveVorticity: { min: 0, max: 0.5, step: 0.01, default: 0.3 },
  noiseWellDepth: { min: 0, max: 1, step: 0.05, default: 0.5 },
  noiseMagnetism: { min: 0, max: 0.5, step: 0.05, default: 0.3 },
  sputum: { min: 0, max: 0.5, step: 0.05, default: 0.2 },
  mushMutate: { min: 0, max: 0.5, step: 0.05, default: 0.3 },
  virature: { min: 0, max: 0.5, step: 0.05, default: 0.4 },
  mangling: { min: 0, max: 0.5, step: 0.05, default: 0.3 },
};

// ─── TYPE ENVELOPE PROFILES ─────────────────────────────────────────
// Maps synth engine type → sensible envelope defaults per sound character.
// attack/decay/release are seconds, sustain is 0-1 level, gate is 0-1 fraction.
export const TYPE_ENV_PROFILES = {
  // — Sustained / pad-like —
  alpha_synth:  { attack:0.3,  decay:0.4, sustain:0.75, release:2.0, gate:0.5,  cutoff:3000, resonance:3 },
  sigma_synth:  { attack:0.4,  decay:0.6, sustain:0.9,  release:3.0, gate:0.6,  cutoff:2500, resonance:2 },
  gamma_synth:  { attack:0.2,  decay:0.5, sustain:0.8,  release:2.5, gate:0.5,  cutoff:2000, resonance:4 },
  pi_synth:     { attack:0.01, decay:0.8, sustain:0.5,  release:1.5, gate:0.5,  cutoff:4000, resonance:2 },

  // — Evolving / morphing —
  delta_synth:  { attack:0.15, decay:0.5, sustain:0.8,  release:2.0, gate:0.5,  cutoff:5000, resonance:3 },

  // — Metallic / bell-like (FM) —
  phi_synth:    { attack:0.005,decay:0.4, sustain:0.3,  release:1.0, gate:0.4,  cutoff:8000, resonance:2 },

  // — Percussive / transient —
  omega_synth:  { attack:0.002,decay:0.2, sustain:0.0,  release:0.3, gate:0.15, cutoff:4000, resonance:8 },
  tau_synth:    { attack:0.001,decay:0.3, sustain:0.0,  release:0.15,gate:0.1,  cutoff:8000, resonance:3, autoGate:false },
  w_synth:      { attack:0.001,decay:0.15,sustain:0.0,  release:0.1, gate:0.08, cutoff:6000, resonance:4, autoGate:false },

  // — Abstract sound-type profiles (used by CHAR_PARAMS_DICT types) —
  pad:          { attack:1.0,  decay:0.6, sustain:0.9,  release:3.5, gate:0.7,  cutoff:800,  resonance:2,  delaySend:0.2, reverbSend:0.3 },
  drone:        { attack:0.8,  decay:0.5, sustain:0.95, release:3.0, gate:0.8,  cutoff:600,  resonance:3,  delaySend:0.15,reverbSend:0.2 },
  swell:        { attack:1.5,  decay:0.7, sustain:0.85, release:3.0, gate:0.6,  cutoff:1500, resonance:2 },
  lead:         { attack:0.01, decay:0.3, sustain:0.8,  release:0.6, gate:0.4,  cutoff:7000, resonance:3 },
  pluck:        { attack:0.003,decay:0.1, sustain:0.1,  release:0.15,gate:0.2,  cutoff:4000, resonance:5 },
  staccato:     { attack:0.002,decay:0.08,sustain:0.0,  release:0.1, gate:0.15, cutoff:5000, resonance:4 },
  bass:         { attack:0.01, decay:0.2, sustain:0.85, release:0.3, gate:0.3,  cutoff:300,  resonance:2 },
  sub:          { attack:0.008,decay:0.25,sustain:0.9,  release:0.3, gate:0.3,  cutoff:200,  resonance:1 },
  string:       { attack:0.05, decay:0.4, sustain:0.7,  release:1.5, gate:0.4,  cutoff:4000, resonance:4, delaySend:0.1, reverbSend:0.15 },
  bell:         { attack:0.003,decay:0.5, sustain:0.2,  release:1.0, gate:0.3,  cutoff:8000, resonance:2, reverbSend:0.2 },
  blip:         { attack:0.002,decay:0.06,sustain:0.0,  release:0.08,gate:0.12, cutoff:6000, resonance:2 },
  tick:         { attack:0.001,decay:0.04,sustain:0.0,  release:0.06,gate:0.1,  cutoff:8000, resonance:6, highpass:4000 },
  explosive:    { attack:0.002,decay:0.15,sustain:0.0,  release:0.2, gate:0.15, cutoff:5000, resonance:3, distortion:30 },
  crash:        { attack:0.001,decay:0.4, sustain:0.0,  release:0.8, gate:0.2,  cutoff:8000, resonance:2, highpass:3000, reverbSend:0.3 },
  hat:          { attack:0.001,decay:0.06,sustain:0.0,  release:0.1, gate:0.08, cutoff:10000,resonance:2, highpass:5000 },
  hatopen:      { attack:0.001,decay:0.2, sustain:0.0,  release:0.3, gate:0.15, cutoff:10000,resonance:1, highpass:4000 },
  kick:         { attack:0.001,decay:0.25,sustain:0.0,  release:0.15,gate:0.1,  cutoff:6000, resonance:2, distortion:20 },
  snare:        { attack:0.001,decay:0.15,sustain:0.0,  release:0.15,gate:0.1,  cutoff:7000, resonance:3, highpass:2000, distortion:10 },
  clap:         { attack:0.002,decay:0.2, sustain:0.0,  release:0.2, gate:0.12, cutoff:6000, resonance:2, highpass:2000 },
  percussion:   { attack:0.001,decay:0.1, sustain:0.0,  release:0.1, gate:0.08, cutoff:5000, resonance:3 },
  fmlfo:        { attack:0.005,decay:0.35,sustain:0.4,  release:0.8, gate:0.3,  cutoff:5000, resonance:3, distortion:10 },
  supersaw:     { attack:0.01, decay:0.3, sustain:0.8,  release:1.0, gate:0.4,  cutoff:6000, resonance:4, distortion:5, delaySend:0.1, reverbSend:0.1 },
  granular:     { attack:0.05, decay:0.3, sustain:0.7,  release:2.0, gate:0.4,  cutoff:4000, resonance:3 },
  resonator:    { attack:0.01, decay:0.25,sustain:0.6,  release:1.0, gate:0.3,  cutoff:2000, resonance:8 },
  sweepsaw:     { attack:0.02, decay:0.3, sustain:0.75, release:1.2, gate:0.4,  cutoff:5000, resonance:5, distortion:5 },
  riser:        { attack:0.5,  decay:0.4, sustain:0.7,  release:1.5, gate:0.4,  cutoff:500,  resonance:3 },
  faller:       { attack:0.01, decay:0.5, sustain:0.5,  release:1.0, gate:0.3,  cutoff:8000, resonance:4, slide:1 },
  ringmod:      { attack:0.003,decay:0.2, sustain:0.3,  release:0.5, gate:0.3,  cutoff:5000, resonance:2, arp:1 },
  dual:         { attack:0.01, decay:0.3, sustain:0.7,  release:0.8, gate:0.35, cutoff:4000, resonance:3, distortion:10 },
  fmmetal:      { attack:0.002,decay:0.3, sustain:0.2,  release:0.6, gate:0.25, cutoff:7000, resonance:2, distortion:15 },
  wavetable:    { attack:0.05, decay:0.3, sustain:0.75, release:1.5, gate:0.4,  cutoff:5000, resonance:3 },
};

// Maps ASCII_DICTIONARY entry types → applicable params
export const CHAR_PARAMS_DICT = {
  pluck:       ['model','gate','velocity','chance','tune','decay','pan','ratchet','glitch'],
  tick:        ['model','gate','velocity','chance','decay','highpass','pan','ratchet'],
   drone:       ['model','gate','velocity','chance','tune','cutoff','resonance','decay','sustain','release','pan','glitch'],
  sub:         ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  blip:        ['model','gate','velocity','chance','decay','pan'],
   pad:         ['model','gate','velocity','chance','tune','cutoff','attack','decay','sustain','release','distortion','delaySend','reverbSend','pan','arp','glitch'],
  staccato:    ['model','gate','velocity','chance','tune','decay','pan'],
  explosive:   ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  samplehold:  ['model','gate','velocity','chance','cutoff','resonance','pan','glitch'],
   fmlfo:       ['model','gate','velocity','chance','tune','decay','sustain','release','distortion','pan'],
  ping:        ['model','gate','velocity','chance','tune','decay','pan'],
   riser:       ['model','gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','pan'],
  gateburst:   ['model','gate','velocity','chance','decay','pan','ratchet'],
  noiseburst:  ['model','gate','velocity','chance','decay','cutoff','resonance','pan'],
  crunch:      ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
  bitcrush:    ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
   ringmod:     ['model','gate','velocity','chance','tune','attack','decay','sustain','release','pan','arp'],
  crash:       ['model','gate','velocity','chance','decay','highpass','reverbSend','pan','ratchet'],
  sweepnoise:  ['model','gate','velocity','chance','decay','cutoff','resonance','pan','glitch'],
  fmscream:    ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
   faller:      ['model','gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','pan','slide'],
   swell:       ['model','gate','velocity','chance','tune','cutoff','attack','decay','sustain','release','pan'],
  squarewave:  ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
  sawcore:     ['model','gate','velocity','chance','tune','decay','cutoff','resonance','distortion','pan','ratchet','glitch'],
  trianglecore:['model','gate','velocity','chance','tune','decay','pan'],
     alpha_synth: ['gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','resonance','distortion','pan','ratchet','glitch'],
   delta_synth: ['gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','resonance','distortion','pan','ratchet'],
   phi_synth:   ['gate','velocity','chance','tune','attack','decay','sustain','release','distortion','pan','ratchet'],
   sigma_synth: ['gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','resonance','pan'],
   gamma_synth: ['gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','resonance','distortion','pan','ratchet'],
   omega_synth: ['gate','velocity','chance','tune','attack','decay','sustain','release','cutoff','resonance','pan'],
   pi_synth:    ['gate','velocity','chance','tune','attack','decay','sustain','release','pan'],
   tau_synth:   ['model','gate','velocity','chance','tune','attack','decay','cutoff','resonance','pan'],
   w_synth:     ['model','gate','velocity','chance','tune','attack','decay','cutoff','resonance','distortion','pan'],
  pulsethin:   ['model','gate','velocity','chance','tune','decay','pan','ratchet'],
   supersaw:    ['model','gate','velocity','chance','tune','cutoff','resonance','attack','decay','sustain','release','distortion','delaySend','reverbSend','pan','tie','slide','ratchet','arp','glitch'],
   wavetable:   ['model','gate','velocity','chance','tune','cutoff','attack','decay','sustain','release','pan','glitch'],
  phasemod:    ['model','gate','velocity','chance','tune','decay','pan'],
   dual:        ['model','gate','velocity','chance','tune','attack','decay','sustain','release','distortion','pan','arp'],
   sweepsaw:    ['model','gate','velocity','chance','tune','cutoff','resonance','attack','decay','sustain','release','distortion','pan','slide'],
  layered:     ['model','gate','velocity','chance','tune','decay','distortion','pan','arp'],
   fmmetal:     ['model','gate','velocity','chance','tune','attack','decay','sustain','release','distortion','pan','glitch'],
  distorted:   ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
   resonator:   ['model','gate','velocity','chance','cutoff','resonance','attack','decay','sustain','release','pan','glitch'],
   granular:    ['model','gate','velocity','chance','attack','decay','sustain','release','cutoff','pan','glitch'],
  subbass:     ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  fundamental: ['model','gate','velocity','chance','tune','decay','pan'],
  octave:      ['model','gate','velocity','chance','tune','decay','cutoff','pan'],
  twelfth:     ['model','gate','velocity','chance','tune','decay','pan'],
  doubleoctave:['model','gate','velocity','chance','tune','decay','highpass','pan'],
  majorthird:  ['model','gate','velocity','chance','tune','decay','pan'],
  sweet:       ['model','gate','velocity','chance','tune','decay','pan'],
  dissonant:   ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  rich:        ['model','gate','velocity','chance','tune','decay','pan'],
  denseharm:   ['model','gate','velocity','chance','tune','decay','highpass','pan'],
   string:      ['model','gate','velocity','chance','tune','attack','decay','sustain','release','distortion','delaySend','reverbSend','pan','tie','slide','glitch'],
   bell:        ['model','gate','velocity','chance','tune','attack','decay','sustain','release','reverbSend','pan','glitch'],
  kick:        ['model','gate','velocity','chance','tune','decay','distortion','reverbSend','pan','ratchet','glitch'],
  snare:       ['model','gate','velocity','chance','decay','highpass','distortion','reverbSend','pan','ratchet','glitch'],
  clap:        ['model','gate','velocity','chance','decay','highpass','reverbSend','pan','ratchet','glitch'],
  bongo:       ['model','gate','velocity','chance','tune','decay','pan','ratchet'],
  formant:     ['model','gate','velocity','chance','cutoff','decay','delaySend','reverbSend','pan','glitch'],
  hat:         ['model','gate','velocity','chance','decay','highpass','distortion','delaySend','reverbSend','pan','ratchet','glitch'],
  hatopen:     ['model','gate','velocity','chance','decay','highpass','distortion','delaySend','reverbSend','pan','ratchet','glitch'],
  hatwhite:    ['model','gate','velocity','chance','decay','highpass','reverbSend','pan','ratchet','glitch'],
  oscfallback: ['model','gate','velocity','chance','tune','decay','pan'],
  kickdigital: ['model','gate','velocity','chance','tune','decay','distortion','pan','ratchet'],
  snarebinary: ['model','gate','velocity','chance','decay','highpass','distortion','pan','glitch'],
  hatdigital:  ['model','gate','velocity','chance','decay','highpass','pan','ratchet'],
  percdual:    ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  kickgranular:['model','gate','velocity','chance','decay','pan','glitch'],
  percformant: ['model','gate','velocity','chance','tune','cutoff','decay','pan'],
  clapgranular:['model','gate','velocity','chance','decay','pan','glitch'],
  hatharmonic: ['model','gate','velocity','chance','tune','decay','highpass','pan','ratchet'],
  percimpulse: ['model','gate','velocity','chance','tune','decay','pan'],
  snarejitter: ['model','gate','velocity','chance','decay','cutoff','resonance','pan','glitch'],
  kickmodular: ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  perclayered: ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  hatmetallic: ['model','gate','velocity','chance','tune','decay','pan'],
  noiseperc:   ['model','gate','velocity','chance','decay','cutoff','pan'],
  kickfm:      ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  pertick:     ['model','gate','velocity','chance','tune','decay','pan'],
  hatnoise:    ['model','gate','velocity','chance','decay','highpass','pan','ratchet'],
  snarering:   ['model','gate','velocity','chance','tune','decay','pan'],
  snarenoise:  ['model','gate','velocity','chance','decay','cutoff','distortion','pan'],
  perctick:    ['model','gate','velocity','chance','tune','decay','pan'],
  kickunstable:['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
  percvector:  ['model','gate','velocity','chance','tune','decay','pan'],
  hatwhite:    ['model','gate','velocity','chance','decay','highpass','pan','ratchet'],
  percnoise:   ['model','gate','velocity','chance','decay','cutoff','pan'],
  synthtom:    ['model','gate','velocity','chance','tune','decay','distortion','pan'],
  snarezonal:  ['model','gate','velocity','chance','tune','decay','distortion','pan','glitch'],
};

export function getCharParams(char) {
  const entry = ASCII_DICTIONARY[char];
  if (!entry) return {};
  const paramKeys = CHAR_PARAMS_DICT[entry.type] || CHAR_PARAMS_ALL.slice(0, 6);
  const result = {};
  // Seed from TYPE_ENV_PROFILES for type-appropriate envelope defaults
  const profile = TYPE_ENV_PROFILES[entry.type];
  if (profile) {
    Object.keys(profile).forEach(k => { result[k] = profile[k]; });
  }
  // Overlay dictionary entry defaults (character-specific)
  result.tune = entry.tune || result.tune || 60;
  result.decay = entry.decay || result.decay || 0.15;
  result.attack = entry.attack || result.attack || 0.01;
  result.cutoff = entry.cutoff || (entry.filter === 'lowpass' ? 2000 : entry.filter === 'highpass' ? 6000 : entry.filter === 'bandpass' ? 1500 : 1500) || result.cutoff || 12000;
  result.resonance = entry.resonance || result.resonance || 5;
  result.distortion = entry.distortion || result.distortion || 0;
  result.toneFreq = entry.toneFreq;
  // Generic fallbacks for params not covered by profile
  result.gate = result.gate !== undefined ? result.gate : 0.5;
  result.velocity = 0.8;
  result.chance = 1.0;
  result.pan = 0;
  result.delaySend = result.delaySend !== undefined ? result.delaySend : 0;
  result.reverbSend = result.reverbSend !== undefined ? result.reverbSend : 0;
  result.tie = 0;
  result.slide = 0;
  result.ratchet = 1;
  result.arp = 0;
  result.glitch = 0;
  result.model = entry.model !== undefined ? entry.model : 1;
  result.highpass = 8000;
  // Merge from CHAR_PARAM_RANGES defaults for any remaining undefined keys
  paramKeys.forEach(k => {
    const r = CHAR_PARAM_RANGES[k];
    if (r && result[k] === undefined) result[k] = r.default;
  });
  return result;
}

export function initAllCharParams() {
  const map = {};
  for (const char in ASCII_DICTIONARY) {
    map[char] = getCharParams(char);
  }
  return map;
}

// ─── ASCII LIBRARY UI DATA ────────────────────────────────────────────
export const ASCII_LIBRARY = [
  { cat:'ENGINES', desc:'Core Synth & Drum Engines',
    chars:'αδφΣγωπτw',
    dsp:'α=Analog Sub, δ=Wavetable, φ=FM, Σ=Spectral, γ=Granular, ω=Noise, π=Physical, τ=Kick Core, w=Noise Perc.' },
  { cat:'PUNCTUATION', desc:'Sparse = Sines & Plucks',
    chars:'.,\'"-_:;!?',
    dsp:'.=sine pluck ,=micro-click -=sine drone _=sub-bass drone \'=pico-click :=pad ;=short sine !=saw pluck ?=noise S&H' },
  { cat:'OSCILLATORS', desc:'Medium Density = Complex Waves',
    chars:'XOVI',
    dsp:'X→dense sawtooth, O→hollow square, V→pointed triangle, I→thin triangle.' },
  { cat:'DENSE', desc:'High Density = Noise, FM & Distortion',
    chars:'#@%WM',
    dsp:'#=white noise burst, @=pink noise+distortion, %=FM scream, W=FM mod, M=distorted double-saw.' },
  { cat:'BLOCKS', desc:'Granular = Density = Grain Overlap',
    chars:'█▓▒░',
    dsp:'█=100% dense grain wall, ▓=80% buzz swarm, ▒=50% glitch stutter, ░=20% vinyl crackle.' },
  { cat:'NUMBERS', desc:'Harmonic Partials = Numeric Value',
    chars:'0123456789',
    dsp:'0=sub bass, 1=fundamental, 2=octave, 3=twelfth, 4=2oct, 5=major3, 6=sweet, 7=dissonant, 8=rich, 9=dense.' },
  { cat:'MODIFIERS', desc:'Envelopes, Gates & Loop Markers',
    chars:'/\\()[]{}',
    dsp:'/=filter ramp↑, \\=filter ramp↓, (=gate open, )=gate close, [=loop start, ]=loop end.' },
  { cat:'ROUTING', desc:'Signal Flow & Sustain',
    chars:'=',
    dsp:'= = sustain previous note across steps.' },
  { cat:'PHYSICAL', desc:'Percussion, Strings & Voice',
    chars:'HKSRCBADNPEFG',
    dsp:'H=string, K=kick, S=snare, C=clap, B=bongo, A/E=vowel formants, N=hat, D=open hat, P=formant' },
  { cat:'UPPERCASE', desc:'Density→Harmonics (Sawtooth)',
    chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    dsp:'A=thinnest saw → Z=densest saw.' },
  { cat:'PERCUSSION', desc:'Freq-Based Digital Percussion (a-z)',
    chars:'abcdefghijklmnopqrstuvwxyz',
    dsp:'a=digital kick, b=binary snare, c=digital hat, d=dual perc, e=granular kick, f=formant perc, g=granular clap, h=harmonic hat, i=impulse, j=jitter snare, k=modular kick, l=layered perc, m=metal hat, n=noise perc, o=kick FM, p=tick perc, q=noise hat, r=ring snare, s=snare noise, t=triangle tick, u=unstable kick, v=vector perc, w=white hat, x=pink perc, y=synth tom, z=zonal snare' }
];

export const CHAR_CATEGORY = {};
for (const entry of ASCII_LIBRARY) {
  for (const ch of entry.chars) CHAR_CATEGORY[ch] = entry.cat;
}

export function getCharacterCategory(ch) {
  if (CHAR_CATEGORY[ch]) return CHAR_CATEGORY[ch];
  if (ch >= 'A' && ch <= 'Z') return 'UPPERCASE';
  if (ch >= 'a' && ch <= 'z') return 'lowercase';
  if (ch >= '\u2800' && ch <= '\u28FF') return 'BRAILLE';
  if ('╔═║╚╝╠╣╦╩╬╗╟╤╧╞╡╨╥╙╘╓╒╪'.includes(ch)) return 'BOX DRAWING';
  return 'OTHER';
}

export function asciiToParams(ch) {
  if (!ch || ch === ' ' || ch === '.') return { wave:'sine', amp:0.1, harm:1, noise:0, fm:0, env:'pluck' };
  const d = ASCII_DICTIONARY[ch];
  if (d) {
    const env = d.type === 'granular' ? 'grain' : d.type === 'envelope' ? 'gate' : d.type === 'noise' ? 'harsh' : (d.attack||0.01) < 0.02 ? 'pluck' : 'sustain';
    const amp = d.type === 'noise' ? 0.5 : d.type === 'fm' ? 0.3 : d.type === 'granular' ? 0.4 : 0.35 + (d.harmonics||0) * 0.08;
    return { wave: d.wave || (d.type === 'noise' ? 'noise' : d.type === 'fm' ? 'fm' : 'sine'), amp: Math.min(1, amp), harm: (d.harmonics || 1) + 1, noise: d.type === 'noise' ? 0.7 : d.type === 'granular' ? 0.3 : 0, fm: d.type === 'fm' ? 0.5 : 0, env };
  }
  if ('BRgm'.includes(ch)) return { wave:'square', amp:0.6, harm:5, noise:0.3, fm:0.05, env:'harsh' };
  if ('&$%*'.includes(ch)) return { wave:'square', amp:0.5, harm:4, noise:0.2, fm:0.1, env:'harsh' };
  if (ch >= 'A' && ch <= 'Z') return { wave:'sawtooth', amp:0.35 + (ch.charCodeAt(0)-65)/100, harm:3, noise:0.05, fm:0, env:'sharp' };
  if (ch >= 'a' && ch <= 'z') return { wave:'triangle', amp:0.25 + (ch.charCodeAt(0)-97)/100, harm:2, noise:0, fm:0, env:'smooth' };
  if (ch >= '\u2800' && ch <= '\u28FF') return { wave:'square', amp:0.4, harm:2, noise:0.2, fm:0.05, env:'braille' };
  if ('╔═║╚╝╠╣╦╩╬╗╟╤╧╞╡╨╥╙╘╓╒╪'.includes(ch)) return { wave:'pulse', amp:0.2, harm:1, noise:0, fm:0, env:'gate' };
  return { wave:'sine', amp:0.2, harm:1, noise:0, fm:0, env:'pluck' };
}

// ─── EDIT DATABASE ────────────────────────────────────────────────────
export class EditDatabase {
  constructor() { this.stack = []; this.idx = -1; this.max = 256; }
  push(state) {
    this.stack = this.stack.slice(0, this.idx + 1);
    this.stack.push(JSON.parse(JSON.stringify(state)));
    if (this.stack.length > this.max) this.stack.shift();
    this.idx = this.stack.length - 1;
  }
  undo() { if (this.idx <= 0) return null; this.idx--; return JSON.parse(JSON.stringify(this.stack[this.idx])); }
  redo() { if (this.idx >= this.stack.length - 1) return null; this.idx++; return JSON.parse(JSON.stringify(this.stack[this.idx])); }
  canUndo() { return this.idx > 0; }
  canRedo() { return this.idx < this.stack.length - 1; }
}

// ─── ASCIIPLAYER CLASS ────────────────────────────────────────────────
export class AsciiPlayer {
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
    this.outputDest = null;
    this.fxBus = null; // To support delay/reverb sends from step overrides
    this.sandboxScope = dspScope;
  }
  _getDest() { return this.outputDest || (this.ctx && this.ctx.destination); }

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

  _getFreq(char, inst) { 
    if (inst && typeof inst.tune === 'number') {
      return Math.pow(2, (inst.tune - 69) / 12) * 440;
    }
    const f = charToPitch(char, 0, this.rootMidi, this.scaleIntervals); 
    return (f && !isNaN(f)) ? f : 261.63; // Safe default
  }
  _makeADSR(t, attack, decay, peak, inst) {
    const g = this.ctx.createGain();
    const preFade = 0.003;
    g.gain.value = 0;
    g.gain.setValueAtTime(0, t - preFade);
    g.gain.linearRampToValueAtTime(0, t);
    
    attack = Math.max(0.003, attack);
    
    if (inst.autoGate) {
      const sus = (inst.sustain !== undefined && !isNaN(inst.sustain)) ? inst.sustain : 0.6;
      const rel = Math.max(0.01, ((inst.release !== undefined && !isNaN(inst.release)) ? inst.release : 2.0) * (inst.releaseMod || 1.0));
      let gateT = (inst.gate !== undefined && !isNaN(inst.gate)) ? inst.gate : 0.4;
      if (inst.sustainTime !== undefined && inst.sustainTime > 0) gateT = inst.sustainTime;

      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.linearRampToValueAtTime(Math.max(0.001, peak * sus), t + attack + decay);
      g.gain.setValueAtTime(Math.max(0.001, peak * sus), t + attack + decay + gateT);
      g.gain.linearRampToValueAtTime(0, t + attack + decay + gateT + rel);
      g.stopTime = t + attack + decay + gateT + rel + 0.03;
    } else {
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.linearRampToValueAtTime(0, t + attack + Math.max(0.01, decay));
      g.stopTime = t + attack + decay + 0.05;
    }
    return g;
  }
  _connectChain(src, inst, t, dest) {
    let chain = src;


    if (inst.distortion) {
      const s = this.ctx.createWaveShaper(); s.curve = makeDistortionCurve(inst.distortion * 40);
      chain.connect(s); chain = s;
    }
    
    // Per-step Cutoff and Resonance override (skip if model has its own filter)
    if (!inst._noChainFilter && (inst.cutoff !== undefined || (inst.filter && inst.filter !== 'none'))) {
      const f = this.ctx.createBiquadFilter(); 
      f.type = inst.filter && inst.filter !== 'none' ? inst.filter : 'lowpass';

      const c = inst.cutoff !== undefined ? Number(inst.cutoff) : (f.type==='lowpass'?2000:f.type==='highpass'?3000:1500);
      f.frequency.setValueAtTime(Math.min(c || 2000, 20000), t);
      const res = inst.resonance !== undefined ? Number(inst.resonance) : (f.type==='lowpass'?1:5);
      f.Q.setValueAtTime(res || 1, t);
      chain.connect(f); chain = f;
    }

    // Glitch processing
    if (inst.glitchType && inst.glitchAmount) {
      const gAmt = Math.max(0.1, Math.min(2, Number(inst.glitchAmount) || 1));
      const gRate = 2 + gAmt * 18;
      if (inst.glitchType === 's') { // Stutter - square wave gain modulation
        const osc = this.ctx.createOscillator(); osc.type = 'square'; osc.frequency.setValueAtTime(gRate, t);
        const mg = this.ctx.createGain(); mg.gain.setValueAtTime(0.8, t);
        osc.connect(mg);
        const vca = this.ctx.createGain(); vca.gain.setValueAtTime(1, t);
        mg.connect(vca.gain);
        chain.connect(vca); chain = vca;
        osc.start(t);
      } else if (inst.glitchType === 'b') { // Bitcrush
        const bits = Math.max(1, Math.round(8 - gAmt * 7));
        const steps = Math.pow(2, bits);
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) curve[i] = Math.round((i/128-1)*steps)/steps;
        const ws = this.ctx.createWaveShaper(); ws.curve = curve;
        chain.connect(ws); chain = ws;
      } else if (inst.glitchType === 'r') { // Repeat - short delay with feedback
        const dl = this.ctx.createDelay(0.5); dl.delayTime.setValueAtTime(0.03 + gAmt * 0.08, t);
        const fb = this.ctx.createGain(); fb.gain.setValueAtTime(0.2 * gAmt, t);
        chain.connect(dl); dl.connect(fb); fb.connect(dl);
        const mx = this.ctx.createGain();
        chain.connect(mx); dl.connect(mx); chain = mx;
      } else if (inst.glitchType === 'x') { // Ring mod - amplitude modulation
        const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(gRate * 20, t);
        const mg = this.ctx.createGain(); mg.gain.setValueAtTime(0.5, t); osc.connect(mg);
        const vca = this.ctx.createGain(); vca.gain.setValueAtTime(1, t);
        mg.connect(vca.gain);
        chain.connect(vca); chain = vca;
        osc.start(t);
      } else if (inst.glitchType === 'n') { // Noise gate - random gain chops
        const vca = this.ctx.createGain();
        for (let s = 0; s < 100; s++) {
          const gt = t + s / gRate;
          vca.gain.setValueAtTime(Math.random() > 0.3 ? 1 : 0.05, gt);
          vca.gain.linearRampToValueAtTime(Math.random() > 0.3 ? 1 : 0.05, gt + 1/gRate);
        }
        chain.connect(vca); chain = vca;
      } else if (inst.glitchType === 'c') { // Chop - tremolo with sine LFO
        const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(gRate, t);
        const mg = this.ctx.createGain(); mg.gain.setValueAtTime(0.7 * gAmt, t); osc.connect(mg);
        const vca = this.ctx.createGain(); vca.gain.setValueAtTime(1, t);
        mg.connect(vca.gain);
        chain.connect(vca); chain = vca;
        osc.start(t);
      }
    }
    // Force stereo output: StereoPanner takes mono or stereo input and produces stereo output
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = (inst.pan !== undefined && !isNaN(inst.pan)) ? Math.max(-1, Math.min(1, inst.pan)) : 0;
      chain.connect(panner);
      chain = panner;
    }
    chain.connect(dest);
  }

  scheduleChar(char, inst, time) { // eslint-disable-line complexity
    if (!inst) return;
    const ctx = this.ctx, t = this.startTime + time;
    let attack = Math.max(0.001, (inst.attack || 0.01) * (inst.attackMod || 1.0));
    let decay = Math.max(0.01, (inst.decay || 0.1) * (inst.decayMod || 1.0));
    const velocity = (inst.velocity !== undefined && !isNaN(inst.velocity)) ? inst.velocity : 0.5;
    const baseAmp = velocity * 0.75;
    let freq = this._getFreq(char, inst);
    if (inst.subEmphasis || inst.subBass) freq *= 0.5;
    if (inst.highTick) freq *= 2.0;

    if (inst.addWhiteNoise || inst.addPinkNoise) {
      const nBuf = createNoiseBuffer(ctx, inst.addPinkNoise ? 'pink' : 'white');
      const nSrc = ctx.createBufferSource(); nSrc.buffer = nBuf;
      const nEnv = this._makeADSR(t, attack, decay * 0.5, (inst.noiseLevel||0.5)*baseAmp, inst);
      nSrc.connect(nEnv); this._connectChain(nEnv, inst, t, this._getDest());
      nSrc.start(t); nSrc.stop(nEnv.stopTime); this.scheduled.push(nSrc);
    }

    if (inst.type === 'α' || inst.type === 'alpha_synth') {
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.setValueAtTime(freq, t);
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.setValueAtTime(freq*0.5, t); o2.detune.setValueAtTime(10, t);
      const g = this._makeADSR(t, attack, decay, baseAmp, inst);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; 
      f.frequency.setValueAtTime(Math.min((inst.cutoff||800)*(inst.filterCutoff||1), 20000), t);
      if (inst.sweepUp) f.frequency.linearRampToValueAtTime(8000, t+decay);
      if (inst.sweepDown) f.frequency.linearRampToValueAtTime(100, t+decay);
      f.Q.setValueAtTime(inst.resonance || 5, t);
      o1.connect(f); o2.connect(f); f.connect(g); this._connectChain(g, { ...inst, cutoff: undefined, filter: undefined }, t, this._getDest());
      o1.start(t); o2.start(t); o1.stop(g.stopTime); o2.stop(g.stopTime); this.scheduled.push(o1, o2);
    } else if (inst.type === 'δ' || inst.type === 'delta_synth') {
      const sr = ctx.sampleRate; const len = Math.round(sr*0.02);
      const buf = ctx.createBuffer(2, len, sr); const dataL = buf.getChannelData(0); const dataR = buf.getChannelData(1);
      const morph = inst.morphAxis||0.5;
      for (let i = 0; i < len; i++) {
        const phase = i/len; const s = Math.sin(phase*Math.PI*2);
        const tr = 2*Math.abs(2*(phase-Math.floor(phase+0.5)))-1;
        const val = s*(1-morph*0.5)+tr*morph*0.5;
        dataL[i] = val; dataR[i] = val;
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.setValueAtTime(freq/55, t);
      const g = this._makeADSR(t, attack, decay, baseAmp, inst); src.connect(g); this._connectChain(g, inst, t, this._getDest());
      src.start(t); src.stop(g.stopTime); this.scheduled.push(src);
    } else if (inst.type === 'φ' || inst.type === 'phi_synth') {
      const carrier = ctx.createOscillator(); carrier.type = 'sine'; carrier.frequency.setValueAtTime(freq, t);
      const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(freq*(inst.harmonicRatio||2), t);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(freq*((inst.modIndex||5) * (inst.metallic?2:1)), t);
      mod.connect(mg); mg.connect(carrier.frequency);
      const g = this._makeADSR(t, attack, decay, baseAmp, inst); carrier.connect(g); this._connectChain(g, inst, t, this._getDest());
      mod.start(t); carrier.start(t); mod.stop(g.stopTime); carrier.stop(g.stopTime); this.scheduled.push(mod, carrier);
    } else if (inst.type === 'Σ' || inst.type === 'sigma_synth') {
      const partials = inst.harmonics ? Math.max(1, Math.round(inst.harmonics * 5)) : 5;
      const partialSum = ctx.createGain();
      for(let i=1; i<=partials; i++) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq*i, t);
        const amp = (baseAmp * 0.8) / i;
        const gg = this._makeADSR(t, attack, decay, amp, inst);
        o.connect(gg); gg.connect(partialSum); o.start(t); o.stop(gg.stopTime); this.scheduled.push(o);
      }
      this._connectChain(partialSum, inst, t, this._getDest());
    } else if (inst.type === 'γ' || inst.type === 'gamma_synth') {
      const densityFlag = inst.granularOverride || 0.5;
      const numGrains = Math.round((inst.density||densityFlag)*15); 
      const sharedNoise = createNoiseBuffer(ctx, 'white');
      for (let g=0;g<numGrains;g++) { 
        const gt=t+Math.random()*0.15; const gLen=0.01+Math.random()*0.03; 
        const src=ctx.createBufferSource(); src.buffer=sharedNoise; src.loop=true; 
        const gG=this._makeADSR(gt, 0.001, gLen, baseAmp*0.3, inst); 
        src.connect(gG); this._connectChain(gG, inst, t, this._getDest()); src.start(gt); this.scheduled.push(src); 
      }
    } else if (inst.type === 'ω' || inst.type === 'omega_synth') {
      const buf = createNoiseBuffer(ctx, inst.color||'pink'); const src = ctx.createBufferSource(); src.buffer = buf;
      const g = this._makeADSR(t, attack, decay, baseAmp, inst); 
      const f1 = ctx.createBiquadFilter(); f1.type='bandpass'; f1.frequency.setValueAtTime(freq*2, t); f1.Q.setValueAtTime(inst.resonance||8, t);
      const f2 = ctx.createBiquadFilter(); f2.type='highpass'; f2.frequency.setValueAtTime(4000, t);
      src.connect(f1); f1.connect(f2); f2.connect(g); this._connectChain(g, { ...inst, cutoff: undefined, filter: undefined }, t, this._getDest()); 
      src.start(t); src.stop(g.stopTime); this.scheduled.push(src);
    } else if (inst.type === 'π' || inst.type === 'pi_synth') {
      const sr=ctx.sampleRate; const delayLen=Math.max(1, Math.round(sr/(freq||20))); 
      const buf=ctx.createBuffer(2,delayLen,sr); const dL=buf.getChannelData(0); const dR=buf.getChannelData(1); 
      for(let i=0;i<delayLen;i++) {
        const v = (Math.random()*2-1)*0.5;
        dL[i] = v; dR[i] = v;
      }
      const src=ctx.createBufferSource(); src.buffer=buf; src.loop=false; 
      const delay=ctx.createDelay(Math.max(1, delayLen/sr + 0.1)); delay.delayTime.setValueAtTime(delayLen/sr, t); 
      const fb=ctx.createGain(); fb.gain.setValueAtTime(0.8, t); 
      const g=this._makeADSR(t, 0.005, decay||1.5, baseAmp, inst); 
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(3000, t); filter.Q.setValueAtTime(0.5, t);
      src.connect(delay); delay.connect(filter); filter.connect(fb); fb.connect(delay); delay.connect(g); this._connectChain(g, { ...inst, cutoff: undefined, filter: undefined }, t, this._getDest()); 
      src.start(t); src.stop(g.stopTime); this.scheduled.push(src);
    } else if (inst.type === 'τ' || inst.type === 'tau_synth') {
      const model = inst.model || 1;
      const startFreq = Math.max(30, inst.toneFreq || freq || 55);
      const dec = Math.max(0.1, decay || 0.6);
      const mergedInst = { ...inst, distortion: (inst.distortion || 0) + 0.05 };

      if (model === 2) {
        // Digital kick: square wave body with fast decay
        const o = ctx.createOscillator(); o.type = 'square';
        o.frequency.setValueAtTime(startFreq * 2.0, t);
        o.frequency.exponentialRampToValueAtTime(startFreq, t + 0.02);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, startFreq * 0.4), t + dec);
        const g = this._makeADSR(t, 0.001, dec * 0.6, baseAmp * 0.9, mergedInst);
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 3) {
        // FM kick: carrier modulated by a fast sine
        const car = ctx.createOscillator(); car.type = 'sine';
        car.frequency.setValueAtTime(startFreq * 2.0, t);
        car.frequency.exponentialRampToValueAtTime(startFreq, t + 0.03);
        const mod = ctx.createOscillator(); mod.type = 'sine';
        mod.frequency.setValueAtTime(startFreq * 3.0, t);
        mod.frequency.exponentialRampToValueAtTime(startFreq * 0.5, t + dec);
        const mg = ctx.createGain(); mg.gain.setValueAtTime(startFreq * 2.0, t);
        mg.gain.exponentialRampToValueAtTime(0.001, t + dec);
        mod.connect(mg); mg.connect(car.frequency);
        const g = this._makeADSR(t, 0.001, dec, baseAmp * 0.9, mergedInst);
        car.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        car.start(t); mod.start(t); car.stop(g.stopTime); mod.stop(g.stopTime); this.scheduled.push(car, mod);
      } else if (model === 4) {
        // Modular kick: noise through resonant lowpass sweep
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf; ns.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass';
        f.frequency.setValueAtTime(2000, t);
        f.frequency.exponentialRampToValueAtTime(40, t + dec);
        f.Q.setValueAtTime(10, t);
        const g = this._makeADSR(t, 0.001, dec, baseAmp * 0.75, mergedInst);
        ns.connect(f); f.connect(g); this._connectChain(g, { ...mergedInst, cutoff: undefined, filter: undefined }, t, this._getDest());
        ns.start(t); ns.stop(g.stopTime); this.scheduled.push(ns);
      } else if (model === 5) {
        // Granular kick: noise burst clusters
        const numGrains = 6;
        for (let gi = 0; gi < numGrains; gi++) {
          const gt = t + Math.random() * 0.04;
          const glen = 0.01 + Math.random() * 0.03;
          const buf = createNoiseBuffer(ctx, 'white');
          const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
          const gGain = this._makeADSR(gt, 0.001, glen, baseAmp * 0.9, mergedInst);
          src.connect(gGain); this._connectChain(gGain, mergedInst, t, this._getDest());
          src.start(gt); this.scheduled.push(src);
        }
      } else if (model === 6) {
        // Unstable kick: pitch jitter
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(Math.max(250, startFreq * 4.0), t);
        o.frequency.exponentialRampToValueAtTime(startFreq, t + 0.03);
        for (let ji = 0; ji < 8; ji++) {
          const jt = t + 0.03 + ji * dec / 8;
          const jitter = startFreq * (0.8 + Math.random() * 0.6);
          o.frequency.setValueAtTime(jitter, jt);
          o.frequency.exponentialRampToValueAtTime(Math.max(20, startFreq * 0.4), jt + dec / 8);
        }
        const g = this._makeADSR(t, 0.001, dec, baseAmp * 0.9, mergedInst);
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 7) {
        // Tick percussion: short click
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.setValueAtTime(startFreq, t);
        const g = this._makeADSR(t, 0.001, 0.04, baseAmp * 0.9, mergedInst);
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 8) {
        // Triangle tick
        const o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.setValueAtTime(startFreq * 2.0, t);
        o.frequency.exponentialRampToValueAtTime(startFreq, t + 0.02);
        const g = this._makeADSR(t, 0.001, 0.06, baseAmp * 0.75, mergedInst);
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 9) {
        // Tuned synth tom
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(startFreq * 1.5, t);
        o.frequency.exponentialRampToValueAtTime(startFreq, t + 0.04);
        o.frequency.exponentialRampToValueAtTime(startFreq * 0.8, t + dec);
        const g = this._makeADSR(t, 0.002, dec * 0.8, baseAmp * 0.9, mergedInst);
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else {
        // model=1 or default: Classic analog kick (sine + click)
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(Math.max(250, startFreq * 4.0), t);
        o.frequency.exponentialRampToValueAtTime(startFreq, t + 0.03);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, startFreq * 0.6), t + dec);
        const g = this._makeADSR(t, 0.001, dec, baseAmp * 0.9, mergedInst);
        const clickOsc = ctx.createOscillator(); clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(3000, t);
        clickOsc.frequency.exponentialRampToValueAtTime(100, t + 0.015);
        const clickGain = this._makeADSR(t, 0.001, 0.015, baseAmp * 0.45, mergedInst);
        const fClick = ctx.createBiquadFilter(); fClick.type = 'highpass'; fClick.frequency.setValueAtTime(1000, t);
        clickOsc.connect(fClick); fClick.connect(clickGain); this._connectChain(clickGain, { ...mergedInst, cutoff: undefined, filter: undefined }, t, this._getDest());
        o.connect(g); this._connectChain(g, mergedInst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); clickOsc.start(t); clickOsc.stop(clickGain.stopTime); this.scheduled.push(o, clickOsc);
      }
    } else if (inst.type === 'w' || inst.type === 'w_synth') {
      const model = inst.model || 1;
      const dec = Math.max(0.05, decay || 0.15);

      if (model === 1 || model === 2) {
        // Snare / Binary snare: noise + tone
        const buf = createNoiseBuffer(ctx, inst.color || 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 2500, t);
        f.Q.setValueAtTime(inst.resonance || 1.5, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.5, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const toneOsc = ctx.createOscillator();
        toneOsc.type = model === 2 ? 'square' : 'triangle';
        const tFreq = inst.toneFreq || 200;
        toneOsc.frequency.setValueAtTime(tFreq * 2.0, t);
        toneOsc.frequency.exponentialRampToValueAtTime(tFreq, t + 0.03);
        const tg = this._makeADSR(t, 0.001, dec * 0.5, baseAmp * 0.3, inst);
        const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.setValueAtTime(3000, t);
        toneOsc.connect(tf); tf.connect(tg); this._connectChain(tg, { ...inst, _noChainFilter: true }, t, this._getDest());
        toneOsc.start(t); toneOsc.stop(tg.stopTime); this.scheduled.push(toneOsc);
      } else if (model === 3) {
        // Closed hat: short high noise
        const buf = createNoiseBuffer(ctx, inst.color || 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'highpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 7000, t);
        const ng = this._makeADSR(t, 0.001, dec * 0.4, baseAmp * 0.5, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
      } else if (model === 4) {
        // Metal hat: noise + metallic ring
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'highpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 8000, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.5, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const ringOsc = ctx.createOscillator(); ringOsc.type = 'square';
        const rFreq = inst.toneFreq || 8000;
        ringOsc.frequency.setValueAtTime(rFreq, t);
        ringOsc.frequency.exponentialRampToValueAtTime(rFreq * 0.5, t + dec);
        const rg = this._makeADSR(t, 0.001, dec, baseAmp * 0.3, inst);
        const rf = ctx.createBiquadFilter(); rf.type = 'highpass'; rf.frequency.setValueAtTime(6000, t);
        ringOsc.connect(rf); rf.connect(rg); this._connectChain(rg, { ...inst, _noChainFilter: true }, t, this._getDest());
        ringOsc.start(t); ringOsc.stop(rg.stopTime); this.scheduled.push(ringOsc);
      } else if (model === 5) {
        // Jitter snare: randomized noise bursts
        for (let ji = 0; ji < 4; ji++) {
          const jt = t + Math.random() * dec * 0.5;
          const jlen = 0.01 + Math.random() * 0.04;
          const buf = createNoiseBuffer(ctx, 'white');
          const jsrc = ctx.createBufferSource(); jsrc.buffer = buf; jsrc.loop = true;
          const jf = ctx.createBiquadFilter(); jf.type = 'bandpass';
          jf.frequency.setValueAtTime(1500 + Math.random() * 2000, t);
          jf.Q.setValueAtTime(1 + Math.random() * 3, t);
          const jg = this._makeADSR(jt, 0.001, jlen, baseAmp * 0.6, inst);
          jsrc.connect(jf); jf.connect(jg); this._connectChain(jg, { ...inst, _noChainFilter: true }, t, this._getDest());
          jsrc.start(jt); this.scheduled.push(jsrc);
        }
      } else if (model === 6) {
        // Ring snare: tone + noise
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.setValueAtTime(2000, t); f.Q.setValueAtTime(2, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.6, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const toneOsc = ctx.createOscillator(); toneOsc.type = 'sine';
        const tFreq = inst.toneFreq || 400;
        toneOsc.frequency.setValueAtTime(tFreq, t);
        toneOsc.frequency.exponentialRampToValueAtTime(tFreq * 0.8, t + dec * 0.8);
        const tg = this._makeADSR(t, 0.001, dec * 0.8, baseAmp * 0.5, inst);
        toneOsc.connect(tg); this._connectChain(tg, inst, t, this._getDest());
        toneOsc.start(t); toneOsc.stop(tg.stopTime); this.scheduled.push(toneOsc);
      } else if (model === 7) {
        // Zonal snare: layered
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.setValueAtTime(1500, t); f.Q.setValueAtTime(3, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.6, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const buf2 = createNoiseBuffer(ctx, 'pink');
        const ns2 = ctx.createBufferSource(); ns2.buffer = buf2;
        const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass';
        f2.frequency.setValueAtTime(500, t);
        const ng2 = this._makeADSR(t, 0.002, dec * 0.7, baseAmp * 0.4, inst);
        ns2.connect(f2); f2.connect(ng2); this._connectChain(ng2, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns2.start(t); ns2.stop(ng2.stopTime); this.scheduled.push(ns2);
      } else if (model === 8) {
        // String (KS): karplus-strong pluck
        const sr = ctx.sampleRate;
        const delayLen = Math.max(1, Math.round(sr / (inst.toneFreq || 440)));
        const buf = ctx.createBuffer(2, delayLen, sr);
        const dL = buf.getChannelData(0); const dR = buf.getChannelData(1);
        for (let i = 0; i < delayLen; i++) { const v = (Math.random() * 2 - 1) * 0.5; dL[i] = v; dR[i] = v; }
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const delay = ctx.createDelay(Math.max(1, delayLen / sr + 0.1));
        delay.delayTime.setValueAtTime(delayLen / sr, t);
        const fb = ctx.createGain(); fb.gain.setValueAtTime(0.92, t);
        const g = this._makeADSR(t, 0.005, dec * 3, baseAmp, inst);
        const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(3000, t);
        src.connect(delay); delay.connect(filter); filter.connect(fb); fb.connect(delay);
        delay.connect(g); this._connectChain(g, { ...inst, _noChainFilter: true }, t, this._getDest());
        src.start(t); src.stop(g.stopTime); this.scheduled.push(src);
      } else if (model === 9) {
        // Open hat: long noise decay
        const buf = createNoiseBuffer(ctx, inst.color || 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'highpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 5000, t);
        const ng = this._makeADSR(t, 0.001, dec * 1.5, baseAmp * 0.5, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
      } else if (model === 10) {
        // Harmonic hat: tone + noise
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'highpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 7000, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.4, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const toneOsc = ctx.createOscillator(); toneOsc.type = 'sine';
        toneOsc.frequency.setValueAtTime(inst.toneFreq || 6000, t);
        const tg = this._makeADSR(t, 0.001, dec * 0.8, baseAmp * 0.25, inst);
        toneOsc.connect(tg); this._connectChain(tg, inst, t, this._getDest());
        toneOsc.start(t); toneOsc.stop(tg.stopTime); this.scheduled.push(toneOsc);
      } else if (model === 11) {
        // Clap / Granular clap: layered noise bursts
        for (let ci = 0; ci < 4; ci++) {
          const ct = t + ci * 0.01 + Math.random() * 0.008;
          const clen = 0.02 + Math.random() * 0.03;
          const buf = createNoiseBuffer(ctx, 'white');
          const csrc = ctx.createBufferSource(); csrc.buffer = buf; csrc.loop = false;
          const cf = ctx.createBiquadFilter(); cf.type = 'bandpass';
          cf.frequency.setValueAtTime(2000, t); cf.Q.setValueAtTime(1, t);
          const cg = this._makeADSR(ct, 0.001, clen, baseAmp * 0.5, inst);
          csrc.connect(cf); cf.connect(cg); this._connectChain(cg, { ...inst, _noChainFilter: true }, t, this._getDest());
          csrc.start(ct); this.scheduled.push(csrc);
        }
      } else if (model === 12) {
        // Bongo: tone hit
        const o = ctx.createOscillator(); o.type = 'triangle';
        const tFreq = inst.toneFreq || 300;
        o.frequency.setValueAtTime(tFreq * 1.5, t);
        o.frequency.exponentialRampToValueAtTime(tFreq, t + 0.01);
        o.frequency.exponentialRampToValueAtTime(tFreq * 0.6, t + dec * 0.1);
        const g = this._makeADSR(t, 0.001, dec * 0.8, baseAmp * 0.9, inst);
        o.connect(g); this._connectChain(g, inst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 13) {
        // Formant perc: filtered noise with vocal formant shape
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass';
        f1.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 800, t);
        f1.Q.setValueAtTime(5, t);
        const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass';
        f2.frequency.setValueAtTime((inst.toneFreq || 400) * 2, t);
        f2.Q.setValueAtTime(5, t);
        const ng = this._makeADSR(t, 0.01, dec * 1.5, baseAmp * 0.6, inst);
        ns.connect(f1); f1.connect(f2); f2.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
      } else if (model === 14) {
        // Dual / Layered perc: two tones + noise
        const o1 = ctx.createOscillator(); o1.type = 'sine';
        o1.frequency.setValueAtTime(inst.toneFreq || 300, t);
        o1.frequency.exponentialRampToValueAtTime((inst.toneFreq || 300) * 0.5, t + dec);
        const g1 = this._makeADSR(t, 0.001, dec, baseAmp * 0.6, inst);
        o1.connect(g1); this._connectChain(g1, inst, t, this._getDest());
        o1.start(t); o1.stop(g1.stopTime); this.scheduled.push(o1);
        const o2 = ctx.createOscillator(); o2.type = 'triangle';
        o2.frequency.setValueAtTime((inst.toneFreq || 300) * 1.5, t);
        const g2 = this._makeADSR(t, 0.002, dec * 0.5, baseAmp * 0.4, inst);
        o2.connect(g2); this._connectChain(g2, inst, t, this._getDest());
        o2.start(t); o2.stop(g2.stopTime); this.scheduled.push(o2);
      } else if (model === 15) {
        // Impulse: single click
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(1000, t);
        const g = this._makeADSR(t, 0.001, 0.02, baseAmp * 0.9, inst);
        o.connect(g); this._connectChain(g, inst, t, this._getDest());
        o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
      } else if (model === 16) {
        // Noise perc: colored filtered noise
        const buf = createNoiseBuffer(ctx, inst.color || 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = inst.filter || 'highpass';
        f.frequency.setValueAtTime(inst.filterCutoff ? inst.filterCutoff * 8000 : 5000, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.5, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
      } else if (model === 17) {
        // Vector perc: FM sweep
        const car = ctx.createOscillator(); car.type = 'sine';
        car.frequency.setValueAtTime(inst.toneFreq || 500, t);
        car.frequency.exponentialRampToValueAtTime((inst.toneFreq || 500) * 2, t + dec);
        const mod = ctx.createOscillator(); mod.type = 'sine';
        mod.frequency.setValueAtTime(200, t);
        mod.frequency.exponentialRampToValueAtTime(800, t + dec * 0.5);
        const mg = ctx.createGain(); mg.gain.setValueAtTime(300, t);
        mg.gain.exponentialRampToValueAtTime(0.001, t + dec);
        mod.connect(mg); mg.connect(car.frequency);
        const g = this._makeADSR(t, 0.001, dec, baseAmp * 0.75, inst);
        car.connect(g); this._connectChain(g, inst, t, this._getDest());
        car.start(t); mod.start(t); car.stop(g.stopTime); mod.stop(g.stopTime); this.scheduled.push(car, mod);
      } else {
        // model=1 (fallback): classic snare noise+triangle
        const buf = createNoiseBuffer(ctx, 'white');
        const ns = ctx.createBufferSource(); ns.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass';
        f.frequency.setValueAtTime(2500, t); f.Q.setValueAtTime(1.5, t);
        const ng = this._makeADSR(t, 0.001, dec, baseAmp * 0.75, inst);
        ns.connect(f); f.connect(ng); this._connectChain(ng, { ...inst, _noChainFilter: true }, t, this._getDest());
        ns.start(t); ns.stop(ng.stopTime); this.scheduled.push(ns);
        const toneOsc = ctx.createOscillator(); toneOsc.type = 'triangle';
        const tFreq = inst.toneFreq || 200;
        toneOsc.frequency.setValueAtTime(tFreq * 2.0, t);
        toneOsc.frequency.exponentialRampToValueAtTime(tFreq, t + 0.03);
        const tg = this._makeADSR(t, 0.001, dec * 0.5, baseAmp * 0.4, inst);
        const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.setValueAtTime(3000, t);
        toneOsc.connect(tf); tf.connect(tg); this._connectChain(tg, { ...inst, _noChainFilter: true }, t, this._getDest());
        toneOsc.start(t); toneOsc.stop(tg.stopTime); this.scheduled.push(toneOsc);
      }
    } else if (inst.type === 'sandbox_math' && inst.funcStr) {
      const sr = ctx.sampleRate;
      const totalLen = Math.max(0.05, attack + Math.max(decay, 0.2) + (inst.gate||0.4) + (inst.release||0.8));
      const bufLen = Math.ceil(sr * totalLen);
      if (bufLen > 0) {
        const buf = ctx.createBuffer(2, bufLen, sr);
        const dataL = buf.getChannelData(0);
        const dataR = buf.getChannelData(1);
        
        let dspFunc;
        try {
          const funcBody = 'with(scope){return(' + inst.funcStr + ')}';
          dspFunc = new Function('scope', funcBody);
        } catch(e) {
          let hash = 0;
          const str = inst.funcStr || '';
          for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
          hash = (Math.abs(hash) % 800) + 200;
          dspFunc = (s) => Math.sin(s.t * s.f * 2 * Math.PI) * Math.sin(s.t * hash);
        }

        const mutableScope = { t: 0, f: freq * Math.pow(2, inst.octave || 0), ...this.sandboxScope };
        const safeScope = new Proxy(mutableScope, {
          get(target, prop) {
            if (prop === Symbol.unscopables) return undefined;
            return prop in target ? target[prop] : 0;
          },
          has(target, prop) { return true; }
        });

        for (let i = 0; i < bufLen; i++) {
          mutableScope.t = i / sr;
          let val;
          try {
            val = dspFunc(safeScope);
          } catch(e) {
            val = Math.sin(mutableScope.t * mutableScope.f * 2 * Math.PI);
          }
          if (!isFinite(val) || isNaN(val)) val = 0;
          dataL[i] = Math.max(-1, Math.min(1, val));
          dataR[i] = Math.max(-1, Math.min(1, val));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        const fg = Math.min(1, baseAmp * 0.9);
        const fadeMs = 0.0007;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(fg, t + fadeMs);
        g.gain.setValueAtTime(fg, t + totalLen - fadeMs);
        g.gain.linearRampToValueAtTime(0, t + totalLen);
        g.stopTime = t + totalLen;
        src.connect(g);
        this._connectChain(g, inst, t, this._getDest());
        src.start(t); src.stop(g.stopTime + 0.05); this.scheduled.push(src);
        }
      } else {
      // Fallback
      const o = ctx.createOscillator(); o.type = inst.wave||'sine'; o.frequency.setValueAtTime(freq, t);
      const g = this._makeADSR(t, attack, decay, baseAmp, inst); this._connectChain(g, inst, t, this._getDest()); 
      o.connect(g); o.start(t); o.stop(g.stopTime); this.scheduled.push(o);
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

// ─── HELLENIC CHANNEL TYPES ───────────────────────────────────────────
const HELLENIC_TYPES = {
  'α':{type:'alpha_synth',wave:'sawtooth',attack:0.05,decay:0.6,harmonics:1.5,desc:'Analog Subtractive (Saw+Square)'},
  'δ':{type:'delta_synth',wave:'sine',attack:0.01,decay:0.4,harmonics:0.5,distortion:0.8,desc:'Digital Wavetable (Morph)'},
  'φ':{type:'phi_synth',wave:'sine',attack:0.01,decay:0.5,harmonics:1.0,modIndex:4.0,harmonicRatio:2.0,desc:'FM Synthesis (2-Op)'},
  'Σ':{type:'sigma_synth',wave:'sine',attack:0.1,decay:0.8,harmonics:8.0,desc:'Additive Spectral (Partials)'},
  'γ':{type:'gamma_synth',wave:'sawtooth',attack:0.02,decay:0.5,harmonics:2.0,resonance:4,desc:'Granular Engine (Grains)'},
  'ω':{type:'omega_synth',color:'pink',attack:0.002,decay:0.3,resonance:8,desc:'Chaotic Noise Resonator'},
  'π':{type:'pi_synth',material:'nylon',attack:0.001,decay:1.2,harmonics:0.5,desc:'Physical Modeling (Karplus-Strong)'},
  'τ':{type:'tau_synth',toneFreq:60,clickFreq:800,attack:0.001,decay:0.3,pitchEnv:{rise:0.0001,fall:0.01},bodyMix:0.3,harmonics:0.8,filter:'lowpass',resonance:3,autoGate:false,desc:'Transistor Percussion (Analog Drums)'},
  'w':{type:'w_synth',wave:'noise',color:'white',attack:0.001,decay:0.15,filter:'bandpass',resonance:4,autoGate:false,desc:'Noise Percussion (Drum Hits)'},
};

// Merge Hellenic channel types into ASCII_DICTIONARY
Object.entries(HELLENIC_TYPES).forEach(([char, data]) => {
  ASCII_DICTIONARY[char] = data;
});

// ─── HELLENIC MODEL PRESETS ──────────────────────────────────────────
// Each entry is a named preset (parameter set) for its Hellenic engine type.
// The 'model' key sets the drum algorithm number for τ/w. All other keys
// are channel/engine parameters merged when the preset is selected.
const HELLENIC_MODELS = {
  'α': [
    { name:'Saw Lead',         params:{model:1, attack:0.02, decay:1.2, sustain:0.7, release:1.5, harmonics:0.5, cutoff:5000, resonance:2 }},
    { name:'Square Bass',      params:{model:2, attack:0.01, decay:0.9, sustain:0.4, release:0.8, harmonics:1.0, cutoff:1500, resonance:4 }},
    { name:'Acid 303',         params:{model:3, attack:0.05, decay:1.5, sustain:0.8, release:1.8, harmonics:2.0, cutoff:800,  resonance:8, sweepUp:true }},
    { name:'Detuned Saws',     params:{model:4, attack:0.03, decay:1.8, sustain:0.9, release:2.5, harmonics:3.0, cutoff:6000, resonance:1 }},
    { name:'Pulse Bass',       params:{model:5, attack:0.005,decay:0.6, sustain:0.3, release:0.5, harmonics:0.3, cutoff:1200, resonance:3 }},
    { name:'Brass',            params:{model:6, attack:0.08, decay:1.0, sustain:0.6, release:1.2, harmonics:1.5, cutoff:4000, resonance:5 }},
    { name:'Fat Unison',       params:{model:7, attack:0.02, decay:1.5, sustain:0.8, release:2.0, harmonics:4.0, cutoff:5000, resonance:2 }},
    { name:'Pluck',            params:{model:8, attack:0.001,decay:0.4, sustain:0.0, release:0.3, harmonics:0.8, cutoff:7000, resonance:1 }},
    { name:'Hoover',           params:{model:9, attack:0.01, decay:0.8, sustain:0.6, release:1.0, harmonics:5.0, cutoff:3000, resonance:6, sweepDown:true }},
    { name:'Wobble Bass',      params:{model:10,attack:0.005,decay:1.2, sustain:0.7, release:1.0, harmonics:2.0, cutoff:400,  resonance:7, sweepUp:true }},
  ],
  'δ': [
    { name:'Digital Pad',      params:{morphAxis:0.3, attack:0.3,  decay:1.5, sustain:0.9, release:3.0, harmonics:0.5, cutoff:4000 }},
    { name:'Morph Bell',       params:{morphAxis:0.7, attack:0.001,decay:0.6, sustain:0.2, release:1.0, harmonics:0.3, cutoff:8000 }},
    { name:'Sweep',            params:{morphAxis:0.9, attack:0.05, decay:1.0, sustain:0.5, release:1.5, harmonics:2.0, cutoff:6000 }},
    { name:'Glass',            params:{morphAxis:0.5, attack:0.01, decay:0.8, sustain:0.4, release:1.8, harmonics:3.0, cutoff:10000 }},
    { name:'Ethereal',         params:{morphAxis:0.2, attack:0.5,  decay:2.0, sustain:0.9, release:4.0, harmonics:0.8, cutoff:3000 }},
    { name:'Vox',              params:{morphAxis:0.8, attack:0.02, decay:0.5, sustain:0.6, release:1.2, harmonics:4.0, cutoff:5000 }},
    { name:'Wide Keys',        params:{morphAxis:0.4, attack:0.005,decay:0.7, sustain:0.5, release:1.0, harmonics:1.5, cutoff:7000 }},
    { name:'Riser',            params:{morphAxis:1.0, attack:0.1,  decay:2.0, sustain:0.8, release:2.5, harmonics:5.0, cutoff:8000 }},
  ],
  'φ': [
    { name:'FM Bass',          params:{harmonicRatio:1.0, modIndex:2.0,  attack:0.005,decay:0.5, sustain:0.3, release:0.6, cutoff:2000 }},
    { name:'FM Bell',          params:{harmonicRatio:2.0, modIndex:6.0,  attack:0.001,decay:0.8, sustain:0.1, release:1.5, cutoff:8000 }},
    { name:'FM Brass',         params:{harmonicRatio:1.5, modIndex:3.0,  attack:0.05, decay:0.6, sustain:0.5, release:0.8, cutoff:4000 }},
    { name:'FM Pad',           params:{harmonicRatio:2.0, modIndex:4.0,  attack:0.3,  decay:1.5, sustain:0.9, release:3.0, cutoff:5000 }},
    { name:'FM Perc',          params:{harmonicRatio:3.0, modIndex:8.0,  attack:0.001,decay:0.15,sustain:0.0, release:0.1, cutoff:10000 }},
    { name:'FM E.Piano',      params:{harmonicRatio:1.5, modIndex:5.0,  attack:0.01, decay:0.8, sustain:0.4, release:1.2, cutoff:6000 }},
    { name:'FM Organ',         params:{harmonicRatio:2.5, modIndex:3.5,  attack:0.02, decay:0.3, sustain:0.8, release:0.5, cutoff:4000 }},
    { name:'FM Metallic',      params:{harmonicRatio:4.0, modIndex:7.0, metallic:true, attack:0.001,decay:0.6, sustain:0.2, release:1.0, cutoff:8000 }},
  ],
  'Σ': [
    { name:'Soft Pad',         params:{harmonics:3,  attack:0.4,  decay:1.5, sustain:0.9, release:3.0, cutoff:3000 }},
    { name:'Bright Keys',      params:{harmonics:8,  attack:0.01, decay:0.6, sustain:0.5, release:1.0, cutoff:7000 }},
    { name:'Reed',             params:{harmonics:5,  attack:0.03, decay:0.4, sustain:0.6, release:0.8, cutoff:4000 }},
    { name:'Brass Section',    params:{harmonics:7,  attack:0.06, decay:0.8, sustain:0.7, release:1.2, cutoff:5000 }},
    { name:'Glass Pad',        params:{harmonics:10, attack:0.2,  decay:1.8, sustain:0.8, release:2.5, cutoff:6000 }},
    { name:'Bowed',            params:{harmonics:6,  attack:0.5,  decay:2.0, sustain:0.9, release:3.5, cutoff:2500, resonance:3 }},
    { name:'Choir',            params:{harmonics:12, attack:0.1,  decay:1.0, sustain:0.8, release:2.0, cutoff:5000 }},
    { name:'Organ',            params:{harmonics:9,  attack:0.01, decay:0.2, sustain:0.9, release:0.3, cutoff:4000 }},
  ],
  'γ': [
    { name:'Cloud Pad',        params:{density:8,  attack:0.4,  decay:2.0, sustain:0.9, release:4.0, cutoff:3000 }},
    { name:'Shimmer',          params:{density:12, attack:0.1,  decay:1.5, sustain:0.7, release:2.5, cutoff:7000 }},
    { name:'Scatter',          params:{density:4,  attack:0.01, decay:0.3, sustain:0.2, release:0.5, cutoff:5000 }},
    { name:'Swarm',            params:{density:15, attack:0.05, decay:0.8, sustain:0.5, release:1.0, cutoff:4000, resonance:5 }},
    { name:'Textures',         params:{density:6,  attack:0.2,  decay:1.2, sustain:0.6, release:2.0, cutoff:2000 }},
    { name:'Bubble',           params:{density:10, attack:0.001,decay:0.2, sustain:0.0, release:0.3, cutoff:6000 }},
    { name:'Wind',             params:{density:3,  attack:0.8,  decay:2.5, sustain:0.9, release:4.0, cutoff:1500 }},
    { name:'Granular Bass',    params:{density:6,  attack:0.01, decay:0.6, sustain:0.4, release:0.8, cutoff:800 }},
  ],
  'ω': [
    { name:'Wind',             params:{color:'pink', attack:0.5,  decay:2.0, sustain:0.9, release:3.0, resonance:4 }},
    { name:'Crackle',          params:{color:'white',attack:0.001,decay:0.2, sustain:0.0, release:0.3, resonance:6 }},
    { name:'Rumble',           params:{color:'brown',attack:0.05, decay:1.0, sustain:0.5, release:1.5, resonance:8 }},
    { name:'Sweep',            params:{color:'pink', attack:0.1,  decay:0.8, sustain:0.4, release:1.0, resonance:10 }},
    { name:'Breath',           params:{color:'white',attack:0.01, decay:0.4, sustain:0.3, release:0.6, resonance:2 }},
    { name:'Static',           params:{color:'white',attack:0.001,decay:0.05,sustain:0.0, release:0.05,resonance:1 }},
    { name:'Sub Rumble',       params:{color:'brown',attack:0.1,  decay:2.0, sustain:0.8, release:3.0, resonance:12 }},
    { name:'Burst',            params:{color:'pink', attack:0.001,decay:0.1, sustain:0.0, release:0.15,resonance:3 }},
  ],
  'π': [
    { name:'Nylon Guitar',     params:{material:'nylon',attack:0.001,decay:1.2, sustain:0.3, release:1.5, harmonics:0.3, cutoff:4000 }},
    { name:'Steel String',     params:{material:'steel',attack:0.001,decay:1.0, sustain:0.4, release:1.2, harmonics:0.5, cutoff:6000 }},
    { name:'Bass Pluck',       params:{material:'bass', attack:0.002,decay:0.8, sustain:0.2, release:0.6, harmonics:0.2, cutoff:1500 }},
    { name:'Harp',             params:{material:'nylon',attack:0.001,decay:2.0, sustain:0.5, release:2.5, harmonics:0.8, cutoff:7000 }},
    { name:'Pizzicato',        params:{material:'steel',attack:0.001,decay:0.3, sustain:0.0, release:0.2, harmonics:0.4, cutoff:5000 }},
    { name:'Bowed Bass',       params:{material:'bass', attack:0.3,  decay:1.5, sustain:0.8, release:2.0, harmonics:0.5, cutoff:2000 }},
    { name:'Koto',             params:{material:'steel',attack:0.002,decay:1.5, sustain:0.3, release:2.0, harmonics:1.0, cutoff:6000 }},
    { name:'Bell Pluck',       params:{material:'nylon',attack:0.001,decay:1.8, sustain:0.2, release:2.0, harmonics:1.5, cutoff:8000 }},
  ],
  'τ': [
    { name:'Classic Kick',     params:{model:1,  toneFreq:60,  clickFreq:800,  decay:0.3,  pitchEnv:{rise:0.0001,fall:0.01}, bodyMix:0.3 }},
    { name:'Digital Kick',     params:{model:2,  toneFreq:55,  clickFreq:0,    decay:0.25, pitchEnv:{rise:0.0001,fall:0.008},bodyMix:0.1 }},
    { name:'FM Kick',          params:{model:3,  toneFreq:50,  clickFreq:0,    decay:0.3,  pitchEnv:{rise:0.0001,fall:0.01}, bodyMix:0.0 }},
    { name:'Modular Kick',     params:{model:4,  toneFreq:40,  clickFreq:0,    decay:0.35, pitchEnv:{rise:0.0001,fall:0.012},bodyMix:0.0 }},
    { name:'Granular Kick',    params:{model:5,  toneFreq:55,  clickFreq:0,    decay:0.3,  pitchEnv:{rise:0.0001,fall:0.01}, bodyMix:0.0 }},
    { name:'Unstable Kick',    params:{model:6,  toneFreq:60,  clickFreq:0,    decay:0.3,  pitchEnv:{rise:0.0001,fall:0.01}, bodyMix:0.2 }},
    { name:'Tick',             params:{model:7,  toneFreq:200, clickFreq:0,    decay:0.05, pitchEnv:{rise:0.0001,fall:0.005},bodyMix:0.0 }},
    { name:'Triangle Tick',    params:{model:8,  toneFreq:300, clickFreq:0,    decay:0.06, pitchEnv:{rise:0.0001,fall:0.008},bodyMix:0.0 }},
    { name:'Tuned Tom',        params:{model:9,  toneFreq:100, clickFreq:0,    decay:0.5,  pitchEnv:{rise:0.0002,fall:0.02}, bodyMix:0.2 }},
    { name:'808 Kick',         params:{model:1,  toneFreq:50,  clickFreq:600,  decay:0.45, pitchEnv:{rise:0.0002,fall:0.015},bodyMix:0.4, resonance:5, cutoff:3000 }},
    { name:'909 Kick',         params:{model:3,  toneFreq:65,  clickFreq:0,    decay:0.25, pitchEnv:{rise:0.0001,fall:0.008},bodyMix:0.15,resonance:4, cutoff:4000 }},
    { name:'Deep Sub',         params:{model:1,  toneFreq:35,  clickFreq:400,  decay:0.5,  pitchEnv:{rise:0.0003,fall:0.02}, bodyMix:0.2, resonance:6, cutoff:2000 }},
    { name:'Acoustic Kick',    params:{model:9,  toneFreq:80,  clickFreq:0,    decay:0.4,  pitchEnv:{rise:0.0002,fall:0.012},bodyMix:0.25,resonance:3, cutoff:3500 }},
  ],
  'w': [
    { name:'Classic Snare',    params:{model:1,  toneFreq:200, color:'white', filterCutoff:0.3,  decay:0.15, resonance:1.5 }},
    { name:'Binary Snare',     params:{model:2,  toneFreq:220, color:'white', filterCutoff:0.25, decay:0.18, resonance:2 }},
    { name:'Closed Hat',       params:{model:3,  toneFreq:0,   color:'white', filterCutoff:0.9,  decay:0.08, resonance:0.5 }},
    { name:'Open Hat',         params:{model:9,  toneFreq:0,   color:'white', filterCutoff:0.7,  decay:0.25, resonance:0.5 }},
    { name:'Metal Hat',        params:{model:4,  toneFreq:8000,color:'white', filterCutoff:0.95, decay:0.15, resonance:1 }},
    { name:'Clap',             params:{model:11, toneFreq:0,   color:'white', filterCutoff:0.25, decay:0.12, resonance:1 }},
    { name:'Bongo',            params:{model:12, toneFreq:300, color:'white', filterCutoff:0,    decay:0.1,  resonance:0.5 }},
    { name:'Rimshot',          params:{model:15, toneFreq:1000,color:'white', filterCutoff:0,    decay:0.02, resonance:1 }},
    { name:'Jitter Snare',     params:{model:5,  toneFreq:200, color:'white', filterCutoff:0.25, decay:0.2,  resonance:2 }},
    { name:'Formant',          params:{model:13, toneFreq:400, color:'white', filterCutoff:0.1,  decay:0.25, resonance:5 }},
    { name:'909 Snare',        params:{model:1,  toneFreq:180, color:'white', filterCutoff:0.35, decay:0.18, resonance:2.5 }},
    { name:'808 Snare',        params:{model:6,  toneFreq:160, color:'white', filterCutoff:0.3,  decay:0.22, resonance:3 }},
    { name:'Ride',             params:{model:10, toneFreq:6000,color:'white', filterCutoff:0.9,  decay:0.3,  resonance:1 }},
    { name:'Crash',            params:{model:4,  toneFreq:10000,color:'pink', filterCutoff:0.8,  decay:0.5,  resonance:0.5 }},
    { name:'Conga',            params:{model:12, toneFreq:250, color:'white', filterCutoff:0,    decay:0.15, resonance:1 }},
    { name:'Timbale',          params:{model:14, toneFreq:350, color:'white', filterCutoff:0.2,  decay:0.12, resonance:2 }},
    { name:'Tambourine',       params:{model:4,  toneFreq:7000,color:'white', filterCutoff:0.8,  decay:0.06, resonance:0.5 }},
    { name:'Cowbell',          params:{model:10, toneFreq:2500,color:'white', filterCutoff:0,    decay:0.08, resonance:1 }},
    { name:'Claves',           params:{model:15, toneFreq:2500,color:'white', filterCutoff:0,    decay:0.01, resonance:0.5 }},
    { name:'Shaker',           params:{model:3,  toneFreq:0,   color:'pink',  filterCutoff:0.95, decay:0.04, resonance:0.5 }},
    { name:'Snare Roll',       params:{model:5,  toneFreq:200, color:'white', filterCutoff:0.2,  decay:0.15, resonance:1.5 }},
  ],
};

// Flatten Hellenic models lookup by model name
const HELLENIC_MODEL_LOOKUP = {};
Object.keys(HELLENIC_MODELS).forEach(char => {
  HELLENIC_MODELS[char].forEach(m => {
    HELLENIC_MODEL_LOOKUP[m.name] = { char, params: m.params };
  });
});

export { HELLENIC_TYPES, HELLENIC_MODELS, HELLENIC_MODEL_LOOKUP };
