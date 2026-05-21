# UX Handoff - JNY-002 Cancellation Opportunity

Date: 2026-05-07
Status: Ready for architecture/development planning
Source: `OUT-001 -> JNY-002 -> EP-004/EP-008/EP-011 -> US-030/031/032/033/034/075/094`

## UX Intent

Help the user see when a recurring cost can realistically disappear, without making the app feel like it is cancelling anything for them. The experience should answer three questions quickly: what notice period applies, which months are still locked, and what is the first month where the cost can be gone.

This is a calm decision-support cue inside the existing timeline/detail model. Do not introduce reminders, calendar export, full simulation, provider-specific contract logic, or automatic cancellation.

## Current UI Fit

- Desktop already uses a timeline table with expense rows, month totals, and row selection.
- Mobile already switches from the desktop table to month summary cards.
- Expense details already open in a drawer on desktop and a bottom sheet on mobile.
- JNY-002 should extend these surfaces rather than creating a new destination.

## Notice Input

- Add a compact `Notice period` numeric input to the recurring expense form/detail edit flow.
- Input unit is whole months. Allow `0` to mean cancellable from the current month.
- Use helper copy only where needed: "Number of months before the cost can stop."
- Keep the input visually secondary to name, amount, payer, category, and start month.
- Invalid values should be corrected inline: no negative months, no decimals, no vague free-text such as "three".

## Detail Drawer

Show a dedicated cancellation section after the existing core details:

- `Notice period`: e.g. `3 months`.
- `Locked period`: e.g. `May-Jul 2026`.
- `Earliest free month`: e.g. `Aug 2026`.
- `Savings cue`: e.g. `From Aug 2026 this can free 399 SEK/month.`

The savings cue should feel useful, not salesy. Avoid alarm or pressure copy such as "act now", "wasted money", or "loss". If notice data is missing, show a quiet incomplete state: `Add notice period to see earliest free month.`

## Timeline Display

- In the desktop row, add a small secondary cue under the row title or in a compact status column: `Free from Aug 2026`.
- Do not crowd every month cell with cancellation text.
- Locked months should remain visually normal recurring-cost months; if highlighted, use a restrained border or muted label, not warning colors.
- Earliest free month may be marked in the month cell with a short accessible label, but the full explanation belongs in the detail drawer.
- Month totals remain the financial anchor; cancellation cues should not imply the total has changed until the expense is actually ended or simulated in a later slice.

## Mobile Behavior

- In month cards, show at most one short cancellation cue per affected expense: `Free from Aug 2026`.
- Avoid adding a second dense timeline inside the card. The card should still scan by month total first, then expense names and amounts.
- The detail sheet should present cancellation fields as stacked rows with enough spacing for long month labels.
- Numeric notice input must use the numeric keyboard where available and keep the unit label visible.

## Accessibility

- Timeline buttons/cells need accessible names that include expense name, amount, month, and cancellation state where present.
- The earliest-free cue must not rely on color alone; pair any visual marker with text.
- Detail drawer cancellation section needs semantic labels, preferably a `dl` like the existing detail list.
- Inline validation for notice months should be connected to the input with `aria-describedby`.
- Focus should return to the originating timeline row/card after closing the detail drawer.
- Savings cue changes after editing notice months should be announced politely, not assertively.

## Acceptance Notes

- User can enter notice months for a recurring expense.
- User can see locked period and earliest free month in the detail drawer.
- User can spot a cancellable opportunity from the timeline without losing the normal month-total scan.
- User sees a calm monthly savings cue that does not overstate automation or guarantee provider behavior.
- Mobile remains readable through month cards and the bottom-sheet detail view.
