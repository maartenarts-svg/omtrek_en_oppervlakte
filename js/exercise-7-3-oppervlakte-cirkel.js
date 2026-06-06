'use strict';

function init73OppervlakteCirkel(container, onComplete) {
    addCSS73();

    const UNITS       = ['cm', 'dm', 'm', 'mm'];
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

    let currentQuestion = 1;
    let totalPoints     = 0;

    render();

    function render() {
        if (currentQuestion <= TOTAL_QUESTIONS) renderQ(currentQuestion - 1);
        else                                    finish();
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
    function voorbeeldHTML() {
        return `
            <div class="ex73-voorbeeld">
                <p><strong>Voorbeeld:</strong></p>
                <div class="ex73-voorbeeld-inner">
                    <div class="ex73-voorbeeld-fig" id="voorbeeldFig"></div>
                    <div class="ex73-voorbeeld-stap">
                        <div class="calc-row-label">formule:</div>
                        <div class="calc-row-val"><i>A</i> = π · <i>r</i>²</div>
                        <div class="calc-row-label">berekening:</div>
                        <div class="calc-row-val"><i>A</i> = π · 4²</div>
                        <div class="calc-row-label">antwoord:</div>
                        <div class="calc-row-val"><i>A</i> &asymp; 50,27 cm²</div>
                    </div>
                </div>
            </div>`;
    }

    // ── QUESTION ─────────────────────────────────────────────
    function renderQ(idx) {
        let attempts      = 0;
        let attempt1score = -1;
        const r           = straalWaarden[idx];
        const unit        = units[idx];
        const correctA    = round2(Math.PI * r * r);

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte op 0,01 ${unit}² nauwkeurig.</h3>
                    ${idx === 0 ? voorbeeldHTML() : ''}
                    <div id="figContainer" class="figure-container"></div>
                    <div class="ex73-calc-block">
                        <div class="ex73-formula-row">
                            <span class="ex73-label-col"><i>A</i> =</span>
                            <span class="ex73-val-col">π · <i>r</i>²</span>
                        </div>
                        <div class="ex73-calc-row">
                            <span class="ex73-label-col"><i>A</i> =</span>
                            <input type="text" id="calcInput" class="ex73-input" autocomplete="off" placeholder="π·…²">
                        </div>
                        <div class="ex73-calc-row">
                            <span class="ex73-label-col"><i>A</i> &asymp;</span>
                            <input type="number" id="ansInput" class="ex73-input ex73-input-num" step="0.01" autocomplete="off" placeholder="0,00">
                            <span class="ex73-unit">${unit}²</span>
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

        // Draw circle
        drawFiguur(document.getElementById('figContainer'), 'cirkel', {
            factor: 1,
            straal: { value: r, unit }
        });

        // Draw voorbeeld circle
        if (idx === 0) {
            drawFiguur(document.getElementById('voorbeeldFig'), 'cirkel', {
                factor: 1,
                straal: { value: 4, unit: 'cm' }
            });
        }

        const calcEl = document.getElementById('calcInput');
        const ansEl  = document.getElementById('ansInput');

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
            const rawCalc = calcEl.value.trim();
            const rawAns  = ansEl.value.trim();
            if (!rawCalc || !rawAns) {
                showFeedback('incorrect', 'Vul zowel de berekening als het antwoord in.');
                return;
            }

            const calcCheck = checkCalcCirkelOpp(r, rawCalc);
            const ansNum    = parseFloat(rawAns.replace(',', '.'));
            const ansOk     = !isNaN(ansNum) && Math.abs(ansNum - correctA) < 0.01;

            attempts++;

            if (calcCheck.ok && ansOk) {
                totalPoints += attempts === 1 ? 1 : 0.5;
                lockFields();
                showFeedbackWithNext('correct', attempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (attempts === 1) {
                attempt1score = 0;
                if (calcCheck.ok) attempt1score += 0.5;
                if (ansOk)        attempt1score += 0.5;
                let msg = 'Dit klopt niet helemaal. Verbeter.';
                if (!calcCheck.ok && ansOk) msg = 'Het antwoord is correct, maar de berekening klopt niet. Gebruik de vorm π·<i>r</i>².';
                if (calcCheck.ok && !ansOk) msg = 'De berekening is correct, maar het antwoord klopt niet. Vergeet niet af te ronden op 0,01.';
                showFeedback('incorrect', msg);
            } else {
                const pts = Math.max(attempt1score, 0);
                totalPoints += pts;
                fillCorrect(r, unit, correctA);
                lockFields();
                showFeedbackWithNext('incorrect', `Niet helemaal juist. Het juiste antwoord is ingevuld.`);
            }
        });
    }

    function checkCalcCirkelOpp(r, input) {
        const n = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/pi/gi, 'π').replace(/\s+/g, '');
        const parts = n.split('·');
        // Accept: π·r² or r²·π (2 parts with · separator)
        if (parts.length === 2) {
            const hasPi    = parts.some(p => p === 'π');
            const rSqPart  = parts.find(p => p !== 'π');
            if (!hasPi || !rSqPart) return { ok: false };
            const mSq = rSqPart.match(/^(.+)²$/);
            if (mSq) {
                const v = parseFloat(mSq[1].replace(',', '.'));
                if (!isNaN(v) && Math.abs(v - r) < 0.05) return { ok: true };
            }
            // Also accept r·r·π (3 parts)
            return { ok: false };
        }
        // Accept: π·r·r or r·r·π or r·π·r
        if (parts.length === 3) {
            const hasPi = parts.some(p => p === 'π');
            const rParts = parts.filter(p => p !== 'π');
            if (!hasPi || rParts.length !== 2) return { ok: false };
            const vals = rParts.map(p => parseFloat(p.replace(',', '.')));
            if (vals.every(v => !isNaN(v) && Math.abs(v - r) < 0.05)) return { ok: true };
        }
        return { ok: false };
    }

    function fillCorrect(r, unit, correctA) {
        document.getElementById('calcInput').value = `π·${fmtNum(r)}²`;
        document.getElementById('ansInput').value  = fmtNum(correctA);
    }

    function lockFields() {
        ['calcInput','ansInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
        const sb = document.getElementById('squaredBtn');
        if (sb) sb.disabled = true;
        const cb = document.getElementById('checkBtn');
        if (cb) cb.style.display = 'none';
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
        if (['ex64-style','ex73-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex73-style';
        s.textContent = `
.ex73-voorbeeld { background: var(--color-light,#f0f7e0); border-radius: var(--radius-md,8px); padding: var(--spacing-md); margin-bottom: var(--spacing-lg); }
.ex73-voorbeeld-inner { display: flex; gap: var(--spacing-lg); align-items: center; flex-wrap: wrap; margin-top: var(--spacing-sm); }
.ex73-voorbeeld-fig { min-width: 180px; }
.ex73-voorbeeld-stap { display: grid; grid-template-columns: auto 1fr; gap: 0.3rem 0.75rem; align-items: baseline; }
.calc-row-label { font-size: var(--font-size-small); color: #666; text-align: right; }
.calc-row-val { font-size: var(--font-size-base); }
.ex73-calc-block { margin: var(--spacing-lg) 0; display: flex; flex-direction: column; gap: var(--spacing-md); }
.ex73-formula-row, .ex73-calc-row { display: flex; align-items: center; gap: var(--spacing-md); }
.ex73-label-col { min-width: 50px; text-align: right; font-size: 1.05rem; white-space: nowrap; }
.ex73-val-col { font-size: 1.05rem; }
.ex73-input { padding: 0.35rem 0.5rem; font-size: var(--font-size-base); border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); width: 160px !important; display: inline-block; }
.ex73-input:focus { outline: none; border-color: var(--color-primary); }
.ex73-input:disabled { background: var(--color-light); cursor: not-allowed; }
.ex73-input-num { width: 100px !important; }
.ex73-unit { font-size: 1rem; }
.hint-text { font-size: var(--font-size-small); color: #666; margin: 0 0 var(--spacing-md) 0; }
.squared-helper { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f0f7ff; border-radius: var(--radius-md); border: 1px solid #d0e4f7; font-size: var(--font-size-base); }
.squared-insert-btn { background: #2c2c2c; color: #fff; border: 1px solid #111; border-bottom: 3px solid #000; border-radius: 5px; padding: 0.2rem 0.6rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,.35); display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 0; }
.squared-insert-btn .key-top { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
.squared-insert-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.figure-container { display: flex; justify-content: center; align-items: center; margin: var(--spacing-lg) 0; min-height: 180px; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init73OppervlakteCirkel };
}
