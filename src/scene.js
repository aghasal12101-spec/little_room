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
