export const APP_SCHEMA_VERSION = 1;

export type EntityStatus = 'active' | 'archived';
export type ExpenseStatus = 'active' | 'paused' | 'completed' | 'draft';
export type CancellationReminderStatus = 'active' | 'done';
export type PurchaseSignal = 'review' | 'unnecessary' | 'worth_it' | 'business' | 'recurring';
export type CurrencyCode = 'SEK';
export type RecurringPeriod = 'monthly' | 'quarterly' | 'yearly' | 'one_time';
export type YearMonth = `${number}-${string}`;
export type PlanFlag = 'free' | 'premium_preview';

export interface AppSettings {
  businessSignalLabel: string;
  purchasesEnabled: boolean;
  planFlag: PlanFlag;
}

export interface Wallet {
  id: string;
  name: string;
  active: boolean;
  currency: CurrencyCode;
  monthsBack: number;
  monthsForward: number;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  walletId: string;
  name: string;
  monthlyBudgetMinor?: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  walletId: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  walletId: string;
  name: string;
  color?: string;
  icon?: string;
  cancellationInstructions?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantCategoryRule {
  id: string;
  walletId: string;
  merchantPattern: string;
  categoryId: string;
  vendorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationState {
  removedRecurringExpenseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CloudSyncStatus = 'configured' | 'synced' | 'error' | 'conflict';

export interface CloudSyncState {
  endpoint: string;
  token?: string;
  revision?: string;
  status: CloudSyncStatus;
  lastSyncedAt?: string;
  lastError?: string;
  updatedAt: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  walletId: string;
  name: string;
  amountMinor: number;
  amountMinorUnits: number;
  currency: CurrencyCode;
  period: RecurringPeriod;
  startMonth: YearMonth;
  endMonth?: YearMonth;
  chargeDay: number;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  vendorName?: string;
  sourcePurchaseId?: string;
  cancellationNoticeMonths?: number;
  cancellationReminderMonth?: YearMonth;
  cancellationReminderStatus?: CancellationReminderStatus;
  cancellationReminderCompletedAt?: string;
  status: ExpenseStatus;
  notes?: string;
  attachments?: ExpenseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  walletId: string;
  date: string;
  merchant: string;
  amountMinor: number;
  amountMinorUnits: number;
  currency: CurrencyCode;
  payerPersonId: string;
  categoryId?: string;
  vendorId?: string;
  vendorName?: string;
  signals: PurchaseSignal[];
  source: 'manual' | 'csv';
  linkedRecurringExpenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  schemaVersion: typeof APP_SCHEMA_VERSION;
  activeWalletId: string | null;
  settings?: AppSettings;
  wallets: Wallet[];
  people: Person[];
  categories: Category[];
  vendors: Vendor[];
  merchantCategoryRules?: MerchantCategoryRule[];
  simulation?: SimulationState;
  cloudSync?: CloudSyncState;
  recurringExpenses: RecurringExpense[];
  purchases: Purchase[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineExpenseCell {
  month: YearMonth;
  amountMinor: number;
  amountMinorUnits: number;
  isDue: boolean;
}

export interface TimelineExpenseRow {
  expenseId: string;
  walletId: string;
  name: string;
  amountMinor: number;
  amountMinorUnits: number;
  currency: CurrencyCode;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  months: TimelineExpenseCell[];
}

export interface TimelineMonth {
  month: YearMonth;
  label: string;
  monthTotalMinor: number;
  totalMinorUnits: number;
  expenseRows: TimelineExpenseRow[];
}

export interface Timeline {
  walletId: string;
  currentMonth: YearMonth;
  currentMonthTotal: number;
  windowStart: YearMonth;
  windowEnd: YearMonth;
  months: TimelineMonth[];
  rows: TimelineExpenseRow[];
}

export interface WalletSetupInput {
  walletName: string;
  payerName: string;
}

export interface RecurringExpenseInput {
  name: string;
  amount?: string | number;
  amountMinor?: number;
  period?: RecurringPeriod;
  startMonth?: YearMonth;
  chargeDay: number;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  vendorName?: string;
  sourcePurchaseId?: string;
  cancellationNoticeMonths?: number;
  notes?: string;
}

export interface PurchaseInput {
  date: string;
  merchant: string;
  amount?: string | number;
  amountMinor?: number;
  payerPersonId: string;
  categoryId?: string;
  vendorId?: string;
  vendorName?: string;
  applyCategoryToSameMerchant?: boolean;
  signals?: PurchaseSignal[];
  source?: 'manual' | 'csv';
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
