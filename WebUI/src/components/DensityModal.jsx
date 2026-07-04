import React from 'react';
import { calculateDensity, getDensityMapping, DENSITY_RANGES } from '../AsciiEngine.js';

export default function DensityModal({ show, onClose, onSelectChar, onPreview }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-black border-2 border-[#ffcc00] p-6 max-w-3xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold crt-glow">DENSITY LIBRARY</h2>
          <button onClick={onClose} className="border border-[#ffcc00] px-3 py-1 hover:bg-[#ffcc00] hover:text-black">[X]</button>
        </div>
        <div className="text-xs crt-dim mb-4">Click any character — color = density class</div>
        {[[33, 126], [9472, 9599], [9600, 9631], [10240, 10495]].map((range, ri) => (
          <div key={ri} className="mb-4">
            <div className="flex flex-wrap gap-[2px]">
              {(() => {
                const cells = [];
                for (let code = range[0]; code <= range[1]; code++) {
                  const ch = String.fromCharCode(code);
                  const density = calculateDensity(ch);
                  const map = getDensityMapping(density);
                  cells.push(
                    <div key={code} onClick={() => { onSelectChar(ch); if (onPreview) onPreview(ch); onClose(); }}
                      className="w-6 h-6 inline-flex items-center justify-center cursor-pointer text-xs border transition-transform hover:scale-125"
                      style={{ backgroundColor: map.color + '22', borderColor: map.color, color: map.color }}
                      title={`'${ch}' — ${density.toFixed(1)}% — ${map.cls}`}>
                      {ch}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 mt-2">
          {DENSITY_RANGES.map(r => (
            <div key={r.cls} className="flex items-center gap-1 text-[10px]">
              <span className="w-3 h-3 inline-block" style={{ backgroundColor: r.color }}></span>
              <span className="crt-dim">{r.cls}</span>
              <span className="text-[#ffcc00]">({r.desc})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
