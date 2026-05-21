import { APP_SCHEMA_VERSION, type AppState } from '../domain/types';
import { DEFAULT_APP_SETTINGS } from '../domain/defaults';
import { validateAppState } from '../domain/validation';

export const LOCAL_STORE_KEY = 'costtracker3.appState.v1';
export const EXPORT_FORMAT = 'costtracker3.appState.export';
export const EXPORT_VERSION = 1;

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AppStateExport {
  format: typeof EXPORT_FORMAT;
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  appState: AppState;
}

export interface ImportResult {
  ok: boolean;
  state?: AppState;
  exportedAt?: string;
  wrappedExport?: boolean;
  error?: string;
}

export function loadAppState(storage = getBrowserStorage()): AppState | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(LOCAL_STORE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return validateAppState(parsed) && parsed.schemaVersion === APP_SCHEMA_VERSION ? normalizeAppState(parsed) : null;
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState, storage = getBrowserStorage()): void {
  if (!storage) {
    return;
  }

  storage.setItem(LOCAL_STORE_KEY, JSON.stringify(state));
}

export function clearAppState(storage = getBrowserStorage()): void {
  storage?.removeItem(LOCAL_STORE_KEY);
}

export function createExportPayload(state: AppState, now = new Date()): AppStateExport {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    appState: state
  };
}

export function serializeAppStateExport(state: AppState, now = new Date()): string {
  return `${JSON.stringify(createExportPayload(state, now), null, 2)}\n`;
}

export function parseAppStateExport(raw: string): ImportResult {
  try {
    const parsed: unknown = JSON.parse(extractEmbeddedExport(raw));
    if (!isRecord(parsed)) {
      return { ok: false, error: 'Filen är inte en giltig JSON-backup.' };
    }

    const isWrappedExport = parsed.format === EXPORT_FORMAT && parsed.version === EXPORT_VERSION;
    const candidateState = isWrappedExport ? parsed.appState : parsed;

    if (!validateAppState(candidateState)) {
      return { ok: false, error: 'Filen matchar inte appens dataformat.' };
    }

    if (candidateState.schemaVersion !== APP_SCHEMA_VERSION) {
      return { ok: false, error: 'Backupen har en schemaversion som inte stöds.' };
    }

    const state = normalizeAppState(candidateState);
    return {
      ok: true,
      state,
      exportedAt: isWrappedExport && typeof parsed.exportedAt === 'string' ? parsed.exportedAt : undefined,
      wrappedExport: isWrappedExport
    };
  } catch {
    return { ok: false, error: 'Filen kunde inte läsas som JSON.' };
  }
}

export function createExportFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `mina-utgifter-backup-${stamp}.json`;
}

function getBrowserStorage(): KeyValueStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeAppState(state: AppState): AppState {
  return {
    ...state,
    settings: {
      ...DEFAULT_APP_SETTINGS,
      ...(state.settings ?? {}),
      businessSignalLabel: normalizeBusinessSignalLabel(state.settings?.businessSignalLabel)
    },
    merchantCategoryRules: Array.isArray(state.merchantCategoryRules) ? state.merchantCategoryRules : [],
    simulation: normalizeSimulationState(state.simulation),
    cloudSync: normalizeCloudSyncState(state.cloudSync),
    purchases: Array.isArray(state.purchases) ? state.purchases : []
  };
}

function extractEmbeddedExport(raw: string): string {
  const match = raw.match(
    /<script[^>]+id=["']costtracker3-app-state-export["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) {
    return raw;
  }

  return match[1].replace(/\\u003c/g, '<').trim();
}

function normalizeBusinessSignalLabel(value?: string): string {
  const label = value?.trim();
  return label ? label.slice(0, 24) : DEFAULT_APP_SETTINGS.businessSignalLabel;
}

function normalizeSimulationState(state: AppState['simulation']): AppState['simulation'] {
  if (!state || !Array.isArray(state.removedRecurringExpenseIds)) {
    return undefined;
  }

  return {
    removedRecurringExpenseIds: state.removedRecurringExpenseIds.filter((id): id is string => typeof id === 'string'),
    createdAt: typeof state.createdAt === 'string' ? state.createdAt : new Date().toISOString(),
    updatedAt: typeof state.updatedAt === 'string' ? state.updatedAt : new Date().toISOString()
  };
}

function normalizeCloudSyncState(state: AppState['cloudSync']): AppState['cloudSync'] {
  if (!state || typeof state.endpoint !== 'string') {
    return undefined;
  }

  const status = ['configured', 'synced', 'error', 'conflict'].includes(state.status) ? state.status : 'configured';
  return {
    endpoint: state.endpoint,
    token: typeof state.token === 'string' ? state.token : undefined,
    revision: typeof state.revision === 'string' ? state.revision : undefined,
    status,
    lastSyncedAt: typeof state.lastSyncedAt === 'string' ? state.lastSyncedAt : undefined,
    lastError: typeof state.lastError === 'string' ? state.lastError : undefined,
    updatedAt: typeof state.updatedAt === 'string' ? state.updatedAt : new Date().toISOString()
  };
}
