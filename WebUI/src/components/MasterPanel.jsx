import React from 'react';
import { SCALES, NOTE_NAMES, MICROTONAL_SCALES } from '../AsciiEngine.js';

const PITCH_CLASS_NAMES = { 0: 'C', 1: 'C#/Db', 2: 'D', 3: 'D#/Eb', 4: 'E', 5: 'F', 6: 'F#/Gb', 7: 'G', 8: 'G#/Ab', 9: 'A', 10: 'A#/Bb', 11: 'B' };

export default function MasterPanel({ affinity, onSetAffinity, showMicroPopup, onSetMicroPopup }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-1 border-b border-[rgba(255,204,0,0.15)] bg-[rgba(255,204,0,0.03)] text-[10px] flex-wrap shrink-0">
        <span className="crt-dim uppercase tracking-wider font-bold">MASTER</span>
        <label className="flex items-center gap-1">
          <span className="crt-dim">ROOT</span>
          <select value={affinity.root} onChange={(e) => onSetAffinity({ ...affinity, root: e.target.value })}
            className="bg-black border border-[#ffcc00] px-1 text-[#ffcc00] text-[10px]">
            {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <span className="crt-dim">SCALE</span>
          <select value={affinity.scale} onChange={(e) => onSetAffinity({ ...affinity, scale: e.target.value })}
            className="bg-black border border-[#ffcc00] px-1 text-[#ffcc00] text-[10px]">
            {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {affinity.microScale && (
          <span className="text-[8px] border border-[rgba(0,255,100,0.3)] px-1"
            style={{ color: '#00ff66', textShadow: '0 0 4px #00ff66' }}>
            μ:{affinity.microScale}
          </span>
        )}
        <button onClick={() => onSetMicroPopup(!showMicroPopup)}
          className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider font-bold ${showMicroPopup ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'border-[rgba(255,204,0,0.3)] hover:border-[#ffcc00] crt-dim'}`}>
          [MICROTONAL]
        </button>
        {affinity.microScale && (
          <button onClick={() => onSetAffinity({ ...affinity, microScale: null })}
            className="text-[8px] border border-red-800 text-red-400 px-1 hover:border-red-500">
            ✕ μ
          </button>
        )}
        <div className="flex-1" />
        <label className="flex items-center gap-1">
          <span className="crt-dim">GATE</span>
          <input type="checkbox" checked={affinity.gate} onChange={(e) => onSetAffinity({ ...affinity, gate: e.target.checked })} className="accent-[#ffcc00]" />
        </label>
      </div>

      {showMicroPopup && (
        <div className="modal-overlay z-50" onClick={(e) => { if (e.target === e.currentTarget) onSetMicroPopup(false); }}>
          <div className="bg-black border-2 border-[#ffcc00] p-5 max-w-xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold crt-glow">MICROTONAL SCALE LIBRARY</h2>
              <button onClick={() => onSetMicroPopup(false)} className="border border-[#ffcc00] px-2 py-0 text-xs hover:bg-[#ffcc00] hover:text-black">[X]</button>
            </div>
            <div className="text-[10px] crt-dim mb-3">Set the microtonal scale for the whole system. This guides per-channel pitch in the µ roll.</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MICROTONAL_SCALES).map(([name, cents]) => (
                <button key={name} onClick={() => { onSetAffinity({ ...affinity, microScale: name }); onSetMicroPopup(false); }}
                  className={`text-left p-2 border text-[10px] ${affinity.microScale === name ? 'border-[#00ff66] bg-[rgba(0,255,100,0.1)]' : 'border-[rgba(255,204,0,0.2)] hover:border-[#ffcc00]'}`}>
                  <div className="font-bold" style={affinity.microScale === name ? { color: '#00ff66', textShadow: '0 0 4px #00ff66' } : {}}>{name}</div>
                  <div className="crt-dim">{cents.length} notes</div>
                  <div className="text-[8px] crt-dim mt-1">
                    {cents.slice(0, 7).map((c, i) => <span key={i} className="mr-1">{Math.round(c)}¢</span>)}
                    {cents.length > 7 && <span>...</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
