'use strict';

function init65DriehoekGemengd(container, onComplete) {

    addCSS65();

    // ── CONSTANTS ────────────────────────────────────────────

    const GEN_UNITS = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];

    const FORMULA_OPTS = [
        { value: '',   html: '&mdash;' },
        { value: 'fP', html: 'som van de zijden' },
        { value: 'fA', html: '<i>bh</i> : 2' }
    ];

    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // ── STATE ────────────────────────────────────────────────

    // Elk type (1–4) komt één keer voor, random gekoppeld aan omtrek of oppervlakte
    const taskTypes     = shuffle(['omtrek', 'omtrek', 'oppervlakte', 'oppervlakte']);
    const driehoekTypes = shuffle([1, 2, 3, 4]);
    const questions     = taskTypes.map((task, i) => ({
        task,
        driehoekType: driehoekTypes[i],
        unit:         randomFrom(GEN_UNITS),
        rotation:     Math.floor(Math.random() * 72) * 5
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

    // ── VOORBEELD (type 1, omtrek) ───────────────────────────
    // Type 1: a=5, b=4, c=6 → P = 5+4+6 = 15 cm

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de omtrek.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex65-fig-eg"></div>
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
                            <div class="ex33-eg-field ex33-eg-calc">5+4+6</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">15</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De omtrek is <strong>15</strong> cm.
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex65-fig-eg'), 'driehoek-hoogte', {
            type: 1, k: 1, unit: 'cm', rotation: 0
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

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        const titleText    = isOmtrek ? 'Bereken de omtrek.' : 'Bereken de oppervlakte.';
        const pLabel       = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const sentenceWord = isOmtrek ? 'omtrek' : 'oppervlakte';
        const hintText     = isOmtrek
            ? 'Tip: gebruik <kbd>+</kbd> voor de som van de zijden.'
            : 'Tip: typ <kbd>*</kbd> voor het maalteken &middot; &nbsp;|&nbsp; gebruik <kbd>/</kbd> of <kbd>:</kbd> voor de deling';

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${titleText}</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex65-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <div class="ex33-cs" id="ex65-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex65-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <input id="ex65-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex65-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De ${sentenceWord} is
                            <span id="ex65-ans-disp" class="ex33-val">...</span>
                            <span id="ex65-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">${hintText}</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        const figData = drawFiguur(document.getElementById('ex65-fig'), 'driehoek-hoogte', {
            type: q.driehoekType, k: 1, unit: q.unit, rotation: q.rotation
        });
        const basis  = q.driehoekType === 4 ? figData.c : figData.a;

        initCS('ex65-cs');

        const ansEl  = document.getElementById('ex65-ans');
        const unitEl = document.getElementById('ex65-unit');
        const calcEl = document.getElementById('ex65-calc');

        function updateRow3() {
            document.getElementById('ex65-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex65-unit-disp').textContent = unitEl.value || '...';
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
            const formula = document.getElementById('ex65-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(q, figData, basis, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(q, figData, basis);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(q, figData, basis) {
        const cs      = document.getElementById('ex65-cs');
        const display = cs.querySelector('.ex33-cs-display');
        const isOmtrek = q.task === 'omtrek';
        cs.dataset.value  = isOmtrek ? 'fP' : 'fA';
        display.innerHTML = FORMULA_OPTS.find(o => o.value === cs.dataset.value).html;

        const correctUnit = isOmtrek ? q.unit : q.unit + '²';
        document.getElementById('ex65-unit').value = correctUnit;

        const calcStr = isOmtrek
            ? `${figData.a}+${figData.b}+${figData.c}`
            : `${basis}·${figData.h}:2`;
        document.getElementById('ex65-calc').value = calcStr;

        const ansStr = String(isOmtrek
            ? round2(figData.a + figData.b + figData.c)
            : figData.oppervlakte);
        document.getElementById('ex65-ans').value             = ansStr;
        document.getElementById('ex65-ans-disp').textContent  = ansStr;
        document.getElementById('ex65-unit-disp').textContent = correctUnit;
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(q, figData, basis, formula, unit, calc, ans) {
        const errors   = [];
        const isOmtrek = q.task === 'omtrek';
        const answer   = isOmtrek
            ? round2(figData.a + figData.b + figData.c)
            : figData.oppervlakte;

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
            ? checkCalcOmtrek(figData, calc)
            : checkCalcOppervlakte(basis, figData.h, calc);

        if (!calcResult.ok) {
            if (calcResult.error === 'missing-division') {
                errors.push('Vergeet de deling door 2 niet: <i>A</i> = <i>bh</i> : 2.');
            } else if (calcResult.error === 'volgorde') {
                errors.push('Je hebt de berekening niet correct opgeschreven. Controleer de volgorde van de getallen.');
            } else {
                errors.push('Je hebt de berekening niet correct opgeschreven.');
            }
        }

        if (!checkAnswer(answer, ans)) {
            if (calcResult.ok) {
                errors.push('Je hebt niet goed uitgerekend. Je mag ICT gebruiken.');
            } else if (calcResult.error === 'generic') {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function checkCalcOmtrek(figData, input) {
        const n     = input.replace(/,/g, '.').replace(/\s+/g, '');
        const parts = n.split('+');
        if (parts.length !== 3) return { ok: false, error: 'generic' };
        const nums = parts.map(p => parseFloat(p));
        if (nums.some(isNaN)) return { ok: false, error: 'generic' };
        const expected = [figData.a, figData.b, figData.c].sort((a, b) => a - b);
        const actual   = [...nums].sort((a, b) => a - b);
        if (expected.every((v, i) => Math.abs(v - actual[i]) < 0.05)) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcOppervlakte(basis, hoogte, input) {
        const n = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/\s+/g, '');
        const m = n.match(/^(.+)[·](.+)[:/]2$/);
        if (!m) {
            if (n.match(/^(.+)[·](.+)$/)) return { ok: false, error: 'missing-division' };
            return { ok: false, error: 'generic' };
        }
        const x = parseFloat(m[1]);
        const y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };
        const bOk = Math.abs(x - basis)  < 0.05;
        const hOk = Math.abs(y - hoogte) < 0.05;
        if (bOk && hOk) return { ok: true };
        if (Math.abs(x - hoogte) < 0.05 && Math.abs(y - basis) < 0.05) return { ok: false, error: 'volgorde' };
        return { ok: false, error: 'generic' };
    }

    function checkAnswer(expected, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - expected) < 0.05;
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
                display.innerHTML = opt.innerHTML;
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

    function addCSS65() {
        if (['ex33-style', 'ex36-style', 'ex54-style', 'ex510-style', 'ex65-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex65-style';
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init65DriehoekGemengd };
}
