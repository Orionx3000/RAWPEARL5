import React, { useRef, useEffect } from 'react';
import MicroRoll from './MicroRoll.jsx';
import { ASCII_DICTIONARY, HELLENIC_MODELS } from '../AsciiEngine.js';
import { MATH_PRESETS } from '../MathPresets.js';

// Flatten presets for the dropdown (math presets for all channels)
const allMathPresetsFlat = [];
Object.keys(MATH_PRESETS).forEach(group => {
  MATH_PRESETS[group].forEach(preset => {
    allMathPresetsFlat.push({ group, name: preset.name, type:'math' });
  });
});

// Flatten Hellenic model presets (models are type-specific)
const allModelPresets = {};
Object.keys(HELLENIC_MODELS).forEach(char => {
  allModelPresets[char] = HELLENIC_MODELS[char].map(m => ({ type: char, name: m.name }));
});

const CHANNEL_LABELS = {
  kick: 'KICK', snare: 'SNARE', clap: 'CLAP',
  hihat: 'HH', perc: 'PERC', bass: 'BASS',
  lead: 'LEAD', pad: 'PAD',
  'α': 'α (ANALOG)', 'δ': 'δ (WAVETABLE)', 'φ': 'φ (FM)', 'Σ': 'Σ (ADDITIVE)', 
  'γ': 'γ (GRANULAR)', 'ω': 'ω (NOISE)', 'π': 'π (PHYSICAL)', 'τ': 'τ (KICK)', 'w': 'W (PERC)'
};

const GREEK_INSTRUMENTS = {
  'α': [
    { subgroup: 'LEAD' },
    { subgroup: 'BASS' },
    { subgroup: 'PLUCK' },
    { subgroup: 'BRASS' },
  ],
  'δ': [
    { subgroup: 'PAD' },
    { subgroup: 'BELL' },
    { subgroup: 'SWEEP' },
  ],
  'φ': [
    { subgroup: 'BASS' },
    { subgroup: 'BELL' },
    { subgroup: 'PAD' },
    { subgroup: 'PERC' },
    { subgroup: 'KEYS' },
  ],
  'Σ': [
    { subgroup: 'PAD' },
    { subgroup: 'REED' },
    { subgroup: 'BRASS' },
    { subgroup: 'ORGAN' },
  ],
  'γ': [
    { subgroup: 'PAD' },
    { subgroup: 'PERC' },
    { subgroup: 'ATMOSPHERE' },
    { subgroup: 'BASS' },
  ],
  'ω': [
    { subgroup: 'ATMOSPHERE' },
    { subgroup: 'PERC' },
    { subgroup: 'BASS' },
  ],
  'π': [
    { subgroup: 'PLUCK' },
    { subgroup: 'BASS' },
    { subgroup: 'BELL' },
  ],
  'τ': [
    { subgroup: 'KICK' },
    { subgroup: 'TOM' },
    { subgroup: 'PERC' },
  ],
  'w': [
    { subgroup: 'SNARE' },
    { subgroup: 'HAT' },
    { subgroup: 'CLAP' },
    { subgroup: 'PERC' },
    { subgroup: 'CYMBAL' },
  ],
};

const DIR_OPTIONS = [
  { id: 'forward', label: '→' },
  { id: 'backward', label: '←' },
  { id: 'pingpong', label: '↔' },
  { id: 'random', label: '?' },
];

const STEP_MODES = [
  { id: 'value', label: 'VAL', color: '#ffcc00' },
  { id: 'gate', label: 'GAT', color: '#44aaff' },
  { id: 'decay', label: 'DEC', color: '#44ff44' },
  { id: 'attack', label: 'ATK', color: '#ff8800' },
  { id: 'release', label: 'REL', color: '#ff44ff' },
  { id: 'cutoff', label: 'CUT', color: '#00ffff' },
  { id: 'resonance', label: 'RES', color: '#ff0055' },
  { id: 'delaySend', label: 'DEL', color: '#aa00ff' },
  { id: 'reverbSend', label: 'REV', color: '#ffaa00' },
  { id: 'pan', label: 'PAN', color: '#00ffaa' },
  { id: 'glitch', label: 'GLTCH', color: '#ff0044' },
];

const GLITCH_SYMBOLS = ['s', 'b', 'r', 't', 'w', 'n', 'h', 'c', 'x', 'z'];
const GLITCH_NAMES = {
  s: 'STUTTER', b: 'BITCRUSH', r: 'REPEAT', t: 'TAPESTOP',
  w: 'WARP', n: 'NOISEGATE', h: 'HARMONIC', c: 'CHOP',
  x: 'RINGMOD', z: 'GLITCHZIP',
};
const GLITCH_COLORS = {
  s: '#ff4444', b: '#ff8800', r: '#ffcc00', t: '#44ddff',
  w: '#ff44ff', n: '#44ff44', h: '#aa44ff', c: '#4444ff',
  x: '#ff66aa', z: '#ffffff',
};

function invertHex(hex) {
  if (hex.indexOf('#') === 0) hex = hex.slice(1);
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return '#ffffff';
  let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
  let g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
  let b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  return `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
}

export default function ChannelRack({
  channels, isPlaying, currentStep, bpm, affinity,
  stepOverrides, characterParams,
  selectedTool, onCellClick, onCellContextMenu,
  onRemoveChannel, onRenameChannel, onSetChannel,
  onSetMicroNote, focusedCell, setFocusedCell,
  ctxMenu, onSetCtxMenu,
  stepEdit, onSetStepParam,
  stepMode, onSetStepMode, onSelectChar,
  selectedChannelId, onSelectChannel,
  onSetTool
}) {
  const totalSteps = 32;

  const getStepIndex = (stepIdx, dir, len) => {
    const clamped = stepIdx % len;
    if (dir === 'forward') return clamped;
    if (dir === 'backward') return len - 1 - clamped;
    if (dir === 'pingpong') {
      const period = len * 2 - 2;
      const pos = clamped % period;
      return pos < len ? pos : period - pos;
    }
    return Math.floor(Math.random() * len);
  };

  const getGlitchSymbol = (chId, lIdx, sIdx) => {
    const k = `${chId}_${lIdx}_${sIdx}`;
    const o = stepOverrides[k];
    return (o && o.glitchType) || 's';
  };

  const getOverrideValue = (chId, lIdx, sIdx) => {
    const k = `${chId}_${lIdx}_${sIdx}`;
    const o = stepOverrides[k];
    if (!o) return 20;
    if (stepMode === 'value') return o.stepVal !== undefined ? o.stepVal : 20;
    if (stepMode === 'gate') return o.gate !== undefined ? o.gate : 20;
    if (stepMode === 'decay') return o.decay !== undefined ? o.decay : 20;
    if (stepMode === 'attack') return o.attack !== undefined ? o.attack : 20;
    if (stepMode === 'release') return o.release !== undefined ? o.release : 20;
    if (stepMode === 'cutoff') return o.cutoff !== undefined ? o.cutoff : 20;
    if (stepMode === 'resonance') return o.resonance !== undefined ? o.resonance : 20;
    if (stepMode === 'delaySend') return o.delaySend !== undefined ? o.delaySend : 0;
    if (stepMode === 'reverbSend') return o.reverbSend !== undefined ? o.reverbSend : 0;
    if (stepMode === 'pan') return o.pan !== undefined ? o.pan : 20;
    if (stepMode === 'glitch') return o.glitchAmount !== undefined ? o.glitchAmount : 10;
    return 20;
  };

  const handleStepInput = (chId, lIdx, sIdx, value) => {
    const parsed = parseInt(value);
    const num = isNaN(parsed) ? '' : Math.max(1, Math.min(40, parsed));
    const modeKeyMap = { value: 'stepVal', glitch: 'glitchAmount' };
    const key = modeKeyMap[stepMode] || stepMode;
    onSetStepParam(chId, lIdx, sIdx, key, num);
  };

  const cycleGlitchType = (chId, lIdx, sIdx) => {
    const current = getGlitchSymbol(chId, lIdx, sIdx);
    const idx = GLITCH_SYMBOLS.indexOf(current);
    const next = GLITCH_SYMBOLS[(idx + 1) % GLITCH_SYMBOLS.length];
    onSetStepParam(chId, lIdx, sIdx, 'glitchType', next);
  };

  const dragRef = useRef(null);
  const startDrag = (chId, lIdx, sIdx, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const currentVal = getOverrideValue(chId, lIdx, sIdx);
    dragRef.current = { chId, lIdx, sIdx, startY, currentVal, moved: false };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const delta = (dragRef.current.startY - ev.clientY) / 4;
      const raw = Math.round((dragRef.current.currentVal || 20) + delta);
      const clamped = Math.max(1, Math.min(40, raw));
      dragRef.current.moved = true;
      handleStepInput(dragRef.current.chId, dragRef.current.lIdx, dragRef.current.sIdx, clamped);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!dragRef.current?.moved) {
        // If no drag movement, treat as click to focus
      }
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="flex-1 overflow-auto p-3" style={{ background: '#050505' }}>
      <div className="flex flex-col gap-3">
        {channels.map((ch, cIdx) => {
          const chColor = ch.color || '#ffcc00';
          const chLabel = ch.subgroup || (CHANNEL_LABELS[ch.type] || 'CH');
          const activeSteps = ch.layers[0].reduce((a, s) => a + (s !== ' ' ? 1 : 0), 0) +
            ch.layers[1].reduce((a, s) => a + (s !== ' ' ? 1 : 0), 0) +
            ch.layers[2].reduce((a, s) => a + (s !== ' ' ? 1 : 0), 0);

          return (
            <div key={ch.id} className="border" style={{ borderColor: chColor + '44', background: 'rgba(0,0,0,0.7)' }}>
              {/* CHANNEL HEADER */}
              <div 
                className={`flex items-center gap-2 px-3 py-1 border-b text-[10px] cursor-pointer transition-colors ${selectedChannelId === ch.id ? 'bg-[rgba(255,204,0,0.15)]' : ''}`}
                style={{ borderColor: chColor + '33', background: selectedChannelId === ch.id ? chColor + '33' : chColor + '08' }}
                onClick={(e) => {
                  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT' && !e.target.isContentEditable) {
                    onSelectChannel(ch.id);
                  }
                }}
              >
                <span className="w-1 h-5 rounded-sm" style={{ background: chColor, boxShadow: `0 0 6px ${chColor}` }} />
                <span className="font-bold text-xs tracking-wider" style={{ color: chColor, minWidth: 50 }}>
                  [{ch.name || chLabel}]
                </span>
                <span contentEditable suppressContentEditableWarning
                  onBlur={(e) => onRenameChannel(ch.id, e.target.textContent)}
                  className="crt-dim px-1 border border-transparent hover:border-[rgba(255,204,0,0.3)] min-w-[30px]"
                  style={{ fontSize: 9 }}>{ch.name}</span>
                <select 
                  value={ch.subgroup || ''}
                  onChange={(e) => onSetChannel(ch.id, { subgroup: e.target.value })}
                  className="bg-black text-[#ffcc00] border border-[rgba(255,204,0,0.3)] text-[8px] max-w-[70px] outline-none"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">--</option>
                  {(GREEK_INSTRUMENTS[ch.type] || []).map(sg => (
                    <option key={sg.subgroup} value={sg.subgroup}>{sg.subgroup}</option>
                  ))}
                </select>
                <select 
                  value={ch.presetName || ''}
                  onChange={(e) => onSetChannel(ch.id, { presetName: e.target.value })}
                  className="bg-black text-[#ffcc00] border border-[rgba(255,204,0,0.3)] text-[8px] max-w-[110px] outline-none"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">--</option>
                  {(allModelPresets[ch.type] || []).map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <input type="color" value={chColor}
                  onChange={(e) => onSetChannel(ch.id, { color: e.target.value })}
                  className="w-4 h-4 p-0 border-0 cursor-pointer bg-transparent"
                  title="Channel color" />
                {/* GLOBAL EDIT MODE */}
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                {['select', 'dict', 'erase'].map(mode => (
                  <button key={mode} onClick={() => onSetTool && onSetTool(mode)}
                    className={`px-1 text-[8px] font-bold border uppercase tracking-wider ${selectedTool === mode ? 'text-black' : 'crt-dim hover:text-[#ffcc00]'}`}
                    style={selectedTool === mode ? { background: '#ffcc00', borderColor: '#ffcc00' } : { borderColor: 'rgba(255,204,0,0.2)' }}>
                    {mode === 'select' ? '⌨' : mode === 'dict' ? '📖' : '✗'}
                  </button>
                ))}
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); onSetChannel(ch.id, { autoGate: ch.autoGate === false ? true : false }); }}
                  className="px-1 text-[8px] font-bold border tracking-wider"
                  title="Toggle ADSR Auto-Gating. If ON, notes hold for gate length and release. If OFF, notes decay naturally and overlap."
                  style={ch.autoGate !== false ? { background: chColor, color: '#000', borderColor: chColor } : { background: 'transparent', color: chColor, borderColor: chColor + '55' }}>
                  GATE:{ch.autoGate !== false ? 'ON' : 'OFF'}
                </button>
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                {/* VOLUME */}
                <span className="crt-dim" style={{ fontSize: 8 }}>V:</span>
                <input type="range" min={0} max={2} step={0.05} value={ch.vol || 1}
                  onChange={(e) => onSetChannel(ch.id, { vol: parseFloat(e.target.value) })}
                  className="w-12 accent-[#ffcc00]" style={{ height: 4 }} />
                <span className="crt-dim" style={{ fontSize: 8, minWidth: 20 }}>{Math.round((ch.vol || 1) * 100)}%</span>
                {/* PATTERN DIRECTION */}
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                <span className="crt-dim" style={{ fontSize: 8 }}>DIR:</span>
                <div className="flex gap-[1px]">
                  {DIR_OPTIONS.map(d => (
                    <button key={d.id} onClick={() => onSetChannel(ch.id, { patternDir: d.id })}
                      className={`px-1 text-[9px] border ${ch.patternDir === d.id ? 'text-black' : 'crt-dim hover:text-[#ffcc00]'}`}
                      style={ch.patternDir === d.id ? { background: '#ffcc00', borderColor: '#ffcc00' } : { borderColor: 'rgba(255,204,0,0.2)' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {/* PATTERN LENGTH */}
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                <span className="crt-dim" style={{ fontSize: 8 }}>LEN:</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*"
                  defaultValue={ch.patternLen || 32}
                  onBlur={(e) => { const v = e.target.value.replace(/\D/g,''); onSetChannel(ch.id, { patternLen: Math.max(1, Number(v) || 32) }); e.target.value = Math.max(1, Number(v) || 32); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  className="bg-black border border-[rgba(255,204,0,0.3)] text-[#ffcc00] text-[9px] w-10 text-center step-num" />
                {/* SIDECHAIN */}
                <div className="h-4 w-px" style={{ background: chColor + '33' }} />
                <span className="crt-dim" style={{ fontSize: 8 }} title="Sidechain: trigger ducking/compression from another channel">SC:</span>
                <select value={ch.sidechainSource || ''} onChange={(e) => onSetChannel(ch.id, { sidechainSource: e.target.value || null })}
                  className="bg-black border border-[rgba(255,204,0,0.3)] text-[#ffcc00] text-[9px] px-1">
                  <option value="">OFF</option>
                  {channels.filter(c => c.id !== ch.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name || CHANNEL_LABELS[c.type]}</option>
                  ))}
                </select>
                {ch.sidechainSource && (
                  <select value={ch.sidechainType || 'compression'} onChange={(e) => onSetChannel(ch.id, { sidechainType: e.target.value })}
                    className="bg-black border border-[rgba(255,204,0,0.3)] text-[#ffcc00] text-[8px] px-1">
                    <option value="compression">COMP</option>
                    <option value="frequency">FREQ</option>
                  </select>
                )}
                {/* OCTAVE CONTROL (per-step, adjusts microNote of focused step) */}
                <div className="flex items-center gap-0.5 mr-1">
                  <button onClick={() => {
                    if (focusedCell && focusedCell.chId === ch.id) {
                      const si = focusedCell.stepIdx;
                      const cur = (ch.microNotes && ch.microNotes[si]) || 60;
                      onSetMicroNote(ch.id, si, Math.min(127, cur + 12));
                    }
                  }}
                    className="px-0.5 text-[7px] border leading-none crt-dim hover:text-[#ffcc00]"
                    style={{ borderColor: 'rgba(255,204,0,0.2)', height: 14 }}>+8</button>
                  <span className="text-[8px] font-bold crt-dim text-center" style={{ minWidth: 10 }}>
                    {focusedCell && focusedCell.chId === ch.id && ch.microNotes && ch.microNotes[focusedCell.stepIdx] != null
                      ? Math.floor(ch.microNotes[focusedCell.stepIdx] / 12) - 1
                      : '-'}
                  </span>
                  <button onClick={() => {
                    if (focusedCell && focusedCell.chId === ch.id) {
                      const si = focusedCell.stepIdx;
                      const cur = (ch.microNotes && ch.microNotes[si]) || 60;
                      onSetMicroNote(ch.id, si, Math.max(0, cur - 12));
                    }
                  }}
                    className="px-0.5 text-[7px] border leading-none crt-dim hover:text-[#ffcc00]"
                    style={{ borderColor: 'rgba(255,204,0,0.2)', height: 14 }}>-8</button>
                </div>
                <div className="flex-1" />
                {/* MICRO TOGGLE */}
                <button onClick={() => onSetChannel(ch.id, { showMicro: !ch.showMicro })}
                  className={`px-1.5 py-0.5 border text-[8px] font-bold uppercase tracking-wider ${ch.showMicro ? 'text-black' : 'crt-dim hover:text-[#ffcc00]'}`}
                  style={ch.showMicro ? { background: '#00ff66', borderColor: '#00ff66', boxShadow: '0 0 6px #00ff66' } : { borderColor: 'rgba(255,204,0,0.2)' }}>
                  μ
                </button>
                {/* CHANNEL ACTIVE */}
                <button onClick={() => onSetChannel(ch.id, { active: !ch.active })}
                  className={`px-1 text-[9px] border ${ch.active ? 'border-[rgba(255,204,0,0.3)] crt-dim' : 'border-red-800 text-red-400'}`}
                  title={ch.active ? 'Mute' : 'Unmute'}>
                  {ch.active ? 'ON' : 'OFF'}
                </button>
                {/* DELETE */}
                <button onClick={() => onRemoveChannel(ch.id)}
                  className="px-1 text-[9px] border border-transparent hover:border-red-600 hover:text-red-400 crt-dim"
                  title="Remove channel">✕</button>
              </div>

              {/* STEP MODE TABS (visible when stepEdit is ON) */}
              {stepEdit && (
                <div className="flex items-center gap-1 px-3 py-1 border-b" style={{ borderColor: chColor + '22', background: chColor + '06' }}>
                  <span className="text-[8px] crt-dim uppercase tracking-wider mr-2">EDIT:</span>
                  {STEP_MODES.map(m => (
                    <button key={m.id} onClick={() => onSetStepMode(m.id)}
                      style={{
                        padding: '1px 6px', fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold',
                        border: `1px solid ${stepMode === m.id ? m.color : 'rgba(255,204,0,0.15)'}`,
                        background: stepMode === m.id ? `${m.color}22` : 'transparent',
                        color: stepMode === m.id ? m.color : 'rgba(255,204,0,0.4)',
                        boxShadow: stepMode === m.id ? `0 0 4px ${m.color}44` : 'none',
                        cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
                      }}>
                      {m.label}
                    </button>
                  ))}
                  {/* Glitch symbol legend (compact) */}
                  {stepMode === 'glitch' && (
                    <span className="text-[7px] crt-dim ml-2">
                      s/b/r/t/w/n/h/c/x/z
                    </span>
                  )}
                </div>
              )}

              {/* STEP NUMBER RULER */}
              <div className="px-3 py-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[6px] crt-dim w-4 shrink-0 text-center">#</span>
                  <div className="flex flex-1 gap-[1px] overflow-x-auto min-w-0 border-l border-r border-[rgba(255,204,0,0.15)] rounded-sm">
                    {Array.from({ length: ch.patternLen || 32 }, (_, sIdx) => {
                      const isPlayStep = isPlaying && (currentStep % (ch.patternLen || 32)) === sIdx;
                      return (
                        <div key={sIdx} className="text-center leading-none" style={{
                          width: 18, minWidth: 18, maxWidth: 18, fontSize: 6,
                          color: isPlayStep ? '#000' : 'rgba(255,204,0,0.2)',
                          background: isPlayStep ? chColor : 'transparent',
                          fontWeight: isPlayStep ? 'bold' : 'normal',
                          transition: 'background 0.06s, color 0.06s',
                        }}>
                          {sIdx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP EDIT INFO BAR (shows during step edit + during playback) */}
              {(stepEdit || isPlaying) && (
                <div className="px-3 py-0.5 border-b" style={{ borderColor: chColor + '22', background: chColor + '06' }}>
                  <div className="flex items-center gap-2" style={{ fontSize: 7, color: chColor }}>
                    {isPlaying && (
                      <>
                        <span style={{ fontWeight: 'bold' }}>▶ STEP {currentStep + 1}</span>
                        <span className="crt-dim">|</span>
                      </>
                    )}
                    {stepEdit && focusedCell && focusedCell.chId === ch.id ? (
                      <>
                        <span style={{ fontWeight: 'bold' }}>EDIT STEP {focusedCell.stepIdx + 1}</span>
                        <span className="crt-dim">|</span>
                        <span>LAYER {focusedCell.layerIdx === 0 ? 'T' : focusedCell.layerIdx === 1 ? 'M' : 'B'}</span>
                        <span className="crt-dim">|</span>
                        <span style={{ color: STEP_MODES.find(m => m.id === stepMode)?.color || chColor }}>
                          {stepMode.toUpperCase()} = {getOverrideValue(ch.id, focusedCell.layerIdx, focusedCell.stepIdx)}
                        </span>
                        {stepMode === 'glitch' && (
                          <>
                            <span className="crt-dim">|</span>
                            <span style={{ color: GLITCH_COLORS[getGlitchSymbol(ch.id, focusedCell.layerIdx, focusedCell.stepIdx)] || chColor }}>
                              {GLITCH_NAMES[getGlitchSymbol(ch.id, focusedCell.layerIdx, focusedCell.stepIdx)] || 'STUTTER'} [{getGlitchSymbol(ch.id, focusedCell.layerIdx, focusedCell.stepIdx)}]
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="crt-dim">no cell focused — click a step</span>
                    )}
                  </div>
                </div>
              )}

              {/* LAYER GRID */}
              <div className="px-3 py-1.5">
                {ch.layers.map((layer, lIdx) => {
                  const dir = ch.patternDir || 'forward';
                  const len = ch.patternLen || 32;
                  const displaySteps = len;
                  // Check if this layer has a note on the current playback step
                  const layerHasNote = isPlaying && layer[currentStep % len] !== ' ';
                  return (
                    <div key={lIdx} className="flex items-center gap-2">
                      <span className="text-[8px] font-bold w-4 shrink-0 text-center"
                        style={{
                          color: layerHasNote ? chColor : 'rgba(255,204,0,0.4)',
                          textShadow: layerHasNote ? `0 0 6px ${chColor}` : 'none',
                          transition: 'color 0.06s, text-shadow 0.06s',
                        }}>
                        {lIdx === 0 ? 'T' : lIdx === 1 ? 'M' : 'B'}
                      </span>
                      <div className="flex flex-1 gap-[1px] overflow-x-auto min-w-0 border-l border-r border-[rgba(255,204,0,0.2)] rounded-[2px] shadow-[0_0_4px_rgba(255,204,0,0.05)] bg-black/20">
                        {Array.from({ length: displaySteps }, (_, sIdx) => {
                          const renderIdx = getStepIndex(sIdx, dir, len);
                          const char = renderIdx < layer.length ? layer[renderIdx] : ' ';
                          const isActive = isPlaying && (currentStep % len) === sIdx;
                          const isFocused = focusedCell && focusedCell.chId === ch.id && focusedCell.layerIdx === lIdx && focusedCell.stepIdx === sIdx;
                          const overrideVal = getOverrideValue(ch.id, lIdx, sIdx);
                          const glitchSym = getGlitchSymbol(ch.id, lIdx, sIdx);
                          const glitchColor = GLITCH_COLORS[glitchSym] || '#ffcc00';

                            if (stepEdit) {
                              return (
                                <div key={sIdx}
                                  className="w-[18px] min-w-[18px] max-w-[18px] h-6 border-r border-[rgba(255,204,0,0.06)] last:border-0 flex items-center justify-center overflow-hidden"
                                  style={{ background: isActive ? 'rgba(255,204,0,0.08)' : 'transparent' }}>
                                  {stepMode === 'glitch' ? (
                                    <div className="flex items-center justify-center w-full h-full gap-0"
                                      title={`${GLITCH_NAMES[glitchSym] || 'STUTTER'} [${glitchSym}]`}>
                                      <span onClick={() => cycleGlitchType(ch.id, lIdx, sIdx)} style={{
                                        color: glitchColor, fontSize: 7, fontWeight: 'bold', textShadow: `0 0 3px ${glitchColor}`, cursor: 'pointer', lineHeight: 1
                                      }}>{glitchSym}</span>
                                      <div
                                        onMouseDown={(e) => startDrag(ch.id, lIdx, sIdx, e)}
                                        className="cursor-ns-resize select-none"
                                        style={{ width: 10, height: '100%', color: glitchColor, fontSize: 7, fontWeight: 'bold', textAlign: 'center', lineHeight: '24px', fontFamily: 'monospace' }}>
                                        {overrideVal}
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      onMouseDown={(e) => startDrag(ch.id, lIdx, sIdx, e)}
                                      className="cursor-ns-resize select-none"
                                      style={{ width: '100%', height: '100%', color: chColor, fontSize: 9, fontWeight: 'bold', textAlign: 'center', lineHeight: '24px', fontFamily: 'monospace' }}>
                                      {overrideVal}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // Build tooltip logic
                            let tooltipText = '';
                            if (char !== ' ') {
                              const overrideEq = stepOverrides[`${ch.id}_${lIdx}_${sIdx}`]?.equation;
                              if (overrideEq) {
                                tooltipText = 'f(t) = ' + overrideEq;
                              } else {
                                const dictEntry = ASCII_DICTIONARY[char];
                                if (dictEntry) {
                                  tooltipText = dictEntry.desc || dictEntry.funcStr || dictEntry.type || 'Custom Symbol';
                                } else {
                                  tooltipText = 'Unmapped Character';
                                }
                              }
                            }

                            const invColor = invertHex(chColor);

                            return (
                              <div key={sIdx}
                                onClick={() => onCellClick(ch, cIdx, lIdx, sIdx)}
                                onContextMenu={(e) => onCellContextMenu(e, ch, cIdx, lIdx, sIdx)}
                                className={`w-[18px] min-w-[18px] max-w-[18px] h-6 text-center cursor-crosshair text-xs select-none border-r ${ (sIdx + 1) % 4 === 0 ? 'border-[rgba(255,204,0,0.15)]' : 'border-[rgba(255,204,0,0.04)]' } last:border-0 hover:bg-[rgba(255,204,0,0.15)] flex items-center justify-center overflow-hidden relative group`}
                                style={isActive ? { 
                                  backgroundColor: char !== ' ' ? chColor : 'rgba(255,255,255,0.1)', 
                                  boxShadow: char !== ' ' ? `0 0 15px ${chColor}, 0 0 5px ${invColor}` : 'none', 
                                  zIndex: 2 
                                } : isFocused ? { boxShadow: `inset 0 0 0 1px ${chColor}`, backgroundColor: `${chColor}18` } : {}}>
                                {char === ' ' ? <span className="opacity-[0.08] text-[9px]">·</span> : <span className="leading-none" style={{ 
                                  fontSize: 11, 
                                  fontWeight: isActive ? '900' : 'normal',
                                  color: isActive ? invColor : chColor, 
                                  textShadow: isActive ? 'none' : `0 0 2px ${chColor}44`, 
                                  marginTop: 1 
                                }} onClick={(e) => { if (char !== ' ' && onSelectChar) onSelectChar(char); }}>{char}</span>}
                                {stepOverrides[`${ch.id}_${lIdx}_${sIdx}`]?.equation && (
                                  <div className="absolute top-[1px] right-[1px] w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_4px_#d946ef]" title="Nested Equation" />
                                )}
                                {char !== ' ' && (
                                  <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 bg-[#111] border border-[rgba(255,204,0,0.5)] text-[#ffcc00] text-[9px] whitespace-nowrap z-50 pointer-events-none rounded shadow-lg shadow-black">
                                    <div className="font-bold text-white mb-[2px]">{char}</div>
                                    <div className="text-[rgba(255,255,255,0.7)]">{tooltipText}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              {/* MICROTONAL ROLL */}
              <MicroRoll channelId={ch.id} patternLen={ch.patternLen || 32}
                microNotes={ch.microNotes || []} onSetMicroNote={onSetMicroNote}
                layers={ch.layers}
                scale={affinity.scale} root={affinity.root}
                microScale={affinity.microScale}
                patternDir={ch.patternDir || 'forward'}
                show={ch.showMicro}
                isPlaying={isPlaying} currentStep={currentStep} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
