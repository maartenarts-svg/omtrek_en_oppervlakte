'use strict';

function init51InstapOppervlakte(container, onComplete) {

    // ── CONSTANTEN ───────────────────────────────────────────
    const GRID       = 10;
    const CEL        = 40;
    const TOTAAL     = 8;
    const MAX_PUNTEN = 8;

    // ── HULPFUNCTIES ─────────────────────────────────────────
    function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function maakRechthoek() {
        let w, h;
        do { w = ri(2, 8); h = ri(2, 8); } while (w === h);
        return { w, h, x: ri(1, 9 - w), y: ri(1, 9 - h) };
    }

    function maakVierkant() {
        const z = ri(2, 8);
        return { w: z, h: z, x: ri(1, 9 - z), y: ri(1, 9 - z) };
    }

    // ── VRAGEN GENEREREN ─────────────────────────────────────
    const vragen = [
        ...shuffle(['rechthoek', 'rechthoek', 'vierkant', 'vierkant']).map(type => ({
            fase: 'rooster', type, fig: type === 'rechthoek' ? maakRechthoek() : maakVierkant()
        })),
        ...shuffle(['rechthoek', 'rechthoek', 'vierkant', 'vierkant']).map(type => ({
            fase: 'tekst', type, fig: type === 'rechthoek' ? maakRechthoek() : maakVierkant()
        }))
    ];

    // ── STATE ────────────────────────────────────────────────
    let huidigeVraag = 0;
    let totalePunten = 0;
    let pogingen     = 0;

    addCSS();
    render();

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

    function fmtPunten(p) { return Number.isInteger(p) ? String(p) : p.toFixed(1); }

    function renderVraag(n) {
        pogingen = 0;
        const vraag     = vragen[n];
        const isLaatste = n === TOTAAL - 1;

        let vraagHTML;
        if (vraag.fase === 'rooster') {
            vraagHTML = `
                <h3 class="question-title">Bereken de oppervlakte.</h3>
                <div class="rooster-container">
                    <div class="rooster-canvas">${svgRooster(vraag.fig, false)}</div>
                    <div class="rooster-input-area">
                        <span class="rooster-label"><i>A</i> =</span>
                        <input id="ex51-input" type="number" class="rooster-answer-input" style="width:120px"
                               min="1" step="1" autocomplete="off" autofocus>
                    </div>
                </div>`;
        } else {
            const tekst = vraag.type === 'rechthoek'
                ? `Een rechthoek heeft een zijde van <strong>${vraag.fig.w}</strong> roostervakjes
                   en een zijde van <strong>${vraag.fig.h}</strong> roostervakjes.<br>
                   Bereken de oppervlakte van de rechthoek.`
                : `Een vierkant heeft een zijde van <strong>${vraag.fig.w}</strong> roostervakjes.<br>
                   Bereken de oppervlakte van het vierkant.`;
            vraagHTML = `
                <h3 class="question-title">Bereken de oppervlakte.</h3>
                <p class="ex51-tekstvraag">${tekst}</p>
                <div class="rooster-input-area ex51-invoer-tekst">
                    <span class="rooster-label"><i>A</i> =</span>
                    <input id="ex51-input" type="number" class="rooster-answer-input" style="width:120px"
                           min="1" step="1" autocomplete="off" autofocus>
                </div>`;
        }

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    ${vraagHTML}
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('ex51-input').addEventListener('keypress', e => {
            if (e.key === 'Enter') controleer(vraag, isLaatste);
        });
        document.getElementById('checkBtn').addEventListener('click', () => controleer(vraag, isLaatste));
    }

    // ── CONTROLEREN ──────────────────────────────────────────
    function controleer(vraag, isLaatste) {
        const input  = document.getElementById('ex51-input');
        const waarde = parseInt(input.value, 10);
        if (isNaN(waarde) || waarde < 1) return;

        const juist = waarde === vraag.fig.w * vraag.fig.h;
        pogingen++;

        if (juist) {
            const punten = pogingen === 1 ? 1 : 0.5;
            totalePunten += punten;
            const label  = pogingen === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            document.getElementById('checkBtn').style.display = 'none';
            input.disabled = true;
            toonFeedback('correct', label, vraag.fig, isLaatste, true);
        } else if (pogingen < 2) {
            toonFeedback('incorrect', 'Niet juist. Probeer nog een keer.', null, false, false);
        } else {
            document.getElementById('checkBtn').style.display = 'none';
            input.disabled = true;
            toonFeedback('incorrect',
                `Niet correct. Het juiste antwoord is ${vraag.fig.w * vraag.fig.h}.`,
                vraag.fig, isLaatste, true);
        }
    }

    function toonFeedback(type, tekst, fig, isLaatste, metKnop) {
        const figHTML  = fig ? `<div class="rooster-canvas" style="margin-top:var(--spacing-md,0.75rem)">${svgRooster(fig, true)}</div>` : '';
        const knopHTML = metKnop
            ? `<button class="btn btn-primary" id="volgendeBtn">OK</button>`
            : '';

        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${tekst}</p>
                ${figHTML}
                ${knopHTML}
            </div>`;

        if (metKnop) {
            document.getElementById('volgendeBtn').addEventListener('click', () => {
                huidigeVraag++;
                render();
            });
        }
    }

    // ── SVG ──────────────────────────────────────────────────
    function svgRooster(fig, feedback) {
        const size  = (GRID + 1) * CEL;
        const unitY = GRID * CEL + 15;
        const fx = fig.x * CEL, fy = fig.y * CEL;
        const fw = fig.w * CEL, fh = fig.h * CEL;

        let svg = `<svg class="rooster-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

        for (let i = 0; i <= GRID; i++) {
            const p = i * CEL;
            svg += `<line x1="${p}" y1="0" x2="${p}" y2="${size}" stroke="#ddd" stroke-width="1"/>`;
            svg += `<line x1="0" y1="${p}" x2="${size}" y2="${p}" stroke="#ddd" stroke-width="1"/>`;
        }

        if (!feedback) {
            svg += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"
                      fill="rgba(224,224,224,0.6)" stroke="#333" stroke-width="2"/>`;
        } else {
            svg += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"
                      fill="rgba(168,216,229,0.6)" stroke="#6B9BD1" stroke-width="3"/>`;

            const off  = 18;
            const cx   = fx + fw / 2;
            const cy   = fy + fh / 2;
            const area = fig.w * fig.h;

            const lbl = (x, y, t) =>
                `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
                       font-size="15" font-weight="700" fill="#1a5276">${t}</text>`;

            svg += lbl(cx,           fy - off,      fig.w);
            svg += lbl(cx,           fy + fh + off, fig.w);
            svg += lbl(fx - off,     cy,            fig.h);
            svg += lbl(fx + fw + off, cy,           fig.h);
            svg += lbl(cx, cy - 12, `${fig.w} · ${fig.h}`);
            svg += lbl(cx, cy + 12, `= ${area}`);
        }

        svg += `
            <line x1="${CEL}" y1="${unitY}" x2="${CEL*2}" y2="${unitY}" stroke="#333" stroke-width="2"/>
            <line x1="${CEL}" y1="${unitY-5}" x2="${CEL}" y2="${unitY+5}" stroke="#333" stroke-width="2"/>
            <line x1="${CEL*2}" y1="${unitY-5}" x2="${CEL*2}" y2="${unitY+5}" stroke="#333" stroke-width="2"/>
            <text x="${CEL*1.5}" y="${unitY+18}" text-anchor="middle" font-size="12" fill="#333">1 eenheid</text>`;

        svg += `</svg>`;
        return svg;
    }

    // ── FINISH ───────────────────────────────────────────────
    function finish() {
        const score    = Math.round((totalePunten / MAX_PUNTEN) * 100);
        const xpEarned = Math.round((totalePunten / MAX_PUNTEN) * 40);
        onComplete({ score, correctAnswers: totalePunten, totalQuestions: MAX_PUNTEN, xpEarned });
    }

    // ── CSS ──────────────────────────────────────────────────
    function addCSS() {
        if (document.getElementById('ex51-style')) return;
        const s = document.createElement('style');
        s.id = 'ex51-style';
        s.textContent = `
.ex51-tekstvraag {
    font-size: var(--font-size-base, 1rem); line-height: 1.6;
    background: var(--color-light, #f0f7e0); border-radius: var(--radius-md, 8px);
    padding: var(--spacing-lg, 1rem); margin: var(--spacing-lg, 1rem) 0;
}
.ex51-invoer-tekst { margin-top: var(--spacing-lg, 1rem); }
`;
        document.head.appendChild(s);
    }
}
