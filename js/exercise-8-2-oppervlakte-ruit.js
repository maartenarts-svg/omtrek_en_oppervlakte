'use strict';

function init82OppervlakteRuit(container, onComplete) {
    addCSS82();

    const UNIT_OPTS = ['', 'm²', 'dm²', 'cm²', 'mm²'];
    const unitOptsHtml = UNIT_OPTS.map(u =>
        `<option value="${u}">${u || '—'}</option>`
    ).join('');

    function round1(n) { return Math.round(n * 10) / 10; }
    function round3(n) { return Math.round(n * 1000) / 1000; }
    function fmtNum(n) { return String(n).replace('.', ','); }

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
                    <div class="ex33-fig" id="ex82-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening: vul de waarden van <i>d</i><sub>1</sub> en <i>d</i><sub>2</sub> in.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = <i>d</i><sub>1</sub> <i>d</i><sub>2</sub>&nbsp;:&nbsp;2</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit" id="ex82-eg-unit"></div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc" id="ex82-eg-calc"></div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans" id="ex82-eg-ans"></div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong id="ex82-eg-sentence-ans"></strong> <span id="ex82-eg-sentence-unit"></span>.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        const data = drawFiguur(document.getElementById('ex82-fig-eg'), 'ruit-diagonalen', { lengtes: true });
        const eenheid = data.eenheid;
        const d1 = round1(data.aLabel.value * 2);
        const d2 = round1(data.bLabel.value * 2);
        const correctA = round3(d1 * d2 / 2);

        document.getElementById('ex82-eg-unit').textContent           = eenheid + '²';
        document.getElementById('ex82-eg-calc').textContent           = `${fmtNum(d1)} · ${fmtNum(d2)} : 2`;
        document.getElementById('ex82-eg-ans').textContent            = fmtNum(correctA);
        document.getElementById('ex82-eg-sentence-ans').textContent   = fmtNum(correctA);
        document.getElementById('ex82-eg-sentence-unit').textContent  = eenheid + '²';

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQuestion = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQ(idx) {
        let attempts      = 0;
        let attempt1score = -1;

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="figContainer"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = <i>d</i><sub>1</sub> <i>d</i><sub>2</sub>&nbsp;:&nbsp;2</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex82-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <input id="ex82-calc" class="ex33-calc" type="text" autocomplete="off">
                            <span>=</span>
                            <input id="ex82-ans" class="ex33-ans" type="text" autocomplete="off">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is
                            <span id="ex82-ans-disp" class="ex33-val">...</span>
                            <span id="ex82-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">Tip: gebruik <kbd>*</kbd> voor het maalteken · en <kbd>/</kbd> voor de deling :</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        const data = drawFiguur(document.getElementById('figContainer'), 'ruit-diagonalen', { lengtes: true });
        const eenheid  = data.eenheid;
        const d1       = round1(data.aLabel.value * 2);
        const d2       = round1(data.bLabel.value * 2);
        const correctA = round3(d1 * d2 / 2);

        const unitEl = document.getElementById('ex82-unit');
        const calcEl = document.getElementById('ex82-calc');
        const ansEl  = document.getElementById('ex82-ans');

        function updateRow3() {
            document.getElementById('ex82-ans-disp').textContent  = ansEl.value.trim() || '...';
            document.getElementById('ex82-unit-disp').textContent = unitEl.value || '...';
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
            const selUnit = unitEl.value;
            const rawCalc = calcEl.value.trim();
            const rawAns  = ansEl.value.trim();

            const unitOk    = selUnit === eenheid + '²';
            const calcCheck = checkCalcRuitOpp(d1, d2, rawCalc);
            const ansNum    = parseFloat(rawAns.replace(',', '.'));
            const ansOk     = !isNaN(ansNum) && Math.abs(ansNum - correctA) < 0.0005;

            attempts++;

            if (unitOk && calcCheck.ok && ansOk) {
                totalPoints += attempts === 1 ? 1 : 0.5;
                lockFields();
                showFeedbackWithNext('correct', attempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (attempts === 1) {
                attempt1score = 0;
                if (unitOk && calcCheck.ok) attempt1score += 0.5;
                if (ansOk)                  attempt1score += 0.5;
                const errors = buildFeedback(eenheid, selUnit, calcCheck, ansOk);
                showFeedbackErrors('incorrect', errors);
            } else {
                totalPoints += Math.max(attempt1score, 0);
                fillCorrect(d1, d2, eenheid, correctA);
                lockFields();
                showFeedbackWithNext('incorrect', 'Niet helemaal juist. Het juiste antwoord is ingevuld.');
            }
        });
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(eenheid, selUnit, calcCheck, ansOk) {
        const errors = [];

        if (!selUnit) {
            errors.push('Kies een eenheid voor de oppervlakte.');
        } else if (selUnit !== eenheid + '²') {
            errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
        }

        if (!calcCheck.ok) {
            errors.push('De berekening klopt niet. Gebruik de vorm <i>d</i><sub>1</sub> · <i>d</i><sub>2</sub> : 2.');
        }

        if (!ansOk) {
            if (calcCheck.ok) {
                errors.push('Je hebt niet goed uitgerekend.');
            } else {
                errors.push('Pas ook het antwoord aan.');
            }
        }

        if (errors.length === 0) errors.push('Dit klopt niet helemaal. Verbeter.');
        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/[*·]/g, '').replace(/\//g, ':').replace(/\s+/g, '');
    }

    function checkCalcRuitOpp(d1, d2, input) {
        const norm    = normalizeCalc(input);
        const optie1  = normalizeCalc(`${fmtNum(d1)}·${fmtNum(d2)}:2`);
        const optie2  = normalizeCalc(`${fmtNum(d2)}·${fmtNum(d1)}:2`);
        return (norm === optie1 || norm === optie2) ? { ok: true } : { ok: false };
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrect(d1, d2, eenheid, correctA) {
        document.getElementById('ex82-unit').value            = eenheid + '²';
        document.getElementById('ex82-calc').value            = `${fmtNum(d1)}·${fmtNum(d2)}:2`;
        document.getElementById('ex82-ans').value             = fmtNum(correctA);
        document.getElementById('ex82-ans-disp').textContent  = fmtNum(correctA);
        document.getElementById('ex82-unit-disp').textContent = eenheid + '²';
    }

    function lockFields() {
        ['ex82-unit', 'ex82-calc', 'ex82-ans'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
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

    function addCSS82() {
        if (['ex33-style', 'ex73-style', 'ex74-style', 'ex75-style', 'ex82-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex82-style';
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
    module.exports = { init82OppervlakteRuit };
}
