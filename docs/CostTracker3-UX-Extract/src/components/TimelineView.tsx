import { CalendarDays, ReceiptText } from 'lucide-react';
import { calculateCancellationOpportunity } from '../domain/cancellation';
import { toYearMonth } from '../domain/defaults';
import type {
  CategoryOption,
  PersonOption,
  RecurringExpense,
  TimelineModel,
  TimelineMonth,
  WalletOption
} from './types';

interface TimelineViewProps {
  wallet?: WalletOption;
  expenses: RecurringExpense[];
  payers?: PersonOption[];
  people?: PersonOption[];
  categories: CategoryOption[];
  timeline?: TimelineModel | null;
  months?: string[];
  currency?: string;
  onAddExpense?: () => void;
  onSelectExpense?: ((expense: RecurringExpense) => void) | ((expenseId: string) => void);
}

const periodStep = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
  one_time: 0
};

export function addMonths(month: string, offset: number): string {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

export function buildDefaultMonths(expenses: RecurringExpense[], count = 4): string[] {
  const firstStart = expenses
    .map((expense) => expense.startMonth)
    .filter(Boolean)
    .sort()[0];
  const start = firstStart ?? new Date().toISOString().slice(0, 7);

  return Array.from({ length: count }, (_, index) => addMonths(start, index));
}

export function expenseOccursInMonth(expense: RecurringExpense, month: string): boolean {
  if (expense.status === 'completed' || expense.status === 'archived' || month < expense.startMonth) {
    return false;
  }

  if (expense.period === 'one_time') {
    return month === expense.startMonth;
  }

  const [startYear, startMonth] = expense.startMonth.split('-').map(Number);
  const [targetYear, targetMonth] = month.split('-').map(Number);
  const diff = (targetYear - startYear) * 12 + targetMonth - startMonth;
  return diff >= 0 && diff % periodStep[expense.period] === 0;
}

export function buildTimelineMonths(expenses: RecurringExpense[], months: string[]): TimelineMonth[] {
  return months.map((month) => {
    const expenseRows = expenses.filter((expense) => expenseOccursInMonth(expense, month));
    return {
      month,
      expenseRows,
      monthTotalMinor: expenseRows.reduce((total, expense) => total + getExpenseAmountMinor(expense), 0)
    };
  });
}

export function formatMoney(amountMinor: number, currency = 'SEK'): string {
  const amount = amountMinor / 100;
  return `${amount.toLocaleString('sv-SE', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })} ${currency}`;
}

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('sv-SE', { month: 'short', year: 'numeric' }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1))
  );
}

function findName(items: Array<{ id: string; name: string }>, id: string) {
  return items.find((item) => item.id === id)?.name ?? 'Okänd';
}

export function TimelineView({
  wallet,
  expenses,
  payers,
  people,
  categories,
  timeline,
  months,
  currency,
  onAddExpense,
  onSelectExpense
}: TimelineViewProps) {
  const payerOptions = payers ?? people ?? [];
  const resolvedCurrency = currency ?? wallet?.currency ?? 'SEK';
  const timelineMonths = timeline?.months ?? buildTimelineMonths(expenses, months ?? buildDefaultMonths(expenses));
  const rows = timeline?.rows ?? expenses;
  const currentMonth = toYearMonth(new Date());

  if (expenses.length === 0) {
    return (
      <section className="panel empty-state" aria-labelledby="timeline-empty-title" data-trace="DS-CLEAR-EMPTY-STATES-001">
        <ReceiptText aria-hidden="true" size={28} />
        <h2 id="timeline-empty-title">Inga återkommande utgifter ännu</h2>
        <p>Lägg till första återkommande kostnaden för att se månadstotaler och tidslinje.</p>
        {onAddExpense ? (
          <div className="form-actions">
            <button className="icon-button icon-button--primary" type="button" onClick={onAddExpense}>
              Lägg till utgift
            </button>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="panel" aria-labelledby="timeline-title" data-trace="DS-JNY001-03..04 / DS-MOBILE-OVERVIEW-001 / DS-TIMELINE-DETAIL-001 / DS-TIMELINE-WINDOW-001">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Översikt</span>
          <h2 id="timeline-title">Återkommande tidslinje</h2>
          <p>Månadstotaler beräknas från aktiva återkommande utgifter i den här plånboken.</p>
        </div>
        <span className="chip">
          <CalendarDays aria-hidden="true" size={16} />
          {timelineMonths.length} months
        </span>
      </div>

      <div className="timeline-wrap">
        <table className="timeline-table">
          <thead>
            <tr>
              <th scope="col">Utgift</th>
              <th scope="col">Betalare</th>
              <th scope="col">Kategori</th>
              {timelineMonths.map((month) => (
                <th key={month.month} className="amount" scope="col">
                  <span>{formatMonth(month.month)}</span>
                  <br />
                  <strong data-testid={`month-total-${month.month}`}>
                    {formatMoney(getMonthTotalMinor(month), resolvedCurrency)}
                  </strong>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expense = findExpenseForRow(expenses, row);
              const rowId = 'expenseId' in row ? row.expenseId : row.id;
              const cancellation = expense ? calculateCancellationOpportunity(expense, currentMonth) : null;
              return (
              <tr key={rowId}>
                <td>
                  <button
                    className="icon-button icon-button--ghost"
                    type="button"
                    onClick={() => handleSelectExpense(onSelectExpense, expense, Boolean(timeline))}
                  >
                    <span className="row-title">
                      <strong>{row.name}</strong>
                      {cancellation ? (
                        <span>
                          Uppsägning: {cancellation.noticeMonths} mån · fri från{' '}
                          {formatMonth(cancellation.earliestFreeMonth)}
                        </span>
                      ) : null}
                      {expense?.cancellationReminderMonth ? (
                        <span>
                          Påminnelse:{' '}
                          {expense.cancellationReminderStatus === 'done' ? 'klar' : formatMonth(expense.cancellationReminderMonth)}
                        </span>
                      ) : null}
                      <span>
                        månadsvis, dag {expense?.chargeDay ?? '-'}
                      </span>
                    </span>
                  </button>
                </td>
                <td>{findName(payerOptions, row.payerPersonId)}</td>
                <td>{findName(categories, row.categoryId)}</td>
                {timelineMonths.map((month) => (
                  <td key={month.month} className="amount">
                    {rowOccursInMonth(row, expense, month.month)
                      ? formatMoney(getRowAmountMinor(row), row.currency || resolvedCurrency)
                      : '-'}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="month-cards" aria-label="Mobil månadsöversikt" data-trace="DS-MOBILE-OVERVIEW-001">
        {timelineMonths.map((month) => (
          <article className="month-card" key={month.month}>
            <div className="month-card__top">
              <span>{formatMonth(month.month)}</span>
              <strong>{formatMoney(getMonthTotalMinor(month), resolvedCurrency)}</strong>
            </div>
            <ul>
              {month.expenseRows.length === 0 ? <li>Inga aktiva utgifter</li> : null}
              {month.expenseRows.map((row) => {
                const expense = findExpenseForRow(expenses, row);
                const cancellation = expense ? calculateCancellationOpportunity(expense, currentMonth) : null;
                return (
                  <li key={'expenseId' in row ? row.expenseId : row.id}>
                    <button
                      className="month-card__expense"
                      type="button"
                      onClick={() => handleSelectExpense(onSelectExpense, expense, Boolean(timeline))}
                    >
                      <span>
                        {row.name}
                        {cancellation ? (
                          <small>
                            Uppsägning: {cancellation.noticeMonths} mån, fri från{' '}
                            {formatMonth(cancellation.earliestFreeMonth)}
                          </small>
                        ) : null}
                        {expense?.cancellationReminderMonth ? (
                          <small>
                            Påminnelse:{' '}
                            {expense.cancellationReminderStatus === 'done' ? 'klar' : formatMonth(expense.cancellationReminderMonth)}
                          </small>
                        ) : null}
                      </span>
                      <strong>{formatMoney(getRowAmountMinor(row), row.currency || resolvedCurrency)}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function getExpenseAmountMinor(expense: RecurringExpense): number {
  return expense.amountMinor ?? expense.amountMinorUnits ?? 0;
}

function getRowAmountMinor(row: RecurringExpense | { amountMinorUnits?: number }): number {
  return 'amountMinor' in row ? getExpenseAmountMinor(row) : row.amountMinorUnits ?? 0;
}

function getMonthTotalMinor(month: TimelineMonth): number {
  return month.monthTotalMinor ?? month.totalMinorUnits ?? 0;
}

function findExpenseForRow(expenses: RecurringExpense[], row: RecurringExpense | { expenseId: string }) {
  if ('id' in row) {
    return row;
  }

  return expenses.find((expense) => expense.id === row.expenseId) ?? null;
}

function rowOccursInMonth(row: RecurringExpense | { months: Array<{ month: string; isDue: boolean }> }, expense: RecurringExpense | null, month: string) {
  if ('months' in row) {
    return row.months.some((cell) => cell.month === month && cell.isDue);
  }

  return expense ? expenseOccursInMonth(expense, month) : false;
}

function handleSelectExpense(
  onSelectExpense: TimelineViewProps['onSelectExpense'],
  expense: RecurringExpense | null,
  shouldSelectId: boolean
) {
  if (!onSelectExpense || !expense) {
    return;
  }

  if (shouldSelectId) {
    (onSelectExpense as (expenseId: string) => void)(expense.id);
    return;
  }

  (onSelectExpense as (expense: RecurringExpense) => void)(expense);
}
