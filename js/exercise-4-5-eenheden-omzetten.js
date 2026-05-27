// ============================================
// OEFENING 4-5: EENHEDEN OMZETTEN (OPPERVLAKTE)
// ============================================
// 4 fases, elke fase minimaal 3 oefeningen
// 3× juist achter elkaar → volgende fase
// Dynamische vooruitgang met n-3 logica
// Grondtal 100 (oppervlakte-eenheden: 1 stap = ×100)
// ============================================

function initOppervlakteEenhedenOmzetten(container, onComplete) {
    const UNITS = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];
    const POWERS = ['100', '100²', '100³', '100⁴', '100⁵', '100⁶'];

    function displayUnit(unit) {
        return unit.replace('²', '<sup>2</sup>');
    }

    let currentPhase = 1;
    let phaseStreak = 0;
    let correctAnswers = 0;
    let totalRequired = 12;
    let totalQuestions = 0;
    let currentQuestion = null;
    let attempts = 0;

    function generateQuestion() {
        let An, Bn;
        do {
            An = Math.floor(Math.random() * 7);
            Bn = Math.floor(Math.random() * 7);
        } while (An === Bn);

        const A = UNITS[An];
        const B = UNITS[Bn];
        const C = Math.abs(An - Bn);
        const power = C === 1 ? '100' : `100${getSuper(C)}`;
        const direction = An < Bn ? 'groter' : 'kleiner';

        return { A, B, An, Bn, C, power, direction };
    }

    function getSuper(n) {
        const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        return String(n).split('').map(d => supers[parseInt(d)]).join('');
    }

    function createLadderSVG(showArrow = false, An = 0, Bn = 3) {
        const width = 200;
        const height = 350;

        let svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                <rect x="165" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                ${UNITS.map((unit, i) => {
                    const y = 25 + i * 48;
                    return `
                        <rect x="35" y="${y}" width="130" height="12" fill="#FFE5A3" stroke="#FFD580" stroke-width="2" rx="4"/>
                        <text x="100" y="${y + 22}" text-anchor="middle" font-size="16" font-weight="600" fill="#2C3E50">
                            ${unit}
                        </text>
                    `;
                }).join('')}
        `;

        if (showArrow) {
            const y1 = 31 + 48 * An;
            const y2 = 31 + 48 * Bn;
            const arrowColor = '#C8A8E5';

            svg += `
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                        <polygon points="0 0, 10 5, 0 10" fill="${arrowColor}" />
                    </marker>
                </defs>
                <line x1="60" y1="${y1}" x2="60" y2="${y2}"
                      stroke="${arrowColor}" stroke-width="4" marker-end="url(#arrowhead)" />
            `;
        }

        svg += `</svg>`;
        return svg;
    }

    function updateProgressBar() {
        const progress = Math.max(0, Math.min(100, (correctAnswers / totalRequired) * 100));
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) progressFill.style.width = `${progress}%`;
    }

    function showValidationError(message) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-incorrect">
                <p class="feedback-text">${message}</p>
            </div>
        `;
    }

    function render() {
        currentQuestion = generateQuestion();
        attempts = 0;
        totalQuestions++;

        const progress = Math.max(0, Math.min(100, (correctAnswers / totalRequired) * 100));

        let questionHTML = '';

        if (currentPhase === 1) {
            questionHTML = `1 ${displayUnit(currentQuestion.A)} is ${currentQuestion.power} keer <select id="directionSelect" class="inline-select">
                <option value="">...</option>
                <option value="groter">groter</option>
                <option value="kleiner">kleiner</option>
            </select> dan 1 ${displayUnit(currentQuestion.B)}.`;

        } else if (currentPhase === 2) {
            questionHTML = `1 ${displayUnit(currentQuestion.A)} is <select id="powerSelect" class="inline-select">
                <option value="">...</option>
                ${POWERS.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select> keer ${currentQuestion.direction} dan 1 ${displayUnit(currentQuestion.B)}.`;

        } else if (currentPhase === 3) {
            questionHTML = `1 ${displayUnit(currentQuestion.A)} is <select id="powerSelect" class="inline-select">
                <option value="">...</option>
                ${POWERS.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select> keer <select id="directionSelect" class="inline-select">
                <option value="">...</option>
                <option value="groter">groter</option>
                <option value="kleiner">kleiner</option>
            </select> dan 1 ${displayUnit(currentQuestion.B)}.`;

        } else {
            questionHTML = `1 ${displayUnit(currentQuestion.A)} is ${currentQuestion.power} keer ${currentQuestion.direction} dan 1 <select id="unitSelect" class="inline-select">
                <option value="">...</option>
                ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
            </select>.`;
        }

        container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Fase ${currentPhase} van 4</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">Voortgang: ${Math.round(progress)}%</div>
                </div>

                <div class="question-card">
                    <h3 class="question-title">Vul aan</h3>
                    <p class="question-text-large">${questionHTML}</p>

                    <div class="reference-button-area">
                        <button class="btn btn-secondary" id="ladderBtn">
                            📏 Klik hier voor de eenhedenladder
                        </button>
                    </div>

                    <div id="feedbackArea" class="feedback-area"></div>

                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>

            <div class="modal-overlay" id="ladderModal">
                <div class="modal-content" style="max-width: 400px;">
                    <h2>Eenhedenladder</h2>
                    <div class="ladder-display">
                        ${createLadderSVG(false)}
                    </div>
                    <div class="modal-actions" style="margin-top: 1.5rem;">
                        <button class="btn btn-primary" id="closeLadderBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('checkBtn').addEventListener('click', checkAnswer);
        document.getElementById('ladderBtn').addEventListener('click', () => {
            document.getElementById('ladderModal').classList.add('active');
        });
        document.getElementById('closeLadderBtn').addEventListener('click', () => {
            document.getElementById('ladderModal').classList.remove('active');
        });
        document.getElementById('ladderModal').addEventListener('click', (e) => {
            if (e.target.id === 'ladderModal') {
                document.getElementById('ladderModal').classList.remove('active');
            }
        });
    }

    function checkAnswer() {
        const q = currentQuestion;

        if (currentPhase === 1) {
            if (!document.getElementById('directionSelect').value) {
                showValidationError('Kies eerst een optie uit de lijst.');
                return;
            }
        } else if (currentPhase === 2) {
            if (!document.getElementById('powerSelect').value) {
                showValidationError('Kies eerst een macht uit de lijst.');
                return;
            }
        } else if (currentPhase === 3) {
            const dir = document.getElementById('directionSelect');
            const pow = document.getElementById('powerSelect');
            if (!dir.value || !pow.value) {
                showValidationError('Kies eerst beide opties uit de lijsten.');
                return;
            }
        } else if (currentPhase === 4) {
            if (!document.getElementById('unitSelect').value) {
                showValidationError('Kies eerst een eenheid uit de lijst.');
                return;
            }
        }

        attempts++;
        let isCorrect = false;
        let wrongDirection = false;
        let wrongPower = false;
        let wrongUnit = false;

        if (currentPhase === 1) {
            const dirSelect = document.getElementById('directionSelect');
            isCorrect = dirSelect.value === q.direction;
            wrongDirection = !isCorrect && dirSelect.value !== '';

        } else if (currentPhase === 2) {
            const powerSelect = document.getElementById('powerSelect');
            isCorrect = powerSelect.value === q.power;
            wrongPower = !isCorrect && powerSelect.value !== '';

        } else if (currentPhase === 3) {
            const dirSelect = document.getElementById('directionSelect');
            const powerSelect = document.getElementById('powerSelect');
            const dirCorrect = dirSelect.value === q.direction;
            const powerCorrect = powerSelect.value === q.power;
            isCorrect = dirCorrect && powerCorrect;
            wrongDirection = !dirCorrect && dirSelect.value !== '';
            wrongPower = !powerCorrect && powerSelect.value !== '';

        } else {
            const unitSelect = document.getElementById('unitSelect');
            isCorrect = unitSelect.value === q.B;
            wrongUnit = !isCorrect && unitSelect.value !== '';
        }

        if (isCorrect) {
            correctAnswers++;
            phaseStreak++;
            updateProgressBar();

            if (phaseStreak >= 3) {
                if (currentPhase === 4) {
                    finish();
                } else {
                    showPhaseComplete();
                }
            } else {
                showFeedback(true, attempts);
            }
        } else {
            const maxAttempts = (currentPhase === 1 || currentPhase === 2) ? 1 : 2;

            if (attempts < maxAttempts) {
                showFeedback(false, attempts, true, wrongDirection, wrongPower, wrongUnit);
            } else {
                totalRequired += (phaseStreak + 1);
                updateProgressBar();
                phaseStreak = 0;
                showFeedback(false, attempts, false, wrongDirection, wrongPower, wrongUnit);
            }
        }
    }

    function showFeedback(correct, attemptNum, canRetry, wrongDir = false, wrongPow = false, wrongUnit = false) {
        const feedbackArea = document.getElementById('feedbackArea');
        const checkBtn = document.getElementById('checkBtn');
        const q = currentQuestion;

        checkBtn.style.display = 'none';

        if (correct) {
            const message = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${message}</p>
                    <button class="btn btn-primary" onclick="window.nextUnitConversion()">OK</button>
                </div>
            `;
        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Gebruik de afbeelding van de eenhedenladder.</p>
                    <button class="btn btn-primary" onclick="window.retryUnitConversion()">OK</button>
                </div>
            `;
        } else {
            let feedback = '';

            if (currentPhase === 1) {
                const pos = q.An > q.Bn ? 'onder' : 'boven';
                const dir = q.An > q.Bn ? 'kleiner' : 'groter';
                feedback = `Op de ladder staat de eenheid ${displayUnit(q.A)} ${pos} de eenheid ${displayUnit(q.B)}. 1 ${displayUnit(q.A)} is dus ${dir} dan 1 ${displayUnit(q.B)}.`;

            } else if (currentPhase === 2) {
                const pos = q.An > q.Bn ? 'onder' : 'boven';
                feedback = `Op de ladder staat de eenheid ${displayUnit(q.A)} ${q.C} trap${q.C > 1 ? 'pen' : ''} ${pos} de eenheid ${displayUnit(q.B)}.`;

            } else if (currentPhase === 3) {
                if (wrongDir) {
                    const pos = q.An > q.Bn ? 'onder' : 'boven';
                    const dir = q.An > q.Bn ? 'kleiner' : 'groter';
                    feedback += `Op de ladder staat de eenheid ${displayUnit(q.A)} ${pos} de eenheid ${displayUnit(q.B)}. 1 ${displayUnit(q.A)} is dus ${dir} dan 1 ${displayUnit(q.B)}.<br>`;
                }
                if (wrongPow) {
                    const pos = q.An > q.Bn ? 'onder' : 'boven';
                    feedback += `Op de ladder staat de eenheid ${displayUnit(q.A)} ${q.C} trap${q.C > 1 ? 'pen' : ''} ${pos} de eenheid ${displayUnit(q.B)}.`;
                }

            } else {
                const dir1 = q.direction === 'kleiner' ? 'kleiner' : 'groter';
                const pos1 = q.direction === 'kleiner' ? 'boven' : 'onder';
                const pos2 = q.direction === 'kleiner' ? 'boven' : 'onder';
                feedback = `In de opgave staat dat 1 ${displayUnit(q.A)} ${dir1} is dan de eenheid die je moet antwoorden. Die nieuwe eenheid ligt dus ${pos1} de eenheid 1 ${displayUnit(q.A)}.<br>In de opgave staat ook dat 1 ${displayUnit(q.A)} ${q.power} keer ${q.direction} is dan de eenheid die we zoeken. Je moet dus op de ladder ${q.C} stap${q.C > 1 ? 'pen' : ''} naar ${pos2}.`;
            }

            const correctSentence = `1 ${displayUnit(q.A)} is <span style="color: var(--color-primary); font-weight: 700;">${q.power}</span> keer <span style="color: var(--color-primary); font-weight: 700;">${q.direction}</span> dan 1 <span style="color: var(--color-primary); font-weight: 700;">${displayUnit(q.B)}</span>.`;

            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <div class="ladder-display" style="margin-bottom: 1rem;">
                        ${createLadderSVG(true, q.An, q.Bn)}
                    </div>
                    <p class="feedback-text">${feedback}</p>
                    <p style="margin-top: 1rem;">${correctSentence}</p>
                    <button class="btn btn-primary" onclick="window.nextUnitConversion()">OK</button>
                </div>
            `;
        }

        container.querySelectorAll('select').forEach(s => s.disabled = true);
    }

    function showPhaseComplete() {
        const feedbackArea = document.getElementById('feedbackArea');
        document.getElementById('checkBtn').style.display = 'none';

        feedbackArea.innerHTML = `
            <div class="feedback-message feedback-correct">
                <h3>🎉 Fase ${currentPhase} voltooid!</h3>
                <p class="feedback-text">Je gaat nu naar fase ${currentPhase + 1}.</p>
                <button class="btn btn-primary" onclick="window.nextPhase()">Volgende fase →</button>
            </div>
        `;
    }

    window.nextPhase = function() {
        currentPhase++;
        phaseStreak = 0;
        render();
    };

    window.nextUnitConversion = function() {
        render();
    };

    window.retryUnitConversion = function() {
        document.getElementById('feedbackArea').innerHTML = '';
        document.getElementById('checkBtn').style.display = 'block';
        container.querySelectorAll('select').forEach(s => {
            s.value = '';
            s.disabled = false;
        });
    };

    function finish() {
        const ratio = correctAnswers / totalQuestions;
        const letterScore = ratio >= 0.85 ? 'A' : 'B';
        const xp = ratio >= 0.85 ? 80 : 50;

        onComplete({
            score: ratio * 100,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            xpEarned: xp,
            letterScore: letterScore
        });
    }

    addCSS();

    function addCSS() {
        if (document.getElementById('oppervlakte-eenheden-omzetten-css')) return;

        const style = document.createElement('style');
        style.id = 'oppervlakte-eenheden-omzetten-css';
        style.textContent = `
            .inline-select {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                font-size: 18px;
                font-weight: 600;
                border: 2px solid var(--color-primary);
                border-radius: var(--radius-sm);
                background: white;
                cursor: pointer;
                margin: 0 0.25rem;
                max-width: 110px;
            }

            .inline-select:focus {
                outline: none;
                border-color: var(--color-secondary);
            }

            .inline-select:disabled {
                background: var(--color-light);
                cursor: not-allowed;
            }

            .ladder-display {
                display: flex;
                justify-content: center;
                margin: 1rem 0;
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity var(--transition-normal);
            }

            .modal-overlay.active {
                opacity: 1;
                pointer-events: all;
            }

            .modal-content {
                background: white;
                border-radius: var(--radius-xl);
                padding: var(--spacing-xl);
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
                transform: scale(0.9);
                transition: transform var(--transition-normal);
            }

            .modal-overlay.active .modal-content {
                transform: scale(1);
            }

            .modal-actions {
                display: flex;
                justify-content: center;
                margin-top: var(--spacing-lg);
            }

            .reference-button-area {
                margin: 1.5rem 0;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initOppervlakteEenhedenOmzetten };
}
