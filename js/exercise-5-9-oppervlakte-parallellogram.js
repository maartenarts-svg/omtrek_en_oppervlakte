'use strict';

function init59OppervlakteParallellogram(container, onComplete) {

    addCSS59();

    // ── CONSTANTS ────────────────────────────────────────────

    // sin van de vaste binnenhoek in figures.js: hoogte-vector = (0,90), zijde-vector = (-45,90)
    const SIN_A      = 90 / Math.sqrt(45 * 45 + 90 * 90);
    const GEN_UNITS  = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS  = ['', 'm²', 'dm²', 'cm²', 'mm²'];
    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // ── STATE ────────────────────────────────────────────────

    const questions = Array.from({ length: TOTAL_Q }, genQuestion);
    let currentQ    = 0;
    let totalPoints = 0;

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

    // ── VOORBEELD ────────────────────────────────────────────
    // Voorbeeld: basis=4 cm, zijde=6 cm → hoogte=5 cm, A=20 cm²

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex59-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
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
                            <div class="ex33-eg-field ex33-eg-calc">8·5</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">40</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong>40</strong> cm².
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex59-fig-eg'), 'parallellogram-hoogte', {
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
        const data    = questions[n - 1];
        let qAttempts = 0;
        const isLast  = n === TOTAL_Q;

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex59-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = <i>bh</i></div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex59-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <input id="ex59-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex59-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is
                            <span id="ex59-ans-disp" class="ex33-val">...</span>
                            <span id="ex59-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">Tip: typ <kbd>*</kbd> voor het maalteken &middot;</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex59-fig'), 'parallellogram-hoogte', data.figOpts);

        const ansEl  = document.getElementById('ex59-ans');
        const unitEl = document.getElementById('ex59-unit');
        const calcEl = document.getElementById('ex59-calc');

        function updateRow3() {
            document.getElementById('ex59-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex59-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        calcEl.addEventListener('keydown', e => {
            if (e.key !== '*') return;
            e.preventDefault();
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const unit   = unitEl.value;
            const calc   = calcEl.value.trim();
            const ans    = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors = buildFeedback(data, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                const label = qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', label);
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
        document.getElementById('ex59-unit').value            = data.unit + '²';
        document.getElementById('ex59-calc').value            = `${data.b}·${data.h}`;
        document.getElementById('ex59-ans').value             = String(data.answer);
        document.getElementById('ex59-ans-disp').textContent  = String(data.answer);
        document.getElementById('ex59-unit-disp').textContent = data.unit + '²';
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(data, unit, calc, ans) {
        const errors = [];

        if (!unit) {
            errors.push('Kies een eenheid voor de oppervlakte.');
        } else if (unit !== data.unit + '²') {
            errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
        }

        const calcResult = checkCalc(data, calc);
        if (!calcResult.ok) {
            if (calcResult.error === 'volgorde') {
                errors.push('Je hebt de berekening niet correct opgeschreven. Controleer de volgorde waarin je de getallen noteert.');
            } else if (calcResult.error === 'zijde-als-hoogte') {
                errors.push('De berekening is niet juist. Kijk goed naar de figuur: hoe lang is de hoogte van dit parallellogram?');
            } else {
                errors.push('Je hebt de berekening niet correct opgeschreven.');
            }
        }

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

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/\*/g, '·').replace(/\s+/g, '');
    }

    function checkCalc(data, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^(.+)·(.+)$/);
        if (!m) return { ok: false, error: 'generic' };
        const x = parseFloat(m[1]);
        const y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };

        const bOk = Math.abs(x - data.b) < 0.05;
        const hOk = Math.abs(y - data.h) < 0.05;
        if (bOk && hOk) return { ok: true };

        // Juiste getallen maar omgekeerde volgorde
        if (Math.abs(x - data.h) < 0.05 && Math.abs(y - data.b) < 0.05) {
            return { ok: false, error: 'volgorde' };
        }

        // Basis correct, maar schuine zijde gebruikt in plaats van hoogte
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

    function genQuestion() {
        const unit     = randomFrom(GEN_UNITS);
        const rotation = Math.floor(Math.random() * 72) * 5;
        // Beide waarden uit dezelfde pool (geheel of één decimaal).
        // Grotere waarde → basis (langste zijde in figuur), kleinere → schuine zijde.
        const DIMS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
        let a, c;
        do {
            a = randomFrom(DIMS);
            c = randomFrom(DIMS);
        } while (a === c);
        const b = Math.max(a, c);
        const z = Math.min(a, c);
        const h      = computeHoogte(b, z);
        const answer = round2(b * h);
        return {
            unit, b, z, h, answer,
            figOpts: { factor: 1, rotation, basis: { value: b, unit }, zijde: { value: z, unit } }
        };
    }

    // Spiegelt de afrondlogica van figures.js voor de hoogte-waarde op de figuur.
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
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 60);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS59() {
        if (['ex33-style', 'ex36-style', 'ex54-style', 'ex59-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex59-style';
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
