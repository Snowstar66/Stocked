import { FileText, HelpCircle, Repeat2, ShieldCheck, ShoppingBag, Tags } from 'lucide-react';

export function HelpView() {
  return (
    <section className="panel help-view" aria-labelledby="help-title" data-trace="DS-HELP-001">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Hjälp</span>
          <h2 id="help-title">Trygg lokal användning</h2>
          <p>Snabb översikt över begrepp, data och gränser i den här lokala versionen.</p>
        </div>
        <span className="chip">
          <HelpCircle aria-hidden="true" size={16} />
          Lokal MVP
        </span>
      </div>

      <div className="help-grid">
        <HelpItem
          icon={<ShieldCheck size={18} />}
          title="Lokal data"
          text="Datan sparas i browsern på den här enheten. JSON-backup är den säkra vägen för flytt eller återställning."
        />
        <HelpItem
          icon={<Repeat2 size={18} />}
          title="Återkommande utgifter"
          text="Månadsbelopp, betalare, kategori och uppsägningstid används för tidslinje, totals och budgetutfall."
        />
        <HelpItem
          icon={<ShoppingBag size={18} />}
          title="Köp"
          text="Enskilda köp kan skapas manuellt eller importeras från enkel CSV. Dubbletter hoppas över vid exakt match."
        />
        <HelpItem
          icon={<Tags size={18} />}
          title="Signaler"
          text="Granska, Onödigt, Värt det, Business och Återkommande är lokala markeringar för sortering och beslut."
        />
        <HelpItem
          icon={<FileText size={18} />}
          title="Export"
          text="JSON är backupformatet. CSV är en enkel kalkylblads-export och är inte en bokföringsrapport."
        />
      </div>
    </section>
  );
}

function HelpItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="help-item">
      <div className="help-item__title">
        {icon}
        <h3>{title}</h3>
      </div>
      <p>{text}</p>
    </article>
  );
}
