---
title: 'MatSvinnskollen lokal MVP'
type: 'feature'
created: '2026-05-19'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/docs/out-001-discovery-loop-accelerated-framing-handoff.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** Hushåll saknar en samlad lokal översikt över varor hemma och upptäcker ofta för sent vad som borde användas. Framing-paketet ber om en styrd downstream-leverans för MatSvinnskollen utan externa datakällor, molnsynk, konton eller livsmedelssäkerhetsråd.

**Approach:** Bygg en statisk responsiv webb-MVP som sparar data i webbläsarens localStorage och täcker alla godkända story ideas: manuell registrering, kategoriserad lageröversikt, snart-dags-prioritering, markera använd, regelbaserade måltidsidéer, inköpslista, varning för dubblettinköp och radering av lokal data.

## Boundaries & Constraints

**Always:** Svensk UI med fungerande åäö. Lokal data endast. Måltidsidéer ska vara regelbaserade och tydligt inte utgöra livsmedelssäkerhetsråd. Spårbarhet ska finnas från Outcome till Epic, Story Idea, implementation och tester.

**Ask First:** Scope-expansion till konton, molnsynk, streckkodsscanning, externa produkt- eller receptdatabaser, allergi-/näringsanpassning, analytics, backend, distribution eller release-godkännande kräver mänsklig mandatägare.

**Never:** Ingen extern dataöverföring, ingen hälsorådgivning, ingen livsmedelssäkerhetsbedömning, ingen prisjämförelse eller butikskoppling.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Registrera vara | Namn, kategori, antal, datum | Varan sparas lokalt och visas i rätt kategori | Tomt namn stoppas med svenskt felmeddelande |
| Snart-dags | Flera varor med olika datum | Närmaste datum visas högst och kan markeras som använd | Saknat datum döljs från snart-dags-listan |
| Måltidsidé | Registrerade varor, gärna datum nära | Regelbaserad idé prioriterar snart-dags-vara | Tomt lager visar tomtillstånd |
| Inköpslista | Användaren lägger till vara | Raden sparas lokalt och visar om liknande vara finns hemma | Tomt namn stoppas |
| Radering | Bekräftad radering | Alla varor, inköpsrader och händelser tas bort lokalt | Avbruten bekräftelse ändrar inget |

</frozen-after-approval>

## Code Map

- `../../app/index.html` -- Responsiv appstruktur och användarflöden.
- `../../app/styles.css` -- Kontrollplansliknande svensk UI med kompakt dashboard, högerrail och mobilanpassning.
- `../../app/app.js` -- Öppningsbar browser-runtime, DOM-bindning, localStorage-flöden och rendering.
- `../../app/domain.mjs` -- Testbar domänlogik för lager, datumprioritering, måltidsidéer, inköp och radering.
- `../../tests/domain.test.mjs` -- Beteendenära regressionstester utan externa beroenden.
- `../../docs/traceability/implementation-map.json` -- Outcome/Epic/Story/Test-spårbarhet.

## Tasks & Acceptance

**Execution:**
- [x] `app/index.html` -- Skapa faktisk första vy för MatSvinnskollen -- användaren ska landa i verktyget, inte en marknadssida.
- [x] `app/styles.css` -- Implementera tät responsive control-plane-layout -- följer UX-instruktionen och undviker generisk hero/SaaS-layout.
- [x] `app/domain.mjs` -- Implementera lokal domänlogik -- gör kärnbeteenden testbara och fria från webbläsar-DOM.
- [x] `app/app.js` -- Koppla formulär, listor, localStorage och radering -- levererar MVP-flödet i webbläsaren.
- [x] `tests/domain.test.mjs` -- Verifiera I/O-matrisens viktigaste beteenden -- fångar regressioner i synliga funktioner.
- [x] `docs/**` -- Skapa handoffs, governance, traceability, QA, evidence och final report -- uppfyller Level 3-kontroller där de är möjliga i aktuell miljö.

**Acceptance Criteria:**
- Given en tom eller ny lokal webbläsarprofil, when användaren öppnar appen, then en användbar svensk lageröversikt med exempeldata visas.
- Given en ny vara med kategori och datum, when den sparas, then den visas i rätt kategori och påverkar snart-dags-lista och måltidsidéer.
- Given en vara med närliggande datum, when användaren markerar den som använd, then antal minskar eller raden tas bort.
- Given en inköpsrad som liknar en registrerad vara, when den läggs till, then appen visar att liknande vara finns hemma.
- Given användaren bekräftar radering, when raderingen körs, then all localStorage-baserad appdata rensas.
- Given en måltidsidé visas, when användaren läser den, then texten får inte framstå som säkerhets-, allergi- eller näringsråd.

## Spec Change Log

- 2026-05-19: Ingen loopback. Specen skapades från godkänt framing-paket och användarens instruktion att inte stoppa för mellanfrågor.

## Design Notes

MVP:n är avsiktligt statisk och lokal. Det håller scope inom godkända gränser, minskar release-risk och undviker data-/privacy-frågor som skulle kräva nytt mandat. Domänlogiken ligger i `domain.mjs` så datumprioritering, dubblettkontroll och radering kan regressionstestas utan att dra in webbläsarautomation.

## Verification

**Commands:**
- `node tests\domain.test.mjs` -- expected: "Alla domäntester passerade."
- `node --check app\app.js` -- expected: no syntax errors.
- `node --check app\domain.mjs` -- expected: no syntax errors.

**Manual checks:**
- Öppna `app/index.html` direkt i webbläsaren och kontrollera registrering, snart-dags-lista, måltidsidé, inköpsvarning och radering.

## Suggested Review Order

**Domänbeteende**

- Testbar kärnlogik för registrering, datumprioritering och audit trail.
  [`domain.mjs:50`](../../app/domain.mjs#L50)

- Snart-dags-sortering håller datumlogik samlad och verifierbar.
  [`domain.mjs:90`](../../app/domain.mjs#L90)

- Regelbaserade måltidsidéer utan externa recept eller säkerhetsråd.
  [`domain.mjs:155`](../../app/domain.mjs#L155)

**Användarflöde**

- Formulärbindning sparar varor lokalt och återrenderar alla vyer.
  [`app.js:31`](../../app/app.js#L31)

- Radering kräver bekräftelse och rensar endast lokal appdata.
  [`app.js:65`](../../app/app.js#L65)

- Lageröversikten grupperar och exponerar markera-använd-kommandot.
  [`app.js:116`](../../app/app.js#L116)

**UI och verifiering**

- Första vyn är själva verktyget med tydliga arbetsytor.
  [`index.html:16`](../../app/index.html#L16)

- Regressionstester täcker de viktigaste story-beteendena.
  [`domain.test.mjs:18`](../../tests/domain.test.mjs#L18)
