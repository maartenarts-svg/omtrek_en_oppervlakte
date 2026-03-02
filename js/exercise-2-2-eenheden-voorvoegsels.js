// ============================================
// OEFENING 2-2: EENHEDEN EN VOORVOEGSELS
// ============================================
// 8 vragen:
// - Vraag 1: Verbindingsoefening (matching met lijnen)
// - Vraag 2: Ladder drag & drop
// - Vraag 3-4: 1 missende eenheid invullen
// - Vraag 5-8: 3 missende eenheden invullen
// ============================================

function initEenhedenVoorvoegsels(container, onComplete) {
    const UNITS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
    const UNITS_FULL = {
        'km': 'kilometer',
        'hm': 'hectometer',
        'dam': 'decameter',
        'm': 'meter',
        'dm': 'decimeter',
        'cm': 'centimeter',
        'mm': 'millimeter'
    };
    
    let currentQuestion = 0;
    let score = 0;
    let attempts = {}; // Track attempts per question
    let questions = [];
    
    // Generate questions
    function generateQuestions() {
        questions = [
            { type: 'matching', id: 1 },
            { type: 'ladder-drag', id: 2 },
            { type: 'fill-one', id: 3, units: generateFillOneQuestion() },
            { type: 'fill-one', id: 4, units: generateFillOneQuestion() },
            { type: 'fill-three', id: 5, units: generateFillThreeQuestion() },
            { type: 'fill-three', id: 6, units: generateFillThreeQuestion() },
            { type: 'fill-three', id: 7, units: generateFillThreeQuestion() },
            { type: 'fill-three', id: 8, units: generateFillThreeQuestion() }
        ];
    }
    
    // Generate random sequence of 4 consecutive units
    function generateFillOneQuestion() {
        const startIndex = Math.floor(Math.random() * 4); // 0-3 (gives us 4 consecutive)
        const units = UNITS.slice(startIndex, startIndex + 4);
        const missingIndex = Math.floor(Math.random() * 4);
        
        return {
            sequence: units,
            missingIndex: missingIndex,
            answer: units[missingIndex]
        };
    }
    
    // Generate random sequence with 3 missing units
    function generateFillThreeQuestion() {
        const startIndex = Math.floor(Math.random() * 4);
        const units = UNITS.slice(startIndex, startIndex + 4);
        
        // Pick 1 visible unit (not first or last for better UX)
        const visibleIndex = 1 + Math.floor(Math.random() * 2); // 1 or 2
        
        const missing = [];
        const answers = [];
        for (let i = 0; i < 4; i++) {
            if (i === visibleIndex) {
                missing.push(false);
            } else {
                missing.push(true);
                answers.push(units[i]);
            }
        }
        
        return {
            sequence: units,
            visibleIndex: visibleIndex,
            missing: missing,
            answers: answers
        };
    }
    
    // Create ladder SVG (reusable)
    function createLadderSVG(width = 200, height = 350) {
        const svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg">
                <!-- Left rail -->
                <rect x="20" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                <!-- Right rail -->
                <rect x="165" y="10" width="15" height="330" fill="#A8D8A8" stroke="#8BC68B" stroke-width="2" rx="5"/>
                
                <!-- Rungs (7 steps) -->
                <g id="rungs">
                    ${[0,1,2,3,4,5,6].map(i => {
                        const y = 25 + i * 48;
                        return `
                            <rect x="35" y="${y}" width="130" height="12" fill="#FFE5A3" stroke="#FFD580" stroke-width="2" rx="4"/>
                            <text x="100" y="${y + 22}" text-anchor="middle" font-size="16" font-weight="600" fill="#2C3E50">
                                ${UNITS[i]}
                            </text>
                        `;
                    }).join('')}
                </g>
            </svg>
        `;
        return svg;
    }
    
    // Render current question
    function render() {
        const q = questions[currentQuestion];
        attempts[currentQuestion] = attempts[currentQuestion] || 0;
        
        let html = `
            <div class="exercise-container">
                <!-- Progress -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Vraag ${currentQuestion + 1} van ${questions.length}</span>
                        <span class="progress-score">Score: <strong>${score}</strong>/${currentQuestion}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(currentQuestion / questions.length) * 100}%"></div>
                    </div>
                </div>
                
                <div class="question-card">
        `;
        
        if (q.type === 'matching') {
            html += renderMatchingQuestion();
        } else if (q.type === 'ladder-drag') {
            html += renderLadderDragQuestion();
        } else if (q.type === 'fill-one') {
            html += renderFillOneQuestion(q);
        } else if (q.type === 'fill-three') {
            html += renderFillThreeQuestion(q);
        }
        
        html += `
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Attach event listeners based on question type
        if (q.type === 'matching') {
            initMatchingListeners();
        } else if (q.type === 'ladder-drag') {
            initLadderDragListeners();
        } else if (q.type === 'fill-one' || q.type === 'fill-three') {
            initFillListeners();
        }
    }
    
    // ============================================
    // VRAAG 1: MATCHING (lijnen trekken)
    // ============================================
    
    function renderMatchingQuestion() {
        // Shuffle both columns
        const leftItems = [...UNITS].sort(() => Math.random() - 0.5);
        const rightItems = Object.keys(UNITS_FULL).map(k => UNITS_FULL[k]).sort(() => Math.random() - 0.5);
        
        return `
            <h3 class="question-title">Verbind wat bij elkaar hoort</h3>
            <p class="question-text">Trek lijnen tussen de eenheid en de volledige naam.</p>
            
            <div class="matching-container">
                <canvas id="matchingCanvas" width="600" height="400"></canvas>
                <div class="matching-columns">
                    <div class="matching-column matching-left">
                        ${leftItems.map((unit, i) => `
                            <div class="matching-item" data-value="${unit}" data-side="left" data-index="${i}">
                                <span class="matching-text">${unit}</span>
                                <div class="matching-connector"></div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="matching-column matching-right">
                        ${rightItems.map((full, i) => `
                            <div class="matching-item" data-value="${full}" data-side="right" data-index="${i}">
                                <div class="matching-connector"></div>
                                <span class="matching-text">${full}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div id="feedbackArea" class="feedback-area"></div>
            
            <div class="question-actions">
                <button class="btn btn-primary" id="checkBtn">Controleer</button>
            </div>
        `;
    }
    
    function initMatchingListeners() {
        // TODO: Implement line drawing between items
        // This is complex - need canvas drawing, click handlers, etc.
        
        const checkBtn = document.getElementById('checkBtn');
        checkBtn.addEventListener('click', () => {
            // Placeholder - check matching
            checkMatching();
        });
    }
    
    function checkMatching() {
        // TODO: Implement matching validation
        // For now, just move to next question
        showFeedback(true, 'matching');
    }
    
    // ============================================
    // VRAAG 2: LADDER DRAG & DROP
    // ============================================
    
    function renderLadderDragQuestion() {
        const shuffledUnits = [...UNITS].sort(() => Math.random() - 0.5);
        
        return `
            <h3 class="question-title">Zet de eenheden op de juiste sport van de ladder</h3>
            <p class="question-text">Sleep elke eenheid naar de juiste plaats op de ladder.</p>
            
            <div class="ladder-container">
                <div class="ladder-svg-container">
                    ${createLadderSVG()}
                </div>
                <div class="ladder-units-pool">
                    <h4>Eenheden:</h4>
                    <div class="units-pool">
                        ${shuffledUnits.map(unit => `
                            <div class="draggable-unit" draggable="true" data-unit="${unit}">
                                ${unit}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div id="feedbackArea" class="feedback-area"></div>
            
            <div class="question-actions">
                <button class="btn btn-primary" id="checkBtn">Controleer</button>
            </div>
        `;
    }
    
    function initLadderDragListeners() {
        // TODO: Implement ladder drag & drop
        
        const checkBtn = document.getElementById('checkBtn');
        checkBtn.addEventListener('click', () => {
            checkLadder();
        });
    }
    
    function checkLadder() {
        // TODO: Implement ladder validation
        showFeedback(true, 'ladder');
    }
    
    // ============================================
    // VRAAG 3-4: FILL ONE
    // ============================================
    
    function renderFillOneQuestion(q) {
        const { sequence, missingIndex } = q.units;
        
        return `
            <h3 class="question-title">Welke eenheid moet er op de plaats van de smiley staan?</h3>
            <p class="question-text">Vul de ontbrekende eenheid in.</p>
            
            <div class="unit-sequence">
                ${sequence.map((unit, i) => {
                    if (i === missingIndex) {
                        return `<span class="sequence-item sequence-missing">😊</span>`;
                    } else {
                        return `<span class="sequence-item">${unit}</span>`;
                    }
                }).join('<span class="sequence-separator">, </span>')}
            </div>
            
            <div class="input-area" style="margin-top: 2rem;">
                <label>Jouw antwoord:</label>
                <input type="text" id="answerInput" class="answer-input" style="width: 100px;" autofocus>
            </div>
            
            <div id="feedbackArea" class="feedback-area"></div>
            
            <div class="question-actions">
                <button class="btn btn-primary" id="checkBtn">Controleer</button>
            </div>
        `;
    }
    
    // ============================================
    // VRAAG 5-8: FILL THREE
    // ============================================
    
    function renderFillThreeQuestion(q) {
        const { sequence, visibleIndex, missing } = q.units;
        
        return `
            <h3 class="question-title">Vul de rij van eenheden verder aan</h3>
            <p class="question-text">Vul de ontbrekende eenheden in.</p>
            
            <div class="unit-sequence">
                ${sequence.map((unit, i) => {
                    if (missing[i]) {
                        return `<input type="text" class="sequence-input" data-index="${i}" style="width: 60px;">`;
                    } else {
                        return `<span class="sequence-item">${unit}</span>`;
                    }
                }).join('<span class="sequence-separator">, </span>')}
            </div>
            
            <div id="feedbackArea" class="feedback-area"></div>
            
            <div class="question-actions">
                <button class="btn btn-primary" id="checkBtn">Controleer</button>
            </div>
        `;
    }
    
    // ============================================
    // FILL QUESTION LISTENERS & VALIDATION
    // ============================================
    
    function initFillListeners() {
        const checkBtn = document.getElementById('checkBtn');
        const q = questions[currentQuestion];
        
        // Focus first input
        if (q.type === 'fill-three') {
            const firstInput = document.querySelector('.sequence-input');
            if (firstInput) firstInput.focus();
        }
        
        checkBtn.addEventListener('click', () => {
            if (q.type === 'fill-one') {
                checkFillOne();
            } else {
                checkFillThree();
            }
        });
    }
    
    function checkFillOne() {
        const q = questions[currentQuestion];
        const input = document.getElementById('answerInput');
        const userAnswer = input.value.trim();
        const correctAnswer = q.units.answer;
        
        // Check for uppercase
        if (userAnswer.toLowerCase() === correctAnswer && userAnswer !== userAnswer.toLowerCase()) {
            showFeedback(false, 'fill-one', 'uppercase');
            return;
        }
        
        // Check answer
        if (userAnswer.toLowerCase() === correctAnswer) {
            score += 1;
            showFeedback(true, 'fill-one');
        } else {
            showFeedback(false, 'fill-one');
        }
    }
    
    function checkFillThree() {
        const q = questions[currentQuestion];
        const inputs = document.querySelectorAll('.sequence-input');
        const userAnswers = Array.from(inputs).map(inp => inp.value.trim());
        const correctAnswers = q.units.answers;
        
        attempts[currentQuestion] = attempts[currentQuestion] || 0;
        
        // Check for uppercase
        let hasUppercase = false;
        for (let answer of userAnswers) {
            if (answer !== answer.toLowerCase() && answer.toLowerCase() === answer.toLowerCase()) {
                hasUppercase = true;
                break;
            }
        }
        
        // Check all answers correct
        let allCorrect = true;
        for (let i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i].toLowerCase() !== correctAnswers[i]) {
                allCorrect = false;
                break;
            }
        }
        
        if (hasUppercase) {
            attempts[currentQuestion]++;
            if (attempts[currentQuestion] === 1) {
                showFeedback(false, 'fill-three', 'uppercase-first');
                return;
            } else {
                showFeedback(false, 'fill-three', 'uppercase-second');
                return;
            }
        }
        
        if (allCorrect) {
            attempts[currentQuestion]++;
            if (attempts[currentQuestion] === 1) {
                score += 1;
                showFeedback(true, 'fill-three', 'first');
            } else {
                score += 0.5;
                showFeedback(true, 'fill-three', 'second');
            }
        } else {
            attempts[currentQuestion]++;
            if (attempts[currentQuestion] === 1) {
                showFeedback(false, 'fill-three', 'first');
                // Don't clear inputs
            } else {
                showFeedback(false, 'fill-three', 'second');
            }
        }
    }
    
    // ============================================
    // FEEDBACK
    // ============================================
    
    function showFeedback(correct, type, variant = '') {
        const feedbackArea = document.getElementById('feedbackArea');
        let html = '';
        
        if (correct) {
            if (type === 'fill-three' && variant === 'second') {
                html = `
                    <div class="feedback-message feedback-correct">
                        <p class="feedback-text">Correct bij de tweede poging.</p>
                        <button class="btn btn-primary" onclick="nextQuestion()">Volgende →</button>
                    </div>
                `;
            } else {
                html = `
                    <div class="feedback-message feedback-correct">
                        <p class="feedback-text">Correct!</p>
                        <button class="btn btn-primary" onclick="nextQuestion()">Volgende →</button>
                    </div>
                `;
            }
        } else {
            const q = questions[currentQuestion];
            
            if (variant === 'uppercase-first') {
                html = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">De eenheden worden met kleine letters geschreven. Pas je antwoorden aan.</p>
                    </div>
                `;
            } else if (variant === 'uppercase-second') {
                html = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">De eenheden worden met kleine letters geschreven.</p>
                        <div style="margin-top: 1rem;">
                            ${showCorrectAnswer(q)}
                        </div>
                        <button class="btn btn-primary" onclick="nextQuestion()">Volgende →</button>
                    </div>
                `;
            } else if (variant === 'first' && type === 'fill-three') {
                html = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Dit klopt niet helemaal. Verbeter.</p>
                    </div>
                `;
            } else {
                html = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Dit is niet helemaal juist.</p>
                        <div style="margin-top: 1rem;">
                            ${showCorrectAnswer(q)}
                        </div>
                        <button class="btn btn-primary" onclick="nextQuestion()">Volgende →</button>
                    </div>
                `;
            }
        }
        
        feedbackArea.innerHTML = html;
        
        // Disable check button if moving to next
        if (correct || (variant !== 'first' && variant !== 'uppercase-first')) {
            document.getElementById('checkBtn').disabled = true;
        }
    }
    
    function showCorrectAnswer(q) {
        let html = '<p><strong>Juiste oplossing:</strong></p>';
        
        if (q.type === 'fill-one') {
            html += '<div class="unit-sequence">';
            q.units.sequence.forEach((unit, i) => {
                if (i === q.units.missingIndex) {
                    html += `<span class="sequence-item" style="color: var(--color-primary); font-weight: 700;">${unit}</span>`;
                } else {
                    html += `<span class="sequence-item">${unit}</span>`;
                }
                if (i < q.units.sequence.length - 1) {
                    html += '<span class="sequence-separator">, </span>';
                }
            });
            html += '</div>';
        } else if (q.type === 'fill-three') {
            html += '<div class="unit-sequence">';
            q.units.sequence.forEach((unit, i) => {
                if (q.units.missing[i]) {
                    html += `<span class="sequence-item" style="color: var(--color-primary); font-weight: 700;">${unit}</span>`;
                } else {
                    html += `<span class="sequence-item">${unit}</span>`;
                }
                if (i < q.units.sequence.length - 1) {
                    html += '<span class="sequence-separator">, </span>';
                }
            });
            html += '</div>';
        }
        
        html += `<div style="margin-top: 1rem;">${createLadderSVG()}</div>`;
        
        return html;
    }
    
    // ============================================
    // NAVIGATION
    // ============================================
    
    window.nextQuestion = function() {
        currentQuestion++;
        
        if (currentQuestion >= questions.length) {
            finishExercise();
        } else {
            render();
        }
    };
    
    function finishExercise() {
        const percentage = (score / questions.length) * 100;
        
        onComplete({
            score: percentage,
            correctAnswers: score,
            totalQuestions: questions.length,
            xpEarned: Math.max(0, Math.round(score * 10))
        });
    }
    
    // Initialize
    generateQuestions();
    render();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initEenhedenVoorvoegsels };
}
