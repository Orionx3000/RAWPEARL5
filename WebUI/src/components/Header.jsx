import React from 'react';

export default function Header({ bpm, isPlaying, onBpmChange, onTogglePlay, onAddNode, onShowDensity, onShowHelp, onShowAffinity, showAffinity }) {
  return (
    <header className="flex justify-between items-center p-4 border-b-2 crt-border shrink-0">
      <div>
        <h1 className="text-2xl font-bold tracking-widest crt-glow">ASCII_DAW v2.0</h1>
        <p className="text-xs crt-dim">FULL SPECTRUM TERMINAL ENGINE</p>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => onShowDensity(true)} className="px-3 py-1 border border-[#ffcc00] text-xs hover:bg-[#ffcc00] hover:text-black">[DENSITY]</button>
        <button onClick={() => onShowAffinity(!showAffinity)} className="px-3 py-1 border border-[#ffcc00] text-xs hover:bg-[#ffcc00] hover:text-black">[AFFINITY]</button>
        <button onClick={() => onShowHelp(true)} className="px-3 py-1 border border-[#ffcc00] text-xs hover:bg-[#ffcc00] hover:text-black">[HELP]</button>
        <button onClick={onAddNode} className="px-3 py-1 border border-[#ffcc00] text-xs hover:bg-[#ffcc00] hover:text-black">[+NODE]</button>
        <div className="flex items-center gap-2">
          <span className="text-sm">BPM:</span>
          <input type="number" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))}
            className="bg-transparent border border-[#ffcc00] w-16 text-center focus:outline-none crt-glow" />
        </div>
        <button onClick={onTogglePlay}
          className={`px-6 py-2 border-2 border-[#ffcc00] uppercase font-bold transition-all ${isPlaying ? 'bg-[#ffcc00] text-black' : 'hover:bg-[#ffcc00] hover:text-black'}`}>
          {isPlaying ? '[ STOP ]' : '[ PLAY ]'}
        </button>
      </div>
    </header>
  );
}
