export type WalletTemplate = 'standard' | 'blank';

export type ExpensePeriod = 'monthly' | 'quarterly' | 'yearly' | 'one_time';

export type ExpenseStatus = 'active' | 'paused' | 'completed' | 'draft' | 'archived';
export type CancellationReminderStatus = 'active' | 'done';
export type PurchaseSignal = 'review' | 'unnecessary' | 'worth_it' | 'business' | 'recurring';

export interface WalletSetupPayload {
  walletName: string;
  payerName: string;
  template: WalletTemplate;
}

export interface PersonOption {
  id: string;
  name: string;
  monthlyBudgetMinor?: number;
  status?: 'active' | 'inactive' | 'archived';
  walletId?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  walletId?: string;
  sortOrder?: number;
  status?: 'active' | 'archived';
}

export interface VendorOption {
  id: string;
  name: string;
  walletId?: string;
  cancellationInstructions?: string;
  status?: 'active' | 'archived';
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
  walletId?: string;
  name: string;
  amountMinor?: number;
  amountMinorUnits?: number;
  currency: string;
  period: ExpensePeriod;
  startMonth: string;
  endMonth?: string;
  chargeDay: number;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  vendorName?: string;
  sourcePurchaseId?: string;
  cancellationNoticeMonths?: number;
  cancellationReminderMonth?: string;
  cancellationReminderStatus?: CancellationReminderStatus;
  cancellationReminderCompletedAt?: string;
  status: ExpenseStatus;
  notes?: string;
  attachments?: ExpenseAttachment[];
}

export interface RecurringExpensePayload {
  name: string;
  amountMinor: number;
  currency: string;
  period: ExpensePeriod;
  startMonth: string;
  chargeDay: number;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  vendorName?: string;
  sourcePurchaseId?: string;
  cancellationNoticeMonths?: number;
  notes?: string;
  status: ExpenseStatus;
}

export interface Purchase {
  id: string;
  walletId: string;
  date: string;
  merchant: string;
  amountMinor: number;
  amountMinorUnits: number;
  currency: 'SEK';
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

export interface TimelineMonth {
  month: string;
  monthTotalMinor?: number;
  totalMinorUnits?: number;
  label?: string;
  expenseRows: RecurringExpense[] | TimelineExpenseRow[];
}

export interface TimelineExpenseCell {
  month: string;
  amountMinorUnits: number;
  isDue: boolean;
}

export interface TimelineExpenseRow {
  expenseId: string;
  walletId?: string;
  name: string;
  amountMinorUnits: number;
  currency: string;
  payerPersonId: string;
  categoryId: string;
  vendorId?: string;
  months: TimelineExpenseCell[];
}

export interface TimelineModel {
  walletId?: string;
  currentMonth?: string;
  currentMonthTotal?: number;
  windowStart?: string;
  windowEnd?: string;
  months: TimelineMonth[];
  rows: TimelineExpenseRow[];
}

export interface WalletOption {
  id: string;
  name: string;
  currency?: string;
}
