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
  hoogteColor:  '#1565c0',  // kleur voor hoogtelijnen en hun label
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
  // A' en B': homothetie vanuit C met factor legFactor (standaard 1 = spiegeling)
  const lf = s.markerLegFactor || 1;
  const Ap = { x: C.x + lf * (C.x - A.x), y: C.y + lf * (C.y - A.y) };
  const Bp = { x: C.x + lf * (C.x - B.x), y: C.y + lf * (C.y - B.y) };

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
  if (!tekst || (s && s.noLabels)) return '';
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
    `<svg width="${w}" height="${h}" overflow="visible" xmlns="http://www.w3.org/2000/svg">`,
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
    `<svg width="${svgWidth}" height="${svgHeight}" overflow="visible" xmlns="http://www.w3.org/2000/svg">`,
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

/**
 * Parallellogram met hoogte-aanduiding
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   factor       {number}
 *   rotation     {number}  Rotatie in graden (default: 0)
 *   basis        {{value, unit}}  Lange zijden (default: { value: 3,   unit: 'cm' })
 *   zijde        {{value, unit}}  Schuine zijden (default: { value: 2.2, unit: 'cm' })
 *   welkeHoogte  {'links'|'rechts'}  Vanuit welk basishoekpunt de hoogte getekend wordt.
 *                  'rechts' → voet binnen segment (schone lijn)
 *                  'links'  → voet buiten segment (met drager)
 *                  Weggelaten of andere waarde → random
 *   svgWidth     {number}  (default: 320)
 *   svgHeight    {number}  (default: 260)
 *
 * De hoogte wordt loodrecht getekend vanuit een basishoekpunt op de overstaande zijde.
 * De hoogte-waarde wordt berekend als zijde × sin(binnenhoek) en naast de lijn geplaatst.
 */
function drawParallellogramHoogte(container, opts = {}) {
  container = _resolveContainer(container);
  const { factor = 1, rotation = 0,
    svgWidth = _WP, svgHeight = _H } = opts;
  const s     = Object.assign({}, FIGUUR_STIJL, opts.stijl);
  const basis = opts.basis || { value: 3,   unit: 'cm' };
  const zij   = opts.zijde || { value: 2.2, unit: 'cm' };
  const pad   = _PAD;

  const base = [
    { x: 45,  y: 0  },
    { x: 215, y: 0  },
    { x: 170, y: 90 },
    { x: 0,   y: 90 },
  ];
  const verts = _transformVertices(base, rotation, pad, pad, svgWidth - 2 * pad, svgHeight - 2 * pad);
  const c     = _centroid(verts);

  let m = '';
  m += _svgParallelPijl(verts[0], verts[1], 2, s);
  m += _svgParallelPijl(verts[3], verts[2], 2, s);
  m += _svgParallelPijl(verts[1], verts[2], 1, s);
  m += _svgParallelPijl(verts[3], verts[0], 1, s);

  // Welk basishoekpunt EERST bepalen (beïnvloedt welke labels worden getoond)
  let welke = opts.welkeHoogte;
  if (welke !== 'links' && welke !== 'rechts') welke = Math.random() < 0.5 ? 'links' : 'rechts';
  // verts[3] = linker basishoekpunt → voet buiten segment (drager nodig)
  // verts[2] = rechter basishoekpunt → voet binnen segment
  const vanPunt      = welke === 'links' ? verts[3] : verts[2];
  const anderBasisPt = welke === 'links' ? verts[2] : verts[3];

  // Labels: alleen de onderste basis + de schuine zijde NIET aangrenzend aan vanPunt.
  // De overstaande zijde (verts[0]→verts[1]) en de zijde die vanPunt deelt met de hoogte
  // worden weggelaten omdat ze te dicht bij de hoogtelijn liggen.
  let l = '';
  l += _svgLabel(verts[2], verts[3], _fmt(basis, factor), c, s);
  if (welke === 'links') {
    l += _svgLabel(verts[1], verts[2], _fmt(zij, factor), c, s);
  } else {
    l += _svgLabel(verts[3], verts[0], _fmt(zij, factor), c, s);
  }

  // Loodrechte voet van vanPunt op de overstaande zijde verts[0]→verts[1]
  const A = verts[0], B = verts[1];
  const dx = B.x - A.x, dy = B.y - A.y;
  const t  = ((vanPunt.x - A.x) * dx + (vanPunt.y - A.y) * dy) / (dx * dx + dy * dy);
  const F  = { x: A.x + t * dx, y: A.y + t * dy };

  // Drager als voet buiten segment valt
  if (t < 0 || t > 1) {
    const grens  = t < 0 ? A : B;
    const udx    = F.x - grens.x, udy = F.y - grens.y;
    const ul     = Math.hypot(udx, udy) || 1;
    const draEnd = { x: F.x + (udx / ul) * 14, y: F.y + (udy / ul) * 14 };
    m += `<line x1="${grens.x.toFixed(1)}" y1="${grens.y.toFixed(1)}" ` +
         `x2="${draEnd.x.toFixed(1)}" y2="${draEnd.y.toFixed(1)}" ` +
         `stroke="#aaa" stroke-width="1.5" stroke-dasharray="7,4"/>`;
  }

  // Hoogtelijn
  m += `<line x1="${vanPunt.x.toFixed(1)}" y1="${vanPunt.y.toFixed(1)}" ` +
       `x2="${F.x.toFixed(1)}" y2="${F.y.toFixed(1)}" ` +
       `stroke="${s.hoogteColor}" stroke-width="2" stroke-linecap="round"/>`;

  // Winkelhaakjes op vanPunt en op de voet F (in hoogteColor)
  const sH = Object.assign({}, s, { markerColor: s.hoogteColor });
  m += _svgHoekTeken(vanPunt, F, anderBasisPt, sH);
  m += _svgHoekTeken(F, vanPunt, verts[1], sH);

  // Hoogte-waarde: zijde × sin(binnenhoek); sin uit de vaste basisvorm: 90/|zijdevector|
  const sinA = 90 / Math.sqrt(45 * 45 + 90 * 90);
  const hVal = (zij.value || 0) * (factor || 1) * sinA;
  // Afronden op evenveel decimalen als de zijde met de meeste decimalen
  const _nDec = v => { const s = String(Math.round(v * 10000) / 10000); const i = s.indexOf('.'); return i === -1 ? 0 : s.length - i - 1; };
  const decimals = Math.max(_nDec((basis.value || 0) * (factor || 1)), _nDec((zij.value || 0) * (factor || 1)));
  const hTekst   = hVal.toFixed(decimals).replace('.', ',') + (zij.unit ? ` ${zij.unit}` : '');

  // Label op middelpunt van de hoogtelijn, loodrecht.
  // 'rechts': hoogte ligt binnen het figuur → label naar de binnenkant (richting centroid)
  //           om verwarring met de schuine zijde te vermijden.
  // 'links':  hoogte loopt buiten via drager → label naar de buitenkant (weg van centroid).
  const mx   = (vanPunt.x + F.x) / 2, my = (vanPunt.y + F.y) / 2;
  const hlDx = F.x - vanPunt.x,       hlDy = F.y - vanPunt.y;
  const hlL  = Math.hypot(hlDx, hlDy) || 1;
  const nAx  = -hlDy / hlL,           nAy  = hlDx / hlL;
  const dot  = nAx * (mx - c.x) + nAy * (my - c.y);
  const flip = welke === 'rechts' ? -1 : 1;
  const nx   = flip * (dot >= 0 ? nAx : -nAx), ny = flip * (dot >= 0 ? nAy : -nAy);
  const lx   = mx + nx * s.labelOffset;
  const ly   = my + ny * s.labelOffset;

  let anchor = 'middle';
  if (nx > 0.3) anchor = 'start'; else if (nx < -0.3) anchor = 'end';
  let baseline = 'middle';
  if (ny > 0.35) baseline = 'hanging'; else if (ny < -0.35) baseline = 'auto';

  l += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" ` +
       `text-anchor="${anchor}" dominant-baseline="${baseline}" ` +
       `font-family="${s.fontFamily}" font-size="${s.fontSize}" ` +
       `fill="${s.hoogteColor}">${hTekst}</text>`;

  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, s);
}

/**
 * Driehoek met hoogte-aanduiding
 *
 * Vaste driehoeksvormen per type; k schaalt de labels, niet de tekening.
 *
 * @param {HTMLElement|string} container
 * @param {Object} opts
 *   type      {1|2|3|4}
 *               1 = scherphoekig  (a=5, b=4, c=6;  basis=a)
 *               2 = rechthoekig   (a=3, b=4, c=5;  basis=a, rechte hoek bij P0)
 *               3 = stomphoekig   (a=5, b=4, c=8;  basis=a, voet hoogte buiten basis)
 *               4 = stomphoekig   (a=5, b=8, c=10; basis=c)
 *   k         {number}  Factor voor alle labels (default: 1)
 *   unit      {string}  Eenheid (default: 'cm')
 *   rotation  {number}  Rotatie in graden (default: 0)
 *   svgWidth  {number}  (default: 280)
 *   svgHeight {number}  (default: 260)
 *
 * @returns {{ a, b, c, h, oppervlakte }}  Afgeronde labelwaarden (1 dec.) + oppervlakte (2 dec.)
 */
function drawDriehoekHoogte(container, opts = {}) {
  container = _resolveContainer(container);
  const {
    type = 1, k = 1, unit = 'cm',
    rotation = 0,
    svgWidth = 300, svgHeight = 300,
  } = opts;
  const stijl = Object.assign({}, FIGUUR_STIJL, { labelOffset: 10, markerSize: 5, markerLegFactor: 2 }, opts.stijl);
  const pad   = 40;

  // Vaste (a₀, b₀, c₀) per type – bepalen de visuele vorm
  //                        a  b   c  schaalFactor
  const VORMEN = { 1: [5, 4,  6, 1  ],
                   2: [3, 4,  5, 1  ],
                   3: [5, 4,  8, 1  ],
                   4: [5, 8, 10, 1  ] };
  const [a0, b0, c0, schaalFactor] = VORMEN[type] || VORMEN[1];

  // Basis en zijden in basiscoördinaten
  const basisLen  = (type === 4) ? c0 : a0;
  const sideLeft  = (type === 4) ? a0 : b0;   // P0→P2
  const sideRight = (type === 4) ? b0 : c0;   // P1→P2

  const p2x = (basisLen*basisLen + sideLeft*sideLeft - sideRight*sideRight) / (2*basisLen);
  const p2y = Math.sqrt(Math.max(0, sideLeft*sideLeft - p2x*p2x));

  const P0 = { x: 0,        y:    0 };
  const P1 = { x: basisLen, y:    0 };
  const P2 = { x: p2x,      y: -p2y };
  const F  = { x: p2x,      y:    0 };

  // Vaste schaal op basis van de ongeroteerde bounding box van de driehoek
  const drawW  = svgWidth  - 2 * pad;
  const drawH  = svgHeight - 2 * pad;
  const bMinX  = Math.min(P0.x, P1.x, P2.x), bMaxX = Math.max(P0.x, P1.x, P2.x);
  const bMinY  = Math.min(P0.y, P1.y, P2.y), bMaxY = Math.max(P0.y, P1.y, P2.y);
  const scale  = Math.min(drawW / (bMaxX - bMinX || 1), drawH / (bMaxY - bMinY || 1)) * schaalFactor;

  // Centreer de geschaalde driehoek in de container, daarna roteren rond het midden
  const cx  = svgWidth  / 2;
  const cy  = svgHeight / 2;
  const offX = cx - (bMinX + bMaxX) / 2 * scale;
  const offY = cy - (bMinY + bMaxY) / 2 * scale;

  const preTrans = v => ({ x: v.x * scale + offX, y: v.y * scale + offY });
  const [pP0, pP1, pP2, pF] = [P0, P1, P2, F].map(preTrans);

  // Roteer alle punten rond het midden van de container
  const rot   = v => _rotateAround(v.x, v.y, cx, cy, rotation);
  const tP0 = rot(pP0), tP1 = rot(pP1), tP2 = rot(pP2), tF = rot(pF);
  const verts  = [tP0, tP1, tP2];
  const cg     = _centroid(verts);

  // Afgeronde labelwaarden (k × vaste maat) en oppervlakte via Heron
  const rnd1 = v => Math.round(v * 10) / 10;
  const aR = rnd1(a0*k), bR = rnd1(b0*k), cR = rnd1(c0*k), hR = rnd1(p2y*k);
  const basisR = (type === 4) ? cR : aR;
  const oppervlakte = Math.round(basisR * hR / 2 * 1000) / 1000;

  const fmt = v => v.toFixed(1).replace('.', ',') + (unit ? ` ${unit}` : '');

  let m = '', l = '';

  // Zijlabels
  if (type === 4) {
    l += _svgLabel(tP0, tP1, fmt(cR), cg, stijl);
    l += _svgLabel(tP1, tP2, fmt(bR), cg, stijl);
    l += _svgLabel(tP2, tP0, fmt(aR), cg, stijl);
  } else {
    l += _svgLabel(tP0, tP1, fmt(aR), cg, stijl);
    l += _svgLabel(tP1, tP2, fmt(cR), cg, stijl);
    // Type 3: label b aan de andere kant → gespiegeld zwaartepunt t.o.v. het midden van P2→P0
    if (type === 3) {
      // Ankerpunt op 70% van P2 naar P0, normaal aan de andere kant
      const t = 0.7;
      const anker = { x: tP2.x + t*(tP0.x - tP2.x), y: tP2.y + t*(tP0.y - tP2.y) };
      const norm  = _outwardNormal(tP2, tP0, cg);
      const lx = anker.x - norm.x * stijl.labelOffset;
      const ly = anker.y - norm.y * stijl.labelOffset;
      l += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
        font-family="${stijl.fontFamily}" font-size="${stijl.fontSize}" fill="${stijl.labelColor}">${fmt(bR)}</text>`;
    } else {
      l += _svgLabel(tP2, tP0, fmt(bR), cg, stijl);
    }
  }

  if (type === 2) {
    // Rechthoekige driehoek: winkelhaak bij P0 in zijkleur, geen aparte hoogtelijn
    m += _svgHoekTeken(tP0, tP2, tP1, stijl);
  } else {
    // Hoogtelijn van apex naar voet
    m += `<line x1="${tP2.x.toFixed(1)}" y1="${tP2.y.toFixed(1)}" ` +
         `x2="${tF.x.toFixed(1)}" y2="${tF.y.toFixed(1)}" ` +
         `stroke="${stijl.hoogteColor}" stroke-width="2" stroke-linecap="round"/>`;

    // Winkelhaak bij voet F in hoogteColor
    const sH = Object.assign({}, stijl, { markerColor: stijl.hoogteColor });
    m += _svgHoekTeken(tF, tP2, tP1, sH);

    // Drager voor type 3: stippellijn van P0 voorbij F
    if (type === 3) {
      const draDx = tF.x - tP0.x, draDy = tF.y - tP0.y;
      const draL  = Math.hypot(draDx, draDy) || 1;
      const ext   = { x: tF.x + (draDx/draL)*14, y: tF.y + (draDy/draL)*14 };
      m += `<line x1="${tP0.x.toFixed(1)}" y1="${tP0.y.toFixed(1)}" ` +
           `x2="${ext.x.toFixed(1)}" y2="${ext.y.toFixed(1)}" ` +
           `stroke="#aaa" stroke-width="1.5" stroke-dasharray="7,4"/>`;
    }

    // Hoogte-label naast de hoogtelijn, aan de buitenkant van de driehoek
    const hmx  = (tP2.x + tF.x) / 2, hmy = (tP2.y + tF.y) / 2;
    const hlDx = tF.x - tP2.x,       hlDy = tF.y - tP2.y;
    const hlL  = Math.hypot(hlDx, hlDy) || 1;
    const nAx  = -hlDy/hlL, nAy = hlDx/hlL;
    const dot  = nAx*(hmx - cg.x) + nAy*(hmy - cg.y);
    const flip = (type === 1 || type === 4) ? -1 : 1;
    const nx   = flip * (dot >= 0 ? nAx : -nAx), ny = flip * (dot >= 0 ? nAy : -nAy);
    const lx   = hmx + nx*stijl.labelOffset;
    const ly   = hmy + ny*stijl.labelOffset;
    let anchor = 'middle';
    if (nx > 0.3) anchor = 'start'; else if (nx < -0.3) anchor = 'end';
    let baseline = 'middle';
    if (ny > 0.35) baseline = 'hanging'; else if (ny < -0.35) baseline = 'auto';
    l += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" ` +
         `text-anchor="${anchor}" dominant-baseline="${baseline}" ` +
         `font-family="${stijl.fontFamily}" font-size="${stijl.fontSize}" ` +
         `fill="${stijl.hoogteColor}">${fmt(hR)}</text>`;
  }

  container.innerHTML = _buildPolygonSVG(verts, m, l, svgWidth, svgHeight, stijl);
  return { a: aR, b: bR, c: cR, h: hR, oppervlakte };
}

// ============================================================
// PUBLIEKE API
// ============================================================

/**
 * Centrale toegangsfunctie.
 *
 * @param {HTMLElement|string} container  Element of CSS-selector
 * @param {string} type  'vierkant' | 'rechthoek' | 'driehoek' | 'trapezium' |
 *                       'ruit' | 'parallellogram' | 'parallellogram-hoogte' |
 *                       'cirkel' | 'vierhoek' | 'driehoek-hoogte'
 * @param {Object} opts  Zie de afzonderlijke tekenfuncties hierboven
 */
function drawFiguur(container, type, opts) {
  const functies = {
    vierkant:               drawVierkant,
    rechthoek:              drawRechthoek,
    driehoek:               drawDriehoek,
    trapezium:              drawTrapezium,
    ruit:                   drawRuit,
    parallellogram:         drawParallellogram,
    'parallellogram-hoogte': drawParallellogramHoogte,
    'driehoek-hoogte':      drawDriehoekHoogte,
    cirkel:                 drawCirkel,
    vierhoek:               drawVierhoek,
  };
  const fn = functies[type];
  if (fn) {
    return fn(container, opts || {});
  } else {
    console.warn(`[figures.js] Onbekend figuurtype: "${type}"`);
  }
}
