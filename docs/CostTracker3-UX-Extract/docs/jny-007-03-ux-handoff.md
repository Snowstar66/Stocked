# UX Handoff - JNY-007 Light Data View

Date: 2026-05-07
Status: Ready for architecture/development planning
Source: `OUT-001 -> JNY-007 -> EP-009/EP-012 -> US-076/077/079/099/100`, approved by `DEC-005`

## UX Intent

The Data view should make local data feel understandable and under the user's control. It reduces `RISK-003` by explaining browser-local storage calmly and by giving the user three deliberate actions: export JSON, import JSON, and clear local data.

This is a light MVP slice. Do not imply cloud backup, sync, encryption, account recovery, ZIP/CSV/PDF export, or bank/account connection.

## Screen Model

- Add `Data` as a restrained navigation destination beside `Overview`; keep the app feeling like the same private finance control plane.
- Use compact panels and action rows, not a marketing-style page or oversized warning area.
- Top of view: a quiet status summary with browser/device-local storage, schema/version if available, last updated if available, and current wallet/post count if easy to show.
- Primary action group: `Export JSON`, `Import JSON`, `Clear local data`.
- Secondary explanation: short, precise local-first note. The user should understand responsibility without feeling blamed.
- Keep destructive action visually separate from export/import. It may sit in a lower section with a neutral danger treatment, not a red alarm banner.

## Copy Tone

Use calm, factual Swedish UI copy. Avoid scary words such as "fara", "kritisk", "katastrof", "forlorar allt", or dramatic warnings.

Suggested copy direction:

- Local note: "Dina uppgifter sparas i den har webblasaren pa den har enheten. Inget skickas till en server."
- Backup nudge: "Exportera en JSON-fil om du vill flytta datan eller spara en egen kopia."
- Import note: "Import ersatter den lokala datan efter bekraftelse."
- Clear note: "Rensa lokal data startar om appen pa den har enheten."

Keep body copy to one or two short sentences per section. Labels should name the action directly.

## Action Behavior

| Action | UX behavior | Success state | Error/empty state |
| --- | --- | --- | --- |
| Export JSON | Button downloads the current app state as a JSON backup. | Brief inline confirmation such as "JSON-fil skapad." | If no usable state exists, explain that there is no local data to export and keep the button disabled or harmless. |
| Import JSON | Button opens a hidden file picker accepting JSON. Valid file requires confirmation before replacement. | Show "Import klar." and return to Overview or keep the user on Data with refreshed status. | Invalid file shows an inline, non-blocking error and must not overwrite current data. |
| Clear local data | Opens confirmation before clearing. | After confirmation, app returns to first-run state. | If clear fails, keep existing state and show a concise inline message. |

## Confirmation Rules

- Export does not need confirmation.
- Import needs a confirmation because it replaces local state. Confirmation copy should include the selected file name when available and state that current local data will be replaced.
- Clear needs a stronger confirmation. Use a modal or compact dialog with `Cancel` as the safe default and `Clear local data` as the explicit action.
- Do not stack confirmation dialogs. If import picker is open, no other focused surface should be active.
- After cancel, focus returns to the triggering button. After completion, focus moves to the resulting status message or first-run heading.

## Mobile Behavior

- Mobile uses a single-column Data view: status first, export/import actions, then clear action.
- Buttons should be stable, full-width or near full-width, with icons plus labels; avoid oversized hero buttons.
- Action descriptions wrap below the label; no text should overlap file names, amounts, or status chips.
- Confirmation dialogs become bottom sheets or centered modals with visible cancel/confirm actions above the fold.
- The clear action stays below export/import so the safest backup action is encountered first.

## Accessibility

- Each action button needs an accessible name matching the visible label.
- File input can be visually hidden only if the visible import button is keyboard reachable and correctly associated.
- Status and error messages should be announced with `role="status"` or `aria-live="polite"`; invalid import can use `aria-live="assertive"` only if the error blocks the flow.
- Confirmation dialogs need focus trap, Escape/cancel handling, labelled title, and focus restoration.
- Do not rely on color alone for destructive state; pair color with label and icon.
- Maintain high contrast on muted blue/neutral surfaces. Red should be reserved for the clear confirmation action, not the whole Data view.

## Acceptance Notes

- User can explain where their data is stored without encountering frightening copy.
- User can export before import or clear.
- Invalid import never replaces current data.
- Clear local data cannot happen accidentally.
- Mobile remains readable at narrow widths and does not squeeze a desktop table layout.
- No runtime work should introduce cloud sync, external services, extra export formats, or encryption/password promises in this slice.
