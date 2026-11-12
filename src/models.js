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
