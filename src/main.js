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
