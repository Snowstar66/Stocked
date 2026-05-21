import { FormEvent, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import type {
  CategoryOption,
  ExpensePeriod,
  PersonOption,
  RecurringExpense,
  RecurringExpensePayload,
  VendorOption
} from './types';

interface RecurringExpenseFormProps {
  payers?: PersonOption[];
  people?: PersonOption[];
  categories: CategoryOption[];
  vendors?: VendorOption[];
  initialValue?: Partial<RecurringExpense>;
  defaultCurrency?: string;
  onSubmit?: (payload: RecurringExpensePayload) => void;
  onCreate?: (payload: {
    name: string;
    amount: string;
    period?: ExpensePeriod;
    startMonth?: string;
    chargeDay: number;
    payerPersonId: string;
    categoryId: string;
    vendorId?: string;
    vendorName?: string;
    cancellationNoticeMonths?: number;
    notes?: string;
  }) => void;
  onSaveDraft?: (payload: {
    name: string;
    amount?: string;
    period?: ExpensePeriod;
    startMonth?: string;
    chargeDay: number;
    payerPersonId: string;
    categoryId: string;
    vendorId?: string;
    vendorName?: string;
    cancellationNoticeMonths?: number;
    notes?: string;
  }) => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  amount?: string;
  payerPersonId?: string;
  categoryId?: string;
  startMonth?: string;
  chargeDay?: string;
  cancellationNoticeMonths?: string;
}

export function parseAmountToMinor(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function formatMinorForInput(amountMinor?: number): string {
  if (!amountMinor) {
    return '';
  }

  return (amountMinor / 100).toFixed(2);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function RecurringExpenseForm({
  payers,
  people,
  categories,
  vendors = [],
  initialValue,
  defaultCurrency = 'SEK',
  onSubmit,
  onCreate,
  onSaveDraft,
  onCancel
}: RecurringExpenseFormProps) {
  const payerOptions = payers ?? people ?? [];
  const firstPayerId = payerOptions[0]?.id ?? '';
  const firstCategoryId = categories[0]?.id ?? '';
  const [name, setName] = useState(initialValue?.name ?? '');
  const [amount, setAmount] = useState(formatMinorForInput(initialValue?.amountMinor));
  const [currency, setCurrency] = useState(initialValue?.currency ?? defaultCurrency);
  const [period, setPeriod] = useState<ExpensePeriod>(initialValue?.period ?? 'monthly');
  const [startMonth, setStartMonth] = useState(initialValue?.startMonth ?? currentMonth());
  const [chargeDay, setChargeDay] = useState(String(initialValue?.chargeDay ?? 1));
  const [payerPersonId, setPayerPersonId] = useState(initialValue?.payerPersonId ?? firstPayerId);
  const [categoryId, setCategoryId] = useState(initialValue?.categoryId ?? firstCategoryId);
  const [vendorId, setVendorId] = useState(initialValue?.vendorId ?? '');
  const [vendorName, setVendorName] = useState(initialValue?.vendorName ?? '');
  const [cancellationNoticeMonths, setCancellationNoticeMonths] = useState(
    String(initialValue?.cancellationNoticeMonths ?? 0)
  );
  const [notes, setNotes] = useState(initialValue?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  const vendorOptions = useMemo(() => vendors.filter((vendor) => vendor.name.trim()), [vendors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountMinor = parseAmountToMinor(amount);
    const parsedChargeDay = Number(chargeDay);
    const parsedCancellationNoticeMonths = Number(cancellationNoticeMonths);
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Namnge den återkommande utgiften.';
    }
    if (amountMinor === null) {
      nextErrors.amount = 'Ange ett belopp större än noll.';
    }
    if (!payerPersonId) {
      nextErrors.payerPersonId = 'Välj betalare.';
    }
    if (!categoryId) {
      nextErrors.categoryId = 'Välj kategori.';
    }
    if (!/^\d{4}-\d{2}$/.test(startMonth)) {
      nextErrors.startMonth = 'Ange en giltig startmånad.';
    }
    if (!Number.isInteger(parsedChargeDay) || parsedChargeDay < 1 || parsedChargeDay > 31) {
      nextErrors.chargeDay = 'Ange en dag mellan 1 och 31.';
    }
    if (
      !Number.isInteger(parsedCancellationNoticeMonths) ||
      parsedCancellationNoticeMonths < 0 ||
      parsedCancellationNoticeMonths > 36
    ) {
      nextErrors.cancellationNoticeMonths = 'Uppsägningstid ska vara 0 till 36 månader.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || amountMinor === null) {
      return;
    }

    const selectedVendor = vendorOptions.find((vendor) => vendor.id === vendorId);
    const resolvedVendorName = selectedVendor?.name ?? (vendorName.trim() || undefined);
    const payload = {
      name: name.trim(),
      amountMinor,
      currency: currency.trim() || defaultCurrency,
      period,
      startMonth,
      chargeDay: parsedChargeDay,
      payerPersonId,
      categoryId,
      vendorId: vendorId || undefined,
      vendorName: resolvedVendorName,
      cancellationNoticeMonths: parsedCancellationNoticeMonths,
      notes: notes.trim() || undefined,
      status: 'active'
    } satisfies RecurringExpensePayload;

    onSubmit?.(payload);
    onCreate?.({
      name: payload.name,
      amount: amount.trim(),
      period: payload.period,
      startMonth: payload.startMonth,
      chargeDay: payload.chargeDay,
      payerPersonId: payload.payerPersonId,
      categoryId: payload.categoryId,
      vendorId: payload.vendorId,
      vendorName: payload.vendorName,
      cancellationNoticeMonths: payload.cancellationNoticeMonths,
      notes: payload.notes
    });
  }

  function handleSaveDraft() {
    const selectedVendor = vendorOptions.find((vendor) => vendor.id === vendorId);
    const resolvedVendorName = selectedVendor?.name ?? (vendorName.trim() || undefined);
    const parsedChargeDay = Number(chargeDay);
    const parsedCancellationNoticeMonths = Number(cancellationNoticeMonths);
    const safeChargeDay = Number.isInteger(parsedChargeDay) && parsedChargeDay >= 1 && parsedChargeDay <= 31 ? parsedChargeDay : 1;
    const safeNoticeMonths =
      Number.isInteger(parsedCancellationNoticeMonths) && parsedCancellationNoticeMonths >= 0 && parsedCancellationNoticeMonths <= 36
        ? parsedCancellationNoticeMonths
        : 0;
    onSaveDraft?.({
      name: name.trim() || 'Nytt utkast',
      amount: amount.trim() || undefined,
      period,
      startMonth: /^\d{4}-\d{2}$/.test(startMonth) ? startMonth : currentMonth(),
      chargeDay: safeChargeDay,
      payerPersonId: payerPersonId || firstPayerId,
      categoryId: categoryId || firstCategoryId,
      vendorId: vendorId || undefined,
      vendorName: resolvedVendorName,
      cancellationNoticeMonths: safeNoticeMonths,
      notes: notes.trim() || undefined
    });
  }

  return (
    <form aria-label="Recurring expense form" data-trace="DS-JNY001-02 / DS-RECURRING-PERIOD-001 / DS-ONE-TIME-PERIOD-001 / DS-VENDOR-IN-FLOW-001 / DS-EXPENSE-NOTE-001" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
            <label htmlFor="expense-name">Utgiftsnamn</label>
          <input
            id="expense-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'expense-name-error' : undefined}
          />
          {errors.name ? <small id="expense-name-error">{errors.name}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-amount">Belopp</label>
          <input
            id="expense-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
          />
          {errors.amount ? <small id="expense-amount-error">{errors.amount}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-currency">Valuta</label>
          <input
            id="expense-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            maxLength={3}
          />
        </div>

        <div className="field">
          <label htmlFor="expense-period">Period</label>
          <select
            id="expense-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as ExpensePeriod)}
          >
            <option value="monthly">Månadsvis</option>
            <option value="quarterly">Kvartalsvis</option>
            <option value="yearly">Årsvis</option>
            <option value="one_time">Engång</option>
          </select>
        </div>

        <div className="field">
            <label htmlFor="expense-start-month">Startmånad</label>
          <input
            id="expense-start-month"
            type="month"
            value={startMonth}
            onChange={(event) => setStartMonth(event.target.value)}
            aria-invalid={Boolean(errors.startMonth)}
            aria-describedby={errors.startMonth ? 'expense-start-month-error' : undefined}
          />
          {errors.startMonth ? <small id="expense-start-month-error">{errors.startMonth}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-charge-day">Dragningsdag</label>
          <input
            id="expense-charge-day"
            inputMode="numeric"
            value={chargeDay}
            onChange={(event) => setChargeDay(event.target.value)}
            aria-invalid={Boolean(errors.chargeDay)}
            aria-describedby={errors.chargeDay ? 'expense-charge-day-error' : undefined}
          />
          {errors.chargeDay ? <small id="expense-charge-day-error">{errors.chargeDay}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-payer">Betalare</label>
          <select
            id="expense-payer"
            value={payerPersonId}
            onChange={(event) => setPayerPersonId(event.target.value)}
            aria-invalid={Boolean(errors.payerPersonId)}
            aria-describedby={errors.payerPersonId ? 'expense-payer-error' : undefined}
          >
            {payerOptions.length === 0 ? <option value="">Ingen betalare finns</option> : null}
            {payerOptions.map((payer) => (
              <option key={payer.id} value={payer.id}>
                {payer.name}
              </option>
            ))}
          </select>
          {errors.payerPersonId ? <small id="expense-payer-error">{errors.payerPersonId}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-category">Kategori</label>
          <select
            id="expense-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? 'expense-category-error' : undefined}
          >
            {categories.length === 0 ? <option value="">Ingen kategori finns</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <small id="expense-category-error">{errors.categoryId}</small> : null}
        </div>

        <div className="field">
            <label htmlFor="expense-vendor">Leverantör</label>
          <select
            id="expense-vendor"
            value={vendorId}
            onChange={(event) => {
              setVendorId(event.target.value);
              if (event.target.value) {
                setVendorName('');
              }
            }}
          >
            <option value="">Ingen leverantör</option>
            {vendorOptions.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="expense-vendor-name">Ny leverantör</label>
          <input
            id="expense-vendor-name"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
            disabled={Boolean(vendorId)}
            placeholder="Skapa från formuläret"
          />
        </div>

        <div className="field">
          <label htmlFor="expense-cancellation-notice">Uppsägningstid, månader</label>
          <input
            id="expense-cancellation-notice"
            inputMode="numeric"
            value={cancellationNoticeMonths}
            onChange={(event) => setCancellationNoticeMonths(event.target.value)}
            aria-invalid={Boolean(errors.cancellationNoticeMonths)}
            aria-describedby={errors.cancellationNoticeMonths ? 'expense-cancellation-notice-error' : undefined}
          />
          {errors.cancellationNoticeMonths ? (
            <small id="expense-cancellation-notice-error">{errors.cancellationNoticeMonths}</small>
          ) : null}
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="expense-notes">Anteckningar</label>
        <textarea
          id="expense-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
        />
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button className="icon-button icon-button--ghost" type="button" onClick={onCancel}>
            <X aria-hidden="true" size={17} />
            Avbryt
          </button>
        ) : null}
        <button className="icon-button icon-button--primary" type="submit">
          <Save aria-hidden="true" size={17} />
          Spara utgift
        </button>
        {onSaveDraft ? (
          <button className="icon-button" type="button" onClick={handleSaveDraft}>
            <Save aria-hidden="true" size={17} />
            Spara utkast
          </button>
        ) : null}
      </div>
    </form>
  );
}
