// ============================================
// EXERCISE: ROOSTER BEREKENING
// Oefening voor omtrek en oppervlakte in rooster
// 6 vragen met willekeurig gegenereerde veelhoeken
// ============================================

class RoosterBerekeningExercise {
    constructor(containerEl, onComplete) {
        this.container = containerEl;
        this.onComplete = onComplete;
        
        this.currentQuestion = 0;
        this.score = 0;
        this.maxScore = 6;
        this.attempts = {};
        this.questions = [];
        
        this.gridSize = 10;
        this.cellSize = 40; // pixels per cell
        
        this.init();
    }
    
    init() {
        // Generate 6 questions (roughly equal perimeter/area)
        const types = ['perimeter', 'area', 'perimeter', 'area', 'perimeter', 'area'];
        this.shuffleArray(types);
        
        for (let i = 0; i < 6; i++) {
            const polygon = this.generatePolygon();
            this.questions.push({
                id: `q${i + 1}`,
                type: types[i],
                polygon: polygon,
                correctAnswer: types[i] === 'perimeter' ? 
                    this.calculatePerimeter(polygon) : 
                    this.calculateArea(polygon)
            });
            this.attempts[`q${i + 1}`] = 0;
        }
        
        this.render();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    generatePolygon() {
        // Generate a random rectilinear polygon (only horizontal/vertical sides)
        // Strategy: Create complex shapes with at least 6 sides
        
        const minSize = 3;
        const maxSize = 7;
        
        // Start with a base rectangle
        const baseWidth = minSize + Math.floor(Math.random() * (maxSize - minSize));
        const baseHeight = minSize + Math.floor(Math.random() * (maxSize - minSize));
        
        // Position it somewhat centered
        const startX = 2 + Math.floor(Math.random() * 2);
        const startY = 2 + Math.floor(Math.random() * 2);
        
        // Create more complex shapes by cutting multiple corners/adding indentations
        const shapeType = Math.floor(Math.random() * 3);
        
        if (shapeType === 0) {
            // L-shape with extra indentation (8 sides)
            const cutWidth = 1 + Math.floor(Math.random() * Math.floor(baseWidth / 3));
            const cutHeight = 1 + Math.floor(Math.random() * Math.floor(baseHeight / 3));
            const indentDepth = 1 + Math.floor(Math.random() * 2);
            
            return [
                {x: startX, y: startY},
                {x: startX + baseWidth, y: startY},
                {x: startX + baseWidth, y: startY + cutHeight},
                {x: startX + baseWidth - indentDepth, y: startY + cutHeight},
                {x: startX + baseWidth - indentDepth, y: startY + baseHeight},
                {x: startX + cutWidth, y: startY + baseHeight},
                {x: startX + cutWidth, y: startY + baseHeight - cutHeight},
                {x: startX, y: startY + baseHeight - cutHeight}
            ];
        } else if (shapeType === 1) {
            // U-shape (8 sides)
            const innerWidth = Math.floor(baseWidth / 3);
            const innerHeight = Math.floor(baseHeight * 0.6);
            
            return [
                {x: startX, y: startY},
                {x: startX + baseWidth, y: startY},
                {x: startX + baseWidth, y: startY + baseHeight},
                {x: startX + baseWidth - innerWidth, y: startY + baseHeight},
                {x: startX + baseWidth - innerWidth, y: startY + innerHeight},
                {x: startX + innerWidth, y: startY + innerHeight},
                {x: startX + innerWidth, y: startY + baseHeight},
                {x: startX, y: startY + baseHeight}
            ];
        } else {
            // T-shape or cross-like (10 sides)
            const armWidth = Math.floor(baseWidth / 3);
            const armHeight = Math.floor(baseHeight / 3);
            
            return [
                {x: startX + armWidth, y: startY},
                {x: startX + baseWidth - armWidth, y: startY},
                {x: startX + baseWidth - armWidth, y: startY + armHeight},
                {x: startX + baseWidth, y: startY + armHeight},
                {x: startX + baseWidth, y: startY + baseHeight - armHeight},
                {x: startX + baseWidth - armWidth, y: startY + baseHeight - armHeight},
                {x: startX + baseWidth - armWidth, y: startY + baseHeight},
                {x: startX + armWidth, y: startY + baseHeight},
                {x: startX + armWidth, y: startY + baseHeight - armHeight},
                {x: startX, y: startY + baseHeight - armHeight},
                {x: startX, y: startY + armHeight},
                {x: startX + armWidth, y: startY + armHeight}
            ];
        }
    }
    
    calculatePerimeter(polygon) {
        let perimeter = 0;
        for (let i = 0; i < polygon.length; i++) {
            const current = polygon[i];
            const next = polygon[(i + 1) % polygon.length];
            const dist = Math.abs(current.x - next.x) + Math.abs(current.y - next.y);
            perimeter += dist;
        }
        return perimeter;
    }
    
    calculateArea(polygon) {
        // Use shoelace formula
        let area = 0;
        for (let i = 0; i < polygon.length; i++) {
            const current = polygon[i];
            const next = polygon[(i + 1) % polygon.length];
            area += current.x * next.y - next.x * current.y;
        }
        return Math.abs(area) / 2;
    }
    
    getSideLengths(polygon) {
        const lengths = [];
        for (let i = 0; i < polygon.length; i++) {
            const current = polygon[i];
            const next = polygon[(i + 1) % polygon.length];
            const dist = Math.abs(current.x - next.x) + Math.abs(current.y - next.y);
            lengths.push(dist);
        }
        return lengths;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="exercise-container">
                <!-- Progress Bar -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Voortgang</span>
                        <span class="progress-score">Score: <strong>${this.score.toFixed(1).replace('.', ',')}</strong> / ${this.maxScore}</span>
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
        
        const symbol = question.type === 'perimeter' ? 'P' : 'A';
        const label = question.type === 'perimeter' ? 'Omtrek' : 'Oppervlakte';
        
        container.innerHTML = `
            <div class="question-card">
                <h3 class="question-title">Vraag ${this.currentQuestion + 1}</h3>
                <p class="question-text">Bereken de ${label.toLowerCase()} van de figuur.</p>
                
                <div class="rooster-container">
                    <div class="rooster-canvas" id="roosterCanvas">
                        ${this.renderGrid(question.polygon, false, false)}
                    </div>
                    
                    <div class="rooster-input-area">
                        <label class="rooster-label">${symbol} = </label>
                        <input type="number" 
                               id="answerInput" 
                               class="rooster-answer-input" 
                               autocomplete="off"
                               min="0"
                               step="1">
                    </div>
                </div>
                
                <div class="feedback-area hidden" id="feedbackArea">
                    <!-- Feedback will appear here -->
                </div>
                
                <div class="question-actions">
                    <button class="btn btn-primary" id="submitBtn" onclick="roosterExerciseInstance.checkAnswer()">
                        Controleer
                    </button>
                </div>
            </div>
        `;
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('answerInput');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }, 100);
    }
    
    renderGrid(polygon, showLabels, showNumbers) {
        const width = this.gridSize * this.cellSize;
        const height = this.gridSize * this.cellSize;
        
        let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="rooster-svg">`;
        
        // Draw grid lines
        if (!showLabels) {
            // Show full grid
            svg += '<g class="grid-lines">';
            for (let i = 0; i <= this.gridSize; i++) {
                const pos = i * this.cellSize;
                svg += `<line x1="${pos}" y1="0" x2="${pos}" y2="${height}" stroke="#ddd" stroke-width="1"/>`;
                svg += `<line x1="0" y1="${pos}" x2="${width}" y2="${pos}" stroke="#ddd" stroke-width="1"/>`;
            }
            svg += '</g>';
            
            // Unit indicator (top-left)
            svg += `<g class="unit-indicator">
                <line x1="${this.cellSize}" y1="${this.cellSize * 0.7}" x2="${this.cellSize * 2}" y2="${this.cellSize * 0.7}" stroke="#333" stroke-width="2"/>
                <line x1="${this.cellSize}" y1="${this.cellSize * 0.5}" x2="${this.cellSize}" y2="${this.cellSize * 0.9}" stroke="#333" stroke-width="2"/>
                <line x1="${this.cellSize * 2}" y1="${this.cellSize * 0.5}" x2="${this.cellSize * 2}" y2="${this.cellSize * 0.9}" stroke="#333" stroke-width="2"/>
                <text x="${this.cellSize * 1.5}" y="${this.cellSize * 0.4}" text-anchor="middle" font-size="14" font-weight="bold">1</text>
            </g>`;
        } else {
            // Simplified grid for feedback
            svg += '<g class="grid-lines">';
            for (let i = 0; i <= this.gridSize; i++) {
                const pos = i * this.cellSize;
                svg += `<line x1="${pos}" y1="0" x2="${pos}" y2="${height}" stroke="#ddd" stroke-width="1"/>`;
                svg += `<line x1="0" y1="${pos}" x2="${width}" y2="${pos}" stroke="#ddd" stroke-width="1"/>`;
            }
            svg += '</g>';
        }
        
        // Draw polygon
        const points = polygon.map(p => `${p.x * this.cellSize},${p.y * this.cellSize}`).join(' ');
        svg += `<polygon points="${points}" fill="rgba(224, 224, 224, 0.6)" stroke="#000" stroke-width="2"/>`;
        
        // Add side labels if requested
        if (showLabels) {
            const lengths = this.getSideLengths(polygon);
            for (let i = 0; i < polygon.length; i++) {
                const current = polygon[i];
                const next = polygon[(i + 1) % polygon.length];
                const midX = ((current.x + next.x) / 2) * this.cellSize;
                const midY = ((current.y + next.y) / 2) * this.cellSize;
                
                // Offset label based on direction
                let offsetX = 0;
                let offsetY = 0;
                if (current.x === next.x) {
                    // Vertical line
                    offsetX = current.x < polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length ? -15 : 15;
                } else {
                    // Horizontal line
                    offsetY = current.y < polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length ? -10 : 20;
                }
                
                svg += `<text x="${midX + offsetX}" y="${midY + offsetY}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${lengths[i]}</text>`;
            }
        }
        
        // Add cell numbers if requested
        if (showNumbers) {
            const cellsInside = this.getCellsInsidePolygon(polygon);
            cellsInside.forEach((cell, index) => {
                const x = (cell.x + 0.5) * this.cellSize;
                const y = (cell.y + 0.5) * this.cellSize;
                svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="#333">${index + 1}</text>`;
            });
        }
        
        svg += '</svg>';
        return svg;
    }
    
    renderFeedbackPolygon(polygon, type, showLabels) {
        const width = this.gridSize * this.cellSize;
        const height = this.gridSize * this.cellSize;
        
        let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="feedback-svg">`;
        
        // Draw grid if labels shown
        if (showLabels) {
            svg += '<g class="grid-lines">';
            for (let i = 0; i <= this.gridSize; i++) {
                const pos = i * this.cellSize;
                svg += `<line x1="${pos}" y1="0" x2="${pos}" y2="${height}" stroke="#ddd" stroke-width="1"/>`;
                svg += `<line x1="0" y1="${pos}" x2="${width}" y2="${pos}" stroke="#ddd" stroke-width="1"/>`;
            }
            svg += '</g>';
        }
        
        // Draw polygon
        const points = polygon.map(p => `${p.x * this.cellSize},${p.y * this.cellSize}`).join(' ');
        
        if (type === 'perimeter') {
            // Orange outline, no fill
            svg += `<polygon points="${points}" fill="none" stroke="#FFB366" stroke-width="4"/>`;
        } else {
            // Blue fill
            svg += `<polygon points="${points}" fill="#A8D8E5" stroke="#333" stroke-width="2"/>`;
        }
        
        // Add labels if requested
        if (showLabels) {
            if (type === 'perimeter') {
                const lengths = this.getSideLengths(polygon);
                for (let i = 0; i < polygon.length; i++) {
                    const current = polygon[i];
                    const next = polygon[(i + 1) % polygon.length];
                    const midX = ((current.x + next.x) / 2) * this.cellSize;
                    const midY = ((current.y + next.y) / 2) * this.cellSize;
                    
                    let offsetX = 0;
                    let offsetY = 0;
                    if (current.x === next.x) {
                        offsetX = current.x < polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length ? -15 : 15;
                    } else {
                        offsetY = current.y < polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length ? -10 : 20;
                    }
                    
                    svg += `<text x="${midX + offsetX}" y="${midY + offsetY}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${lengths[i]}</text>`;
                }
            } else {
                // Number cells for area
                const cellsInside = this.getCellsInsidePolygon(polygon);
                cellsInside.forEach((cell, index) => {
                    const x = (cell.x + 0.5) * this.cellSize;
                    const y = (cell.y + 0.5) * this.cellSize;
                    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="#333">${index + 1}</text>`;
                });
            }
        }
        
        svg += '</svg>';
        return svg;
    }
    
    getCellsInsidePolygon(polygon) {
        const cells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Check if cell center is inside polygon
                const cx = x + 0.5;
                const cy = y + 0.5;
                
                if (this.pointInPolygon(cx, cy, polygon)) {
                    cells.push({x, y});
                }
            }
        }
        return cells;
    }
    
    pointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    checkAnswer() {
        const question = this.questions[this.currentQuestion];
        const input = document.getElementById('answerInput');
        const answer = parseInt(input.value);
        const attempt = this.attempts[question.id] + 1;
        
        if (isNaN(answer) || input.value.trim() === '') {
            alert('Vul eerst een antwoord in.');
            return;
        }
        
        const isCorrect = answer === question.correctAnswer;
        
        // Disable input during feedback
        input.disabled = true;
        
        if (isCorrect) {
            // Correct answer
            const points = attempt === 1 ? 1 : 0.5;
            this.score += points;
            
            const feedbackText = attempt === 1 ? 
                'Correct!' : 
                'Correct bij de tweede poging!';
            
            this.showFeedback(feedbackText, true, null, () => {
                this.nextQuestion();
            });
        } else {
            // Wrong answer
            this.attempts[question.id] = attempt;
            
            if (attempt === 1) {
                // First attempt - show hint with visualization
                const hintText = question.type === 'perimeter' ?
                    'Dit is niet juist.<br>De omtrek is de afstand die je aflegt als je volledig rond de figuur wandelt. Probeer opnieuw.' :
                    'Dit is niet juist.<br>De oppervlakte is de plaats die de figuur inneemt in het vlak. Probeer opnieuw.';
                
                const visualization = this.renderFeedbackPolygon(question.polygon, question.type, false);
                
                this.showFeedback(hintText, false, visualization, () => {
                    // Clear input, enable it, and give second chance
                    input.value = '';
                    input.disabled = false;
                    input.focus();
                    document.getElementById('feedbackArea').classList.add('hidden');
                    const submitBtn = document.getElementById('submitBtn');
                    if (submitBtn) submitBtn.style.display = 'block';
                });
            } else {
                // Second attempt - show full solution
                let solutionText;
                let visualization;
                
                if (question.type === 'perimeter') {
                    const lengths = this.getSideLengths(question.polygon);
                    const sum = lengths.join(' + ');
                    solutionText = `Dit is niet juist.<br>De omtrek is de afstand die je aflegt als je volledig rond de figuur wandelt.<br>Het juiste antwoord is ${sum} = ${question.correctAnswer}.`;
                    visualization = this.renderFeedbackPolygon(question.polygon, question.type, true);
                } else {
                    solutionText = `Dit is niet juist.<br>De oppervlakte is de plaats die de figuur inneemt in het vlak.<br>Het juiste antwoord is ${question.correctAnswer}.`;
                    visualization = this.renderFeedbackPolygon(question.polygon, question.type, true);
                }
                
                this.showFeedback(solutionText, false, visualization, () => {
                    this.nextQuestion();
                });
            }
        }
        
        this.updateProgress();
    }
    
    showFeedback(message, isCorrect, visualization, onOK) {
        const feedbackArea = document.getElementById('feedbackArea');
        const className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        
        feedbackArea.innerHTML = `
            <div class="feedback-message ${className}">
                <div class="feedback-text">${message}</div>
                ${visualization ? `<div class="feedback-visualization">${visualization}</div>` : ''}
                <button class="btn btn-primary" onclick="roosterExerciseInstance.handleFeedbackOK()">OK</button>
            </div>
        `;
        
        feedbackArea.classList.remove('hidden');
        
        // Store callback
        this.feedbackCallback = onOK;
        
        // Hide submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.style.display = 'none';
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
            progressScore.textContent = this.score.toFixed(1).replace('.', ',');
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
        let letterScore = 'C';
        
        if (this.score >= 5) {
            letterScore = 'A';
        } else if (this.score >= 4) {
            letterScore = 'B';
        }
        
        // Calculate XP: score * 10 (minimum 0)
        const xpEarned = Math.max(0, Math.round(this.score * 10));
        
        // Call completion callback
        if (this.onComplete) {
            this.onComplete({
                score: (this.score / this.maxScore) * 100,
                correctAnswers: this.score,
                totalQuestions: this.maxScore,
                xpEarned: xpEarned,
                letterScore: letterScore
            });
        }
    }
}

// Make instance globally accessible
let roosterExerciseInstance = null;

function initRoosterBerekening(containerEl, onComplete) {
    roosterExerciseInstance = new RoosterBerekeningExercise(containerEl, onComplete);
}
