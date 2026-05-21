# UX Inventory

## Shell

- `App.tsx`: aktiv plånbok, huvudnavigation, snabbåtgärd, modal för återkommande kostnad, detaljdrawer.
- `styles.css`: tokens, layout primitives, paneler, formulär, tabeller, cards, drawer, modal och mobillägen.

## Components

- `FirstRunSetup.tsx`: första start-vy.
- `TimelineView.tsx`: desktop-tabell och mobilkort för återkommande tidslinje.
- `RecurringExpenseForm.tsx`: skapa/redigera återkommande kostnad.
- `ExpenseDetailDrawer.tsx`: detaljer, uppsägning, påminnelse, bilagor och åtgärder.
- `PurchasesView.tsx`: köpregistrering, köplista och signaler.
- `PurchaseImportPanel.tsx`: import av CSV/XLSX/PDF/inklippt CSV.
- `StatisticsView.tsx`: statistikcards, rankpaneler och simuleringsbanner.
- `DataView.tsx`: backup, import/export, register, inställningar och syncpanel.
- `HelpView.tsx`: hjälpvy med lokala arbetsflöden.

## External UI Dependency

- `lucide-react` används för ikonografi i knappar, rubriker och statusytor.

## Coupling To Replace In A New Product

- Domäntyper och beräkningar ligger under `src/domain`.
- Lokal lagring och export ligger under `src/storage`.
- Vill du bara återanvända formspråk och komponentmönster kan du behålla `src/styles.css` och bygga nya dataadaptrar runt komponenternas props.
