import { ChangeEvent, useRef, useState } from 'react';
import { Bell, CheckCircle2, FileText, Paperclip, Pencil, Repeat2, Trash2, X } from 'lucide-react';
import { calculateCancellationOpportunity, planCancellationReminder } from '../domain/cancellation';
import { toYearMonth } from '../domain/defaults';
import type { CategoryOption, PersonOption, RecurringExpense, VendorOption } from './types';
import { formatMoney } from './TimelineView';

const MAX_ATTACHMENT_BYTES = 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain']);

interface ExpenseDetailDrawerProps {
  expense: RecurringExpense | null;
  payers?: PersonOption[];
  people?: PersonOption[];
  categories: CategoryOption[];
  vendors?: VendorOption[];
  onClose: () => void;
  onEdit?: (expense: any) => void;
  onComplete?: (expense: any) => void;
  onConvertToPurchase?: (expense: any) => void;
  onSimulateRemove?: (expense: any) => void;
  isSimulatedRemoved?: boolean;
  onDelete?: (expense: any) => void;
  onUpdate?: (expense: any) => void;
}

function findName(items: Array<{ id: string; name: string }>, id?: string) {
  if (!id) {
    return 'Ej angivet';
  }

  return items.find((item) => item.id === id)?.name ?? 'Okänd';
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthNumber - 1, 1)
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function createAttachmentId(): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `attachment_${randomId}`;
}

function formatAttachmentSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${Math.round(size / 1024)} KB`;
}

export function ExpenseDetailDrawer({
  expense,
  payers,
  people,
  categories,
  vendors = [],
  onClose,
  onEdit,
  onComplete,
  onConvertToPurchase,
  onSimulateRemove,
  isSimulatedRemoved = false,
  onDelete,
  onUpdate
}: ExpenseDetailDrawerProps) {
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [attachmentMessage, setAttachmentMessage] = useState('');

  if (!expense) {
    return null;
  }

  const vendorName = expense.vendorName ?? findName(vendors, expense.vendorId);
  const vendor = vendors.find((item) => item.id === expense.vendorId);
  const cancellationInstructions = vendor?.cancellationInstructions?.trim();
  const payerOptions = payers ?? people ?? [];
  const amountMinor = expense.amountMinor ?? expense.amountMinorUnits ?? 0;
  const canComplete = Boolean(onComplete || onUpdate);
  const cancellation = calculateCancellationOpportunity(expense, toYearMonth(new Date()));
  const reminderPlan = planCancellationReminder(cancellation);
  const reminderStatus = expense.cancellationReminderStatus ?? (expense.cancellationReminderMonth ? 'active' : undefined);
  const reminderMonth = expense.cancellationReminderMonth;
  const attachments = expense.attachments ?? [];

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUpdate) {
      return;
    }

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      setAttachmentMessage('Filtypen stöds inte. Välj PDF, PNG, JPG eller TXT.');
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentMessage('Filen är för stor. Max 1 MB i Attachment Light.');
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const timestamp = new Date().toISOString();
    onUpdate({
      ...expense,
      attachments: [
        ...attachments,
        {
          id: createAttachmentId(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          createdAt: timestamp
        }
      ],
      updatedAt: timestamp
    });
    setAttachmentMessage('Underlag bifogades lokalt.');
  }

  return (
    <div className="drawer-shell" role="presentation">
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-detail-title"
        aria-describedby="expense-detail-summary"
        data-trace="DS-JNY002-01..05 / DS-DETAIL-DRAWER-001 / DS-MOBILE-NO-OVERLAP-001 / DS-VENDOR-CANCEL-001 / DS-ATTACHMENT-001 / DS-SIMULATION-001"
      >
        <div className="panel__header">
          <div>
            <span className="eyebrow">Utgiftsdetalj</span>
            <h2 id="expense-detail-title">{expense.name}</h2>
            <p id="expense-detail-summary">
              {formatMoney(amountMinor, expense.currency)} {expense.period}
            </p>
          </div>
          <button className="icon-button icon-button--ghost" type="button" onClick={onClose} aria-label="Stäng detalj">
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Status</dt>
            <dd>{expense.status}</dd>
          </div>
          <div>
            <dt>Betalare</dt>
            <dd>{findName(payerOptions, expense.payerPersonId)}</dd>
          </div>
          <div>
            <dt>Kategori</dt>
            <dd>{findName(categories, expense.categoryId)}</dd>
          </div>
          <div>
            <dt>Leverantör</dt>
            <dd>{vendorName}</dd>
          </div>
          <div>
            <dt>Uppsägningsinstruktion</dt>
            <dd>{cancellationInstructions || 'Ingen instruktion sparad för leverantören'}</dd>
          </div>
          <div>
            <dt>Startar</dt>
            <dd>{expense.startMonth}</dd>
          </div>
          <div>
            <dt>Dragningsdag</dt>
            <dd>{expense.chargeDay}</dd>
          </div>
          <div>
            <dt>Uppsägningstid</dt>
            <dd>{cancellation.noticeMonths} mån</dd>
          </div>
          <div>
            <dt>Låst period</dt>
            <dd>
              {cancellation.lockedMonths.length} mån, till och med{' '}
              {formatMonthLabel(cancellation.lockedMonths[cancellation.lockedMonths.length - 1])}
            </dd>
          </div>
          <div>
            <dt>Tidigaste fria månad</dt>
            <dd>{formatMonthLabel(cancellation.earliestFreeMonth)}</dd>
          </div>
          <div>
            <dt>Besparingssignal</dt>
            <dd>{formatMoney(cancellation.monthlySavingsMinor, expense.currency)} per månad från fri månad</dd>
          </div>
          <div>
            <dt>Påminnelse</dt>
            <dd>
              {reminderMonth
                ? `${reminderStatus === 'done' ? 'Påminnelse klar' : 'Påminnelse aktiv'}: ${formatMonthLabel(reminderMonth)}`
                : `Ingen påminnelse än. Rekommenderad månad: ${formatMonthLabel(reminderPlan.reminderMonth)}`}
            </dd>
          </div>
          <div>
            <dt>Anteckningar</dt>
            <dd>{expense.notes || 'Inga anteckningar ännu'}</dd>
          </div>
          <div>
            <dt>Underlag</dt>
            <dd>
              {attachments.length > 0 ? (
                <ul className="attachment-list" aria-label="Bifogade underlag">
                  {attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <FileText aria-hidden="true" size={16} />
                      <a href={attachment.dataUrl} download={attachment.name}>
                        {attachment.name}
                      </a>
                      <span>{formatAttachmentSize(attachment.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                'Inga underlag bifogade'
              )}
            </dd>
          </div>
        </dl>
        <input
          ref={attachmentInputRef}
          className="visually-hidden"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain"
          aria-label="Välj underlag"
          onChange={handleAttachmentChange}
        />
        {attachmentMessage ? (
          <p className="form-hint" role="status">
            {attachmentMessage}
          </p>
        ) : null}

        <div className="form-actions">
          {onUpdate ? (
            <button className="icon-button" type="button" onClick={() => attachmentInputRef.current?.click()}>
              <Paperclip aria-hidden="true" size={17} />
              Bifoga underlag
            </button>
          ) : null}
          {onEdit ? (
            <button className="icon-button" type="button" onClick={() => onEdit(expense)}>
              <Pencil aria-hidden="true" size={17} />
              Redigera
            </button>
          ) : null}
          {onUpdate && !reminderMonth ? (
            <button
              className="icon-button"
              type="button"
              onClick={() =>
                onUpdate({
                  ...expense,
                  cancellationReminderMonth: reminderPlan.reminderMonth,
                  cancellationReminderStatus: reminderPlan.status,
                  cancellationReminderCompletedAt: undefined,
                  updatedAt: new Date().toISOString()
                })
              }
            >
              <Bell aria-hidden="true" size={17} />
              Skapa påminnelse
            </button>
          ) : null}
          {onUpdate && reminderMonth && reminderStatus !== 'done' ? (
            <button
              className="icon-button"
              type="button"
              onClick={() =>
                onUpdate({
                  ...expense,
                  cancellationReminderStatus: 'done',
                  cancellationReminderCompletedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                })
              }
            >
              <CheckCircle2 aria-hidden="true" size={17} />
              Markera påminnelse klar
            </button>
          ) : null}
          {onConvertToPurchase ? (
            <button
              className="icon-button"
              type="button"
              onClick={() => onConvertToPurchase(expense)}
              disabled={expense.status === 'completed' || expense.status === 'archived'}
            >
              <Repeat2 aria-hidden="true" size={17} />
              GÃ¶r till kÃ¶p
            </button>
          ) : null}
          {onSimulateRemove ? (
            <button
              className="icon-button"
              type="button"
              onClick={() => onSimulateRemove(expense)}
              disabled={isSimulatedRemoved || expense.status !== 'active'}
            >
              <Repeat2 aria-hidden="true" size={17} />
              Simulera bort
            </button>
          ) : null}
          {canComplete ? (
            <button
              className="icon-button icon-button--primary"
              type="button"
              onClick={() => {
                onComplete?.(expense);
                onUpdate?.({ ...expense, status: 'completed' });
              }}
              disabled={expense.status === 'completed' || expense.status === 'archived'}
            >
              <CheckCircle2 aria-hidden="true" size={17} />
              Markera klar
            </button>
          ) : null}
          {onDelete ? (
            <button
              className="icon-button icon-button--danger"
              type="button"
              onClick={() => onDelete(expense)}
            >
              <Trash2 aria-hidden="true" size={17} />
              Ta bort
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
