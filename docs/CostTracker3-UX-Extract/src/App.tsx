import { useMemo, useState } from 'react';
import { CircleDollarSign, Database, FileUp, Plus, ReceiptText, ShieldCheck, ShoppingBag, WalletCards, X } from 'lucide-react';
import { DEFAULT_APP_SETTINGS, createId, createInitialState, createRecurringExpense, ensureStarterRecords } from './domain/defaults';
import {
  completeRecurringExpenseAsPurchase,
  createPurchase,
  createPurchaseFingerprint,
  createPurchaseFromRecurringExpense,
  togglePurchaseSignal,
  unlinkPurchaseFromRecurringExpense,
  updatePurchase,
  type PurchaseCsvRow
} from './domain/purchases';
import { createRecurringExpenseFromPurchase } from './domain/recurringFromPurchase';
import { calculateWalletStatistics } from './domain/statistics';
import { calculateTimeline } from './domain/timeline';
import type {
  AppSettings,
  AppState,
  MerchantCategoryRule,
  Purchase,
  PurchaseInput,
  PurchaseSignal,
  RecurringExpense,
  Vendor
} from './domain/types';
import { clearAppState, loadAppState, saveAppState } from './storage/localStore';
import { DataView } from './components/DataView';
import { ExpenseDetailDrawer } from './components/ExpenseDetailDrawer';
import { FirstRunSetup } from './components/FirstRunSetup';
import { HelpView } from './components/HelpView';
import { PurchasesView } from './components/PurchasesView';
import { RecurringExpenseForm } from './components/RecurringExpenseForm';
import { StatisticsView } from './components/StatisticsView';
import { TimelineView } from './components/TimelineView';
import type { RecurringExpensePayload } from './components/types';

const TRACE_IDS = 'OUT-001 / JNY-001 / JNY-002 / JNY-003 / JNY-004 / JNY-005 / JNY-006 / JNY-007 / JNY-008 / US-003 / US-004 / US-005 / US-006 / US-007 / US-009 / US-010 / US-011 / US-017 / US-018 / US-019 / US-021 / US-023 / US-024 / US-025 / US-026 / US-027 / US-028 / US-029 / US-035 / US-036 / US-037 / US-038 / US-039 / US-040 / US-041 / US-042 / US-047 / US-048 / US-049 / US-050 / US-051 / US-052 / US-053 / US-054 / US-055 / US-056 / US-057 / US-059 / US-064 / US-065 / US-066 / US-067 / US-068 / US-069 / US-070 / US-071 / US-072 / US-074 / US-078 / US-080 / US-081 / US-082 / US-083 / US-084 / US-085 / US-086 / US-087 / US-088 / US-089 / US-090 / US-091 / US-092 / US-093 / US-094 / US-095 / US-096 / DS-JNY001-01..05 / DS-JNY002-01..05 / DS-JNY003-01..04 / DS-JNY004-01..04 / DS-JNY005-01..04 / DS-JNY006-01..04 / DS-JNY007-01..05 / DS-JNY008-01..03 / DS-ACTIVE-WALLET-001 / DS-DUPLICATE-WALLET-001 / DS-DELETE-WALLET-001 / DS-EMPTY-START-001 / DS-STARTER-REGISTER-001 / DS-DRAFT-EXPENSE-001 / DS-VENDOR-IN-FLOW-001 / DS-EXPENSE-NOTE-001 / DS-ATTACHMENT-001 / DS-MOBILE-OVERVIEW-001 / DS-RESPONSIVE-NAV-001 / DS-CLEAR-EMPTY-STATES-001 / DS-CREATION-MODAL-001 / DS-DETAIL-DRAWER-001 / DS-MOBILE-NO-OVERLAP-001 / DS-PURCHASE-SIGNAL-SET-001 / DS-SIGNAL-DESIGN-001 / DS-MERCHANT-CATEGORY-RULE-001 / DS-SIMULATION-001 / DS-PORTABLE-EXPORT-001 / DS-DATAFILE-001 / DS-HANDOFF-001 / DS-EXPERIMENTAL-SYNC-001 / DS-SYNC-CONFLICT-001 / DS-RECURRING-ANALYSIS-001 / DS-RECURRING-TOPS-001 / DS-RECURRING-VS-PURCHASES-001 / DS-MERCHANT-RANKING-001 / DS-CATEGORY-RANKING-001 / DS-PURCHASE-INTELLIGENCE-001 / DS-PURCHASE-PERIODS-001 / DS-FILTER-001..02 / DS-REGISTER-001..03 / DS-BUDGET-001..02 / DS-DEDUPE-001 / DS-CSV-001 / DS-QUICK-001 / DS-HELP-001 / DS-VENDOR-CANCEL-001 / DS-CANCEL-INFO-001 / DS-SIGNAL-TOGGLE-001 / DS-TIMELINE-DETAIL-001 / DS-TIMELINE-WINDOW-001 / DS-TIME-WINDOW-CONFIG-001 / DS-RECURRING-PERIOD-001 / DS-ONE-TIME-PERIOD-001 / DS-PURCHASE-MOBILE-AMOUNT-001 / DS-PURCHASE-PAYER-001 / DS-PURCHASE-VENDOR-001';
type AppView = 'overview' | 'purchases' | 'statistics' | 'data' | 'help';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState() ?? createInitialState());
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('overview');
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);
  const [purchaseQuickAction, setPurchaseQuickAction] = useState<{ kind: 'create' | 'import'; id: number } | null>(null);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const [expensePayerFilter, setExpensePayerFilter] = useState('');
  const settings = { ...DEFAULT_APP_SETTINGS, ...(appState.settings ?? {}) };
  const businessSignalLabel = settings.businessSignalLabel.trim() || DEFAULT_APP_SETTINGS.businessSignalLabel;

  const activeWallet = appState.wallets.find((wallet) => wallet.id === appState.activeWalletId) ?? null;
  const people = activeWallet ? appState.people.filter((person) => person.walletId === activeWallet.id) : [];
  const categories = activeWallet
    ? appState.categories.filter((category) => category.walletId === activeWallet.id)
    : [];
  const vendors = activeWallet ? appState.vendors.filter((vendor) => vendor.walletId === activeWallet.id) : [];
  const merchantCategoryRules = activeWallet
    ? (appState.merchantCategoryRules ?? []).filter((rule) => rule.walletId === activeWallet.id)
    : [];
  const expenses = activeWallet
    ? appState.recurringExpenses.filter((expense) => expense.walletId === activeWallet.id)
    : [];
  const activeExpenses = expenses.filter((expense) => expense.status === 'active');
  const simulatedRemovedExpenseIds = appState.simulation?.removedRecurringExpenseIds ?? [];
  const simulatedRemovedExpenseIdsSet = new Set(simulatedRemovedExpenseIds);
  const simulationActive = simulatedRemovedExpenseIds.length > 0;
  const simulatedActiveExpenses = activeExpenses.filter((expense) => !simulatedRemovedExpenseIdsSet.has(expense.id));
  const draftExpenses = expenses.filter((expense) => expense.status === 'draft');
  const purchases =
    activeWallet && settings.purchasesEnabled ? appState.purchases.filter((purchase) => purchase.walletId === activeWallet.id) : [];
  const visibleExpenses = useMemo(() => {
    const needle = normalizeText(expenseSearchQuery);
    return simulatedActiveExpenses.filter((expense) => {
      const matchesSearch =
        needle.length === 0 ||
        normalizeText(`${expense.name} ${expense.vendorName ?? ''} ${expense.notes ?? ''}`).includes(needle);
      const matchesCategory = expenseCategoryFilter.length === 0 || expense.categoryId === expenseCategoryFilter;
      const matchesPayer = expensePayerFilter.length === 0 || expense.payerPersonId === expensePayerFilter;

      return matchesSearch && matchesCategory && matchesPayer;
    });
  }, [expenseCategoryFilter, expensePayerFilter, expenseSearchQuery, simulatedActiveExpenses]);
  const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const editingExpense = expenses.find((expense) => expense.id === editingExpenseId) ?? null;

  const timeline = useMemo(
    () => (activeWallet ? calculateTimeline(activeWallet, visibleExpenses) : null),
    [activeWallet, visibleExpenses]
  );
  const statistics = useMemo(
    () =>
      calculateWalletStatistics(
        expenses.filter((expense) => !simulatedRemovedExpenseIdsSet.has(expense.id)),
        purchases,
        categories,
        people,
        vendors
      ),
    [categories, expenses, people, purchases, simulatedRemovedExpenseIdsSet, vendors]
  );

  function commit(nextState: AppState) {
    setAppState(nextState);
    saveAppState(nextState);
  }

  function handleCreateWallet(input: { walletName: string; payerName: string }) {
    const nextState = ensureStarterRecords(createInitialState(), input.walletName, input.payerName);
    commit(nextState);
  }

  function handleCreateExpense(input: {
    name: string;
    amount: string;
    period?: RecurringExpense['period'];
    startMonth?: string;
    chargeDay: number;
    payerPersonId: string;
    categoryId: string;
    vendorId?: string;
    vendorName?: string;
    cancellationNoticeMonths?: number;
    notes?: string;
  }) {
    if (!activeWallet) {
      return;
    }

    const timestamp = new Date().toISOString();
    const vendorResolution = resolveExpenseVendor(input.vendorId, input.vendorName, timestamp);
    const nextExpense = createRecurringExpense(activeWallet.id, {
      ...input,
      vendorId: vendorResolution.vendorId,
      vendorName: vendorResolution.vendorName,
      startMonth: input.startMonth as RecurringExpense['startMonth'] | undefined
    }, new Date(timestamp));
    const nextState = {
      ...appState,
      vendors: vendorResolution.vendor ? [...appState.vendors, vendorResolution.vendor] : appState.vendors,
      recurringExpenses: [...appState.recurringExpenses, nextExpense],
      updatedAt: timestamp
    };
    commit(nextState);
    setExpenseFormOpen(false);
    setEditingExpenseId(null);
    setSelectedExpenseId(nextExpense.id);
  }

  function handleSaveExpenseDraft(input: {
    name: string;
    amount?: string;
    period?: RecurringExpense['period'];
    startMonth?: string;
    chargeDay: number;
    payerPersonId: string;
    categoryId: string;
    vendorId?: string;
    vendorName?: string;
    cancellationNoticeMonths?: number;
    notes?: string;
  }) {
    if (!activeWallet) {
      return;
    }

    const amountMinor = parseOptionalAmountToMinor(input.amount);
    const timestamp = new Date().toISOString();
    const nextExpense: RecurringExpense = {
      id: createId('expense'),
      walletId: activeWallet.id,
      name: input.name.trim() || 'Nytt utkast',
      amountMinor,
      amountMinorUnits: amountMinor,
      currency: 'SEK',
      period: input.period ?? 'monthly',
      startMonth: (input.startMonth ?? new Date().toISOString().slice(0, 7)) as RecurringExpense['startMonth'],
      chargeDay: input.chargeDay,
      payerPersonId: input.payerPersonId || (people[0]?.id ?? ''),
      categoryId: input.categoryId || (categories[0]?.id ?? ''),
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      cancellationNoticeMonths: input.cancellationNoticeMonths ?? 0,
      status: 'draft',
      notes: input.notes,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const nextState = {
      ...appState,
      recurringExpenses: [...appState.recurringExpenses, nextExpense],
      updatedAt: timestamp
    };
    commit(nextState);
    setExpenseFormOpen(false);
    setEditingExpenseId(null);
    setSelectedExpenseId(null);
  }

  function handleSubmitExpenseEdit(input: RecurringExpensePayload) {
    if (!editingExpense) {
      return;
    }

    const now = new Date().toISOString();
    const vendorResolution = resolveExpenseVendor(input.vendorId, input.vendorName, now);
    const nextExpense: RecurringExpense = {
      ...editingExpense,
      name: input.name,
      amountMinor: input.amountMinor,
      amountMinorUnits: input.amountMinor,
      currency: 'SEK',
      period: input.period,
      startMonth: input.startMonth as RecurringExpense['startMonth'],
      chargeDay: input.chargeDay,
      payerPersonId: input.payerPersonId,
      categoryId: input.categoryId,
      vendorId: vendorResolution.vendorId,
      vendorName: vendorResolution.vendorName,
      cancellationNoticeMonths: input.cancellationNoticeMonths ?? 0,
      notes: input.notes,
      status: input.status === 'archived' ? 'completed' : input.status,
      updatedAt: now
    };
    commit({
      ...appState,
      vendors: vendorResolution.vendor ? [...appState.vendors, vendorResolution.vendor] : appState.vendors,
      recurringExpenses: appState.recurringExpenses.map((expense) =>
        expense.id === nextExpense.id ? nextExpense : expense
      ),
      updatedAt: now
    });
    setExpenseFormOpen(false);
    setEditingExpenseId(null);
    setSelectedExpenseId(nextExpense.id);
  }

  function handleUpdateExpense(nextExpense: RecurringExpense) {
    const nextState = {
      ...appState,
      recurringExpenses: appState.recurringExpenses.map((expense) =>
        expense.id === nextExpense.id ? nextExpense : expense
      ),
      updatedAt: new Date().toISOString()
    };
    commit(nextState);
  }

  function handleSimulateRemoveExpense(expense: RecurringExpense) {
    const timestamp = new Date().toISOString();
    const currentIds = appState.simulation?.removedRecurringExpenseIds ?? [];
    const nextIds = currentIds.includes(expense.id) ? currentIds : [...currentIds, expense.id];
    commit({
      ...appState,
      simulation: {
        removedRecurringExpenseIds: nextIds,
        createdAt: appState.simulation?.createdAt ?? timestamp,
        updatedAt: timestamp
      },
      updatedAt: timestamp
    });
    setSelectedExpenseId(null);
    setView('statistics');
  }

  function handleResetSimulation() {
    commit({
      ...appState,
      simulation: undefined,
      updatedAt: new Date().toISOString()
    });
  }

  function resolveExpenseVendor(vendorId: string | undefined, vendorName: string | undefined, timestamp: string) {
    const selectedVendor = vendorId ? vendors.find((vendor) => vendor.id === vendorId) : null;
    if (selectedVendor) {
      return { vendorId: selectedVendor.id, vendorName: selectedVendor.name, vendor: null as Vendor | null };
    }

    const name = vendorName?.trim();
    if (!activeWallet || !name) {
      return { vendorId: undefined, vendorName: undefined, vendor: null as Vendor | null };
    }

    const existingVendor = vendors.find((vendor) => normalizeText(vendor.name) === normalizeText(name));
    if (existingVendor) {
      return { vendorId: existingVendor.id, vendorName: existingVendor.name, vendor: null as Vendor | null };
    }

    const vendor: Vendor = {
      id: createId('vendor'),
      walletId: activeWallet.id,
      name,
      color: '#64748b',
      icon: 'store',
      cancellationInstructions: '',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return { vendorId: vendor.id, vendorName: vendor.name, vendor };
  }

  function handleImportPurchases(rows: PurchaseCsvRow[]) {
    if (!activeWallet || people.length === 0) {
      return { importedCount: 0, skippedDuplicateCount: rows.length };
    }

    const now = new Date();
    const defaultCategoryId = categories[0]?.id;
    const fingerprints = new Set(
      appState.purchases
        .filter((purchase) => purchase.walletId === activeWallet.id)
        .map((purchase) => createPurchaseFingerprint(purchase))
    );
    const nextPurchases: Purchase[] = [];
    let skippedDuplicateCount = 0;

    rows.forEach((row) => {
      const fingerprint = createPurchaseFingerprint(row);
      if (fingerprints.has(fingerprint)) {
        skippedDuplicateCount += 1;
        return;
      }

      fingerprints.add(fingerprint);
      const rule = findMerchantCategoryRule(row.merchant);
      const ruleVendor = rule?.vendorId ? vendors.find((vendor) => vendor.id === rule.vendorId) : undefined;
      nextPurchases.push(
        createPurchase(
          activeWallet.id,
          {
            date: row.date,
            merchant: row.merchant,
            amountMinor: row.amountMinor,
            payerPersonId: people[0].id,
            categoryId: rule?.categoryId ?? defaultCategoryId,
            vendorId: rule?.vendorId,
            vendorName: ruleVendor?.name,
            signals: ['review'],
            source: 'csv'
          },
          now
        )
      );
    });

    if (nextPurchases.length === 0) {
      return { importedCount: 0, skippedDuplicateCount };
    }

    commit({
      ...appState,
      purchases: [...appState.purchases, ...nextPurchases],
      updatedAt: now.toISOString()
    });

    return { importedCount: nextPurchases.length, skippedDuplicateCount };
  }

  function handleTogglePurchaseSignal(purchase: Purchase, signal: PurchaseSignal) {
    const nextPurchase = togglePurchaseSignal(purchase, signal);
    commit({
      ...appState,
      purchases: appState.purchases.map((item) => (item.id === nextPurchase.id ? nextPurchase : item)),
      updatedAt: new Date().toISOString()
    });
  }

  function handleCreateManualPurchase(input: PurchaseInput) {
    if (!activeWallet) {
      return;
    }

    const now = new Date();
    const nextPurchase = createPurchase(activeWallet.id, { ...input, source: 'manual' }, now);
    commit({
      ...appState,
      purchases: [...appState.purchases, nextPurchase],
      updatedAt: now.toISOString()
    });
  }

  function handleUpdatePurchase(purchase: Purchase, input: PurchaseInput) {
    const now = new Date();
    const nextPurchase = updatePurchase(purchase, input, now);
    const shouldApplyRule = input.applyCategoryToSameMerchant && activeWallet && input.categoryId;
    if (shouldApplyRule) {
      const nextRules = upsertMerchantCategoryRule(purchase.merchant, input.categoryId!, input.vendorId, now);
      commit({
        ...appState,
        merchantCategoryRules: nextRules,
        purchases: appState.purchases.map((item) =>
          item.id === nextPurchase.id
            ? nextPurchase
            : item.walletId === activeWallet.id && normalizeText(item.merchant) === normalizeText(purchase.merchant)
              ? updatePurchase(
                  item,
                  {
                    date: item.date,
                    merchant: item.merchant,
                    amountMinor: item.amountMinor,
                    payerPersonId: item.payerPersonId,
                    categoryId: input.categoryId,
                    vendorId: input.vendorId,
                    vendorName: input.vendorName,
                    signals: item.signals,
                    source: item.source
                  },
                  now
                )
              : item
        ),
        updatedAt: now.toISOString()
      });
      return;
    }

    commit({
      ...appState,
      purchases: appState.purchases.map((item) => (item.id === nextPurchase.id ? nextPurchase : item)),
      updatedAt: now.toISOString()
    });
  }

  function findMerchantCategoryRule(merchant: string): MerchantCategoryRule | undefined {
    return merchantCategoryRules.find((rule) => normalizeText(rule.merchantPattern) === normalizeText(merchant));
  }

  function upsertMerchantCategoryRule(
    merchant: string,
    categoryId: string,
    vendorId: string | undefined,
    now: Date
  ): MerchantCategoryRule[] {
    if (!activeWallet) {
      return appState.merchantCategoryRules ?? [];
    }

    const timestamp = now.toISOString();
    const existingRule = findMerchantCategoryRule(merchant);
    const nextRule: MerchantCategoryRule = {
      id: existingRule?.id ?? createId('merchant-rule'),
      walletId: activeWallet.id,
      merchantPattern: merchant.trim(),
      categoryId,
      vendorId: vendorId || undefined,
      createdAt: existingRule?.createdAt ?? timestamp,
      updatedAt: timestamp
    };
    const otherRules = (appState.merchantCategoryRules ?? []).filter((rule) => rule.id !== existingRule?.id);
    return [...otherRules, nextRule];
  }

  function handleCreateRecurringFromPurchase(purchase: Purchase) {
    if (!activeWallet) {
      return;
    }

    const now = new Date();
    const result = createRecurringExpenseFromPurchase(
      activeWallet.id,
      purchase,
      { fallbackCategoryId: categories[0]?.id },
      now
    );

    commit({
      ...appState,
      recurringExpenses: [...appState.recurringExpenses, result.expense],
      purchases: appState.purchases.map((item) => (item.id === purchase.id ? result.purchase : item)),
      updatedAt: now.toISOString()
    });
    setSelectedExpenseId(result.expense.id);
    setView('overview');
  }

  function handleConvertExpenseToPurchase(expense: RecurringExpense) {
    if (!activeWallet) {
      return;
    }

    const now = new Date();
    const completedExpense = completeRecurringExpenseAsPurchase(expense, now);
    const sourcePurchase = expense.sourcePurchaseId
      ? appState.purchases.find((purchase) => purchase.id === expense.sourcePurchaseId)
      : undefined;
    const nextPurchases = sourcePurchase
      ? appState.purchases.map((purchase) =>
          purchase.id === sourcePurchase.id ? unlinkPurchaseFromRecurringExpense(purchase, expense.id, now) : purchase
        )
      : [...appState.purchases, createPurchaseFromRecurringExpense(expense, undefined, now)];

    commit({
      ...appState,
      recurringExpenses: appState.recurringExpenses.map((item) => (item.id === expense.id ? completedExpense : item)),
      purchases: nextPurchases,
      updatedAt: now.toISOString()
    });
    setSelectedExpenseId(null);
    setView(settings.purchasesEnabled ? 'purchases' : 'overview');
  }

  function handleImportState(nextState: AppState) {
    commit({ ...nextState, updatedAt: new Date().toISOString() });
    setSelectedExpenseId(null);
    setExpenseFormOpen(false);
    setEditingExpenseId(null);
    setView('overview');
  }

  function handleUpdateAppState(nextState: AppState) {
    if (nextState.activeWalletId !== appState.activeWalletId) {
      setSelectedExpenseId(null);
      setEditingExpenseId(null);
      setExpenseFormOpen(false);
      setExpenseSearchQuery('');
      setExpenseCategoryFilter('');
      setExpensePayerFilter('');
    }
    commit(nextState);
  }

  function handleClearData() {
    clearAppState();
    setAppState(createInitialState());
    setSelectedExpenseId(null);
    setExpenseFormOpen(false);
    setEditingExpenseId(null);
    setView('overview');
  }

  function handleEditExpense(expense: RecurringExpense) {
    setEditingExpenseId(expense.id);
    setSelectedExpenseId(null);
    setExpenseFormOpen(true);
  }

  function handleDeleteExpense(expense: RecurringExpense) {
    const now = new Date();
    commit({
      ...appState,
      recurringExpenses: appState.recurringExpenses.filter((item) => item.id !== expense.id),
      purchases: appState.purchases.map((purchase) => unlinkPurchaseFromRecurringExpense(purchase, expense.id, now)),
      updatedAt: now.toISOString()
    });
    setSelectedExpenseId(null);
    setEditingExpenseId(null);
    setExpenseFormOpen(false);
  }

  function handleUpdateSettings(nextSettings: AppSettings) {
    const normalizedSettings = {
      ...nextSettings,
      businessSignalLabel: nextSettings.businessSignalLabel.slice(0, 24)
    };
    commit({
      ...appState,
      settings: normalizedSettings,
      updatedAt: new Date().toISOString()
    });
    if (!normalizedSettings.purchasesEnabled && view === 'purchases') {
      setView('overview');
    }
  }

  function openExpenseCreate() {
    setEditingExpenseId(null);
    setExpenseFormOpen(true);
    setQuickActionOpen(false);
  }

  function openPurchaseQuickAction(kind: 'create' | 'import') {
    setView(kind === 'import' ? 'data' : 'purchases');
    setPurchaseQuickAction({ kind, id: Date.now() });
    setQuickActionOpen(false);
  }

  if (!activeWallet) {
    return (
      <main className="app-shell app-shell--empty">
        <FirstRunSetup traceIds="DS-JNY001-01 / DS-EMPTY-START-001 / DS-STARTER-REGISTER-001" onCreate={handleCreateWallet} />
      </main>
    );
  }

  return (
    <main className="app-shell" data-trace={TRACE_IDS}>
      <header className="topbar" aria-label="Plånboksöversikt">
        <div>
          <span className="eyebrow">Lokal kontrollbild</span>
          <h1>{activeWallet.name}</h1>
        </div>
        <div className="topbar__actions">
          <span className="local-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            Sparas lokalt
          </span>
          <nav className="segmented-nav" aria-label="Huvudvy" data-trace="DS-RESPONSIVE-NAV-001 / DS-MOBILE-NO-OVERLAP-001">
            <button
              type="button"
              className={view === 'overview' ? 'is-active' : ''}
              onClick={() => setView('overview')}
            >
              Översikt
            </button>
            <button
              type="button"
              className={view === 'purchases' ? 'is-active' : ''}
              onClick={() => setView('purchases')}
              disabled={!settings.purchasesEnabled}
            >
              Inköp
            </button>
            <button
              type="button"
              className={view === 'statistics' ? 'is-active' : ''}
              onClick={() => setView('statistics')}
            >
              Statistik
            </button>
            <button type="button" className={view === 'data' ? 'is-active' : ''} onClick={() => setView('data')}>
              Data
            </button>
            <button type="button" className={view === 'help' ? 'is-active' : ''} onClick={() => setView('help')}>
              Hjälp
            </button>
          </nav>
          <button
            className="icon-button"
            type="button"
            onClick={() => setQuickActionOpen(true)}
            data-trace="DS-QUICK-001"
          >
            <Plus size={18} aria-hidden="true" />
            <span>Snabbåtgärd</span>
          </button>
          <button
            className="icon-button icon-button--primary"
            type="button"
            onClick={openExpenseCreate}
          >
            <Plus size={18} aria-hidden="true" />
            <span>Ny utgift</span>
          </button>
        </div>
      </header>

      {view === 'overview' ? (
        <>
          <section className="control-grid" aria-label="Snabbstatus">
            <StatusTile icon={<WalletCards size={18} />} label="Plånbok" value={activeWallet.name} />
            <StatusTile
              icon={<CircleDollarSign size={18} />}
              label="Månadstotal"
              value={formatSek(timeline?.currentMonthTotal ?? 0)}
            />
            <StatusTile icon={<Database size={18} />} label="Poster" value={`${simulatedActiveExpenses.length} återkommande`} />
            <StatusTile icon={<ReceiptText size={18} />} label="Inköp" value={settings.purchasesEnabled ? `${purchases.length} importerade` : 'Modul av'} />
          </section>

          {draftExpenses.length > 0 ? (
            <section className="panel draft-panel" aria-label="Utkast" data-trace="DS-DRAFT-EXPENSE-001">
              <div className="panel__header">
                <div>
                  <span className="eyebrow">Utkast</span>
                  <h2>Ofullständiga utgifter</h2>
                </div>
              </div>
              <div className="draft-list">
                {draftExpenses.map((expense) => (
                  <button
                    key={expense.id}
                    className="draft-row"
                    type="button"
                    onClick={() => {
                      setEditingExpenseId(expense.id);
                      setExpenseFormOpen(true);
                    }}
                  >
                    <span>{expense.name}</span>
                    <small>Fortsätt utkast</small>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel filter-panel" aria-label="Filtrera återkommande utgifter" data-trace="DS-FILTER-001">
            <div className="filter-bar filter-bar--overview">
              <div className="field">
                <label htmlFor="expense-search">Sök utgifter</label>
                <input
                  id="expense-search"
                  value={expenseSearchQuery}
                  onChange={(event) => setExpenseSearchQuery(event.target.value)}
                  placeholder="Namn, leverantör eller anteckning"
                />
              </div>
              <div className="field">
                <label htmlFor="expense-category-filter">Kategori</label>
                <select
                  id="expense-category-filter"
                  value={expenseCategoryFilter}
                  onChange={(event) => setExpenseCategoryFilter(event.target.value)}
                >
                  <option value="">Alla kategorier</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="expense-payer-filter">Betalare</label>
                <select
                  id="expense-payer-filter"
                  value={expensePayerFilter}
                  onChange={(event) => setExpensePayerFilter(event.target.value)}
                >
                  <option value="">Alla betalare</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="chip filter-count">Visar {visibleExpenses.length}/{simulatedActiveExpenses.length}</span>
            </div>
          </section>

          <TimelineView
            wallet={activeWallet}
            people={people}
            categories={categories}
            timeline={timeline}
            expenses={visibleExpenses}
            onAddExpense={() => {
              setEditingExpenseId(null);
              setExpenseFormOpen(true);
            }}
            onSelectExpense={setSelectedExpenseId}
          />
        </>
      ) : view === 'purchases' ? (
        <PurchasesView
          purchases={purchases}
          people={people}
          categories={categories}
          vendors={vendors}
          onCreatePurchase={handleCreateManualPurchase}
          onUpdatePurchase={handleUpdatePurchase}
          onToggleSignal={handleTogglePurchaseSignal}
          onCreateRecurringFromPurchase={handleCreateRecurringFromPurchase}
          businessSignalLabel={businessSignalLabel}
          quickActionRequest={purchaseQuickAction?.kind === 'create' ? { id: purchaseQuickAction.id } : null}
        />
      ) : view === 'statistics' ? (
        <StatisticsView
          statistics={statistics}
          businessSignalLabel={businessSignalLabel}
          purchasesEnabled={settings.purchasesEnabled}
          simulationActive={simulationActive}
          simulationRemovedCount={simulatedRemovedExpenseIds.length}
          onResetSimulation={handleResetSimulation}
        />
      ) : view === 'data' ? (
        <DataView
          appState={{ ...appState, settings }}
          onImportState={handleImportState}
          onClearData={handleClearData}
          onUpdateAppState={handleUpdateAppState}
          onUpdateSettings={handleUpdateSettings}
          onImportPurchases={handleImportPurchases}
          purchaseImportQuickAction={purchaseQuickAction?.kind === 'import' ? { id: purchaseQuickAction.id } : null}
        />
      ) : (
        <HelpView />
      )}

      {isExpenseFormOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-expense-title"
            data-trace="DS-CREATION-MODAL-001 / DS-MOBILE-NO-OVERLAP-001"
          >
            <div className="panel__header">
              <div>
                <span className="eyebrow">{editingExpense ? 'Redigera post' : 'Ny återkommande post'}</span>
                <h2 id="new-expense-title">{editingExpense ? 'Redigera månadskostnad' : 'Lägg till månadskostnad'}</h2>
                <p>Belopp, betalare och kategori räcker för kontrollbilden.</p>
              </div>
            </div>
            <RecurringExpenseForm
              people={people}
              categories={categories}
              vendors={vendors}
              initialValue={editingExpense ?? undefined}
              onCancel={() => {
                setExpenseFormOpen(false);
                setEditingExpenseId(null);
              }}
              onCreate={editingExpense ? undefined : handleCreateExpense}
              onSubmit={editingExpense ? handleSubmitExpenseEdit : undefined}
              onSaveDraft={editingExpense ? undefined : handleSaveExpenseDraft}
            />
          </section>
        </div>
      ) : null}

      {isQuickActionOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal quick-action-modal" role="dialog" aria-modal="true" aria-labelledby="quick-action-title">
            <div className="panel__header">
              <div>
                <span className="eyebrow">Snabbåtgärd</span>
                <h2 id="quick-action-title">Lägg till data</h2>
                <p>Välj vad du vill registrera i den aktiva plånboken.</p>
              </div>
              <button
                className="icon-button icon-button--ghost"
                type="button"
                onClick={() => setQuickActionOpen(false)}
                aria-label="Stäng snabbåtgärd"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="quick-action-grid">
              <button className="quick-action-tile" type="button" onClick={openExpenseCreate}>
                <ReceiptText aria-hidden="true" size={20} />
                <span>
                  <strong>Ny återkommande utgift</strong>
                  <small>Belopp, betalare och kategori.</small>
                </span>
              </button>
              <button
                className="quick-action-tile"
                type="button"
                onClick={() => openPurchaseQuickAction('create')}
                disabled={!settings.purchasesEnabled}
              >
                <ShoppingBag aria-hidden="true" size={20} />
                <span>
                  <strong>Nytt köp</strong>
                  <small>Registrera ett enskilt lokalt köp.</small>
                </span>
              </button>
              <button
                className="quick-action-tile"
                type="button"
                onClick={() => openPurchaseQuickAction('import')}
                disabled={!settings.purchasesEnabled}
              >
                <FileUp aria-hidden="true" size={20} />
                <span>
                  <strong>Importera köp</strong>
                  <small>Välj CSV, XLSX, PDF eller klistra in CSV.</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <ExpenseDetailDrawer
        expense={selectedExpense}
        people={people}
        categories={categories}
        vendors={vendors}
        onClose={() => setSelectedExpenseId(null)}
        onEdit={handleEditExpense}
        onUpdate={handleUpdateExpense}
        onSimulateRemove={handleSimulateRemoveExpense}
        isSimulatedRemoved={selectedExpense ? simulatedRemovedExpenseIdsSet.has(selectedExpense.id) : false}
        onConvertToPurchase={handleConvertExpenseToPurchase}
        onDelete={handleDeleteExpense}
      />
    </main>
  );
}

function StatusTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="status-tile">
      <div className="status-tile__icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function formatSek(minorUnits: number) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0
  }).format(minorUnits / 100);
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('sv-SE');
}

function parseOptionalAmountToMinor(value?: string) {
  const normalized = (value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) {
    return 0;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return 0;
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
}
