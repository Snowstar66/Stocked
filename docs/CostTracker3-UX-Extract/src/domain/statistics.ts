import type { Category, Person, Purchase, RecurringExpense, Vendor } from './types';

export interface RankedMoneyItem {
  id: string;
  label: string;
  amountMinor: number;
  count: number;
}

export interface WalletStatistics {
  recurringTotalMinor: number;
  purchaseTotalMinor: number;
  recurringExpenseCount: number;
  purchaseCount: number;
  averagePurchaseMinor: number;
  uniqueMerchantCount: number;
  topMerchantByAmount: RankedMoneyItem | null;
  topMerchantByCount: RankedMoneyItem | null;
  topCategoryByAmount: RankedMoneyItem | null;
  topCategoryByCount: RankedMoneyItem | null;
  topRecurringCategoryByAmount: RankedMoneyItem | null;
  topRecurringVendorByAmount: RankedMoneyItem | null;
  topPurchaseMonth: RankedMoneyItem | null;
  topPurchaseYear: RankedMoneyItem | null;
  reviewPurchaseCount: number;
  unnecessaryPurchaseTotalMinor: number;
  businessPurchaseTotalMinor: number;
  recurringLinkedPurchaseCount: number;
  missingCancellationInfoCount: number;
  monthlyBudgetTotalMinor: number;
  budgetRemainingMinor: number | null;
  budgetUsedPercent: number | null;
}

export function calculateWalletStatistics(
  expenses: RecurringExpense[],
  purchases: Purchase[],
  categories: Category[],
  people: Person[] = [],
  vendors: Vendor[] = []
): WalletStatistics {
  const activeExpenses = expenses.filter((expense) => expense.status === 'active');
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const vendorInstructions = new Map(
    vendors.map((vendor) => [vendor.id, vendor.cancellationInstructions?.trim() ?? ''])
  );
  const recurringTotalMinor = activeExpenses.reduce((sum, expense) => sum + getMonthlyEquivalentMinor(expense), 0);
  const purchaseTotalMinor = purchases.reduce((sum, purchase) => sum + purchase.amountMinor, 0);
  const monthlyBudgetTotalMinor = people.reduce((sum, person) => sum + (person.monthlyBudgetMinor ?? 0), 0);
  const uniqueMerchantCount = new Set(purchases.map((purchase) => normalizeGroupLabel(purchase.merchant || 'Okänd handlare'))).size;
  const merchantTotals = rankByGroup(
    purchases,
    (purchase) => purchase.merchant || 'Okänd handlare',
    (purchase) => purchase.amountMinor
  );
  const categoryTotals = rankByGroup(
    [...activeExpenses, ...purchases],
    (item) => categoryNames.get(item.categoryId ?? '') ?? 'Ej kategoriserat',
    (item) => ('period' in item ? getMonthlyEquivalentMinor(item) : item.amountMinor)
  );
  const recurringCategoryTotals = rankByGroup(
    activeExpenses,
    (expense) => categoryNames.get(expense.categoryId ?? '') ?? 'Ej kategoriserat',
    getMonthlyEquivalentMinor
  );
  const recurringVendorTotals = rankByGroup(
    activeExpenses,
    (expense) => expense.vendorName || vendors.find((vendor) => vendor.id === expense.vendorId)?.name || 'Ingen leverantör',
    getMonthlyEquivalentMinor
  );
  const purchaseMonthTotals = rankByGroup(
    purchases,
    (purchase) => purchase.date.slice(0, 7),
    (purchase) => purchase.amountMinor
  );
  const purchaseYearTotals = rankByGroup(
    purchases,
    (purchase) => purchase.date.slice(0, 4),
    (purchase) => purchase.amountMinor
  );

  return {
    recurringTotalMinor,
    purchaseTotalMinor,
    recurringExpenseCount: activeExpenses.length,
    purchaseCount: purchases.length,
    averagePurchaseMinor: purchases.length > 0 ? Math.round(purchaseTotalMinor / purchases.length) : 0,
    uniqueMerchantCount,
    topMerchantByAmount: merchantTotals[0] ?? null,
    topMerchantByCount: [...merchantTotals].sort(sortByCountThenAmount)[0] ?? null,
    topCategoryByAmount: categoryTotals[0] ?? null,
    topCategoryByCount: [...categoryTotals].sort(sortByCountThenAmount)[0] ?? null,
    topRecurringCategoryByAmount: recurringCategoryTotals[0] ?? null,
    topRecurringVendorByAmount: recurringVendorTotals[0] ?? null,
    topPurchaseMonth: purchaseMonthTotals[0] ?? null,
    topPurchaseYear: purchaseYearTotals[0] ?? null,
    reviewPurchaseCount: purchases.filter((purchase) => purchase.signals.includes('review')).length,
    unnecessaryPurchaseTotalMinor: sumPurchasesBySignal(purchases, 'unnecessary'),
    businessPurchaseTotalMinor: sumPurchasesBySignal(purchases, 'business'),
    recurringLinkedPurchaseCount: purchases.filter((purchase) => Boolean(purchase.linkedRecurringExpenseId)).length,
    missingCancellationInfoCount: activeExpenses.filter((expense) => isMissingCancellationInfo(expense, vendorInstructions)).length,
    monthlyBudgetTotalMinor,
    budgetRemainingMinor: monthlyBudgetTotalMinor > 0 ? monthlyBudgetTotalMinor - recurringTotalMinor : null,
    budgetUsedPercent:
      monthlyBudgetTotalMinor > 0 ? Math.round((recurringTotalMinor / monthlyBudgetTotalMinor) * 100) : null
  };
}

function isMissingCancellationInfo(expense: RecurringExpense, vendorInstructions: Map<string, string>): boolean {
  const hasNoticeValue = expense.cancellationNoticeMonths !== undefined;
  const hasVendorInstruction = Boolean(expense.vendorId && vendorInstructions.get(expense.vendorId));
  return !hasNoticeValue || !hasVendorInstruction;
}

function normalizeGroupLabel(label: string): string {
  return label.trim().toLocaleLowerCase('sv-SE');
}

function rankByGroup<T>(
  items: T[],
  getLabel: (item: T) => string,
  getAmountMinor: (item: T) => number
): RankedMoneyItem[] {
  const grouped = new Map<string, RankedMoneyItem>();

  items.forEach((item) => {
    const label = getLabel(item).trim() || 'Okänd';
    const current = grouped.get(label) ?? {
      id: label.toLowerCase(),
      label,
      amountMinor: 0,
      count: 0
    };
    current.amountMinor += getAmountMinor(item);
    current.count += 1;
    grouped.set(label, current);
  });

  return [...grouped.values()].sort(sortByAmountThenCount);
}

function sortByAmountThenCount(a: RankedMoneyItem, b: RankedMoneyItem) {
  return b.amountMinor - a.amountMinor || b.count - a.count || a.label.localeCompare(b.label, 'sv-SE');
}

function sortByCountThenAmount(a: RankedMoneyItem, b: RankedMoneyItem) {
  return b.count - a.count || b.amountMinor - a.amountMinor || a.label.localeCompare(b.label, 'sv-SE');
}

function sumPurchasesBySignal(purchases: Purchase[], signal: Purchase['signals'][number]) {
  return purchases
    .filter((purchase) => purchase.signals.includes(signal))
    .reduce((sum, purchase) => sum + purchase.amountMinor, 0);
}

function getMonthlyEquivalentMinor(expense: RecurringExpense): number {
  if (expense.period === 'one_time') {
    return 0;
  }
  if (expense.period === 'quarterly') {
    return Math.round(expense.amountMinor / 3);
  }
  if (expense.period === 'yearly') {
    return Math.round(expense.amountMinor / 12);
  }
  return expense.amountMinor;
}
