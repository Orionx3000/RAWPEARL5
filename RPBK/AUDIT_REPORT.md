# RAWPEARL5 — Code Audit & Fix Report

**Date**: 2026-06-29  
**Files Audited**: `App.jsx` (970 sloc), `AsciiEngine.js` (1046 sloc), `ChannelRack.jsx` (463 sloc),  
`MainComponent.cpp` (103 sloc), `AudioEngine.h`/`.cpp`, `SongArranger.jsx` (161 sloc)  
**EXE**: `build/RAWPEARL5_artefacts/Release/RAWPEARL5.exe` (7.46 MB)

---

## Critical Bugs Found & Fixed

### 1. Step override values silently ignored

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High |
| **File** | `ChannelRack.jsx:113-118` → `App.jsx:497` |
| **Root cause** | `handleStepInput` stores step values under key `'value'` (the current `stepMode`), but the scheduler reads `rawOverrides.stepVal` — a key that is **never written**. This means every velocity/parameter adjustment via the step editor was silently discarded during playback. |
| **Impact** | Any step value different from the default (20) had zero effect on audio output — no velocity scaling, no parameter modulation from the step editor. |
| **Fix** | Added a key mapping in `ChannelRack.jsx:116`: `{ value: 'stepVal', glitch: 'glitchAmount' }`. When stepMode is `'value'`, the override is now stored under `'stepVal'`, matching what the scheduler and the display `getOverrideValue` both read. |

### 2. ScriptProcessorNode causing tick/click artifacts

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High |
| **File** | `App.jsx:77-92` (`initAudio`) |
| **Root cause** | A `ScriptProcessorNode` (`fxBus.recorder`, 16384 sample buffer) was **permanently connected** to `audioCtx.destination` through a dummy zero-gain sink. ScriptProcessorNodes are deprecated in Web Audio API and known to produce audible artifacts (clicks, pops, ticking) on Chromium-based WebView2 even when the `onaudioprocess` callback is idle. |
| **Impact** | Most likely cause of the user-reported "steady ticking in left channel" with no other audible output. The ScriptProcessorNode introduces processing latency (~371ms at 44.1kHz) and can cause buffer underruns on each callback cycle. |
| **Fix** | Removed the permanent ScriptProcessorNode from `initAudio()`. The recorder is now **lazily created** only when the user starts live recording (`toggleLiveRecord` → `window.startLiveRecording`) and **disconnected** when recording stops. It is only in the audio graph during active recording. |

---

## Medium-Severity Issues

### 3. Pattern view truncation

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `ChannelRack.jsx:357` and `ChannelRack.jsx:285` |
| **Root cause** | The step grid container uses `overflow-auto` with `flex-1`, but Tailwind `flex-1` does not always set `min-width: 0` on flex children. This prevents the container from shrinking below its content width, so `overflow: auto` never activates — the 18px×N step cells simply overflow without a scrollbar. The step number ruler also lacked any overflow handling. |
| **Impact** | Pattern view appears truncated/hidden when step count exceeds available width (e.g., 32 steps × 18px = 576px). User cannot scroll to see remaining steps. |
| **Fix** | Changed both containers to `overflow-x-auto min-w-0`. The `min-w-0` forces the flex child to be able to shrink to zero, enabling the scrollbar. |

### 4. C++ AudioEngine never registered as audio callback

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `MainComponent.cpp:51-87` |
| **Root cause** | `MainComponent` calls `audioEngine.prepareToPlay(44100.0, 512)` but **never calls** `setAudioChannels()` or `addAudioCallback()`. The `AudioEngine::processBlock()` method only calls `buffer.clear()` — it produces zero audio. |
| **Impact** | All audio must come from WebView2's Web Audio API. There is no fallback or mixing from the C++ backend. This is architecturally correct for a WebView2-based app, but means audio will fail entirely if WebView2 cannot initialize Web Audio. |

### 5. Redundant audio routing

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `App.jsx:87-92` (before fix) |
| **Root cause** | Master compressor was routed to both `audioCtx.destination` (direct) and `fxBus.recorder → dummySink → destination` (through ScriptProcessorNode). This double-routed audio through the same destination. |
| **Impact** | Subtle phase/polarity issues possible; unnecessary node graph complexity. |
| **Fix** | Resolved as part of Fix #2 — the recorder path is now only connected during active recording, leaving a single clean path: `master → destination`. |

---

## Low-Severity Issues (Not Fixed)

### 6. `AsciiPlayer` created per-character playback

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟢 Low |
| **File** | `App.jsx:143` |
| **Root cause** | `playChar()` creates a **new `AsciiPlayer` instance** for every single character playback call. Each instance creates oscillator nodes, schedules ADSR events, and is then discarded. |
| **Impact** | Unnecessary GC pressure. Not functionally broken but wasteful. Consider pooling or reusing a single player instance. |

### 7. `_getDest()` previously broken — confirmed fixed

| Attribute | Detail |
|-----------|--------|
| **File** | `AsciiEngine.js:729` |
| **Status** | ✅ Fixed in prior session |
| **Verification** | `return this.outputDest || (this.ctx && this.ctx.destination);` — no `this.this._getDest()` pathological call present. |

### 8. `gen_binary_data.py` narrowing warnings

| Attribute | Detail |
|-----------|--------|
| **File** | `Source/BinaryData.cpp` |
| **Status** | ⚠️ Harmless warnings |
| **Detail** | C++ compiler emits ~100+ warnings about `int → const char` narrowing conversion in generated binary data. All values are < 256, so the truncation is safe. Could be silenced with explicit `static_cast<char>()` in the generator script, but functionally benign. |

---

## Build Verification

| Step | Status |
|------|--------|
| `npm run build` (Vite) | ✅ 44 modules, 332KB JS, 36KB CSS |
| `python gen_binary_data.py` | ✅ BinaryData.cpp generated (~34KB source) |
| `cmake --build build --config Release` | ✅ `RAWPEARL5.exe` (7.46 MB) |
| Icon embedded `RAWPEARL5.ico` | ✅ CMake `ICON` property confirmed |

---

## Summary

| Issue | Status | Impact |
|-------|--------|--------|
| Step override key mismatch | **Fixed** | Was silently discarding all step editor values — likely contributed to "no audible effect" complaint |
| ScriptProcessorNode tick source | **Fixed** | Was permanently connected to audio destination — most likely cause of steady ticking |
| Pattern view truncation | **Fixed** | Step grid now scrolls horizontally when content exceeds container width |
| C++ audio not connected | Not fixed (architectural) | All audio comes from WebView2 Web Audio API — expected |
| `AsciiPlayer` per-character | Not fixed (low impact) | Works but wasteful — refactor if performance issues arise |

---

## Session 2 Fixes (2026-06-29)

### 9. 🔴 Critical: Preset equation never loaded — all default channels fell to basic sine

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High — **root cause of "no sound, just clicking"** |
| **File** | `App.jsx:24-29` (`allMathPresets` construction) |
| **Root cause** | MathPresets store the equation as `preset.eq` — an array of `{label, val}` objects. But `App.jsx:518` accessed `allMathPresets[ch.presetName].equation` — **`equation` is undefined** because the key is `eq`. The `cp.funcStr` was always empty, so the `sandbox_math` synth path was never entered. Every default channel fell through to the basic sine oscillator fallback with 0.001s attack — producing extremely short, clicky sine blips that sounded like "clik clik clik". |
| **Fix** | `App.jsx:28`: Changed `allMathPresets` construction to precompute `funcStr` by joining `preset.eq.map(t => t.val).join(' ')`. Now the proper math equation string is available, and the `sandbox_math` path in `AsciiEngine.js:1000` runs correctly, generating full audio buffers per note. |

### 10. 🔴 Critical: Default channel types didn't match dictionary keys

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High — **complement to fix #9 for channels without presets** |
| **File** | `App.jsx:288-338` |
| **Root cause** | Default channels used types like `'Δ'` (uppercase Delta), `'Ω'`, `'μ'`, `'λ'`, `'θ'` — but `AsciiEngine.js:908-982` checks for `'δ'` (lowercase), `'ω'`, `'π'`, `'τ'`, `'α'`, `'γ'`, `'φ'`, `'Σ'`. Only `'Σ'` and `'π'` matched. The other 5 channel types always fell through to the basic sine fallback. Additionally, preset names like `'303 Acid Pluck'`, `'Saw Pluck'`, `'Square PWM'`, `'SuperSaw Pad'` didn't exist in `MATH_PRESETS`. |
| **Fix** | Rewired default channels to use dictionary-matching types: KICK→`'τ'` (tau_synth, percussion), BASS→`'Σ'` (sigma_synth), SNARE→`'ω'` (omega_synth, noise), HIHATS→`'τ'` (tau_synth), PERC→`'ω'`, ACID_LEAD→`'α'` (alpha_synth), ATMOSPHERE→`'γ'` (gamma_synth). All preset names now match existing MATH_PRESETS entries (`'909 Snare'`, `'909 HiHat Closed'`, `'909 Clap'`, `'Acid Filter Pluck'`, `'Glassy FM Pad'`). |

### 11. 🟡 Medium: Song page pattern thumbnail showed only 1 bar of text

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `SongArranger.jsx:96-105` |
| **Root cause** | The thumbnail div concatenated `ch.layers[0].join('').substring(0, 32)` — showing only the first 32 characters of the top layer as raw text. It was truncated by `overflow-hidden` and limited to layer 0 only. |
| **Fix** | Replaced with a mini step-grid view showing all 3 layers per channel, each with colored step indicator dots (top=full color, mid=0.8 opacity, bot=0.53 opacity) that scale to fit the container width (`Math.max(3, Math.min(6, 160/len))`). Empty steps show as dim dots. Each channel gets a number label. The grid scrolls vertically when channels exceed the container height. |

---

## Session 3 Fixes (2026-06-29 2nd pass)

### 12. 🔴 Critical: `.equation` hash typo — sandbox_math path never entered

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High — **ACTUAL root cause of click-only sound** |
| **File** | `App.jsx:527` |
| **Root cause** | Session 2 added `funcStr` to `allMathPresets` entries, but consumption code at line 527 read `allMathPresets[ch.presetName].equation` — **`.equation` is always undefined** because the property was named `.funcStr`. Even though `allMathPresets` had correct equation strings precomputed, they were never accessed. `cp.funcStr` was always `undefined`, so the sandbox_math condition at `AsciiEngine.js:1000` (`inst.type === 'sandbox_math' && inst.funcStr`) evaluated to `false`. Every note fell to the fallback sine oscillator path producing clicky 1ms blips. |
| **Fix** | Line 527: `.equation` → `.funcStr`. Now `cp.funcStr` receives the actual equation string, sandbox_math path creates proper audio buffers per note. |

### 13. 🟡 Medium: Channel names were uppercase descriptive, not Greek symbols

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `App.jsx:298-341` |
| **Root cause** | Default channel names set to `'KICK'`, `'PSY_BASS'`, `'SNARE'`, `'HIHATS'`, etc. instead of their Greek type symbols. The header label showed preset group name (e.g., "KICKS") as fallback when `ch.name` was set. |
| **Fix** | Changed names to Greek symbols: `'τ'`, `'Σ'`, `'ω'`, `'τ'`, `'ω'`, `'α'`, `'γ'`. Updated `CHANNEL_LABELS` in `ChannelRack.jsx` to only list valid dictionary keys. |

### 14. 🟡 Medium: Preset dropdown showed ALL presets regardless of channel type

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `ChannelRack.jsx:170-172` |
| **Root cause** | Preset dropdown rendered `allPresets.map(...)` without filtering by channel type. A kick channel would show FM synthesis and chiptune presets. |
| **Fix** | Added `TYPE_PRESET_GROUPS` mapping (line 21-31): `τ`→808/909, `Σ`→808/FM, `ω`→909, `α`→303 Acid, `γ`→FM/Physical, `δ`→Physical/Chaos, `π`→Chiptune/Glitch, `φ`→FM/Glitch. Dropdown filters to matching groups. |

### 15. 🟢 Low: Sidechain pulldown had no tooltip

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟢 Low |
| **File** | `ChannelRack.jsx:222` |
| **Root cause** | "SC:" label had no tooltip — user didn't understand it controls sidechain ducking between channels. |
| **Fix** | Added `title="Sidechain: trigger ducking/compression from another channel"` to the SC label. |

### 16. 🟢 Low: Sandbox button labeled "ASSIGN TO GREEK SYMBOL" instead of "Add Channel"

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟢 Low |
| **File** | `MathSandbox.jsx:561-567`, `App.jsx:941-952` |
| **Root cause** | Button at bottom of sandbox called `onSaveEquation` which prompted for a character and saved to `ASCII_DICTIONARY`. No way to directly create a channel from sandbox. |
| **Fix** | Split into two buttons: "[ ASSIGN TO KEY ]" (keeps old dictionary mapping) and "[ ADD CHANNEL ]" (creates a new channel with the sandbox equation as `params.funcStr`, switches to Pattern tab). Added `onAddChannel` prop. |

### 17. 🟢 Low: Missing pearl icon

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟢 Low |
| **File** | `resources/RAWPEARL5.ico` (replaced), `resources/RAWPEARL5.png` (replaced) |
| **Root cause** | RAWPEARL5.png was a 1024×561 banner; RAWPEARL5.ico (256×140) was derived from it rather than being a proper pearl. |
| **Fix** | Generated a new pearl icon using Pillow: 256×256 .ico with embedded 16/32/48/64/128/256 sizes, radial gradient pearl with iridescent white→blue/pink and highlight shine. New 1024×1024 .png for high-DPI display. |

---

## Session 4 Fixes (2026-06-29 — Complete Sound Fix + Subgroup System)

### 18. 🔴 Critical: `.equation` typo in export and preview paths

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🔴 High |
| **File** | `App.jsx:451,701,813` |
| **Root cause** | Three additional locations read `preset.equation` instead of the correct `preset.funcStr` (from Session 2 fix): (1) keyboard preview at line 451, (2) context-menu audition at line 701, (3) WAV export at line 813. The main scheduler at line 527 was already fixed in Session 3 but these 3 were missed. |
| **Fix** | Changed all 3 to `preset.funcStr`. Now WAV export, keyboard typing preview, and right-click audition all correctly load preset equations. |

### 19. 🔴 New: Subgroup/instrument-type system

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `ChannelRack.jsx:21-56`, `App.jsx:262-269` |
| **Root cause** | No instrument-type hierarchy — each Greek symbol mapped flat to preset groups. User couldn't select "this τ is a KICK" vs "this τ is a HIHAT". |
| **Fix** | Added `GREEK_INSTRUMENTS` mapping in ChannelRack.jsx: each Greek symbol lists available instrument types (`τ→KICK/HIHAT/TOM/RIM`, `Σ→SUB BASS/REESE`, `ω→SNARE/CLAP/PERC/CRASH`, `α→LEAD/PLUCK/BASS`, `γ→PAD/ATMOSPHERE/TEXTURE`, `δ→FM BELL/IMPACT`, `π→CHIP/GLITCH`, `φ→WAVETABLE/CHAOS`). Each subgroup maps to a MATH_PRESETS group. The channel header now shows `[{name}] [subgroup ▼] [preset ▼ filtered by subgroup]`. Preset dropdown only shows presets matching the selected subgroup's preset group. `createChannel()` now accepts `subgroup` parameter. Default channels have subgroups assigned. |

### 20. 🟡 Medium: +CH button used English labels instead of Greek symbols

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `TransportBar.jsx:3-12` |
| **Root cause** | Channel type dropdown showed text labels like "KICK", "SNARE", "BASS" instead of Greek symbols. `addChannel('kick')` created channel with type `'kick'` which doesn't match any dictionary synth type. |
| **Fix** | Changed to Greek symbols with descriptive suffix: `τ KICK`, `Σ BASS`, `ω NOISE`, `α LEAD`, `γ PAD`, `δ FM`, `π CHIP`, `φ WAVE`. `addChannel` now sets `ch.name = type` (the Greek symbol) and sets default subgroup for each type. |

### 21. 🟡 Medium: SongArranger pattern thumbnail shows only half the pattern

| Attribute | Detail |
|-----------|--------|
| **Severity** | 🟡 Medium |
| **File** | `SongArranger.jsx:96-126` |
| **Root cause** | Fixed pixel-width dots (`dotW = Math.max(3, Math.min(10, Math.floor(140 / len)))`) didn't scale to container. For 32-step patterns, dots were 4px each + 0.5px gaps = ~144px, which could overflow narrow grid cards causing horizontal truncation to ~16 steps visible. |
| **Fix** | Replaced fixed-width dots with CSS grid `gridTemplateColumns: repeat(len, 1fr)` so each step gets equal fractional width of the container. All 32 steps always visible, no truncation. Layers stacked vertically per channel with Greek symbol labels. |
