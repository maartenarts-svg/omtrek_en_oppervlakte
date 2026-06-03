'use strict';

function init55InstapParallellogram(container, onComplete) {

    // ── CONSTANTEN ───────────────────────────────────────────
    const GRID       = 10;
    const CEL        = 40;
    const SIZE       = (GRID + 1) * CEL;
    const TOTAAL     = 4;
    const MAX_PUNTEN = 4;

    const DRIEHOEK_FILL   = 'rgba(255,160,70,0.55)';
    const DRIEHOEK_STROKE = '#cc6600';

    // ── HULPFUNCTIES ─────────────────────────────────────────
    function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function fmtPunten(p) { return Number.isInteger(p) ? String(p) : p.toFixed(1); }

    // ── RANDOM GENERATIE ─────────────────────────────────────
    // Marge van 1 roostervakje bewaard voor labels bij laag 3.

    function maakType1Pos() {
        // e > 0: bovenzijde links, onderzijde rechts verschoven
        let a, b, c, d, e;
        do {
            e = ri(1, 3); a = ri(1, 5); b = ri(1, 6);
            c = ri(2, 5); d = ri(2, 5);
        } while (a + c + e > 9 || b + d > 9);
        return { type: 1, a, b, c, d, e };
    }

    function maakType1Neg() {
        // e < 0: onderzijde links verschoven
        let a, b, c, d, e;
        do {
            e = -ri(1, 3);
            a = ri(2 + Math.abs(e), 7); // a + e >= 2 voor labelruimte links
            b = ri(1, 6); c = ri(2, 5); d = ri(2, 5);
        } while (a + c > 9 || b + d > 9);
        return { type: 1, a, b, c, d, e };
    }

    function maakType2Pos() {
        // e > 0: rechterzijde naar beneden verschoven
        let a, b, c, d, e;
        do {
            e = ri(1, 3); a = ri(1, 6); b = ri(1, 5);
            c = ri(2, 5); d = ri(2, 5);
        } while (a + c > 9 || b + e + d > 9);
        return { type: 2, a, b, c, d, e };
    }

    function maakType2Neg() {
        // e < 0: rechterzijde naar boven verschoven
        let a, b, c, d, e;
        do {
            e = -ri(1, 3);
            b = ri(2 + Math.abs(e), 7); // b + e >= 2 voor labelruimte boven
            a = ri(1, 6); c = ri(2, 5); d = ri(2, 5);
        } while (a + c > 9 || b + d > 9);
        return { type: 2, a, b, c, d, e };
    }

    // ── VRAGEN ───────────────────────────────────────────────
    const vragen = shuffle([maakType1Pos(), maakType1Neg(), maakType2Pos(), maakType2Neg()]);

    // ── STATE ────────────────────────────────────────────────
    let huidigeVraag = 0;
    let totalePunten = 0;
    let pogingen     = 0;

    addCSS();
    render();

    // ── SVG LAGEN ────────────────────────────────────────────

    function parallPunten(v) {
        const { type, a, b, c, d, e } = v;
        return type === 1
            ? [[a, b], [a+c, b], [a+c+e, b+d], [a+e, b+d]]
            : [[a, b], [a+c, b+e], [a+c, b+e+d], [a, b+d]];
    }

    function driehoekPunten(v) {
        const { type, a, b, c, d, e } = v;
        return type === 1
            ? [[[a,b],[a+e,b],[a+e,b+d]], [[a+c,b],[a+c+e,b],[a+c+e,b+d]]]
            : [[[a,b],[a+c,b+e],[a,b+e]], [[a,b+d],[a+c,b+e+d],[a,b+e+d]]];
    }

    function pijlPunten(v) {
        const { type, a, b, c, d, e } = v;
        if (type === 1) {
            const ox = e > 0 ? 0.5 : -0.5;
            const A = [(2*a + e) / 2 + ox,       (2*b + d) / 2];
            const B = [(2*a + 2*c + e) / 2 + ox, (2*b + d) / 2];
            return e > 0 ? [A, B] : [B, A];
        }
        const oy = e > 0 ? 0.5 : -0.5;
        const C = [(2*a + c) / 2, (2*b + e) / 2 + oy];
        const D = [(2*a + c) / 2, (2*b + 2*d + e) / 2 + oy];
        return e > 0 ? [C, D] : [D, C];
    }

    function laag1SVG(v) {
        const pts = parallPunten(v).map(([x, y]) => `${x*CEL},${y*CEL}`).join(' ');
        return `<polygon points="${pts}" fill="rgba(224,224,224,0.6)" stroke="#333" stroke-width="2"/>`;
    }

    let _pijlId = 0;
    function laag2SVG(v) {
        const id = `ex55p${_pijlId++}`;
        const triangles = driehoekPunten(v).map(pts => {
            const p = pts.map(([x, y]) => `${x*CEL},${y*CEL}`).join(' ');
            return `<polygon points="${p}" fill="${DRIEHOEK_FILL}" stroke="${DRIEHOEK_STROKE}" stroke-width="2"/>`;
        }).join('');
        const outline = parallPunten(v).map(([x, y]) => `${x*CEL},${y*CEL}`).join(' ');
        const [van, naar] = pijlPunten(v);
        const x1 = van[0]*CEL, y1 = van[1]*CEL, x2 = naar[0]*CEL, y2 = naar[1]*CEL;
        return triangles
            + `<polygon points="${outline}" fill="none" stroke="#111" stroke-width="3"/>`
            + `<defs><marker id="${id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5"
                   orient="auto" markerUnits="userSpaceOnUse">
                   <polygon points="0 0,10 3.5,0 7" fill="#333"/>
               </marker></defs>`
            + `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                     stroke="#333" stroke-width="2.5" marker-end="url(#${id})"/>`;
    }

    function laag3SVG(v) {
        const { type, a, b, c, d, e } = v;
        const t = (x, y, val, anker) =>
            `<text x="${x*CEL}" y="${y*CEL}" text-anchor="${anker}"
                   dominant-baseline="central" font-size="15" font-weight="bold" fill="#333">${val}</text>`;
        if (type === 1) {
            return t(a + c/2 + e, b + d + 0.6, c, 'middle')
                 + t(e > 0 ? a+c+e+0.6 : a+e-0.6, b + d/2, d, e > 0 ? 'start' : 'end');
        }
        return t(a + c + 0.6, b + e + d/2, d, 'start')
             + t(a + c/2, e > 0 ? b+e+d+0.6 : b+e-0.6, c, 'middle');
    }

    function roosterSVG(v, metLaag2, metLaag3) {
        const unitY = GRID * CEL + 15;
        let svg = `<svg class="rooster-svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`;
        for (let i = 0; i <= GRID; i++) {
            const p = i * CEL;
            svg += `<line x1="${p}" y1="0" x2="${p}" y2="${SIZE}" stroke="#ddd" stroke-width="1"/>`;
            svg += `<line x1="0" y1="${p}" x2="${SIZE}" y2="${p}" stroke="#ddd" stroke-width="1"/>`;
        }
        svg += laag1SVG(v);
        if (metLaag2) svg += laag2SVG(v);
        if (metLaag3) svg += laag3SVG(v);
        svg += `<line x1="${CEL}" y1="${unitY}" x2="${CEL*2}" y2="${unitY}" stroke="#333" stroke-width="2"/>
                <line x1="${CEL}" y1="${unitY-5}" x2="${CEL}" y2="${unitY+5}" stroke="#333" stroke-width="2"/>
                <line x1="${CEL*2}" y1="${unitY-5}" x2="${CEL*2}" y2="${unitY+5}" stroke="#333" stroke-width="2"/>
                <text x="${CEL*1.5}" y="${unitY+18}" text-anchor="middle" font-size="12" fill="#333">1 eenheid</text>`;
        return svg + '</svg>';
    }

    // ── RENDER ───────────────────────────────────────────────
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
        pogingen = 0;
        const vraag = vragen[n];

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte met behulp van het rooster.</h3>
                    <div class="rooster-container">
                        <div class="rooster-canvas" id="ex55-canvas">${roosterSVG(vraag, false, false)}</div>
                        <div class="rooster-input-area" id="ex55-invoer">
                            <span class="rooster-label"><i>A</i> =</span>
                            <input id="ex55-input" type="number" class="rooster-answer-input" style="width:120px"
                                   min="1" step="1" autocomplete="off" autofocus>
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('ex55-input').addEventListener('keypress', ev => {
            if (ev.key === 'Enter') controleer(vraag);
        });
        document.getElementById('checkBtn').addEventListener('click', () => controleer(vraag));
    }

    // ── CONTROLEREN ──────────────────────────────────────────
    function controleer(vraag) {
        const input  = document.getElementById('ex55-input');
        const waarde = parseInt(input.value, 10);
        if (isNaN(waarde) || waarde < 1) return;

        const juist = waarde === vraag.c * vraag.d;
        pogingen++;

        if (juist) {
            const punten = pogingen === 1 ? 1 : 0.5;
            totalePunten += punten;
            document.getElementById('checkBtn').style.display = 'none';
            input.disabled = true;
            const label = pogingen === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${label}</p>
                    <button class="btn btn-primary" id="volgendeBtn">OK</button>
                </div>`;
            document.getElementById('volgendeBtn').addEventListener('click', () => { huidigeVraag++; render(); });

        } else if (pogingen < 2) {
            // Eerste fout: tip + figuur met laag 2, input blijft actief
            document.getElementById('ex55-canvas').innerHTML = roosterSVG(vraag, true, false);
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Je antwoord is niet juist. Verschuif een stukje van het parallellogram en probeer het nog eens.</p>
                </div>`;
            input.value = '';
            input.focus();

        } else {
            // Tweede fout: figuur met laag 1+2+3, formule naast figuur, OK knop
            document.getElementById('checkBtn').style.display = 'none';
            input.disabled = true;
            document.getElementById('ex55-canvas').innerHTML = roosterSVG(vraag, true, true);
            document.getElementById('ex55-invoer').innerHTML = `
                <p class="ex55-formule"><i>A</i> = ${vraag.c} · ${vraag.d} = ${vraag.c * vraag.d}</p>`;
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Je antwoord is niet juist.</p>
                    <button class="btn btn-primary" id="volgendeBtn">OK</button>
                </div>`;
            document.getElementById('volgendeBtn').addEventListener('click', () => { huidigeVraag++; render(); });
        }
    }

    // ── FINISH ───────────────────────────────────────────────
    function finish() {
        const score    = Math.round((totalePunten / MAX_PUNTEN) * 100);
        const xpEarned = Math.round((totalePunten / MAX_PUNTEN) * 40);
        onComplete({ score, correctAnswers: totalePunten, totalQuestions: MAX_PUNTEN, xpEarned });
    }

    // ── CSS ──────────────────────────────────────────────────
    function addCSS() {
        if (document.getElementById('ex55-style')) return;
        const s = document.createElement('style');
        s.id = 'ex55-style';
        s.textContent = `
.ex55-formule {
    font-size: var(--font-size-h2, 1.4rem);
    font-weight: 700;
    color: var(--color-dark, #222);
    margin: 0;
    line-height: 1.4;
}
`;
        document.head.appendChild(s);
    }
}
