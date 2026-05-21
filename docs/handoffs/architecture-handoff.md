# Architecture Handoff

Datum: 2026-05-19

## Beslut

MVP:n är en statisk webbapp utan byggsteg och utan tredjepartsberoenden.

## Struktur

- `app/index.html`: dokumentstruktur och arbetsytor.
- `app/styles.css`: responsiv layout och visuell systematik.
- `app/domain.mjs`: ren domänlogik.
- `app/app.js`: öppningsbar browser-runtime, DOM-händelser och localStorage.
- `tests/domain.test.mjs`: Node-baserade beteendetester.

## Data

All applikationsdata sparas lokalt under localStorage-nyckeln `matsvinnskollen.state.v1`. Ingen data skickas över nätverk. Radering tömmer appens state och tar bort nyckeln innan nytt tomt state sparas.

## Säkerhet och Integritet

Inga externa datakällor, ingen backend, ingen auth och ingen analytics är införd. Den primära privacy-risken är lokal kvarvarande webbläsardata om användaren delar dator; därför finns raderingsflöde.

## Kompatibilitet

Ingen bakåtkompatibilitet krävs eftersom det saknades tidigare runtime-app och datamodell. Den första localStorage-versionen namnges med `.v1` för framtida explicit migrering.

## Teknisk Notering

`app/app.js` innehåller browser-kompatibel runtime-kod så `app/index.html` kan öppnas direkt utan lokal server. `app/domain.mjs` behåller samma kärnregler i modulform för automatiserade Node-tester.
