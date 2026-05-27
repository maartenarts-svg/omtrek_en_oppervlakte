// ============================================
// OEFENING 3-2: FORMULES DRILL
// 10 vragen over omtrekformules
// ============================================

function init32FormulasDrill(container, onComplete) {
    addCustomCSS();

    // === DATA ===
    const DRAG_FORMULAS = [
        { id: 'f1', label: '<i>P</i> = 4<i>z</i>',             correct: ['vierkant', 'ruit'] },
        { id: 'f2', label: '<i>P</i> = 2(<i>b</i> + <i>h</i>)', correct: ['rechthoek'] },
        { id: 'f3', label: '<i>P</i> = som van de zijden',       correct: ['parallellogram', 'trapezium', 'vierhoek', 'driehoek'] }
    ];

    const FORMULA_OPTIONS = [
        { id: 'f1', label: '<i>P</i> = 4<i>z</i>' },
        { id: 'f2', label: '<i>P</i> = 2(<i>b</i> + <i>h</i>)' },
        { id: 'f3', label: '<i>P</i> = som van de zijden' }
    ];

    const FORMULA_CORRECT = {
        vierkant:      'f1',
        rechthoek:     'f2',
        ruit:          'f1',
        parallellogram:'f3',
        trapezium:     'f3',
        vierhoek:      'f3',
        driehoek:      'f3'
    };

    const ALL_SHAPES = ['vierkant', 'rechthoek', 'ruit', 'parallellogram', 'trapezium', 'vierhoek', 'driehoek'];
    const SHAPES_ORDER = shuffle([...ALL_SHAPES]);

    const TOTAL_QUESTIONS = 10;
    const MAX_POINTS = 14;

    // === STATE ===
    let currentQuestion = 1;
    let totalPoints = 0;
    let q1Attempts = 0;
    let radioAttempts = 0;
    let q9Attempt1Results = null;
    let q10Attempt1Results = null;

    // === HELPERS ===
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateShapeOpts(type) {
        const rotation = Math.floor(Math.random() * 72) * 5;
        const DRIEHOEKEN = [
            [{ value: 3, unit: 'cm' }, { value: 4, unit: 'cm' }, { value: 5, unit: 'cm' }],
            [{ value: 4, unit: 'cm' }, { value: 5, unit: 'cm' }, { value: 6, unit: 'cm' }],
            [{ value: 5, unit: 'cm' }, { value: 6, unit: 'cm' }, { value: 7, unit: 'cm' }],
            [{ value: 3, unit: 'cm' }, { value: 5, unit: 'cm' }, { value: 7, unit: 'cm' }],
            [{ value: 4, unit: 'cm' }, { value: 6, unit: 'cm' }, { value: 7, unit: 'cm' }]
        ];
        switch (type) {
            case 'vierkant':
                return { factor: 1, rotation, zijde: { value: pick([2,3,4,5,6]), unit: 'cm' } };
            case 'rechthoek':
                return { factor: 1, rotation,
                    breedte: { value: pick([2,3,4,5]), unit: 'cm' },
                    hoogte:  { value: pick([3,4,5,6,7]), unit: 'cm' } };
            case 'ruit':
                return { factor: 1, rotation, zijde: { value: pick([2,3,4,5]), unit: 'cm' } };
            case 'trapezium':
                return { factor: 1, rotation, zijden: [
                    { value: pick([2,3,4]), unit: 'cm' },
                    { value: pick([2,3,4]), unit: 'cm' },
                    { value: pick([5,6,7]), unit: 'cm' },
                    { value: pick([2,3,4]), unit: 'cm' }
                ]};
            case 'parallellogram':
                return { factor: 1, rotation,
                    basis: { value: pick([3,4,5,6]), unit: 'cm' },
                    zijde: { value: pick([2,3,4]), unit: 'cm' } };
            case 'driehoek':
                return { factor: 1, rotation, zijden: pick(DRIEHOEKEN) };
            case 'vierhoek':
                return { factor: 1, rotation, zijden: [
                    { value: pick([2,3,4]), unit: 'cm' },
                    { value: pick([3,4,5]), unit: 'cm' },
                    { value: pick([2,3,4]), unit: 'cm' },
                    { value: pick([3,4,5]), unit: 'cm' }
                ]};
        }
    }

    function fmtPoints(p) {
        return Number.isInteger(p) ? String(p) : p.toFixed(1);
    }

    // === NAVIGATION ===
    function next() {
        currentQuestion++;
        render();
    }

    function render() {
        if (currentQuestion === 1)       renderQ1();
        else if (currentQuestion <= 8)   renderRadioQ(currentQuestion - 2);
        else if (currentQuestion === 9)  renderQ9();
        else if (currentQuestion === 10) renderQ10();
    }

    function progressHTML() {
        const pct = ((currentQuestion - 1) / TOTAL_QUESTIONS) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQuestion} van ${TOTAL_QUESTIONS}</span>
                    <span class="progress-score">Punten: <strong>${fmtPoints(totalPoints)}</strong>/${MAX_POINTS}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    // === SHARED FEEDBACK HELPERS ===
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
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
    }

    // ============================================
    // Q1: DRAG & DROP
    // ============================================
    function renderQ1() {
        q1Attempts = 0;
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Omtrekformules</h3>
                    <p class="question-text">Sleep elke figuur naar de bijhorende formule voor de omtrek.</p>
                    <div class="items-pool" id="shapesPool">
                        <p class="pool-title">Figuren:</p>
                        <div class="pool-items" id="poolItems">
                            ${ALL_SHAPES.map(s => `
                                <div class="draggable-item" draggable="true" data-shape="${s}">${s}</div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="drop-zones formulas-grid" style="margin-top: var(--spacing-xl);">
                        ${DRAG_FORMULAS.map(f => `
                            <div class="drop-zone formula-drop-zone" data-formula="${f.id}">
                                <div class="zone-title formula-title">${f.label}</div>
                                <div class="zone-items" id="items-${f.id}"></div>
                            </div>
                        `).join('')}
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
        const pool = document.getElementById('poolItems');
        const poolContainer = document.getElementById('shapesPool');

        function attachDraggable(el) {
            el.addEventListener('dragstart', e => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', el.dataset.shape);
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => el.classList.remove('dragging'));
        }

        document.querySelectorAll('.draggable-item').forEach(attachDraggable);

        function setupDrop(el, onDrop) {
            el.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                el.classList.add('drag-over');
            });
            el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
            el.addEventListener('drop', e => {
                e.preventDefault();
                el.classList.remove('drag-over');
                const shape = e.dataTransfer.getData('text/plain');
                const draggable = document.querySelector(`.draggable-item[data-shape="${shape}"]`);
                if (draggable) onDrop(draggable);
            });
        }

        document.querySelectorAll('.formula-drop-zone').forEach(zone => {
            setupDrop(zone, d => zone.querySelector('.zone-items').appendChild(d));
        });
        setupDrop(poolContainer, d => pool.appendChild(d));
        document.getElementById('checkBtn').addEventListener('click', checkQ1);
    }

    function getQ1Placement() {
        const placement = {};
        ALL_SHAPES.forEach(s => { placement[s] = null; });
        DRAG_FORMULAS.forEach(f => {
            const el = document.getElementById(`items-${f.id}`);
            if (el) el.querySelectorAll('.draggable-item').forEach(item => {
                placement[item.dataset.shape] = f.id;
            });
        });
        return placement;
    }

    function checkQ1() {
        const placement = getQ1Placement();
        const unplaced = ALL_SHAPES.filter(s => placement[s] === null);
        if (unplaced.length > 0) {
            showFeedback('incorrect', 'Sleep eerst alle figuren naar een formule.');
            return;
        }

        q1Attempts++;
        const allCorrect = DRAG_FORMULAS.every(f => f.correct.every(s => placement[s] === f.id));

        if (allCorrect) {
            totalPoints += q1Attempts === 1 ? 1 : 0.5;
            lockDragging();
            const msg = q1Attempts === 1 ? 'Correct! Je kent de formules!' : 'Correct bij de tweede poging.';
            showFeedbackWithNext('correct', msg);
        } else if (q1Attempts === 1) {
            showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
        } else {
            lockDragging();
            const cols = DRAG_FORMULAS.map(f => `
                <div class="answer-column">
                    <h4>${f.label}</h4>
                    ${f.correct.map(s => `<div class="answer-item">${s}</div>`).join('')}
                </div>`).join('');
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Niet juist. Dit is de juiste oplossing:</p>
                    <div class="correct-answer-display formulas-grid" style="margin-top: var(--spacing-md);">${cols}</div>
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

    // ============================================
    // Q2-8: FIGUUR + RADIOBUTTONS
    // ============================================
    function renderRadioQ(shapeIndex) {
        radioAttempts = 0;
        const shape = SHAPES_ORDER[shapeIndex];
        const correctId = FORMULA_CORRECT[shape];
        const opts = generateShapeOpts(shape);

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Welke formule hoort bij deze figuur?</h3>
                    <div id="figureContainer" class="figure-container"></div>
                    <div class="radio-options">
                        ${FORMULA_OPTIONS.map(f => `
                            <label class="radio-option">
                                <input type="radio" name="formula" value="${f.id}">
                                <span>${f.label}</span>
                            </label>`).join('')}
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('figureContainer'), shape, opts);

        document.getElementById('checkBtn').addEventListener('click', () => {
            const selected = document.querySelector('input[name="formula"]:checked');
            if (!selected) {
                showFeedback('incorrect', 'Kies eerst een formule.');
                return;
            }

            radioAttempts++;
            if (selected.value === correctId) {
                totalPoints += radioAttempts === 1 ? 1 : 0.5;
                document.querySelectorAll('input[name="formula"]').forEach(r => r.disabled = true);
                document.getElementById('checkBtn').style.display = 'none';
                const msg = radioAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
                showFeedbackWithNext('correct', msg);
            } else if (radioAttempts === 1) {
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
                document.querySelectorAll('input[name="formula"]').forEach(r => r.checked = false);
            } else {
                document.querySelectorAll('input[name="formula"]').forEach(r => r.disabled = true);
                document.getElementById('checkBtn').style.display = 'none';
                const correctLabel = FORMULA_OPTIONS.find(f => f.id === correctId).label;
                showFeedbackWithNext('incorrect', `Niet juist. Het juiste antwoord is: ${correctLabel}`);
            }
        });
    }

    // ============================================
    // Q9: BETEKENIS Z, B, H
    // ============================================
    function renderQ9() {
        q9Attempt1Results = null;
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Wat betekenen de letters?</h3>
                    <p class="question-text">
                        In de formules <i>P</i> = 4<i>z</i> en <i>P</i> = 2(<i>b</i> + <i>h</i>) staat de letter <i>P</i> voor omtrek.<br>
                        Waarvoor staan de letters <i>z</i>, <i>b</i> en <i>h</i>?
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
                    </div>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;
        document.getElementById('checkBtn').addEventListener('click', checkQ9);
    }

    function checkQ9() {
        const vals = {
            z: document.getElementById('inputZ').value.trim().toLowerCase(),
            b: document.getElementById('inputB').value.trim().toLowerCase(),
            h: document.getElementById('inputH').value.trim().toLowerCase()
        };
        if (!vals.z || !vals.b || !vals.h) {
            showFeedback('incorrect', 'Vul alle vakken in.');
            return;
        }

        const results = {
            z: vals.z === 'zijde',
            b: vals.b === 'basis',
            h: vals.h === 'hoogte'
        };

        if (q9Attempt1Results === null) {
            if (results.z && results.b && results.h) {
                totalPoints += 3;
                lockInputs(['inputZ', 'inputB', 'inputH']);
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithNext('correct', 'Correct!');
            } else {
                q9Attempt1Results = { ...results };
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            }
        } else {
            let points = 0;
            if (q9Attempt1Results.z) points += 1; else if (results.z) points += 0.5;
            if (q9Attempt1Results.b) points += 1; else if (results.b) points += 0.5;
            if (q9Attempt1Results.h) points += 1; else if (results.h) points += 0.5;
            totalPoints += points;

            if (!results.z) document.getElementById('inputZ').value = 'zijde';
            if (!results.b) document.getElementById('inputB').value = 'basis';
            if (!results.h) document.getElementById('inputH').value = 'hoogte';

            lockInputs(['inputZ', 'inputB', 'inputH']);
            document.getElementById('checkBtn').style.display = 'none';
            const allOk = results.z && results.b && results.h;
            showFeedbackWithNext(
                allOk ? 'correct' : 'incorrect',
                allOk ? 'Correct bij de tweede poging.' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.'
            );
        }
    }

    // ============================================
    // Q10: FORMULES AANVULLEN
    // ============================================
    function renderQ10() {
        q10Attempt1Results = null;
        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">Vul de formule aan.</h3>
                    <div class="letter-inputs">
                        <div class="letter-input-row">
                            <label class="letter-label formula-label"><i>P</i><sub>vierkant</sub> =</label>
                            <input type="text" id="inputVierkant" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label formula-label"><i>P</i><sub>rechthoek</sub> =</label>
                            <input type="text" id="inputRechthoek" class="letter-input" autocomplete="off">
                        </div>
                        <div class="letter-input-row">
                            <label class="letter-label formula-label"><i>P</i><sub>ruit</sub> =</label>
                            <input type="text" id="inputRuit" class="letter-input" autocomplete="off">
                        </div>
                    </div>
                    <p class="hint-text">Tip: druk * voor het maalteken ·</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        ['inputVierkant', 'inputRechthoek', 'inputRuit'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', e => {
                if (e.key === '*') {
                    e.preventDefault();
                    const el = e.target;
                    const s = el.selectionStart, end = el.selectionEnd;
                    el.value = el.value.substring(0, s) + '·' + el.value.substring(end);
                    el.selectionStart = el.selectionEnd = s + 1;
                }
            });
        });

        document.getElementById('checkBtn').addEventListener('click', checkQ10);
    }

    function normalizeFormula(str) {
        return str.replace(/·/g, '').replace(/\s+/g, '');
    }

    function matchesFormula(input, expected) {
        const n = normalizeFormula(input);
        return expected.some(e => n === e);
    }

    function checkQ10() {
        const vals = {
            vierkant:  document.getElementById('inputVierkant').value,
            rechthoek: document.getElementById('inputRechthoek').value,
            ruit:      document.getElementById('inputRuit').value
        };
        if (!vals.vierkant.trim() || !vals.rechthoek.trim() || !vals.ruit.trim()) {
            showFeedback('incorrect', 'Vul alle vakken in.');
            return;
        }

        const results = {
            vierkant:  matchesFormula(vals.vierkant,  ['4z']),
            rechthoek: matchesFormula(vals.rechthoek, ['2(b+h)', '2(h+b)']),
            ruit:      matchesFormula(vals.ruit,       ['4z'])
        };

        if (q10Attempt1Results === null) {
            if (results.vierkant && results.rechthoek && results.ruit) {
                totalPoints += 3;
                lockInputs(['inputVierkant', 'inputRechthoek', 'inputRuit']);
                document.getElementById('checkBtn').style.display = 'none';
                showFeedbackWithFinish('correct', 'Correct!');
            } else {
                q10Attempt1Results = { ...results };
                showFeedback('incorrect', 'Dit klopt niet helemaal. Verbeter.');
            }
        } else {
            let points = 0;
            if (q10Attempt1Results.vierkant)  points += 1; else if (results.vierkant)  points += 0.5;
            if (q10Attempt1Results.rechthoek) points += 1; else if (results.rechthoek) points += 0.5;
            if (q10Attempt1Results.ruit)      points += 1; else if (results.ruit)      points += 0.5;
            totalPoints += points;

            if (!results.vierkant)  document.getElementById('inputVierkant').value  = '4z';
            if (!results.rechthoek) document.getElementById('inputRechthoek').value = '2(b+h)';
            if (!results.ruit)      document.getElementById('inputRuit').value      = '4z';

            lockInputs(['inputVierkant', 'inputRechthoek', 'inputRuit']);
            document.getElementById('checkBtn').style.display = 'none';
            const allOk = results.vierkant && results.rechthoek && results.ruit;
            showFeedbackWithFinish(
                allOk ? 'correct' : 'incorrect',
                allOk ? 'Correct bij de tweede poging.' : 'Niet helemaal juist. De juiste antwoorden zijn ingevuld.'
            );
        }
    }

    // ============================================
    // AFSLUITEN
    // ============================================
    function finish() {
        const score = Math.round((totalPoints / MAX_POINTS) * 100);
        onComplete({
            score,
            correctAnswers: totalPoints,
            totalQuestions: MAX_POINTS,
            xpEarned: Math.round(score / 10) * 3
        });
    }

    // ============================================
    // CSS
    // ============================================
    function addCustomCSS() {
        if (document.getElementById('formules-drill-32-css')) return;
        const style = document.createElement('style');
        style.id = 'formules-drill-32-css';
        style.textContent = `
            .formulas-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--spacing-lg);
            }
            .formula-drop-zone {
                min-height: 160px;
            }
            .formula-title {
                font-size: var(--font-size-large);
                font-weight: 700;
                padding-bottom: var(--spacing-sm);
                border-bottom: 2px solid var(--color-gray);
                margin-bottom: var(--spacing-md);
            }
            .figure-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: var(--spacing-lg) 0;
                min-height: 200px;
            }
            .radio-options {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin: var(--spacing-lg) 0;
            }
            .radio-option {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-md) var(--spacing-lg);
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: var(--font-size-large);
                transition: border-color var(--transition-fast), background var(--transition-fast);
            }
            .radio-option:hover {
                border-color: var(--color-primary);
                background: var(--color-light);
            }
            .radio-option input[type="radio"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
                flex-shrink: 0;
            }
            .letter-inputs {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                margin: var(--spacing-lg) 0;
                max-width: 480px;
            }
            .letter-input-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }
            .letter-label {
                min-width: 40px;
                font-size: var(--font-size-large);
                font-weight: 600;
                text-align: right;
                white-space: nowrap;
            }
            .formula-label {
                min-width: 175px;
            }
            .letter-input {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: var(--font-size-large);
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                transition: border-color var(--transition-fast);
            }
            .letter-input:focus {
                outline: none;
                border-color: var(--color-primary);
            }
            .letter-input:disabled {
                background: var(--color-light);
                cursor: not-allowed;
            }
            .letter-example {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: var(--font-size-large);
                background: var(--color-light);
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                color: #555;
                font-style: italic;
            }
            .hint-text {
                font-size: var(--font-size-small);
                color: #666;
                margin: 0 0 var(--spacing-md) 0;
            }
            @media (max-width: 600px) {
                .formulas-grid { grid-template-columns: 1fr; }
                .formula-label { min-width: 140px; }
            }
        `;
        document.head.appendChild(style);
    }

    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init32FormulasDrill };
}
