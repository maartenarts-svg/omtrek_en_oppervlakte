'use strict';

function init83RuitGemengd(container, onComplete) {

    addCSS83();

    // ── CONSTANTS ────────────────────────────────────────────

    const UNIT_OPTS = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];

    const FORMULA_OPTS = [
        { value: '',   html: '&mdash;' },
        { value: 'fP', html: '4<i>z</i>' },
        { value: 'fA', html: '<i>d</i><sub>1</sub> <i>d</i><sub>2</sub>&nbsp;:&nbsp;2' }
    ];

    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // ── STATE ────────────────────────────────────────────────

    const taskTypes = shuffle(['omtrek', 'omtrek', 'oppervlakte', 'oppervlakte']);

    let currentQ        = 0;
    let totalPoints     = 0;
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

    function showFeedback(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">Dit klopt niet helemaal. Verbeter.<br>Bekijk de lijst hieronder voor meer informatie.</p>
                <ul class="ex54-feedback-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>
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
        if (currentQ === 0)           renderExample();
        else if (currentQ <= TOTAL_Q) renderQuestion(currentQ);
        else                          finish();
    }

    // ── VOORBEELD (omtrek) ───────────────────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de omtrek.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex83-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de formule.</li>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening zonder eenheden.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field">4<i>z</i></div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit" id="ex83-eg-unit"></div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc" id="ex83-eg-calc"></div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans" id="ex83-eg-ans"></div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is <strong id="ex83-eg-sentence-ans"></strong> <span id="ex83-eg-sentence-unit"></span>.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        const data = drawFiguur(document.getElementById('ex83-fig-eg'), 'ruit-diagonalen', { lengtes: true });
        const eenheid = data.eenheid;
        const z       = data.zLabel.value;
        const correctP = round1(4 * z);

        document.getElementById('ex83-eg-unit').textContent          = eenheid;
        document.getElementById('ex83-eg-calc').textContent           = `4 · ${fmtNum(z)}`;
        document.getElementById('ex83-eg-ans').textContent            = fmtNum(correctP);
        document.getElementById('ex83-eg-sentence-ans').textContent   = fmtNum(correctP);
        document.getElementById('ex83-eg-sentence-unit').textContent  = eenheid;

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const task     = taskTypes[n - 1];
        let qAttempts  = 0;
        const isLast   = n === TOTAL_Q;
        const isOmtrek = task === 'omtrek';

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        const titleText    = isOmtrek ? 'Bereken de omtrek.' : 'Bereken de oppervlakte.';
        const pLabel       = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const sentenceWord = isOmtrek ? 'omtrek' : 'oppervlakte';
        const hintText     = 'Tip: gebruik <kbd>*</kbd> voor het maalteken &middot; &nbsp;|&nbsp; gebruik <kbd>/</kbd> of <kbd>:</kbd> voor de deling';

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${titleText}</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex83-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <div class="ex33-cs" id="ex83-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex83-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <input id="ex83-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex83-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De ${sentenceWord} is
                            <span id="ex83-ans-disp" class="ex33-val">...</span>
                            <span id="ex83-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">${hintText}</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        const data = drawFiguur(document.getElementById('ex83-fig'), 'ruit-diagonalen', { lengtes: true });
        const eenheid = data.eenheid;
        const z       = data.zLabel.value;
        const d1      = round1(data.aLabel.value * 2);
        const d2      = round1(data.bLabel.value * 2);

        const correctAns = isOmtrek ? round1(4 * z) : round3(d1 * d2 / 2);

        initCS('ex83-cs');

        const ansEl  = document.getElementById('ex83-ans');
        const unitEl = document.getElementById('ex83-unit');
        const calcEl = document.getElementById('ex83-calc');

        function updateRow3() {
            document.getElementById('ex83-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex83-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        calcEl.addEventListener('keydown', e => {
            let char = null;
            if (e.key === '*')      char = '·';
            else if (e.key === '/') char = ':';
            if (char) {
                e.preventDefault();
                const s = calcEl.selectionStart, end = calcEl.selectionEnd;
                calcEl.value = calcEl.value.substring(0, s) + char + calcEl.value.substring(end);
                calcEl.selectionStart = calcEl.selectionEnd = s + 1;
            }
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const formula = document.getElementById('ex83-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(isOmtrek, eenheid, z, d1, d2, correctAns, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(isOmtrek, eenheid, z, d1, d2, correctAns);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(isOmtrek, eenheid, z, d1, d2, correctAns) {
        const cs      = document.getElementById('ex83-cs');
        const display = cs.querySelector('.ex33-cs-display');
        cs.dataset.value  = isOmtrek ? 'fP' : 'fA';
        display.innerHTML = FORMULA_OPTS.find(o => o.value === cs.dataset.value).html;

        const correctUnit = isOmtrek ? eenheid : eenheid + '²';
        document.getElementById('ex83-unit').value = correctUnit;

        const calcStr = isOmtrek
            ? `4·${fmtNum(z)}`
            : `${fmtNum(d1)}·${fmtNum(d2)}:2`;
        document.getElementById('ex83-calc').value = calcStr;

        const ansStr = fmtNum(correctAns);
        document.getElementById('ex83-ans').value             = ansStr;
        document.getElementById('ex83-ans-disp').textContent  = ansStr;
        document.getElementById('ex83-unit-disp').textContent = correctUnit;
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(isOmtrek, eenheid, z, d1, d2, correctAns, formula, unit, calc, ans) {
        const errors = [];

        if (!formula) {
            errors.push('Kies een formule.');
        } else if (formula !== (isOmtrek ? 'fP' : 'fA')) {
            errors.push('De formule is niet juist. Lees de opgave aandachtig: wordt <i>omtrek</i> (<i>P</i>) of <i>oppervlakte</i> (<i>A</i>) gevraagd?');
        }

        if (!unit) {
            errors.push('Kies een eenheid.');
        } else if (isOmtrek) {
            if (unit.includes('²')) {
                errors.push('Voor omtrek gebruik je een lengte-eenheid, geen eenheid met ².');
            } else if (unit !== eenheid) {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        } else {
            if (!unit.includes('²')) {
                errors.push('Voor oppervlakte gebruik je een eenheid met ². Jij koos een eenheid die je gebruikt bij afstand of omtrek.');
            } else if (unit !== eenheid + '²') {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        }

        const calcCheck = isOmtrek
            ? checkCalcRuitOmtrek(z, calc)
            : checkCalcRuitOpp(d1, d2, calc);

        if (!calcCheck.ok) {
            errors.push(isOmtrek
                ? 'De berekening klopt niet. Gebruik de vorm 4 · <i>z</i>.'
                : 'De berekening klopt niet. Gebruik de vorm <i>d</i><sub>1</sub> · <i>d</i><sub>2</sub> : 2.');
        }

        if (!checkAnswer(correctAns, ans)) {
            if (calcCheck.ok) {
                errors.push('Je hebt niet goed uitgerekend. Je mag ICT gebruiken.');
            } else {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/[*·]/g, '').replace(/\//g, ':').replace(/\s+/g, '');
    }

    function checkCalcRuitOmtrek(z, input) {
        const norm   = normalizeCalc(input);
        const optie1 = normalizeCalc(`4·${fmtNum(z)}`);
        const optie2 = normalizeCalc(`${fmtNum(z)}·4`);
        return (norm === optie1 || norm === optie2) ? { ok: true } : { ok: false };
    }

    function checkCalcRuitOpp(d1, d2, input) {
        const norm   = normalizeCalc(input);
        const optie1 = normalizeCalc(`${fmtNum(d1)}·${fmtNum(d2)}:2`);
        const optie2 = normalizeCalc(`${fmtNum(d2)}·${fmtNum(d1)}:2`);
        return (norm === optie1 || norm === optie2) ? { ok: true } : { ok: false };
    }

    function checkAnswer(expected, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - expected) < 0.0005;
    }

    // ── HELPERS ──────────────────────────────────────────────

    function round1(n) { return Math.round(n * 10) / 10; }
    function round3(n) { return Math.round(n * 1000) / 1000; }
    function fmtNum(n) { return String(n).replace('.', ','); }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

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
                display.innerHTML = opt.innerHTML;
                list.hidden       = true;
            });
        });
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS83() {
        if (['ex33-style', 'ex65-style', 'ex73-style', 'ex74-style', 'ex75-style', 'ex82-style', 'ex83-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex83-style';
        s.textContent = `
.ex33-badge { display: inline-block; background: var(--color-primary,#4a7a10); color: #fff; font-size: 0.78rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem; }
.ex54-subtitle { font-size: var(--font-size-base,0.95rem); color: #555; margin: -0.25rem 0 0.5rem; }
.ex33-fig { display: flex; justify-content: center; min-height: 200px; margin: var(--spacing-lg,1rem) 0; }
.ex33-stepplan { background: var(--color-light,#f0f7e0); border-radius: var(--radius-md,8px); padding: var(--spacing-md,0.75rem) var(--spacing-lg,1rem); margin: var(--spacing-lg,1rem) 0; font-size: var(--font-size-base,0.95rem); }
.ex33-stepplan strong { display: block; margin-bottom: 0.35rem; }
.ex33-stepplan ol { margin: 0; padding-left: 1.25rem; }
.ex33-stepplan li { margin: 0.2rem 0; }
.ex33-rows { display: flex; flex-direction: column; gap: var(--spacing-md,0.65rem); margin: var(--spacing-lg,1rem) 0; }
.ex33-row { display: flex; align-items: center; gap: var(--spacing-sm,0.5rem); flex-wrap: wrap; }
.ex33-row-calc { flex-wrap: nowrap; overflow-x: auto; }
.ex33-label { font-size: var(--font-size-base,0.95rem); white-space: nowrap; }
.ex33-p-label { font-size: var(--font-size-base,0.95rem); white-space: nowrap; }
.ex33-eg-field { padding: 0.35rem 0.6rem; background: #f0f0f0; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); color: #444; min-height: 1.8rem; display: flex; align-items: center; }
.ex33-eg-unit { min-width: 36px; }
.ex33-eg-calc { min-width: 120px; }
.ex33-eg-ans  { min-width: 50px; }
.ex33-cs { position: relative; display: inline-block; min-width: 210px; }
.ex33-cs-display { padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); cursor: pointer; background: #fff; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; user-select: none; }
.ex33-cs-display:hover { border-color: var(--color-primary,#4a7a10); }
.ex33-cs-list { position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff; border: 2px solid var(--color-primary,#4a7a10); border-radius: var(--radius-md,6px); z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.ex33-cs-opt { padding: 0.45rem 0.6rem; cursor: pointer; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; }
.ex33-cs-opt:hover { background: var(--color-light,#f0f7e0); }
.ex33-unit { padding: 0.35rem 0.3rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 68px; }
.ex33-calc { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 140px; }
.ex33-ans { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 80px; }
.ex33-sentence { font-size: var(--font-size-base,1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary,#4a7a10); }
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 0; padding-left: 1.4rem; }
.ex54-feedback-list li { margin: 0.2rem 0; }
.hint-text { font-size: var(--font-size-small,0.85rem); color: #666; margin: 0 0 var(--spacing-md,0.75rem) 0; }
.exercise-container sub { vertical-align: baseline; position: relative; top: 0.3em; font-size: 0.7em; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init83RuitGemengd };
}
