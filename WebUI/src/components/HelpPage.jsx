import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TMB from '../data/TMB_DATABASE.json';

function formatParams(obj) {
  if (!obj || Object.keys(obj).length === 0) return '\u2014';
  return Object.entries(obj).map(([k, v]) => {
    const val = typeof v === 'number' ? (v < 0.01 && v > 0 ? v.toExponential(1) : v) : v;
    return `${k}=${val}`;
  }).join(' ');
}

const SYMBOL_ORDER = [
  { label: 'SILENCE', match: c => c === ' ' },
  { label: 'SPATIAL / FX', match: c => ['~','*','"','[',']','^','v','+','?','<','>'].includes(c) },
  { label: 'WAVEFORM STRIKES', match: c => ['.',',','-','_',"'",'X','O','V','I',';',':','!','|'].includes(c) },
  { label: 'NOISE / FM', match: c => ['#','@','%','W','&','$'].includes(c) },
  { label: 'FILTER RAMPS', match: c => ['/','\\'].includes(c) },
  { label: 'LFO / BOX DRAW', match: c => ['\u2554','\u2550','\u255D','\u256C','\u2502','\u2500','\u2514','\u2518','\u250C','\u2510'].includes(c) },
  { label: 'GRANULAR SHADES', match: c => ['\u2591','\u2592','\u2593','\u2588'].includes(c) },
  { label: 'BRAILLE MACROS', match: c => c >= '\u2800' && c <= '\u28FF' },
  { label: 'PERCUSSION KICKS', match: c => ['K','a','e','k','o','u','D'].includes(c) },
  { label: 'PERCUSSION SNARES', match: c => ['S','b','g','j','r','s','z'].includes(c) },
  { label: 'PERCUSSION HATS', match: c => ['N','H','c','h','m','q','w'].includes(c) },
  { label: 'PERCUSSION PERC', match: c => ['C','B','P','d','f','i','l','n','p','t','v','y'].includes(c) },
  { label: 'HELLENIC SYNTHS', match: c => ['\u03B1','\u03B4','\u03C6','\u03A3','\u03B3','\u03C9','\u03C0','\u03C4','w'].includes(c) },
];

export default function HelpPage({ asciiDict, selectedChar, onSelectChar, onPreview }) {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const symbols = TMB.symbols || {};
  const domains = TMB.domains || {};

  return (
    <div className="flex flex-1 h-[calc(100vh-100px)] border-t border-[rgba(255,204,0,0.2)] bg-[#050505] text-[#ffcc00] font-mono">
      {/* Left Area - Reference Manual */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold crt-glow mb-6 border-b border-[rgba(255,204,0,0.3)] pb-2">
          ASCII_DAW // SYSTEM_MANUAL.TXT
        </h2>
        
        <div className="grid grid-cols-2 gap-6 text-xs leading-relaxed">
          
          <section className="col-span-2 border border-[rgba(255,204,0,0.3)] p-4 bg-[rgba(255,204,0,0.02)]">
            <h3 className="text-sm font-bold crt-glow mb-3">SIGNAL FLOW_ARCHITECTURE</h3>
            <div className="flex items-center gap-3 text-[10px] flex-wrap font-bold tracking-wider">
              <span className="border border-[#ffcc00] px-3 py-2 bg-black">PATTERN GRID</span><span className="crt-dim animate-pulse">{'>>'}</span>
              <span className="border border-[#ffcc00] px-3 py-2 bg-black">AFFINITY (PITCH/SCALE)</span><span className="crt-dim animate-pulse">{'>>'}</span>
              <span className="border border-[#ffcc00] px-3 py-2 bg-black">CHARACTER DSP (60+ TYPES)</span><span className="crt-dim animate-pulse">{'>>'}</span>
              <span className="border border-[#ffcc00] px-3 py-2 bg-black">CHANNEL MIXER</span><span className="crt-dim animate-pulse">{'>>'}</span>
              <span className="border border-[#ffcc00] px-3 py-2 bg-black">MASTER FX</span><span className="crt-dim animate-pulse">{'>>'}</span>
              <span className="border border-[#ffcc00] px-3 py-2 bg-[#ffcc00] text-black crt-glow">OUTPUT_BUS</span>
            </div>
          </section>

          <section className="border border-[rgba(255,204,0,0.3)] p-4">
            <h3 className="font-bold crt-glow mb-3 text-sm">INTERFACE_CONTROLS</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">Click cell</span> <span className="text-[rgba(255,204,0,0.8)]">Focus + paste active brush</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">Type</span> <span className="text-[rgba(255,204,0,0.8)]">Paste typed char into focused cell</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">Backspace</span> <span className="text-[rgba(255,204,0,0.8)]">Erase focused cell</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">Escape</span> <span className="text-[rgba(255,204,0,0.8)]">Unfocus grid</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">Right-click</span> <span className="text-[rgba(255,204,0,0.8)]">Radial char browser + context menu</span></li>
            </ul>
          </section>

          <section className="border border-[rgba(255,204,0,0.3)] p-4">
            <h3 className="font-bold crt-glow mb-3 text-sm">TRANSPORT_AND_GLOBAL</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">PLAY/STOP</span> <span className="text-[rgba(255,204,0,0.8)]">Toggle master playback engine</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">BPM</span> <span className="text-[rgba(255,204,0,0.8)]">Global tempo (default 145)</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">[+NODE]</span> <span className="text-[rgba(255,204,0,0.8)]">Initialize new sequencer channel</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">[DENSITY]</span> <span className="text-[rgba(255,204,0,0.8)]">Matrix symbol density browser</span></li>
              <li className="flex items-start gap-2"><span className="border border-[#ffcc00] px-1 bg-black shrink-0 w-24 text-center">AFFINITY</span> <span className="text-[rgba(255,204,0,0.8)]">Root note, scale, and gate config</span></li>
            </ul>
          </section>

          <section className="col-span-2 border border-[rgba(255,204,0,0.3)] p-4 bg-[rgba(255,204,0,0.02)]">
            <h3 className="font-bold crt-glow mb-3 text-sm">PARAM_OVERRIDES_MAP</h3>
            <p className="text-[10px] text-[rgba(255,204,0,0.6)] mb-3">Accessible via Context Menu (Right-Click on Cell) or Sound Design Panel.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">decay</span><span className="text-[rgba(255,204,0,0.7)]">Envelope release time</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">attack</span><span className="text-[rgba(255,204,0,0.7)]">Envelope attack time</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">cutoff</span><span className="text-[rgba(255,204,0,0.7)]">Lowpass filter cutoff Hz</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">resonance</span><span className="text-[rgba(255,204,0,0.7)]">Filter Q / Peak</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">distortion</span><span className="text-[rgba(255,204,0,0.7)]">Wavefolder drive amount</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">pan</span><span className="text-[rgba(255,204,0,0.7)]">Stereo field position (-1 to 1)</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">velocity</span><span className="text-[rgba(255,204,0,0.7)]">Note amplitude (0 to 1)</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">tune</span><span className="text-[rgba(255,204,0,0.7)]">Pitch offset multiplier</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">gate</span><span className="text-[rgba(255,204,0,0.7)]">Gate length % of step</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">ratchet</span><span className="text-[rgba(255,204,0,0.7)]">Subdivision bursts (1-4)</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">delaySend</span><span className="text-[rgba(255,204,0,0.7)]">Send to FX1 (Delay)</span></div>
              <div className="flex flex-col border-b border-[rgba(255,204,0,0.1)] pb-1"><span className="font-bold text-[#ffcc00]">reverbSend</span><span className="text-[rgba(255,204,0,0.7)]">Send to FX2 (Reverb)</span></div>
            </div>
          </section>

          <section className="col-span-2 border border-[rgba(255,204,0,0.3)] p-4">
            <h3 className="font-bold crt-glow mb-3 text-sm">MATH_SANDBOX // COMPILER_SYNTAX</h3>
            <p className="text-[10px] text-[rgba(255,204,0,0.6)] mb-3">Syntax rules for the custom DSP Sandbox compiler. The compiler is auto-correcting (Dumb-Proof) and will automatically balance brackets and pad dangling operators with zero.</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-[11px] font-bold text-[#00ff66] mb-2">VALID EXAMPLES</h4>
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="bg-black p-2 border border-[rgba(0,255,100,0.3)]">
                    <span className="text-[rgba(255,204,0,0.5)]">// Simple Sub Bass</span><br/>
                    <span className="text-green-400">sin</span>(<span className="text-blue-400">2 * pi * f * t</span>)
                  </div>
                  <div className="bg-black p-2 border border-[rgba(0,255,100,0.3)]">
                    <span className="text-[rgba(255,204,0,0.5)]">// FM Synthesis</span><br/>
                    <span className="text-green-400">sin</span>(<span className="text-blue-400">2 * pi * f * t</span> <span className="text-white">+</span> <span className="text-purple-400">3 * sin(2 * pi * f * 2 * t)</span>)
                  </div>
                  <div className="bg-black p-2 border border-[rgba(0,255,100,0.3)]">
                    <span className="text-[rgba(255,204,0,0.5)]">// Bouncing Decay Pattern</span><br/>
                    <span className="text-green-400">bounce</span>(<span className="text-orange-400">t</span>, <span className="text-green-300">10</span>, <span className="text-green-300">2</span>) <span className="text-white">*</span> <span className="text-green-400">saw</span>(<span className="text-blue-400">2 * pi * f * t</span>)
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-red-500 mb-2">AUTO-REPAIR SYSTEM</h4>
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="bg-black p-2 border border-[rgba(255,0,0,0.3)]">
                    <span className="text-red-400">Input: </span> <span className="text-white">sin(2 * pi * f * t</span><br/>
                    <span className="text-green-400">Repaired: </span> <span className="text-white">sin(2 * pi * f * t</span><span className="text-red-500 font-bold">)</span>
                  </div>
                  <div className="bg-black p-2 border border-[rgba(255,0,0,0.3)]">
                    <span className="text-red-400">Input: </span> <span className="text-white">saw(2 * pi * f * t) * </span><br/>
                    <span className="text-green-400">Repaired: </span> <span className="text-white">saw(2 * pi * f * t) * </span><span className="text-red-500 font-bold">0</span>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-[rgba(255,204,0,0.8)]">
                  The <span className="text-green-400 font-bold">GREEN</span>, <span className="text-yellow-400 font-bold">YELLOW</span>, and <span className="text-blue-400 font-bold">BLUE</span> color coding inside the sandbox denotes: Core variables/constants, Math Modifiers, and Operators respectively.
                </p>
              </div>
            </div>
          </section>

          <section className="col-span-2 border border-[rgba(255,204,0,0.3)] p-4 bg-[rgba(255,204,0,0.02)]">
            <h3 className="font-bold crt-glow mb-3 text-sm">TMB 3-LAYER NOTATION — FULL GLOSSARY</h3>
            <p className="text-[10px] text-[rgba(255,204,0,0.6)] mb-3">
              Every symbol placed on the grid has three domain definitions (T/M/B). 
              During playback, all 3 layers at the current step are read together. 
              The MID layer is the trigger gate — if mid is empty, the step is silent. 
              Each symbol contributes only its relevant domain params depending on which layer it sits in.
              <span className="block mt-1">Total symbols: <span className="font-bold text-[#ffcc00]">{Object.keys(symbols).length}</span></span>
            </p>
            <div className="grid grid-cols-3 gap-4 text-[10px] mb-4">
              <div className="border border-blue-800 bg-blue-950/20 p-3 rounded">
                <div className="text-blue-400 font-bold text-sm mb-2">TOP (T) — {domains.t || 'Spatial / Routing'}</div>
                <div className="space-y-1 text-[rgba(255,204,0,0.7)]">
                  {(TMB.domainKeys?.t || []).map(k => (
                    <div key={k}><span className="text-blue-300">{k}</span></div>
                  ))}
                </div>
              </div>
              <div className="border border-green-800 bg-green-950/20 p-3 rounded">
                <div className="text-green-400 font-bold text-sm mb-2">MID (M) — {domains.m || 'Source / Timbre'}</div>
                <div className="space-y-1 text-[rgba(255,204,0,0.7)]">
                  {(TMB.domainKeys?.m || []).map(k => (
                    <div key={k}><span className="text-green-300">{k}</span></div>
                  ))}
                </div>
              </div>
              <div className="border border-orange-800 bg-orange-950/20 p-3 rounded">
                <div className="text-orange-400 font-bold text-sm mb-2">BOTTOM (B) — {domains.b || 'Texture / Envelope'}</div>
                <div className="space-y-1 text-[rgba(255,204,0,0.7)]">
                  {(TMB.domainKeys?.b || []).map(k => (
                    <div key={k}><span className="text-orange-300">{k}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* FULL GLOSSARY — collapsible sections by category */}
            <div className="text-[10px]">
              {SYMBOL_ORDER.map(({ label, match }) => {
                const matched = Object.entries(symbols).filter(([c]) => match(c));
                if (matched.length === 0) return null;
                const secId = 'glossary_' + label.replace(/\s+/g, '_');
                const isOpen = openSections[secId] === true;
                return (
                  <div key={label} className="mb-1 border border-[rgba(255,204,0,0.15)]">
                    <div 
                      onClick={() => toggleSection(secId)}
                      className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[rgba(255,204,0,0.08)] bg-[rgba(255,204,0,0.03)]"
                    >
                      <span className="font-mono">{isOpen ? 'v' : '>'}</span>
                      <span className="font-bold text-[#ffcc00]">{label}</span>
                      <span className="crt-dim opacity-50 ml-auto">({matched.length})</span>
                    </div>
                    {isOpen && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[8px] border-collapse">
                          <thead>
                            <tr className="border-b border-[rgba(255,204,0,0.15)] bg-[rgba(255,204,0,0.05)]">
                              <th className="text-left p-1 w-6">Char</th>
                              <th className="text-left p-1 text-blue-400">T (Top)</th>
                              <th className="text-left p-1 text-green-400">M (Mid)</th>
                              <th className="text-left p-1 text-orange-400">B (Bot)</th>
                              <th className="text-left p-1 crt-dim">Desc</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matched.map(([char, data]) => (
                              <tr key={char} className="border-b border-[rgba(255,204,0,0.05)] hover:bg-[rgba(255,204,0,0.05)]">
                                <td className="p-1 font-bold text-xs text-center">{char === ' ' ? '\u2423' : char}</td>
                                <td className="p-1 text-blue-300 max-w-[140px] truncate" title={formatParams(data.t)}>{formatParams(data.t)}</td>
                                <td className="p-1 text-green-300 max-w-[140px] truncate" title={formatParams(data.m)}>{formatParams(data.m)}</td>
                                <td className="p-1 text-orange-300 max-w-[140px] truncate" title={formatParams(data.b)}>{formatParams(data.b)}</td>
                                <td className="p-1 crt-dim max-w-[120px] truncate" title={data.desc}>{data.desc || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-[10px] text-[rgba(255,204,0,0.5)]">
              Stacking: <span className="text-[#ffcc00]">T + M + B</span> at each step. 
              MID layer gates the note. If M has <span className="text-green-300">type</span> (percussion) it plays verbatim.
              Otherwise merged with channel type defaults.
            </div>
          </section>

        </div>
      </div>

      {/* Right Area - DSP Dictionary */}
      <Sidebar asciiDict={asciiDict} selectedChar={selectedChar} onSelectChar={onSelectChar} onPreview={onPreview} />
    </div>
  );
}