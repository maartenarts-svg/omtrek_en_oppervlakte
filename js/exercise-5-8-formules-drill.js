'use strict';

function init58FormulasDrill(container, onComplete) {
    addCSS58();

    // ── DATA ─────────────────────────────────────────────────

    const DRAG_ZONES = [
        { id: 'f1',  label: '4<i>z</i>',              correct: ['P_vierkant', 'P_ruit'] },
        { id: 'f2',  label: '2(<i>b</i> + <i>h</i>)', correct: ['P_rechthoek'] },
        { id: 'f4',  label: '2π<i>r</i>',             correct: ['P_cirkel'] },
        { id: 'f3',  label: 'som van de zijden',        correct: ['P_driehoek', 'P_parallellogram'] },
        { id: 'fA1', label: '<i>bh</i>',               correct: ['A_rechthoek', 'A_parallellogram'] },
        { id: 'fA2', label: '<i>z</i>²',               correct: ['A_vierkant'] }
    ];

    const DRAG_ITEMS = [
        { id: 'P_vierkant',       label: '<i>P</i><sub>vierkant</sub>' },
        { id: 'P_rechthoek',      label: '<i>P</i><sub>rechthoek</sub>' },
        { id: 'P_ruit',           label: '<i>P</i><sub>ruit</sub>' },
        { id: 'P_cirkel',         label: '<i>P</i><sub>cirkel</sub>' },
        { id: 'P_driehoek',       label: '<i>P</i><sub>driehoek</sub>' },
        { id: 'P_parallellogram', label: '<i>P</i><sub>parallellogram</sub>' },
        { id: 'A_vierkant',       label: '<i>A</i><sub>vierkant</sub>' },
        { id: 'A_rechthoek',      label: '<i>A</i><sub>rechthoek</sub>' },
        { id: 'A_parallellogram', label: '<i>A</i><sub>parallellogram</sub>' }
    ];

    const FORMULA_OPTIONS = [
        { id: '',    label: '—' },
        { id: 'f1',  label: '4<i>z</i>' },
        { id: 'f2',  label: '2(<i>b</i> + <i>h</i>)' },
        { id: 'f4',  label: '2π<i>r</i>' },
        { id: 'f3',  label: 'som van de zijden' },
        { id: 'fA1', label: '<i>bh</i>' },
        { id: 'fA2', label: '<i>z</i>²' }
    ];

    const VRAAG_SPECS = shuffle([
        { type: 'vierkant',              letter: '<i>P</i>', correctId: 'f1'  },
        { type: 'vierkant',              letter: '<i>A</i>', correctId: 'fA2' },
        { type: 'rechthoek',             letter: '<i>P</i>', correctId: 'f2'  },
        { type: 'rechthoek',             letter: '<i>A</i>', correctId: 'fA1' },
        { type: 'ruit',                  letter: '<i>P</i>', correctId: 'f1'  },
        { type: 'cirkel',                letter: '<i>P</i>', correctId: 'f4'  },
        { type: 'driehoek',              letter: '<i>P</i>', correctId: 'f3'  },
        { type: 'parallellogram',        letter: '<i>P</i>', correctId: 'f3'  },
        { type: 'vierhoek',              letter: '<i>P</i>', correctId: 'f3'  },
        { type: 'trapezium',             letter: '<i>P</i>', correctId: 'f3'  },
        { type: 'parallellogram-hoogte', letter: '<i>A</i>', correctId: 'fA1' }
    ]);

    const TOTAL_QUESTIONS = 15;
    const MAX_POINTS      = 26;

    // ── STATE ────────────────────────────────────────────────
    let currentQuestion    = 1;
    let totalPoints        = 0;
    let q1Attempts         = 0;
    let dropdownAttempts   = 0;
    let q13Attempt1Results = null;
    let q14Attempt1Results = null;
    let q15Attempt1Results = null;
    let docClickCleanup    = null;

    render();

    // ── NAVIGATIE ────────────────────────────────────────────
    function render() {
        if      (currentQuestion === 1)  renderQ1();
        else if (currentQuestion <= 12)  renderDropdownQ(currentQuestion - 2);
        else if (currentQuestion === 13) renderQ13();
        else if (currentQuestion === 14) renderQ14();
        else if (currentQuestion === 15) renderQ15();
        else                             finish();
    }

    function next() { currentQuestion++; render(); }

    // ── PROGRESS BAR ─────────────────────────────────────────
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

    // ── FEEDBACK HELPERS ─────────────────────────────────────
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

    function showFeedbackWithFinish(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="finishBtn">OK</button>
            </div>`;
        document.getElementById('finishBtn').addEventListener('click', finish);
    }

    function lockInputs(ids) {
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });
    }

    // ── Q1: DRAG & DROP ──────────────────────────────────────
    function renderQ1() {
        q1Attempts = 0;
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Formules voor omtrek en oppervlakte</h3>
                    <p class="question-text">Sleep elke notatie naar de bijhorende formule.</p>
                    <div class="items-pool" id="shapesPool">
                        <p class="pool-title">Te verslepen:</p>
                        <div class="pool-items" id="poolItems">
                            ${shuffle([...DRAG_ITEMS]).map(item =>
                                `<div class="draggable-item" draggable="true" data-id="${item.id}"><span>${item.label}</span></div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="ex58-zones-grid" style="margin-top: var(--spacing-xl);">
                        ${DRAG_ZONES.map(z => `
                            <div class="drop-zone ex58-drop-zone" data-zone="${z.id}">
                                <div class="zone-title formula-title">${z.label}</div>
                                <div class="zone-items" id="zone-${z.id}"></div>
                            </div>`).join('')}
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;
        initDragListeners();
    }

    function initDragListeners() {
        const pool          = document.getElementById('poolItems');
        const poolContainer = document.getElementById('shapesPool');

        function attachDraggable(el) {
            el.addEventListener('dragstart', e => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', el.dataset.id);
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => el.classList.remove('dragging'));
        }

        document.querySelectorAll('.draggable-item').forEach(attachDraggable);

        function setupDrop(el, onDrop) {
            el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
            el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
            el.addEventListener('drop', e => {
                e.preventDefault();
                el.classList.remove('drag-over');
                const id = e.dataTransfer.getData('text/plain');
                const draggable = document.querySelector(`.draggable-item[data-id="${id}"]`);
                if (draggable) onDrop(draggable);
            });
        }

        document.querySelectorAll('.ex58-drop-zone').forEach(zone =>
            setupDrop(zone, d => zone.querySelector('.zone-items').appendChild(d))
        );
        setupDrop(poolContainer, d => pool.appendChild(d));
        document.getElementById('checkBtn').addEventListener('click', checkQ1);
    }

    function getQ1Placement() {
        const placement = {};
        DRAG_ITEMS.forEach(item => { placement[item.id] = null; });
        DRAG_ZONES.forEach(z => {
            const el = document.getElementById(`zone-${z.id}`);
            if (el) el.querySelectorAll('.draggable-item').forEach(d => { placement[d.dataset.id] = z.id; });
        });
        return placement;
    }

    function checkQ1() {
        const placement = getQ1Placement();
        const unplaced  = DRAG_ITEMS.filter(item => placement[item.id] === null);
        if (unplaced.length > 0) {
            showFeedback('incorrect', 'Sleep eerst alle notaties naar een formule.');
            return;
        }

        q1Attempts++;
        const allCorrect = DRAG_ZONES.every(z => z.correct.every(id => placement[id] === z.id));

        if (allCorrect) {
            totalPoints += q1Attempts === 1 ? 1 : 0.5;
            lockDragging();
            showFeedbackWithNext('correct', q1Attempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
        } else if (q1Attempts === 1) {
            showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
        } else {
            lockDragging();
            const cols = DRAG_ZONES.map(z => `
                <div class="answer-column">
                    <h4>${z.label}</h4>
                    ${z.correct.map(id => {
                        const item = DRAG_ITEMS.find(i => i.id === id);
                        return `<div class="answer-item">${item.label}</div>`;
                    }).join('')}
                </div>`).join('');
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Niet juist. Dit is de juiste oplossing:</p>
                    <div class="ex58-zones-grid" style="margin-top: var(--spacing-md);">${cols}</div>
                    <button class="btn btn-primary" id="nextBtn" style="margin-top: var(--spacing-lg);">OK</button>
                </div>`;
            document.getElementById('nextBtn').addEventListener('click', next);
        }
    }

    function lockDragging() {
        document.querySelectorAll('.draggable-item').forEach(el => {
            el.setAttribute('draggable', 'false');
            el.style.cursor = 'default';
        });
        const btn = document.getElementById('checkBtn');
        if (btn) btn.style.display = 'none';
    }

    // ── Q2–Q12: FIGUUR + CUSTOM SELECT ──────────────────────
    function renderDropdownQ(idx) {
        dropdownAttempts = 0;
        const spec       = VRAAG_SPECS[idx];
        const figOpts    = generateShapeOpts(spec.type);
        const correctOpt = FORMULA_OPTIONS.find(o => o.id === spec.correctId);

        const csOptsHtml = FORMULA_OPTIONS.map(o =>
            `<div class="ex58-cs-opt" data-value="${o.id}">${o.label}</div>`
        ).join('');

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Kies de juiste formule.</h3>
                    <div id="figContainer" class="figure-container"></div>
                    <div class="ex58-formula-row">
                        <span class="ex58-letter">${spec.letter} =</span>
                        <div class="ex58-cs" id="ex58-cs" data-value="">
                            <div class="ex58-cs-display">—</div>
                            <div class="ex58-cs-list" hidden>${csOptsHtml}</div>
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('figContainer'), spec.type, figOpts);
        initCS('ex58-cs');

        document.getElementById('checkBtn').addEventListener('click', () => {
            const cs     = document.getElementById('ex58-cs');
            const chosen = cs.dataset.value;
            if (!chosen) { showFeedback('incorrect', 'Kies eerst een formule.'); return; }

            dropdownAttempts++;
            if (chosen === spec.correctId) {
                totalPoints += dropdownAttempts === 1 ? 1 : 0.5;
                cs.style.pointerEvents = 'none';
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithNext('correct', dropdownAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (dropdownAttempts === 1) {
                showFeedback('incorrect', 'Dit klopt niet helemaal. Probeer nog een keer.<br>Kijk zeker eens naar de opgave. Wat wordt gevraagd? De formule voor de omtrek (<i>P</i>) of voor de oppervlakte (<i>A</i>).');
                cs.dataset.value = '';
                cs.querySelector('.ex58-cs-display').innerHTML = '—';
            } else {
                cs.style.pointerEvents = 'none';
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithNext('incorrect', `Niet juist. Het juiste antwoord is: ${correctOpt.label}`);
            }
        });
    }

    // ── Q13: LETTERS OMTREK ──────────────────────────────────
    function renderQ13() {
        q13Attempt1Results = null;
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
                            <input type="text" id="inputZ" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>b</i>:</label>
                            <input type="text" id="inputB" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>h</i>:</label>
                            <input type="text" id="inputH" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>r</i>:</label>
                            <input type="text" id="inputR" class="letter-input" autocomplete="off">
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;
        document.getElementById('checkBtn').addEventListener('click', checkQ13);
    }

    function checkQ13() {
        const vals = {
            z: document.getElementById('inputZ').value.trim().toLowerCase(),
            b: document.getElementById('inputB').value.trim().toLowerCase(),
            h: document.getElementById('inputH').value.trim().toLowerCase(),
            r: document.getElementById('inputR').value.trim().toLowerCase()
        };
        if (!vals.z || !vals.b || !vals.h || !vals.r) {
            showFeedback('incorrect', 'Vul alle vakken in.');
            return;
        }

        const results = {
            z: vals.z === 'zijde',
            b: vals.b === 'basis',
            h: vals.h === 'hoogte',
            r: vals.r === 'straal'
        };

        if (q13Attempt1Results === null) {
            if (results.z && results.b && results.h && results.r) {
                totalPoints += 4;
                lockInputs(['inputZ', 'inputB', 'inputH', 'inputR']);
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithNext('correct', 'Correct!');
            } else {
                q13Attempt1Results = { ...results };
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            }
        } else {
            let points = 0;
            if (q13Attempt1Results.z) points += 1; else if (results.z) points += 0.5;
            if (q13Attempt1Results.b) points += 1; else if (results.b) points += 0.5;
            if (q13Attempt1Results.h) points += 1; else if (results.h) points += 0.5;
            if (q13Attempt1Results.r) points += 1; else if (results.r) points += 0.5;
            totalPoints += points;

            if (!results.z) document.getElementById('inputZ').value = 'zijde';
            if (!results.b) document.getElementById('inputB').value = 'basis';
            if (!results.h) document.getElementById('inputH').value = 'hoogte';
            if (!results.r) document.getElementById('inputR').value = 'straal';

            lockInputs(['inputZ', 'inputB', 'inputH', 'inputR']);
            document.getElementById('checkBtn').style.display = 'none';
            const allOk = results.z && results.b && results.h && results.r;
            showFeedbackWithNext(
                allOk ? 'correct' : 'incorrect',
                allOk ? 'Correct bij de tweede poging.' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.'
            );
        }
    }

    // ── Q14: LETTERS OPPERVLAKTE ─────────────────────────────
    function renderQ14() {
        q14Attempt1Results = null;
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
                            <input type="text" id="inputB" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>h</i>:</label>
                            <input type="text" id="inputH" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label"><i>z</i>:</label>
                            <input type="text" id="inputZ" class="letter-input" autocomplete="off">
                        </div>
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;
        document.getElementById('checkBtn').addEventListener('click', checkQ14);
    }

    function checkQ14() {
        const vals = {
            b: document.getElementById('inputB').value.trim().toLowerCase(),
            h: document.getElementById('inputH').value.trim().toLowerCase(),
            z: document.getElementById('inputZ').value.trim().toLowerCase()
        };
        if (!vals.b || !vals.h || !vals.z) {
            showFeedback('incorrect', 'Vul alle vakken in.');
            return;
        }

        const results = {
            b: vals.b === 'basis',
            h: vals.h === 'hoogte',
            z: vals.z === 'zijde'
        };

        if (q14Attempt1Results === null) {
            if (results.b && results.h && results.z) {
                totalPoints += 3;
                lockInputs(['inputB', 'inputH', 'inputZ']);
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithNext('correct', 'Correct!');
            } else {
                q14Attempt1Results = { ...results };
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            }
        } else {
            let points = 0;
            if (q14Attempt1Results.b) points += 1; else if (results.b) points += 0.5;
            if (q14Attempt1Results.h) points += 1; else if (results.h) points += 0.5;
            if (q14Attempt1Results.z) points += 1; else if (results.z) points += 0.5;
            totalPoints += points;

            if (!results.b) document.getElementById('inputB').value = 'basis';
            if (!results.h) document.getElementById('inputH').value = 'hoogte';
            if (!results.z) document.getElementById('inputZ').value = 'zijde';

            lockInputs(['inputB', 'inputH', 'inputZ']);
            document.getElementById('checkBtn').style.display = 'none';
            const allOk = results.b && results.h && results.z;
            showFeedbackWithNext(
                allOk ? 'correct' : 'incorrect',
                allOk ? 'Correct bij de tweede poging.' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.'
            );
        }
    }

    // ── Q15: FORMULES AANVULLEN ──────────────────────────────
    function renderQ15() {
        q15Attempt1Results = null;
        const FIELDS = [
            { id: 'inVierkantP',       label: '<i>P</i><sub>vierkant</sub> =' },
            { id: 'inRechthoekP',      label: '<i>P</i><sub>rechthoek</sub> =' },
            { id: 'inRuitP',           label: '<i>P</i><sub>ruit</sub> =' },
            { id: 'inCirkelP',         label: '<i>P</i><sub>cirkel</sub> =' },
            { id: 'inRechthoekA',      label: '<i>A</i><sub>rechthoek</sub> =' },
            { id: 'inVierkantA',       label: '<i>A</i><sub>vierkant</sub> =' },
            { id: 'inParallellogramA', label: '<i>A</i><sub>parallellogram</sub> =' }
        ];

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Vul de formules aan.</h3>
                    <div class="letter-inputs">
                        ${FIELDS.map(f => `
                        <div class="letter-input-row">
                            <label class="letter-label formula-label">${f.label}</label>
                            <input type="text" id="${f.id}" class="letter-input" autocomplete="off">
                        </div>`).join('')}
                    </div>
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>
                    <p class="hint-text">Tip: druk <kbd>*</kbd> voor het maalteken · &nbsp;|&nbsp; typ <kbd>pi</kbd> voor π</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        let lastFocused = null;
        FIELDS.forEach(f => {
            const el = document.getElementById(f.id);
            el.addEventListener('focus', () => { lastFocused = el; });
            el.addEventListener('keydown', e => {
                if (e.key === '*') {
                    e.preventDefault();
                    const s = el.selectionStart, end = el.selectionEnd;
                    el.value = el.value.substring(0, s) + '·' + el.value.substring(end);
                    el.selectionStart = el.selectionEnd = s + 1;
                }
            });
            el.addEventListener('input', () => {
                const old    = el.value;
                const newVal = old.replace(/pi/gi, 'π');
                if (newVal !== old) {
                    const cursor = el.selectionStart;
                    const diff   = old.length - newVal.length;
                    el.value = newVal;
                    el.selectionStart = el.selectionEnd = Math.max(0, cursor - diff);
                }
            });
        });

        document.getElementById('squaredBtn').addEventListener('click', () => {
            const target = lastFocused || document.getElementById('inVierkantA');
            if (target && !target.disabled) {
                const s = target.selectionStart, end = target.selectionEnd;
                target.value = target.value.slice(0, s) + '²' + target.value.slice(end);
                target.selectionStart = target.selectionEnd = s + 1;
                target.focus();
            }
        });

        document.getElementById('checkBtn').addEventListener('click', checkQ15);
    }

    function normalizeFormula(str) {
        return str.replace(/·/g, '').replace(/\s+/g, '');
    }

    function matchesFormula(input, expected) {
        const n = normalizeFormula(input);
        return expected.some(e => n === e);
    }

    function checkQ15() {
        const IDS = ['inVierkantP', 'inRechthoekP', 'inRuitP', 'inCirkelP', 'inRechthoekA', 'inVierkantA', 'inParallellogramA'];
        const vals = {};
        IDS.forEach(id => { vals[id] = document.getElementById(id).value; });
        if (IDS.some(id => !vals[id].trim())) {
            showFeedback('incorrect', 'Vul alle vakken in.');
            return;
        }

        const CORRECT_VALS = {
            inVierkantP:       '4z',
            inRechthoekP:      '2(b+h)',
            inRuitP:           '4z',
            inCirkelP:         '2πr',
            inRechthoekA:      'bh',
            inVierkantA:       'z²',
            inParallellogramA: 'bh'
        };

        const results = {
            inVierkantP:       matchesFormula(vals.inVierkantP,       ['4z']),
            inRechthoekP:      matchesFormula(vals.inRechthoekP,      ['2(b+h)', '2(h+b)']),
            inRuitP:           matchesFormula(vals.inRuitP,           ['4z']),
            inCirkelP:         matchesFormula(vals.inCirkelP,         ['2πr', '2rπ']),
            inRechthoekA:      matchesFormula(vals.inRechthoekA,      ['bh', 'hb']),
            inVierkantA:       matchesFormula(vals.inVierkantA,       ['z²']),
            inParallellogramA: matchesFormula(vals.inParallellogramA, ['bh', 'hb'])
        };

        if (q15Attempt1Results === null) {
            if (Object.values(results).every(Boolean)) {
                totalPoints += 7;
                lockInputs(IDS);
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithFinish('correct', 'Correct!');
            } else {
                q15Attempt1Results = { ...results };
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            }
        } else {
            let points = 0;
            IDS.forEach(id => {
                if (q15Attempt1Results[id]) points += 1;
                else if (results[id])        points += 0.5;
                else                         document.getElementById(id).value = CORRECT_VALS[id];
            });
            totalPoints += points;
            lockInputs(IDS);
            document.getElementById('checkBtn').style.display = 'none';
            const allOk = Object.values(results).every(Boolean);
            showFeedbackWithFinish(
                allOk ? 'correct' : 'incorrect',
                allOk ? 'Correct bij de tweede poging.' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.'
            );
        }
    }

    // ── CUSTOM SELECT ────────────────────────────────────────
    function initCS(id) {
        const sel     = document.getElementById(id);
        const display = sel.querySelector('.ex58-cs-display');
        const list    = sel.querySelector('.ex58-cs-list');

        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        docClickCleanup = () => { if (list) list.hidden = true; };
        document.addEventListener('click', docClickCleanup);

        display.addEventListener('click', e => { e.stopPropagation(); list.hidden = !list.hidden; });

        sel.querySelectorAll('.ex58-cs-opt').forEach(opt => {
            opt.addEventListener('click', e => {
                e.stopPropagation();
                sel.dataset.value = opt.dataset.value;
                display.innerHTML = opt.innerHTML || '—';
                list.hidden = true;
            });
        });
    }

    // ── FIGUUR GENERATIE ─────────────────────────────────────
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function generateShapeOpts(type) {
        const rotation   = Math.floor(Math.random() * 72) * 5;
        const DRIEHOEKEN = [
            [{ value: 3, unit: 'cm' }, { value: 4, unit: 'cm' }, { value: 5, unit: 'cm' }],
            [{ value: 4, unit: 'cm' }, { value: 5, unit: 'cm' }, { value: 6, unit: 'cm' }],
            [{ value: 5, unit: 'cm' }, { value: 6, unit: 'cm' }, { value: 7, unit: 'cm' }]
        ];
        switch (type) {
            case 'vierkant':
                return { factor: 1, rotation, zijde: { value: pick([2,3,4,5,6]), unit: 'cm' } };
            case 'rechthoek':
                return { factor: 1, rotation,
                    breedte: { value: pick([2,3,4,5]),   unit: 'cm' },
                    hoogte:  { value: pick([3,4,5,6,7]), unit: 'cm' } };
            case 'ruit':
                return { factor: 1, rotation, zijde: { value: pick([2,3,4,5]), unit: 'cm' } };
            case 'trapezium':
                return { factor: 1, rotation, zijden: [
                    { value: pick([2,3,4]), unit: 'cm' }, { value: pick([2,3,4]), unit: 'cm' },
                    { value: pick([5,6,7]), unit: 'cm' }, { value: pick([2,3,4]), unit: 'cm' }
                ]};
            case 'parallellogram':
                return { factor: 1, rotation,
                    basis: { value: pick([3,4,5,6]), unit: 'cm' },
                    zijde: { value: pick([2,3,4]),   unit: 'cm' } };
            case 'parallellogram-hoogte':
                return { factor: 1, rotation,
                    basis: { value: pick([3,4,5,6]), unit: 'cm' },
                    zijde: { value: pick([2,3,4]),   unit: 'cm' } };
            case 'driehoek':
                return { factor: 1, rotation, zijden: pick(DRIEHOEKEN) };
            case 'vierhoek':
                return { factor: 1, rotation, zijden: [
                    { value: pick([2,3,4]), unit: 'cm' }, { value: pick([3,4,5]), unit: 'cm' },
                    { value: pick([2,3,4]), unit: 'cm' }, { value: pick([3,4,5]), unit: 'cm' }
                ]};
            case 'cirkel':
                return { factor: 1, straal: { value: pick([2,3,4,5,6]), unit: 'cm' } };
        }
    }

    // ── FINISH ───────────────────────────────────────────────
    function finish() {
        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 50);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
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
    function addCSS58() {
        if (document.getElementById('ex58-style')) return;
        const s = document.createElement('style');
        s.id = 'ex58-style';
        s.textContent = `
.ex58-zones-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-lg);
}
.ex58-drop-zone {
    min-height: 120px; border: 2px dashed var(--color-gray, #ccc);
    border-radius: var(--radius-md, 8px); padding: var(--spacing-md);
}
.ex58-formula-row {
    display: flex; align-items: center; gap: var(--spacing-md); margin: var(--spacing-lg) 0;
}
.ex58-letter { font-size: 1.1rem; white-space: nowrap; }
.ex58-cs { position: relative; display: inline-block; min-width: 210px; }
.ex58-cs-display {
    padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray, #ccc);
    border-radius: var(--radius-md, 6px); cursor: pointer; background: #fff;
    font-size: var(--font-size-base, 0.95rem); min-height: 1.8rem;
    display: flex; align-items: center; user-select: none;
}
.ex58-cs-display:hover { border-color: var(--color-primary, #4a7a10); }
.ex58-cs-list {
    position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff;
    border: 2px solid var(--color-primary, #4a7a10); border-radius: var(--radius-md, 6px);
    z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,.15);
}
.ex58-cs-opt {
    padding: 0.45rem 0.6rem; cursor: pointer;
    font-size: var(--font-size-base, 0.95rem); min-height: 1.8rem;
    display: flex; align-items: center;
}
.ex58-cs-opt:hover { background: var(--color-light, #f0f7e0); }
.formula-title {
    font-size: var(--font-size-large); font-weight: 700;
    padding-bottom: var(--spacing-sm); border-bottom: 2px solid var(--color-gray);
    margin-bottom: var(--spacing-md);
}
.figure-container {
    display: flex; justify-content: center; align-items: center;
    margin: var(--spacing-lg) 0; min-height: 200px;
}
.letter-inputs { display: flex; flex-direction: column; gap: var(--spacing-md); margin: var(--spacing-lg) 0; max-width: 500px; }
.letter-input-row { display: flex; align-items: center; gap: var(--spacing-md); }
.letter-label { min-width: 40px; font-size: var(--font-size-large); font-weight: 600; text-align: right; white-space: nowrap; }
.formula-label { min-width: 220px; }
.letter-input {
    flex: 1; padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-large); border: 2px solid var(--color-gray);
    border-radius: var(--radius-md);
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
.squared-insert-btn .key-top { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
@media (max-width: 640px) { .ex58-zones-grid { grid-template-columns: repeat(2, 1fr); } .formula-label { min-width: 170px; } }
@media (max-width: 400px) { .ex58-zones-grid { grid-template-columns: 1fr; } }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init58FormulasDrill };
}
