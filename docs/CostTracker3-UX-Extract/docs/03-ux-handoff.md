# UX Handoff - JNY-001 MVP

Source baseline: `docs/traceability/requirements-baseline.md` frozen 2026-05-07, governed by `docs/out-001-bmad-prepared-framing-handoff.md`.

## Journey Context

Selected journey: `JNY-001` - Skapa forsta kontrollbilden.

Primary actor: a new private user starting with an empty local app. The value moment is reached when the user has a saved wallet, at least one payer, at least one recurring cost, and a visible timeline that shows financial impact.

The MVP must feel like a private finance control plane: dense, calm, iOS-like, clean, and action-oriented. It should avoid marketing layout, oversized headings, oversized buttons, decorative dashboards, or generic card-heavy SaaS presentation. The interface should make sensitive local finance data feel contained, comparable, and under the user's control.

## Screen Model

- Empty start state: compact first-run surface with wallet creation as the main action, local-first/no account context visible but not alarming, and no dead panels.
- Wallet setup: focused onboarding panel or modal for wallet name, template/standard structure, and first payer. Payer creation is part of the first-run path, not a hidden settings dependency.
- First recurring cost modal: compact form for name, amount, period, payment day/month, payer, category, and vendor where available. Required fields must be visually distinct from optional completion data.
- Overview/timeline: primary MVP destination. Desktop uses rows for recurring costs and columns for months, with monthly totals visible in the header or summary strip. The first cost row should make amount, period, payer, category, and status scannable.
- Expense detail drawer: opens from the timeline row without losing the overview. Shows editable/completable fields, current data quality, and clear actions. On mobile this may become a full-height sheet.
- Navigation shell: persistent but restrained. For JNY-001, Overview, Register/Data affordances may exist only as supporting access; do not pull later-slice purchase/statistics/sync work into the MVP.

## Primary User Flows

1. Create first control picture: open empty app, create wallet, add first payer, choose template/standard structure, land in overview.
2. Add first recurring cost: open add-cost modal, enter minimum viable cost data, select payer and category, save, return to overview.
3. Understand first impact: see the cost row in the timeline, see monthly totals, and understand which months are affected.
4. Inspect and complete: open the row detail drawer, confirm the item can be edited or completed, then return to the timeline with context preserved.

## Interaction Risks

- Required setup can feel like friction if payer and template steps are too formal. Keep the first-run sequence short and make the reason for each field obvious.
- Timeline density can become unreadable on small screens. Mobile must switch to compact month cards/rows rather than compressing a desktop table.
- Local-first reassurance can become either invisible or scary. Use calm, precise copy: data stays in this browser/device; backup/export is a later capability unless explicitly in scope.
- Form completion can imply false precision. Distinguish minimum required fields from optional enrichment such as vendor detail or later cancellation metadata.
- Modals and drawers can stack awkwardly. Only one focused surface should be active at a time; creation/editing uses modal/sheet, inspection uses drawer/sheet.
- Category/payer defaults can create hidden assumptions. If defaults are used, show them visibly and allow easy change.

## Accessibility Considerations

- All money amounts, periods, status chips, category icons, and payer selectors need text labels; color and icon alone are not sufficient.
- Timeline cells must have accessible names that combine cost, month, amount, and active/inactive state.
- Keyboard users must be able to complete onboarding, save the first cost, open/close the detail drawer, and return focus to the originating row.
- Error messages must be field-specific, persistent until resolved, and not depend only on red borders.
- Maintain high contrast on muted Nordic-blue/neutrals, especially for secondary text, table borders, and active selection states.
- Respect reduced motion; any iOS-like sheet/drawer movement should not be required to understand state changes.

## Mobile And Responsive Notes

- Mobile first-run should be a linear path with compact sections, not a wide dashboard squeezed into cards.
- Timeline converts to month summaries plus recurring-cost rows/cards with expandable detail. Monthly total stays visible near the top of the viewport.
- Primary actions should be reachable without oversized buttons: a compact add action, clear labels, and stable tap targets.
- Drawer becomes a full-width bottom or full-height sheet on narrow screens, with sticky save/close actions only where they do not cover content.
- Long Swedish labels, currency amounts, chips, and category names must wrap or truncate intentionally; no overlapping text.

## UX Acceptance Notes

- A new user can reach a meaningful first overview without account creation, bank connection, server dependency, or purchase/import functionality.
- The first visible overview contains at minimum wallet context, payer context, one recurring cost row, a month total, and enough timeline structure to understand impact over time.
- The UI demonstrates the private finance control-plane direction: compact hierarchy, restrained surfaces, clear borders, table/list scanning, right-rail/drawer detail, and calm local-data messaging.
- Empty states point to the next relevant action and never leave a blank dashboard.
- JNY-001 delivery stories must preserve traceability to `OUT-001`, `JNY-001`, `EP-001`, `EP-002`, `EP-003`, and the linked Story Ideas.
- No runtime implementation should start from fallback-only story mappings without refined Delivery Stories.

## Story Ideas Classification

| Story Idea | Name | UX classification | Notes |
| --- | --- | --- | --- |
| `US-001` | Skapa forsta planboken | Journey-driving Candidate Story | Owns the empty-to-wallet transition in `JNY-001-STEP-01`. |
| `US-002` | Krava minst en forsta anvandare | Journey-driving Candidate Story | Required for payer-based summaries and first cost creation. |
| `US-008` | Skapa aterkommande manadsutgift | Journey-driving Candidate Story | Core add-cost modal behavior for the first meaningful row. |
| `US-015` | Valja betalande person | Supporting UX/register context | Should be embedded in first-cost creation; may refine into selector behavior rather than standalone screen. |
| `US-016` | Valja kategori | Supporting UX/register context | Should provide readable category identity through label, icon, and color with accessible fallback. |
| `US-020` | Visa aterkommande tidslinje | Journey-driving Candidate Story | Defines the desktop control-plane timeline model. |
| `US-022` | Visa manadstotaler | Journey-driving Candidate Story | Defines summary comprehension for the first control picture. |
| `US-007` | Visa tomt startlage | UX context for JNY-001 | Supports first-run state and should shape acceptance for the empty app. |
| `US-041` | Skapa standardregister i ny planbok | UX context for JNY-001 | Supports template/default structure; avoid hiding assumptions. |
| `US-087` | Responsiv huvudnavigation | UX context | Required for shell behavior, but keep later-slice destinations visually subordinate. |
| `US-089` | Visa tydliga tomlagen | UX context | Applies to empty wallet, empty timeline, and empty support panels. |
| `US-090` | Anvanda modaler for skapande/redigering | UX pattern context | Creation/editing should stay focused without routing away from the overview. |
| `US-091` | Anvanda drawer for detaljer | UX pattern context | Detail inspection should preserve overview context on desktop. |
| `US-092` | Undvika overlappande text i mobil | UX acceptance constraint | Treat as a responsive acceptance note for all MVP screens. |
