// ============================================
// FIREBASE CONFIGURATIE
// ============================================
// INSTRUCTIES:
// 1. Ga naar Firebase Console (console.firebase.google.com)
// 2. Maak een nieuw project aan
// 3. Voeg een Web App toe
// 4. Kopieer de config hieronder
// 5. Zet Firebase Authentication aan (Email/Password)
// 6. Zet Firestore Database aan (Europa regio!)
// 7. Zet Storage aan (voor video's indien nodig)
// ============================================

// FIREBASE CONFIG - VERVANG DIT MET JOUW EIGEN CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBzhjpGSnJiQ8Dz995pvVBT9EqnICqZ69Y",
  authDomain: "omtrek-en-oppervlakte.firebaseapp.com",
  projectId: "omtrek-en-oppervlakte",
  storageBucket: "omtrek-en-oppervlakte.firebasestorage.app",
  messagingSenderId: "295491045961",
  appId: "1:295491045961:web:3469783256e6b121d48d98"
};

// Initialize Firebase
let app, auth, db;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  // Zorg voor persistentie (blijf ingelogd)
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  
  console.log('✅ Firebase succesvol geïnitialiseerd');
} catch (error) {
  console.error('❌ Firebase initialisatie mislukt:', error);
}

// FIRESTORE DATABASE STRUCTUUR
// ============================================
// users/
//   {email}/
//     name: string
//     email: string
//     totalXP: number
//     currentLesson: string
//     badges: array
//     progress/
//       {lessonId}/
//         completed: boolean
//         lastAccessed: timestamp
//         parts/
//           {partId}/
//             attempts: number
//             letterScore: "A" | "B" | "C"
//             xp: number
//             completed: boolean
//             consecutiveCScores: number
//             feedback: string (optioneel)
//     weeklyProgress/
//       week-{N}/
//         targetLesson: string
//         deadlineReached: boolean
//         letterScore: "A" | "C" | "NI"
//         partsCompletedDuringWeek: number
//         timestamp: timestamp
//
// summary/
//   {email}/
//     name: string
//     currentLesson: string
//     totalXP: number
//     lastActive: timestamp
//     hasActiveAlerts: boolean
//     deadlineStatus: object
//
// extraAssignments/
//   {email}/
//     {lessonId}/
//       enabled: boolean
//       deadline: timestamp (optioneel)
// ============================================

// HELPER FUNCTIES VOOR DATABASE
const DB = {
  // USER OPERATIONS
  async getUser(email) {
    try {
      const doc = await db.collection('users').doc(email).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async createUser(email, name) {
    try {
      const userData = {
        name: name,
        email: email,
        totalXP: 0,
        currentLesson: 'les-1',
        badges: [],
        progress: {},
        weeklyProgress: {}
      };
      
      await db.collection('users').doc(email).set(userData);
      
      // Maak ook summary
      await db.collection('summary').doc(email).set({
        name: name,
        currentLesson: 'les-1',
        totalXP: 0,
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        hasActiveAlerts: false,
        deadlineStatus: {}
      });
      
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async updateUserProgress(email, lessonId, partId, progressData) {
    try {
      const updatePath = `progress.${lessonId}.parts.${partId}`;
      const update = {};
      
      Object.keys(progressData).forEach(key => {
        update[`${updatePath}.${key}`] = progressData[key];
      });
      
      // Update ook lastAccessed
      update[`progress.${lessonId}.lastAccessed`] = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(email).update(update);
      
      // Update summary
      await db.collection('summary').doc(email).update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  },

  async updateTotalXP(email, xpToAdd) {
    try {
      await db.collection('users').doc(email).update({
        totalXP: firebase.firestore.FieldValue.increment(xpToAdd)
      });
      
      await db.collection('summary').doc(email).update({
        totalXP: firebase.firestore.FieldValue.increment(xpToAdd)
      });
      
      return true;
    } catch (error) {
      console.error('Error updating XP:', error);
      return false;
    }
  },

  async updateCurrentLesson(email, lessonId) {
    try {
      await db.collection('users').doc(email).update({
        currentLesson: lessonId
      });
      
      await db.collection('summary').doc(email).update({
        currentLesson: lessonId
      });
      
      return true;
    } catch (error) {
      console.error('Error updating current lesson:', error);
      return false;
    }
  },

  async addBadge(email, badgeId) {
    try {
      await db.collection('users').doc(email).update({
        badges: firebase.firestore.FieldValue.arrayUnion(badgeId)
      });
      return true;
    } catch (error) {
      console.error('Error adding badge:', error);
      return false;
    }
  },

  // WEEKLY PROGRESS
  async updateWeeklyProgress(email, weekNumber, data) {
    try {
      const weekKey = `week-${weekNumber}`;
      const update = {
        [`weeklyProgress.${weekKey}`]: {
          ...data,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      };
      
      await db.collection('users').doc(email).update(update);
      
      // Update summary deadline status
      const summaryUpdate = {
        [`deadlineStatus.${weekKey}`]: data.letterScore
      };
      
      if (data.letterScore === 'C' || data.letterScore === 'NI') {
        summaryUpdate.hasActiveAlerts = true;
      }
      
      await db.collection('summary').doc(email).update(summaryUpdate);
      
      return true;
    } catch (error) {
      console.error('Error updating weekly progress:', error);
      return false;
    }
  },

  async incrementWeeklyParts(email, weekNumber) {
    try {
      const weekKey = `weeklyProgress.week-${weekNumber}.partsCompletedDuringWeek`;
      await db.collection('users').doc(email).update({
        [weekKey]: firebase.firestore.FieldValue.increment(1)
      });
      return true;
    } catch (error) {
      console.error('Error incrementing weekly parts:', error);
      return false;
    }
  },

  // ADMIN OPERATIONS
  async getAllSummaries() {
    try {
      const snapshot = await db.collection('summary').get();
      const summaries = [];
      snapshot.forEach(doc => {
        summaries.push({ email: doc.id, ...doc.data() });
      });
      return summaries;
    } catch (error) {
      console.error('Error getting summaries:', error);
      return [];
    }
  },

  async uploadStudents(studentsArray) {
    // studentsArray = [{email: "...", name: "..."}]
    try {
      const batch = db.batch();
      
      studentsArray.forEach(student => {
        const userRef = db.collection('users').doc(student.email);
        batch.set(userRef, {
          name: student.name,
          email: student.email,
          totalXP: 0,
          currentLesson: 'les-1',
          badges: [],
          progress: {},
          weeklyProgress: {}
        });
        
        const summaryRef = db.collection('summary').doc(student.email);
        batch.set(summaryRef, {
          name: student.name,
          currentLesson: 'les-1',
          totalXP: 0,
          lastActive: firebase.firestore.FieldValue.serverTimestamp(),
          hasActiveAlerts: false,
          deadlineStatus: {}
        });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error uploading students:', error);
      return false;
    }
  },

  async getExtraAssignments(email) {
    try {
      const doc = await db.collection('extraAssignments').doc(email).get();
      return doc.exists ? doc.data() : {};
    } catch (error) {
      console.error('Error getting extra assignments:', error);
      return {};
    }
  },

  async setExtraAssignment(email, lessonId, enabled, deadline = null) {
    try {
      const data = { enabled: enabled };
      if (deadline) data.deadline = deadline;
      
      await db.collection('extraAssignments').doc(email).set({
        [lessonId]: data
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error setting extra assignment:', error);
      return false;
    }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DB };
}
