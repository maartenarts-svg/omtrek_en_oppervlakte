// ============================================
// EXERCISE: KEUZE VRAAG
// Oefening voor het kiezen tussen omtrek en oppervlakte
// 6 vragen uit databank, 1 poging per vraag
// ============================================

class KeuzeVraagExercise {
    constructor(containerEl, onComplete) {
        this.container = containerEl;
        this.onComplete = onComplete;
        
        this.currentQuestion = 0;
        this.score = 0;
        this.maxScore = 6;
        
        // Databank met situaties
        this.databank = [
            {
                id: 1,
                text: "Een landbouwer heeft een weide en wil rond zijn weide bomen plaatsen. Hij wil weten hoeveel bomen hiervoor nodig zijn.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De bomen staan aan de rand van de weide. Je hebt dus de omtrek van de weide nodig."
            },
            {
                id: 2,
                text: "Een landbouwer heeft een weide en wil zijn volledige weide met bomen beplanten. Hij wil weten hoeveel bomen hiervoor nodig zijn.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>De bomen staan op de volledige weide. Je hebt dus de oppervlakte van de weide nodig."
            },
            {
                id: 3,
                text: "Je wil de muren van je kamer verven. Je wil weten hoeveel verf je daarvoor nodig hebt.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je wil de volledige muur beschilderen, niet enkel de rand. Je hebt dus de oppervlakte van de muren nodig."
            },
            {
                id: 4,
                text: "Vrachtwagens hebben soms een ledstrip die volledig rond de rand van de laadklep gemonteerd wordt. De vrachtwagenbouwer wil weten hoe lang zo'n ledstrip moet zijn.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De ledstrip komt aan de rand van de laadklep. Je hebt dus de omtrek van de laadklep nodig."
            },
            {
                id: 5,
                text: "Je wil een lint rond een cadeaudoos kleven. Je wil weten hoe lang het lint moet zijn.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>Het lint komt rond de rand van de doos. Je hebt dus de omtrek nodig."
            },
            {
                id: 6,
                text: "Je wil gras zaaien op een voetbalveld. Je wil weten hoeveel graszaad je nodig hebt.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je zaait het volledige veld in. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 7,
                text: "Je wil een plint plaatsen langs de onderkant van alle muren van je kamer. Je wil weten hoeveel plinten je daarvoor nodig hebt.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De plint komt langs de rand van de kamer. Je hebt dus de omtrek nodig."
            },
            {
                id: 8,
                text: "Je wil nieuwe tegels leggen op de vloer van je badkamer. Je wil weten hoeveel tegels je daarvoor nodig hebt.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je betegelt de volledige vloer. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 9,
                text: "Een hond loopt één rondje rond een ronde tuin. Je wil weten welke afstand de hond heeft afgelegd.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De hond loopt langs de rand. Je hebt dus de omtrek nodig."
            },
            {
                id: 10,
                text: "Je wil weten hoeveel mensen er in een zaal mogen staan. Per vierkante meter mogen er 2 personen staan.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Het aantal mensen hangt af van de ruimte binnenin. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 11,
                text: "Je wil een omheining plaatsen rond een rechthoekige tuin. Je wil weten hoeveel omheining je daarvoor nodig hebt.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De omheining komt rond de tuin. Je hebt dus de omtrek nodig."
            },
            {
                id: 12,
                text: "Een schilder wil weten hoeveel behangpapier hij nodig heeft voor een muur.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je bedekt de volledige muur. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 13,
                text: "Je wil verlichting plaatsen rondom een rond zwembad. Je wil weten hoe lang de lichtkrans daarvoor moet zijn.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De verlichting komt langs de rand. Je hebt dus de omtrek nodig."
            },
            {
                id: 14,
                text: "Je wil tapijt leggen in je slaapkamer. Je wil weten hoeveel tapijt je nodig hebt.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Het tapijt bedekt de volledige vloer. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 15,
                text: "Een fietser wil weten welke afstand hij aflegt als zijn wiel één volledige draai maakt.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>Het wiel rolt één keer rond. Je hebt dus de omtrek nodig."
            },
            {
                id: 16,
                text: "Je wil een moestuin volledig bedekken met anti-worteldoek. Je wil weten hoeveel van dat doek je nodig hebt.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je bedekt de volledige moestuin. Je hebt dus de oppervlakte nodig."
            },
            {
                id: 17,
                text: "Je wil kerstverlichting hangen langs de dakrand van je huis. Je wil weten hoe lang die lichtkrans moet zijn.",
                correctAnswer: "perimeter",
                feedback: "Je antwoord is niet juist.<br>De verlichting hangt langs de rand. Je hebt dus de omtrek nodig."
            },
            {
                id: 18,
                text: "Je wil weten hoeveel kunstgras je nodig hebt om een speelplein te bedekken.",
                correctAnswer: "area",
                feedback: "Je antwoord is niet juist.<br>Je bedekt het volledige speelplein. Je hebt dus de oppervlakte nodig."
            }
        ];
        
        this.questions = [];
        
        this.init();
    }
    
    init() {
        // Select 6 random questions, balanced between perimeter and area
        this.questions = this.selectBalancedQuestions(6);
        this.render();
    }
    
    selectBalancedQuestions(count) {
        // Separate perimeter and area questions
        const perimeterQuestions = this.databank.filter(q => q.correctAnswer === 'perimeter');
        const areaQuestions = this.databank.filter(q => q.correctAnswer === 'area');
        
        // Shuffle both arrays
        this.shuffleArray(perimeterQuestions);
        this.shuffleArray(areaQuestions);
        
        // Select equal amounts (or as close as possible)
        const perimeterCount = Math.floor(count / 2);
        const areaCount = count - perimeterCount;
        
        const selected = [
            ...perimeterQuestions.slice(0, perimeterCount),
            ...areaQuestions.slice(0, areaCount)
        ];
        
        // Shuffle the final selection
        this.shuffleArray(selected);
        
        return selected;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="exercise-container">
                <!-- Progress Bar -->
                <div class="exercise-progress">
                    <div class="progress-header">
                        <span class="progress-label">Voortgang</span>
                        <span class="progress-score">Score: <strong>${this.score}</strong> / ${this.maxScore}</span>
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
        
        container.innerHTML = `
            <div class="question-card">
                <h3 class="question-title">Vraag ${this.currentQuestion + 1}</h3>
                <p class="question-text-large">${question.text}</p>
                <p class="question-prompt">Wat bereken je?</p>
                
                <div class="choice-options">
                    <label class="choice-option">
                        <input type="radio" name="answer" value="perimeter" class="choice-radio">
                        <span class="choice-label">de omtrek van de ${this.getSubject(question)}</span>
                    </label>
                    <label class="choice-option">
                        <input type="radio" name="answer" value="area" class="choice-radio">
                        <span class="choice-label">de oppervlakte van de ${this.getSubject(question)}</span>
                    </label>
                </div>
                
                <div class="feedback-area hidden" id="feedbackArea">
                    <!-- Feedback will appear here -->
                </div>
                
                <div class="question-actions">
                    <button class="btn btn-primary" id="submitBtn" onclick="keuzeVraagInstance.checkAnswer()">
                        Controleer
                    </button>
                </div>
            </div>
        `;
    }
    
    getSubject(question) {
        // Extract subject from the question text
        const text = question.text.toLowerCase();
        
        if (text.includes('weide')) return 'weide';
        if (text.includes('muren') || text.includes('muur')) return 'muren';
        if (text.includes('laadklep')) return 'laadklep';
        if (text.includes('doos')) return 'doos';
        if (text.includes('voetbalveld') || text.includes('veld')) return 'het veld';
        if (text.includes('kamer')) return 'kamer';
        if (text.includes('badkamer')) return 'badkamer';
        if (text.includes('tuin')) return 'tuin';
        if (text.includes('zaal')) return 'zaal';
        if (text.includes('zwembad')) return 'het zwembad';
        if (text.includes('slaapkamer')) return 'slaapkamer';
        if (text.includes('wiel')) return 'het wiel';
        if (text.includes('moestuin')) return 'moestuin';
        if (text.includes('dak')) return 'het dak';
        if (text.includes('speelplein')) return 'het speelplein';
        
        return 'figuur';
    }
    
    checkAnswer() {
        const question = this.questions[this.currentQuestion];
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        
        if (!selectedRadio) {
            alert('Kies eerst een antwoord.');
            return;
        }
        
        const answer = selectedRadio.value;
        const isCorrect = answer === question.correctAnswer;
        
        // Disable all radio buttons
        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.disabled = true;
        });
        
        if (isCorrect) {
            // Correct answer
            this.score += 1;
            
            this.showFeedback('Correct!', true, () => {
                this.nextQuestion();
            });
        } else {
            // Wrong answer - show feedback (only one attempt)
            this.showFeedback(question.feedback, false, () => {
                this.nextQuestion();
            });
        }
        
        this.updateProgress();
    }
    
    showFeedback(message, isCorrect, onOK) {
        const feedbackArea = document.getElementById('feedbackArea');
        const className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        
        feedbackArea.innerHTML = `
            <div class="feedback-message ${className}">
                <div class="feedback-text">${message}</div>
                <button class="btn btn-primary" onclick="keuzeVraagInstance.handleFeedbackOK()">OK</button>
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
            progressScore.textContent = this.score;
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
        
        // Calculate XP: score * 10
        const xpEarned = this.score * 10;
        
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
let keuzeVraagInstance = null;

function initKeuzeVraag(containerEl, onComplete) {
    keuzeVraagInstance = new KeuzeVraagExercise(containerEl, onComplete);
}
