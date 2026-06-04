// ============================================
// DRILL: LENGTE-EENHEDEN OMZETTEN
// ============================================
// 8 vragen, 2 pogingen per vraag
// Gebaseerd op exercise-2-6-eenheden-omzetten-oefenen
// ============================================

function initDrillLengteEenheden(container, onComplete) {
    const UNITS = [
        { name: 'km', index: 0 },
        { name: 'hm', index: 1 },
        { name: 'dam', index: 2 },
        { name: 'm',  index: 3 },
        { name: 'dm', index: 4 },
        { name: 'cm', index: 5 },
        { name: 'mm', index: 6 }
    ];

    let currentQuestion = 0;
    let score = 0;
    let attempts = 0;
    let questions = [];

    // ── Vragengeneratie ───────────────────────────────────────────

    function generateQuestions() {
        questions = [];
        for (let i = 0; i < 8; i++) {
            questions.push(generateQuestion());
        }
    }

    function generateQuestion() {
        const A_idx = Math.floor(Math.random() * 7);
        let B_idx;

        do {
            B_idx = Math.floor(Math.random() * 7);
            const diff = Math.abs(A_idx - B_idx);
            if (diff >= 1 && diff <= 3) break;
            if ((A_idx === 0 && B_idx === 5) || (A_idx === 5 && B_idx === 0)) break;
        } while (true);

        const A  = UNITS[A_idx].name;
        const B  = UNITS[B_idx].name;
        const An = A_idx;
        const Bn = B_idx;
        const C  = Bn - An; // teken: positief = kleiner, negatief = groter

        let Q, R, D;

        if (A === 'km' && B === 'cm') {
            R = Math.random() < 0.5 ? 10 : 100;
            Q = R === 10
                ? Math.floor(Math.random() * 89) + 10
                : Math.floor(Math.random() * 999) + 1;
        } else if (A === 'cm' && B === 'km') {
            R = 1;
            Q = Math.floor(Math.random() * 999) + 1;
        } else {
            Q = Math.floor(Math.random() * 999) + 1;
            const rOptions = [1, 10, 100];
            R = rOptions[Math.floor(Math.random() * 3)];
        }

        D = Q / R;

        let decimalsD = 0;
        if (R === 10)  decimalsD = 1;
        if (R === 100) decimalsD = 2;

        D = Math.round(D * Math.pow(10, decimalsD)) / Math.pow(10, decimalsD);

        const decimalsE = C < 0 ? decimalsD + Math.abs(C) : Math.max(0, decimalsD - C);
        const E = Math.round(D * Math.pow(10, C) * Math.pow(10, decimalsE)) / Math.pow(10, decimalsE);

        return { A, B, An, Bn, C, D, E };
    }

    // ── Hulpfuncties ──────────────────────────────────────────────

    function formatNumber(num) {
        const str = num.toString().replace('.', ',');
        const parts = str.split(',');

        let intPart = parts[0];
        if (intPart.length > 3) {
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        let decPart = parts[1] || '';
        if (decPart.length > 3) {
            decPart = decPart.replace(/(\d{3})/g, '$1 ').trim();
        }

        return decPart ? `${intPart},${decPart}` : intPart;
    }

    function getSuperscript(n) {
        const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
        return supers[n] || n.toString();
    }

    // ── SVG ladder ────────────────────────────────────────────────

    function createLadderSVG() {
        return `
            <svg width="200" height="350" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                <rect x="165" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                ${UNITS.map((unit, i) => {
                    const y = 25 + i * 48;
                    return `
                        <rect x="35" y="${y}" width="130" height="12" fill="#FFE5A3" stroke="#FFD580" stroke-width="2" rx="4"/>
                        <text x="100" y="${y + 22}" text-anchor="middle" font-size="16" font-weight="600" fill="#2C3E50">
                            ${unit.name}
                        </text>
                    `;
                }).join('')}
            </svg>
        `;
    }

    // ── Visualisatie bij fout ─────────────────────────────────────

    function createFeedbackVisualization(q, formattedD, formattedE, unitDir, numDir, powerText) {
        const unitLabel  = `de eenheid wordt ${powerText} keer ${unitDir}`;
        const numberLabel = `het maatgetal wordt ${powerText} keer ${numDir}`;

        return `
            <div class="drill-lengte-viz">
                <svg width="560" height="200" viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="dlarrow" markerWidth="8" markerHeight="4" refX="6" refY="2" orient="auto">
                            <polygon points="0 0, 8 2, 0 4" fill="#A8C8E5"/>
                        </marker>
                    </defs>

                    <!-- Bovenboog -->
                    <path d="M 120 100 Q 185 75, 250 70 Q 315 75, 380 100"
                          stroke="#A8C8E5" stroke-width="3" fill="none"/>
                    <path d="M 244 70 L 256 70" stroke="#A8C8E5" stroke-width="3" marker-end="url(#dlarrow)"/>

                    <!-- Onderboog -->
                    <path d="M 20 120 Q 85 145, 150 150 Q 215 145, 280 120"
                          stroke="#A8C8E5" stroke-width="3" fill="none"/>
                    <path d="M 144 150 L 156 150" stroke="#A8C8E5" stroke-width="3" marker-end="url(#dlarrow)"/>

                    <!-- Labels -->
                    <text x="250" y="57" text-anchor="middle" font-size="13" font-weight="600" fill="#A8C8E5">
                        ${unitLabel}
                    </text>
                    <text x="150" y="175" text-anchor="middle" font-size="13" font-weight="600" fill="#A8C8E5">
                        ${numberLabel}
                    </text>

                    <!-- Waarden -->
                    <text x="20"  y="113" text-anchor="middle" font-size="22" font-weight="600" fill="#2C3E50">${formattedD}</text>
                    <text x="120" y="113" text-anchor="middle" font-size="22" font-weight="600" fill="#2C3E50">${q.A}</text>
                    <text x="200" y="113" text-anchor="middle" font-size="22" font-weight="600" fill="#2C3E50">=</text>
                    <text x="300" y="113" text-anchor="middle" font-size="22" font-weight="600" fill="#6B9BD1">${formattedE}</text>
                    <text x="400" y="113" text-anchor="middle" font-size="22" font-weight="600" fill="#2C3E50">${q.B}</text>
                </svg>
            </div>
        `;
    }

    // ── Renderen ──────────────────────────────────────────────────

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
                    <p class="dl-conversion-question">
                        ${formattedD} ${q.A} = <input type="text" id="dlAnswerInput" class="dl-conversion-input" autocomplete="off" autofocus> ${q.B}
                    </p>

                    <div class="reference-button-area">
                        <button class="btn btn-secondary" id="dlLadderBtn">
                            📏 Klik hier voor de eenhedenladder
                        </button>
                    </div>

                    <div id="dlFeedbackArea" class="feedback-area"></div>

                    <div class="question-actions">
                        <button class="btn btn-primary" id="dlCheckBtn">Controleer</button>
                    </div>
                </div>
            </div>

            <!-- Ladder Modal -->
            <div class="dl-modal-overlay" id="dlLadderModal">
                <div class="dl-modal-content">
                    <h2>Eenhedenladder</h2>
                    <div class="ladder-display">
                        ${createLadderSVG()}
                    </div>
                    <div style="display:flex;justify-content:center;margin-top:var(--spacing-lg);">
                        <button class="btn btn-primary" id="dlCloseLadderBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dlCheckBtn').addEventListener('click', checkAnswer);
        document.getElementById('dlAnswerInput').addEventListener('keypress', e => {
            if (e.key === 'Enter') checkAnswer();
        });
        document.getElementById('dlLadderBtn').addEventListener('click', () => {
            document.getElementById('dlLadderModal').classList.add('active');
        });
        document.getElementById('dlCloseLadderBtn').addEventListener('click', () => {
            document.getElementById('dlLadderModal').classList.remove('active');
        });
        document.getElementById('dlLadderModal').addEventListener('click', e => {
            if (e.target.id === 'dlLadderModal') {
                document.getElementById('dlLadderModal').classList.remove('active');
            }
        });

        document.getElementById('dlAnswerInput').focus();
    }

    // ── Antwoord controleren ──────────────────────────────────────

    function checkAnswer() {
        const input = document.getElementById('dlAnswerInput');
        const feedbackArea = document.getElementById('dlFeedbackArea');
        const userAnswer = input.value.trim();

        if (!userAnswer) {
            feedbackArea.innerHTML = `
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
            else                score += 0.5;
            showFeedback(true, q, attempts);
        } else {
            showFeedback(false, q, attempts, attempts === 1);
        }
    }

    // ── Feedback tonen ────────────────────────────────────────────

    function showFeedback(correct, q, attemptNum, canRetry) {
        const feedbackArea = document.getElementById('dlFeedbackArea');
        const checkBtn     = document.getElementById('dlCheckBtn');
        const input        = document.getElementById('dlAnswerInput');

        checkBtn.style.display = 'none';

        if (correct) {
            const msg = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${msg}</p>
                    <button class="btn btn-primary" id="dlNextBtn">OK</button>
                </div>
            `;
            input.disabled = true;
            document.getElementById('dlNextBtn').addEventListener('click', nextQuestion);

        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Onderzoek hoeveel keer de eenheid groter of kleiner wordt. Hoeveel keer wordt het maatgetal dan kleiner of groter om alles in evenwicht te houden?</p>
                    <p style="margin-top:0.5rem;">Gebruik, als dat nodig is, de eenhedenladder.</p>
                    <button class="btn btn-primary" id="dlRetryBtn">OK</button>
                </div>
            `;
            document.getElementById('dlRetryBtn').addEventListener('click', () => {
                feedbackArea.innerHTML = '';
                checkBtn.style.display = 'block';
                input.value = '';
                input.disabled = false;
                input.focus();
            });

        } else {
            const absC        = Math.abs(q.C);
            const unitDir     = q.C > 0 ? 'kleiner' : 'groter';
            const numDir      = q.C > 0 ? 'groter'  : 'kleiner';
            const operation   = q.C < 0 ? ':' : '·';
            const powerText   = absC === 1 ? '10' : `10${getSuperscript(absC)}`;
            const expandedPow = Math.pow(10, absC);

            const formattedD = formatNumber(q.D);
            const formattedE = formatNumber(q.E);
            const viz = createFeedbackVisualization(q, formattedD, formattedE, unitDir, numDir, powerText);

            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    ${viz}
                    <div class="dl-calculation-steps">
                        <p><strong>Uitwerking:</strong></p>
                        <p>${formattedD} ${operation} ${powerText}</p>
                        <p>= ${formattedD} ${operation} ${formatNumber(expandedPow)}</p>
                        <p>= ${formattedE}</p>
                    </div>
                    <button class="btn btn-primary" id="dlNextBtn">OK</button>
                </div>
            `;
            input.disabled = true;
            document.getElementById('dlNextBtn').addEventListener('click', nextQuestion);
        }
    }

    // ── Navigatie ─────────────────────────────────────────────────

    function nextQuestion() {
        currentQuestion++;
        if (currentQuestion >= 8) {
            finish();
        } else {
            render();
        }
    }

    function finish() {
        const percentage = (score / 8) * 100;
        let letterScore = 'C';
        if (percentage >= 90) letterScore = 'A';
        else if (percentage >= 70) letterScore = 'B';

        onComplete({
            score: percentage,
            correctAnswers: score,
            totalQuestions: 8,
            xpEarned: Math.round(score * 10),
            letterScore: letterScore
        });
    }

    // ── CSS ───────────────────────────────────────────────────────

    function addCSS() {
        if (document.getElementById('drill-lengte-eenheden-css')) return;
        const style = document.createElement('style');
        style.id = 'drill-lengte-eenheden-css';
        style.textContent = `
            .dl-conversion-question {
                display: block;
                text-align: center;
                font-size: 18px !important;
                margin: 2rem 0;
            }

            .dl-conversion-input {
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

            .dl-conversion-input:focus {
                outline: none;
                border-color: var(--color-secondary);
            }

            .dl-conversion-input:disabled {
                background: var(--color-light);
            }

            .dl-calculation-steps {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: var(--radius-md);
                margin: 1rem 0;
            }

            .dl-calculation-steps p {
                margin: 0.5rem 0;
                font-size: 18px;
                font-weight: 600;
                color: #2C3E50;
            }

            .drill-lengte-viz {
                display: flex;
                justify-content: center;
                margin: 1.5rem 0;
                overflow-x: auto;
            }

            .ladder-display {
                display: flex;
                justify-content: center;
                margin: 1rem 0;
            }

            .dl-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
                transition: opacity var(--transition-normal);
            }

            .dl-modal-overlay.active {
                opacity: 1;
                pointer-events: all;
            }

            .dl-modal-content {
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

            .dl-modal-overlay.active .dl-modal-content {
                transform: scale(1);
            }

            .reference-button-area {
                margin: 1.5rem 0;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    addCSS();
    generateQuestions();
    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDrillLengteEenheden };
}
