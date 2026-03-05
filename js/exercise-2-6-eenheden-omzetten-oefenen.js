// ============================================
// OEFENING 2-6: EENHEDEN OMZETTEN OEFENEN
// ============================================
// 8 oefeningen met eenheden omzetten
// 2 pogingen per vraag
// Met feedback visualisatie en uitwerking
// ============================================

function initEenhedenOmzettenOefenen(container, onComplete) {
    const UNITS = [
        { name: 'km', index: 0 },
        { name: 'hm', index: 1 },
        { name: 'dam', index: 2 },
        { name: 'm', index: 3 },
        { name: 'dm', index: 4 },
        { name: 'cm', index: 5 },
        { name: 'mm', index: 6 }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    let attempts = 0;
    let questions = [];
    
    // Generate 8 questions
    function generateQuestions() {
        questions = [];
        for (let i = 0; i < 8; i++) {
            questions.push(generateQuestion());
        }
    }
    
    function generateQuestion() {
        // Step 1: Choose A and B
        const A_idx = Math.floor(Math.random() * 7);
        let B_idx;
        
        do {
            B_idx = Math.floor(Math.random() * 7);
            const diff = Math.abs(A_idx - B_idx);
            
            // Check constraints: 1 <= |C| <= 3, except km <-> cm
            if (diff >= 1 && diff <= 3) {
                break;
            }
            // Exception: km <-> cm
            if ((A_idx === 0 && B_idx === 5) || (A_idx === 5 && B_idx === 0)) {
                break;
            }
        } while (true);
        
        const A = UNITS[A_idx].name;
        const B = UNITS[B_idx].name;
        const An = A_idx;
        const Bn = B_idx;
        const C = Bn - An; // NOT absolute value
        
        // Step 2: Generate D using Q/R system
        // Q = integer from 1 to 999
        // R = one of {1, 10, 100}
        // D = Q / R
        
        let Q, R, D;
        
        if (A === 'km' && B === 'cm') {
            // D < 10, so Q/R < 10
            // Choose R=10 or R=100
            R = Math.random() < 0.5 ? 10 : 100;
            if (R === 10) {
                Q = Math.floor(Math.random() * 89) + 10; // 10-98
            } else {
                Q = Math.floor(Math.random() * 999) + 1; // 1-999
            }
        } else if (A === 'cm' && B === 'km') {
            // D must be integer, so R = 1
            R = 1;
            Q = Math.floor(Math.random() * 999) + 1;
        } else {
            // Normal case
            Q = Math.floor(Math.random() * 999) + 1;
            const rOptions = [1, 10, 100];
            R = rOptions[Math.floor(Math.random() * 3)];
        }
        
        D = Q / R;
        
        // Determine decimal places based on R
        let decimalsD = 0;
        if (R === 10) decimalsD = 1;
        else if (R === 100) decimalsD = 2;
        
        // Round D to correct precision
        D = Math.round(D * Math.pow(10, decimalsD)) / Math.pow(10, decimalsD);
        
        // Calculate E = D * 10^C with correct precision
        const decimalsE = C < 0 ? decimalsD + Math.abs(C) : Math.max(0, decimalsD - C);
        const E = Math.round(D * Math.pow(10, C) * Math.pow(10, decimalsE)) / Math.pow(10, decimalsE);
        
        return { A, B, An, Bn, C, D, E };
    }
    
    // Format number with spaces every 3 digits from decimal point
    function formatNumber(num) {
        const str = num.toString().replace('.', ',');
        const parts = str.split(',');
        
        // Format integer part (left side)
        let intPart = parts[0];
        if (intPart.length > 3) {
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        
        // Format decimal part (right side)
        let decPart = parts[1] || '';
        if (decPart.length > 3) {
            decPart = decPart.replace(/(\d{3})/g, '$1 ').trim();
        }
        
        return decPart ? `${intPart},${decPart}` : intPart;
    }
    
    // Create ladder SVG
    function createLadderSVG() {
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
                            ${unit.name}
                        </text>
                    `;
                }).join('')}
            </svg>
        `;
        return svg;
    }
    
    // Render question
    function render() {
        const q = questions[currentQuestion];
        attempts = 0;
        
        const progress = ((currentQuestion / 8) * 100).toFixed(0);
        
        const formattedD = formatNumber(q.D);
        
        let html = `
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
                    <p class="question-text-large conversion-question">
                        ${formattedD} ${q.A} = <input type="text" id="answerInput" class="conversion-input" autocomplete="off" autofocus> ${q.B}
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
            
            <!-- Ladder Modal -->
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
        
        container.innerHTML = html;
        
        // Event listeners
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
        const input = document.getElementById('answerInput');
        const userAnswer = input.value.trim();
        
        if (!userAnswer) {
            const feedbackArea = document.getElementById('feedbackArea');
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Vul eerst een antwoord in.</p>
                </div>
            `;
            return;
        }
        
        attempts++;
        const q = questions[currentQuestion];
        
        // Remove spaces from both answers for comparison
        const userClean = userAnswer.replace(/\s/g, '').replace(',', '.');
        const correctClean = q.E.toString();
        
        const isCorrect = Math.abs(parseFloat(userClean) - parseFloat(correctClean)) < 0.001;
        
        if (isCorrect) {
            if (attempts === 1) {
                score += 1;
            } else {
                score += 0.5;
            }
            showFeedback(true, q, attempts);
        } else {
            if (attempts === 1) {
                showFeedback(false, q, attempts, true);
            } else {
                showFeedback(false, q, attempts, false);
            }
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
                    <button class="btn btn-primary" onclick="window.nextConversionQuestion()">OK</button>
                </div>
            `;
            input.disabled = true;
        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Onderzoek hoeveel keer de eenheid groter of kleiner wordt. Hoeveel keer wordt het maatgetal dan kleiner of groter om alles in evenwicht te houden?</p>
                    <p style="margin-top: 0.5rem;">Gebruik, als dat nodig is, de eenhedenladder.</p>
                    <button class="btn btn-primary" onclick="window.retryConversionQuestion()">OK</button>
                </div>
            `;
        } else {
            // Show full feedback with visualization
            const absC = Math.abs(q.C);
            const unitDirection = q.C > 0 ? 'kleiner' : 'groter'; // FIXED: C>0 = kleiner
            const numberDirection = q.C > 0 ? 'groter' : 'kleiner'; // FIXED: C>0 = groter
            const operation = q.C < 0 ? '÷' : '×'; // FIXED: C<0 = delen
            const powerText = absC === 1 ? '10' : `10${getSuperscript(absC)}`;
            const expandedPower = Math.pow(10, absC);
            
            const formattedD = formatNumber(q.D);
            const formattedE = formatNumber(q.E);
            
            const visualization = createFeedbackVisualization(q, formattedD, formattedE, unitDirection, numberDirection, powerText);
            
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    ${visualization}
                    <div class="calculation-steps">
                        <p><strong>Uitwerking:</strong></p>
                        <p>${formattedD} ${operation} ${powerText}</p>
                        <p>= ${formattedD} ${operation} ${formatNumber(expandedPower)}</p>
                        <p>= ${formattedE}</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.nextConversionQuestion()">OK</button>
                </div>
            `;
            input.disabled = true;
        }
    }
    
    function createFeedbackVisualization(q, formattedD, formattedE, unitDir, numDir, powerText) {
        const absC = Math.abs(q.C);
        const unitLabel = `de eenheid wordt ${powerText} keer ${unitDir}`;
        const numberLabel = `het maatgetal wordt ${powerText} keer ${numDir}`;
        
        return `
            <div class="feedback-visualization">
                <svg width="800" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="4" 
                                refX="6" refY="2" orient="auto">
                            <polygon points="0 0, 8 2, 0 4" fill="#A8C8E5" />
                        </marker>
                    </defs>
                    
                    <!-- Top curve -->
                    <path d="M 160 120 Q 220 105, 280 100 Q 340 105, 400 120" 
                          stroke="#A8C8E5" stroke-width="3" fill="none" />
                    <path d="M 275 100 L 285 100" stroke="#A8C8E5" stroke-width="3" marker-end="url(#arrowhead)" />
                    
                    <!-- Bottom curve -->
                    <path d="M 60 180 Q 120 195, 180 200 Q 240 195, 300 180" 
                          stroke="#A8C8E5" stroke-width="3" fill="none" />
                    <path d="M 175 200 L 185 200" stroke="#A8C8E5" stroke-width="3" marker-end="url(#arrowhead)" />
                    
                    <!-- Labels -->
                    <text x="280" y="85" text-anchor="middle" font-size="14" font-weight="600" fill="#A8C8E5">
                        ${unitLabel}
                    </text>
                    <text x="180" y="240" text-anchor="middle" font-size="14" font-weight="600" fill="#A8C8E5">
                        ${numberLabel}
                    </text>
                    
                    <!-- Text content -->
                    <text x="60" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">
                        ${formattedD}
                    </text>
                    <text x="170" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">
                        ${q.A}
                    </text>
                    <text x="240" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">
                        =
                    </text>
                    <text x="330" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#6B9BD1">
                        ${formattedE}
                    </text>
                    <text x="440" y="155" text-anchor="middle" font-size="24" font-weight="600" fill="#2C3E50">
                        ${q.B}
                    </text>
                </svg>
            </div>
        `;
    }
    
    function getSuperscript(n) {
        const supers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
        return supers[n] || n.toString();
    }
    
    window.nextConversionQuestion = function() {
        currentQuestion++;
        if (currentQuestion >= 8) {
            finish();
        } else {
            render();
        }
    };
    
    window.retryConversionQuestion = function() {
        const feedbackArea = document.getElementById('feedbackArea');
        const checkBtn = document.getElementById('checkBtn');
        const input = document.getElementById('answerInput');
        
        feedbackArea.innerHTML = '';
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
        
        const xp = Math.round(score * 10);
        
        onComplete({
            score: percentage,
            correctAnswers: score,
            totalQuestions: 8,
            xpEarned: xp,
            letterScore: letterScore
        });
    }
    
    // Add CSS
    addCSS();
    
    function addCSS() {
        if (document.getElementById('eenheden-omzetten-oefenen-css')) return;
        
        const style = document.createElement('style');
        style.id = 'eenheden-omzetten-oefenen-css';
        style.textContent = `
            .conversion-question {
                display: block;
                text-align: center;
                font-size: 18px !important;
                margin: 2rem 0;
            }
            
            .conversion-input {
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
            
            .conversion-input:focus {
                outline: none;
                border-color: var(--color-secondary);
            }
            
            .conversion-input:disabled {
                background: var(--color-light);
            }
            
            .feedback-visualization {
                margin: 1.5rem 0;
                display: flex;
                justify-content: center;
            }
            
            .calculation-steps {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: var(--radius-md);
                margin: 1rem 0;
            }
            
            .calculation-steps p {
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
    
    // Start
    generateQuestions();
    render();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initEenhedenOmzettenOefenen };
}
