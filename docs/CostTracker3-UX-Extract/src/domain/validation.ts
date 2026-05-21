import type {
  AppState,
  Category,
  Person,
  RecurringExpenseInput,
  ValidationIssue,
  ValidationResult,
  Vendor,
  WalletSetupInput,
  YearMonth
} from './types';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validateWalletSetup(input: WalletSetupInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input.walletName.trim()) {
    issues.push({ field: 'walletName', message: 'Wallet name is required.' });
  }

  if (!input.payerName.trim()) {
    issues.push({ field: 'payerName', message: 'At least one payer is required.' });
  }

  return toResult(issues);
}

export function validateRecurringExpenseInput(
  input: RecurringExpenseInput,
  context?: {
    walletId?: string;
    people?: Person[];
    categories?: Category[];
    vendors?: Vendor[];
  }
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input.name.trim()) {
    issues.push({ field: 'name', message: 'Expense name is required.' });
  }

  const amount = getInputAmountMinorUnits(input);
  if (amount === null || amount <= 0) {
    issues.push({ field: 'amount', message: 'Amount must be greater than zero.' });
  }

  if (!Number.isInteger(input.chargeDay) || input.chargeDay < 1 || input.chargeDay > 31) {
    issues.push({ field: 'chargeDay', message: 'Charge day must be between 1 and 31.' });
  }

  if (!input.payerPersonId.trim()) {
    issues.push({ field: 'payerPersonId', message: 'Payer is required.' });
  }

  if (!input.categoryId.trim()) {
    issues.push({ field: 'categoryId', message: 'Category is required.' });
  }

  if (input.startMonth && !isYearMonth(input.startMonth)) {
    issues.push({ field: 'startMonth', message: 'Start month must use YYYY-MM format.' });
  }

  if (input.period && !['monthly', 'quarterly', 'yearly', 'one_time'].includes(input.period)) {
    issues.push({ field: 'period', message: 'Period must be monthly, quarterly, yearly or one_time.' });
  }

  if (
    input.cancellationNoticeMonths !== undefined &&
    (!Number.isInteger(input.cancellationNoticeMonths) || input.cancellationNoticeMonths < 0 || input.cancellationNoticeMonths > 36)
  ) {
    issues.push({ field: 'cancellationNoticeMonths', message: 'Cancellation notice must be between 0 and 36 months.' });
  }

  if (context?.walletId) {
    if (context.people && !context.people.some((person) => person.id === input.payerPersonId && person.walletId === context.walletId)) {
      issues.push({ field: 'payerPersonId', message: 'Payer must belong to the active wallet.' });
    }

    if (
      context.categories &&
      !context.categories.some((category) => category.id === input.categoryId && category.walletId === context.walletId)
    ) {
      issues.push({ field: 'categoryId', message: 'Category must belong to the active wallet.' });
    }

    if (
      input.vendorId &&
      context.vendors &&
      !context.vendors.some((vendor) => vendor.id === input.vendorId && vendor.walletId === context.walletId)
    ) {
      issues.push({ field: 'vendorId', message: 'Vendor must belong to the active wallet.' });
    }
  }

  return toResult(issues);
}

export function validateAppState(value: unknown): value is AppState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === 1 &&
    (typeof value.activeWalletId === 'string' || value.activeWalletId === null) &&
    Array.isArray(value.wallets) &&
    Array.isArray(value.people) &&
    Array.isArray(value.categories) &&
    Array.isArray(value.vendors) &&
    (value.merchantCategoryRules === undefined || Array.isArray(value.merchantCategoryRules)) &&
    (value.simulation === undefined || isRecord(value.simulation)) &&
    (value.cloudSync === undefined || isRecord(value.cloudSync)) &&
    Array.isArray(value.recurringExpenses) &&
    (value.purchases === undefined || Array.isArray(value.purchases)) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

export function parseMoneyToMinorUnits(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 100) : null;
  }

  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export function getInputAmountMinorUnits(input: Pick<RecurringExpenseInput, 'amount' | 'amountMinor'>): number | null {
  if (typeof input.amountMinor === 'number') {
    return Number.isInteger(input.amountMinor) ? input.amountMinor : null;
  }

  if (input.amount === undefined) {
    return null;
  }

  return parseMoneyToMinorUnits(input.amount);
}

export function isYearMonth(value: string): value is YearMonth {
  return MONTH_PATTERN.test(value);
}

export function assertValid(result: ValidationResult): void {
  if (!result.valid) {
    throw new Error(result.issues.map((issue) => `${issue.field}: ${issue.message}`).join(' '));
  }
}

function toResult(issues: ValidationIssue[]): ValidationResult {
  return {
    valid: issues.length === 0,
    issues
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
