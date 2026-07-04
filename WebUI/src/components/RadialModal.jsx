import React from 'react';
import { ASCII_DICTIONARY } from '../AsciiEngine.js';

export default function RadialModal({ ctxMenu, onClose, onSetChar, onSetStepParam, stepOverrides, characterParams, asciiDict, asciiDictionary }) {
  const dict = asciiDict || {};
  const fullDict = asciiDictionary || {};

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-black border-2 border-[#ffcc00] p-6 max-w-lg max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold crt-glow">
            STEP [{ctxMenu.stepIdx}] · L{ctxMenu.layerIdx} · NODE [{ctxMenu.nodeIdx}]
            {ctxMenu.char !== ' ' ? ` · '${ctxMenu.char}'` : ' · EMPTY'}
          </span>
          <button onClick={onClose} className="border border-[#ffcc00] px-2 py-0 text-xs hover:bg-[#ffcc00] hover:text-black">[X]</button>
        </div>
        <div className="flex flex-col items-center mb-4">
          <div className="text-[10px] crt-dim mb-2">ASCII BROWSER</div>
          <div className="relative" style={{ width: 320, height: 320 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#ffcc00] flex items-center justify-center bg-black crt-glow">
                <span className="text-2xl font-bold">{ctxMenu.char === ' ' ? '_' : ctxMenu.char}</span>
              </div>
            </div>
            {Object.entries(dict).map(([cat, items], catIdx) => {
              const angle = (catIdx / Object.keys(dict).length) * 360 - 90;
              const catRad = (angle * Math.PI) / 180;
              return (
                <div key={cat}>
                  <div className="absolute text-[8px] crt-dim font-bold uppercase"
                    style={{ left: 160 + Math.cos(catRad) * 60 - 12, top: 160 + Math.sin(catRad) * 60 - 10 }}>
                    {cat}
                  </div>
                  {items.map((item, chIdx) => {
                    const total = Object.keys(dict).length;
                    const chAngle = angle + ((chIdx - (items.length - 1) / 2)) * (360 / total / items.length);
                    const chRad = (chAngle * Math.PI) / 180;
                    return (
                      <button key={item.char} onClick={() => onSetChar(item.char)}
                        className={`absolute w-[22px] h-[22px] text-xs border flex items-center justify-center cursor-pointer z-20
                          ${ctxMenu.char === item.char ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'border-[rgba(255,204,0,0.3)] hover:border-[#ffcc00] hover:bg-[rgba(255,204,0,0.1)]'}`}
                        style={{ left: 160 + Math.cos(chRad) * 110 - 11, top: 160 + Math.sin(chRad) * 110 - 11 }}
                        title={item.desc}>
                        {item.char}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <button onClick={() => onSetChar(' ')}
              className={`absolute w-[22px] h-[22px] text-[10px] border flex items-center justify-center cursor-pointer z-20 ${ctxMenu.char === ' ' ? 'bg-red-600 text-white border-red-600' : 'border-red-800 text-red-400 hover:border-red-500'}`}
              style={{ left: 160 + Math.cos((-90 * Math.PI) / 180) * 85 - 11, top: 160 + Math.sin((-90 * Math.PI) / 180) * 85 - 11 }} title="Erase">
              _
            </button>
          </div>
          <div className="w-full mt-3 border-t border-[rgba(255,204,0,0.2)] pt-3">
            <div className="text-[10px] crt-dim mb-2">FULL DICT ({Object.keys(fullDict).length} types)</div>
            <div className="flex flex-wrap gap-[3px] justify-center">
              {(() => {
                const paletteChars = new Set();
                Object.values(dict).forEach(items => items.forEach(i => paletteChars.add(i.char)));
                return Object.keys(fullDict).filter(ch => !paletteChars.has(ch)).sort().map(ch => (
                  <button key={ch} onClick={() => onSetChar(ch)}
                    className={`w-[20px] h-[20px] text-[11px] border flex items-center justify-center cursor-pointer
                      ${ctxMenu.char === ch ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'border-[rgba(255,204,0,0.25)] hover:border-[#ffcc00] hover:bg-[rgba(255,204,0,0.1)]'}`}
                    title={`'${ch}' → ${fullDict[ch]?.type}`}>
                    {ch}
                  </button>
                ));
              })()}
            </div>
          </div>
          
          <div className="w-full mt-3 border-t border-[rgba(255,204,0,0.2)] pt-3">
            <div className="text-[10px] font-bold text-[#d946ef] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#d946ef] rounded-full animate-pulse"></span>
              NESTED EQUATION [ALGEBRA MATRIX]
            </div>
            <textarea 
              value={(stepOverrides[`${ctxMenu.chId}_${ctxMenu.layerIdx}_${ctxMenu.stepIdx}`] || {}).equation || ''}
              onChange={(e) => onSetStepParam(ctxMenu.chId, ctxMenu.layerIdx, ctxMenu.stepIdx, 'equation', e.target.value)}
              placeholder="e.g. sin(2*pi*f*t) * decay * α(t,f)"
              className="w-full bg-black border border-[#d946ef] text-[#d946ef] text-[10px] p-2 font-mono outline-none focus:border-[#ffcc00] focus:text-[#ffcc00] transition-colors"
              rows={2}
            />
            <div className="text-[8px] crt-dim mt-1">Providing an equation bypasses the dictionary DSP and compiles live math for this step.</div>
          </div>
        </div>
        {ctxMenu.char !== ' ' && (
          <div className="border-t border-[rgba(255,204,0,0.2)] pt-3">
            <div className="text-[10px] crt-dim mb-2">PARAM OVERRIDES</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
              {['attack','decay','sustain','release','gate','velocity','cutoff','resonance','distortion','highpass','pan','delaySend','reverbSend','tune','model','fmAmount','noiseMix','wavefold','chance','tie','slide','arp','ratchet','tilt','spread'].map(p => {
                const k = `${ctxMenu.chId}_${ctxMenu.layerIdx}_${ctxMenu.stepIdx}`;
                const o = stepOverrides[k] || {};
                const base = characterParams[ctxMenu.char] || {};
                const val = o[p] !== undefined ? o[p] : base[p] !== undefined ? base[p] : 0.8;
                const ranges = { velocity: [0,1,0.05], decay: [0.01,1,0.01], cutoff: [100,12000,10], resonance: [0,20,0.5], distortion: [0,100,1], pan: [-1,1,0.05], delaySend: [0,1,0.05], reverbSend: [0,1,0.05], tune: [20,120,1], gate: [0.05,1,0.05], sustain: [0,1,0.05], release: [0.1,4,0.1], ratchet: [1,8,1], attack: [0.001,2,0.01], model: [1,100,1], fmAmount: [0,1000,10], noiseMix: [0,1,0.05], wavefold: [0,1,0.05], chance: [0,1,0.05], tie: [0,1,1], slide: [0,1,1], arp: [0,4,1], highpass: [20,20000,100], tilt: [-1,1,0.05], spread: [0,1,0.05] };
                const [min, max, step] = ranges[p] || [0,1,0.05];
                return (
                  <div key={p} className="flex items-center gap-1">
                    <span className="w-10 crt-dim uppercase">{p}</span>
                    <input type="range" min={min} max={max} step={step} value={val}
                      onChange={(e) => onSetStepParam(ctxMenu.chId, ctxMenu.layerIdx, ctxMenu.stepIdx, p, parseFloat(e.target.value))}
                      className="flex-1 accent-[#ffcc00]" style={{ height: 8 }} />
                    <span className="w-6 text-right">{step < 1 ? Number(val).toFixed(2) : Number(val).toFixed(0)}</span>
                    {o[p] !== undefined && (
                      <button onClick={() => onSetStepParam(ctxMenu.chId, ctxMenu.layerIdx, ctxMenu.stepIdx, p, undefined)}
                        className="text-red-400 hover:text-red-200 text-[8px]">[R]</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
