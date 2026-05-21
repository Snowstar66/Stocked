# AI Risk Ledger

| ID | Risk | Påverkan | Mitigation | Status |
|---|---|---|---|---|
| AIR-001 | Samma AI producerar och granskar arbetet. | Full Level 3 kan inte hävdas. | Redovisa som icke-oberoende QA och rekommendera mänsklig review. | Öppen |
| AIR-002 | Browser/E2E saknas. | UI-regressioner kan missas. | Domäntester finns; lägg till Playwright eller manuell testlogg före release. | Öppen |
| AIR-003 | Måltidsidéer kan misstolkas som råd. | Risk för fel förväntningar kring livsmedelssäkerhet. | UI-text säger "Inte ett livsmedelssäkerhetsråd"; inga allergi-/näringsråd. | Mitigerad |
| AIR-004 | Lokal data kan ligga kvar på delad dator. | Privacy-risk i hushåll/testmiljö. | Radering av lokal appdata finns. | Mitigerad |
