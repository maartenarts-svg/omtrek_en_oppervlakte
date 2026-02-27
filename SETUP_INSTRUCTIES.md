# 🚀 SETUP INSTRUCTIES - START HIER!

## Waarom werkt het nog niet?

Je hebt 2 dingen nodig voordat het platform werkt:
1. **Firebase configureren** (database voor leerling-gegevens)
2. **Deze bestanden uploaden naar GitHub**

## STAP 1: Firebase Project Maken (15 minuten)

### 1.1 Firebase Console

1. Ga naar: https://console.firebase.google.com
2. Klik op **"Add project"** of **"Create a project"**
3. Geef je project een naam: `wiskunde-leerplatform`
4. Google Analytics kun je uitschakelen (niet nodig)
5. Klik op **"Create project"**

### 1.2 Firestore Database Aanmaken

1. In je Firebase project, klik links op **"Build"** → **"Firestore Database"**
2. Klik op **"Create database"**
3. Kies **"Start in production mode"**
4. Bij locatie kies: **"eur3 (europe-west)"** (voor GDPR)
5. Klik op **"Enable"**

### 1.3 Firestore Rules Instellen

1. Ga naar **"Rules"** tab in Firestore
2. Vervang ALLES met deze regels:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Klik op **"Publish"**

⚠️ **LET OP:** Deze regels zijn open voor iedereen. Dat is OK voor nu om te testen. Later kun je strengere regels instellen.

### 1.4 Firebase Config Ophalen

1. Klik links bovenaan op het **tandwiel** ⚙️ naast "Project Overview"
2. Klik op **"Project settings"**
3. Scroll naar beneden naar **"Your apps"**
4. Klik op het **"</>" icoontje** (Web app)
5. Geef je app een naam: `wiskunde-leerplatform`
6. **VINK NIET AAN:** "Also set up Firebase Hosting"
7. Klik op **"Register app"**
8. Je ziet nu een code-blok met `firebaseConfig`
9. **KOPIEER** deze config (de hele `const firebaseConfig = {...}` sectie)

Het ziet er zo uit:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "jouw-project.firebaseapp.com",
  projectId: "jouw-project-id",
  storageBucket: "jouw-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123"
};
```

## STAP 2: Firebase Config Toevoegen aan Je Code

### 2.1 Open het bestand

1. In je GitHub repository, open het bestand: **`js/firebase-config.js`**
2. Klik op het **potlood-icoontje** om te bewerken

### 2.2 Vervang de config

Zoek deze regels (rond regel 19):
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

Vervang dit met je eigen config die je in stap 1.4 gekopieerd hebt.

### 2.3 Commit

1. Scroll naar beneden
2. Klik op **"Commit changes"**
3. Klik nogmaals op **"Commit changes"**

## STAP 3: GitHub Pages Activeren

1. Ga naar je repository op GitHub
2. Klik op **"Settings"** (bovenaan)
3. Klik links op **"Pages"**
4. Bij **"Source"**, selecteer: **"Deploy from a branch"**
5. Bij **"Branch"**, selecteer: **"main"** en **"/ (root)"**
6. Klik op **"Save"**
7. Wacht 1-2 minuten
8. Refresh de pagina
9. Je ziet nu een link: **"Your site is live at https://..."**

## STAP 4: Eerste Test

### 4.1 Admin Login Testen

1. Ga naar je GitHub Pages URL
2. Je ziet de login pagina
3. Typ in: `maarten.arts@labsintniklaas.be`
4. Klik op "Inloggen"
5. Voer code in: `852874179639`
6. Je komt nu in het **Dashboard**! 🎉

### 4.2 Eerste Leerling Toevoegen (Via Console)

Om te testen voegen we handmatig een test-leerling toe:

1. Ga terug naar Firebase Console
2. Ga naar **Firestore Database**
3. Klik op **"Start collection"**
4. Collection ID: `users`
5. Document ID: `test@labsintniklaas.be`
6. Voeg deze velden toe:
   - **email** (string): `test@labsintniklaas.be`
   - **name** (string): `Test Leerling`
   - **totalXP** (number): `0`
   - **currentLesson** (string): `les-1`
   - **badges** (array): leeg laten
   - **progress** (map): leeg laten
   - **weeklyProgress** (map): leeg laten
7. Klik op **"Save"**

8. Maak nu ook een **summary** document:
   - Klik op **"Start collection"**
   - Collection ID: `summary`
   - Document ID: `test@labsintniklaas.be`
   - Velden:
     - **email** (string): `test@labsintniklaas.be`
     - **name** (string): `Test Leerling`
     - **currentLesson** (string): `les-1`
     - **totalXP** (number): `0`
     - **lastActive** (timestamp): klik op "Add timestamp" en kies nu
     - **hasActiveAlerts** (boolean): `false`
     - **deadlineStatus** (map): leeg laten

### 4.3 Leerling Login Testen

1. Open een **nieuw incognito/privé venster**
2. Ga naar je GitHub Pages URL
3. Typ in: `test@labsintniklaas.be`
4. Klik op "Inloggen"
5. Je ziet nu het **Lessenoverzicht**! 🎉

## STAP 5: Leerlingen Toevoegen via CSV (Makkelijkere Manier)

### 5.1 CSV Maken

Maak een bestand `leerlingen.csv` met deze inhoud:
```
email,naam
jan.janssen@labsintniklaas.be,Jan Janssen
marie.peeters@labsintniklaas.be,Marie Peeters
```

### 5.2 Uploaden

1. Log in als admin (jouw mailadres)
2. Ga naar **"Leerlingen"** tab
3. Klik op **"CSV Uploaden"**
4. Selecteer je CSV bestand
5. Controleer de preview
6. Klik op **"Uploaden"**
7. Klaar! ✅

## 🎉 GELUKT!

Als alles werkt heb je nu:
- ✅ Firebase database
- ✅ Admin dashboard
- ✅ Leerling overzicht
- ✅ CSV upload werkt

## ⚠️ PROBLEMEN?

### "Bezig met inloggen..." blijft hangen

**Oorzaak:** Firebase config is niet ingevuld of verkeerd.

**Oplossing:**
1. Open browser console (F12)
2. Kijk naar de error messages
3. Meestal staat er: "Firebase not initialized" of "apiKey missing"
4. Check of je `js/firebase-config.js` correct hebt aangepast

### "Emailadres is niet geregistreerd"

**Oorzaak:** Leerling staat niet in database.

**Oplossing:**
1. Log in als admin
2. Upload een CSV met leerlingen
3. OF voeg handmatig toe via Firebase Console (zie stap 4.2)

### Dashboard is leeg

**Oorzaak:** Nog geen leerlingen toegevoegd.

**Oplossing:**
1. Voeg een test-leerling toe (zie stap 4.2)
2. Of upload een CSV met echte leerlingen

### Firebase errors in console

**Oorzaak:** Firestore rules zijn te streng.

**Oplossing:**
1. Ga naar Firebase Console → Firestore → Rules
2. Gebruik de open regels uit stap 1.3
3. Later kun je strengere regels instellen

## 📞 Volgende Stappen

Nu je platform werkt kun je:
1. **Video's toevoegen** - Upload naar Google Drive, voeg links toe in `js/config.js`
2. **Deadlines instellen** - Pas `DEADLINES` aan in `js/config.js`
3. **Badges maken** - Pas `BADGES_CONFIG` aan in `js/config.js`
4. **Oefeningen maken** - Maak per oefening-type een bestand

Zie `README.md` voor details over deze stappen!
