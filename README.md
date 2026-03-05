# Wiskunde Leerplatform - Omtrek & Oppervlakte

Een volledig digitaal leerplatform voor het eerste middelbaar, A-stroom, met Duolingo-achtige progressie-visualisatie en meer.

## 📋 Overzicht

Dit platform biedt:
- Zelfstandig leren met gestructureerde lessen
- Video's, voorbeelden en oefeningen
- Duolingo-stijl lessenoverzicht met visuele progressie
- XP-systeem en badges
- Wekelijkse deadlines met automatische evaluatie
- Leerkracht dashboard voor monitoring
- Alert-systeem voor leerlingen die extra aandacht nodig hebben

## 🚀 Setup Instructies

### Stap 1: Firebase Project Aanmaken

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Klik op "Add project" en maak een nieuw project aan
3. Geef het project een naam (bijv. "wiskunde-leerplatform")
4. Google Analytics kan uitgeschakeld worden (optioneel)

### Stap 2: Firebase Services Configureren

#### Firestore Database
1. Ga naar "Build" → "Firestore Database"
2. Klik op "Create database"
3. Start in **production mode**
4. Kies locatie: **eur3 (europe-west)** (GDPR-compliant)

#### Authentication
1. Ga naar "Build" → "Authentication"
2. Klik op "Get started"
3. Enable "Email/Password" provider
4. Klik op "Save"

#### Security Rules
Ga naar Firestore → Rules en vervang met:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users kunnen alleen hun eigen data lezen/schrijven
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Summary data is leesbaar voor iedereen (voor dashboard)
    match /summary/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Alerts zijn alleen leesbaar voor admin
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Extra assignments alleen voor betreffende student
    match /extraAssignments/{userId} {
      allow read: if request.auth != null && request.auth.token.email == userId;
      allow write: if request.auth != null;
    }
  }
}
```

### Stap 3: Firebase Config Toevoegen

1. Ga naar Project Settings (tandwiel naast "Project Overview")
2. Scroll naar "Your apps" en klik op het web-icon (</>) 
3. Registreer een web app
4. Kopieer de Firebase config
5. Open `js/firebase-config.js` en vervang de config:

```javascript
const firebaseConfig = {
  apiKey: "JOUW_API_KEY",
  authDomain: "JOUW_PROJECT.firebaseapp.com",
  projectId: "JOUW_PROJECT_ID",
  storageBucket: "JOUW_PROJECT.appspot.com",
  messagingSenderId: "JOUW_SENDER_ID",
  appId: "JOUW_APP_ID"
};
```

### Stap 4: Uploaden naar GitHub

1. Maak een nieuw repository aan op GitHub
2. Upload alle bestanden:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/JOUW_USERNAME/JOUW_REPO.git
git push -u origin main
```

### Stap 5: GitHub Pages Activeren

1. Ga naar je repository op GitHub
2. Ga naar Settings → Pages
3. Bij "Source" selecteer "main branch"
4. Klik op "Save"
5. Je site is nu beschikbaar op: `https://JOUW_USERNAME.github.io/JOUW_REPO/`

## 👨‍🏫 Eerste Gebruik

### Als Leerkracht

1. Ga naar de website
2. Log in met: `maarten.arts@labsintniklaas.be`
3. Voer de code in: `852874179639`
4. Je komt nu in het dashboard

### Leerlingen Toevoegen

1. Maak een CSV-bestand met twee kolommen: `email,naam`
   
   Voorbeeld:
   ```
   email,naam
   jan.janssen@labsintniklaas.be,Jan Janssen
   marie.peeters@labsintniklaas.be,Marie Peeters
   ```

2. Ga in het dashboard naar "Leerlingen" tab
3. Klik op "CSV Uploaden"
4. Selecteer je CSV-bestand
5. Controleer de preview en klik op "Uploaden"

### Leerlingen Inloggen

1. Leerlingen gaan naar de website
2. Ze vullen hun school-emailadres in
3. Ze komen direct in hun lessenoverzicht

## 📝 Lessen Configureren

### Lessen Toevoegen/Aanpassen

Open `js/config.js` en bewerk `LESSONS_CONFIG`:

```javascript
'les-1': {
  title: "Wat is omtrek en oppervlakte",
  order: 1,
  theorySection: "theorie-1",
  parts: [
    {
      id: 'part-1',
      type: 'video',
      title: 'Onderscheid tussen omtrek en oppervlakte',
      videoUrl: 'https://drive.google.com/file/d/XXX/preview', // Google Drive embed URL
      xpReward: 20
    },
    {
      id: 'part-2',
      type: 'exercise',
      title: 'Omtrek en oppervlakte in rooster',
      exerciseType: 'rooster-berekening',
      xpReward: 50,
      passingCriteria: {
        minCorrect: 7,
        minPercentage: 70,
        scoreA: 90, // >= 90% = A
        scoreB: 70  // >= 70% = B, < 70% = C
      }
    }
  ]
}
```

### Video's Embedden (Google Drive)

1. Upload video naar Google Drive
2. Rechtsklik → "Share" → "Anyone with the link"
3. Kopieer de file ID uit de URL: `https://drive.google.com/file/d/FILE_ID/view`
4. Gebruik in config: `https://drive.google.com/file/d/FILE_ID/preview`

### Deadlines Instellen

Open `js/config.js` en bewerk `DEADLINES`:

```javascript
const DEADLINES = [
  { 
    weekNumber: 1, 
    startDate: '2025-03-03',  // YYYY-MM-DD (maandag)
    endDate: '2025-03-09',    // YYYY-MM-DD (zondag)
    targetLesson: 'les-2'     // Welke les moet af zijn
  },
  // Voeg meer weken toe...
];
```

### Badges Maken

Open `js/config.js` en bewerk `BADGES_CONFIG`:

```javascript
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
  }
};
```

## 🎯 Oefeningen Maken

Elke oefening moet je apart implementeren. Het systeem is nu opgezet als een kapstok waar je oefeningen aan kan hangen.

### Volgende stap: Oefening-types implementeren

Voor elk type oefening moet je een apart HTML-bestand maken in `/pages/exercises/`:

Bijvoorbeeld voor een rooster-oefening:
- Maak `/pages/exercises/rooster-berekening.html`
- Dit bestand krijgt via URL parameters: `?lesson=les-1&part=part-2`
- Na voltooien roep je `completePart()` aan met de resultaten

## 📊 Dashboard Functies

### Leerling Monitoren

1. Ga naar "Overzicht" tab voor quick-view van alle leerlingen
2. Klik op een leerling-kaart voor details
3. Of ga naar "Leerlingen" tab en selecteer een leerling uit de dropdown

### Alerts Bekijken

Alerts worden automatisch aangemaakt wanneer:
- Een leerling 3× achter elkaar een C-score haalt op hetzelfde onderdeel
- Een leerling een deadline mist (C of NI)

Ga naar "Alerts" tab om alle actieve alerts te zien.

### Weekscores Exporteren

1. Ga naar "Deadlines" tab
2. Selecteer een week
3. Bekijk de scores
4. Klik op "Export naar CSV" om te downloaden voor Google Sheets

### Extra Opdrachten Toewijzen

1. Ga naar "Instellingen" tab
2. Selecteer een leerling
3. Selecteer een extra les
4. Optioneel: stel een deadline in
5. Klik op "Toewijzen"

## 🔧 Onderhoud

### Firebase Gebruik Monitoren

1. Ga naar Firebase Console
2. Ga naar "Usage and billing"
3. Check of je binnen de gratis tier blijft:
   - Firestore: 50.000 reads/dag, 20.000 writes/dag
   - Authentication: Onbeperkt

### Leerlingen Verwijderen

Via Firebase Console:
1. Ga naar Firestore Database
2. Zoek de leerling in `users/` collection
3. Delete het document
4. Delete ook in `summary/` collection

## 🎨 Aanpassingen

### Kleuren Wijzigen

Open `css/styles.css` en wijzig de CSS variabelen in `:root`:

```css
:root {
  --color-primary: #6B9BD1;
  --color-success: #B8E5B8;
  --color-warning: #FFE5A3;
  --color-danger: #FFB8A3;
}
```

### Admin Code Wijzigen

Open `js/auth.js` en wijzig:

```javascript
const ADMIN_CODE = '852874179639'; // Vervang met je eigen code
```

## 🐛 Troubleshooting

### Leerlingen kunnen niet inloggen
- Check of hun email in Firebase `users/` collection staat
- Check Firestore rules
- Check of email correct gespeld is (lowercase!)

### Dashboard laadt niet
- Check of je ingelogd bent als admin
- Check browser console voor errors (F12)
- Check Firebase console of er een issue is met de database

### Video's spelen niet af
- Check of video's publiek gedeeld zijn op Google Drive
- Check of je de juiste embed URL gebruikt (`/preview` aan het einde)
- Check of de leerling ingelogd is op hun school Google account

## 📚 Volgende Stappen

Nu je de basis-structuur hebt, kun je:

1. **Oefeningen implementeren**: Maak HTML-bestanden voor elk oefening-type
2. **Theorie-pagina vullen**: Maak `pages/theory.html` met alle theorie
3. **Dril-pagina maken**: Maak `pages/drill.html` voor formules oefenen
4. **Video's uploaden**: Upload alle video's naar Google Drive
5. **Testen**: Test met een paar test-accounts

## 💡 Tips

- Commit regelmatig naar GitHub (elke wijziging)
- Test nieuwe oefeningen eerst met een test-account
- Backup je Firebase database regelmatig (export via Console)
- Houd de config.js simpel en overzichtelijk
- Gebruik duidelijke benamingen voor part-IDs

## 📞 Support

Bij vragen of problemen:
- Check de browser console (F12) voor error messages
- Check Firebase Console voor database issues
- Documentatie: [Firebase Docs](https://firebase.google.com/docs)

---

**Veel succes met je leerplatform! 🚀**
