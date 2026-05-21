import type { Category, Person, Purchase, RecurringExpense, Vendor } from '../domain/types';

export function serializeRecurringExpensesCsv(
  expenses: RecurringExpense[],
  people: Person[],
  categories: Category[],
  vendors: Vendor[]
): string {
  const peopleById = new Map(people.map((person) => [person.id, person.name]));
  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
  const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.name]));
  const rows = expenses.map((expense) => [
    expense.name,
    formatMinor(expense.amountMinor),
    expense.currency,
    expense.startMonth,
    String(expense.chargeDay),
    peopleById.get(expense.payerPersonId) ?? '',
    categoriesById.get(expense.categoryId) ?? '',
    expense.vendorName ?? vendorsById.get(expense.vendorId ?? '') ?? '',
    String(expense.cancellationNoticeMonths ?? 0),
    expense.status,
    expense.notes ?? ''
  ]);

  return toCsv([
    [
      'namn',
      'belopp',
      'valuta',
      'startmanad',
      'dragningsdag',
      'betalare',
      'kategori',
      'leverantor',
      'uppsagning_manader',
      'status',
      'anteckning'
    ],
    ...rows
  ]);
}

export function serializePurchasesCsv(
  purchases: Purchase[],
  people: Person[],
  categories: Category[],
  vendors: Vendor[] = []
): string {
  const peopleById = new Map(people.map((person) => [person.id, person.name]));
  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
  const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor.name]));
  const rows = purchases.map((purchase) => [
    purchase.date,
    purchase.merchant,
    formatMinor(purchase.amountMinor),
    purchase.currency,
    peopleById.get(purchase.payerPersonId) ?? '',
    categoriesById.get(purchase.categoryId ?? '') ?? '',
    purchase.vendorName ?? vendorsById.get(purchase.vendorId ?? '') ?? '',
    purchase.signals.join('|'),
    purchase.source,
    purchase.linkedRecurringExpenseId ?? ''
  ]);

  return toCsv([
    ['datum', 'handlare', 'belopp', 'valuta', 'betalare', 'kategori', 'leverantor', 'signaler', 'kalla', 'kopplad_aterkommande'],
    ...rows
  ]);
}

function toCsv(rows: string[][]): string {
  return `${rows.map((row) => row.map(escapeCell).join(';')).join('\n')}\n`;
}

function escapeCell(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function formatMinor(value: number): string {
  return (value / 100).toFixed(2).replace('.', ',');
}
