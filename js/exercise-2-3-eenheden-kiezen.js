// ============================================
// OEFENING 2-3: EENHEDEN KIEZEN
// ============================================
// 8 vragen: kies de juiste eenheid uit dropdown
// Met referentie-eenheden afbeelding beschikbaar
// ============================================

function initEenhedenKiezen(container, onComplete) {
    // Database met alle situaties
    const SITUATIONS = [
        { id: 1, text: "De lengte van een blad papier is ongeveer 30 ... .", answer: "cm" },
        { id: 2, text: "De dikte van een muntstuk is ongeveer 2 ... .", answer: "mm" },
        { id: 3, text: "De lengte van een balpen is ongeveer 15 ... .", answer: "cm" },
        { id: 4, text: "De breedte van een klasdeur is ongeveer 1 ... .", answer: "m" },
        { id: 5, text: "De hoogte van een deur is ongeveer 2 ... .", answer: "m" },
        { id: 6, text: "De lengte van een voetbalveld is ongeveer 100 ... .", answer: "m" },
        { id: 7, text: "De afstand tussen Antwerpen en Sint-Niklaas is ongeveer 25 ... .", answer: "km" },
        { id: 8, text: "De hoogte van een klaslokaal is ongeveer 3 ... .", answer: "m" },
        { id: 9, text: "De lengte van een gom is ongeveer 5 ... .", answer: "cm" },
        { id: 10, text: "De dikte van een boek is ongeveer 3 ... .", answer: "cm" },
        { id: 11, text: "De lengte van een nietje is ongeveer 1 ... .", answer: "cm" },
        { id: 12, text: "De lengte van een regenworm is ongeveer 8 ... .", answer: "cm" },
        { id: 13, text: "De hoogte van een basketbalring is ongeveer 3 ... .", answer: "m" },
        { id: 14, text: "De lengte van een smartphone is ongeveer 15 ... .", answer: "cm" },
        { id: 15, text: "De breedte van een smartphone is ongeveer 7 ... .", answer: "cm" },
        { id: 16, text: "De hoogte van een fles water is ongeveer 25 ... .", answer: "cm" },
        { id: 17, text: "De dikte van een blad papier is ongeveer 1 ... .", answer: "mm" },
        { id: 18, text: "De lengte van een meetlat is ongeveer 30 ... .", answer: "cm" },
        { id: 19, text: "De hoogte van een huis is ongeveer 8 ... .", answer: "m" },
        { id: 20, text: "De afstand die je wandelt op maandag tijdens sport en spel is ongeveer 1,5 ... .", answer: "km" },
        { id: 21, text: "De lengte van een klaslokaal is ongeveer 8 ... .", answer: "m" },
        { id: 22, text: "De breedte van een tafel is ongeveer 80 ... .", answer: "cm" },
        { id: 23, text: "De hoogte van een stoel is ongeveer 45 ... .", answer: "cm" },
        { id: 24, text: "De diameter van een voetbal is ongeveer 22 ... .", answer: "cm" },
        { id: 25, text: "De breedte van een raam is ongeveer 1 ... .", answer: "m" },
        { id: 26, text: "De dikte van een nagel is ongeveer 1 ... .", answer: "mm" },
        { id: 27, text: "De lengte van een brood is ongeveer 25 ... .", answer: "cm" },
        { id: 28, text: "De hoogte van een lantaarnpaal is ongeveer 6 ... .", answer: "m" },
        { id: 29, text: "De afstand tussen onze school en de Nederlandse grens is ongeveer 15 ... .", answer: "km" },
        { id: 30, text: "De lengte van het speelplein achter de school is ongeveer 5 ... .", answer: "dam" },
        { id: 31, text: "De breedte van een voetbalveld is ongeveer 7 ... .", answer: "dam" },
        { id: 32, text: "De lengte van een zwembad is ongeveer 25 ... .", answer: "m" },
        { id: 33, text: "De dikte van een schrift is ongeveer 5 ... .", answer: "mm" },
        { id: 34, text: "De hoogte van een leerling uit het eerste middelbaar is ongeveer 1,5 ... .", answer: "m" },
        { id: 35, text: "De lengte van een paperclip is ongeveer 3 ... .", answer: "cm" },
        { id: 36, text: "De lengte van een tennisveld is ongeveer 2 ... .", answer: "dam" },
        { id: 37, text: "De breedte van een straat is ongeveer 1 ... .", answer: "dam" },
        { id: 38, text: "De afstand van Brussel naar Antwerpen is ongeveer 45 ... .", answer: "km" },
        { id: 39, text: "De dikte van een bankkaart is ongeveer 1 ... .", answer: "mm" },
        { id: 40, text: "De lengte van een fiets is ongeveer 2 ... .", answer: "m" },
        { id: 41, text: "De lengte van een atletiekpiste (één ronde) is ongeveer 4 ... .", answer: "hm" },
        { id: 42, text: "De afstand van onze school tot aan de spoorweg is ongeveer 10 ... .", answer: "hm" },
        { id: 43, text: "De lengte van een groot pretpark van de ene kant naar de andere is ongeveer 20 ... .", answer: "hm" }
    ];
    
    const UNITS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
    
    let currentQuestion = 0;
    let score = 0;
    let attempts = {};
    let questions = [];
    
    // Select 8 balanced questions
    function selectQuestions() {
        // Group by answer
        const groups = {};
        SITUATIONS.forEach(sit => {
            if (!groups[sit.answer]) groups[sit.answer] = [];
            groups[sit.answer].push(sit);
        });
        
        // Try to get balanced distribution
        const selected = [];
        const answerCounts = {};
        
        // First pass: get one from each unit type
        for (let unit of UNITS) {
            if (groups[unit] && groups[unit].length > 0) {
                const random = groups[unit][Math.floor(Math.random() * groups[unit].length)];
                selected.push(random);
                answerCounts[unit] = 1;
            }
        }
        
        // Fill remaining slots randomly but try to balance
        while (selected.length < 8) {
            const allSituations = SITUATIONS.filter(s => !selected.find(sel => sel.id === s.id));
            const randomSit = allSituations[Math.floor(Math.random() * allSituations.length)];
            selected.push(randomSit);
            answerCounts[randomSit.answer] = (answerCounts[randomSit.answer] || 0) + 1;
        }
        
        // Shuffle
        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }
        
        return selected;
    }
    
    // Initialize
    questions = selectQuestions();
    questions.forEach(q => {
        attempts[q.id] = 0;
    });
    
    // Render question
    function render() {
        const q = questions[currentQuestion];
        attempts[q.id] = attempts[q.id] || 0;
        
        let html = `
            <div class="exercise-container">
                <!-- Progress -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Vraag ${currentQuestion + 1} van 8</span>
                        <span class="progress-score">Score: <strong>${score}</strong>/8</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(currentQuestion / 8) * 100}%"></div>
                    </div>
                </div>
                
                <div class="question-card">
                    <h3 class="question-title">Kies de juiste eenheid</h3>
                    <p class="question-text-large">${q.text}</p>
                    
                    <div class="unit-select-area">
                        <select id="unitSelect" class="unit-select">
                            <option value="">-- Kies een eenheid --</option>
                            ${UNITS.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="reference-button-area">
                        <button class="btn btn-secondary" id="referenceBtn">
                            📏 Klik hier voor de referentie-eenheden
                        </button>
                    </div>
                    
                    <div id="feedbackArea" class="feedback-area"></div>
                    
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>
            
            <!-- Reference Modal -->
            <div class="modal-overlay" id="referenceModal">
                <div class="modal-content" style="max-width: 800px;">
                    <h2>Referentie-eenheden</h2>
                    <div class="reference-image">
                        <img src="../images/referentie-eenheden-lengte.jpg" alt="Referentie-eenheden" style="width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                    <div class="modal-actions" style="margin-top: 1.5rem;">
                        <button class="btn btn-primary" id="closeModalBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Event listeners
        document.getElementById('checkBtn').addEventListener('click', checkAnswer);
        document.getElementById('referenceBtn').addEventListener('click', showReference);
        document.getElementById('closeModalBtn').addEventListener('click', hideReference);
        
        // Close modal on overlay click
        document.getElementById('referenceModal').addEventListener('click', (e) => {
            if (e.target.id === 'referenceModal') hideReference();
        });
    }
    
    function showReference() {
        document.getElementById('referenceModal').classList.add('active');
    }
    
    function hideReference() {
        document.getElementById('referenceModal').classList.remove('active');
    }
    
    function checkAnswer() {
        const q = questions[currentQuestion];
        const select = document.getElementById('unitSelect');
        const userAnswer = select.value;
        
        if (!userAnswer) {
            return; // No selection
        }
        
        attempts[q.id]++;
        const isCorrect = userAnswer === q.answer;
        
        if (isCorrect) {
            if (attempts[q.id] === 1) {
                score += 1;
            } else {
                score += 0.5;
            }
            showFeedback(true, q, attempts[q.id]);
        } else {
            if (attempts[q.id] === 1) {
                showFeedback(false, q, attempts[q.id], true);
            } else {
                showFeedback(false, q, attempts[q.id], false);
            }
        }
    }
    
    function showFeedback(correct, question, attemptNum, canRetry) {
        const feedbackArea = document.getElementById('feedbackArea');
        const select = document.getElementById('unitSelect');
        const checkBtn = document.getElementById('checkBtn');
        
        // Hide check button when feedback is shown
        checkBtn.style.display = 'none';
        
        if (correct) {
            const message = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${message}</p>
                    <button class="btn btn-primary" onclick="window.nextUnitQuestion()">OK</button>
                </div>
            `;
            select.disabled = true;
            
        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist. Gebruik het overzicht van de referentie-eenheden.</p>
                    <button class="btn btn-primary" onclick="window.retryUnitQuestion()">OK</button>
                </div>
            `;
            
        } else {
            // Show correct answer in blue
            const parts = question.text.split('...');
            const correctText = parts[0] + `<span style="color: var(--color-primary); font-weight: 700;">${question.answer}</span>` + parts[1];
            
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist.</p>
                    <p style="margin-top: 1rem;">${correctText}</p>
                    <button class="btn btn-primary" onclick="window.nextUnitQuestion()">OK</button>
                </div>
            `;
            select.disabled = true;
        }
    }
    
    window.retryUnitQuestion = function() {
        // Reset for second attempt
        const select = document.getElementById('unitSelect');
        const checkBtn = document.getElementById('checkBtn');
        const feedbackArea = document.getElementById('feedbackArea');
        
        select.value = '';
        checkBtn.style.display = 'block';
        feedbackArea.innerHTML = '';
    };
    
    window.nextUnitQuestion = function() {
        currentQuestion++;
        
        if (currentQuestion >= 8) {
            finish();
        } else {
            render();
        }
    };
    
    function finish() {
        const percentage = (score / 8) * 100;
        const xpEarned = Math.max(0, Math.round(score * 10));
        
        onComplete({
            score: percentage,
            correctAnswers: score,
            totalQuestions: 8,
            xpEarned: xpEarned
        });
    }
    
    // Add CSS
    addCSS();
    
    function addCSS() {
        if (document.getElementById('eenheden-kiezen-css')) return;
        
        const style = document.createElement('style');
        style.id = 'eenheden-kiezen-css';
        style.textContent = `
            .unit-select-area {
                margin: 2rem 0;
                display: flex;
                justify-content: center;
            }
            
            .unit-select {
                width: 300px;
                padding: 1rem;
                font-size: var(--font-size-large);
                border: 3px solid var(--color-gray);
                border-radius: var(--radius-md);
                background: white;
                cursor: pointer;
                transition: border-color var(--transition-fast);
            }
            
            .unit-select:focus {
                outline: none;
                border-color: var(--color-primary);
            }
            
            .unit-select:disabled {
                background: var(--color-light);
                cursor: not-allowed;
            }
            
            .reference-button-area {
                margin: 1.5rem 0;
                text-align: center;
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
            
            .reference-image {
                margin: 1.5rem 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Start
    render();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initEenhedenKiezen };
}
