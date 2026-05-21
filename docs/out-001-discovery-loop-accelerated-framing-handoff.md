# Discovery Loop Accelerated AI Handoff

This package is prepared for a downstream AI or agent group to run a faster governed discovery loop without stopping for approval at every ordinary refinement step.

## Handling rules
- Run a discovery loop from the Framing source of truth: inspect Outcome, Epics, Story Ideas, Journey Context, constraints, AI level and approval context before producing downstream artifacts.
- Do not ask for confirmation at every refinement step. Make reasonable documented assumptions, batch open questions, and continue until a meaningful refinement package exists.
- Use available specialist agents or BMAD-style roles when helpful, for example analyst, product, UX, architect, dev and QA perspectives, but keep one consolidated source-of-truth output.
- Escalate to the human only for governance-sensitive decisions, missing critical facts, material scope changes, high-risk data/security/privacy issues, or approval/sign-off boundaries.
- Return discovery outputs as traceable proposals linked back to Outcome -> Epic -> Story Idea -> Journey where applicable, plus assumptions, risks, suggested next experiments and validation checks.

## Structured Framing Payload
# Framing Brief

This package is intended as input to the next controlled AI-assisted step, for example BMAD-based design or structured refinement.

## Customer Handshake
Outcome key: OUT-001
Outcome title: Minska hushallets matsvinn genom battre oversikt och enklare vardagsbeslut
Timeframe: MVP om 2 veckor
Value owner: Frasse Friday

### Problem Statement
Package Type: AAS Framing Import Package
Product: MatSvinnskollen
Version: 1.1-story-journey-import
Language: sv-SE
Phase: Framing
Target Next Phase: Design
Domain: Application Development
AI Acceleration Level: 2
Risk Profile: medium
Human Mandate: Humans own Outcome approval, AI Acceleration Level, risk acceptance, scope expansion, external data sources, health/allergy/food-safety boundaries and release.

Problem Statement ID: PS-001
Problem Statement: Manga hushall koper mat som sedan gloms bort i kyl, frys eller skafferi. Det ar svart att halla oversikt over vad som finns hemma, vad som snart gar ut och vad som kan anvandas tillsammans i enkla maltider.
Baseline: Utgangslaget ar att anvandaren saknar en samlad digital oversikt over matvaror i hemmet och darfor ofta upptacker varor forst nar de redan blivit daliga eller inte langre kanns anvandbara.
Baseline Sources
- Intervjuer med 5 testhushall | User discovery | Kvalitativt underlag for nulage, friktion och hushallets nuvarande planering.
- Enkel nulagesenkat fore MVP-test | Baseline survey | Matar upplevd kontroll fore och efter testperiod.
- Manuell observation av inkopslista | Observation | Observerar hur anvandare idag skapar inkopslista utan samlad lagerstatus.

### Outcome Statement
Vi vill uppna att hushall enklare kan minska sitt matsvinn genom att fa battre oversikt over matvaror hemma, bli paminda om varor som snart bor anvandas och fa enkla maltidsforslag baserade pa befintliga varor.

2 Target Effects Minskad andel utgangna eller bortglomda varor Okad anvandning av varor innan bast fore-datum Farre dubbla inkop Okad upplevd kontroll over hushallets matlager

### Solution Context & Constraints
Solution context: Not captured yet
Constraints: ## General constraints
Imported constraints
- Configuration and planning constraints: Planning Unit: MVP Calculation Granularity: item Reporting Granularity: user_test_period Forecast Horizon: 2
Imported design notes
- Journey context design input: Journey Contexts - J-001 | Anvand forst det som snart gar ut | Hushallsanvandare | Journey Context. Outcome OUT-001 -> EPIC-002/EPIC-003 -> SI-003, SI-005, SI-006, SI-004 -> test intents for sorted soon-list, recipe s...

## UX principles
UX direction
UX profile: Enterprise control plane (enterprise-control-plane)
Target surface: Responsive web app (responsive-web)
Color schema: Nordic blue (nordic-blue)
Style authority: AAS suggested style (aas-suggested-style)

Style priority:
The selected AAS UX direction is the primary source unless explicit customer UX rules are added in the additional instructions.
If customer UX rules are supplied, downstream AI must explicitly resolve conflicts using this style authority before applying AAS profile, color, or signature component guidance.

Core UX guidance:
Prioritize dashboard density, strong hierarchy, audit-ready status, table/list scanning, durable navigation, and clear ownership of decisions.

Downstream AI visual grammar:
The selected UX profile must materially change layout, components, density, navigation, and status treatment. Do not collapse this into a generic SaaS card UI.
- Use dense control-plane layouts with compact rectangular cards, tables, right rails, and persistent navigation.
- Prefer squared or small-radius controls, clear borders, muted surfaces, and high information density.
- Place owner, status, evidence, version, and governance action together so the decision context is never hidden.

Signature components to prefer when relevant:
Use these as primary building blocks before generic button/select/input examples. Generic controls should support the signature component, not define the experience.
- Approval matrix for comparing owners, evidence, risk, and approval state.
- Audit trail rail beside forms and review screens.
- Readiness scorecard for tollgate, release, or portfolio decisions.

Surface guidance:
Design from responsive web constraints with clear desktop density and a readable mobile layout for core review and input tasks.

Color guidance:
Use cool blues with clean neutrals, restrained accents, high contrast, and a calm professional tone.

Additional UX instructions:
Se till att svenska tecken fungerar och används.

## Non-functional requirements
Imported non-functional requirements
- AI governance and risk constraints: Human Mandate: Humans own Outcome approval, AI Acceleration Level, risk acceptance, scope expansion, external data sources, health/allergy/food-safety boundaries and release. Governance Requirements - Outcome, MVP sco...

## Additional requirements
Imported additional requirements
- Additional requirements - MVP scope: MVP In Scope - Manuell registrering av matvaror - Kategorisering av varor - Bast fore-datum eller ungefarigt anvand-fore-datum - Enkel oversikt over varor som snart bor anvandas - Enkel inkopslista baserad pa saknade ...
Data sensitivity: Ingen
Delivery type: AD
Application Development: frame a new application, service or meaningful functional expansion. Keep focus on outcome, scope and why the capability should exist.

## Baseline
Readiness: Ready
Definition: Anvandaren saknar samlad digital oversikt over matvaror i hemmet.
Source: Intervjuer med 5 testhushall | User discovery | Enkel nulagesenkat fore MVP-test | Baseline survey | Manuell observation av inkopslista | Observation
Measurement Method: Minst 60 procent av registrerade varor har kategori och datum | Minst 40 procent av anvandarna markerar minst en vara som anvand inom 14 dagar | Minst 30 procent av anvandarna anvander forslagsfunktionen minst en gang per vecka | Sjalvskattad oversikt okar fran baseline till uppfoljning

## AI and Risk
Execution pattern: orchestrated
AI level: LEVEL 3
Level 3 means orchestrated agentic delivery: AI executes multiple chained steps through workflows or agents with stronger governance.
Expected AI use across lifecycle: BMAD
Risk profile: medium
Business impact: low: N/A
Data sensitivity: medium: N/A
Blast radius: low: N/A
Decision impact: medium: N/A
Level 3 justification: N/A

## Framing Warnings
- No warnings were visible at export time.

## Epics and Story Ideas
### EPIC-005 - Datakontroll och radering
Scope boundary: Scope in: Inkluderar enkel radering av lokal data. Exkluderar kontohantering och molnsynk.
Scope out: Kontohantering | Molnsynk
- Story Idea SC-009: Radera all lokal data
  Value intent: Anvandaren ska ha kontroll over sin information.
  Expected behavior: Anvandaren kan radera alla lokalt sparade varor och listor efter bekraftelse.
  UX sketches: None attached

### EPIC-001 - Hushallslager
Scope boundary: Scope in: Inkluderar manuell registrering, kategori och ungefarigt datum. Exkluderar streckkodsscanning och externa produktdatabaser.
Scope out: Streckkodsscanning | Externa produktdatabaser
- Story Idea SC-001: Lagg till matvara manuellt
  Value intent: Anvandaren ska snabbt kunna registrera en vara.
  Expected behavior: Anvandaren kan ange namn, kategori, antal och eventuellt datum.
  UX sketches: None attached
- Story Idea SC-002: Visa lager i kategorier
  Value intent: Anvandaren ska fa snabb oversikt over sitt matlager.
  Expected behavior: Appen grupperar varor i exempelvis kyl, frys, skafferi eller egna kategorier.
  UX sketches: None attached

### EPIC-002 - Datum och prioritering
Scope boundary: Scope in: Inkluderar enkel sortering och status baserat pa anvandarens registrerade datum. Exkluderar sakerhetsbedomning av mat.
Scope out: Sakerhetsbedomning av mat
- Story Idea SC-003: Visa varor som bor anvandas snart
  Value intent: Anvandaren ska latt hitta varor som riskerar att glommas bort.
  Expected behavior: Appen visar en lista over varor sorterade efter nar de bor anvandas.
  UX sketches: None attached
- Story Idea SC-004: Markera vara som anvand
  Value intent: Anvandaren ska kunna halla lagret aktuellt.
  Expected behavior: Anvandaren kan markera en vara som anvand, vilket tar bort eller minskar den i lagret.
  UX sketches: None attached

### EPIC-003 - Maltidsforslag
Scope boundary: Scope in: Inkluderar enkla regelbaserade forslag. Exkluderar naringsberakning, allergianpassning och externa receptdatabaser.
Scope out: Naringsberakning | Allergianpassning | Externa receptdatabaser
- Story Idea SC-005: Foresla maltid baserat pa valda varor
  Value intent: Anvandaren ska kunna anvanda befintliga varor mer effektivt.
  Expected behavior: Appen visar enkla maltidsideer baserat pa nagra registrerade varor.
  UX sketches: None attached
- Story Idea SC-006: Prioritera varor som snart bor anvandas i forslag
  Value intent: Forslagen ska hjalpa anvandaren minska svinn.
  Expected behavior: Appen prioriterar forslag dar snart-dags-varor ingar.
  UX sketches: None attached

### EPIC-004 - Inkopsstod
Scope boundary: Scope in: Inkluderar enkel manuell inkopslista. Exkluderar butikskoppling och prisjamforelse.
Scope out: Butikskoppling | Prisjamforelse
- Story Idea SC-007: Skapa enkel inkopslista
  Value intent: Anvandaren ska kunna planera inkop baserat pa vad som saknas.
  Expected behavior: Anvandaren kan lagga till saknade varor i en inkopslista.
  UX sketches: None attached
- Story Idea SC-008: Visa om vara redan finns hemma
  Value intent: Anvandaren ska undvika dubbla inkop.
  Expected behavior: Nar anvandaren lagger till en vara i inkopslistan visas om liknande vara redan finns i lagret.
  UX sketches: None attached

## Journey Context
### Imported Story Journeys
ID: imported-story-journeys
Outcome ID: ec962877-fa7d-4b07-a6e2-a0623a559acc
Initiative type: AD
Description: Imported from flat journeycontexts records.
Notes: Not captured yet
#### Journey J-001: Anvand forst det som snart gar ut
Type: user
Primary actor: Hushallsanvandare
Supporting actors: None captured
Goal: Anvandaren vill snabbt se vad som bor anvandas forst och valja en enkel maltid.
Trigger: Sondag kvall eller infor matplanering
Journey narrative: Not captured yet
Value moment: Not captured yet
Success signals: None captured
Current state: Anvandaren oppnar kyl och skafferi manuellt, forsoker minnas vad som finns och upptacker ofta for sent att nagot borde ha anvants tidigare.
Desired future state: Anvandaren oppnar appen, ser en kort lista over varor som bor anvandas snart och far ett eller flera enkla maltidsforslag.
Pain points: The flow can start inconsistently when sondag kvall eller infor matplanering. | Status, ownership, or the next step can become unclear during the journey. | Manual coordination makes it harder to anvandaren vill snabbt se vad som bor anvandas forst och valja en enkel maltid in a predictable way.
Desired support: A clear entry into the flow with visible trigger and ownership. | Supported progress with better overview of status, handoffs, and decisions. | Consistent support in the ending so it becomes easier to anvandaren vill snabbt se vad som bor anvandas forst och valja en enkel maltid and verify the result. | Support also aligned with existing Story Ideas: anvandaren ska latt hitta varor som riskerar att glommas bort. | Support also aligned with existing Story Ideas: appen visar en lista over varor sorterade efter nar de bor anvandas.
Exceptions: None captured
Notes: Journey Context. Outcome OUT-001 -> EPIC-002/EPIC-003 -> SI-003, SI-005, SI-006, SI-004 -> test intents for sorted soon-list, recipe suggestions based on registered items and inventory update after use. Steps: J-001-S1 Oppna snart-dags-listan linked SI-003; J-001-S2 Valj varor att anvanda linked SI-005/SI-006; J-001-S3 Markera vara som anvand linked SI-004. Success: relevant item within 10 seconds, at least one item marked used, app feels helpful not blaming.
Linked Epics: None
Linked Story Ideas: SI-003, SI-004, SI-005, SI-006
Linked Figma refs: None
- Step J-001-S1: Anvand forst det som snart gar ut
  Actor: Not captured yet
  Description: Journey Context. Outcome OUT-001 -> EPIC-002/EPIC-003 -> SI-003, SI-005, SI-006, SI-004 -> test intents for sorted soon-list, recipe suggestions based on registered items and inventory update after use. Steps: J-001-S1 Oppna snart-dags-listan linked SI-003; J-001-S2 Valj varor att anvanda linked SI-005/SI-006; J-001-S3 Markera vara som anvand linked SI-004. Success: relevant item within 10 seconds, at least one item marked used, app feels helpful not blaming.
  Current pain: Not captured yet
  Desired support: Not captured yet
  Decision point: No
Coverage status: covered
Coverage suggested Epics: 9b3a2bba-be0d-4a47-8916-f06d7198aaba, 7de9edc9-ac39-46da-a5d0-abaac4b983cc
Coverage suggested Story Ideas: 00fa1795-ff1a-488a-8302-516df31126fd, 3c2ce494-e541-48d6-8033-7b0adec2d575, 850d118f-2d15-4850-b112-c25513421007
Coverage suggested new Story Ideas: None
Coverage notes: AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar.

#### Journey SJ-001: Story Journey: Registrera forsta matvarorna
Type: user
Primary actor: Hushallsanvandare
Supporting actors: None captured
Goal: Sakerstalla att en ny anvandare snabbt kan skapa sin forsta lageroversikt utan onboarding eller hog friktion.
Trigger: Anvandaren oppnar appen forsta gangen och vill lagga in vad som finns hemma.
Journey narrative: Sakerstalla att en ny anvandare snabbt kan skapa sin forsta lageroversikt utan onboarding eller hog friktion.
Value moment: Not captured yet
Success signals: None captured
Current state: Not captured yet
Desired future state: Not captured yet
Pain points: None captured
Desired support: None captured
Exceptions: None captured
Notes: Story Journey SJ-001. Outcome OUT-001 -> EPIC-001 -> SI-001/SI-002. Steps: SJ-001-S1 Starta snabbregistrering linked SI-001, test intent: start registration from home/start page; SJ-001-S2 Ange namn, kategori och antal linked SI-001, test intent: item can be saved with minimum necessary information; SJ-001-S3 Se varan i lageroversikten linked SI-002, test intent: registered item appears in correct view/category. Success: first item under 20 seconds, user understands item was saved, no instructions needed. | Human review needed: false
Linked Epics: EPIC-001
Linked Story Ideas: SI-001, SI-002
Linked Figma refs: None
- Step SJ-001-S1: Story Journey: Registrera forsta matvarorna
  Actor: Not captured yet
  Description: Story Journey SJ-001. Outcome OUT-001 -> EPIC-001 -> SI-001/SI-002. Steps: SJ-001-S1 Starta snabbregistrering linked SI-001, test intent: start registration from home/start page; SJ-001-S2 Ange namn, kategori och antal linked SI-001, test intent: item can be saved with minimum necessary information; SJ-001-S3 Se varan i lageroversikten linked SI-002, test intent: registered item appears in correct view/category. Success: first item under 20 seconds, user understands item was saved, no instructions needed.
  Current pain: Not captured yet
  Desired support: Not captured yet
  Decision point: No
Coverage status: covered
Coverage suggested Epics: a08af64f-7209-4b9d-bbdc-cfd9630f7929
Coverage suggested Story Ideas: a82e958a-a051-4da9-8edd-c0837bfcdcdd
Coverage suggested new Story Ideas: None
Coverage notes: AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar.

#### Journey SJ-002: Story Journey: Anvand forst det som snart gar ut
Type: user
Primary actor: Hushallsanvandare
Supporting actors: None captured
Goal: Hjalpa anvandaren omsatta lageroversikt till konkret handling som minskar matsvinn.
Trigger: Anvandaren vill planera dagens eller veckans mat.
Journey narrative: Hjalpa anvandaren omsatta lageroversikt till konkret handling som minskar matsvinn.
Value moment: Not captured yet
Success signals: None captured
Current state: Not captured yet
Desired future state: Not captured yet
Pain points: None captured
Desired support: None captured
Exceptions: None captured
Notes: Story Journey SJ-002. Outcome OUT-001 -> EPIC-002/EPIC-003 -> SI-003/SI-004/SI-005/SI-006. Steps: SJ-002-S1 Oppna snart-dags-listan linked SI-003, test intent: nearest dates shown highest; SJ-002-S2 Valj vara att anvanda linked SI-003, test intent: selectable item from soon-list; SJ-002-S3 Fa enkelt maltidsforslag linked SI-005, test intent: suggestions use registered items and no external recipe data; SJ-002-S4 Markera vara som anvand linked SI-004, test intent: item removed or reduced in inventory. Success: prioritized item within 10 seconds, at least one relevant suggestion, inventory can be updated after use. Human review required: food/date wording must not imply safety advice. | Human review needed: true | Human review reason: Maltidsforslag och datumformuleringar far inte uppfattas som livsmedelssakerhetsrad.
Linked Epics: EPIC-002, EPIC-003
Linked Story Ideas: SI-003, SI-004, SI-005, SI-006
Linked Figma refs: None
- Step SJ-002-S1: Story Journey: Anvand forst det som snart gar ut
  Actor: Not captured yet
  Description: Story Journey SJ-002. Outcome OUT-001 -> EPIC-002/EPIC-003 -> SI-003/SI-004/SI-005/SI-006. Steps: SJ-002-S1 Oppna snart-dags-listan linked SI-003, test intent: nearest dates shown highest; SJ-002-S2 Valj vara att anvanda linked SI-003, test intent: selectable item from soon-list; SJ-002-S3 Fa enkelt maltidsforslag linked SI-005, test intent: suggestions use registered items and no external recipe data; SJ-002-S4 Markera vara som anvand linked SI-004, test intent: item removed or reduced in inventory. Success: prioritized item within 10 seconds, at least one relevant suggestion, inventory can be updated after use. Human review required: food/date wording must not imply safety advice.
  Current pain: Not captured yet
  Desired support: Not captured yet
  Decision point: No
Coverage status: covered
Coverage suggested Epics: 9b3a2bba-be0d-4a47-8916-f06d7198aaba
Coverage suggested Story Ideas: ac52f255-d071-4a3f-988f-e38ff2998735
Coverage suggested new Story Ideas: None
Coverage notes: AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar.

#### Journey SJ-003: Story Journey: Undvik dubbla inkop
Type: user
Primary actor: Hushallsanvandare
Supporting actors: None captured
Goal: Hjalpa anvandaren skapa inkopslista utan att kopa varor som redan finns hemma.
Trigger: Anvandaren planerar inkop.
Journey narrative: Hjalpa anvandaren skapa inkopslista utan att kopa varor som redan finns hemma.
Value moment: Not captured yet
Success signals: None captured
Current state: Not captured yet
Desired future state: Not captured yet
Pain points: None captured
Desired support: None captured
Exceptions: None captured
Notes: Story Journey SJ-003. Outcome OUT-001 -> EPIC-001/EPIC-004 -> SI-002/SI-007/SI-008. Steps: SJ-003-S1 Oppna inkopslistan linked SI-007, test intent: shopping list opens from main navigation or start; SJ-003-S2 Lagg till vara i inkopslistan linked SI-007, test intent: item can be saved in shopping list; SJ-003-S3 Fa signal om liknande vara redan finns linked SI-008, test intent: app shows simple signal when matching item exists in inventory. Success: user sees if item exists at home, can choose to add anyway, app feels helpful not blocking. | Human review needed: false
Linked Epics: EPIC-001, EPIC-004
Linked Story Ideas: SI-002, SI-007, SI-008
Linked Figma refs: None
- Step SJ-003-S1: Story Journey: Undvik dubbla inkop
  Actor: Not captured yet
  Description: Story Journey SJ-003. Outcome OUT-001 -> EPIC-001/EPIC-004 -> SI-002/SI-007/SI-008. Steps: SJ-003-S1 Oppna inkopslistan linked SI-007, test intent: shopping list opens from main navigation or start; SJ-003-S2 Lagg till vara i inkopslistan linked SI-007, test intent: item can be saved in shopping list; SJ-003-S3 Fa signal om liknande vara redan finns linked SI-008, test intent: app shows simple signal when matching item exists in inventory. Success: user sees if item exists at home, can choose to add anyway, app feels helpful not blocking.
  Current pain: Not captured yet
  Desired support: Not captured yet
  Decision point: No
Coverage status: covered
Coverage suggested Epics: 7439dee5-92c9-47c5-9279-8ac44e71e393
Coverage suggested Story Ideas: 3f38173b-9d49-4650-9a88-105ef38c2602
Coverage suggested new Story Ideas: None
Coverage notes: AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar.

#### Journey SJ-004: Story Journey: Radera lokal data
Type: user
Primary actor: Hushallsanvandare
Supporting actors: None captured
Goal: Sakerstalla att anvandaren har kontroll over lokalt sparad information.
Trigger: Anvandaren vill nollstalla appen eller ta bort sin information.
Journey narrative: Sakerstalla att anvandaren har kontroll over lokalt sparad information.
Value moment: Not captured yet
Success signals: None captured
Current state: Not captured yet
Desired future state: Not captured yet
Pain points: None captured
Desired support: None captured
Exceptions: None captured
Notes: Story Journey SJ-004. Outcome OUT-001 -> EPIC-005 -> SI-009. Steps: SJ-004-S1 Oppna datakontroll linked SI-009, test intent: data control reachable from settings or equivalent; SJ-004-S2 Bekrafta radering linked SI-009, test intent: deletion requires confirmation; SJ-004-S3 Se att data ar raderad linked SI-009, test intent: inventory and shopping list are empty after deletion. Success: user can delete data without account/support, deletion is clear and consequence is understood. | Human review needed: false
Linked Epics: EPIC-005
Linked Story Ideas: SI-009
Linked Figma refs: None
- Step SJ-004-S1: Story Journey: Radera lokal data
  Actor: Not captured yet
  Description: Story Journey SJ-004. Outcome OUT-001 -> EPIC-005 -> SI-009. Steps: SJ-004-S1 Oppna datakontroll linked SI-009, test intent: data control reachable from settings or equivalent; SJ-004-S2 Bekrafta radering linked SI-009, test intent: deletion requires confirmation; SJ-004-S3 Se att data ar raderad linked SI-009, test intent: inventory and shopping list are empty after deletion. Success: user can delete data without account/support, deletion is clear and consequence is understood.
  Current pain: Not captured yet
  Desired support: Not captured yet
  Decision point: No
Coverage status: covered
Coverage suggested Epics: 32a1163c-e7d8-46ea-bb9f-e982ad1b0e8a
Coverage suggested Story Ideas: e2000747-79cb-47ca-9ac2-aa6743653026
Coverage suggested new Story Ideas: None
Coverage notes: AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar.


## Downstream AI Instructions

### Always-on Controls
- Preserve Epic -> Story -> Test traceability: Keep downstream AI outputs linked from Epic through Story to later test intent.
- Preserve AI-level-specific review expectations: Keep review strictness aligned with the current AI level.
- Preserve human approval on critical decisions: Do not let downstream AI remove human approval where decision impact or governance requires it.
- Preserve security/privacy/compliance constraints: Carry security, privacy, compliance, and data sensitivity constraints forward into downstream AI behavior.
- Preserve testability and binary acceptance intent: Keep downstream refinement tied to later testability and acceptance clarity.
- Preserve reproducibility expectations at higher AI levels: At higher AI levels, keep logs, reproducibility, and reviewability expectations visible in downstream work.

### Epic Refinement
- E1 Keep each Epic centered on one coherent capability/value area: YES (recommended YES)
- E2 Separate user-facing Epics from enabling/platform/compliance Epics: YES (recommended YES)
- E3 Minimize cross-Epic dependencies: YES (recommended YES)
- E4 Preserve Journey Context during Epic refinement: YES (recommended YES)
- E5 Prefer standard patterns before variants: YES (recommended YES)
- E6 Model transition/coexistence work as explicit Epics: NO (recommended NO)
- E7 Model operability/stability work as explicit Epics: NO (recommended NO)

### Story Idea Refinement
- S1 Keep each Story Idea centered on one primary intent: YES (recommended YES)
- S2 Tie each Story Idea to an actor, journey step, or trigger: YES (recommended YES)
- S3 Split large Story Ideas before Design if verification would be hard: YES (recommended YES)
- S4 Require future testability when refining Story Ideas: YES (recommended YES)
- S5 Keep architecture direction lightweight at Story Idea level: YES (recommended YES)
- S6 Force Story Type classification during refinement: YES (recommended YES)
- S7 Force AI Usage Scope visibility when downstream AI is expected: YES (recommended YES)
- S8 Require rollback/fallback thinking for risky Story Ideas: NO (recommended NO)

### Journey Usage
- J1 Use Journey Context as a primary refinement source when present: YES (recommended YES)
- J2 Preserve journey-to-story traceability when Journey Context exists: YES (recommended YES)
- J3 Allow AI to suggest missing journey/story mappings: YES (recommended YES)
- J4 Prefer actor and flow continuity when Journey Context exists: YES (recommended YES)
- J5 Allow Story Ideas to stand without Journey Context when Journey Context is absent: YES (recommended YES)

### Design Guidance
- D1 Optimize for modularity and future changeability: YES (recommended YES)
- D2 Prefer reuse when fit-for-purpose: NO (recommended NO)
- D3 Prefer integration discipline over shortcuts: YES (recommended YES)
- D4 Make data ownership and classification explicit: YES (recommended YES)
- D5 Preserve security/privacy/compliance in design proposals: YES (recommended YES)
- D6 Make observability and operability part of Design: YES (recommended YES)
- D7 Separate experimentation zones from stable zones: YES (recommended YES)
- D8 Prefer continuity over architectural purity when needed: NO (recommended NO)
- D9 Prefer phased rollout over big bang: NO (recommended NO)

### Build Guidance
- B1 Require Story and Epic traceability for all implementation work: YES (recommended YES)
- B2 Require traceability for AI-generated implementation artifacts: YES (recommended YES)
- B3 Enforce AI-level-specific review and reproducibility rules: YES (recommended YES)
- B4 Require test strategy proportional to Story risk/type: YES (recommended YES)
- B5 Require architecture/security checks in review or CI/CD: YES (recommended YES)
- B6 Prefer automatically generated release evidence: YES (recommended YES)
- B7 Treat support/runbook/handover updates as part of done: NO (recommended NO)
- B8 Prefer low blast radius and reversibility in rollout: NO (recommended NO)
- B9 Allow emergency handling only with retroactive traceability: NO (recommended NO)

### Custom Instructions
- High General: Discovery loop accelerator
  Downstream AI should run an accelerated discovery loop from this Framing package instead of asking for approval at every ordinary refinement step.
Start by inspecting Outcome, Epics, Story Ideas, Journey Context, constraints, AI level, risk posture and approval context.
Use available specialist agents or BMAD-style roles when helpful, for example analyst, product, UX, architect, dev and QA perspectives, but return one consolidated source-of-truth output.
Make reasonable documented assumptions, batch open questions, and continue until a meaningful refinement package exists.
Escalate to the human only for governance-sensitive decisions, missing critical facts, material scope changes, high-risk data/security/privacy issues, or approval/sign-off boundaries.
Return traceable discovery outputs linked back to Outcome -> Epic -> Story Idea -> Journey where applicable, plus assumptions, risks, suggested next experiments and validation checks.
- High General: AAS Level 3 - Orchestrated Agentic Delivery
  Use the following instruction as the governing delivery mode for this project.

The selected AI Acceleration Level is Level 3: Orchestrated Agentic Delivery under AAS.

Apply it to all analysis, design, refinement, implementation, testing, documentation and reporting in this project unless I explicitly change the acceleration level.

The project handoff and source material is located in the path I provide. If I do not provide a path, look for project material in common documentation locations such as `docs/`, `README.md`, `prd/`, `requirements/`, `specs/`, `stories/`, or equivalent project folders.

Use the available project material as the initial source of truth.

If anything is ambiguous, log it in the Analyst handoff, workflow log, decision log or AI Risk Ledger instead of guessing silently.

I am the user proxy for human approvals unless I name another mandate holder.

Autoapprove any:

- value direction,
- business priority,
- scope boundary,
- risk acceptance,
- release approval,
- missing business context that cannot be inferred safely.

Do not ask me for low-risk implementation details, naming choices, file organization, minor UI copy, internal technical structure, test naming, formatting, story splitting, acceptance-criteria drafting, or obvious refinements that stay inside approved scope and do not affect value, data, security, architecture, dependencies, UX-critical behavior, cost, release risk or scope.

Start by reading the available project material, then initialize the required governance and handoff structure before any implementation.

# AI Acceleration Level 3: Orchestrated Agentic Delivery under AAS

This instruction applies to any BMAD/AAS/SDD project where the selected AI Acceleration Level is Level 3: Orchestrated Agentic Delivery.

AI may work with high autonomy only inside a documented, role-orchestrated workflow.

Autonomy must increase traceability, review, reproducibility and human control — never reduce them.

Level 3 governance must shift documentation, traceability, review preparation and evidence collection to AI.

The human user should mainly respond to value, scope, risk and release decisions — not to every delivery detail.

The requested level is Level 3, but the final report must state the actually achieved AI level based on produced evidence.

If Level 3 evidence cannot be produced, AI must not claim full Level 3 completion.

## Default Governance Structure

Unless the project defines another governance/documentation structure, use these default paths:

- `docs/agent-handoffs/`
- `docs/governance/`
- `docs/traceability/`

If the project uses different paths, AI must document the chosen paths in the workflow log and use them consistently.

Missing governance artifacts are not by themselves a reason to stop. AI should create or update them and continue unless the missing information creates a material value, scope, data, security, architecture or release risk.

AI may create missing governance artifacts and continue, but must not invent missing business decisions, risk acceptance or release approval.

Use `AI Risk Ledger` as the primary AAS artifact.

If the project already uses a Risk Register, it may be used as the equivalent artifact only if it contains the required AI-specific risk fields.

## AAS Governing Principles

The delivery must follow these non-negotiable AAS principles:

- Outcome before output.
- Value Spine is mandatory: Outcome → Epic → Story → Test.
- AI is a formally governed acceleration level, not an informal tool.
- Human Mandate always applies.
- AI may not accept risk, approve release or override human scope decisions.
- Risk profile governs the selected AI Acceleration Level.
- No AI-generated implementation artifact may exist without traceability.
- Reproducibility and AI-review must be proportionate to the selected level.
- The final report must distinguish between intended process and actually evidenced process.

## Low-Friction Operating Rule

AI must minimize human interruption.

AI should proceed autonomously when all of the following are true:

- the work is inside approved or clearly implied scope,
- the value intent is clear,
- the risk is low or medium and mitigated,
- no new external data flow is introduced,
- no new security-sensitive behavior is introduced,
- no new dependency or architecture shift is introduced,
- no explicit scope-out is affected,
- implementation can be traced to Outcome/Epic/Story/Test or provisional mapping,
- test or verification approach is available,
- required Level 3 pre-implementation handoffs exist or a documented exception exists.

AI must not ask the user to approve routine delivery mechanics.

Examples of decisions AI should make and log without asking:

- naming of internal files,
- test file naming,
- local code organization inside existing architecture,
- minor UI copy refinements,
- small accessibility improvements,
- formatting,
- obvious bugfix approach,
- applying existing project patterns,
- creating AI-proposed acceptance criteria from expected behavior,
- splitting a broad story idea into smaller AI-proposed Stories,
- classifying a framing idea as Candidate Story, Exploration, Epic Candidate, Journey / UX Context or Deferred,
- choosing proportional test files based on existing project practice,
- updating handoff and traceability artifacts.

AI must ask the user only when the decision affects:

- value direction,
- business priority,
- scope boundary,
- user-facing behavior with material UX impact,
- sensitive data,
- security,
- external services,
- architecture,
- dependencies,
- cost,
- release risk,
- residual risk acceptance,
- explicit scope-out,
- unclear business meaning.

## Human Authority and Proxy Rule

The human user interacting with AI is the communication proxy for required human mandate holders unless another named mandate holder is explicitly provided.

When AI requires approval from a Value Owner, Risk Owner, Release Owner or other human authority, it must ask the user.

AI may treat user-provided approval as the operative approval signal available in the tool context, but must log whether the user is:

- the actual mandate holder,
- an explicitly delegated proxy,
- or an unverified proxy.

If mandate is unverified, the decision must be recorded as a residual governance risk.

AI may not infer human approval from silence.

Any approval must be logged with:

- date/time if available,
- approving user or named mandate holder,
- affected Outcome/Epic/Story/artifact,
- decision made,
- accepted risk if relevant,
- remaining condition or follow-up if relevant.

## Approval Ergonomics

AI must minimize human approval burden by batching related approvals into concise value checkpoints.

Each approval request must include:

- value decision needed,
- recommended option,
- alternatives,
- risk if approved,
- risk if not approved,
- affected Outcome/Epic/Story,
- whether approval blocks implementation.

AI must not ask for approval on low-risk delivery mechanics that are already inside approved scope and do not affect:

- value direction,
- business priority,
- scope,
- material UX behavior,
- sensitive data,
- security,
- architecture,
- dependencies,
- cost,
- release risk,
- residual risk acceptance.

AI should use short approval formats such as:

- APPROVE
- APPROVE VALUE DIRECTION
- APPROVE WITH CONDITION: [condition]
- REJECT
- DEFER
- REQUEST CHANGE: [change]

Human approval may be given in natural language. AI must interpret it conservatively and log the decision.

If user feedback is directionally clear but not formal, AI may proceed only inside low-risk scope and must log the decision as interpreted user direction, not formal risk acceptance.

## Agent Execution Transparency

The final report and workflow log must distinguish between:

- actual multi-agent execution, where separate agents or roles produced independent artifacts,
- single-agent simulated role reasoning, where one AI performed multiple role perspectives,
- human decisions,
- AI-generated assumptions,
- unresolved risks,
- unverified approvals,
- bypasses and exceptions.

If actual multi-agent execution is not technically available, AI may proceed using simulated role reasoning only if it documents this limitation in the workflow log and applies compensating controls:

- explicit role artifacts,
- stricter QA review,
- risk ledger entries,
- clear final-report disclosure,
- no claim of independent multi-agent execution.

If QA/AQA is performed by the same AI system that produced the implementation, it must be labelled as simulated QA review, not independent approval.

Independent AQA approval exists only when a separate human, tool, agent instance, or review process has performed the review with documented separation from the implementation activity.

A role is not independent merely because the same AI changes perspective. Independence requires documented separation of execution context, reviewer, tool run, agent instance, or human review.

## AAS Value Spine

All work must be traceable through:

Outcome → Epic → Story → Test

No implementation artifact may exist without:

- Story-ID,
- Epic and Outcome mapping,
- AI Acceleration Level,
- AI Usage Scope,
- acceptance criteria,
- test definition,
- Definition of Done.

Each Story must include:

- Story-ID,
- title,
- Story Type,
- Value Intent,
- linked Epic,
- linked Outcome,
- acceptance criteria,
- AI Acceleration Level,
- AI Usage Scope,
- test definition,
- Definition of Done,
- implementation reference,
- test evidence reference.

If acceptance criteria are missing from the baseline, AI may propose acceptance criteria, but they must be marked as AI-proposed until accepted by the user proxy or mandate holder.

AI may group multiple AI-proposed Stories under one value checkpoint instead of asking for acceptance one by one.

AI Usage Scope must use one or more of:

- CONTENT — documentation, reports, summaries, requirements text,
- TEST — test cases, test data, test code,
- CODE — executable code or refactoring,
- DESIGN — architecture, design alternatives, modelling,
- OPS — operational analysis, incident/change support,
- AGENTIC — agent workflow or agent chain producing artifacts or executing steps.

Scope CODE, OPS and AGENTIC require stricter evidence and review.

AGENTIC scope requires documented workflow, versioning, tool boundaries and isolated test evidence.

## Framing Input Handling: Story Ideas

The project source material may contain framing-level user story ideas with value intent and expected behavior.

AI must not treat framing-level story ideas as implementation-ready Delivery Stories.

Framing-level story ideas are refinement inputs, not build authorization.

A framing-level story idea may be used as input to create an AI-proposed Delivery Story, but it must first be refined through the Level 3 handoff workflow and marked as provisional until accepted by the user proxy or mandate holder.

For each story idea, AI must classify it as one of:

- Candidate Delivery Story — likely implementable after refinement.
- Exploration Story — requires investigation, design validation or technical spike.
- Epic Candidate — too broad and should be split into multiple Stories.
- Acceptance Criteria Candidate — useful behavior statement but not a Story.
- Journey / UX Context — useful for user flow, screen model or interaction risk.
- Out of Scope / Deferred — outside approved scope or requires later decision.

Each refined AI-proposed Delivery Story must include:

- Story-ID or proposed Story-ID,
- source story idea reference,
- value intent,
- expected behavior,
- linked or provisional Epic,
- linked or provisional Outcome,
- AI-proposed acceptance criteria,
- AI Acceleration Level,
- AI Usage Scope,
- test definition,
- Definition of Done where available,
- open questions,
- risk notes,
- approval status,
- required handoff references.

Story ideas must be processed through the required Level 3 role mandates:

- Analyst classifies the story idea, ambiguity, baseline source and scope fit.
- Product / PM / Value Owner validates value intent, priority and acceptance direction.
- UX Designer maps journey, screen implications, interaction risk and accessibility notes.
- Solution / AI Delivery Architect assesses technical feasibility, architecture impact, data/security/dependency risk and Level 3 suitability.
- Developer may only implement after the required pre-implementation handoffs and Development Plan exist.
- QA/AQA must review implementation against the refined Story, baseline, handoffs, tests and risk ledger.

AI may propose acceptance criteria from expected behavior, but must mark them as AI-proposed until accepted.

Implementation may not start directly from a framing-level story idea unless:

- it has been refined into a Delivery Story,
- required Level 3 handoffs exist,
- the Development Plan exists,
- the implementation remains inside approved scope,
- no unaccepted high risk exists,
- test or verification evidence can be produced.

AI must ask for a value checkpoint when:

- the story idea changes product direction,
- several possible value interpretations exist,
- prioritization affects what gets built first,
- expected behavior is materially ambiguous,
- implementation would change UX materially,
- implementation affects data, security, architecture, dependencies, cost, release risk or scope,
- residual risk requires acceptance.

AI must not ask the user to approve low-risk refinement mechanics such as internal naming, story splitting, test naming, file organization or obvious acceptance-criteria drafting when value intent is clear and risk remains inside approved scope.

AI may batch multiple refined story ideas into one concise value checkpoint.

If implementation proceeds from AI-proposed Stories without individual user acceptance, the final report must disclose that these Stories were AI-refined within approved scope and identify any remaining acceptance or release risk.

If the framing input is incomplete, AI must log missing information and either:

- continue with provisional mapping if risk is low,
- ask the user for missing business context,
- classify the item as Exploration,
- or defer implementation.

## Required Role Mandates

The workflow must explicitly cover these role mandates.

A mandate may be executed by a human, agent, or combined role, but responsibility and approval authority must be clear.

### Analyst

Responsibilities:

- requirement interpretation,
- ambiguity log,
- baseline mapping,
- source-of-truth identification,
- scope-in/scope-out validation,
- unresolved assumption register,
- classification of framing-level story ideas,
- vocabulary and terminology ambiguity detection.

Default artifact:

`docs/agent-handoffs/01-analyst-handoff.md`

Must include:

- interpreted requirements,
- ambiguity log,
- source baseline,
- scope-in items,
- scope-out items,
- assumptions,
- missing information,
- initial risk notes,
- story idea classification where relevant,
- terminology assumptions and ambiguities.

### Product / PM / Value Owner

Responsibilities:

- Outcome validation,
- scope and priority,
- acceptance criteria,
- decision classification,
- MVP/release boundary,
- value checkpoint preparation,
- residual risk acceptance through human/user-proxy approval.

Default artifact:

`docs/agent-handoffs/02-product-handoff.md`

Must include:

- Outcome statement,
- Value Spine draft,
- Epic list,
- prioritization,
- acceptance principles,
- explicit decisions,
- deferred decisions,
- user-proxy approvals,
- residual risks requiring human acceptance,
- handling of story ideas and AI-proposed Stories.

### UX Designer

Responsibilities:

- journey-to-screen model,
- interaction risks,
- accessibility notes,
- usability assumptions,
- user flow and navigation implications,
- UX classification of story ideas.

Default artifact:

`docs/agent-handoffs/03-ux-handoff.md`

Must include:

- journey context,
- screen model,
- primary user flows,
- interaction risks,
- accessibility considerations,
- mobile/responsive considerations if relevant,
- UX acceptance notes,
- story ideas classified as Journey / UX Context where relevant.

### Solution / AI Delivery Architect

Responsibilities:

- technical design,
- data model,
- architecture constraints,
- dependency review,
- security review,
- AI workflow and tool boundary definition,
- reproducibility approach,
- architecture risks,
- technical classification of story ideas,
- behavioural contract surface identification,
- compatibility policy assessment,
- AI technical debt assessment,
- downgrade recommendation if Level 3 is not justified.

Default artifact:

`docs/agent-handoffs/04-architecture-handoff.md`

Must include:

- architecture overview,
- data model,
- constraints,
- dependencies,
- security and privacy notes,
- AI workflow boundaries,
- tool access boundaries,
- reproducibility requirements,
- test strategy,
- behavioural contract test approach where relevant,
- compatibility decision where relevant,
- technical debt risks,
- Level 3 feasibility assessment,
- architecture impact of story ideas.

### Developer

Responsibilities:

- implementation plan,
- code changes,
- Story-ID mapping,
- trace mapping from requirement to code and test,
- implementation notes,
- local verification,
- specification correction when implementation reveals spec gaps.

Default artifact:

`docs/agent-handoffs/05-development-plan.md`

Must include:

- implementation plan,
- files to change or create,
- Story-to-code mapping,
- technical decisions,
- compatibility decisions where relevant,
- local test plan,
- behavioural contract test plan where relevant,
- expected outputs,
- known implementation risks,
- technical debt risks.

Creating, modifying or deleting runtime/application code counts as implementation.

No code implementation may start until Analyst, Product/PM, UX and Architect handoffs exist, unless a documented exception approval exists.

### AI Quality Authority / QA Reviewer

Responsibilities:

- review of AI-generated artifacts,
- acceptance audit,
- regression risk assessment,
- test evidence verification,
- review against baseline,
- review against Value Spine,
- review against risk ledger,
- review of story idea refinement quality,
- review of specification corrections,
- review of compatibility decisions,
- review of AI technical debt,
- authority to block final delivery if evidence is insufficient.

Default artifact:

`docs/agent-handoffs/06-qa-review.md`

Must include:

- review scope,
- reviewed artifacts,
- acceptance criteria audit,
- test evidence,
- behavioural contract coverage,
- regression risks,
- security/privacy risks,
- specification correction review,
- compatibility review,
- AI technical debt review,
- unresolved gaps,
- release recommendation,
- whether QA was independent or simulated,
- review of how story ideas were refined into Delivery Stories.

QA must not claim independent approval if performed by the same AI system that generated the implementation.

### Tech Writer / Reporter

Responsibilities:

- customer-facing traceability report,
- implementation comparison,
- unresolved risk summary,
- retrospective report,
- final evidence pack summary.

Default artifact:

`docs/agent-handoffs/07-final-report.md`

Must include:

- what was requested,
- what was implemented,
- what changed,
- what was not implemented,
- what was deferred,
- what was out of scope,
- test evidence summary,
- behavioural contract test summary where relevant,
- risk summary,
- specification corrections,
- compatibility decisions,
- AI technical debt summary,
- vocabulary assumptions,
- actual AI level achieved,
- distinction between actual multi-agent execution and simulated role reasoning,
- how framing-level story ideas were refined into AI-proposed Delivery Stories,
- final release recommendation.

The final report may recommend release, conditional release, pause or downgrade. It must not approve release unless a human mandate holder or user proxy approval is logged.

## Handoff Rules

Each role must produce a handoff artifact in:

`docs/agent-handoffs/`

Required minimum artifacts:

- `01-analyst-handoff.md`
- `02-product-handoff.md`
- `03-ux-handoff.md`
- `04-architecture-handoff.md`
- `05-development-plan.md`
- `06-qa-review.md`
- `07-final-report.md`
- `workflow-log.md`

Implementation may not start until these exist:

- Analyst handoff,
- Product/PM handoff,
- UX handoff,
- Architecture handoff.

Then AI must produce a Development Plan.

Only after that may implementation begin.

Exception is allowed only if a documented exception approval exists in:

`docs/agent-handoffs/workflow-log.md`

A missing handoff must be treated as a governance gap, not ignored.

## Exception Approval

Any bypass must be documented in:

`docs/agent-handoffs/workflow-log.md`

The bypass record must include:

- approving human or user-proxy approval,
- whether the approver is actual mandate holder, delegated proxy or unverified proxy,
- reason for exception,
- affected Story-ID or artifact,
- accepted risk,
- required compensating control,
- expiry or follow-up condition,
- whether the bypass affects release eligibility.

A bypass does not remove the requirement for:

- retrospective traceability,
- risk logging,
- QA review,
- final-report disclosure.

AI may not use a bypass to override explicit scope-out.

## AI Risk Ledger

For Level 3, the orchestrator must maintain an AI Risk Ledger.

Default artifact:

`docs/governance/ai-risk-ledger.md`

If the project already uses a Risk Register, it may be used as the equivalent artifact only if it contains the required AI-specific risk fields.

The AI Risk Ledger must include:

- risk ID,
- affected Outcome/Epic/Story,
- risk description,
- risk category,
- probability,
- impact,
- mitigation,
- risk owner,
- acceptance status,
- release impact,
- review date or status,
- whether user-proxy approval was used.

Risk categories should include where relevant:

- technical risk,
- data/privacy risk,
- security risk,
- AI/reproducibility risk,
- test/regression risk,
- usability risk,
- operational risk,
- scope risk,
- dependency risk,
- governance risk,
- compatibility risk,
- AI technical debt risk,
- specification drift risk.

Unaccepted high risks must block release unless explicit user-proxy or mandate-holder acceptance is logged and QA records the exception.

Low risks that are fully mitigated may be summarized rather than escalated to the user.

## Agent Workflow Evidence

The orchestrator must maintain a workflow log.

Default artifact:

`docs/agent-handoffs/workflow-log.md`

The workflow log must show:

- role order,
- handoff status,
- agent or human executing each role,
- whether execution was actual multi-agent or simulated role reasoning,
- decisions made,
- unresolved ambiguities,
- bypasses,
- approvals,
- risks escalated,
- final release recommendation.

The workflow log must include:

`Actual vs Simulated Execution`

This section must state:

- whether separate agents were used,
- whether a single AI simulated multiple roles,
- what compensating controls were used,
- which reviews were independent,
- which reviews were simulated,
- whether this affects the achieved AI level.

## AI Delivery Blueprint

For Level 3, AI must produce or update an AI Delivery Blueprint.

Default artifact:

`docs/governance/ai-delivery-blueprint.md`

The AI Delivery Blueprint must include:

- selected AI Acceleration Level,
- justification for Level 3,
- risk profile,
- AI Usage Scopes,
- agent/workflow structure,
- tool boundaries,
- prompt/workflow versioning approach,
- reproducibility approach,
- review requirements,
- test requirements,
- behavioural contract test approach,
- compatibility policy,
- technical debt monitoring approach,
- downgrade triggers.

If this artifact cannot be produced, full Level 3 completion must not be claimed.

## AAS Evidence Pack

Before final delivery, AI must produce or update an AAS Evidence Pack.

Default artifact:

`docs/governance/aas-evidence-pack.md`

The AAS Evidence Pack must contain:

- Outcome/Epic/Story/Test trace,
- implementation map,
- AI usage log,
- agent or simulated-agent workflow log reference,
- risk ledger reference,
- decision log reference,
- test evidence,
- behavioural contract test evidence where relevant,
- specification correction log or summary,
- compatibility decisions,
- AI technical debt summary,
- vocabulary assumptions where relevant,
- unresolved gaps,
- scope-out decisions,
- release recommendation,
- human/user-proxy approvals and exceptions,
- actual achieved AI level,
- how framing-level story ideas were refined and governed.

## Decision Log

The orchestrator must maintain a decision log.

Default artifact:

`docs/governance/decision-log.md`

The decision log must include:

- decision ID,
- date/time if available,
- decision description,
- decision type,
- affected Outcome/Epic/Story,
- decision owner or user proxy,
- rationale,
- alternatives considered if relevant,
- risk impact,
- follow-up action.

Decision types:

- SCOPE,
- VALUE,
- RISK,
- ARCHITECTURE,
- UX,
- TEST,
- SECURITY,
- DATA,
- DELIVERY,
- RELEASE,
- EXCEPTION,
- SPEC_CORRECTION,
- COMPATIBILITY,
- TECH_DEBT.

Low-risk autonomous AI decisions may be logged in summarized form rather than individually when they do not materially affect value, scope, risk, UX, data, security, architecture, dependencies or release.

## Traceability Map

The orchestrator must maintain a traceability map.

Default artifact:

`docs/traceability/implementation-map.json`

or an equivalent project-defined traceability artifact.

It must map:

- Outcome,
- Epic,
- Story,
- source story idea where relevant,
- acceptance criteria,
- implementation files,
- tests,
- behavioural contract tests where relevant,
- AI-generated artifacts,
- review evidence,
- status.

The final report must summarize traceability coverage and identify any untraced artifacts.

Untraced runtime/application artifacts must be treated as release risks until classified.

## Scope-Out and Risk Boundaries

Explicit scope-out must be treated as a hard boundary.

AI may not implement or silently prepare functionality that changes the risk profile without documented approval.

Examples of risk-profile-changing work include:

- external data transfer,
- hosted backend,
- cloud sync,
- authentication,
- payment integration,
- bank integration,
- automated cancellation or external supplier action,
- sensitive data processing beyond approved local scope,
- production deployment,
- analytics/tracking,
- third-party data sharing.

If such work appears necessary, AI must stop and request user-proxy approval with risk explanation.

## Specification Correction Loop

If implementation or testing reveals that the baseline, specification, Story, expected behavior or acceptance criteria were incomplete, incorrect or ambiguous, AI must update the relevant specification artifact before claiming completion.

AI must not silently fix code while leaving the governing specification stale.

The correction must be logged in the decision log and reflected in the traceability map.

Specification correction must include:

- what was wrong, missing or ambiguous,
- affected Outcome/Epic/Story/Test,
- updated requirement or acceptance criterion,
- implementation impact,
- test impact,
- whether human value approval is required.

AI may perform low-risk specification corrections autonomously when:

- the correction clarifies already approved value,
- no scope expansion occurs,
- no material UX/data/security/architecture/release risk changes,
- tests can verify the corrected behavior.

AI must ask for a value checkpoint when the correction changes value direction, scope, expected behavior, release risk or residual risk.

## Behavioural Contract Testing

AI must identify the most important behaviour surface for the system or change.

Examples:

- API contract tests,
- message replay scripts,
- golden input/output fixtures,
- UI journey tests,
- import/export roundtrip tests,
- data pipeline replay tests,
- CLI command output snapshots,
- domain calculation examples.

When practical and proportionate to risk, AI should define behavioural contract tests that make expected behaviour visible and regression-detectable.

Behavioural contract tests must be linked to Story-ID or requirement source.

For Level 3, behavioural contract tests should be treated as preferred evidence for user-visible, API-visible, message-visible, import/export-visible or workflow-visible behaviour.

If no behavioural contract test is practical, AI must explain the chosen alternative verification approach in test evidence and QA review.

AI must prefer behaviour-level validation for changes where unit tests alone would not reveal user-visible or integration-visible regression.

## Compatibility Policy

AI must not create compatibility layers, legacy adapters or backward-compatible behavior unless one of the following is true:

- the baseline explicitly requires compatibility,
- the user proxy approves it,
- removal would create unacceptable data, user or release risk,
- it is documented as a temporary migration step with a follow-up removal condition.

Unrequested compatibility preservation must be logged as a potential technical debt risk.

If a functional interface is being changed, AI must determine and document one of:

- preserve compatibility,
- intentionally break compatibility,
- migrate and remove old path,
- maintain temporary compatibility with removal condition,
- defer compatibility decision to user proxy.

AI must ask for a value checkpoint if compatibility affects user behavior, external contracts, data migration, release risk or scope.

## AI Technical Debt Monitoring

AI must identify potential AI-generated technical debt, including:

- unnecessary compatibility layers,
- duplicated logic,
- unclear ownership,
- brittle generated code,
- overfitted tests,
- excessive abstraction,
- hidden coupling,
- unexplained generated code,
- generated code that future maintainers may not understand,
- agent-created code paths that lack clear human ownership,
- large changes that reduce maintainability despite passing tests.

Material AI technical debt must be logged in the AI Risk Ledger or technical debt log and summarized in the final report.

If the project has a technical debt log, use it. Otherwise, create or update:

`docs/governance/technical-debt-log.md`

AI technical debt entries should include:

- debt ID,
- affected file/module,
- affected Outcome/Epic/Story,
- description,
- risk,
- recommended mitigation,
- urgency,
- owner or proposed owner,
- whether it blocks release.

AI may continue with low technical debt if it is logged and does not materially affect release risk. Medium or high technical debt must be summarized before final delivery recommendation.

## Shared Vocabulary

AI must use project terminology consistently.

If the project contains a glossary, vocabulary, ubiquitous language, domain model or terminology section, AI must follow it.

If terminology is unclear or inconsistent, AI must create or update:

`docs/governance/vocabulary.md`

or record vocabulary assumptions in the Analyst handoff and requirements baseline.

The vocabulary artifact should include:

- term,
- definition,
- source,
- synonyms or forbidden synonyms,
- ambiguity notes,
- affected Stories or modules.

AI must not invent new domain terms when existing terms are available.

If different project artifacts use different terms for the same concept, AI must document the mapping and avoid silently mixing them.

AI should ask the user only when terminology ambiguity affects business meaning, value, scope, data, UX or release risk.

## QA and Release Gate

QA must review implementation against:

- original baseline,
- Value Spine,
- role handoffs,
- refined story ideas and AI-proposed Delivery Stories,
- acceptance criteria,
- test evidence,
- behavioural contract tests where relevant,
- specification corrections,
- compatibility decisions,
- AI technical debt,
- vocabulary consistency,
- AI Risk Ledger,
- known gaps,
- scope-out decisions,
- implementation map,
- security/privacy constraints,
- reproducibility requirements.

Final delivery is blocked if critical evidence is missing for:

- regression,
- acceptance,
- security,
- data/privacy,
- reproducibility,
- traceability.

Exception is allowed only if:

- the Value Owner explicitly accepts the residual risk through the user proxy or named mandate holder,
- the AI Quality Authority records the exception,
- the exception appears in the final report,
- compensating controls are documented.

## Testing Requirements

Each Story must have a Test Definition.

Test Definition must state:

- test level,
- automation status,
- test file or test evidence,
- behavioural contract surface where relevant,
- coverage expectation,
- whether manual verification is acceptable,
- whether regression testing is required.

For Level 3, AI must prefer:

- automated regression suite,
- reproducible test runs,
- isolated testing of agent workflows,
- traceability from test to Story-ID,
- behavioural contract tests for user-visible or integration-visible behavior.

If automated browser/E2E testing is missing for UI-critical work, this must be logged as a quality risk and reflected in the achieved AI level.

AI must record:

- test commands run,
- results,
- tests not run,
- reason tests were not run,
- residual risk from missing tests,
- recommended next test step.

AI should not ask the user which test file names or test structure to use unless the choice affects architecture, tooling, cost, dependencies or release risk.

## Reproducibility Requirements

For Level 3, AI must document:

- AI model/tool used if known,
- agent/workflow structure,
- prompt or instruction version if available,
- relevant input artifacts,
- generated output artifacts,
- tool boundaries,
- test evidence,
- behavioural contract evidence where relevant,
- specification corrections,
- compatibility decisions,
- steps required to reproduce or review the work.

If exact reproduction is not possible, AI must state the limitation and provide best available reproducibility evidence.

## Downgrade Rule

If Level 3 evidence cannot be produced, AI must not claim full Level 3 completion.

Full Level 3 may be claimed only if all required handoffs exist, AI Risk Ledger exists, AI Delivery Blueprint exists, Evidence Pack exists, QA review exists, actual vs simulated execution is disclosed, story ideas have been refined before implementation, and implementation artifacts are mapped to Outcome/Epic/Story/Test evidence.

AI must explicitly recommend one of:

- proceed as Level 3,
- proceed as Level 2 with Level 3 controls,
- pause implementation until missing governance or test evidence exists,
- request documented exception approval through the user proxy.

The final report must state the actual achieved AI level, not only the requested level.

Downgrade must be recommended if any of the following are true:

- Value Spine is incomplete,
- baseline is missing or unverifiable,
- AI Risk Ledger is missing,
- AI Delivery Blueprint is missing,
- critical test evidence is missing,
- no meaningful QA review occurred,
- the same AI produced and approved its own work without disclosure,
- scope or risk approval is unclear,
- unresolved high risk has not been accepted,
- implementation artifacts lack Story-ID mapping,
- framing-level story ideas were implemented without refinement into Delivery Stories or documented exception,
- governing specification remained stale after material implementation correction,
- material AI technical debt is unlogged,
- compatibility decisions materially affect release and are undocumented.

## Communication Protocol

AI must keep the user informed at major control points:

- after initial interpretation,
- before implementation starts,
- when a governance gap is found,
- when user-proxy approval is required,
- before final release recommendation.

Updates must be concise and must identify:

- current phase,
- value being created,
- completed handoffs,
- open risks,
- approval needed if any,
- next action.

AI may continue autonomously between checkpoints when work remains inside approved scope and required handoffs exist.

AI must not claim to work asynchronously or in the background. It must perform work in the current interaction context and report what was actually completed.

## Human Mandate

AI may produce:

- analysis,
- requirements interpretation,
- refinement,
- code,
- tests,
- documentation,
- reports,
- recommendations.

AI may not:

- accept risk,
- approve release,
- expand scope beyond approved boundaries,
- override scope-out,
- approve its own quality,
- hide uncertainty,
- hide unresolved assumptions,
- claim independent review when review was simulated,
- claim Level 3 completion without Level 3 evidence.

Final responsibility remains with the assigned human mandate holder.

If no separate mandate holder is reachable, the user proxy is treated as the channel for that mandate holder’s decision, and the decision must be logged as such.

If the user proxy’s mandate is unclear, AI may proceed only by logging the approval as unverified proxy approval and recording the residual governance risk.

## Final Report Requirements

The final report must include:

1. Requested AI Acceleration Level.
2. Actual achieved AI Acceleration Level.
3. Reason for any downgrade.
4. Outcome/Epic/Story/Test coverage.
5. Summary of implemented scope.
6. Summary of not implemented or deferred scope.
7. Scope-out confirmation.
8. Test evidence summary.
9. Behavioural contract test summary where relevant.
10. Risk ledger summary.
11. Decision log summary.
12. Specification corrections made.
13. Compatibility decisions.
14. AI technical debt summary.
15. Vocabulary or terminology assumptions.
16. Actual vs simulated multi-agent execution.
17. QA independence statement.
18. User-proxy approvals and exceptions.
19. Unresolved risks.
20. Release recommendation.
21. Recommended next control step.
22. How framing-level story ideas were classified and refined.
23. Value created or expected value supported by the delivery.

The final report must be explicit, auditable and honest.

It must not overstate completion, independence, testing, approval or Level 3 compliance.

## Lightweight Level 3 Update Path

For minor documentation-only or non-runtime changes, AI may use a lightweight Level 3 update path, but must still update:

- workflow-log,
- affected traceability artifacts,
- decision log if a decision was made,
- risk notes if relevant,
- vocabulary if terminology is affected,
- technical debt log if technical debt is identified,
- final disclosure if relevant.

Runtime, data, security, UX-critical, architecture-impacting, dependency-impacting, release-impacting or scope-impacting changes always require the full workflow.

## Value Checkpoint Format

When AI needs human input, it must use this format:

VALUE CHECKPOINT

Decision needed:
[One sentence]

Recommended option:
[Clear recommendation]

Why this creates value:
[Explain expected value/outcome]

Alternatives:
[Brief alternatives]

Risk if approved:
[Risk]

Risk if not approved:
[Risk]

Affected Value Spine:
[Outcome/Epic/Story]

Blocks implementation:
[Yes/No]

Suggested response:
APPROVE / APPROVE WITH CONDITION / REJECT / DEFER / REQUEST CHANGE

AI must not use this format for low-risk delivery mechanics. It is reserved for value, scope, risk, release or business-context decisions.

## Operating Instruction

Start by initializing the governance and handoff structure.

Before implementing, produce:

- Analyst handoff,
- Product/PM handoff,
- UX handoff,
- Architecture handoff.

Then produce the Development Plan.

Only then implement.

After implementation, produce:

- QA Review,
- Evidence Pack,
- Final Report.

If terminology is unclear, create or update vocabulary.

If material technical debt is identified, create or update technical debt log.

If compatibility decisions are relevant, document them before final delivery.

If implementation or testing reveals spec gaps, update the relevant specification artifact before claiming completion.

If the repository or tool context prevents creating files, provide the full content of each required artifact in the response and clearly state which files should be created manually.

Proceed under these rules unless the human user explicitly changes the requested acceleration level or delivery mode.

Human Mandate, scope-out boundaries, traceability requirements, and truthful reporting of actual achieved level may not be waived by informal instruction.

### Deviations from Recommended Defaults
- No preferences currently deviate from the recommended defaults.

### Warnings / Validation Notes
- No hard validation issues or warnings are currently active.

### Generated Downstream Guidance
#### Epic Refinement Guide
- Interpret Epic refinement through the AD delivery posture at AI Level 3.
- Keep the main delivery structure Outcome -> Epic -> Story -> Test intact.
- Keep each Epic centered on one coherent capability/value area: AI should refine Epics into coherent value/capability containers.
- Separate user-facing Epics from enabling/platform/compliance Epics: AI should split enabling work into distinct Epics.
- Minimize cross-Epic dependencies: AI should reduce coupling between Epics.
- Preserve Journey Context during Epic refinement: AI should preserve journey influence in Epic refinement.
- Prefer standard patterns before variants: AI should challenge local variants and seek reusable Epic patterns.
- Model transition/coexistence work as explicit Epics: AI may mix transition work into target-state Epics.
- Model operability/stability work as explicit Epics: AI may keep focus on visible change only.
- Always-on controls remain active: Preserve Epic -> Story -> Test traceability; Preserve AI-level-specific review expectations; Preserve human approval on critical decisions; Preserve security/privacy/compliance constraints; Preserve testability and binary acceptance intent; Preserve reproducibility expectations at higher AI levels.
#### Story Idea Refinement Guide
- Refine Story Ideas so they remain mappable to later implementation and test intent.
- Keep each Story Idea centered on one primary intent: AI should split oversized Story Ideas into focused candidates.
- Tie each Story Idea to an actor, journey step, or trigger: AI should preserve role/flow/trigger context.
- Split large Story Ideas before Design if verification would be hard: AI should split Story Ideas that would be hard to verify.
- Require future testability when refining Story Ideas: AI must reformulate Story Ideas so they can become testable later.
- Keep architecture direction lightweight at Story Idea level: AI should avoid premature architecture lock-in.
- Force Story Type classification during refinement: AI should classify Story Ideas explicitly.
- Force AI Usage Scope visibility when downstream AI is expected: AI should mark expected AI usage scope explicitly.
- Require rollback/fallback thinking for risky Story Ideas: AI may postpone rollback/fallback thinking.
- Do not let downstream AI remove testability, traceability, or human review expectations.
#### Journey Usage Guide
- Journey Context exists and should be considered when refining Epics, Story Ideas, Design guidance, and Build guidance.
- Use Journey Context as a primary refinement source when present: AI should actively use Journey Context to refine Epics and Story Ideas.
- Preserve journey-to-story traceability when Journey Context exists: AI should preserve visible traceability between Journey elements and Story Ideas.
- Allow AI to suggest missing journey/story mappings: AI should propose likely Story/Epic mappings where missing.
- Prefer actor and flow continuity when Journey Context exists: AI should favor actor/flow continuity when refining.
- Allow Story Ideas to stand without Journey Context when Journey Context is absent: AI should proceed normally even if no Journey Context exists.
- If Journey Context is absent, do not block Story Idea refinement solely because journey data is missing.
#### Design AI Guidance
- In Design, inherit the Source of Truth from Outcome, Problem, Baseline, Solution Context, Constraints, UX Principles, Non-functional Requirements, Additional Requirements, Data Sensitivity, Journey Context when present, Epics, Story Ideas, and optional references.
- Optimize for modularity and future changeability: AI should prefer changeable modular structures.
- Prefer reuse when fit-for-purpose: AI may propose more net-new implementation.
- Prefer integration discipline over shortcuts: AI should avoid tactical shortcuts in integration design.
- Make data ownership and classification explicit: AI must keep data ownership/classification explicit.
- Preserve security/privacy/compliance in design proposals: AI must embed security/privacy/compliance constraints in design proposals.
- Make observability and operability part of Design: AI should include observability/operability in design thinking.
- Separate experimentation zones from stable zones: AI should preserve exploration vs. stable separation.
- Prefer continuity over architectural purity when needed: AI may favor cleaner target architecture over safer transition.
- Prefer phased rollout over big bang: AI may allow larger cutover plans.
- Security, privacy, compliance, and data classification constraints must stay active in every design proposal.
#### Build AI Guidance
- In Build, preserve Story and Epic lineage, review discipline, test expectations, release evidence, and rollout control.
- Require Story and Epic traceability for all implementation work: AI must preserve explicit Story/Epic traceability.
- Require traceability for AI-generated implementation artifacts: AI output must remain traceable.
- Enforce AI-level-specific review and reproducibility rules: AI must tailor Build guidance to AI level.
- Require test strategy proportional to Story risk/type: AI must require verification proportional to risk and type.
- Require architecture/security checks in review or CI/CD: AI should include structural/security checks in Build guidance.
- Prefer automatically generated release evidence: AI should assume evidence generation where practical.
- Treat support/runbook/handover updates as part of done: AI may focus mainly on code/test.
- Prefer low blast radius and reversibility in rollout: AI may allow broader-impact changes.
- Allow emergency handling only with retroactive traceability: AI may normalize emergency shortcuts.
- Review strictness and reproducibility must remain aligned with AI Level 3.

## Tollgate 1 Approval Context
Approval status: Approved
Approved version: 15
Approved at: 2026-05-19T20:54:00.836Z
- aqa (supplier)
  Person: Denzel Washington
  Role title: AI Quality Authority
  Approved at: 2026-05-19T20:54:00.776Z
  Motivation: ok
- value owner (customer)
  Person: Anne Hathaway
  Role title: Value Owner
  Approved at: 2026-05-19T20:53:52.515Z
  Motivation: Ok

## Recommended Use In The Next Step
Use this Framing package as the governed source of truth when you move into design, story refinement or structured delivery planning with BMAD or another AI tool.
- Treat the customer handshake, baseline and AI/risk posture as the framing source of truth.
- Treat Epics and Story Ideas as directional input for design and later delivery refinement, not as fixed implementation steps.
- If later steps create Delivery Stories or extra work items, keep them traceable back to this Framing package or record them explicitly as feedback-loop additions.
- Use the approval section to understand whether this Framing version is already signed off for Tollgate 1.
- Use the UX sketch references where they exist to preserve visual intent in the next step.

## Export Metadata
Lifecycle state: active
Origin type: imported
Exported at: 2026-05-19T20:54:01.087Z