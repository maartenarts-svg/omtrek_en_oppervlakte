// ============================================
// DEADLINES LOGICA
// ============================================

// Check if we need to evaluate last week's deadline
async function evaluateLastWeek() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const userData = await DB.getUser(user.email);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Find last week's deadline
        const lastWeek = DEADLINES
            .filter(d => d.endDate < today)
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
        
        if (!lastWeek) return;
        
        const weekKey = `week-${lastWeek.weekNumber}`;
        const weekProgress = userData.weeklyProgress?.[weekKey];
        
        // If already evaluated, skip
        if (weekProgress?.letterScore) return;
        
        // Evaluate the week
        let letterScore;
        const targetLesson = lastWeek.targetLesson;
        const lessonProgress = userData.progress?.[targetLesson];
        
        // Check if deadline was reached
        if (lessonProgress?.completed) {
            letterScore = 'A';
        } else {
            // Check if student worked that week
            const partsCompleted = weekProgress?.partsCompletedDuringWeek || 0;
            
            if (partsCompleted === 0) {
                letterScore = 'NI'; // Niet ingediend
            } else {
                letterScore = 'C'; // Gewerkt maar niet gehaald
            }
        }
        
        // Save to database
        await DB.updateWeeklyProgress(user.email, lastWeek.weekNumber, {
            targetLesson: targetLesson,
            deadlineReached: letterScore === 'A',
            letterScore: letterScore,
            partsCompletedDuringWeek: weekProgress?.partsCompletedDuringWeek || 0
        });
        
        // Show notification to student
        if (letterScore !== 'A') {
            showMissedDeadlineNotification(lastWeek, letterScore);
        }
        
    } catch (error) {
        console.error('Error evaluating last week:', error);
    }
}

// Check if current lesson completion means deadline is reached
async function checkDeadlineReached(deadline) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const userData = await DB.getUser(user.email);
        const lessonProgress = userData.progress?.[deadline.targetLesson];
        
        if (lessonProgress?.completed) {
            // Update weekly progress
            await DB.updateWeeklyProgress(user.email, deadline.weekNumber, {
                targetLesson: deadline.targetLesson,
                deadlineReached: true,
                letterScore: 'A',
                partsCompletedDuringWeek: userData.weeklyProgress?.[`week-${deadline.weekNumber}`]?.partsCompletedDuringWeek || 0
            });
            
            // Show congratulations
            showDeadlineReachedNotification(deadline);
            
            // Check for early completion badge
            await checkEarlyCompletionBadge(deadline);
        }
        
    } catch (error) {
        console.error('Error checking deadline reached:', error);
    }
}

// Show notification when deadline is reached
function showDeadlineReachedNotification(deadline) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success deadline-notification';
    notification.innerHTML = `
        <h3>🎉 Deadline behaald!</h3>
        <p>Gefeliciteerd! Je hebt de deadline van week ${deadline.weekNumber} gehaald.</p>
        <p>Je krijgt een <strong>A</strong> voor deze week.</p>
    `;
    
    const container = document.getElementById('deadlineNotification');
    if (container) {
        container.innerHTML = '';
        container.appendChild(notification);
        container.classList.remove('hidden');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            container.classList.add('hidden');
        }, 10000);
    }
}

// Show notification when deadline is missed
function showMissedDeadlineNotification(deadline, letterScore) {
    const notification = document.createElement('div');
    notification.className = letterScore === 'NI' ? 'alert alert-danger' : 'alert alert-warning';
    
    let message = '';
    if (letterScore === 'NI') {
        message = `
            <h3>⚠️ Deadline gemist</h3>
            <p>Je hebt de deadline van week ${deadline.weekNumber} niet gehaald.</p>
            <p>Je hebt die week ook niet aan de lessen gewerkt.</p>
            <p>Je krijgt een <strong>NI (Niet Ingediend)</strong> voor deze week.</p>
            <p><strong>Let op:</strong> Werk dit nu af én zorg dat je de deadline van deze week wel haalt!</p>
        `;
    } else {
        message = `
            <h3>📚 Deadline niet gehaald</h3>
            <p>Je hebt de deadline van week ${deadline.weekNumber} niet volledig gehaald.</p>
            <p>Je hebt wel gewerkt die week, maar de target-les niet afgerond.</p>
            <p>Je krijgt een <strong>C</strong> voor deze week.</p>
            <p><strong>Tip:</strong> Werk dit nu af én blijf bijwerken zodat je de volgende deadline wel haalt!</p>
        `;
    }
    
    notification.innerHTML = message;
    
    const container = document.getElementById('deadlineNotification');
    if (container) {
        container.innerHTML = '';
        container.appendChild(notification);
        container.classList.remove('hidden');
    }
}

// Show current week's deadline info
function showDeadlineNotification(deadline) {
    const daysLeft = getDaysUntilDeadline(deadline);
    const hoursLeft = getHoursUntilDeadline(deadline);
    
    if (daysLeft < 0) return; // Deadline verstreken
    
    let message = '';
    let alertClass = 'alert-info';
    
    if (daysLeft === 0) {
        message = `⏰ <strong>Laatste dag!</strong> Je hebt nog ${hoursLeft} uur om de deadline van week ${deadline.weekNumber} te halen.`;
        alertClass = 'alert-danger';
    } else if (daysLeft === 1) {
        message = `⏰ <strong>Nog 1 dag!</strong> Deadline week ${deadline.weekNumber} eindigt morgen om 23:59.`;
        alertClass = 'alert-warning';
    } else if (daysLeft <= 3) {
        message = `📅 Je hebt nog ${daysLeft} dagen voor de deadline van week ${deadline.weekNumber}.`;
        alertClass = 'alert-warning';
    }
    
    if (message) {
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass}`;
        notification.innerHTML = message;
        
        const container = document.getElementById('deadlineNotification');
        if (container) {
            container.innerHTML = '';
            container.appendChild(notification);
            container.classList.remove('hidden');
        }
    }
}

// Check for early completion badge
async function checkEarlyCompletionBadge(deadline) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 3 = Wednesday
        
        // Check badges for this week
        const weekBadges = Object.entries(BADGES_CONFIG)
            .filter(([id, badge]) => 
                badge.weekNumber === deadline.weekNumber && 
                badge.criteria?.type === 'deadline-early'
            );
        
        for (let [badgeId, badgeConfig] of weekBadges) {
            const targetDay = badgeConfig.criteria.beforeDay;
            let targetDayNum = 3; // Default Wednesday
            
            if (targetDay === 'monday') targetDayNum = 1;
            if (targetDay === 'tuesday') targetDayNum = 2;
            if (targetDay === 'wednesday') targetDayNum = 3;
            if (targetDay === 'thursday') targetDayNum = 4;
            
            if (dayOfWeek <= targetDayNum) {
                await DB.addBadge(user.email, badgeId);
                showBadgeEarnedNotification(badgeConfig);
            }
        }
        
    } catch (error) {
        console.error('Error checking early completion badge:', error);
    }
}

// Get deadline status color for visualization
function getDeadlineStatusColor(deadline, isReached) {
    if (isReached) return 'var(--color-success)';
    
    const daysLeft = getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) return '#999'; // Verstreken
    if (daysLeft === 0) return 'var(--color-danger)';
    if (daysLeft <= 2) return 'var(--color-warning)';
    
    return 'var(--color-primary)';
}

// Format deadline countdown text
function formatDeadlineCountdown(deadline) {
    const daysLeft = getDaysUntilDeadline(deadline);
    const hoursLeft = getHoursUntilDeadline(deadline);
    
    if (daysLeft < 0) {
        return 'Verstreken';
    } else if (daysLeft === 0) {
        return `Nog ${hoursLeft}u`;
    } else if (daysLeft === 1) {
        return `Nog 1 dag`;
    } else {
        return `Nog ${daysLeft} dagen`;
    }
}

// ============================================
// ADMIN FUNCTIONS (voor dashboard)
// ============================================

async function getWeeklyScoresForAllStudents(weekNumber) {
    try {
        const summaries = await DB.getAllSummaries();
        
        return summaries.map(summary => {
            const weekKey = `week-${weekNumber}`;
            const score = summary.deadlineStatus?.[weekKey] || 'Nog niet beoordeeld';
            
            return {
                email: summary.email,
                name: summary.name,
                score: score,
                currentLesson: summary.currentLesson
            };
        });
        
    } catch (error) {
        console.error('Error getting weekly scores:', error);
        return [];
    }
}

async function exportWeeklyScores(weekNumber) {
    const scores = await getWeeklyScoresForAllStudents(weekNumber);
    
    // Create CSV
    let csv = 'Naam,Email,Score Week ' + weekNumber + ',Huidige Les\n';
    
    scores.forEach(student => {
        csv += `"${student.name}","${student.email}","${student.score}","${student.currentLesson}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `week-${weekNumber}-scores.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        evaluateLastWeek,
        checkDeadlineReached,
        showDeadlineNotification,
        getDeadlineStatusColor,
        formatDeadlineCountdown,
        getWeeklyScoresForAllStudents,
        exportWeeklyScores
    };
}
