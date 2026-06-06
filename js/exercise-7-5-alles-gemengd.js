'use strict';

function init75AllesGemengd(container, onComplete) {

    addCSS75();

    // ── CONSTANTS ────────────────────────────────────────────

    const SIN_A = 90 / Math.sqrt(45 * 45 + 90 * 90);

    const GEN_UNITS  = ['m', 'dm', 'cm', 'mm'];
    const UNIT_OPTS  = ['', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²'];
    const PARA_DIMS  = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

    const FORMULA_OPTS = [
        { value: '',       html: '' },
        { value: 'fP4z',   html: '4<i>z</i>' },
        { value: 'fP2bh',  html: '2(<i>b</i> + <i>h</i>)' },
        { value: 'fPsom',  html: 'som van de zijden' },
        { value: 'fP2pr',  html: '2&pi;<i>r</i>' },
        { value: 'fAz2',   html: '<i>z</i>²' },
        { value: 'fAbh',   html: '<i>bh</i>' },
        { value: 'fAbh2',  html: '<i>bh</i> : 2' },
        { value: 'fApr2',  html: '&pi;<i>r</i>²' }
    ];

    const CORRECT_FORMULA = {
        'vierkant-omtrek':              'fP4z',
        'rechthoek-omtrek':             'fP2bh',
        'ruit-omtrek':                  'fP4z',
        'parallellogram-omtrek':        'fPsom',
        'cirkel-omtrek':                'fP2pr',
        'driehoek-hoogte-omtrek':       'fPsom',
        'vierkant-oppervlakte':         'fAz2',
        'rechthoek-oppervlakte':        'fAbh',
        'parallellogram-oppervlakte':   'fAbh',
        'driehoek-hoogte-oppervlakte':  'fAbh2',
        'cirkel-oppervlakte':           'fApr2'
    };

    const TOTAL_Q    = 11;
    const MAX_POINTS = 11;

    // ── STATE ────────────────────────────────────────────────

    const SPECS = shuffle([
        { fig: 'vierkant',         task: 'omtrek'      },
        { fig: 'rechthoek',        task: 'omtrek'      },
        { fig: 'ruit',             task: 'omtrek'      },
        { fig: 'parallellogram',   task: 'omtrek'      },
        { fig: 'cirkel',           task: 'omtrek'      },
        { fig: 'driehoek-hoogte',  task: 'omtrek'      },
        { fig: 'vierkant',         task: 'oppervlakte' },
        { fig: 'rechthoek',        task: 'oppervlakte' },
        { fig: 'parallellogram',   task: 'oppervlakte' },
        { fig: 'driehoek-hoogte',  task: 'oppervlakte' },
        { fig: 'cirkel',           task: 'oppervlakte' }
    ]);
    const questions = SPECS.map(s => genQuestion(s.fig, s.task));
    let currentQ    = 0;
    let totalPoints = 0;
    let docClickCleanup = null;

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

    // ── FEEDBACK HELPERS ─────────────────────────────────────

    function buildFeedbackHTML(items) {
        return `<p class="feedback-text">Dit klopt niet helemaal. Verbeter.<br>Bekijk de lijst hieronder voor meer informatie.</p>
                <ul class="ex54-feedback-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    function showFeedback(type, items) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">${buildFeedbackHTML(items)}</div>`;
    }

    function showFeedbackWithNext(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="nextBtn">OK</button>
            </div>`;
        document.getElementById('nextBtn').addEventListener('click', () => {
            currentQ++;
            render();
        });
    }

    function showFeedbackWithFinish(type, msg) {
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-message feedback-${type}">
                <p class="feedback-text">${msg}</p>
                <button class="btn btn-primary" id="finishBtn">OK</button>
            </div>`;
        document.getElementById('finishBtn').addEventListener('click', finish);
    }

    // ── RENDER ───────────────────────────────────────────────

    function render() {
        if (currentQ === 0)           renderExample();
        else if (currentQ <= TOTAL_Q) renderQuestion(currentQ);
        else                          finish();
    }

    // ── VOORBEELD (vierkant oppervlakte) ─────────────────────

    function renderExample() {
        container.innerHTML = `
            <div class="exercise-container">
                <div class="question-card">
                    <span class="ex33-badge">Voorbeeld</span>
                    <h3 class="question-title">Bereken de oppervlakte.</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex75-fig-eg"></div>
                    <div class="ex33-stepplan">
                        <strong>Stappenplan</strong>
                        <ol>
                            <li>Kies de formule.</li>
                            <li>Kies de eenheid.</li>
                            <li>Noteer de berekening zonder eenheden.</li>
                            <li>Reken uit. Hiervoor mag je ICT gebruiken.</li>
                            <li>Het antwoord wordt automatisch aangevuld.</li>
                        </ol>
                    </div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field"><i>z</i>²</div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <div class="ex33-eg-field ex33-eg-unit">cm²</div>
                            <span>:</span>
                            <span class="ex33-p-label"><i>A</i> =</span>
                            <div class="ex33-eg-field ex33-eg-calc">5²</div>
                            <span>=</span>
                            <div class="ex33-eg-field ex33-eg-ans">25</div>
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De oppervlakte is <strong>25</strong> cm².
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="btn-verder">Verder &rarr;</button>
                    </div>
                </div>
            </div>`;

        drawFiguur(document.getElementById('ex75-fig-eg'), 'vierkant', {
            factor: 1, rotation: 0,
            zijde: { value: 5, unit: 'cm' }
        });

        document.getElementById('btn-verder').addEventListener('click', () => {
            currentQ = 1;
            render();
        });
    }

    // ── VRAGEN ───────────────────────────────────────────────

    function renderQuestion(n) {
        const data       = questions[n - 1];
        let qAttempts    = 0;
        const isLast     = n === TOTAL_Q;
        const isOmtrek   = data.task === 'omtrek';
        const isCirkel   = data.fig === 'cirkel';
        const isDriehoek = data.fig === 'driehoek-hoogte';

        const csOptsHtml = FORMULA_OPTS.map(o =>
            `<div class="ex33-cs-opt" data-value="${o.value}">${o.html || '&mdash;'}</div>`
        ).join('');

        const unitOptsHtml = UNIT_OPTS.map(u =>
            `<option value="${u}">${u || '—'}</option>`
        ).join('');

        const titleText = isOmtrek
            ? (isCirkel ? `Bereken de omtrek op 0,01 ${data.unit} nauwkeurig.`       : 'Bereken de omtrek.')
            : (isCirkel ? `Bereken de oppervlakte op 0,01 ${data.unit}² nauwkeurig.` : 'Bereken de oppervlakte.');
        const pLabel       = isOmtrek ? '<i>P</i>' : '<i>A</i>';
        const sentenceWord = isOmtrek ? 'omtrek' : 'oppervlakte';
        const calcSep      = isCirkel ? '&asymp;' : '=';

        container.innerHTML = `
            <div class="exercise-container">
                ${progressHTML()}
                <div class="question-card">
                    <h3 class="question-title">${titleText}</h3>
                    <p class="ex54-subtitle">Je mag ICT gebruiken voor de berekening.</p>
                    <div class="ex33-fig" id="ex75-fig"></div>
                    <div class="ex33-rows">
                        <div class="ex33-row">
                            <span class="ex33-label">Formule:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <div class="ex33-cs" id="ex75-cs" data-value="">
                                <div class="ex33-cs-display">&mdash;</div>
                                <div class="ex33-cs-list" hidden>${csOptsHtml}</div>
                            </div>
                        </div>
                        <div class="ex33-row ex33-row-calc">
                            <span class="ex33-label">Berekening in</span>
                            <select id="ex75-unit" class="ex33-unit">${unitOptsHtml}</select>
                            <span>:</span>
                            <span class="ex33-p-label">${pLabel} =</span>
                            <input id="ex75-calc" class="ex33-calc" type="text" autocomplete="off" placeholder="berekening">
                            <span>${calcSep}</span>
                            <input id="ex75-ans" class="ex33-ans" type="text" autocomplete="off" placeholder="antwoord">
                        </div>
                        <div class="ex33-row ex33-sentence">
                            Antwoord: De ${sentenceWord} is
                            <span id="ex75-ans-disp" class="ex33-val">...</span>
                            <span id="ex75-unit-disp" class="ex33-val">...</span>.
                        </div>
                    </div>
                    <div class="squared-helper">
                        <span>Om <strong>²</strong> in te voeren, druk je op de knop:</span>
                        <button type="button" class="squared-insert-btn" id="squaredBtn"><span class="key-top">3</span><span class="key-bottom">2</span></button>
                    </div>
                    <p class="hint-text">Tip: typ <kbd>*</kbd> voor het maalteken &middot; &nbsp;|&nbsp; typ <kbd>pi</kbd> voor &pi; &nbsp;|&nbsp; gebruik <kbd>/</kbd> of <kbd>:</kbd> voor deling</p>
                    <div id="feedbackArea" class="feedback-area"></div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="checkBtn">Controleer</button>
                    </div>
                </div>
            </div>`;

        const figEl = document.getElementById('ex75-fig');
        if (isDriehoek) {
            const fd = drawFiguur(figEl, 'driehoek-hoogte', data.figOpts);
            data.dims.a     = fd.a;
            data.dims.b     = fd.b;
            data.dims.c     = fd.c;
            data.dims.h     = fd.h;
            data.dims.basis = data.dims.driehoekType === 4 ? fd.c : fd.a;
            data.answer = isOmtrek
                ? round2(fd.a + fd.b + fd.c)
                : fd.oppervlakte;
        } else {
            const figType = data.fig === 'parallellogram' && data.task === 'oppervlakte'
                ? 'parallellogram-hoogte'
                : data.fig;
            drawFiguur(figEl, figType, data.figOpts);
        }

        initCS('ex75-cs');

        const ansEl  = document.getElementById('ex75-ans');
        const unitEl = document.getElementById('ex75-unit');
        const calcEl = document.getElementById('ex75-calc');

        function updateRow3() {
            document.getElementById('ex75-ans-disp').textContent  = ansEl.value.trim()  || '...';
            document.getElementById('ex75-unit-disp').textContent = unitEl.value || '...';
        }
        ansEl.addEventListener('input', updateRow3);
        unitEl.addEventListener('change', updateRow3);

        calcEl.addEventListener('keydown', e => {
            if (e.key !== '*') return;
            e.preventDefault();
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.substring(0, s) + '·' + calcEl.value.substring(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
        });

        calcEl.addEventListener('input', () => {
            const old    = calcEl.value;
            const newVal = old.replace(/pi/gi, 'π');
            if (newVal !== old) {
                const diff   = old.length - newVal.length;
                const cursor = calcEl.selectionStart;
                calcEl.value = newVal;
                calcEl.selectionStart = calcEl.selectionEnd = Math.max(0, cursor - diff);
            }
        });

        document.getElementById('squaredBtn').addEventListener('click', () => {
            const s = calcEl.selectionStart, end = calcEl.selectionEnd;
            calcEl.value = calcEl.value.slice(0, s) + '²' + calcEl.value.slice(end);
            calcEl.selectionStart = calcEl.selectionEnd = s + 1;
            calcEl.focus();
        });

        document.getElementById('checkBtn').addEventListener('click', () => {
            qAttempts++;
            const formula = document.getElementById('ex75-cs').dataset.value || '';
            const unit    = unitEl.value;
            const calc    = calcEl.value.trim();
            const ans     = ansEl.value.trim();
            const showWithAction = isLast ? showFeedbackWithFinish : showFeedbackWithNext;
            const errors  = buildFeedback(data, formula, unit, calc, ans);

            if (errors.length === 0) {
                const pts = qAttempts === 1 ? 1 : 0.5;
                totalPoints += pts;
                document.getElementById('checkBtn').style.display = 'none';
                showWithAction('correct', qAttempts === 1 ? 'Correct!' : 'Correct bij de tweede poging.');
            } else if (qAttempts < 2) {
                showFeedback('incorrect', errors);
            } else {
                document.getElementById('checkBtn').style.display = 'none';
                fillCorrectAnswer(data);
                showWithAction('incorrect', 'Je antwoord is niet juist.<br>De juiste oplossing is aangevuld.');
            }
        });
    }

    // ── JUISTE OPLOSSING INVULLEN ────────────────────────────

    function fillCorrectAnswer(data) {
        const cs      = document.getElementById('ex75-cs');
        const display = cs.querySelector('.ex33-cs-display');
        cs.dataset.value  = data.formula;
        display.innerHTML = FORMULA_OPTS.find(o => o.value === data.formula).html || '&mdash;';

        const correctUnit = data.task === 'omtrek' ? data.unit : data.unit + '²';
        document.getElementById('ex75-unit').value = correctUnit;

        document.getElementById('ex75-calc').value = buildCalcCorrect(data);

        const ansStr = String(data.answer);
        document.getElementById('ex75-ans').value             = ansStr;
        document.getElementById('ex75-ans-disp').textContent  = ansStr;
        document.getElementById('ex75-unit-disp').textContent = correctUnit;
    }

    function buildCalcCorrect(data) {
        const { fig, task, dims } = data;
        if (task === 'omtrek') {
            switch (fig) {
                case 'vierkant':
                case 'ruit':              return `4·${dims.z}`;
                case 'rechthoek':         return `2·(${dims.b}+${dims.h})`;
                case 'parallellogram':    return `${dims.b}+${dims.z}+${dims.b}+${dims.z}`;
                case 'cirkel':            return `2·π·${dims.r}`;
                case 'driehoek-hoogte':   return `${dims.a}+${dims.b}+${dims.c}`;
            }
        } else {
            switch (fig) {
                case 'vierkant':          return `${dims.z}²`;
                case 'rechthoek':         return `${dims.b}·${dims.h}`;
                case 'parallellogram':    return `${dims.b}·${dims.h}`;
                case 'driehoek-hoogte':   return `${dims.basis}·${dims.h}:2`;
                case 'cirkel':            return `π·${dims.r}²`;
            }
        }
    }

    // ── FEEDBACK OPBOUWEN ────────────────────────────────────

    function buildFeedback(data, formula, unit, calc, ans) {
        const errors   = [];
        const isOmtrek = data.task === 'omtrek';

        if (!formula) {
            errors.push('Kies een formule.');
        } else if (formula !== data.formula) {
            errors.push('De formule is niet juist. Lees de opgave aandachtig, zo weet je wat je moet berekenen. Wat is het hier? <i>Omtrek</i> (<i>P</i>) of <i>oppervlakte</i> (<i>A</i>)?<br>Bekijk ook aandachtig de figuur om te weten welke formule je moet kiezen.');
        }

        if (!unit) {
            errors.push('Kies een eenheid.');
        } else if (isOmtrek) {
            if (unit.includes('²')) {
                errors.push('Voor omtrek gebruik je een lengte-eenheid, geen eenheid met ².');
            } else if (unit !== data.unit) {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        } else {
            if (!unit.includes('²')) {
                errors.push('Voor oppervlakte gebruik je een eenheid met ². Jij koos een eenheid die je gebruikt bij afstand of omtrek.');
            } else if (unit !== data.unit + '²') {
                errors.push('Kijk voor de juiste eenheid naar de eenheden op de figuur.');
            }
        }

        const calcResult = checkCalc(data, calc);
        if (!calcResult.ok) {
            if (calcResult.error === 'volgorde') {
                errors.push('Je hebt de berekening niet correct opgeschreven. Controleer de volgorde waarin je de getallen noteert.');
            } else if (calcResult.error === 'zijde-als-hoogte') {
                errors.push('De berekening is niet juist. Kijk goed naar de figuur: hoe lang is de hoogte van dit parallellogram?');
            } else if (calcResult.error === 'missing-division') {
                errors.push('Ben je de deling door 2 niet vergeten bij de oppervlakte van de driehoek?');
            } else {
                errors.push('Je hebt de berekening niet correct opgeschreven.');
            }
        }

        if (!checkAnswer(data, ans)) {
            if (calcResult.ok) {
                errors.push('Je hebt niet goed uitgerekend. Je mag ICT gebruiken.');
            } else if (calcResult.error === 'generic' || calcResult.error === 'missing-division') {
                errors.push('De berekening is niet juist, pas dus je antwoord aan.');
            }
        }

        return errors;
    }

    // ── VALIDATIE ────────────────────────────────────────────

    function normalizeCalc(s) {
        return s.replace(/,/g, '.').replace(/\*/g, '·').replace(/\s+/g, '');
    }

    function checkCalc(data, input) {
        const { fig, task, dims } = data;
        if (task === 'omtrek') {
            switch (fig) {
                case 'vierkant':
                case 'ruit':            return checkCalc4z(dims.z, input);
                case 'rechthoek':       return checkCalcRechthoekOmtrek(dims, input);
                case 'parallellogram':  return checkCalcParaOmtrek(dims, input);
                case 'cirkel':          return checkCalcCirkel(dims.r, input);
                case 'driehoek-hoogte': return checkCalcDriehoek([dims.a, dims.b, dims.c], input);
            }
        } else {
            switch (fig) {
                case 'vierkant':        return checkCalcVierkantOpp(dims.z, input);
                case 'rechthoek':       return checkCalcRechthoekOpp(dims, input);
                case 'parallellogram':  return checkCalcParaOpp(dims, input);
                case 'driehoek-hoogte': return checkCalcDriehoekOpp(dims.basis, dims.h, input);
                case 'cirkel':          return checkCalcCirkelOpp(dims.r, input);
            }
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalc4z(z, input) {
        const n   = normalizeCalc(input);
        const m4z = n.match(/^4·(.+)$/);
        if (m4z) {
            const v = parseFloat(m4z[1]);
            if (!isNaN(v) && Math.abs(v - z) < 0.05) return { ok: true };
        }
        const mz4 = n.match(/^(.+)·4$/);
        if (mz4) {
            const v = parseFloat(mz4[1]);
            if (!isNaN(v) && Math.abs(v - z) < 0.05) return { ok: false, error: 'volgorde' };
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalcRechthoekOmtrek(dims, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^2·\((.+)\+(.+)\)$/);
        if (!m) return { ok: false, error: 'generic' };
        const x = parseFloat(m[1]), y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };
        const { b, h } = dims;
        if ((Math.abs(x-b)<0.05 && Math.abs(y-h)<0.05) || (Math.abs(x-h)<0.05 && Math.abs(y-b)<0.05)) {
            return { ok: true };
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalcParaOmtrek(dims, input) {
        const n     = input.replace(/,/g, '.').replace(/\s+/g, '');
        const parts = n.split('+');
        if (parts.length !== 4) return { ok: false, error: 'generic' };
        const nums = parts.map(p => parseFloat(p));
        if (nums.some(isNaN)) return { ok: false, error: 'generic' };
        const expected = [dims.b, dims.b, dims.z, dims.z].sort((a, b) => a - b);
        const actual   = [...nums].sort((a, b) => a - b);
        if (expected.every((v, i) => Math.abs(v - actual[i]) < 0.05)) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcCirkel(r, input) {
        const n = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/pi/gi, 'π').replace(/\s+/g, '');
        const parts = n.split('·');
        if (parts.length !== 3) return { ok: false, error: 'generic' };
        const hasPi = parts.some(p => p === 'π');
        const has2  = parts.some(p => p === '2');
        const rPart = parts.find(p => p !== 'π' && p !== '2');
        if (!hasPi || !has2 || !rPart) return { ok: false, error: 'generic' };
        const v = parseFloat(rPart);
        if (!isNaN(v) && Math.abs(v - r) < 0.05) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcCirkelOpp(r, input) {
        const n = input.replace(/,/g, '.').replace(/\*/g, '·').replace(/pi/gi, 'π').replace(/\s+/g, '');
        const parts = n.split('·');
        if (parts.length === 2) {
            const hasPi   = parts.some(p => p === 'π');
            const rSqPart = parts.find(p => p !== 'π');
            if (!hasPi || !rSqPart) return { ok: false, error: 'generic' };
            const mSq = rSqPart.match(/^(.+)²$/);
            if (mSq) {
                const v = parseFloat(mSq[1].replace(',', '.'));
                if (!isNaN(v) && Math.abs(v - r) < 0.05) return { ok: true };
            }
            return { ok: false, error: 'generic' };
        }
        if (parts.length === 3) {
            const hasPi  = parts.some(p => p === 'π');
            const rParts = parts.filter(p => p !== 'π');
            if (!hasPi || rParts.length !== 2) return { ok: false, error: 'generic' };
            const vals = rParts.map(p => parseFloat(p.replace(',', '.')));
            if (vals.every(v => !isNaN(v) && Math.abs(v - r) < 0.05)) return { ok: true };
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalcDriehoek(sides, input) {
        const n     = input.replace(/,/g, '.').replace(/\s+/g, '');
        const parts = n.split('+');
        if (parts.length !== 3) return { ok: false, error: 'generic' };
        const nums = parts.map(p => parseFloat(p));
        if (nums.some(isNaN)) return { ok: false, error: 'generic' };
        const expected = [...sides].sort((a, b) => a - b);
        const actual   = [...nums].sort((a, b) => a - b);
        if (expected.every((v, i) => Math.abs(v - actual[i]) < 0.05)) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcDriehoekOpp(basis, h, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^(.+)[·](.+)[:/]2$/);
        if (!m) {
            if (n.match(/^(.+)[·](.+)$/)) return { ok: false, error: 'missing-division' };
            return { ok: false, error: 'generic' };
        }
        const x = parseFloat(m[1]), y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };
        if ((Math.abs(x - basis) < 0.05 && Math.abs(y - h) < 0.05) ||
            (Math.abs(x - h) < 0.05 && Math.abs(y - basis) < 0.05)) {
            return { ok: true };
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalcVierkantOpp(z, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^(\d+\.?\d*)²$/);
        if (!m) return { ok: false, error: 'generic' };
        const v = parseFloat(m[1]);
        if (!isNaN(v) && Math.abs(v - z) < 0.05) return { ok: true };
        return { ok: false, error: 'generic' };
    }

    function checkCalcRechthoekOpp(dims, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^(.+)·(.+)$/);
        if (!m) return { ok: false, error: 'generic' };
        const x = parseFloat(m[1]), y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };
        const { b, h } = dims;
        if ((Math.abs(x-b)<0.05 && Math.abs(y-h)<0.05) || (Math.abs(x-h)<0.05 && Math.abs(y-b)<0.05)) {
            return { ok: true };
        }
        return { ok: false, error: 'generic' };
    }

    function checkCalcParaOpp(dims, input) {
        const n = normalizeCalc(input);
        const m = n.match(/^(.+)·(.+)$/);
        if (!m) return { ok: false, error: 'generic' };
        const x = parseFloat(m[1]), y = parseFloat(m[2]);
        if (isNaN(x) || isNaN(y)) return { ok: false, error: 'generic' };
        const { b, h, z } = dims;
        const bOk = Math.abs(x - b) < 0.05;
        const hOk = Math.abs(y - h) < 0.05;
        if (bOk && hOk) return { ok: true };
        if (Math.abs(x - h) < 0.05 && Math.abs(y - b) < 0.05) return { ok: false, error: 'volgorde' };
        if (bOk && Math.abs(y - z) < 0.05)                      return { ok: false, error: 'zijde-als-hoogte' };
        return { ok: false, error: 'generic' };
    }

    function checkAnswer(data, input) {
        const n   = parseFloat(input.replace(/,/g, '.'));
        const tol = data.fig === 'cirkel' ? 0.005 : 0.05;
        return !isNaN(n) && Math.abs(n - data.answer) < tol;
    }

    // ── DATA GENERATIE ───────────────────────────────────────

    function genQuestion(fig, task) {
        const unit     = randomFrom(GEN_UNITS);
        const rotation = Math.floor(Math.random() * 72) * 5;
        const key      = `${fig}-${task}`;
        let dims, figOpts, answer;

        switch (fig) {
            case 'vierkant': {
                const z = randomDimInt();
                dims    = { z };
                figOpts = { factor: 1, rotation, zijde: { value: z, unit } };
                answer  = task === 'omtrek' ? round2(4 * z) : round2(z * z);
                break;
            }
            case 'rechthoek': {
                let b, h;
                do { b = randomDimInt(); h = randomDimInt(); } while (b === h);
                dims    = { b, h };
                figOpts = { factor: 1, rotation, breedte: { value: b, unit }, hoogte: { value: h, unit } };
                answer  = task === 'omtrek' ? round2(2 * (b + h)) : round2(b * h);
                break;
            }
            case 'ruit': {
                const z = randomDimInt();
                dims    = { z };
                figOpts = { factor: 1, rotation, zijde: { value: z, unit } };
                answer  = round2(4 * z);
                break;
            }
            case 'parallellogram': {
                let a, c;
                do { a = randomFrom(PARA_DIMS); c = randomFrom(PARA_DIMS); } while (a === c);
                const b = Math.max(a, c), z = Math.min(a, c);
                if (task === 'omtrek') {
                    dims    = { b, z };
                    figOpts = { factor: 1, rotation, basis: { value: b, unit }, zijde: { value: z, unit } };
                    answer  = round2(2 * (b + z));
                } else {
                    const h = computeHoogte(b, z);
                    dims    = { b, z, h };
                    figOpts = { factor: 1, rotation, basis: { value: b, unit }, zijde: { value: z, unit } };
                    answer  = round2(b * h);
                }
                break;
            }
            case 'cirkel': {
                const r = randomFrom([2, 3, 4, 5, 6]);
                dims    = { r };
                figOpts = { factor: 1, straal: { value: r, unit } };
                answer  = task === 'omtrek'
                    ? Math.round(2 * Math.PI * r * 100) / 100
                    : Math.round(Math.PI * r * r * 100) / 100;
                break;
            }
            case 'driehoek-hoogte': {
                const driehoekType = randomFrom([1, 2, 3, 4]);
                dims    = { driehoekType, a: null, b: null, c: null, h: null, basis: null };
                figOpts = { type: driehoekType, k: 1, unit, rotation };
                answer  = null;
                break;
            }
        }

        return { fig, task, key, unit, dims, figOpts, formula: CORRECT_FORMULA[key], answer };
    }

    function computeHoogte(b, z) {
        const hRaw     = z * SIN_A;
        const decimals = Math.max(nDec(b), nDec(z));
        return Math.round(hRaw * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    function nDec(v) {
        const s = String(Math.round(v * 10000) / 10000);
        const i = s.indexOf('.');
        return i === -1 ? 0 : s.length - i - 1;
    }

    function round2(n) { return Math.round(n * 100) / 100; }

    // ── FINISH ───────────────────────────────────────────────

    function finish() {
        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        const score    = Math.round((totalPoints / MAX_POINTS) * 100);
        const xpEarned = Math.round((score / 100) * 80);
        onComplete({ score, correctAnswers: totalPoints, totalQuestions: MAX_POINTS, xpEarned });
    }

    // ── CUSTOM SELECT ────────────────────────────────────────

    function initCS(id) {
        const sel     = document.getElementById(id);
        const display = sel.querySelector('.ex33-cs-display');
        const list    = sel.querySelector('.ex33-cs-list');

        if (docClickCleanup) document.removeEventListener('click', docClickCleanup);
        docClickCleanup = () => { if (list) list.hidden = true; };
        document.addEventListener('click', docClickCleanup);

        display.addEventListener('click', e => {
            e.stopPropagation();
            list.hidden = !list.hidden;
        });

        sel.querySelectorAll('.ex33-cs-opt').forEach(opt => {
            opt.addEventListener('click', e => {
                e.stopPropagation();
                sel.dataset.value = opt.dataset.value;
                display.innerHTML = opt.innerHTML || '&mdash;';
                list.hidden       = true;
            });
        });
    }

    // ── HELPERS ──────────────────────────────────────────────

    function randomDimInt()  { return randomFrom([3, 4, 5, 6, 7, 8, 9, 10]); }
    function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ── CSS ──────────────────────────────────────────────────

    function addCSS75() {
        if (['ex33-style','ex36-style','ex54-style','ex511-style','ex66-style','ex75-style'].some(id => document.getElementById(id))) return;
        const s = document.createElement('style');
        s.id = 'ex75-style';
        s.textContent = `
.ex33-badge { display: inline-block; background: var(--color-primary,#4a7a10); color: #fff; font-size: 0.78rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem; }
.ex54-subtitle { font-size: var(--font-size-base,0.95rem); color: #555; margin: -0.25rem 0 0.5rem; }
.ex33-fig { display: flex; justify-content: center; min-height: 200px; margin: var(--spacing-lg,1rem) 0; }
.ex33-stepplan { background: var(--color-light,#f0f7e0); border-radius: var(--radius-md,8px); padding: var(--spacing-md,0.75rem) var(--spacing-lg,1rem); margin: var(--spacing-lg,1rem) 0; font-size: var(--font-size-base,0.95rem); }
.ex33-stepplan strong { display: block; margin-bottom: 0.35rem; }
.ex33-stepplan ol { margin: 0; padding-left: 1.25rem; }
.ex33-stepplan li { margin: 0.2rem 0; }
.ex33-rows { display: flex; flex-direction: column; gap: var(--spacing-md,0.65rem); margin: var(--spacing-lg,1rem) 0; }
.ex33-row { display: flex; align-items: center; gap: var(--spacing-sm,0.5rem); flex-wrap: wrap; }
.ex33-row-calc { flex-wrap: nowrap; overflow-x: auto; }
.ex33-label { font-size: var(--font-size-base,0.95rem); white-space: nowrap; }
.ex33-p-label { font-size: var(--font-size-base,0.95rem); white-space: nowrap; }
.ex33-eg-field { padding: 0.35rem 0.6rem; background: #f0f0f0; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); color: #444; min-height: 1.8rem; display: flex; align-items: center; }
.ex33-eg-unit { min-width: 36px; }
.ex33-eg-calc { min-width: 90px; }
.ex33-eg-ans  { min-width: 36px; }
.ex33-cs { position: relative; display: inline-block; min-width: 210px; }
.ex33-cs-display { padding: 0.35rem 0.6rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); cursor: pointer; background: #fff; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; user-select: none; }
.ex33-cs-display:hover { border-color: var(--color-primary,#4a7a10); }
.ex33-cs-list { position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff; border: 2px solid var(--color-primary,#4a7a10); border-radius: var(--radius-md,6px); z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.ex33-cs-opt { padding: 0.45rem 0.6rem; cursor: pointer; font-size: var(--font-size-base,0.95rem); min-height: 1.8rem; display: flex; align-items: center; }
.ex33-cs-opt:hover { background: var(--color-light,#f0f7e0); }
.ex33-unit { padding: 0.35rem 0.3rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 68px; }
.ex33-calc { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 130px; }
.ex33-ans { padding: 0.35rem 0.5rem; border: 2px solid var(--color-gray,#ccc); border-radius: var(--radius-md,6px); font-size: var(--font-size-base,0.95rem); width: 70px; }
.ex33-sentence { font-size: var(--font-size-base,1rem); padding: 0.3rem 0; }
.ex33-val { font-weight: 600; color: var(--color-primary,#4a7a10); }
.ex54-feedback-list { margin: 0.3rem 0 0.4rem 1.2rem; padding: 0; }
.ex54-feedback-list li { margin: 0.2rem 0; }
.squared-helper { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f0f7ff; border-radius: var(--radius-md,8px); border: 1px solid #d0e4f7; font-size: var(--font-size-base,0.95rem); }
.squared-insert-btn { background: #2c2c2c; color: #fff; border: 1px solid #111; border-bottom: 3px solid #000; border-radius: 5px; padding: 0.2rem 0.6rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,.35); display: inline-flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 0; }
.squared-insert-btn .key-top { font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
.squared-insert-btn .key-bottom { font-size: 1rem; font-weight: 700; }
.squared-insert-btn:hover { background: #3a3a3a; transform: translateY(1px); border-bottom-width: 2px; }
.squared-insert-btn:active { transform: translateY(2px); border-bottom-width: 1px; box-shadow: none; }
.hint-text { font-size: var(--font-size-small,0.85rem); color: #666; margin: 0 0 var(--spacing-md,0.75rem) 0; }
`;
        document.head.appendChild(s);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init75AllesGemengd };
}
