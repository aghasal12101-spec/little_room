// Rules, floor plans, sample designs and save handling for the New York apartments.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const context = { console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/rules.js', 'utf8') + '\n' + fs.readFileSync('src/data.js', 'utf8') + '\nglobalThis.defs = byId; globalThis.plans = layouts;', context);
const { RoomRules: R, defs, plans } = context;
let checks = 0, n = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const dbg = (label, v) => { if (process.env.DEBUG) console.log(label, v); return v; };
const f = (type, x, z, rot = 0, extra = {}) => ({ id: 't' + (++n), type, x, z, rot, y: .03, color: defs[type].color, ...extra });
const plan = id => plans.find(l => l.id === id);
const empty = (layout, mode = 'free', contract = 'coder') => ({ layout, mode, contract, round: 1, roundRules: 2, night: false, curtains: false, wall: '#e8e5d7', floor: '#c7aa80', furniture: [] });
const why = (s, o) => R.reason(o, { ...s, furniture: [...s.furniture, o] }, defs, plans);
const wallAt = (id, vertical, line, along) => plan(id).wallInfo.findIndex(w => w.vertical === vertical && Math.abs(w.line - line) < .01 && along > w.lo && along < w.hi);

/* Floor plans */
check(plans.length === 6, 'six floor plans');
for (const l of plans) {
  const contract = Object.values(R.contracts).find(c => c.layout === l.id);
  check(!!contract, l.id + ' used by a commission');
  check(l.rooms.some(r => r.kind === 'bath'), l.id + ' has a bathroom');
  check(l.fixtures.some(fx => fx.type === 'kitchen'), l.id + ' has a built-in kitchen');
  check(l.doors.filter(d => d.kind === 'entry').length === 1, l.id + ' has one entry door');
  check(l.windows.length >= 1 && l.windows.every(w => l.wallInfo[w.wall].exterior), l.id + ' windows sit on exterior walls');
  check(R.inside(l, l.entry[0], l.entry[1], .2), l.id + ' entry point inside');
  check(l.walls.length === l.wallInfo.length, l.id + ' wall metadata aligned');
  check(l.obstacles.every(o => R.inside(l, o.x, o.z) || l.rooms.some(r => r.kind === 'bath' && o.x > r.rect[0] && o.x < r.rect[1] && o.z > r.rect[2] && o.z < r.rect[3])), l.id + ' fixtures inside the apartment');
  check(Math.abs(l.w / 2 + Math.min(...l.rooms.map(r => r.rect[0]))) < 1e-9 && Math.abs(l.d / 2 + Math.min(...l.rooms.map(r => r.rect[2]))) < 1e-9, l.id + ' plan centred');
  const flow = R.circulation(empty(l.id), defs, plans);
  check(flow.entry && flow.score === 100, l.id + ' empty apartment fully reachable from the door: ' + JSON.stringify(flow));
  for (const r of l.rooms.filter(r => r.kind !== 'bath')) {
    const [x1, x2, z1, z2] = r.rect;
    check(R.connection({ id: 'a', x: l.entry[0], z: l.entry[1] }, { id: 'b', x: (x1 + x2) / 2, z: (z1 + z2) / 2 }, empty(l.id), defs, plans) || flow.score === 100, l.id + ' ' + r.name + ' reachable');
  }
  for (const [name, rect] of Object.entries(l.zones)) check(rect[0] < rect[1] && rect[2] < rect[3], l.id + ' zone ' + name);
}

/* Placement rules */
let s = empty('studio');
check(!why(s, f('sofa', -1, 0)), 'free floor accepts a sofa');
check(why(s, f('chair', 2.8, 1.8)).includes('边界'), 'bathroom is not furnishable');
check(why(s, f('stool', 3.1, -2.0)).includes('橱柜'), 'kitchen cabinets block furniture');
check(why(s, f('stool', -2.2, -2.55)).includes('暖气片'), 'radiators block furniture');
check(why(s, f('stool', .05, 2.6)).includes('壁橱'), 'closet blocks furniture');
check(!!why(s, f('sofa', 3.0, 0)), 'kitchen boundary checked');
s.furniture = [f('sofa', -1, 0)];
check(why(s, f('chair', -1, 0)).includes('沙发'), 'named furniture collision');
check(!why(s, f('rug', -1, 0)), 'rugs slide under furniture');
s = empty('suite');
check(why(s, f('chair', 1, -1.5)).includes('隔墙'), 'interior wall blocks furniture');
check(!why(s, f('stool', 1.55, .3)), 'doorway lets furniture straddle the threshold');
check(why(s, f('stool', 1.15, -.1)).includes('门'), 'open door leaf is kept clear');
check(!why(s, f('bed', 3.06, -1.9, 3)), 'bed fits the bedroom');
s = empty('loft');
check(!why(s, f('bench', -1.5, 1.0)), 'kitchen floor is furnishable');

/* Wall-hung items */
const art = (layout, vertical, line, along, side, y = 1.2) => {
  const i = wallAt(layout, vertical, line, along);
  return f('art', vertical ? line + side * .1 : along, vertical ? along : line + side * .1, vertical ? (side > 0 ? 1 : 3) : side > 0 ? 0 : 2, { wallIndex: i, y });
};
s = empty('studio');
check(!why(s, art('studio', false, -3, -1.0, 1)), 'art between windows');
check(why(s, art('studio', false, -3, -2.2, 1)).includes('窗'), 'windows stay clear');
check(!!why(s, art('studio', false, -3, -1.0, -1)), 'outside face rejected');
check(!!why(s, art('studio', false, -3, -1.0, 1, 2.2)), 'art below the ceiling line');
check(!why(s, art('studio', true, 2.0, 2.5, -1)), 'living-room face of the bathroom wall');
check(why(s, art('studio', true, 2.0, 2.5, 1)).includes('室内'), 'bathroom face rejected');
check(why(s, art('studio', true, 3.6, 1.8, -1)).includes('室内'), 'bathroom stretch of a long exterior wall rejected');
check(why(s, art('studio', true, 3.6, -.6, -1, 1.6)).includes('橱柜'), 'wall cabinets block art');
s = empty('suite');
check(!why(s, art('suite', true, 1.0, -2, -1)) && !why(s, art('suite', true, 1.0, -2, 1)), 'interior walls hang art on both faces');
s = empty('balcony');
check(why(s, art('balcony', false, -2.4, -3, 1)).includes('玻璃'), 'glass wall rejects art');
s = empty('kitchen');
check(why(s, art('kitchen', true, -4, 1.7, 1, .9)).includes('壁炉'), 'mantel area protected');
check(!why(s, art('kitchen', true, -4, 1.7, 1, 1.5)), 'art above the mantel');
const a1 = art('studio', false, -3, -1.0, 1);
s = { ...empty('studio'), furniture: [a1] };
check(why(s, { ...art('studio', false, -3, -.8, 1), id: 'other' }).includes('山野'), 'wall items collide');

/* Surfaces, rotation, groups */
s = empty('studio');
const table = f('desk', -1, 0), vase = f('vase', -.7, 0, 0, { parentId: table.id, y: .815 });
s.furniture = [table, vase];
check(!R.reason(vase, s, defs, plans), 'surface placement');
check(!!R.reason({ ...vase, parentId: undefined }, s, defs, plans), 'vase needs a host');
check(!!R.reason({ ...vase, x: -.32 }, s, defs, plans), 'table edge');
check(!!R.reason({ ...vase, y: .2 }, s, defs, plans), 'surface height');
let moved = R.transformFamily(table, { ...table, x: 0, z: 1, rot: 1 }, s), child = moved[1];
check(Math.abs(child.x) < 1e-9 && Math.abs(child.z - .7) < 1e-9 && child.rot === 1, 'attached piece follows a rotated host');
check(!R.reason(child, { ...s, furniture: moved }, defs, plans), 'rotated attachment valid');
s.furniture = [f('desk', 0, 0, .5)];
s.furniture.push(f('books', 0, 0, .5, { parentId: s.furniture[0].id, y: .815 }));
check(!R.reason(s.furniture[1], s, defs, plans), '45° surface');
moved = R.transformFamily(s.furniture[0], { ...s.furniture[0], x: .5, z: .5, rot: 1 / 6 }, s);
check(moved.every(o => !R.reason(o, { ...s, furniture: moved }, defs, plans)), '15° attached rotation');
check(R.validate({ ...s, furniture: moved }, defs, plans).furniture.length === 2, 'fractional rotation roundtrip');
const dn = f('dining', 0, 0, 0, { groupId: 'set' }), ch = f('stool', 1.1, 0, 0, { groupId: 'set' }), dv = f('vase', 0, 0, 0, { parentId: dn.id, y: .815 });
s.furniture = [dn, ch, dv];
moved = R.transformFamily(dn, { ...dn, x: -.5, z: .5, rot: .5 }, s);
check(moved.every(o => !R.reason(o, { ...s, furniture: moved }, defs, plans)), 'group rotation collision');
check(R.familyIds(ch, s).size === 3, 'chair moves the whole group');

/* Spatial relationships */
s = { ...empty('suite'), furniture: [f('desk', .4, -1.5, 1), f('stool', 1.45, -1.5, 3)] };
check(R.relationships(s, defs, plans).blockers > 0, 'wall between desk and chair');
s = { ...empty('studio'), furniture: [f('desk', -1.75, 0, 1), f('desk', -.25, 0, 1), f('stool', -1, 1, 2)] };
let rel = R.relationships(s, defs, plans);
check(rel.pairs.length === 1 && rel.blockers === 1, 'one chair cannot serve two desks');
s.furniture = [f('desk', -1, 0), f('stool', -1, 1.4, 2), f('plant', -1, .7)];
check(R.relationships(s, defs, plans).blockers > 0, 'furniture blocks the work area');
s.furniture = [f('desk', -1, 0), f('stool', -1, 1, 2 + 1 / 6)];
const s15 = R.relationships(s, defs, plans).score;
s.furniture[1].rot = 2.5;
const s45 = R.relationships(s, defs, plans).score;
check(s15 > s45 && s45 > 80 && s45 < 100, 'graduated angle scoring');
s.furniture = [f('desk', -1, 0), f('stool', -1, 1, 2), f('cabinet', -1, 1.7)];
check(R.relationships(s, defs, plans).details.some(d => d.message.includes('拉出空间')), 'chair pull-out clearance');
s = { ...empty('suite'), furniture: [f('tv', .4, -1.5, 1), f('sofa', 1.9, -1.5, 3)] };
check(R.relationships(s, defs, plans).blockers > 0, 'no TV through a wall');
s = { ...empty('studio'), furniture: [f('sofa', -1, -1), f('tv', -1, 1.2, 2), f('coffee', -1, .1)] };
check(R.relationships(s, defs, plans).blockers === 0, 'low coffee table keeps the view');
s = { ...empty('studio'), furniture: [f('wardrobe', 1.25, 2.3, 2)] };
check(!R.evaluate(s, defs, plans).flow.entry, 'blocking the entry door is detected');

/* Progress */
for (const [badges, level] of [[[], 1], [['coder'], 2], [['coder', 'coder'], 2], [['coder', 'cats', 'rental'], 3], [['coder', 'cats', 'rental', 'chef', 'balcony'], 4]])
  check(R.progress(badges).level === level, 'progress level ' + level);
check(R.progress(['invalid', 'free']).xp === 0, 'free badge awards no xp');

/* Sample designs for all six commissions, plus their second rounds */
const designs = require('./tests/designs.cjs')(defs, plans);
const results = [];
for (const [id, d] of Object.entries(designs)) {
  for (const o of d.furniture) check(!R.reason(o, d, defs, plans), id + ' ' + o.type + ': ' + R.reason(o, d, defs, plans));
  check(R.goals(d, defs, plans).every(g => g[1]), id + ' goals achievable');
  check(R.total(d, defs) <= R.budget(d), id + ' within budget');
  const result = R.evaluate(d, defs, plans);
  check(result.complete, id + ' completable: ' + result.tips.join(' / '));
  check(result.space.score === 100, id + ' spatial relationships');
  check(result.stars >= 2, id + ' earns stars');
  const restored = R.validate(JSON.parse(JSON.stringify(d)), defs, plans);
  check(restored.furniture.every((o, i) => Object.keys(d.furniture[i]).every(k => o[k] === d.furniture[i][k])), id + ' save roundtrip');
  results.push([R.contracts[id].name, R.total(d, defs), R.budget(d), result.score, result.stars]);
  fs.writeFileSync('tests/v6-' + id + '.json', JSON.stringify({ format: 'little-room', version: 5, name: R.contracts[id].name + ' · 示范', state: d, progress: { badges: [] } }, null, 2));
}
// Second rounds: add the encore requirement next to the sample design.
function canAdd(s, o) { const t = { ...s, furniture: [...s.furniture, o] }; return !R.reason(o, t, defs, plans) && R.total(t, defs) <= R.budget(t); }
function addFloor(s, type, predicate = () => true) {
  const l = plan(s.layout);
  for (let z = -l.d / 2 + .3; z < l.d / 2 - .2; z += .1) for (let x = -l.w / 2 + .3; x < l.w / 2 - .2; x += .1) for (const rot of [0, 1, 2, 3]) {
    const o = f(type, Math.round(x * 100) / 100, Math.round(z * 100) / 100, rot);
    if (!predicate(o) || !canAdd(s, o)) continue;
    const next = { ...s, furniture: [...s.furniture, o] }, flow = R.circulation(next, defs, plans);
    if (flow.entry && flow.score >= 85 && !flow.inaccessible.length && R.relationships(next, defs, plans).blockers === 0) { s.furniture.push(o); return o; }
  }
  throw Error('No room for ' + type + ' in ' + s.contract);
}
function attach(s, type, parent) {
  for (const dx of [0, .25, -.25, .4, -.4]) for (const dz of [0, .1, -.1]) {
    const o = f(type, parent.x + dx, parent.z + dz, parent.rot, { parentId: parent.id, y: parent.y + defs[parent.type].surface });
    if (canAdd(s, o)) { s.furniture.push(o); return o; }
  }
  throw Error('No surface for ' + type);
}
const near = (a, b, d) => Math.hypot(a.x - b.x, a.z - b.z) <= d;
for (const [id, base] of Object.entries(designs)) {
  const d = JSON.parse(JSON.stringify(base));
  d.round = 2; d.roundRules = 2;
  const find = t => d.furniture.find(o => o.type === t);
  if (id === 'coder') { addFloor(d, 'lounge'); const stand = addFloor(d, 'nightstand', o => near(o, find('bed'), 1.5)); attach(d, 'pendant', stand); }
  if (id === 'cats') addFloor(d, 'nightstand', o => R.inZone(plan('suite'), 'bedroom', o) && near(o, find('bed'), 1.6) && o.z - find('bed').z > .6);
  if (id === 'balcony') addFloor(d, 'chair', o => R.inZone(plan('balcony'), 'balcony', o));
  if (id === 'duo') for (const desk of d.furniture.filter(o => o.type === 'desk')) attach(d, 'books', desk);
  if (id === 'chef') { const t = find('dining'); for (const z of [t.z - .9]) { const o = f('stool', t.x, z, 0); check(canAdd(d, o), 'extra dining chair'); d.furniture.push(o); } addFloor(d, 'stool', o => near(o, t, 1.4) && Math.sin(o.rot * Math.PI / 2) * (t.x - o.x) + Math.cos(o.rot * Math.PI / 2) * (t.z - o.z) > .5 * Math.hypot(t.x - o.x, t.z - o.z)); }
  if (id === 'rental') { d.furniture = d.furniture.filter(o => !['chair', 'lamp'].includes(o.type)); addFloor(d, 'bench'); const stand = addFloor(d, 'nightstand', o => near(o, find('bed'), 1.5)); attach(d, 'pendant', stand); }
  const result = R.evaluate(d, defs, plans);
  check(result.complete, id + ' second round feasible: ' + result.tips.join(' / '));
  check(R.total(d, defs) <= R.budget(d), id + ' second-round budget');
  check(R.validate(d, defs, plans).roundRules === 2, id + ' second-round rules persist');
  results.push([R.contracts[id].name + '（二周目）', R.total(d, defs), R.budget(d), result.score, result.stars]);
}

/* Saves: validation, legacy repair */
const coder = designs.coder;
let bad = JSON.parse(JSON.stringify(coder)); bad.furniture.push({ ...bad.furniture[0] });
assert.throws(() => R.validate(bad, defs, plans)); checks++;
bad = JSON.parse(JSON.stringify(coder)); bad.furniture.find(o => o.parentId).parentId = 'missing';
assert.throws(() => R.validate(bad, defs, plans)); checks++;
bad = JSON.parse(JSON.stringify(coder)); bad.furniture[0].color = '<img>';
assert.throws(() => R.validate(bad, defs, plans)); checks++;
assert.throws(() => R.validate({ ...coder, furniture: [{ ...coder.furniture[0], rot: .123 }] }, defs, plans)); checks++;
const legacyPet = R.validate({ ...empty('studio'), pet: true, furniture: [f('lamp', -1, 1, 0, { on: false }), { id: 'cat', type: 'catbed', x: 0, z: 0, y: .03, rot: 0, color: '#b8c49c' }] }, defs, plans);
check(legacyPet.furniture.length === 1 && legacyPet.furniture[0].on === false && !('pet' in legacyPet), 'legacy pet content removed, lamp state kept');
const legacy = JSON.parse(fs.readFileSync('tests/legacy-v5-coder.json', 'utf8')).state;
assert.throws(() => R.validate(legacy, defs, plans)); checks++;
const repaired = R.repair(legacy, defs, plans);
check(repaired.removed > 0 && repaired.removed < legacy.furniture.length, 'legacy save repaired: ' + repaired.removed + ' removed');
check(repaired.state.furniture.every(o => !R.reason(o, repaired.state, defs, plans)), 'repaired save is valid');
check(repaired.state.furniture.every(o => !o.parentId || repaired.state.furniture.some(p => p.id === o.parentId)), 'no orphaned attachments after repair');
check(R.repair(coder, defs, plans).removed === 0, 'valid saves are untouched by repair');

fs.writeFileSync('tests/results.json', JSON.stringify(results, null, 1));
for (const r of results) console.log(r[0].padEnd(16, '　'), '¥' + r[1], '/ ¥' + r[2], 'score', r[3], '★'.repeat(r[4]));
console.log(checks + ' rule / floor-plan / design / save checks passed');
