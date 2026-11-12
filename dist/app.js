import * as THREE from './vendor/three.module.js';
/* Furniture catalogue and New York floor plans. Pure data: no rendering or browser dependencies. */
const palette = ['#b8c49c', '#e3cbb1', '#bd8770', '#a3b6bd', '#e3ddd0', '#7b8871'];
const items = [
  ['sofa', '云朵双人沙发', '客厅', 2200, 2.2, .95, 'sofa', '#b8c49c'],
  ['chair', '豆豆休闲椅', '客厅', 950, .9, .9, 'chair', '#e3cbb1'],
  ['coffee', '原木圆角茶几', '客厅', 680, 1.25, .7, 'coffee', '#c59d70'],
  ['tv', '橡木电视柜', '客厅', 1400, 1.9, .5, 'tv', '#c59d70'],
  ['shelf', '格子书架', '收纳', 1200, 1.15, .42, 'shelf', '#c59d70'],
  ['plant', '琴叶榕', '装饰', 320, .65, .65, 'plant', '#7b9364'],
  ['rug', '奶油编织地毯', '装饰', 450, 2.5, 1.8, 'rug', '#e1ceb0'],
  ['lamp', '暖光落地灯', '灯具', 580, .48, .48, 'lamp', '#e8d2a3'],
  ['bed', '慢眠双人床', '卧室', 3200, 1.8, 2.15, 'bed', '#e3cbb1'],
  ['nightstand', '床边小方柜', '卧室', 480, .5, .5, 'nightstand', '#c59d70'],
  ['wardrobe', '百叶衣柜', '收纳', 2100, 1.6, .62, 'wardrobe', '#d9d3bc'],
  ['desk', '日光书桌', '书房', 1250, 1.4, .65, 'desk', '#c59d70'],
  ['stool', '弧背书椅', '书房', 380, .5, .52, 'stool', '#b8c49c'],
  ['dining', '慢食餐桌', '客厅', 1350, 1.4, .85, 'dining', '#c59d70'],
  ['bench', '长凳小憩', '客厅', 620, 1.2, .4, 'bench', '#b8c49c'],
  ['mirror', '穿衣镜', '装饰', 750, .65, .32, 'mirror', '#d0b284'],
  ['side', '蘑菇边几', '客厅', 420, .5, .5, 'side', '#c3997b'],
  ['cactus', '仙人掌小景', '装饰', 260, .48, .48, 'cactus', '#819a68'],
  ['pendant', '纸灯小夜曲', '灯具', 390, .36, .36, 'tablelamp', '#e8d7b1'],
  ['cabinet', '复古边柜', '收纳', 1500, 1.2, .5, 'cabinet', '#b58b70'],
  ['beanbag', '懒人软包', '卧室', 780, 1.0, 1.0, 'beanbag', '#bd8770'],
  ['screen', '木格屏风', '装饰', 880, 1.4, .3, 'screen', '#ba9a74'],
  ['runner', '条纹长毯', '装饰', 360, 1.1, 2.5, 'rug', '#a3b6bd'],
  ['flowers', '花与小圆台', '装饰', 340, .48, .48, 'flowers', '#e3cbb1'],
  ['vase', '一枝花的日常', '桌面', 180, .22, .22, 'vase', '#bd8770'],
  ['books', '桌边读物', '桌面', 120, .3, .22, 'books', '#a3b6bd'],
  ['deskplant', '小小绿洲', '桌面', 160, .24, .24, 'deskplant', '#b8c49c'],
  ['art', '山野抽象画', '墙饰', 260, .75, .08, 'art', '#bd8770'],
  ['clock', '木边挂钟', '墙饰', 220, .4, .08, 'clock', '#e3cbb1'],
].map(([id, name, cat, price, w, d, type, color]) => ({ id, name, cat, price, w, d, type, color }));
const heights = { sofa: .9, chair: .9, coffee: .53, tv: 1.35, shelf: 1.84, plant: 1.5, rug: .03, lamp: 1.65, bed: 1, nightstand: .5, wardrobe: 2, desk: 1.1, stool: .95, dining: .8, bench: .5, mirror: 1.75, side: .5, cactus: 1.1, pendant: .6, cabinet: 1.25, beanbag: .85, screen: 1.7, runner: .03, flowers: .9, vase: .45, books: .13, deskplant: .46, art: .65, clock: .4 };
const surfaces = { coffee: .445, desk: .785, dining: .785, nightstand: .48, cabinet: .8, side: .49 };
for (const def of items) {
  def.h = heights[def.id];
  def.surface = surfaces[def.id] || 0;
  def.mount = ['vase', 'books', 'deskplant'].includes(def.id) ? 'surface' : ['art', 'clock'].includes(def.id) ? 'wall' : 'floor';
  if (def.id === 'pendant') { def.cat = '桌面'; def.optionalSurface = true; }
}
items.push(
  { id: 'counter', name: '备餐中岛', cat: '厨房', price: 1650, w: 1.5, d: .65, type: 'counter', color: '#c5baa2', h: .9, surface: .9, mount: 'floor' },
  { id: 'fridge', name: '复古双门冰箱', cat: '厨房', price: 1800, w: .7, d: .7, type: 'fridge', color: '#e3ddd0', h: 1.75, mount: 'floor' },
  { id: 'lounge', name: '午后藤编椅', cat: '客厅', price: 1100, w: .9, d: .9, type: 'chair', color: '#bc9878', h: .9, mount: 'floor', level: 2 },
  { id: 'moonrug', name: '暮色织纹地毯', cat: '装饰', price: 580, w: 2.5, d: 1.8, type: 'rug', color: '#8e9ca8', h: .03, mount: 'floor', level: 2 },
  { id: 'blushsofa', name: '落日绒面沙发', cat: '客厅', price: 2400, w: 2.2, d: .95, type: 'sofa', color: '#c69688', h: .9, mount: 'floor', level: 3 },
  { id: 'nightcabinet', name: '深林收藏柜', cat: '收纳', price: 1700, w: 1.2, d: .5, type: 'cabinet', color: '#60796f', h: 1.25, surface: .8, mount: 'floor', level: 4 },
);
const byId = Object.fromEntries(items.map(i => [i.id, i]));

/*
 * Floor plans. Coordinates are metres; x runs left→right, z runs back (street side, negative) → front.
 * Every wall is an axis-aligned centre line 12 cm thick. Rooms are rectangles whose edges sit on wall lines.
 * plan() splits walls at door openings, attaches windows to wall segments and derives the
 * furnishable regions, collision obstacles and the outward side of exterior walls.
 */
const WALL_HEIGHT = 2.7, WALL_HALF = .06;
const KITCHEN_DEPTH = .64, MODULE_WIDTH = { fridge: .76, sink: .76, range: .76, dishwasher: .6, base: .45, wide: .6, slim: .3, compact: .51 };
function plan(spec) {
  const rooms = spec.rooms.map(([kind, name, x1, x2, z1, z2, floor]) => ({ kind, name, rect: [x1, x2, z1, z2], floor: floor || (kind === 'bath' ? 'hex' : kind === 'kitchen' ? 'checker' : kind === 'balcony' ? 'deck' : spec.floor || 'herringbone') }));
  const regions = rooms.filter(r => r.kind !== 'bath').map(r => r.rect);
  const inRect = ([x1, x2, z1, z2], x, z) => x > x1 && x < x2 && z > z1 && z < z2;
  const inRooms = (list, x, z) => list.some(r => inRect(r, x, z));
  const doors = spec.doors.map(([x, z, w, kind, hinge = -1, swing = 1]) => ({ x, z, w, kind, hinge, swing }));
  const walls = [], wallInfo = [];
  for (const [x1, z1, x2, z2, kind] of spec.walls) {
    const vertical = x1 === x2, line = vertical ? x1 : z1;
    const lo = vertical ? Math.min(z1, z2) : Math.min(x1, x2), hi = vertical ? Math.max(z1, z2) : Math.max(x1, x2);
    const cuts = doors.filter(d => (vertical ? Math.abs(d.x - line) < 1e-6 && d.z > lo && d.z < hi : Math.abs(d.z - line) < 1e-6 && d.x > lo && d.x < hi))
      .map(d => { d.vertical = vertical; const c = vertical ? d.z : d.x; return [c - d.w / 2, c + d.w / 2]; })
      .sort((a, b) => a[0] - b[0]);
    let start = lo;
    const pieces = [];
    for (const [a, b] of cuts) { if (a - start > .02) pieces.push([start, a]); start = b; }
    if (hi - start > .02) pieces.push([start, hi]);
    for (const [a, b] of pieces) {
      walls.push(vertical ? [line, a, line, b] : [a, line, b, line]);
      const mid = (a + b) / 2, px = vertical ? line : mid, pz = vertical ? mid : line;
      const allRooms = rooms.map(r => r.rect), probe = .2;
      const plus = inRooms(allRooms, px + (vertical ? probe : 0), pz + (vertical ? 0 : probe));
      const minus = inRooms(allRooms, px - (vertical ? probe : 0), pz - (vertical ? 0 : probe));
      const plusRegion = inRooms(regions, px + (vertical ? probe : 0), pz + (vertical ? 0 : probe));
      const minusRegion = inRooms(regions, px - (vertical ? probe : 0), pz - (vertical ? 0 : probe));
      wallInfo.push({
        vertical, line, lo: a, hi: b, glass: kind === 'glass', brick: kind === 'brick',
        exterior: plus !== minus, outward: plus && !minus ? -1 : !plus && minus ? 1 : 0,
        shared: plusRegion && minusRegion,
        sides: [minusRegion ? -1 : 0, plusRegion ? 1 : 0].filter(Boolean),
        rooms: [minus, plus],
      });
    }
  }
  const windows = (spec.windows || []).map(([x, z, w, sill = .8, top = 2.3]) => {
    const i = wallInfo.findIndex(info => info.vertical ? Math.abs(info.line - x) < 1e-6 && z > info.lo && z < info.hi : Math.abs(info.line - z) < 1e-6 && x > info.lo && x < info.hi);
    if (i < 0) throw Error(spec.id + ': window off wall at ' + x + ',' + z);
    return { wall: i, x, z, w, sill, top, at: wallInfo[i].vertical ? z : x };
  });
  // Built-in fixtures become rectangular obstacles shared by collision, circulation and sight lines.
  const fixtures = [], obstacles = [];
  for (const fx of spec.fixtures || []) {
    if (fx.type === 'kitchen') {
      // A straight run of modules against a wall. side: which way the cabinets face (+1/-1 along the wall normal).
      const vertical = fx.axis === 'z', modules = [];
      let cursor = fx.from;
      for (const name of fx.modules) {
        const width = MODULE_WIDTH[name];
        modules.push({ name, a: cursor, b: cursor + width * fx.dir });
        cursor += width * fx.dir;
      }
      const a = Math.min(fx.from, cursor), b = Math.max(fx.from, cursor);
      const face = fx.line + fx.side * WALL_HALF, back = face, front = face + fx.side * KITCHEN_DEPTH;
      const run = { ...fx, vertical, modules, a, b, face: back, front };
      fixtures.push(run);
      const c = (a + b) / 2, len = b - a, depth = KITCHEN_DEPTH + .02;
      obstacles.push(vertical
        ? { x: (back + front) / 2, z: c, w: depth, d: len, h: fx.modules.includes('fridge') ? 1.8 : .92, wallTop: 2.25, name: '橱柜' }
        : { x: c, z: (back + front) / 2, w: len, d: depth, h: fx.modules.includes('fridge') ? 1.8 : .92, wallTop: 2.25, name: '橱柜' });
    } else if (fx.type === 'closet' || fx.type === 'radiator' || fx.type === 'fireplace') {
      const size = { closet: [fx.w, .62, 2.4], radiator: [fx.w, .16, .62], fireplace: [fx.w, .42, 1.25] }[fx.type];
      const [w, d, h] = size, vertical = fx.axis === 'z';
      // Placed flush against the wall line on the given side.
      const offset = fx.side * (WALL_HALF + d / 2 + (fx.type === 'radiator' ? .04 : 0));
      const item = vertical ? { x: fx.line + offset, z: fx.at, w: d, d: w } : { x: fx.at, z: fx.line + offset, w, d };
      fixtures.push({ ...fx, ...item, h, vertical });
      obstacles.push({ ...item, h, wallTop: fx.type === 'radiator' ? .7 : fx.type === 'fireplace' ? 1.3 : 2.4, name: { closet: '壁橱', radiator: '暖气片', fireplace: '壁炉' }[fx.type] });
    } else fixtures.push(fx);
  }
  // Interior doors stand open at 90°: the leaf is a thin obstacle so furniture never overlaps it.
  for (const d of doors) {
    if (d.kind !== 'room' && d.kind !== 'bath') continue;
    const hingeAt = (d.vertical ? d.z : d.x) + d.hinge * (d.w / 2 - .04), reach = d.w - .05;
    const leaf = d.vertical
      ? { x: d.x + d.swing * (WALL_HALF + reach / 2), z: hingeAt + d.hinge * -.025, w: reach, d: .05 }
      : { x: hingeAt + d.hinge * -.025, z: d.z + d.swing * (WALL_HALF + reach / 2), w: .05, d: reach };
    d.leaf = leaf;
    obstacles.push({ ...leaf, h: 2.05, wallTop: 0, name: '门' });
  }
  const xs = rooms.flatMap(r => [r.rect[0], r.rect[1]]), zs = rooms.flatMap(r => [r.rect[2], r.rect[3]]);
  const w = Math.max(...xs) - Math.min(...xs), d = Math.max(...zs) - Math.min(...zs);
  const area = Math.round(rooms.reduce((v, r) => v + (r.rect[1] - r.rect[0]) * (r.rect[3] - r.rect[2]), 0));
  return {
    ...spec, w, d, area, rooms, regions, walls, wallInfo, windows, doors, fixtures, obstacles,
    zones: spec.zones || {}, entry: spec.entry, height: WALL_HEIGHT,
  };
}
const kitchenRun = (axis, line, side, from, dir, modules) => ({ type: 'kitchen', axis, line, side, from, dir, modules });
const radiator = (axis, line, side, at, w = .9) => ({ type: 'radiator', axis, line, side, at, w });
const layouts = [
  plan({
    id: 'studio', name: '东村开间', en: 'East Village Studio', desc: 'Studio · 43 m² / 465 sq ft', tag: '战前老楼 / 一人一世界',
    story: '经典的东村开间：入户就是小门厅，左手卫生间，右手一字型小厨房，两扇朝街的窗户留给书桌和床。',
    rooms: [['living', '起居区', -3.6, 2.0, -3, 3], ['kitchen', '小厨房', 2.0, 3.6, -3, .6], ['bath', '卫生间', 2.0, 3.6, .6, 3]],
    walls: [[-3.6, -3, 3.6, -3], [3.6, -3, 3.6, 3], [-3.6, 3, 3.6, 3], [-3.6, -3, -3.6, 3], [2.0, .6, 3.6, .6], [2.0, .6, 2.0, 3]],
    doors: [[1.25, 3, .9, 'entry'], [2.0, 1.65, .75, 'bath', 1, 1]],
    windows: [[-2.2, -3, 1.0], [.2, -3, 1.0], [3.6, -1.5, .8, 1.15, 2.25]],
    fixtures: [kitchenRun('z', 3.6, -1, -2.94, 1, ['fridge', 'slim', 'sink', 'range']), radiator('x', -3, 1, -2.2), radiator('x', -3, 1, .2),
      { type: 'closet', axis: 'x', line: 3, side: -1, at: .05, w: 1.1 },
      { type: 'tub', x: 3.2, z: 1.75, rot: 1 }, { type: 'toilet', x: 2.42, z: 2.62, rot: 0 }, { type: 'basin', x: 2.42, z: .95, rot: 0 }],
    entry: [1.25, 2.55], zones: { kitchen: [2.0, 3.6, -3, .6] }
  }),
  plan({
    id: 'suite', name: '上西区一居', en: 'Upper West Side 1BR', desc: '1BR · 59 m² / 630 sq ft', tag: '独立卧室 / 恰好的生活',
    story: '上西区战前一居室：人字拼地板、门厅连着卫生间，独立卧室带壁橱，开放厨房靠着入户墙。',
    rooms: [['living', '客厅', -4.2, 1.0, -3.5, 3.5], ['bedroom', '卧室', 1.0, 4.2, -3.5, .4], ['hall', '门厅', 1.0, 2.6, .4, 3.5], ['bath', '卫生间', 2.6, 4.2, .4, 3.5]],
    walls: [[-4.2, -3.5, 4.2, -3.5], [4.2, -3.5, 4.2, 3.5], [-4.2, 3.5, 4.2, 3.5], [-4.2, -3.5, -4.2, 3.5], [1.0, -3.5, 1.0, .4], [1.0, .4, 4.2, .4], [2.6, .4, 2.6, 3.5]],
    doors: [[1.8, 3.5, .9, 'entry'], [1.5, .4, .8, 'room', -1, -1], [2.6, 1.2, .75, 'bath', -1, 1]],
    windows: [[-3.0, -3.5, 1.0], [-.9, -3.5, 1.0], [2.6, -3.5, 1.0], [-4.2, .2, 1.0]],
    fixtures: [kitchenRun('x', 3.5, -1, -4.14, 1, ['fridge', 'base', 'sink', 'dishwasher', 'range']), radiator('x', -3.5, 1, -3.0), radiator('x', -3.5, 1, -.9), radiator('x', -3.5, 1, 2.6),
      { type: 'closet', axis: 'x', line: .4, side: -1, at: 3.3, w: 1.6 },
      { type: 'tub', x: 3.4, z: 3.05, rot: 0 }, { type: 'toilet', x: 3.85, z: 1.9, rot: 3 }, { type: 'basin', x: 3.85, z: .85, rot: 3 }],
    entry: [1.8, 3.05], zones: { bedroom: [1.0, 4.2, -3.5, .4], kitchen: [-4.2, -.6, 2.2, 3.5] },
  }),
  plan({
    id: 'loft', name: '下东区老公寓', en: 'Lower East Side Walk-up', desc: 'Studio · 40 m² / 435 sq ft · 五楼无电梯', tag: '红砖老楼 / 精打细算',
    story: '下东区的五层无电梯老楼：裸露的红砖墙、铸铁暖气片，入户就是小厨房，卫生间小而完整。',
    rooms: [['living', '主屋', -2.8, 2.8, -3.6, 1.4], ['kitchen', '小厨房', -2.8, .8, 1.4, 3.6], ['bath', '卫生间', .8, 2.8, 1.4, 3.6]],
    walls: [[-2.8, -3.6, 2.8, -3.6], [2.8, -3.6, 2.8, 1.4, 'brick'], [2.8, 1.4, 2.8, 3.6], [-2.8, 3.6, 2.8, 3.6], [-2.8, -3.6, -2.8, 1.4, 'brick'], [-2.8, 1.4, -2.8, 3.6], [.8, 1.4, 2.8, 1.4], [.8, 1.4, .8, 3.6]],
    doors: [[-.2, 3.6, .9, 'entry'], [.8, 2.05, .75, 'bath', -1, 1]],
    windows: [[-1.2, -3.6, .9], [1.2, -3.6, .9]],
    fixtures: [kitchenRun('z', -2.8, 1, 1.48, 1, ['fridge', 'sink', 'compact']), radiator('x', -3.6, 1, -1.2, .8), radiator('x', -3.6, 1, 1.2, .8),
      { type: 'tub', x: 1.8, z: 3.2, rot: 0 }, { type: 'toilet', x: 2.45, z: 1.95, rot: 3 }, { type: 'basin', x: 1.25, z: 2.95, rot: 1 }],
    entry: [-.2, 3.15], zones: { kitchen: [-2.8, .8, 1.4, 3.6] },
  }),
  plan({
    id: 'balcony', name: '长岛市阳台公寓', en: 'Long Island City Alcove', desc: 'Alcove Studio · 50 m² + 阳台 11 m²', tag: '新楼落地窗 / 室内外相连',
    story: '东河对岸的新楼：整面落地玻璃和推拉门通向阳台，睡眠凹室藏在一侧，厨房沿入户墙展开。',
    floor: 'plank',
    rooms: [['balcony', '阳台', -4, 4, -3.8, -2.4], ['living', '起居区', -4, 1.6, -2.4, 3.8], ['bedroom', '睡眠凹室', 1.6, 4, -2.4, 1.6], ['hall', '门厅', 1.6, 2.4, 1.6, 3.8], ['bath', '卫生间', 2.4, 4, 1.6, 3.8]],
    walls: [[-4, -2.4, 4, -2.4, 'glass'], [-4, -3.8, -4, 3.8], [4, -3.8, 4, 3.8], [-4, 3.8, 4, 3.8], [1.6, .2, 1.6, 1.6], [2.4, 1.6, 4, 1.6], [2.4, 1.6, 2.4, 3.8]],
    doors: [[-.4, -2.4, 1.6, 'slider'], [1.95, 3.8, .85, 'entry'], [2.4, 2.4, .75, 'bath', -1, 1]],
    windows: [[-4, .6, 1.2, .5, 2.4]],
    fixtures: [kitchenRun('x', 3.8, -1, -3.94, 1, ['fridge', 'base', 'sink', 'dishwasher', 'range']),
      { type: 'closet', axis: 'z', line: 4, side: -1, at: .7, w: 1.6 },
      { type: 'tub', x: 3.2, z: 3.4, rot: 0 }, { type: 'toilet', x: 3.6, z: 2.1, rot: 3 }, { type: 'basin', x: 2.85, z: 2.0, rot: 0 },
      { type: 'railing', z: -3.8, x1: -4, x2: 4 }],
    entry: [1.95, 3.35], zones: { balcony: [-4, 4, -3.8, -2.4], bedroom: [1.6, 4, -2.4, 1.6], kitchen: [-4, -.4, 2.4, 3.8] },
  }),
  plan({
    id: 'corridor', name: '布鲁克林火车厢', en: 'Brooklyn Railroad', desc: 'Railroad 2BR · 50 m² / 540 sq ft', tag: '房间一间接一间 / 两个人的节奏',
    story: '布鲁克林的火车厢户型：临街客厅、中间厨房与书房、最里面是卧室，门洞沿一侧排成一线。',
    rooms: [['living', '临街客厅', -2.1, 2.1, -6, -2.4], ['kitchen', '厨房', -2.1, .6, -2.4, .6], ['kitchen', '厨房', .6, 2.1, -.2, .6], ['bath', '卫生间', .6, 2.1, -2.4, -.2], ['study', '书房', -2.1, 2.1, .6, 3.2], ['bedroom', '卧室', -2.1, 2.1, 3.2, 6]],
    walls: [[-2.1, -6, 2.1, -6], [-2.1, 6, 2.1, 6], [-2.1, -6, -2.1, -2.4, 'brick'], [-2.1, -2.4, -2.1, .6], [-2.1, .6, -2.1, 6, 'brick'], [2.1, -6, 2.1, 6],
      [-2.1, -2.4, 2.1, -2.4], [.6, -2.4, .6, -.2], [.6, -.2, 2.1, -.2], [-2.1, .6, 2.1, .6], [-2.1, 3.2, 2.1, 3.2]],
    doors: [[-.75, -2.4, .9, 'arch'], [.6, -1.3, .7, 'bath', -1, 1], [2.1, .2, .8, 'entry'], [-.75, .6, .9, 'arch'], [-.75, 3.2, .85, 'room', -1, 1]],
    windows: [[-1.0, -6, .9], [1.0, -6, .9], [-1.0, 6, .9], [1.0, 6, .9], [2.1, 1.9, .7, 1.0, 2.2]],
    fixtures: [kitchenRun('z', -2.1, 1, -2.34, 1, ['fridge', 'base', 'sink', 'range']), radiator('x', -6, 1, -1.0, .8), radiator('x', -6, 1, 1.0, .8), radiator('x', 6, -1, 1.0, .8),
      { type: 'tub', x: 1.35, z: -2.0, rot: 0 }, { type: 'toilet', x: 1.75, z: -.6, rot: 3 }, { type: 'basin', x: .95, z: -.55, rot: 1 }],
    entry: [1.7, .2], zones: { front: [-2.1, 2.1, -6, -2.4], study: [-2.1, 2.1, .6, 3.2], bedroom: [-2.1, 2.1, 3.2, 6] },
  }),
  plan({
    id: 'kitchen', name: '哈莱姆褐石公寓', en: 'Harlem Brownstone', desc: '1BR · 64 m² / 690 sq ft · 带大厨房', tag: '褐石老宅 / 一餐一饭',
    story: '哈莱姆褐石楼的客厅层：落地长窗和老壁炉，后面是能坐下吃饭的大厨房，冰箱和中岛等你来安排。',
    rooms: [['kitchen', '厨房', -4, 1.6, -4, -.6], ['living', '客厅', -4, 1.6, -.6, 4], ['bedroom', '卧室', 1.6, 4, -4, .6], ['hall', '门厅', 1.6, 4, .6, 2.2], ['bath', '卫生间', 1.6, 4, 2.2, 4]],
    walls: [[-4, -4, 4, -4], [4, -4, 4, 4], [-4, 4, 4, 4], [-4, -4, -4, 4], [-4, -.6, -2.6, -.6], [1.6, -4, 1.6, .6], [1.6, .6, 4, .6], [1.6, 2.2, 4, 2.2], [1.6, 2.2, 1.6, 4]],
    doors: [[4, 1.4, .9, 'entry'], [2.9, .6, .8, 'room', 1, -1], [2.25, 2.2, .75, 'bath', -1, 1]],
    windows: [[-3.1, -4, .9, 1.15, 2.25], [.4, -4, 1.0], [2.8, -4, 1.0], [-2.6, 4, 1.0, .45, 2.5], [-.4, 4, 1.0, .45, 2.5]],
    fixtures: [kitchenRun('x', -4, 1, -3.94, 1, ['base', 'sink', 'dishwasher', 'range', 'wide']), radiator('x', -4, 1, 2.8), radiator('x', -4, 1, .4),
      { type: 'fireplace', axis: 'z', line: -4, side: 1, at: 1.7, w: 1.5 },
      { type: 'tub', x: 3.2, z: 3.6, rot: 0 }, { type: 'toilet', x: 3.6, z: 2.6, rot: 3 }, { type: 'basin', x: 2.0, z: 3.55, rot: 1 }],
    entry: [3.55, 1.4], zones: { kitchen: [-4, 1.6, -4, -.6], bedroom: [1.6, 4, -4, .6] },
  }),
];

/* Procedural textures and the material library. Everything is painted on canvases at start-up, so the game stays a single offline file. */
const $ = id => document.getElementById(id), $$ = s => [...document.querySelectorAll(s)];
function seeded(seed) {
  let v = seed >>> 0;
  return () => ((v = (v * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const textureCache = {};
function paintTexture(key, width, height, draw, { color = true, worldW = 1, worldH = 1 } = {}) {
  if (textureCache[key]) return textureCache[key];
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1 / worldW, 1 / worldH);
  tex.anisotropy = 8;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  return (textureCache[key] = tex);
}
const shade = (v, a = 1) => `rgba(${v | 0},${v | 0},${v | 0},${a})`;
function grain(ctx, x, y, w, h, rnd, horizontal, strength = 1) {
  // Long soft streaks along the board, the cheapest convincing wood grain.
  const lines = Math.max(4, (horizontal ? h : w) / 3);
  for (let i = 0; i < lines; i++) {
    const t = rnd(), v = 150 + rnd() * 80;
    ctx.fillStyle = shade(v, .06 * strength + rnd() * .08 * strength);
    if (horizontal) ctx.fillRect(x + rnd() * w * .3, y + t * h, w * (.4 + rnd() * .7), 1 + rnd() * 1.4);
    else ctx.fillRect(x + t * w, y + rnd() * h * .3, 1 + rnd() * 1.4, h * (.4 + rnd() * .7));
  }
  if (rnd() < .5) { // an occasional knot
    ctx.fillStyle = shade(120, .18);
    ctx.beginPath();
    ctx.ellipse(x + rnd() * w, y + rnd() * h, horizontal ? 6 : 2.5, horizontal ? 2.5 : 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
// Classic pre-war oak herringbone: k×1 boards stepping diagonally; tile is 8×8 board widths.
function herringboneTexture() {
  const unit = .07, k = 4, px = 64;
  return paintTexture('herringbone', 8 * px, 8 * px, (ctx, W, H) => {
    const rnd = seeded(7);
    ctx.fillStyle = '#6a5a48'; ctx.fillRect(0, 0, W, H);
    for (let j = -12; j < 20; j++) for (let s = -6; s < 8; s++) {
      const ox = j + s * k, oy = j - s * k;
      for (const [x, y, w, h, horiz] of [[ox, oy, k, 1, true], [ox, oy + 1, 1, k, false]]) {
        const tone = 205 + rnd() * 45;
        for (const dx of [-8, 0, 8]) for (const dy of [-8, 0, 8]) {
          const X = (x + dx) * px, Y = (y + dy) * px, Wd = w * px, Hd = h * px;
          if (X > W || Y > H || X + Wd < 0 || Y + Hd < 0) continue;
          ctx.fillStyle = shade(tone);
          ctx.fillRect(X + 1, Y + 1, Wd - 2, Hd - 2);
          ctx.save(); ctx.beginPath(); ctx.rect(X + 1, Y + 1, Wd - 2, Hd - 2); ctx.clip();
          grain(ctx, X, Y, Wd, Hd, seeded((tone * 1000) | 0), horiz);
          ctx.restore();
        }
      }
    }
  }, { worldW: 8 * unit, worldH: 8 * unit });
}
function plankTexture() {
  const boardW = .19, boardL = 1.52;
  return paintTexture('plank', 1024, 1024, (ctx, W, H) => {
    const rnd = seeded(11), cols = 8, bw = W / cols;
    ctx.fillStyle = '#5c5045'; ctx.fillRect(0, 0, W, H);
    for (let c = 0; c < cols; c++) {
      const offset = ((c * 3) % 5) / 5 * H;
      for (let r = -1; r < 2; r++) {
        const y = offset + r * H, tone = 210 + rnd() * 38;
        ctx.fillStyle = shade(tone);
        ctx.fillRect(c * bw + 1, y + 1, bw - 2, H - 2);
        ctx.save(); ctx.beginPath(); ctx.rect(c * bw + 1, y + 1, bw - 2, H - 2); ctx.clip();
        grain(ctx, c * bw, y, bw, H, rnd, false, 1.2); ctx.restore();
      }
    }
  }, { worldW: boardW * 8, worldH: boardL });
}
function deckTexture() {
  return paintTexture('deck', 512, 512, (ctx, W, H) => {
    const rnd = seeded(5), n = 6, bh = H / n;
    ctx.fillStyle = '#2e2a26'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = shade(170 + rnd() * 40);
      ctx.fillRect(0, i * bh + 3, W, bh - 6);
      ctx.save(); ctx.beginPath(); ctx.rect(0, i * bh + 3, W, bh - 6); ctx.clip(); grain(ctx, 0, i * bh, W, bh, rnd, true, 1.5); ctx.restore();
    }
  }, { worldW: .9, worldH: .9 });
}
function hexTexture() {
  // White hexagon mosaic with a scatter of black "flowers", a New York bathroom staple.
  const r = 14, cols = 12, rows = 8, w = Math.sqrt(3) * r;
  return paintTexture('hex', Math.round(cols * w), rows * 3 * r / 2 * 2 / 2 * 2, (ctx, W, H) => {
    const rnd = seeded(3);
    ctx.fillStyle = '#9d9a94'; ctx.fillRect(0, 0, W, H);
    for (let row = -1; row <= rows * 2 / 2 * 2; row++) for (let col = -1; col <= cols; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * r * 1.5;
      const flower = (row % 4 === 1 && col % 4 === 1) || (row % 4 === 3 && col % 4 === 3);
      ctx.fillStyle = flower ? '#2b2b2b' : shade(236 + rnd() * 14);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * (r - 1.2), cy + Math.sin(a) * (r - 1.2)); }
      ctx.fill();
    }
  }, { worldW: .32, worldH: .32 });
}
function checkerTexture() {
  return paintTexture('checker', 512, 512, (ctx, W, H) => {
    const rnd = seeded(9), n = 4, s = W / n;
    ctx.fillStyle = '#8a8680'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const dark = (i + j) % 2;
      ctx.fillStyle = dark ? shade(48 + rnd() * 10) : shade(232 + rnd() * 14);
      ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
      for (let k = 0; k < 40; k++) { ctx.fillStyle = shade(dark ? 80 : 200, .08); ctx.fillRect(i * s + rnd() * s, j * s + rnd() * s, 2 + rnd() * 6, 1); }
    }
  }, { worldW: 1.2, worldH: 1.2 });
}
function subwayTexture() {
  return paintTexture('subway', 512, 512, (ctx, W, H) => {
    const rnd = seeded(4), rows = 8, cols = 4, bh = H / rows, bw = W / cols;
    ctx.fillStyle = '#c9c5bd'; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0), tone = 240 + rnd() * 12;
      const g = ctx.createLinearGradient(0, r * bh, 0, r * bh + bh);
      g.addColorStop(0, shade(tone)); g.addColorStop(.85, shade(tone - 6)); g.addColorStop(1, shade(tone - 18));
      ctx.fillStyle = g; ctx.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }, { worldW: .6, worldH: .6 });
}
function brickTexture() {
  return paintTexture('brick', 512, 512, (ctx, W, H) => {
    const rnd = seeded(21), rows = 8, cols = 4, bh = H / rows, bw = W / cols;
    ctx.fillStyle = '#b7aa98'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 4000; i++) { ctx.fillStyle = shade(150 + rnd() * 70, .3); ctx.fillRect(rnd() * W, rnd() * H, 2, 2); }
    for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
      const hue = rnd(), base = [150 + hue * 40, 70 + hue * 25, 52 + hue * 18];
      ctx.fillStyle = `rgb(${base.map(v => v | 0).join(',')})`;
      ctx.fillRect(x + 4, y + 4, bw - 7, bh - 7);
      for (let k = 0; k < 90; k++) {
        ctx.fillStyle = rnd() < .5 ? 'rgba(40,20,10,.12)' : 'rgba(255,220,190,.08)';
        ctx.fillRect(x + 4 + rnd() * (bw - 9), y + 4 + rnd() * (bh - 9), 1 + rnd() * 5, 1 + rnd() * 2);
      }
      if (rnd() < .25) { ctx.fillStyle = 'rgba(30,15,10,.18)'; ctx.fillRect(x + 4, y + 4, bw - 7, bh - 7); }
    }
  }, { worldW: .84, worldH: .56 });
}
function plasterTexture() {
  return paintTexture('plaster', 256, 256, (ctx, W, H) => {
    const rnd = seeded(13);
    ctx.fillStyle = shade(128); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { ctx.fillStyle = shade(100 + rnd() * 56, .35); ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, .6 + rnd() * 2.2, 0, 7); ctx.fill(); }
  }, { color: false, worldW: .9, worldH: .9 });
}
function fabricTexture() {
  return paintTexture('fabric', 128, 128, (ctx, W, H) => {
    const rnd = seeded(17);
    ctx.fillStyle = shade(128); ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { ctx.fillStyle = shade(((x + y) / 2) % 2 ? 150 + rnd() * 30 : 95 + rnd() * 30); ctx.fillRect(x, y, 2, 2); }
  }, { color: false, worldW: .08, worldH: .08 });
}
function woodTexture() {
  return paintTexture('wood', 256, 512, (ctx, W, H) => {
    const rnd = seeded(23);
    ctx.fillStyle = shade(236); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      const x = rnd() * W, wv = 1 + rnd() * 3;
      ctx.strokeStyle = shade(170 + rnd() * 50, .1 + rnd() * .14); ctx.lineWidth = wv;
      ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y <= H; y += 32) ctx.lineTo(x + Math.sin(y * .02 + i) * 4, y);
      ctx.stroke();
    }
  }, { worldW: .5, worldH: 1 });
}
function rugTexture() {
  return paintTexture('rug', 256, 256, (ctx, W, H) => {
    const rnd = seeded(29);
    ctx.fillStyle = shade(225); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) { ctx.fillStyle = shade(170 + rnd() * 85, .5); ctx.fillRect(rnd() * W, rnd() * H, 1, 2); }
  }, { worldW: .4, worldH: .4 });
}
function marbleTexture() {
  return paintTexture('marble', 512, 512, (ctx, W, H) => {
    const rnd = seeded(31);
    ctx.fillStyle = '#f1efea'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = `rgba(120,118,115,${.08 + rnd() * .14})`; ctx.lineWidth = .6 + rnd() * 1.6;
      let x = rnd() * W, y = 0; ctx.beginPath(); ctx.moveTo(x, y);
      while (y < H) { x += (rnd() - .5) * 40; y += 10 + rnd() * 30; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, { worldW: 1.2, worldH: 1.2 });
}
// Soft contact shadow: a blurred rounded rectangle in the alpha channel.
function contactTexture() {
  return paintTexture('contact', 128, 128, (ctx, W, H) => {
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(26, 26, W - 52, H - 52, 16) : ctx.rect(26, 26, W - 52, H - 52); ctx.fill();
  }, { color: false });
}
function edgeShadowTexture() {
  return paintTexture('edgeAO', 4, 64, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.35, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }, { color: false });
}
// The street outside: a row of pre-war facades with lit windows at night.
function facadeTexture(kind, night) {
  return paintTexture('facade-' + kind + night, 1024, 512, (ctx, W, H) => {
    const rnd = seeded(kind === 'skyline' ? 77 : 41);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    if (night) { sky.addColorStop(0, '#0d1626'); sky.addColorStop(1, '#2b3550'); } else { sky.addColorStop(0, '#9fc3e0'); sky.addColorStop(1, '#e6eef2'); }
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (kind === 'skyline') {
      ctx.fillStyle = night ? '#1c2533' : '#8f9fae';
      ctx.fillRect(0, H * .82, W, H * .18);
      let x = 0;
      while (x < W) {
        const bw = 30 + rnd() * 70, bh = H * (.15 + rnd() * .55) * (x > W * .35 && x < W * .55 ? 1.35 : 1);
        ctx.fillStyle = night ? shade(30 + rnd() * 20) : `rgb(${120 + rnd() * 40 | 0},${130 + rnd() * 40 | 0},${145 + rnd() * 35 | 0})`;
        ctx.fillRect(x, H * .78 - bh, bw, bh);
        for (let wy = H * .78 - bh + 6; wy < H * .78 - 6; wy += 8) for (let wx = x + 4; wx < x + bw - 4; wx += 7)
          if (rnd() < (night ? .35 : .5)) { ctx.fillStyle = night ? 'rgba(255,214,140,.85)' : 'rgba(220,235,245,.55)'; ctx.fillRect(wx, wy, 3, 4); }
        x += bw + 2;
      }
      ctx.fillStyle = night ? '#111a26' : '#6d8a9c'; ctx.fillRect(0, H * .8, W, H * .2);
      return;
    }
    let x = 0;
    while (x < W) {
      const bw = 150 + rnd() * 110, top = H * (.05 + rnd() * .2), hue = rnd();
      const wall = night ? [60 + hue * 20, 42, 38] : [150 + hue * 50, 85 + hue * 30, 65 + hue * 20];
      ctx.fillStyle = `rgb(${wall.map(v => v | 0).join(',')})`; ctx.fillRect(x, top, bw, H - top);
      ctx.fillStyle = night ? '#2b2522' : '#d9d2c3'; ctx.fillRect(x, top, bw, 10); // cornice
      for (let row = 0; row < 6; row++) for (let c = 0; c < Math.floor(bw / 48); c++) {
        const wx = x + 14 + c * 48, wy = top + 30 + row * 78;
        if (wy + 52 > H) continue;
        ctx.fillStyle = night ? '#d9c9a8' : '#e9e4d6'; ctx.fillRect(wx - 3, wy - 3, 28, 56);
        ctx.fillStyle = night ? (rnd() < .45 ? '#ffcf7a' : '#1d2433') : (rnd() < .3 ? '#5c6b72' : '#8ea6b4'); ctx.fillRect(wx, wy, 22, 50);
        ctx.fillStyle = night ? '#b8a88a' : '#efeadf'; ctx.fillRect(wx, wy + 23, 22, 3);
      }
      // a black iron fire escape on some facades
      if (rnd() < .5) { ctx.strokeStyle = night ? '#0b0b0b' : '#2a2a2a'; ctx.lineWidth = 3; for (let row = 1; row < 6; row++) { const y = top + 30 + row * 78 - 8; ctx.strokeRect(x + 10, y, Math.min(110, bw - 20), 6); ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 70, y - 70); ctx.stroke(); } }
      x += bw + 4;
    }
  }, { worldW: 1, worldH: 1 });
}
function skyTexture(night) {
  return paintTexture('sky' + night, 8, 256, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (night) { g.addColorStop(0, '#1b2333'); g.addColorStop(.6, '#2f3a4c'); g.addColorStop(1, '#3d4656'); }
    else { g.addColorStop(0, '#dfe3e2'); g.addColorStop(.55, '#ecebe5'); g.addColorStop(1, '#e4e1d8'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
}
function artTexture(color) {
  return paintTexture('art' + color, 256, 224, (ctx, W, H) => {
    const rnd = seeded(parseInt(color.slice(1), 16));
    ctx.fillStyle = '#efe7d7'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = color; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(W * .66, H * .34, H * .17, 0, 7); ctx.fill();
    const hills = ['#9da78b', '#c6ad84', '#6f7f6a', color];
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = .55 + i * .1; ctx.fillStyle = hills[i]; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H * (.55 + i * .1) + Math.sin(x * .02 + i * 2 + rnd()) * 18);
      ctx.lineTo(W, H); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 1600; i++) { ctx.fillStyle = `rgba(0,0,0,${rnd() * .05})`; ctx.fillRect(rnd() * W, rnd() * H, 2, 2); }
  });
}
function clockFaceTexture() {
  return paintTexture('clockface', 256, 256, (ctx, W) => {
    ctx.fillStyle = '#f2ece0'; ctx.fillRect(0, 0, W, W);
    ctx.translate(W / 2, W / 2);
    for (let i = 0; i < 60; i++) { ctx.fillStyle = '#3b352e'; const long = i % 5 === 0; ctx.fillRect(-1.2 * (long ? 2 : 1), -W * .46, 2.4 * (long ? 2 : 1), long ? 18 : 8); ctx.rotate(Math.PI / 30); }
  });
}
function screenTexture() {
  return paintTexture('tvscreen', 256, 144, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2d5a73'); g.addColorStop(.5, '#7fa6a0'); g.addColorStop(1, '#e0b77f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(W * .7, H * .4, 26, 0, 7); ctx.fill();
  });
}

/* Materials. Furniture gets fresh instances so the ghost preview and recolouring never leak between models. */
const MAT = {
  paint: (color, rough = .82) => new THREE.MeshStandardMaterial({ color, roughness: rough, bumpMap: plasterTexture(), bumpScale: .35 }),
  plaster: color => new THREE.MeshStandardMaterial({ color, roughness: .92, bumpMap: plasterTexture(), bumpScale: .6 }),
  fabric: (color, rough = .95) => new THREE.MeshStandardMaterial({ color, roughness: rough, bumpMap: fabricTexture(), bumpScale: .9 }),
  velvet: color => new THREE.MeshPhysicalMaterial({ color, roughness: .8, sheen: 1, sheenRoughness: .45, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .35), bumpMap: fabricTexture(), bumpScale: .5 }),
  wood: (color, rough = .6) => new THREE.MeshStandardMaterial({ color, roughness: rough, map: woodTexture(), bumpMap: woodTexture(), bumpScale: .25 }),
  lacquer: (color, rough = .35) => new THREE.MeshStandardMaterial({ color, roughness: rough }),
  metal: (color = '#8d8f8f', rough = .35) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: .9 }),
  brass: () => new THREE.MeshStandardMaterial({ color: '#c49a55', roughness: .3, metalness: 1 }),
  chrome: () => new THREE.MeshStandardMaterial({ color: '#d9dcdf', roughness: .12, metalness: 1 }),
  steel: () => new THREE.MeshStandardMaterial({ color: '#b9bcbe', roughness: .32, metalness: .85 }),
  black: (rough = .5) => new THREE.MeshStandardMaterial({ color: '#232322', roughness: rough }),
  ceramic: (color = '#f4f2ec', rough = .18) => new THREE.MeshStandardMaterial({ color, roughness: rough }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: '#c9dbe0', roughness: .04, metalness: 0, transparent: true, opacity: .16, depthWrite: false, envMapIntensity: 1.6 }),
  mirror: () => new THREE.MeshStandardMaterial({ color: '#e6eef0', roughness: .02, metalness: 1 }),
  leaf: color => new THREE.MeshStandardMaterial({ color, roughness: .55, side: THREE.DoubleSide }),
  emissive: (color, intensity = 1) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: .9 }),
  marble: () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .18, map: marbleTexture() }),
  rug: color => new THREE.MeshStandardMaterial({ color, roughness: 1, map: rugTexture(), bumpMap: rugTexture(), bumpScale: 1.2 }),
  tex: (map, color = '#ffffff', rough = .7) => new THREE.MeshStandardMaterial({ color, roughness: rough, map }),
};

/* Furniture and fixture models. Local origin sits on the floor at the footprint centre; the front faces +z. */
function worldUV(geo) {
  // Map texture coordinates to metres so wood grain, weave and tiles keep a real scale on any size.
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  if (!uv) return geo;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ax >= ay && ax >= az) uv.setXY(i, p.getZ(i), p.getY(i));
    else if (ay >= az) uv.setXY(i, p.getX(i), p.getZ(i));
    else uv.setXY(i, p.getX(i), p.getY(i));
  }
  uv.needsUpdate = true;
  return geo;
}
function roundedBox(w, h, d, r = .02, k = 3) {
  r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001);
  if (r < .004) return worldUV(new THREE.BoxGeometry(w, h, d));
  const n = 2 * (k + 1), geo = new THREE.BoxGeometry(1, 1, 1, n, n, n);
  const half = [w / 2, h / 2, d / 2], pos = geo.attributes.position, nor = geo.attributes.normal;
  const remap = (t, hf) => {
    const i = Math.round((t + .5) * n), inner = hf - r;
    if (i <= k) return -hf + r * (i / k);
    if (i >= n - k) return inner + r * ((i - (n - k)) / k);
    return -inner + (i - k) / 2 * inner;
  };
  const v = new THREE.Vector3(), inner = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.set(remap(pos.getX(i), half[0]), remap(pos.getY(i), half[1]), remap(pos.getZ(i), half[2]));
    inner.set(THREE.MathUtils.clamp(v.x, -half[0] + r, half[0] - r), THREE.MathUtils.clamp(v.y, -half[1] + r, half[1] - r), THREE.MathUtils.clamp(v.z, -half[2] + r, half[2] - r));
    const off = v.clone().sub(inner);
    if (off.lengthSq() > 1e-12) { off.normalize(); v.copy(inner).addScaledVector(off, r); nor.setXYZ(i, off.x, off.y, off.z); }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  return worldUV(geo);
}
function part(g, geo, mat, x = 0, y = 0, z = 0, rot) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  m.castShadow = true; m.receiveShadow = true;
  g.add(m);
  return m;
}
// box with its bottom at y (not centred), which reads far more naturally when building furniture
const blk = (g, w, h, d, x, y, z, mat, r = .012, rot) => part(g, roundedBox(w, h, d, r), mat, x, y + h / 2, z, rot);
const cyl = (g, r1, r2, h, x, y, z, mat, seg = 24, rot) => part(g, new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y + h / 2, z, rot);
const ball = (g, r, x, y, z, mat, s = [1, 1, 1], seg = 20) => { const m = part(g, new THREE.SphereGeometry(r, seg, Math.max(8, seg * .7 | 0)), mat, x, y, z); m.scale.set(...s); return m; };
function addContactShadow(g, w, d, strength = .5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25 + .2, d * 1.25 + .2), new THREE.MeshBasicMaterial({ color: '#000', alphaMap: contactTexture(), transparent: true, opacity: strength, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004; m.renderOrder = 1;
  m.userData.decor = true; m.raycast = () => {};
  g.add(m);
}
const darker = (c, k = .7) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
const lighter = (c, k = .3) => '#' + new THREE.Color(c).lerp(new THREE.Color('#ffffff'), k).getHexString();

function model(def, color = def.color) {
  const g = new THREE.Group(), { w, d, type } = def;
  const oak = () => MAT.wood('#c49a6c'), walnut = () => MAT.wood('#7a5b40');
  if (type === 'sofa' || type === 'chair') {
    if (def.id === 'lounge') {
      // Rattan lounge chair: woven frame, cream cushion.
      const cane = MAT.wood(color, .75);
      for (const sx of [-1, 1]) {
        blk(g, .07, .62, d - .1, sx * (w / 2 - .06), .0, 0, cane, .03);
        for (let i = 0; i < 6; i++) blk(g, .012, .45, .012, sx * (w / 2 - .06), .1, -d / 2 + .15 + i * .12, cane, .005);
      }
      blk(g, w - .1, .08, d - .1, 0, .28, 0, cane, .03);
      blk(g, w - .1, .55, .07, 0, .32, -d / 2 + .08, cane, .03, [-.18, 0, 0]);
      for (let i = 0; i < 9; i++) blk(g, .03, .5, .02, -w / 2 + .14 + i * (w - .28) / 8, .34, -d / 2 + .13, cane, .008, [-.18, 0, 0]);
      blk(g, w - .2, .12, d - .22, 0, .36, .05, MAT.fabric('#ece2cf'), .05);
      blk(g, w - .3, .3, .12, 0, .5, -d / 2 + .2, MAT.fabric('#ece2cf'), .05, [-.18, 0, 0]);
    } else {
      const fab = def.id === 'blushsofa' ? MAT.velvet(color) : MAT.fabric(color), legMat = MAT.wood('#6e5139');
      const seats = type === 'sofa' ? 2 : 1, arm = type === 'sofa' ? .17 : .16;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, .025, .017, .12, sx * (w / 2 - .09), 0, sz * (d / 2 - .09), legMat, 10);
      blk(g, w, .2, d, 0, .12, 0, fab, .05);
      blk(g, w, .5, .2, 0, .3, -d / 2 + .1, fab, .07);
      for (const sx of [-1, 1]) blk(g, arm, .44, d, sx * (w / 2 - arm / 2), .2, 0, fab, .07);
      const inner = w - arm * 2 - .02, cw = inner / seats;
      for (let i = 0; i < seats; i++) {
        const x = -inner / 2 + cw * (i + .5);
        blk(g, cw - .015, .17, d - .26, x, .31, .04, fab, .065);
        blk(g, cw - .03, .4, .18, x, .44, -d / 2 + .26, fab, .08, [-.16, 0, 0]);
      }
      const accent = MAT.fabric(type === 'sofa' ? '#ebe2d0' : lighter(color, .45));
      blk(g, .4, .38, .13, -inner / 2 + .28, .46, -d / 2 + .38, accent, .06, [-.2, 0, .12]);
      if (seats === 2) blk(g, .38, .36, .13, inner / 2 - .28, .46, -d / 2 + .38, MAT.fabric(darker(color, .78)), .06, [-.2, 0, -.15]);
    }
  }
  if (type === 'coffee') {
    const top = MAT.wood(color, .45);
    blk(g, w, .045, d, 0, .4, 0, top, .02);
    blk(g, w - .12, .025, d - .12, 0, .12, 0, top, .01);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, .025, .02, .4, sx * (w / 2 - .09), 0, sz * (d / 2 - .09), top, 12);
    // a stack of magazines on the lower shelf
    blk(g, .3, .04, .22, -w / 4, .145, 0, MAT.paint('#e7e2d6', .7), .004);
    blk(g, .28, .02, .2, -w / 4, .185, 0, MAT.paint('#8f9b86', .7), .004);
  }
  if (type === 'desk' || type === 'dining') {
    const top = MAT.wood(color, .45), legH = .74;
    blk(g, w, .045, d, 0, legH, 0, top, .012);
    if (type === 'desk') {
      for (const sx of [-1, 1]) {
        blk(g, .035, legH, .035, sx * (w / 2 - .05), 0, d / 2 - .06, MAT.metal('#2f2f2d', .4), .008);
        blk(g, .035, legH, .035, sx * (w / 2 - .05), 0, -d / 2 + .06, MAT.metal('#2f2f2d', .4), .008);
        blk(g, .03, .03, d - .1, sx * (w / 2 - .05), .08, 0, MAT.metal('#2f2f2d', .4), .006);
      }
      blk(g, .42, .14, d - .08, w / 2 - .27, legH - .14, 0, top, .01);
      blk(g, .36, .1, .015, w / 2 - .27, legH - .12, d / 2 - .035, MAT.wood(darker(color, .92)), .005);
      blk(g, .1, .012, .015, w / 2 - .27, legH - .075, d / 2 - .025, MAT.brass(), .003);
    } else {
      blk(g, w - .16, .08, d - .16, 0, legH - .08, 0, top, .01);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const leg = cyl(g, .03, .022, legH, sx * (w / 2 - .1), 0, sz * (d / 2 - .1), top, 12);
        leg.rotation.set(sz * .05, 0, -sx * .05);
      }
    }
  }
  if (type === 'bench') {
    const wood = MAT.wood('#b48a5f');
    blk(g, w, .05, d, 0, .38, 0, wood, .015);
    blk(g, w - .04, .07, d - .04, 0, .43, 0, MAT.fabric(color), .03);
    for (const sx of [-1, 1]) { blk(g, .05, .38, d - .06, sx * (w / 2 - .08), 0, 0, wood, .01); }
    blk(g, w - .2, .03, .04, 0, .12, 0, wood, .008);
  }
  if (type === 'tv' || type === 'nightstand' || type === 'cabinet') {
    const h = type === 'cabinet' ? .8 : type === 'tv' ? .5 : .48, body = MAT.wood(color, .5), legH = type === 'nightstand' ? .1 : .13;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, .02, .014, legH, sx * (w / 2 - .06), 0, sz * (d / 2 - .06), MAT.wood(darker(color, .7)), 10);
    blk(g, w, h - legH, d, 0, legH, 0, body, .015);
    if (type === 'nightstand') {
      for (const y of [legH + .04, legH + .2]) {
        blk(g, w - .04, .15, .02, 0, y, d / 2, MAT.wood(lighter(color, .06)), .006);
        cyl(g, .014, .014, .02, 0, y + .075, d / 2 + .02, MAT.brass(), 12, [Math.PI / 2, 0, 0]);
      }
    } else {
      const doors = type === 'tv' ? 3 : 3, dw = (w - .04) / doors;
      for (let i = 0; i < doors; i++) {
        const x = -w / 2 + .02 + dw * (i + .5);
        if (type === 'cabinet') for (let f = 0; f < 7; f++) cyl(g, .018, .018, h - legH - .08, x - dw / 2 + .04 + f * (dw - .08) / 6, legH + .04, d / 2 + .002, body, 8);
        else blk(g, dw - .012, h - legH - .06, .02, x, legH + .03, d / 2, MAT.wood(lighter(color, .05)), .006);
        blk(g, .012, .1, .02, x + (i === doors - 1 ? -dw / 2 + .05 : dw / 2 - .05), legH + (h - legH) / 2 - .05, d / 2 + .02, MAT.brass(), .004);
      }
    }
    if (type === 'tv') {
      const tv = new THREE.Group(); tv.position.set(0, h, -.02); g.add(tv);
      blk(tv, .32, .015, .18, 0, 0, 0, MAT.metal('#1d1d1d'), .006);
      blk(tv, .05, .1, .03, 0, .01, -.02, MAT.metal('#1d1d1d'), .006);
      blk(tv, 1.36, .78, .045, 0, .08, -.02, MAT.lacquer('#151515', .3), .01);
      const screen = part(tv, new THREE.PlaneGeometry(1.31, .73), new THREE.MeshStandardMaterial({ color: '#0d1012', roughness: .12, metalness: .2, map: screenTexture(), emissiveMap: screenTexture(), emissive: '#ffffff', emissiveIntensity: .0 }), 0, .47, .0035);
      screen.material.color.set('#0d1012'); screen.userData.screen = true; screen.castShadow = false;
      blk(g, .22, .14, .16, w / 2 - .26, h, 0, MAT.ceramic('#d9cfbd', .4), .03);
      cyl(g, .05, .07, .2, -w / 2 + .3, h, 0, MAT.ceramic('#8f9b86', .3), 20);
    }
  }
  if (type === 'shelf') {
    const wood = MAT.wood(color, .55), H = 1.82;
    blk(g, w, H, .02, 0, 0, -d / 2 + .01, MAT.wood(darker(color, .9)), .004);
    for (const sx of [-1, 1]) blk(g, .03, H, d, sx * (w / 2 - .015), 0, 0, wood, .006);
    for (const y of [0, .45, .9, 1.35, H - .03]) blk(g, w, .03, d, 0, y, 0, wood, .006);
    const rnd = seeded(5), bookColors = ['#8f9b86', '#c6ad84', '#e3d7bb', '#a6b5b3', '#b9806a', '#3f4d57', '#d9cbb3'];
    for (let row = 0; row < 4; row++) {
      let x = -w / 2 + .05;
      const limit = row === 1 ? w * .1 : w / 2 - .05;
      while (x < limit - .04) {
        const bw = .025 + rnd() * .03, bh = .22 + rnd() * .14;
        blk(g, bw, bh, .2 + rnd() * .05, x + bw / 2, .03 + row * .45, .0, MAT.paint(bookColors[(rnd() * bookColors.length) | 0], .8), .003);
        x += bw + .004;
        if (rnd() < .06) x += .06;
      }
      if (row === 1) { ball(g, .07, w / 4, .55, 0, MAT.ceramic('#e8e2d6', .3), [1, .95, 1]); blk(g, .2, .12, .14, w / 4 + .1, .48, 0, MAT.paint('#d7c9a9'), .02); }
    }
    cyl(g, .045, .055, .12, w / 2 - .14, 1.38, 0, MAT.ceramic('#efe9dd', .3), 16);
    for (let i = 0; i < 6; i++) ball(g, .05, w / 2 - .14 + Math.sin(i * 2) * .04, 1.53 + (i % 3) * .03, Math.cos(i * 2) * .04, MAT.leaf('#6f8f5a'), [1, .5, .7], 10);
  }
  if (type === 'plant') {
    const pot = MAT.ceramic('#d9c4a6', .55);
    cyl(g, w * .3, w * .24, .38, 0, 0, 0, pot, 28);
    cyl(g, w * .305, w * .3, .03, 0, .37, 0, pot, 28);
    cyl(g, w * .27, w * .27, .015, 0, .355, 0, MAT.paint('#4d3f31', 1), 20);
    const trunk = MAT.wood('#7a6047', .9);
    cyl(g, .018, .028, 1.0, 0, .36, 0, trunk, 8);
    const rnd = seeded(9), leafGeo = new THREE.SphereGeometry(.13, 12, 8);
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39, y = .62 + i * .04 + rnd() * .04, r = .09 + rnd() * .12;
      const leaf = part(g, leafGeo, MAT.leaf(i % 3 ? color : darker(color, .82)), Math.sin(a) * r, y, Math.cos(a) * r);
      leaf.scale.set(.75, .12, 1.05); leaf.rotation.set(.5 + rnd() * .4, a, 0);
      leaf.rotation.order = 'YXZ'; leaf.rotation.set(-.55 - rnd() * .3, a, 0);
    }
  }
  if (type === 'cactus') {
    const pot = MAT.ceramic('#c9876b', .65);
    cyl(g, .16, .13, .3, 0, 0, 0, pot, 24);
    cyl(g, .145, .145, .015, 0, .29, 0, MAT.paint('#cbb796', 1), 20);
    const skin = MAT.leaf(color);
    const ribbed = (r, h) => { const geo = new THREE.CylinderGeometry(r, r * 1.05, h, 16, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + .08 * Math.cos(a * 8); p.setX(i, x * k); p.setZ(i, z * k); } geo.computeVertexNormals(); return geo; };
    part(g, ribbed(.085, .65), skin, 0, .62, 0); ball(g, .085, 0, .945, 0, skin, [1.05, .8, 1.05]);
    part(g, ribbed(.055, .28), skin, .15, .78, 0); ball(g, .055, .15, .92, 0, skin);
    blk(g, .12, .07, .07, .08, .6, 0, skin, .03);
    part(g, ribbed(.05, .2), skin, -.13, .66, .02); ball(g, .05, -.13, .76, .02, skin);
    blk(g, .1, .06, .06, -.07, .54, .01, skin, .028);
  }
  if (type === 'rug') {
    const pattern = def.id === 'runner';
    blk(g, w, .012, d, 0, 0, 0, MAT.rug(color), .004);
    const border = MAT.rug(def.id === 'moonrug' ? lighter(color, .4) : darker(color, .82));
    if (pattern) for (let i = 0; i < 7; i++) blk(g, w - .16, .0125, .05, 0, 0, -d / 2 + .2 + i * (d - .4) / 6, border, .002);
    else {
      for (const sz of [-1, 1]) blk(g, w - .16, .0125, .04, 0, 0, sz * (d / 2 - .12), border, .002);
      for (const sx of [-1, 1]) blk(g, .04, .0125, d - .2, sx * (w / 2 - .12), 0, 0, border, .002);
    }
    const fringe = MAT.fabric('#efe6d3');
    for (const sz of [-1, 1]) blk(g, w - .02, .006, .05, 0, 0, sz * (d / 2 + .02), fringe, .002);
    g.traverse(o => { o.castShadow = false; });
  }
  if (type === 'lamp') {
    const metal = MAT.metal('#2c2a27', .4);
    cyl(g, .16, .17, .03, 0, 0, 0, metal, 32);
    cyl(g, .011, .011, 1.32, 0, .03, 0, metal, 10);
    const shade = cyl(g, .17, .23, .32, 0, 1.3, 0, MAT.fabric(color, 1), 32);
    shade.material.side = THREE.DoubleSide; shade.userData.glow = true;
    ball(g, .045, 0, 1.4, 0, MAT.emissive('#fff3d6', .2)).userData.glow = true;
    g.userData.lightY = 1.38;
  }
  if (type === 'tablelamp') {
    cyl(g, .085, .1, .03, 0, 0, 0, MAT.wood('#a77f57'), 24);
    cyl(g, .014, .014, .27, 0, .03, 0, MAT.brass(), 10);
    const shade = ball(g, .17, 0, .43, 0, MAT.fabric(color, 1), [1, .88, 1], 28);
    shade.userData.glow = true;
    for (let i = 1; i < 6; i++) { const rib = part(g, new THREE.TorusGeometry(.17 * Math.sin(i / 6 * Math.PI), .003, 4, 32), MAT.paint(darker(color, .85)), 0, .43 + .15 * Math.cos(i / 6 * Math.PI), 0, [Math.PI / 2, 0, 0]); rib.castShadow = false; }
    g.userData.lightY = .43;
  }
  if (type === 'bed') {
    const fab = MAT.fabric(color), legs = MAT.wood('#7d5d42');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, .03, .022, .1, sx * (w / 2 - .08), 0, sz * (d / 2 - .08), legs, 10);
    blk(g, w, .26, d, 0, .1, 0, fab, .04);
    // channel-tufted headboard
    const panels = 6, pw = w / panels;
    for (let i = 0; i < panels; i++) blk(g, pw - .008, .82, .1, -w / 2 + pw * (i + .5), .3, -d / 2 + .05, fab, .045);
    blk(g, w - .06, .2, d - .12, 0, .36, .03, MAT.fabric('#f7f4ee', .9), .05);
    // duvet drapes over the foot and sides
    blk(g, w - .02, .1, d * .72, 0, .5, d * .14, MAT.fabric('#f2eee6', .95), .045);
    blk(g, w + .02, .12, d * .25, 0, .45, d * .38, MAT.fabric(lighter(color, .2)), .05);
    for (const sx of [-1, 1]) {
      blk(g, .7, .16, .4, sx * .43, .53, -d / 2 + .34, MAT.fabric('#fbfaf6', .9), .07, [-.25, 0, 0]);
      blk(g, .55, .14, .14, sx * .35, .58, -d / 2 + .52, MAT.fabric(darker(color, .85)), .06, [-.35, 0, 0]);
    }
  }
  if (type === 'wardrobe') {
    const body = MAT.paint(color, .55);
    blk(g, w, .08, d - .04, 0, 0, 0, MAT.paint(darker(color, .85)), .005);
    blk(g, w, 1.9, d, 0, .08, 0, body, .012);
    for (const sx of [-1, 1]) {
      const x = sx * w / 4;
      blk(g, w / 2 - .02, 1.82, .025, x, .12, d / 2, body, .006);
      for (let n = 0; n < 24; n++) blk(g, w / 2 - .14, .04, .012, x, .9 + n * .042, d / 2 + .014, body, .004, [-.5, 0, 0]);
      blk(g, w / 2 - .14, .6, .01, x, .25, d / 2 + .014, MAT.paint(lighter(color, .05), .55), .003);
      cyl(g, .012, .012, .16, x - sx * (w / 4 - .06), .95, d / 2 + .04, MAT.brass(), 10);
    }
  }
  if (type === 'stool') {
    // Desk chair with a curved bentwood back.
    const wood = MAT.wood('#b48a5f'), seat = MAT.fabric(color);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = cyl(g, .018, .014, .45, sx * (w / 2 - .06), 0, sz * (d / 2 - .07), wood, 10); l.rotation.set(-sz * .05, 0, sx * .04); }
    blk(g, w - .04, .04, d - .04, 0, .44, 0, wood, .015);
    blk(g, w - .06, .055, d - .08, 0, .475, .01, seat, .025);
    for (const sx of [-1, 1]) blk(g, .025, .4, .025, sx * (w / 2 - .07), .47, -d / 2 + .06, wood, .008, [-.08, 0, 0]);
    const back = part(g, new THREE.CylinderGeometry(.34, .34, .13, 24, 1, true, Math.PI - .75, 1.5), wood, 0, .82, .1);
    back.material.side = THREE.DoubleSide;
    const pad = part(g, new THREE.CylinderGeometry(.326, .326, .1, 24, 1, true, Math.PI - .7, 1.4), MAT.fabric(color), 0, .82, .1);
    pad.material.side = THREE.DoubleSide;
  }
  if (type === 'mirror') {
    // Arched floor mirror leaning gently against its stand.
    const frame = MAT.wood(color, .45), lean = new THREE.Group(); lean.position.set(0, .04, -.04); lean.rotation.x = -.1; g.add(lean);
    const arch = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return s; };
    part(lean, new THREE.ExtrudeGeometry(arch(.6, 1.64), { depth: .035, bevelEnabled: true, bevelSize: .006, bevelThickness: .006, bevelSegments: 2, curveSegments: 24 }), frame, 0, .02, -.02);
    part(lean, new THREE.ShapeGeometry(arch(.52, 1.56), 24), MAT.mirror(), 0, .06, .023);
    blk(g, .62, .04, .3, 0, 0, -.02, frame, .01);
  }
  if (type === 'side' || type === 'flowers') {
    const wood = MAT.wood(type === 'side' ? color : '#b9906a', .5);
    cyl(g, .16, .2, .02, 0, 0, 0, wood, 28);
    cyl(g, .05, .07, .42, 0, .02, 0, wood, 20);
    const top = cyl(g, w / 2, w / 2 - .02, .05, 0, .44, 0, wood, 36);
    if (type === 'flowers') {
      top.material.color.set(color);
      cyl(g, .055, .075, .2, 0, .49, 0, MAT.ceramic('#efe4cf', .25), 20);
      const rnd = seeded(3);
      for (let i = 0; i < 9; i++) {
        const a = i * 1.7, h = .18 + rnd() * .12;
        const stem = cyl(g, .004, .004, h, Math.sin(a) * .03, .62, Math.cos(a) * .03, MAT.leaf('#6f8a5e'), 5); stem.rotation.set(Math.cos(a) * .3, 0, -Math.sin(a) * .3);
        ball(g, .035 + rnd() * .015, Math.sin(a) * (.06 + h * .3), .63 + h, Math.cos(a) * (.06 + h * .3), MAT.fabric(i % 3 ? '#efd9b8' : '#d99c86', .7), [1, .75, 1], 12);
      }
    }
  }
  if (type === 'beanbag') {
    const fab = MAT.fabric(color);
    const blob = (r, x, y, z, s) => {
      const geo = new THREE.SphereGeometry(r, 36, 24), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x0 = p.getX(i), y0 = p.getY(i), z0 = p.getZ(i), k = 1 + .035 * Math.sin(x0 * 22) * Math.cos(z0 * 19 + y0 * 9); p.setXYZ(i, x0 * k, Math.max(y0 * k, -r * .55), z0 * k); }
      geo.computeVertexNormals();
      const m = part(g, geo, fab, x, y, z); m.scale.set(...s); return m;
    };
    blob(.48, 0, .25, .05, [1, .55, .95]);
    blob(.4, 0, .48, -.18, [1, .8, .55]);
  }
  if (type === 'screen') {
    const wood = MAT.wood(color, .55), cane = MAT.tex(rugTexture(), '#d8c49c', .9);
    for (let p = -1; p <= 1; p++) {
      const panel = new THREE.Group(); panel.position.set(p * .455, 0, p === 0 ? 0 : .06); panel.rotation.y = p * .22; g.add(panel);
      for (const sx of [-1, 1]) blk(panel, .035, 1.65, .035, sx * .21, .03, 0, wood, .008);
      for (const y of [.15, .95, 1.62]) blk(panel, .44, .035, .035, 0, y, 0, wood, .008);
      blk(panel, .39, .76, .01, 0, .18, 0, cane, .002); blk(panel, .39, .62, .01, 0, .98, 0, cane, .002);
      for (const sx of [-1, 1]) blk(panel, .05, .03, .05, sx * .21, 0, 0, wood, .01);
    }
  }
  if (type === 'counter') {
    // Freestanding island: shaker cabinet base, marble top, open shelf at the back.
    const body = MAT.paint(color, .6);
    blk(g, w - .04, .08, d - .06, 0, 0, 0, MAT.paint(darker(color, .7)), .005);
    blk(g, w - .02, .78, d - .04, 0, .08, 0, body, .01);
    for (let i = 0; i < 3; i++) {
      const x = -w / 2 + .03 + (w - .06) / 3 * (i + .5), dw = (w - .06) / 3 - .01;
      blk(g, dw, .7, .02, x, .12, d / 2 - .01, body, .005);
      blk(g, dw - .1, .58, .01, x, .18, d / 2 + .005, MAT.paint(darker(color, .93), .6), .003);
      blk(g, .1, .012, .015, x, .74, d / 2 + .02, MAT.brass(), .004);
    }
    blk(g, w + .04, .04, d + .04, 0, .86, 0, MAT.marble(), .006);
    blk(g, .38, .02, .26, -w / 4, .9, -.05, MAT.wood('#b48a5f', .5), .006);
    cyl(g, .07, .06, .1, w / 4, .9, -.05, MAT.ceramic('#e9dfcc', .3), 18);
  }
  if (type === 'fridge') {
    const enamel = MAT.lacquer(color, .28);
    blk(g, w, .06, d - .04, 0, 0, 0, MAT.black(.6), .005);
    blk(g, w, 1.66, d - .06, 0, .06, -.03, enamel, .07);
    blk(g, w - .02, .48, .05, 0, 1.22, d / 2 - .045, enamel, .03);
    blk(g, w - .02, 1.1, .05, 0, .1, d / 2 - .045, enamel, .03);
    for (const [y, h] of [[1.3, .3], [.7, .42]]) {
      blk(g, .035, h, .03, -w / 2 + .1, y, d / 2 + .0, MAT.chrome(), .012);
    }
    blk(g, .16, .03, .01, w / 2 - .16, 1.62, d / 2 - .015, MAT.chrome(), .004);
  }
  if (type === 'vase') {
    const pts = [[0, 0], [.07, 0], [.095, .06], [.085, .15], [.045, .2], [.04, .23], [.05, .25], [0, .25]].map(([x, y]) => new THREE.Vector2(x, y));
    part(g, new THREE.LatheGeometry(pts, 28), MAT.ceramic(color, .3));
    const rnd = seeded(4);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3, h = .14 + rnd() * .1;
      const stem = cyl(g, .003, .003, h, Math.sin(a) * .02, .22, Math.cos(a) * .02, MAT.leaf('#6f8a5e'), 5); stem.rotation.set(Math.cos(a) * .35, 0, -Math.sin(a) * .35);
      ball(g, .03, Math.sin(a) * (.03 + h * .35), .23 + h, Math.cos(a) * (.03 + h * .35), MAT.fabric(i % 2 ? '#f1ddbe' : '#e4b07f', .7), [1, .7, 1], 10);
    }
  }
  if (type === 'books') {
    const covers = [color, '#e3d5b6', darker(color, .7)];
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Group(); b.position.y = i * .036; b.rotation.y = (i - 1) * .12; g.add(b);
      blk(b, .28 - i * .02, .034, .2 - i * .01, 0, 0, 0, MAT.paint(covers[i], .7), .004);
      blk(b, .27 - i * .02, .026, .195 - i * .01, .006, .004, 0, MAT.paint('#f5efe2', .9), .002);
    }
  }
  if (type === 'deskplant') {
    const pts = [[0, 0], [.075, 0], [.1, .14], [.1, .16], [0, .16]].map(([x, y]) => new THREE.Vector2(x, y));
    part(g, new THREE.LatheGeometry(pts, 24), MAT.ceramic('#e2cdb0', .4));
    const rnd = seeded(8), geo = new THREE.SphereGeometry(.06, 10, 8);
    for (let i = 0; i < 9; i++) { const a = i * 2.4, leaf = part(g, geo, MAT.leaf(i % 2 ? '#7f9c6c' : '#6a875a'), Math.sin(a) * .05, .2 + rnd() * .1, Math.cos(a) * .05); leaf.scale.set(.5, .2, 1.1); leaf.rotation.order = 'YXZ'; leaf.rotation.set(-.6, a, 0); }
  }
  if (type === 'art') {
    blk(g, .75, .65, .04, 0, 0, -.01, MAT.wood('#d9c4a0', .5), .006);
    part(g, new THREE.PlaneGeometry(.63, .53), MAT.tex(artTexture(color), '#ffffff', .85), 0, .325, .0115);
  }
  if (type === 'clock') {
    const disk = cyl(g, .2, .2, .045, 0, 0, 0, MAT.wood('#b48a5f', .45), 48, [Math.PI / 2, 0, 0]); disk.position.set(0, .2, 0);
    const face = part(g, new THREE.CircleGeometry(.172, 48), MAT.tex(clockFaceTexture(), lighter(color, .55), .6), 0, .2, .0235);
    face.castShadow = false;
    const hour = blk(g, .012, .1, .004, 0, .2, .028, MAT.black(), .002, [0, 0, .6]); hour.geometry.translate(0, .05, 0); hour.position.y = .2;
    const minute = blk(g, .008, .14, .004, 0, .2, .03, MAT.black(), .002, [0, 0, -1.9]); minute.geometry.translate(0, .07, 0); minute.position.y = .2;
  }
  if (def.mount === 'floor' && type !== 'rug' && type !== 'tablelamp') addContactShadow(g, w, d, type === 'plant' || type === 'cactus' || type === 'lamp' ? .35 : .55);
  if (def.mount === 'surface' || type === 'tablelamp') addContactShadow(g, w * .8, d * .8, .4);
  return g;
}

/* Renderer, apartment construction, lighting and the orbit / walk-through camera. */
let state = { layout: 'studio', mode: 'free', furniture: [], wall: '#e8e5d7', floor: '#c7aa80', night: false, contract: 'coder' },
  history = [], future = [], selected = null, placement = null, ghost = null, outline = null, snap = true, cat = '全部',
  pendingLayout = 'studio', pendingMode = 'free', confirmAction = null, drag = null, saveTimer;
const wrap = $('canvasWrap'), scene = new THREE.Scene();
const BG_DAY = '#ece9e1', BG_NIGHT = '#283140';
scene.background = new THREE.Color(BG_DAY);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.localClippingEnabled = true;
wrap.prepend(renderer.domElement);
const camera = new THREE.PerspectiveCamera(40, 1, .05, 300);
const roomGroup = new THREE.Group(), furnitureGroup = new THREE.Group(), ceilingGroup = new THREE.Group(), outsideGroup = new THREE.Group();
scene.add(roomGroup, furnitureGroup);
roomGroup.add(ceilingGroup, outsideGroup);

/* Image-based lighting: a soft studio box with a bright "window" panel, prefiltered once per mood. */
function environmentScene(night) {
  const env = new THREE.Scene(), basic = (color, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.BackSide });
  const shell = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 14), basic(night ? '#1c2230' : '#b9b2a6'));
  shell.position.y = 3; env.add(shell);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: night ? '#151515' : '#8a7a66' }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.4; env.add(floor);
  const panel = (w, h, x, y, z, ry, color, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; env.add(m); };
  if (night) { panel(3, 1, 0, 6.3, 0, 0, '#ffd9a0', 3); panel(2, 1, -4, 2, 4, Math.PI / 2, '#ffcf8a', 2); }
  else {
    panel(9, 4, 0, 3.4, -6.9, 0, '#eaf2ff', 7);
    panel(4, 3, 6.9, 3, 0, -Math.PI / 2, '#fff4e6', 3);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(2.2), side: THREE.DoubleSide }));
    top.rotation.x = Math.PI / 2; top.position.y = 6.4; env.add(top);
  }
  return env;
}
const envMaps = {};
function environmentFor(night, target = renderer) {
  const key = night ? 'night' : 'day';
  if (target === renderer && envMaps[key]) return envMaps[key];
  const pm = new THREE.PMREMGenerator(target), tex = pm.fromScene(environmentScene(night), .035).texture;
  pm.dispose();
  if (target === renderer) envMaps[key] = tex;
  return tex;
}
const hemi = new THREE.HemisphereLight('#f4f1ea', '#8a7c6a', .45);
const sun = new THREE.DirectionalLight('#fff1dc', 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -.0004;
sun.shadow.normalBias = .03;
sun.shadow.radius = 3;
scene.add(hemi, sun, sun.target);

const layout = () => layouts.find(l => l.id === state.layout) || layouts[0];
const H = WALL_HEIGHT, CUT_LOW = .32;
let wallSets = [];

/* ---------- Apartment construction ---------- */
function geoAt(geo, x, y, z) { geo.translate(x, y, z); return worldUV(geo); }
function slabBox(w, h, d, x, y, z) { return geoAt(new THREE.BoxGeometry(w, h, d), x, y, z); }
function roomMesh(parent, geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent.add(m); return m;
}
function roomAt(l, x, z) { return l.rooms.find(r => x > r.rect[0] && x < r.rect[1] && z > r.rect[2] && z < r.rect[3]); }
function wallIndexAt(l, vertical, line, along) {
  return l.wallInfo.findIndex(w => w.vertical === vertical && Math.abs(w.line - line) < .02 && along >= w.lo - .01 && along <= w.hi + .01);
}
function floorMaterial(kind) {
  if (kind === 'herringbone' || kind === 'plank') {
    const map = (kind === 'herringbone' ? herringboneTexture() : plankTexture()).clone();
    if (kind === 'herringbone') { map.rotation = Math.PI / 4; map.center.set(.5, .5); }
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: state.floor, map, roughness: .42, bumpMap: map, bumpScale: .4 });
  }
  if (kind === 'hex') return new THREE.MeshStandardMaterial({ color: '#ffffff', map: hexTexture(), roughness: .45, envMapIntensity: .6 });
  if (kind === 'checker') return new THREE.MeshStandardMaterial({ color: '#ffffff', map: checkerTexture(), roughness: .48, envMapIntensity: .55 });
  if (kind === 'deck') return new THREE.MeshStandardMaterial({ color: '#b9a48a', map: deckTexture(), roughness: .85 });
  return MAT.paint('#ccc');
}
const trimMat = () => MAT.lacquer('#f4f1ea', .45);
function room() {
  disposeGroup(roomGroup);
  roomGroup.add(ceilingGroup, outsideGroup);
  wallSets = [];
  const l = layout();
  const xs = l.rooms.flatMap(r => r.rect.slice(0, 2)), zs = l.rooms.flatMap(r => r.rect.slice(2));
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  // Building slab and the ground it sits on.
  roomMesh(roomGroup, slabBox(maxX - minX + .6, .3, maxZ - minZ + .6, (minX + maxX) / 2, -.15, (minZ + maxZ) / 2), MAT.paint('#d9d2c6', .9), { cast: false });
  const ground = roomMesh(roomGroup, new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: state.night ? '#2c3442' : '#e4e0d7', roughness: 1 }), { cast: false });
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.3;
  // Floors, one material per finish.
  const floorMats = {};
  for (const r of l.rooms) {
    const [x1, x2, z1, z2] = r.rect;
    const mat = floorMats[r.floor] || (floorMats[r.floor] = floorMaterial(r.floor));
    roomMesh(roomGroup, slabBox(x2 - x1, .06, z2 - z1, (x1 + x2) / 2, 0, (z1 + z2) / 2), mat, { cast: false });
    // Ceiling with a flush light, only shown when the camera walks inside.
    if (r.kind === 'balcony') continue;
    const ceilMat = MAT.paint('#f6f4ef', .95);
    ceilMat.emissive.set(state.night ? '#2a2620' : '#9c978e'); ceilMat.emissiveIntensity = state.night ? .4 : .55;
    const ceil = roomMesh(ceilingGroup, slabBox(x2 - x1, .04, z2 - z1, (x1 + x2) / 2, H + .02, (z1 + z2) / 2), ceilMat, { cast: false });
    ceil.userData.ceiling = true;
    const fixture = roomMesh(ceilingGroup, new THREE.SphereGeometry(.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.emissive('#fff6e6', state.night ? 1.6 : .6), { cast: false });
    fixture.scale.y = .45; fixture.rotation.x = Math.PI; fixture.position.set((x1 + x2) / 2, H, (z1 + z2) / 2);
    if (state.night) {
      // Warm ceiling light per room keeps the apartment legible after dark; lamps add the cosy pools.
      const light = new THREE.PointLight('#ffd9a8', r.kind === 'bath' ? 1.6 : 3.2, Math.max(x2 - x1, z2 - z1) + 2.5, 1.6);
      light.position.set((x1 + x2) / 2, H - .35, (z1 + z2) / 2);
      roomGroup.add(light);
    }
  }
  // Walls.
  l.wallInfo.forEach((info, i) => buildWall(l, info, i));
  for (const d of l.doors) buildDoor(l, d);
  for (const w of l.windows) buildWindow(l, w);
  for (const fx of l.fixtures) buildFixture(l, fx);
  buildEdgeShadows(l);
  buildOutside(l, minX, maxX, minZ, maxZ);
  for (const set of wallSets) applyClip(set);
  // Sun from the street side; the shadow camera hugs the apartment.
  const span = Math.max(maxX - minX, maxZ - minZ) / 2 + 1.5;
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: .5, far: 60 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.target.position.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
  sun.position.set((minX + maxX) / 2 - 6, 11, minZ - 12);
  $('sceneTitle').textContent = l.name;
  $('sceneDetail').textContent = l.en + ' · ' + l.desc;
  $('roomTitle').textContent = l.name + ' · 我的理想小屋';
  setLight();
  if (!view.ready || view.layout !== l.id) frameLayout(true);
  requestFrame();
}
function wallSet(i) {
  if (!wallSets[i]) {
    const group = new THREE.Group(), plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), H + 1);
    group.userData.wallIndex = i; roomGroup.add(group);
    wallSets[i] = { group, plane, cut: H + .05, goal: H + .05, info: layout().wallInfo[i], cap: null, scaled: [] };
  }
  return wallSets[i];
}
function applyClip(set) {
  set.group.traverse(o => { if (o.material && !o.userData.noClip) for (const m of [].concat(o.material)) { m.clippingPlanes = [set.plane]; m.clipShadows = false; } });
}
function sideFace(info, s) { return info.vertical ? (s > 0 ? 0 : 1) : (s > 0 ? 4 : 5); }
function buildWall(l, info, i) {
  const set = wallSet(i), g = set.group;
  const along = (a, b) => [(a + b) / 2, b - a];
  const ext = info.exterior, t = ext ? .3 : .12, center = info.line + (ext ? info.outward * .09 : 0);
  const atGap = v => l.doors.some(d => d.vertical === info.vertical && Math.abs((d.vertical ? d.x : d.z) - info.line) < .01 && Math.abs(Math.abs((d.vertical ? d.z : d.x) - v) - d.w / 2) < .01);
  const extend = ext ? .24 : .06;
  const lo = info.lo - (atGap(info.lo) ? 0 : extend), hi = info.hi + (atGap(info.hi) ? 0 : extend);
  if (info.glass) { buildGlassWall(l, info, set); return; }
  // Face materials per side: paint, brick, bath tile or the building's exterior render.
  const mid = (info.lo + info.hi) / 2, probe = (s, d = .2) => info.vertical ? roomAt(l, info.line + s * d, mid) : roomAt(l, mid, info.line + s * d);
  const faceMat = s => {
    const r = probe(s);
    if (!r) return MAT.paint('#cfc6b8', .95);
    if (info.brick && r.kind !== 'bath') return new THREE.MeshStandardMaterial({ color: '#ffffff', map: brickTexture(), roughness: .9, bumpMap: brickTexture(), bumpScale: .8 });
    return MAT.plaster(r.kind === 'bath' ? '#f1efe9' : state.wall);
  };
  const plus = faceMat(1), minus = faceMat(-1), cap = MAT.paint('#3f3b37', .9), endMat = MAT.plaster(state.wall);
  const mats = [endMat, endMat, cap, cap, endMat, endMat];
  mats[sideFace(info, 1)] = plus; mats[sideFace(info, -1)] = minus;
  const openings = l.windows.filter(w => w.wall === i).sort((a, b) => a.at - b.at);
  const piece = (a, b, y0, y1) => {
    const [c, len] = along(a, b);
    const geo = info.vertical ? slabBox(t, y1 - y0, len, center, (y0 + y1) / 2, c) : slabBox(len, y1 - y0, t, c, (y0 + y1) / 2, center);
    roomMesh(g, geo, mats);
  };
  let cursor = lo;
  for (const w of openings) {
    const a = w.at - w.w / 2, b = w.at + w.w / 2;
    piece(cursor, a, 0, H); piece(a, b, 0, w.sill); piece(a, b, w.top, H);
    cursor = b;
  }
  piece(cursor, hi, 0, H);
  // A dark cap that rides on the cut line so a lowered wall still reads as solid.
  const [c, len] = along(lo, hi);
  const capMesh = roomMesh(roomGroup, info.vertical ? slabBox(t + .004, .012, len + .004, center, 0, c) : slabBox(len + .004, .012, t + .004, c, 0, center), MAT.paint('#3a3633', .9), { cast: false });
  capMesh.visible = false; set.cap = capMesh;
  // Trim: baseboard and crown on every room-facing side; bathroom wainscot in subway tile.
  for (const s of [-1, 1]) {
    const r = probe(s);
    if (!r) continue;
    const face = info.line + s * .06, [cc, ll] = along(info.lo, info.hi);
    const board = (h, depth, y, mat) => roomMesh(g, info.vertical ? slabBox(depth, h, ll, face + s * depth / 2, y + h / 2, cc) : slabBox(ll, h, depth, cc, y + h / 2, face + s * depth / 2), mat, { cast: false });
    if (r.kind === 'bath') {
      const tile = new THREE.MeshStandardMaterial({ color: '#ffffff', map: subwayTexture(), roughness: .25 });
      board(1.25, .012, 0, tile);
      board(.06, .03, 1.22, trimMat());
    } else if (r.kind !== 'balcony') {
      board(.14, .018, 0, trimMat());
      board(.025, .03, .11, trimMat());
      board(.08, .035, H - .08, trimMat());
    }
  }
}
function buildGlassWall(l, info, set) {
  const g = set.group, mullion = MAT.metal('#3a3d3f', .5), glass = MAT.glass();
  const [lo, hi] = [info.lo, info.hi], len = hi - lo, n = Math.max(1, Math.round(len / 1.3));
  const at = (a, y, h, w, d) => info.vertical ? slabBox(d, h, w, info.line, y, a) : slabBox(w, h, d, a, y, info.line);
  roomMesh(g, at((lo + hi) / 2, .05, .1, len, .1), mullion);
  roomMesh(g, at((lo + hi) / 2, H - .1, .2, len, .14), MAT.paint('#e9e5dd'));
  for (let k = 0; k <= n; k++) roomMesh(g, at(lo + len * k / n, H / 2, H, .05, .1), mullion);
  const pane = roomMesh(g, at((lo + hi) / 2, H / 2, H - .3, len, .012), glass, { cast: false });
  pane.userData.glass = true;
  // Sheer curtains gathered at the outer ends of the glass wall.
  const atEnd = v => !l.doors.some(d => Math.abs((info.vertical ? d.z : d.x) - v) <= d.w / 2 + .02 && Math.abs((info.vertical ? d.x : d.z) - info.line) < .02);
  if (atEnd(lo)) addCurtains(g, info, lo + .45, .9, .1, H - .15, true, 1, 1);
  if (atEnd(hi)) addCurtains(g, info, hi - .45, .9, .1, H - .15, true, 1, -1);
}
function buildDoor(l, d) {
  const vertical = d.vertical, line = vertical ? d.x : d.z, c = vertical ? d.z : d.x;
  const idx = wallIndexAt(l, vertical, line, c - d.w / 2 - .02) >= 0 ? wallIndexAt(l, vertical, line, c - d.w / 2 - .02) : wallIndexAt(l, vertical, line, c + d.w / 2 + .02);
  const info = l.wallInfo[idx], set = idx >= 0 ? wallSet(idx) : null, g = set ? set.group : roomGroup;
  const ext = info?.exterior, t = ext ? .3 : .12, center = line + (ext ? info.outward * .09 : 0);
  const box = (w, h, depth, a, y, off) => vertical ? slabBox(depth, h, w, off, y, a) : slabBox(w, h, depth, a, y, off);
  const top = d.kind === 'slider' ? H - .2 : 2.1;
  if (d.kind === 'slider') {
    roomMesh(g, box(d.w, .2, .14, c, H - .1, line), MAT.paint('#e9e5dd'));
    for (const s of [-1, 1]) roomMesh(g, box(.06, H, .1, c + s * d.w / 2, H / 2, line), MAT.metal('#3a3d3f', .5));
    // the sliding panel parked behind the fixed glass
    const parked = roomMesh(g, box(d.w * .55, H - .3, .012, c + d.w / 2 + d.w * .3, H / 2, line + .07), MAT.glass(), { cast: false });
    parked.userData.glass = true;
    roomMesh(g, box(.04, H - .3, .05, c + d.w / 2 + .03, H / 2, line + .07), MAT.metal('#3a3d3f', .5));
    roomMesh(roomGroup, box(d.w, .02, .14, c, .035, line), MAT.metal('#5a5d5f', .5), { cast: false });
    return;
  }
  roomMesh(g, box(d.w + .01, H - top, t, c, (H + top) / 2, center), [MAT.plaster(state.wall)]);
  // Painted casing on both faces.
  for (const s of [-1, 1]) {
    const r = vertical ? roomAt(l, line + s * .2, c) : roomAt(l, c, line + s * .2);
    if (!r) continue;
    const face = line + s * .072;
    roomMesh(g, box(d.w + .16, .08, .024, c, top + .04, face), trimMat(), { cast: false });
    for (const e of [-1, 1]) roomMesh(g, box(.07, top, .024, c + e * (d.w / 2 + .035), top / 2, face), trimMat(), { cast: false });
  }
  // Threshold.
  roomMesh(roomGroup, box(d.w, .014, t + .02, c, .036, center), d.kind === 'bath' ? MAT.marble() : MAT.wood('#a07a52', .5), { cast: false });
  if (d.kind === 'arch') return;
  const leafW = d.w - .05, leafH = top - .02;
  const leaf = new THREE.Group(); g.add(leaf);
  const paint = d.kind === 'entry' ? MAT.lacquer('#40514c', .4) : MAT.lacquer('#f3f0e9', .4);
  blk(leaf, leafW, leafH, .045, 0, 0, 0, paint, .006);
  for (const s of [-1, 1]) {
    for (const [py, ph] of [[.12, .78], [1.02, .95]]) blk(leaf, leafW - .2, ph, .012, 0, py, s * .025, paint, .004);
    cyl(leaf, .028, .028, .012, leafW / 2 - .08, 1.0, s * .03, MAT.brass(), 16, [Math.PI / 2, 0, 0]);
    ball(leaf, .026, leafW / 2 - .08, 1.0, s * .045, MAT.brass(), [1, 1, 1], 12);
  }
  if (d.kind === 'entry') {
    cyl(leaf, .022, .022, .07, leafW / 2 - .08, 1.18, 0, MAT.brass(), 14, [Math.PI / 2, 0, 0]);
    cyl(leaf, .008, .008, .07, 0, 1.52, 0, MAT.brass(), 10, [Math.PI / 2, 0, 0]);
    if (vertical) leaf.rotation.y = Math.PI / 2;
    leaf.position.set(vertical ? line : c, .03, vertical ? c : line);
  } else {
    const lf = d.leaf;
    leaf.position.set(lf.x, .03, lf.z);
    // open 90°: the leaf runs perpendicular to the wall
    if (!vertical) leaf.rotation.y = Math.PI / 2;
  }
}
function buildWindow(l, w) {
  const info = l.wallInfo[w.wall], set = wallSet(w.wall), g = set.group;
  const vertical = info.vertical, line = info.line, ext = info.exterior, t = ext ? .3 : .12;
  const inside = ext ? -info.outward : 1, center = line + (ext ? info.outward * .09 : 0);
  const box = (wd, h, depth, a, y, off) => vertical ? slabBox(depth, h, wd, off, y, a) : slabBox(wd, h, depth, a, y, off);
  const trim = trimMat(), h = w.top - w.sill, mid = (w.sill + w.top) / 2, face = line + inside * .06;
  // Interior casing, stool and apron.
  roomMesh(g, box(w.w + .16, .08, .025, w.at, w.top + .04, face + inside * .012), trim, { cast: false });
  for (const e of [-1, 1]) roomMesh(g, box(.07, h + .08, .025, w.at + e * (w.w / 2 + .035), mid + .02, face + inside * .012), trim, { cast: false });
  roomMesh(g, box(w.w + .2, .03, .14, w.at, w.sill - .015, face + inside * .03), trim);
  roomMesh(g, box(w.w + .1, .07, .02, w.at, w.sill - .065, face + inside * .01), trim, { cast: false });
  // Jambs lining the opening.
  for (const e of [-1, 1]) roomMesh(g, box(.02, h, t, w.at + e * (w.w / 2 - .01), mid, center), trim, { cast: false });
  roomMesh(g, box(w.w, .02, t, w.at, w.top - .01, center), trim, { cast: false });
  // Double-hung sashes, two-over-two.
  const sash = MAT.lacquer('#f6f4ef', .4), sashLine = line + (ext ? info.outward * .02 : 0);
  for (const [y0, y1, off] of [[w.sill, mid + .02, -.025], [mid - .02, w.top, .025]]) {
    const sh = y1 - y0, sm = (y0 + y1) / 2, so = sashLine + off * inside;
    roomMesh(g, box(w.w - .02, .05, .04, w.at, y0 + .025, so), sash);
    roomMesh(g, box(w.w - .02, .05, .04, w.at, y1 - .025, so), sash);
    for (const e of [-1, 1]) roomMesh(g, box(.05, sh, .04, w.at + e * (w.w / 2 - .035), sm, so), sash);
    roomMesh(g, box(.022, sh - .08, .03, w.at, sm, so), sash);
    const pane = roomMesh(g, box(w.w - .1, sh - .08, .006, w.at, sm, so), MAT.glass(), { cast: false });
    pane.userData.glass = true;
  }
  roomMesh(g, box(.06, .02, .025, w.at, mid + .03, sashLine), MAT.brass(), { cast: false });
  addCurtains(g, info, w.at, w.w + .3, w.sill - .25 > .2 ? .1 : .1, w.top + .18, false, inside);
}
function addCurtains(g, info, at, width, y0, y1, sheer, inside = 1, only = 0) {
  const vertical = info.vertical, off = info.line + inside * (sheer ? .14 : .16);
  const closed = state.curtains, color = sheer ? '#efece4' : '#e5dccb';
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide, transparent: sheer, opacity: sheer ? .82 : 1, bumpMap: fabricTexture(), bumpScale: .4 });
  const h = y1 - y0, panelW = closed ? width / 2 : .26;
  for (const s of only ? [only] : [-1, 1]) {
    const c = closed && !only ? at + s * width / 4 : at + s * (width / 2 - .1);
    const folds = Math.max(4, Math.round(panelW / .07)), geo = new THREE.PlaneGeometry(panelW, h, folds * 2, 1), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) / panelW * folds * Math.PI) * (closed ? .025 : .045));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat.clone());
    m.castShadow = true; m.receiveShadow = true;
    if (vertical) { m.rotation.y = Math.PI / 2; m.position.set(off, y0 + h / 2, c); } else m.position.set(c, y0 + h / 2, off);
    g.add(m);
  }
  const rod = MAT.metal('#2d2b28', .4);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, width + .2, 10), rod);
  r.rotation.set(vertical ? Math.PI / 2 : 0, 0, vertical ? 0 : Math.PI / 2);
  r.position.set(vertical ? off : at, y1 + .02, vertical ? at : off);
  g.add(r);
}
function buildFixture(l, fx) {
  if (fx.type === 'kitchen') return buildKitchen(l, fx);
  if (fx.type === 'radiator') {
    const g = new THREE.Group(); roomGroup.add(g);
    const paint = new THREE.MeshStandardMaterial({ color: '#d4d0c8', roughness: .45, metalness: .55 });
    const cols = Math.round(fx.w / .065);
    for (let k = 0; k < cols; k++) blk(g, .05, .52, .13, -fx.w / 2 + .0325 + k * fx.w / cols, .06, 0, paint, .022);
    blk(g, fx.w, .04, .1, 0, .07, 0, paint, .015); blk(g, fx.w, .04, .1, 0, .52, 0, paint, .015);
    cyl(g, .02, .02, .07, fx.w / 2 - .05, 0, 0, MAT.metal('#8f8a80'), 10);
    g.position.set(fx.x, .03, fx.z);
    if (fx.vertical) g.rotation.y = Math.PI / 2;
    addContactShadow(g, fx.w, .2, .35);
    return;
  }
  if (fx.type === 'closet') {
    const g = new THREE.Group(), host = wallIndexAt(l, fx.vertical, fx.line, fx.at);
    roomGroup.add(g);
    if (host >= 0) wallSet(host).scaled.push(g);
    const paint = MAT.lacquer('#f2efe8', .5), w = fx.w;
    blk(g, w, 2.4, .6, 0, 0, -.01, paint, .004);
    for (const s of [-1, 1]) {
      blk(g, w / 2 - .02, 2.2, .025, s * w / 4, .08, .3, paint, .004);
      for (const [py, ph] of [[.2, .9], [1.2, .95]]) blk(g, w / 2 - .18, ph, .012, s * w / 4, py, .315, paint, .003);
      ball(g, .025, s * .06, 1.05, .34, MAT.brass(), [1, 1, 1], 12);
    }
    blk(g, w + .1, .3, .64, 0, 2.4, 0, paint, .004);
    const facing = fx.side;
    g.position.set(fx.x, .03, fx.z);
    g.rotation.y = fx.vertical ? (facing > 0 ? Math.PI / 2 : -Math.PI / 2) : (facing > 0 ? 0 : Math.PI);
    return;
  }
  if (fx.type === 'fireplace') {
    const g = new THREE.Group(); roomGroup.add(g);
    const marble = MAT.marble();
    blk(g, fx.w, 1.2, .3, 0, 0, -.06, marble, .008);
    blk(g, .7, .7, .02, 0, .08, .1, MAT.black(.9), .004);
    blk(g, .78, .76, .1, 0, .06, .05, MAT.black(.7), .006);
    blk(g, fx.w + .18, .06, .42, 0, 1.18, 0, marble, .01);
    blk(g, fx.w + .2, .03, .5, 0, 0, .05, marble, .006);
    for (let k = 0; k < 3; k++) cyl(g, .05, .05, .55, -.15 + k * .15, .1, .05, MAT.wood('#6e5139', .9), 10, [0, 0, Math.PI / 2]).position.y = .14 + (k % 2) * .08;
    cyl(g, .05, .07, .2, -.45, 1.24, 0, MAT.ceramic('#d8cbb5', .3), 18);
    g.position.set(fx.x, .03, fx.z);
    g.rotation.y = fx.vertical ? (fx.side > 0 ? Math.PI / 2 : -Math.PI / 2) : (fx.side > 0 ? 0 : Math.PI);
    // overmantel mirror belongs to the wall so it lowers with it
    const idx = wallIndexAt(l, fx.vertical, fx.line, fx.at);
    if (idx >= 0) {
      const m = new THREE.Group(); wallSet(idx).group.add(m);
      blk(m, 1.1, 1.0, .04, 0, 0, 0, MAT.wood('#b8955f', .3), .01);
      part(m, new THREE.PlaneGeometry(.98, .88), MAT.mirror(), 0, .5, .022);
      m.position.set(fx.vertical ? fx.line + fx.side * .08 : fx.at, 1.4, fx.vertical ? fx.at : fx.line + fx.side * .08);
      m.rotation.y = g.rotation.y;
    }
    return;
  }
  if (fx.type === 'railing') {
    const g = new THREE.Group(); roomGroup.add(g);
    const len = fx.x2 - fx.x1;
    blk(g, len, .05, .07, (fx.x1 + fx.x2) / 2, 1.0, fx.z, MAT.metal('#3a3d3f', .4), .01);
    const pane = blk(g, len, .9, .012, (fx.x1 + fx.x2) / 2, .08, fx.z, MAT.glass(), .002); pane.castShadow = false;
    for (let x = fx.x1; x <= fx.x2 + .01; x += 1.0) blk(g, .04, 1.0, .04, x, .03, fx.z, MAT.metal('#3a3d3f', .4), .008);
    return;
  }
  buildBathFixture(l, fx);
}
function buildBathFixture(l, fx) {
  const g = new THREE.Group(); roomGroup.add(g);
  const porcelain = MAT.ceramic('#fbfaf7', .12), r = l.rooms.find(rm => rm.kind === 'bath' && fx.x > rm.rect[0] && fx.x < rm.rect[1] && fx.z > rm.rect[2] && fx.z < rm.rect[3]);
  // Back of the fixture goes against the nearest bathroom wall.
  let rot = fx.rot || 0, x = fx.x, z = fx.z;
  if (r && fx.type !== 'tub') {
    const [x1, x2, z1, z2] = r.rect, depth = fx.type === 'toilet' ? .68 : .5;
    const dist = [[x - x1, 1, 'x', x1 + .06 + depth / 2], [x2 - x, 3, 'x', x2 - .06 - depth / 2], [z - z1, 0, 'z', z1 + .06 + depth / 2], [z2 - z, 2, 'z', z2 - .06 - depth / 2]].sort((a, b) => a[0] - b[0])[0];
    rot = dist[1];
    if (dist[2] === 'x') x = dist[3]; else z = dist[3];
  }
  if (fx.type === 'tub') {
    const L = 1.52, W = .76, h = .55;
    blk(g, L, h - .06, W, 0, 0, 0, porcelain, .03);
    blk(g, L - .14, .02, W - .14, 0, .1, 0, MAT.ceramic('#f1f3f3', .1), .01);
    for (const s of [-1, 1]) { blk(g, L, .07, .07, 0, h - .07, s * (W / 2 - .035), porcelain, .03); blk(g, .07, .07, W, s * (L / 2 - .035), h - .07, 0, porcelain, .03); }
    for (const s of [-1, 1]) blk(g, L - .14, h - .17, .02, 0, .1, s * (W / 2 - .08), MAT.ceramic('#f4f6f6', .1), .01);
    const chrome = MAT.chrome();
    cyl(g, .018, .018, .14, -L / 2 + .1, h, 0, chrome, 12);
    cyl(g, .012, .012, 1.6, L / 2 - .04, 2.0, W / 2 - .02, chrome, 8, [0, 0, Math.PI / 2]).position.set(0, 2.0, W / 2 - .02);
    // shower curtain pushed back to the tap end
    const curtain = new THREE.PlaneGeometry(.32, 1.4, 16, 1), p = curtain.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * 60) * .025);
    curtain.computeVertexNormals();
    const cm = part(g, curtain, new THREE.MeshStandardMaterial({ color: '#dfe7e6', roughness: .9, side: THREE.DoubleSide, transparent: true, opacity: .85 }), -L / 2 + .2, 1.3, W / 2 - .02);
    cm.castShadow = true;
  } else if (fx.type === 'toilet') {
    const base = [[0, 0], [.13, 0], [.11, .2], [.17, .36], [.18, .4], [0, .4]].map(([a, b]) => new THREE.Vector2(a, b));
    const bowl = part(g, new THREE.LatheGeometry(base, 28), porcelain, 0, 0, .06); bowl.scale.set(1, 1, 1.25);
    const seat = part(g, new THREE.TorusGeometry(.14, .03, 10, 28), MAT.ceramic('#ffffff', .2), 0, .42, .06, [Math.PI / 2, 0, 0]); seat.scale.set(1, 1.3, 1);
    blk(g, .44, .4, .19, 0, .38, -.21, porcelain, .03);
    blk(g, .46, .04, .21, 0, .78, -.21, porcelain, .015);
    cyl(g, .012, .012, .05, .14, .8, -.21, MAT.chrome(), 8);
  } else if (fx.type === 'basin') {
    const ped = [[0, 0], [.13, 0], [.09, .1], [.07, .55], [.12, .7], [0, .7]].map(([a, b]) => new THREE.Vector2(a, b));
    part(g, new THREE.LatheGeometry(ped, 24), porcelain);
    blk(g, .58, .14, .46, 0, .7, .0, porcelain, .05);
    blk(g, .4, .02, .28, 0, .82, .03, MAT.ceramic('#eef0f0', .08), .01);
    const chrome = MAT.chrome();
    cyl(g, .016, .016, .16, 0, .84, -.17, chrome, 12);
    cyl(g, .01, .01, .12, 0, .99, -.11, chrome, 8, [Math.PI / 2, 0, 0]).position.set(0, .99, -.12);
    // medicine cabinet on the wall behind
    blk(g, .5, .62, .12, 0, 1.15, -.21, MAT.lacquer('#f4f1ea', .4), .01);
    part(g, new THREE.PlaneGeometry(.44, .56), MAT.mirror(), 0, 1.46, -.149);
  }
  g.position.set(x, .03, z);
  g.rotation.y = rot * Math.PI / 2;
}
function buildKitchen(l, fx) {
  const base = new THREE.Group(); roomGroup.add(base);
  const idx = wallIndexAt(l, fx.vertical, fx.line, (fx.a + fx.b) / 2), wallG = idx >= 0 ? wallSet(idx).group : roomGroup;
  const upper = new THREE.Group(); wallG.add(upper);
  const cab = MAT.lacquer('#f1eee7', .45), top = state.layout === 'loft' || state.layout === 'corridor' ? MAT.wood('#b98a58', .45) : MAT.marble();
  const brass = MAT.brass(), steel = MAT.steel(), dark = MAT.black(.35);
  // Wall cabinets get their own material instances: they are clipped with the wall, the base run is not.
  const cabU = MAT.lacquer('#f1eee7', .45), steelU = MAT.steel(), brassU = MAT.brass(), panelU = MAT.lacquer('#e9e5dc', .45);
  // Local frame: u runs along the wall, v points out of the wall into the room.
  const s = fx.side, D = .64, face = fx.line + s * .06;
  const put = (grp, w, h, d, u, y, v, mat, r = .006) => {
    const m = blk(grp, w, h, d, 0, 0, 0, mat, r);
    m.position.set(fx.vertical ? face + s * v : u, y + h / 2 + .03, fx.vertical ? u : face + s * v);
    if (fx.vertical) m.rotation.y = Math.PI / 2;
    return m;
  };
  const windowSpans = l.windows.filter(w => w.wall === idx).map(w => [w.at - w.w / 2 - .05, w.at + w.w / 2 + .05]);
  for (const m of fx.modules) {
    const u0 = Math.min(m.a, m.b), u1 = Math.max(m.a, m.b), u = (u0 + u1) / 2, mw = u1 - u0;
    if (m.name === 'fridge') {
      put(base, mw - .01, 1.8, D, u, 0, D / 2, steel, .02);
      put(base, mw - .03, .02, .02, u, 1.12, D + .005, dark, .003);
      for (const [y, h] of [[1.2, .5], [.35, .6]]) put(base, .025, h, .03, u + (mw / 2 - .07), y, D + .03, MAT.chrome(), .01);
      put(upper, mw, .38, .62, u, 1.86, .31, cabU, .006);
      continue;
    }
    if (m.name === 'range') {
      put(base, mw - .01, .9, D, u, 0, D / 2, steel, .01);
      put(base, mw - .1, .42, .012, u, .2, D + .002, MAT.black(.15), .004);
      put(base, mw - .14, .02, .03, u, .66, D + .02, MAT.chrome(), .008);
      put(base, mw - .01, .02, D - .02, u, .9, D / 2, MAT.black(.4), .004);
      for (const [du, dv] of [[-.18, .18], [.18, .18], [-.18, .45], [.18, .45]]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.08, .012, 6, 18), MAT.black(.3));
        ring.rotation.x = Math.PI / 2; ring.position.set(fx.vertical ? face + s * dv : u + du, .955, fx.vertical ? u + du : face + s * dv); base.add(ring);
      }
      put(base, mw - .01, .12, .06, u, .92, .05, steel, .01);
      // hood above
      put(upper, mw, .22, .5, u, 1.6, .25, steelU, .02);
      put(upper, .3, .45, .25, u, 1.82, .13, steelU, .01);
      continue;
    }
    // cabinet carcass with toe kick and countertop
    put(base, mw - .004, .1, D - .08, u, 0, (D - .08) / 2, MAT.black(.8), .002);
    put(base, mw - .004, .78, D - .02, u, .1, (D - .02) / 2, cab, .004);
    if (m.name === 'dishwasher') { put(base, mw - .02, .74, .02, u, .12, D, steel, .006); put(base, mw - .1, .02, .03, u, .78, D + .02, MAT.chrome(), .006); }
    else if (m.name === 'slim') put(base, mw - .03, .74, .02, u, .12, D, cab, .004);
    else {
      put(base, mw - .03, .16, .02, u, .7, D, cab, .004);
      put(base, mw - .03, .54, .02, u, .13, D, cab, .004);
      put(base, mw - .15, .42, .008, u, .19, D + .012, MAT.lacquer('#e9e5dc', .45), .002);
      put(base, .12, .012, .02, u, .78, D + .02, brass, .004);
      put(base, .012, .12, .02, u + mw / 2 - .07, .45, D + .02, brass, .004);
    }
    put(base, mw, .04, D + .02, u, .88, (D + .02) / 2, top, .004);
    if (m.name === 'sink') {
      put(base, .5, .006, .38, u, .918, .34, MAT.metal('#7c8084', .25), .02);
      const tap = new THREE.Group(); base.add(tap);
      cyl(tap, .016, .018, .3, 0, 0, 0, MAT.chrome(), 12);
      const arc = part(tap, new THREE.TorusGeometry(.09, .012, 8, 18, Math.PI), MAT.chrome(), 0, .3, .09, [0, Math.PI / 2, 0]);
      arc.rotation.set(0, Math.PI / 2, 0);
      tap.position.set(fx.vertical ? face + s * .08 : u, .95, fx.vertical ? u : face + s * .08);
      tap.rotation.y = fx.vertical ? (s > 0 ? Math.PI / 2 : -Math.PI / 2) : (s > 0 ? 0 : Math.PI);
    }
    // uppers unless a window is in the way
    if (!windowSpans.some(([a, b]) => u1 > a && u0 < b)) {
      put(upper, mw - .004, .8, .33, u, 1.45, .165, cabU, .004);
      put(upper, mw - .03, .76, .02, u, 1.47, .335, cabU, .004);
      put(upper, mw - .15, .62, .008, u, 1.54, .347, panelU, .002);
      put(upper, .012, .12, .02, u + mw / 2 - .07, 1.5, .35, brassU, .004);
    }
  }
  // Subway backsplash between counter and uppers.
  const len = fx.b - fx.a, cu = (fx.a + fx.b) / 2, tile = new THREE.MeshStandardMaterial({ color: '#ffffff', map: subwayTexture(), roughness: .2 });
  const sp = fx.vertical ? slabBox(.012, .53, len, face + s * .006, .92 + .265 + .03, cu) : slabBox(len, .53, .012, cu, .92 + .265 + .03, face + s * .006);
  roomMesh(upper, sp, tile, { cast: false });
  // Under-cabinet glow at night.
  if (state.night) {
    const light = new THREE.PointLight('#ffd7a0', 1.6, 3.2, 2);
    light.position.set(fx.vertical ? face + s * .4 : cu, 1.3, fx.vertical ? cu : face + s * .4); roomGroup.add(light);
  }
}
function buildEdgeShadows(l) {
  // A soft darkening where floor meets wall stands in for ambient occlusion.
  const mat = new THREE.MeshBasicMaterial({ color: '#000', alphaMap: edgeShadowTexture(), transparent: true, opacity: .2, depthWrite: false });
  l.wallInfo.forEach((info, i) => {
    if (info.glass) return;
    for (const s of [-1, 1]) {
      const mid = (info.lo + info.hi) / 2, r = info.vertical ? roomAt(l, info.line + s * .2, mid) : roomAt(l, mid, info.line + s * .2);
      if (!r) continue;
      const len = info.hi - info.lo, depth = .45, geo = new THREE.PlaneGeometry(len, depth);
      const m = new THREE.Mesh(geo, mat); m.renderOrder = 1; m.raycast = () => {};
      m.rotation.order = 'YXZ';
      // plane's +y (v=1 → alpha top) must point at the wall
      if (info.vertical) { m.rotation.set(-Math.PI / 2, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0); m.position.set(info.line + s * (.06 + depth / 2), .034, mid); }
      else { m.rotation.set(-Math.PI / 2, s > 0 ? Math.PI : 0, 0); m.position.set(mid, .034, info.line + s * (.06 + depth / 2)); }
      roomGroup.add(m);
    }
  });
}
function buildOutside(l, minX, maxX, minZ, maxZ) {
  disposeGroup(outsideGroup);
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, dirs = new Set();
  for (const w of l.windows) { const i = l.wallInfo[w.wall]; if (i.exterior) dirs.add((i.vertical ? 'x' : 'z') + i.outward); }
  for (const i of l.wallInfo) if (i.glass) dirs.add('z-1');
  for (const key of dirs) {
    const axis = key[0], sign = Number(key.slice(1)), skyline = l.id === 'balcony' && key === 'z-1';
    const tex = facadeTexture(skyline ? 'skyline' : 'street', state.night).clone();
    tex.repeat.set(skyline ? 1 : 2, 1); tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false });
    mat.color.setScalar(state.night ? .9 : 1);
    const dist = skyline ? 30 : 11, wdt = skyline ? 120 : 44, hgt = skyline ? 30 : 22;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wdt, hgt), mat);
    if (axis === 'z') { m.position.set(cx, hgt / 2 - (skyline ? 9 : 6), sign < 0 ? minZ - dist : maxZ + dist); m.rotation.y = sign < 0 ? 0 : Math.PI; }
    else { m.position.set(sign < 0 ? minX - dist : maxX + dist, hgt / 2 - 6, cz); m.rotation.y = sign < 0 ? Math.PI / 2 : -Math.PI / 2; }
    outsideGroup.add(m);
  }
  outsideGroup.visible = false; ceilingGroup.visible = false;
}
function setLight() {
  wrap.classList.toggle('night', state.night);
  scene.background.set(state.night ? BG_NIGHT : BG_DAY);
  scene.environment = environmentFor(state.night);
  scene.environmentIntensity = state.night ? .32 : state.curtains ? .75 : 1.05;
  hemi.intensity = state.night ? .12 : .55;
  sun.intensity = state.night ? .35 : state.curtains ? .9 : 3.4;
  sun.color.set(state.night ? '#9fb3d9' : '#fff0d8');
  $('lightBtn').textContent = state.night ? '☾ 夜色' : '☀ 日光';
}

/* ---------- Furniture ---------- */
function disposeGroup(group) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse(o => {
      o.geometry?.dispose();
      if (o.material) [].concat(o.material).forEach(m => m.dispose());
    });
  }
}
let framePending = false, renderCount = 0;
function rebuild() {
  const existing = new Map(furnitureGroup.children.map(g => [g.userData.id, g])), ids = new Set(state.furniture.map(f => f.id));
  for (const g of [...furnitureGroup.children]) if (!ids.has(g.userData.id)) { furnitureGroup.remove(g); disposeGroup(g); }
  let lamps = 0;
  for (const f of state.furniture) {
    const def = byId[f.type], lit = state.night && f.on !== false && ['lamp', 'pendant'].includes(f.type) && lamps++ < 8;
    const key = JSON.stringify([f.type, f.color, !!lit, f.on !== false, state.night]);
    let g = existing.get(f.id);
    if (!g || g.userData.modelKey !== key) {
      if (g) { furnitureGroup.remove(g); disposeGroup(g); }
      g = model(def, f.color);
      g.userData.id = f.id;
      g.traverse(o => { o.userData.id = f.id; });
      if (lit) {
        const light = new THREE.PointLight('#ffcf8f', f.type === 'lamp' ? 5 : 2.6, 6, 2);
        light.position.set(0, g.userData.lightY || 1, 0);
        g.add(light);
        g.traverse(o => { if (o.userData.glow) { o.material.emissive.set('#ffc477'); o.material.emissiveIntensity = 1.4; } });
      }
      g.traverse(o => { if (o.userData.screen) { o.material.emissiveIntensity = f.on === false ? 0 : state.night ? .9 : .55; o.material.color.set(f.on === false ? '#0d1012' : '#000000'); } });
      g.userData.modelKey = key;
      furnitureGroup.add(g);
    }
    g.position.set(f.x, f.y || .03, f.z);
    g.rotation.y = f.rot * Math.PI / 2;
    g.visible = true;
  }
  drawOutline(); updateWalls(); updateUI(); requestFrame();
}
// Wall-hung pieces lower together with the wall they hang on.
function updateWalls() {
  const l = layout();
  for (const g of furnitureGroup.children) {
    const f = state.furniture.find(o => o.id === g.userData.id);
    const set = f && byId[f.type].mount === 'wall' ? wallSets[f.wallIndex] : null;
    g.traverse(o => { if (o.material && !o.userData.decor) [].concat(o.material).forEach(m => { m.clippingPlanes = set ? [set.plane] : null; }); });
    void l;
  }
  requestFrame();
}

/* ---------- Camera: orbit, pan, dolly, walk-through ---------- */
const view = { target: new THREE.Vector3(), yaw: Math.PI / 4, pitch: .72, dist: 12, ready: false, layout: null };
const goal = { target: new THREE.Vector3(), yaw: Math.PI / 4, pitch: .72, dist: 12 };
const EYE = 1.55;
function layoutBounds(l = layout()) {
  const xs = l.rooms.flatMap(r => r.rect.slice(0, 2)), zs = l.rooms.flatMap(r => r.rect.slice(2));
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
}
function maxDistance() { const b = layoutBounds(); return Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) * 1.9 + 4; }
function frameLayout(instant = false) {
  const l = layout(), b = layoutBounds(l);
  const radius = Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) / 2;
  const aspect = Math.max(.5, wrap.clientWidth / Math.max(1, wrap.clientHeight));
  const fit = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.min(1, aspect * .8) * 1.12;
  goal.target.set((b.minX + b.maxX) / 2, .5, (b.minZ + b.maxZ) / 2);
  // Long railroad plans are viewed side-on so their length runs across the screen.
  goal.yaw = l.d > l.w * 1.6 ? Math.PI / 2 - .5 : Math.PI / 4; goal.pitch = .78; goal.dist = THREE.MathUtils.clamp(fit * (l.d > l.w * 1.6 ? .8 : 1), 3, maxDistance());
  if (instant) { view.target.copy(goal.target); view.yaw = goal.yaw; view.pitch = goal.pitch; view.dist = goal.dist; }
  view.ready = true; view.layout = l.id;
  requestFrame();
}
function cameraUpdate() { requestFrame(); }
const offsetFor = (yaw, pitch, dist) => new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
const eyeMode = () => goal.dist < 3.2 && goal.pitch < .35;
function clampGoal() {
  const b = layoutBounds(), eye = eyeMode();
  goal.dist = THREE.MathUtils.clamp(goal.dist, .35, maxDistance());
  goal.pitch = THREE.MathUtils.clamp(goal.pitch, eye ? -.45 : .02, 1.5);
  goal.target.x = THREE.MathUtils.clamp(goal.target.x, b.minX - .8, b.maxX + .8);
  goal.target.z = THREE.MathUtils.clamp(goal.target.z, b.minZ - .8, b.maxZ + .8);
  goal.target.y = THREE.MathUtils.clamp(goal.target.y, .2, 2.3);
  // keep the camera above the floor and below the ceiling while walking around
  const camY = goal.target.y + Math.sin(goal.pitch) * goal.dist;
  if (camY < .35) goal.target.y += .35 - camY;
}
function orbitBy(dYaw, dPitch) {
  if (eyeMode()) {
    // Look around from where you stand instead of circling the target.
    const cam = goal.target.clone().add(offsetFor(goal.yaw, goal.pitch, goal.dist));
    goal.yaw += dYaw; goal.pitch = THREE.MathUtils.clamp(goal.pitch - dPitch, -.45, .34);
    goal.target.copy(cam).sub(offsetFor(goal.yaw, goal.pitch, goal.dist));
  } else { goal.yaw += dYaw; goal.pitch += dPitch; }
  clampGoal(); requestFrame();
}
function panBy(dx, dz) {
  // dx / dz in screen-aligned metres (right / forward)
  const right = new THREE.Vector3(Math.cos(goal.yaw), 0, -Math.sin(goal.yaw)), fwd = new THREE.Vector3(-Math.sin(goal.yaw), 0, -Math.cos(goal.yaw));
  goal.target.addScaledVector(right, dx).addScaledVector(fwd, dz);
  clampGoal(); requestFrame();
}
function dollyTo(factor, point = null) {
  const before = goal.dist;
  goal.dist = THREE.MathUtils.clamp(goal.dist * factor, .35, maxDistance());
  if (point && goal.dist < before && !eyeMode()) {
    const k = 1 - goal.dist / before;
    goal.target.x += (point.x - goal.target.x) * k; goal.target.z += (point.z - goal.target.z) * k;
  }
  clampGoal(); requestFrame();
}
function walkIn() {
  const l = layout(), main = [...l.rooms].filter(r => r.kind !== 'bath').sort((a, b) => (b.rect[1] - b.rect[0]) * (b.rect[3] - b.rect[2]) - (a.rect[1] - a.rect[0]) * (a.rect[3] - a.rect[2]))[0];
  const [x1, x2, z1, z2] = main.rect, deep = z2 - z1;
  // Stand near the room's front, eyes at 1.55 m, looking toward the street windows.
  goal.yaw = 0; goal.pitch = .04; goal.dist = 1.4;
  goal.target.set((x1 + x2) / 2, EYE - Math.sin(.04) * 1.4, z2 - Math.min(1.1, deep * .3) - 1.4);
  clampGoal(); requestFrame();
}
function focusOn(x, z) {
  goal.target.set(x, .5, z); goal.dist = Math.min(goal.dist, 5.5); if (goal.pitch < .45) goal.pitch = .8;
  clampGoal(); requestFrame();
}
let lastFrame = 0;
function stepCamera(dt) {
  const k = 1 - Math.exp(-dt * 9);
  let moving = false;
  const ease = (a, b) => { const v = a + (b - a) * k; if (Math.abs(b - v) > 1e-4) moving = true; return Math.abs(b - v) > 1e-4 ? v : b; };
  view.yaw = ease(view.yaw, goal.yaw); view.pitch = ease(view.pitch, goal.pitch); view.dist = ease(view.dist, goal.dist);
  view.target.x = ease(view.target.x, goal.target.x); view.target.y = ease(view.target.y, goal.target.y); view.target.z = ease(view.target.z, goal.target.z);
  const aspect = wrap.clientWidth / Math.max(1, wrap.clientHeight);
  camera.aspect = aspect; camera.near = view.dist < 3 ? .03 : .08;
  // Nudge the optical centre left on wide screens so the room clears the brief card on the right.
  const shift = wrap.clientWidth > 900 && !eyeMode() ? Math.min(140, wrap.clientWidth * .09) : 0;
  if (shift) camera.setViewOffset(wrap.clientWidth, wrap.clientHeight, shift, 0, wrap.clientWidth, wrap.clientHeight); else camera.clearViewOffset();
  camera.position.copy(view.target).add(offsetFor(view.yaw, view.pitch, view.dist));
  camera.lookAt(view.target);
  camera.updateProjectionMatrix();
  return moving;
}
function insideApartment(p) {
  const l = layout();
  return p.y < H - .05 && l.rooms.some(r => p.x > r.rect[0] + .02 && p.x < r.rect[1] - .02 && p.z > r.rect[2] + .02 && p.z < r.rect[3] - .02);
}
function segmentsCross(ax, az, bx, bz, info) {
  // does the camera→target segment cross this wall line within its span?
  const [p, q] = info.vertical ? [ax - info.line, bx - info.line] : [az - info.line, bz - info.line];
  if (p * q > 0) return false;
  const t = p / (p - q || 1e-9), v = info.vertical ? az + (bz - az) * t : ax + (bx - ax) * t;
  return v > info.lo - .3 && v < info.hi + .3;
}
function stepWalls(dt) {
  const inside = insideApartment(camera.position), plan = view.pitch > 1.3, cam = camera.position, tgt = view.target;
  const toCam = new THREE.Vector2(cam.x - tgt.x, cam.z - tgt.z).normalize();
  let moving = false;
  for (const set of wallSets) {
    if (!set) continue;
    const info = set.info;
    let low;
    if (plan) low = true;
    else if (inside) low = segmentsCross(cam.x, cam.z, tgt.x, tgt.z, info);
    else if (info.exterior) low = (info.vertical ? cam.x - info.line : cam.z - info.line) * info.outward > 0;
    else {
      const mx = info.vertical ? info.line : (info.lo + info.hi) / 2, mz = info.vertical ? (info.lo + info.hi) / 2 : info.line;
      const camSide = info.vertical ? Math.sign(cam.x - info.line) : Math.sign(cam.z - info.line);
      const tgtSide = info.vertical ? Math.sign(tgt.x - info.line) : Math.sign(tgt.z - info.line);
      low = camSide !== tgtSide || (mx - tgt.x) * toCam.x + (mz - tgt.y * 0 - tgt.z) * toCam.y > .4;
    }
    set.goal = low ? CUT_LOW : H + .05;
    const k = 1 - Math.exp(-dt * 10), next = set.cut + (set.goal - set.cut) * k;
    set.cut = Math.abs(set.goal - next) < .003 ? set.goal : next;
    if (set.cut !== set.goal) moving = true;
    set.plane.constant = set.cut;
    if (set.cap) { set.cap.visible = set.cut < H; set.cap.position.y = set.cut; }
    for (const o of set.scaled) o.scale.y = THREE.MathUtils.clamp(set.cut / H, .14, 1);
  }
  ceilingGroup.visible = inside; outsideGroup.visible = inside;
  return moving;
}
function requestFrame() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(t => {
    framePending = false;
    if (document.hidden) return;
    const dt = THREE.MathUtils.clamp(lastFrame ? (t - lastFrame) / 1000 : .016, 1 / 120, .05);
    lastFrame = t;
    const moving = stepCamera(dt);
    const walls = stepWalls(dt);
    renderer.render(scene, camera);
    renderCount++;
    if (moving || walls) requestFrame(); else lastFrame = 0;
  });
}
function renderNow() { stepCamera(1); stepWalls(1); renderer.render(scene, camera); }
// Jump straight to the resting camera and wall heights (used by tests and photo capture).
function settleView() {
  for (let i = 0; i < 400; i++) if (!(stepCamera(.05) | stepWalls(.05))) break;
  renderer.render(scene, camera);
}
function resize() { renderer.setSize(wrap.clientWidth, wrap.clientHeight); requestFrame(); }
new ResizeObserver(resize).observe(wrap);
const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.03);
function rayAt(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
  ray.setFromCamera(pointer, camera);
}
function groundPoint(e) { rayAt(e); return ray.ray.intersectPlane(plane, new THREE.Vector3()); }

const R = globalThis.RoomRules;
const hintText = () =>
  matchMedia("(pointer:coarse)").matches
    ? "单指拖动家具或转动视角 · 双指缩放与平移"
    : "左键旋转 · 右键平移 · 滚轮缩放 · V 走进房间";
const uid = () =>
  globalThis.crypto?.randomUUID?.() || "room-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
const clone = (v) => JSON.parse(JSON.stringify(v));
const dims = (f) => R.dims(f, byId),
  total = () => R.total(state, byId),
  budget = () => R.budget(state),
  goals = () => R.goals(state, byId, layouts);
let library = {
    version: 2,
    activeId: null,
    slots: [],
    badges: [],
    stars: {},
    tutorialDone: false,
    tutorialProgress: null,
  },
  pendingContract = "coder",
  scoreCache = null,
  lastPhotoURL = null;
const cleanStars = (value) =>
  Object.fromEntries(
    Object.entries(value && typeof value === "object" && !Array.isArray(value) ? value : {})
      .filter(([id]) => R.contracts[id])
      .map(([id, n]) => [id, Math.max(0, Math.min(3, Math.floor(Number(n) || 0)))]),
  );
function mergeProgress(progress) {
  if (!progress) return;
  library.badges = [
    ...new Set([
      ...library.badges,
      ...(Array.isArray(progress.badges) ? progress.badges : []).filter((id) => id === "free" || R.contracts[id]),
    ]),
  ];
  for (const [id, n] of Object.entries(cleanStars(progress.stars)))
    library.stars[id] = Math.max(library.stars[id] || 0, n);
}
function currentSlot() {
  return library.slots.find((s) => s.id === library.activeId);
}
function reason(f) {
  let test = state;
  const old = state.furniture.find((o) => o.id === f.id);
  if (old) test = { ...state, furniture: R.transformFamily(old, f, state) };
  else test = { ...state, furniture: [...state.furniture, f] };
  let why = R.reason(f, test, byId, layouts);
  if (!why && old)
    for (const child of test.furniture.filter((o) => R.familyIds(old, test).has(o.id))) {
      why = R.reason(child, test, byId, layouts);
      if (why) return "组合中的「" + byId[child.type].name + "」：" + why;
    }
  return why;
}
function valid(f) {
  return !reason(f);
}
function canBuy(type) {
  return total() + byId[type].price <= budget();
}
function checkpoint() {
  history.push(JSON.stringify(state));
  if (history.length > 70) history.shift();
  future = [];
}
function thumbnail() {
  renderer.render(scene, camera);
  const c = document.createElement("canvas");
  c.width = 280;
  c.height = 180;
  const x = c.getContext("2d");
  x.fillStyle = state.night ? "#47575c" : "#eeeee6";
  x.fillRect(0, 0, 280, 180);
  const ratio = Math.min(280 / renderer.domElement.width, 180 / renderer.domElement.height),
    w = renderer.domElement.width * ratio,
    h = renderer.domElement.height * ratio;
  x.drawImage(renderer.domElement, (280 - w) / 2, (180 - h) / 2, w, h);
  return c.toDataURL("image/jpeg", 0.65);
}
function writeLibrary() {
  try {
    localStorage.setItem("little-room-library-v2", JSON.stringify(library));
    $("saveState").textContent = "✓ 已自动保存";
    return true;
  } catch {
    $("saveState").textContent = "请导出备份";
    toast("浏览器存储空间不足或不可用，请到作品集导出存档");
    return false;
  }
}
let saveDebounce = null,
  thumbDebounce = null;
function flushSave() {
  clearTimeout(saveDebounce);
  saveDebounce = null;
  return writeLibrary();
}
function persist(immediate = false) {
  const slot = currentSlot();
  if (slot) {
    slot.state = clone(state);
    slot.updated = Date.now();
  }
  clearTimeout(saveDebounce);
  clearTimeout(thumbDebounce);
  $("saveState").textContent = "正在保存…";
  const capture = () => {
    if (placement || drag) {
      thumbDebounce = setTimeout(capture, 700);
      return;
    }
    if (currentSlot() === slot) {
      slot.thumb = thumbnail();
      flushSave();
    }
  };
  if (immediate) {
    if (slot && !placement && !drag) slot.thumb = thumbnail();
    flushSave();
  } else {
    saveDebounce = setTimeout(flushSave, 200);
    thumbDebounce = setTimeout(capture, 900);
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if ($("saveState").textContent !== "请导出备份") $("saveState").textContent = "本地自动保存";
  }, 2200);
}
function commit() {
  scoreCache = null;
  rebuild();
  syncTutorial();
  persist();
}
function restoreState(value) {
  cancelPlacement();
  state = clone(value);
  selected = null;
  scoreCache = null;
  room();
  rebuild();
  cameraUpdate();
  renderSurfaces();
  renderProducts();
  resumeTutorial();
}
function undo() {
  if (!history.length) return;
  future.push(JSON.stringify(state));
  restoreState(JSON.parse(history.pop()));
  persist();
  toast("已撤销上一步");
}
function redo() {
  if (!future.length) return;
  history.push(JSON.stringify(state));
  restoreState(JSON.parse(future.pop()));
  persist();
  toast("已重做");
}
function drawOutline() {
  requestFrame();
  if (outline) {
    scene.remove(outline);
    outline.geometry.dispose();
    outline.material.dispose();
    outline = null;
  }
  if (!selected || placement) return;
  const g = furnitureGroup.children.find((o) => o.userData.id === selected);
  if (g) {
    g.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    g.traverse((o) => {
      if (o.isMesh && !o.userData.decor) bounds.expandByObject(o);
    });
    outline = new THREE.Box3Helper(bounds.expandByScalar(0.015), "#5f9a4a");
    outline.material.depthTest = false;
    outline.renderOrder = 5;
    scene.add(outline);
  }
}
function select(id) {
  selected = id;
  drawOutline();
  updateSelection();
}
function updateSelection() {
  const f = state.furniture.find((f) => f.id === selected);
  $("selection").hidden = !f || !!placement;
  if (!f) return;
  $("selectedName").textContent = byId[f.type].name + (f.groupId ? " · 成组" : "");
  $("groupBtn").textContent = f.groupId ? "解除组合" : "组合餐桌椅";
  $("groupBtn").hidden = !!f.parentId || !["dining", "stool", "bench"].includes(f.type);
  $("interactBtn").hidden = !["lamp", "pendant", "tv"].includes(f.type);
  $("interactBtn").textContent = f.on === false ? "打开" : "关闭";
  $("angleValue").textContent = Math.round(f.rot * 90) + "°";
  $("swatches").innerHTML = "";
  $("rotateBtn").disabled = byId[f.type].mount === "wall";
  for (const color of availablePalette()) {
    const b = document.createElement("button");
    b.style.background = color;
    b.title = "切换家具配色";
    b.setAttribute("aria-label", "换成" + color);
    b.classList.toggle("active", f.color === color);
    b.onclick = () => {
      checkpoint();
      f.color = color;
      commit();
    };
    $("swatches").append(b);
  }
}
function startPlacement(type, existing = null) {
  cancelPlacement();
  if (!existing && !itemUnlocked(byId[type])) {
    toast("完成委托升至 Lv." + byId[type].level + " 解锁；自由创作可直接使用");
    return;
  }
  if (!existing && !canBuy(type)) {
    toast("预算还剩 ¥" + Math.max(0, budget() - total()).toLocaleString() + "，这件家具暂时放不下预算");
    return;
  }
  if (!existing && state.furniture.length >= 200) {
    toast("这间屋子已满 200 件，请先收起一些家具");
    return;
  }
  const f = existing ? { ...existing } : { id: uid(), type, x: 0, z: 0, y: 0.03, rot: 0, color: byId[type].color };
  placement = { f, existing: !!existing, original: existing ? { ...existing } : null, hasPoint: false, snapLabel: "" };
  ghost = model(byId[type], f.color);
  if (existing) {
    const a = (f.rot * Math.PI) / 2,
      c = Math.cos(a),
      sn = Math.sin(a);
    for (const o of state.furniture.filter((o) => o.id !== f.id && R.familyIds(f, state).has(o.id))) {
      const part = model(byId[o.type], o.color),
        dx = o.x - f.x,
        dz = o.z - f.z;
      part.position.set(c * dx - sn * dz, (o.y || 0.03) - (f.y || 0.03), sn * dx + c * dz);
      part.rotation.y = ((o.rot - f.rot) * Math.PI) / 2;
      ghost.add(part);
    }
  }
  ghost.traverse((o) => {
    if (o.userData.decor) o.visible = false;
    else if (o.material) {
      for (const m of [].concat(o.material)) {
        m.transparent = true;
        m.opacity = 0.55;
        m.depthWrite = false;
      }
    }
  });
  scene.add(ghost);
  ghost.visible = false;
  if (existing)
    for (const g of furnitureGroup.children) {
      const o = state.furniture.find((f) => f.id === g.userData.id);
      if (o && R.familyIds(existing, state).has(o.id)) g.visible = false;
    }
  selected = null;
  drawOutline();
  $("placement").hidden = false;
  $("placeRotate").disabled = byId[type].mount === "wall";
  $("placementText").textContent =
    byId[type].mount === "wall"
      ? "点击墙面挂起，避开窗户"
      : byId[type].mount === "surface"
        ? "把鼠标移到桌子或柜子上"
        : "点击地板放下 " + byId[type].name;
  $("hint").textContent = "拖动摆放 · 绿色可放 / 红色查看原因 · R 旋转 · Esc 取消";
  updateSelection();
}
function smartSnap(f, raw) {
  let step = snap ? 0.25 : 0.05;
  f.x = Math.round(raw.x / step) * step;
  f.z = Math.round(raw.z / step) * step;
  if (!snap || f.parentId) return "";
  const l = layouts.find((l) => l.id === state.layout),
    [w, d] = dims(f),
    xs = [],
    zs = [];
  for (const wall of l.walls) {
    if (wall[0] === wall[2]) {
      if (raw.z >= Math.min(wall[1], wall[3]) && raw.z <= Math.max(wall[1], wall[3]))
        xs.push(wall[0] + w / 2 + 0.07, wall[0] - w / 2 - 0.07);
    } else if (raw.x >= Math.min(wall[0], wall[2]) && raw.x <= Math.max(wall[0], wall[2]))
      zs.push(wall[1] + d / 2 + 0.07, wall[1] - d / 2 - 0.07);
  }
  for (const o of l.obstacles) {
    if (o.name === "门") continue;
    xs.push(o.x - (o.w + w) / 2 - 0.02, o.x + (o.w + w) / 2 + 0.02);
    zs.push(o.z - (o.d + d) / 2 - 0.02, o.z + (o.d + d) / 2 + 0.02);
  }
  for (const o of state.furniture) {
    if (R.familyIds(f, state).has(o.id) || o.parentId || byId[o.type].mount === "wall") continue;
    const [ow, od] = dims(o);
    xs.push(o.x, o.x - ow / 2 + w / 2, o.x + ow / 2 - w / 2, o.x - (ow + w) / 2 - 0.07, o.x + (ow + w) / 2 + 0.07);
    zs.push(o.z, o.z - od / 2 + d / 2, o.z + od / 2 - d / 2, o.z - (od + d) / 2 - 0.07, o.z + (od + d) / 2 + 0.07);
  }
  let aligned = false;
  for (const [key, values] of [
    ["x", xs],
    ["z", zs],
  ]) {
    values.sort((a, b) => Math.abs(raw[key] - a) - Math.abs(raw[key] - b));
    if (values.length && Math.abs(raw[key] - values[0]) < 0.14) {
      f[key] = values[0];
      aligned = true;
    }
  }
  return aligned ? "已吸附墙边 / 家具对齐" : "";
}
function hitFurniture(e) {
  rayAt(e);
  return ray.intersectObjects(furnitureGroup.children, true).find((h) => {
    let o = h.object;
    while (o) {
      if (!o.visible) return false;
      o = o.parent;
    }
    return !!h.object.userData.id;
  });
}
function positionPlacement(e, offset = null) {
  if (!placement) return;
  const f = placement.f,
    def = byId[f.type];
  rayAt(e);
  placement.hasPoint = false;
  placement.snapLabel = "";
  if (def.mount === "wall") {
    // Hang on whichever standing wall face the pointer meets first; lowered walls cannot take art.
    const l = layouts.find((l) => l.id === state.layout),
      hits = [],
      eye = camera.position;
    l.wallInfo.forEach((info, i) => {
      if (info.glass || (wallSets[i] && wallSets[i].cut < 2)) return;
      for (const side of info.sides) {
        const coord = info.line + side * 0.1;
        if (((info.vertical ? eye.x : eye.z) - info.line) * side <= 0) continue;
        const p = ray.ray.intersectPlane(
          new THREE.Plane(new THREE.Vector3(info.vertical ? 1 : 0, 0, info.vertical ? 0 : 1), -coord),
          new THREE.Vector3(),
        );
        if (!p) continue;
        const along = info.vertical ? p.z : p.x;
        if (along >= info.lo && along <= info.hi && p.y >= 0.35 && p.y <= WALL_HEIGHT - 0.15)
          hits.push({ p, i, side, vertical: info.vertical, distance: ray.ray.origin.distanceTo(p) });
      }
    });
    hits.sort((a, b) => a.distance - b.distance);
    if (hits.length) {
      const h = hits[0];
      f.x = h.vertical ? layouts.find((l) => l.id === state.layout).wallInfo[h.i].line + h.side * 0.1 : Math.round(h.p.x / 0.05) * 0.05;
      f.z = h.vertical ? Math.round(h.p.z / 0.05) * 0.05 : layouts.find((l) => l.id === state.layout).wallInfo[h.i].line + h.side * 0.1;
      f.y = Math.round((h.p.y - def.h / 2) * 10) / 10;
      f.rot = h.vertical ? (h.side > 0 ? 1 : 3) : h.side > 0 ? 0 : 2;
      f.wallIndex = h.i;
      delete f.parentId;
      placement.hasPoint = true;
    }
  } else {
    let parent = null,
      p = null;
    if (def.mount === "surface" || def.optionalSurface) {
      const hit = hitFurniture(e);
      if (hit) {
        let candidate = state.furniture.find((o) => o.id === hit.object.userData.id);
        if (candidate?.parentId) candidate = state.furniture.find((o) => o.id === candidate.parentId);
        if (candidate && byId[candidate.type].surface) {
          parent = candidate;
          const y = (parent.y || 0.03) + byId[parent.type].surface;
          p = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -y), new THREE.Vector3());
        }
      }
    }
    if (parent && p) {
      f.parentId = parent.id;
      f.y = (parent.y || 0.03) + byId[parent.type].surface;
      f.x = Math.round(p.x / 0.025) * 0.025;
      f.z = Math.round(p.z / 0.025) * 0.025;
      placement.snapLabel = "已落在「" + byId[parent.type].name + "」上";
      placement.hasPoint = true;
    } else {
      delete f.parentId;
      f.y = 0.03;
      p = ray.ray.intersectPlane(plane, new THREE.Vector3());
      if (p) {
        placement.snapLabel = smartSnap(f, { x: p.x - (offset?.x || 0), z: p.z - (offset?.z || 0) });
        placement.hasPoint = true;
      }
    }
  }
  updateGhost();
}
function updateGhost() {
  requestFrame();
  if (!placement) return;
  drawGuides();
  const f = placement.f;
  ghost.position.set(f.x, f.y || 0.03, f.z);
  ghost.rotation.y = (f.rot * Math.PI) / 2;
  const why = placement.hasPoint ? reason(f) : "请移到可以摆放的墙面或桌面";
  ghost.traverse((o) => {
    if (o.material && !o.userData.decor) for (const m of [].concat(o.material)) {
      m.color.set(why ? "#dc7c64" : "#a1c67c");
      if (m.emissive) m.emissive.set("#000000");
      m.map = null;
    }
  });
  ghost.visible = placement.hasPoint;
  $("placementText").textContent = why || placement.snapLabel || "可以放置 · " + byId[f.type].name;
  $("placement").classList.toggle("invalid", !!why);
  return !why;
}
function cancelPlacement() {
  requestFrame();
  clearGuides();
  if (ghost) {
    scene.remove(ghost);
    disposeGroup(ghost);
    ghost = null;
  }
  if (placement?.existing) for (const g of furnitureGroup.children) g.visible = true;
  placement = null;
  $("placement").hidden = true;
  $("hint").textContent = hintText();
  updateSelection();
}
function place() {
  if (!placement?.hasPoint) return;
  const why = reason(placement.f);
  if (why) {
    toast(why);
    return;
  }
  const f = { ...placement.f },
    repeat = $("repeatPlace").checked && !placement.existing;
  checkpoint();
  state.furniture = placement.existing ? R.transformFamily(placement.original, f, state) : [...state.furniture, f];
  cancelPlacement();
  selected = f.id;
  commit();
  toast("已安放 · " + byId[f.type].name);
  tutorialAction(f.type === "pendant" && f.parentId ? "lamp" : f.type);
  if (repeat) {
    startPlacement(f.type);
    if (placement) {
      placement.f.color = f.color;
      placement.f.rot = f.rot;
    }
  }
}
function rotate() {
  if (placement) {
    if (byId[placement.f.type].mount === "wall") return;
    placement.f.rot = normalizedRotation(placement.f.rot + Number($("angleStep").value) / 90);
    updateGhost();
    return;
  }
  const f = state.furniture.find((x) => x.id === selected);
  if (!f || byId[f.type].mount === "wall") return;
  const next = { ...f, rot: normalizedRotation(f.rot + Number($("angleStep").value) / 90) },
    why = reason(next);
  if (why) {
    toast(why);
    return;
  }
  checkpoint();
  state.furniture = R.transformFamily(f, next, state);
  commit();
  tutorialAction("rotate");
}
function remove() {
  if (!selected) return;
  const f = state.furniture.find((f) => f.id === selected),
    ids = R.familyIds(f, state),
    attached = ids.size - 1;
  checkpoint();
  state.furniture = state.furniture.filter((x) => !ids.has(x.id));
  selected = null;
  commit();
  toast(attached ? "组合与附属摆件共 " + (attached + 1) + " 件已收起，可撤销" : "家具已收起，费用已退回");
}
function goalHTML() {
  return goals()
    .map(
      ([name, done]) =>
        `<div class="goal ${done ? "done" : ""}"><span class="check">${done ? "✓" : ""}</span>${name}</div>`,
    )
    .join("");
}
function updateUI() {
  const gs = goals(),
    count = gs.filter((x) => x[1]).length;
  $("goals").innerHTML = goalHTML();
  $("progress").style.width = (count / gs.length) * 100 + "%";
  $("progressText").textContent = `${count} / ${gs.length} 个生活心愿`;
  $("placedCount").textContent = state.furniture.length;
  $("budgetLabel").innerHTML =
    state.mode === "challenge"
      ? `剩余预算 <b>¥ ${(budget() - total()).toLocaleString()}</b>`
      : `已花费 <b>¥ ${total().toLocaleString()}</b>`;
  $("modeLabel").textContent = state.mode === "free" ? "自由创作" : state.round === 2 ? "进阶二周目" : "设计委托";
  const c = R.contracts[state.contract] || R.contracts.coder;
  $("briefTitle").textContent =
    state.mode === "free" ? "让空房间，成为家" : c.name + (state.round === 2 ? " · 二周目" : "");
  $("briefText").textContent =
    state.mode === "free"
      ? "留出通道，再添一些自己的个性。"
      : c.story +
        (state.round === 2
          ? state.roundRules === 2
            ? " 进阶预算 ¥" + budget().toLocaleString() + "。" + R.encoreText[state.contract] + "；空间关系至少 85 分。"
            : " 旧版进阶规则：主色不超过三种，空间关系至少 85 分。"
          : "");
  $("undoBtn").disabled = !history.length;
  $("redoBtn").disabled = !future.length;
  $("sceneTitle").textContent = currentSlot()?.name || layouts.find((l) => l.id === state.layout).name;
  $("roomTitle").textContent =
    (currentSlot()?.name || "我的理想小屋") + " · " + layouts.find((l) => l.id === state.layout).name;
  updateSelection();
  updateProgressUI();
}
function assessment() {
  return scoreCache || (scoreCache = R.evaluate(state, byId, layouts));
}
function finish() {
  cancelPlacement();
  select(null);
  if (tutorial) tutorialAction("finish");
  const result = assessment();
  $("resultTitle").textContent = result.complete ? "把日子，过成喜欢的样子。" : "好生活，值得再打磨一点。";
  $("resultText").textContent =
    (result.complete ? "设计完成！" : "设计建议已准备好。") +
    " 生活需求、动线和基本空间关系是完成条件；具体进阶要求见下方目标。";
  $("resultStats").innerHTML =
    `<div><strong>${result.score}</strong><span>设计灵感分 / 100</span></div><div><strong>${state.furniture.length}</strong><span>件心选好物</span></div><div><strong>¥${total().toLocaleString()}</strong><span>装修花费</span></div>`;
  $("resultGoals").innerHTML = goalHTML();
  $("scoreBars").innerHTML = result.metrics
    .map(
      ([label, value]) =>
        `<div><span>${label}</span><i><b style="width:${value}%"></b></i><strong>${value}</strong></div>`,
    )
    .join("");
  $("starGoals").innerHTML =
    state.mode === "challenge"
      ? result.starGoals
          .map(([label, done]) => `<div class="${done ? "done" : ""}"><span>${done ? "★" : "☆"}</span>${label}</div>`)
          .join("")
      : "";
  renderDesignTips(result);
  let changed = false,
    xp = 0;
  if (result.complete) {
    const badge = state.mode === "challenge" ? state.contract : "free";
    if (!library.badges.includes(badge)) {
      library.badges.push(badge);
      xp = badge === "free" ? 0 : 100;
      changed = true;
    }
    if (state.mode === "challenge" && result.stars > (library.stars[state.contract] || 0)) {
      library.stars[state.contract] = result.stars;
      changed = true;
    }
    if (changed) {
      persist();
      renderProducts();
      renderSurfaces();
      updateProgressUI();
    }
  }
  const best = state.mode === "challenge" ? library.stars[state.contract] || 0 : 0;
  $("earnedBadge").textContent = result.complete
    ? state.mode === "challenge"
      ? "✦ " +
        R.contracts[state.contract].badge +
        " · 本次 " +
        result.stars +
        " 星 / 历史最佳 " +
        "★".repeat(best) +
        "☆".repeat(3 - best) +
        (xp ? " · +" + xp + " 经验" : " · 最佳成绩已记录")
      : "✦ 获得徽章 · 自由造梦家"
    : "继续调整，完成心愿、动线和基本空间关系，即可获得徽章";
  $("result").showModal();
}
function photo() {
  cancelPlacement();
  const old = selected;
  select(null);
  renderer.render(scene, camera);
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = state.night ? "#47575c" : "#eeeee6";
  ctx.fillRect(0, 0, 1600, 1200);
  const source = renderer.domElement,
    ratio = Math.min(1600 / source.width, 1050 / source.height),
    w = source.width * ratio,
    h = source.height * ratio;
  ctx.drawImage(source, (1600 - w) / 2, (1050 - h) / 2, w, h);
  ctx.fillStyle = state.night ? "#f6f3e6" : "#526449";
  ctx.font = "40px Microsoft YaHei, sans-serif";
  ctx.fillText("住进理想 / " + (currentSlot()?.name || "我的小屋").slice(0, 22), 70, 1110);
  ctx.font = "19px Microsoft YaHei, sans-serif";
  ctx.fillText("LITTLE ROOM STUDIO · " + state.furniture.length + " 件心选好物 · DESIGN YOUR EVERYDAY", 73, 1150);
  lastPhotoURL = canvas.toDataURL("image/png");
  $("photoPreview").src = lastPhotoURL;
  $("photoDownload").href = lastPhotoURL;
  $("photoDownload").download = "little-room-photo-" + Date.now() + ".png";
  $("photoDialog").showModal();
  select(old);
}
function resetGame() {
  if (pendingMode === "challenge" && !contractUnlocked(pendingContract)) {
    toast("先完成基础委托积累经验，再接取这份委托");
    return;
  }
  if (pendingMode === "challenge" && pendingRound === 2 && !library.badges.includes(pendingContract)) {
    toast("首次完成这份委托后即可解锁二周目");
    return;
  }
  if (library.slots.length >= 12) {
    toast("作品集已有 12 个作品，请先备份并删除一个空位");
    return;
  }
  cancelPlacement();
  tutorial = null;
  renderTutorial();
  if (currentSlot()) persist(true);
  state = {
    layout: pendingMode === "challenge" ? R.contracts[pendingContract].layout : pendingLayout,
    mode: pendingMode,
    contract: pendingContract,
    round: pendingMode === "challenge" ? pendingRound : 1,
    roundRules: 2,
    furniture: [],
    wall: "#e8e5d7",
    floor: "#c7aa80",
    night: false,
    curtains: false,
  };
  const name =
    state.mode === "challenge"
      ? R.contracts[pendingContract].name + (state.round === 2 ? " · 二周目" : "")
      : layouts.find((l) => l.id === state.layout).name;
  const slot = { id: uid(), name, state: clone(state), thumb: "", updated: Date.now() };
  library.slots.push(slot);
  library.activeId = slot.id;
  history = [];
  future = [];
  selected = null;
  scoreCache = null;
  room();
  frameLayout(true);
  commit();
  renderSurfaces();
  renderProducts();
  $("welcome").close();
  if (!library.tutorialDone && state.mode === "challenge" && state.contract === "coder") startTutorial();
  else toast("新作品已创建，旧作品留在作品集里");
}
function renderContracts() {
  const host = $("contractOptions");
  host.hidden = pendingMode !== "challenge";
  host.innerHTML = "";
  for (const [id, c] of Object.entries(R.contracts)) {
    const b = document.createElement("button"),
      stars = library.stars[id] || 0;
    b.className = "contract-card" + (pendingContract === id ? " active" : "");
    b.innerHTML = `<span class="contract-number">${String(Object.keys(R.contracts).indexOf(id) + 1).padStart(2, "0")} / DESIGN BRIEF</span><strong>${c.name}${contractUnlocked(id) ? "" : " · Lv." + c.level + " 解锁"}</strong><small>${c.client}</small><p>${c.story}</p><span>预算 ¥${c.budget.toLocaleString()} · ${layouts.find((l) => l.id === c.layout).name}</span>${library.badges.includes(id) ? `<em class="contract-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)} · 二周目已解锁</em>` : ""}`;
    b.onclick = () => {
      if (!contractUnlocked(id)) {
        toast("需要 Lv." + c.level + "：完成不同委托，每份可获得 100 经验");
        return;
      }
      pendingContract = id;
      pendingLayout = c.layout;
      renderContracts();
      renderLayouts();
    };
    host.append(b);
  }
  renderRoundOptions();
}
function openLayouts() {
  cancelPlacement();
  pendingLayout = state.layout;
  pendingMode = state.mode;
  pendingContract = state.contract || "coder";
  pendingRound = state.round || 1;
  renderLayouts();
  renderContracts();
  $$("[data-mode]").forEach((b) => b.classList.toggle("active", b.dataset.mode === pendingMode));
  $("continueBtn").hidden = false;
  $("welcome").showModal();
}
function openLibrary() {
  cancelPlacement();
  persist(true);
  renderLibrary();
  $("library").showModal();
}
function renderLibrary() {
  try {
    $("restorePreviousBtn").disabled = !localStorage.getItem("little-room-recovery-portfolio");
  } catch {
    $("restorePreviousBtn").disabled = true;
  }
  const host = $("libraryList");
  host.innerHTML = "";
  $("designName").value = currentSlot()?.name || "";
  $("libraryCount").textContent = library.slots.length + " / 12 件作品 · 自动保存当前作品";
  $("badgeShelf").textContent = library.badges.length
    ? "成就收藏  " + library.badges.map((id) => "✦ " + (R.contracts[id]?.badge || "自由造梦家")).join("　")
    : "完成委托，收集你的第一枚设计徽章。";
  for (const slot of [...library.slots].sort((a, b) => b.updated - a.updated)) {
    const card = document.createElement("article");
    card.className = "saved-card" + (slot.id === library.activeId ? " current" : "");
    const img = document.createElement("img");
    img.src = slot.thumb || "";
    img.alt = slot.name + "缩略图";
    const title = document.createElement("h3");
    title.textContent = slot.name;
    const meta = document.createElement("p");
    meta.textContent =
      layouts.find((l) => l.id === slot.state.layout).name +
      " · " +
      slot.state.furniture.length +
      " 件家具" +
      (slot.id === library.activeId ? " · 当前作品" : "");
    const row = document.createElement("div");
    const open = document.createElement("button");
    open.textContent = slot.id === library.activeId ? "继续布置" : "打开作品";
    open.onclick = () => {
      persist();
      library.activeId = slot.id;
      history = [];
      future = [];
      restoreState(slot.state);
      persist();
      $("library").close();
      toast("已打开「" + slot.name + "」");
    };
    const remove = document.createElement("button");
    remove.textContent = "删除";
    remove.disabled = slot.id === library.activeId;
    remove.title = remove.disabled ? "请先切换到其他作品再删除" : "删除此作品";
    remove.onclick = () =>
      ask("删除「" + slot.name + "」？", "此作品会从作品集移除。建议先导出存档；此操作无法撤销。", () => {
        library.slots = library.slots.filter((s) => s.id !== slot.id);
        writeLibrary();
        renderLibrary();
      });
    row.append(open, remove);
    card.append(img, title, meta, row);
    host.append(card);
  }
}
function saveAs() {
  if (library.slots.length >= 12) {
    toast("作品集已满，请先导出并腾出位置");
    return;
  }
  persist();
  const name = $("designName").value.trim().slice(0, 28) || "我的理想小屋";
  const slot = { id: uid(), name, state: clone(state), thumb: thumbnail(), updated: Date.now() };
  library.slots.push(slot);
  library.activeId = slot.id;
  history = [];
  future = [];
  persist();
  updateUI();
  renderLibrary();
  toast("已另存为新作品");
}
function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  toast("已发起存档下载；请在浏览器下载列表查看");
}
function exportSave() {
  persist(true);
  const data = {
    format: "little-room",
    version: 5,
    progress: { badges: library.badges, stars: library.stars },
    exportedAt: new Date().toISOString(),
    name: currentSlot()?.name || "我的小屋",
    state: clone(state),
  };
  downloadJSON(data, "little-room-design-" + Date.now() + ".json");
}
async function importSave(file) {
  if (!file) return;
  if (file.size > 1000000) {
    toast("存档文件过大，最多支持 1 MB");
    return;
  }
  try {
    const raw = JSON.parse(await file.text());
    if (raw.format !== "little-room" || ![2, 3, 4, 5].includes(raw.version))
      throw Error("请选择本游戏导出的 v2–v5 存档");
    const { state: imported, removed } = R.repair(raw.state, byId, layouts);
    if (removed) toast("户型已更新为纽约真实格局，" + removed + " 件放不下的家具已收起");
    if (library.slots.length >= 12) throw Error("作品集已满，请先腾出一个位置");
    persist();
    const slot = {
      id: uid(),
      name: typeof raw.name === "string" ? raw.name.slice(0, 28) : "导入的作品",
      state: imported,
      updated: Date.now(),
      thumb: "",
    };
    library.slots.push(slot);
    library.activeId = slot.id;
    if (raw.version >= 3) mergeProgress(raw.progress);
    history = [];
    future = [];
    restoreState(imported);
    renderProducts();
    persist();
    renderLibrary();
    toast("存档已导入为新作品，原作品已保留");
  } catch (e) {
    toast("无法导入：" + e.message);
  } finally {
    $("importInput").value = "";
  }
}
function exportPortfolio() {
  persist(true);
  downloadJSON(
    { format: "little-room-library", version: 1, exportedAt: new Date().toISOString(), library: clone(library) },
    "little-room-portfolio-" + new Date().toISOString().slice(0, 10) + ".json",
  );
}
function validatePortfolio(raw) {
  if (
    raw?.format !== "little-room-library" ||
    raw.version !== 1 ||
    !Array.isArray(raw.library?.slots) ||
    raw.library.slots.length < 1 ||
    raw.library.slots.length > 12
  )
    throw Error("不是有效的整个作品集备份");
  const slots = [],
    ids = new Set();
  for (const slot of raw.library.slots) {
    if (!slot || typeof slot.id !== "string" || !slot.id || slot.id.length > 100 || ids.has(slot.id))
      throw Error("作品编号缺失或重复");
    ids.add(slot.id);
    slots.push({
      id: slot.id,
      name: String(slot.name || "未命名作品").slice(0, 28),
      state: R.repair(slot.state, byId, layouts).state,
      updated: Number(slot.updated) || Date.now(),
      thumb:
        typeof slot.thumb === "string" && slot.thumb.startsWith("data:image/jpeg;base64,") && slot.thumb.length < 150000
          ? slot.thumb
          : "",
    });
  }
  const badges = Array.isArray(raw.library.badges)
    ? raw.library.badges.filter((id) => id === "free" || R.contracts[id])
    : [];
  return {
    version: 2,
    slots,
    activeId: ids.has(raw.library.activeId) ? raw.library.activeId : slots[0].id,
    badges: [...new Set(badges)],
    stars: cleanStars(raw.library.stars),
    tutorialDone: !!raw.library.tutorialDone,
    tutorialProgress: cleanTutorial(raw.library.tutorialProgress, slots),
  };
}
async function importPortfolio(file) {
  if (!file) return;
  if (file.size > 5000000) {
    toast("备份文件过大，最多支持 5 MB");
    return;
  }
  try {
    pendingPortfolioImport = validatePortfolio(JSON.parse(await file.text()));
    $("portfolioSummary").textContent =
      "备份含 " +
      pendingPortfolioImport.slots.length +
      " 件作品；当前有 " +
      library.slots.length +
      " 件。合并会为导入作品分配新编号，保留双方成长记录。";
    $("portfolioMerge").disabled = library.slots.length + pendingPortfolioImport.slots.length > 12;
    $("portfolioCapacity").textContent = $("portfolioMerge").disabled
      ? "合并后超过 12 件，请先腾出空位，或选择替换。"
      : "合并后共 " + (library.slots.length + pendingPortfolioImport.slots.length) + " 件作品。";
    $("portfolioImport").showModal();
  } catch (e) {
    toast("无法恢复：" + e.message);
  } finally {
    $("importAllInput").value = "";
  }
}
function mergeLibraries(current, incoming) {
  if (current.slots.length + incoming.slots.length > 12) throw Error("合并后超过 12 件作品");
  const next = clone(current),
    used = new Set(next.slots.map((s) => s.id));
  for (const slot of incoming.slots) {
    let id;
    do {
      id = uid();
    } while (used.has(id));
    used.add(id);
    next.slots.push({ ...clone(slot), id });
  }
  next.badges = [...new Set([...next.badges, ...incoming.badges])];
  for (const [id, n] of Object.entries(incoming.stars)) next.stars[id] = Math.max(next.stars[id] || 0, n);
  return next;
}
function replacePortfolio(next) {
  persist(true);
  clearTimeout(thumbDebounce);
  clearTimeout(saveDebounce);
  // Save the rollback copy before replacing the active key. A quota error leaves the live collection intact.
  try {
    localStorage.setItem("little-room-recovery-portfolio", JSON.stringify(library));
    localStorage.setItem("little-room-library-v2", JSON.stringify(next));
  } catch (e) {
    toast("没有替换作品集：存储空间不足，请先导出备份。");
    return false;
  }
  library = next;
  history = [];
  future = [];
  restoreState(currentSlot().state);
  renderLibrary();
  return true;
}
function applyPortfolio(mode) {
  if (!pendingPortfolioImport) return;
  try {
    const next = mode === "merge" ? mergeLibraries(library, pendingPortfolioImport) : pendingPortfolioImport;
    if (replacePortfolio(next)) {
      pendingPortfolioImport = null;
      $("portfolioImport").close();
      toast("已" + (mode === "merge" ? "合并" : "替换") + "作品集；可用「恢复上一次作品集」撤回");
    }
  } catch (e) {
    toast(e.message);
  }
}
function restorePreviousPortfolio() {
  try {
    const saved = localStorage.getItem("little-room-recovery-portfolio");
    if (!saved) {
      toast("还没有可恢复的本机副本");
      return;
    }
    const previous = validatePortfolio({ format: "little-room-library", version: 1, library: JSON.parse(saved) });
    ask("恢复上一次作品集？", "将恢复 " + previous.slots.length + " 件作品；现在的作品集会成为新的恢复副本。", () => {
      if (replacePortfolio(previous)) toast("已恢复上一次作品集，当前版本也已保留为副本");
    });
  } catch (e) {
    toast("恢复副本无法读取：" + e.message);
  }
}
function renderDesignTips(result) {
  const host = $("designTips");
  host.replaceChildren();
  for (const text of result.tips) {
    const row = document.createElement("p");
    row.textContent = text;
    const detail = result.space.details?.find((d) => d.message === text);
    if (detail?.ids.length) {
      const button = document.createElement("button");
      button.textContent = "定位家具";
      button.onclick = () => {
        $("result").close();
        const f = state.furniture.find((f) => f.id === detail.ids[0]);
        if (f) {
          focusOn(f.x, f.z);
          select(f.id);
          toast(text);
        }
      };
      row.append(button);
    }
    host.append(row);
  }
}

// Render the same real 3D models as furniture catalog thumbnails.
const thumbs = {};
// Catalogue thumbnails are rendered one per tick after start-up so the game is usable immediately.
let thumbRenderer = null;
function thumbFor(item) {
  if (!thumbRenderer) {
    const tr = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    tr.setSize(220, 165);
    tr.setPixelRatio(1.5);
    tr.outputColorSpace = THREE.SRGBColorSpace;
    tr.toneMapping = THREE.NeutralToneMapping;
    const ts = new THREE.Scene();
    ts.environment = environmentFor(false, tr);
    ts.environmentIntensity = 0.95;
    const key = new THREE.DirectionalLight("#fff4e4", 1.6);
    key.position.set(-2, 5, 4);
    ts.add(key, new THREE.HemisphereLight("#ffffff", "#b5a68c", 0.35));
    thumbRenderer = { tr, ts, tc: new THREE.PerspectiveCamera(28, 220 / 165, 0.05, 50) };
  }
  const { tr, ts, tc } = thumbRenderer, g = model(item);
  ts.add(g);
  const bounds = new THREE.Box3();
  g.traverse((o) => {
    if (o.isMesh && !o.userData.decor) bounds.expandByObject(o);
  });
  const size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3()),
    radius = Math.max(size.length() / 2, 0.15),
    dist = (radius / Math.sin(THREE.MathUtils.degToRad(14))) * 0.92;
  tc.position.copy(center).add(new THREE.Vector3(0.55, 0.45, 0.75).normalize().multiplyScalar(dist));
  tc.lookAt(center);
  tr.render(ts, tc);
  const url = tr.domElement.toDataURL();
  ts.remove(g);
  disposeGroup(g);
  return url;
}
function makeThumbs() {
  const queue = [...items];
  const next = () => {
    const item = queue.shift();
    if (!item) {
      thumbRenderer?.tr.dispose();
      thumbRenderer = null;
      return;
    }
    try {
      thumbs[item.id] = thumbFor(item);
      for (const img of document.querySelectorAll('img[data-thumb="' + item.id + '"]')) img.src = thumbs[item.id];
    } catch {}
    setTimeout(next, 0);
  };
  setTimeout(next, 50);
}
// Floor-plan thumbnail drawn from the real plan data.
function planSVG(l) {
  const b = layoutBounds(l),
    pad = 6,
    scale = Math.min((150 - pad * 2) / (b.maxX - b.minX), (125 - pad * 2) / (b.maxZ - b.minZ)),
    ox = (150 - (b.maxX - b.minX) * scale) / 2,
    oz = (125 - (b.maxZ - b.minZ) * scale) / 2,
    X = (x) => (ox + (x - b.minX) * scale).toFixed(1),
    Z = (z) => (oz + (z - b.minZ) * scale).toFixed(1);
  const fill = { bath: "#cfe0e0", kitchen: "#e6e2d6", balcony: "#d5dcc4", bedroom: "#e8e2cf" };
  let svg = "";
  for (const r of l.rooms) {
    const [x1, x2, z1, z2] = r.rect;
    svg += `<rect x="${X(x1)}" y="${Z(z1)}" width="${((x2 - x1) * scale).toFixed(1)}" height="${((z2 - z1) * scale).toFixed(1)}" fill="${fill[r.kind] || "#efe6d0"}"/>`;
  }
  for (const o of l.obstacles) if (o.name !== "门") svg += `<rect x="${X(o.x - o.w / 2)}" y="${Z(o.z - o.d / 2)}" width="${(o.w * scale).toFixed(1)}" height="${(o.d * scale).toFixed(1)}" fill="#c9bea6"/>`;
  l.walls.forEach((w, i) => {
    const info = l.wallInfo[i];
    svg += `<line x1="${X(w[0])}" y1="${Z(w[1])}" x2="${X(w[2])}" y2="${Z(w[3])}" stroke="${info.glass ? "#8fb3b8" : info.brick ? "#a5634b" : "#6d7a5e"}" stroke-width="${info.exterior ? 3.4 : 2.2}" stroke-linecap="square"/>`;
  });
  for (const w of l.windows) {
    const v = l.wallInfo[w.wall].vertical;
    svg += v
      ? `<line x1="${X(w.x)}" y1="${Z(w.z - w.w / 2)}" x2="${X(w.x)}" y2="${Z(w.z + w.w / 2)}" stroke="#9fc6d9" stroke-width="3.4"/>`
      : `<line x1="${X(w.x - w.w / 2)}" y1="${Z(w.z)}" x2="${X(w.x + w.w / 2)}" y2="${Z(w.z)}" stroke="#9fc6d9" stroke-width="3.4"/>`;
  }
  svg += `<circle cx="${X(l.entry[0])}" cy="${Z(l.entry[1])}" r="3.2" fill="#6f9255"/>`;
  return `<svg viewBox="0 0 150 125" aria-label="${l.name}户型图">${svg}</svg>`;
}
function renderProducts() {
  let search = $("search").value.trim();
  const list = items.filter(
    (i) => (cat === "全部" || i.cat === cat) && (!search || i.name.includes(search) || i.cat.includes(search)),
  );
  $("itemCount").textContent = list.length + " 件";
  $("categoryTitle").textContent = cat === "全部" ? "全部好物" : cat + "精选";
  $("products").innerHTML = list.length ? "" : '<p class="empty">暂时没有找到这件好物<br>试试“沙发”或“原木”</p>';
  for (const item of list) {
    const b = document.createElement("button");
    b.className = "product" + (itemUnlocked(item) ? "" : " locked");
    b.title = `${item.name} · ${item.w} × ${item.d} 米 · 点击摆放`;
    b.innerHTML = `<span class="thumb"><img data-thumb="${item.id}" src="${thumbs[item.id] || "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}" alt="${item.name}"></span><span class="name">${item.name}</span><span class="price">${itemUnlocked(item) ? "¥ " + item.price.toLocaleString() : "Lv." + item.level + " 解锁 · 自由模式可用"}</span><span class="add">＋</span>`;
    b.onclick = () => startPlacement(item.id);
    b.dataset.type = item.id;
    $("products").append(b);
  }
  renderTutorial();
}
function renderCategories() {
  for (const name of ["全部", "客厅", "卧室", "书房", "收纳", "灯具", "装饰", "桌面", "墙饰", "厨房"]) {
    const b = document.createElement("button");
    b.textContent = name;
    b.className = name === cat ? "active" : "";
    b.onclick = () => {
      cat = name;
      $$("#categories button").forEach((o) => o.classList.toggle("active", o === b));
      renderProducts();
    };
    $("categories").append(b);
  }
}
function renderSurfaces() {
  for (const [id, key, options] of [
    [
      "wallColors",
      "wall",
      [
        ["燕麦奶油", "#e8e5d7"],
        ["鼠尾草绿", "#bac4ab"],
        ["雾蓝清晨", "#bdccd0"],
        ["蜜桃晚霞", "#dfbba6"],
      ],
    ],
    [
      "floorColors",
      "floor",
      [
        ["暖调橡木", "#c7aa80"],
        ["浅白桦木", "#dfcba8"],
        ["深色胡桃", "#947653"],
        ["灰调原木", "#bab5a5"],
      ],
    ],
  ]) {
    $(id).innerHTML = "";
    if (state.mode === "free" || R.progress(library.badges).level >= 3)
      options.push([key === "wall" ? "深林静谧" : "焦糖木色", key === "wall" ? "#8fa79a" : "#a98161"]);
    for (const [name, color] of options) {
      const b = document.createElement("button");
      b.innerHTML = `<i style="background:${color}"></i>${name}`;
      b.className = state[key] === color ? "active" : "";
      b.onclick = () => {
        checkpoint();
        state[key] = color;
        room();
        commit();
        renderSurfaces();
      };
      $(id).append(b);
    }
  }
}
function renderLayouts() {
  $("layoutOptions").innerHTML = "";
  for (const l of layouts) {
    const b = document.createElement("button");
    b.className = "layout-card" + (l.id === pendingLayout ? " active" : "");
    b.innerHTML = `${planSVG(l)}<div class="layout-info"><h3>${l.name}</h3><p>${l.en} · ${l.desc}</p><span class="layout-tag">${l.tag}</span><small class="layout-story">${l.story}</small></div>`;
    b.onclick = () => {
      if (pendingMode === "challenge") {
        toast("委托户型由屋主指定；自由创作可任选户型");
        return;
      }
      pendingLayout = l.id;
      renderLayouts();
    };
    $("layoutOptions").append(b);
  }
}
function toast(text) {
  $("toast").textContent = text;
  $("toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("show"), 2600);
}
function ask(title, text, fn) {
  $("confirmTitle").textContent = title;
  $("confirmText").textContent = text;
  $("confirmYes").textContent = title.includes("恢复") ? "确认恢复" : title.includes("删除") ? "确认删除" : "确认清空";
  confirmAction = fn;
  $("confirm").showModal();
}

/* Editing aids, room interactions and persistent career progression. */
let guideGroup = new THREE.Group(),
  pendingRound = 1,
  tutorial = null,
  pendingPortfolioImport = null;
scene.add(guideGroup);
const normalizedRotation = (v) => (((Math.round(v * 6) % 24) + 24) % 24) / 6;
const itemUnlocked = (item) => state.mode === "free" || (item.level || 1) <= R.progress(library.badges).level;
const contractUnlocked = (id) => (R.contracts[id].level || 1) <= R.progress(library.badges).level;
function availablePalette() {
  return [
    ...palette,
    ...(state.mode === "free" || R.progress(library.badges).level >= 3 ? ["#d5a293", "#687f91", "#567665"] : []),
  ];
}
function clearGuides() {
  disposeGroup(guideGroup);
}
function drawGuides() {
  clearGuides();
  if (!placement?.hasPoint || !snap || !placement.snapLabel || byId[placement.f.type].mount === "wall") return;
  const f = placement.f,
    l = layouts.find((l) => l.id === state.layout);
  for (const points of [
    [
      [f.x, 0.075, -l.d / 2],
      [f.x, 0.075, l.d / 2],
    ],
    [
      [-l.w / 2, 0.075, f.z],
      [l.w / 2, 0.075, f.z],
    ],
  ]) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p))),
      line = new THREE.Line(
        geometry,
        new THREE.LineDashedMaterial({
          color: "#5f9364",
          dashSize: 0.12,
          gapSize: 0.08,
          transparent: true,
          opacity: 0.8,
          depthTest: false,
        }),
      );
    line.computeLineDistances();
    line.renderOrder = 3;
    guideGroup.add(line);
  }
}
function toggleGroup() {
  const f = state.furniture.find((f) => f.id === selected);
  if (!f) return;
  if (f.groupId) {
    const groupId = f.groupId;
    checkpoint();
    for (const o of state.furniture) if (o.groupId === groupId) delete o.groupId;
    commit();
    toast("已解除组合，桌面摆件仍跟随桌子");
    return;
  }
  const dining =
    f.type === "dining"
      ? f
      : state.furniture
          .filter((o) => o.type === "dining" && !o.groupId && Math.hypot(o.x - f.x, o.z - f.z) < 2.1)
          .sort((a, b) => Math.hypot(a.x - f.x, a.z - f.z) - Math.hypot(b.x - f.x, b.z - f.z))[0];
  if (!dining) {
    toast("请先在书椅附近摆一张餐桌");
    return;
  }
  const chairs = state.furniture.filter(
    (o) => ["stool", "bench"].includes(o.type) && !o.groupId && Math.hypot(o.x - dining.x, o.z - dining.z) < 2.1,
  );
  if (!chairs.length) {
    toast("把书椅或长凳放到餐桌周围约两米内，再组合");
    return;
  }
  checkpoint();
  const id = uid();
  for (const o of [dining, ...chairs]) o.groupId = id;
  commit();
  toast("餐桌与 " + chairs.length + " 把椅凳已组合；拖动任一成员即可整体移动");
}
function updateProgressUI() {
  $("careerBtn").textContent = "✦ Lv." + R.progress(library.badges).level;
  $("curtainBtn").textContent = state.curtains ? "拉开窗帘" : "合上窗帘";
}
function openCareer() {
  const p = R.progress(library.badges);
  $("careerSummary").innerHTML =
    "<strong>Lv." +
    p.level +
    " · " +
    p.title +
    "</strong><span>" +
    p.xp +
    " 经验" +
    (p.next ? " / " + p.next + " 升级" : " · 已达最高等级") +
    '</span><div class="progress-track"><i style="width:' +
    Math.min(100, (p.xp / (p.next || 600)) * 100) +
    '%"></i></div>';
  $("careerTrack").innerHTML = [
    ["新芽设计师", 0, "基础家具、三个入门委托"],
    ["日常造梦师", 100, "藤编椅、暮色地毯、阳台与厨房委托"],
    ["空间策划师", 300, "落日沙发、三种家具新色与墙地新色、双人办公委托"],
    ["理想生活家", 500, "深林收藏柜与大师称号"],
  ]
    .map(
      ([name, xp, desc], i) =>
        '<div class="career-level ' +
        (p.xp >= xp ? "earned" : "") +
        '"><b>' +
        (p.xp >= xp ? "✓" : "○") +
        " Lv." +
        (i + 1) +
        " " +
        name +
        "</b><span>" +
        xp +
        " 经验</span><p>" +
        desc +
        "</p></div>",
    )
    .join("");
  $("careerContracts").innerHTML = Object.entries(R.contracts)
    .map(([id, c]) => {
      const stars = library.stars?.[id] || 0;
      return (
        "<p>" +
        (library.badges.includes(id)
          ? "✦ 已完成 " + ("★".repeat(stars) + "☆".repeat(3 - stars)) + " · 二周目可挑战"
          : contractUnlocked(id)
            ? "○ 可接取"
            : "◇ Lv." + c.level + " 解锁") +
        " · " +
        c.name +
        "</p>"
      );
    })
    .join("");
  $("career").showModal();
}
function renderRoundOptions() {
  const host = $("roundOptions");
  host.hidden = pendingMode !== "challenge";
  const unlocked = library.badges.includes(pendingContract);
  if (pendingRound === 2 && !unlocked) pendingRound = 1;
  $$("[data-round]").forEach((b) => {
    const round = Number(b.dataset.round);
    b.classList.toggle("active", round === pendingRound);
    b.disabled = round === 2 && !unlocked;
  });
  $("roundHint").textContent =
    pendingRound === 2
      ? "进阶预算 ¥" +
        R.budget({ mode: "challenge", contract: pendingContract, round: 2, roundRules: 2 }).toLocaleString() +
        " · " +
        R.encoreText[pendingContract] +
        " · 空间关系至少 85 分"
      : "首次完成委托可解锁二周目；每颗委托星会记录最佳成绩";
}
function initLivingUI() {
  $("groupBtn").onclick = toggleGroup;
  $("careerBtn").onclick = openCareer;
  $("interactBtn").onclick = () => {
    const f = state.furniture.find((f) => f.id === selected);
    if (!f) return;
    checkpoint();
    f.on = f.on === false;
    commit();
    toast(byId[f.type].name + (f.on ? "已打开" : "已关闭"));
  };
  $("curtainBtn").onclick = () => {
    checkpoint();
    state.curtains = !state.curtains;
    room();
    commit();
    toast(state.curtains ? "窗帘合上了，享受安静时光" : "让阳光进来吧");
  };
  $$("[data-round]").forEach(
    (b) =>
      (b.onclick = () => {
        pendingRound = Number(b.dataset.round);
        renderRoundOptions();
      }),
  );
  $("tutorialSkip").onclick = () => finishTutorial(false);
  $("tutorialResume").onclick = () => {
    $("help").close();
    startTutorial();
  };
  $("restorePreviousBtn").onclick = restorePreviousPortfolio;
  $("portfolioMerge").onclick = () => applyPortfolio("merge");
  $("portfolioReplace").onclick = () => applyPortfolio("replace");
  $("exportAllBtn").onclick = exportPortfolio;
  $("importAllBtn").onclick = () => $("importAllInput").click();
  $("importAllInput").onchange = (e) => importPortfolio(e.target.files[0]);
}
const tutorialSteps = [
  ["先放一张书桌", "在家具库点击「日光书桌」，再点击房间里的空位放下。", '[data-type="desk"]'],
  ["添一把书椅", "选择「弧背书椅」，放在书桌前方；之后还可以用 R 调整朝向。", '[data-type="stool"]'],
  ["把台灯摆上书桌", "选择「纸灯小夜曲」，移到书桌上方，出现承托提示后点击放下。", '[data-type="pendant"]'],
  ["试着旋转家具", "选中书桌或书椅，按 R 或点击旋转。合适的朝向会提高空间关系分。", "#rotateBtn"],
  ["完成第一份设计", "点击「完成设计」查看生活心愿、空间关系和改进建议。也可以继续自由布置。", "#finishBtn"],
];
function cleanTutorial(value, slots) {
  return value && slots.some((s) => s.id === value.slotId)
    ? {
        slotId: value.slotId,
        step: Math.max(0, Math.min(4, Math.floor(Number(value.step) || 0))),
        rotated: !!value.rotated,
      }
    : null;
}
function tutorialStepFor(s, rotated) {
  if (!s.furniture.some((f) => f.type === "desk")) return 0;
  if (!s.furniture.some((f) => f.type === "stool")) return 1;
  if (
    !s.furniture.some((f) => f.type === "pendant" && s.furniture.some((p) => p.id === f.parentId && p.type === "desk"))
  )
    return 2;
  return rotated ? 4 : 3;
}
function focusTutorial() {
  if (!tutorial) return;
  if (tutorial.step < 3) {
    cat = "全部";
    $("search").value = "";
    $$("#categories button").forEach((b) => b.classList.toggle("active", b.textContent === "全部"));
    $("furniturePanel").hidden = false;
    $("surfacesPanel").hidden = true;
    $$("[data-panel]").forEach((b) => b.classList.toggle("active", b.dataset.panel === "furniture"));
    renderProducts();
    document.querySelector(tutorialSteps[tutorial.step][2])?.scrollIntoView({ block: "nearest", inline: "center" });
  } else if (tutorial.step === 3) {
    const f = state.furniture.find((f) => f.type === "stool") || state.furniture.find((f) => f.type === "desk");
    if (f) select(f.id);
  }
  renderTutorial();
}
function startTutorial() {
  library.tutorialDone = false;
  tutorial = { slotId: library.activeId, rotated: false, step: 0 };
  tutorial.step = tutorialStepFor(state, false);
  library.tutorialProgress = tutorial;
  writeLibrary();
  focusTutorial();
}
function resumeTutorial() {
  tutorial = library.tutorialProgress?.slotId === library.activeId ? library.tutorialProgress : null;
  if (tutorial) {
    tutorial.step = tutorialStepFor(state, tutorial.rotated);
    focusTutorial();
  } else renderTutorial();
}
function syncTutorial() {
  if (!tutorial || tutorial.slotId !== library.activeId) return;
  const step = tutorialStepFor(state, tutorial.rotated),
    changed = step !== tutorial.step;
  tutorial.step = step;
  library.tutorialProgress = tutorial;
  renderTutorial();
  if (changed) focusTutorial();
}
function finishTutorial(completed = true) {
  tutorial = null;
  library.tutorialProgress = null;
  library.tutorialDone = true;
  writeLibrary();
  renderTutorial();
  if (completed) toast("首局引导完成，之后可在操作指南里重新学习");
}
function tutorialAction(action) {
  if (!tutorial) return;
  if (action === "finish" && tutorial.step === 4) {
    finishTutorial();
    return;
  }
  if (action === "rotate") tutorial.rotated = true;
  syncTutorial();
  writeLibrary();
}
function renderTutorial() {
  document.body.classList.toggle("tutorial-on", !!tutorial);
  $$(".tutorial-target").forEach((el) => el.classList.remove("tutorial-target"));
  const box = $("tutorial");
  if (!box) return;
  box.hidden = !tutorial;
  if (!tutorial) return;
  const step = tutorialSteps[tutorial.step];
  $("tutorialStep").textContent = "首局引导 · " + (tutorial.step + 1) + " / " + tutorialSteps.length;
  $("tutorialTitle").textContent = step[0];
  $("tutorialText").textContent = step[1];
  document.querySelector(step[2])?.classList.add("tutorial-target");
}

/* Input: mouse, touch and keyboard. Furniture drags move pieces; everything else steers the camera. */
const pointers = new Map();
let gesture = null;
const canvas = renderer.domElement;
canvas.style.touchAction = "none";
function pixelsToMetres() {
  return (2 * view.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(1, wrap.clientHeight);
}
canvas.addEventListener("pointerdown", (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  canvas.setPointerCapture(e.pointerId);
  if (pointers.size === 2) {
    // A second finger turns any drag into pinch-zoom + pan.
    if (drag?.direct) cancelPlacement();
    drag = null;
    const [p, q] = [...pointers.values()];
    gesture = { distance: Math.hypot(p.x - q.x, p.y - q.y), mid: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } };
    return;
  }
  if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
  const panning = e.button === 2 || e.button === 1 || e.shiftKey;
  const hit = !placement && e.button === 0 && !e.shiftKey ? hitFurniture(e) : null,
    object = hit ? state.furniture.find((f) => f.id === hit.object.userData.id) : null,
    p = groundPoint(e);
  drag = {
    x: e.clientX,
    y: e.clientY,
    lastX: e.clientX,
    lastY: e.clientY,
    moved: false,
    pointer: e.pointerId,
    object,
    pan: panning,
    orbit: panning,
    offset: object && p ? { x: p.x - object.x, z: p.z - object.z } : null,
    direct: false,
  };
});
canvas.addEventListener("pointermove", (e) => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gesture && pointers.size === 2) {
    const [p, q] = [...pointers.values()],
      distance = Math.hypot(p.x - q.x, p.y - q.y),
      mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    if (distance > 0 && gesture.distance > 0) dollyTo(gesture.distance / distance);
    const k = pixelsToMetres();
    panBy(-(mid.x - gesture.mid.x) * k, (mid.y - gesture.mid.y) * k);
    gesture = { distance, mid };
    return;
  }
  if (drag?.pointer !== undefined && drag.pointer !== e.pointerId) return;
  const dx = drag ? e.clientX - drag.x : 0,
    dy = drag ? e.clientY - drag.y : 0;
  if (drag && Math.hypot(dx, dy) > 6) drag.moved = true;
  if (drag?.moved && drag.object && !placement && !drag.orbit) {
    const original = drag.object;
    startPlacement(original.type, original);
    drag.direct = true;
  }
  if (placement && !drag?.orbit) {
    positionPlacement(e, drag?.direct ? drag.offset : null);
    return;
  }
  if (drag?.moved) {
    const mx = e.clientX - drag.lastX,
      my = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    if (drag.pan) {
      const k = pixelsToMetres();
      if (eyeMode()) panBy(-mx * k * 0.6, my * k * 0.6);
      else panBy(-mx * k, my * k);
    } else orbitBy(-mx * 0.0065, my * 0.0045);
  }
});
function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) gesture = null;
}
canvas.addEventListener("pointerup", (e) => {
  endPointer(e);
  if (!drag || drag.pointer !== e.pointerId) return;
  const finished = drag;
  drag = null;
  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch {}
  if (finished.orbit) return;
  if (placement) {
    positionPlacement(e, finished.direct ? finished.offset : null);
    place();
    return;
  }
  if (!finished.moved) select(hitFurniture(e)?.object.userData.id ?? null);
});
canvas.addEventListener("pointercancel", (e) => {
  endPointer(e);
  if (drag?.direct) cancelPlacement();
  drag = null;
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const scale = e.deltaMode === 1 ? 40 : 1,
      amount = e.deltaY * scale * (e.ctrlKey ? 0.01 : 0.0015);
    if (eyeMode() && !e.ctrlKey) {
      // Walking: the wheel steps forward and back.
      const fwd = new THREE.Vector3(-Math.sin(goal.yaw), 0, -Math.cos(goal.yaw));
      goal.target.addScaledVector(fwd, -amount * 1.6);
      clampGoal();
      requestFrame();
      return;
    }
    dollyTo(Math.exp(amount), groundPoint(e));
  },
  { passive: false },
);
$("undoBtn").onclick = undo;
$("redoBtn").onclick = redo;
$("rotateBtn").onclick = rotate;
$("placeRotate").onclick = rotate;
$("deleteBtn").onclick = remove;
$("cancelPlace").onclick = cancelPlacement;
$("moveBtn").onclick = () => {
  const f = state.furniture.find((f) => f.id === selected);
  if (f) startPlacement(f.type, f);
};
$("copyBtn").onclick = () => {
  const f = state.furniture.find((f) => f.id === selected);
  if (f) {
    startPlacement(f.type);
    if (placement) {
      placement.f.color = f.color;
      placement.f.rot = f.rot;
      ghost.traverse((o) => {
        if (o.material) o.material.color.set(f.color);
      });
    }
  }
};
$("search").oninput = renderProducts;
$("gridBtn").onclick = () => {
  snap = !snap;
  $("gridBtn").classList.toggle("active", snap);
  $("gridBtn").textContent = snap ? "▦ 智能吸附" : "✥ 精细摆放";
  toast(snap ? "开启网格、靠墙与家具对齐吸附" : "精细摆放：5 厘米步进，关闭自动对齐");
};
$("turnLeft").onclick = () => orbitBy(-Math.PI / 4, 0);
$("turnRight").onclick = () => orbitBy(Math.PI / 4, 0);
$("viewBtn").onclick = () => {
  if (goal.pitch > 1.2) frameLayout();
  else {
    goal.pitch = 1.48;
    goal.dist = Math.max(goal.dist, maxDistance() * 0.42);
    clampGoal();
    requestFrame();
  }
};
$("zoomIn").onclick = () => dollyTo(0.78);
$("zoomOut").onclick = () => dollyTo(1.28);
$("resetView").onclick = () => frameLayout();
$("walkBtn").onclick = () => {
  if (eyeMode()) frameLayout();
  else {
    walkIn();
    toast("已走进房间：拖动环顾四周，滚轮或 W / S 前后走动，再点 👁 回到全景");
  }
};
$("lightBtn").onclick = () => {
  checkpoint();
  state.night = !state.night;
  room();
  commit();
};
$("helpBtn").onclick = () => $("help").showModal();
$("photoBtn").onclick = photo;
$("resultPhoto").onclick = photo;
$("finishBtn").onclick = finish;
$("clearBtn").onclick = () => {
  if (!state.furniture.length) {
    toast("房间已经是空的啦");
    return;
  }
  ask("清空这间小屋？", "家具将全部收起，仍然可以通过撤销找回。", () => {
    checkpoint();
    cancelPlacement();
    state.furniture = [];
    selected = null;
    commit();
  });
};
$("confirmYes").onclick = () => {
  $("confirm").close();
  confirmAction?.();
  confirmAction = null;
};
$$("[data-close]").forEach((b) => (b.onclick = () => $(b.dataset.close).close()));
$("briefToggle").onclick = () => {
  const hidden = ($("briefBody").hidden = !$("briefBody").hidden);
  $("briefToggle").textContent = hidden ? "+" : "−";
};
const mobileView = matchMedia("(max-width:720px)");
function compactBrief() {
  $("briefBody").hidden = mobileView.matches;
  $("briefToggle").textContent = mobileView.matches ? "+" : "−";
}
mobileView.addEventListener("change", compactBrief);
compactBrief();
$$("[data-panel]").forEach(
  (b) =>
    (b.onclick = () => {
      $$("[data-panel]").forEach((x) => x.classList.toggle("active", x === b));
      $("furniturePanel").hidden = b.dataset.panel !== "furniture";
      $("surfacesPanel").hidden = b.dataset.panel !== "surfaces";
    }),
);
$$("[data-mode]").forEach(
  (b) =>
    (b.onclick = () => {
      pendingMode = b.dataset.mode;
      if (pendingMode === "challenge") pendingLayout = R.contracts[pendingContract].layout;
      $$("[data-mode]").forEach((x) => x.classList.toggle("active", x === b));
      renderContracts();
      renderLayouts();
    }),
);
$("layoutBtn").onclick = openLayouts;
$("home").onclick = (e) => {
  e.preventDefault();
  openLayouts();
};
$("closeWelcome").onclick = () => $("welcome").close();
$("continueBtn").onclick = () => $("welcome").close();
$("startBtn").onclick = resetGame;
$("libraryBtn").onclick = openLibrary;
$("saveAsBtn").onclick = saveAs;
$("renameBtn").onclick = () => {
  const name = $("designName").value.trim().slice(0, 28);
  if (!name) {
    toast("给作品取个名字吧");
    return;
  }
  currentSlot().name = name;
  persist();
  updateUI();
  renderLibrary();
  toast("作品名称已更新");
};
$("exportBtn").onclick = exportSave;
$("importBtn").onclick = () => $("importInput").click();
$("importInput").onchange = (e) => importSave(e.target.files[0]);
$("newFromLibrary").onclick = () => {
  $("library").close();
  openLayouts();
};
$("photoDownload").onclick = () => toast("已发起照片下载；也可右键图片另存为");
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) || $$("dialog[open]").length) return;
  if (e.key === "Escape") {
    cancelPlacement();
    select(null);
  }
  if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) rotate();
  if (e.key.toLowerCase() === "v" && !e.ctrlKey && !e.metaKey) $("walkBtn").click();
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    remove();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    e.shiftKey ? redo() : undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
  }
  if (e.key.startsWith("Arrow") && selected) {
    e.preventDefault();
    const f = state.furniture.find((f) => f.id === selected),
      next = { ...f },
      def = byId[f.type],
      step = snap ? 0.25 : 0.05;
    if (def.mount === "wall") {
      const info = layouts.find((l) => l.id === state.layout).wallInfo[f.wallIndex];
      if (e.key === "ArrowUp" || e.key === "ArrowDown") next.y += e.key === "ArrowUp" ? 0.1 : -0.1;
      else next[info.vertical ? "z" : "x"] += e.key === "ArrowRight" ? step : -step;
    } else {
      // Nudge relative to the screen so "up" always moves away from you.
      const keyDir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key],
        yaw = Math.round(goal.yaw / (Math.PI / 2)) * (Math.PI / 2),
        rx = Math.cos(yaw),
        rz = -Math.sin(yaw),
        fx = -Math.sin(yaw),
        fz = -Math.cos(yaw);
      next.x = Math.round((f.x + (keyDir[0] * rx + keyDir[1] * fx) * step) * 1000) / 1000;
      next.z = Math.round((f.z + (keyDir[0] * rz + keyDir[1] * fz) * step) * 1000) / 1000;
    }
    const why = reason(next);
    if (!why) {
      checkpoint();
      state.furniture = R.transformFamily(f, next, state);
      commit();
    } else toast(why);
    return;
  }
  // Camera keys when nothing is selected: WASD / arrows move, Q E turn, + - zoom.
  const k = e.key.toLowerCase(),
    move = { w: [0, 1], s: [0, -1], a: [-1, 0], d: [1, 0], arrowup: [0, 1], arrowdown: [0, -1], arrowleft: [-1, 0], arrowright: [1, 0] }[k];
  if (move && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    const stepM = eyeMode() ? 0.35 : Math.max(0.3, goal.dist * 0.06);
    panBy(move[0] * stepM, move[1] * stepM);
  }
  if (k === "q") orbitBy(-Math.PI / 12, 0);
  if (k === "e") orbitBy(Math.PI / 12, 0);
  if (k === "=" || k === "+") dollyTo(0.85);
  if (k === "-") dollyTo(1.18);
});
let loaded = false,
  startMessage = "";
try {
  const saved = localStorage.getItem("little-room-library-v2");
  if (saved) {
    const data = JSON.parse(saved);
    if (data.version !== 2 || !Array.isArray(data.slots) || data.slots.length > 12) throw Error("存档格式异常");
    const slots = [];
    for (const s of data.slots) {
      try {
        const { state: validated, removed } = R.repair(s.state, byId, layouts);
        if (removed) startMessage = "户型已升级为纽约真实格局，部分家具因位置冲突已收起，原数据保留为恢复备份";
        if (typeof s.id !== "string" || slots.some((x) => x.id === s.id)) throw Error("重复作品");
        slots.push({
          id: s.id,
          name: String(s.name || "未命名作品").slice(0, 28),
          state: validated,
          updated: Number(s.updated) || Date.now(),
          thumb:
            typeof s.thumb === "string" && s.thumb.startsWith("data:image/jpeg;base64,") && s.thumb.length < 150000
              ? s.thumb
              : "",
        });
      } catch {
        startMessage = "部分旧作品暂时无法读取，原数据已保留为恢复备份";
      }
    }
    if (startMessage) localStorage.setItem("little-room-recovery-v2", saved);
    library = {
      version: 2,
      slots,
      activeId: slots.some((s) => s.id === data.activeId) ? data.activeId : slots[0]?.id,
      badges: Array.isArray(data.badges)
        ? data.badges.filter((b) => ["free", ...Object.keys(R.contracts)].includes(b))
        : [],
      stars: cleanStars(data.stars),
      tutorialDone: !!data.tutorialDone,
      tutorialProgress: cleanTutorial(data.tutorialProgress, slots),
    };
    if (currentSlot()) {
      state = clone(currentSlot().state);
      loaded = true;
    }
  } else {
    const old = JSON.parse(localStorage.getItem("little-room-v1"));
    if (old) {
      const migrated = R.repair({ ...old, mode: "free", contract: "coder" }, byId, layouts).state,
        slot = { id: uid(), name: "我的旧版小屋", state: migrated, thumb: "", updated: Date.now() };
      library.slots.push(slot);
      library.activeId = slot.id;
      state = migrated;
      loaded = true;
      startMessage = "旧版小屋已迁移为自由作品，旧存档仍保留";
    }
  }
} catch {
  startMessage = "没有载入旧存档；可从作品集导入之前导出的备份";
}
if (!currentSlot()) {
  const slot = { id: uid(), name: "我的第一间小屋", state: clone(state), thumb: "", updated: Date.now() };
  library.slots.push(slot);
  library.activeId = slot.id;
}
initLivingUI();
$("hint").textContent = hintText();
room();
frameLayout(true);
renderCategories();
renderProducts();
renderSurfaces();
rebuild();
resize();
pendingLayout = state.layout;
renderLayouts();
renderContracts();
if (!loaded) {
  pendingMode = "challenge";
  pendingContract = "coder";
  pendingLayout = R.contracts.coder.layout;
  renderLayouts();
  renderContracts();
  $$("[data-mode]").forEach((b) => b.classList.toggle("active", b.dataset.mode === "challenge"));
  $("welcome").showModal();
} else toast(startMessage || "欢迎回家，已恢复「" + currentSlot().name + "」");
resumeTutorial();
requestFrame();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) flushSave();
  else requestFrame();
});
window.addEventListener("pagehide", flushSave);
document.documentElement.dataset.gameReady = "true";
makeThumbs();
$("startupStatus")?.remove();
window.roomDiagnostics = () => ({
  state: clone(state),
  total: total(),
  goals: goals(),
  assessment: assessment(),
  invalid: state.furniture.filter((f) => !valid(f)).map((f) => f.id),
  models: furnitureGroup.children.length,
  slots: library.slots.length,
  activeId: library.activeId,
});
