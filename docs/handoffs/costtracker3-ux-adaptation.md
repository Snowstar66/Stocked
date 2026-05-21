# CostTracker3 UX Adaptation

Datum: 2026-05-20

## Källa

Återanvänd designmönster från `docs/CostTracker3-UX-Extract`:

- `app-shell`
- `topbar` och `topbar__actions`
- `local-badge`
- `segmented-nav`
- `control-grid` och `status-tile`
- `panel` och `panel__header`
- `form-grid` och `field`
- `timeline-table` och `row-title`
- `month-card`
- `data-card`
- `register-row`
- `detail-list`

## Anpassning

MatSvinnskollen behåller sin statiska, lokala runtime och sina befintliga domänflöden. React/Vite-komponenterna kopierades inte in, eftersom appen ska fortsätta kunna köras som enkel lokal HTML/JS. I stället är CostTracker3-komponenternas visuella struktur och klassnamn återskapade i `app/index.html`, `app/styles.css` och dynamisk rendering i `app/app.js`.

## Stilpolering

2026-05-20 gjordes ett extra finish-pass för att stärka den professionella appkänslan:

- renare neutral bakgrund utan dekorativa effekter,
- mjukare skuggor och mer återhållen kontrast,
- statusrutor med numrerade markörer i stället för demo-liknande bokstavsikoner,
- riktiga ankarlänkar i segmenterad navigation,
- tydligare hover- och focus states,
- finare panelhuvuden, tabeller, registerrader och sidopaneler.

## Plats- och Adminuppdatering

2026-05-20 bytte appen synligt namn till `Lagerstatus` och fick stöd för flera platser:

- Platsväljare i toppfältet.
- Platsbaserat lager och platsbaserad inköpslista.
- Adminvy för audit, rensning och platsadministration.
- Admin kan lägga till platser och döpa om befintliga platser.
- Minst en plats skapas alltid efter rensning.
- Statusrutornas numrering ersattes med linjeikoner.

## Bevarade Gränser

- Ingen backend.
- Ingen molnsynk.
- Ingen extern dataimport.
- Ingen livsmedelssäkerhetsbedömning.
- LocalStorage-only fortsätter gälla.
