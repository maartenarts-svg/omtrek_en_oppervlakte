'use strict';

function init64OppervlakteDriehoek(container, onComplete) {

    addCSS64();

    const GEN_UNITS  = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS  = ['', 'm²', 'dm²', 'cm²', 'mm²'];
    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    // Elk type precies één keer, in willekeurige volgorde
    const TYPES = shuffle([1, 2, 3, 4]);

    const questions = TYPES.map(t => ({
        driehoekType: t,
        unit: randomFrom(GEN_UNITS),
        rotation: Math.floor(Math.random() * 72) * 5
    }));

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

    // ── RENDER ───────────────────────────────────────────────

    function render() {
        if (currentQ === 0)           renderExample();
        else if (currentQ <= TOTAL_Q) renderQuestion(currentQ);
        else                          finish();
    }

    // ── VOORBEELD ────────────────────────────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex64-fig-eg"></div>
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
                            <div class="ex33-eg-field"><i>A</i> = <i>bh</i> : 2</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm²</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">3·4:2</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">6</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong>6</strong> cm².
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex64-fig-eg'), 'driehoek-hoogte', {
            type: 2, k: 1, unit: 'cm', rotation: 0
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const data   = questions[n - 1];
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
                    <div class="ex33-fig" id="ex64-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <div class="ex33-eg-field"><i>A</i> = <i>bh</i> : 2</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex64-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <input id="ex64-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>=</span>
                            <input id="ex64-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is
                            <span id="ex64-ans-disp" class="ex33-val">...</span>
                            <span id="ex64-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <p class="hint-text">Tip: typ <kbd>*</kbd> voor het maalteken &middot; &nbsp;|&nbsp; gebruik <kbd>/</kbd> of <kbd>:</kbd> voor de deling</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        // Teken figuur en vang afmetingen op
        const figData = drawFiguur(document.getElementById('ex64-fig'), 'driehoek-hoogte', {
            type: data.driehoekType, k: 1, unit: data.unit, rotation: data.rotation
        });
        const basis  = data.driehoekType === 4 ? figData.c : figData.a;
        const hoogte = figData.h;
        const answer = figData.oppervlakte;

        const ansEl  = document.getElementById('ex64-ans');
        const unitEl = document.getElementById('ex64-unit');
        const calcEl = document.getElementById('ex64-calc');

        function updateRow3() {
            document.getElementById('ex64-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex64-unit-disp').textContent = unitEl.value || '...';
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
            const errors = buildFeedback({ unit: data.unit, basis, hoogte, answer, driehoekType: data.driehoekType }, unit, calc, ans);

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
                fillCorrectAnswer(data.unit, basis, hoogte, answer);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(unit, basis, hoogte, answer) {
        document.getElementById('ex64-unit').value            = unit + '²';
        document.getElementById('ex64-calc').value            = `${basis}·${hoogte}:2`;
        document.getElementById('ex64-ans').value             = String(answer);
        document.getElementById('ex64-ans-disp').textContent  = String(answer);
        document.getElementById('ex64-unit-disp').textContent = unit + '²';
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
            if (calcResult.error === 'missing-division') {
                errors.push('Je berekening klopt niet helemaal. Vergeet de deling door 2 niet: <i>A</i> = <i>bh</i> : 2.');
            } else if (calcResult.error === 'volgorde') {
                errors.push('Je hebt de berekening niet correct opgeschreven. Controleer de volgorde van de getallen.');
            } else {
                errors.push('Je hebt de berekening niet correct opgeschreven.');
            }
        }

        if (!checkAnswer(data.answer, ans)) {
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
        // Aanvaarde vormen: b·h:2, b·h/2, h·b:2, h·b/2
        const m = n.match(/^(.+)[·](.+)[:/]2$/);
        if (!m) {
            // Misschien staat er b·h zonder deling
            const m2 = n.match(/^(.+)[·](.+)$/);
            if (m2) return { ok: false, error: 'missing-division' };
            return { ok: false, error: 'generic' };
        }
        const x = parseFloat(m[1]);
        const y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };

        const bOk = Math.abs(x - data.basis)  < 0.05;
        const hOk = Math.abs(y - data.hoogte) < 0.05;
        if (bOk && hOk) return { ok: true };

        if (Math.abs(x - data.hoogte) < 0.05 && Math.abs(y - data.basis) < 0.05) {
            if (data.driehoekType === 2) return { ok: true };
            return { ok: false, error: 'volgorde' };
        }

        return { ok: false, error: 'generic' };
    }

    function checkAnswer(expected, input) {
        const n = parseFloat(input.replace(/,/g, '.'));
        return !isNaN(n) && Math.abs(n - expected) < 0.05;
    }

    // ── FEEDBACK TONEN ───────────────────────────────────────

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

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 60);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
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

    function addCSS64() {
        if (['ex33-style', 'ex36-style', 'ex54-style', 'ex59-style', 'ex64-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex64-style';
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
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 0; padding-left: 1.4rem; }
.ex54-feedback-list li { margin: 0.2rem 0; }
.hint-text { font-size: var(--font-size-small, 0.85rem); color: #666; margin: 0 0 var(--spacing-md, 0.75rem) 0; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init64OppervlakteDriehoek };
}
