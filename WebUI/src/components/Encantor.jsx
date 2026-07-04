import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Activity, Volume2, VolumeX, RefreshCw } from 'lucide-react';

// --- EUCLIDEAN ALGORITHM ---
const generateEuclidean = (steps, pulses, offset = 0) => {
  let seq = new Array(steps).fill(0);
  let bucket = 0;
  for (let i = 0; i < steps; i++) {
    bucket += pulses;
    if (bucket >= steps) {
      bucket -= steps;
      seq[i] = 1;
    }
  }
  if (offset > 0) {
    seq = seq.slice(-offset).concat(seq.slice(0, -offset));
  }
  return seq;
};

// --- INITIAL CONFIGURATION & TUNING AUDIT ---
// Spread across octaves to prevent muddying.
const INITIAL_TRACKS = [
  {
    id: 'air', name: 'Air / Vayu', color: '#FDE047', symbol: 'circle',
    freq: 329.63, defaultFreq: 329.63, wave: 'sine', pan: 1, steps: 8, pulses: 3, offset: 0, speed: 1, volume: 0.6, muted: false
  },
  {
    id: 'fire', name: 'Fire / Tejas', color: '#EF4444', symbol: 'triangle',
    freq: 261.63, defaultFreq: 261.63, wave: 'sawtooth', pan: 0, steps: 12, pulses: 5, offset: 2, speed: 1, volume: 0.4, muted: false
  },
  {
    id: 'water', name: 'Water / Apas', color: '#3B82F6', symbol: 'crescent',
    freq: 415.30, defaultFreq: 415.30, wave: 'triangle', pan: -1, steps: 16, pulses: 7, offset: 0, speed: 0.5, volume: 0.6, muted: false
  },
  {
    // Earth dropped 2 octaves down to act as a deep sub-bass foundation (396 / 4 = 99)
    id: 'earth', name: 'Earth / Prithivi', color: '#D97706', symbol: 'square',
    freq: 99.00, defaultFreq: 99.00, wave: 'square', pan: 0, steps: 4, pulses: 4, offset: 0, speed: 0.25, volume: 0.3, muted: false
  },
  {
    id: 'celestial', name: 'Celestial', color: '#22C55E', symbol: 'hexagram',
    freq: 528.00, defaultFreq: 528.00, wave: 'sine', pan: 0, steps: 6, pulses: 2, offset: 1, speed: 2, volume: 0.5, muted: false
  },
  {
    id: 'chthonic', name: 'Chthonic / Low Gong', color: '#db2777', symbol: 'chaos',
    freq: 50.00, defaultFreq: 50.00, wave: 'gong', pan: 0, steps: 7, pulses: 3, offset: 0, speed: 1.5, volume: 0.6, muted: true
  },
  {
    id: 'astral_root', name: 'Astral Root', color: '#A855F7', symbol: 'circle',
    freq: 432.00, defaultFreq: 432.00, wave: 'pluck', pan: -0.6, steps: 16, pulses: 4, offset: 0, speed: 1, volume: 0.5, muted: false, intentions: ''
  },
  {
    id: 'astral_third', name: 'Astral Third', color: '#D946EF', symbol: 'triangle',
    freq: 270.00, defaultFreq: 270.00, wave: 'pluck', pan: 0, steps: 16, pulses: 5, offset: 4, speed: 1, volume: 0.4, muted: false, intentions: ''
  },
  {
    id: 'astral_fifth', name: 'Astral Fifth', color: '#EC4899', symbol: 'hexagram',
    freq: 324.00, defaultFreq: 324.00, wave: 'pluck', pan: 0.6, steps: 16, pulses: 7, offset: 8, speed: 1, volume: 0.4, muted: false, intentions: ''
  }
].map(t => ({ ...t, sequence: generateEuclidean(t.steps, t.pulses, t.offset) }));

// --- UTILS & MATH ---
const lerp = (a, b, t) => a + (b - a) * t;

// --- REVERB IMPULSE GENERATOR ---
const generateImpulseResponse = (ctx, duration, decay) => {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  for (let i = 0; i < 2; i++) {
    const channel = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
    }
  }
  return impulse;
};

export default function Encantor() {
  // React State (UI source of truth)
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(60);
  const [tracks, setTracks] = useState(INITIAL_TRACKS);

  // FX State
  const [reverbMix, setReverbMix] = useState(0.4);
  const [reverbDecay, setReverbDecay] = useState(3.0);
  const [delayMix, setDelayMix] = useState(0.4);
  const [delayTime, setDelayTime] = useState(0.4);
  const [delayFeedback, setDelayFeedback] = useState(0.4);

  // Engine State (Mutable, for game loop to avoid React re-renders)
  const engine = useRef({
    tracks: [],
    particles: [],
    runTime: 0,
    audioCtx: null,
    masterGain: null,
    fxInput: null,
    reverbNode: null,
    reverbGain: null,
    delayNode: null,
    delayFeedbackNode: null,
    delayGain: null
  });

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Sync React state to Engine state
  useEffect(() => {
    engine.current.tracks = tracks.map(t => {
      const existing = engine.current.tracks.find(et => et.id === t.id);
      return {
        ...t,
        phase: existing ? existing.phase : 0,
        lastStep: existing ? existing.lastStep : -1,
        hitScale: existing ? existing.hitScale : 1,
        baseRotation: existing ? existing.baseRotation : Math.random() * Math.PI * 2,
      };
    });
  }, [tracks]);

  // --- AUDIO SYNTHESIS ---
  const initAudio = () => {
    if (!engine.current.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.8; 
      
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6.0;
      limiter.knee.value = 5.0;
      limiter.ratio.value = 20.0;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.1;

      master.connect(limiter);
      limiter.connect(ctx.destination);
      
      const fxInput = ctx.createGain();
      fxInput.gain.value = 1.0;
      
      const reverbNode = ctx.createConvolver();
      reverbNode.buffer = generateImpulseResponse(ctx, 4.0, reverbDecay);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = reverbMix;
      reverbNode.connect(reverbGain);
      reverbGain.connect(master);
      
      const delayNode = ctx.createDelay(2.0);
      delayNode.delayTime.value = delayTime;
      const delayFeedbackNode = ctx.createGain();
      delayFeedbackNode.gain.value = delayFeedback;
      const delayGain = ctx.createGain();
      delayGain.gain.value = delayMix;
      
      delayNode.connect(delayFeedbackNode);
      delayFeedbackNode.connect(delayNode);
      delayNode.connect(delayGain);
      delayGain.connect(master);
      
      fxInput.connect(reverbNode);
      fxInput.connect(delayNode);
      
      engine.current.audioCtx = ctx;
      engine.current.masterGain = master;
      engine.current.fxInput = fxInput;
      engine.current.reverbNode = reverbNode;
      engine.current.reverbGain = reverbGain;
      engine.current.delayNode = delayNode;
      engine.current.delayFeedbackNode = delayFeedbackNode;
      engine.current.delayGain = delayGain;
    }
    if (engine.current.audioCtx.state === 'suspended') {
      engine.current.audioCtx.resume();
    }
  };

  // Sync Audio FX Parameters in real-time
  useEffect(() => {
    if (!engine.current.audioCtx) return;
    if (engine.current.reverbGain) engine.current.reverbGain.gain.value = reverbMix;
    if (engine.current.delayGain) engine.current.delayGain.gain.value = delayMix;
    if (engine.current.delayNode) engine.current.delayNode.delayTime.value = delayTime;
    if (engine.current.delayFeedbackNode) engine.current.delayFeedbackNode.gain.value = delayFeedback;
    
    if (engine.current.reverbNode && isPlaying) {
        engine.current.reverbNode.buffer = generateImpulseResponse(engine.current.audioCtx, 4.0, reverbDecay);
    }
  }, [reverbMix, delayMix, delayTime, delayFeedback, reverbDecay, isPlaying]);

  // Gem Visual Style Dust Spawning
  const spawnDust = (x, y, color, sizeBase, isBurst = false) => {
    const numParticles = isBurst ? 15 : 1;
    for (let i = 0; i < numParticles; i++) {
      engine.current.particles.push({
        x: x + (Math.random() - 0.5) * sizeBase * 3,
        y: y + (Math.random() - 0.5) * sizeBase * 3,
        vx: isBurst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 1.5,
        vy: isBurst ? (Math.random() - 0.5) * 4 : -0.5 - Math.random() * 2, // Floating upwards gravity
        life: 0.8 + (isBurst ? Math.random() * 0.4 : 0),
        color: isBurst ? '#ffffff' : color,
        size: 1 + Math.random() * 3
      });
    }
  };

  const playNode = (track, x, y) => {
    const ctx = engine.current.audioCtx;
    if (!ctx || track.muted || track.volume === 0) return;
    
    // Visual hit logic - Big burst of dust and scale spring
    track.hitScale = 2.5; 
    spawnDust(x, y, track.color, 8, true);

    // Audio Routing
    const trackGain = ctx.createGain();
    trackGain.gain.value = track.volume;
    
    const envGain = ctx.createGain();
    envGain.connect(trackGain);
    
    const panner = ctx.createStereoPanner();
    panner.pan.value = track.pan;
    
    trackGain.connect(panner);
    panner.connect(engine.current.masterGain);

    if (engine.current.fxInput) {
        const sendGain = ctx.createGain();
        sendGain.gain.value = (track.wave === 'gong' || track.wave === 'pluck') ? 0.8 : 0.6;
        panner.connect(sendGain);
        sendGain.connect(engine.current.fxInput);
    }

    const now = ctx.currentTime;

    if (track.wave === 'gong') {
      const fundamental = track.freq;
      const ratios = [1.0, 2.05, 3.14, 4.20, 5.33, 8.5]; 
      const durations = [4.0, 3.0, 2.5, 2.0, 1.5, 1.0]; 
      
      ratios.forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, now);
        osc.connect(gain);
        gain.connect(envGain);
        
        const stopTime = now + (durations[i] * (2 / track.speed)) + 0.1;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(i === 0 ? 1 : 0.4, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (durations[i] * (2 / track.speed)));
        gain.gain.linearRampToValueAtTime(0, stopTime);
        
        osc.start(now);
        osc.stop(stopTime);
      });
      
      const bufferSize = ctx.sampleRate * 0.1; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 600; 
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noiseGain.gain.linearRampToValueAtTime(0, now + 0.2);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(envGain);
      noise.start(now);
      noise.stop(now + 0.2);

    } else if (track.wave === 'pluck') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(track.freq, now);
      osc2.frequency.setValueAtTime(track.freq * 2, now); 

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0, now);
      osc2Gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2); 
      osc2Gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc2.connect(osc2Gain);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.freq * 6, now);
      filter.frequency.exponentialRampToValueAtTime(track.freq * 0.8, now + 0.3);

      osc1.connect(filter);
      osc2Gain.connect(filter);
      filter.connect(envGain);

      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(1.0, now + 0.01);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      envGain.gain.linearRampToValueAtTime(0, now + 2.5);

      osc1.start(now); osc2.start(now);
      osc1.stop(now + 2.5); osc2.stop(now + 0.25);

    } else if (track.wave === 'sawtooth' || track.wave === 'square') {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      
      osc.type = track.wave;
      osc.frequency.setValueAtTime(track.freq, now);
      
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(track.freq / 2, now); 
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.freq * 4, now);
      filter.frequency.exponentialRampToValueAtTime(track.freq * 0.5, now + 0.4);
      
      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(envGain);
      
      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(1.0, now + 0.02);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      envGain.gain.linearRampToValueAtTime(0, now + 1.0);
      
      osc.start(now); subOsc.start(now);
      osc.stop(now + 1); subOsc.stop(now + 1);

    } else if (track.wave === 'triangle') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(track.freq, now);
      osc2.frequency.setValueAtTime(track.freq + 2.5, now); 
      
      osc1.connect(envGain);
      osc2.connect(envGain);
      
      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      envGain.gain.linearRampToValueAtTime(0, now + 1.0);
      
      osc1.start(now); osc2.start(now);
      osc1.stop(now + 1); osc2.stop(now + 1);
      
    } else {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator(); 
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(track.freq, now);
      osc2.frequency.setValueAtTime(track.freq * 1.5, now); 
      
      const gain2 = ctx.createGain();
      gain2.gain.value = 0.15; 
      osc2.connect(gain2);
      gain2.connect(envGain);
      
      osc1.connect(envGain);
      
      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(1.0, now + 0.03);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      envGain.gain.linearRampToValueAtTime(0, now + 1.5);
      
      osc1.start(now); osc2.start(now);
      osc1.stop(now + 1.5); osc2.stop(now + 1.5);
    }
  };

  // --- RENDERING HELPERS (Gems Style) ---
  const drawGlow = (ctx, x, y, size, alpha, color) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0, alpha);
    const grd = ctx.createRadialGradient(x, y, 0, x, y, Math.max(0.1, size));
    grd.addColorStop(0, color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, size), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSparkle = (ctx, x, y, size, rotation, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, size * 0.15, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSymbol = (ctx, type, x, y, size, rotation, color, isFilled) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = isFilled ? 15 : 0;
    ctx.shadowColor = color;
    ctx.globalCompositeOperation = isFilled ? 'lighter' : 'source-over';

    const safeSize = Math.max(0, size);

    ctx.beginPath();
    switch (type) {
      case 'circle': ctx.arc(0, 0, safeSize, 0, Math.PI * 2); break;
      case 'square': ctx.rect(-safeSize, -safeSize, safeSize * 2, safeSize * 2); break;
      case 'triangle':
        ctx.moveTo(0, -safeSize); ctx.lineTo(safeSize, safeSize); ctx.lineTo(-safeSize, safeSize); ctx.closePath(); break;
      case 'crescent':
        ctx.arc(0, 0, safeSize, -Math.PI / 2, Math.PI * 1.5);
        ctx.arc(-safeSize * 0.3, 0, safeSize * 0.8, Math.PI * 1.5, -Math.PI / 2, true);
        break;
      case 'hexagram':
        ctx.moveTo(0, -safeSize); ctx.lineTo(safeSize, safeSize*0.5); ctx.lineTo(-safeSize, safeSize*0.5); ctx.closePath();
        ctx.moveTo(0, safeSize); ctx.lineTo(safeSize, -safeSize*0.5); ctx.lineTo(-safeSize, -safeSize*0.5); ctx.closePath();
        break;
      case 'chaos':
        for (let i = 0; i < 8; i++) {
          ctx.moveTo(0, 0); ctx.lineTo(0, -safeSize * (i % 2 === 0 ? 1.2 : 0.5)); ctx.rotate(Math.PI / 4);
        }
        break;
      default: ctx.arc(0, 0, safeSize, 0, Math.PI * 2);
    }
    isFilled ? ctx.fill() : ctx.stroke();
    ctx.restore();
  };

  const gameLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const t = performance.now() * 0.001; // absolute time for sine waves

    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const maxRadius = Math.max(10, Math.min(width, height) / 2 - 60);
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with dark void blue/black, matching the Gem demo
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5, 5, 10, 0.35)'; // Slight trail
    ctx.fillRect(0, 0, width, height);

    engine.current.tracks.forEach((track, index) => {
      const radius = (maxRadius / engine.current.tracks.length) * (index + 1.2);
      
      if (isPlaying) {
        const secondsPerMeasure = (60 / tempo) * 4;
        const phaseIncrement = (1 / secondsPerMeasure) * track.speed * dt;
        track.phase = (track.phase + phaseIncrement) % 1;
        track.baseRotation += (dt * 0.2 * track.speed); 
      }

      track.hitScale = lerp(track.hitScale, 1.0, dt * 8);

      const currentStep = Math.floor(track.phase * track.steps);
      const anglePerStep = (Math.PI * 2) / track.steps;
      
      // Draw subtle orbital rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${track.muted ? 0.01 : 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const playheadAngle = track.phase * Math.PI * 2 - Math.PI / 2 + track.baseRotation;
      
      // Draw Nodes
      for (let i = 0; i < track.steps; i++) {
        const angle = i * anglePerStep - Math.PI / 2 + track.baseRotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const isActivePulse = track.sequence[i] === 1;
        
        if (isActivePulse && !track.muted) {
           const isHit = currentStep === i;
           const visualScale = Math.max(0, isHit ? track.hitScale : 1);
           const sizeBase = 6 * visualScale;
           
           if (isPlaying && isHit && currentStep !== track.lastStep) {
               playNode(track, x, y);
           }

           // Phase offset for pulsing
           const nodePhase = (i * Math.PI) / track.steps;
           const sparkleSpeed = 2 + (i % 3);

           // 1. Draw Glow (Pulsating)
           const gp = Math.sin(t * (sparkleSpeed * 0.7) + nodePhase) * 0.5 + 0.5;
           drawGlow(ctx, x, y, sizeBase * 3 + gp * sizeBase * 1.5, gp * 0.3 * (isHit ? 2 : 1), track.color);

           // 2. Draw Sparkle (Rotating cross)
           const pu = Math.sin(t * sparkleSpeed + nodePhase) * 0.5 + 0.5;
           drawSparkle(ctx, x, y, sizeBase * 2 + pu * sizeBase * 0.5, t * 1.5 + nodePhase, pu * 0.6 * (isHit ? 2 : 1));
           
           // 3. Draw Core Symbol
           drawSymbol(ctx, track.symbol, x, y, sizeBase, angle + Math.PI/2, track.color, true);

           // 4. Draw Intentions Heptagram
           if (track.intentions && track.intentions.length > 0) {
             const str = track.intentions;
             ctx.save();
             ctx.translate(x, y);
             ctx.rotate(t * 0.8 + nodePhase);
             ctx.fillStyle = track.color;
             ctx.font = '4px monospace';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             for (let k = 0; k < 7; k++) {
                const cChar = str.charAt(k % str.length);
                const hAngle = (k * Math.PI * 2) / 7;
                // Skewing/stretching logic as requested "skewed and crossed stretched"
                // Using a slight elliptical/offset pull based on time
                const stretch = 1 + Math.sin(t * 2 + k) * 0.2;
                const hRadX = sizeBase * 2.8 * stretch;
                const hRadY = sizeBase * 2.8 * (2 - stretch);
                ctx.save();
                ctx.translate(Math.cos(hAngle) * hRadX, Math.sin(hAngle) * hRadY);
                ctx.rotate(hAngle + Math.PI/2);
                ctx.scale(0.8, 1.5); // Stretched letters
                ctx.fillText(cChar, 0, 0);
                ctx.restore();
             }
             ctx.restore();
           }

           // Emit ambient legendary dust
           if (isPlaying && Math.random() < 0.02) {
               spawnDust(x, y, track.color, sizeBase, false);
           }

        } else if (isActivePulse && track.muted) {
           // Muted active nodes
           drawSymbol(ctx, track.symbol, x, y, 4, angle + Math.PI/2, '#475569', false);
        } else {
           // Inactive node slots
           ctx.beginPath();
           ctx.arc(x, y, 1.5, 0, Math.PI * 2);
           ctx.fillStyle = track.muted ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)';
           ctx.fill();
        }
      }

      if (isPlaying) track.lastStep = currentStep;

      // Draw Radar Sweep
      if (!track.muted && isPlaying) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const px = centerX + Math.cos(playheadAngle) * radius;
        const py = centerY + Math.sin(playheadAngle) * radius;
        ctx.lineTo(px, py);
        
        const gradient = ctx.createLinearGradient(centerX, centerY, px, py);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(1, `${track.color}60`); 
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.globalCompositeOperation = 'lighter';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    });

    // Process & Draw Dust Particles
    ctx.globalCompositeOperation = 'lighter';
    engine.current.particles = engine.current.particles.filter(p => p.life > 0);
    engine.current.particles.forEach(p => {
      // Simulate 60fps delta for consistent physics
      const fDt = dt * 60; 
      p.x += p.vx * fDt;
      p.y += p.vy * fDt;
      p.vy += 0.1 * fDt; // Gravity pulling dust up/down
      p.life -= 0.035 * fDt;
      
      const safeSize = Math.max(0, p.size);
      
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      // Draw as small squares matching the reference pixi graphics
      ctx.fillRect(p.x - safeSize/2, p.y - safeSize/2, safeSize, safeSize);
    });
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, tempo]);

  useEffect(() => {
    if (isPlaying) {
      initAudio();
    }
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, gameLoop]);

  // --- UI CONTROLS ---
  const updateTrack = (id, field, value) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, [field]: value };
      if (['steps', 'pulses', 'offset'].includes(field)) {
        updated.sequence = generateEuclidean(updated.steps, updated.pulses, updated.offset);
      }
      return updated;
    }));
  };

  const randomizeAll = () => {
    setTracks(prev => prev.map(t => {
      const newSteps = Math.floor(Math.random() * 12) + 4; // 4 to 16
      const newPulses = Math.floor(Math.random() * newSteps) + 1;
      const newOffset = Math.floor(Math.random() * newSteps);
      return {
        ...t,
        steps: newSteps,
        pulses: newPulses,
        offset: newOffset,
        sequence: generateEuclidean(newSteps, newPulses, newOffset)
      };
    }));
  };

  return (
    <div className="h-full bg-black text-[#ffcc00] font-mono flex flex-row overflow-hidden selection:bg-[#ffcc00]/30 w-full">
      
      {/* Sidebar Controls - CRT Mixer Style */}
      <div className="w-[280px] bg-black/90 backdrop-blur border-r border-[#ffcc00]/20 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-2xl z-20 shrink-0">
        
        {/* Header & Transport */}
        <div className="p-4 border-b border-[#ffcc00]/20 sticky top-0 bg-black/95 backdrop-blur z-10 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-xl font-bold text-[#ffcc00] tracking-widest flex items-center gap-2" style={{ textShadow: '0 0 10px rgba(255,204,0,0.8)'}}>
              <Activity className="w-5 h-5 text-[#ffcc00]" />
              ENCANTOR
            </h1>
            <button 
              onClick={randomizeAll}
              className="p-1 text-[#ffcc00]/40 hover:text-[#ffcc00] transition-colors hover:drop-shadow-[0_0_8px_rgba(255,204,0,0.8)]"
              title="Randomize Geometries"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="text-[9px] text-[#ffcc00]/60 leading-relaxed font-mono">
            ARCHEOMETER PROTOCOL // SYNARCHIC SEQUENCER
          </p>
          
          <div className="mt-4 flex items-center justify-between bg-black p-3 rounded-sm border border-[#ffcc00]/20 shadow-inner">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 shadow-lg shrink-0 ${isPlaying ? 'bg-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.8)]' : 'bg-[#111] hover:bg-[#222] text-[#ffcc00] border border-[#ffcc00]/20'}`}
            >
              {isPlaying ? <Pause className="fill-current w-4 h-4" /> : <Play className="fill-current w-4 h-4 ml-1" />}
            </button>
            
            <div className="flex-1 ml-4">
              <label className="text-[9px] text-[#ffcc00]/70 uppercase font-bold tracking-widest flex justify-between mb-1">
                <span>Tempo</span> <span>{tempo} BPM</span>
              </label>
              <input 
                type="range" min="30" max="180" value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full accent-[#ffcc00] h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Acoustics / FX Panel */}
          <div className="mt-3 bg-black p-3 rounded-sm border border-[#ffcc00]/20 shadow-inner grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="text-[9px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                <span>Reverb Mix</span> <span>{Math.round(reverbMix * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" value={reverbMix}
                onChange={(e) => setReverbMix(Number(e.target.value))}
                className="w-full accent-[#ffcc00] h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                <span>Space Decay</span> <span>{reverbDecay.toFixed(1)}s</span>
              </label>
              <input 
                type="range" min="1" max="8" step="0.5" value={reverbDecay}
                onChange={(e) => setReverbDecay(Number(e.target.value))}
                className="w-full accent-[#ffcc00] h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                <span>Delay Mix</span> <span>{Math.round(delayMix * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" value={delayMix}
                onChange={(e) => setDelayMix(Number(e.target.value))}
                className="w-full accent-[#ffcc00] h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                <span>Echo Time</span> <span>{delayTime.toFixed(2)}s</span>
              </label>
              <input 
                type="range" min="0.1" max="2" step="0.1" value={delayTime}
                onChange={(e) => setDelayTime(Number(e.target.value))}
                className="w-full accent-[#ffcc00] h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Encantor Save / Load */}
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => {
                const stateToSave = { tempo, tracks, reverbMix, reverbDecay, delayMix, delayTime, delayFeedback };
                const blob = new Blob([JSON.stringify(stateToSave, null, 2)], {type:'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `ENCANTOR_STATE_${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex-1 px-2 py-1 bg-[#111] text-[#39ff14] border border-[#39ff14]/40 font-bold text-[9px] hover:bg-[#39ff14] hover:text-black transition-colors text-center"
            >
              SAVE TUNE
            </button>
            <label className="flex-1 px-2 py-1 bg-[#111] text-[#39ff14] border border-[#39ff14]/40 font-bold text-[9px] hover:bg-[#39ff14] hover:text-black transition-colors text-center cursor-pointer">
              LOAD TUNE
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const loaded = JSON.parse(ev.target.result);
                    if (loaded.tempo) setTempo(loaded.tempo);
                    if (loaded.tracks) setTracks(loaded.tracks.map(t => ({
                      ...t,
                      sequence: generateEuclidean(t.steps, t.pulses, t.offset || 0)
                    })));
                    if (loaded.reverbMix !== undefined) setReverbMix(loaded.reverbMix);
                    if (loaded.reverbDecay !== undefined) setReverbDecay(loaded.reverbDecay);
                    if (loaded.delayMix !== undefined) setDelayMix(loaded.delayMix);
                    if (loaded.delayTime !== undefined) setDelayTime(loaded.delayTime);
                    if (loaded.delayFeedback !== undefined) setDelayFeedback(loaded.delayFeedback);
                  } catch(err) {
                    alert("Invalid Encantor state file");
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }} />
            </label>
          </div>
        </div>

        {/* Track List */}
        <div className="flex flex-wrap justify-center gap-3 max-w-7xl mx-auto w-full px-2">
          {tracks.map((track, i) => (
            <div 
              key={track.id} 
              className="border border-[#ffcc00]/20 bg-[#111] p-3 rounded-sm shadow-[0_0_15px_rgba(255,204,0,0.05)] hover:border-[#ffcc00]/50 transition-colors relative overflow-hidden group w-[124px] shrink-0 flex flex-col"
              style={{
                borderColor: !track.muted ? `${track.color}80` : '',
                boxShadow: !track.muted ? `inset 0 0 20px ${track.color}15, 0 0 10px rgba(0,0,0,0.8)` : 'none'
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-sm" 
                    style={{ 
                      backgroundColor: track.muted ? '#333' : track.color, 
                      boxShadow: track.muted ? 'none' : `0 0 8px ${track.color}` 
                    }}>
                  </div>
                  <div>
                    <h3 className="font-bold text-[11px] tracking-widest uppercase" style={{ color: track.muted ? '#666' : track.color, textShadow: track.muted ? 'none' : `0 0 8px ${track.color}90` }}>
                      {track.name} <span className="text-[#ffcc00]/40 font-mono text-[9px] ml-1 tracking-normal">({track.freq.toFixed(1)} Hz)</span>
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => updateTrack(track.id, 'muted', !track.muted)}
                  className={`p-1.5 rounded-sm transition-colors border ${track.muted ? 'border-transparent bg-transparent text-[#666] hover:text-[#ffcc00]' : 'bg-[#151515] border-[#ffcc00]/20 text-[#ffcc00] hover:bg-[#222] shadow-[0_0_5px_rgba(255,204,0,0.3)]'}`}
                >
                  {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              <div className="flex flex-col gap-y-3 flex-1">
                {/* Euclidean Controls */}
                <div>
                  <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                    <span>Steps</span> <span className="font-mono text-[#ffcc00]">{track.steps}</span>
                  </label>
                  <input 
                    type="range" min="2" max="32" value={track.steps}
                    onChange={(e) => updateTrack(track.id, 'steps', Number(e.target.value))}
                    className="w-full h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
                    style={{ accentColor: track.color }}
                  />
                </div>
                
                <div>
                  <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                    <span>Pulses</span> <span className="font-mono text-[#ffcc00]">{track.pulses}</span>
                  </label>
                  <input 
                    type="range" min="1" max={track.steps} value={Math.min(track.pulses, track.steps)}
                    onChange={(e) => updateTrack(track.id, 'pulses', Number(e.target.value))}
                    className="w-full h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
                    style={{ accentColor: track.color }}
                  />
                </div>
                
                <div>
                  <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                    <span>Rotate</span> <span className="font-mono text-[#ffcc00]">{track.offset}</span>
                  </label>
                  <input 
                    type="range" min="0" max={track.steps - 1} value={track.offset}
                    onChange={(e) => updateTrack(track.id, 'offset', Number(e.target.value))}
                    className="w-full h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
                    style={{ accentColor: track.color }}
                  />
                </div>

                <div>
                  <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between mb-1">
                    <span>Velocity</span> <span className="font-mono text-[#ffcc00]">{track.speed}x</span>
                  </label>
                  <select 
                    value={track.speed}
                    onChange={(e) => updateTrack(track.id, 'speed', Number(e.target.value))}
                    className="w-full bg-black border border-[#ffcc00]/30 rounded-sm text-[9px] p-0.5 text-[#ffcc00] outline-none focus:border-[#ffcc00] focus:shadow-[0_0_5px_rgba(255,204,0,0.5)] font-mono"
                  >
                    <option value={0.25}>0.25x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2.0x</option>
                    <option value={3}>3.0x</option>
                  </select>
                </div>

                {/* Explicit Tuning Controls */}
                <div className="mt-auto pt-2 border-t border-[#ffcc00]/10">
                  <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider flex justify-between items-center mb-1.5">
                    <span className="flex items-center gap-1">
                      Tune
                      {track.freq === track.defaultFreq ? (
                         <span className="text-[6px] bg-[#ffcc00]/10 text-[#ffcc00] px-1 py-0.5 rounded-sm border border-[#ffcc00]/30" style={{ textShadow: '0 0 5px rgba(255,204,0,0.5)' }}>DEF</span>
                      ) : (
                         <button 
                           onClick={() => updateTrack(track.id, 'freq', track.defaultFreq)}
                           className="text-[6px] bg-red-900/40 text-red-400 hover:bg-red-500/40 hover:text-white px-1 py-0.5 rounded-sm border border-red-500/30 transition-colors"
                         >RST</button>
                      )}
                    </span>
                    <input 
                      type="number" 
                      value={track.freq}
                      onChange={(e) => updateTrack(track.id, 'freq', Number(e.target.value))}
                      className="bg-black text-[#ffcc00] font-mono text-right w-12 px-1 py-0.5 rounded-sm border border-[#ffcc00]/30 text-[9px] focus:border-[#ffcc00] focus:shadow-[0_0_5px_rgba(255,204,0,0.5)] outline-none"
                    />
                  </label>
                  <input 
                    type="range" min="20" max="1200" step="0.01" value={track.freq}
                    onChange={(e) => updateTrack(track.id, 'freq', Number(e.target.value))}
                    className="w-full h-1 bg-[#ffcc00]/20 rounded-none appearance-none cursor-pointer"
                    style={{ accentColor: track.color }}
                  />
                </div>

                {track.id.startsWith('astral') && (
                  <div className="mt-1">
                    <label className="text-[8px] text-[#ffcc00]/60 uppercase tracking-wider block mb-1">
                      INTENTIONS
                    </label>
                    <input 
                      type="text"
                      maxLength={33}
                      value={track.intentions || ''}
                      onChange={(e) => updateTrack(track.id, 'intentions', e.target.value)}
                      placeholder="Word of Power"
                      className="w-full bg-[#0a0a0a] text-[#ffcc00] border border-[#ffcc00]/30 text-[9px] px-1 py-1 outline-none focus:border-[#ffcc00]"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-hidden min-h-[50vh]">
        {/* Subtle background grids */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[linear-gradient(rgba(255,204,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,204,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
        
        <div className="relative w-full h-full max-w-4xl max-h-4xl flex items-center justify-center z-10 p-8">
          {/* Central Core */}
          <div className={`absolute w-8 h-8 rounded-sm z-20 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'shadow-[0_0_30px_10px_rgba(255,204,0,0.3)]' : 'shadow-none'}`}>
             <div className="w-full h-full bg-[#ffcc00] rounded-sm animate-ping opacity-10 absolute" style={{ animationDuration: '2s' }}></div>
             <div className="w-3 h-3 bg-[#ffcc00] rounded-sm z-10 shadow-inner"></div>
          </div>
          
          <canvas 
            ref={canvasRef} 
            width={1000} 
            height={1000} 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Floating Metrics Overlay */}
        <div className="absolute top-6 right-8 text-right pointer-events-none hidden md:block z-20">
          <p className="text-[9px] font-mono tracking-widest text-[#ffcc00]/80 uppercase" style={{ textShadow: '0 0 10px rgba(255,204,0,0.5)' }}>Polyrhythmic Synarchy</p>
          <p className="text-[9px] font-mono tracking-widest text-[#ffcc00]/40 uppercase mt-1">Azimuth Vectors Active</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
