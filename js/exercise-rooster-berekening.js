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
        // Choose random shape
        const shapes = ['L', 'U', 'T', '+', 'E'];
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Generate shape parameters
        let params;
        if (shapeType === 'L') {
            params = this.generateLShape();
        } else if (shapeType === 'U') {
            params = this.generateUShape();
        } else if (shapeType === 'T') {
            params = this.generateTShape();
        } else if (shapeType === '+') {
            params = this.generatePlusShape();
        } else {
            params = this.generateEShape();
        }
        
        // Choose random start direction (0=N, 1=E, 2=S, 3=W)
        const startDir = Math.floor(Math.random() * 4);
        
        // Determine start point based on shape and direction
        let startX, startY;
        const needsOffset = (shapeType === 'T' || shapeType === '+');
        const offset = needsOffset ? params.z1 : 0;
        
        if (startDir === 0) { // North
            startX = 2 + offset;
            startY = 8;
        } else if (startDir === 1) { // East
            startX = 2;
            startY = 2 + offset;
        } else if (startDir === 2) { // South
            startX = 8 - offset;
            startY = 2;
        } else { // West
            startX = 8;
            startY = 8 - offset;
        }
        
        // Build polygon following algorithm
        const polygon = this.buildPolygon(shapeType, params, startX, startY, startDir);
        
        // Store metadata for feedback
        polygon.shapeType = shapeType;
        polygon.params = params;
        polygon.startDir = startDir;
        polygon.startPoint = {x: startX, y: startY};
        
        return polygon;
    }
    
    generateLShape() {
        // n1 = z1 + z2, w1 = o1 + o2
        // All sums ≤ 6
        const z1 = 1 + Math.floor(Math.random() * 3); // 1-3
        const z2 = 1 + Math.floor(Math.random() * 3); // 1-3
        const n1 = z1 + z2;
        
        const o1 = 1 + Math.floor(Math.random() * 3);
        const o2 = 1 + Math.floor(Math.random() * Math.min(3, 7 - o1)); // ensure o1+o2 ≤ 6
        const w1 = o1 + o2;
        
        return {n1, o1, z1, o2, z2, w1};
    }
    
    generateUShape() {
        // n1 + n2 = z1 + z2, n1 > z1, o1 + o2 + o3 = w1
        const z1 = 1 + Math.floor(Math.random() * 2); // 1-2
        const z2 = 1 + Math.floor(Math.random() * 2);
        const n1 = z1 + 1 + Math.floor(Math.random() * 2); // n1 > z1
        const n2 = z1 + z2 - n1;
        
        const o1 = 1 + Math.floor(Math.random() * 2);
        const o2 = 1 + Math.floor(Math.random() * 2);
        const remaining = Math.max(1, 6 - o1 - o2);
        const o3 = 1 + Math.floor(Math.random() * Math.min(2, remaining));
        const w1 = o1 + o2 + o3;
        
        return {n1, o1, z1, o2, n2, o3, z2, w1};
    }
    
    generateTShape() {
        // n1 + n2 = z1 + z2, w1 + w2 + w3 = o1
        const n1 = 1 + Math.floor(Math.random() * 2);
        const n2 = 1 + Math.floor(Math.random() * 2);
        const total = n1 + n2;
        const z1 = 1 + Math.floor(Math.random() * (total - 1));
        const z2 = total - z1;
        
        const w1 = 1 + Math.floor(Math.random() * 2);
        const w2 = 1 + Math.floor(Math.random() * 2);
        const w3 = 1 + Math.floor(Math.random() * 2);
        const o1 = w1 + w2 + w3;
        
        return {n1, w1, n2, o1, z1, w2, z2, w3};
    }
    
    generatePlusShape() {
        // n1 + n2 + n3 = z1 + z2 + z3, w1 + w2 + w3 = o1 + o2 + o3
        const n1 = 1 + Math.floor(Math.random() * 2);
        const n2 = 1 + Math.floor(Math.random() * 2);
        const n3 = 1 + Math.floor(Math.random() * 2);
        const total_n = n1 + n2 + n3;
        
        const z1 = 1 + Math.floor(Math.random() * Math.max(1, total_n - 2));
        const z2 = 1 + Math.floor(Math.random() * Math.max(1, total_n - z1 - 1));
        const z3 = total_n - z1 - z2;
        
        const w1 = 1 + Math.floor(Math.random() * 2);
        const w2 = 1 + Math.floor(Math.random() * 2);
        const w3 = 1 + Math.floor(Math.random() * 2);
        const total_w = w1 + w2 + w3;
        
        const o1 = 1 + Math.floor(Math.random() * Math.max(1, total_w - 2));
        const o2 = 1 + Math.floor(Math.random() * Math.max(1, total_w - o1 - 1));
        const o3 = total_w - o1 - o2;
        
        return {n1, w1, n2, o1, n3, o2, z1, o3, z2, w2, z3, w3};
    }
    
    generateEShape() {
        // n1 = z1 + z2 + z3 + z4 + z5, w1 + w2 + w3 = o1 + o2 + o3
        const z1 = 1;
        const z2 = 1;
        const z3 = 1;
        const z4 = 1;
        const z5 = 1 + Math.floor(Math.random() * 2);
        const n1 = z1 + z2 + z3 + z4 + z5;
        
        const w1 = 1;
        const w2 = 1;
        const w3 = 1;
        const total_w = w1 + w2 + w3;
        
        const o1 = 1;
        const o2 = 1;
        const o3 = total_w - o1 - o2;
        
        return {n1, o1, z1, w1, z2, o2, z3, w2, z4, o3, z5, w3};
    }
    
    buildPolygon(shapeType, params, startX, startY, startDir) {
        const points = [];
        let x = startX;
        let y = startY;
        let dir = startDir; // 0=N, 1=E, 2=S, 3=W
        
        points.push({x, y});
        
        const algorithm = this.getAlgorithm(shapeType, params);
        
        for (let step of algorithm) {
            // Move forward
            const distance = step.distance;
            if (dir === 0) { // North
                y -= distance;
            } else if (dir === 1) { // East
                x += distance;
            } else if (dir === 2) { // South
                y += distance;
            } else { // West
                x -= distance;
            }
            
            points.push({x, y});
            
            // Turn clockwise
            dir = (dir + 1) % 4;
        }
        
        // Remove last point (it's same as first)
        points.pop();
        
        return points;
    }
    
    getAlgorithm(shapeType, params) {
        if (shapeType === 'L') {
            return [
                {distance: params.n1},
                {distance: params.o1},
                {distance: params.z1},
                {distance: params.o2},
                {distance: params.z2},
                {distance: params.w1}
            ];
        } else if (shapeType === 'U') {
            return [
                {distance: params.n1},
                {distance: params.o1},
                {distance: params.z1},
                {distance: params.o2},
                {distance: params.n2},
                {distance: params.o3},
                {distance: params.z2},
                {distance: params.w1}
            ];
        } else if (shapeType === 'T') {
            return [
                {distance: params.n1},
                {distance: params.w1},
                {distance: params.n2},
                {distance: params.o1},
                {distance: params.z1},
                {distance: params.w2},
                {distance: params.z2},
                {distance: params.w3}
            ];
        } else if (shapeType === '+') {
            return [
                {distance: params.n1},
                {distance: params.w1},
                {distance: params.n2},
                {distance: params.o1},
                {distance: params.n3},
                {distance: params.o2},
                {distance: params.z1},
                {distance: params.o3},
                {distance: params.z2},
                {distance: params.w2},
                {distance: params.z3},
                {distance: params.w3}
            ];
        } else { // E
            return [
                {distance: params.n1},
                {distance: params.o1},
                {distance: params.z1},
                {distance: params.w1},
                {distance: params.z2},
                {distance: params.o2},
                {distance: params.z3},
                {distance: params.w2},
                {distance: params.z4},
                {distance: params.o3},
                {distance: params.z5},
                {distance: params.w3}
            ];
        }
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
                        <span class="progress-score">Score: <strong>${this.score}</strong>/${this.currentQuestion}</span>
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
                                   min="0" 
                                   step="1"
                                   autofocus>
                            <span style="margin-left: 0.5rem; color: #666;">${q.type === 'perimeter' ? 'eenheden' : 'vierkante eenheden'}</span>
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
            
            // Add side lengths
            const algorithm = this.getAlgorithm(polygon.shapeType, polygon.params);
            let x = polygon.startPoint.x;
            let y = polygon.startPoint.y;
            let dir = polygon.startDir;
            
            for (let i = 0; i < algorithm.length; i++) {
                const step = algorithm[i];
                const distance = step.distance;
                
                // Calculate end point
                let x2 = x, y2 = y;
                if (dir === 0) y2 -= distance;
                else if (dir === 1) x2 += distance;
                else if (dir === 2) y2 += distance;
                else x2 -= distance;
                
                // Calculate midpoint
                const mx = (x + x2) / 2 * this.cellSize;
                const my = (y + y2) / 2 * this.cellSize;
                
                // Calculate offset (to the left of the direction, outside polygon)
                let ox = 0, oy = 0;
                const offset = 15;
                if (dir === 0) ox = -offset; // Moving north, text to west
                else if (dir === 1) oy = -offset; // Moving east, text to north
                else if (dir === 2) ox = offset; // Moving south, text to east
                else oy = offset; // Moving west, text to south
                
                svg += `<text x="${mx + ox}" y="${my + oy}" text-anchor="middle" dominant-baseline="middle" 
                             font-size="12" font-weight="600" fill="#FF8C42">${distance}</text>`;
                
                // Move to next point
                x = x2;
                y = y2;
                dir = (dir + 1) % 4;
            }
        } else {
            // Normal display
            svg += `<polygon points="${points}" fill="rgba(224, 224, 224, 0.6)" stroke="#333" stroke-width="2"/>`;
        }
        
        // Unit indicator
        svg += `
            <g class="unit-indicator">
                <line x1="10" y1="${height - 30}" x2="${10 + this.cellSize}" y2="${height - 30}" 
                      stroke="#333" stroke-width="2"/>
                <line x1="10" y1="${height - 35}" x2="10" y2="${height - 25}" stroke="#333" stroke-width="2"/>
                <line x1="${10 + this.cellSize}" y1="${height - 35}" x2="${10 + this.cellSize}" y2="${height - 25}" 
                      stroke="#333" stroke-width="2"/>
                <text x="${10 + this.cellSize / 2}" y="${height - 10}" text-anchor="middle" 
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
