import type { Purchase, PurchaseInput, PurchaseSignal, RecurringExpense } from './types';
import { createId } from './defaults';
import { parseMoneyToMinorUnits } from './validation';

export interface PurchaseCsvRow {
  date: string;
  merchant: string;
  amountMinor: number;
}

export interface IgnoredPurchaseCsvRow {
  lineNumber: number;
  raw: string;
  reason: string;
}

export interface PurchaseCsvPreview {
  rows: PurchaseCsvRow[];
  ignoredRows: IgnoredPurchaseCsvRow[];
  totalMinor: number;
}

export interface PurchaseFingerprintInput {
  date: string;
  merchant: string;
  amountMinor: number;
}

export function createPurchase(walletId: string, input: PurchaseInput, now = new Date()): Purchase {
  const amountMinor = resolveAmountMinor(input);
  if (amountMinor === null || amountMinor <= 0) {
    throw new Error('amount: Amount must be greater than zero.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('date: Date must use YYYY-MM-DD format.');
  }

  if (!input.merchant.trim()) {
    throw new Error('merchant: Merchant is required.');
  }

  const timestamp = now.toISOString();
  return {
    id: createId('purchase'),
    walletId,
    date: input.date,
    merchant: input.merchant.trim(),
    amountMinor,
    amountMinorUnits: amountMinor,
    currency: 'SEK',
    payerPersonId: input.payerPersonId,
    categoryId: input.categoryId || undefined,
    vendorId: input.vendorId || undefined,
    vendorName: input.vendorName?.trim() || undefined,
    signals: input.signals ?? [],
    source: input.source ?? 'manual',
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function updatePurchase(purchase: Purchase, input: PurchaseInput, now = new Date()): Purchase {
  const amountMinor = resolveAmountMinor(input);
  if (amountMinor === null || amountMinor <= 0) {
    throw new Error('amount: Amount must be greater than zero.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('date: Date must use YYYY-MM-DD format.');
  }

  if (!input.merchant.trim()) {
    throw new Error('merchant: Merchant is required.');
  }

  return {
    ...purchase,
    date: input.date,
    merchant: input.merchant.trim(),
    amountMinor,
    amountMinorUnits: amountMinor,
    payerPersonId: input.payerPersonId,
    categoryId: input.categoryId || undefined,
    vendorId: input.vendorId || undefined,
    vendorName: input.vendorName?.trim() || undefined,
    signals: input.signals ?? purchase.signals,
    updatedAt: now.toISOString()
  };
}

export function createPurchaseFromRecurringExpense(
  expense: RecurringExpense,
  purchaseDate = dateFromRecurringExpense(expense, new Date()),
  now = new Date()
): Purchase {
  return createPurchase(
    expense.walletId,
    {
      date: purchaseDate,
      merchant: expense.vendorName ?? expense.name,
      amountMinor: expense.amountMinorUnits,
      payerPersonId: expense.payerPersonId,
      categoryId: expense.categoryId,
      signals: ['review'],
      source: 'manual'
    },
    now
  );
}

export function completeRecurringExpenseAsPurchase(expense: RecurringExpense, now = new Date()): RecurringExpense {
  return {
    ...expense,
    status: 'completed',
    sourcePurchaseId: undefined,
    updatedAt: now.toISOString()
  };
}

export function unlinkPurchaseFromRecurringExpense(purchase: Purchase, expenseId: string, now = new Date()): Purchase {
  if (purchase.linkedRecurringExpenseId !== expenseId) {
    return purchase;
  }

  return {
    ...purchase,
    linkedRecurringExpenseId: undefined,
    signals: purchase.signals.filter((signal) => signal !== 'recurring'),
    updatedAt: now.toISOString()
  };
}

export function parsePurchaseCsv(raw: string): PurchaseCsvPreview {
  const rows: PurchaseCsvRow[] = [];
  const ignoredRows: IgnoredPurchaseCsvRow[] = [];

  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line, index) => {
      const lineNumber = index + 1;
      if (!line) {
        return;
      }

      const cells = splitCsvLine(line);
      if (lineNumber === 1 && isHeaderRow(cells)) {
        return;
      }

      const [date, merchant, amount] = cells;
      if (!date || !merchant || !amount) {
        ignoredRows.push({ lineNumber, raw: line, reason: 'Saknar datum, handlare eller belopp.' });
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        ignoredRows.push({ lineNumber, raw: line, reason: 'Datum ska vara YYYY-MM-DD.' });
        return;
      }

      const amountMinor = parseMoneyToMinorUnits(amount);
      if (amountMinor === null || amountMinor <= 0) {
        ignoredRows.push({ lineNumber, raw: line, reason: 'Beloppet kunde inte läsas.' });
        return;
      }

      rows.push({
        date: date.trim(),
        merchant: merchant.trim(),
        amountMinor
      });
    });

  return {
    rows,
    ignoredRows,
    totalMinor: rows.reduce((sum, row) => sum + row.amountMinor, 0)
  };
}

export function createPurchaseFingerprint(input: PurchaseFingerprintInput): string {
  return `${input.date}|${normalizeMerchant(input.merchant)}|${input.amountMinor}`;
}

export function togglePurchaseSignal(purchase: Purchase, signal: PurchaseSignal, now = new Date()): Purchase {
  const hasSignal = purchase.signals.includes(signal);
  return {
    ...purchase,
    signals: hasSignal ? purchase.signals.filter((item) => item !== signal) : [...purchase.signals, signal],
    updatedAt: now.toISOString()
  };
}

function splitCsvLine(line: string): string[] {
  const delimiter = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
  return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''));
}

function isHeaderRow(cells: string[]): boolean {
  return ['datum', 'date'].includes((cells[0] ?? '').trim().toLowerCase());
}

function resolveAmountMinor(input: Pick<PurchaseInput, 'amount' | 'amountMinor'>): number | null {
  if (typeof input.amountMinor === 'number') {
    return Number.isInteger(input.amountMinor) ? input.amountMinor : null;
  }

  if (input.amount === undefined) {
    return null;
  }

  return parseMoneyToMinorUnits(input.amount);
}

function normalizeMerchant(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('sv-SE');
}

function dateFromRecurringExpense(expense: RecurringExpense, referenceDate: Date): string {
  const [year, month] = expense.startMonth.split('-').map(Number);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = String(Math.min(expense.chargeDay, lastDayOfMonth)).padStart(2, '0');
  return `${expense.startMonth}-${day}`;
}
