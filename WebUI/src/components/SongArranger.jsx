import React, { useState, useRef } from 'react';

export default function SongArranger({ 
  songPatterns, 
  setSongPatterns, 
  songIdx, 
  setSongIdx, 
  playMode, 
  setPlayMode,
  loopCollection,
  setLoopCollection,
  exportWav,
  channels,
  setChannels,
  bpm,
  isPlaying,
  affinity,
  onSaveState,
  onLoadState
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportLoopCount, setExportLoopCount] = useState(4);
  const [showArranger, setShowArranger] = useState(false);
  const loadInputRef = useRef(null);

  const handleExportWav = async () => {
    setIsExporting(true);
    if (exportWav) await exportWav(exportLoopCount);
    setIsExporting(false);
  };

  const duplicateAndAppend = () => {
    const srcChannels = songPatterns[songPatterns.length - 1].channels;
    setSongPatterns(prev => [
      ...prev, 
      { id: 'p' + Date.now(), name: `Pattern ${prev.length + 1}`, loopCount: 4, channels: JSON.parse(JSON.stringify(srcChannels)) }
    ]);
    if (playMode !== 'SONG') setPlayMode('SONG');
  };

  const resetTimeline = () => {
    if (songPatterns.length > 1) {
      setSongPatterns([songPatterns[0]]);
      setSongIdx(0);
      setPlayMode('LIVE');
    }
  };

  const removePattern = (idx) => {
    if (songPatterns.length <= 1) return;
    setSongPatterns(prev => prev.filter((_, i) => i !== idx));
    if (songIdx >= songPatterns.length - 1) setSongIdx(Math.max(0, songPatterns.length - 2));
  };

  const addEmptyPattern = () => {
    setSongPatterns(prev => [
      ...prev,
      { id: 'p' + Date.now(), name: `Pattern ${prev.length + 1}`, loopCount: 4, channels: JSON.parse(JSON.stringify(channels)) }
    ]);
    if (playMode !== 'SONG') setPlayMode('SONG');
  };

  // Arrangement timeline: build a visual timeline of pattern order
  const arrangementTimeline = songPatterns.flatMap((p, idx) =>
    Array.from({ length: p.loopCount || 4 }, (_, rep) => ({ patternIdx: idx, patternId: p.id, name: p.name, rep: rep }))
  );
  const currentPosition = arrangementTimeline.findIndex(c => c.patternIdx === songIdx);
  const showTimeline = showArranger && arrangementTimeline.length > 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden gap-1">
      {/* Top controls: arrangement mode + save/load */}
      <div className="flex justify-between items-center border-b border-[#ffcc00]/20 pb-1 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-black text-[#ffcc00] tracking-widest uppercase">Arrangement</h3>
          <button 
            onClick={() => setPlayMode(playMode === 'SONG' ? 'LIVE' : 'SONG')}
            className={`px-3 py-1 text-[9px] font-bold tracking-widest border ${playMode === 'SONG' ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'text-gray-500 border-gray-700 hover:border-[#ffcc00]'}`}>
            {playMode === 'SONG' ? 'SONG [ON]' : 'SONG [OFF]'}
          </button>
          <button 
            onClick={() => setShowArranger(!showArranger)}
            className={`px-2 py-1 text-[9px] font-bold border ${showArranger ? 'bg-[#a066ff] text-white border-[#a066ff]' : 'text-gray-500 border-gray-700 hover:border-[#a066ff]'}`}>
            TIMELINE
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={addEmptyPattern} className="px-2 py-1 bg-[#222] text-[#ffcc00] border border-[#ffcc00] font-bold text-[9px] hover:bg-[#ffcc00] hover:text-black transition-colors">
            + PATTERN
          </button>
          <button onClick={duplicateAndAppend} className="px-2 py-1 bg-[#222] text-[#ffcc00] border border-[#ffcc00] font-bold text-[9px] hover:bg-[#ffcc00] hover:text-black transition-colors">
            + DUPLICATE
          </button>
          <button onClick={resetTimeline} className="px-2 py-1 bg-[#222] text-red-500 border border-red-900 font-bold text-[9px] hover:bg-red-500 hover:text-white transition-colors">
            RESET
          </button>
        </div>
      </div>

      {/* Arrangement Timeline Bar */}
      {showTimeline && (
        <div className="flex gap-px overflow-x-auto pb-1 min-h-[32px] items-end border-b border-[#333] px-1">
          {arrangementTimeline.map((item, i) => (
            <div 
              key={i}
              onClick={() => setSongIdx(item.patternIdx)}
              className={`shrink-0 px-2 py-1 text-[8px] font-bold cursor-pointer border-t-2 transition-colors ${
                i === currentPosition 
                  ? 'bg-[#ffcc00]/20 border-[#ffcc00] text-[#ffcc00]' 
                  : 'bg-black border-transparent text-gray-600 hover:border-gray-500'
              }`}
              title={`${item.name} - Rep ${item.rep + 1}`}
            >
              {item.name.slice(0, 12)}{item.rep > 0 && item.rep === 0 ? '' : ''}
              <span className="ml-1 opacity-50">#{item.rep + 1}</span>
            </div>
          ))}
          <div className="flex-1 min-w-[20px]" />
        </div>
      )}

      {/* Pattern Cards Grid */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {songPatterns.map((p, pIdx) => (
            <div 
              key={p.id} 
              onClick={() => setSongIdx(pIdx)} 
              className={`relative p-2 flex flex-col border-2 cursor-pointer transition-colors group ${
                songIdx === pIdx 
                  ? 'border-[#ffcc00] bg-[#1a1500] shadow-[0_0_10px_rgba(255,204,0,0.15)]' 
                  : 'border-[#333] bg-[#050505] hover:border-[#886a00]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-white truncate">{p.name}</span>
                <span className="text-[8px] text-gray-500 shrink-0 ml-1">#{pIdx + 1}</span>
              </div>

              {/* Loop count selector */}
              <div className="flex items-center gap-2 mb-1">
                <select 
                  value={p.loopCount || 4} 
                  onChange={(e) => { 
                    e.stopPropagation(); 
                    setSongPatterns(prev => {
                      const n = [...prev]; 
                      n[pIdx].loopCount = Number(e.target.value); 
                      return n;
                    }); 
                  }}
                  className="bg-black text-[#ffcc00] border border-[#333] text-[8px] outline-none cursor-pointer px-1"
                  onClick={e => e.stopPropagation()}
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                  <option value={8}>8x</option>
                  <option value={16}>16x</option>
                  <option value={32}>32x</option>
                </select>
                <span className="text-[7px] text-gray-500">LOOPS</span>
              </div>

              {/* Mini-notation grid */}
              <div className="flex-1 overflow-hidden bg-[#111] border border-[#222] p-1 flex flex-col gap-px" style={{ maxHeight: 80 }}>
                {p.channels.slice(0, 8).map((ch, ci) => {
                  const chColor = ch.color || '#ffcc00';
                  const len = Math.min(ch.patternLen || 32, 64);
                  if (!ch.layers) return null;
                  return (
                    <div key={ci} className="flex items-start gap-px">
                      <span className="text-[6px] font-bold shrink-0 w-2 text-center leading-none mt-[1px]" style={{color: chColor}}>{ch.name || '?'}</span>
                      <div className="flex gap-px flex-1 min-w-0">
                        {Array.from({length: len}, (_, si) => {
                          const hasNote = ch.layers.some(layer => layer[si] && layer[si] !== ' ');
                          return (
                            <div key={si} className="rounded-sm flex-1" style={{
                              height: 2,
                              background: hasNote ? chColor : 'rgba(255,204,0,0.04)',
                            }} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Channel count badge */}
              <div className="text-[7px] text-gray-600 mt-1">
                {p.channels.filter(c => c.active).length}/{p.channels.length} CH
              </div>

              {/* Pattern controls (on hover) */}
              {songPatterns.length > 1 && (
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (pIdx > 0) {
                      setSongPatterns(prev => { const a = [...prev]; [a[pIdx-1], a[pIdx]] = [a[pIdx], a[pIdx-1]]; return a; });
                      if (songIdx === pIdx) setSongIdx(pIdx - 1);
                      else if (songIdx === pIdx - 1) setSongIdx(pIdx);
                    }}}
                    disabled={pIdx === 0}
                    className="text-white hover:bg-[#555] px-1 text-[8px] font-bold disabled:opacity-30"
                    title="Move Left"
                  >&lt;</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (pIdx < songPatterns.length - 1) {
                      setSongPatterns(prev => { const a = [...prev]; [a[pIdx], a[pIdx+1]] = [a[pIdx+1], a[pIdx]]; return a; });
                      if (songIdx === pIdx) setSongIdx(pIdx + 1);
                      else if (songIdx === pIdx + 1) setSongIdx(pIdx);
                    }}}
                    disabled={pIdx === songPatterns.length - 1}
                    className="text-white hover:bg-[#555] px-1 text-[8px] font-bold disabled:opacity-30"
                    title="Move Right"
                  >&gt;</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePattern(pIdx); }}
                    className="text-red-500 hover:bg-red-500 hover:text-white px-1 text-[8px] font-bold"
                    title="Delete"
                  >X</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export controls */}
      <div className="flex gap-4 items-center border-t border-[#333] pt-1 px-1 pb-1">
        {playMode !== 'SONG' && (
          <select 
            className="py-1 px-2 bg-black text-white border border-[#333] text-[10px] font-bold outline-none cursor-pointer"
            value={exportLoopCount}
            onChange={e => setExportLoopCount(Number(e.target.value))}
          >
            <option value={1}>1x LOOP</option>
            <option value={2}>2x LOOP</option>
            <option value={4}>4x LOOP</option>
            <option value={8}>8x LOOP</option>
          </select>
        )}
        <button onClick={handleExportWav} disabled={isExporting} className="flex-1 py-1 bg-[#ff0055] text-white font-bold text-[10px] uppercase hover:bg-red-500 transition-colors">
          {isExporting ? 'RENDERING...' : (playMode === 'SONG' ? 'EXPORT FULL SONG HD WAV' : 'EXPORT PATTERN HD WAV')}
        </button>
      </div>

      {/* WAV Recordings section */}
      <div className="border-t border-[#333] pt-1 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Recordings</h3>
          <span className="text-[7px] text-gray-500">({loopCollection.length})</span>
        </div>
        <div className="flex gap-2 overflow-x-auto max-h-[40px] pb-1" style={{ scrollbarWidth: 'thin' }}>
          {loopCollection.length === 0 ? (
            <div className="text-[9px] text-[#444] italic">No recordings yet. Use ⏺ in transport.</div>
          ) : (
            loopCollection.map(loop => (
              <div key={loop.id} className="flex items-center gap-1 text-[9px] p-1 border border-[#333] bg-black shrink-0">
                <span className="font-bold text-white truncate max-w-[100px]" title={loop.name}>{loop.name}</span>
                <button onClick={() => {
                  const a = document.createElement('a'); a.href = loop.url; a.download = loop.name;
                  a.click();
                }} className="text-[#ffcc00] hover:text-white shrink-0 text-[8px]">[DL]</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}