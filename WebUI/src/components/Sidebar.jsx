import React, { useState } from 'react';
import { HELLENIC_MODELS, HELLENIC_TYPES } from '../AsciiEngine.js';

const HELLENIC_LABELS = { α:'ANALOG SUBTRACTIVE', δ:'DIGITAL WAVETABLE', φ:'FM SYNTHESIS', Σ:'ADDITIVE SPECTRAL', γ:'GRANULAR', ω:'CHAOTIC NOISE', π:'PHYSICAL MODELING', τ:'TRANISTOR PERC', w:'NOISE PERCUSSION' };

export default function Sidebar({ asciiDict, selectedChar, onSelectChar, onPreview }) {
  const [hellenicOpen, setHellenicOpen] = useState(false);
  const [openChars, setOpenChars] = useState({});

  const toggleChar = (char) => {
    setOpenChars(prev => ({ ...prev, [char]: !prev[char] }));
  };

  const handleCharClick = (char) => {
    onSelectChar(char);
    if (onPreview) onPreview(char);
  };

  return (
    <aside className="w-80 p-2 flex flex-col bg-[#050505] border-l border-[rgba(255,204,0,0.1)] text-[#ffcc00] font-mono select-none">
      <div className="mb-2 pb-1 border-b border-[rgba(255,204,0,0.3)] uppercase font-bold text-[10px] tracking-wider flex justify-between items-center bg-[#0a0a0a] px-2 py-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#ffcc00] inline-block animate-pulse"></span>
          DSP_ROOT: /
        </span>
        <span className="crt-dim opacity-50">SYS.VOL</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 text-[10px] uppercase">
        {/* ─── FLAT DSP SYMBOLS (no nesting) ─── */}
        {Object.entries(asciiDict).map(([category, items]) => (
          <div key={category}>
            <div className="font-bold text-[10px] py-1 px-1 text-[rgba(255,204,0,0.6)] border-b border-[rgba(255,204,0,0.05)]">
              [{category.replace(/\s+/g, '_')}]
            </div>
            <div className="flex flex-col">
              {items.map((item) => {
                const isSelected = selectedChar === item.char;
                return (
                  <div 
                    key={item.char} 
                    onClick={() => handleCharClick(item.char)}
                    className={`flex items-start gap-2 py-[2px] px-1 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#ffcc00] text-black font-bold' : 'hover:bg-[rgba(255,204,0,0.15)] text-[rgba(255,204,0,0.7)]'
                    }`}
                  >
                    <span className="w-3 text-center opacity-50">|-</span>
                    <span className={`w-4 text-center font-bold text-xs ${isSelected ? 'text-black' : 'text-[#ffcc00]'}`}>
                      {item.char}
                    </span>
                    <span className="flex-1 truncate mt-[1px]">
                      {item.desc || item.type || 'UNKNOWN.BIN'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ─── HELLENIC ENGINES (collapsible, at bottom) ─── */}
        {Object.keys(HELLENIC_MODELS).length > 0 && (
          <div className="mt-2 pt-2 border-t border-[rgba(255,204,0,0.15)]">
            <div 
              onClick={() => setHellenicOpen(!hellenicOpen)}
              className="flex items-center gap-1 py-1 px-1 cursor-pointer hover:bg-[rgba(255,204,0,0.1)] transition-colors"
            >
              <span className="w-3 text-center">{hellenicOpen ? 'v' : '>'}</span>
              <span className="font-bold text-[#ffcc00]">[HELLENIC]</span>
            </div>

            {hellenicOpen && (
              <div className="flex flex-col pl-2 border-l border-[rgba(255,204,0,0.15)] ml-1">
                {Object.entries(HELLENIC_MODELS).map(([char, models]) => {
                  const charOpen = openChars[char] === true;
                  const typeInfo = HELLENIC_TYPES[char];
                  return (
                    <div key={char} className="flex flex-col">
                      <div 
                        onClick={() => toggleChar(char)}
                        className="flex items-center gap-1 py-[2px] px-1 cursor-pointer hover:bg-[rgba(255,204,0,0.08)] transition-colors"
                      >
                        <span className="w-2 text-center text-[8px]">{charOpen ? 'v' : '>'}</span>
                        <span className="font-bold text-[#ffcc00] text-[10px]">[{char}]</span>
                        <span className="crt-dim text-[8px] ml-1">{HELLENIC_LABELS[char] || typeInfo?.type || ''}</span>
                        <span className="text-[7px] crt-dim opacity-40 ml-auto">({models.length})</span>
                      </div>

                      {charOpen && (
                        <div className="flex flex-col pl-2 border-l border-[rgba(255,204,0,0.05)] ml-[6px]">
                          {models.map((m) => (
                            <div 
                              key={m.name}
                              onClick={() => handleCharClick(char)}
                              className={`flex items-start gap-2 py-[2px] px-1 cursor-pointer transition-colors ${
                                selectedChar === char ? 'bg-[#ffcc00] text-black font-bold' : 'hover:bg-[rgba(255,204,0,0.15)] text-[rgba(255,204,0,0.7)]'
                              }`}
                            >
                              <span className="w-3 text-center opacity-50 text-[8px]">|-</span>
                              <span className="w-4 text-center font-bold text-[10px]">{char}</span>
                              <span className="flex-1 truncate mt-[1px]">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="h-4"></div>
      </div>

      <div className="mt-2 p-2 border border-[rgba(255,204,0,0.3)] bg-black text-center shrink-0 flex items-center justify-between cursor-pointer hover:bg-[rgba(255,204,0,0.05)] transition-colors"
        onClick={() => onPreview && onPreview(selectedChar)}
        title="Click to Preview Sound"
      >
        <div className="flex flex-col items-start">
          <div className="text-[8px] crt-dim opacity-50 mb-0">ACTIVE_BRUSH</div>
          <div className="text-[8px] text-[rgba(255,204,0,0.5)]">PREVIEW.EXE {'>'}</div>
        </div>
        <div className="text-3xl font-bold crt-glow leading-none">{selectedChar}</div>
      </div>
    </aside>
  );
}