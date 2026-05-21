import {
  APP_SCHEMA_VERSION,
  type AppSettings,
  type AppState,
  type Category,
  type Person,
  type RecurringExpense,
  type RecurringExpenseInput,
  type Vendor,
  type Wallet,
  type YearMonth
} from './types';
import { assertValid, getInputAmountMinorUnits, validateRecurringExpenseInput, validateWalletSetup } from './validation';

export const DEFAULT_MONTHS_BACK = 0;
export const DEFAULT_MONTHS_FORWARD = 5;

export const DEFAULT_CATEGORY_TEMPLATES = [
  { name: 'Abonnemang', color: '#2563eb', icon: 'repeat' },
  { name: 'Boende', color: '#059669', icon: 'home' },
  { name: 'Försäkring', color: '#7c3aed', icon: 'shield' },
  { name: 'Övrigt', color: '#475569', icon: 'tag' }
] as const;

export const DEFAULT_VENDOR_TEMPLATES = [{ name: 'Ingen leverantör', color: '#64748b', icon: 'store' }] as const;

export const DEFAULT_APP_SETTINGS: AppSettings = {
  businessSignalLabel: 'Business',
  purchasesEnabled: true,
  planFlag: 'free'
};

export function createInitialState(now = new Date()): AppState {
  const timestamp = now.toISOString();

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    activeWalletId: null,
    settings: { ...DEFAULT_APP_SETTINGS },
    wallets: [],
    people: [],
    categories: [],
    vendors: [],
    merchantCategoryRules: [],
    simulation: undefined,
    cloudSync: undefined,
    recurringExpenses: [],
    purchases: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function ensureStarterRecords(state: AppState, walletName: string, payerName: string, now = new Date()): AppState {
  assertValid(validateWalletSetup({ walletName, payerName }));

  const timestamp = now.toISOString();
  const wallet = createWallet(walletName, timestamp);
  const payer = createPerson(wallet.id, payerName, timestamp);
  const categories = createDefaultCategories(wallet.id, timestamp);
  const vendors = createDefaultVendors(wallet.id, timestamp);

  return {
    ...state,
    activeWalletId: wallet.id,
    wallets: [...state.wallets.map((item) => ({ ...item, active: false })), wallet],
    people: [...state.people, payer],
    categories: [...state.categories, ...categories],
    vendors: [...state.vendors, ...vendors],
    updatedAt: timestamp
  };
}

export function createWallet(name: string, timestamp = new Date().toISOString()): Wallet {
  return {
    id: createId('wallet'),
    name: name.trim(),
    active: true,
    currency: 'SEK',
    monthsBack: DEFAULT_MONTHS_BACK,
    monthsForward: DEFAULT_MONTHS_FORWARD,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createPerson(walletId: string, name: string, timestamp = new Date().toISOString()): Person {
  return {
    id: createId('person'),
    walletId,
    name: name.trim(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDefaultCategories(walletId: string, timestamp = new Date().toISOString()): Category[] {
  return DEFAULT_CATEGORY_TEMPLATES.map((template, index) => ({
    id: createId('category'),
    walletId,
    name: template.name,
    color: template.color,
    icon: template.icon,
    sortOrder: index + 1,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}

export function createDefaultVendors(walletId: string, timestamp = new Date().toISOString()): Vendor[] {
  return DEFAULT_VENDOR_TEMPLATES.map((template) => ({
    id: createId('vendor'),
    walletId,
    name: template.name,
    color: template.color,
    icon: template.icon,
    cancellationInstructions: '',
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}

export function createRecurringExpense(
  walletId: string,
  input: RecurringExpenseInput,
  now = new Date()
): RecurringExpense {
  const validation = validateRecurringExpenseInput(input);
  assertValid(validation);

  const timestamp = now.toISOString();
  const amountMinorUnits = getInputAmountMinorUnits(input);
  if (amountMinorUnits === null) {
    throw new Error('amount: Amount must be a valid money value.');
  }

  return {
    id: createId('expense'),
    walletId,
    name: input.name.trim(),
    amountMinor: amountMinorUnits,
    amountMinorUnits,
    currency: 'SEK',
    period: input.period ?? 'monthly',
    startMonth: input.startMonth ?? toYearMonth(now),
    chargeDay: input.chargeDay,
    payerPersonId: input.payerPersonId,
    categoryId: input.categoryId,
    vendorId: input.vendorId || undefined,
    vendorName: input.vendorName?.trim() || undefined,
    sourcePurchaseId: input.sourcePurchaseId,
    cancellationNoticeMonths: input.cancellationNoticeMonths ?? 0,
    status: 'active',
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function toYearMonth(date: Date): YearMonth {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function createId(prefix: string): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${randomId}`;
}
