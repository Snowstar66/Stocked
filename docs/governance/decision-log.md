# Decision Log

| ID | Datum | Typ | Beslut | Påverkan | Rationale |
|---|---|---|---|---|---|
| DEC-001 | 2026-05-19 | ARCHITECTURE | Bygg statisk app utan backend. | OUT-001 / alla MVP-stories | Håller scope inom local-only och undviker dataskydds-/release-risker. |
| DEC-002 | 2026-05-19 | DATA | Använd localStorage-nyckel `matsvinnskollen.state.v1`. | DS-001 till DS-006 | Tillräckligt för MVP och raderbart i webbläsaren. |
| DEC-003 | 2026-05-19 | UX | Första vy är verktyget, inte landing page. | Alla användarjourneys | Kortar väg till första registrerade vara. |
| DEC-004 | 2026-05-19 | TEST | Testa domänlogik med Node utan externa beroenden. | Test evidence | Projektet saknade teststack; detta ger reproducerbara regressionstester direkt. |
| DEC-005 | 2026-05-19 | RISK | Faktisk nivå rapporteras som Level 2 med Level 3-kontroller. | Final report | Oberoende QA och browser-E2E saknas, vilket blockerar full Level 3. |
| DEC-006 | 2026-05-19 | EXCEPTION | Fortsatte utan checkpoint-frågor enligt användarens uttryckliga instruktion. | Workflow | User proxy bad om autonom implementation; kvarvarande mandat-/release-risk redovisas. |
| DEC-007 | 2026-05-20 | UX | Återanvänd CostTracker3-komponentmönster som statisk HTML/CSS. | UI | Bevarar local-only MVP och undviker att införa React/Vite som ny runtime-risk. |
