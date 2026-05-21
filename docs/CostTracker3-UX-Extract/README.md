# CostTracker3 UX Extract

Det här är en flyttbar snapshot av UX:en från CostTracker3.

## Innehåll

- `src/App.tsx` - komplett appskal med topbar, navigation, statusrutor, vyväxling, modaler och drawer.
- `src/components/` - alla återanvändbara vykomponenter: tidslinje, statistik, data/import/export, köp, hjälp, setup, formulär och detaljdrawer.
- `src/styles.css` - hela visuella systemet: tokens, layout, paneler, formulär, tabeller, mobilläge och responsiva brytpunkter.
- `src/domain/` och `src/storage/` - stödmoduler som komponenterna fortfarande importerar från. Ta med dem om du vill att snapshoten ska kompilera direkt.
- `docs/` - UX-handoffar som beskriver besluten bakom gränssnittet.
- `package.fragment.json` - beroenden och scripts som behövs i ett Vite/React-projekt.

## Snabb användning i annat projekt

1. Kopiera `src/components` och `src/styles.css` till nya projektet.
2. Installera beroenden från `package.fragment.json`, framför allt `react`, `react-dom` och `lucide-react`.
3. Importera CSS:en i nya projektets entrypoint:

```tsx
import './styles.css';
```

4. Om du vill använda hela upplevelsen direkt, kopiera även `src/App.tsx`, `src/domain` och `src/storage`.
5. Om nya projektet har egen data/domänlogik, börja med komponenternas props i `src/components/types.ts` och byt sedan ut importer från `../domain/*` och `../storage/*` stegvis.

## Bra startpunkter

- Full appkänsla: `src/App.tsx`
- Designspråk: `src/styles.css`
- Komponent-API: `src/components/types.ts`
- Dashboard/tidslinje: `src/components/TimelineView.tsx`
- Datahantering: `src/components/DataView.tsx`
- Köpflöde: `src/components/PurchasesView.tsx`

## Notering

Det här är en källkodssnapshot, inte ett publicerat npm-paket. Den är tänkt att vara lätt att kopiera, anpassa och sedan koppla mot ett annat projekts egen data.
