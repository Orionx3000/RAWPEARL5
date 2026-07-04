import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ASCII_DICTIONARY, AsciiPlayer, calculateDensity,
  getDensityMapping, DENSITY_RANGES,
  SCALES, NOTE_NAMES,
  initAllCharParams, getCharParams, CHAR_PARAM_RANGES, charToPitch,
  makeDistortionCurve, asciiToParams, HELLENIC_MODEL_LOOKUP
} from './AsciiEngine.js';
import TransportBar from './components/TransportBar.jsx';
import MasterPanel from './components/MasterPanel.jsx';
import ChannelRack from './components/ChannelRack.jsx';
import Terminal from './components/Terminal.jsx';
import Sidebar from './components/Sidebar.jsx';
import RadialModal from './components/RadialModal.jsx';
import DensityModal from './components/DensityModal.jsx';
import HelpPage from './components/HelpPage.jsx';
import SoundDesign from './components/SoundDesign.jsx';
import Mixer from './components/Mixer.jsx';
import MathSandbox, { dspScope } from './components/MathSandbox.jsx';
import SongArranger from './components/SongArranger.jsx';
import Encantor from './components/Encantor.jsx';
import { encodeWAV } from './utils/wavUtils.js';
import { MATH_PRESETS } from './MathPresets.js';
import TMB from './data/TMB_DATABASE.json';

// Flatten presets for lookup
export const allMathPresets = {};
Object.keys(MATH_PRESETS).forEach(group => {
  MATH_PRESETS[group].forEach(preset => {
    allMathPresets[preset.name] = {
      ...preset,
      funcStr: preset.eq ? (() => {
        let js = preset.eq.map(t => t.val).join(' ');
        let openCount = (js.match(/\(/g) || []).length;
        let closeCount = (js.match(/\)/g) || []).length;
        if (openCount > closeCount) js += ')'.repeat(openCount - closeCount);
        return js;
      })() : ''
    };
  });
});

const TMB_SYMBOLS = TMB.symbols || {};
const ASCII_DICT = Object.entries(TMB_SYMBOLS).reduce((acc, [char, data]) => {
  if (char === ' ') return acc;
  let category = 'OTHER';
  const m = data.m || {};
  const t = data.t || {};
  const b = data.b || {};
  
  if (m.type) category = 'PERCUSSION';
  else if (t.delaySend || t.reverbSend || t.ratchetCount) category = 'FX_CONTROL';
  else if (t.probability) category = 'PROBABILITY';
  else if (m.addWhiteNoise || m.addPinkNoise || m.addInharmonicFM) category = 'CHAOS_NOISE';
  else if (m.heavyOverdrive) category = 'DRIVE';
  else if (m.oscillator === 'noise') category = 'NOISE_TEXTURES';
  else if (b.granularOverride) category = 'GRANULAR_MONOLITH';
  else if (data.brailleMacro || char >= '\u2800') category = 'BRAILLE_MACROS';
  else if (m.denseStrike) category = 'DENSE_STRIKE';
  else if (m.hollowStrike) category = 'HOLLOW_STRIKE';
  else if (m.softStrike) category = 'SOFT_STRIKE';
  else if (m.ghostNote) category = 'GHOST';
  else if (m.sustain || m.tie) category = 'SUSTAIN_TIE';
  else if (b.attackMod > 2 || b.swellMod) category = 'ENVELOPE_SWELL';
  else if (b.decayMod < 0.4 || b.percussive) category = 'ENVELOPE_PLUCK';
  
  if (!acc[category]) acc[category] = [];
  acc[category].push({ char, desc: data.desc || 'Unknown' });
  return acc;
}, {});

// ─── GLOBAL AUDIO ────────────────────────────────────────────────────
let audioCtx = null;
let noiseBuffer = null;
let fxBus = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback', sampleRate: 44100 });

  }
  if (!noiseBuffer && audioCtx) {
    const buf = audioCtx.createBuffer(2, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    for (let c = 0; c < 2; c++) { const ch = buf.getChannelData(c); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    noiseBuffer = buf;
  }
  if (!fxBus && audioCtx) {
    fxBus = {};
    fxBus.delay = audioCtx.createDelay(1); fxBus.delay.delayTime.value = 0.25;
    fxBus.delayGain = audioCtx.createGain(); fxBus.delayGain.gain.value = 0.3;
    fxBus.delayFB = audioCtx.createGain(); fxBus.delayFB.gain.value = 0.4;
    fxBus.delay.connect(fxBus.delayGain); fxBus.delayGain.connect(fxBus.delayFB); fxBus.delayFB.connect(fxBus.delay);
    fxBus.reverb = audioCtx.createConvolver();
    const rl = 1.5, sr = audioCtx.sampleRate, rb = audioCtx.createBuffer(2, rl * sr, sr);
    for (let c = 0; c < 2; c++) { const ch = rb.getChannelData(c); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.3)); }
    fxBus.reverb.buffer = rb;
    fxBus.reverbGain = audioCtx.createGain(); fxBus.reverbGain.gain.value = 0.2;
    fxBus.dest = audioCtx.createGain(); fxBus.dest.gain.value = 1.0;
    
    fxBus.master = audioCtx.createGain();
    fxBus.master.gain.value = 0.3; // Headroom — final gain before limiter

    fxBus.limiter = audioCtx.createDynamicsCompressor();
    fxBus.limiter.threshold.value = -1.0; // Only limit near true 0dB
    fxBus.limiter.knee.value = 6.0; // Soft knee — gradual onset
    fxBus.limiter.ratio.value = 12.0; // Gentle limiting
    fxBus.limiter.attack.value = 0.005; // 5ms — let transients through
    fxBus.limiter.release.value = 0.15; // Medium release
    
    fxBus.delayGain.connect(fxBus.master);
    fxBus.reverb.connect(fxBus.reverbGain); fxBus.reverbGain.connect(fxBus.master);
    fxBus.dest.connect(fxBus.master);
    
    fxBus.master.connect(fxBus.limiter);
    fxBus.limiter.connect(audioCtx.destination);
    
    fxBus.recorder = null;
    // Store on window so stale React useCallback closures always find the live fxBus
    window.fxBus = fxBus;
    window.audioCtx = audioCtx;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return fxBus;
};

window.audioRecordingState = { isRecording: false, chunksL: [], chunksR: [], length: 0 };
window._recorderNodes = { recorder: null, dummySink: null };
window.startLiveRecording = () => {
  window.audioRecordingState.chunksL = [];
  window.audioRecordingState.chunksR = [];
  window.audioRecordingState.length = 0;
  window.audioRecordingState.isRecording = true;
  if (!fxBus || !audioCtx) return;
  if (!window._recorderNodes.recorder) {
    const rec = audioCtx.createScriptProcessor(16384, 2, 2);
    rec.onaudioprocess = (e) => {
      if (!window.audioRecordingState || !window.audioRecordingState.isRecording) return;
      const left = e.inputBuffer.getChannelData(0);
      const right = e.inputBuffer.getChannelData(1);
      window.audioRecordingState.chunksL.push(new Float32Array(left));
      window.audioRecordingState.chunksR.push(new Float32Array(right));
      window.audioRecordingState.length += left.length;
    };
    const ds = audioCtx.createGain(); ds.gain.value = 0;
    rec.connect(ds); ds.connect(audioCtx.destination);
    window._recorderNodes.recorder = rec;
    window._recorderNodes.dummySink = ds;
  }
  fxBus.master.connect(window._recorderNodes.recorder);
};
window.stopLiveRecording = () => {
  window.audioRecordingState.isRecording = false;
  return { 
    pcmL: window.audioRecordingState.chunksL, 
    pcmR: window.audioRecordingState.chunksR, 
    length: window.audioRecordingState.length, 
    sampleRate: audioCtx ? audioCtx.sampleRate : 44100 
  };
};

const getOutputDest = (charParams) => {
  const bus = window.fxBus;
  if (!bus) return audioCtx ? audioCtx.destination : null;
  // Route through fxBus.dest → master gain → limiter → destination
  // so preview and playback volumes are normalized
  return bus.dest;
};

const mathBufferCache = {};

const playChar = (char, layerIndex, time, bpm, charParams = null, fxBusOverride = null, customCtx = null, customDest = null) => {
  const currentCtx = customCtx || audioCtx;
  if (!currentCtx || char === ' ' || char === '') return;
  time = Math.max(time, currentCtx.currentTime + 0.015);

  // ── SANDBOX MATH: piped-in sample (flat gain — equation IS the amplitude) ──
  if (charParams && charParams.type === 'sandbox_math' && charParams.funcStr) {
    try {
      const sr = currentCtx.sampleRate;
      const envLen = (charParams.attack || 0.01) + Math.max((charParams.decay || 0.2), 0.2) + (charParams.gate || 0.4) + (charParams.release || 0.8);
      const duration = Math.max(0.5, envLen, charParams.sustainTime || 0);
      const bufLen = Math.ceil(sr * duration);
      if (bufLen > 0) {
        const tuneVal = charParams.tune || 0;
        const freq = charParams.midiNote != null
          ? 440 * Math.pow(2, (charParams.midiNote - 69) / 12)
          : tuneVal >= 24
            ? 440 * Math.pow(2, (tuneVal - 69) / 12)
            : 55 * Math.pow(2, tuneVal / 12);
        const cacheKey = charParams.funcStr + "_" + freq;
        let buf = mathBufferCache[cacheKey];
        if (!buf) {
          const argNames = Object.keys(dspScope);
          const argValues = argNames.map(k => dspScope[k]);
          
          let dspFunc;
          try {
            dspFunc = new Function(...argNames, 't', 'f', 'return (' + charParams.funcStr + ');');
          } catch(e) {
            dspFunc = () => 0;
          }
          
          buf = currentCtx.createBuffer(2, bufLen, sr);
          const dataL = buf.getChannelData(0);
          const dataR = buf.getChannelData(1);
          
          for (let i = 0; i < bufLen; i++) {
            const t = i / sr;
            let val;
            try { 
              val = dspFunc(...argValues, t, freq); 
            } catch(e) { val = 0; }
            
            if (!isFinite(val) || isNaN(val)) val = 0;
            dataL[i] = Math.max(-1, Math.min(1, val));
            dataR[i] = Math.max(-1, Math.min(1, val));
          }
          mathBufferCache[cacheKey] = buf;
        }
        const src = currentCtx.createBufferSource();
        src.buffer = buf;
        const envGain = currentCtx.createGain();
        const amp = (charParams && charParams.velocity) || 0.8;
        const targetGain = Math.min(0.8, amp * 0.6);
        const att = Math.max(0.001, charParams.attack || 0.01);
        const dec = Math.max(0.001, charParams.decay || 0.2);
        const susLevel = Math.min(targetGain, Math.max(0.01, (charParams.sustain !== undefined ? charParams.sustain : 0.6) * targetGain));
        const rel = Math.max(0.001, charParams.release || 0.2);
        const envEnd = Math.max(att + dec + rel, duration);
        envGain.gain.setValueAtTime(0, time);
        envGain.gain.linearRampToValueAtTime(targetGain, time + att);
        envGain.gain.linearRampToValueAtTime(susLevel, time + att + dec);
        envGain.gain.setValueAtTime(susLevel, time + envEnd - rel);
        envGain.gain.linearRampToValueAtTime(0, time + envEnd);
        envGain.stopTime = time + envEnd;
        src.connect(envGain);
        let chain = envGain;
        if (charParams.distortion && charParams.distortion > 0) {
          const s = currentCtx.createWaveShaper();
          s.curve = makeDistortionCurve(charParams.distortion * 40);
          chain.connect(s); chain = s;
        }
        if (charParams.cutoff !== undefined && charParams.cutoff > 0 && charParams.cutoff < 20000) {
          const f = currentCtx.createBiquadFilter();
          f.type = (charParams.filter && charParams.filter !== 'none') ? charParams.filter : 'lowpass';
          f.frequency.setValueAtTime(Math.min(charParams.cutoff, 20000), time);
          f.Q.setValueAtTime(charParams.resonance || 1, time);
          chain.connect(f); chain = f;
        }
        const outDest = customDest || getOutputDest(charParams);
        if (charParams.phaseInvert) {
          const invertGain = currentCtx.createGain();
          invertGain.gain.value = -1;
          chain.connect(invertGain);
          if (outDest) invertGain.connect(outDest);
        } else if (chain && outDest) {
          chain.connect(outDest);
        }
        src.start(time);
        src.stop(time + envEnd + 0.05);
      }
    } catch(e) { }
    return;
  }

  // Use ASCII_DICTIONARY if defined, otherwise fallback to asciiToParams (which covers A-Z, a-z, etc)
  const dictInst = ASCII_DICTIONARY[char] || asciiToParams(char) || {};
  
  const dest = customDest || getOutputDest(charParams);
  const p = new AsciiPlayer();
  p.ctx = currentCtx; p.startTime = time; p.outputDest = dest;
  p.fxBus = fxBusOverride || (customCtx ? null : window.fxBus);
  
  const mergedInst = { ...dictInst };
  if (charParams) {
    Object.assign(mergedInst, charParams);

  }
  
  // Ensure we don't accidentally override the base type if it's explicitly set by charParams
  if (charParams && charParams.type) {
    mergedInst.type = charParams.type;
  } else if (dictInst.type) {
    mergedInst.type = dictInst.type;
  }
  
  p.scheduleChar(char, mergedInst, 0);
};

// ─── SYMBOL SEQUENCE PROCESSING ──────────────────────────────────────
function processSymbolSequence(layer) {
  const segments = [];
  let current = [];
  for (let i = 0; i < layer.length; i++) {
    if (layer[i] !== ' ') {
      current.push({ idx: i, char: layer[i] });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

function getBlendCharParams(chars) {
  const merged = {};
  let charCount = 0;
  chars.forEach(({ char }) => {
    const entry = ASCII_DICTIONARY[char];
    if (entry) {
      Object.entries(entry).forEach(([k, v]) => {
        if (k !== 'desc' && k !== 'type') {
          if (merged[k] === undefined) merged[k] = 0;
          merged[k] += v;
        }
      });
      charCount++;
    }
  });
  if (charCount > 0) {
    Object.keys(merged).forEach(k => { merged[k] /= charCount; });
  }
  if (chars.length > 1) {
    merged._sequenceLen = chars.length;
  }
  return merged;
}

// ─── GENERATE EMPTY CHANNEL ──────────────────────────────────────────
const CHANNEL_DEFAULT_COLORS = {
  'α': '#ff66aa', 'δ': '#ff00ff', 'φ': '#ff0055',
  'Σ': '#00ffcc', 'γ': '#aa00ff', 'ω': '#aaaaaa',
  'π': '#ffaa00', 'τ': '#ffffff', 'w': '#888888',
};
let nextChId = 100;
function createChannel(type, color, subgroup) {
  const empty = () => Array(32).fill(' ');
  return {
    id: nextChId++, type, subgroup: subgroup || '', name: '',
    color: color || CHANNEL_DEFAULT_COLORS[type] || '#ffcc00',
    layers: [empty(), empty(), empty()],
    vol: 50, active: true,
    patternDir: 'forward', patternLen: 32,
    editMode: 'select',
    sidechainSource: null, sidechainType: 'compression', sidechainAmount: 0.5,
    microNotes: [], showMicro: false,
    params: {},
    autoGate: false,
    delaySend: 0, reverbSend: 0,
    sendA: 0, sendB: 0,
    cutoff: 12000, resonance: 0, distortion: 0,
    pan: 0, solo: false, phaseInvert: false,
    eq: { lowGain: 0, midGain: 0, midFreq: 1000, highGain: 0 },
    comp: { threshold: -4, ratio: 4, attack: 0.015, release: 0.15, makeup: 0 },
  };
}

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function AsciiDAW() {
  const [activeTab, setActiveTab] = useState('pattern');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(145);
  const [currentStep, setCurrentStep] = useState(0);
  const defaultChannels = [
    // 4-on-the-floor kick
    { ...createChannel('τ', null, 'KICK'), id: 1, name: 'τ', subgroup: 'DRUM HIT', presetName: '909 Kick Core',
      layers: ["                                ".split(''), 
               "I   I   I   I   I   I   I   I   ".split(''), 
               "                                ".split('')],
      vol: 55, pan:0, solo:false, phaseInvert:false, sendA:0, sendB:0, autoGate: false,
      eq:{lowGain:3,midGain:-1,midFreq:1000,highGain:-2},
      comp:{threshold:-6,ratio:6,attack:0.025,release:0.1,makeup:1} },
    // Snare on backbeat
    { ...createChannel('w', null, 'SNARE'), id: 2, name: 'w', subgroup: 'DRUM HIT', presetName: '',
      layers: ["                                ".split(''), 
               "    I       I       I       I   ".split(''), 
               "                                ".split('')],
      vol: 42, pan:0, solo:false, phaseInvert:false, sendA:0.12, sendB:0.08, autoGate: false, params: { model: 1 },
      eq:{lowGain:-1,midGain:2,midFreq:2000,highGain:1},
      comp:{threshold:-8,ratio:4,attack:0.015,release:0.2,makeup:1} },
    // Closed hihat — 8th notes with 16th accents
    { ...createChannel('w', null, 'HIHAT'), id: 3, name: 'w', subgroup: 'DRUM HIT', presetName: '',
      layers: ["                                ".split(''), 
               ". . . . . . . . . . . . . . . . ".split(''), 
               "  '   '   '   '   '   '   '   ' ".split('')],
      vol: 22, pan:0.2, solo:false, phaseInvert:false, sendA:0.1, sendB:0.05, autoGate: false, params: { model: 3 },
      eq:{lowGain:-4,midGain:0,midFreq:1000,highGain:3},
      comp:{threshold:-6,ratio:3,attack:0.005,release:0.05,makeup:0} },
    // Clap on 2 & 4 with swing accent
    { ...createChannel('w', null, 'CLAP'), id: 4, name: 'w', subgroup: 'DRUM HIT', presetName: '',
      layers: ["                                ".split(''), 
               "        I               I       ".split(''), 
               "                                ".split('')],
      vol: 38, pan:-0.15, solo:false, phaseInvert:false, sendA:0.12, sendB:0.10, autoGate: false, params: { model: 11 },
      eq:{lowGain:-1,midGain:1,midFreq:1500,highGain:2},
      comp:{threshold:-6,ratio:4,attack:0.015,release:0.15,makeup:1} },
    // Acid bass line
    { ...createChannel('α', null, 'BASS'), id: 5, name: 'α', subgroup: 'BASS', presetName: '303 Saw Bass Core',
      layers: ["                                ".split(''), 
               "I   I       I   I   I   I       I".split(''), 
               "                                ".split('')],
      vol: 35, pan:0, solo:false, phaseInvert:false, sendA:0.1, sendB:0.1, autoGate: true,
      eq:{lowGain:2,midGain:1,midFreq:2000,highGain:-1},
      comp:{threshold:-8,ratio:4,attack:0.010,release:0.15,makeup:1} },
    // Plucked string arp
    { ...createChannel('π', null, 'PLUCK'), id: 6, name: 'π', subgroup: 'PLUCK', presetName: '',
      layers: ["                                ".split(''), 
               "I   I   I   I   I   I   I   I   ".split(''), 
               "        -               -       ".split('')],
      vol: 32, pan:0.15, solo:false, phaseInvert:false, sendA:0.10, sendB:0.15, autoGate: true,
      eq:{lowGain:-2,midGain:2,midFreq:2500,highGain:1},
      comp:{threshold:-8,ratio:3,attack:0.005,release:0.4,makeup:1} },
    // Sub bass drone
    { ...createChannel('Σ', null, 'SUB'), id: 7, name: 'Σ', subgroup: 'SUB BASS', presetName: 'Saturated Sub',
      layers: ["                                ".split(''), 
               "_   _   _   _   _   _   _   _   ".split(''), 
               "                                ".split('')],
      vol: 45, pan:0, solo:false, phaseInvert:false, sendA:0.05, sendB:0.05, autoGate: true,
      eq:{lowGain:4,midGain:1,midFreq:1000,highGain:-3},
      comp:{threshold:-10,ratio:4,attack:0.020,release:0.15,makeup:2} },
    // Synth pad
    { ...createChannel('γ', null, 'PAD'), id: 8, name: 'γ', subgroup: 'PAD', presetName: 'Glassy FM Pad',
      layers: ["                                ".split(''), 
               "O - - - O - - - O - - - O - - - ".split(''), 
               "═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ".split('')],
      vol: 18, pan:-0.3, solo:false, phaseInvert:false, sendA:0.25, sendB:0.35, autoGate: true,
      eq:{lowGain:-2,midGain:1,midFreq:800,highGain:1},
      comp:{threshold:-20,ratio:3,attack:0.1,release:1.0,makeup:1} }
  ];

  const PERC_TYPES = ['τ', 'w', 'ω'];
  const BASS_TYPES = ['α', 'Σ'];
  const DEFAULT_ROOT_IDX = 5; // 'F' is the default affinity root
  const populateDefaultMicroNotes = (channels) => {
    return channels.map(ch => {
      if (PERC_TYPES.includes(ch.type)) return ch;
      const notes = [...(ch.microNotes || [])];
      const baseOctave = BASS_TYPES.includes(ch.type) ? 36 : 48;
      const defaultNote = baseOctave + DEFAULT_ROOT_IDX;
      ch.layers.forEach(layer => {
        layer.forEach((char, sIdx) => {
          if (char !== ' ' && notes[sIdx] == null) notes[sIdx] = defaultNote;
        });
      });
      return { ...ch, microNotes: notes };
    });
  };

  const [songPatterns, setSongPatterns] = useState([{ id: 'p1', name: 'Pattern 1', channels: populateDefaultMicroNotes(defaultChannels) }]);
  const [songIdx, setSongIdx] = useState(0);
  const [playMode, setPlayMode] = useState('LIVE');
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [loopCollection, setLoopCollection] = useState([]);

  const toggleLiveRecord = () => {
    if (!isRecordingLive) {
      if (window.startLiveRecording) window.startLiveRecording();
      setIsRecordingLive(true);
    } else {
      if (window.stopLiveRecording) {
        const recData = window.stopLiveRecording();
        if (recData.length > 0) {
          const blob = encodeWAV(recData.pcmL, recData.pcmR, recData.length, recData.sampleRate, 32);
          const url = URL.createObjectURL(blob);
          setLoopCollection(prev => [...prev, {
            id: 'wav_' + Date.now(),
            name: `RAWPEARL_JAM_${loopCollection.length + 1}.wav`,
            url,
            blob
          }]);
        }
      }
      setIsRecordingLive(false);
    }
  };

  const channels = songPatterns[songIdx]?.channels || [];

  const setChannels = (updater) => {
    setSongPatterns(prev => {
      const next = [...prev];
      if (typeof updater === 'function') {
        next[songIdx] = { ...next[songIdx], channels: updater(next[songIdx].channels) };
      } else {
        next[songIdx] = { ...next[songIdx], channels: updater };
      }
      return next;
    });
  };

  const [selectedChannelId, setSelectedChannelId] = useState(1);
  const [selectedTool, setSelectedTool] = useState('dict');
  const [selectedChar, setSelectedChar] = useState(null);
  const [stepEdit, setStepEdit] = useState(false);
  const [stepMode, setStepMode] = useState('edit');
  const [characterParams, setCharacterParams] = useState(() => initAllCharParams());
  const [focusedCell, setFocusedCell] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [stepOverrides, setStepOverrides] = useState({});
  const [showDensityLib, setShowDensityLib] = useState(false);
  const [affinity, setAffinity] = useState({ root: 'F', scale: 'phrygian', gate: true, microScale: null });
  const [showMicroPopup, setShowMicroPopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [terminalInput, setTerminalInput] = useState('');

  const loadStateRef = useRef(null);
  const dbRef = useRef([]);
  const dbIdx = useRef(-1);
  const currentStepRef = useRef(0);
  const nextNoteTimeRef = useRef(0);
  const timerIDRef = useRef(null);
  const togglePlayRef = useRef();
  
  const songPatternsRef = useRef(songPatterns);
  const songIdxRef = useRef(songIdx);
  const cycleCountRef = useRef(0);
  const playModeRef = useRef(playMode);
  
  useEffect(() => { songPatternsRef.current = songPatterns; }, [songPatterns]);
  useEffect(() => { songIdxRef.current = songIdx; }, [songIdx]);
  useEffect(() => { playModeRef.current = playMode; }, [playMode]);

  const assignRootMicroNote = (ch, stepIdx) => {
    const notes = [...(ch.microNotes || [])];
    const rootIdx = NOTE_NAMES.indexOf(affinity.root);
    notes[stepIdx] = rootIdx >= 0 ? 48 + rootIdx : 48;
    return notes;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in form fields
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!focusedCell || ctxMenu) return;
      if (e.key === 'Escape') { setFocusedCell(null); return; }
      const { chId, layerIdx, stepIdx } = focusedCell;
      const cellCh = songPatterns[songIdx].channels.find(ch => ch.id === chId);
      if (!cellCh) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        setChannels(prev => { const n = [...prev]; const c = n.findIndex(ch => ch.id === chId); if (c >= 0) { n[c].layers[layerIdx][stepIdx] = ' '; if (n[c].microNotes) n[c].microNotes[stepIdx] = null; } return n; });
        return;
      }
      if (e.key.length === 1 && cellCh.editMode !== 'erase') {
        e.preventDefault();
        const typed = e.key;
        const typeParams = characterParams[cellCh.type] || {};
        const tmbEntry = TMB[typed] || {};
        const stepParams = { ...(tmbEntry.t || {}), ...(tmbEntry.m || {}), ...(tmbEntry.b || {}) };
        let finalCp = { autoGate: cellCh.autoGate !== false, ...typeParams, ...stepParams, ...(cellCh.params || {}) };
        finalCp.velocity = (finalCp.velocity || 0.8) * (cellCh.vol !== undefined ? cellCh.vol / 50 : 1.0);
        if (cellCh.pan !== undefined) finalCp.pan = (finalCp.pan || 0) + cellCh.pan;
        finalCp.phaseInvert = cellCh.phaseInvert;
        if (cellCh.sendA !== undefined && finalCp.delaySend === undefined) finalCp.delaySend = cellCh.sendA;
        if (cellCh.sendB !== undefined && finalCp.reverbSend === undefined) finalCp.reverbSend = cellCh.sendB;
        
        setChannels(prev => { 
          const n = [...prev]; 
          const c = n.findIndex(ch => ch.id === chId); 
          if (c >= 0) {
            n[c].layers[layerIdx][stepIdx] = typed; 
            if (typed !== ' ') n[c].microNotes = assignRootMicroNote(n[c], stepIdx);
          }
          return n; 
        });
        
        const armedCh = songPatterns[songIdx].channels.find(channel => channel.id === selectedChannelId) || songPatterns[songIdx].channels[0];
         if (armedCh && armedCh.presetName) {
           const preset = allMathPresets[armedCh.presetName];
           if (preset) {
             finalCp.type = 'sandbox_math';
             finalCp.funcStr = preset.funcStr;
             finalCp.tune = undefined;
           }
         }

        const rootIdx = NOTE_NAMES.indexOf(affinity.root);
        const kbNote = cellCh.microNotes?.[stepIdx] || (rootIdx >= 0 ? 48 + rootIdx : 48);
        finalCp.midiNote = kbNote; finalCp.tune = kbNote;
        initAudio();
        playChar(typed, layerIdx, audioCtx.currentTime, bpm, finalCp);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, ctxMenu, songPatterns, songIdx, bpm, characterParams, selectedChannelId]);

  useEffect(() => {
    const handleSpacePlay = (e) => {
      if (e.key !== ' ') return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (focusedCell || ctxMenu) return;
      e.preventDefault();
      togglePlayRef.current();
    };
    window.addEventListener('keydown', handleSpacePlay);
    return () => window.removeEventListener('keydown', handleSpacePlay);
  }, [focusedCell, ctxMenu]);

  const scheduleNote = useCallback((stepNumber, time) => {
    setTimeout(() => { setCurrentStep(stepNumber); }, Math.max(0, (time - audioCtx.currentTime) * 1000));
    const currentChannels = songPatternsRef.current[songIdxRef.current]?.channels || [];
    
    const hasSolo = currentChannels.some(ch => ch.solo);

    currentChannels.forEach((ch) => {
      if (!ch.active) return;
      if (hasSolo && !ch.solo) return;
      
      const nodeBpm = ch.bpm || bpm;
      const dir = ch.patternDir || 'forward';
      const len = ch.patternLen || 32;
      
      const rawIdx = stepNumber % len;
      let stepIdx = rawIdx;
      if (dir === 'backward') stepIdx = len - 1 - rawIdx;
      else if (dir === 'pingpong') {
        const period = len * 2 - 2;
        const pos = (stepNumber % period);
        stepIdx = pos < len ? pos : period - pos;
      } else if (dir === 'random') {
        stepIdx = Math.floor(Math.random() * len);
      }
      
      const topChar = ch.layers[0]?.[stepIdx] || ' ';
      const midChar = ch.layers[1]?.[stepIdx] || ' ';
      const botChar = ch.layers[2]?.[stepIdx] || ' ';
      
      // Trigger char: mid is primary, fall back to top, then bot
      let triggerChar, triggerLayerIdx;
      if (midChar !== ' ' && midChar !== '-' && midChar !== '═' && midChar !== undefined) {
        triggerChar = midChar;
        triggerLayerIdx = 1;
      } else if (topChar !== ' ' && topChar !== '-' && topChar !== '═' && topChar !== undefined) {
        triggerChar = topChar;
        triggerLayerIdx = 0;
      } else if (botChar !== ' ' && botChar !== '-' && botChar !== '═' && botChar !== undefined) {
        triggerChar = botChar;
        triggerLayerIdx = 2;
      } else {
        return;
      }
      
      let extraTies = 0;
      for (let j = 1; j < len - stepIdx; j++) {
        const nextTie = ch.layers[triggerLayerIdx]?.[stepIdx + j] || ' ';
        if (nextTie === '-' || nextTie === '═') extraTies++;
        else break;
      }
      const stepDuration = (60.0 / nodeBpm) * 0.25;
      const sustainTime = extraTies > 0 ? (stepDuration * extraTies + stepDuration * 0.8) : undefined;
      
      const triggerEntry = TMB[triggerChar] || {};
      const topEntry = TMB[topChar] || {};
      const botEntry = TMB[botChar] || {};
      
      const topParams = topEntry.t || {};
      const triggerMidParams = triggerEntry.m || {};
      const botParams = botEntry.b || {};
      
      const k = `${ch.id}_1_${stepIdx}`;
      const rawOverrides = stepOverrides[k] || {};
      const stepVal = rawOverrides.stepVal;
      const stepGate = rawOverrides.gate;
      const stepDecay = rawOverrides.decay;
      const stepAttack = rawOverrides.attack;
      const stepRelease = rawOverrides.release;
      const stepGlitchType = rawOverrides.glitchType;
      const stepGlitchAmt = rawOverrides.glitchAmount;
      const overrides = {};
      Object.keys(rawOverrides).forEach(key => {
        if (!['stepVal','gate','decay','attack','release','glitchType','glitchAmount'].includes(key)) {
          overrides[key] = rawOverrides[key];
        }
      });
      
      const typeParams = characterParams[ch.type] || {};
      let base;
      if (triggerMidParams.type) {
        base = { ...topParams, ...triggerMidParams, ...botParams };
      } else {
        base = { ...typeParams, ...topParams, ...triggerMidParams, ...botParams };
      }
      
      const cp = { autoGate: ch.autoGate !== false, sustainTime, ...base, ...(ch.params || {}), ...overrides };
      
      cp.velocity = (cp.velocity || 0.8) * (ch.vol !== undefined ? ch.vol / 50 : 1.0);
      if (ch.pan !== undefined) cp.pan = (cp.pan || 0) + ch.pan;
      cp.phaseInvert = ch.phaseInvert;
      if (ch.sendA !== undefined && cp.delaySend === undefined) cp.delaySend = ch.sendA;
      if (ch.sendB !== undefined && cp.reverbSend === undefined) cp.reverbSend = ch.sendB;
      
      if (rawOverrides.equation) {
        cp.type = 'sandbox_math';
        cp.funcStr = rawOverrides.equation;
        cp.tune = undefined; cp.midiNote = undefined;
      } else if (ch.presetName && allMathPresets[ch.presetName]) {
        cp.type = 'sandbox_math';
        cp.funcStr = allMathPresets[ch.presetName].funcStr;
        cp.tune = undefined; cp.midiNote = undefined;
      } else if (ch.presetName && HELLENIC_MODEL_LOOKUP[ch.presetName]) {
        // Hellenic model preset — merge params, keep native type
        const model = HELLENIC_MODEL_LOOKUP[ch.presetName];
        Object.assign(cp, model.params);
        if (!triggerMidParams.type) cp.type = ch.type;
      } else if (!triggerMidParams.type) {
        cp.type = ch.type;
      }

      // Smart wave shaping: math presets carry their own envelope.
      // Use generous ADSR so the full math shape plays, UNLESS user
      // has set step overrides for gate/decay/attack/release.
      if (cp.type === 'sandbox_math') {
        const hasManualGate   = stepGate !== undefined && stepGate !== 20;
        const hasManualDecay  = stepDecay !== undefined && stepDecay !== 20;
        const hasManualAttack = stepAttack !== undefined && stepAttack !== 20;
        const hasManualRel    = stepRelease !== undefined && stepRelease !== 20;
        if (!hasManualGate)   cp.gate   = 0.8;
        if (!hasManualDecay)  cp.decay  = 2.0;
        if (!hasManualAttack) cp.attack = 0;
        if (!hasManualRel)    cp.release = 0.5;
      }
      
      if (stepVal !== undefined && stepVal !== '' && !isNaN(stepVal) && stepVal !== 20) {
        const mult = stepVal / 20;
        cp.velocity = Math.min(1, (cp.velocity || 0.8) * mult);
        if (cp.cutoff) cp.cutoff = Math.min(12000, Math.max(100, cp.cutoff * mult));
        if (cp.decay) cp.decay = Math.min(2, Math.max(0.01, cp.decay * (mult > 1 ? mult * 0.5 : mult * 1.5)));
      }
      
      if (stepGate !== undefined && stepGate !== 20) cp.gate = stepGate / 20;
      if (stepDecay !== undefined && stepDecay !== 20) {
        const dMult = stepDecay / 20;
        if (cp.decay) cp.decay = Math.min(3, Math.max(0.005, cp.decay * dMult));
      }
      if (stepAttack !== undefined && stepAttack !== 20) {
        const aMult = stepAttack / 20;
        const baseA = cp.attack || 0.01;
        cp.attack = Math.min(1, Math.max(0.001, baseA * aMult));
      }
      if (stepRelease !== undefined && stepRelease !== 20) {
        const rMult = stepRelease / 20;
        const baseR = cp.release || 0.05;
        cp.release = Math.min(3, Math.max(0.005, baseR * rMult));
      }
      if (stepGlitchType && stepGlitchAmt !== undefined && stepGlitchAmt > 0) {
        cp.glitchType = stepGlitchType;
        cp.glitchAmount = stepGlitchAmt / 20;
      }
      
      if (ch.microNotes && ch.microNotes[stepIdx] && !PERC_TYPES.includes(ch.type)) {
        const microNote = ch.microNotes[stepIdx];
        if (microNote > 0) {
          cp.midiNote = microNote;
          cp.tune = microNote;
        }
      }
      
      playChar(triggerChar, triggerLayerIdx, time, nodeBpm, cp, fxBus);
    });
  }, [bpm, characterParams, stepOverrides, affinity, fxBus]);

  const scheduler = useCallback(() => {
    const scheduleAheadTime = 0.1;
    let stepDuration = (60.0 / bpm) * 0.25;
    if (!isFinite(stepDuration) || stepDuration <= 0) stepDuration = 0.125; // failsafe

    let maxLoops = 20; // Absolute failsafe against infinite loop freezes
    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime && maxLoops > 0) {
      maxLoops--;
      try {
        scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
      } catch (err) {
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '80px'; errDiv.style.left = '10px';
        errDiv.style.background = 'purple'; errDiv.style.color = 'white'; errDiv.style.zIndex = '9999';
        errDiv.innerText = "Schedule Error: " + err.message;
        document.body.appendChild(errDiv);
      }
      
      nextNoteTimeRef.current += stepDuration;
      
      const currentChannels = songPatternsRef.current[songIdxRef.current]?.channels || [];
      const maxLen = currentChannels.length > 0 ? Math.max(...currentChannels.map(ch => ch.patternLen || 32)) : 32;

      currentStepRef.current = currentStepRef.current + 1;
      
      if (currentStepRef.current >= maxLen) {
          currentStepRef.current = 0;
          if (playModeRef.current === 'SONG') {
              cycleCountRef.current += 1;
              const loopCount = songPatternsRef.current[songIdxRef.current]?.loopCount || 4;
              if (cycleCountRef.current >= loopCount) {
                  cycleCountRef.current = 0;
                  songIdxRef.current = (songIdxRef.current + 1) % songPatternsRef.current.length;
                  setSongIdx(songIdxRef.current);
              }
          }
      }
    }
    timerIDRef.current = requestAnimationFrame(scheduler);
  }, [bpm, scheduleNote]);

  useEffect(() => {
    window.onerror = function(msg) {
      const errDiv = document.createElement('div');
      errDiv.style.position = 'fixed'; errDiv.style.top = '120px'; errDiv.style.left = '10px';
      errDiv.style.background = 'orange'; errDiv.style.color = 'black'; errDiv.style.zIndex = '9999';
      errDiv.innerText = "Global Error: " + msg;
      document.body.appendChild(errDiv);
    };

    if (isPlaying) {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (currentStepRef.current === 0) nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
      scheduler();
    } else { cancelAnimationFrame(timerIDRef.current); }
    return () => cancelAnimationFrame(timerIDRef.current);
  }, [isPlaying, scheduler]);

  const precacheMathBuffers = () => {
    const ctx = window.audioCtx;
    if (!ctx) return;
    const currentChannels = songPatternsRef.current[songIdxRef.current]?.channels || [];
    const seen = new Set();
    const tasks = [];
    currentChannels.forEach(ch => {
      if (!ch.active) return;
      const preset = ch.presetName && allMathPresets[ch.presetName];
      if (!preset) return;
      const isPerc = PERC_TYPES.includes(ch.type);
      const freq = 55;
      const cacheKey = preset.funcStr + "_" + freq;
      if (seen.has(cacheKey) || mathBufferCache[cacheKey]) return;
      seen.add(cacheKey);
      const sr = ctx.sampleRate;
      const bufLen = Math.ceil(sr * (isPerc ? 0.8 : 2.0));
      if (bufLen <= 0) return;
      const funcBody = 'with(scope){return(' + preset.funcStr + ')}';
      let dspFunc;
      try { dspFunc = new Function('scope', funcBody); } catch(e) { return; }
      const mutableScope = Object.assign(Object.create(null), dspScope);
      const safeScope = new Proxy(mutableScope, {
        has() { return true; },
        get(target, prop) { if (typeof prop !== 'string') return Reflect.get(target, prop); return prop in target ? target[prop] : 0; }
      });
      mutableScope.f = freq;
      const buf = ctx.createBuffer(2, bufLen, sr);
      tasks.push({ buf, dataL: buf.getChannelData(0), dataR: buf.getChannelData(1), bufLen, dspFunc, mutableScope, safeScope, cacheKey, sr });
    });
    if (tasks.length === 0) return;
    const CHUNK = 2048;
    let taskIdx = 0, sampleIdx = 0;
    const proc = () => {
      const t = tasks[taskIdx];
      const end = Math.min(sampleIdx + CHUNK, t.bufLen);
      for (let i = sampleIdx; i < end; i++) {
        t.mutableScope.t = i / t.sr;
        let val;
        try { val = t.dspFunc(t.safeScope); } catch(e) { val = 0; }
        if (!isFinite(val) || isNaN(val)) val = 0;
        t.dataL[i] = Math.max(-1, Math.min(1, val));
        t.dataR[i] = Math.max(-1, Math.min(1, val));
      }
      sampleIdx = end;
      if (sampleIdx < t.bufLen) { setTimeout(proc, 0); return; }
      mathBufferCache[t.cacheKey] = t.buf;
      taskIdx++;
      if (taskIdx < tasks.length) { sampleIdx = 0; setTimeout(proc, 0); }
    };
    setTimeout(proc, 0);
  };

  const handleSelectChannel = (id) => {
    setSelectedChannelId(id);
    const ch = channels.find(c => c.id === id);
    if (!ch) return;
    initAudio();
    const rootIdx = NOTE_NAMES.indexOf(affinity.root);
    const previewNote = rootIdx >= 0 ? 48 + rootIdx : 48;
    let cp = { autoGate: ch.autoGate !== false, ...characterParams[ch.type], ...(ch.params || {}) };
    cp.velocity = (cp.velocity || 0.8) * (ch.vol !== undefined ? ch.vol / 50 : 1.0);
    if (ch.pan !== undefined) cp.pan = (cp.pan || 0) + ch.pan;
    cp.phaseInvert = ch.phaseInvert;
    cp.midiNote = previewNote; cp.tune = previewNote;
    cp.type = ch.type;
    playChar(ch.type, 2, audioCtx.currentTime, bpm, cp, fxBus);
  };

  const togglePlay = () => {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!isPlaying) {
      currentStepRef.current = 0; setCurrentStep(0);
      // precacheMathBuffers(); // Temporarily disabled to prevent 15-second UI freeze
    }
    setIsPlaying(!isPlaying);
  };
  togglePlayRef.current = togglePlay;

  const addChannel = (type) => {
    const drumMap = {
      'KICK':     { engine:'τ', char:'K',  sg:'KICK' },
      'KICK_DIGI':{ engine:'τ', char:'a',  sg:'KICK' },
      'KICK_FM':  { engine:'τ', char:'o',  sg:'KICK' },
      'KICK_MOD': { engine:'τ', char:'k',  sg:'KICK' },
      'KICK_GRAN':{ engine:'τ', char:'e',  sg:'KICK' },
      'KICK_UNST':{ engine:'τ', char:'u',  sg:'KICK' },
      'SNARE':    { engine:'w', char:'S',  sg:'DRUM HIT' },
      'SNARE_BIN':{ engine:'w', char:'b',  sg:'DRUM HIT' },
      'SNARE_RING':{engine:'w', char:'r',  sg:'DRUM HIT' },
      'SNARE_JIT':{ engine:'w', char:'j',  sg:'DRUM HIT' },
      'SNARE_ZON':{ engine:'w', char:'z',  sg:'DRUM HIT' },
      'HAT_CL':   { engine:'w', char:'N',  sg:'DRUM HIT' },
      'HAT_OP':   { engine:'w', char:'D',  sg:'DRUM HIT' },
      'HAT_MET':  { engine:'w', char:'m',  sg:'DRUM HIT' },
      'HAT_HAR':  { engine:'w', char:'h',  sg:'DRUM HIT' },
      'CLAP':     { engine:'w', char:'C',  sg:'DRUM HIT' },
      'BONGO':    { engine:'w', char:'B',  sg:'DRUM HIT' },
      'FORMANT':  { engine:'w', char:'P',  sg:'DRUM HIT' },
      'STRING':   { engine:'w', char:'H',  sg:'DRUM HIT' },
      'IMPULSE':  { engine:'w', char:'i',  sg:'DRUM HIT' },
      'TOM':      { engine:'τ', char:'y',  sg:'DRUM HIT' },
    };
    const drumEntry = drumMap[type];
    if (drumEntry) {
      const ch = createChannel(drumEntry.engine);
      ch.editMode = selectedTool;
      ch.name = drumEntry.char;
      ch.subgroup = drumEntry.sg;
      const charParams = characterParams[drumEntry.char] || {};
      ch.params = { ...charParams };
      setChannels(prev => [...prev, ch]);
    } else {
      const ch = createChannel(type);
      ch.editMode = selectedTool;
      ch.name = type;
      const instruments = { 'α':'LEAD','δ':'FM BELL','φ':'WAVETABLE','Σ':'SUB BASS','γ':'PAD','ω':'SNARE','π':'CHIP','τ':'KICK','w':'NOISE' };
      ch.subgroup = instruments[type] || '';
      setChannels(prev => [...prev, ch]);
    }
  };

  const removeChannel = (id) => {
    if (channels.length <= 1) return;
    setChannels(prev => prev.filter(ch => ch.id !== id));
  };

  const updateChannel = (id, updates) => {
    if ('autoGate' in updates) {
      // Gate toggle is global — apply to all channels
      const val = updates.autoGate;
      setChannels(prev => prev.map(ch => ({ ...ch, autoGate: val })));
    } else {
      setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch));
    }
  };
  const setChannel = updateChannel;

  const handleCellClick = (ch, chIdx, layerIdx, stepIdx) => {
    const stepToUse = stepIdx % (ch.patternLen || 32);
    if (selectedTool === 'erase') {
      setChannels(prev => { const n = [...prev]; n[chIdx].layers[layerIdx][stepToUse] = ' '; if (n[chIdx].microNotes) n[chIdx].microNotes[stepToUse] = null; return n; });
      return;
    }
    if (selectedTool === 'dict') {
      setChannels(prev => {
        const n = [...prev];
        n[chIdx].layers[layerIdx][stepToUse] = selectedChar;
        if (selectedChar !== ' ') n[chIdx].microNotes = assignRootMicroNote(n[chIdx], stepToUse);
        else if (n[chIdx].microNotes) n[chIdx].microNotes[stepToUse] = null;
        return n;
      });
      initAudio();
      const typeParams = characterParams[ch.type] || {};
      const tmbEntry = TMB[selectedChar] || {};
      const stepParams = { ...(tmbEntry.t || {}), ...(tmbEntry.m || {}), ...(tmbEntry.b || {}) };
      const hasType = !!(tmbEntry.m?.type);
      let cp;
      if (hasType) {
        cp = { autoGate: ch.autoGate !== false, ...stepParams, ...(ch.params || {}) };
      } else {
        cp = { autoGate: ch.autoGate !== false, ...typeParams, ...stepParams, ...(ch.params || {}) };
      }
      cp.velocity = (cp.velocity || 0.8) * (ch.vol !== undefined ? ch.vol / 50 : 1.0);
      if (ch.pan !== undefined) cp.pan = (cp.pan || 0) + ch.pan;
      cp.phaseInvert = ch.phaseInvert;
      if (ch.sendA !== undefined && cp.delaySend === undefined) cp.delaySend = ch.sendA;
      if (ch.sendB !== undefined && cp.reverbSend === undefined) cp.reverbSend = ch.sendB;
      if (!hasType) cp.type = ch.type;
      const rootIdx = NOTE_NAMES.indexOf(affinity.root);
      if (ch.microNotes?.[stepToUse] && !PERC_TYPES.includes(ch.type)) {
        cp.midiNote = ch.microNotes[stepToUse]; cp.tune = ch.microNotes[stepToUse];
      } else {
        const previewNote = rootIdx >= 0 ? 48 + rootIdx : 48;
        cp.midiNote = previewNote; cp.tune = previewNote;
      }
      playChar(selectedChar, layerIdx, audioCtx.currentTime, bpm, cp, fxBus);
      setFocusedCell({ chId: ch.id, chIdx, layerIdx, stepIdx: stepToUse });
      setSelectedChar(selectedChar || (ch.layers[layerIdx][stepToUse] !== ' ' ? ch.layers[layerIdx][stepToUse] : selectedChar));
      return;
    }
    // Non-dict mode: clicking step selects the char at that step for SoundDesign
    const existingChar = ch.layers[layerIdx][stepToUse];
    if (existingChar && existingChar !== ' ') {
      setSelectedChar(existingChar);
    }
    setFocusedCell({ chId: ch.id, chIdx, layerIdx, stepIdx: stepToUse });
  };

  const handleCellContextMenu = (e, ch, chIdx, layerIdx, stepIdx) => {
    e.preventDefault();
    const stepToUse = stepIdx % (ch.patternLen || 32);
    const char = ch.layers[layerIdx][stepToUse];
    setCtxMenu({ nodeIdx: chIdx, layerIdx, stepIdx: stepToUse, char, chId: ch.id });
    setFocusedCell(null);
  };

  const ctxMenuSetChar = (ch) => {
    if (!ctxMenu) return;
    const { chId, layerIdx, stepIdx } = ctxMenu;
    let finalCp = { ...characterParams[ch] };
    setChannels(prev => { 
      const n = [...prev]; 
      const c = n.findIndex(channel => channel.id === chId); 
      if (c >= 0) {
        n[c].layers[layerIdx][stepIdx] = ch; 
        if (ch !== ' ') n[c].microNotes = assignRootMicroNote(n[c], stepIdx);
        else if (n[c].microNotes) n[c].microNotes[stepIdx] = null;
        const armedCh = n.find(channel => channel.id === selectedChannelId) || n[0];
        // Preset type is preserved; parameters are handled by ASCII_DICTIONARY
      }
      return n; 
    });
    initAudio();
    const tmbEntry = TMB[ch] || {};
    const tmbMerged = { ...(tmbEntry.t || {}), ...(tmbEntry.m || {}), ...(tmbEntry.b || {}) };
    if (Object.keys(tmbMerged).length > 0) {
      finalCp = { ...tmbMerged, ...finalCp };
    } else {
      finalCp = { ...ASCII_DICTIONARY[ch], ...finalCp };
    }
    if (targetChannel) {
      finalCp = { ...finalCp, ...targetChannel };
    }
    playChar(ch, layerIdx, audioCtx.currentTime, bpm, finalCp, fxBus);
    setCtxMenu(null);
  };

  const setStepParam = (chId, layerIdx, stepIdx, key, value) => {
    const k = `${chId}_${layerIdx}_${stepIdx}`;
    setStepOverrides(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [key]: value } }));
  };

  const setMicroNote = (chId, stepIdx, note) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id !== chId) return ch;
      const notes = [...(ch.microNotes || [])];
      notes[stepIdx] = note;
      return { ...ch, microNotes: notes };
    }));
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    const low = cmd.toLowerCase();
    if (low === 'clear') { setChannels(prev => prev.map(ch => ({ ...ch, layers: [Array(32).fill(' '), Array(32).fill(' '), Array(32).fill(' ')] }))); }
    else if (low.startsWith('euclid')) {
      const match = low.match(/euclid\((\d+)\)/);
      if (match) { const hits = parseInt(match[1]); setChannels(prev => { const next = [...prev]; const layer = Array(32).fill(' '); for (let i = 0; i < hits; i++) layer[Math.floor(i * (32 / hits))] = '_'; if (next.length > 0) next[0] = { ...next[0], layers: [next[0].layers[0], next[0].layers[1], layer] }; return next; }); }
    } else if (low === 'undo') { if (dbIdx.current > 0) { dbIdx.current--; setChannels(JSON.parse(JSON.stringify(dbRef.current[dbIdx.current]))); } }
    else if (low === 'redo') { if (dbIdx.current < dbRef.current.length - 1) { dbIdx.current++; setChannels(JSON.parse(JSON.stringify(dbRef.current[dbIdx.current]))); } }
    else if (low === 'sidebar') { setShowSidebar(s => !s); }
    else if (low === 'panic') { setIsPlaying(false); currentStepRef.current = 0; setCurrentStep(0); }
    else if (low.startsWith('bpm ')) { const v = parseInt(low.slice(4)); if (v > 0 && v < 999) setBpm(v); }
    else if (low.startsWith('vol ')) { const v = parseInt(low.slice(4)); setChannels(prev => prev.map((ch, i) => i === 0 ? { ...ch, vol: Math.max(0, Math.min(2, v / 100)) } : ch)); }
    else if (low.startsWith('fill ')) { const ch = cmd.slice(5)[0]; if (ch) setChannels(prev => prev.map(c => ({ ...c, layers: c.layers.map(l => l.map(() => ch)) }))); }
    else if (low.startsWith('root ')) { const n = cmd.slice(5).toUpperCase(); if (NOTE_NAMES.includes(n)) setAffinity(a => ({ ...a, root: n })); }
    else if (low.startsWith('scale ')) { const s = low.slice(6); if (SCALES[s] !== undefined) setAffinity(a => ({ ...a, scale: s })); }
    else if (low === 'mute') { setChannels(prev => prev.map((ch, i) => i === 0 ? { ...ch, active: false } : ch)); }
    else if (low === 'solo') { setChannels(prev => prev.map((ch, i) => ({ ...ch, active: i === 0 }))); }
    else if (low.startsWith('steps ')) { const v = parseInt(low.slice(6)); if (v > 0 && v <= 256) setChannels(prev => prev.map((ch, i) => i === 0 ? { ...ch, patternLen: v } : ch)); }
    else if (low.startsWith('dir ')) { const d = low.slice(4); if (['forward', 'backward', 'pingpong', 'random'].includes(d)) setChannels(prev => prev.map((ch, i) => i === 0 ? { ...ch, patternDir: d } : ch)); }
    else if (low.startsWith('name ')) { const n = cmd.slice(5); setChannels(prev => prev.map((ch, i) => i === 0 ? { ...ch, name: n } : ch)); }
    setTerminalInput('');
  };

  const handleParamChange = (char, key, value) => {
    setCharacterParams(prev => ({
      ...prev, [char]: { ...prev[char], [key]: value }
    }));
    initAudio();
    playChar(char, 2, audioCtx.currentTime, bpm, { ...characterParams[char], [key]: value }, fxBus);
  };

  const handlePreview = (char, overrideParams) => {
    if (!audioCtx) return;
    
    // Use selected channel (not focusedCell) so DSP preview uses the right channel
    const activeCh = channels.find(c => c.id === selectedChannelId) || channels[0];
    
    const tmbEntry = TMB[char] || {};
    const stepParams = { ...(tmbEntry.t || {}), ...(tmbEntry.m || {}), ...(tmbEntry.b || {}) };
    const hasType = !!(tmbEntry.m?.type);
    
    let cp = { autoGate: activeCh ? activeCh.autoGate !== false : true };
    
    if (hasType) {
      cp = { ...cp, ...stepParams, ...overrideParams };
    } else if (activeCh) {
      const typeParams = characterParams[activeCh.type] || {};
      cp = { ...cp, ...typeParams, ...stepParams, ...overrideParams };
    } else {
      cp = { ...cp, ...characterParams[char], ...overrideParams };
    }
    
    if (activeCh) {
      cp.velocity = (cp.velocity || 0.8) * (activeCh.vol !== undefined ? activeCh.vol / 50 : 1.0);
      if (activeCh.pan !== undefined) cp.pan = (cp.pan || 0) + activeCh.pan;
      if (activeCh.phaseInvert !== undefined) cp.phaseInvert = activeCh.phaseInvert;
      if (activeCh.sendA !== undefined && cp.delaySend === undefined) cp.delaySend = activeCh.sendA;
      if (activeCh.sendB !== undefined && cp.reverbSend === undefined) cp.reverbSend = activeCh.sendB;
      
      if (!hasType) {
        cp = { ...cp, ...(activeCh.params || {}) };
        if (activeCh.cutoff < 12000) cp.cutoff = Math.min(cp.cutoff || 12000, activeCh.cutoff);
        if (activeCh.resonance > 0) cp.resonance = (cp.resonance || 0) + activeCh.resonance;
        cp.type = activeCh.type;
      }
      
      // Handle micro tuning or root pitch
      const rootIdx = NOTE_NAMES.indexOf(affinity.root);
      const stepToUse = focusedCell ? focusedCell.stepIdx % (activeCh.patternLen || 32) : 0;
      if (activeCh.microNotes?.[stepToUse] && !PERC_TYPES.includes(activeCh.type)) {
        cp.midiNote = activeCh.microNotes[stepToUse]; cp.tune = activeCh.microNotes[stepToUse];
      } else {
        const previewNote = rootIdx >= 0 ? 48 + rootIdx : 48;
        cp.midiNote = previewNote; cp.tune = previewNote;
      }
    }
    
    playChar(char, 2, audioCtx.currentTime, bpm, cp, fxBus);
  };

  const exportWav = async (exportLoopCount) => {
    try {
      const stepTime = (60.0 / bpm) * 0.25;
      
      let timeline = [];
      if (playMode === 'SONG') {
        songPatterns.forEach(p => {
          for (let i = 0; i < (p.loopCount || 4); i++) timeline.push(p);
        });
      } else {
        for (let i = 0; i < exportLoopCount; i++) timeline.push(songPatterns[songIdx]);
      }
      
      let totalSteps = 0;
      timeline.forEach(p => {
        const maxLen = p.channels.length > 0 ? Math.max(...p.channels.map(ch => ch.patternLen || 32)) : 32;
        totalSteps += maxLen;
      });
      
      const duration = (totalSteps * stepTime) + 4.0;
      const offCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 44100 * duration, 44100);
      
      let currentTime = 0;
      timeline.forEach(pattern => {
        const maxLen = pattern.channels.length > 0 ? Math.max(...pattern.channels.map(ch => ch.patternLen || 32)) : 32;
        for (let step = 0; step < maxLen; step++) {
          pattern.channels.forEach((ch) => {
            if (!ch.active) return;
            const nodeBpm = ch.bpm || bpm;
            const len = ch.patternLen || 32;
            const stepIdx = step % len;
            
            const topChar = ch.layers[0]?.[stepIdx] || ' ';
            const midChar = ch.layers[1]?.[stepIdx] || ' ';
            const botChar = ch.layers[2]?.[stepIdx] || ' ';

            let triggerChar, triggerLayerIdx;
            if (midChar !== ' ' && midChar !== '-' && midChar !== '═' && midChar !== undefined) {
              triggerChar = midChar;
              triggerLayerIdx = 1;
            } else if (topChar !== ' ' && topChar !== '-' && topChar !== '═' && topChar !== undefined) {
              triggerChar = topChar;
              triggerLayerIdx = 0;
            } else if (botChar !== ' ' && botChar !== '-' && botChar !== '═' && botChar !== undefined) {
              triggerChar = botChar;
              triggerLayerIdx = 2;
            } else {
              return;
            }

            const k = `${ch.id}_1_${stepIdx}`;
            const rawOverrides = stepOverrides[k] || {};
            const typeParams = characterParams[ch.type] || {};
            const triggerEntry = TMB[triggerChar] || {};
            const topEntry = TMB[topChar] || {};
            const botEntry = TMB[botChar] || {};
            const topParams = topEntry.t || {};
            const triggerMidParams = triggerEntry.m || {};
            const botParams = botEntry.b || {};
            const stepParams = { ...topParams, ...triggerMidParams, ...botParams };
            const cp = { autoGate: ch.autoGate !== false, ...(triggerMidParams.type ? {} : typeParams), ...stepParams, ...rawOverrides };
            if (rawOverrides.equation) {
              cp.type = 'sandbox_math'; cp.funcStr = rawOverrides.equation; cp.tune = undefined;
            } else if (!triggerMidParams.type) {
              cp.type = ch.type;
            }
            playChar(triggerChar, triggerLayerIdx, currentTime, nodeBpm, cp, null, offCtx, offCtx.destination);
          });
          currentTime += stepTime;
        }
      });
      
      const renderedBuffer = await offCtx.startRendering();
      
      const left = renderedBuffer.getChannelData(0);
      const right = renderedBuffer.getChannelData(1);
      const blob = encodeWAV([left], [right], renderedBuffer.length, 44100, 32);
      
      const url = URL.createObjectURL(blob);
      setLoopCollection(prev => [...prev, { id: Date.now(), name: `Render_${Date.now()}.wav`, url }]);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAWPEARL_Export_${Date.now()}.wav`;
      a.click();
      
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // ─── SAVE / LOAD ─────────────────────────────────────────────────────
  const serializeState = () => ({
    version: 1,
    bpm,
    affinity,
    songPatterns,
    songIdx,
    playMode,
    loopCollection: loopCollection.map(l => ({ id: l.id, name: l.name })),
    characterParams,
    stepOverrides,
    selectedChar,
    selectedTool,
    selectedChannelId,
    activeTab,
  });

  const deserializeState = (loaded) => {
    if (!loaded.songPatterns) return false;
    let maxId = 100;
    loaded.songPatterns.forEach(p => {
      p.channels.forEach(ch => { if (ch.id > maxId) maxId = ch.id; });
    });
    nextChId = maxId + 1;
    setSongPatterns(loaded.songPatterns);
    if (loaded.songIdx !== undefined) setSongIdx(loaded.songIdx);
    if (loaded.playMode) setPlayMode(loaded.playMode);
    if (loaded.bpm) setBpm(loaded.bpm);
    if (loaded.affinity) setAffinity(loaded.affinity);
    if (loaded.characterParams) setCharacterParams(loaded.characterParams);
    if (loaded.stepOverrides) setStepOverrides(loaded.stepOverrides);
    if (loaded.selectedChar) setSelectedChar(loaded.selectedChar);
    if (loaded.selectedTool) setSelectedTool(loaded.selectedTool);
    if (loaded.selectedChannelId) setSelectedChannelId(loaded.selectedChannelId);
    if (loaded.activeTab) setActiveTab(loaded.activeTab);
    return true;
  };

  const handleSaveState = async () => {
    const json = JSON.stringify(serializeState(), null, 2);
    if (window.__JUCE__ && window.__JUCE__.saveFile) {
      await window.__JUCE__.saveFile(json);
    } else if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `RAWPEARL5_STATE_${Date.now()}.json`,
          types: [{ description: 'RAWPEARL5 State', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Save failed:", err);
      }
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAWPEARL5_STATE_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLoadState = async (e) => {
    let text = null;
    if (window.__JUCE__ && window.__JUCE__.loadFile) {
      text = await window.__JUCE__.loadFile();
      if (!text) return;
    } else if (window.showOpenFilePicker && !e?.target?.files) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'RAWPEARL5 State', accept: { 'application/json': ['.json'] } }],
          multiple: false,
        });
        const file = await handle.getFile();
        text = await file.text();
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Load failed:", err);
        return;
      }
    } else if (e && e.target && e.target.files?.[0]) {
      const file = e.target.files[0];
      text = await file.text();
      e.target.value = '';
    } else {
      return;
    }
    try {
      const loaded = JSON.parse(text);
      deserializeState(loaded);
    } catch (err) {
      console.error("Failed to load state:", err);
      alert("Invalid state file");
    }
  };

  // ─── ARRANGEMENT (Song Mode) ───────────────────────────────────────
  // Cycle through patterns at bar boundaries
  const patternCycleRef = useRef(0);
  const arrangementTimelineRef = useRef([]);
  
  // Build arrangement from songPatterns order: each pattern plays loopCount times
  const getArrangementTimeline = useCallback(() => {
    return songPatterns.flatMap(p => 
      Array.from({ length: p.loopCount || 4 }, () => p.id)
    );
  }, [songPatterns]);

  // Called each bar cycle to advance arrangement
  const advanceArrangement = useCallback(() => {
    const tl = getArrangementTimeline();
    if (tl.length === 0) return;
    const curIdx = tl.indexOf(songPatterns[songIdx]?.id);
    const nextIdx = (curIdx + 1) % tl.length;
    const nextId = tl[nextIdx];
    const newIdx = songPatterns.findIndex(p => p.id === nextId);
    if (newIdx >= 0) setSongIdx(newIdx);
  }, [getArrangementTimeline, songPatterns, songIdx, setSongIdx]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-mono text-[#ffcc00] selection:bg-[#ffcc00] selection:text-black">
      <style>{`
        .crt-glow { text-shadow: 0 0 5px #ffcc00, 0 0 10px #ffaa00; }
        .crt-active { background-color: #ffcc00; color: black; text-shadow: none; }
        .crt-dim { color: rgba(255, 204, 0, 0.4); }
        .crt-border { border-color: #ffcc00; box-shadow: 0 0 8px rgba(255, 204, 0, 0.4); }
        @keyframes symbolFlash {
          0% { text-shadow: 0 0 4px currentColor, 0 0 8px currentColor; }
          50% { text-shadow: 0 0 12px currentColor, 0 0 24px currentColor, 0 0 36px currentColor; color: #fff; }
          100% { text-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,204,0,0.05); }
        ::-webkit-scrollbar-thumb { background: #ffcc00; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 900; display: flex; align-items: center; justify-content: center; }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 4px; background: #ffcc00; cursor: pointer; border-radius: 0; }
        input[type=range]::-webkit-slider-runnable-track { height: 2px; background: #333; }
        select { -webkit-appearance: none; border-radius: 0; }
        input.step-num::-webkit-inner-spin-button,
        input.step-num::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input.step-num { -moz-appearance: textfield; appearance: textfield; }
        input.step-num:focus { outline: none; background: rgba(255,204,0,0.15); }
      `}</style>



      <TransportBar isPlaying={isPlaying} bpm={bpm} onTogglePlay={togglePlay} onBpmChange={setBpm}
        onAddChannel={addChannel} selectedTool={selectedTool} onSetTool={setSelectedTool}
        onShowDensity={setShowDensityLib} stepEdit={stepEdit} onStepEdit={setStepEdit}
        stepMode={stepMode} onSetStepMode={setStepMode}
        isRecordingLive={isRecordingLive} onToggleLiveRecord={toggleLiveRecord} />

      <MasterPanel affinity={affinity} onSetAffinity={setAffinity}
        showMicroPopup={showMicroPopup} onSetMicroPopup={setShowMicroPopup} />

      {/* TAB NAV */}
      <div className="flex border-b border-[rgba(255,204,0,0.15)] px-3 shrink-0 items-center">
        <button onClick={() => setActiveTab('pattern')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'pattern' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'pattern' ? { marginBottom: -1 } : {}}>
          [PATTERN]
        </button>
        <button onClick={() => setActiveTab('sounds')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'sounds' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'sounds' ? { marginBottom: -1 } : {}}>
          [SOUNDS]
        </button>
        <button onClick={() => setActiveTab('song')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'song' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'song' ? { marginBottom: -1 } : {}}>
          [SONG]
        </button>
        <button onClick={() => setActiveTab('mixer')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'mixer' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'mixer' ? { marginBottom: -1 } : {}}>
          [MIXER]
        </button>
        <button onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'sandbox' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'sandbox' ? { marginBottom: -1 } : {}}>
          [SANDBOX]
        </button>
        <button onClick={() => setActiveTab('encantor')}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-t border-l border-r ${activeTab === 'encantor' ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-transparent crt-dim hover:text-[#ffcc00]'}`}
          style={activeTab === 'encantor' ? { marginBottom: -1 } : {}}>
          [ENCANTOR]
        </button>
        <button onClick={() => { handleSaveState(); }}
          className="px-2 py-1 text-[10px] font-bold text-[#39ff14] hover:text-white ml-2"
          title="Save RAWPEARL5 state">[SAVE]</button>
        <button onClick={() => {
          if (window.__JUCE__ && window.__JUCE__.loadFile) {
            handleLoadState();
          } else if (window.showOpenFilePicker) {
            handleLoadState();
          } else {
            loadStateRef.current?.click();
          }
        }}
          className="px-2 py-1 text-[10px] font-bold text-[#39ff14] hover:text-white"
          title="Load RAWPEARL5 state">[LOAD]</button>
        <input ref={loadStateRef} type="file" accept=".json" onChange={(e) => { if (!window.__JUCE__ && !window.showOpenFilePicker) handleLoadState(e); }} className="hidden" />
        <button onClick={() => setActiveTab('help')}
          className={`px-2 py-1 text-[10px] crt-dim hover:text-[#ffcc00] ml-auto ${activeTab === 'help' ? 'bg-[#ffcc00] text-black font-bold' : ''}`}>[HELP]</button>
      </div>

      {activeTab === 'pattern' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="bg-[#050505] border-b border-[#ffcc00]/20 p-2 flex items-center justify-between px-4 shrink-0 shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-[#ffcc00] text-3xl font-bold font-mono bg-black px-4 py-1 rounded-sm border border-[#ffcc00]/40 shadow-[0_0_15px_rgba(255,204,0,0.2)]">
                {selectedChar !== ' ' ? selectedChar : '-'}
              </div>
              <div className="flex flex-col">
                <span className="text-[#ffcc00] text-xs font-bold tracking-widest uppercase opacity-60">Active Sound</span>
                <span className="text-[#ffcc00] text-lg font-mono tracking-wide">
                  {selectedChar !== ' ' && (TMB_SYMBOLS[selectedChar] || ASCII_DICTIONARY[selectedChar]) ? (TMB_SYMBOLS[selectedChar]?.desc || ASCII_DICTIONARY[selectedChar]?.desc) : 'None Selected'}
                </span>
              </div>
            </div>
            {focusedCell && (
              <div className="text-[10px] text-[#ffcc00]/40 font-mono text-right uppercase">
                Focus: CH {focusedCell.chIdx + 1} / L {focusedCell.layerIdx + 1} / S {focusedCell.stepIdx + 1}
              </div>
            )}
          </div>
          <div className="flex flex-1 overflow-hidden">
            <ChannelRack channels={channels} isPlaying={isPlaying} currentStep={currentStep} bpm={bpm} affinity={affinity}
              stepOverrides={stepOverrides} characterParams={characterParams}
              selectedTool={selectedTool} onCellClick={handleCellClick} onCellContextMenu={handleCellContextMenu}
              onRemoveChannel={removeChannel} onRenameChannel={updateChannel} onSetChannel={setChannel}
              onSetMicroNote={setMicroNote} focusedCell={focusedCell} setFocusedCell={setFocusedCell}
              ctxMenu={ctxMenu} onSetCtxMenu={setCtxMenu}
              stepEdit={stepEdit} onSetStepParam={setStepParam}
              stepMode={stepMode} onSetStepMode={setStepMode}
              selectedChannelId={selectedChannelId} onSelectChannel={handleSelectChannel}
              onSelectChar={setSelectedChar} onSetTool={setSelectedTool} />
            {showSidebar && (
              <Sidebar asciiDict={ASCII_DICT} selectedChar={selectedChar} onSelectChar={setSelectedChar} onPreview={handlePreview} />
            )}
          </div>
        </div>
      ) : activeTab === 'song' ? (
        <div className="flex flex-col flex-1 overflow-hidden p-2">
          <SongArranger 
            songPatterns={songPatterns} setSongPatterns={setSongPatterns}
            songIdx={songIdx} setSongIdx={setSongIdx}
            playMode={playMode} setPlayMode={setPlayMode} 
            loopCollection={loopCollection} setLoopCollection={setLoopCollection}
            exportWav={exportWav}
            channels={channels} setChannels={setChannels}
            bpm={bpm} isPlaying={isPlaying} affinity={affinity}
            onSaveState={handleSaveState} onLoadState={handleLoadState}
          />
        </div>
      ) : activeTab === 'mixer' ? (
        <Mixer channels={channels} onSetChannel={setChannel} isPlaying={isPlaying} bpm={bpm} currentStep={currentStep} />
      ) : activeTab === 'sandbox' ? (
        <div className="flex-1 overflow-auto">
          <MathSandbox onSaveEquation={(eqStr, eqOctave) => {
             const sym = prompt("Enter a character to assign this equation to:");
             if (sym && sym.length === 1) {
               ASCII_DICTIONARY[sym] = {
                 type: 'sandbox_math',
                 desc: `Custom Eq (Oct: ${eqOctave})`,
                 funcStr: eqStr,
                 octave: eqOctave
               };
               alert(`Saved! Type '${sym}' in the sequencer.`);
             }
          }} onAddChannel={(eqStr) => {
             const ch = createChannel('π', null, 'CHIP');
             ch.name = 'π';
             ch.presetName = null;
             ch.params = { type: 'sandbox_math', funcStr: eqStr, desc: 'Sandbox Custom' };
             setChannels(prev => [...prev, ch]);
             setActiveTab('pattern');
          }} />
        </div>
      ) : activeTab === 'encantor' ? (
        <div className="flex flex-col flex-1 overflow-hidden p-2">
          <Encantor />
        </div>
      ) : activeTab === 'help' ? (
        <HelpPage asciiDict={ASCII_DICT} selectedChar={selectedChar} onSelectChar={setSelectedChar} onPreview={handlePreview} />
      ) : (
        <SoundDesign 
          characterParams={characterParams}
          onParamChange={handleParamChange} 
          onPreview={handlePreview}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onUpdateChannel={updateChannel}
          selectedChar={selectedChar}
          onSelectChar={setSelectedChar}
        />
      )}

      <Terminal terminalInput={terminalInput} onInputChange={setTerminalInput} onSubmit={handleTerminalSubmit} />

      {ctxMenu && (
        <RadialModal ctxMenu={ctxMenu} onClose={() => setCtxMenu(null)} onSetChar={ctxMenuSetChar}
          onSetStepParam={setStepParam} stepOverrides={stepOverrides}
          characterParams={characterParams}
          asciiDict={ASCII_DICT} asciiDictionary={ASCII_DICTIONARY} />
      )}

      <DensityModal show={showDensityLib} onClose={() => setShowDensityLib(false)} onSelectChar={setSelectedChar} onPreview={handlePreview} />
    </div>
  );
}
