import React from 'react';
import { NOTE_NAMES, SCALES } from '../AsciiEngine.js';

export default function AffinityPanel({ affinity, onSetAffinity }) {
  return (
    <div className="border-b border-[#ffcc00] bg-[rgba(255,204,0,0.05)] px-4 py-2 flex items-center gap-4 text-sm">
      <span className="crt-dim">AFFINITY</span>
      <label className="crt-dim">ROOT
        <select value={affinity.root} onChange={(e) => onSetAffinity(a => ({ ...a, root: e.target.value }))}
          className="bg-black border border-[#ffcc00] ml-1 px-1 text-[#ffcc00]">
          {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label className="crt-dim">SCALE
        <select value={affinity.scale} onChange={(e) => onSetAffinity(a => ({ ...a, scale: e.target.value }))}
          className="bg-black border border-[#ffcc00] ml-1 px-1 text-[#ffcc00]">
          {Object.keys(SCALES).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </label>
      <label className="crt-dim">GATE
        <input type="checkbox" checked={affinity.gate} onChange={(e) => onSetAffinity(a => ({ ...a, gate: e.target.checked }))} className="ml-1 accent-[#ffcc00]" />
      </label>
    </div>
  );
}
