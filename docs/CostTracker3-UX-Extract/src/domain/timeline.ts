import type { RecurringExpense, Timeline, TimelineExpenseRow, TimelineMonth, Wallet, YearMonth } from './types';
import { toYearMonth } from './defaults';
import { isYearMonth } from './validation';

export interface TimelineOptions {
  referenceMonth?: YearMonth;
}

export function calculateTimeline(wallet: Wallet, expenses: RecurringExpense[], options: TimelineOptions = {}): Timeline {
  const currentMonth = options.referenceMonth ?? toYearMonth(new Date());
  const months = buildMonthWindow(currentMonth, wallet.monthsBack, wallet.monthsForward);
  const activeExpenses = expenses.filter((expense) => expense.walletId === wallet.id && expense.status === 'active');

  const rows = activeExpenses.map((expense) => buildExpenseRow(expense, months));
  const timelineMonths = months.map<TimelineMonth>((month) => {
    const dueRows = rows.filter((row) => row.months.some((cell) => cell.month === month && cell.isDue));
    const monthTotal = dueRows.reduce((sum, row) => sum + row.amountMinorUnits, 0);

    return {
      month,
      label: formatMonthLabel(month),
      monthTotalMinor: monthTotal,
      totalMinorUnits: monthTotal,
      expenseRows: dueRows
    };
  });

  return {
    walletId: wallet.id,
    currentMonth,
    currentMonthTotal: timelineMonths.find((month) => month.month === currentMonth)?.totalMinorUnits ?? 0,
    windowStart: months[0],
    windowEnd: months[months.length - 1],
    months: timelineMonths,
    rows
  };
}

export function buildMonthWindow(referenceMonth: YearMonth, monthsBack: number, monthsForward: number): YearMonth[] {
  if (!isYearMonth(referenceMonth)) {
    throw new Error('referenceMonth must use YYYY-MM format.');
  }

  const startOffset = -Math.max(0, monthsBack);
  const endOffset = Math.max(0, monthsForward);
  const months: YearMonth[] = [];

  for (let offset = startOffset; offset <= endOffset; offset += 1) {
    months.push(addMonths(referenceMonth, offset));
  }

  return months;
}

export function isExpenseDueInMonth(expense: RecurringExpense, month: YearMonth): boolean {
  if (expense.status !== 'active') {
    return false;
  }

  if (compareYearMonth(month, expense.startMonth) < 0) {
    return false;
  }

  if (expense.endMonth && compareYearMonth(month, expense.endMonth) > 0) {
    return false;
  }

  if (expense.period === 'one_time') {
    return month === expense.startMonth;
  }

  const monthStep = getPeriodMonthStep(expense.period);
  const [startYear, startMonthNumber] = expense.startMonth.split('-').map(Number);
  const [targetYear, targetMonthNumber] = month.split('-').map(Number);
  const diff = (targetYear - startYear) * 12 + targetMonthNumber - startMonthNumber;
  return diff >= 0 && diff % monthStep === 0;
}

export function sumMonthTotal(expenses: RecurringExpense[], walletId: string, month: YearMonth): number {
  return expenses
    .filter((expense) => expense.walletId === walletId && isExpenseDueInMonth(expense, month))
    .reduce((sum, expense) => sum + expense.amountMinorUnits, 0);
}

export function addMonths(month: YearMonth, offset: number): YearMonth {
  if (!isYearMonth(month)) {
    throw new Error('month must use YYYY-MM format.');
  }

  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return toYearMonth(date);
}

export function compareYearMonth(left: YearMonth, right: YearMonth): number {
  return left.localeCompare(right);
}

function buildExpenseRow(expense: RecurringExpense, months: YearMonth[]): TimelineExpenseRow {
  return {
    expenseId: expense.id,
    walletId: expense.walletId,
    name: expense.name,
    amountMinor: expense.amountMinor,
    amountMinorUnits: expense.amountMinorUnits,
    currency: expense.currency,
    payerPersonId: expense.payerPersonId,
    categoryId: expense.categoryId,
    vendorId: expense.vendorId,
    months: months.map((month) => ({
      month,
      amountMinor: isExpenseDueInMonth(expense, month) ? expense.amountMinorUnits : 0,
      amountMinorUnits: isExpenseDueInMonth(expense, month) ? expense.amountMinorUnits : 0,
      isDue: isExpenseDueInMonth(expense, month)
    }))
  };
}

function formatMonthLabel(month: YearMonth): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('sv-SE', { month: 'short', year: 'numeric' }).format(new Date(year, monthNumber - 1, 1));
}

function getPeriodMonthStep(period: RecurringExpense['period']): number {
  if (period === 'quarterly') {
    return 3;
  }
  if (period === 'yearly') {
    return 12;
  }
  return 1;
}
