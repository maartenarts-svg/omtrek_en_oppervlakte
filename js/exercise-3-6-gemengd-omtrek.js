'use strict';

function init36GemengdOmtrek(container, onComplete) {

    addCSS36();

    // ── CONSTANTS ────────────────────────────────────────────

    const UNITS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

    const FORMULA_OPTS = [
        { value: '',   html: '' },
        { value: 'f1', html: '<i>P</i> = 4<i>z</i>' },
        { value: 'f2', html: '<i>P</i> = 2(<i>b</i> + <i>h</i>)' },
        { value: 'f4', html: '<i>P</i> = 2π<i>r</i>' },
        { value: 'f3', html: '<i>P</i> = som van de zijden' }
    ];

    const CORRECT_FORMULA = {
        vierkant:       'f1',
        rechthoek:      'f2',
        ruit:           'f1',
        parallellogram: 'f3',
        trapezium:      'f3',
        vierhoek:       'f3',
        driehoek:       'f3',
        cirkel:         'f4'
    };

    const ALL_SHAPES    = ['vierkant', 'rechthoek', 'ruit', 'parallellogram', 'trapezium', 'vierhoek', 'driehoek', 'cirkel'];
    const TOTAL_QUESTIONS = 8;
    const MAX_POINTS      = 8;

    // ── STATE ────────────────────────────────────────────────

    const SHAPES_ORDER  = shuffle([...ALL_SHAPES]);
    const questions     = SHAPES_ORDER.map(genQuestion);
    let currentQ        = 0;   // 0 = voorbeeld, 1–8 = echte vragen
    let totalPoints     = 0;
    let docClickCleanup = null;

    render();

    // ── PROGRESS BAR ─────────────────────────────────────────

    function progressHTML() {
        const pct = ((currentQ - 1) / TOTAL_QUESTIONS) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQ} van ${TOTAL_QUESTIONS}</span>
                    <span class="progress-score">Punten: <strong>${fmtPoints(totalPoints)}</strong>/${MAX_POINTS}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    function fmtPoints(p) {
        return Number.isInteger(p) ? String(p) : p.toFixed(1);
    }

    // ── FEEDBACK HELPERS ─────────────────────────────────────

    function showFeedback(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
            </div>`;
    }

    function showFeedbackWithNext(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="nextBtn">OK</button>
            </div>`;
        document.getElementById('nextBtn').addEventListener('click', () => {
            currentQ++;
            render();
        });
    }

    function showFeedbackWithFinish(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="finishBtn">OK</button>
            </div>`;
        document.getElementById('finishBtn').addEventListener('click', finish);
    }

    // ── RENDER ───────────────────────────────────────────────

    function render() {
        if (currentQ === 0)                    renderExample();
        else if (currentQ <= TOTAL_QUESTIONS)  renderQuestion(currentQ);
        else                                   finish();
    }

    // ── VOORBEELD ────────────────────────────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de omtrek.</h3>
                    <div class="ex33-fig" id="ex33-fig"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de formule.</li>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening zonder eenheden.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                            <li>Het antwoord wordt automatisch aangevuld.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>P</i> = som van de zijden</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">3 + 4 + 5</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">12</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is <strong>12</strong> cm.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex33-fig'), 'driehoek', {
            factor: 1, rotation: 0,
            zijden: [
                { value: 3, unit: 'cm' },
                { value: 4, unit: 'cm' },
                { value: 5, unit: 'cm' }
            ]
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const data    = questions[n - 1];
        let qAttempts = 0;
        const isCirkel = data.type === 'cirkel';

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html || '&mdash;'}</div>`
        ).join('');

        const unitOptsHtml = `<option value="">—</option>` +
            UNITS.map(u => `<option value="${u}">${u}</option>`).join('');

        const isLast = n === TOTAL_QUESTIONS;

        const hintText = isCirkel
            ? 'Tip: typ <kbd>*</kbd> voor het maalteken &middot; &nbsp;|&nbsp; typ <kbd>pi</kbd> voor π'
            : 'Tip: typ <kbd>*</kbd> om het maalteken &middot; in te voegen.';

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${isCirkel ? `Bereken de omtrek op 0,01 ${data.unit} nauwkeurig.` : 'Bereken de omtrek.'}</h3>
                    <div class="ex33-fig" id="ex33-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-cs" id="ex33-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex33-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <input id="ex33-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>${isCirkel ? '&asymp;' : '='}</span>
                            <input id="ex33-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is
                            <span id="ex33-ans-disp" class="ex33-val">...</span>
                            <span id="ex33-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">${hintText}</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex33-fig'), data.type, data.figOpts);
        initCS('ex33-cs');

        // Auto-fill rij 3
        function updateRow3() {
            const ans  = document.getElementById('ex33-ans').value.trim();
            const unit = document.getElementById('ex33-unit').value;
            document.getElementById('ex33-ans-disp').textContent  = ans  || '...';
            document.getElementById('ex33-unit-disp').textContent = unit || '...';
        }
        document.getElementById('ex33-ans').addEventListener('input', updateRow3);
        document.getElementById('ex33-unit').addEventListener('change', updateRow3);

        // * → · in berekeningsveld
        const calcEl = document.getElementById('ex33-calc');
        calcEl.addEventListener('keydown', e => {
            if (e.key !== '*') return;
            e.preventDefault();
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
        });

        // pi → π (alleen relevant voor cirkel, maar onschadelijk voor andere vragen)
        if (isCirkel) {
            calcEl.addEventListener('input', () => {
                const old = calcEl.value;
                const newVal = old.replace(/pi/gi, 'π');
                if (newVal !== old) {
                    const piCount = (old.match(/pi/gi) || []).length;
                    const cursor = calcEl.selectionStart;
                    calcEl.value = newVal;
                    calcEl.selectionStart = calcEl.selectionEnd = Math.max(0, cursor - piCount);
                }
            });
        }

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const correct = checkQuestion(data);
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;

            if (correct) {
                const pts   = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                const label = qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', label);
            } else if (qAttempts < 2) {
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('incorrect', 'Niet correct. Geen punt voor deze vraag.');
            }
        });
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function checkQuestion(data) {
        const formula = document.getElementById('ex33-cs').dataset.value || '';
        const unit    = document.getElementById('ex33-unit').value;
        const calc    = document.getElementById('ex33-calc').value.trim();
        const ans     = document.getElementById('ex33-ans').value.trim();
        return formula === data.formula
            && unit    === data.unit
            && checkCalc(data, calc)
            && checkAnswer(data, ans);
    }

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/\*/g, '·').replace(/\s+/g, '');
    }

    function checkCalc(data, input) {
        const n = normalizeCalc(input);
        const { type, dims } = data;

        if (type === 'vierkant' || type === 'ruit') {
            const m = n.match(/^4·(.+)$/);
            if (!m) return false;
            const v = parseFloat(m[1]);
            return !isNaN(v) && Math.abs(v - dims.z) < 0.001;
        }

        if (type === 'rechthoek') {
            const m = n.match(/^2·\((.+)\+(.+)\)$/);
            if (!m) return false;
            const x = parseFloat(m[1]), y = parseFloat(m[2]);
            if (isNaN(x) || isNaN(y)) return false;
            return (Math.abs(x - dims.b) < 0.001 && Math.abs(y - dims.h) < 0.001)
                || (Math.abs(x - dims.h) < 0.001 && Math.abs(y - dims.b) < 0.001);
        }

        if (type === 'cirkel') {
            // Accepteer: 2·π·r, 2·r·π, π·2·r, π·r·2, r·2·π, r·π·2
            const parts = n.split('·');
            if (parts.length !== 3) return false;
            const hasPi = parts.some(p => p === 'π');
            const has2  = parts.some(p => p === '2');
            const rPart = parts.find(p => p !== 'π' && p !== '2');
            if (!hasPi || !has2 || !rPart) return false;
            const v = parseFloat(rPart);
            return !isNaN(v) && Math.abs(v - dims.r) < 0.001;
        }

        // P = som van de zijden
        const sides = type === 'parallellogram'
            ? [dims.basis, dims.zijde, dims.basis, dims.zijde]
            : dims.sides;

        const parts = n.split('+').map(p => parseFloat(p));
        if (parts.some(isNaN) || parts.length !== sides.length) return false;
        const si = [...parts].sort((a, b) => a - b);
        const se = [...sides].sort((a, b) => a - b);
        return si.every((v, i) => Math.abs(v - se[i]) < 0.001);
    }

    function checkAnswer(data, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        const tol = data.type === 'cirkel' ? 0.005 : 0.05;
        return !isNaN(n) && Math.abs(n - data.answer) < tol;
    }

    // ── CUSTOM SELECT ────────────────────────────────────────

    function initCS(id) {
        const sel     = document.getElementById(id);
        const display = sel.querySelector('.ex33-cs-display');
        const list    = sel.querySelector('.ex33-cs-list');

        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        docClickCleanup = () => { if (list) list.hidden = true; };
        document.addEventListener('click', docClickCleanup);

        display.addEventListener('click', e => {
            e.stopPropagation();
            list.hidden = !list.hidden;
        });

        sel.querySelectorAll('.ex33-cs-opt').forEach(opt => {
            opt.addEventListener('click', e => {
                e.stopPropagation();
                sel.dataset.value = opt.dataset.value;
                display.innerHTML = opt.innerHTML || '&mdash;';
                list.hidden       = true;
            });
        });
    }

    // ── DATA GENERATIE ───────────────────────────────────────

    function genQuestion(type) {
        const unit     = randomFrom(UNITS);
        const rotation = Math.floor(Math.random() * 72) * 5;
        let dims, figOpts, answer;

        switch (type) {
            case 'vierkant': {
                const z = randomDim();
                dims    = { z };
                figOpts = { factor: 1, rotation, zijde: { value: z, unit } };
                answer  = round1(4 * z);
                break;
            }
            case 'rechthoek': {
                const b = randomDim(), h = randomDim();
                dims    = { b, h };
                figOpts = { factor: 1, rotation, breedte: { value: b, unit }, hoogte: { value: h, unit } };
                answer  = round1(2 * (b + h));
                break;
            }
            case 'ruit': {
                const z = randomDim();
                dims    = { z };
                figOpts = { factor: 1, rotation, zijde: { value: z, unit } };
                answer  = round1(4 * z);
                break;
            }
            case 'parallellogram': {
                const basis = randomDim(), zijde = randomDim();
                dims    = { basis, zijde };
                figOpts = { factor: 1, rotation, basis: { value: basis, unit }, zijde: { value: zijde, unit } };
                answer  = round1(2 * (basis + zijde));
                break;
            }
            case 'trapezium': {
                const sides = [randomDim(), randomDim(), randomDim(), randomDim()];
                dims    = { sides };
                figOpts = { factor: 1, rotation, zijden: sides.map(v => ({ value: v, unit })) };
                answer  = round1(sides.reduce((s, v) => s + v, 0));
                break;
            }
            case 'vierhoek': {
                const sides = [randomDim(), randomDim(), randomDim(), randomDim()];
                dims    = { sides };
                figOpts = { factor: 1, rotation, zijden: sides.map(v => ({ value: v, unit })) };
                answer  = round1(sides.reduce((s, v) => s + v, 0));
                break;
            }
            case 'driehoek': {
                const sides = genTriangle();
                dims    = { sides };
                figOpts = { factor: 1, rotation, zijden: sides.map(v => ({ value: v, unit })) };
                answer  = round1(sides.reduce((s, v) => s + v, 0));
                break;
            }
            case 'cirkel': {
                const r = randomFrom([3, 4, 5, 6, 7, 8, 9, 10]);
                dims    = { r };
                figOpts = { factor: 1, straal: { value: r, unit } };
                answer  = Math.round(2 * Math.PI * r * 100) / 100;
                break;
            }
        }

        return { type, unit, dims, figOpts, formula: CORRECT_FORMULA[type], answer };
    }

    function genTriangle() {
        const a = dimSmall(), b = dimSmall();
        const minC = Math.abs(a - b) + 1;
        const maxC = a + b - 1;
        if (maxC <= minC) return genTriangle();
        return [a, b, minC + Math.floor(Math.random() * (maxC - minC + 1))];
    }

    // ── AFRONDEN ─────────────────────────────────────────────

    function round1(n) { return Math.round(n * 10) / 10; }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 60);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function randomDim() {
        if (Math.random() < 0.6) return Math.floor(Math.random() * 98) + 2;
        return (Math.floor(Math.random() * 888) + 12) / 10;
    }

    function dimSmall() { return Math.floor(Math.random() * 28) + 3; }

    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS36() {
        // Hergebruik ex33-stijlen als die al geladen zijn
        if (document.getElementById('ex33-style') || document.getElementById('ex36-style')) return;
        const s = document.createElement('style');
        s.id = 'ex36-style';
        s.textContent = `
.ex33-badge {
    display: inline-block; background: var(--color-primary, #4a7a10);
    color: #fff; font-size: 0.78rem; font-weight: 600;
    padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem;
}
.ex33-fig { display: flex; justify-content: center; min-height: 200px; margin: var(--spacing-lg, 1rem) 0; }
.ex33-stepplan {
    background: var(--color-light, #f0f7e0); border-radius: var(--radius-md, 8px);
    padding: var(--spacing-md, 0.75rem) var(--spacing-lg, 1rem);
    margin: var(--spacing-lg, 1rem) 0; font-size: var(--font-size-base, 0.95rem);
}
.ex33-stepplan strong { display: block; margin-bottom: 0.35rem; }
.ex33-stepplan ol { margin: 0; padding-left: 1.25rem; }
.ex33-stepplan li { margin: 0.2rem 0; }
.ex33-rows { display: flex; flex-direction: column; gap: var(--spacing-md, 0.65rem); margin: var(--spacing-lg, 1rem) 0; }
.ex33-row { display: flex; align-items: center; gap: var(--spacing-sm, 0.5rem); flex-wrap: wrap; }
.ex33-row-calc { flex-wrap: nowrap; overflow-x: auto; }
.ex33-label { font-size: var(--font-size-base, 0.95rem); white-space: nowrap; }
.ex33-p-label { font-size: var(--font-size-base, 0.95rem); white-space: nowrap; }
.ex33-eg-field {
    padding: 0.35rem 0.6rem; background: #f0f0f0;
    border: 2px solid var(--color-gray, #ccc); border-radius: var(--radius-md, 6px);
    font-size: var(--font-size-base, 0.95rem); color: #444;
    min-height: 1.8rem; display: flex; align-items: center;
}
.ex33-eg-unit { min-width: 36px; }
.ex33-eg-calc { min-width: 90px; }
.ex33-eg-ans  { min-width: 36px; }
.ex33-cs { position: relative; display: inline-block; min-width: 220px; }
.ex33-cs-display {
    padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); cursor: pointer; background: #fff;
    font-size: var(--font-size-base, 0.95rem); min-height: 1.8rem;
    display: flex; align-items: center; user-select: none;
}
.ex33-cs-display:hover { border-color: var(--color-primary, #4a7a10); }
.ex33-cs-list {
    position: absolute; top: calc(100% + 2px); left: 0; right: 0;
    background: #fff; border: 2px solid var(--color-primary, #4a7a10);
    border-radius: var(--radius-md, 6px); z-index: 200;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
}
.ex33-cs-opt {
    padding: 0.45rem 0.6rem; cursor: pointer;
    font-size: var(--font-size-base, 0.95rem); min-height: 1.8rem;
    display: flex; align-items: center;
}
.ex33-cs-opt:hover { background: var(--color-light, #f0f7e0); }
.ex33-unit {
    padding: 0.35rem 0.3rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 58px;
}
.ex33-calc {
    padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 130px;
}
.ex33-ans {
    padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 60px;
}
.ex33-sentence { font-size: var(--font-size-base, 1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary, #4a7a10); }
`;
        document.head.appendChild(s);
    }
}
