# Development Plan

Datum: 2026-05-19

## Leveranssteg

1. Skapa lokal statisk appstruktur.
2. Implementera domänlogik för alla story ideas.
3. Koppla DOM, localStorage och audit trail.
4. Skapa responsiv svensk UI enligt framingens UX-riktning.
5. Lägga till beteendenära domäntester.
6. Skapa governance, spårbarhet, QA, evidence och final report.

## Testdefinition

| Story | Testnivå | Automation | Evidens |
|---|---|---|---|
| DS-001 | Domän + manuell UI | Automatiserad domän | `tests/domain.test.mjs` |
| DS-002 | Domän | Automatiserad | `tests/domain.test.mjs` |
| DS-003 | Domän | Automatiserad | `tests/domain.test.mjs` |
| DS-004 | Domän | Automatiserad | `tests/domain.test.mjs` |
| DS-005 | Domän | Automatiserad | `tests/domain.test.mjs` |
| DS-006 | Domän + manuell UI | Automatiserad domän | `tests/domain.test.mjs` |

## Kända Begränsningar

Automatiserad browser/E2E saknas eftersom projektet inte hade testframework eller beroendehantering. Detta loggas som kvalitetsrisk och påverkar faktisk AI-nivå.
