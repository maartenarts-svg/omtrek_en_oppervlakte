// ============================================
// DRILL: OPPERVLAKTE SCHATTEN
// ============================================
// 8 vragen: kies de juiste oppervlakte-eenheid uit dropdown
// Gebaseerd op exercise-4-3-eenheden-kiezen
// ============================================

function initDrillOppervlakteSchatten(container, onComplete) {
    const SITUATIONS = [
        // mm²
        { id:  1, text: "De doorsnede van een potloodstift is ongeveer 3 ... .",                           answer: "mm²"  },
        { id:  2, text: "De oppervlakte van een zoutkorrel is ongeveer 1 ... .",                           answer: "mm²"  },
        { id:  3, text: "De oppervlakte van de letter 'o' in een gedrukt boek is ongeveer 6 ... .",        answer: "mm²"  },
        { id:  4, text: "Een korreltje peper heeft een oppervlakte van ongeveer 4 ... .",                  answer: "mm²"  },
        // cm²
        { id:  5, text: "De oppervlakte van een postzegel is ongeveer 6 ... .",                            answer: "cm²"  },
        { id:  6, text: "De oppervlakte van een vingernagel is ongeveer 1 ... .",                          answer: "cm²"  },
        { id:  7, text: "De oppervlakte van een 2-euromunt is ongeveer 5 ... .",                           answer: "cm²"  },
        { id:  8, text: "De oppervlakte van een gom is ongeveer 8 ... .",                                  answer: "cm²"  },
        { id:  9, text: "De oppervlakte van een bankkaart is ongeveer 46 ... .",                           answer: "cm²"  },
        { id: 10, text: "De oppervlakte van een smartphone-scherm is ongeveer 75 ... .",                   answer: "cm²"  },
        { id: 11, text: "De oppervlakte van een lichtschakelaar is ongeveer 16 ... .",                     answer: "cm²"  },
        { id: 12, text: "De oppervlakte van het vlak van een Rubik's kubus is ongeveer 36 ... .",          answer: "cm²"  },
        { id: 13, text: "De oppervlakte van een horlogescherm is ongeveer 4 ... .",                        answer: "cm²"  },
        { id: 14, text: "De oppervlakte van een ansichtkaart is ongeveer 150 ... .",                       answer: "cm²"  },
        // dm²
        { id: 15, text: "De oppervlakte van een blad A4-papier is ongeveer 6 ... .",                       answer: "dm²"  },
        { id: 16, text: "De oppervlakte van een kleine vloertegel (10 cm × 10 cm) is precies 1 ... .",    answer: "dm²"  },
        { id: 17, text: "De oppervlakte van de kaft van een wiskundeboek is ongeveer 4 ... .",             answer: "dm²"  },
        { id: 18, text: "De oppervlakte van een laptopscherm is ongeveer 6 ... .",                         answer: "dm²"  },
        { id: 19, text: "De oppervlakte van een pizza met diameter 30 cm is ongeveer 7 ... .",             answer: "dm²"  },
        { id: 20, text: "De oppervlakte van een snijplank is ongeveer 8 ... .",                            answer: "dm²"  },
        // m²
        { id: 21, text: "De oppervlakte van een klassieke binnendeur is ongeveer 2 ... .",                 answer: "m²"   },
        { id: 22, text: "De oppervlakte van een slaapkamer is ongeveer 12 ... .",                          answer: "m²"   },
        { id: 23, text: "De oppervlakte van een badkamer is ongeveer 4 ... .",                             answer: "m²"   },
        { id: 24, text: "De oppervlakte van een parkeerplaats is ongeveer 15 ... .",                       answer: "m²"   },
        { id: 25, text: "De oppervlakte van een klaslokaal is ongeveer 60 ... .",                          answer: "m²"   },
        { id: 26, text: "De oppervlakte van een tapijt in de woonkamer is ongeveer 6 ... .",               answer: "m²"   },
        { id: 27, text: "De oppervlakte van een schoolbord is ongeveer 3 ... .",                           answer: "m²"   },
        { id: 28, text: "De oppervlakte van een tuinhuisje is ongeveer 8 ... .",                           answer: "m²"   },
        { id: 29, text: "De oppervlakte van een kleine thuiszwembad is ongeveer 20 ... .",                 answer: "m²"   },
        { id: 30, text: "De oppervlakte van een pingpongtafel is ongeveer 4 ... .",                        answer: "m²"   },
        // dam²
        { id: 31, text: "De oppervlakte van een basketbalveld is ongeveer 4 ... .",                        answer: "dam²" },
        { id: 32, text: "De oppervlakte van een kleine tuin is ongeveer 2 ... .",                          answer: "dam²" },
        { id: 33, text: "De oppervlakte van een schoolplein is ongeveer 5 ... .",                          answer: "dam²" },
        { id: 34, text: "De oppervlakte van een tennisveld is ongeveer 3 ... .",                           answer: "dam²" },
        // hm²
        { id: 35, text: "De oppervlakte van een voetbalveld met omgeving is ongeveer 1 ... .",             answer: "hm²"  },
        { id: 36, text: "Het terrein van onze school heeft een oppervlakte van ongeveer 2 ... .",          answer: "hm²"  },
        { id: 37, text: "De oppervlakte van een klein stadspark is ongeveer 5 ... .",                      answer: "hm²"  },
        { id: 38, text: "Een weiland op een boerderij heeft een oppervlakte van ongeveer 3 ... .",         answer: "hm²"  },
        // km²
        { id: 39, text: "Het grondgebied van een klein dorp is ongeveer 2 ... .",                          answer: "km²"  },
        { id: 40, text: "De oppervlakte van de stad Gent is ongeveer 160 ... .",                           answer: "km²"  },
        { id: 41, text: "De oppervlakte van het Nationaal Park Hoge Kempen is ongeveer 57 ... .",          answer: "km²"  },
        { id: 42, text: "De oppervlakte van België is ongeveer 30 000 ... .",                              answer: "km²"  }
    ];

    const UNITS = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];

    function displayUnit(unit) {
        return unit.replace('²', '<sup>2</sup>');
    }

    let currentQuestion = 0;
    let score = 0;
    let attempts = {};
    let questions = [];

    // ── Vraagkeuze (gebalanceerd) ─────────────────────────────────

    function selectQuestions() {
        const groups = {};
        SITUATIONS.forEach(sit => {
            if (!groups[sit.answer]) groups[sit.answer] = [];
            groups[sit.answer].push(sit);
        });

        const selected = [];
        for (const unit of UNITS) {
            if (groups[unit] && groups[unit].length > 0) {
                const pick = groups[unit][Math.floor(Math.random() * groups[unit].length)];
                selected.push(pick);
            }
        }

        while (selected.length < 8) {
            const remaining = SITUATIONS.filter(s => !selected.find(sel => sel.id === s.id));
            selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
        }

        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }

        return selected;
    }

    questions = selectQuestions();
    questions.forEach(q => { attempts[q.id] = 0; });

    // ── Renderen ──────────────────────────────────────────────────

    function render() {
        const q = questions[currentQuestion];

        container.innerHTML = `
            <div class="exercise-container">
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

                    <div class="dops-select-area">
                        <select id="dopsUnitSelect" class="dops-unit-select">
                            <option value="">-- Kies een eenheid --</option>
                            ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>

                    <div class="reference-button-area">
                        <button class="btn btn-secondary" id="dopsRefBtn">
                            📐 Klik hier voor de referentie-eenheden
                        </button>
                    </div>

                    <div id="dopsFeedbackArea" class="feedback-area"></div>

                    <div class="question-actions">
                        <button class="btn btn-primary" id="dopsCheckBtn">Controleer</button>
                    </div>
                </div>
            </div>

            <!-- Referentie Modal -->
            <div class="dops-modal-overlay" id="dopsRefModal">
                <div class="dops-modal-content">
                    <h2>Referentie-eenheden</h2>
                    <div style="margin: 1.5rem 0;">
                        <img src="../pictures/referentie-eenheden-oppervlakte.jpg"
                             alt="Referentie-eenheden oppervlakte"
                             style="width:100%;height:auto;border:2px solid #ddd;border-radius:8px;">
                    </div>
                    <div style="display:flex;justify-content:center;margin-top:var(--spacing-lg);">
                        <button class="btn btn-primary" id="dopsCloseRefBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dopsCheckBtn').addEventListener('click', checkAnswer);
        document.getElementById('dopsRefBtn').addEventListener('click', () => {
            document.getElementById('dopsRefModal').classList.add('active');
        });
        document.getElementById('dopsCloseRefBtn').addEventListener('click', () => {
            document.getElementById('dopsRefModal').classList.remove('active');
        });
        document.getElementById('dopsRefModal').addEventListener('click', e => {
            if (e.target.id === 'dopsRefModal') {
                document.getElementById('dopsRefModal').classList.remove('active');
            }
        });
    }

    // ── Antwoord controleren ──────────────────────────────────────

    function checkAnswer() {
        const q = questions[currentQuestion];
        const select = document.getElementById('dopsUnitSelect');
        const feedbackArea = document.getElementById('dopsFeedbackArea');
        const userAnswer = select.value;

        if (!userAnswer) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Kies eerst een eenheid uit de lijst.</p>
                </div>
            `;
            return;
        }

        attempts[q.id]++;
        const isCorrect = userAnswer === q.answer;

        if (isCorrect) {
            score += attempts[q.id] === 1 ? 1 : 0.5;
            showFeedback(true, q, attempts[q.id]);
        } else {
            showFeedback(false, q, attempts[q.id], attempts[q.id] === 1);
        }
    }

    // ── Feedback tonen ────────────────────────────────────────────

    function showFeedback(correct, q, attemptNum, canRetry) {
        const feedbackArea = document.getElementById('dopsFeedbackArea');
        const checkBtn     = document.getElementById('dopsCheckBtn');
        const select       = document.getElementById('dopsUnitSelect');

        checkBtn.style.display = 'none';

        if (correct) {
            const msg = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${msg}</p>
                    <button class="btn btn-primary" id="dopsNextBtn">OK</button>
                </div>
            `;
            select.disabled = true;
            document.getElementById('dopsNextBtn').addEventListener('click', nextQuestion);

        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist. Gebruik het overzicht van de referentie-eenheden.</p>
                    <button class="btn btn-primary" id="dopsRetryBtn">OK</button>
                </div>
            `;
            document.getElementById('dopsRetryBtn').addEventListener('click', () => {
                feedbackArea.innerHTML = '';
                checkBtn.style.display = 'block';
                select.value = '';
            });

        } else {
            const parts = q.text.split('...');
            const correctText = parts[0] +
                `<span style="color:var(--color-primary);font-weight:700;">${displayUnit(q.answer)}</span>` +
                parts[1];

            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist.</p>
                    <p style="margin-top:1rem;">${correctText}</p>
                    <button class="btn btn-primary" id="dopsNextBtn">OK</button>
                </div>
            `;
            select.disabled = true;
            document.getElementById('dopsNextBtn').addEventListener('click', nextQuestion);
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
        if (document.getElementById('drill-oppervlakte-schatten-css')) return;
        const style = document.createElement('style');
        style.id = 'drill-oppervlakte-schatten-css';
        style.textContent = `
            .dops-select-area {
                margin: 2rem 0;
                display: flex;
                justify-content: center;
            }

            .dops-unit-select {
                width: 300px !important;
                max-width: 300px !important;
                padding: 1rem;
                font-size: var(--font-size-large);
                border: 3px solid var(--color-gray);
                border-radius: var(--radius-md);
                background: white;
                cursor: pointer;
                transition: border-color var(--transition-fast);
            }

            .dops-unit-select:focus {
                outline: none;
                border-color: var(--color-primary);
            }

            .dops-unit-select:disabled {
                background: var(--color-light);
                cursor: not-allowed;
            }

            .reference-button-area {
                margin: 1.5rem 0;
                text-align: center;
            }

            .dops-modal-overlay {
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

            .dops-modal-overlay.active {
                opacity: 1;
                pointer-events: all;
            }

            .dops-modal-content {
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

            .dops-modal-overlay.active .dops-modal-content {
                transform: scale(1);
            }
        `;
        document.head.appendChild(style);
    }

    addCSS();
    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDrillOppervlakteSchatten };
}
