'use strict';

function init54OppervlakteRechthoek(container, onComplete) {

    addCSS54();

    // ── CONSTANTS ────────────────────────────────────────────

    const GEN_UNITS = ['m', 'dm', 'cm', 'mm'];

    const FORMULA_OPTS = [
        { value: '',    html: '' },
        { value: 'fA1', html: '<i>A</i> = <i>bh</i>' },
        { value: 'fA2', html: '<i>A</i> = <i>z</i>²' }
    ];

    const UNIT_OPTS = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];

    const TOTAL_QUESTIONS = 4;
    const MAX_POINTS      = 4;

    // ── STATE ────────────────────────────────────────────────

    const types     = shuffle(['vierkant', 'vierkant', 'rechthoek', 'rechthoek']);
    const questions = types.map(genQuestion);
    let currentQ        = 0;
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

    function buildFeedbackHTML(items) {
        return `<p class="feedback-text">Dit klopt niet helemaal. Verbeter.<br>Bekijk de lijst hieronder voor meer informatie.</p>
                <ul class="ex54-feedback-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    function showFeedback(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">${buildFeedbackHTML(items)}</div>`;
    }

    function showFeedbackWithNext(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${items[0]}</p>
                <button class="btn btn-primary" id="nextBtn">OK</button>
            </div>`;
        document.getElementById('nextBtn').addEventListener('click', () => {
            currentQ++;
            render();
        });
    }

    function showFeedbackWithFinish(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${items[0]}</p>
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
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex54-fig"></div>
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
                            <div class="ex33-eg-field"><i>A</i> = <i>bh</i></div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm²</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">3·4</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">12</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong>12</strong> cm².
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex54-fig'), 'rechthoek', {
            factor: 1, rotation: 0,
            breedte: { value: 3, unit: 'cm' },
            hoogte:  { value: 4, unit: 'cm' }
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
        const isLast  = n === TOTAL_QUESTIONS;

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html || '&mdash;'}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u ? u.replace('²', '²') : '—'}</option>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex54-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-cs" id="ex54-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex54-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <input id="ex54-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex54-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is
                            <span id="ex54-ans-disp" class="ex33-val">...</span>
                            <span id="ex54-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>
                    <p class="hint-text">Tip: typ <kbd>*</kbd> voor het maalteken &middot;</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex54-fig'), data.type, data.figOpts);
        initCS('ex54-cs');

        // Auto-fill antwoordzin
        const ansEl  = document.getElementById('ex54-ans');
        const unitEl = document.getElementById('ex54-unit');
        function updateRow3() {
            document.getElementById('ex54-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex54-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        // * → · in berekeningsveld
        const calcEl = document.getElementById('ex54-calc');
        calcEl.addEventListener('keydown', e => {
            if (e.key !== '*') return;
            e.preventDefault();
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
        });

        // ²-knop
        document.getElementById('squaredBtn').addEventListener('click', () => {
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.slice(0, s) + '²' + calcEl.value.slice(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
            calcEl.focus();
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const formula = document.getElementById('ex54-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(data, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                const label = qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', [label]);
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(data);
                showWithAction('incorrect', ['Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.']);
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(data) {
        const cs      = document.getElementById('ex54-cs');
        const display = cs.querySelector('.ex33-cs-display');
        cs.dataset.value  = data.formula;
        display.innerHTML = FORMULA_OPTS.find(o => o.value === data.formula).html;

        const unitEl = document.getElementById('ex54-unit');
        unitEl.value = data.unit + '²';

        const calcEl = document.getElementById('ex54-calc');
        calcEl.value = data.type === 'vierkant'
            ? `${data.dims.z}²`
            : `${data.dims.b}·${data.dims.h}`;

        const ansEl = document.getElementById('ex54-ans');
        ansEl.value = String(data.answer);

        document.getElementById('ex54-ans-disp').textContent  = String(data.answer);
        document.getElementById('ex54-unit-disp').textContent = data.unit + '²';
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(data, formula, unit, calc, ans) {
        const errors = [];

        if (formula !== data.formula) {
            errors.push('Je hebt de foute formule gekozen.');
        }

        const correctUnit = data.unit + '²';
        if (unit !== correctUnit) {
            if (unit.includes('²')) {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            } else {
                errors.push('Voor oppervlakte gebruik je een eenheid met ². Jij koos een eenheid die je gebruikt bij afstand of omtrek.');
            }
        }

        const calcOk = checkCalc(data, calc);
        if (!calcOk) {
            errors.push('Je hebt de berekening niet correct opgeschreven.');
        }

        if (!checkAnswer(data, ans)) {
            if (calcOk) {
                errors.push('Je hebt niet goed uitgerekend. Je mag ICT gebruiken.');
            } else {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s
            .replace(/,/g, '.')
            .replace(/\*/g, '·')
            .replace(/\s+/g, '');
    }

    function checkCalc(data, input) {
        const n = normalizeCalc(input);
        const { type, dims } = data;

        if (type === 'vierkant') {
            const m = n.match(/^(\d+\.?\d*)²$/);
            if (!m) return false;
            return Math.abs(parseFloat(m[1]) - dims.z) < 0.001;
        }

        if (type === 'rechthoek') {
            const m = n.match(/^(.+)·(.+)$/);
            if (!m) return false;
            const x = parseFloat(m[1]), y = parseFloat(m[2]);
            if (isNaN(x) || isNaN(y)) return false;
            return (Math.abs(x - dims.b) < 0.001 && Math.abs(y - dims.h) < 0.001)
                || (Math.abs(x - dims.h) < 0.001 && Math.abs(y - dims.b) < 0.001);
        }

        return false;
    }

    function checkAnswer(data, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - data.answer) < 0.05;
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
        const unit     = randomFrom(GEN_UNITS);
        const rotation = Math.floor(Math.random() * 72) * 5;
        let dims, figOpts, answer;

        if (type === 'vierkant') {
            const z = randomDim();
            dims    = { z };
            figOpts = { factor: 1, rotation, zijde: { value: z, unit } };
            answer  = round2(z * z);
        } else {
            let b = randomDim(), h = randomDim();
            while (Math.abs(b - h) < 0.5) h = randomDim();
            dims    = { b, h };
            figOpts = { factor: 1, rotation, breedte: { value: b, unit }, hoogte: { value: h, unit } };
            answer  = round2(b * h);
        }

        return {
            type,
            unit,
            dims,
            figOpts,
            formula: type === 'vierkant' ? 'fA2' : 'fA1',
            answer
        };
    }

    function round2(n) { return Math.round(n * 100) / 100; }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 60);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function randomDim() {
        return randomFrom([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 2.5, 3.5, 4.5, 5.5]);
    }

    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS54() {
        if (document.getElementById('ex33-style') || document.getElementById('ex36-style') || document.getElementById('ex54-style')) return;
        const s = document.createElement('style');
        s.id = 'ex54-style';
        s.textContent = `
.ex33-badge {
    display: inline-block; background: var(--color-primary, #4a7a10);
    color: #fff; font-size: 0.78rem; font-weight: 600;
    padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem;
}
.ex54-subtitle { font-size: var(--font-size-base, 0.95rem); color: #555; margin: -0.25rem 0 0.5rem; }
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
.ex33-cs { position: relative; display: inline-block; min-width: 180px; }
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
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 68px;
}
.ex33-calc {
    padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 130px;
}
.ex33-ans {
    padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); width: 70px;
}
.ex33-sentence { font-size: var(--font-size-base, 1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary, #4a7a10); }
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 1.2rem; padding: 0; }
.ex54-feedback-list li { margin: 0.2rem 0; }
.squared-helper {
    display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    margin-bottom: 1rem; padding: 0.75rem 1rem;
    background: #f0f7ff; border-radius: var(--radius-md, 8px); border: 1px solid #d0e4f7;
    font-size: var(--font-size-base, 0.95rem);
}
.squared-insert-btn {
    background: #2c2c2c; color: #fff; border: 1px solid #111; border-bottom: 3px solid #000;
    border-radius: 5px; padding: 0.2rem 0.6rem; cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,.35);
    display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 0;
}
.squared-insert-btn .key-top { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
.hint-text { font-size: var(--font-size-small, 0.85rem); color: #666; margin: 0 0 var(--spacing-md, 0.75rem) 0; }
`;
        document.head.appendChild(s);
    }
}
