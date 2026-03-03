// ============================================
// OEFENING 2-2: EENHEDEN EN VOORVOEGSELS
// ============================================
// 8 vragen:
// - Vraag 1: Verbindingsoefening (drag & drop matching)
// - Vraag 2: Ladder drag & drop
// - Vraag 3-4: 1 missende eenheid invullen
// - Vraag 5-8: 3 missende eenheden invullen
// ============================================

function initEenhedenVoorvoegsels(container, onComplete) {
    // Add custom CSS for this exercise
    addCustomCSS();
    
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
    
    // Add custom CSS for this exercise
    function addCustomCSS() {
        if (document.getElementById('eenheden-voorvoegsels-css')) return;
        
        const style = document.createElement('style');
        style.id = 'eenheden-voorvoegsels-css';
        style.textContent = `
            /* Matching Drag & Drop */
            .matching-dragdrop-container {
                display: flex;
                gap: 3rem;
                margin: 2rem 0;
            }
            
            .matching-targets {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .matching-target {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .target-drop-zone {
                width: 80px;
                height: 50px;
                border: 3px dashed var(--color-gray);
                border-radius: var(--radius-md);
                background: var(--color-light);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            }
            
            .target-drop-zone.drag-over {
                border-color: var(--color-primary);
                background: #e3f2fd;
                transform: scale(1.05);
            }
            
            .drop-placeholder {
                font-size: 12px;
                color: #999;
            }
            
            .target-label {
                font-size: var(--font-size-large);
                color: var(--color-dark);
                font-weight: 500;
            }
            
            .matching-units-pool {
                width: 200px;
                flex-shrink: 0;
            }
            
            .matching-units-pool h4 {
                margin-bottom: 1rem;
                color: var(--color-primary);
            }
            
            .units-pool {
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-lg);
                padding: 1rem;
                min-height: 300px;
                background: var(--color-light);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .matching-unit {
                background: white;
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                padding: 0.75rem;
                text-align: center;
                cursor: move;
                font-weight: 600;
                font-size: var(--font-size-base);
                transition: all var(--transition-fast);
                user-select: none;
            }
            
            .matching-unit:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: var(--color-primary);
            }
            
            .matching-unit.dragging {
                opacity: 0.5;
            }
            
            /* Ladder Container */
            .ladder-exercise-container {
                display: flex;
                gap: 3rem;
                margin: 2rem 0;
                align-items: flex-start;
                justify-content: center;
            }
            
            .ladder-with-overlay {
                position: relative;
                width: 200px;
                height: 350px;
                flex-shrink: 0;
            }
            
            .ladder-with-overlay svg {
                position: absolute;
                top: 0;
                left: 0;
            }
            
            .ladder-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 200px;
                height: 350px;
                pointer-events: none;
            }
            
            .ladder-dropzone {
                pointer-events: auto;
                border: 2px dashed transparent;
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--transition-fast);
            }
            
            .ladder-dropzone.drag-over {
                background: rgba(107, 155, 209, 0.2);
                border-color: var(--color-primary);
            }
            
            .dropzone-placeholder {
                color: #999;
                font-size: 18px;
                pointer-events: none;
            }
            
            .ladder-dropzone .ladder-unit {
                margin: 0;
                font-size: 14px;
                padding: 0.25rem 0.5rem;
            }
            
            .ladder-units-pool {
                flex: 1;
            }
            
            .ladder-units-pool h4 {
                margin-bottom: 1rem;
                color: var(--color-primary);
            }
            
            .draggable-unit {
                background: white;
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                padding: 0.75rem 1.5rem;
                cursor: move;
                font-weight: 600;
                font-size: var(--font-size-base);
                transition: all var(--transition-fast);
                user-select: none;
                display: inline-block;
                margin: 0.25rem;
            }
            
            .draggable-unit:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: var(--color-primary);
            }
            
            .draggable-unit.dragging {
                opacity: 0.5;
            }
            
            /* Unit Sequence */
            .unit-sequence {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;
                gap: 0.25rem;
                font-size: var(--font-size-large);
                margin: 2rem 0;
            }
            
            .sequence-item {
                font-weight: 600;
                color: var(--color-dark);
            }
            
            .sequence-missing {
                font-size: 2rem;
            }
            
            .sequence-separator {
                color: #666;
            }
            
            .sequence-input {
                padding: 0.5rem;
                text-align: center;
                border: 2px solid var(--color-gray);
                border-radius: var(--radius-md);
                font-size: var(--font-size-base);
                font-weight: 600;
                transition: border-color var(--transition-fast);
            }
            
            .sequence-input:focus {
                outline: none;
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(107, 155, 209, 0.1);
            }
            
            .sequence-input:disabled {
                background-color: var(--color-light);
                cursor: not-allowed;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .matching-dragdrop-container,
                .ladder-container {
                    flex-direction: column;
                }
                
                .matching-units-pool,
                .ladder-units-pool {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
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
    // VRAAG 1: MATCHING (drag & drop)
    // ============================================
    
    function renderMatchingQuestion() {
        // Shuffle units (draggable items)
        const shuffledUnits = [...UNITS].sort(() => Math.random() - 0.5);
        
        return `
            <h3 class="question-title">Verbind wat bij elkaar hoort</h3>
            <p class="question-text">Sleep elke eenheid naar de juiste volledige naam.</p>
            
            <div class="matching-dragdrop-container">
                <div class="matching-targets">
                    ${UNITS.map(unit => `
                        <div class="matching-target" data-correct="${unit}">
                            <div class="target-drop-zone" data-accepts="${unit}">
                                <span class="drop-placeholder">Sleep hier</span>
                            </div>
                            <span class="target-label">${UNITS_FULL[unit]}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="matching-units-pool">
                    <h4>Eenheden:</h4>
                    <div class="units-pool">
                        ${shuffledUnits.map(unit => `
                            <div class="draggable-unit matching-unit" draggable="true" data-unit="${unit}">
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
    
    function initMatchingListeners() {
        const draggables = document.querySelectorAll('.matching-unit');
        const dropZones = document.querySelectorAll('.target-drop-zone');
        const pool = document.querySelector('.units-pool');
        
        // Drag start
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.unit);
                e.target.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        // Drop zones
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const unit = e.dataTransfer.getData('text/plain');
                const draggable = document.querySelector(`.matching-unit[data-unit="${unit}"]`);
                
                // Check if zone already has a unit
                const existing = zone.querySelector('.matching-unit');
                if (existing) {
                    // Return to pool
                    pool.appendChild(existing);
                }
                
                // Add draggable to zone
                zone.innerHTML = '';
                zone.appendChild(draggable);
            });
        });
        
        // Pool drop zone (return items)
        pool.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        pool.addEventListener('drop', (e) => {
            e.preventDefault();
            const unit = e.dataTransfer.getData('text/plain');
            const draggable = document.querySelector(`.matching-unit[data-unit="${unit}"]`);
            
            if (draggable && !pool.contains(draggable)) {
                pool.appendChild(draggable);
            }
        });
        
        // Check button
        const checkBtn = document.getElementById('checkBtn');
        checkBtn.addEventListener('click', () => {
            checkMatching();
        });
    }
    
    function checkMatching() {
        const dropZones = document.querySelectorAll('.target-drop-zone');
        let allCorrect = true;
        
        dropZones.forEach(zone => {
            const correctUnit = zone.dataset.accepts;
            const placedUnit = zone.querySelector('.matching-unit');
            
            if (!placedUnit || placedUnit.dataset.unit !== correctUnit) {
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            score += 1;
            showFeedback(true, 'matching');
        } else {
            showFeedback(false, 'matching');
        }
    }
    
    // ============================================
    // VRAAG 2: LADDER DRAG & DROP
    // ============================================
    
    function renderLadderDragQuestion() {
        const shuffledUnits = [...UNITS].sort(() => Math.random() - 0.5);
        
        return `
            <h3 class="question-title">Zet de eenheden op de juiste sport van de ladder</h3>
            <p class="question-text">Sleep elke eenheid naar de juiste plaats op de ladder.</p>
            
            <div class="ladder-exercise-container">
                <div class="ladder-with-overlay">
                    <!-- Ladder SVG -->
                    ${createLadderSVG()}
                    
                    <!-- Overlay met dropzones -->
                    <div class="ladder-overlay">
                        ${UNITS.map((unit, i) => `
                            <div class="ladder-dropzone" 
                                 data-correct="${unit}"
                                 data-index="${i}"
                                 style="position: absolute; 
                                        left: 35px; 
                                        top: ${19 + 48 * i}px; 
                                        width: 130px; 
                                        height: 24px;">
                                <span class="dropzone-placeholder">⬇</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="ladder-units-pool">
                    <h4>Eenheden:</h4>
                    <div class="units-pool" id="ladderPool">
                        ${shuffledUnits.map(unit => `
                            <div class="draggable-unit ladder-unit" draggable="true" data-unit="${unit}">
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
        const draggables = document.querySelectorAll('.ladder-unit');
        const dropZones = document.querySelectorAll('.ladder-dropzone');
        const pool = document.getElementById('ladderPool');
        
        // Drag start
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.unit);
                e.target.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        // Drop zones on ladder
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const unit = e.dataTransfer.getData('text/plain');
                const draggable = document.querySelector(`.ladder-unit[data-unit="${unit}"]`);
                
                // Check if zone already has a unit
                const existing = zone.querySelector('.ladder-unit');
                if (existing) {
                    // Return to pool
                    pool.appendChild(existing);
                }
                
                // Add draggable to zone
                const placeholder = zone.querySelector('.dropzone-placeholder');
                if (placeholder) placeholder.style.display = 'none';
                
                zone.appendChild(draggable);
            });
        });
        
        // Pool drop zone (return items)
        pool.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        pool.addEventListener('drop', (e) => {
            e.preventDefault();
            const unit = e.dataTransfer.getData('text/plain');
            const draggable = document.querySelector(`.ladder-unit[data-unit="${unit}"]`);
            
            if (draggable && !pool.contains(draggable)) {
                pool.appendChild(draggable);
                
                // Show placeholder again in the zone it came from
                const zones = document.querySelectorAll('.ladder-dropzone');
                zones.forEach(zone => {
                    if (!zone.querySelector('.ladder-unit')) {
                        const placeholder = zone.querySelector('.dropzone-placeholder');
                        if (placeholder) placeholder.style.display = 'block';
                    }
                });
            }
        });
        
        // Check button
        const checkBtn = document.getElementById('checkBtn');
        checkBtn.addEventListener('click', () => {
            checkLadder();
        });
    }
    
    function checkLadder() {
        const dropZones = document.querySelectorAll('.ladder-dropzone');
        let allCorrect = true;
        
        dropZones.forEach(zone => {
            const correctUnit = zone.dataset.correct;
            const placedUnit = zone.querySelector('.ladder-unit');
            
            if (!placedUnit || placedUnit.dataset.unit !== correctUnit) {
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            score += 1;
            showFeedback(true, 'ladder');
        } else {
            showFeedback(false, 'ladder');
        }
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
            const checkBtn = document.getElementById('checkBtn');
            if (checkBtn) checkBtn.disabled = true;
        }
    }
    
    function showCorrectAnswer(q) {
        let html = '<p><strong>Juiste oplossing:</strong></p>';
        
        if (q.type === 'matching') {
            html += '<div style="margin-top: 1rem;"><p>De juiste koppelingen zijn:</p><ul style="list-style: none; padding-left: 0;">';
            UNITS.forEach(unit => {
                html += `<li style="margin-bottom: 0.5rem;"><strong>${unit}</strong> → ${UNITS_FULL[unit]}</li>`;
            });
            html += '</ul></div>';
        } else if (q.type === 'ladder-drag') {
            html += '<p>De ladder van boven naar beneden:</p>';
            html += `<div style="margin-top: 1rem;">${createLadderSVG()}</div>`;
        } else if (q.type === 'fill-one') {
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
        
        // Add ladder for fill questions too
        if (q.type === 'fill-one' || q.type === 'fill-three') {
            html += `<div style="margin-top: 1rem;">${createLadderSVG()}</div>`;
        }
        
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
