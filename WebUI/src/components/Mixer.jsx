import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function VKnob({ value, min, max, step, onChange, size = 28, color = '#ffcc00', label = '' }) {
  const ref = useRef(null);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + pct * 270;

  const handleDown = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = value;
    const range = max - min;
    const move = (me) => {
      const delta = (startY - me.clientY) * range / 200;
      const v = Math.max(min, Math.min(max, startVal + delta));
      onChange(Math.round(v / step) * step);
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [min, max, step, onChange, value]);

  const tickMarks = [];
  const tickCount = 7;
  for (let i = 0; i < tickCount; i++) {
    const ta = -135 + (i / (tickCount - 1)) * 270;
    const rad = (ta * Math.PI) / 180;
    const rOuter = size / 2 - 2;
    const rInner = size / 2 - 5;
    const x1 = size / 2 + Math.cos(rad) * rInner;
    const y1 = size / 2 + Math.sin(rad) * rInner;
    const x2 = size / 2 + Math.cos(rad) * rOuter;
    const y2 = size / 2 + Math.sin(rad) * rOuter;
    tickMarks.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" opacity="0.3" />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      {label && <span style={{ fontSize: 6, color: 'rgba(255,204,0,0.4)', letterSpacing: 1 }}>{label}</span>}
      <div ref={ref} onMouseDown={handleDown}
        style={{
          width: size, height: size, position: 'relative', cursor: 'ns-resize',
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, #222, #0a0a0a)`,
          border: `1px solid ${color}44`,
          boxShadow: `0 0 4px ${color}22, inset 0 0 6px rgba(0,0,0,0.8)`,
        }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {tickMarks}
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 3, height: '40%',
          background: color,
          transformOrigin: '50% 100%',
          transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          borderRadius: 1,
          boxShadow: `0 0 4px ${color}`,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 4, height: 4,
          background: '#111',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
      </div>
      <span style={{ fontSize: 6, color: 'rgba(255,204,0,0.5)', fontFamily: 'monospace', marginTop: 1 }}>
        {typeof value === 'number' ? (value >= 0 ? value.toFixed(value > 10 ? 0 : 1) : value.toFixed(1)) : value}
      </span>
    </div>
  );
}

function VMeter({ level, height = 60, color = '#ffcc00', peak = false }) {
  const pct = Math.max(0, Math.min(1, level || 0));
  const warn = pct > 0.75;
  const clip = pct > 0.95;

  return (
    <div style={{
      width: 8, height, position: 'relative',
      background: '#080808', border: '1px solid rgba(255,204,0,0.1)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: `${pct * 100}%`,
        background: clip ? '#ff0044' : warn
          ? `linear-gradient(to top, ${color}, #ff8800 80%, #ff0044)`
          : `linear-gradient(to top, ${color}66, ${color}22)`,
        transition: 'height 0.06s linear',
        boxShadow: clip ? '0 0 8px #ff0044' : 'none',
      }} />
    </div>
  );
}

function ChannelStrip({ ch, isPlaying, onSetChannel, stripIndex, isHit }) {
  const chColor = ch.color || '#ffcc00';
  const chLabel = ch.name || 'CH';

  return (
    <div style={{
      width: 114, minWidth: 114,
      border: '1px solid rgba(255,204,0,0.15)',
      borderLeft: `3px solid ${chColor}`,
      borderRadius: 3,
      background: `linear-gradient(180deg, ${chColor}06, #050505 20%)`,
      display: 'flex', flexDirection: 'column',
      fontSize: 9, fontFamily: 'monospace',
      boxShadow: isHit ? `inset 0 0 20px ${chColor}22, 0 0 8px rgba(0,0,0,0.5)` : '0 0 8px rgba(0,0,0,0.5)',
      transition: 'box-shadow 0.08s ease',
    }}>
      <div style={{
        padding: '2px 4px', borderBottom: `1px solid ${chColor}22`,
        background: isHit ? `${chColor}28` : `${chColor}12`,
        display: 'flex', alignItems: 'center', gap: 2,
        transition: 'background 0.08s ease',
      }}>
        <span style={{
          color: chColor, fontWeight: 'bold', fontSize: 10,
          textShadow: isHit ? `0 0 6px ${chColor}` : `0 0 4px ${chColor}44`,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: 1, transition: 'text-shadow 0.08s ease',
        }}>
          {chLabel}
        </span>
        <span style={{ color: 'rgba(255,204,0,0.3)', fontSize: 8 }}>{stripIndex + 1}</span>
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '3px 5px', borderBottom: '1px solid rgba(255,204,0,0.06)' }}>
        <button onClick={() => onSetChannel(ch.id, { active: !ch.active })}
          style={{
            flex: 1, fontSize: 8, padding: '2px 0',
            border: `1px solid ${ch.active ? 'rgba(255,204,0,0.3)' : '#440000'}`,
            borderRadius: 2,
            background: ch.active ? 'transparent' : '#110000',
            color: ch.active ? '#ffcc00' : '#660000',
            cursor: 'pointer', lineHeight: '14px',
          }}>M</button>
        <button onClick={() => onSetChannel(ch.id, { solo: !ch.solo })}
          style={{
            flex: 1, fontSize: 8, padding: '2px 0',
            border: `1px solid ${ch.solo ? '#ffcc00' : 'rgba(255,204,0,0.15)'}`,
            borderRadius: 2,
            background: ch.solo ? 'rgba(255,204,0,0.15)' : 'transparent',
            color: ch.solo ? '#ffcc00' : 'rgba(255,204,0,0.4)',
            cursor: 'pointer', lineHeight: '14px',
          }}>S</button>
        <button onClick={() => onSetChannel(ch.id, { phaseInvert: !ch.phaseInvert })}
          style={{
            flex: 1, fontSize: 8, padding: '2px 0',
            border: `1px solid ${ch.phaseInvert ? chColor : 'rgba(255,204,0,0.1)'}`,
            borderRadius: 2,
            background: ch.phaseInvert ? `${chColor}22` : 'transparent',
            color: ch.phaseInvert ? chColor : 'rgba(255,204,0,0.3)',
            cursor: 'pointer', lineHeight: '14px',
          }}>ø</button>
      </div>

      <div style={{ display: 'flex', gap: 3, padding: '3px 5px', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,204,0,0.06)' }}>
        <VMeter level={isPlaying ? (ch._vuLevel || 0) : 0} height={65} color={chColor} />
        <VKnob value={ch.vol !== undefined ? ch.vol : 50} min={0} max={100} step={1} onChange={(v) => onSetChannel(ch.id, { vol: v })}
          size={24} color={chColor} label="VOL" />
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '3px 5px', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,204,0,0.06)' }}>
        <VKnob value={ch.pan || 0} min={-1} max={1} step={0.05} onChange={(v) => onSetChannel(ch.id, { pan: v })}
          size={20} color={chColor} label="PAN" />
        {['lowGain', 'midGain', 'highGain'].map((k, i) => {
          const labels = ['L', 'M', 'H'];
          const eq = ch.eq || {};
          return (
            <VKnob key={k} value={eq[k] || 0} min={-12} max={12} step={0.5}
              onChange={(v) => onSetChannel(ch.id, { eq: { ...eq, [k]: v } })}
              size={18} color={chColor} label={labels[i]} />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '3px 5px', borderBottom: '1px solid rgba(255,204,0,0.06)' }}>
        {['sendA', 'sendB'].map((s, i) => (
          <VKnob key={s} value={ch[s] || 0} min={0} max={1} step={0.05}
            onChange={(v) => onSetChannel(ch.id, { [s]: v })}
            size={18} color={chColor} label={`S${i + 1}`} />
        ))}
        <VKnob value={(ch.comp && ch.comp.threshold) || -6} min={-40} max={0} step={1}
          onChange={(v) => {
            const comp = ch.comp || { threshold: -6, ratio: 12, makeup: 0 };
            onSetChannel(ch.id, { comp: { ...comp, threshold: v } });
          }}
          size={18} color={chColor} label="COMP" />
        <VKnob value={(ch.comp && ch.comp.ratio) || 12} min={1} max={40} step={1}
          onChange={(v) => {
            const comp = ch.comp || { threshold: -6, ratio: 12, makeup: 0 };
            onSetChannel(ch.id, { comp: { ...comp, ratio: v } });
          }}
          size={18} color={chColor} label="RATIO" />
      </div>

      <div style={{ padding: '3px 5px', borderTop: '1px solid rgba(255,204,0,0.06)', display: 'flex', gap: 3, alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,204,0,0.3)', fontSize: 7, letterSpacing: 1 }}>SC</span>
        <select value={ch.sidechain || ''} onChange={(e) => onSetChannel(ch.id, { sidechain: e.target.value })}
          style={{
            flex: 1, fontSize: 8, background: '#0a0a0a', color: '#ffcc00',
            border: '1px solid rgba(255,204,0,0.15)', padding: '0 2px',
            borderRadius: 2,
            fontFamily: 'monospace',
          }}>
          <option value="">OFF</option>
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i} value={`ch${i}`}>CH{i + 1}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function MasterStrip({ channels, isPlaying, bpm }) {
  const masterColor = '#ffcc00';
  const avgVol = channels.reduce((s, ch) => s + (ch.active ? (ch.vol !== undefined ? ch.vol / 100 : 0.5) : 0), 0) / Math.max(1, channels.filter(ch => ch.active).length);
  const [masterVuL, setMasterVuL] = useState(0);
  const [masterVuR, setMasterVuR] = useState(0);

  useEffect(() => {
    if (!isPlaying) { setMasterVuL(0); setMasterVuR(0); return; }
    const interval = setInterval(() => {
      setMasterVuL(Math.random() * avgVol * 0.8 + 0.1);
      setMasterVuR(Math.random() * avgVol * 0.8 + 0.1);
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, avgVol]);

  return (
    <div style={{
      width: 143, minWidth: 143,
      border: '1px solid rgba(255,204,0,0.25)',
      borderRadius: 3,
      background: 'linear-gradient(180deg, rgba(255,204,0,0.06), #050505 20%)',
      display: 'flex', flexDirection: 'column',
      fontSize: 9, fontFamily: 'monospace',
      position: 'sticky', right: 0,
      boxShadow: '0 0 12px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        padding: '4px 6px', borderBottom: '1px solid rgba(255,204,0,0.2)',
        background: 'rgba(255,204,0,0.1)',
        textAlign: 'center',
      }}>
        <span style={{
          color: '#ffcc00', fontWeight: 'bold', fontSize: 12,
          textShadow: '0 0 6px #ffcc00', letterSpacing: 2,
        }}>MASTER</span>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '6px 8px', justifyContent: 'center', borderBottom: '1px solid rgba(255,204,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ color: 'rgba(255,204,0,0.4)', fontSize: 7, letterSpacing: 1 }}>L</span>
          <VMeter level={masterVuL} height={78} color={masterColor} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ color: 'rgba(255,204,0,0.4)', fontSize: 7, letterSpacing: 1 }}>R</span>
          <VMeter level={masterVuR} height={78} color={masterColor} />
        </div>
      </div>

      <div style={{ padding: '4px 8px', borderBottom: '1px solid rgba(255,204,0,0.1)' }}>
        <div style={{ color: 'rgba(255,204,0,0.4)', fontSize: 8, letterSpacing: 1, marginBottom: 3 }}>SEND FX</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,204,0,0.3)', fontSize: 7 }}>DLY</div>
            <input type="range" min={0} max={1} step={0.05} defaultValue={0.3}
              style={{ width: 40, height: 3, accentColor: '#ffcc00' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,204,0,0.3)', fontSize: 7 }}>REV</div>
            <input type="range" min={0} max={1} step={0.05} defaultValue={0.2}
              style={{ width: 40, height: 3, accentColor: '#ffcc00' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 8px', borderBottom: '1px solid rgba(255,204,0,0.1)' }}>
        <div style={{ color: 'rgba(255,204,0,0.4)', fontSize: 8, letterSpacing: 1, marginBottom: 2 }}>COMP</div>
        <div style={{ color: 'rgba(255,204,0,0.5)', fontSize: 8 }}>
          TH: -6dB RATIO: 12:1
        </div>
        <div style={{ color: 'rgba(255,204,0,0.3)', fontSize: 7 }}>ATK: 3ms REL: 250ms</div>
      </div>

      <div style={{ padding: '4px 8px', borderBottom: '1px solid rgba(255,204,0,0.1)' }}>
        <div style={{ color: 'rgba(255,204,0,0.4)', fontSize: 8, letterSpacing: 1, marginBottom: 2 }}>LIMITER</div>
        <div style={{ color: 'rgba(255,204,0,0.5)', fontSize: 8 }}>
          CEIL: -0.5dB · REL: 100ms
        </div>
      </div>

      <div style={{ padding: '4px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,204,0,0.5)', fontSize: 8 }}>
            {channels.filter(c => c.active).length}/{channels.length}
          </span>
          <span style={{ color: '#ffcc00', fontSize: 8 }}>
            {Math.round(avgVol * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Mixer({ channels, onSetChannel, isPlaying, bpm }) {
  const [vuLevels, setVuLevels] = useState({});

  useEffect(() => {
    if (!isPlaying) { setVuLevels({}); return; }
    const interval = setInterval(() => {
      const levels = {};
      channels.forEach(ch => {
        if (ch.active) {
          const volNorm = (ch.vol !== undefined ? ch.vol / 100 : 0.5);
          levels[ch.id] = volNorm * (0.15 + Math.random() * 0.85);
        } else {
          levels[ch.id] = 0;
        }
      });
      setVuLevels(levels);
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, channels]);

  const channelsWithVu = useMemo(() =>
    channels.map(ch => ({ ...ch, _vuLevel: vuLevels[ch.id] || 0 })),
    [channels, vuLevels]
  );

  return (
    <div className="flex-1 flex flex-col bg-[#050505]" style={{ minHeight: 0 }}>
      <div style={{ padding: '4px 10px', borderBottom: '1px solid rgba(255,204,0,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 8, color: 'rgba(255,204,0,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>
          MIXER
        </span>
        <span style={{ fontSize: 6, color: 'rgba(255,204,0,0.25)' }}>
          {isPlaying ? '● LIVE' : '■ STOP'}
        </span>
      </div>

      <div style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto',
        padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
      }}>
        {channelsWithVu.map((ch, i) => (
          <ChannelStrip key={ch.id} ch={ch} isPlaying={isPlaying}
            onSetChannel={onSetChannel} stripIndex={i} />
        ))}
        <MasterStrip channels={channels} isPlaying={isPlaying} bpm={bpm} />
      </div>

      <div style={{
        padding: '3px 10px', borderTop: '1px solid rgba(255,204,0,0.08)',
        display: 'flex', gap: 12, fontSize: 6, color: 'rgba(255,204,0,0.3)',
      }}>
        <span>STEREO</span>
        <span>44.1kHz / 24bit</span>
        <span>~5ms</span>
        <span style={{ flex: 1, textAlign: 'right' }}>
          {channels.filter(ch => ch.active).length} CH
        </span>
      </div>
    </div>
  );
}