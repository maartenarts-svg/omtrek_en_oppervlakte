// ============================================
// EXERCISE: ROOSTER BEREKENING
// Oefening voor omtrek en oppervlakte in rooster
// 6 vragen met willekeurig gegenereerde veelhoeken
// Gebaseerd op vaste vormen: L, U, T, +, E
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
        // STAP 1: Kies willekeurig de vorm
        const shapes = ['L', 'U', 'T', '+', 'E'];
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        // STAP 2: Genereer lengtes volgens constraints
        const lengths = this.generateLengths(shapeType);
        
        // STAP 3: Bereken hulpfiguur hoekpunten (H1, H2, ...)
        const helpPoints = this.calculateHelpPoints(shapeType, lengths);
        
        // STAP 4: Kies rotatie (0, 1, 2, of 3 voor 0°, 90°, 180°, 270°)
        const n = Math.floor(Math.random() * 4);
        
        // STAP 5: Transformeer hulpfiguur naar definitieve figuur
        const polygon = this.transformPoints(helpPoints, n);
        
        // Bewaar metadata voor feedback
        polygon.shapeType = shapeType;
        polygon.lengths = lengths;
        polygon.rotation = n;
        
        return polygon;
    }
    
    generateLengths(shapeType) {
        const r = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
        
        if (shapeType === 'L') {
            const l1 = r(2, 6);
            const l2 = r(1, 5);
            const l3 = r(1, l1 - 1);
            const l4 = r(1, 6 - l2);
            const l5 = l1 - l3;
            const l6 = l2 + l4;
            return [l1, l2, l3, l4, l5, l6];
            
        } else if (shapeType === 'U') {
            const l1 = r(2, 6);
            const l2 = r(1, 4);
            const l3 = r(1, l1 - 1);
            const l4 = r(1, 5 - l2);
            const l5 = r(1, 6 - l1 + l3);
            const l6 = r(1, 6 - l2 - l4);
            const l7 = l1 + l5 - l3;
            const l8 = l2 + l4 + l6;
            return [l1, l2, l3, l4, l5, l6, l7, l8];
            
        } else if (shapeType === 'T') {
            const l1 = r(1, 5);
            const l2 = r(1, 4);
            const l3 = r(1, 6 - l1);
            const l4 = r(l2 + 2, 6);
            const l5 = r(1, l1 + l3 - 1);
            const l6 = r(1, l4 - l2 - 1);
            const l7 = l1 + l3 - l5;
            const l8 = l4 - l2 - l6;
            return [l1, l2, l3, l4, l5, l6, l7, l8];
            
        } else if (shapeType === 'E') {
            const l1 = r(5, 6);
            const l2 = r(2, 6);
            const l3 = r(1, l1 - 4);
            const l4 = r(1, l2 - 1);
            const l5 = r(1, l1 - l3 - 3);
            const l6 = r(1, 6 - l2 + l4);
            const l7 = r(1, l1 - l3 - l5 - 2);
            const l8 = r(1, l2 - l4 + l6 - 1);
            const l9 = r(1, l1 - l3 - l5 - l7 - 1);
            const l10 = r(1, 6 - l2 + l4 - l6 + l8);
            const l11 = l1 - l3 - l5 - l7 - l9;
            const l12 = l2 + l6 + l10 - l4 - l8;
            return [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12];
            
        } else { // '+'
            const l1 = r(1, 4);
            const l2 = r(1, 4);
            const l3 = r(1, 5 - l1);
            const l4 = r(1, 4);
            const l5 = r(1, 6 - l1 - l3);
            const l6 = r(Math.max(l1 - l4 + 1, 1), 5 - l4);
            const l7 = r(1, l1 + l3 + l5 - 2);
            const l8 = r(Math.max(l1 - l4 - l6 + 1, 1), 6 - l4 - l6);
            const l9 = r(1, l1 + l3 + l5 - l7 - 1);
            const l10 = r(1, 5 - l2);
            const l11 = l1 + l3 + l5 - l7 - l9;
            const l12 = l4 + l6 + l8 - l2 - l10;
            return [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12];
        }
    }
    
    calculateHelpPoints(shapeType, L) {
        const add = (p, delta) => ({x: p.x + delta[0], y: p.y + delta[1]});
        
        if (shapeType === 'L') {
            const H1 = {x: 2, y: 8};
            const H2 = add(H1, [0, -L[0]]);
            const H3 = add(H2, [L[1], 0]);
            const H4 = add(H3, [0, L[2]]);
            const H5 = add(H4, [L[3], 0]);
            const H6 = add(H5, [0, L[4]]);
            return [H1, H2, H3, H4, H5, H6];
            
        } else if (shapeType === 'U') {
            const H1 = {x: 2, y: 8};
            const H2 = add(H1, [0, -L[0]]);
            const H3 = add(H2, [L[1], 0]);
            const H4 = add(H3, [0, L[2]]);
            const H5 = add(H4, [L[3], 0]);
            const H6 = add(H5, [0, -L[4]]);
            const H7 = add(H6, [L[5], 0]);
            const H8 = add(H7, [0, L[6]]);
            return [H1, H2, H3, H4, H5, H6, H7, H8];
            
        } else if (shapeType === 'T') {
            const H1 = {x: 2 + L[1], y: 8};
            const H2 = add(H1, [0, -L[0]]);
            const H3 = add(H2, [-L[1], 0]);
            const H4 = add(H3, [0, -L[2]]);
            const H5 = add(H4, [L[3], 0]);
            const H6 = add(H5, [0, L[4]]);
            const H7 = add(H6, [-L[5], 0]);
            const H8 = add(H7, [0, L[6]]);
            return [H1, H2, H3, H4, H5, H6, H7, H8];
            
        } else if (shapeType === 'E') {
            const H1 = {x: 2, y: 8};
            const H2 = add(H1, [0, -L[0]]);
            const H3 = add(H2, [L[1], 0]);
            const H4 = add(H3, [0, L[2]]);
            const H5 = add(H4, [-L[3], 0]);
            const H6 = add(H5, [0, L[4]]);
            const H7 = add(H6, [L[5], 0]);
            const H8 = add(H7, [0, L[6]]);
            const H9 = add(H8, [-L[7], 0]);
            const H10 = add(H9, [0, L[8]]);
            const H11 = add(H10, [L[9], 0]);
            const H12 = add(H11, [0, L[10]]);
            return [H1, H2, H3, H4, H5, H6, H7, H8, H9, H10, H11, H12];
            
        } else { // '+'
            const H1 = {x: 2 + L[1], y: 8};
            const H2 = add(H1, [0, -L[0]]);
            const H3 = add(H2, [-L[1], 0]);
            const H4 = add(H3, [0, -L[2]]);
            const H5 = add(H4, [L[3], 0]);
            const H6 = add(H5, [0, -L[4]]);
            const H7 = add(H6, [L[5], 0]);
            const H8 = add(H7, [0, L[6]]);
            const H9 = add(H8, [L[7], 0]);
            const H10 = add(H9, [0, L[8]]);
            const H11 = add(H10, [-L[9], 0]);
            const H12 = add(H11, [0, L[10]]);
            return [H1, H2, H3, H4, H5, H6, H7, H8, H9, H10, H11, H12];
        }
    }
    
    transformPoints(helpPoints, n) {
        // Bi = (Hi - (5,5)) × R^n + (5,5)
        // R = [[0, 1], [-1, 0]] (90° ccw rotatie)
        // (x, y) × R = (-y, x)
        
        const center = {x: 5, y: 5};
        const points = [];
        
        for (let H of helpPoints) {
            // Verplaats naar oorsprong
            let x = H.x - center.x;
            let y = H.y - center.y;
            
            // Pas rotatie n keer toe
            for (let i = 0; i < n; i++) {
                const newX = -y;
                const newY = x;
                x = newX;
                y = newY;
            }
            
            // Verplaats terug
            points.push({
                x: x + center.x,
                y: y + center.y
            });
        }
        
        return points;
    }
    
    calculatePerimeter(polygon) {
        let perimeter = 0;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            const dx = Math.abs(p2.x - p1.x);
            const dy = Math.abs(p2.y - p1.y);
            perimeter += dx + dy;
        }
        return perimeter;
    }
    
    calculateArea(polygon) {
        // Shoelace formula
        let area = 0;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            area += p1.x * p2.y - p2.x * p1.y;
        }
        return Math.abs(area / 2);
    }
    
    render() {
        const q = this.questions[this.currentQuestion];
        
        let html = `
            <div class="exercise-container">
                <!-- Progress -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Vraag ${this.currentQuestion + 1} van ${this.maxScore}</span>
                        <span class="progress-score">Score: <strong>${this.score}</strong>/6</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentQuestion / this.maxScore) * 100}%"></div>
                    </div>
                </div>
                
                <div class="question-card">
                    <div class="rooster-container">
                        <div class="rooster-canvas">
                            ${this.drawRooster(q.polygon, false)}
                        </div>
                        <div class="rooster-input-area">
                            <span class="rooster-label">${q.type === 'perimeter' ? 'P' : 'A'} =</span>
                            <input type="number" 
                                   id="answerInput" 
                                   class="rooster-answer-input" 
                                   style="width: 120px;"
                                   min="0" 
                                   step="1"
                                   autocomplete="off"
                                   autofocus>
                        </div>
                    </div>
                    
                    <div id="feedbackArea" class="feedback-area"></div>
                    
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Event listeners
        document.getElementById('checkBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }
    
    drawRooster(polygon, showFeedback = false, questionType = null) {
        const width = (this.gridSize + 1) * this.cellSize;
        const height = (this.gridSize + 1) * this.cellSize;
        
        let svg = `
            <svg class="rooster-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <!-- Grid lines -->
                <g class="grid-lines">
        `;
        
        // Draw grid
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.cellSize;
            svg += `<line x1="${pos}" y1="0" x2="${pos}" y2="${height}" stroke="#ddd" stroke-width="1"/>`;
            svg += `<line x1="0" y1="${pos}" x2="${width}" y2="${pos}" stroke="#ddd" stroke-width="1"/>`;
        }
        
        svg += `</g>`;
        
        // Draw polygon
        const points = polygon.map(p => `${p.x * this.cellSize},${p.y * this.cellSize}`).join(' ');
        
        if (showFeedback && questionType === 'area') {
            // Fill with blue and number the cells
            svg += `<polygon points="${points}" fill="rgba(168, 216, 229, 0.6)" stroke="#6B9BD1" stroke-width="3"/>`;
            
            // Number cells inside polygon
            const cells = this.getCellsInPolygon(polygon);
            cells.forEach((cell, index) => {
                const cx = cell.x * this.cellSize + this.cellSize / 2;
                const cy = cell.y * this.cellSize + this.cellSize / 2;
                svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" 
                             font-size="14" font-weight="600" fill="#2C3E50">${index + 1}</text>`;
            });
        } else if (showFeedback && questionType === 'perimeter') {
            // Draw with orange border and show side lengths
            svg += `<polygon points="${points}" fill="rgba(224, 224, 224, 0.6)" stroke="#FFB366" stroke-width="3"/>`;
            
            // Add side lengths (li values)
            const lengths = polygon.lengths;
            
            for (let i = 0; i < polygon.length; i++) {
                const p1 = polygon[i];
                const p2 = polygon[(i + 1) % polygon.length];
                
                // Midpoint van deze zijde
                const mx = (p1.x + p2.x) / 2 * this.cellSize;
                const my = (p1.y + p2.y) / 2 * this.cellSize;
                
                // Bepaal richting van de zijde
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                
                // Offset naar links (buitenkant): loodrecht op bewegingsrichting, naar links
                let ox = 0, oy = 0;
                const offset = 15;
                
                if (dx > 0) { // Moving right
                    oy = -offset; // Text above
                } else if (dx < 0) { // Moving left
                    oy = offset; // Text below
                } else if (dy > 0) { // Moving down
                    ox = offset; // Text to right
                } else if (dy < 0) { // Moving up
                    ox = -offset; // Text to left
                }
                
                svg += `<text x="${mx + ox}" y="${my + oy}" text-anchor="middle" dominant-baseline="middle" 
                             font-size="12" font-weight="600" fill="#FF8C42">${lengths[i]}</text>`;
            }
        } else {
            // Normal display
            svg += `<polygon points="${points}" fill="rgba(224, 224, 224, 0.6)" stroke="#333" stroke-width="2"/>`;
        }
        
        // Unit indicator
        const unitY = height - 25;
        svg += `
            <g class="unit-indicator">
                <line x1="${this.cellSize}" y1="${unitY}" x2="${this.cellSize * 2}" y2="${unitY}" 
                      stroke="#333" stroke-width="2"/>
                <line x1="${this.cellSize}" y1="${unitY - 5}" x2="${this.cellSize}" y2="${unitY + 5}" 
                      stroke="#333" stroke-width="2"/>
                <line x1="${this.cellSize * 2}" y1="${unitY - 5}" x2="${this.cellSize * 2}" y2="${unitY + 5}" 
                      stroke="#333" stroke-width="2"/>
                <text x="${this.cellSize * 1.5}" y="${unitY + 20}" text-anchor="middle" 
                      font-size="12" fill="#333">1 eenheid</text>
            </g>
        `;
        
        svg += `</svg>`;
        
        return svg;
    }
    
    getCellsInPolygon(polygon) {
        // Get all grid cells that are inside the polygon
        const cells = [];
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Check if cell center is inside polygon
                const cx = x + 0.5;
                const cy = y + 0.5;
                
                if (this.isPointInPolygon(cx, cy, polygon)) {
                    cells.push({x, y});
                }
            }
        }
        
        return cells;
    }
    
    isPointInPolygon(x, y, polygon) {
        // Ray casting algorithm
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) &&
                             (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    checkAnswer() {
        const q = this.questions[this.currentQuestion];
        const input = document.getElementById('answerInput');
        const userAnswer = parseFloat(input.value);
        
        if (isNaN(userAnswer)) {
            return;
        }
        
        const isCorrect = userAnswer === q.correctAnswer;
        this.attempts[q.id]++;
        
        if (isCorrect) {
            if (this.attempts[q.id] === 1) {
                this.score += 1;
            } else {
                this.score += 0.5;
            }
            this.showFeedback(true, q);
        } else {
            if (this.attempts[q.id] === 1) {
                this.showFeedback(false, q, true); // Can try again
            } else {
                this.showFeedback(false, q, false); // No more attempts
            }
        }
    }
    
    showFeedback(correct, question, canRetry = false) {
        const feedbackArea = document.getElementById('feedbackArea');
        const input = document.getElementById('answerInput');
        
        if (correct) {
            const message = this.attempts[question.id] === 1 ? 
                'Correct!' : 'Correct bij de tweede poging.';
            
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${message}</p>
                    <button class="btn btn-primary" onclick="window.nextQuestion()">OK</button>
                </div>
            `;
            
            input.disabled = true;
            document.getElementById('checkBtn').disabled = true;
        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist. Probeer het nog een keer.</p>
                </div>
            `;
        } else {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit is niet juist. Het juiste antwoord is ${question.correctAnswer}.</p>
                    <div class="feedback-visualization">
                        ${this.drawRooster(question.polygon, true, question.type)}
                    </div>
                    <button class="btn btn-primary" onclick="window.nextQuestion()">OK</button>
                </div>
            `;
            
            input.disabled = true;
            document.getElementById('checkBtn').disabled = true;
        }
    }
    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.maxScore) {
            this.finish();
        } else {
            this.render();
        }
    }
    
    finish() {
        const percentage = (this.score / this.maxScore) * 100;
        const xpEarned = Math.max(0, Math.round(this.score * 10));
        
        this.onComplete({
            score: percentage,
            correctAnswers: this.score,
            totalQuestions: this.maxScore,
            xpEarned: xpEarned
        });
    }
}

// Initialize function
function initRoosterBerekening(container, onComplete) {
    window.nextQuestion = function() {
        if (window.roosterExercise) {
            window.roosterExercise.nextQuestion();
        }
    };
    
    window.roosterExercise = new RoosterBerekeningExercise(container, onComplete);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initRoosterBerekening };
}
