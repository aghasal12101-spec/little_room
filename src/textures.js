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
