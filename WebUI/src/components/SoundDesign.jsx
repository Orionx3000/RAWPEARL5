import React, { useState, useRef, useEffect } from 'react';
import { ASCII_DICTIONARY, CHAR_PARAMS_DICT, CHAR_PARAM_RANGES } from '../AsciiEngine.js';

const CAT_COLORS = {
  pluck:'#00ffcc',tick:'#ffcc00',drone:'#ff66aa',sub:'#ff0055',blip:'#88ff88',pad:'#aa00ff',
  staccato:'#ffaa00',explosive:'#ff4444',samplehold:'#44aaff',fmlfo:'#ff8800',noise:'#ffffff',
  granular:'#ff00ff',chord:'#00ff88',sweep:'#88ddff',lfo:'#ffdd00',gate:'#ff66ff',
  metallic:'#aadd00',pulse:'#00ccff'
};

const PARAM_GROUPS = {
  timbre:     ['model','fmAmount','distortion','noiseMix','wavefold'],
  morphology: ['attack','decay','sustain','release','gate','velocity','chance','ratchet','tie','slide'],
  brightness: ['cutoff','resonance','highpass','tilt','spread'],
  routing:    ['pan','delaySend','reverbSend','tune','arp','glitch']
};

const GROUP_LABELS = { timbre:'TMBR', morphology:'MRPH', brightness:'BRGH', routing:'RTE' };
const GROUP_COLORS = { timbre:'#ff66aa', morphology:'#00ffcc', brightness:'#ffcc00', routing:'#d946ef' };

const PARAM_LABELS = {
  attack:'ATK', decay:'DEC', sustain:'SUS', release:'REL', gate:'GATE',
  velocity:'VEL', cutoff:'CUT', resonance:'RES', highpass:'HIP', distortion:'DST',
  pan:'PAN', delaySend:'DEL', reverbSend:'REV', tune:'TUNE', model:'MOD',
  fmAmount:'FMA', noiseMix:'NOI', wavefold:'WFL', chance:'CHN', ratchet:'RTC',
  tie:'TIE', slide:'SLD', tilt:'TLT', spread:'SPR', arp:'ARP', glitch:'GLT'
};

const PARAM_HINT = {
  attack:'attack time', decay:'decay time', sustain:'sustain level', release:'fade out',
  gate:'note gate', velocity:'hit force', cutoff:'filter freq', resonance:'filter ring',
  highpass:'low cut', distortion:'saturation', pan:'stereo pos', delaySend:'delay wet',
  reverbSend:'reverb wet', tune:'pitch offset', model:'engine', fmAmount:'fm depth',
  noiseMix:'noise blend', wavefold:'fold', chance:'probability', ratchet:'repeat count',
  tie:'legato', slide:'portamento', tilt:'tone shift', spread:'stereo width',
  arp:'arpeggio', glitch:'stutter'
};

function ParamSlider({ label, value, min, max, step, onChange, color }) {
  const showVal = step >= 1 ? Number(value).toFixed(0) : Number(value).toFixed(2);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-1.5 h-5">
      <span className="w-[22px] text-[9px] font-bold text-right font-mono tracking-tight shrink-0" style={{ color: color || '#ffcc00' }}>{showVal}</span>
      <div className="relative flex-1" style={{ maxWidth: 80 }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-[3px] rounded-sm cursor-ns-resize accent-[#ffcc00]"
          style={{ background: `linear-gradient(to right, ${color}88 ${pct}%, rgba(255,255,255,0.06) ${pct}%)` }} />
      </div>
      <span className="text-[8px] font-mono crt-dim uppercase tracking-wider shrink-0 w-[18px]"
        title={PARAM_HINT[label] || label}>{PARAM_LABELS[label] || label}</span>
    </div>
  );
}

function CharModule({ char, entry, params, onParamChange, onPreview, isSelected }) {
  const catColor = CAT_COLORS[entry.type] || '#ffcc00';
  const paramKeys = CHAR_PARAMS_DICT[entry.type] || ['decay','cutoff','resonance','velocity'];

  const grouped = {};
  Object.keys(PARAM_GROUPS).forEach(g => { grouped[g] = paramKeys.filter(k => PARAM_GROUPS[g].includes(k)); });

  return (
    <div className={`border overflow-hidden transition-all duration-150 ${isSelected ? 'border-[#ffcc00]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'}`}
      style={{ boxShadow: isSelected
        ? `inset 0 0 20px ${catColor}11, 0 0 8px ${catColor}33`
        : `inset 0 0 15px rgba(0,0,0,0.6), 0 0 3px ${catColor}11` }}>
      {/* CRT Header */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: `${catColor}08` }}>
        <button onClick={() => onPreview(char)}
          className="w-6 h-6 text-xs font-bold flex items-center justify-center border cursor-pointer hover:brightness-125 transition-all shrink-0"
          style={{ borderColor: `${catColor}66`, color: catColor, textShadow: `0 0 4px ${catColor}` }}>
          {char}
        </button>
        <span className="flex-1 text-[8px] font-bold truncate" style={{ color: catColor }}>{entry.desc || entry.type}</span>
        <span className="text-[6px] font-mono crt-dim">{entry.type || ''}</span>
      </div>

      {/* Params grid */}
      <div className="px-2 py-1.5">
        {Object.entries(grouped).map(([g, keys]) => {
          const active = keys.filter(k => CHAR_PARAM_RANGES[k]);
          if (active.length === 0) return null;
          // Split into two columns
          const mid = Math.ceil(active.length / 2);
          const leftCol = active.slice(0, mid);
          const rightCol = active.slice(mid);
          return (
            <div key={g} className="mb-1.5 last:mb-0">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-[2px] h-2 rounded-full shrink-0" style={{ background: GROUP_COLORS[g] }}></div>
                <span className="text-[7px] font-bold tracking-widest uppercase" style={{ color: GROUP_COLORS[g] }}>{GROUP_LABELS[g]}</span>
                <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-x-1">
                <div className="flex flex-col gap-[1px]">
                  {leftCol.map(k => {
                    const r = CHAR_PARAM_RANGES[k];
                    if (!r) return null;
                    return <ParamSlider key={k} label={k} value={params?.[k] ?? r.default}
                      min={r.min} max={r.max} step={r.step} onChange={(v) => onParamChange(char, k, v)} color={GROUP_COLORS[g]} />;
                  })}
                </div>
                <div className="flex flex-col gap-[1px]">
                  {rightCol.map(k => {
                    const r = CHAR_PARAM_RANGES[k];
                    if (!r) return null;
                    return <ParamSlider key={k} label={k} value={params?.[k] ?? r.default}
                      min={r.min} max={r.max} step={r.step} onChange={(v) => onParamChange(char, k, v)} color={GROUP_COLORS[g]} />;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-2 py-0.5 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.3)' }}>
        <span className="text-[6px] font-mono text-white/20">U+{char.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0')}</span>
        <span className="text-[6px] font-mono text-white/10 flex-1 truncate">
          {params?.decay ? `exp(-${(1/(params.decay||0.5)).toFixed(1)}t)` : params?.cutoff ? `${Math.round(params.cutoff)}Hz` : ''}
        </span>
      </div>
    </div>
  );
}

export default function SoundDesign({ characterParams, onParamChange, onPreview, channels, selectedChannelId, onUpdateChannel, selectedChar, onSelectChar }) {
  const [filter, setFilter] = useState('all');
  const types = [...new Set(Object.values(ASCII_DICTIONARY).map(e => e.type || 'modifier'))].sort();
  const selectedCh = (channels && selectedChannelId) ? channels.find(c => c.id === selectedChannelId) : null;
  const entries = Object.entries(ASCII_DICTIONARY).filter(([ch, e]) => filter === 'all' || (e.type || 'modifier') === filter);
  const charRefs = useRef({});
  useEffect(() => {
    if (selectedChar && charRefs.current[selectedChar]) {
      charRefs.current[selectedChar].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedChar]);

  return (
    <div className="flex-1 overflow-auto" style={{ background: '#080808' }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.5) 1px, rgba(0,0,0,0.5) 2px)' }}></div>

      <div className="p-2.5 flex flex-col gap-2.5">
        {/* Channel overrides section */}
        {selectedCh && ASCII_DICTIONARY[selectedCh.type] && (
          <div className="border overflow-hidden" style={{ borderColor: 'rgba(0,255,204,0.25)' }}>
            <div className="flex items-center gap-2 px-2 py-1 border-b" style={{ borderColor: 'rgba(0,255,204,0.1)', background: 'rgba(0,255,204,0.03)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" style={{ boxShadow: '0 0 4px #00ffcc' }}></div>
              <span className="text-[9px] font-bold text-[#00ffcc] tracking-wider">CH.{selectedCh.name || selectedCh.id}</span>
              <span className="text-[7px] text-white/30">overrides</span>
            </div>
            <div className="p-2">
              <CharModule char={selectedCh.type} entry={ASCII_DICTIONARY[selectedCh.type]}
                params={{ ...(characterParams[selectedCh.type] || {}), ...(selectedCh.params || {}) }}
                onParamChange={(char, k, v) => onUpdateChannel(selectedCh.id, { params: { ...(selectedCh.params || {}), [k]: v } })}
                onPreview={(c) => onPreview(c, { ...(characterParams[selectedCh.type] || {}), ...(selectedCh.params || {}) })} />
            </div>
          </div>
        )}

        {/* Dictionary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] crt-dim font-bold tracking-wider">DICT</span>
            <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="bg-black border text-[#ffcc00] text-[8px] font-mono px-1 py-0.5 outline-none cursor-pointer"
              style={{ borderColor: 'rgba(255,204,0,0.25)' }}>
              <option value="all">ALL ({Object.keys(ASCII_DICTIONARY).length})</option>
              {types.map(t => (<option key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {entries.map(([char, entry]) => (
              <div key={char} ref={el => charRefs.current[char] = el}
                onClick={() => onSelectChar(char)}
                className={`cursor-pointer transition-all ${selectedChar === char ? 'opacity-100' : 'opacity-60 hover:opacity-85'}`}>
                <CharModule char={char} entry={entry} params={characterParams[char]}
                  onParamChange={onParamChange} onPreview={(c) => onPreview(c, characterParams[c])}
                  isSelected={selectedChar === char} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
