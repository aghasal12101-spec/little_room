// Runs the real browser-side helpers against small adapters: guide, portfolio transactions, model reuse and frame scheduling.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
let count = 0, n = 0;
const check = (v, m) => { assert.ok(v, m); count++; };
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i + 1); assert.ok(i >= 0 && j > i, 'missing source span ' + a); return src.slice(i, j); };
const f = (type, x, z) => ({ id: 'r' + (++n), type, x, z, rot: 0, y: .03, color: '#abcdef' });

// First-run guide, including undo-style state replacement and switching between portfolio slots.
const living = fs.readFileSync('src/living.js', 'utf8');
const tctx = { state: { furniture: [] }, library: { activeId: 'slot', slots: [{ id: 'slot' }] }, tutorial: null, writeLibrary: () => {}, focusTutorial: () => {}, renderTutorial: () => {}, toast: () => {} };
vm.createContext(tctx);
vm.runInContext(between(living, 'function cleanTutorial', 'function focusTutorial'), tctx);
vm.runInContext(between(living, 'function startTutorial', 'function renderTutorial'), tctx);
tctx.startTutorial(); check(tctx.tutorial.step === 0, 'guide starts');
tctx.state.furniture = [f('desk', 0, 0)]; tctx.syncTutorial(); check(tctx.tutorial.step === 1, 'guide advances');
tctx.state.furniture = []; tctx.syncTutorial(); check(tctx.tutorial.step === 0, 'undo rewinds the guide');
tctx.tutorial = null; tctx.resumeTutorial(); check(tctx.tutorial.step === 0, 'refresh resumes the guide');
tctx.library.activeId = 'other'; tctx.resumeTutorial(); check(tctx.tutorial === null && tctx.library.tutorialProgress.slotId === 'slot', 'switching slots suspends the guide');
tctx.library.activeId = 'slot'; tctx.resumeTutorial(); check(tctx.tutorial !== null, 'returning resumes the guide');

// Portfolio merge / replace with a storage that can fail.
const game = fs.readFileSync('src/game.js', 'utf8');
const original = { version: 2, slots: [{ id: 'a', state: {} }], activeId: 'a', badges: ['coder'], stars: { coder: 1 } };
const incoming = { ...original, slots: [{ id: 'a', state: {} }], badges: ['cats'], stars: { coder: 3, cats: 2 } };
const storage = new Map(); let fail = false;
const sc = { clone: v => JSON.parse(JSON.stringify(v)), uid: () => String(++n), library: original, persist: () => {}, clearTimeout: () => {}, thumbDebounce: null, saveDebounce: null,
  localStorage: { setItem: (k, v) => { if (fail && k === 'little-room-library-v2') throw Error('quota'); storage.set(k, v); } },
  toast: () => {}, history: [], future: [], restoreState: () => {}, renderLibrary: () => {}, currentSlot: () => ({ state: {} }) };
vm.createContext(sc);
vm.runInContext(between(game, 'function mergeLibraries', 'function applyPortfolio'), sc);
const merged = sc.mergeLibraries(original, incoming);
check(merged.slots.length === 2 && merged.slots[0].id !== merged.slots[1].id, 'merge avoids id collisions');
check(merged.stars.coder === 3 && merged.badges.length === 2, 'merge keeps the best progress');
check(original.slots.length === 1, 'merge leaves the source unchanged');
assert.throws(() => sc.mergeLibraries({ ...original, slots: Array(12).fill({ id: 'x' }) }, incoming)); count++;
fail = true; check(!sc.replacePortfolio(incoming) && sc.library === original, 'quota failure keeps the live portfolio');
fail = false; check(sc.replacePortfolio(incoming) && storage.has('little-room-recovery-portfolio'), 'replace keeps a rollback copy');
check(JSON.parse(storage.get('little-room-recovery-portfolio')).badges[0] === 'coder', 'rollback copy holds the original');

// Incremental furniture rebuild: moving reuses models, recolouring rebuilds one, deleting disposes one.
const scene = fs.readFileSync('src/scene.js', 'utf8');
let built = 0, disposed = 0;
const group = { children: [], add(g) { this.children.push(g); }, remove(g) { this.children = this.children.filter(x => x !== g); } };
const stubModel = () => { built++; return { userData: {}, position: { set() {} }, rotation: {}, children: [], traverse() {}, add() {} }; };
const pc = { state: { night: false, furniture: Array.from({ length: 200 }, (_, i) => ({ ...f('stool', i, 0), id: String(i) })) }, furnitureGroup: group, byId: { stool: {} },
  model: stubModel, disposeGroup: () => disposed++, drawOutline() {}, updateWalls() {}, updateUI() {}, requestFrame() {}, THREE: {} };
vm.createContext(pc);
vm.runInContext(between(scene, 'function rebuild', '// Wall-hung pieces'), pc);
pc.rebuild(); const identity = group.children[0];
pc.state.furniture[0].x = 1; pc.rebuild();
check(built === 200 && group.children[0] === identity, '200 pieces: moving reuses models');
pc.state.furniture[0].color = '#ffffff'; pc.rebuild();
check(built === 201 && disposed === 1, 'recolouring rebuilds one model');
pc.state.furniture.pop(); pc.rebuild();
check(group.children.length === 199 && disposed === 2, 'deleting disposes one model');

// Frame scheduling: requests coalesce, animation continues only while something moves, then idles.
const frames = []; let renders = 0, moving = 3;
const rc = { requestAnimationFrame: fn => frames.push(fn), document: { hidden: false }, renderer: { render: () => renders++ }, scene: {}, camera: {},
  stepCamera: () => moving-- > 0, stepWalls: () => false, THREE: { MathUtils: { clamp: (v, a, b) => Math.min(b, Math.max(a, v)) } } };
vm.createContext(rc);
vm.runInContext('let framePending = false, renderCount = 0, lastFrame = 0;\n' + between(scene, 'function requestFrame', 'function renderNow'), rc);
for (let i = 0; i < 100; i++) rc.requestFrame();
check(frames.length === 1, '100 render requests coalesce into one frame');
let t = 0; while (frames.length) frames.shift()(t += 16);
check(renders === 4, 'animates while the camera moves, then stops (' + renders + ' frames)');
rc.requestFrame(); frames.shift()(t);
check(renders === 5 && frames.length === 0, 'idle scene renders once per request');
moving = 2; rc.requestFrame(); frames.shift()(t); while (frames.length) frames.shift()(t);
check(renders === 8, 'identical timestamps still settle (no stalled animation)');

console.log(count + ' guide / portfolio / model reuse / frame scheduling checks passed');
