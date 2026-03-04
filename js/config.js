// ============================================
// LEERPLATFORM CONFIGURATIE
// ============================================
// Dit bestand bevat alle statische configuratie:
// - Lessen en onderdelen
// - Deadlines
// - Badges
// ============================================

// LESSEN CONFIGURATIE
const LESSONS_CONFIG = {
  'les-1': {
    title: "Wat is omtrek en oppervlakte",
    order: 1,
    theorySection: "theorie-1",
    parts: [
      {
        id: 'part-1',
        type: 'video',
        title: 'Onderscheid tussen omtrek en oppervlakte',
        videoUrl: 'https://drive.google.com/file/d/1m3-Wj6J785Wk4wR6POz5G_2MPYkPoEsu/view?usp=drive_link', // Vul later in
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Theorie inprenten',
        exerciseType: 'formules-drill',  // ← Dit is belangrijk!
        xpReward: 0,
        passingCriteria: {
          scoreA: 100,
          scoreB: 66
        }
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Omtrek en oppervlakte in rooster',
        exerciseType: 'rooster-berekening',  // ← Nieuwe oefening!
        xpReward: 0,
        passingCriteria: {
          scoreA: 83,  // 5/6
          scoreB: 66   // 4/6
        }
      },
      {
        id: 'part-4',
        type: 'exercise',
        title: 'Kies: omtrek of oppervlakte',
        exerciseType: 'keuze-vraag',  // ← Nieuwe oefening!
        xpReward: 0,
        passingCriteria: {
          scoreA: 83,  // 5/6
          scoreB: 66   // 4/6
        }
      }
    ]
  },
  'les-2': {
    title: "Eenheden bij omtrek",
    order: 2,
    theorySection: "theorie-2",
    parts: [
      {
        id: 'part-1',
        type: 'video',
        title: 'Eenheden gebruiken bij omtrek',
        videoUrl: 'https://drive.google.com/file/d/1m3-Wj6J785Wk4wR6POz5G_2MPYkPoEsu/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Oefenen op eenheden en voorvoegsels',
        exerciseType: '2-2-eenheden-voorvoegsels',
        xpReward: 0,
        passingCriteria: {
          scoreA: 87.5,
          scoreB: 75
        }
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Juiste eenheid in concrete situaties',
        exerciseType: '2-3-eenheden-kiezen',
        xpReward: 0,
        passingCriteria: {
          scoreA: 87.5,
          scoreB: 68.75
        }
      },
      {
        id: 'part-4',
        type: 'video',
        title: 'Eenheden omzetten',
        videoUrl: 'https://drive.google.com/file/d/1m3-Wj6J785Wk4wR6POz5G_2MPYkPoEsu/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Eenheden omzetten oefenen',
        exerciseType: '2-5-eenheden-omzetten',
        xpReward: 0,
        passingCriteria: {
          scoreA: 85,
          scoreB: 0
        }
      },
      {
        id: 'part-6',
        type: 'video',
        title: 'Omtrek berekenen met eenheden',
        videoUrl: '',
        xpReward: 20
      },
      {
        id: 'part-7',
        type: 'exercise',
        title: 'Omtrek in rooster met eenheden',
        exerciseType: 'rooster-met-eenheden',
        xpReward: 50,
        passingCriteria: {
          minCorrect: 7,
          scoreA: 85,
          scoreB: 70
        }
      }
    ]
  },
  'les-3': {
    title: "Speciale omtrekken",
    order: 3,
    theorySection: "theorie-3",
    parts: [
      {
        id: 'part-1',
        type: 'video',
        title: 'Formules voor rechthoek, vierkant en ruit',
        videoUrl: '',
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Formules inprenten',
        exerciseType: 'formules-drill',
        xpReward: 30,
        passingCriteria: {
          allCorrect: true
        }
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Formules gebruiken',
        exerciseType: 'formules-toepassen',
        xpReward: 50,
        passingCriteria: {
          minCorrect: 7,
          scoreA: 90,
          scoreB: 75
        }
      },
      {
        id: 'part-4',
        type: 'video',
        title: 'Omtrek van een cirkel',
        videoUrl: '',
        xpReward: 20
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Omtrek van cirkel oefenen',
        exerciseType: 'cirkel-omtrek',
        xpReward: 50,
        passingCriteria: {
          minCorrect: 7,
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-6',
        type: 'exercise',
        title: 'Omtrek van vlakke figuren',
        exerciseType: 'gemengd-omtrek',
        xpReward: 60,
        passingCriteria: {
          minCorrect: 8,
          scoreA: 90,
          scoreB: 75
        }
      }
    ]
  },
  'les-4': {
    title: "Eenheden bij oppervlakte",
    order: 4,
    theorySection: "theorie-4",
    parts: [
      // Voeg later toe
    ]
  },
  'les-5': {
    title: "Oppervlakte van rechthoek, vierkant en parallellogram",
    order: 5,
    theorySection: "theorie-5",
    parts: [
      // Voeg later toe
    ]
  },
  'les-6': {
    title: "Oppervlakte van een driehoek",
    order: 6,
    theorySection: "theorie-6",
    parts: [
      // Voeg later toe
    ]
  },
  'les-7': {
    title: "Oppervlakte van een cirkel",
    order: 7,
    theorySection: "theorie-7",
    parts: [
      // Voeg later toe
    ]
  },
  'les-8': {
    title: "Oppervlakte van ruit en parallellogram",
    order: 8,
    theorySection: "theorie-8",
    parts: [
      // Voeg later toe
    ]
  },
  'les-9': {
    title: "Problemen oplossen met omtrek en oppervlakte",
    order: 9,
    theorySection: "theorie-9",
    parts: [
      // Voeg later toe
    ]
  },
  'les-10': {
    title: "Samengestelde vlakke figuren",
    order: 10,
    theorySection: "theorie-10",
    parts: [
      // Voeg later toe
    ]
  }
};

// DEADLINES CONFIGURATIE
// Pas deze aan per schooljaar/periode
const DEADLINES = [
  { 
    weekNumber: 1, 
    startDate: '2026-02-23',  // maandag
    endDate: '2026-03-02',    // zondag 23:59
    targetLesson: 'les-2' 
  },
  { 
    weekNumber: 2, 
    startDate: '2026-03-03', 
    endDate: '2026-03-09', 
    targetLesson: 'les-4' 
  },
  { 
    weekNumber: 3, 
    startDate: '2026-03-10', 
    endDate: '2026-03-16', 
    targetLesson: 'les-6' 
  },
  { 
    weekNumber: 4, 
    startDate: '2026-03-17', 
    endDate: '2026-03-23', 
    targetLesson: 'les-8' 
  },
  { 
    weekNumber: 5, 
    startDate: '2026-03-24', 
    endDate: '2026-03-30', 
    targetLesson: 'les-10' 
  }
];

// BADGES CONFIGURATIE
// Wekelijks aan te passen
const BADGES_CONFIG = {
  'week-1-speedster': {
    weekNumber: 1,
    title: 'Snelheidsduivel Week 1',
    description: 'Deadline gehaald op woensdag of eerder',
    icon: '⚡',
    criteria: {
      type: 'deadline-early',
      weekNumber: 1,
      beforeDay: 'wednesday'
    }
  },
  'week-1-perfect': {
    weekNumber: 1,
    title: 'Perfectionist Week 1',
    description: 'Alle onderdelen met score A',
    icon: '🌟',
    criteria: {
      type: 'all-A-scores',
      weekNumber: 1
    }
  }
  // Voeg wekelijks badges toe
};

// EXTRA LESSEN CONFIGURATIE
// Voor sterke of zwakke leerlingen
const EXTRA_LESSONS_CONFIG = {
  'extra-omtrek-basis': {
    title: "Extra oefeningen: Omtrek (basis)",
    difficulty: 'makkelijk',
    parts: [
      // Voeg later toe
    ]
  },
  'extra-omtrek-uitdaging': {
    title: "Extra oefeningen: Omtrek (uitdaging)",
    difficulty: 'moeilijk',
    parts: [
      // Voeg later toe
    ]
  }
};

// HELPER FUNCTIES
function getLessonById(lessonId) {
  return LESSONS_CONFIG[lessonId] || null;
}

function getAllLessons() {
  return Object.entries(LESSONS_CONFIG)
    .map(([id, lesson]) => ({ id, ...lesson }))
    .sort((a, b) => a.order - b.order);
}

function getPartById(lessonId, partId) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  return lesson.parts.find(p => p.id === partId) || null;
}

function getCurrentWeekDeadline() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return DEADLINES.find(deadline => {
    return today >= deadline.startDate && today <= deadline.endDate;
  }) || null;
}

function getDeadlineForLesson(lessonId) {
  return DEADLINES.find(d => d.targetLesson === lessonId) || null;
}

function getDaysUntilDeadline(deadline) {
  const now = new Date();
  const endDate = new Date(deadline.endDate + 'T23:59:59');
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getHoursUntilDeadline(deadline) {
  const now = new Date();
  const endDate = new Date(deadline.endDate + 'T23:59:59');
  const diffTime = endDate - now;
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  return diffHours;
}

// Export voor gebruik in andere bestanden
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LESSONS_CONFIG,
    DEADLINES,
    BADGES_CONFIG,
    EXTRA_LESSONS_CONFIG,
    getLessonById,
    getAllLessons,
    getPartById,
    getCurrentWeekDeadline,
    getDeadlineForLesson,
    getDaysUntilDeadline,
    getHoursUntilDeadline
  };
}
