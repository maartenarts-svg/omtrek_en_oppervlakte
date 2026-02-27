// ============================================
// PROGRESS TRACKING LOGICA
// ============================================

// Lokale cache voor performance
let localProgressCache = {};

// Initialize cache from localStorage
function initProgressCache() {
    const cached = localStorage.getItem('progressCache');
    if (cached) {
        localProgressCache = JSON.parse(cached);
    }
}

// Save cache to localStorage
function saveProgressCache() {
    localStorage.setItem('progressCache', JSON.stringify(localProgressCache));
}

// Get cached progress
function getCachedProgress(lessonId, partId) {
    return localProgressCache[`${lessonId}-${partId}`] || null;
}

// Update local cache
function updateLocalCache(lessonId, partId, data) {
    localProgressCache[`${lessonId}-${partId}`] = {
        ...data,
        timestamp: Date.now()
    };
    saveProgressCache();
}

// Clear cache (bijv. bij logout)
function clearProgressCache() {
    localProgressCache = {};
    localStorage.removeItem('progressCache');
}

// ============================================
// PART COMPLETION
// ============================================

async function completePart(lessonId, partId, result) {
    /*
    result = {
        score: number (0-100),
        correctAnswers: number,
        totalQuestions: number,
        xpEarned: number,
        feedback: string (optioneel)
    }
    */
    
    const user = getCurrentUser();
    if (!user) return false;
    
    try {
        // Calculate letter score
        const lesson = getLessonById(lessonId);
        const part = getPartById(lessonId, partId);
        if (!lesson || !part) return false;
        
        const letterScore = calculateLetterScore(result.score, part.passingCriteria);
        
        // Get current progress for this part
        const userData = await DB.getUser(user.email);
        const currentPartProgress = userData?.progress?.[lessonId]?.parts?.[partId] || {};
        const previousAttempts = currentPartProgress.attempts || 0;
        const previousCScores = currentPartProgress.consecutiveCScores || 0;
        
        // Update consecutive C scores
        let newConsecutiveCScores = 0;
        if (letterScore === 'C') {
            newConsecutiveCScores = previousCScores + 1;
        }
        
        // Check if we need to create alert
        if (newConsecutiveCScores >= 3) {
            await createAlert(user.email, lessonId, partId, 'consecutive-c-scores');
        }
        
        // Prepare progress data
        const progressData = {
            attempts: previousAttempts + 1,
            letterScore: letterScore,
            xp: result.xpEarned,
            completed: letterScore === 'A' || letterScore === 'B',
            consecutiveCScores: newConsecutiveCScores,
            lastAttempt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (result.feedback) {
            progressData.feedback = result.feedback;
        }
        
        // Update Firebase
        await DB.updateUserProgress(user.email, lessonId, partId, progressData);
        
        // Update XP
        await DB.updateTotalXP(user.email, result.xpEarned);
        
        // Update local cache
        updateLocalCache(lessonId, partId, progressData);
        
        // Check if lesson is complete
        await checkLessonCompletion(lessonId);
        
        // Update weekly progress
        const currentWeek = getCurrentWeekDeadline();
        if (currentWeek) {
            await DB.incrementWeeklyParts(user.email, currentWeek.weekNumber);
            
            // Check if deadline reached
            if (lessonId === currentWeek.targetLesson && progressData.completed) {
                await checkDeadlineReached(currentWeek);
            }
        }
        
        return {
            success: true,
            letterScore: letterScore,
            canProceed: progressData.completed,
            xpEarned: result.xpEarned
        };
        
    } catch (error) {
        console.error('Error completing part:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// LETTER SCORE CALCULATION
// ============================================

function calculateLetterScore(score, criteria) {
    /*
    criteria = {
        scoreA: 90,
        scoreB: 70,
        minCorrect: 7,
        allCorrect: true (optioneel)
    }
    */
    
    if (!criteria) return 'B'; // Default
    
    if (criteria.allCorrect && score < 100) {
        return 'C';
    }
    
    if (score >= criteria.scoreA) {
        return 'A';
    } else if (score >= criteria.scoreB) {
        return 'B';
    } else {
        return 'C';
    }
}

// ============================================
// LESSON COMPLETION
// ============================================

async function checkLessonCompletion(lessonId) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const userData = await DB.getUser(user.email);
        const lesson = getLessonById(lessonId);
        if (!lesson) return;
        
        const lessonProgress = userData.progress?.[lessonId];
        if (!lessonProgress) return;
        
        // Check if all parts are completed
        const allPartsComplete = lesson.parts.every(part => 
            lessonProgress.parts?.[part.id]?.completed === true
        );
        
        if (allPartsComplete && !lessonProgress.completed) {
            // Mark lesson as complete
            await db.collection('users').doc(user.email).update({
                [`progress.${lessonId}.completed`]: true,
                [`progress.${lessonId}.completedAt`]: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update current lesson to next lesson
            const allLessons = getAllLessons();
            const currentIndex = allLessons.findIndex(l => l.id === lessonId);
            if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
                const nextLesson = allLessons[currentIndex + 1];
                await DB.updateCurrentLesson(user.email, nextLesson.id);
            }
            
            // Check for badges
            await checkBadges(lessonId);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking lesson completion:', error);
        return false;
    }
}

// ============================================
// ALERTS
// ============================================

async function createAlert(studentEmail, lessonId, partId, type) {
    try {
        const alertId = `${studentEmail}-${lessonId}-${partId}-${Date.now()}`;
        
        await db.collection('alerts').doc(alertId).set({
            studentEmail: studentEmail,
            lessonId: lessonId,
            partId: partId,
            type: type,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            resolved: false
        });
        
        // Update summary
        await db.collection('summary').doc(studentEmail).update({
            hasActiveAlerts: true
        });
        
        return true;
    } catch (error) {
        console.error('Error creating alert:', error);
        return false;
    }
}

async function resolveAlert(alertId) {
    try {
        await db.collection('alerts').doc(alertId).update({
            resolved: true,
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error resolving alert:', error);
        return false;
    }
}

// ============================================
// BADGES
// ============================================

async function checkBadges(lessonId) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const userData = await DB.getUser(user.email);
        const currentWeek = getCurrentWeekDeadline();
        if (!currentWeek) return;
        
        // Check relevant badges for this week
        const weekBadges = Object.entries(BADGES_CONFIG)
            .filter(([id, badge]) => badge.weekNumber === currentWeek.weekNumber);
        
        for (let [badgeId, badgeConfig] of weekBadges) {
            // Check if already earned
            if (userData.badges?.includes(badgeId)) continue;
            
            // Check criteria
            const earned = await checkBadgeCriteria(badgeConfig, userData, lessonId);
            
            if (earned) {
                await DB.addBadge(user.email, badgeId);
                showBadgeEarnedNotification(badgeConfig);
            }
        }
        
    } catch (error) {
        console.error('Error checking badges:', error);
    }
}

async function checkBadgeCriteria(badgeConfig, userData, lessonId) {
    const criteria = badgeConfig.criteria;
    
    switch (criteria.type) {
        case 'deadline-early':
            // Check if deadline reached early (before specified day)
            const currentWeek = getCurrentWeekDeadline();
            if (!currentWeek || currentWeek.weekNumber !== criteria.weekNumber) return false;
            
            const weekProgress = userData.weeklyProgress?.[`week-${criteria.weekNumber}`];
            if (!weekProgress?.deadlineReached) return false;
            
            // Check if reached before specified day
            const targetDay = criteria.beforeDay; // e.g., 'wednesday'
            // Implementation zou hier checken tegen timestamp
            return true; // Simplified
            
        case 'all-A-scores':
            // Check if all parts in target lessons have score A
            const weekDeadline = DEADLINES.find(d => d.weekNumber === criteria.weekNumber);
            if (!weekDeadline) return false;
            
            const targetLessonOrder = getLessonById(weekDeadline.targetLesson)?.order || 0;
            const lessonsToCheck = getAllLessons().filter(l => l.order <= targetLessonOrder);
            
            return lessonsToCheck.every(lesson => {
                const lessonProgress = userData.progress?.[lesson.id];
                if (!lessonProgress) return false;
                
                return lesson.parts.every(part => 
                    lessonProgress.parts?.[part.id]?.letterScore === 'A'
                );
            });
            
        default:
            return false;
    }
}

function showBadgeEarnedNotification(badgeConfig) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-notification-content">
            <div class="badge-icon-large">${badgeConfig.icon}</div>
            <h3>Badge verdiend!</h3>
            <p>${badgeConfig.title}</p>
            <p class="badge-description">${badgeConfig.description}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================
// XP ANIMATION
// ============================================

function animateXPGain(amount, element) {
    if (!element) return;
    
    const currentXP = parseInt(element.textContent) || 0;
    const targetXP = currentXP + amount;
    
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = amount / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const newXP = Math.min(currentXP + (increment * currentStep), targetXP);
        element.textContent = Math.round(newXP);
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = targetXP;
        }
    }, stepDuration);
    
    // Add pulse animation
    element.parentElement?.classList.add('xp-pulse');
    setTimeout(() => {
        element.parentElement?.classList.remove('xp-pulse');
    }, 1000);
}

// ============================================
// EXPORT FUNCTIES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initProgressCache,
        completePart,
        calculateLetterScore,
        checkLessonCompletion,
        createAlert,
        resolveAlert,
        checkBadges,
        animateXPGain
    };
}
