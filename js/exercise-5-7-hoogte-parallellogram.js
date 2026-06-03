'use strict';

function init57HoogteParallellogram(container, onComplete) {

    // ── CONSTANTEN ───────────────────────────────────────────
    const TOTAAL     = 4;
    const MAX_PUNTEN = 4;
    const S          = 190;   // SVG-grootte per figuurkaart (vierkant)

    // Stijlconstanten parallellogram SVG (zelfde als figures.js en demo)
    const FILL   = 'rgba(168, 212, 85, 0.65)';
    const STROKE = '#4a7a10';
    const SW     = 2.5;
    const HL_C   = '#c0392b';
    const HL_W   = 5.5;
    const MK_C   = '#3a6a0e';
    const MK_SZ  = 10;

    // ── HULPFUNCTIES ─────────────────────────────────────────
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function fmtPunten(p) { return Number.isInteger(p) ? String(p) : p.toFixed(1); }

    // ── GEOMETRIE ─────────────────────────────────────────────
    function f(p)  { return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }
    function fx(n) { return n.toFixed(1); }

    function unit(A, B) {
        const dx = B.x - A.x, dy = B.y - A.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: dx / l, y: dy / l };
    }

    // Loodrechte voet van P op lijn A→B; t < 0: voorbij A, t > 1: voorbij B
    function voet(P, A, B) {
        const dx = B.x - A.x, dy = B.y - A.y;
        const t  = ((P.x - A.x) * dx + (P.y - A.y) * dy) / (dx * dx + dy * dy);
        return { x: A.x + t * dx, y: A.y + t * dy, t };
    }

    // Winkelhaak (∟) – zelfde patroon als _svgHoekTeken in figures.js
    function hoek(V, A, B) {
        const uA = unit(V, A), uB = unit(V, B);
        const mA = { x: V.x + uA.x * MK_SZ, y: V.y + uA.y * MK_SZ };
        const mB = { x: V.x + uB.x * MK_SZ, y: V.y + uB.y * MK_SZ };
        const C  = { x: mA.x + uB.x * MK_SZ, y: mA.y + uB.y * MK_SZ };
        const Ap = { x: 2 * C.x - mA.x, y: 2 * C.y - mA.y };
        const Bp = { x: 2 * C.x - mB.x, y: 2 * C.y - mB.y };
        return `<polyline points="${f(Ap)} ${f(C)} ${f(Bp)}"
            fill="none" stroke="${MK_C}" stroke-width="1.5" stroke-linejoin="round"/>`;
    }

    // ── PARALLELLOGRAM GENEREREN ──────────────────────────────
    // Leunt altijd naar links (slantX < 0):
    //   v3 ---- v2   (overstaande zijde)
    //   /       /
    //  v0 ---- v1   (basis = streeplijn)
    // Wiskunde garandeert (rotatiebestendig):
    //   - voet vanuit v0 altijd BINNEN de overstaande zijde
    //   - voet vanuit v1 altijd BUITEN → drager nodig
    function genPara() {
        const cx = S / 2, cy = S / 2;
        const basisLen = 85  + Math.floor(Math.random() * 30);   // 85–114 px
        const slantX   = -(20 + Math.floor(Math.random() * 23)); // -20 tot -42 px
        const figH     = 60  + Math.floor(Math.random() * 25);   // 60–84 px
        const rot      = Math.floor(Math.random() * 72) * 5;     // 0–355°, stap 5

        const half = basisLen / 2, halfH = figH / 2;
        const base = [
            { x: cx - half,          y: cy + halfH },
            { x: cx + half,          y: cy + halfH },
            { x: cx + half + slantX, y: cy - halfH },
            { x: cx - half + slantX, y: cy - halfH },
        ];
        const rad = rot * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        return base.map(v => ({
            x: cx + (v.x - cx) * cos - (v.y - cy) * sin,
            y: cy + (v.x - cx) * sin + (v.y - cy) * cos,
        }));
    }

    // ── SVG BOUWSTENEN ────────────────────────────────────────
    function lijnSVG(A, B, kleur, dikte, extra) {
        return `<line x1="${fx(A.x)}" y1="${fx(A.y)}" x2="${fx(B.x)}" y2="${fx(B.y)}"
            stroke="${kleur}" stroke-width="${dikte}" stroke-linecap="round"${extra ? ' ' + extra : ''}/>`;
    }

    function basisFig(v) {
        const [v0, v1, v2, v3] = v;
        const pts = v.map(f).join(' ');
        let s = `<polygon points="${pts}" fill="${FILL}" stroke="none"/>`;
        s += lijnSVG(v3, v0, STROKE, SW);
        s += lijnSVG(v1, v2, STROKE, SW);
        s += lijnSVG(v2, v3, STROKE, SW);
        s += lijnSVG(v0, v1, STROKE, SW, 'stroke-dasharray="10,6"');
        return s;
    }

    function hlLijn(A, B) { return lijnSVG(A, B, HL_C, HL_W); }

    function hoogteFig(v, vanPunt) {
        const [v0, v1, v2, v3] = v;
        const F = voet(vanPunt, v3, v2);
        let s = basisFig(v);
        if (F.t < 0 || F.t > 1) {
            const uitmunt = F.t < 0 ? v3 : v2;
            const uD      = unit(uitmunt, F);
            const draEnd  = { x: F.x + uD.x * 14, y: F.y + uD.y * 14 };
            s += lijnSVG(uitmunt, draEnd, '#aaa', 1.5, 'stroke-dasharray="7,4"');
        }
        s += hlLijn(vanPunt, F);
        s += hoek(vanPunt, F, vanPunt === v0 ? v1 : v0);
        s += hoek(F, vanPunt, v2);
        return s;
    }

    // Bouw SVG-inhoud voor variatie i (1–6)
    function bouwVar(i, v) {
        const [v0, v1, v2, v3] = v;
        if (i === 1) return basisFig(v) + hlLijn(v1, v2);
        if (i === 2 || i === 3) {
            const d02 = Math.hypot(v2.x - v0.x, v2.y - v0.y);
            const d13 = Math.hypot(v3.x - v1.x, v3.y - v1.y);
            const kort = d02 < d13 ? [v0, v2] : [v1, v3];
            const lang = d02 < d13 ? [v1, v3] : [v0, v2];
            return basisFig(v) + hlLijn(...(i === 2 ? kort : lang));
        }
        if (i === 4) {
            const P = { x: v0.x + 0.15 * (v1.x - v0.x), y: v0.y + 0.15 * (v1.y - v0.y) };
            const Q = { x: v3.x + 0.85 * (v2.x - v3.x), y: v3.y + 0.85 * (v2.y - v3.y) };
            return basisFig(v) + hlLijn(P, Q);
        }
        if (i === 5) return hoogteFig(v, v0);
        if (i === 6) return hoogteFig(v, v1);
    }

    function svgWrap(inner) {
        return `<svg width="${S}" height="${S}" overflow="visible"
            xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
    }

    // ── VRAGEN GENEREREN ──────────────────────────────────────
    // volgorde: shuffled array [0..5] (variatieindices, 0-gebaseerd)
    // juist: posities in volgorde waar variatieindex 4 of 5 staat (hoogte-variaties)
    function genVraag() {
        const verts    = genPara();
        const volgorde = shuffle([0, 1, 2, 3, 4, 5]);
        const juist    = [];
        volgorde.forEach((varIdx, pos) => {
            if (varIdx === 4 || varIdx === 5) juist.push(pos);
        });
        return { verts, volgorde, juist };
    }

    const vragen = Array.from({ length: TOTAAL }, genVraag);

    // ── STATE ─────────────────────────────────────────────────
    let huidigeVraag = 0;
    let totalePunten = 0;
    let pogingen     = 0;
    let geselecteerd = [];
    let geblokkeerd  = false;

    addCSS();
    render();

    // ── RENDER ────────────────────────────────────────────────
    function render() {
        if (huidigeVraag < TOTAAL) renderVraag(huidigeVraag);
        else finish();
    }

    function progressHTML() {
        const pct = (huidigeVraag / TOTAAL) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${huidigeVraag + 1} van ${TOTAAL}</span>
                    <span class="progress-score">Punten: <strong>${fmtPunten(totalePunten)}</strong>/${MAX_PUNTEN}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    function renderVraag(n) {
        pogingen     = 0;
        geselecteerd = [];
        geblokkeerd  = false;
        const vraag  = vragen[n];

        const kaarten = vraag.volgorde.map((varIdx, pos) =>
            `<div class="hp57-kaart" data-pos="${pos}">
                ${svgWrap(bouwVar(varIdx + 1, vraag.verts))}
            </div>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">
                        De basis van het parallellogram is in streeplijn getekend.<br>
                        Duid alle figuren aan waarbij het rode lijnstuk de hoogte voorstelt.
                    </h3>
                    <div class="hp57-grid" id="hp57-grid">
                        ${kaarten}
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        container.querySelectorAll('.hp57-kaart').forEach(kaart => {
            kaart.addEventListener('click', () => {
                if (geblokkeerd) return;
                const pos = parseInt(kaart.dataset.pos, 10);
                const idx = geselecteerd.indexOf(pos);
                if (idx === -1) geselecteerd.push(pos);
                else geselecteerd.splice(idx, 1);
                updateKaartStijlen();
            });
        });

        document.getElementById('checkBtn').addEventListener('click', controleer);
    }

    function updateKaartStijlen(juistMarkeer) {
        const vraag = vragen[huidigeVraag];
        container.querySelectorAll('.hp57-kaart').forEach(kaart => {
            const pos = parseInt(kaart.dataset.pos, 10);
            kaart.classList.remove('hp57-geselecteerd', 'hp57-juist', 'hp57-fout');
            if (juistMarkeer) {
                if (vraag.juist.includes(pos))        kaart.classList.add('hp57-juist');
                else if (geselecteerd.includes(pos))  kaart.classList.add('hp57-fout');
            } else {
                if (geselecteerd.includes(pos))       kaart.classList.add('hp57-geselecteerd');
            }
        });
        const grid = container.querySelector('.hp57-grid');
        if (grid) grid.classList.toggle('hp57-geblokkeerd', geblokkeerd);
    }

    // ── CONTROLEREN ───────────────────────────────────────────
    function controleer() {
        const vraag = vragen[huidigeVraag];
        const juist = geselecteerd.length === vraag.juist.length
            && vraag.juist.every(j => geselecteerd.includes(j));

        pogingen++;

        if (juist) {
            const punten = pogingen === 1 ? 1 : 0.5;
            totalePunten += punten;
            geblokkeerd   = true;
            document.getElementById('checkBtn').style.display = 'none';
            updateKaartStijlen();
            const label = pogingen === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${label}</p>
                    <button class="btn btn-primary" id="volgendeBtn">OK</button>
                </div>`;
            document.getElementById('volgendeBtn').addEventListener('click', () => {
                huidigeVraag++;
                render();
            });

        } else if (pogingen < 2) {
            // Eerste fout: specifieke hint op basis van selectie
            const juistGes = geselecteerd.filter(p =>  vraag.juist.includes(p));
            const foutGes  = geselecteerd.filter(p => !vraag.juist.includes(p));
            const tekst    = (juistGes.length === 1 && foutGes.length === 0)
                ? 'Er zijn meer juiste antwoorden.'
                : 'Je antwoord is niet juist.<br>Stel jezelf de vraag: hoe ligt de hoogte ten opzichte van de basis?';
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">${tekst}</p>
                </div>`;

        } else {
            // Tweede fout: juiste antwoorden aanduiden
            geblokkeerd = true;
            document.getElementById('checkBtn').style.display = 'none';
            updateKaartStijlen(true);
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Je antwoord is niet juist. De juiste antwoorden zijn aangeduid.</p>
                    <button class="btn btn-primary" id="volgendeBtn">OK</button>
                </div>`;
            document.getElementById('volgendeBtn').addEventListener('click', () => {
                huidigeVraag++;
                render();
            });
        }
    }

    // ── FINISH ────────────────────────────────────────────────
    function finish() {
        const score    = Math.round((totalePunten / MAX_PUNTEN) * 100);
        const xpEarned = Math.round((totalePunten / MAX_PUNTEN) * 50);
        onComplete({ score, correctAnswers: totalePunten, totalQuestions: MAX_PUNTEN, xpEarned });
    }

    // ── CSS ───────────────────────────────────────────────────
    function addCSS() {
        if (document.getElementById('ex57-style')) return;
        const s = document.createElement('style');
        s.id = 'ex57-style';
        s.textContent = `
.hp57-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 16px 0;
}
.hp57-kaart {
    border: 2.5px solid #ddd;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    text-align: center;
    background: white;
    transition: border-color 0.15s, background 0.15s;
    user-select: none;
}
.hp57-kaart:hover {
    border-color: #bbb;
    background: #f8f8f8;
}
.hp57-kaart.hp57-geselecteerd {
    border-color: var(--color-primary, #4a7a10);
    background: rgba(168, 212, 85, 0.2);
}
.hp57-kaart.hp57-juist {
    border-color: #27ae60;
    background: rgba(39, 174, 96, 0.12);
}
.hp57-kaart.hp57-fout {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.08);
}
.hp57-grid.hp57-geblokkeerd {
    pointer-events: none;
}
`;
        document.head.appendChild(s);
    }
}
