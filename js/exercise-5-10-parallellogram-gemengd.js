'use strict';

function init510ParallellogramGemengd(container, onComplete) {

    addCSS510();

    // ── CONSTANTS ────────────────────────────────────────────

    const SIN_A = 90 / Math.sqrt(45 * 45 + 90 * 90);

    const GEN_UNITS = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];

    const FORMULA_OPTS = [
        { value: '',   html: '' },
        { value: 'fP', html: 'som van de zijden' },
        { value: 'fA', html: '<i>bh</i>' }
    ];

    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // ── STATE ────────────────────────────────────────────────

    const types     = shuffle(['omtrek', 'omtrek', 'oppervlakte', 'oppervlakte']);
    const questions = types.map(t => genQuestion(t));
    let currentQ    = 0;
    let totalPoints = 0;
    let docClickCleanup = null;

    render();

    // ── PROGRESS BAR ─────────────────────────────────────────

    function progressHTML() {
        const pct = ((currentQ - 1) / TOTAL_Q) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQ} van ${TOTAL_Q}</span>
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
        if (currentQ === 0)           renderExample();
        else if (currentQ <= TOTAL_Q) renderQuestion(currentQ);
        else                          finish();
    }

    // ── VOORBEELD (omtrek) ───────────────────────────────────
    // basis=8 cm, zijde=6 cm → P = 8+6+8+6 = 28 cm

    function renderExample() {
        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html || '&mdash;'}</div>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de omtrek.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex510-fig-eg"></div>
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
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field">som van de zijden</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">8+6+8+6</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">28</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is <strong>28</strong> cm.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex510-fig-eg'), 'parallellogram-hoogte', {
            factor: 1, rotation: 0,
            basis:       { value: 8, unit: 'cm' },
            zijde:       { value: 6, unit: 'cm' },
            welkeHoogte: 'rechts'
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const data     = questions[n - 1];
        let qAttempts  = 0;
        const isLast   = n === TOTAL_Q;
        const isOmtrek = data.type === 'omtrek';

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html || '&mdash;'}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        const titleText    = isOmtrek ? 'Bereken de omtrek.' : 'Bereken de oppervlakte.';
        const pLabel       = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const sentenceWord = isOmtrek ? 'omtrek' : 'oppervlakte';
        const hintText     = isOmtrek
            ? 'Tip: gebruik <kbd>+</kbd> voor de som van de zijden.'
            : 'Tip: typ <kbd>*</kbd> voor het maalteken &middot;';

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${titleText}</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex510-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label">${isOmtrek ? '<i>P</i>' : '<i>A</i>'} =</span>
                            <div class="ex33-cs" id="ex510-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex510-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <input id="ex510-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex510-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De ${sentenceWord} is
                            <span id="ex510-ans-disp" class="ex33-val">...</span>
                            <span id="ex510-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">${hintText}</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex510-fig'), 'parallellogram-hoogte', data.figOpts);
        initCS('ex510-cs');

        const ansEl  = document.getElementById('ex510-ans');
        const unitEl = document.getElementById('ex510-unit');
        const calcEl = document.getElementById('ex510-calc');

        function updateRow3() {
            document.getElementById('ex510-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex510-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        if (!isOmtrek) {
            calcEl.addEventListener('keydown', e => {
                if (e.key !== '*') return;
                e.preventDefault();
                const s = calcEl.selectionStart, end = calcEl.selectionEnd;
                calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
                calcEl.selectionStart = calcEl.selectionEnd = s + 1;
            });
        }

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const formula = document.getElementById('ex510-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(data, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(data);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(data) {
        const cs      = document.getElementById('ex510-cs');
        const display = cs.querySelector('.ex33-cs-display');
        cs.dataset.value  = data.formula;
        display.innerHTML = FORMULA_OPTS.find(o => o.value === data.formula).html;

        const correctUnit = data.type === 'omtrek' ? data.unit : data.unit + '²';
        document.getElementById('ex510-unit').value = correctUnit;

        document.getElementById('ex510-calc').value = data.type === 'omtrek'
            ? `${data.b}+${data.z}+${data.b}+${data.z}`
            : `${data.b}·${data.h}`;

        const ansStr = String(data.answer);
        document.getElementById('ex510-ans').value             = ansStr;
        document.getElementById('ex510-ans-disp').textContent  = ansStr;
        document.getElementById('ex510-unit-disp').textContent = correctUnit;
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(data, formula, unit, calc, ans) {
        const errors   = [];
        const isOmtrek = data.type === 'omtrek';

        // Formule
        if (!formula) {
            errors.push('Kies een formule.');
        } else if (formula !== data.formula) {
            errors.push('De formule is niet juist. Lees de opgave aandachtig, zo weet je wat je moet berekenen. Wat is het hier? <i>Omtrek</i> (<i>P</i>) of <i>oppervlakte</i> (<i>A</i>)?');
        }

        // Eenheid
        if (!unit) {
            errors.push('Kies een eenheid.');
        } else if (isOmtrek) {
            if (unit.includes('²')) {
                errors.push('Voor omtrek gebruik je een lengte-eenheid, geen eenheid met ².');
            } else if (unit !== data.unit) {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        } else {
            if (!unit.includes('²')) {
                errors.push('Voor oppervlakte gebruik je een eenheid met ². Jij koos een eenheid die je gebruikt bij afstand of omtrek.');
            } else if (unit !== data.unit + '²') {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        }

        // Berekening
        const calcResult = isOmtrek
            ? checkCalcOmtrek(data, calc)
            : checkCalcOppervlakte(data, calc);

        if (!calcResult.ok) {
            if (calcResult.error === 'volgorde') {
                errors.push('Je hebt de berekening niet correct opgeschreven. Controleer de volgorde waarin je de getallen noteert.');
            } else if (calcResult.error === 'zijde-als-hoogte') {
                errors.push('De berekening is niet juist. Kijk goed naar de figuur: hoe lang is de hoogte van dit parallellogram?');
            } else {
                errors.push('Je hebt de berekening niet correct opgeschreven.');
            }
        }

        // Antwoord
        if (!checkAnswer(data, ans)) {
            if (calcResult.ok) {
                errors.push('Je hebt niet goed uitgerekend. Je mag ICT gebruiken.');
            } else if (calcResult.error === 'generic') {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function checkCalcOmtrek(data, input) {
        const n     = input.replace(/,/g, '.').replace(/\s+/g, '');
        const parts = n.split('+');
        if (parts.length !== 4) return { ok: false, error: 'generic' };
        const nums = parts.map(p => parseFloat(p));
        if (nums.some(isNaN)) return { ok: false, error: 'generic' };
        const expected = [data.b, data.b, data.z, data.z].sort((a, b) => a - b);
        const actual   = [...nums].sort((a, b) => a - b);
        if (expected.every((v, i) => Math.abs(v - actual[i]) < 0.05)) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcOppervlakte(data, input) {
        const n = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/\s+/g, '');
        const m = n.match(/^(.+)·(.+)$/);
        if (!m) return { ok: false, error: 'generic' };
        const x = parseFloat(m[1]);
        const y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };

        const bOk = Math.abs(x - data.b) < 0.05;
        const hOk = Math.abs(y - data.h) < 0.05;
        if (bOk && hOk) return { ok: true };

        if (Math.abs(x - data.h) < 0.05 && Math.abs(y - data.b) < 0.05) {
            return { ok: false, error: 'volgorde' };
        }
        if (bOk && Math.abs(y - data.z) < 0.05) {
            return { ok: false, error: 'zijde-als-hoogte' };
        }
        return { ok: false, error: 'generic' };
    }

    function checkAnswer(data, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - data.answer) < 0.05;
    }

    // ── DATA GENERATIE ───────────────────────────────────────

    function genQuestion(type) {
        const unit     = randomFrom(GEN_UNITS);
        const rotation = Math.floor(Math.random() * 72) * 5;
        const DIMS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
        let a, c;
        do {
            a = randomFrom(DIMS);
            c = randomFrom(DIMS);
        } while (a === c);
        const b = Math.max(a, c);
        const z = Math.min(a, c);
        const h      = computeHoogte(b, z);
        const answer = type === 'omtrek' ? round2(2 * b + 2 * z) : round2(b * h);
        return {
            type, unit, b, z, h, answer,
            formula: type === 'omtrek' ? 'fP' : 'fA',
            figOpts: { factor: 1, rotation, basis: { value: b, unit }, zijde: { value: z, unit } }
        };
    }

    function computeHoogte(b, z) {
        const hRaw     = z * SIN_A;
        const decimals = Math.max(nDec(b), nDec(z));
        return Math.round(hRaw * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    function nDec(v) {
        const s = String(Math.round(v * 10000) / 10000);
        const i = s.indexOf('.');
        return i === -1 ? 0 : s.length - i - 1;
    }

    function round2(n) { return Math.round(n * 100) / 100; }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 60);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
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

    // ── HELPERS ──────────────────────────────────────────────

    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────
    // Niet checken op ex59-style: dat bevat geen custom-select CSS.

    function addCSS510() {
        if (['ex33-style', 'ex36-style', 'ex54-style', 'ex510-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex510-style';
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
.ex33-cs { position: relative; display: inline-block; min-width: 210px; }
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
.hint-text { font-size: var(--font-size-small, 0.85rem); color: #666; margin: 0 0 var(--spacing-md, 0.75rem) 0; }
`;
        document.head.appendChild(s);
    }
}
