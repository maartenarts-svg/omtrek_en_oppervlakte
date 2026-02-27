// ============================================
// DASHBOARD LOGICA
// ============================================

let allStudents = [];
let allAlerts = [];
let csvData = [];

// Initialize dashboard
async function initDashboard() {
    // Check admin auth
    const user = checkAuth();
    if (!user || !user.isAdmin) {
        alert('Toegang geweigerd');
        logout();
        return;
    }
    
    // Load data
    await loadAllData();
    
    // Setup tabs
    setupTabs();
    
    // Setup dropdowns
    populateDropdowns();
    
    // Render overview
    renderOverview();
}

async function loadAllData() {
    try {
        // Load all student summaries
        allStudents = await DB.getAllSummaries();
        
        // Load all alerts
        const alertsSnapshot = await db.collection('alerts')
            .where('resolved', '==', false)
            .get();
        
        allAlerts = [];
        alertsSnapshot.forEach(doc => {
            allAlerts.push({ id: doc.id, ...doc.data() });
        });
        
        // Update stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Fout bij laden van gegevens');
    }
}

function updateDashboardStats() {
    // Total students
    document.getElementById('totalStudents').textContent = allStudents.length;
    
    // Active alerts
    document.getElementById('activeAlerts').textContent = allAlerts.length;
    
    // Completed this week
    const currentWeek = getCurrentWeekDeadline();
    if (currentWeek) {
        const weekKey = `week-${currentWeek.weekNumber}`;
        const completed = allStudents.filter(s => 
            s.deadlineStatus?.[weekKey] === 'A'
        ).length;
        document.getElementById('completedThisWeek').textContent = completed;
    }
    
    // Average progress
    const allLessons = getAllLessons();
    const avgProgress = allStudents.reduce((sum, student) => {
        const lessonOrder = getLessonById(student.currentLesson)?.order || 0;
        return sum + (lessonOrder / allLessons.length * 100);
    }, 0) / allStudents.length;
    
    document.getElementById('avgProgress').textContent = Math.round(avgProgress) + '%';
}

// ============================================
// TABS
// ============================================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Render tab content
    switch(tabName) {
        case 'overview':
            renderOverview();
            break;
        case 'alerts':
            renderAlerts();
            break;
        case 'students':
            renderStudentsTab();
            break;
        case 'deadlines':
            renderDeadlinesTab();
            break;
        case 'settings':
            renderSettingsTab();
            break;
    }
}

// ============================================
// OVERVIEW TAB
// ============================================

function renderOverview() {
    const grid = document.getElementById('studentsGrid');
    grid.innerHTML = '';
    
    if (allStudents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>Nog geen leerlingen toegevoegd</p>
                <button class="btn btn-primary" onclick="switchTab('students')">
                    Leerlingen toevoegen
                </button>
            </div>
        `;
        return;
    }
    
    allStudents.forEach(student => {
        const studentAlerts = allAlerts.filter(a => a.studentEmail === student.email);
        const hasAlerts = studentAlerts.length > 0;
        
        const card = document.createElement('div');
        card.className = `student-card ${hasAlerts ? 'has-alert' : ''}`;
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
                    <div class="student-stat-value">${hasAlerts ? studentAlerts.length : '✓'}</div>
                    <div class="student-stat-label">${hasAlerts ? 'Alerts' : 'OK'}</div>
                </div>
            </div>
            ${hasAlerts ? `<div class="alert-badge">${studentAlerts.length}</div>` : ''}
        `;
        
        grid.appendChild(card);
    });
}

// ============================================
// ALERTS TAB
// ============================================

function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
    if (allAlerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <p>Geen actieve alerts</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    const sortedAlerts = [...allAlerts].sort((a, b) => 
        (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
    );
    
    sortedAlerts.forEach(alert => {
        const student = allStudents.find(s => s.email === alert.studentEmail);
        if (!student) return;
        
        const lesson = getLessonById(alert.lessonId);
        const part = getPartById(alert.lessonId, alert.partId);
        
        const alertEl = document.createElement('div');
        alertEl.className = 'alert-item';
        alertEl.innerHTML = `
            <div class="alert-header">
                <div>
                    <div class="alert-student">${student.name}</div>
                    <div class="alert-time">${formatTimestamp(alert.timestamp)}</div>
                </div>
            </div>
            <div class="alert-details">
                <strong>${lesson?.title || 'Onbekende les'}</strong> - ${part?.title || 'Onbekend onderdeel'}<br>
                ${getAlertMessage(alert)}
            </div>
            <div class="alert-actions">
                <button class="btn btn-primary btn-small" onclick="viewStudentDetails('${alert.studentEmail}')">
                    Bekijk leerling
                </button>
                <button class="btn btn-secondary btn-small" onclick="resolveAlertItem('${alert.id}')">
                    Markeer als opgelost
                </button>
            </div>
        `;
        
        alertsList.appendChild(alertEl);
    });
}

function getAlertMessage(alert) {
    if (alert.type === 'consecutive-c-scores') {
        return '⚠️ Leerling heeft 3 of meer keer achter elkaar een C-score gehaald op dit onderdeel';
    }
    return 'Alert';
}

function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.seconds) return 'Onbekend';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

async function resolveAlertItem(alertId) {
    if (!confirm('Alert markeren als opgelost?')) return;
    
    const success = await resolveAlert(alertId);
    if (success) {
        await loadAllData();
        renderAlerts();
    }
}

// ============================================
// STUDENTS TAB
// ============================================

function renderStudentsTab() {
    // Populate student dropdown
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- Kies een leerling --</option>';
    
    allStudents.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => {
        const option = document.createElement('option');
        option.value = student.email;
        option.textContent = student.name;
        select.appendChild(option);
    });
    
    // Setup change handler
    select.onchange = (e) => {
        if (e.target.value) {
            viewStudentDetails(e.target.value);
        } else {
            document.getElementById('studentDetails').classList.add('hidden');
        }
    };
}

async function viewStudentDetails(email) {
    // Switch to students tab if not already there
    switchTab('students');
    
    // Set dropdown
    document.getElementById('studentSelect').value = email;
    
    // Load full student data
    const userData = await DB.getUser(email);
    if (!userData) return;
    
    const student = allStudents.find(s => s.email === email);
    const detailsContainer = document.getElementById('studentDetails');
    detailsContainer.classList.remove('hidden');
    
    // Render details
    detailsContainer.innerHTML = `
        <div class="student-detail-header">
            <div class="student-detail-info">
                <h2>${student.name}</h2>
                <p>${email}</p>
                <p>Totaal XP: ${userData.totalXP || 0}</p>
            </div>
            <div class="student-detail-actions">
                <button class="btn btn-secondary" onclick="window.open('overview.html?student=${email}', '_blank')">
                    📊 Bekijk als leerling
                </button>
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
        </table>
    `;
}

function renderStudentProgress(userData) {
    const allLessons = getAllLessons();
    let html = '';
    
    allLessons.forEach(lesson => {
        const lessonProgress = userData.progress?.[lesson.id];
        const parts = lesson.parts || [];
        const completedParts = parts.filter(p => 
            lessonProgress?.parts?.[p.id]?.completed
        ).length;
        
        const totalXP = Object.values(lessonProgress?.parts || {})
            .reduce((sum, part) => sum + (part.xp || 0), 0);
        
        const status = lessonProgress?.completed ? 
            '<span class="badge badge-success">✓ Voltooid</span>' :
            userData.currentLesson === lesson.id ?
            '<span class="badge badge-info">Bezig</span>' :
            '<span class="badge">Te doen</span>';
        
        html += `
            <tr>
                <td><strong>${lesson.order}</strong></td>
                <td>${lesson.title}</td>
                <td>${completedParts}/${parts.length}</td>
                <td>${totalXP} XP</td>
                <td>${status}</td>
            </tr>
        `;
    });
    
    return html;
}

// ============================================
// DEADLINES TAB
// ============================================

function renderDeadlinesTab() {
    const select = document.getElementById('weekSelect');
    select.innerHTML = '<option value="">-- Kies een week --</option>';
    
    DEADLINES.forEach(deadline => {
        const option = document.createElement('option');
        option.value = deadline.weekNumber;
        option.textContent = `Week ${deadline.weekNumber} (t/m ${formatDate(deadline.endDate)})`;
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

async function showWeekScores(weekNumber) {
    const scores = await getWeeklyScoresForAllStudents(weekNumber);
    const container = document.getElementById('weekScores');
    container.classList.remove('hidden');
    
    let html = `
        <h3>Scores Week ${weekNumber}</h3>
        <table class="week-scores-table">
            <thead>
                <tr>
                    <th>Naam</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Huidige Les</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    scores.forEach(student => {
        const scoreClass = student.score === 'A' ? 'score-A' : 
                          student.score === 'C' ? 'score-C' :
                          student.score === 'NI' ? 'score-NI' : '';
        
        html += `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td><span class="score-badge ${scoreClass}">${student.score}</span></td>
                <td>${student.currentLesson}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function exportSelectedWeek() {
    const weekNumber = parseInt(document.getElementById('weekSelect').value);
    if (!weekNumber) {
        alert('Selecteer eerst een week');
        return;
    }
    
    await exportWeeklyScores(weekNumber);
}

// ============================================
// SETTINGS TAB
// ============================================

function renderSettingsTab() {
    // Populate student dropdown
    const select = document.getElementById('extraAssignStudent');
    select.innerHTML = '<option value="">-- Kies een leerling --</option>';
    
    allStudents.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => {
        const option = document.createElement('option');
        option.value = student.email;
        option.textContent = student.name;
        select.appendChild(option);
    });
    
    // Populate lesson dropdown
    const lessonSelect = document.getElementById('extraAssignLesson');
    lessonSelect.innerHTML = '<option value="">-- Kies een les --</option>';
    
    Object.entries(EXTRA_LESSONS_CONFIG).forEach(([id, lesson]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = lesson.title;
        lessonSelect.appendChild(option);
    });
}

async function assignExtraLesson() {
    const studentEmail = document.getElementById('extraAssignStudent').value;
    const lessonId = document.getElementById('extraAssignLesson').value;
    const deadline = document.getElementById('extraAssignDeadline').value;
    
    if (!studentEmail || !lessonId) {
        alert('Selecteer een leerling en een les');
        return;
    }
    
    const deadlineTimestamp = deadline ? new Date(deadline).getTime() : null;
    
    const success = await DB.setExtraAssignment(studentEmail, lessonId, true, deadlineTimestamp);
    
    if (success) {
        alert('Extra opdracht toegewezen!');
        // Reset form
        document.getElementById('extraAssignStudent').value = '';
        document.getElementById('extraAssignLesson').value = '';
        document.getElementById('extraAssignDeadline').value = '';
    } else {
        alert('Fout bij toewijzen');
    }
}

// ============================================
// CSV UPLOAD
// ============================================

function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
    
    // Setup file input
    document.getElementById('csvFile').onchange = handleCSVFile;
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('csvFile').value = '';
    document.getElementById('csvPreview').innerHTML = '';
    csvData = [];
}

function handleCSVFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    csvData = [];
    
    let preview = '<strong>Preview:</strong><br>';
    
    lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        
        const [email, name] = line.split(',').map(s => s.trim().replace(/['"]/g, ''));
        
        if (email && name) {
            csvData.push({ email, name });
            preview += `${name} (${email})<br>`;
        }
    });
    
    preview += `<br><strong>Totaal: ${csvData.length} leerlingen</strong>`;
    
    document.getElementById('csvPreview').innerHTML = preview;
}

async function uploadStudents() {
    if (csvData.length === 0) {
        alert('Geen geldige data gevonden in CSV');
        return;
    }
    
    if (!confirm(`${csvData.length} leerlingen uploaden?`)) return;
    
    const success = await DB.uploadStudents(csvData);
    
    if (success) {
        alert('Leerlingen succesvol toegevoegd!');
        closeUploadModal();
        await loadAllData();
        renderOverview();
    } else {
        alert('Fout bij uploaden');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function populateDropdowns() {
    // All dropdowns are populated in their respective tab render functions
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);
