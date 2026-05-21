import { BarChart3, BadgePercent, CircleDollarSign, ListChecks, RotateCcw, Store } from 'lucide-react';
import type { WalletStatistics } from '../domain/statistics';
import { formatMoney } from './TimelineView';

interface StatisticsViewProps {
  statistics: WalletStatistics;
  businessSignalLabel?: string;
  purchasesEnabled?: boolean;
  simulationActive?: boolean;
  simulationRemovedCount?: number;
  onResetSimulation?: () => void;
}

export function StatisticsView({
  statistics,
  businessSignalLabel = 'Business',
  purchasesEnabled = true,
  simulationActive = false,
  simulationRemovedCount = 0,
  onResetSimulation
}: StatisticsViewProps) {
  return (
    <section
      className="panel statistics-view"
      aria-labelledby="statistics-title"
      data-trace="DS-JNY006-01..04 / DS-JNY008-01..03 / DS-SIMULATION-001 / DS-RECURRING-ANALYSIS-001 / DS-RECURRING-TOPS-001 / DS-RECURRING-VS-PURCHASES-001 / DS-MERCHANT-RANKING-001 / DS-CATEGORY-RANKING-001 / DS-PURCHASE-INTELLIGENCE-001 / DS-PURCHASE-PERIODS-001 / DS-BUDGET-001..02 / DS-CANCEL-INFO-001"
    >
      <div className="panel__header">
        <div>
          <span className="eyebrow">Statistik</span>
          <h2 id="statistics-title">Beslutsstöd</h2>
          <p>Mest pengar och flest transaktioner visas separat så rankningen är lätt att lita på.</p>
        </div>
        <span className="chip">
          <BarChart3 aria-hidden="true" size={16} />
          Light
        </span>
      </div>

      {simulationActive ? (
        <div className="simulation-banner" role="status" data-trace="DS-SIMULATION-001">
          <div>
            <strong>Simulering aktiv</strong>
            <span>{simulationRemovedCount} post{simulationRemovedCount === 1 ? '' : 'er'} simuleras bort. Originaldata är oförändrad.</span>
          </div>
          {onResetSimulation ? (
            <button className="icon-button" type="button" onClick={onResetSimulation}>
              <RotateCcw aria-hidden="true" size={17} />
              Återställ simulering
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="statistics-grid">
        <InsightCard
          icon={<CircleDollarSign size={18} />}
          label="Återkommande per månad"
          value={formatMoney(statistics.recurringTotalMinor)}
          detail={`${statistics.recurringExpenseCount} aktiva poster`}
        />
        <InsightCard
          icon={<Store size={18} />}
          label={purchasesEnabled ? 'Importerade köp' : 'Köpmodul av'}
          value={purchasesEnabled ? formatMoney(statistics.purchaseTotalMinor) : 'Modul av'}
          detail={purchasesEnabled ? `${statistics.purchaseCount} köprader` : 'Aktiveras i Data'}
        />
        <InsightCard
          icon={<BadgePercent size={18} />}
          label="Onödigt markerat"
          value={purchasesEnabled ? formatMoney(statistics.unnecessaryPurchaseTotalMinor) : 'Modul av'}
          detail={purchasesEnabled ? `${statistics.reviewPurchaseCount} köp kvar att granska` : 'Inga köp visas'}
        />
        <InsightCard
          icon={<ListChecks size={18} />}
          label="Köpintelligens"
          value={purchasesEnabled ? formatMoney(statistics.averagePurchaseMinor) : 'Modul av'}
          detail={purchasesEnabled ? `${statistics.uniqueMerchantCount} handlare` : 'Inga köp visas'}
        />
      </div>

      <div className="statistics-layout">
        <RankPanel
          title="Återkommande kategori"
          emptyText="Skapa återkommande utgifter för att se kategori."
          item={statistics.topRecurringCategoryByAmount}
          metric="månadstakt"
        />
        <RankPanel
          title="Återkommande leverantör"
          emptyText="Koppla leverantör för att se återkommande topp."
          item={statistics.topRecurringVendorByAmount}
          metric="månadstakt"
        />
        <RankPanel
          title="Mest pengar"
          emptyText={purchasesEnabled ? 'Importera köp för att se största handlare.' : 'Köpmodulen är avstängd.'}
          item={purchasesEnabled ? statistics.topMerchantByAmount : null}
          metric="totalbelopp"
        />
        <RankPanel
          title="Flest transaktioner"
          emptyText={purchasesEnabled ? 'Importera köp för att se handlare med flest rader.' : 'Köpmodulen är avstängd.'}
          item={purchasesEnabled ? statistics.topMerchantByCount : null}
          metric="antal"
        />
        <RankPanel
          title="Största kategori"
          emptyText="Skapa utgifter eller köp för att se kategoripåverkan."
          item={statistics.topCategoryByAmount}
          metric="kategori"
        />
        <RankPanel
          title="Kategori antal"
          emptyText="Skapa utgifter eller köp för att se kategoriantal."
          item={statistics.topCategoryByCount}
          metric="antal"
        />
        <RankPanel
          title="Köp per månad"
          emptyText={purchasesEnabled ? 'Importera köp för att se månader.' : 'Köpmodulen är avstängd.'}
          item={purchasesEnabled ? statistics.topPurchaseMonth : null}
          metric="månad"
        />
        <RankPanel
          title="Köp per år"
          emptyText={purchasesEnabled ? 'Importera köp för att se år.' : 'Köpmodulen är avstängd.'}
          item={purchasesEnabled ? statistics.topPurchaseYear : null}
          metric="år"
        />

        <article className="statistics-card statistics-card--wide">
          <div className="statistics-card__title">
            <ListChecks aria-hidden="true" size={18} />
            <h3>Beslutsinsikter</h3>
          </div>
          <ul className="insight-list">
            <li>
              <span>{businessSignalLabel}markerade köp</span>
              <strong>{purchasesEnabled ? formatMoney(statistics.businessPurchaseTotalMinor) : 'Modul av'}</strong>
            </li>
            <li>
              <span>Köp kopplade till återkommande</span>
              <strong>{purchasesEnabled ? statistics.recurringLinkedPurchaseCount : 'Modul av'}</strong>
            </li>
            <li>
              <span>Uppsägningsinfo saknas</span>
              <strong>{statistics.missingCancellationInfoCount} poster</strong>
            </li>
            <li>
              <span>Budgetutfall</span>
              <strong>{formatBudgetOutcome(statistics)}</strong>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function formatBudgetOutcome(statistics: WalletStatistics) {
  if (statistics.monthlyBudgetTotalMinor <= 0 || statistics.budgetRemainingMinor === null) {
    return 'Ej aktiverat';
  }

  const remaining = statistics.budgetRemainingMinor;
  const prefix = remaining >= 0 ? 'kvar' : 'över';
  return `${formatMoney(Math.abs(remaining))} ${prefix} av ${formatMoney(statistics.monthlyBudgetTotalMinor)}`;
}

function InsightCard({
  icon,
  label,
  value,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="statistics-card">
      <div className="statistics-card__title">
        {icon}
        <h3>{label}</h3>
      </div>
      <strong className="statistics-value">{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function RankPanel({
  title,
  emptyText,
  item,
  metric
}: {
  title: string;
  emptyText: string;
  item: WalletStatistics['topMerchantByAmount'];
  metric: string;
}) {
  return (
    <article className="statistics-card">
      <div className="statistics-card__title">
        <BarChart3 aria-hidden="true" size={18} />
        <h3>{title}</h3>
      </div>
      {item ? (
        <dl className="rank-detail">
          <div>
            <dt>{metric}</dt>
            <dd>{item.label}</dd>
          </div>
          <div>
            <dt>Belopp</dt>
            <dd>{formatMoney(item.amountMinor)}</dd>
          </div>
          <div>
            <dt>Antal</dt>
            <dd>{item.count}</dd>
          </div>
        </dl>
      ) : (
        <p>{emptyText}</p>
      )}
    </article>
  );
}
