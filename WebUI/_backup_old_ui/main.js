// ─── ASCII CHARACTER LIBRARY (synced with AsciiEngine.js) ────────────────────
const ASCII_LIBRARY = [
    { cat:'PUNCTUATION', desc:'Sparse = Sines & Plucks',
      chars:'.,\'"-_:;!?',
      dsp:'.=sine pluck ,=micro-click -=sine drone _=sub-bass drone \'=pico-click :=pad ;=short sine !=saw pluck ?=noise S&H' },
    { cat:'OSCILLATORS', desc:'Medium Density = Complex Waves',
      chars:'XOVI',
      dsp:'X→dense sawtooth, O→hollow square, V→pointed triangle, I→thin triangle. Core melodic building blocks.' },
    { cat:'DENSE', desc:'High Density = Noise, FM & Distortion',
      chars:'#@%WM',
      dsp:'#=white noise burst, @=pink noise+distortion, %=FM scream, W=FM mod, M=distorted double-saw. Snares, grit, cymbals.' },
    { cat:'BLOCKS', desc:'Granular = Density = Grain Overlap',
      chars:'█▓▒░',
      dsp:'█=100% dense grain wall, ▓=80% buzz swarm, ▒=50% glitch stutter, ░=20% vinyl crackle/rain texture.' },
    { cat:'NUMBERS', desc:'Harmonic Partials = Numeric Value',
      chars:'0123456789',
      dsp:'0=sub bass, 1=fundamental, 2=octave, 3=twelfth, 4=2oct, 5=major3, 6=sweet, 7=dissonant, 8=rich, 9=dense.' },
    { cat:'MODIFIERS', desc:'Envelopes, Gates & Loop Markers',
      chars:'/\\()[]{}',
      dsp:'/=filter ramp↑, \\=filter ramp↓, (=gate open, )=gate close, [=loop start, ]=loop end, {=block begin, }=block end.' },
    { cat:'ROUTING', desc:'Signal Flow & Sustain',
      chars:'=',
      dsp:'= = sustain previous note across steps. Connect adjacent cells into held tones.' },
    { cat:'UPPERCASE', desc:'Density→Harmonics (Sawtooth)',
      chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      dsp:'A=thinnest saw → Z=densest saw. Density of strokes maps to harmonic richness.' },
    { cat:'lowercase', desc:'Softer Triangle Waves',
      chars:'abcdefghijklmnopqrstuvwxyz',
      dsp:'a=softest triangle → z=fullest triangle. Lowercase = warmer, softer variants.' }
];

// ─── DERIVED MAPPING: ch → category ──────────────────────────────────
const CHAR_CATEGORY = {};
ASCII_LIBRARY.forEach(entry => {
    for (const ch of entry.chars) CHAR_CATEGORY[ch] = entry.cat;
});

// ─── MATH / COMMAND PARSER ─────────────────────────────────────────────────
function parseCommand(cmd) {
    cmd = cmd.trim();
    const euclidMatch = cmd.match(/^euclid\s*\(\s*(\S)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (euclidMatch) return { type:'euclid', ch:euclidMatch[1], pulses:parseInt(euclidMatch[2]), steps:parseInt(euclidMatch[3]) };
    const fillMatch = cmd.match(/^fill\s*\(\s*(\S)\s*\)$/i);
    if (fillMatch) return { type:'fill', ch:fillMatch[1] };
    const randomMatch = cmd.match(/^random\s*\(\s*(\S)\s*\)$/i);
    if (randomMatch) return { type:'random', chars:randomMatch[1] };
    const sweepMatch = cmd.match(/^sweep\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)$/i);
    if (sweepMatch) return { type:'sweep', param:sweepMatch[1], from:sweepMatch[2], to:sweepMatch[3] };
    const patternMatch = cmd.match(/^pattern\s*\(\s*(\S+)\s*,\s*(\d+)\s*\)$/i);
    if (patternMatch) return { type:'pattern', ch:patternMatch[1], steps:parseInt(patternMatch[2]) };
    const scaleMatch = cmd.match(/^scale\s*\(\s*([\d,\s]+)\s*\)$/i);
    if (scaleMatch) return { type:'scale', notes:scaleMatch[1].split(',').map(Number) };
    const gateMatch = cmd.match(/^gate\s*\(\s*(on|off|1|0)\s*\)$/i);
    if (gateMatch) return { type:'gate', val:gateMatch[1] === 'on' || gateMatch[1] === '1' };
    const clearMatch = cmd.match(/^clear$/i);
    if (clearMatch) return { type:'clear' };
    return null;
}

function applyCommandToNode(node, command) {
    const steps = node.steps || 16;
    if (!node.pattern) node.pattern = Array.from({length:3}, () => Array(steps).fill(''));
    switch (command.type) {
        case 'fill':
            for (let l = 0; l < 3; l++)
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = command.ch;
            break;
        case 'clear':
            for (let l = 0; l < 3; l++)
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = '';
            break;
        case 'euclid': {
            const { ch, pulses } = command;
            for (let l = 0; l < 3; l++) {
                const seq = euclideanRhythm(pulses, steps);
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = seq[i] ? ch : '';
            }
            break;
        }
        case 'random': {
            const chars = command.chars;
            for (let l = 0; l < 3; l++)
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = chars[Math.floor(Math.random() * chars.length)];
            break;
        }
        case 'pattern': {
            const p = command.ch.repeat(Math.ceil(steps / command.ch.length)).slice(0, steps);
            for (let l = 0; l < 3; l++)
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = p[i];
            break;
        }
        case 'scale': {
            const notes = command.notes;
            for (let l = 0; l < 3; l++)
                for (let i = 0; i < steps; i++)
                    node.pattern[l][i] = String(notes[i % notes.length]);
            break;
        }
        case 'gate': {
            node.affinityGate = command.val;
            break;
        }
    }
}

function euclideanRhythm(pulses, steps) {
    const result = Array(steps).fill(0);
    if (pulses === 0) return result;
    const bucket = Array(steps).fill(0);
    for (let i = 0; i < steps; i++) bucket[i] = i * pulses / steps;
    const indices = bucket.map((v, i) => ({v, i})).sort((a,b) => a.v - b.v);
    for (let p = 0; p < pulses; p++) result[indices[p].i] = 1;
    return result;
}

// ─── AFFINITY MATRIX ────────────────────────────────────────────────────────
const SCALES = {
    chromatic: [0,1,2,3,4,5,6,7,8,9,10,11],
    major:     [0,2,4,5,7,9,11],
    minor:     [0,2,3,5,7,8,10],
    dorian:    [0,2,3,5,7,9,10],
    phrygian:  [0,1,3,5,7,8,10],
    lydian:    [0,2,4,6,7,9,11],
    mixolydian:[0,2,4,5,7,9,10],
    locrian:   [0,1,3,5,6,8,10],
    pentatonic:[0,2,4,7,9],
    blues:     [0,3,5,6,7,10]
};
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// ─── EDIT DATABASE (Undo/Redo) ──────────────────────────────────────────────
class EditDatabase {
    constructor() { this.stack = []; this.idx = -1; this.max = 256; }
    push(state) {
        this.stack = this.stack.slice(0, this.idx + 1);
        this.stack.push(JSON.parse(JSON.stringify(state)));
        if (this.stack.length > this.max) this.stack.shift();
        this.idx = this.stack.length - 1;
    }
    undo() { if (this.idx <= 0) return null; this.idx--; return JSON.parse(JSON.stringify(this.stack[this.idx])); }
    redo() { if (this.idx >= this.stack.length - 1) return null; this.idx++; return JSON.parse(JSON.stringify(this.stack[this.idx])); }
    canUndo() { return this.idx > 0; }
    canRedo() { return this.idx < this.stack.length - 1; }
}

// ─── ASCII-TO-DSP PARAMS (delegates to dictionary) ──────────────────────────
function asciiToParams(ch) {
    if (!ch || ch === ' ' || ch === '.') return { wave:'sine', amp:0.1, harm:1, noise:0, fm:0, env:'pluck' };
    const d = ASCII_DICTIONARY[ch];
    if (d) {
        const env = d.type === 'granular' ? 'grain' : d.type === 'envelope' ? 'gate' : d.type === 'noise' ? 'harsh' : (d.attack||0.01) < 0.02 ? 'pluck' : 'sustain';
        const amp = d.type === 'noise' ? 0.5 : d.type === 'fm' ? 0.3 : d.type === 'granular' ? 0.4 : 0.35 + (d.harmonics||0) * 0.08;
        return {
            wave: d.wave || (d.type === 'noise' ? 'noise' : d.type === 'fm' ? 'fm' : 'sine'),
            amp: Math.min(1, amp),
            harm: (d.harmonics || 1) + 1,
            noise: d.type === 'noise' ? 0.7 : d.type === 'granular' ? 0.3 : 0,
            fm: d.type === 'fm' ? 0.5 : 0,
            env: env
        };
    }
    if ('BRgm'.includes(ch)) return { wave:'square', amp:0.6, harm:5, noise:0.3, fm:0.05, env:'harsh' };
    if ('&$%*'.includes(ch)) return { wave:'square', amp:0.5, harm:4, noise:0.2, fm:0.1, env:'harsh' };
    if (ch >= 'A' && ch <= 'Z') return { wave:'sawtooth', amp:0.35 + (ch.charCodeAt(0)-65)/100, harm:3, noise:0.05, fm:0, env:'sharp' };
    if (ch >= 'a' && ch <= 'z') return { wave:'triangle', amp:0.25 + (ch.charCodeAt(0)-97)/100, harm:2, noise:0, fm:0, env:'smooth' };
    if (ch >= '\u2800' && ch <= '\u28FF') return { wave:'square', amp:0.4, harm:2, noise:0.2, fm:0.05, env:'braille' };
    if ('╔═║╚╝╠╣╦╩╬╗╟╤╧╞╡╨╥╙╘╓╒╪'.includes(ch)) return { wave:'pulse', amp:0.2, harm:1, noise:0, fm:0, env:'gate' };
    return { wave:'sine', amp:0.2, harm:1, noise:0, fm:0, env:'pluck' };
}

function getCharacterCategory(ch) {
    if (CHAR_CATEGORY[ch]) return CHAR_CATEGORY[ch];
    if (ch >= 'A' && ch <= 'Z') return 'UPPERCASE';
    if (ch >= 'a' && ch <= 'z') return 'lowercase';
    if (ch >= '\u2800' && ch <= '\u28FF') return 'BRAILLE';
    if ('╔═║╚╝╠╣╦╩╬╗╟╤╧╞╡╨╥╙╘╓╒╪'.includes(ch)) return 'BOX DRAWING';
    return 'OTHER';
}

// ─── INIT STATE ─────────────────────────────────────────────────────────────
let nextNodeId = 100;
let selectedCell = null;
let currentStep = 0;

function createDefaultState() {
    return {
        bpm: 140,
        playing: false,
        affinity: { root:'F', scale:'phrygian', gate:true },
        nodes: [
            { id:1, type:'sequencer', title:'MASTER CLOCK', x:30, y:30, w:320, h:100, channels:1, steps:16, bpm:140,
              pattern:Array.from({length:3},()=>Array(16).fill('')), layers:Array.from({length:3},()=>Array(16).fill('')),
              vol:0.8, pan:0.0, fx:{ rev:0, dly:0, dist:0 } },
            { id:2, type:'sequencer', title:'NODE A: BASS', x:400, y:150, w:320, h:120, channels:1, steps:32, bpm:140,
              pattern:Array.from({length:3},()=>Array(32).fill('')), layers:Array.from({length:3},()=>Array(32).fill('')),
              vol:0.7, pan:0.0, fx:{ rev:0.1, dly:0, dist:0 } }
        ]
    };
}

let state = createDefaultState();
const db = new EditDatabase();
db.push(state);

// ─── RENDER ─────────────────────────────────────────────────────────────────
function render() {
    renderNodes();
    renderChannelStrip();
    renderMasterClock();
    renderAffinityPanel();
    updateUndoRedo();
    renderStepHighlight();
    syncWithBackend();
}

function renderMasterClock() {
    document.getElementById('bpm-input').value = state.bpm;
    const playBtn = document.getElementById('play-btn');
    playBtn.textContent = state.playing ? '[||]' : '[>]';
    playBtn.style.borderColor = state.playing ? 'var(--dos-yellow)' : '';
    playBtn.style.boxShadow = state.playing ? 'var(--glow)' : '';
    document.getElementById('beat-display').textContent = '|' + state.bpm + '.' + currentStep + '.0|';
}

function renderAffinityPanel() {
    document.getElementById('affinity-root').value = state.affinity.root;
    document.getElementById('affinity-scale').value = state.affinity.scale;
    document.getElementById('affinity-gate').value = state.affinity.gate ? 'ON' : 'OFF';
}

function updateUndoRedo() {
    document.getElementById('undo-btn').style.opacity = db.canUndo() ? '1' : '0.3';
    document.getElementById('redo-btn').style.opacity = db.canRedo() ? '1' : '0.3';
}

// ─── NODE RENDERING ─────────────────────────────────────────────────────────
function renderNodes() {
    const container = document.getElementById('canvas-container');
    container.querySelectorAll('.node').forEach(n => n.remove());
    state.nodes.forEach((node, idx) => {
        const el = document.createElement('div');
        el.className = 'node';
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        el.style.width = node.w + 'px';
        el.dataset.nodeId = node.id;

        el.innerHTML = `
            <div class="node-header">
                <span class="node-title">${node.title}</span>
                <span class="node-type">[${node.type}]</span>
                <span class="node-controls">
                    <span class="node-btn add-step" title="Add step">[+]</span>
                    <span class="node-btn remove-step" title="Remove step">[-]</span>
                    <span class="node-btn remove-node" title="Delete node">[X]</span>
                </span>
            </div>
            <div class="node-content">
                <div class="seq-grid"></div>
                <div class="node-params">
                    <div class="param-row"><span class="label">BPM</span><input type="text" value="${node.bpm}" data-param="bpm"></div>
                    <div class="param-row"><span class="label">STP</span><input type="text" value="${node.steps}" data-param="steps"></div>
                    <div class="param-row"><span class="label">VOL</span><input type="text" value="${Math.round(node.vol*100)}" data-param="vol"></div>
                    <div class="param-row"><span class="label">PAN</span><input type="text" value="${Math.round(node.pan*100)}" data-param="pan"></div>
                    <div class="param-row"><span class="label">REV</span><input type="text" value="${Math.round(node.fx.rev*100)}" data-param="fx.rev"></div>
                    <div class="param-row"><span class="label">DLY</span><input type="text" value="${Math.round(node.fx.dly*100)}" data-param="fx.dly"></div>
                    <div class="param-row"><span class="label">DST</span><input type="text" value="${Math.round(node.fx.dist*100)}" data-param="fx.dist"></div>
                </div>
            </div>
        `;

        container.appendChild(el);
        setupNodeEvents(el, node, idx);
        renderSeqGrid(el, node);
    });
}

function renderSeqGrid(el, node) {
    const grid = el.querySelector('.seq-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const steps = Math.min(node.steps || 16, 128);
    grid.style.gridTemplateColumns = '30px repeat(' + steps + ', 22px)';
    const layers = ['high','mid','low'];
    const layerLabels = ['H','M','L'];

    layers.forEach((layer, li) => {
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = layerLabels[li];
        grid.appendChild(label);

        for (let i = 0; i < steps; i++) {
            const cell = document.createElement('div');
            const ch = (node.pattern[li] && node.pattern[li][i]) || '';
            cell.className = 'cell' + (ch ? ' active' : '') + ' ' + layer;
            cell.textContent = ch;
            cell.dataset.layer = li;
            cell.dataset.step = i;
            cell.dataset.nodeId = node.id;
            cell.addEventListener('click', () => selectCell(cell, node, li, i));
            cell.addEventListener('dblclick', () => openToolWheel(cell, node, li, i));
            grid.appendChild(cell);
        }
    });
}

function setupNodeEvents(el, node, idx) {
    let isDragging = false, startX, startY, startNodeX, startNodeY;
    const header = el.querySelector('.node-header');

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.node-controls')) return;
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        startNodeX = node.x; startNodeY = node.y;
        deselectAllNodes(); el.classList.add('selected');
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        node.x = startNodeX + (e.clientX - startX);
        node.y = startNodeY + (e.clientY - startY);
        el.style.left = node.x + 'px'; el.style.top = node.y + 'px';
    });
    window.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; pushState(); } });

    el.querySelector('.remove-node').addEventListener('click', (e) => {
        e.stopPropagation();
        state.nodes.splice(idx, 1); pushState(); render();
    });

    el.querySelector('.add-step').addEventListener('click', (e) => {
        e.stopPropagation();
        node.steps = Math.min((node.steps || 16) + 4, 128);
        for (let l = 0; l < 3; l++) {
            while ((node.pattern[l]||[]).length < node.steps) node.pattern[l].push('');
        }
        pushState(); render();
    });

    el.querySelector('.remove-step').addEventListener('click', (e) => {
        e.stopPropagation();
        node.steps = Math.max(4, (node.steps || 16) - 4);
        for (let l = 0; l < 3; l++) {
            if (node.pattern[l]) node.pattern[l] = node.pattern[l].slice(0, node.steps);
        }
        pushState(); render();
    });

    el.querySelectorAll('.node-params input').forEach(inp => {
        inp.addEventListener('change', () => {
            const param = inp.dataset.param;
            const val = parseFloat(inp.value) || 0;
            setNodeParam(node, param, val);
            pushState(); render();
        });
    });
}

function setNodeParam(node, param, val) {
    if (param === 'bpm') node.bpm = Math.max(20, Math.min(999, val));
    else if (param === 'steps') node.steps = Math.max(4, Math.min(128, Math.round(val)));
    else if (param === 'vol') node.vol = Math.max(0, Math.min(2, val/100));
    else if (param === 'pan') node.pan = Math.max(-1, Math.min(1, val/100));
    else if (param.startsWith('fx.')) {
        const k = param.split('.')[1];
        if (node.fx[k] !== undefined) node.fx[k] = Math.max(0, Math.min(1, val/100));
    }
}

function selectCell(cell, node, layer, step) {
    deselectAllCells();
    cell.classList.add('selected');
    selectedCell = { node, layer, step, nodeId:node.id };
    closeToolWheel();
}

function deselectAllCells() {
    document.querySelectorAll('.seq-grid .cell.selected').forEach(c => c.classList.remove('selected'));
    selectedCell = null;
}

function deselectAllNodes() {
    document.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));
}

// ─── KEYBOARD CELL INPUT ───────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') { deselectAllCells(); closeToolWheel(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCell) {
            const { node, layer, step } = selectedCell;
            if (node.pattern[layer]) node.pattern[layer][step] = '';
            pushState(); render();
            e.preventDefault();
        }
        return;
    }
    if (e.key === 'Tab') { e.preventDefault(); moveSelection(1); return; }
    if (e.key.length === 1 && selectedCell) {
        const { node, layer, step } = selectedCell;
        if (!node.pattern[layer]) node.pattern[layer] = [];
        node.pattern[layer][step] = e.key;
        pushState();
        moveSelection(1);
        e.preventDefault();
    }
});

function moveSelection(dir) {
    if (!selectedCell) return;
    const { node, layer, step } = selectedCell;
    const steps = node.steps || 16;
    const newStep = Math.max(0, Math.min(steps - 1, step + dir));
    if (newStep !== step) {
        const grid = document.querySelector(`[data-node-id="${node.id}"] .seq-grid`);
        if (grid) {
            const cells = grid.querySelectorAll('.cell');
            const target = cells[newStep + layer * steps];
            if (target) selectCell(target, node, layer, newStep);
        }
    }
}

// ─── TOOL WHEEL ─────────────────────────────────────────────────────────────
let wheelTarget = null;
let wheelNode = null, wheelLayer = 0, wheelStep = 0;

function openToolWheel(cell, node, layer, step) {
    wheelTarget = cell; wheelNode = node; wheelLayer = layer; wheelStep = step;
    const wheel = document.getElementById('tool-wheel');
    wheel.classList.remove('hidden');
}
function closeToolWheel() { document.getElementById('tool-wheel').classList.add('hidden'); wheelTarget = null; }

document.getElementById('wheel-close').addEventListener('click', closeToolWheel);
document.getElementById('tool-wheel').addEventListener('click', (e) => {
    const section = e.target.closest('.wheel-section');
    if (!section) return;
    const ch = section.dataset.char;
    if (wheelTarget && wheelNode) {
        if (!wheelNode.pattern[wheelLayer]) wheelNode.pattern[wheelLayer] = [];
        wheelNode.pattern[wheelLayer][wheelStep] = ch;
        pushState(); render();
    }
    closeToolWheel();
});

// ─── ASCII LIBRARY ──────────────────────────────────────────────────────────
document.getElementById('ascii-lib-toggle').addEventListener('click', () => {
    const lib = document.getElementById('ascii-lib');
    lib.classList.toggle('hidden');
    if (!lib.classList.contains('hidden')) buildLibrary();
});
document.getElementById('lib-close').addEventListener('click', () => {
    document.getElementById('ascii-lib').classList.add('hidden');
});
document.getElementById('lib-density-btn').addEventListener('click', () => {
    const btn = document.getElementById('lib-density-btn');
    const isDensity = btn.textContent === '[DENSITY]';
    btn.textContent = isDensity ? '[CATEGORIES]' : '[DENSITY]';
    buildLibrary();
});

function buildLibrary() {
    const isDensity = document.getElementById('lib-density-btn').textContent === '[CATEGORIES]';
    const tabs = document.getElementById('lib-tabs');
    const grid = document.getElementById('lib-grid');
    const preview = document.getElementById('lib-preview');
    tabs.innerHTML = ''; grid.innerHTML = '';
    preview.className = 'lib-preview';

    if (isDensity) {
        preview.className = 'lib-preview density-preview';
        buildDensityGrid(grid, preview);
        return;
    }

    ASCII_LIBRARY.forEach((entry, idx) => {
        const tab = document.createElement('div');
        tab.className = 'lib-tab' + (idx === 0 ? ' active' : '');
        tab.textContent = entry.cat + ' (' + entry.chars.length + ')';
        tab.addEventListener('click', () => {
            tabs.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showCategoryChars(entry, grid, preview);
        });
        tabs.appendChild(tab);
    });

    showCategoryChars(ASCII_LIBRARY[0], grid, preview);
}

function buildDensityGrid(grid, preview) {
    const ranges = [
        [33, 126],      // ASCII printable
        [9472, 9599],   // Box Drawing
        [9600, 9631],   // Block Elements
        [10240, 10495]  // Braille Patterns
    ];
    let lastChar = null;

    ranges.forEach(range => {
        for (let code = range[0]; code <= range[1]; code++) {
            const char = String.fromCharCode(code);
            const density = calculateDensity(char);
            const map = getDensityMapping(density);
            const div = document.createElement('div');
            div.className = 'density-cell';
            div.style.backgroundColor = map.color + '22';
            div.style.borderColor = map.color;
            div.style.color = map.color;
            div.textContent = char;
            div.dataset.density = density.toFixed(1);
            div.dataset.cls = map.cls;
            div.dataset.hex = '0x' + code.toString(16).toUpperCase();
            div.title = `'${char}' — ${density.toFixed(1)}% — ${map.cls}`;

            div.addEventListener('click', () => {
                lastChar = char;
                preview.innerHTML = `<div class="density-inspector">
                    <div class="di-char" style="color:${map.color}; text-shadow:0 0 20px ${map.color}">${char}</div>
                    <div class="di-rows">
                        <div class="di-row"><span class="di-label">HEX</span><span class="di-value">${div.dataset.hex}</span></div>
                        <div class="di-row"><span class="di-label">DENSITY</span><span class="di-value">${div.dataset.density}%</span></div>
                        <div class="di-row"><span class="di-label">CLASS</span><span class="di-value" style="color:${map.color}">${map.cls}</span></div>
                        <div class="di-row"><span class="di-label">SOUND</span><span class="di-value">${map.desc}</span></div>
                    </div>
                </div>`;
                if (selectedCell) {
                    const { node, layer, step } = selectedCell;
                    if (!node.pattern[layer]) node.pattern[layer] = [];
                    node.pattern[layer][step] = char;
                    pushState(); render();
                }
            });

            grid.appendChild(div);
        }
    });

    if (!lastChar) {
        preview.innerHTML = '<span class="preview-info">← Select a character from the density grid above</span>';
    }
}

function showCategoryChars(entry, grid, preview) {
    grid.innerHTML = '';
    for (const ch of entry.chars) {
        const div = document.createElement('div');
        div.className = 'lib-char';
        div.textContent = ch;
        div.addEventListener('click', () => {
            const dict = ASCII_DICTIONARY[ch];
            let detail = `Char: <b>'${ch}'</b> | Cat: ${entry.cat}`;
            if (dict) {
                detail += ` | Type: ${dict.type}`;
                if (dict.wave) detail += ` | Wave: ${dict.wave}`;
                if (dict.color) detail += ` | Color: ${dict.color}`;
                if (dict.harmonics !== undefined) detail += ` | Harm: ${dict.harmonics}`;
                if (dict.action) detail += ` | Action: ${dict.action}`;
                if (dict.filter && dict.filter !== 'none') detail += ` | Filter: ${dict.filter}`;
                detail += ` | ${entry.dsp}`;
            } else {
                const p = asciiToParams(ch);
                detail += ` | Wave: ${p.wave} | Amp: ${p.amp.toFixed(2)} | Env: ${p.env}`;
            }
            preview.innerHTML = `<span class="preview-info">${detail}</span>`;
            if (selectedCell) {
                const { node, layer, step } = selectedCell;
                if (!node.pattern[layer]) node.pattern[layer] = [];
                node.pattern[layer][step] = ch;
                pushState(); render();
            }
        });
        grid.appendChild(div);
    }
    preview.innerHTML = '<span class="preview-info">' + entry.cat + ': ' + entry.desc + ' — ' + entry.dsp + '</span>';
}

// ─── CHANNEL STRIP ──────────────────────────────────────────────────────────
function renderChannelStrip() {
    const list = document.getElementById('channel-list');
    list.innerHTML = '';
    state.nodes.forEach((node, idx) => {
        const entry = document.createElement('div');
        entry.className = 'channel-entry';
        entry.innerHTML = `
            <span class="ch-label">${node.title}</span>
            <input type="text" class="ch-vol" value="${Math.round(node.vol*100)}" data-idx="${idx}">
            <input type="text" class="ch-pan" value="${Math.round(node.pan*100)}" data-idx="${idx}">
        `;
        entry.querySelector('.ch-vol').addEventListener('change', function() {
            node.vol = Math.max(0, Math.min(2, parseFloat(this.value)/100));
            pushState(); render();
        });
        entry.querySelector('.ch-pan').addEventListener('change', function() {
            node.pan = Math.max(-1, Math.min(1, parseFloat(this.value)/100));
            pushState(); render();
        });
        list.appendChild(entry);
    });
}

// ─── ADD NODES ──────────────────────────────────────────────────────────────
function addNode(type) {
    const newId = nextNodeId++;
    const off = (state.nodes.length % 5) * 40;
    const n = {
        id:newId, type, title:(type==='sequencer'?'SEQ':type==='generator'?'GEN':'FX')+' '+newId,
        x:80+off, y:80+off, w:320, h:type==='fx'?80:120,
        channels:1, steps:type==='fx'?0:16, bpm:state.bpm,
        pattern:type==='fx'?[]:Array.from({length:3},()=>Array(16).fill('')),
        layers:type==='fx'?[]:Array.from({length:3},()=>Array(16).fill('')),
        vol:0.7, pan:0.0, fx:{ rev:0, dly:0, dist:0 }
    };
    state.nodes.push(n); pushState(); render();
}
document.querySelectorAll('.add-node-btn').forEach(btn => {
    btn.addEventListener('click', () => addNode(btn.dataset.type));
});

// ─── AFFINITY TOGGLE ────────────────────────────────────────────────────────
document.getElementById('affinity-toggle').addEventListener('click', () => {
    document.getElementById('affinity-panel').classList.toggle('hidden');
});
document.getElementById('affinity-root').addEventListener('change', (e) => {
    state.affinity.root = e.target.value; pushState(); render();
});
document.getElementById('affinity-scale').addEventListener('change', (e) => {
    state.affinity.scale = e.target.value; pushState(); render();
});
document.getElementById('affinity-gate').addEventListener('change', (e) => {
    state.affinity.gate = e.target.value === 'ON'; pushState(); render();
});

// ─── TRANSPORT ──────────────────────────────────────────────────────────────
const player = new AsciiPlayer();

function compileAndPlay() {
    const bpm = state.bpm || 140;
    const allEvents = [];
    state.nodes.forEach(node => {
        if (node.type === 'fx') return;
        const events = compileNodePattern(node, node.bpm || bpm);
        events.forEach(e => { if (!e.character && e.events) { e.events.forEach(evt => { evt._nodeId = node.id; }); } });
        allEvents.push(...events);
    });
    allEvents.sort((a,b) => a.time - b.time);

    const rootIdx = NOTE_NAMES.indexOf(state.affinity.root);
    const scaleNotes = SCALES[state.affinity.scale] || SCALES.chromatic;
    player.rootMidi = 48 + (rootIdx >= 0 ? rootIdx : 0);
    player.scaleIntervals = scaleNotes;
    player.onStep = (step) => { currentStep = step; renderStepHighlight(); renderMasterClock(); };
    player.play(allEvents, bpm);
}

function renderStepHighlight() {
    document.querySelectorAll('.seq-grid .cell').forEach(c => {
        c.classList.remove('step-active');
        if (parseInt(c.dataset.step) === currentStep) c.classList.add('step-active');
    });
}

document.getElementById('play-btn').addEventListener('click', () => {
    state.playing = !state.playing;
    if (state.playing) {
        compileAndPlay();
    } else {
        player.stop();
    }
    if (window.__JUCE__ && window.__JUCE__.backend && window.__JUCE__.backend.play)
        window.__JUCE__.backend.play();
    pushState(); render();
});
document.getElementById('stop-btn').addEventListener('click', () => {
    state.playing = false; player.stop(); pushState(); render();
});
document.getElementById('bpm-input').addEventListener('change', (e) => {
    state.bpm = Math.max(20, Math.min(999, parseInt(e.target.value)||140));
    if (state.playing) compileAndPlay();
    pushState(); render();
});

// ─── UNDO / REDO / SAVE / LOAD ──────────────────────────────────────────────
function pushState() { db.push(state); updateUndoRedo(); }
document.getElementById('undo-btn').addEventListener('click', () => {
    const s = db.undo(); if (s) { state = s; render(); }
});
document.getElementById('redo-btn').addEventListener('click', () => {
    const s = db.redo(); if (s) { state = s; render(); }
});
document.getElementById('save-btn').addEventListener('click', () => {
    localStorage.setItem('rawpearl5_state', JSON.stringify(state));
});
document.getElementById('load-btn').addEventListener('click', () => {
    const raw = localStorage.getItem('rawpearl5_state');
    if (raw) { try { state = JSON.parse(raw); db.push(state); render(); } catch(e){} }
});

// ─── COMMAND LINE ───────────────────────────────────────────────────────────
const cmdInput = document.getElementById('cmd-input');
const cmdTarget = document.getElementById('cmd-target');

cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = cmdInput.value.trim();
        if (!cmd) return;
        const parsed = parseCommand(cmd);
        if (!parsed) { cmdInput.style.color = '#ff4444'; setTimeout(() => cmdInput.style.color = '', 800); return; }
        cmdInput.style.color = '#44ff44';
        setTimeout(() => cmdInput.style.color = '', 500);

        state.nodes.forEach(node => applyCommandToNode(node, parsed));
        pushState(); render();
        cmdInput.value = '';
    }
    if (e.key === 'F1') {
        e.preventDefault();
        showCmdHelp();
    }
});

function showCmdHelp() {
    const help = [
        '── COMMANDS ─────────────────────────────',
        'euclid(ch, pulses, steps)  Euclidean rhythm',
        'fill(ch)                   Fill all steps with char',
        'random(chars)              Random fill from charset',
        'pattern(str, steps)        Repeat pattern',
        'scale(n1,n2,...)           Scale pattern from numbers',
        'sweep(param, from, to)     Parameter sweep',
        'gate(on|off)               Toggle affinity gate',
        'clear                      Clear all patterns',
        '',
        'Examples:',
        '  euclid(#,3,8)   ->  |#..#.#..|',
        '  fill(w)         ->  |wwwwwwww|',
        '  random(.oO#@)   ->  random density',
        '  pattern(.-,16)  ->  |.-.-.-.-...|',
        '──────────────────────────────────────────'
    ].join('\n');
    alert(help);
}

document.getElementById('cmd-help').addEventListener('click', showCmdHelp);

// ─── CANVAS PANNING ─────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
let isDraggingCanvas = false;
let pan = { x:0, y:0 };

container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.node') || e.target.closest('#tool-palette') || e.target.closest('.tool-btn')) return;
    isDraggingCanvas = true;
});
window.addEventListener('mouseup', () => isDraggingCanvas = false);
window.addEventListener('mousemove', (e) => {
    if (isDraggingCanvas) { pan.x += e.movementX; pan.y += e.movementY; container.style.transform = `translate(${pan.x}px,${pan.y}px)`; }
});

// ─── IPC BACKEND ────────────────────────────────────────────────────────────
function syncWithBackend() {
    if (window.__JUCE__ && window.__JUCE__.backend && window.__JUCE__.backend.syncState)
        window.__JUCE__.backend.syncState(JSON.stringify(state));
}

// ─── INIT ───────────────────────────────────────────────────────────────────
render();
