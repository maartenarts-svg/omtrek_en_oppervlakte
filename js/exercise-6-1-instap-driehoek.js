'use strict';

function init61InstapDriehoek(container, onComplete) {

    const GEN_UNITS  = ['m', 'dm', 'cm', 'mm'];
    const TOTAL_Q    = 4;
    const MAX_POINTS = 4;

    const questions = Array.from({ length: TOTAL_Q }, genQuestion);
    let currentQ    = 0;
    let totalPoints = 0;

    render();

    // ── PROGRESS BAR ─────────────────────────────────────────

    function progressHTML() {
        const pct = ((currentQ - 1) / TOTAL_Q) * 100;
        return `
            <div class="exercise-progress">
                <div class="progress-header">
                    <span class="progress-label">Vraag ${currentQ} van ${TOTAL_Q}</span>
                    <span class="progress-score">Punten: <strong>${fmtPoints(totalPoints)}</strong>/${MAX_POINTS}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
    }

    function fmtPoints(p) {
        return Number.isInteger(p) ? String(p) : p.toFixed(1);
    }

    // ── RENDER ───────────────────────────────────────────────

    function render() {
        if (currentQ <= TOTAL_Q) renderQuestion(currentQ + 1);
        else finish();
    }

    // ── VRAAG ────────────────────────────────────────────────

    function renderQuestion(n) {
        const data = questions[n - 1];
        let qAttempts = 0;
        let step = 1; // stap 1 = alleen parallelogram, stap 2 = met diagonaal

        function buildHTML() {
            return `
                <div class="exercise-container">
                    ${n > 1 ? progressHTML() : ''}
                    <div class="question-card">
                        <div class="ex61-fig" id="ex61-fig"></div>
                        <div class="ex61-inputs">
                            <div class="ex61-row" id="ex61-row-parallellogram">
                                De oppervlakte van het parallellogram is
                                <input id="ex61-ans-para" class="ex61-input" type="number" min="0" step="1" autocomplete="off">
                                ${data.unit}².
                            </div>
                            <p class="ex61-info hidden" id="ex61-info">De diagonaal verdeelt het parallellogram in twee congruente driehoeken.</p>
                            <div class="ex61-row hidden" id="ex61-row-driehoek">
                                De oppervlakte van één van deze driehoeken is dus
                                <input id="ex61-ans-drie" class="ex61-input" type="number" min="0" step="1" autocomplete="off">
                                ${data.unit}².
                            </div>
                        </div>
                        <div id="feedbackArea" class="feedback-area"></div>
                        <div class="question-actions">
                            <button class="btn btn-primary" id="ex61-btn">Volgende stap</button>
                        </div>
                    </div>
                </div>`;
        }

        container.innerHTML = buildHTML();
        drawFiguur(document.getElementById('ex61-fig'), 'parallellogram-hoogte', data.figOpts);

        document.getElementById('ex61-btn').addEventListener('click', () => {
            if (step === 1) {
                goToStep2();
            } else {
                checkAnswer();
            }
        });

        function goToStep2() {
            step = 2;
            // Toon diagonaal in de figuur
            addDiagonaal(document.getElementById('ex61-fig'));
            // Toon extra tekst en invoer
            document.getElementById('ex61-info').classList.remove('hidden');
            document.getElementById('ex61-row-driehoek').classList.remove('hidden');
            const btn = document.getElementById('ex61-btn');
            btn.textContent = 'Controleer';
            document.getElementById('ex61-ans-drie').focus();
        }

        function checkAnswer() {
            qAttempts++;
            const paraVal = parseFloat(document.getElementById('ex61-ans-para').value);
            const drieVal = parseFloat(document.getElementById('ex61-ans-drie').value);
            const paraOk  = !isNaN(paraVal) && paraVal === data.areaPara;
            const drieOk  = !isNaN(drieVal) && drieVal === data.areaDrie;
            const isLast  = n === TOTAL_Q;

            if (paraOk && drieOk) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                const label = qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.';
                document.getElementById('ex61-btn').style.display = 'none';
                showWithAction('correct', label, isLast);
            } else if (qAttempts < 2) {
                const items = [];
                if (!paraOk) items.push('De oppervlakte van het parallellogram is niet juist. Reken nog eens na.');
                if (!drieOk) items.push('Wat betekent congruente driehoeken? Wat moet je dan doen met de oppervlakte van het parallellogram?');
                document.getElementById('feedbackArea').innerHTML = `
                    <div class="feedback-message feedback-incorrect">
                        <p class="feedback-text">Dit klopt niet helemaal. Verbeter.<br>Bekijk de lijst hieronder voor meer informatie.</p>
                        <ul class="ex61-feedback-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>
                    </div>`;
            } else {
                document.getElementById('ex61-btn').style.display = 'none';
                const msg = `Je antwoord is niet juist.<br>De oppervlakte van het parallellogram is ${data.areaPara} ${data.unit}².<br>Omdat de twee driehoeken congruent zijn, hebben ze dezelfde oppervlakte. De oppervlakte van een driehoek is dus de helft van die van het parallellogram: ${data.areaDrie} ${data.unit}².`;
                showWithAction('incorrect', msg, isLast);
            }
        }

        function showWithAction(type, msg, isLast) {
            const btnLabel = 'OK';
            document.getElementById('feedbackArea').innerHTML = `
                <div class="feedback-message feedback-${type}">
                    <p class="feedback-text">${msg}</p>
                    <button class="btn btn-primary" id="ex61-next">${btnLabel}</button>
                </div>`;
            document.getElementById('ex61-next').addEventListener('click', () => {
                currentQ++;
                if (currentQ >= TOTAL_Q) finish();
                else renderQuestion(currentQ + 1);
            });
        }
    }

    // ── DIAGONAAL TOEVOEGEN ──────────────────────────────────

    function addDiagonaal(figContainer) {
        const svg = figContainer.querySelector('svg');
        if (!svg) return;
        const poly = svg.querySelector('polygon');
        if (!poly) return;
        const pts = poly.getAttribute('points').trim().split(/\s+/).map(p => {
            const [x, y] = p.split(',').map(Number);
            return { x, y };
        });
        if (pts.length < 4) return;
        // Diagonaal van punt 0 naar punt 2 (tegenoverliggende hoekpunten)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pts[0].x);
        line.setAttribute('y1', pts[0].y);
        line.setAttribute('x2', pts[2].x);
        line.setAttribute('y2', pts[2].y);
        line.setAttribute('stroke', '#e67e22');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '6,3');
        svg.appendChild(line);
    }

    // ── DATA GENERATIE ───────────────────────────────────────

    function genQuestion() {
        const unit = randomFrom(GEN_UNITS);
        // Gehele basis en hoogte, minstens één even → oppervlakte en driehoeksoppervlakte geheel
        let basis, hoogte;
        do {
            basis  = 2 + Math.floor(Math.random() * 9); // 2..10
            hoogte = 5 + Math.floor(Math.random() * 6); // 5..10
        } while (basis % 2 !== 0 && hoogte % 2 !== 0); // herhaal tot minstens één even

        const areaPara = basis * hoogte;
        const areaDrie = areaPara / 2;

        // Zijde berekenen zodat de hoogte klopt: hoogte = zijde * sin(A)
        // sin(A) = 90 / sqrt(45² + 90²) voor de vaste basisvorm
        const sinA = 90 / Math.sqrt(45 * 45 + 90 * 90);
        const zijde = Math.round(hoogte / sinA);

        return {
            unit,
            areaPara,
            areaDrie,
            figOpts: {
                factor: 1,
                rotation: 0,
                basis:       { value: basis,  unit },
                zijde:       { value: zijde,  unit },
                welkeHoogte: 'links'
            }
        };
    }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 40);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // ── CSS ──────────────────────────────────────────────────

    addCSS();
    function addCSS() {
        if (document.getElementById('ex61-style')) return;
        const s = document.createElement('style');
        s.id = 'ex61-style';
        s.textContent = `
.ex61-fig { display: flex; justify-content: center; margin: var(--spacing-lg, 1rem) 0; }
.ex61-inputs { display: flex; flex-direction: column; gap: var(--spacing-md, 0.65rem); margin: var(--spacing-lg, 1rem) 0; }
.ex61-row { font-size: var(--font-size-base, 0.95rem); line-height: 2.2; }
.ex61-input { display: inline-block; width: 120px !important; padding: 0.25rem 0.4rem; border: 2px solid var(--color-gray, #ccc); border-radius: var(--radius-md, 6px); font-size: var(--font-size-base, 0.95rem); text-align: center; vertical-align: middle; }
.ex61-info { font-size: var(--font-size-base, 0.95rem); color: #444; margin: 0.5rem 0 0; }
.ex61-feedback-list { margin: 0.3rem 0 0.4rem 0; padding-left: 1.4rem; }
.ex61-feedback-list li { margin: 0.2rem 0; }
.hidden { display: none !important; }
`;
        document.head.appendChild(s);
    }
}
