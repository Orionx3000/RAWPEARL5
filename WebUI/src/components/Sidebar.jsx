import React, { useState } from 'react';

const META_GROUPS = {
  'TIMBRE': ['DENSE_STRIKE', 'HOLLOW_STRIKE', 'SOFT_STRIKE', 'GHOST', 'SUSTAIN_TIE'],
  'ENVELOPE': ['ENVELOPE_SWELL', 'ENVELOPE_PLUCK'],
  'FX_ROUTING': ['FX_CONTROL', 'PROBABILITY'],
  'NOISE_DRIVE': ['CHAOS_NOISE', 'NOISE_TEXTURES', 'DRIVE'],
  'PERCUSSION': ['PERCUSSION'],
  'GRANULAR': ['GRANULAR_MONOLITH'],
  'BRAILLE': ['BRAILLE_MACROS'],
  'OTHER': ['OTHER'],
};

export default function Sidebar({ asciiDict, selectedChar, onSelectChar, onPreview }) {
  const [openFolders, setOpenFolders] = useState({});

  const toggleFolder = (id) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCharClick = (char) => {
    onSelectChar(char);
    if (onPreview) onPreview(char);
  };

  // Build meta structure from asciiDict
  const buildMeta = () => {
    const meta = {};
    Object.entries(META_GROUPS).forEach(([metaName, cats]) => {
      const children = [];
      cats.forEach(cat => {
        if (asciiDict[cat]) children.push({ category: cat, items: asciiDict[cat] });
      });
      if (children.length > 0) meta[metaName] = children;
    });
    // Catch any uncategorized
    const usedCats = new Set(Object.values(META_GROUPS).flat());
    Object.keys(asciiDict).forEach(cat => {
      if (!usedCats.has(cat)) {
        if (!meta['OTHER']) meta['OTHER'] = [];
        meta['OTHER'].push({ category: cat, items: asciiDict[cat] });
      }
    });
    return meta;
  };

  const meta = buildMeta();

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
        {Object.entries(meta).map(([metaName, children]) => {
          const metaOpen = openFolders[metaName] === true;
          return (
            <div key={metaName} className="flex flex-col">
              <div 
                onClick={() => toggleFolder(metaName)}
                className="flex items-center gap-1 py-1 px-1 cursor-pointer hover:bg-[rgba(255,204,0,0.1)] transition-colors"
              >
                <span className="w-3 text-center">{metaOpen ? 'v' : '>'}</span>
                <span className="font-bold text-[#ffcc00]">[{metaName}]</span>
              </div>

              {metaOpen && (
                <div className="flex flex-col pl-2 border-l border-[rgba(255,204,0,0.1)] ml-1">
                  {children.map(({ category, items }) => {
                    const catOpen = openFolders[category] === true;
                    return (
                      <div key={category} className="flex flex-col">
                        <div 
                          onClick={() => toggleFolder(category)}
                          className="flex items-center gap-1 py-[2px] px-1 cursor-pointer hover:bg-[rgba(255,204,0,0.08)] transition-colors"
                        >
                          <span className="w-2 text-center text-[8px]">{catOpen ? 'v' : '>'}</span>
                          <span className="crt-dim text-[9px]">[{category.replace(/\s+/g, '_')}]</span>
                          <span className="text-[7px] crt-dim opacity-40 ml-auto">({items.length})</span>
                        </div>

                        {catOpen && (
                          <div className="flex flex-col pl-2 border-l border-[rgba(255,204,0,0.05)] ml-[6px]">
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
                                  <span className="w-3 text-center opacity-50 text-[8px]">|-</span>
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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