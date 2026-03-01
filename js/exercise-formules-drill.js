// ============================================
// EXERCISE: FORMULES DRILL
// Oefening voor het inprenten van formules
// 3 vragen met elk 2 pogingen
// ============================================

class FormulasDrillExercise {
    constructor(containerEl, onComplete) {
        this.container = containerEl;
        this.onComplete = onComplete;
        
        this.currentQuestion = 0;
        this.score = 0;
        this.maxScore = 3;
        this.attempts = {}; // Track attempts per question
        
        this.questions = [
            {
                id: 'q1',
                type: 'input',
                question: 'Noteer het symbool voor de omtrek van een vlakke figuur.',
                correctAnswer: 'P',
                hints: {
                    notUppercase: 'Het symbool voor de omtrek is een drukletter.',
                    wrongLetter: 'Denk aan de naam van de ring van Parijs, of aan het moeilijker woord voor omtrek.'
                }
            },
            {
                id: 'q2',
                type: 'input',
                question: 'Noteer het symbool voor de oppervlakte van een vlakke figuur.',
                correctAnswer: 'A',
                hints: {
                    notUppercase: 'Het symbool voor de oppervlakte is een drukletter.',
                    wrongLetter: 'Denk aan het Engelse woord voor oppervlakte.'
                }
            },
            {
                id: 'q3',
                type: 'dragdrop',
                question: 'Versleep naar de juiste plaats.',
                zones: ['Omtrek', 'Oppervlakte'],
                items: [
                    { id: 'item1', text: 'De afstand die je aflegt als je volledig rond de figuur wandelt.', zone: 'Omtrek' },
                    { id: 'item2', text: 'P', zone: 'Omtrek' },
                    { id: 'item3', type: 'svg', shape: 'outline', zone: 'Omtrek' },
                    { id: 'item4', text: 'De plaats die de figuur inneemt in het vlak.', zone: 'Oppervlakte' },
                    { id: 'item5', text: 'A', zone: 'Oppervlakte' },
                    { id: 'item6', type: 'svg', shape: 'filled', zone: 'Oppervlakte' }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        // Initialize attempts tracking
        this.questions.forEach(q => {
            this.attempts[q.id] = 0;
        });
        
        this.render();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="exercise-container">
                <!-- Progress Bar -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Voortgang</span>
                        <span class="progress-score">Score: <strong>${this.score.toFixed(1)}</strong> / ${this.maxScore}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentQuestion / this.questions.length) * 100}%"></div>
                    </div>
                    <div class="progress-text">Vraag ${this.currentQuestion + 1} van ${this.questions.length}</div>
                </div>
                
                <!-- Question Container -->
                <div class="question-container" id="questionContainer">
                    <!-- Will be filled dynamically -->
                </div>
            </div>
        `;
        
        this.renderQuestion();
    }
    
    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const container = document.getElementById('questionContainer');
        
        if (question.type === 'input') {
            this.renderInputQuestion(question, container);
        } else if (question.type === 'dragdrop') {
            this.renderDragDropQuestion(question, container);
        }
    }
    
    renderInputQuestion(question, container) {
        container.innerHTML = `
            <div class="question-card">
                <h3 class="question-title">Vraag ${this.currentQuestion + 1}</h3>
                <p class="question-text">${question.question}</p>
                
                <div class="input-area">
                    <input type="text" 
                           id="answerInput" 
                           class="answer-input" 
                           autocomplete="off"
                           spellcheck="false"
                           maxlength="1"
                           placeholder="Typ je antwoord...">
                </div>
                
                <div class="feedback-area hidden" id="feedbackArea">
                    <!-- Feedback will appear here -->
                </div>
                
                <div class="question-actions">
                    <button class="btn btn-primary" id="submitBtn" onclick="exerciseInstance.checkInputAnswer()">
                        Controleer
                    </button>
                </div>
            </div>
        `;
        
        // Focus input and add enter key listener
        setTimeout(() => {
            const input = document.getElementById('answerInput');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkInputAnswer();
                }
            });
        }, 100);
    }
    
    checkInputAnswer() {
        const question = this.questions[this.currentQuestion];
        const input = document.getElementById('answerInput');
        const answer = input.value.trim();
        const attempt = this.attempts[question.id] + 1;
        
        if (!answer) {
            alert('Vul eerst een antwoord in.');
            return;
        }
        
        const isCorrect = answer === question.correctAnswer;
        const isUppercase = answer === answer.toUpperCase();
        
        if (isCorrect) {
            // Correct answer
            const points = attempt === 1 ? 1 : 0.5;
            this.score += points;
            
            const feedbackText = attempt === 1 ? 
                'Correct!' : 
                'Correct bij de tweede poging!';
            
            this.showFeedback(feedbackText, true, () => {
                this.nextQuestion();
            });
        } else {
            // Wrong answer
            this.attempts[question.id] = attempt;
            
            if (attempt === 1) {
                // First attempt - give hints
                let hints = [];
                
                if (!isUppercase && answer.toLowerCase() === question.correctAnswer.toLowerCase()) {
                    hints.push(question.hints.notUppercase);
                } else {
                    if (!isUppercase) {
                        hints.push(question.hints.notUppercase);
                    }
                    hints.push(question.hints.wrongLetter);
                }
                
                this.showFeedback(hints.join('<br>'), false, () => {
                    // Clear input and give second chance
                    input.value = '';
                    input.focus();
                    document.getElementById('feedbackArea').classList.add('hidden');
                });
            } else {
                // Second attempt - show correct answer
                const feedbackText = `Helaas, dit had je niet juist. Het juiste antwoord is <strong>${question.correctAnswer}</strong>.`;
                
                this.showFeedback(feedbackText, false, () => {
                    this.nextQuestion();
                });
            }
        }
        
        this.updateProgress();
    }
    
    renderDragDropQuestion(question, container) {
        // Shuffle items
        const shuffledItems = [...question.items].sort(() => Math.random() - 0.5);
        
        container.innerHTML = `
            <div class="question-card">
                <h3 class="question-title">Vraag ${this.currentQuestion + 1}</h3>
                <p class="question-text">${question.question}</p>
                
                <div class="dragdrop-container">
                    <!-- Drop Zones -->
                    <div class="drop-zones">
                        ${question.zones.map(zone => `
                            <div class="drop-zone" data-zone="${zone}">
                                <h4 class="zone-title">${zone}</h4>
                                <div class="zone-items" id="zone-${zone}"></div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Items Pool -->
                    <div class="items-pool" id="itemsPool">
                        <h4 class="pool-title">Sleep deze items naar de juiste plaats:</h4>
                        <div class="pool-items">
                            ${shuffledItems.map(item => this.renderDraggableItem(item)).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="feedback-area hidden" id="feedbackArea">
                    <!-- Feedback will appear here -->
                </div>
                
                <div class="question-actions">
                    <button class="btn btn-primary hidden" id="checkBtn" onclick="exerciseInstance.checkDragDropAnswer()">
                        Controleer
                    </button>
                </div>
            </div>
        `;
        
        this.initDragDrop();
    }
    
    renderDraggableItem(item) {
        if (item.type === 'svg') {
            return `
                <div class="draggable-item" draggable="true" data-id="${item.id}" data-zone="${item.zone}">
                    ${this.renderSVGShape(item.shape)}
                </div>
            `;
        } else {
            return `
                <div class="draggable-item" draggable="true" data-id="${item.id}" data-zone="${item.zone}">
                    ${item.text}
                </div>
            `;
        }
    }
    
    renderSVGShape(type) {
        if (type === 'outline') {
            // Orange outline, no fill - L shape
            return `
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <path d="M 10 10 L 50 10 L 50 40 L 70 40 L 70 70 L 10 70 Z" 
                          fill="none" 
                          stroke="#FFB366" 
                          stroke-width="4"/>
                </svg>
            `;
        } else {
            // Blue fill, black outline - L shape (different orientation)
            return `
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <path d="M 10 10 L 50 10 L 50 40 L 70 40 L 70 70 L 40 70 L 40 40 L 10 40 Z" 
                          fill="#A8D8E5" 
                          stroke="#333" 
                          stroke-width="2"/>
                </svg>
            `;
        }
    }
    
    initDragDrop() {
        const items = document.querySelectorAll('.draggable-item');
        const zones = document.querySelectorAll('.zone-items');
        let draggedElement = null;
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                this.checkIfAllPlaced();
            });
        });
        
        zones.forEach(zone => {
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
                
                if (draggedElement) {
                    zone.appendChild(draggedElement);
                    draggedElement = null;
                }
            });
        });
        
        // Also allow dropping back to pool
        const pool = document.querySelector('.pool-items');
        pool.addEventListener('dragover', (e) => {
            e.preventDefault();
            pool.classList.add('drag-over');
        });
        
        pool.addEventListener('dragleave', (e) => {
            pool.classList.remove('drag-over');
        });
        
        pool.addEventListener('drop', (e) => {
            e.preventDefault();
            pool.classList.remove('drag-over');
            
            if (draggedElement) {
                pool.appendChild(draggedElement);
                draggedElement = null;
            }
        });
    }
    
    checkIfAllPlaced() {
        const pool = document.querySelector('.pool-items');
        const itemsInPool = pool.querySelectorAll('.draggable-item').length;
        const checkBtn = document.getElementById('checkBtn');
        
        if (itemsInPool === 0) {
            checkBtn.classList.remove('hidden');
        } else {
            checkBtn.classList.add('hidden');
        }
    }
    
    checkDragDropAnswer() {
        const question = this.questions[this.currentQuestion];
        const zones = document.querySelectorAll('.drop-zone');
        const attempt = this.attempts[question.id] + 1;
        
        let allCorrect = true;
        const userAnswers = {};
        
        zones.forEach(zone => {
            const zoneName = zone.dataset.zone;
            const items = zone.querySelectorAll('.draggable-item');
            
            userAnswers[zoneName] = [];
            
            items.forEach(item => {
                const itemId = item.dataset.id;
                const correctZone = item.dataset.zone;
                userAnswers[zoneName].push(itemId);
                
                if (correctZone !== zoneName) {
                    allCorrect = false;
                }
            });
        });
        
        if (allCorrect) {
            // Correct answer
            const points = attempt === 1 ? 1 : 0.5;
            this.score += points;
            
            const feedbackText = attempt === 1 ? 
                'Correct!' : 
                'Correct bij de tweede poging!';
            
            this.showFeedback(feedbackText, true, () => {
                this.finishExercise();
            });
        } else {
            // Wrong answer
            this.attempts[question.id] = attempt;
            
            if (attempt === 1) {
                // First attempt - let them try again
                this.showFeedback('Dit klopt niet helemaal. Probeer opnieuw.', false, () => {
                    // Reset to initial state
                    this.resetDragDrop();
                    document.getElementById('feedbackArea').classList.add('hidden');
                });
            } else {
                // Second attempt - show correct answer
                const correctAnswerHTML = this.generateCorrectAnswerDisplay(question);
                
                this.showFeedback(`
                    Helaas, dit had je niet juist. Het juiste antwoord is:<br><br>
                    ${correctAnswerHTML}
                `, false, () => {
                    this.finishExercise();
                });
            }
        }
        
        this.updateProgress();
    }
    
    generateCorrectAnswerDisplay(question) {
        const omtrekItems = question.items
            .filter(item => item.zone === 'Omtrek')
            .map(item => item.type === 'svg' ? 
                this.renderSVGShape(item.shape) : 
                item.text);
        
        const oppervlakteItems = question.items
            .filter(item => item.zone === 'Oppervlakte')
            .map(item => item.type === 'svg' ? 
                this.renderSVGShape(item.shape) : 
                item.text);
        
        return `
            <div class="correct-answer-display">
                <div class="answer-column">
                    <h4>Omtrek</h4>
                    ${omtrekItems.map(item => `<div class="answer-item">${item}</div>`).join('')}
                </div>
                <div class="answer-column">
                    <h4>Oppervlakte</h4>
                    ${oppervlakteItems.map(item => `<div class="answer-item">${item}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    resetDragDrop() {
        const question = this.questions[this.currentQuestion];
        const pool = document.querySelector('.pool-items');
        const items = document.querySelectorAll('.draggable-item');
        
        // Move all items back to pool
        items.forEach(item => {
            pool.appendChild(item);
        });
        
        // Shuffle again
        const itemsArray = Array.from(items);
        itemsArray.sort(() => Math.random() - 0.5);
        itemsArray.forEach(item => pool.appendChild(item));
        
        // Hide check button
        document.getElementById('checkBtn').classList.add('hidden');
    }
    
    showFeedback(message, isCorrect, onOK) {
        const feedbackArea = document.getElementById('feedbackArea');
        const className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        
        feedbackArea.innerHTML = `
            <div class="feedback-message ${className}">
                <div class="feedback-text">${message}</div>
                <button class="btn btn-primary" onclick="exerciseInstance.handleFeedbackOK()">OK</button>
            </div>
        `;
        
        feedbackArea.classList.remove('hidden');
        
        // Store callback
        this.feedbackCallback = onOK;
        
        // Hide submit/check buttons
        const submitBtn = document.getElementById('submitBtn');
        const checkBtn = document.getElementById('checkBtn');
        if (submitBtn) submitBtn.style.display = 'none';
        if (checkBtn) checkBtn.style.display = 'none';
    }
    
    handleFeedbackOK() {
        if (this.feedbackCallback) {
            this.feedbackCallback();
            this.feedbackCallback = null;
        }
    }
    
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressScore = document.querySelector('.progress-score strong');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${((this.currentQuestion + 1) / this.questions.length) * 100}%`;
        }
        if (progressScore) {
            progressScore.textContent = this.score.toFixed(1);
        }
        if (progressText) {
            progressText.textContent = `Vraag ${this.currentQuestion + 1} van ${this.questions.length}`;
        }
    }
    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.render();
        } else {
            this.finishExercise();
        }
    }
    
    finishExercise() {
        // Calculate letter score
        const percentage = (this.score / this.maxScore) * 100;
        let letterScore = 'C';
        
        if (this.score === 3) {
            letterScore = 'A';
        } else if (this.score >= 2) {
            letterScore = 'B';
        }
        
        // Call completion callback
        if (this.onComplete) {
            this.onComplete({
                score: percentage,
                correctAnswers: this.score,
                totalQuestions: this.maxScore,
                xpEarned: 30, // From part config
                letterScore: letterScore
            });
        }
    }
}

// Make instance globally accessible
let exerciseInstance = null;

function initFormulasDrill(containerEl, onComplete) {
    exerciseInstance = new FormulasDrillExercise(containerEl, onComplete);
}
