'use strict';

// ============================================================
// FIGURES.JS
// Bibliotheek voor het tekenen van meetkundige figuren in SVG.
//
// Gebruik:
//   drawFiguur(container, 'vierkant', {
//     factor: 2,
//     rotation: 30,
//     zijde: { value: 3, unit: 'cm' }
//   });
//
//   drawFiguur(container, 'rechthoek', {
//     factor: 1,
//     rotation: 0,
//     breedte: { value: 2, unit: 'cm' },
//     hoogte:  { value: 4, unit: 'cm' }
//   });
//
//   drawFiguur(container, 'trapezium', {
//     factor: 1,
//     rotation: 15,
//     zijden: [
//       { value: 3, unit: 'mm' },    // parallelle zijde (top)
//       { value: 3.6, unit: 'mm' },  // rechterbeen
//       { value: 7, unit: 'mm' },    // parallelle zijde (bodem)
//       { value: 2.2, unit: 'mm' }   // linkerbeen
//     ]
//   });
//
//   drawFiguur(container, 'cirkel', {
//     factor: 1,
//     straal: { value: 1, unit: 'cm' },
//     middelpunt: 'M'
//   });
//
// Beschikbare types:
//   'vierkant', 'rechthoek', 'driehoek', 'trapezium',
//   'ruit', 'parallellogram', 'cirkel', 'vierhoek'
// ============================================================

// ---- Stijlconstanten ----

const FIGUUR_STIJL = {
  fill:         'rgba(168, 212, 85, 0.65)',
  stroke:       '#4a7a10',
  strokeWidth:  2.5,
  fontSize:     13,
  fontFamily:   'Arial, sans-serif',
  labelColor:   '#1a1a1a',
  markerColor:  '#3a6a0e',
  markerSize:   9,      // px – hoekmarkering (rechthoekig teken)
  tickLength:   12,     // px – lengte van gelijkheidsteken
  tickSpacing:  5,      // px – afstand tussen dubbele teken
  arrowSize:    7,      // px – parallelmarkering
  labelOffset:  22,     // px – afstand van label tot zijde
};

// ---- Wiskundige helpers ----

function _centroid(verts) {
  const n = verts.length;
  return {
    x: verts.reduce((s, v) => s + v.x, 0) / n,
    y: verts.reduce((s, v) => s + v.y, 0) / n,
  };
}

// Uitwaartse normaal van zijde A→B (wijst weg van centroid)
function _outwardNormal(A, B, centroid) {
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const dx = B.x - A.x, dy = B.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  const n1x = dy / len, n1y = -dx / len;
  const dot = n1x * (mx - centroid.x) + n1y * (my - centroid.y);
  return dot >= 0 ? { x: n1x, y: n1y } : { x: -n1x, y: -n1y };
}

// Roteer punt (px, py) rond (cx, cy) over angleDeg graden
function _rotateAround(px, py, cx, cy, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const dx = px - cx, dy = py - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

// Transformeer basiscoördinaten: roteer rond eerste hoekpunt, schaal dan in tekengebied
function _transformVertices(base, rotation, drawX, drawY, drawW, drawH) {
  const anchor = base[0];
  const rotated = base.map(v =>
    _rotateAround(v.x, v.y, anchor.x, anchor.y, rotation || 0)
  );

  const xs = rotated.map(v => v.x), ys = rotated.map(v => v.y);
  const bMinX = Math.min(...xs), bMaxX = Math.max(...xs);
  const bMinY = Math.min(...ys), bMaxY = Math.max(...ys);
  const bW = bMaxX - bMinX || 1, bH = bMaxY - bMinY || 1;

  const scale = Math.min(drawW / bW, drawH / bH);
  const offX = drawX + (drawW - bW * scale) / 2 - bMinX * scale;
  const offY = drawY + (drawH - bH * scale) / 2 - bMinY * scale;

  return rotated.map(v => ({ x: v.x * scale + offX, y: v.y * scale + offY }));
}

// Formatteer labelwaarde: vermenigvuldig met factor, gebruik komma als decimaal scheidingsteken
function _fmt(spec, factor) {
  if (!spec) return '';
  if (typeof spec === 'string') return spec;
  const v = (spec.value || 0) * (factor || 1);
  const rounded = Math.round(v * 10000) / 10000;
  const str = String(rounded).replace('.', ',');
  return spec.unit ? `${str} ${spec.unit}` : str;
}

// ---- SVG-bouwstenen ----

// Winkelhaak bij hoekpunt V (Vlaamse notatie: open ∟-vorm, twee aparte lijnen)
// Arm 1 loopt langs de richting naar prev, arm 2 langs de richting naar next.
// Beide armen beginnen op het binnenste hoekpunt van de ∟ en lopen naar de zijden.
function _svgHoekTeken(V, prev, next, s) {
  const sz = s.markerSize;
  const tP = { x: prev.x - V.x, y: prev.y - V.y };
  const tN = { x: next.x - V.x, y: next.y - V.y };
  const lP = Math.hypot(tP.x, tP.y), lN = Math.hypot(tN.x, tN.y);
  if (lP < 0.001 || lN < 0.001) return '';
  const uP = { x: tP.x / lP, y: tP.y / lP };   // eenheidsvector naar prev
  const uN = { x: tN.x / lN, y: tN.y / lN };   // eenheidsvector naar next

  // C = hoekpunt van de ∟, sz inwaarts langs beide zijden
  const C = { x: V.x + uP.x * sz + uN.x * sz, y: V.y + uP.y * sz + uN.y * sz };
  // A en B: op de zijden, sz van V (aan de V-kant van C)
  const A = { x: V.x + uP.x * sz, y: V.y + uP.y * sz };
  const B = { x: V.x + uN.x * sz, y: V.y + uN.y * sz };
  // A' en B': gespiegeld rond C (aan de binnenkant van C, weg van V)
  const Ap = { x: 2 * C.x - A.x, y: 2 * C.y - A.y };
  const Bp = { x: 2 * C.x - B.x, y: 2 * C.y - B.y };

  const x = v => v.x.toFixed(1);
  const y = v => v.y.toFixed(1);
  return [
    `<line x1="${x(Ap)}" y1="${y(Ap)}" x2="${x(C)}" y2="${y(C)}" stroke="${s.markerColor}" stroke-width="2"/>`,
    `<line x1="${x(C)}" y1="${y(C)}" x2="${x(Bp)}" y2="${y(Bp)}" stroke="${s.markerColor}" stroke-width="2"/>`,
  ].join('');
}

// Gelijkheidsteken(s) op het midden van zijde A→B (loodrecht op de zijde)
function _svgTick(A, B, count, s) {
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const dx = B.x - A.x, dy = B.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;   // richtingsvector langs de zijde
  const px = -uy, py = ux;              // loodrecht
  const tl = s.tickLength / 2;
  const sp = s.tickSpacing / 2;
  const offsets = count === 1 ? [0] : [-sp, sp];
  return offsets.map(o => {
    const ox = ux * o, oy = uy * o;
    return `<line x1="${(mx + ox - px * tl).toFixed(1)}" y1="${(my + oy - py * tl).toFixed(1)}"
                  x2="${(mx + ox + px * tl).toFixed(1)}" y2="${(my + oy + py * tl).toFixed(1)}"
                  stroke="${s.markerColor}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
}

// Parallelpijl(en) op het midden van zijde A→B (langs de zijde gericht)
function _svgParallelPijl(A, B, count, s) {
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const dx = B.x - A.x, dy = B.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const as = s.arrowSize;
  const gap = as * 0.85;
  const offsets = count === 1 ? [0] : [-gap / 2, gap / 2];
  return offsets.map(o => {
    const ax = mx + ux * o, ay = my + uy * o;
    const b1 = `${(ax - ux * as - uy * as * 0.5).toFixed(1)},${(ay - uy * as + ux * as * 0.5).toFixed(1)}`;
    const tip = `${ax.toFixed(1)},${ay.toFixed(1)}`;
    const b2 = `${(ax - ux * as + uy * as * 0.5).toFixed(1)},${(ay - uy * as - ux * as * 0.5).toFixed(1)}`;
    return `<polyline points="${b1} ${tip} ${b2}" fill="none" stroke="${s.markerColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('');
}

// Label op het midden van zijde A→B, buiten de figuur
function _svgLabel(A, B, tekst, centroid, s) {
  if (!tekst) return '';
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const norm = _outwardNormal(A, B, centroid);
  const lx = mx + norm.x * s.labelOffset;
  const ly = my + norm.y * s.labelOffset;

  let anchor = 'middle';
  if (norm.x > 0.3) anchor = 'start';
  else if (norm.x < -0.3) anchor = 'end';

  let baseline = 'middle';
  if (norm.y > 0.35) baseline = 'hanging';
  else if (norm.y < -0.35) baseline = 'auto';

  return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
    text-anchor="${anchor}" dominant-baseline="${baseline}"
    font-family="${s.fontFamily}" font-size="${s.fontSize}"
    fill="${s.labelColor}">${tekst}</text>`;
}

// Bouw de volledige SVG voor een veelhoek
function _buildPolygonSVG(verts, markeringen, labels, w, h, s) {
  const pts = verts.map(v => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
  return [
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`,
    `<polygon points="${pts}" fill="${s.fill}" stroke="${s.stroke}"`,
    `  stroke-width="${s.strokeWidth}" stroke-linejoin="round"/>`,
    markeringen,
    labels,
    `</svg>`,
  ].join('\n');
}

// Zet container: accepteert HTMLElement of CSS-selector
function _resolveContainer(container) {
  if (typeof container === 'string') return document.querySelector(container);
  return container;
}

// ---- Standaard SVG-afmetingen ----
const _W  = 280;   // standaard breedte
const _H  = 260;   // standaard hoogte
const _WR = 280;   // rechthoek breedte
const _HR = 320;   // rechthoek hoogte
const _WT = 340;   // trapezium breedte
const _WP = 320;   // parallellogram breedte
const _PAD = 55;   // padding voor labels

// ============================================================
// TEKENFUNCTIES
// ============================================================

/**
 * Vierkant
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}  Vermenigvuldiger voor alle labels (default: 1)
 *   rotation   {number}  Rotatie in graden rond eerste hoekpunt (default: 0)
 *   zijde      {{value, unit}}  Zijde-afmeting (default: { value: 3, unit: 'cm' })
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 260)
 */
function drawVierkant(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _W, svgHeight = _H } = opts;
  const s   = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const zij = opts.zijde || { value: 3, unit: 'cm' };
  const pad = _PAD;

  const base  = [{ x: 0, y: 0 }, { x: 120, y: 0 }, { x: 120, y: 120 }, { x: 0, y: 120 }];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const n     = verts.length;
  const c     = _centroid(verts);
  const lbl   = _fmt(zij, factor);

  let m = '', l = '';
  for (let i = 0; i < n; i++) {
    const prev = verts[(i + n - 1) % n], curr = verts[i], next = verts[(i + 1) % n];
    m += _svgHoekTeken(curr, prev, next, s);
    m += _svgTick(curr, next, 1, s);
  }
  // Label eenmalig op de onderste zijde (rand 2 in de basisstand)
  l += _svgLabel(verts[2], verts[3], lbl, c, s);
  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Rechthoek
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   breedte    {{value, unit}}  (default: { value: 2, unit: 'cm' })
 *   hoogte     {{value, unit}}  (default: { value: 4, unit: 'cm' })
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 320)
 */
function drawRechthoek(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _WR, svgHeight = _HR } = opts;
  const s       = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const breedte = opts.breedte || { value: 2, unit: 'cm' };
  const hoogte  = opts.hoogte  || { value: 4, unit: 'cm' };
  const pad = _PAD;

  // Verhouding ~1:2 (breedte:hoogte)
  const base  = [{ x: 0, y: 0 }, { x: 85, y: 0 }, { x: 85, y: 160 }, { x: 0, y: 160 }];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const n     = verts.length;
  const c     = _centroid(verts);

  let m = '', l = '';
  for (let i = 0; i < n; i++) {
    m += _svgHoekTeken(verts[i], verts[(i + n - 1) % n], verts[(i + 1) % n], s);
  }

  // Breedte eenmalig op de onderste zijde (rand 2), hoogte op de rechterzijde (rand 1)
  l += _svgLabel(verts[1], verts[2], _fmt(hoogte,  factor), c, s);
  l += _svgLabel(verts[2], verts[3], _fmt(breedte, factor), c, s);
  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Driehoek
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   zijden     [{value, unit}, ...]  3 zijden, beginnen links onderaan met de klok mee
 *              (default: 5cm, 4cm, 3cm)
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 260)
 */
function drawDriehoek(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _W, svgHeight = _H } = opts;
  const s    = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const zij  = opts.zijden || [
    { value: 5, unit: 'cm' }, { value: 4, unit: 'cm' }, { value: 3, unit: 'cm' }
  ];
  const pad = _PAD;

  // Scheve driehoek (gelijkbenig, lichtjes asymmetrisch)
  const base  = [{ x: 0, y: 95 }, { x: 75, y: 0 }, { x: 175, y: 95 }];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);
  const n     = verts.length;

  let l = '';
  for (let i = 0; i < n; i++) {
    l += _svgLabel(verts[i], verts[(i + 1) % n], _fmt(zij[i % zij.length], factor), c, s);
  }
  container.innerHTML = _buildPolygonSVG(verts, '', l, svgWidth, svgHeight, s);
}

/**
 * Trapezium
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   zijden     [{value, unit}, ...]  4 zijden: [top, rechterbeen, bodem, linkerbeen]
 *              (default: 3mm, 3.6mm, 7mm, 2.2mm)
 *   svgWidth   {number}  (default: 340)
 *   svgHeight  {number}  (default: 260)
 *
 * De twee parallelle zijden (top en bodem) krijgen automatisch parallelpijlen.
 */
function drawTrapezium(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _WT, svgHeight = _H } = opts;
  const s   = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const zij = opts.zijden || [
    { value: 3,   unit: 'mm' },
    { value: 3.6, unit: 'mm' },
    { value: 7,   unit: 'mm' },
    { value: 2.2, unit: 'mm' },
  ];
  const pad = _PAD + 10;

  // Top smaller than bodem, licht asymmetrisch (zoals in de afbeelding)
  const base = [
    { x: 50,  y: 0   },
    { x: 170, y: 0   },
    { x: 220, y: 100 },
    { x: 0,   y: 100 },
  ];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);
  const n     = verts.length;

  // Parallelpijlen op top (0→1) en bodem; bodem omgekeerd (3→2) zodat pijlen dezelfde kant wijzen
  let m = '';
  m += _svgParallelPijl(verts[0], verts[1], 1, s);
  m += _svgParallelPijl(verts[3], verts[2], 1, s);

  // Labels: top=zij[0], rechts=zij[1], bodem=zij[2], links=zij[3]
  let l = '';
  l += _svgLabel(verts[0], verts[1], _fmt(zij[0], factor), c, s);
  l += _svgLabel(verts[1], verts[2], _fmt(zij[1], factor), c, s);
  l += _svgLabel(verts[2], verts[3], _fmt(zij[2], factor), c, s);
  l += _svgLabel(verts[3], verts[0], _fmt(zij[3], factor), c, s);

  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Ruit (rhombus)
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   zijde      {{value, unit}}  Alle zijden gelijk (default: { value: 2.2, unit: 'dm' })
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 260)
 *
 * Alle zijden krijgen één gelijkheidsteken.
 */
function drawRuit(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _W, svgHeight = _H } = opts;
  const s   = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const zij = opts.zijde || { value: 2.2, unit: 'dm' };
  const pad = _PAD;

  // Horizontale ruit (breder dan hoog), zoals in de afbeelding
  const base = [
    { x: 0,   y: 55  },
    { x: 100, y: 0   },
    { x: 200, y: 55  },
    { x: 100, y: 110 },
  ];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);
  const n     = verts.length;
  const lbl   = _fmt(zij, factor);

  let m = '', l = '';
  for (let i = 0; i < n; i++) {
    m += _svgTick(verts[i], verts[(i + 1) % n], 1, s);
  }
  // Label eenmalig op de rechteronderste zijde (rand 2 in de basisstand)
  l += _svgLabel(verts[2], verts[3], lbl, c, s);
  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Parallellogram
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   basis      {{value, unit}}  Lange zijden (default: { value: 3,   unit: 'cm' })
 *   zijde      {{value, unit}}  Schuine zijden (default: { value: 2.2, unit: 'cm' })
 *   svgWidth   {number}  (default: 320)
 *   svgHeight  {number}  (default: 260)
 *
 * Lange zijden: dubbele parallelpijlen. Schuine zijden: enkele parallelpijl.
 */
function drawParallellogram(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _WP, svgHeight = _H } = opts;
  const s     = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const basis = opts.basis || { value: 3,   unit: 'cm' };
  const zij   = opts.zijde || { value: 2.2, unit: 'cm' };
  const pad   = _PAD;

  // Parallellogram dat naar rechts leunt
  const base = [
    { x: 45,  y: 0  },
    { x: 215, y: 0  },
    { x: 170, y: 90 },
    { x: 0,   y: 90 },
  ];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);

  // Top (0→1) en bodem (3→2) dezelfde richting → dubbele parallelpijl
  let m = '';
  m += _svgParallelPijl(verts[0], verts[1], 2, s);
  m += _svgParallelPijl(verts[3], verts[2], 2, s);
  // Schuine zijden (1→2 en 3→0): enkele parallelpijl (zoals bij trapezium)
  m += _svgParallelPijl(verts[1], verts[2], 1, s);
  m += _svgParallelPijl(verts[3], verts[0], 1, s);

  let l = '';
  l += _svgLabel(verts[0], verts[1], _fmt(basis, factor), c, s);
  l += _svgLabel(verts[1], verts[2], _fmt(zij,   factor), c, s);
  l += _svgLabel(verts[2], verts[3], _fmt(basis, factor), c, s);
  l += _svgLabel(verts[3], verts[0], _fmt(zij,   factor), c, s);

  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Cirkel
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   straal     {{value, unit}}  (default: { value: 1, unit: 'cm' })
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 260)
 *
 *   Geen rotatieparameter (cirkel is rotatiesymmetrisch).
 */
function drawCirkel(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1,
    svgWidth = _W, svgHeight = _H } = opts;
  const s   = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const str = opts.straal || { value: 1, unit: 'cm' };
  const pad = _PAD;

  const cx = svgWidth  / 2;
  const cy = svgHeight / 2;
  const r  = Math.min(svgWidth - 2 * pad, svgHeight - 2 * pad) / 2;

  const r2x = cx + r;
  const lbl = _fmt(str, factor);

  const svg = [
    `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`,
    `<circle cx="${cx}" cy="${cy}" r="${r}"`,
    `  fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`,
    // Straalstreep
    `<line x1="${cx}" y1="${cy}" x2="${r2x}" y2="${cy}"`,
    `  stroke="${s.markerColor}" stroke-width="1.5"/>`,
    // Middelpunt (enkel een punt, geen naamsaanduiding)
    `<circle cx="${cx}" cy="${cy}" r="3" fill="${s.markerColor}"/>`,
    // Straalafstand boven de straalstreep
    `<text x="${(cx + r2x) / 2}" y="${cy - 9}"
        text-anchor="middle"
        font-family="${s.fontFamily}" font-size="${s.fontSize}"
        fill="${s.labelColor}">${lbl}</text>`,
    `</svg>`,
  ].join('\n');

  container.innerHTML = svg;
}

/**
 * Willekeurige vierhoek (onregelmatige vierzijdige figuur)
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor     {number}
 *   rotation   {number}
 *   zijden     [{value, unit}, ...]  4 zijden (default: 36cm, 3.2dm, 3dm, 1.4dm)
 *   svgWidth   {number}  (default: 280)
 *   svgHeight  {number}  (default: 260)
 */
function drawVierhoek(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _W, svgHeight = _H } = opts;
  const s   = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const zij = opts.zijden || [
    { value: 36,  unit: 'cm' },
    { value: 3.2, unit: 'dm' },
    { value: 3,   unit: 'dm' },
    { value: 1.4, unit: 'dm' },
  ];
  const pad = _PAD;

  // Onregelmatige vierhoek (gelijkend op de afbeelding: spitse linkerhoek)
  const base = [
    { x: 0,   y: 70  },
    { x: 90,  y: 0   },
    { x: 180, y: 45  },
    { x: 135, y: 115 },
  ];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);
  const n     = verts.length;

  let l = '';
  for (let i = 0; i < n; i++) {
    l += _svgLabel(verts[i], verts[(i + 1) % n], _fmt(zij[i % zij.length], factor), c, s);
  }
  container.innerHTML = _buildPolygonSVG(verts, '', l, svgWidth, svgHeight, s);
}

// ============================================================
// PUBLIEKE API
// ============================================================

/**
 * Centrale toegangsfunctie.
 *
 * @param {HTMLElement|string} container  Element of CSS-selector
 * @param {string} type  'vierkant' | 'rechthoek' | 'driehoek' | 'trapezium' |
 *                       'ruit' | 'parallellogram' | 'cirkel' | 'vierhoek'
 * @param {Object} opts  Zie de afzonderlijke tekenfuncties hierboven
 */
function drawFiguur(container, type, opts) {
  const functies = {
    vierkant:       drawVierkant,
    rechthoek:      drawRechthoek,
    driehoek:       drawDriehoek,
    trapezium:      drawTrapezium,
    ruit:           drawRuit,
    parallellogram: drawParallellogram,
    cirkel:         drawCirkel,
    vierhoek:       drawVierhoek,
  };
  const fn = functies[type];
  if (fn) {
    fn(container, opts || {});
  } else {
    console.warn(`[figures.js] Onbekend figuurtype: "${type}"`);
  }
}
