// Hand-placed sample designs for every commission on the New York floor plans.
// Used by the regression tests and written out as importable examples in tests/*.json.
module.exports = function designs(defs, plans) {
  const wallAt = (layout, vertical, line, along) => plans.find(l => l.id === layout).wallInfo.findIndex(w => w.vertical === vertical && Math.abs(w.line - line) < .01 && along > w.lo && along < w.hi);
  let n = 0;
  const f = (type, x, z, rot = 0, extra = {}) => ({ id: 'demo-' + (++n), type, x, z, rot, y: .03, color: defs[type].color, ...extra });
  const on = (parent, type, dx = 0, dz = 0, rot = parent.rot) => f(type, parent.x + dx, parent.z + dz, rot, { parentId: parent.id, y: (parent.y || .03) + defs[parent.type].surface });
  const state = (layout, contract) => ({ layout, contract, mode: 'challenge', round: 1, roundRules: 2, night: false, curtains: false, wall: '#e8e5d7', floor: '#c7aa80', furniture: [] });
  const out = {};

  // East Village studio: desk under the window, bed along the west wall, sofa facing the windows.
  let s = state('studio', 'coder'), desk = f('desk', -2.2, -2.4);
  s.furniture = [desk, f('stool', -2.2, -1.55, 2), on(desk, 'pendant', -.45, -.05), on(desk, 'books', .35, -.08),
    f('bed', -2.45, 1.55, 1), f('shelf', -.9, -2.72), f('plant', 1.45, -2.45), f('sofa', 0, 1.7, 2), f('rug', 0, .3)];
  out.coder = s;

  // Upper West Side 1BR: bed in the bedroom, dining by the windows, sofa facing the TV.
  s = state('suite', 'cats'); const dining = f('dining', -1.0, -1.9);
  s.furniture = [f('bed', 3.06, -1.9, 3), f('nightstand', 3.7, -3.08), f('mirror', 1.25, -2.0, 1),
    dining, f('stool', -2.05, -1.9, 1), f('stool', .05, -1.9, 3), on(dining, 'vase', 0, 0),
    f('sofa', -3.65, .55, 1), f('tv', -.15, .55, 3), f('lamp', -3.85, -.95), f('rug', -2.0, .55, 1)];
  out.cats = s;

  // Lower East Side walk-up: compact, cheap and cosy.
  s = state('loft', 'rental');
  const rd = f('desk', 1.4, -2.95);
  s.furniture = [f('bed', -1.65, -.85, 1), f('shelf', 2.52, -.4, 3), rd, f('stool', 1.4, -2.1, 2),
    f('art', -2.7, -.85, 1, { wallIndex: wallAt('loft', true, -2.8, -.85), y: 1.2 }), f('plant', 2.35, .95), f('rug', .8, -.6, 1), f('chair', .2, -2.6), f('lamp', -.55, -3.1)];
  out.rental = s;

  // Long Island City: plants and a reading corner on the balcony.
  s = state('balcony', 'balcony'); const side = f('side', 2.9, -3.15), table = f('dining', -2.35, 1.3);
  s.furniture = [f('plant', -3.45, -3.1), f('cactus', -2.6, -3.15), f('chair', 2.0, -3.1), side, on(side, 'books', 0, 0),
    f('bed', 2.85, -1.1, 3), f('shelf', -3.72, -1.0, 1), table, f('stool', -3.4, 1.3, 1), f('stool', -1.3, 1.3, 3), f('lamp', 1.2, -1.95), f('rug', -.6, -.6)];
  out.balcony = s;

  // Brooklyn railroad: one desk in the front room, one in the study, bedroom at the back.
  s = state('corridor', 'duo'); const d1 = f('desk', -1.25, -5.36), d2 = f('desk', 1.25, 1.02);
  s.furniture = [d1, d2, f('stool', -1.25, -4.5, 2), f('stool', 1.25, 1.87, 2), on(d1, 'pendant', -.4, -.05), on(d2, 'pendant', .4, -.05),
    f('bed', -.96, 5.0, 1), f('wardrobe', 1.725, 4.1, 3), f('sofa', 1.55, -3.85, 3), f('plant', 1.65, -5.3), f('rug', 0, -3.9, 1)];
  out.duo = s;

  // Harlem brownstone: island and fridge in the big kitchen, dining by the parlor windows.
  s = state('kitchen', 'chef'); const ct = f('dining', -2.3, 3.05);
  s.furniture = [f('counter', -1.6, -2.0), f('fridge', -.41, -3.585, 0), ct, f('stool', -3.4, 3.05, 1), f('stool', -1.2, 3.05, 3), on(ct, 'vase', 0, 0),
    f('sofa', -1.0, 1.0, 3), f('cabinet', 1.285, 3.1, 3), f('lamp', -3.6, -.25), f('bed', 2.86, -2.2, 3), f('rug', -2.4, 1.0, 1)];
  out.chef = s;
  return out;
};
