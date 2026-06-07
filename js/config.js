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
        videoUrl: 'https://drive.google.com/file/d/1HPX3nL7WQTONeg70IiWc5ECFi_-zO_Jz/view?usp=drive_link', // Vul later in
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
        videoUrl: 'https://drive.google.com/file/d/1OJdcpEnGE4R4RzuyUtl2mj1yqo7wCoeV/view?usp=drive_link',
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
        videoUrl: 'https://drive.google.com/file/d/15_pvDFXe5kwFVyR49gNuu_Kme3BIi2mF/view?usp=drive_link',
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
        type: 'exercise',
        title: 'Eenheden omzetten oefenen',
        exerciseType: '2-6-eenheden-omzetten-oefenen',
        xpReward: 0,
        passingCriteria: {
          scoreA: 81.25,
          scoreB: 62.5
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
        videoUrl: 'https://drive.google.com/file/d/1V3mf1gJVTE4-lDC858sSw7x1KcNzoBud/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Formules inprenten',
        exerciseType: '3-2-formules-drill',
        xpReward: 30,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Formules gebruiken',
        exerciseType: '3-3-formules-gebruiken',
        xpReward: 50,
        passingCriteria: {
          scoreA: 80,
          scoreB: 60
        }
      },
      {
        id: 'part-4',
        type: 'video',
        title: 'Omtrek van een cirkel',
        videoUrl: 'https://drive.google.com/file/d/1AHO0qsDX-wYQo4-bpiKfjJ96-jDCBtcp/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Formules inprenten: cirkelomtrek',
        exerciseType: '3-5-cirkel-omtrek',
        xpReward: 50,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-6',
        type: 'exercise',
        title: 'Omtrek van vlakke figuren',
        exerciseType: '3-6-gemengd-omtrek',
        xpReward: 60,
        passingCriteria: {
          scoreA: 80,
          scoreB: 60
        }
      }
    ]
  },
  'les-4': {
    title: "Eenheden bij oppervlakte",
    order: 4,
    theorySection: "theorie-4",
    parts: [
      {
        id: 'part-1',
        type: 'video',
        title: 'Eenheden gebruiken bij oppervlakte',
        videoUrl: 'https://drive.google.com/file/d/1TCZB9upNzj9bSi-J0qNk4nOol3JgNplh/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Oefenen op eenheden en voorvoegsels',
        exerciseType: '4-2-eenheden-voorvoegsels',
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
        exerciseType: '4-3-eenheden-kiezen',
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
        videoUrl: 'https://drive.google.com/file/d/1gfc4KzKKMpX9R4JhqmoZ621wO0A23goJ/view?usp=drive_link', // Vul later in
        xpReward: 20
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Eenheden omzetten oefenen',
        exerciseType: '4-5-eenheden-omzetten',
        xpReward: 0,
        passingCriteria: {
          scoreA: 85,
          scoreB: 0
        }
      },
      {
        id: 'part-6',
        type: 'exercise',
        title: 'Eenheden omzetten oefenen',
        exerciseType: '4-6-eenheden-omzetten-oefenen',
        xpReward: 0,
        passingCriteria: {
          scoreA: 81.25,
          scoreB: 62.5
        }
      }
    ]
  },
  'les-5': {
    title: "Oppervlakte van rechthoek, vierkant en parallellogram",
    order: 5,
    theorySection: "theorie-5",
    parts: [
      {
        id: 'part-1',
        type: 'exercise',
        title: 'Instap: oppervlakte tellen en berekenen',
        exerciseType: '5-1-instap-oppervlakte',
        xpReward: 40,
        passingCriteria: {
          scoreA: 100,
          scoreB: 75
        }
      },
      {
        id: 'part-2',
        type: 'video',
        title: 'Oppervlakte van rechthoek en vierkant',
        videoUrl: 'https://drive.google.com/file/d/1vIzbgmg_p3VzmPJ2J8KeYfnWxMWJCdYK/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Formules inprenten',
        exerciseType: '5-3-formules-drill',
        xpReward: 50,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-4',
        type: 'exercise',
        title: 'Oppervlakte berekenen',
        exerciseType: '5-4-oppervlakte-rechthoek',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Instap: oppervlakte parallellogram',
        exerciseType: '5-5-instap-parallellogram',
        xpReward: 50,
        passingCriteria: {
          scoreA: 75,
          scoreB: 50
        }
      },
      {
        id: 'part-6',
        type: 'video',
        title: 'Oppervlakte van een parallellogram',
        videoUrl: 'https://drive.google.com/file/d/1qBgc5eJObLwP0lRFA7XEpEiOjEoprICx/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-7',
        type: 'exercise',
        title: 'Hoogte van een parallellogram herkennen',
        exerciseType: '5-7-hoogte-parallellogram',
        xpReward: 50,
        passingCriteria: {
          scoreA: 88,
          scoreB: 75
        }
      },
      {
        id: 'part-8',
        type: 'exercise',
        title: 'Formules inprenten: parallellogram',
        exerciseType: '5-8-formules-drill',
        xpReward: 50,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-9',
        type: 'exercise',
        title: 'Oppervlakte berekenen: parallellogram',
        exerciseType: '5-9-oppervlakte-parallellogram',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-10',
        type: 'exercise',
        title: 'Gemengd: omtrek en oppervlakte parallellogram',
        exerciseType: '5-10-parallellogram-gemengd',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-11',
        type: 'exercise',
        title: 'Alles gemengd: omtrek en oppervlakte',
        exerciseType: '5-11-alles-gemengd',
        xpReward: 80,
        passingCriteria: {
          scoreA: 85,
          scoreB: 65
        }
      }
    ]
  },
  'les-6': {
    title: "Oppervlakte van een driehoek",
    order: 6,
    theorySection: "theorie-6",
    parts: [
      {
        id: 'part-1',
        type: 'exercise',
        title: 'Instap: driehoek vanuit parallellogram',
        exerciseType: '6-1-instap-driehoek',
        xpReward: 40,
        passingCriteria: {
          scoreA: 75,
          scoreB: 50
        }
      },
      {
        id: 'part-2',
        type: 'video',
        title: 'Oppervlakte van een driehoek',
        videoUrl: '',
        xpReward: 20
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Formules inprenten: driehoek',
        exerciseType: '6-3-formules-drill',
        xpReward: 50,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-4',
        type: 'exercise',
        title: 'Oppervlakte berekenen: driehoek',
        exerciseType: '6-4-oppervlakte-driehoek',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Gemengd: omtrek en oppervlakte driehoek',
        exerciseType: '6-5-driehoek-gemengd',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-6',
        type: 'exercise',
        title: 'Alles gemengd: omtrek en oppervlakte',
        exerciseType: '6-6-alles-gemengd',
        xpReward: 80,
        passingCriteria: {
          scoreA: 85,
          scoreB: 65
        }
      }
    ]
  },
  'les-7': {
    title: "Oppervlakte van een cirkel",
    order: 7,
    theorySection: "theorie-7",
    parts: [
      {
        id: 'part-1',
        type: 'video',
        title: 'Oppervlakte van een cirkel',
        videoUrl: 'https://drive.google.com/file/d/1qBgc5eJObLwP0lRFA7XEpEiOjEoprICx/view?usp=drive_link',
        xpReward: 20
      },
      {
        id: 'part-2',
        type: 'exercise',
        title: 'Formules inprenten: cirkel',
        exerciseType: '7-2-formules-drill',
        xpReward: 50,
        passingCriteria: {
          scoreA: 85,
          scoreB: 70
        }
      },
      {
        id: 'part-3',
        type: 'exercise',
        title: 'Oppervlakte berekenen: cirkel',
        exerciseType: '7-3-oppervlakte-cirkel',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-4',
        type: 'exercise',
        title: 'Gemengd: omtrek en oppervlakte cirkel',
        exerciseType: '7-4-cirkel-gemengd',
        xpReward: 60,
        passingCriteria: {
          scoreA: 88,
          scoreB: 63
        }
      },
      {
        id: 'part-5',
        type: 'exercise',
        title: 'Alles gemengd: omtrek en oppervlakte',
        exerciseType: '7-5-alles-gemengd',
        xpReward: 80,
        passingCriteria: {
          scoreA: 85,
          scoreB: 65
        }
      }
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
// Standaardwaarden — worden overschreven door Firestore zodra loadDeadlines() is aangeroepen
let DEADLINES = [
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
  },
  'week-2-speedster': {
    weekNumber: 2,
    title: 'Snelheidsduivel Week 2',
    description: 'Deadline gehaald vóór 29 mei 2026',
    icon: '⚡',
    criteria: {
      type: 'deadline-early',
      weekNumber: 2,
      beforeDate: '2026-05-29'
    }
  },
  'week-3-speedster': {
    weekNumber: 3,
    title: 'Speedster',
    description: 'Alle oefeningen afgemaakt voor zaterdagavond',
    icon: '⚡',
    criteria: {
      type: 'deadline-early',
      weekNumber: 3,
      beforeDate: '2026-06-07'
    }
  },
  'week-3-bovennatuurlijk': {
    weekNumber: 3,
    title: 'Bovennatuurlijk',
    description: 'Alle oefeningen van de eerste keer geslaagd',
    icon: '✨',
    criteria: {
      type: 'all-first-attempt',
      weekNumber: 3,
      targetLesson: 'les-5'
    }
  },
  'week-3-knappe-kop': {
    weekNumber: 3,
    title: 'Knappe kop',
    description: 'Eén oefening een tweede keer geprobeerd, de rest van de eerste keer geslaagd',
    icon: '🧠',
    criteria: {
      type: 'near-perfect-attempts',
      weekNumber: 3,
      targetLesson: 'les-5'
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

// Laad deadlines uit Firestore (overschrijft de standaardwaarden hierboven)
async function loadDeadlines() {
  try {
    const fromDb = await DB.getDeadlines();
    if (fromDb && fromDb.length > 0) {
      DEADLINES = fromDb;
    }
  } catch (error) {
    console.warn('Kon deadlines niet laden uit Firestore, standaardwaarden worden gebruikt.');
  }
}

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

function getMaxAllowedLessonOrder() {
  const today = new Date().toISOString().split('T')[0];

  // Actieve deadline: gebruik het doelnummer van deze periode
  const active = DEADLINES.find(d => today >= d.startDate && today <= d.endDate);
  if (active) {
    const lesson = getLessonById(active.targetLesson);
    return lesson ? lesson.order : 0;
  }

  // Geen actieve deadline: gebruik de meest recente verstreken deadline
  const past = DEADLINES
    .filter(d => d.endDate < today)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];

  if (past) {
    const lesson = getLessonById(past.targetLesson);
    return lesson ? lesson.order : 0;
  }

  // Nog geen enkele deadline gepasseerd: alles vergrendeld
  return 0;
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
    getHoursUntilDeadline,
    getMaxAllowedLessonOrder
  };
}
