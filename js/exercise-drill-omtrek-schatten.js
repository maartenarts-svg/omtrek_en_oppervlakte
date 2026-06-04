// ============================================
// DRILL: OMTREK SCHATTEN
// ============================================
// 8 vragen: kies de juiste eenheid voor een omtrek
// Gebaseerd op exercise-2-3-eenheden-kiezen
// ============================================

function initDrillOmtrekSchatten(container, onComplete) {
    const SITUATIONS = [
        { id:  1, text: "De omtrek van een muntstuk is ongeveer 8 ... .",              answer: "cm"  },
        { id:  2, text: "De omtrek van een telefoon is ongeveer 30 ... .",              answer: "cm"  },
        { id:  3, text: "De omtrek van een vel papier A4 is ongeveer 1 ... .",          answer: "m"   },
        { id:  4, text: "De omtrek van een eettafel is ongeveer 3 ... .",               answer: "m"   },
        { id:  5, text: "De omtrek van een basketbalveld is ongeveer 80 ... .",         answer: "m"   },
        { id:  6, text: "De omtrek van een voetbalveld is ongeveer 350 ... .",          answer: "m"   },
        { id:  7, text: "De omtrek van een atletiekpiste is ongeveer 4 ... .",          answer: "hm"  },
        { id:  8, text: "De omtrek van een postzegel is ongeveer 9 ... .",              answer: "cm"  },
        { id:  9, text: "De omtrek van een gom is ongeveer 15 ... .",                   answer: "cm"  },
        { id: 10, text: "De omtrek van een klaslokaal is ongeveer 28 ... .",            answer: "m"   },
        { id: 11, text: "De omtrek van een zwembad (25 m) is ongeveer 75 ... .",        answer: "m"   },
        { id: 12, text: "De omtrek van een tennisbal is ongeveer 21 ... .",             answer: "cm"  },
        { id: 13, text: "De omtrek van een fietsband is ongeveer 2 ... .",              answer: "m"   },
        { id: 14, text: "De omtrek van een banknota is ongeveer 41 ... .",              answer: "cm"  },
        { id: 15, text: "De omtrek van een laptop is ongeveer 1 ... .",                 answer: "m"   },
        { id: 16, text: "De omtrek van een tennisracket is ongeveer 90 ... .",          answer: "cm"  },
        { id: 17, text: "De omtrek van een schoolplein is ongeveer 1 ... .",            answer: "hm"  },
        { id: 18, text: "De omtrek van een voetbal is ongeveer 70 ... .",               answer: "cm"  },
        { id: 19, text: "De omtrek van een rugzak is ongeveer 1 ... .",                 answer: "m"   },
        { id: 20, text: "De omtrek van een eurobiljet is ongeveer 41 ... .",            answer: "cm"  },
        { id: 21, text: "De omtrek van een handpalmafdruk is ongeveer 30 ... .",        answer: "cm"  },
        { id: 22, text: "De omtrek van een speelkaart is ongeveer 45 ... .",            answer: "cm"  },
        { id: 23, text: "De omtrek van een schoolbord is ongeveer 6 ... .",             answer: "m"   },
        { id: 24, text: "De omtrek van een park in de stad is ongeveer 5 ... .",        answer: "hm"  },
        { id: 25, text: "De omtrek van een postzegelvelletje is ongeveer 35 ... .",     answer: "cm"  },
        { id: 26, text: "De omtrek van een stoelzitting is ongeveer 1 ... .",           answer: "m"   },
        { id: 27, text: "De omtrek van een groot sportstadion is ongeveer 1 ... .",     answer: "km"  },
        { id: 28, text: "De omtrek van een pingpongtafel is ongeveer 5 ... .",          answer: "m"   },
        { id: 29, text: "De omtrek van een schrift is ongeveer 90 ... .",               answer: "cm"  },
        { id: 30, text: "De omtrek van een theepot is ongeveer 4 ... .",                answer: "dm"  },
        { id: 31, text: "De omtrek van een potlood (dikte) is ongeveer 2 ... .",        answer: "cm"  },
        { id: 32, text: "De omtrek van een raam is ongeveer 4 ... .",                   answer: "m"   },
        { id: 33, text: "De omtrek van een keukentegel is ongeveer 80 ... .",           answer: "cm"  },
        { id: 34, text: "De omtrek van een kroondop is ongeveer 8 ... .",               answer: "cm"  },
        { id: 35, text: "De omtrek van een koekjesblik is ongeveer 5 ... .",            answer: "dm"  },
    ];

    const UNITS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

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
                if (selected.length === 8) break;
            }
        }

        while (selected.length < 8) {
            const rest = SITUATIONS.filter(s => !selected.find(sel => sel.id === s.id));
            selected.push(rest[Math.floor(Math.random() * rest.length)]);
        }

        // Shuffle
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

                    <div class="dos-select-area">
                        <select id="dosUnitSelect" class="dos-unit-select">
                            <option value="">-- Kies een eenheid --</option>
                            ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>

                    <div class="reference-button-area">
                        <button class="btn btn-secondary" id="dosRefBtn">
                            📏 Klik hier voor de referentie-eenheden
                        </button>
                    </div>

                    <div id="dosFeedbackArea" class="feedback-area"></div>

                    <div class="question-actions">
                        <button class="btn btn-primary" id="dosCheckBtn">Controleer</button>
                    </div>
                </div>
            </div>

            <!-- Referentie Modal -->
            <div class="dos-modal-overlay" id="dosRefModal">
                <div class="dos-modal-content">
                    <h2>Referentie-eenheden</h2>
                    <div style="margin: 1.5rem 0;">
                        <img src="../pictures/referentie-eenheden-lengte.jpg"
                             alt="Referentie-eenheden"
                             style="width:100%;height:auto;border:2px solid #ddd;border-radius:8px;">
                    </div>
                    <div style="display:flex;justify-content:center;margin-top:var(--spacing-lg);">
                        <button class="btn btn-primary" id="dosCloseRefBtn">Terug naar oefening</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dosCheckBtn').addEventListener('click', checkAnswer);
        document.getElementById('dosRefBtn').addEventListener('click', () => {
            document.getElementById('dosRefModal').classList.add('active');
        });
        document.getElementById('dosCloseRefBtn').addEventListener('click', () => {
            document.getElementById('dosRefModal').classList.remove('active');
        });
        document.getElementById('dosRefModal').addEventListener('click', e => {
            if (e.target.id === 'dosRefModal') {
                document.getElementById('dosRefModal').classList.remove('active');
            }
        });
    }

    // ── Antwoord controleren ──────────────────────────────────────

    function checkAnswer() {
        const q = questions[currentQuestion];
        const select = document.getElementById('dosUnitSelect');
        const feedbackArea = document.getElementById('dosFeedbackArea');
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
        const feedbackArea = document.getElementById('dosFeedbackArea');
        const checkBtn     = document.getElementById('dosCheckBtn');
        const select       = document.getElementById('dosUnitSelect');

        checkBtn.style.display = 'none';

        if (correct) {
            const msg = attemptNum === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-correct">
                    <p class="feedback-text">${msg}</p>
                    <button class="btn btn-primary" id="dosNextBtn">OK</button>
                </div>
            `;
            select.disabled = true;
            document.getElementById('dosNextBtn').addEventListener('click', nextQuestion);

        } else if (canRetry) {
            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist. Gebruik het overzicht van de referentie-eenheden.</p>
                    <button class="btn btn-primary" id="dosRetryBtn">OK</button>
                </div>
            `;
            document.getElementById('dosRetryBtn').addEventListener('click', () => {
                feedbackArea.innerHTML = '';
                checkBtn.style.display = 'block';
                select.value = '';
            });

        } else {
            const parts = q.text.split('...');
            const correctText = parts[0] +
                `<span style="color:var(--color-primary);font-weight:700;">${q.answer}</span>` +
                parts[1];

            feedbackArea.innerHTML = `
                <div class="feedback-message feedback-incorrect">
                    <p class="feedback-text">Dit antwoord is niet juist.</p>
                    <p style="margin-top:1rem;">${correctText}</p>
                    <button class="btn btn-primary" id="dosNextBtn">OK</button>
                </div>
            `;
            select.disabled = true;
            document.getElementById('dosNextBtn').addEventListener('click', nextQuestion);
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
        if (document.getElementById('drill-omtrek-schatten-css')) return;
        const style = document.createElement('style');
        style.id = 'drill-omtrek-schatten-css';
        style.textContent = `
            .dos-select-area {
                margin: 2rem 0;
                display: flex;
                justify-content: center;
            }

            .dos-unit-select {
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

            .dos-unit-select:focus {
                outline: none;
                border-color: var(--color-primary);
            }

            .dos-unit-select:disabled {
                background: var(--color-light);
                cursor: not-allowed;
            }

            .reference-button-area {
                margin: 1.5rem 0;
                text-align: center;
            }

            .dos-modal-overlay {
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

            .dos-modal-overlay.active {
                opacity: 1;
                pointer-events: all;
            }

            .dos-modal-content {
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

            .dos-modal-overlay.active .dos-modal-content {
                transform: scale(1);
            }
        `;
        document.head.appendChild(style);
    }

    addCSS();
    render();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDrillOmtrekSchatten };
}
