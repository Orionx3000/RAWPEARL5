import React from 'react';

export default function Grid({ nodes, isPlaying, currentStep, focusedCell, onCellClick, onCellContextMenu, onRenameNode, onRemoveNode, onSetNodeVol }) {
  return (
    <main className="flex-1 p-6 overflow-auto border-r-2 crt-border">
      <div className="mb-4 flex justify-between crt-dim text-sm">
        <span>// MACRO-CANVAS :: 3-LAYER TRUE ASCII DEPTH</span>
        <span>CLICK GRID TO INJECT</span>
      </div>
      <div className="flex flex-col gap-8">
        {nodes.map((node, nIdx) => (
          <div key={node.id} className="relative">
            <div className="absolute -left-2 -top-4 text-xs font-bold crt-glow bg-black px-2 flex items-center gap-2">
              <span contentEditable suppressContentEditableWarning onBlur={(e) => onRenameNode(node.id, e.target.textContent)}>
                [{node.name}]
              </span>
              <span className="crt-dim text-[10px] cursor-pointer hover:text-red-400" onClick={() => onRemoveNode(node.id)}>[X]</span>
            </div>
            <div className="border border-[#ffcc00] p-4 bg-[rgba(255,204,0,0.05)] pt-6">
              {node.layers.map((layer, lIdx) => (
                <div key={lIdx} className="flex">
                  <div className="w-8 shrink-0 flex items-center justify-center border-r border-[#ffcc00] mr-4 crt-dim font-bold">
                    {lIdx === 0 ? 'T' : lIdx === 1 ? 'M' : 'B'}
                  </div>
                  <div className="flex flex-1" style={{ gap: 0 }}>
                    {layer.map((char, sIdx) => {
                      const isActive = isPlaying && currentStep === sIdx;
                      const isFocused = focusedCell && focusedCell.nodeIdx === nIdx && focusedCell.layerIdx === lIdx && focusedCell.stepIdx === sIdx;
                      return (
                        <div key={sIdx}
                          onClick={() => onCellClick(nIdx, lIdx, sIdx)}
                          onContextMenu={(e) => onCellContextMenu(e, nIdx, lIdx, sIdx)}
                          className="w-[22px] min-w-[22px] h-8 text-center cursor-crosshair text-sm select-none border-r border-[rgba(255,204,0,0.1)] last:border-0 hover:bg-[rgba(255,204,0,0.2)] flex items-center justify-center overflow-hidden"
                          style={isActive ? { backgroundColor: '#ffcc00', color: 'black', fontWeight: 'bold' } : isFocused ? { boxShadow: 'inset 0 0 0 1px #ffcc00', backgroundColor: 'rgba(255,204,0,0.15)' } : {}}>
                          {char === ' ' ? <span className="opacity-10 text-xs leading-none">.</span> : <span className="leading-none">{char}</span>}
                          {isFocused && <span className="absolute w-[1px] h-4 bg-[#ffcc00] animate-pulse" style={{ marginLeft: char === ' ' ? -3 : 6 }}></span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-16 shrink-0 flex items-center justify-end ml-2 crt-dim text-[10px] gap-1">
                    <span>V:{Math.round((node.vol || 0.8) * 100)}</span>
                    <span className="cursor-pointer hover:text-[#ffcc00]" onClick={() => {
                      const v = prompt('Volume (0-200):', String(Math.round((node.vol || 0.8) * 100)));
                      if (v !== null) onSetNodeVol(node.id, Math.max(0, Math.min(200, parseInt(v) || 80)) / 100);
                    }}>±</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
