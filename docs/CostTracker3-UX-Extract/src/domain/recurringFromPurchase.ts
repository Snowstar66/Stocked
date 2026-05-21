import { createRecurringExpense } from './defaults';
import type { Purchase, RecurringExpense, YearMonth } from './types';

export interface CreateRecurringFromPurchaseOptions {
  fallbackCategoryId?: string;
}

export interface CreateRecurringFromPurchaseResult {
  expense: RecurringExpense;
  purchase: Purchase;
}

export function createRecurringExpenseFromPurchase(
  walletId: string,
  purchase: Purchase,
  options: CreateRecurringFromPurchaseOptions = {},
  now = new Date()
): CreateRecurringFromPurchaseResult {
  const categoryId = purchase.categoryId ?? options.fallbackCategoryId;
  if (!categoryId) {
    throw new Error('categoryId: A category is required to create a recurring expense from a purchase.');
  }

  if (purchase.linkedRecurringExpenseId) {
    throw new Error('purchase: Purchase is already linked to a recurring expense.');
  }

  const startMonth = purchase.date.slice(0, 7) as YearMonth;
  const chargeDay = Number(purchase.date.slice(8, 10));
  const expense = createRecurringExpense(
    walletId,
    {
      name: purchase.merchant,
      amountMinor: purchase.amountMinor,
      chargeDay,
      payerPersonId: purchase.payerPersonId,
      categoryId,
      vendorId: purchase.vendorId,
      vendorName: purchase.vendorName,
      startMonth,
      sourcePurchaseId: purchase.id,
      notes: `Skapad från köp ${purchase.date}.`
    },
    now
  );

  return {
    expense,
    purchase: {
      ...purchase,
      categoryId,
      signals: Array.from(new Set([...purchase.signals, 'recurring'])),
      linkedRecurringExpenseId: expense.id,
      updatedAt: now.toISOString()
    }
  };
}
