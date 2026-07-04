import React, { useState } from 'react';

const CHANNEL_TYPES = [
  // Synth engines
  { id: 'α', label: 'α (ANALOG)', color: '#ff66aa', group: 'SYNTH' },
  { id: 'δ', label: 'δ (WAVETABLE)', color: '#ff00ff', group: 'SYNTH' },
  { id: 'φ', label: 'φ (FM)', color: '#ff0055', group: 'SYNTH' },
  { id: 'Σ', label: 'Σ (ADDITIVE)', color: '#00ffcc', group: 'SYNTH' },
  { id: 'γ', label: 'γ (GRANULAR)', color: '#aa00ff', group: 'SYNTH' },
  { id: 'ω', label: 'ω (NOISE)', color: '#aaaaaa', group: 'SYNTH' },
  { id: 'π', label: 'π (PHYSICAL)', color: '#ffaa00', group: 'SYNTH' },
  // Drum engines
  { id: 'τ', label: 'τ (KICK ENGINE)', color: '#ffffff', group: 'DRUM' },
  { id: 'w', label: 'w (PERC ENGINE)', color: '#888888', group: 'DRUM' },
  // Kick drum presets (τ type)
  { id: 'KICK', label: 'KICK (Classic Analog)', color: '#ffcc44', group: 'KICK' },
  { id: 'KICK_DIGI', label: 'KICK (Digital Punch)', color: '#ff8844', group: 'KICK' },
  { id: 'KICK_FM', label: 'KICK (FM Metallic)', color: '#ff6644', group: 'KICK' },
  { id: 'KICK_MOD', label: 'KICK (Modular Sweep)', color: '#ff4444', group: 'KICK' },
  { id: 'KICK_GRAN', label: 'KICK (Granular Burst)', color: '#cc4444', group: 'KICK' },
  { id: 'KICK_UNST', label: 'KICK (Unstable)', color: '#aa4444', group: 'KICK' },
  // Snare drum presets (w type)
  { id: 'SNARE', label: 'SNARE (Classic)', color: '#44ccff', group: 'SNARE' },
  { id: 'SNARE_BIN', label: 'SNARE (Binary)', color: '#44aaff', group: 'SNARE' },
  { id: 'SNARE_RING', label: 'SNARE (Ring)', color: '#4488ff', group: 'SNARE' },
  { id: 'SNARE_JIT', label: 'SNARE (Jitter)', color: '#4466ff', group: 'SNARE' },
  { id: 'SNARE_ZON', label: 'SNARE (Zonal)', color: '#4444ff', group: 'SNARE' },
  // Hat presets (w type)
  { id: 'HAT_CL', label: 'HAT (Closed)', color: '#44ffcc', group: 'HAT' },
  { id: 'HAT_OP', label: 'HAT (Open)', color: '#44ffaa', group: 'HAT' },
  { id: 'HAT_MET', label: 'HAT (Metal)', color: '#44ff88', group: 'HAT' },
  { id: 'HAT_HAR', label: 'HAT (Harmonic)', color: '#44ff66', group: 'HAT' },
  // Other percussion (w type)
  { id: 'CLAP', label: 'CLAP', color: '#cc44ff', group: 'PERC' },
  { id: 'BONGO', label: 'BONGO', color: '#ff44ff', group: 'PERC' },
  { id: 'FORMANT', label: 'FORMANT', color: '#ff44cc', group: 'PERC' },
  { id: 'STRING', label: 'STRING (Karplus-Strong)', color: '#ff44aa', group: 'PERC' },
  { id: 'IMPULSE', label: 'IMPULSE', color: '#ff4488', group: 'PERC' },
  { id: 'TOM', label: 'TOM (Synth Tom)', color: '#44ff44', group: 'PERC' },
];

export default function TransportBar({ 
  isPlaying, bpm, onTogglePlay, onBpmChange, onAddChannel, 
  selectedTool, onSetTool, onShowDensity, stepEdit, onStepEdit, 
  stepMode, onSetStepMode, isRecordingLive, onToggleLiveRecord 
}) {
  const [chType, setChType] = useState('α');

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b-2 crt-border shrink-0 bg-black flex-wrap">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-widest crt-glow shrink-0">ASCII_DAW</h1>
        <div className="h-6 w-px bg-[rgba(255,204,0,0.3)]" />
        <button onClick={onTogglePlay}
          className={`px-4 py-1 border-2 border-[#ffcc00] text-xs font-bold uppercase tracking-wider ${isPlaying ? 'bg-[#ffcc00] text-black' : 'hover:bg-[#ffcc00] hover:text-black'}`}>
          {isPlaying ? '⏹ STOP' : '▶ PLAY'}
        </button>
        <button onClick={onToggleLiveRecord}
          className={`px-4 py-1 border-2 border-red-500 text-xs font-bold uppercase tracking-wider ${isRecordingLive ? 'bg-red-500 text-white animate-pulse' : 'text-red-500 hover:bg-red-500 hover:text-white'}`}>
          {isRecordingLive ? '● REC [ON]' : '● REC HD WAV'}
        </button>
        <div className="flex items-center gap-1 text-xs">
          <span className="crt-dim">BPM</span>
          <input type="number" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))}
            className="bg-transparent border border-[#ffcc00] w-14 text-center text-xs py-0.5 focus:outline-none crt-glow" />
        </div>
      </div>

      <div className="h-6 w-px bg-[rgba(255,204,0,0.3)]" />

      <div className="flex items-center gap-1">
        {['select', 'dict', 'erase'].map(tool => (
          <button key={tool} onClick={() => onSetTool(tool)}
            className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${selectedTool === tool ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'border-[rgba(255,204,0,0.3)] hover:border-[#ffcc00] crt-dim'}`}>
            {tool === 'select' ? '[⌨ TYPE]' : tool === 'dict' ? '[📖 DICT]' : '[✗ ERASE]'}
          </button>
        ))}
        <div className="h-4 w-px bg-[rgba(255,204,0,0.3)]" />
        <button onClick={() => onStepEdit(!stepEdit)}
          className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${stepEdit ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'border-[rgba(255,204,0,0.3)] hover:border-[#ffcc00] crt-dim'}`}>
          [STEP EDIT]
        </button>
      </div>

      <div className="h-6 w-px bg-[rgba(255,204,0,0.3)]" />

      <div className="flex items-center gap-1">
        <span className="text-[10px] crt-dim uppercase mr-1">+CH</span>
        <select value={chType} onChange={(e) => setChType(e.target.value)}
          className="bg-black border border-[rgba(255,204,0,0.3)] text-[#ffcc00] text-[9px] px-1 py-0.5 max-w-[80px] font-mono">
          {CHANNEL_TYPES.map(ct => (
            <option key={ct.id} value={ct.id} className="font-mono">{ct.label}</option>
          ))}
        </select>
        <button onClick={() => onAddChannel(chType)}
          className="px-2 py-0.5 border border-[#ffcc00] text-[10px] font-bold uppercase tracking-wider hover:bg-[#ffcc00] hover:text-black">
          +ADD
        </button>
      </div>

      <div className="flex-1" />

      <button onClick={() => onShowDensity(true)}
        className="px-2 py-1 border border-[rgba(255,204,0,0.3)] text-[10px] uppercase tracking-wider hover:border-[#ffcc00] crt-dim">
        [DENSITY]
      </button>
    </header>
  );
}
