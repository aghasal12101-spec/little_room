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
