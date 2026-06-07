'use strict';

function init73OppervlakteCirkel(container, onComplete) {
    addCSS73();

    const UNITS       = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS   = ['', 'm²', 'dm²', 'cm²', 'mm²'];
    const STRAAL_POOL = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];

    function round2(n) { return Math.round(n * 100) / 100; }
    function fmtNum(n) { return String(n).replace('.', ','); }

    function pickN(arr, n) {
        const copy = [...arr]; const result = [];
        for (let i = 0; i < n; i++) {
            const j = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(j, 1)[0]);
        }
        return result;
    }

    const straalWaarden = pickN(STRAAL_POOL, 4);
    const units         = [0,1,2,3].map(() => UNITS[Math.floor(Math.random() * UNITS.length)]);

    const TOTAL_QUESTIONS = 4;
    const MAX_POINTS      = 4;

    let currentQuestion = 0;
    let totalPoints     = 0;

    render();

    function render() {
        if (currentQuestion === 0)                   renderExample();
        else if (currentQuestion <= TOTAL_QUESTIONS) renderQ(currentQuestion - 1);
        else                                         finish();
    }

    function next() { currentQuestion++; render(); }

    function progressHTML() {
        const pct = ((currentQuestion - 1) / TOTAL_QUESTIONS) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQuestion} van ${TOTAL_QUESTIONS}</span>
                    <span class="progress-score">Punten: <strong>${fmtPt(totalPoints)}</strong>/${MAX_POINTS}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    function fmtPt(p) { return Number.isInteger(p) ? String(p) : p.toFixed(1); }

    // ── VOORBEELD ────────────────────────────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex73-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening: vul de waarde van <i>r</i> in.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                            <li>Rond af op 0,01.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = π · <i>r</i>²</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm²</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">π · 4²</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">50,27</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong>50,27</strong> cm².
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex73-fig-eg'), 'cirkel', {
            factor: 1,
            straal: { value: 4, unit: 'cm' }
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQuestion = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQ(idx) {
        let attempts      = 0;
        let attempt1score = -1;
        const r           = straalWaarden[idx];
        const unit        = units[idx];
        const correctA    = round2(Math.PI * r * r);

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening. Rond af op 0,01 ${unit}².</p>
                    <div class="ex33-fig" id="figContainer"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = π · <i>r</i>²</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex73-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <input id="ex73-calc" class="ex33-calc" type="text" autocomplete="off" >
                            <span>=</span>
                            <input id="ex73-ans" class="ex33-ans" type="text" autocomplete="off" >
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is
                            <span id="ex73-ans-disp" class="ex33-val">...</span>
                            <span id="ex73-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>
                    <p class="hint-text">Tip: typ <kbd>pi</kbd> voor π &nbsp;|&nbsp; gebruik <kbd>*</kbd> voor het maalteken ·</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('figContainer'), 'cirkel', {
            factor: 1,
            straal: { value: r, unit }
        });

        const unitEl = document.getElementById('ex73-unit');
        const calcEl = document.getElementById('ex73-calc');
        const ansEl  = document.getElementById('ex73-ans');

        function updateRow3() {
            document.getElementById('ex73-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex73-unit-disp').textContent = unitEl.value || '...';
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

        document.getElementById('squaredBtn').addEventListener('click', () => {
            if (!calcEl.disabled) {
                const s = calcEl.selectionStart, end = calcEl.selectionEnd;
                calcEl.value = calcEl.value.slice(0, s) + '²' + calcEl.value.slice(end);
                calcEl.selectionStart = calcEl.selectionEnd = s + 1;
                calcEl.focus();
            }
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            const selUnit = unitEl.value;
            const rawCalc = calcEl.value.trim();
            const rawAns  = ansEl.value.trim();

            const unitOk    = selUnit === unit + '²';
            const calcCheck = checkCalcCirkelOpp(r, rawCalc);
            const ansNum    = parseFloat(rawAns.replace(',', '.'));
            const ansOk     = !isNaN(ansNum) && Math.abs(ansNum - correctA) < 0.01;

            attempts++;

            if (unitOk && calcCheck.ok && ansOk) {
                totalPoints += attempts === 1 ? 1 : 0.5;
                lockFields();
                showFeedbackWithNext('correct', attempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (attempts === 1) {
                attempt1score = 0;
                if (unitOk && calcCheck.ok) attempt1score += 0.5;
                if (ansOk)                  attempt1score += 0.5;
                const errors = buildFeedback(unit, selUnit, calcCheck, ansOk);
                showFeedbackErrors('incorrect', errors);
            } else {
                totalPoints += Math.max(attempt1score, 0);
                fillCorrect(r, unit, correctA);
                lockFields();
                showFeedbackWithNext('incorrect', 'Niet helemaal juist. Het juiste antwoord is ingevuld.');
            }
        });
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(unit, selUnit, calcCheck, ansOk) {
        const errors = [];

        if (!selUnit) {
            errors.push('Kies een eenheid voor de oppervlakte.');
        } else if (selUnit !== unit + '²') {
            errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
        }

        if (!calcCheck.ok) {
            errors.push('De berekening klopt niet. Gebruik de vorm π·<i>r</i>².');
        }

        if (!ansOk) {
            if (calcCheck.ok) {
                errors.push('Je hebt niet goed uitgerekend. Vergeet niet af te ronden op 0,01.');
            } else {
                errors.push('Pas ook het antwoord aan.');
            }
        }

        if (errors.length === 0) errors.push('Dit klopt niet helemaal. Verbeter.');
        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/[*·]/g, '').replace(/pi/gi, 'π').replace(/\s+/g, '');
    }

    function checkCalcCirkelOpp(r, input) {
        return normalizeCalc(input) === normalizeCalc(`π·${r}²`) ? { ok: true } : { ok: false };
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrect(r, unit, correctA) {
        document.getElementById('ex73-unit').value            = unit + '²';
        document.getElementById('ex73-calc').value            = `π·${fmtNum(r)}²`;
        document.getElementById('ex73-ans').value             = fmtNum(correctA);
        document.getElementById('ex73-ans-disp').textContent  = fmtNum(correctA);
        document.getElementById('ex73-unit-disp').textContent = unit + '²';
    }

    function lockFields() {
        ['ex73-unit', 'ex73-calc', 'ex73-ans'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
        const sb = document.getElementById('squaredBtn');
        if (sb) sb.disabled = true;
        const cb = document.getElementById('checkBtn');
        if (cb) cb.style.display = 'none';
    }

    // ── FEEDBACK TONEN ───────────────────────────────────────

    function showFeedbackErrors(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">Dit klopt niet helemaal. Verbeter.<br>Bekijk de lijst hieronder voor meer informatie.</p>
                <ul class="ex54-feedback-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>`;
    }

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
        document.getElementById('nextBtn').addEventListener('click', next);
    }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 30);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS73() {
        if (['ex64-style', 'ex73-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex73-style';
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
.ex33-unit { padding: 0.35rem 0.3rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 68px; }
.ex33-calc { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 130px; }
.ex33-ans { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 70px; }
.ex33-sentence { font-size: var(--font-size-base,1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary,#4a7a10); }
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 0; padding-left: 1.4rem; }
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
    module.exports = { init73OppervlakteCirkel };
}
