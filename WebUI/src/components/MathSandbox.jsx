import React, { useState, useEffect, useRef } from 'react';
import { MATH_PRESETS } from '../MathPresets.js';

// --- DSP Math Scope ---
// Massive library of operands, logic, particle physics, and chaotic attractors
export const dspScope = {
  // Waveforms
  sin: Math.sin, cos: Math.cos, pi: Math.PI,
  saw: (x) => 2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5)),
  sqr: (x) => (Math.sin(x) > 0 ? 1 : -1),
  tri: (x) => 2 * Math.abs(2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5))) - 1,
  noise: () => Math.random() * 2 - 1,
  
  // Basic Math
  exp: Math.exp, abs: Math.abs, pow: Math.pow, log: Math.log, log10: Math.log10,
  sqrt: Math.sqrt, tan: Math.tan, rand: Math.random,
  round: Math.round, ceil: Math.ceil, floor: Math.floor, sign: Math.sign,
  min: Math.min, max: Math.max,
  
  // Signal Shaping
  fold: (x) => { let v = Math.abs(x) % 2.0; return v > 1.0 ? 2.0 - v : v; },
  wrap: (x) => x - 2.0 * Math.floor(x / 2.0 + 0.5),
  clamp: (x, a, b) => Math.max(a, Math.min(x, b)),
  tanh: Math.tanh, softclip: (x) => x / (1 + Math.abs(x)),
  bitcrush: (x, bits) => { const s = Math.pow(2, bits); return Math.round(x * s) / s; },
  decimate: (x, rate, t) => (Math.floor(t * rate) % 2 === 0 ? x : 0), // naive sample reduction

  // Synchronization & Interpolation
  sync: (t, f, f_master) => (t * f) % (1 / f_master) * f,
  lerp: (a, b, t) => a + t * (b - a),
  smoothstep: (x) => x * x * (3 - 2 * x),
  
  // DSP State Variables (Defaults for preview)
  decay: 0.5, cutoff: 0.5, resonance: 0.5, distortion: 0.5, pan: 0.5,
  attack: 0.1, velocity: 0.8, gate: 0.5, ratchet: 1, 
  modIndex: 2.0, harmonicRatio: 2.0,
  
  // Hellenic Synths (Defaults as generators)
  'α': (t, f) => 2 * ((t * f) - Math.floor(t * f + 0.5)),
  'δ': (t, f) => Math.sin(2 * Math.PI * f * t),
  'φ': (t, f) => Math.sin(2 * Math.PI * f * t + Math.sin(2 * Math.PI * f * 2 * t)),
  'Σ': (t, f) => Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t),
  'γ': (t, f) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 10),
  'ω': (t, f) => (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * f * t),
  'π': (t, f) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2),
  'τ': (t, f) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 20),
  'w': (t, f) => (Math.random() * 2 - 1) * Math.exp(-t * 8),

  // Logic & Gates
  gt: (a, b) => (a > b ? 1 : 0),
  lt: (a, b) => (a < b ? 1 : 0),
  eq: (a, b) => (Math.abs(a - b) < 0.001 ? 1 : 0),
  stepGate: (x, threshold) => (x > threshold ? 1 : 0),
  ifelse: (cond, a, b) => (cond > 0 ? a : b),

  // Chaos & Attractors
  logistic: (x) => 3.9 * x * (1 - x), // Chaotic bifurcation
  rossler: (x, y, z, t) => -y - z, // 1D slice of Rössler
  trend: (x, t) => x * (Math.sin(t * 10) > 0 ? 1 : -1), // Pseudo Bala-tor trend swap
  
  // Particle Physics (Pure Math representations)
  bounce: (t, gravity, damp) => Math.abs(Math.cos(t * gravity) * Math.exp(-damp * t)),
  inertia: (v, m, force, t) => v + (force / m) * t,
  friction: (v, mu) => v * Math.exp(-mu),
  spring: (k, x, d, v) => -k * x - d * v, // Hooke's Law with damping

  // Euclidean & Cellular Automata
  euclid: (t, hits, steps) => (Math.floor(t * 10) * hits) % steps < hits ? 1 : 0,
  rule30: (t) => { const i = Math.floor(t * 100) % 255; return ((i >> 1) ^ (i | (i << 1))) & 1; }
};

// --- Token Categories for UI ---
const PALETTE = {
  Variables: [
    { label: 't (Time)', val: 't', color: 'text-green-400' },
    { label: 'f (Freq)', val: 'f', color: 'text-green-400' },
    { label: 'decay', val: 'decay', color: 'text-green-400' },
    { label: 'attack', val: 'attack', color: 'text-green-400' },
    { label: 'cutoff', val: 'cutoff', color: 'text-green-400' },
    { label: 'resonance', val: 'resonance', color: 'text-green-400' },
    { label: 'distortion', val: 'distortion', color: 'text-green-400' },
    { label: 'velocity', val: 'velocity', color: 'text-green-400' },
    { label: 'pan', val: 'pan', color: 'text-green-400' },
    { label: 'modIndex', val: 'modIndex', color: 'text-green-400' }
  ],
  Hellenic_Synths: [
    { label: 'α(t,f)', val: 'α(t,f)', color: 'text-fuchsia-400' },
    { label: 'δ(t,f)', val: 'δ(t,f)', color: 'text-fuchsia-400' },
    { label: 'φ(t,f)', val: 'φ(t,f)', color: 'text-fuchsia-400' },
    { label: 'Σ(t,f)', val: 'Σ(t,f)', color: 'text-fuchsia-400' },
    { label: 'γ(t,f)', val: 'γ(t,f)', color: 'text-fuchsia-400' },
    { label: 'ω(t,f)', val: 'ω(t,f)', color: 'text-fuchsia-400' },
    { label: 'π(t,f)', val: 'π(t,f)', color: 'text-fuchsia-400' },
    { label: 'τ(t,f)', val: 'τ(t,f)', color: 'text-fuchsia-400' },
    { label: 'w(t,f)', val: 'w(t,f)', color: 'text-fuchsia-400' }
  ],
  Waveforms: [
    { label: 'sin(', val: 'sin(', color: 'text-yellow-400' },
    { label: 'saw(', val: 'saw(', color: 'text-yellow-400' },
    { label: 'sqr(', val: 'sqr(', color: 'text-yellow-400' },
    { label: 'tri(', val: 'tri(', color: 'text-yellow-400' },
    { label: 'noise()', val: 'noise()', color: 'text-yellow-400' },
  ],
  Math_Functions: [
    { label: 'exp(', val: 'exp(', color: 'text-yellow-400' },
    { label: 'abs(', val: 'abs(', color: 'text-yellow-400' },
    { label: 'pow(', val: 'pow(', color: 'text-yellow-400' },
    { label: 'log(', val: 'log(', color: 'text-yellow-400' },
    { label: 'sqrt(', val: 'sqrt(', color: 'text-yellow-400' },
    { label: 'tanh(', val: 'tanh(', color: 'text-yellow-400' },
    { label: 'min(', val: 'min(', color: 'text-yellow-400' },
    { label: 'max(', val: 'max(', color: 'text-yellow-400' }
  ],
  Signal_Shaping: [
    { label: 'fold(', val: 'fold(', color: 'text-yellow-400' },
    { label: 'wrap(', val: 'wrap(', color: 'text-yellow-400' },
    { label: 'clamp(', val: 'clamp(', color: 'text-yellow-400' },
    { label: 'softclip(', val: 'softclip(', color: 'text-yellow-400' },
    { label: 'bitcrush(', val: 'bitcrush(', color: 'text-yellow-400' },
    { label: 'lerp(', val: 'lerp(', color: 'text-yellow-400' }
  ],
  Logic_Gates: [
    { label: 'gt(', val: 'gt(', color: 'text-yellow-400' },
    { label: 'lt(', val: 'lt(', color: 'text-yellow-400' },
    { label: 'eq(', val: 'eq(', color: 'text-yellow-400' },
    { label: 'gate(', val: 'gate(', color: 'text-yellow-400' },
    { label: 'ifelse(', val: 'ifelse(', color: 'text-yellow-400' }
  ],
  Chaos_Physics: [
    { label: 'bounce(', val: 'bounce(', color: 'text-yellow-400' },
    { label: 'inertia(', val: 'inertia(', color: 'text-yellow-400' },
    { label: 'spring(', val: 'spring(', color: 'text-yellow-400' },
    { label: 'logistic(', val: 'logistic(', color: 'text-yellow-400' },
    { label: 'trend(', val: 'trend(', color: 'text-yellow-400' },
    { label: 'euclid(', val: 'euclid(', color: 'text-yellow-400' },
    { label: 'rule30(', val: 'rule30(', color: 'text-yellow-400' }
  ],
  Partial_Equations: [
    { label: 'Fast Decay', val: '(exp(-20 * t))', color: 'text-green-400' },
    { label: 'Slow Decay', val: '(exp(-2 * t))', color: 'text-green-400' },
    { label: 'LFO Sin', val: '(sin(2 * pi * 5 * t))', color: 'text-green-400' },
    { label: 'Harmonic 2', val: 'sin(2 * pi * (f*2) * t)', color: 'text-green-400' },
    { label: 'Bouncing Ball', val: 'bounce(t, 15, 2)', color: 'text-green-400' }
  ],
  Operators: [
    { label: '+', val: '+', color: 'text-blue-400' },
    { label: '-', val: '-', color: 'text-blue-400' },
    { label: '*', val: '*', color: 'text-blue-400' },
    { label: '/', val: '/', color: 'text-blue-400' },
    { label: '%', val: '%', color: 'text-blue-400' },
    { label: ',', val: ',', color: 'text-blue-400' },
    { label: '(', val: '(', color: 'text-blue-400' },
    { label: ')', val: ')', color: 'text-blue-400' }
  ],
  Constants: [
    { label: '0.1', val: '0.1', color: 'text-green-400' },
    { label: '0.5', val: '0.5', color: 'text-green-400' },
    { label: '1', val: '1', color: 'text-green-400' },
    { label: '2', val: '2', color: 'text-green-400' },
    { label: '3', val: '3', color: 'text-green-400' },
    { label: '5', val: '5', color: 'text-green-400' },
    { label: '10', val: '10', color: 'text-green-400' },
    { label: '20', val: '20', color: 'text-green-400' }
  ]
};

// --- Presets imported from MathPresets.js ---

export default function MathSandbox({ onSaveEquation, onAddChannel }) {
  const [equation, setEquation] = useState(MATH_PRESETS['FM Synthesis'][0].eq);
  const [cursorIndex, setCursorIndex] = useState(equation ? equation.length : 0);
  const [openFolders, setOpenFolders] = useState({});
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [octave, setOctave] = useState(0);

  // Re-draw visualization when equation changes (if we had state for buffer, but we generate on fly)
  
  const addToken = (token) => {
    const newEq = [...equation];
    newEq.splice(cursorIndex, 0, { ...token });
    setEquation(newEq);
    setCursorIndex(cursorIndex + 1);
    setError(null);
  };

  const removeToken = (index) => {
    setEquation(equation.filter((_, i) => i !== index));
    if (cursorIndex > index) {
      setCursorIndex(cursorIndex - 1);
    }
    setError(null);
  };

  const clearEquation = () => {
    setEquation([]);
    setCursorIndex(0);
    setError(null);
    clearCanvas();
  };

  const loadPreset = (presetEq) => {
    setEquation(presetEq);
    setCursorIndex(presetEq.length);
    setError(null);
  };

  const toggleFolder = (category) => {
    setOpenFolders(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#166534'; // green-800
    ctx.stroke();
  };

  const drawWaveform = (bufferData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    clearCanvas();
    
    ctx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferData.length;
    let x = 0;

    for (let i = 0; i < bufferData.length; i++) {
      // Normalize -1 to 1 into canvas height
      const v = bufferData[i] * 0.5 + 0.5; // 0 to 1
      const y = (1 - v) * canvas.height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.strokeStyle = '#4ade80'; // green-400
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const autoRepairEquation = () => {
    let newEq = [...equation];
    if (newEq.length === 0) return newEq;

    // 1. Check for leading operator
    if (/^[+\-*/%]$/.test(newEq[0].val)) {
      newEq.unshift({ label: '0', val: '0', color: 'text-red-500 font-bold border-red-500' });
    }

    // 2. Check for consecutive operators
    for (let i = 0; i < newEq.length - 1; i++) {
      const curr = newEq[i];
      const next = newEq[i+1];
      if (/^[+\-*/%]$/.test(curr.val) && /^[+\-*/%]$/.test(next.val)) {
        // insert dummy 1 between consecutive operators
        newEq.splice(i+1, 0, { label: '1', val: '1', color: 'text-red-500 font-bold border-red-500' });
        i++; // skip the newly inserted token
      }
    }

    let openCount = 0;
    let closeCount = 0;
    for (let t of newEq) {
      openCount += (t.val.match(/\(/g) || []).length;
      closeCount += (t.val.match(/\)/g) || []).length;
    }
    
    if (openCount > closeCount) {
      for (let i = 0; i < openCount - closeCount; i++) {
        newEq.push({ label: ')', val: ')', color: 'text-red-500 font-bold border-red-500' });
      }
    }
    
    const lastToken = newEq[newEq.length - 1];
    if (lastToken && /^[+\-*/%]$/.test(lastToken.val)) {
       newEq.push({ label: '0', val: '0', color: 'text-red-500 font-bold border-red-500' });
    }
    
    if (JSON.stringify(newEq) !== JSON.stringify(equation)) {
      setEquation(newEq);
      setCursorIndex(newEq.length);
    }
    return newEq;
  };

  const getCompiledJSString = (eqState) => {
    let jsString = eqState.map(t => t.val).join(' ');
    if (jsString.trim() === '') jsString = '0';
    return jsString;
  };

  const compileAndAudition = () => {
    if (equation.length === 0) return;
    setError(null);
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const actx = audioCtxRef.current;
    if (actx.state === 'suspended') actx.resume();
    
    try {
      const repairedEq = autoRepairEquation();
      const jsString = getCompiledJSString(repairedEq);
      
      // Build a Proxy scope that returns 0 for ANY unknown identifier.
      // This means typos, partial names, or unexpected tokens silently evaluate to 0
      // rather than throwing a ReferenceError and blocking output entirely.
      const mutableScope = Object.assign(Object.create(null), dspScope);
      const safeScope = new Proxy(mutableScope, {
        has() { return true; },          // make `in` check always pass for `with`
        get(target, prop) {
          if (typeof prop !== 'string') return Reflect.get(target, prop);
          return prop in target ? target[prop] : 0;  // unknown identifier → 0
        }
      });

      // Use `with(scope)` so every identifier in jsString is looked up through
      // the proxy. new Function() creates non-strict mode — with() is allowed.
      const funcBody = 'with(scope){return(' + jsString + ')}';
      const dspFunc = new Function('scope', funcBody);
      
      // Generate Audio Buffer (1 second)
      const sampleRate = actx.sampleRate;
      const buffer = actx.createBuffer(2, sampleRate, sampleRate);
      const dataL = buffer.getChannelData(0);
      const dataR = buffer.getChannelData(1);
      const baseFrequency = 55 * Math.pow(2, octave);
      
      let nanCount = 0;
      let infCount = 0;
      
      // Mutate scope.t and scope.f each sample to avoid per-sample Proxy construction
      mutableScope.f = baseFrequency;

      for (let i = 0; i < sampleRate; i++) {
        mutableScope.t = i / sampleRate;
        let val;
        try {
          val = dspFunc(safeScope);
        } catch(e) {
          val = 0;
        }
        // Cap reciprocal blow-up (1/0 = Infinity) and NaN (0/0)
        if (!isFinite(val)) { infCount++; val = Math.sign(val) || 0; }
        if (isNaN(val))     { nanCount++;  val = 0; }
        const clipped = val > 1 ? 1 : val < -1 ? -1 : val;
        dataL[i] = clipped;
        dataR[i] = clipped;
      }

      // Warn but don't crash on bad samples
      if (nanCount > 0 || infCount > 0) {
        setError(`WARN: ${nanCount} NaN + ${infCount} Inf samples zeroed/clamped. Output still playable.`);
      }

      // Visualizer
      const visualData = dataL.slice(0, Math.floor(sampleRate * 0.1));
      drawWaveform(visualData);

      // Play
      const source = actx.createBufferSource();
      source.buffer = buffer;
      source.connect(actx.destination);
      source.start();
      setIsPlaying(true);
      source.onended = () => setIsPlaying(false);

    } catch (err) {
      setError(`COMPILER ERROR: ${err.message}`);
      clearCanvas();
    }
  };

  const handleSave = () => {
    const jsString = getCompiledJSString(equation);
    if (onSaveEquation) {
      onSaveEquation(jsString, octave);
    }
  };

  // Keyboard shortcuts for inserting tokens
  const KEY_MAP = {
    't': { label: 't (Time)', val: 't', color: 'text-green-400' },
    'f': { label: 'f (Freq)', val: 'f', color: 'text-green-400' },
    's': { label: 'sin(', val: 'sin(', color: 'text-yellow-400' },
    'c': { label: 'cos(', val: 'cos(', color: 'text-yellow-400' },
    'a': { label: 'abs(', val: 'abs(', color: 'text-yellow-400' },
    'e': { label: 'exp(', val: 'exp(', color: 'text-yellow-400' },
    'p': { label: 'pow(', val: 'pow(', color: 'text-yellow-400' },
    'r': { label: 'rand', val: 'rand', color: 'text-yellow-400' },
    'n': { label: 'noise()', val: 'noise()', color: 'text-yellow-400' },
    'l': { label: 'log(', val: 'log(', color: 'text-yellow-400' },
    'q': { label: 'sqrt(', val: 'sqrt(', color: 'text-yellow-400' },
    'w': { label: 'saw(', val: 'saw(', color: 'text-yellow-400' },
    'u': { label: 'fold(', val: 'fold(', color: 'text-yellow-400' },
    'o': { label: 'softclip(', val: 'softclip(', color: 'text-yellow-400' },
    'h': { label: 'tanh(', val: 'tanh(', color: 'text-yellow-400' },
  };
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      const key = e.key.toLowerCase();
      if (key.length === 1 && KEY_MAP[key]) {
        e.preventDefault();
        addToken(KEY_MAP[key]);
      }
      if (key === 'backspace') {
        e.preventDefault();
        if (equation.length > 0 && cursorIndex > 0) {
          removeToken(cursorIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cursorIndex, equation.length]);

  useEffect(() => {
    clearCanvas();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-green-500 p-6 font-mono selection:bg-green-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="border-b border-green-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-green-400">Math Sandbox</h1>
            <p className="text-green-700 text-sm">DSP Algebraic Node Sandbox // Equation Compiler</p>
          </div>
          <div className="text-xs text-green-600 bg-neutral-900 px-3 py-1 border border-green-900 rounded">
            y(t) = Compiler.eval( AST )
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Palette & Presets */}
          <div className="col-span-4 space-y-6 flex flex-col h-[calc(100vh-140px)]">
            
            {/* Presets */}
            <div className="bg-neutral-900 p-4 rounded border border-green-900 shrink-0 max-h-[300px] overflow-y-auto custom-scrollbar">
              <h2 className="text-xs uppercase tracking-widest text-green-600 mb-3 border-b border-green-900 pb-1">
                DAW Architectural Presets
              </h2>
              <div className="flex flex-col gap-1">
                {Object.entries(MATH_PRESETS).map(([category, items]) => {
                  const isOpen = openFolders[category];
                  return (
                    <div key={category} className="flex flex-col">
                      <div 
                        onClick={() => toggleFolder(category)}
                        className="flex items-center gap-2 py-1 px-2 rounded cursor-pointer bg-neutral-950 border border-green-900/30 hover:border-green-500 hover:text-white transition-colors"
                      >
                        <span className="w-3 text-center">{isOpen ? 'v' : '>'}</span>
                        <span className="font-bold text-xs">[{category}]</span>
                      </div>
                      
                      {isOpen && (
                        <div className="flex flex-col pl-4 mt-1 mb-2 border-l border-green-900/30 ml-2 gap-1">
                          {items.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => loadPreset(item.eq)}
                              className="text-left text-[10px] p-1.5 rounded bg-neutral-950 border border-transparent hover:border-green-500 hover:bg-green-900 hover:text-white transition-colors flex items-center gap-2"
                            >
                              <span className="w-2 text-green-700">-</span>
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="bg-neutral-950 p-2 rounded border border-green-900/30 text-[8px] text-green-700 flex flex-wrap gap-x-3 gap-y-1 shrink-0">
              <span className="text-green-500 font-bold">KEY:</span>
              t=time f=freq s=sin c=cos a=abs e=exp p=pow n=noise l=log q=sqrt w=saw u=fold o=clip h=tanh r=rand &lt;BS&gt;=delete
            </div>

            {/* Symbols Palette */}
            <div className="bg-neutral-900 p-4 rounded border border-green-900 flex-grow overflow-y-auto">
              <h2 className="text-xs uppercase tracking-widest text-green-600 mb-4 border-b border-green-900 pb-1">
                Equation Matrix Palette
              </h2>
              
              <div className="space-y-6">
                {Object.entries(PALETTE).map(([category, tokens]) => (
                  <div key={category}>
                    <div className="text-[10px] text-green-700 mb-2 uppercase">{category.replace('_', ' ')}</div>
                    <div className="flex flex-wrap gap-2">
                      {tokens.map((token, i) => (
                        <button
                          key={i}
                          onClick={() => addToken(token)}
                          className={`px-3 py-2 text-sm rounded bg-neutral-950 border border-neutral-700 hover:border-green-500 shadow-sm transition-all ${token.color}`}
                        >
                          {token.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Builder & Visualizer */}
          <div className="col-span-8 space-y-6 flex flex-col h-[calc(100vh-140px)]">
            
            {/* The Equation Builder Canvas */}
            <div className="bg-neutral-900 p-4 rounded border border-green-900 shadow-inner flex flex-col shrink-0">
              <div className="flex justify-between items-center border-b border-green-900 pb-2 mb-4">
                <h2 className="text-xs uppercase tracking-widest text-green-600">
                  Active Formula Compiler
                </h2>
                <button 
                  onClick={clearEquation}
                  className="text-xs text-red-500 hover:text-red-300"
                >
                  [ CLEAR ]
                </button>
              </div>

              {/* Token Display Area */}
              <div className="min-h-[120px] bg-neutral-950 border border-neutral-800 rounded p-4 flex flex-wrap content-start items-center relative">
                <span className="text-2xl text-green-800 mr-2 font-serif italic">y(t) = </span>
                {equation.length === 0 && (
                  <span className="text-neutral-600 italic text-sm absolute left-16 top-5 pointer-events-none">Select symbols from the palette...</span>
                )}
                
                {Array.from({ length: equation.length + 1 }).map((_, i) => (
                  <React.Fragment key={`slot-${i}`}>
                    {/* Cursor Insertion Point */}
                    <div
                      onClick={() => setCursorIndex(i)}
                      className={`h-10 w-2 cursor-pointer transition-all mx-1 rounded-full ${
                        cursorIndex === i 
                          ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' 
                          : 'bg-transparent hover:bg-green-900/50'
                      }`}
                    />
                    
                    {/* Token */}
                    {i < equation.length && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeToken(i);
                        }}
                        className={`px-3 py-2 text-lg rounded bg-neutral-800 border border-neutral-700 hover:border-red-500 hover:bg-red-900/30 transition-colors group relative ${equation[i].color}`}
                      >
                        {equation[i].label}
                        {/* Tooltip to delete */}
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          x
                        </span>
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded">
                  {error}
                </div>
              )}
            </div>

            {/* Visualizer & Controls */}
            <div className="bg-neutral-900 p-4 rounded border border-green-900 flex-grow flex flex-col relative">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xs uppercase tracking-widest text-green-600">Oscilloscope [0.1s Window]</h2>
                 <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-700 uppercase">Octave</span>
                    <input 
                      type="range" min="-2" max="4" step="1" 
                      value={octave} onChange={(e) => setOctave(parseInt(e.target.value))}
                      className="w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-green-400 font-bold w-4">{octave > 0 ? `+${octave}` : octave}</span>
                  </div>
                  <button
                      onClick={compileAndAudition}
                      className={`px-8 py-3 rounded font-bold tracking-widest transition-all ${
                        isPlaying 
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]' 
                          : 'bg-green-700 text-green-100 hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                      }`}
                  >
                    {isPlaying ? 'PLAYING...' : 'COMPILE & AUDITION'}
                  </button>
                 </div>
              </div>

              <div className="flex-grow bg-neutral-950 border border-green-900/50 rounded relative overflow-hidden flex items-center justify-center">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Canvas for Waveform */}
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={300} 
                  className="w-full h-full relative z-10"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button 
                  className="text-xs border border-green-800 text-green-600 px-4 py-2 rounded hover:bg-green-900/30 transition-colors"
                  onClick={handleSave}
                >
                  [ ASSIGN TO KEY ]
                </button>
                <button 
                  className="text-xs border border-green-600 text-green-400 px-4 py-2 rounded font-bold hover:bg-green-700 hover:text-black transition-colors"
                  onClick={() => {
                    const jsString = getCompiledJSString(equation);
                    if (onAddChannel) onAddChannel(jsString);
                  }}
                >
                  [ ADD CHANNEL ]
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}