'use strict';

function init74CirkelGemengd(container, onComplete) {
    addCSS74();

    const STRAAL_POOL = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
    const UNITS       = ['cm', 'dm', 'm', 'mm'];

    function round2(n) { return Math.round(n * 100) / 100; }
    function fmtNum(n) { return String(n).replace('.', ','); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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

    const taskTypes  = shuffle(['omtrek','omtrek','oppervlakte','oppervlakte']);
    const straalWaarden = pickN(STRAAL_POOL, 4);
    const units      = [0,1,2,3].map(() => pick(UNITS));

    const FORMULA_OPTIONS = [
        { value: '',   html: '—' },
        { value: 'fP', html: '2π<i>r</i>' },
        { value: 'fA', html: 'π<i>r</i>²' }
    ];

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
            <div class="ex74-voorbeeld">
                <p><strong>Voorbeeld omtrek:</strong></p>
                <div class="ex74-voorbeeld-inner">
                    <div id="voorbeeldFig"></div>
                    <div class="ex74-stap">
                        <div class="ex74-stap-label">formule:</div>
                        <div class="ex74-stap-val"><i>P</i> = 2π<i>r</i></div>
                        <div class="ex74-stap-label">berekening:</div>
                        <div class="ex74-stap-val"><i>P</i> = 2 · π · 4</div>
                        <div class="ex74-stap-label">antwoord:</div>
                        <div class="ex74-stap-val"><i>P</i> &asymp; 25,13 cm</div>
                    </div>
                </div>
            </div>`;
    }

    // ── QUESTION ─────────────────────────────────────────────
    function renderQ(idx) {
        let attempts        = 0;
        let attempt1Partial = 0;
        const taskType  = taskTypes[idx];
        const isOmtrek  = taskType === 'omtrek';
        const r         = straalWaarden[idx];
        const unit      = units[idx];
        const correctF  = isOmtrek ? 'fP' : 'fA';
        const correctA  = isOmtrek ? round2(2 * Math.PI * r) : round2(Math.PI * r * r);
        const unitLabel = isOmtrek ? unit : `${unit}²`;
        const letter    = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const title     = isOmtrek
            ? `Bereken de omtrek op 0,01 ${unit} nauwkeurig.`
            : `Bereken de oppervlakte op 0,01 ${unit}² nauwkeurig.`;

        const csOptsHtml = FORMULA_OPTIONS.map(o =>
            `<div class="ex74-cs-opt" data-value="${o.value}">${o.html}</div>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${title}</h3>
                    ${idx === 0 ? voorbeeldHTML() : ''}
                    <div id="figContainer" class="figure-container"></div>
                    <div class="ex74-calc-block">
                        <div class="ex74-calc-row">
                            <span class="ex74-label-col">${letter} =</span>
                            <div class="ex74-cs" id="formulaCS" data-value="">
                                <div class="ex74-cs-display">—</div>
                                <div class="ex74-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex74-calc-row">
                            <span class="ex74-label-col">${letter} =</span>
                            <input type="text" id="calcInput" class="ex74-input" autocomplete="off" placeholder="${isOmtrek ? '2·π·…' : 'π·…²'}">
                        </div>
                        <div class="ex74-calc-row">
                            <span class="ex74-label-col">${letter} &asymp;</span>
                            <input type="number" id="ansInput" class="ex74-input ex74-input-num" step="0.01" autocomplete="off" placeholder="0,00">
                            <span class="ex74-unit">${unitLabel}</span>
                        </div>
                    </div>
                    ${!isOmtrek ? `
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>` : ''}
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

        let docClickClean = () => {};
        const csEl = document.getElementById('formulaCS');
        const display = csEl.querySelector('.ex74-cs-display');
        const list    = csEl.querySelector('.ex74-cs-list');
        docClickClean = () => { if (list) list.hidden = true; };
        document.addEventListener('click', docClickClean);
        display.addEventListener('click', e => { e.stopPropagation(); list.hidden = !list.hidden; });
        csEl.querySelectorAll('.ex74-cs-opt').forEach(opt => {
            opt.addEventListener('click', e => {
                e.stopPropagation();
                csEl.dataset.value = opt.dataset.value;
                display.innerHTML  = opt.innerHTML || '—';
                list.hidden        = true;
            });
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            const chosenF  = document.getElementById('formulaCS').dataset.value;
            const rawCalc  = calcEl.value.trim();
            const rawAns   = ansEl.value.trim();

            if (!chosenF || !rawCalc || !rawAns) {
                showFeedback('incorrect', 'Vul alle velden in (formule, berekening en antwoord).');
                return;
            }

            const formulaOk = chosenF === correctF;
            const calcOk    = isOmtrek
                ? checkCalcCirkel(r, rawCalc).ok
                : checkCalcCirkelOpp(r, rawCalc).ok;
            const ansNum    = parseFloat(rawAns.replace(',', '.'));
            const ansOk     = !isNaN(ansNum) && Math.abs(ansNum - correctA) < 0.01;

            attempts++;

            if (formulaOk && calcOk && ansOk) {
                totalPoints += attempts === 1 ? 1 : 0.5;
                document.removeEventListener('click', docClickClean);
                lockFields(isOmtrek);
                showFeedbackWithNext('correct', attempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (attempts === 1) {
                let score = 0;
                if (formulaOk) score += 0.4;
                if (calcOk)    score += 0.3;
                if (ansOk)     score += 0.3;
                attempt1Partial = score;
                let msg = 'Dit klopt niet helemaal. Verbeter.';
                if (formulaOk && calcOk && !ansOk) msg = 'Formule en berekening zijn correct, maar het antwoord klopt niet. Vergeet niet af te ronden op 0,01.';
                if (!formulaOk)                    msg = 'De gekozen formule klopt niet. Controleer: gaat het om de omtrek of de oppervlakte?';
                showFeedback('incorrect', msg);
            } else {
                totalPoints += attempt1Partial;
                document.removeEventListener('click', docClickClean);
                fillCorrect(r, unit, correctF, correctA, isOmtrek);
                lockFields(isOmtrek);
                showFeedbackWithNext('incorrect', 'Niet helemaal juist. Het juiste antwoord is ingevuld.');
            }
        });
    }

    function checkCalcCirkel(r, input) {
        const n     = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/pi/gi, 'π').replace(/\s+/g, '');
        const parts = n.split('·');
        if (parts.length !== 3) return { ok: false };
        const hasPi = parts.some(p => p === 'π');
        const has2  = parts.some(p => p === '2');
        const rPart = parts.find(p => p !== 'π' && p !== '2');
        if (!hasPi || !has2 || !rPart) return { ok: false };
        const v = parseFloat(rPart.replace(',', '.'));
        if (!isNaN(v) && Math.abs(v - r) < 0.05) return { ok: true };
        return { ok: false };
    }

    function checkCalcCirkelOpp(r, input) {
        const n     = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/pi/gi, 'π').replace(/\s+/g, '');
        const parts = n.split('·');
        if (parts.length === 2) {
            const hasPi   = parts.some(p => p === 'π');
            const rSqPart = parts.find(p => p !== 'π');
            if (!hasPi || !rSqPart) return { ok: false };
            const mSq = rSqPart.match(/^(.+)²$/);
            if (mSq) {
                const v = parseFloat(mSq[1].replace(',', '.'));
                if (!isNaN(v) && Math.abs(v - r) < 0.05) return { ok: true };
            }
            return { ok: false };
        }
        if (parts.length === 3) {
            const hasPi  = parts.some(p => p === 'π');
            const rParts = parts.filter(p => p !== 'π');
            if (!hasPi || rParts.length !== 2) return { ok: false };
            const vals = rParts.map(p => parseFloat(p.replace(',', '.')));
            if (vals.every(v => !isNaN(v) && Math.abs(v - r) < 0.05)) return { ok: true };
        }
        return { ok: false };
    }

    function fillCorrect(r, unit, correctF, correctA, isOmtrek) {
        const csEl   = document.getElementById('formulaCS');
        const opt    = FORMULA_OPTIONS.find(o => o.value === correctF);
        csEl.dataset.value = correctF;
        csEl.querySelector('.ex74-cs-display').innerHTML = opt ? opt.html : '—';

        if (isOmtrek) {
            document.getElementById('calcInput').value = `2·π·${fmtNum(r)}`;
        } else {
            document.getElementById('calcInput').value = `π·${fmtNum(r)}²`;
        }
        document.getElementById('ansInput').value = fmtNum(correctA);
    }

    function lockFields(isOmtrek) {
        const csEl = document.getElementById('formulaCS');
        if (csEl) csEl.style.pointerEvents = 'none';
        ['calcInput','ansInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
        if (!isOmtrek) {
            const sb = document.getElementById('squaredBtn');
            if (sb) sb.disabled = true;
        }
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
    function addCSS74() {
        if (['ex65-style','ex74-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex74-style';
        s.textContent = `
.ex74-voorbeeld { background: var(--color-light,#f0f7e0); border-radius: var(--radius-md,8px); padding: var(--spacing-md); margin-bottom: var(--spacing-lg); }
.ex74-voorbeeld-inner { display: flex; gap: var(--spacing-lg); align-items: center; flex-wrap: wrap; margin-top: var(--spacing-sm); }
.ex74-stap { display: grid; grid-template-columns: auto 1fr; gap: 0.3rem 0.75rem; align-items: baseline; }
.ex74-stap-label { font-size: var(--font-size-small); color: #666; text-align: right; }
.ex74-stap-val { font-size: var(--font-size-base); }
.ex74-calc-block { margin: var(--spacing-lg) 0; display: flex; flex-direction: column; gap: var(--spacing-md); }
.ex74-calc-row { display: flex; align-items: center; gap: var(--spacing-md); flex-wrap: wrap; }
.ex74-label-col { min-width: 50px; text-align: right; font-size: 1.05rem; white-space: nowrap; }
.ex74-cs { position: relative; display: inline-block; min-width: 120px; }
.ex74-cs-display { padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); cursor: pointer; background: #fff; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; user-select: none; }
.ex74-cs-display:hover { border-color: var(--color-primary); }
.ex74-cs-list { position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff; border: 2px solid var(--color-primary,#4a7a10); border-radius: var(--radius-md,6px); z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.ex74-cs-opt { padding: 0.45rem 0.6rem; cursor: pointer; font-size: var(--font-size-base); min-height: 1.8rem; display: flex; align-items: center; }
.ex74-cs-opt:hover { background: var(--color-light,#f0f7e0); }
.ex74-input { padding: 0.35rem 0.5rem; font-size: var(--font-size-base); border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); width: 160px !important; display: inline-block; }
.ex74-input:focus { outline: none; border-color: var(--color-primary); }
.ex74-input:disabled { background: var(--color-light); cursor: not-allowed; }
.ex74-input-num { width: 100px !important; }
.ex74-unit { font-size: 1rem; }
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
    module.exports = { init74CirkelGemengd };
}
