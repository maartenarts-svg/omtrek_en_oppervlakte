'use strict';

// ============================================
// DRILL: FORMULES INOEFENEN
// ============================================
// Q1–10:  tekstvorm  — label  → formule typen
// Q11–20: figuurvorm — figuur → formule typen
// Q21:    letters voor omtrek  (van exercise-5-8)
// Q22:    letters voor oppervlakte (van exercise-5-8)
// Afsluiting: overzicht + opslaan in Firestore
// 1 poging per vraag  |  A = alles juist, C = fout
// ============================================

function initDrillFormules(container, onComplete) {

    addCSS();

    // ── DATA ─────────────────────────────────────────────────

    const FORMULAS = [
        { id: 'P_vierkant',       label: '<i>P</i><sub>vierkant</sub>',       pLabel: '<i>P</i>', figType: 'vierkant',              correct: ['4z']                                         },
        { id: 'P_rechthoek',      label: '<i>P</i><sub>rechthoek</sub>',      pLabel: '<i>P</i>', figType: 'rechthoek',             correct: ['2(b+h)', '2(h+b)']                           },
        { id: 'P_ruit',           label: '<i>P</i><sub>ruit</sub>',           pLabel: '<i>P</i>', figType: 'ruit',                  correct: ['4z']                                         },
        { id: 'P_cirkel',         label: '<i>P</i><sub>cirkel</sub>',         pLabel: '<i>P</i>', figType: 'cirkel',                correct: ['2πr', '2rπ', 'π2r', 'πr2', 'r2π', 'rπ2']    },
        { id: 'P_driehoek',       label: '<i>P</i><sub>driehoek</sub>',       pLabel: '<i>P</i>', figType: 'driehoek',              correct: ['somvandezijden']                              },
        { id: 'P_parallellogram', label: '<i>P</i><sub>parallellogram</sub>', pLabel: '<i>P</i>', figType: 'parallellogram',        correct: ['somvandezijden']                              },
        { id: 'P_trapezium',      label: '<i>P</i><sub>trapezium</sub>',      pLabel: '<i>P</i>', figType: 'trapezium',             correct: ['somvandezijden']                              },
        { id: 'A_rechthoek',      label: '<i>A</i><sub>rechthoek</sub>',      pLabel: '<i>A</i>', figType: 'rechthoek',             correct: ['bh', 'hb']                                   },
        { id: 'A_vierkant',       label: '<i>A</i><sub>vierkant</sub>',       pLabel: '<i>A</i>', figType: 'vierkant',              correct: ['z²']                                         },
        { id: 'A_parallellogram', label: '<i>A</i><sub>parallellogram</sub>', pLabel: '<i>A</i>', figType: 'parallellogram',        correct: ['bh', 'hb']                                   },
    ];

    const DISPLAY = {
        P_vierkant:       '4z',
        P_rechthoek:      '2(b+h)',
        P_ruit:           '4z',
        P_cirkel:         '2πr',
        P_driehoek:       'som van de zijden',
        P_parallellogram: 'som van de zijden',
        P_trapezium:      'som van de zijden',
        A_rechthoek:      'bh',
        A_vierkant:       'z²',
        A_parallellogram: 'bh',
    };

    const TOTAL_Q = 22;

    // ── STATE ────────────────────────────────────────────────

    const TEXT_ORDER   = shuffle([...FORMULAS]);
    const FIGURE_ORDER = shuffle([...FORMULAS]);

    let currentQ    = 1;
    const textResults  = {};   // id → boolean
    const figResults   = {};   // id → boolean
    let q21Correct  = true;
    let q22Correct  = true;

    render();

    // ── NAVIGATIE ────────────────────────────────────────────

    function render() {
        if      (currentQ <= 10)     renderTextQ(currentQ);
        else if (currentQ <= 20)     renderFigureQ(currentQ - 10);
        else if (currentQ === 21)    renderQ21();
        else if (currentQ === 22)    renderQ22();
        else                         renderSummary();
    }

    function next() { currentQ++; render(); }

    // ── PROGRESS ─────────────────────────────────────────────

    function progressHTML() {
        const pct = ((currentQ - 1) / TOTAL_Q) * 100;
        const correctSoFar =
            Object.values(textResults).filter(Boolean).length +
            Object.values(figResults).filter(Boolean).length +
            (currentQ > 21 ? (q21Correct ? 1 : 0) : 0);
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQ} van ${TOTAL_Q}</span>
                    <span class="progress-score">Score: <strong>${correctSoFar}</strong> / ${TOTAL_Q}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    // ── HELPERS ──────────────────────────────────────────────

    function normalize(str) {
        return str.trim().toLowerCase()
            .replace(/pi/g, 'π')
            .replace(/·/g, '').replace(/\*/g, '')
            .replace(/\s+/g, '');
    }

    function checkAnswer(formula, input) {
        const n = normalize(input);
        return formula.correct.some(c => n === c);
    }

    function isSom(f)     { return f.correct.includes('somvandezijden'); }
    function hasSquared(f){ return f.correct.some(a => a.includes('²')); }
    function hasPi(f)     { return f.correct.some(a => a.includes('π')); }

    function squaredHelperHTML() {
        return `
            <div class="squared-helper">
                <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                <button type="button" class="squared-insert-btn" id="squaredBtn">
                    <span class="key-top">3</span><span class="key-bottom">2</span>
                </button>
            </div>`;
    }

    function setupSquaredBtn(inputId) {
        const btn = document.getElementById('squaredBtn');
        const inp = document.getElementById(inputId);
        if (!btn || !inp) return;
        btn.addEventListener('click', () => {
            const s = inp.selectionStart, e = inp.selectionEnd;
            inp.value = inp.value.slice(0, s) + '²' + inp.value.slice(e);
            inp.selectionStart = inp.selectionEnd = s + 1;
            inp.focus();
        });
    }

    function setupPiConversion(inputId) {
        const inp = document.getElementById(inputId);
        if (!inp) return;
        inp.addEventListener('input', () => {
            const old = inp.value;
            const nw  = old.replace(/pi/gi, 'π');
            if (nw !== old) {
                const diff   = old.length - nw.length;
                const cursor = inp.selectionStart;
                inp.value = nw;
                inp.selectionStart = inp.selectionEnd = Math.max(0, cursor - diff);
            }
        });
    }

    function setupTimesConversion(inputId) {
        const inp = document.getElementById(inputId);
        if (!inp) return;
        inp.addEventListener('keydown', e => {
            if (e.key !== '*') return;
            e.preventDefault();
            const s = inp.selectionStart, end = inp.selectionEnd;
            inp.value = inp.value.substring(0, s) + '·' + inp.value.substring(end);
            inp.selectionStart = inp.selectionEnd = s + 1;
        });
    }

    function setupSomAutocomplete(inputId) {
        const inp = document.getElementById(inputId);
        const sug = document.getElementById('dfSuggestion');
        if (!inp || !sug) return;

        inp.addEventListener('input', () => {
            sug.hidden = !inp.value.toLowerCase().includes('som');
        });
        sug.addEventListener('click', () => {
            inp.value = 'som van de zijden';
            sug.hidden = true;
            inp.focus();
        });
        inp.addEventListener('keydown', e => {
            if (e.key === 'Tab' && !sug.hidden) {
                e.preventDefault();
                inp.value = 'som van de zijden';
                sug.hidden = true;
            }
        });
    }

    function showFeedbackBtn(type, msg, btnLabel, onClick) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="dfActionBtn">${btnLabel}</button>
            </div>`;

        const btn = document.getElementById('dfActionBtn');
        btn.addEventListener('click', onClick);

        // Enter activeert ook de actieknop als feedback zichtbaar is
        function onEnter(e) {
            if (e.key === 'Enter') {
                document.removeEventListener('keydown', onEnter);
                onClick();
            }
        }
        document.addEventListener('keydown', onEnter);
    }

    // ── TEKST VRAGEN Q1–10 ───────────────────────────────────

    function renderTextQ(n) {
        const f   = TEXT_ORDER[n - 1];
        const som = isSom(f);

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Noteer de formule.</h3>
                    <div class="df-formula-row">
                        <span class="df-formula-label">${f.label} =</span>
                        <div class="df-input-wrap">
                            <input type="text" id="dfInput" class="df-formula-input" autocomplete="off" autofocus>
                            ${som ? `<div class="df-suggestion" id="dfSuggestion" hidden>
                                Bedoel je <strong>som van de zijden</strong>? Druk Tab of klik hier.
                            </div>` : ''}
                        </div>
                    </div>
                    ${squaredHelperHTML()}
                    <p class="hint-text">Typ <kbd>pi</kbd> voor π &nbsp;|&nbsp; typ <kbd>*</kbd> voor ·</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        setupSquaredBtn('dfInput');
        setupPiConversion('dfInput');
        setupTimesConversion('dfInput');
        if (som) setupSomAutocomplete('dfInput');

        document.getElementById('dfInput').focus();
        setTimeout(() => {
            const inp = document.getElementById('dfInput');
            if (!inp) return;
            inp.addEventListener('keypress', e => {
                if (e.key !== 'Enter') return;
                const sug = document.getElementById('dfSuggestion');
                if (sug && !sug.hidden) {
                    inp.value = 'som van de zijden';
                    sug.hidden = true;
                } else {
                    document.getElementById('checkBtn').click();
                }
            });
        }, 0);

        document.getElementById('checkBtn').addEventListener('click', () => {
            const inp = document.getElementById('dfInput');
            if (!inp.value.trim()) {
                document.getElementById('feedbackArea').innerHTML = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Vul de formule in.</p>
                    </div>`;
                return;
            }

            const correct = checkAnswer(f, inp.value);
            textResults[f.id] = correct;
            inp.disabled = true;
            document.getElementById('checkBtn').style.display = 'none';

            const btnLabel = n === 10 ? 'Volgende deel →' : 'OK';
            if (correct) {
                showFeedbackBtn('correct', 'Correct!', btnLabel, next);
            } else {
                showFeedbackBtn('incorrect',
                    `Niet juist. Het juiste antwoord is: <strong>${DISPLAY[f.id]}</strong>`,
                    btnLabel, next);
            }
        });
    }

    // ── FIGUUR VRAGEN Q11–20 ─────────────────────────────────

    function renderFigureQ(n) {
        const f   = FIGURE_ORDER[n - 1];
        const som = isSom(f);

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Noteer de formule.</h3>
                    <div class="figure-container" id="dfFigContainer"></div>
                    <div class="df-formula-row">
                        <span class="df-formula-label">${f.pLabel} =</span>
                        <div class="df-input-wrap">
                            <input type="text" id="dfInput" class="df-formula-input" autocomplete="off" autofocus>
                            ${som ? `<div class="df-suggestion" id="dfSuggestion" hidden>
                                Bedoel je <strong>som van de zijden</strong>? Druk Tab of klik hier.
                            </div>` : ''}
                        </div>
                    </div>
                    ${squaredHelperHTML()}
                    <p class="hint-text">Typ <kbd>pi</kbd> voor π &nbsp;|&nbsp; typ <kbd>*</kbd> voor ·</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('dfFigContainer'), f.figType, generateFigOpts(f));

        setupSquaredBtn('dfInput');
        setupPiConversion('dfInput');
        setupTimesConversion('dfInput');
        if (som) setupSomAutocomplete('dfInput');

        document.getElementById('dfInput').focus();
        setTimeout(() => {
            const inp = document.getElementById('dfInput');
            if (!inp) return;
            inp.addEventListener('keypress', e => {
                if (e.key !== 'Enter') return;
                const sug = document.getElementById('dfSuggestion');
                if (sug && !sug.hidden) {
                    inp.value = 'som van de zijden';
                    sug.hidden = true;
                } else {
                    document.getElementById('checkBtn').click();
                }
            });
        }, 0);

        document.getElementById('checkBtn').addEventListener('click', () => {
            const inp = document.getElementById('dfInput');
            if (!inp.value.trim()) {
                document.getElementById('feedbackArea').innerHTML = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Vul de formule in.</p>
                    </div>`;
                return;
            }

            const correct = checkAnswer(f, inp.value);
            figResults[f.id] = correct;
            inp.disabled = true;
            document.getElementById('checkBtn').style.display = 'none';

            const btnLabel = n === 10 ? 'Verder →' : 'OK';
            if (correct) {
                showFeedbackBtn('correct', 'Correct!', btnLabel, next);
            } else {
                showFeedbackBtn('incorrect',
                    `Niet juist. Het juiste antwoord is: <strong>${DISPLAY[f.id]}</strong>`,
                    btnLabel, next);
            }
        });
    }

    // ── FIGUUR GENERATIE ─────────────────────────────────────

    function generateFigOpts(f) {
        const unit   = 'cm';
        const rot    = Math.floor(Math.random() * 72) * 5;
        const pick   = arr => arr[Math.floor(Math.random() * arr.length)];

        const nl = { stijl: { noLabels: true } };

        switch (f.figType) {
            case 'vierkant':
                return { factor: 1, rotation: rot, zijde: { value: pick([3,4,5,6]), unit }, ...nl };
            case 'rechthoek': {
                const bVal = pick([3,4,5]);
                return { factor: 1, rotation: rot,
                    breedte: { value: bVal,                                    unit },
                    hoogte:  { value: pick([4,5,6,7].filter(v => v !== bVal)), unit }, ...nl };
            }
            case 'ruit':
                return { factor: 1, rotation: rot, zijde: { value: pick([3,4,5]), unit }, ...nl };
            case 'cirkel':
                return { factor: 1, straal: { value: pick([2,3,4,5]), unit }, ...nl };
            case 'driehoek':
                return { factor: 1, rotation: rot,
                    zijden: [{ value: 3, unit }, { value: 4, unit }, { value: 5, unit }], ...nl };
            case 'parallellogram':
                return { factor: 1, rotation: rot,
                    basis: { value: pick([4,5,6]), unit },
                    zijde: { value: pick([2,3,4]), unit }, ...nl };
            case 'trapezium':
                return { factor: 1, rotation: rot, zijden: [
                    { value: pick([3,4]),   unit },
                    { value: pick([2,3]),   unit },
                    { value: pick([5,6,7]), unit },
                    { value: pick([2,3]),   unit }
                ], ...nl };
        }
    }

    // ── Q21: LETTERS OMTREK ──────────────────────────────────

    function renderQ21() {
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Wat betekenen de letters?</h3>
                    <p class="question-text">
                        In de formules <i>P</i> = 4<i>z</i>, <i>P</i> = 2(<i>b</i> + <i>h</i>)
                        en <i>P</i> = 2π<i>r</i> staat de letter <i>P</i> voor omtrek.<br>
                        Waarvoor staan de letters <i>z</i>, <i>b</i>, <i>h</i> en <i>r</i>?
                    </p>
                    <div class="letter-inputs">
                        <div class="letter-input-row">
                            <label class="letter-label"><i>P</i>:</label>
                            <span class="letter-example">omtrek</span>
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>z</i>:</label>
                            <input type="text" id="inpZ" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>b</i>:</label>
                            <input type="text" id="inpB" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>h</i>:</label>
                            <input type="text" id="inpH" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>r</i>:</label>
                            <input type="text" id="inpR" class="letter-input" autocomplete="off">
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('inpZ').focus();
        document.getElementById('checkBtn').addEventListener('click', () => {
            const z = document.getElementById('inpZ').value.trim().toLowerCase();
            const b = document.getElementById('inpB').value.trim().toLowerCase();
            const h = document.getElementById('inpH').value.trim().toLowerCase();
            const r = document.getElementById('inpR').value.trim().toLowerCase();

            if (!z || !b || !h || !r) {
                document.getElementById('feedbackArea').innerHTML = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Vul alle vakken in.</p>
                    </div>`;
                return;
            }

            const correct = z === 'zijde' && b === 'basis' && h === 'hoogte' && r === 'straal';
            q21Correct = correct;

            if (z !== 'zijde') document.getElementById('inpZ').value = 'zijde';
            if (b !== 'basis') document.getElementById('inpB').value = 'basis';
            if (h !== 'hoogte') document.getElementById('inpH').value = 'hoogte';
            if (r !== 'straal') document.getElementById('inpR').value = 'straal';

            ['inpZ','inpB','inpH','inpR'].forEach(id => {
                document.getElementById(id).disabled = true;
            });
            document.getElementById('checkBtn').style.display = 'none';

            showFeedbackBtn(
                correct ? 'correct' : 'incorrect',
                correct ? 'Correct!' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.',
                'OK', next
            );
        });
    }

    // ── Q22: LETTERS OPPERVLAKTE ─────────────────────────────

    function renderQ22() {
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Wat betekenen de letters?</h3>
                    <p class="question-text">
                        In de formules <i>A</i> = <i>bh</i> en <i>A</i> = <i>z</i>²
                        staat de letter <i>A</i> voor oppervlakte.<br>
                        Waarvoor staan de letters <i>b</i>, <i>h</i> en <i>z</i>?
                    </p>
                    <div class="letter-inputs">
                        <div class="letter-input-row">
                            <label class="letter-label"><i>A</i>:</label>
                            <span class="letter-example">oppervlakte</span>
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>b</i>:</label>
                            <input type="text" id="inpB" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>h</i>:</label>
                            <input type="text" id="inpH" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>z</i>:</label>
                            <input type="text" id="inpZ" class="letter-input" autocomplete="off">
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('inpB').focus();
        document.getElementById('checkBtn').addEventListener('click', () => {
            const b = document.getElementById('inpB').value.trim().toLowerCase();
            const h = document.getElementById('inpH').value.trim().toLowerCase();
            const z = document.getElementById('inpZ').value.trim().toLowerCase();

            if (!b || !h || !z) {
                document.getElementById('feedbackArea').innerHTML = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Vul alle vakken in.</p>
                    </div>`;
                return;
            }

            const correct = b === 'basis' && h === 'hoogte' && z === 'zijde';
            q22Correct = correct;

            if (b !== 'basis')  document.getElementById('inpB').value = 'basis';
            if (h !== 'hoogte') document.getElementById('inpH').value = 'hoogte';
            if (z !== 'zijde')  document.getElementById('inpZ').value = 'zijde';

            ['inpB','inpH','inpZ'].forEach(id => {
                document.getElementById(id).disabled = true;
            });
            document.getElementById('checkBtn').style.display = 'none';

            showFeedbackBtn(
                correct ? 'correct' : 'incorrect',
                correct ? 'Correct!' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.',
                'Afronden', next
            );
        });
    }

    // ── SUMMARY ──────────────────────────────────────────────

    function renderSummary() {
        // Welke formules zijn gekend (beide keren juist)?
        const knownResults = {};
        FORMULAS.forEach(f => {
            knownResults[f.id] = (textResults[f.id] === true) && (figResults[f.id] === true);
        });

        const unknown      = FORMULAS.filter(f => !knownResults[f.id]);
        const allFormulas  = unknown.length === 0;
        const allCorrect   = allFormulas && q21Correct && q22Correct;
        const letterScore  = allCorrect ? 'A' : 'C';

        // Totaalscore berekenen
        const correctCount =
            FORMULAS.filter(f => textResults[f.id]).length +
            FORMULAS.filter(f => figResults[f.id]).length +
            (q21Correct ? 1 : 0) +
            (q22Correct ? 1 : 0);
        const score = Math.round((correctCount / TOTAL_Q) * 100);

        // Formularesultaten voor Firestore (via onComplete → drill.html)
        const formulaResults = {
            timestamp: new Date().toISOString(),
            results:   knownResults
        };

        // Overzicht opbouwen
        const cMessageHTML = letterScore === 'C'
            ? `<div class="df-c-message">
                   Om vlot te kunnen werken met omtrek en oppervlakte, moet je alle formules uit het hoofd kennen.
                   Dat is nog niet zo bij jou, dus blijf zeker oefenen!
               </div>`
            : '';

        let summaryBodyHTML;
        if (allFormulas) {
            summaryBodyHTML = `<p class="df-summary-good">Je kent alle formules!</p>`;
        } else {
            summaryBodyHTML = `
                <p class="df-summary-intro">Deze formules ken je nog niet goed:</p>
                <div class="df-unknown-list">
                    ${unknown.map(f => `
                        <div class="df-unknown-item">
                            <span class="df-unknown-label">${f.label} =</span>
                            <span class="df-unknown-answer">${DISPLAY[f.id]}</span>
                        </div>
                    `).join('')}
                </div>`;
        }

        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <h3 class="question-title">Overzicht</h3>
                    ${cMessageHTML}
                    ${summaryBodyHTML}
                    <div class="question-actions" style="margin-top:var(--spacing-xl);">
                        <button class="btn btn-primary" id="dfDoneBtn">Afronden</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('dfDoneBtn').addEventListener('click', () => {
            onComplete({
                score,
                correctAnswers: correctCount,
                totalQuestions: TOTAL_Q,
                xpEarned: allCorrect ? 50 : 10,
                letterScore,
                formulaResults
            });
        });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS() {
        if (['ex58-style', 'drill-formules-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'drill-formules-style';
        s.textContent = `
.df-formula-row {
    display: flex; align-items: flex-start; gap: var(--spacing-md);
    margin: var(--spacing-xl) 0; flex-wrap: wrap;
}
.df-formula-label {
    font-size: 1.1rem; font-weight: 600; white-space: nowrap;
    padding-top: 0.45rem;
}
.df-input-wrap { flex: 1; min-width: 200px; }
.df-formula-input {
    width: 100%; padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-large); font-family: monospace;
    border: 2px solid var(--color-gray); border-radius: var(--radius-md);
}
.df-formula-input:focus { outline: none; border-color: var(--color-primary); }
.df-formula-input:disabled { background: var(--color-light); }
.df-suggestion {
    margin-top: var(--spacing-xs); padding: var(--spacing-sm) var(--spacing-md);
    background: #fff8e1; border: 1px solid #ffe082; border-radius: var(--radius-md);
    font-size: var(--font-size-small); cursor: pointer; color: #555;
}
.df-suggestion:hover { background: #fff3cd; }
.figure-container {
    display: flex; justify-content: center; align-items: center;
    margin: var(--spacing-lg) 0; min-height: 200px;
}
.letter-inputs { display: flex; flex-direction: column; gap: var(--spacing-md); margin: var(--spacing-lg) 0; max-width: 500px; }
.letter-input-row { display: flex; align-items: center; gap: var(--spacing-md); }
.letter-label { min-width: 40px; font-size: var(--font-size-large); font-weight: 600; text-align: right; white-space: nowrap; }
.letter-input {
    flex: 1; padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-large); border: 2px solid var(--color-gray); border-radius: var(--radius-md);
}
.letter-input:focus { outline: none; border-color: var(--color-primary); }
.letter-input:disabled { background: var(--color-light); cursor: not-allowed; }
.letter-example {
    flex: 1; padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-large);
    background: var(--color-light); border: 2px solid var(--color-gray);
    border-radius: var(--radius-md); color: #555; font-style: italic;
}
.hint-text { font-size: var(--font-size-small); color: #666; margin: 0 0 var(--spacing-md) 0; }
.squared-helper {
    display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    margin-bottom: 1rem; padding: 0.75rem 1rem;
    background: #f0f7ff; border-radius: var(--radius-md); border: 1px solid #d0e4f7;
    font-size: var(--font-size-base);
}
.squared-insert-btn {
    background: #2c2c2c; color: #fff; border: 1px solid #111; border-bottom: 3px solid #000;
    border-radius: 5px; padding: 0.2rem 0.6rem; cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,.35);
    display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 0;
}
.squared-insert-btn .key-top  { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover  { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
.df-c-message {
    background: var(--color-warning); border-radius: var(--radius-md);
    padding: var(--spacing-md) var(--spacing-lg); margin-bottom: var(--spacing-xl);
    font-size: var(--font-size-base); color: #7a5500;
}
.df-summary-good { font-size: var(--font-size-large); color: #2d6a2d; margin-bottom: var(--spacing-lg); }
.df-summary-intro { font-size: var(--font-size-large); font-weight: 600; margin-bottom: var(--spacing-lg); }
.df-unknown-list { display: flex; flex-direction: column; gap: var(--spacing-sm); margin: var(--spacing-md) 0; }
.df-unknown-item {
    display: flex; align-items: center; gap: var(--spacing-lg);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-danger); border-radius: var(--radius-md);
}
.df-unknown-label { font-size: var(--font-size-large); min-width: 240px; }
.df-unknown-answer { font-size: var(--font-size-large); font-weight: 700; color: #721c24; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDrillFormules };
}
