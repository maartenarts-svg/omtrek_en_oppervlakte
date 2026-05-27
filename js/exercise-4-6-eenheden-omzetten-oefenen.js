// ============================================
// OEFENING 4-6: EENHEDEN OMZETTEN OEFENEN (OPPERVLAKTE)
// ============================================
// 8 oefeningen, grondtal 100, max |C|=2 (uitzondering: km²→m²)
// Zinvolle getallen: klein bij omzetten naar kleiner, groot naar groter
// ============================================

function initOppervlakteEenhedenOmzettenOefenen(container, onComplete) {
    const UNIT_NAMES = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];

    function displayUnit(unit) {
        return unit.replace('²', '<sup>2</sup>');
    }

    let currentQuestion = 0;
    let score = 0;
    let attempts = 0;
    let questions = [];

    function generateQuestions() {
        questions = [];
        for (let i = 0; i < 8; i++) {
            questions.push(generateQuestion());
        }
    }

    function generateQuestion() {
        // Valid pairs: |C| <= 2, plus km²→m² (An=0, Bn=3, C=+3)
        const validPairs = [];
        for (let An = 0; An < 7; An++) {
            for (let Bn = 0; Bn < 7; Bn++) {
                if (An === Bn) continue;
                const diff = Math.abs(An - Bn);
                if (diff <= 2) {
                    validPairs.push({ An, Bn });
                } else if (An === 0 && Bn === 3) {
                    validPairs.push({ An, Bn }); // km²→m²: uitzondering
                }
            }
        }

        const { An, Bn } = validPairs[Math.floor(Math.random() * validPairs.length)];
        const A = UNIT_NAMES[An];
        const B = UNIT_NAMES[Bn];
        const C = Bn - An;
        const absC = Math.abs(C);

        let D, E;

        if (C > 0) {
            // Naar kleinere eenheid: D klein zodat resultaat zinvol is
            if (absC === 1) {
                // D = Q/100 (2 decimalen), E = Q (integer), D in [0,10; 9,99]
                const Q = Math.floor(Math.random() * 990) + 10;
                D = Q / 100;
                E = Q;
            } else if (absC === 2) {
                // D = Q/100 (2 decimalen), E = Q×100, D in [0,01; 0,99]
                const Q = Math.floor(Math.random() * 99) + 1;
                D = Q / 100;
                E = Q * 100;
            } else {
                // absC === 3: km²→m², D = Q/10000 (4 decimalen), E = Q×100
                const Q = Math.floor(Math.random() * 99) + 1;
                D = Q / 10000;
                E = Q * 100;
            }
        } else {
            // Naar grotere eenheid: D groot zodat resultaat zinvol is
            if (absC === 1) {
                // E = Q (integer 1–99), D = Q×100 (integer 100–9900)
                const Q = Math.floor(Math.random() * 99) + 1;
                E = Q;
                D = Q * 100;
            } else {
                // absC === 2: D veelvoud van 100 (100–9900), E = D/10000 (0,01–0,99)
                const Q = (Math.floor(Math.random() * 99) + 1) * 100;
                D = Q;
                E = Q / 10000;
            }
            // C=-3 (mm²→m²) uitgesloten: getallen worden miljoenen
        }

        D = parseFloat(D.toFixed(4));
        E = parseFloat(E.toFixed(4));

        return { A, B, An, Bn, C, absC, D, E };
    }

    function formatNumber(num) {
        num = Math.round(num * 10000) / 10000;
        const str = num.toString().replace('.', ',');
        const parts = str.split(',');

        let intPart = parts[0];
        if (intPart.length > 3) {
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        const decPart = parts[1] || '';
        return decPart ? `${intPart},${decPart}` : intPart;
    }

    function getSuperscript(n) {
        const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
        return supers[n] || n.toString();
    }

    function createLadderSVG() {
        return `
            <svg width="200" height="350" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                <rect x="165" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                ${UNIT_NAMES.map((unit, i) => {
                    const y = 25 + i * 48;
                    return `
                        <rect x="35" y="${y}" width="130" height="12" fill="#FFE5A3" stroke="#FFD580" stroke-width="2" rx="4"/>
                        <text x="100" y="${y + 22}" text-anchor="middle" font-size="16" font-weight="600" fill="#2C3E50">${unit}</text>
                    `;
                }).join('')}
            </svg>
        `;
    }

    function createFeedbackVisualization(q, formattedD, formattedE, unitDir, numDir, powerText) {
        const unitLabel = `de eenheid wordt ${powerText} keer ${unitDir}`;
        const numberLabel = `het maatgetal wordt ${powerText} keer ${numDir}`;

        return `
            <div class="opp-conv-visualization">
                <svg width="800" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrow-oppconv46" markerWidth="8" markerHeight="4"
                                refX="6" refY="2" orient="auto">
                            <polygon points="0 0, 8 2, 0 4" fill="#A8C8E5" />
                        </marker>
                    </defs>
                    <path d="M 160 120 Q 220 105, 280 100 Q 340 105, 400 120"
                          stroke="#A8C8E5" stroke-width="3" fill="none" />
                    <path d="M 275 100 L 285 100" stroke="#A8C8E5" stroke-width="3" marker-end="url(#arrow-oppconv46)" />
                    <path d="M 60 180 Q 120 195, 180 200 Q 240 195, 300 180"
                          stroke="#A8C8E5" stroke-width="3" fill="none" />
                    <path d="M 175 200 L 185 200" stroke="#A8C8E5" stroke-width="3" marker-end="url(#arrow-oppconv46)" />
                    <text x="280" y="85" text-anchor="middle" font-size="14" font-weight="600" fill="#A8C8E5">${unitLabel}</text>
                    <text x="180" y="240" text-anchor="middle" font-size="14" font-weight="600" fill="#A8C8E5">${numberLabel}</text>
                    <text x="60" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">${formattedD}</text>
                    <text x="170" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">${q.A}</text>
                    <text x="240" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">=</text>
                    <text x="330" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#6B9BD1">${formattedE}</text>
                    <text x="440" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">${q.B}</text>
                </svg>
            </div>
        `;
    }

    function render() {
        const q = questions[currentQuestion];
        attempts = 0;

        const progress = ((currentQuestion / 8) * 100).toFixed(0);
        const formattedD = formatNumber(q.D);

        container.innerHTML = `
            <div class="exercise-container">
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Vraag ${currentQuestion + 1} van 8</span>
                        <span class="progress-score">Score: <strong>${score}</strong>/8</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="question-card">
                    <h3 class="question-title">Zet om</h3>
                    <p class="question-text-large opp-conv-question">
                        ${formattedD} ${displayUnit(q.A)} = <input type="text" id="answerInput" class="opp-conv-input" autocomplete="off" autofocus> ${displayUnit(q.B)}
                    </p>

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
                        ${createLadderSVG()}
                    </div>
                    <div class="modal-actions" style="margin-top: 1.5rem;">
                        <button class="btn btn-primary" id="closeLadderBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('checkBtn').addEventListener('click', checkAnswer);
        document.getElementById('answerInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') checkAnswer();
        });
        document.getElementById('ladderBtn').addEventListener('click', () => {
            document.getElementById('ladderModal').classList.add('active');
        });
        document.getElementById('closeLadderBtn').addEventListener('click', () => {
            document.getElementById('ladderModal').classList.remove('active');
        });
        document.getElementById('ladderModal').addEventListener('click', e => {
            if (e.target.id === 'ladderModal') document.getElementById('ladderModal').classList.remove('active');
        });
    }

    function checkAnswer() {
        const input = document.getElementById('answerInput');
        const userAnswer = input.value.trim();

        if (!userAnswer) {
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Vul eerst een antwoord in.</p>
                </div>
            `;
            return;
        }

        attempts++;
        const q = questions[currentQuestion];
        const userClean = userAnswer.replace(/\s/g, '').replace(',', '.');
        const isCorrect = Math.abs(parseFloat(userClean) - q.E) < 0.001;

        if (isCorrect) {
            if (attempts === 1) score += 1;
            else score += 0.5;
            showFeedback(true, q, attempts);
        } else {
            showFeedback(false, q, attempts, attempts === 1);
        }
    }

    function showFeedback(correct, q, attemptNum, canRetry) {
        const feedbackArea = document.getElementById('feedbackArea');
        const checkBtn = document.getElementById('checkBtn');
        const input = document.getElementById('answerInput');

        checkBtn.style.display = 'none';

        if (correct) {
            const message = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${message}</p>
                    <button class="btn btn-primary" onclick="window.nextOppConversie()">OK</button>
                </div>
            `;
            input.disabled = true;
        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Onderzoek hoeveel keer de eenheid groter of kleiner wordt. Hoeveel keer wordt het maatgetal dan kleiner of groter om alles in evenwicht te houden?</p>
                    <p style="margin-top: 0.5rem;">Gebruik, als dat nodig is, de eenhedenladder.</p>
                    <button class="btn btn-primary" onclick="window.retryOppConversie()">OK</button>
                </div>
            `;
        } else {
            const unitDirection = q.C > 0 ? 'kleiner' : 'groter';
            const numberDirection = q.C > 0 ? 'groter' : 'kleiner';
            const operation = q.C < 0 ? ':' : '·';
            const powerText = q.absC === 1 ? '100' : `100${getSuperscript(q.absC)}`;
            const expandedPower = Math.pow(100, q.absC);

            const formattedD = formatNumber(q.D);
            const formattedE = formatNumber(q.E);

            const visualization = createFeedbackVisualization(q, formattedD, formattedE, unitDirection, numberDirection, powerText);

            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    ${visualization}
                    <div class="opp-conv-steps">
                        <p><strong>Uitwerking:</strong></p>
                        <p>${formattedD} ${operation} ${powerText}</p>
                        <p>= ${formattedD} ${operation} ${formatNumber(expandedPower)}</p>
                        <p>= ${formattedE}</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.nextOppConversie()">OK</button>
                </div>
            `;
            input.disabled = true;
        }
    }

    window.nextOppConversie = function() {
        currentQuestion++;
        if (currentQuestion >= 8) {
            finish();
        } else {
            render();
        }
    };

    window.retryOppConversie = function() {
        document.getElementById('feedbackArea').innerHTML = '';
        const checkBtn = document.getElementById('checkBtn');
        const input = document.getElementById('answerInput');
        checkBtn.style.display = 'block';
        input.value = '';
        input.disabled = false;
        input.focus();
    };

    function finish() {
        const percentage = (score / 8) * 100;
        let letterScore = 'C';
        if (score >= 6.5) letterScore = 'A';
        else if (score >= 5) letterScore = 'B';

        onComplete({
            score: percentage,
            correctAnswers: score,
            totalQuestions: 8,
            xpEarned: Math.round(score * 10),
            letterScore: letterScore
        });
    }

    addCSS();

    function addCSS() {
        if (document.getElementById('oppervlakte-eenheden-omzetten-oefenen-css')) return;
        const style = document.createElement('style');
        style.id = 'oppervlakte-eenheden-omzetten-oefenen-css';
        style.textContent = `
            .opp-conv-question {
                display: block;
                text-align: center;
                font-size: 18px !important;
                margin: 2rem 0;
            }
            .opp-conv-input {
                display: inline-block;
                width: 140px !important;
                max-width: 140px !important;
                padding: 0.4rem;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                border: 3px solid var(--color-primary);
                border-radius: var(--radius-md);
                background: white;
                box-sizing: border-box;
            }
            .opp-conv-input:focus {
                outline: none;
                border-color: var(--color-secondary);
            }
            .opp-conv-input:disabled {
                background: var(--color-light);
            }
            .opp-conv-visualization {
                margin: 1.5rem 0;
                display: flex;
                justify-content: center;
                overflow-x: auto;
            }
            .opp-conv-steps {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: var(--radius-md);
                margin: 1rem 0;
            }
            .opp-conv-steps p {
                margin: 0.5rem 0;
                font-size: 18px;
                font-weight: 600;
                color: #2C3E50;
            }
            .ladder-display {
                display: flex;
                justify-content: center;
                margin: 1rem 0;
            }
            .modal-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6);
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

    generateQuestions();
    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initOppervlakteEenhedenOmzettenOefenen };
}
