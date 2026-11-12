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
