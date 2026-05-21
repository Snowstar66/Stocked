# Technical Debt Log

| ID | Modul | Story | Beskrivning | Risk | Mitigation | Urgens | Blockerar release |
|---|---|---|---|---|---|---|---|
| TD-001 | `app/domain.mjs` | DS-005 | Dubblettmatchning är enkel textmatchning. | Falska positiva eller missade liknande varor. | Förbättra med normalisering av pluraler/synonymer efter användartest. | Låg | Nej |
| TD-002 | `app/app.js` / UI | Alla | Ingen automatiserad browser/E2E. | UI-flöden kan regressa utan domäntestfel. | Inför Playwright eller dokumenterad manuell testsvit före release. | Medium | Ja, för publik release |
| TD-003 | `app/app.js` och `app/domain.mjs` | Alla | Browser-runtime duplicerar kärnregler från testbar modul för att HTML ska fungera utan server/bundler. | Framtida ändringar kan glömma ena kopian. | Nästa steg: införa byggsteg eller enkel bundling när projektet får toolchain. | Medium | Nej för intern MVP, ja före långsiktigt underhåll |
