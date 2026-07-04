import React, { useState, useRef, useEffect } from 'react';
import { SCALES, NOTE_NAMES, MICROTONAL_SCALES } from '../AsciiEngine.js';

const SEMITONE_LABELS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NATURAL_KEYS    = [0,2,4,5,7,9,11];

function getSemitones(scale, microScale) {
  if (microScale && MICROTONAL_SCALES[microScale]) return MICROTONAL_SCALES[microScale];
  return SCALES[scale] || SCALES['chromatic'];
}

function getStepIndex(colIdx, dir, len) {
  const c = colIdx % len;
  if (dir === 'forward')  return c;
  if (dir === 'backward') return len - 1 - c;
  if (dir === 'pingpong') { const p = len * 2 - 2; const pos = c % p; return pos < len ? pos : p - pos; }
  return Math.floor(Math.random() * len);
}
function getColIndex(stepIdx, dir, len) {
  const c = stepIdx % len;
  if (dir === 'forward')  return c;
  if (dir === 'backward') return len - 1 - c;
  if (dir === 'pingpong') { const p = len * 2 - 2; const pos = c % p; return pos < len ? pos : p - pos; }
  return c;
}

export default function MicroRoll({
  channelId, patternLen, microNotes = [], layers = [],
  onSetMicroNote, scale, microScale, root,
  patternDir = 'forward', show, isPlaying, currentStep
}) {
  const [slides, setSlides] = useState(new Set());
  const [octaveOffset, setOctaveOffset] = useState(0);
  const scrollRef = useRef(null);

  // Auto-scroll to root note on first render (MUST be before early return for hooks ordering)
  useEffect(() => {
    if (scrollRef.current) {
      const rootRow = scrollRef.current.querySelector('[data-root="true"]');
      if (rootRow) rootRow.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [root, scale, microScale]);

  if (!show) return null;

  const scaleCents  = getSemitones(scale, microScale);
  const rootIdx     = NOTE_NAMES.indexOf(root) >= 0 ? NOTE_NAMES.indexOf(root) : 0;
  const isMicro     = microScale && MICROTONAL_SCALES[microScale];
  const centValues  = isMicro ? scaleCents : scaleCents.map(s => s * 100);

  // Build rows centered on the root note's natural octave (rootOctave = 3)
  const rootMidi      = 48 + rootIdx;
  const rootOctave    = Math.floor(rootMidi / 12); // e.g. 5 for F4=65
  const OCTAVE_RANGE  = 2;
  const baseOctave    = rootOctave - 2 + octaveOffset; // root in middle of 2-octave span

  const rowsData = [];
  for (let oct = baseOctave + 1; oct >= baseOctave; oct--) {
    for (let s = centValues.length - 1; s >= 0; s--) {
      const cents      = centValues[s];
      const semitoneIdx = Math.round((rootIdx * 100 + cents) / 100) % 12;
      const midiNote   = (oct + 1) * 12 + semitoneIdx;
      const octaveNum  = oct;
      const noteName   = `${SEMITONE_LABELS[semitoneIdx]}${octaveNum}`;
      const isRoot     = SEMITONE_LABELS[semitoneIdx] === root;
      const isNatural  = NATURAL_KEYS.includes(semitoneIdx);
      rowsData.push({ midiNote, noteName, isRoot, isNatural, semitoneIdx });
    }
  }

  const activeCol = isPlaying && currentStep !== undefined
    ? getColIndex(currentStep, patternDir, patternLen)
    : -1;

  return (
    <div className="mt-1 pb-2">
      {/* Octave controls */}
      <div className="flex items-center gap-2 px-3 py-1 bg-neutral-950 border border-white/10 rounded-t-sm mb-0.5">
        <button onClick={() => setOctaveOffset(o => Math.max(-3, o - 1))}
          className="w-5 h-5 flex items-center justify-center text-[9px] font-bold cursor-pointer select-none bg-white/5 hover:bg-white/20 rounded text-white/70">
          -
        </button>
        <span className="flex-1 text-center text-[10px] font-mono font-bold tracking-wider text-emerald-400">
          OCT {baseOctave} &ndash; {baseOctave + 1}
        </span>
        <button onClick={() => setOctaveOffset(o => Math.min(3, o + 1))}
          className="w-5 h-5 flex items-center justify-center text-[9px] font-bold cursor-pointer select-none bg-white/5 hover:bg-white/20 rounded text-white/70">
          +
        </button>
      </div>

      <div className="bg-neutral-950 border-y border-r border-emerald-900/30 rounded-r-sm shadow-inner shadow-black overflow-hidden">
        {/* SLIDE ROW */}
        <div className="px-3 py-0.5 border-b border-white/[0.05] bg-neutral-900/40 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-[5px] font-black text-emerald-500 uppercase tracking-widest text-center">SLD</span>
            <div className="flex flex-1 gap-[1px] overflow-x-auto min-w-0 border-l border-r border-white/[0.08] rounded-[2px] bg-black/10">
              {Array.from({ length: patternLen }).map((_, c) => {
                const isSlide = slides.has(c);
                const isBeat  = c % 4 === 0;
                return (
                  <div key={c}
                    onClick={() => { const n = new Set(slides); n.has(c) ? n.delete(c) : n.add(c); setSlides(n); }}
                    className={`w-[18px] min-w-[18px] max-w-[18px] h-5 flex items-center justify-center cursor-pointer transition-colors border-r ${
                      c % 4 === 3 ? 'border-white/[0.06]' : 'border-transparent'
                    } last:border-0 ${
                      isSlide   ? 'bg-emerald-500 text-black'
                      : c === activeCol ? 'bg-white/10'
                      : isBeat  ? 'bg-white/[0.02] hover:bg-white/10'
                      : 'hover:bg-white/5'
                    }`}>
                    <span className="text-[6px] font-bold">{isSlide ? '~' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NOTE ROWS */}
        <div className="overflow-y-auto" ref={scrollRef} style={{ maxHeight: '280px' }}>
          {rowsData.map((row, r) => {
            const { midiNote, noteName, isRoot, isNatural, semitoneIdx } = row;
            const isBlackKey = !isNatural;
            return (
              <div key={r} className="px-3" data-root={isRoot ? 'true' : undefined}>
                <div className="flex items-center gap-2 border-b border-white/[0.025]"
                  style={{ background: isRoot ? 'rgba(52,211,153,0.04)' : isBlackKey ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <span
                    className={`w-4 shrink-0 text-center text-[6px] font-mono font-bold overflow-hidden leading-none ${
                      isRoot ? 'text-emerald-300' : 'text-emerald-600'
                    }`}
                    style={{
                      borderLeft: isRoot ? '2px solid rgba(52,211,153,0.7)' : '1px solid rgba(52,211,153,0.15)',
                    }}
                    title={noteName}>
                    {noteName.substring(0, 3)}
                  </span>
                  <div className="flex flex-1 gap-[1px] border-l border-r border-white/[0.08] rounded-[2px] bg-black/20">
                    {Array.from({ length: patternLen }).map((_, c) => {
                      const si       = getStepIndex(c, patternDir, patternLen);
                      const isActive = microNotes[si] != null && Math.abs(microNotes[si] - midiNote) < 0.001;
                      const isNowCol = c === activeCol;
                      const isBeat   = c % 4 === 0;

                      let isDefault = false;
                      if (!microNotes[si] && layers?.length) {
                        const ch = layers.map(l => l?.[si]).find(ch => ch && ch !== ' ' && ch !== '~' && ch !== '_');
                        if (ch) {
                          if (Math.abs(rootMidi - midiNote) < 0.001) isDefault = true;
                        }
                      }

                      return (
                        <div key={c}
                          onMouseDown={() => onSetMicroNote(channelId, si, isActive ? null : midiNote)}
                          className={`w-[18px] min-w-[18px] max-w-[18px] h-4 cursor-pointer transition-all border-r ${
                            c % 4 === 3 ? 'border-white/[0.06]' : 'border-transparent'
                          } last:border-0`}
                          style={{
                            background: isNowCol ? 'rgba(52,211,153,0.15)' : isActive ? 'rgba(52,211,153,0.35)' : isDefault ? 'rgba(255,204,0,0.2)' : 'transparent',
                            borderBottom: isNowCol ? '2px solid #34d399' : isActive ? '1px solid rgba(52,211,153,0.6)' : 'none'
                          }}
                          title={`Step ${c + 1} (${si + 1}) - ${noteName}`}
                        />
                      );
                    })}
                  </div>
                  {/* Note name on right side */}
                  <span className={`w-[28px] shrink-0 text-[6px] font-mono text-right truncate leading-none ${
                    isRoot ? 'text-emerald-300 font-bold' : 'text-emerald-600'
                  }`}>
                    {noteName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
