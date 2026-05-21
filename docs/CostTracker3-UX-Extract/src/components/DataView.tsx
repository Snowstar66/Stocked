import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  Cloud,
  Copy,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  FileUp,
  Link2,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  UploadCloud,
  Users,
  X
} from 'lucide-react';
import {
  DEFAULT_APP_SETTINGS,
  createDefaultCategories,
  createDefaultVendors,
  createPerson,
  createWallet
} from '../domain/defaults';
import type { AppSettings, AppState, RecurringExpense } from '../domain/types';
import { serializePurchasesCsv, serializeRecurringExpensesCsv } from '../storage/csvExport';
import { createExportFileName, parseAppStateExport, serializeAppStateExport } from '../storage/localStore';
import { createHandoffHtml, createPdfReport, createPortableFileName, createZipPackage } from '../storage/portableExport';
import { PurchaseImportPanel } from './PurchaseImportPanel';
import type { PurchaseCsvRow } from '../domain/purchases';

interface DataViewProps {
  appState: AppState;
  onImportState: (state: AppState) => void;
  onClearData: () => void;
  onUpdateAppState?: (state: AppState) => void;
  onUpdateSettings?: (settings: AppSettings) => void;
  onImportPurchases?: (rows: PurchaseCsvRow[]) => { importedCount: number; skippedDuplicateCount: number } | void;
  purchaseImportQuickAction?: { id: number } | null;
}

type RegisterKind = 'person' | 'category' | 'vendor';

type FileSystemWritableFileStreamLike = {
  write: (data: Blob | string) => Promise<void>;
  close: () => Promise<void>;
};

type FileSystemFileHandleLike = {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStreamLike>;
};

type FileSystemWindow = Window &
  typeof globalThis & {
    showSaveFilePicker?: (options: {
      suggestedName?: string;
      types?: Array<{ description: string; accept: Record<string, string[]> }>;
    }) => Promise<FileSystemFileHandleLike>;
    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      types?: Array<{ description: string; accept: Record<string, string[]> }>;
    }) => Promise<FileSystemFileHandleLike[]>;
  };

export function DataView({
  appState,
  onImportState,
  onClearData,
  onUpdateAppState,
  onUpdateSettings,
  onImportPurchases,
  purchaseImportQuickAction
}: DataViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('JSON-exporten innehåller den data som finns lokalt i denna browser.');
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [importConfirmation, setImportConfirmation] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletPayerName, setNewWalletPayerName] = useState('');
  const [deleteWalletConfirmation, setDeleteWalletConfirmation] = useState('');
  const [connectedDataFile, setConnectedDataFile] = useState<FileSystemFileHandleLike | null>(null);
  const [syncEndpoint, setSyncEndpoint] = useState(appState.cloudSync?.endpoint ?? '');
  const [syncToken, setSyncToken] = useState(appState.cloudSync?.token ?? '');
  const [syncRevision, setSyncRevision] = useState(appState.cloudSync?.revision ?? '');
  const [draftSettings, setDraftSettings] = useState<AppSettings>({
    ...DEFAULT_APP_SETTINGS,
    ...(appState.settings ?? {})
  });
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    exportedAt?: string;
    state: AppState;
    dataFileHandle?: FileSystemFileHandleLike;
  } | null>(null);
  const activeWalletId = appState.activeWalletId;
  const activePeople = activeWalletId ? appState.people.filter((person) => person.walletId === activeWalletId) : [];
  const activeCategories = activeWalletId
    ? appState.categories.filter((category) => category.walletId === activeWalletId)
    : [];
  const activeVendors = activeWalletId ? appState.vendors.filter((vendor) => vendor.walletId === activeWalletId) : [];
  const activeWallet = activeWalletId ? appState.wallets.find((wallet) => wallet.id === activeWalletId) : null;
  const fileSystemAccessSupported = getFileSystemWindow().showSaveFilePicker && getFileSystemWindow().showOpenFilePicker;

  useEffect(() => {
    if (!connectedDataFile) {
      return;
    }

    void writeStateToDataFile(connectedDataFile, appState)
      .then(() => setMessage(`Ansluten datafil autosparad: ${connectedDataFile.name}`))
      .catch(() => setMessage('Kunde inte autospara till ansluten datafil. Spara om eller anslut filen igen.'));
  }, [appState, connectedDataFile]);

  function handleExport() {
    const blob = new Blob([serializeAppStateExport(appState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = createExportFileName();
    link.click();
    URL.revokeObjectURL(url);
    setMessage('JSON-backup skapad. Spara filen på en plats du själv kontrollerar.');
  }

  function handleCsvExport(kind: 'expenses' | 'purchases') {
    if (!activeWalletId) {
      return;
    }

    const csv =
      kind === 'expenses'
        ? serializeRecurringExpensesCsv(
            appState.recurringExpenses.filter((expense) => expense.walletId === activeWalletId),
            activePeople,
            activeCategories,
            activeVendors
          )
        : serializePurchasesCsv(
            appState.purchases.filter((purchase) => purchase.walletId === activeWalletId),
            activePeople,
            activeCategories,
            activeVendors
          );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = createCsvFileName(kind);
    link.click();
    URL.revokeObjectURL(url);
    setMessage(kind === 'expenses' ? 'CSV-export för utgifter skapad lokalt.' : 'CSV-export för köp skapad lokalt.');
  }

  function handlePortableExport(kind: 'zip' | 'pdf' | 'handoff') {
    const blob =
      kind === 'zip' ? createZipPackage(appState) : kind === 'pdf' ? createPdfReport(appState) : createHandoffHtml(appState);
    downloadBlob(blob, createPortableFileName(kind));
    setMessage(
      kind === 'zip'
        ? 'ZIP-backup skapad med context.json och lokala bilagor.'
        : kind === 'pdf'
          ? 'PDF-rapport skapad lokalt.'
          : 'HTML-handoff skapad lokalt och kan importeras tillbaka.'
    );
  }

  async function handleCreateDataFile() {
    const api = getFileSystemWindow();
    if (!api.showSaveFilePicker) {
      setMessage('Datafil krÃ¤ver en browser som stÃ¶djer File System Access API.');
      return;
    }

    try {
      const handle = await api.showSaveFilePicker({
        suggestedName: createPortableFileName('data'),
        types: [{ description: 'CostTracker3 JSON', accept: { 'application/json': ['.json'] } }]
      });
      await writeStateToDataFile(handle, appState);
      setConnectedDataFile(handle);
      setMessage(`FristÃ¥ende datafil skapad och ansluten: ${handle.name}`);
    } catch {
      setMessage('Datafilen skapades inte. Ingen lokal data Ã¤ndrades.');
    }
  }

  async function handleReconnectDataFile() {
    const api = getFileSystemWindow();
    if (!api.showOpenFilePicker) {
      setMessage('Ã…teranslutning krÃ¤ver en browser som stÃ¶djer File System Access API.');
      return;
    }

    try {
      const [handle] = await api.showOpenFilePicker({
        multiple: false,
        types: [{ description: 'CostTracker3 JSON eller HTML', accept: { 'application/json': ['.json'], 'text/html': ['.html'] } }]
      });
      if (!handle) {
        return;
      }
      const file = await handle.getFile();
      const raw = await readFileAsText(file);
      const result = parseAppStateExport(raw);
      if (!result.ok || !result.state) {
        setMessage(result.error ?? 'Datafilen kunde inte lÃ¤sas.');
        return;
      }

      setPendingImport({
        fileName: handle.name,
        exportedAt: result.exportedAt,
        state: result.state,
        dataFileHandle: handle
      });
      setImportConfirmation('');
      setMessage('Datafilen Ã¤r lÃ¤st. Kontrollera sammanfattningen och skriv IMPORTERA fÃ¶r att ansluta den.');
    } catch {
      setMessage('Datafilen anslÃ¶ts inte. Ingen lokal data Ã¤ndrades.');
    }
  }

  async function handleSaveConnectedDataFile() {
    if (!connectedDataFile) {
      setMessage('Ingen datafil Ã¤r ansluten i denna session.');
      return;
    }

    try {
      await writeStateToDataFile(connectedDataFile, appState);
      setMessage(`Ansluten datafil sparad: ${connectedDataFile.name}`);
    } catch {
      setMessage('Kunde inte spara till ansluten datafil. Anslut filen igen.');
    }
  }

  function handleSaveSyncConfig() {
    if (!onUpdateAppState) {
      return;
    }

    const endpoint = syncEndpoint.trim();
    if (!endpoint) {
      setMessage('Ange en endpoint innan experimentell sync sparas.');
      return;
    }

    const timestamp = new Date().toISOString();
    onUpdateAppState({
      ...appState,
      cloudSync: {
        endpoint,
        token: syncToken.trim() || undefined,
        revision: syncRevision.trim() || appState.cloudSync?.revision,
        status: 'configured',
        updatedAt: timestamp
      },
      updatedAt: timestamp
    });
    setMessage('Experimentell sync-konfiguration sparades lokalt.');
  }

  function handleDisconnectSync() {
    if (!onUpdateAppState) {
      return;
    }

    const timestamp = new Date().toISOString();
    onUpdateAppState({
      ...appState,
      cloudSync: undefined,
      updatedAt: timestamp
    });
    setSyncEndpoint('');
    setSyncToken('');
    setSyncRevision('');
    setMessage('Experimentell sync kopplades frÃ¥n lokalt.');
  }

  async function handlePushSync() {
    const sync = appState.cloudSync;
    if (!sync) {
      setMessage('Spara sync-konfiguration innan push.');
      return;
    }

    try {
      const response = await fetch(sync.endpoint, {
        method: 'PUT',
        headers: createSyncHeaders(sync.token, sync.revision),
        body: serializeAppStateExport(appState)
      });

      if (response.status === 409) {
        updateSyncState('conflict', sync.revision, 'Molnkonflikt: revision matchar inte. Ingen data skrevs automatiskt.');
        return;
      }

      if (!response.ok) {
        updateSyncState('error', sync.revision, `Sync push misslyckades (${response.status}).`);
        return;
      }

      const revision = response.headers.get('etag') ?? (await readRevisionFromResponse(response)) ?? sync.revision;
      updateSyncState('synced', revision, undefined, 'Push till experimentell endpoint klar.');
    } catch {
      updateSyncState('error', sync.revision, 'Sync push kunde inte nÃ¥ endpointen.');
    }
  }

  async function handlePullSync() {
    const sync = appState.cloudSync;
    if (!sync) {
      setMessage('Spara sync-konfiguration innan pull.');
      return;
    }

    try {
      const response = await fetch(sync.endpoint, {
        method: 'GET',
        headers: createSyncHeaders(sync.token, sync.revision)
      });

      if (response.status === 409) {
        updateSyncState('conflict', sync.revision, 'Molnkonflikt: revision matchar inte. Ingen lokal data ersattes.');
        return;
      }

      if (!response.ok) {
        updateSyncState('error', sync.revision, `Sync pull misslyckades (${response.status}).`);
        return;
      }

      const text = await response.text();
      const result = parseAppStateExport(text);
      if (!result.ok || !result.state) {
        updateSyncState('error', sync.revision, result.error ?? 'Sync-svaret matchar inte appens dataformat.');
        return;
      }

      const revision = response.headers.get('etag') ?? sync.revision;
      const timestamp = new Date().toISOString();
      onImportState({
        ...result.state,
        cloudSync: {
          ...sync,
          revision,
          status: 'synced',
          lastSyncedAt: timestamp,
          lastError: undefined,
          updatedAt: timestamp
        },
        updatedAt: timestamp
      });
      setSyncRevision(revision ?? '');
      setMessage('Pull frÃ¥n experimentell endpoint klar. Lokal data ersattes med svaret.');
    } catch {
      updateSyncState('error', sync.revision, 'Sync pull kunde inte nÃ¥ endpointen.');
    }
  }

  function updateSyncState(
    status: NonNullable<AppState['cloudSync']>['status'],
    revision?: string,
    lastError?: string,
    successMessage?: string
  ) {
    if (!onUpdateAppState || !appState.cloudSync) {
      return;
    }

    const timestamp = new Date().toISOString();
    onUpdateAppState({
      ...appState,
      cloudSync: {
        ...appState.cloudSync,
        revision,
        status,
        lastSyncedAt: status === 'synced' ? timestamp : appState.cloudSync.lastSyncedAt,
        lastError,
        updatedAt: timestamp
      },
      updatedAt: timestamp
    });
    setSyncRevision(revision ?? '');
    setMessage(successMessage ?? lastError ?? 'Experimentell sync uppdaterades.');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const raw = await readFileAsText(file);
    const result = parseAppStateExport(raw);
    if (!result.ok || !result.state) {
      setPendingImport(null);
      setImportConfirmation('');
      setMessage(result.error ?? 'Importen kunde inte genomföras.');
      return;
    }

    setPendingImport({
      fileName: file.name,
      exportedAt: result.exportedAt,
      state: result.state
    });
    setImportConfirmation('');
    setMessage('Backupen är läst. Kontrollera sammanfattningen och skriv IMPORTERA för att ersätta lokal data.');
  }

  function handleConfirmImport() {
    if (!pendingImport) {
      return;
    }

    if (importConfirmation.trim().toUpperCase() !== 'IMPORTERA') {
      setMessage('Skriv IMPORTERA för att bekräfta att lokal data ska ersättas.');
      return;
    }

    onImportState(pendingImport.state);
    if (pendingImport.dataFileHandle) {
      setConnectedDataFile(pendingImport.dataFileHandle);
    }
    setPendingImport(null);
    setImportConfirmation('');
    setMessage(
      pendingImport.dataFileHandle
        ? 'Datafil ansluten. Appen visar nu den importerade lokala datan.'
        : 'JSON-backup importerad. Appen visar nu den importerade lokala datan.'
    );
  }

  function handleCancelImport() {
    setPendingImport(null);
    setImportConfirmation('');
    setMessage('Importen avbröts. Lokal data är oförändrad.');
  }

  function handleClear() {
    if (clearConfirmation.trim().toUpperCase() !== 'RENSA') {
      setMessage('Skriv RENSA för att bekräfta att lokal data ska tas bort.');
      return;
    }

    onClearData();
    setClearConfirmation('');
    setMessage('Lokal data rensades i denna browser.');
  }

  function updateSettings(patch: Partial<AppSettings>) {
    if (!onUpdateSettings) {
      return;
    }

    const nextSettings = {
      ...draftSettings,
      ...patch
    };
    setDraftSettings(nextSettings);
    onUpdateSettings(nextSettings);
    setMessage('Produktinställningen sparades lokalt.');
  }

  function updateRegisterState(nextState: AppState, nextMessage: string) {
    if (!onUpdateAppState) {
      return;
    }

    onUpdateAppState({
      ...nextState,
      updatedAt: new Date().toISOString()
    });
    setMessage(nextMessage);
  }

  function handleSelectActiveWallet(walletId: string) {
    if (!walletId || walletId === activeWalletId || !appState.wallets.some((wallet) => wallet.id === walletId)) {
      return;
    }

    updateRegisterState(
      {
        ...appState,
        activeWalletId: walletId,
        wallets: appState.wallets.map((wallet) => ({ ...wallet, active: wallet.id === walletId }))
      },
      'Aktiv plånbok byttes lokalt.'
    );
  }

  function handleCreateWallet() {
    const walletName = newWalletName.trim();
    const payerName = newWalletPayerName.trim();
    if (!walletName || !payerName) {
      setMessage('Skriv namn på plånbok och första betalare.');
      return;
    }

    const timestamp = new Date().toISOString();
    const wallet = createWallet(walletName, timestamp);
    const payer = createPerson(wallet.id, payerName, timestamp);
    updateRegisterState(
      {
        ...appState,
        activeWalletId: wallet.id,
        wallets: [...appState.wallets.map((item) => ({ ...item, active: false })), wallet],
        people: [...appState.people, payer],
        categories: [...appState.categories, ...createDefaultCategories(wallet.id, timestamp)],
        vendors: [...appState.vendors, ...createDefaultVendors(wallet.id, timestamp)]
      },
      'Ny plånbok skapades och valdes lokalt.'
    );
    setNewWalletName('');
    setNewWalletPayerName('');
  }

  function handleDuplicateActiveWallet() {
    if (!activeWallet || !activeWalletId) {
      return;
    }

    const timestamp = new Date().toISOString();
    const walletId = createLocalId('wallet');
    const wallet = {
      ...activeWallet,
      id: walletId,
      name: `${activeWallet.name} kopia`,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const personIdMap = new Map<string, string>();
    const categoryIdMap = new Map<string, string>();
    const vendorIdMap = new Map<string, string>();
    const people = activePeople.map((person) => {
      const id = createLocalId('person');
      personIdMap.set(person.id, id);
      return { ...person, id, walletId, createdAt: timestamp, updatedAt: timestamp };
    });
    const categories = activeCategories.map((category) => {
      const id = createLocalId('category');
      categoryIdMap.set(category.id, id);
      return { ...category, id, walletId, createdAt: timestamp, updatedAt: timestamp };
    });
    const vendors = activeVendors.map((vendor) => {
      const id = createLocalId('vendor');
      vendorIdMap.set(vendor.id, id);
      return { ...vendor, id, walletId, createdAt: timestamp, updatedAt: timestamp };
    });
    const fallbackPersonId = people[0]?.id;
    const fallbackCategoryId = categories[0]?.id;
    const recurringExpenses = appState.recurringExpenses
      .filter((expense) => expense.walletId === activeWalletId)
      .map((expense): RecurringExpense => {
        const vendorId = expense.vendorId ? vendorIdMap.get(expense.vendorId) : undefined;
        return {
          ...expense,
          id: createLocalId('expense'),
          walletId,
          payerPersonId: personIdMap.get(expense.payerPersonId) ?? fallbackPersonId ?? expense.payerPersonId,
          categoryId: categoryIdMap.get(expense.categoryId) ?? fallbackCategoryId ?? expense.categoryId,
          vendorId,
          sourcePurchaseId: undefined,
          cancellationReminderMonth: undefined,
          cancellationReminderStatus: undefined,
          cancellationReminderCompletedAt: undefined,
          createdAt: timestamp,
          updatedAt: timestamp
        };
      });

    updateRegisterState(
      {
        ...appState,
        activeWalletId: walletId,
        wallets: [...appState.wallets.map((item) => ({ ...item, active: false })), wallet],
        people: [...appState.people, ...people],
        categories: [...appState.categories, ...categories],
        vendors: [...appState.vendors, ...vendors],
        recurringExpenses: [...appState.recurringExpenses, ...recurringExpenses]
      },
      'Plånboken duplicerades som lokal mall.'
    );
  }

  function handleDeleteActiveWallet() {
    if (!activeWallet || !activeWalletId) {
      return;
    }

    if (deleteWalletConfirmation.trim() !== activeWallet.name) {
      setMessage('Skriv den aktiva plånbokens namn för att bekräfta radering.');
      return;
    }

    const remainingWallets = appState.wallets.filter((wallet) => wallet.id !== activeWalletId);
    const nextActiveWalletId = remainingWallets[0]?.id ?? null;
    updateRegisterState(
      {
        ...appState,
        activeWalletId: nextActiveWalletId,
        wallets: remainingWallets.map((wallet) => ({ ...wallet, active: wallet.id === nextActiveWalletId })),
        people: appState.people.filter((person) => person.walletId !== activeWalletId),
        categories: appState.categories.filter((category) => category.walletId !== activeWalletId),
        vendors: appState.vendors.filter((vendor) => vendor.walletId !== activeWalletId),
        recurringExpenses: appState.recurringExpenses.filter((expense) => expense.walletId !== activeWalletId),
        purchases: appState.purchases.filter((purchase) => purchase.walletId !== activeWalletId)
      },
      nextActiveWalletId
        ? 'Aktiv plånbok raderades lokalt. En annan plånbok valdes.'
        : 'Aktiv plånbok raderades lokalt.'
    );
    setDeleteWalletConfirmation('');
  }

  function handleCreateRegisterItem(kind: RegisterKind) {
    if (!activeWalletId) {
      return;
    }

    const name =
      kind === 'person' ? newPersonName.trim() : kind === 'category' ? newCategoryName.trim() : newVendorName.trim();
    if (!name) {
      setMessage('Skriv ett namn innan du lägger till registerposten.');
      return;
    }

    const timestamp = new Date().toISOString();
    if (kind === 'person') {
      updateRegisterState(
        {
          ...appState,
          people: [
            ...appState.people,
            { id: createLocalId('person'), walletId: activeWalletId, name, status: 'active', createdAt: timestamp, updatedAt: timestamp }
          ]
        },
        'Betalare lades till lokalt.'
      );
      setNewPersonName('');
      return;
    }

    if (kind === 'category') {
      const nextSortOrder = activeCategories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 1;
      updateRegisterState(
        {
          ...appState,
          categories: [
            ...appState.categories,
            {
              id: createLocalId('category'),
              walletId: activeWalletId,
              name,
              color: '#475569',
              icon: 'tag',
              sortOrder: nextSortOrder,
              status: 'active',
              createdAt: timestamp,
              updatedAt: timestamp
            }
          ]
        },
        'Kategori lades till lokalt.'
      );
      setNewCategoryName('');
      return;
    }

    updateRegisterState(
      {
        ...appState,
        vendors: [
          ...appState.vendors,
          {
            id: createLocalId('vendor'),
            walletId: activeWalletId,
            name,
            color: '#64748b',
            icon: 'store',
            cancellationInstructions: '',
            status: 'active',
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ]
      },
      'Leverantör lades till lokalt.'
    );
    setNewVendorName('');
  }

  function handleRenameRegisterItem(kind: RegisterKind, id: string, name: string) {
    const timestamp = new Date().toISOString();

    if (kind === 'person') {
      updateRegisterState(
        {
          ...appState,
          people: appState.people.map((person) =>
            person.id === id ? { ...person, name, updatedAt: timestamp } : person
          )
        },
        'Betalare uppdaterades lokalt.'
      );
      return;
    }

    if (kind === 'category') {
      updateRegisterState(
        {
          ...appState,
          categories: appState.categories.map((category) =>
            category.id === id ? { ...category, name, updatedAt: timestamp } : category
          )
        },
        'Kategori uppdaterades lokalt.'
      );
      return;
    }

    updateRegisterState(
      {
        ...appState,
        vendors: appState.vendors.map((vendor) =>
          vendor.id === id ? { ...vendor, name, updatedAt: timestamp } : vendor
        )
      },
      'Leverantör uppdaterades lokalt.'
    );
  }

  function handleUpdateVendorInstructions(vendorId: string, cancellationInstructions: string) {
    const timestamp = new Date().toISOString();
    updateRegisterState(
      {
        ...appState,
        vendors: appState.vendors.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, cancellationInstructions, updatedAt: timestamp } : vendor
        )
      },
      'Uppsägningsinstruktion sparades lokalt.'
    );
  }

  function handleUpdatePersonBudget(personId: string, value: string) {
    const timestamp = new Date().toISOString();
    const monthlyBudgetMinor = parseBudgetInput(value);
    updateRegisterState(
      {
        ...appState,
        people: appState.people.map((person) =>
          person.id === personId ? { ...person, monthlyBudgetMinor, updatedAt: timestamp } : person
        )
      },
      'Månadsbudget sparades lokalt.'
    );
  }

  function handleUpdateTimelineWindow(field: 'monthsBack' | 'monthsForward', value: string) {
    if (!activeWallet) {
      return;
    }

    const max = field === 'monthsBack' ? 24 : 36;
    const parsed = Number.parseInt(value, 10);
    const normalized = Number.isFinite(parsed) ? Math.min(max, Math.max(0, parsed)) : 0;
    const timestamp = new Date().toISOString();
    updateRegisterState(
      {
        ...appState,
        wallets: appState.wallets.map((wallet) =>
          wallet.id === activeWallet.id ? { ...wallet, [field]: normalized, updatedAt: timestamp } : wallet
        )
      },
      'Tidslinjefönster sparades lokalt.'
    );
  }

  return (
    <section className="panel data-view" aria-labelledby="data-view-title" data-trace="DS-JNY007-01..05">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Data</span>
          <h2 id="data-view-title">Lokal data och backup</h2>
          <p>Din ekonomidata sparas lokalt i den här browsern. Ingen data skickas till konto, bank eller moln.</p>
        </div>
        <span className="local-badge">
          <ShieldCheck aria-hidden="true" size={16} />
          Local-first
        </span>
      </div>

      <div className="data-grid">
        <article className="data-card data-card--wide" data-trace="DS-ACTIVE-WALLET-001 / DS-DUPLICATE-WALLET-001 / DS-DELETE-WALLET-001">
          <h3>Plånböcker</h3>
          <p>Skapa och välj lokal plånbok. Varje plånbok har egna betalare, register, utgifter och köp.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="active-wallet-select">Aktiv plånbok</label>
              <select
                id="active-wallet-select"
                value={activeWalletId ?? ''}
                onChange={(event) => handleSelectActiveWallet(event.target.value)}
              >
                {appState.wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="new-wallet-name">Ny plånbok</label>
              <input id="new-wallet-name" value={newWalletName} onChange={(event) => setNewWalletName(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="new-wallet-payer">Första betalare i ny plånbok</label>
              <input
                id="new-wallet-payer"
                value={newWalletPayerName}
                onChange={(event) => setNewWalletPayerName(event.target.value)}
              />
            </div>
          </div>
          <div className="form-actions form-actions--left">
            <button className="icon-button" type="button" onClick={handleCreateWallet}>
              <Plus aria-hidden="true" size={16} />
              Skapa plånbok
            </button>
            <button className="icon-button" type="button" onClick={handleDuplicateActiveWallet} disabled={!activeWallet}>
              <Copy aria-hidden="true" size={16} />
              Duplicera aktiv plånbok
            </button>
          </div>
          <div className="field">
            <label htmlFor="delete-wallet-confirmation">Skriv plånbokens namn för att radera den</label>
            <input
              id="delete-wallet-confirmation"
              value={deleteWalletConfirmation}
              onChange={(event) => setDeleteWalletConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-actions form-actions--left">
            <button className="icon-button icon-button--danger" type="button" onClick={handleDeleteActiveWallet} disabled={!activeWallet}>
              <Trash2 aria-hidden="true" size={16} />
              Radera aktiv plånbok
            </button>
          </div>
        </article>

        <article className="data-card data-card--wide register-card" data-trace="DS-STARTER-REGISTER-001 / DS-REGISTER-001..03 / DS-BUDGET-001 / DS-VENDOR-CANCEL-001">
          <h3>Register</h3>
          <p>Skapa och byt namn på lokala betalare, kategorier och leverantörer i den aktiva plånboken.</p>
          <div className="register-sections">
            <section aria-label="Betalare">
              <div className="register-section__title">
                <Users aria-hidden="true" size={17} />
                <strong>Betalare</strong>
              </div>
              <div className="inline-create">
                <div className="field">
                  <label htmlFor="new-person-name">Ny betalare</label>
                  <input id="new-person-name" value={newPersonName} onChange={(event) => setNewPersonName(event.target.value)} />
                </div>
                <button className="icon-button" type="button" onClick={() => handleCreateRegisterItem('person')}>
                  <Plus aria-hidden="true" size={16} />
                  Lägg till betalare
                </button>
              </div>
              <ul className="register-list">
                {activePeople.map((person) => (
                  <li key={person.id} className="register-row">
                    <input
                      aria-label={`Redigera betalare ${person.name}`}
                      value={person.name}
                      onChange={(event) => handleRenameRegisterItem('person', person.id, event.target.value)}
                    />
                    <input
                      aria-label={`Månadsbudget för ${person.name}`}
                      inputMode="decimal"
                      defaultValue={formatBudgetInput(person.monthlyBudgetMinor)}
                      onBlur={(event) => handleUpdatePersonBudget(person.id, event.target.value)}
                      placeholder="Budget/mån"
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Kategorier">
              <div className="register-section__title">
                <Tag aria-hidden="true" size={17} />
                <strong>Kategorier</strong>
              </div>
              <div className="inline-create">
                <div className="field">
                  <label htmlFor="new-category-name">Ny kategori</label>
                  <input
                    id="new-category-name"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />
                </div>
                <button className="icon-button" type="button" onClick={() => handleCreateRegisterItem('category')}>
                  <Plus aria-hidden="true" size={16} />
                  Lägg till kategori
                </button>
              </div>
              <ul className="register-list">
                {activeCategories.map((category) => (
                  <li key={category.id} className="register-row">
                    <input
                      aria-label={`Redigera kategori ${category.name}`}
                      value={category.name}
                      onChange={(event) => handleRenameRegisterItem('category', category.id, event.target.value)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Leverantörer">
              <div className="register-section__title">
                <Store aria-hidden="true" size={17} />
                <strong>Leverantörer</strong>
              </div>
              <div className="inline-create">
                <div className="field">
                  <label htmlFor="new-vendor-name">Ny leverantör</label>
                  <input id="new-vendor-name" value={newVendorName} onChange={(event) => setNewVendorName(event.target.value)} />
                </div>
                <button className="icon-button" type="button" onClick={() => handleCreateRegisterItem('vendor')}>
                  <Plus aria-hidden="true" size={16} />
                  Lägg till leverantör
                </button>
              </div>
              <ul className="register-list">
                {activeVendors.map((vendor) => (
                  <li key={vendor.id} className="register-row register-row--vendor">
                    <input
                      aria-label={`Redigera leverantör ${vendor.name}`}
                      value={vendor.name}
                      onChange={(event) => handleRenameRegisterItem('vendor', vendor.id, event.target.value)}
                    />
                    <textarea
                      aria-label={`Uppsägningsinstruktion för ${vendor.name}`}
                      defaultValue={vendor.cancellationInstructions ?? ''}
                      rows={3}
                      placeholder="T.ex. länk, telefon eller steg för uppsägning"
                      onBlur={(event) => handleUpdateVendorInstructions(vendor.id, event.target.value)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <article className="data-card">
          <h3>Vad lokal lagring betyder</h3>
          <p>
            Appen använder browserns lokala lagring. Det ger kontroll utan konto, men datan kan försvinna om
            browserdata rensas, profilen byts eller enheten går sönder.
          </p>
        </article>

        <article className="data-card" data-trace="DS-TIMELINE-WINDOW-001 / DS-TIME-WINDOW-CONFIG-001">
          <h3>Tidslinjefönster</h3>
          <p>Styr hur många månader bakåt och framåt översikten visar för den aktiva plånboken.</p>
          <div className="register-section__title">
            <CalendarDays aria-hidden="true" size={17} />
            <strong>Visade månader</strong>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="timeline-months-back">Historiska månader</label>
              <input
                id="timeline-months-back"
                type="number"
                min={0}
                max={24}
                defaultValue={activeWallet?.monthsBack ?? 0}
                onBlur={(event) => handleUpdateTimelineWindow('monthsBack', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="timeline-months-forward">Kommande månader</label>
              <input
                id="timeline-months-forward"
                type="number"
                min={0}
                max={36}
                defaultValue={activeWallet?.monthsForward ?? 5}
                onBlur={(event) => handleUpdateTimelineWindow('monthsForward', event.target.value)}
              />
            </div>
          </div>
        </article>

        <article className="data-card">
          <h3>JSON-backup</h3>
          <p>Exportera en fil när du vill flytta eller säkra din nuvarande plånbok lokalt.</p>
          <div className="form-actions form-actions--left">
            <button className="icon-button icon-button--primary" type="button" onClick={handleExport}>
              <Download aria-hidden="true" size={17} />
              Exportera JSON
            </button>
            <button className="icon-button" type="button" onClick={() => fileInputRef.current?.click()}>
              <FileUp aria-hidden="true" size={17} />
              Importera JSON
            </button>
          </div>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            aria-label="Välj JSON-backup"
          />

          {pendingImport ? (
            <div className="backup-preview" role="group" aria-label="Importförhandsgranskning">
              <div className="backup-preview__header">
                <FileCheck2 aria-hidden="true" size={18} />
                <div>
                  <strong>Backup redo att importeras</strong>
                  <span>{pendingImport.fileName}</span>
                </div>
              </div>
              <dl className="detail-list detail-list--compact">
                <div>
                  <dt>Exporterad</dt>
                  <dd>{formatExportedAt(pendingImport.exportedAt)}</dd>
                </div>
                <div>
                  <dt>Plånböcker</dt>
                  <dd>{pendingImport.state.wallets.length}</dd>
                </div>
                <div>
                  <dt>Betalare</dt>
                  <dd>{pendingImport.state.people.length}</dd>
                </div>
                <div>
                  <dt>Återkommande utgifter</dt>
                  <dd>{pendingImport.state.recurringExpenses.length}</dd>
                </div>
              </dl>
              <p>Import ersätter allt som finns lokalt i den här browsern.</p>
              <div className="field">
                <label htmlFor="import-confirmation">Skriv IMPORTERA för att ersätta lokal data</label>
                <input
                  id="import-confirmation"
                  value={importConfirmation}
                  onChange={(event) => setImportConfirmation(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="form-actions form-actions--left">
                <button className="icon-button icon-button--primary" type="button" onClick={handleConfirmImport}>
                  <FileCheck2 aria-hidden="true" size={17} />
                  Ersätt lokal data
                </button>
                <button className="icon-button icon-button--ghost" type="button" onClick={handleCancelImport}>
                  <X aria-hidden="true" size={17} />
                  Avbryt import
                </button>
              </div>
            </div>
          ) : null}
        </article>

        <article className="data-card" data-trace="DS-PORTABLE-EXPORT-001 / DS-HANDOFF-001">
          <h3>Portabel export</h3>
          <p>Skapa lokala paket fÃ¶r backup, lÃ¤sbar rapport eller handoff till en annan miljÃ¶.</p>
          <div className="form-actions form-actions--left">
            <button className="icon-button" type="button" onClick={() => handlePortableExport('zip')}>
              <FileArchive aria-hidden="true" size={17} />
              Exportera ZIP
            </button>
            <button className="icon-button" type="button" onClick={() => handlePortableExport('pdf')}>
              <FileText aria-hidden="true" size={17} />
              Exportera PDF
            </button>
            <button className="icon-button" type="button" onClick={() => handlePortableExport('handoff')}>
              <Link2 aria-hidden="true" size={17} />
              Skapa handoff
            </button>
          </div>
        </article>

        <article className="data-card" data-trace="DS-DATAFILE-001">
          <h3>FristÃ¥ende datafil</h3>
          <p>Skapa eller Ã¥teranslut en JSON-datafil i browserar som stÃ¶djer File System Access API.</p>
          <div className="form-actions form-actions--left">
            <button className="icon-button" type="button" onClick={handleCreateDataFile} disabled={!fileSystemAccessSupported}>
              <Save aria-hidden="true" size={17} />
              Skapa datafil
            </button>
            <button className="icon-button" type="button" onClick={handleReconnectDataFile} disabled={!fileSystemAccessSupported}>
              <FileUp aria-hidden="true" size={17} />
              Ã…teranslut datafil
            </button>
            <button className="icon-button" type="button" onClick={handleSaveConnectedDataFile} disabled={!connectedDataFile}>
              <FileCheck2 aria-hidden="true" size={17} />
              Spara ansluten fil
            </button>
          </div>
          <p>
            {connectedDataFile
              ? `Ansluten i denna session: ${connectedDataFile.name}`
              : fileSystemAccessSupported
                ? 'Ingen datafil Ã¤r ansluten i denna session.'
                : 'Browsern saknar stÃ¶d fÃ¶r File System Access API.'}
          </p>
        </article>

        <article className="data-card data-card--wide" data-trace="DS-EXPERIMENTAL-SYNC-001 / DS-SYNC-CONFLICT-001">
          <h3>Experimentell sync</h3>
          <p>Egen endpoint kan testas manuellt. Konflikt stoppar automatisk skrivning om revisionen inte matchar.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sync-endpoint">Endpoint</label>
              <input
                id="sync-endpoint"
                value={syncEndpoint}
                onChange={(event) => setSyncEndpoint(event.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="field">
              <label htmlFor="sync-token">Token</label>
              <input
                id="sync-token"
                value={syncToken}
                onChange={(event) => setSyncToken(event.target.value)}
                type="password"
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="sync-revision">Revision</label>
              <input id="sync-revision" value={syncRevision} onChange={(event) => setSyncRevision(event.target.value)} />
            </div>
          </div>
          <div className="form-actions form-actions--left">
            <button className="icon-button" type="button" onClick={handleSaveSyncConfig}>
              <Cloud aria-hidden="true" size={17} />
              Spara sync
            </button>
            <button className="icon-button" type="button" onClick={handlePullSync} disabled={!appState.cloudSync}>
              <Download aria-hidden="true" size={17} />
              Pull
            </button>
            <button className="icon-button" type="button" onClick={handlePushSync} disabled={!appState.cloudSync}>
              <UploadCloud aria-hidden="true" size={17} />
              Push
            </button>
            <button className="icon-button icon-button--ghost" type="button" onClick={handleDisconnectSync} disabled={!appState.cloudSync}>
              <X aria-hidden="true" size={17} />
              Koppla frÃ¥n
            </button>
          </div>
          <dl className="detail-list detail-list--compact">
            <div>
              <dt>Status</dt>
              <dd>{appState.cloudSync?.status ?? 'Ej konfigurerad'}</dd>
            </div>
            <div>
              <dt>Senast synkad</dt>
              <dd>{formatExportedAt(appState.cloudSync?.lastSyncedAt)}</dd>
            </div>
            <div>
              <dt>Fel/konflikt</dt>
              <dd>{appState.cloudSync?.lastError ?? '-'}</dd>
            </div>
          </dl>
        </article>

        <article className="data-card" data-trace="DS-CSV-001">
          <h3>CSV-export</h3>
          <p>Skapa enkla lokala CSV-filer för egna kalkylblad. Exporten är inte en bokföringsrapport.</p>
          <div className="form-actions form-actions--left">
            <button className="icon-button" type="button" onClick={() => handleCsvExport('expenses')}>
              <Download aria-hidden="true" size={17} />
              Exportera utgifter CSV
            </button>
            <button className="icon-button" type="button" onClick={() => handleCsvExport('purchases')}>
              <Download aria-hidden="true" size={17} />
              Exportera köp CSV
            </button>
          </div>
        </article>

        {onImportPurchases ? (
          <PurchaseImportPanel
            onImportPurchases={onImportPurchases}
            quickActionRequest={purchaseImportQuickAction}
            statusRole={false}
          />
        ) : null}

        <article className="data-card data-card--danger">
          <h3>Rensa lokal data</h3>
          <p>Rensning tar bort plånböcker och utgifter från den här browsern. Exportera först om du vill spara.</p>
          <div className="field">
            <label htmlFor="clear-confirmation">Skriv RENSA för att bekräfta</label>
            <input
              id="clear-confirmation"
              value={clearConfirmation}
              onChange={(event) => setClearConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-actions form-actions--left">
            <button className="icon-button icon-button--danger" type="button" onClick={handleClear}>
              <Trash2 aria-hidden="true" size={17} />
              Rensa lokal data
            </button>
          </div>
        </article>

        <article className="data-card">
          <h3>Aktuell status</h3>
          <dl className="detail-list detail-list--compact">
            <div>
              <dt>Plånböcker</dt>
              <dd>{appState.wallets.length}</dd>
            </div>
            <div>
              <dt>Betalare</dt>
              <dd>{appState.people.length}</dd>
            </div>
            <div>
              <dt>Återkommande utgifter</dt>
              <dd>{appState.recurringExpenses.length}</dd>
            </div>
          </dl>
          <p role="status">{message}</p>
        </article>

        <article className="data-card">
          <h3>Produktinställningar</h3>
          <p>Lokala flaggor styr språk och moduler utan konto, betalvägg eller extern tjänst.</p>
          <div className="field">
            <label htmlFor="business-signal-label">Namn på Business-signal</label>
            <input
              id="business-signal-label"
              value={draftSettings.businessSignalLabel}
              maxLength={24}
              onChange={(event) => updateSettings({ businessSignalLabel: event.target.value })}
            />
          </div>
          <label className="toggle-row" htmlFor="purchases-enabled">
            <input
              id="purchases-enabled"
              type="checkbox"
              checked={draftSettings.purchasesEnabled}
              onChange={(event) => updateSettings({ purchasesEnabled: event.target.checked })}
            />
            <span>Inköpsmodul på</span>
          </label>
          <div className="field">
            <label htmlFor="plan-flag">Planflagga</label>
            <select
              id="plan-flag"
              value={draftSettings.planFlag}
              onChange={(event) => updateSettings({ planFlag: event.target.value as AppSettings['planFlag'] })}
            >
              <option value="free">Free</option>
              <option value="premium_preview">Premium preview</option>
            </select>
          </div>
        </article>
      </div>

      <div className="panel__footer">
        <RotateCcw aria-hidden="true" size={16} />
        Import och sync ersätter lokal data först efter användarstyrd handling. Experimentell sync är avstängd tills endpoint sparas.
      </div>
    </section>
  );
}

function formatExportedAt(value?: string): string {
  if (!value) {
    return 'Okänt';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function createLocalId(prefix: string): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${randomId}`;
}

function createCsvFileName(kind: 'expenses' | 'purchases'): string {
  const date = new Date().toISOString().slice(0, 10);
  return kind === 'expenses' ? `mina-utgifter-utgifter-${date}.csv` : `mina-utgifter-kop-${date}.csv`;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function writeStateToDataFile(handle: FileSystemFileHandleLike, state: AppState): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(new Blob([serializeAppStateExport(state)], { type: 'application/json' }));
  await writable.close();
}

function getFileSystemWindow(): FileSystemWindow {
  return window as FileSystemWindow;
}

function createSyncHeaders(token?: string, revision?: string): HeadersInit {
  const headers: Record<string, string> = {
    'content-type': 'application/json'
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  if (revision) {
    headers['if-match'] = revision;
  }
  return headers;
}

async function readRevisionFromResponse(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.clone().json()) as { revision?: unknown };
    return typeof body.revision === 'string' ? body.revision : undefined;
  } catch {
    return undefined;
  }
}

function parseBudgetInput(value: string): number | undefined {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) {
    return undefined;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return undefined;
  }

  return Math.round(Number(normalized) * 100);
}

function formatBudgetInput(value?: number): string {
  if (!value) {
    return '';
  }

  return String(value / 100).replace('.', ',');
}
