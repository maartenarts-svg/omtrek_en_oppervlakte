'use strict';

function init74CirkelGemengd(container, onComplete) {

    addCSS74();

    // ── CONSTANTS ────────────────────────────────────────────

    const GEN_UNITS    = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS    = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];
    const STRAAL_POOL  = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];

    const FORMULA_OPTS = [
        { value: '',   html: '&mdash;' },
        { value: 'fP', html: '2π<i>r</i>' },
        { value: 'fA', html: 'π<i>r</i>²' }
    ];

    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // ── STATE ────────────────────────────────────────────────

    const taskTypes  = shuffle(['omtrek', 'omtrek', 'oppervlakte', 'oppervlakte']);
    const questions  = taskTypes.map(task => ({
        task,
        r:    pickN(STRAAL_POOL, 1)[0],
        unit: randomFrom(GEN_UNITS)
    }));

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

    // ── VOORBEELD (omtrek, r=4 cm) ───────────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de omtrek.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex74-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de formule.</li>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening zonder eenheden.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                            <li>Rond af op 0,01.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field">2π<i>r</i></div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>P</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">2·π·4</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">25,13</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is <strong>25,13</strong> cm.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex74-fig-eg'), 'cirkel', {
            factor: 1,
            straal: { value: 4, unit: 'cm' }
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const q        = questions[n - 1];
        let qAttempts  = 0;
        const isLast   = n === TOTAL_Q;
        const isOmtrek = q.task === 'omtrek';

        const correctA  = isOmtrek
            ? round2(2 * Math.PI * q.r)
            : round2(Math.PI * q.r * q.r);
        const unitLabel = isOmtrek ? q.unit : q.unit + '²';
        const pLabel    = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const titleText = isOmtrek ? 'Bereken de omtrek.' : 'Bereken de oppervlakte.';
        const sentenceWord = isOmtrek ? 'omtrek' : 'oppervlakte';
        const hintText  = 'Tip: typ <kbd>pi</kbd> voor π &nbsp;|&nbsp; gebruik <kbd>*</kbd> voor het maalteken ·';

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${titleText}</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening. Rond af op 0,01 ${unitLabel}.</p>
                    <div class="ex33-fig" id="ex74-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <div class="ex33-cs" id="ex74-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex74-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <input id="ex74-calc" class="ex33-calc" type="text" autocomplete="off">
                            <span>=</span>
                            <input id="ex74-ans" class="ex33-ans" type="text" autocomplete="off">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De ${sentenceWord} is
                            <span id="ex74-ans-disp" class="ex33-val">...</span>
                            <span id="ex74-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    ${!isOmtrek ? `
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>` : ''}
                    <p class="hint-text">${hintText}</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex74-fig'), 'cirkel', {
            factor: 1,
            straal: { value: q.r, unit: q.unit }
        });

        initCS('ex74-cs');

        const ansEl  = document.getElementById('ex74-ans');
        const unitEl = document.getElementById('ex74-unit');
        const calcEl = document.getElementById('ex74-calc');

        function updateRow3() {
            document.getElementById('ex74-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex74-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        calcEl.addEventListener('keydown', e => {
            if (e.key === '*') {
                e.preventDefault();
                const s = calcEl.selectionStart, end = calcEl.selectionEnd;
                calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
                calcEl.selectionStart = calcEl.selectionEnd = s + 1;
            }
        });
        calcEl.addEventListener('input', () => {
            const old    = calcEl.value;
            const newVal = old.replace(/pi/gi, 'π');
            if (newVal !== old) {
                const cursor = calcEl.selectionStart;
                const diff   = old.length - newVal.length;
                calcEl.value = newVal;
                calcEl.selectionStart = calcEl.selectionEnd = Math.max(0, cursor - diff);
            }
        });

        const squaredBtn = document.getElementById('squaredBtn');
        if (squaredBtn) {
            squaredBtn.addEventListener('click', () => {
                if (!calcEl.disabled) {
                    const s = calcEl.selectionStart, end = calcEl.selectionEnd;
                    calcEl.value = calcEl.value.slice(0, s) + '²' + calcEl.value.slice(end);
                    calcEl.selectionStart = calcEl.selectionEnd = s + 1;
                    calcEl.focus();
                }
            });
        }

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const formula = document.getElementById('ex74-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(q, correctA, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(q, correctA);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(q, correctA) {
        const isOmtrek  = q.task === 'omtrek';
        const unitLabel = isOmtrek ? q.unit : q.unit + '²';

        const cs      = document.getElementById('ex74-cs');
        const display = cs.querySelector('.ex33-cs-display');
        cs.dataset.value  = isOmtrek ? 'fP' : 'fA';
        display.innerHTML = FORMULA_OPTS.find(o => o.value === cs.dataset.value).html;

        document.getElementById('ex74-unit').value = unitLabel;

        const calcStr = isOmtrek
            ? `2·π·${fmtNum(q.r)}`
            : `π·${fmtNum(q.r)}²`;
        document.getElementById('ex74-calc').value            = calcStr;
        document.getElementById('ex74-ans').value             = fmtNum(correctA);
        document.getElementById('ex74-ans-disp').textContent  = fmtNum(correctA);
        document.getElementById('ex74-unit-disp').textContent = unitLabel;
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(q, correctA, formula, unit, calc, ans) {
        const errors   = [];
        const isOmtrek = q.task === 'omtrek';

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
            } else if (unit !== q.unit) {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        } else {
            if (!unit.includes('²')) {
                errors.push('Voor oppervlakte gebruik je een eenheid met ². Jij koos een eenheid die je gebruikt bij afstand of omtrek.');
            } else if (unit !== q.unit + '²') {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        }

        const calcResult = isOmtrek
            ? checkCalcOmtrek(q.r, calc)
            : checkCalcOppervlakte(q.r, calc);

        if (!calcResult.ok) {
            errors.push(isOmtrek
                ? 'De berekening klopt niet. Gebruik de vorm 2·π·<i>r</i>.'
                : 'De berekening klopt niet. Gebruik de vorm π·<i>r</i>².');
        }

        if (!checkAnswer(correctA, ans)) {
            if (calcResult.ok) {
                errors.push('Je hebt niet goed uitgerekend. Vergeet niet af te ronden op 0,01.');
            } else {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/[*·]/g, '').replace(/pi/gi, 'π').replace(/\s+/g, '');
    }

    function checkCalcOmtrek(r, input) {
        return normalizeCalc(input) === normalizeCalc(`2·π·${r}`) ? { ok: true } : { ok: false };
    }

    function checkCalcOppervlakte(r, input) {
        return normalizeCalc(input) === normalizeCalc(`π·${r}²`) ? { ok: true } : { ok: false };
    }

    function checkAnswer(expected, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - expected) < 0.01;
    }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 30);
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

    // ── HELPERS ──────────────────────────────────────────────

    function round2(n) { return Math.round(n * 100) / 100; }
    function fmtNum(n) { return String(n).replace('.', ','); }
    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function pickN(arr, n) {
        const copy = [...arr]; const result = [];
        for (let i = 0; i < n; i++) {
            const j = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(j, 1)[0]);
        }
        return result;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS74() {
        if (['ex65-style', 'ex73-style', 'ex74-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex74-style';
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
.ex33-eg-calc { min-width: 90px; }
.ex33-eg-ans  { min-width: 36px; }
.ex33-cs { position: relative; display: inline-block; min-width: 120px; }
.ex33-cs-display { padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); cursor: pointer; background: #fff; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; user-select: none; }
.ex33-cs-display:hover { border-color: var(--color-primary,#4a7a10); }
.ex33-cs-list { position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff; border: 2px solid var(--color-primary,#4a7a10); border-radius: var(--radius-md,6px); z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.ex33-cs-opt { padding: 0.45rem 0.6rem; cursor: pointer; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; }
.ex33-cs-opt:hover { background: var(--color-light,#f0f7e0); }
.ex33-unit { padding: 0.35rem 0.3rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 68px; }
.ex33-calc { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 130px; }
.ex33-ans { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 70px; }
.ex33-sentence { font-size: var(--font-size-base,1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary,#4a7a10); }
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 1.2rem; padding: 0; }
.ex54-feedback-list li { margin: 0.2rem 0; }
.hint-text { font-size: var(--font-size-small,0.85rem); color: #666; margin: 0 0 var(--spacing-md,0.75rem) 0; }
.squared-helper { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f0f7ff; border-radius: var(--radius-md); border: 1px solid #d0e4f7; font-size: var(--font-size-base); }
.squared-insert-btn { background: #2c2c2c; color: #fff; border: 1px solid #111; border-bottom: 3px solid #000; border-radius: 5px; padding: 0.2rem 0.6rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,.35); display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 0; }
.squared-insert-btn .key-top { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
.squared-insert-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init74CirkelGemengd };
}
