// ============================================
// DASHBOARD LOGICA
// ============================================

let allStudents = [];
let csvData = [];

// ── Initialisatie ─────────────────────────────
async function initDashboard() {
    const user = checkAuth();
    if (!user || !user.isAdmin) {
        alert('Toegang geweigerd');
        logout();
        return;
    }
    await loadDeadlines();
    await loadAllData();
}

async function loadAllData() {
    try {
        allStudents = await DB.getAllSummaries();
        updateTileStats();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateTileStats() {
    const n = allStudents.length;
    document.getElementById('stat-students').textContent  = n ? `${n} leerlingen` : '';
    document.getElementById('stat-leerlingen').textContent = n ? `${n} leerlingen` : '';

    const currentWeek = getCurrentWeekDeadline();
    if (currentWeek) {
        const weekKey = `week-${currentWeek.weekNumber}`;
        const gehaald = allStudents.filter(s => s.deadlineStatus?.[weekKey] === 'A').length;
        document.getElementById('stat-deadlines').textContent = `${gehaald} gehaald`;
    }
}

// ── Tegels ────────────────────────────────────
function showSection(sectionName) {
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.toggle('active', tile.dataset.section === sectionName);
    });

    document.getElementById('sectionContent').classList.remove('hidden');

    document.querySelectorAll('.section-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${sectionName}`);
    });

    switch (sectionName) {
        case 'overview':  renderOverview(); break;
        case 'students':  renderStudentsTab(); break;
        case 'deadlines': renderDeadlinesTab(); break;
    }
}

// ── Overzicht ─────────────────────────────────
function renderOverview() {
    const grid = document.getElementById('studentsGrid');
    grid.innerHTML = '';

    if (allStudents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>Nog geen leerlingen toegevoegd</p>
                <button class="btn btn-primary" onclick="showSection('students')">
                    Leerlingen toevoegen
                </button>
            </div>`;
        return;
    }

    allStudents.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.onclick = () => viewStudentDetails(student.email);

        const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const lessonProgress = getLessonById(student.currentLesson);

        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-avatar">${initials}</div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p class="student-email">${student.email}</p>
                </div>
            </div>
            <div class="student-stats">
                <div class="student-stat">
                    <div class="student-stat-value">${student.totalXP || 0}</div>
                    <div class="student-stat-label">XP</div>
                </div>
                <div class="student-stat">
                    <div class="student-stat-value">${lessonProgress?.order || 0}</div>
                    <div class="student-stat-label">Les ${lessonProgress?.order || 0}</div>
                </div>
                <div class="student-stat">
                    <div class="student-stat-value">✓</div>
                    <div class="student-stat-label">OK</div>
                </div>
            </div>`;

        grid.appendChild(card);
    });
}

// ── Leerlingen ────────────────────────────────
function renderStudentsTab() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- Kies een leerling --</option>';

    allStudents.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => {
        const option = document.createElement('option');
        option.value = student.email;
        option.textContent = student.name;
        select.appendChild(option);
    });

    select.onchange = (e) => {
        if (e.target.value) {
            viewStudentDetails(e.target.value);
        } else {
            document.getElementById('studentDetails').classList.add('hidden');
        }
    };
}

async function addSingleStudent(btn) {
    const name  = document.getElementById('newStudentName').value.trim();
    const email = document.getElementById('newStudentEmail').value.trim().toLowerCase();

    if (!name || !email) {
        showStudentMsg('Vul naam en e-mailadres in.', 'error');
        return;
    }

    btn.disabled = true;

    const existing = await DB.getUser(email);
    if (existing) {
        showStudentMsg('Dit e-mailadres is al geregistreerd.', 'error');
        btn.disabled = false;
        return;
    }

    const result = await DB.createUser(email, name);
    if (result) {
        document.getElementById('newStudentName').value  = '';
        document.getElementById('newStudentEmail').value = '';
        await loadAllData();
        renderStudentsTab();
        showStudentMsg(`${name} succesvol toegevoegd!`, 'success');
    } else {
        showStudentMsg('Fout bij toevoegen. Probeer opnieuw.', 'error');
    }

    btn.disabled = false;
}

function showStudentMsg(tekst, type) {
    const el = document.getElementById('addStudentMsg');
    el.textContent = tekst;
    el.className = type === 'success' ? 'student-msg student-msg-ok' : 'student-msg student-msg-fout';
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
}

function downloadExampleCSV() {
    const inhoud = [
        'email,naam',
        'leerling1@labsintniklaas.be,Jan Janssen',
        'leerling2@labsintniklaas.be,Marie Peeters',
        'leerling3@labsintniklaas.be,Pieter De Smet'
    ].join('\n');

    const blob = new Blob([inhoud], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'leerlingen_voorbeeld.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleCSVFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => parseCSV(evt.target.result);
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    csvData = [];

    lines.forEach((line, i) => {
        if (i === 0) return;
        const [email, naam] = line.split(',').map(s => s.trim().replace(/['"]/g, ''));
        if (email && naam) csvData.push({ email, name: naam });
    });

    const previewEl   = document.getElementById('csvPreview');
    const uploadBtn   = document.getElementById('csvUploadBtn');

    if (csvData.length > 0) {
        previewEl.innerHTML = csvData.map(s => `${s.name} (${s.email})`).join('<br>')
            + `<br><strong>${csvData.length} leerling(en)</strong>`;
        previewEl.classList.remove('hidden');
        uploadBtn.classList.remove('hidden');
    } else {
        previewEl.innerHTML = 'Geen geldige data gevonden in dit bestand.';
        previewEl.classList.remove('hidden');
        uploadBtn.classList.add('hidden');
    }
}

async function uploadStudents() {
    if (csvData.length === 0) return;
    if (!confirm(`${csvData.length} leerlingen uploaden?`)) return;

    const btn = document.getElementById('csvUploadBtn');
    btn.disabled    = true;
    btn.textContent = 'Bezig…';

    const success = await DB.uploadStudents(csvData);

    if (success) {
        csvData = [];
        document.getElementById('csvFile').value = '';
        document.getElementById('csvPreview').classList.add('hidden');
        btn.classList.add('hidden');
        await loadAllData();
        renderStudentsTab();
        alert('Leerlingen succesvol toegevoegd!');
    } else {
        alert('Fout bij uploaden. Probeer opnieuw.');
    }

    btn.disabled    = false;
    btn.textContent = 'Uploaden';
}

async function viewStudentDetails(email) {
    showSection('students');
    document.getElementById('studentSelect').value = email;

    const userData = await DB.getUser(email);
    if (!userData) return;

    const detailsContainer = document.getElementById('studentDetails');
    detailsContainer.classList.remove('hidden');

    detailsContainer.innerHTML = `
        <div class="student-detail-header">
            <div class="student-detail-info">
                <h2>${userData.name}</h2>
                <p>${email}</p>
                <p>Totaal XP: ${userData.totalXP || 0}</p>
            </div>
        </div>
        <h3>Voortgang per les</h3>
        <table class="progress-table">
            <thead>
                <tr>
                    <th>Les</th>
                    <th>Titel</th>
                    <th>Onderdelen</th>
                    <th>XP</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${renderStudentProgress(userData)}
            </tbody>
        </table>`;
}

function renderStudentProgress(userData) {
    return getAllLessons().map(lesson => {
        const lessonProgress  = userData.progress?.[lesson.id];
        const parts           = lesson.parts || [];
        const completedParts  = parts.filter(p => lessonProgress?.parts?.[p.id]?.completed).length;
        const totalXP         = Object.values(lessonProgress?.parts || {})
                                    .reduce((sum, p) => sum + (p.xp || 0), 0);

        const status = lessonProgress?.completed
            ? '<span class="badge badge-success">✓ Voltooid</span>'
            : userData.currentLesson === lesson.id
            ? '<span class="badge badge-info">Bezig</span>'
            : '<span class="badge">Te doen</span>';

        return `
            <tr>
                <td><strong>${lesson.order}</strong></td>
                <td>${lesson.title}</td>
                <td>${completedParts}/${parts.length}</td>
                <td>${totalXP} XP</td>
                <td>${status}</td>
            </tr>`;
    }).join('');
}

// ── Deadlines ─────────────────────────────────
function renderDeadlinesTab() {
    renderDeadlineEditor();

    const select = document.getElementById('weekSelect');
    select.innerHTML = '<option value="">-- Kies een week --</option>';

    DEADLINES.forEach(d => {
        const option = document.createElement('option');
        option.value = d.weekNumber;
        option.textContent = `Week ${d.weekNumber} (t/m ${formatDate(d.endDate)})`;
        select.appendChild(option);
    });

    select.onchange = async (e) => {
        if (e.target.value) {
            await showWeekScores(parseInt(e.target.value));
        } else {
            document.getElementById('weekScores').classList.add('hidden');
        }
    };
}

function renderDeadlineEditor() {
    const lessonOpties = getAllLessons()
        .map(l => `<option value="${l.id}">Les ${l.order} — ${l.title}</option>`)
        .join('');

    document.getElementById('deadlineEditor').innerHTML = DEADLINES.map((d, i) =>
        deadlineRij(i, d.startDate, d.endDate, d.targetLesson, lessonOpties)
    ).join('');
}

function deadlineRij(index, startDate = '', endDate = '', targetLesson = '', lessonOpties = null) {
    if (!lessonOpties) {
        lessonOpties = getAllLessons()
            .map(l => `<option value="${l.id}">Les ${l.order} — ${l.title}</option>`)
            .join('');
    }
    // Markeer de geselecteerde les
    const opties = lessonOpties.replace(
        `value="${targetLesson}"`,
        `value="${targetLesson}" selected`
    );
    return `
        <div class="deadline-row">
            <span class="deadline-week-label">Week ${index + 1}</span>
            <div class="deadline-fields">
                <div class="form-group">
                    <label>Van</label>
                    <input type="date" class="deadline-start" value="${startDate}">
                </div>
                <div class="form-group">
                    <label>Tot (23:59)</label>
                    <input type="date" class="deadline-end" value="${endDate}">
                </div>
                <div class="form-group">
                    <label>Doeles</label>
                    <select class="deadline-lesson">${opties}</select>
                </div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeDeadlineWeek(this)" title="Verwijderen">✕</button>
        </div>`;
}

function addDeadlineWeek() {
    const editor = document.getElementById('deadlineEditor');
    const huidigAantal = editor.querySelectorAll('.deadline-row').length;
    const div = document.createElement('div');
    div.innerHTML = deadlineRij(huidigAantal);
    editor.appendChild(div.firstElementChild);
}

function removeDeadlineWeek(btn) {
    btn.closest('.deadline-row').remove();
    // Hernummer de weeklabels
    document.querySelectorAll('.deadline-row').forEach((row, i) => {
        row.querySelector('.deadline-week-label').textContent = `Week ${i + 1}`;
    });
}

async function saveDashboardDeadlines() {
    const rows = document.querySelectorAll('#deadlineEditor .deadline-row');
    const nieuweDeadlines = [];
    let geldig = true;

    rows.forEach((row, i) => {
        const startDate    = row.querySelector('.deadline-start').value;
        const endDate      = row.querySelector('.deadline-end').value;
        const targetLesson = row.querySelector('.deadline-lesson').value;

        if (!startDate || !endDate) { geldig = false; return; }

        nieuweDeadlines.push({ weekNumber: i + 1, startDate, endDate, targetLesson });
    });

    if (!geldig) {
        showDeadlineMsg('Vul alle datums in.', 'error');
        return;
    }

    const btn = document.getElementById('saveDeadlinesBtn');
    btn.disabled = true;

    const success = await DB.saveDeadlines(nieuweDeadlines);
    if (success) {
        DEADLINES = nieuweDeadlines;
        updateTileStats();
        // Herlaad de weekkiezer met de nieuwe deadlines
        const select = document.getElementById('weekSelect');
        select.innerHTML = '<option value="">-- Kies een week --</option>';
        DEADLINES.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.weekNumber;
            opt.textContent = `Week ${d.weekNumber} (t/m ${formatDate(d.endDate)})`;
            select.appendChild(opt);
        });
        document.getElementById('weekScores').classList.add('hidden');
        showDeadlineMsg('Deadlines opgeslagen!', 'success');
    } else {
        showDeadlineMsg('Fout bij opslaan. Probeer opnieuw.', 'error');
    }

    btn.disabled = false;
}

function showDeadlineMsg(tekst, type) {
    const el = document.getElementById('deadlineSaveMsg');
    el.textContent = tekst;
    el.className = type === 'success' ? 'student-msg student-msg-ok' : 'student-msg student-msg-fout';
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
}

async function showWeekScores(weekNumber) {
    const scores    = await getWeeklyScoresForAllStudents(weekNumber);
    const container = document.getElementById('weekScores');
    container.classList.remove('hidden');

    container.innerHTML = `
        <h3>Scores Week ${weekNumber}</h3>
        <table class="week-scores-table">
            <thead>
                <tr><th>Naam</th><th>Email</th><th>Score</th><th>Huidige Les</th></tr>
            </thead>
            <tbody>
                ${scores.map(student => {
                    const cls = student.score === 'A' ? 'score-A'
                              : student.score === 'C' ? 'score-C'
                              : student.score === 'NI' ? 'score-NI' : '';
                    return `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.email}</td>
                            <td><span class="score-badge ${cls}">${student.score}</span></td>
                            <td>${student.currentLesson}</td>
                        </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

async function exportSelectedWeek() {
    const weekNumber = parseInt(document.getElementById('weekSelect').value);
    if (!weekNumber) {
        alert('Selecteer eerst een week');
        return;
    }
    await exportWeeklyScores(weekNumber);
}

// ── Hulpfuncties ──────────────────────────────
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

// ── Start ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', initDashboard);
