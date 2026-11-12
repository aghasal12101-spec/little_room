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
