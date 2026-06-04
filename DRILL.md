# Drill-systeem — technische documentatie

## Overzicht

`pages/drill.html` is een zelfstandige oefenhub waar leerlingen vrij kunnen kiezen welke oefening ze maken. De pagina staat los van het lessen-systeem (geen XP, geen badges, geen deadline-logica). Wat leerlingen doen, wordt bijgehouden in Firebase.

---

## Bestandsstructuur

```
pages/
  drill.html                               ← hub: tegels, overlay, formule-overzicht
js/
  exercise-drill-lengte-eenheden.js        ✅ afgewerkt (basis: 2-6)
  exercise-drill-oppervlakte-eenheden.js   ✅ afgewerkt (basis: 4-6)
  exercise-drill-omtrek-schatten.js        ✅ afgewerkt (basis: 2-3)
  exercise-drill-oppervlakte-schatten.js   ✅ afgewerkt (basis: 4-3)
  exercise-drill-formules.js               ✅ afgewerkt (basis: 5-8, eigen structuur)
  exercise-drill-omtrek-berekenen.js       ✅ afgewerkt (basis: 3-6)
  exercise-drill-oppervlakte-berekenen.js  ✅ afgewerkt (basis: 5-11, enkel opp.)
  exercise-drill-gemengd.js               ✅ afgewerkt (basis: 5-11)
```

---

## drill.html — werking

### Formule-overzicht (bovenaan de pagina)

Boven de tegelgroepen staat een inklapbare kaart die de formulestatus van de leerling toont. De kaart verschijnt enkel als `userData.drillFormules` aanwezig is (d.w.z. na minstens één voltooide drill-formules sessie).

| Situatie | Standaardtoestand | Kleur header |
|----------|-------------------|--------------|
| Formules te leren | Uitgevouwen — toont de onbekende formules + "Oefen nu →" | Blauw (primary) |
| Alles gekend | Ingeklapt — toont "✅ Je kent alle formules!" | Groen (secondary) |

- De "Oefen nu →" / "Opnieuw oefenen"-knop roept rechtstreeks `openExercise('drill-formules')` aan.
- Na voltooiing van drill-formules wordt de kaart onmiddellijk bijgewerkt zonder pagina-herlaad.
- Data-bron: `userData.drillFormules.results` (Firestore), bijgewerkt via `DB.saveDrillFormules()`.

### Tegel-overzicht

De pagina toont 8 klikbare tegels verdeeld in 2 groepen:

**Groep "Eenheden"**
| Tegel | ID | Init-functie | Gebaseerd op |
|---|---|---|---|
| Lengte-eenheden omzetten | `drill-lengte-eenheden` | `initDrillLengteEenheden` | exercise-2-6 |
| Omtrek schatten | `drill-omtrek-schatten` | `initDrillOmtrekSchatten` | exercise-2-3 |
| Oppervlakte-eenheden omzetten | `drill-oppervlakte-eenheden` | `initDrillOppervlakteEenheden` | exercise-4-6 |
| Oppervlakte schatten | `drill-oppervlakte-schatten` | `initDrillOppervlakteSchatten` | exercise-4-3 |

**Groep "Omtrek en oppervlakte"**
| Tegel | ID | Init-functie | Gebaseerd op |
|---|---|---|---|
| Formules inoefenen | `drill-formules` | `initDrillFormules` | exercise-5-8 (uitgebreid) |
| Omtrek berekenen | `drill-omtrek-berekenen` | `initDrillOmtrekBerekenen` | exercise-3-6 |
| Oppervlakte berekenen | `drill-oppervlakte-berekenen` | `initDrillOppervlakteBerekenen` | exercise-5-11 (enkel opp.) |
| Omtrek en oppervlakte berekenen | `drill-gemengd` | `initDrillGemengd` | exercise-5-11 |

Elke tegel toont een **score-badge** (A / B / C / grijs) op basis van de meest recente poging uit `drillHistory`.

### Oefenflow

1. Klik op tegel → overlay opent (`z-index: 100`), `init…(container, onDrillComplete)` wordt aangeroepen
2. Leerling maakt de oefening
3. Oefening roept `onComplete(result)` aan
4. `onDrillComplete` slaat op in Firebase, herlaadt tegel-badges, toont afrondingsscherm
5. Leerling klikt "Terug naar keuze" of "Opnieuw oefenen"

### `onComplete`-interface

```javascript
onComplete({
    score: 75,             // getal 0–100 (percentage)
    correctAnswers: 6,     // aantal punten (kan 0,5 zijn)
    totalQuestions: 8,     // varieert per oefening (8, 9, 6, 22)
    xpEarned: 60,
    letterScore: 'B',      // 'A' | 'B' | 'C'
    formulaResults: { ... } // enkel aanwezig bij drill-formules
})
```

**Letterscores — alle oefeningen behalve drill-formules:**
- score ≥ 90% → **A**
- score ≥ 70% → **B**
- score < 70% → **C**

**Letterscores — drill-formules (alles-of-niets):**
- Q1–22 allemaal correct → **A**
- Minstens één fout → **C** (met aanmoedigingsboodschap)

---

## Firebase — drillHistory

Elke voltooide oefening wordt toegevoegd als entry in de array `drillHistory` op het gebruikersdocument:

```
users/{email}/drillHistory: array van {
  type:        "drill-lengte-eenheden",    // exercise-ID
  scorePoints: 75,                         // 0–100
  scoreLetter: "B",                        // "A" | "B" | "C"
  timestamp:   "2026-06-04T10:30:00.000Z"  // ISO 8601
}
```

Opslaan via `DB.addDrillHistory(email, entry)`. Timestamp is altijd uniek → `arrayUnion` gedraagt zich als append.

---

## Firebase — drillFormules

Enkel voor `drill-formules`. Wordt **overschreven** (niet toegevoegd) bij elke voltooide sessie:

```
users/{email}/drillFormules: {
  timestamp: "2026-06-04T10:30:00.000Z",
  results: {
    P_vierkant:       true,   // gekend = correct in zowel tekst- als figuurvorm
    P_rechthoek:      true,
    P_ruit:           false,
    P_cirkel:         true,
    P_driehoek:       false,
    P_parallellogram: true,
    P_trapezium:      true,
    A_rechthoek:      true,
    A_vierkant:       false,
    A_parallellogram: true
  }
}
```

Opslaan via `DB.saveDrillFormules(email, data)`.

**Twee plaatsen die synchroon moeten blijven:**
- `FORMULA_DISPLAY` in `pages/drill.html` (voor de overzichtskaart)
- `FORMULAS` in `js/exercise-drill-formules.js` (voor de oefening zelf)

Als er ooit nieuwe formules bijkomen, moeten **beide** arrays uitgebreid worden. Zie ook: "Uitbreidbaarheid" hieronder.

---

## Uitbreidbaarheid

### Extra vragen binnen bestaande oefeningen

De oefeningtypes (de 8 tegels) liggen vast. Maar de inhoud van individuele oefeningen kan uitgebreid worden:

**Omtrek berekenen (`drill-omtrek-berekenen`)** en **Gemengd (`drill-gemengd`)**:
- De figuurtypen zijn gedefinieerd in de `SPECS`/`ALL_SHAPES`-array
- Extra figuren toevoegen = een nieuw object toevoegen aan die array + `genQuestion()` uitbreiden + `checkCalc()` aanvullen
- Het totaal aantal vragen past dan automatisch mee

**Oppervlakte berekenen (`drill-oppervlakte-berekenen`)**:
- Momenteel: vierkant, rechthoek, parallellogram (elk 2×)
- Extra figuren: toevoegen aan `SPECS` en `genQuestion()` aanvullen
- Pas ook `TOTAL_Q` en `MAX_POINTS` aan

**Omtrek/oppervlakte schatten (dropdown-oefeningen)**:
- Extra situaties toevoegen aan de `SITUATIONS`-array in het JS-bestand
- De vraagkeuze is gebalanceerd (1 per eenheid, aangevuld tot 8) — dat blijft werken bij meer situaties

### Nieuwe formules toevoegen aan drill-formules

Als het lesprogramma uitgebreid wordt met nieuwe formules:

1. Voeg de formule toe aan `FORMULAS` in `exercise-drill-formules.js`
2. Voeg dezelfde formule toe aan `FORMULA_DISPLAY` in `drill.html`
3. Voeg de formule toe aan `DISPLAY` (de weergave-map) in `exercise-drill-formules.js`
4. Voeg een geldige figuurtype toe aan `generateFigOpts()` indien nodig

**Bestaande Firestore-data**: oudere sessies hebben de nieuwe formule-ID niet in `results`. Omdat `!data.results[nieuwId]` dan `true` geeft, toont de kaart de nieuwe formule automatisch als "nog niet gekend" — wat correct is. De leerling doet gewoon een nieuwe sessie om ook die formule in te oefenen.

**Nog niet opgelost**: er is momenteel geen onderscheid tussen "nooit getest" en "getest maar fout". Dit kan in de toekomst relevant worden voor de weergave in de kaart.

---

## drill-formules — bijzondere kenmerken

De `drill-formules`-oefening wijkt af van de andere drill-oefeningen:

| Kenmerk | Waarde |
|---------|--------|
| Aantal vragen | 22 (Q1–10 tekst, Q11–20 figuur, Q21–22 letters) |
| Pogingen per vraag | 1 |
| Letterscores | A (alles juist) of C (minstens één fout) |
| Autocomplete | Bij "som" in invoerveld: suggestie "som van de zijden" (Tab of Enter of klik) |
| Enter-flow | In invoerveld: Enter controleert; als suggestie zichtbaar: Enter vult eerst aan |
| Feedback-Enter | Als feedback zichtbaar is: Enter activeert ook de OK-knop |
| Cursor | Wordt automatisch in elk invoerveld gezet bij nieuwe vraag |
| CSS-guard | Controleert op `ex58-style` of `drill-formules-style` |

---

## JS-bestanden — patronen en afspraken

### Naamgeving

| Element | Patroon | Voorbeeld |
|---|---|---|
| Bestandsnaam | `exercise-drill-{naam}.js` | `exercise-drill-lengte-eenheden.js` |
| Init-functie | `initDrill{Naam}` | `initDrillLengteEenheden` |
| CSS `<style>` id | `drill-{naam}-css` | `drill-lengte-eenheden-css` |
| HTML-IDs / klassen | prefix `{afkorting}-` | `dl-`, `doe-`, `dos-` |

### Prefix-afkortingen (reeds in gebruik)

| Oefening | Prefix |
|---|---|
| drill-lengte-eenheden | `dl-` |
| drill-oppervlakte-eenheden | `doe-` |
| drill-omtrek-schatten | `dos-` |
| drill-oppervlakte-schatten | `dops-` |
| drill-formules | `df-` |
| drill-oppervlakte-berekenen | `dob-` |
| drill-omtrek-berekenen / gemengd | `ex33-*` (gedeeld, geen conflict in drill.html) |

### Vaste regels

**1. Geen `window.*`-functies.**
Gebruik event listeners op knoppen in plaats van `onclick="window.foo()"`.

**2. `!important` op breedte — situatieafhankelijk.**

**A) Standalone invoerveld of dropdown:** gebruik `!important`.
```css
.dl-conversion-input { width: 140px !important; max-width: 140px !important; }
```

**B) Flex-berekeningsrij (`ex33-*` patroon):** géén `!important` op `<input>`. De globale `input[type="text"] { width: 100% }` (specificiteit [0,1,1]) wint van de klasseselector ([0,1,0]) en laat velden meegroeien. Enkel de `<select>` krijgt `!important` (klasse wint wél van `select { }` maar voor de zekerheid):
```css
.ex33-unit { width: 58px !important; }  /* select: smal houden */
.ex33-calc { width: 130px; }            /* input: globale stijl wint, veld groeit */
.ex33-ans  { width: 60px; }             /* idem */
```

**3. Geen `question-text-large` op een `<p>` met inline invoerveld.**
Die klasse heeft `padding` en `background` die de inline layout breken.

**4. Modal op `z-index: 200`.**
De drill-overlay zit op `z-index: 100`. Modals in oefeningen gebruiken `z-index: 200`.

**5. CSS via `addCSS()` met guard.**
```javascript
if (document.getElementById('mijn-css-id')) return;
```
Voor `ex33-*` oefeningen: check ook op andere stijl-IDs die dezelfde CSS bevatten.

**6. letterScore altijd meegeven aan `onComplete`.**
`drill.html` vertrouwt op `result.letterScore`. Bereken op basis van percentage (A ≥ 90%, B ≥ 70%), behalve bij drill-formules (A/C).
