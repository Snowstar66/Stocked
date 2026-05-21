import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Flag,
  Pencil,
  Plus,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
  X
} from 'lucide-react';
import type { PurchaseInput } from '../domain/types';
import type { CategoryOption, PersonOption, Purchase, PurchaseSignal, VendorOption } from './types';
import { formatMoney } from './TimelineView';

interface PurchasesViewProps {
  purchases: Purchase[];
  people: PersonOption[];
  categories: CategoryOption[];
  vendors?: VendorOption[];
  onCreatePurchase?: (input: PurchaseInput) => void;
  onUpdatePurchase?: (purchase: Purchase, input: PurchaseInput) => void;
  onToggleSignal: (purchase: Purchase, signal: PurchaseSignal) => void;
  onCreateRecurringFromPurchase?: (purchase: Purchase) => void;
  businessSignalLabel?: string;
  quickActionRequest?: { id: number } | null;
}

type PurchaseEditorState = { mode: 'create'; purchase?: undefined } | { mode: 'edit'; purchase: Purchase };

const signalLabels: Record<PurchaseSignal, string> = {
  review: 'Granska',
  unnecessary: 'Onödigt',
  worth_it: 'Värt det',
  business: 'Business',
  recurring: 'Återkommande'
};

export function PurchasesView({
  purchases,
  people,
  categories,
  vendors = [],
  onCreatePurchase,
  onUpdatePurchase,
  onToggleSignal,
  onCreateRecurringFromPurchase,
  businessSignalLabel = 'Business',
  quickActionRequest
}: PurchasesViewProps) {
  const handledQuickActionId = useRef<number | null>(null);
  const [editor, setEditor] = useState<PurchaseEditorState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [payerFilter, setPayerFilter] = useState('');
  const [signalFilter, setSignalFilter] = useState<PurchaseSignal | ''>('');
  const visiblePurchases = useMemo(() => {
    const needle = normalizeText(searchQuery);
    return purchases.filter((purchase) => {
      const matchesSearch = needle.length === 0 || normalizeText(`${purchase.merchant} ${purchase.date}`).includes(needle);
      const matchesCategory = categoryFilter.length === 0 || purchase.categoryId === categoryFilter;
      const matchesPayer = payerFilter.length === 0 || purchase.payerPersonId === payerFilter;
      const matchesSignal = signalFilter === '' || purchase.signals.includes(signalFilter);

      return matchesSearch && matchesCategory && matchesPayer && matchesSignal;
    });
  }, [categoryFilter, payerFilter, purchases, searchQuery, signalFilter]);
  const totalMinor = visiblePurchases.reduce((sum, purchase) => sum + purchase.amountMinor, 0);

  useEffect(() => {
    if (!quickActionRequest) {
      return;
    }
    if (handledQuickActionId.current === quickActionRequest.id) {
      return;
    }

    handledQuickActionId.current = quickActionRequest.id;

    if (onCreatePurchase) {
      setEditor({ mode: 'create' });
    }
  }, [onCreatePurchase, quickActionRequest]);

  return (
    <section
      className="panel purchases-view"
      aria-labelledby="purchases-title"
      data-trace="DS-JNY003-01..04 / DS-JNY004-01..04 / DS-JNY005-01..04 / DS-CLEAR-EMPTY-STATES-001 / DS-CREATION-MODAL-001 / DS-MOBILE-NO-OVERLAP-001 / DS-PURCHASE-SIGNAL-SET-001 / DS-SIGNAL-DESIGN-001 / DS-MERCHANT-CATEGORY-RULE-001 / DS-FILTER-002 / DS-DEDUPE-001 / DS-SIGNAL-TOGGLE-001 / DS-PURCHASE-MOBILE-AMOUNT-001 / DS-PURCHASE-PAYER-001 / DS-PURCHASE-VENDOR-001"
    >
      <div className="panel__header">
        <div>
          <span className="eyebrow">Inköp</span>
          <h2 id="purchases-title">Granska och rensa köp</h2>
          <p>Följ upp importerade och manuella köp, markera signaler och skapa återkommande utgifter vid behov.</p>
        </div>
        <span className="chip">
          <FileText aria-hidden="true" size={16} />
          {visiblePurchases.length}/{purchases.length} köp
        </span>
      </div>

      <div className="purchase-layout">
        <article className="purchase-list">
          <div className="purchase-list__header">
            <h3>Köpradar</h3>
            <div className="purchase-list__actions">
              <strong>{formatMoney(totalMinor)}</strong>
              {onCreatePurchase ? (
                <button className="icon-button" type="button" onClick={() => setEditor({ mode: 'create' })}>
                  <Plus aria-hidden="true" size={16} />
                  Nytt köp
                </button>
              ) : null}
            </div>
          </div>

          <div className="filter-bar" aria-label="Filtrera köp">
            <div className="field">
              <label htmlFor="purchase-search">Sök köp</label>
              <input
                id="purchase-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Handlare eller datum"
              />
            </div>
            <div className="field">
              <label htmlFor="purchase-category-filter">Kategori</label>
              <select
                id="purchase-category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
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
              <label htmlFor="purchase-payer-filter">Betalare</label>
              <select id="purchase-payer-filter" value={payerFilter} onChange={(event) => setPayerFilter(event.target.value)}>
                <option value="">Alla betalare</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="purchase-signal-filter">Signal</label>
              <select
                id="purchase-signal-filter"
                value={signalFilter}
                onChange={(event) => setSignalFilter(event.target.value as PurchaseSignal | '')}
              >
                <option value="">Alla signaler</option>
                {(Object.keys(signalLabels) as PurchaseSignal[]).map((signal) => (
                  <option key={signal} value={signal}>
                    {signal === 'business' ? businessSignalLabel : signalLabels[signal]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="empty-state purchase-empty" data-trace="DS-CLEAR-EMPTY-STATES-001">
              <FileText aria-hidden="true" size={26} />
              <h3>Inga köp importerade ännu</h3>
              <p>Importera några rader för att börja granska och markera köp.</p>
            </div>
          ) : visiblePurchases.length === 0 ? (
            <div className="empty-state purchase-empty" data-trace="DS-CLEAR-EMPTY-STATES-001">
              <FileText aria-hidden="true" size={26} />
              <h3>Inga köp matchar filtren</h3>
              <p>Ändra sökningen, kategori, betalare eller signal för att visa fler rader.</p>
            </div>
          ) : (
            <ul className="purchase-rows" aria-label="Köpradar">
              {visiblePurchases.map((purchase) => (
                <li key={purchase.id} className="purchase-row">
                  <div>
                    <strong>{purchase.merchant}</strong>
                    <span>
                      {purchase.date} · {findName(people, purchase.payerPersonId)}
                      {purchase.categoryId ? ` · ${findName(categories, purchase.categoryId)}` : ''}
                      {purchase.vendorId ? ` · Leverantör: ${purchase.vendorName ?? findName(vendors, purchase.vendorId)}` : ''}
                    </span>
                  </div>
                  <strong className="purchase-row__amount">{formatMoney(purchase.amountMinor, purchase.currency)}</strong>
                  <div
                    className="signal-actions"
                    aria-label={`Signaler för ${purchase.merchant}`}
                    data-trace="DS-PURCHASE-SIGNAL-SET-001 / DS-SIGNAL-DESIGN-001"
                  >
                    <SignalButton purchase={purchase} signal="review" icon={<Flag size={15} />} onToggle={onToggleSignal} />
                    <SignalButton
                      purchase={purchase}
                      signal="unnecessary"
                      icon={<ThumbsDown size={15} />}
                      onToggle={onToggleSignal}
                    />
                    <SignalButton
                      purchase={purchase}
                      signal="worth_it"
                      icon={<ThumbsUp size={15} />}
                      onToggle={onToggleSignal}
                    />
                    <SignalButton
                      purchase={purchase}
                      signal="business"
                      icon={<BriefcaseBusiness size={15} />}
                      onToggle={onToggleSignal}
                      label={businessSignalLabel}
                    />
                    <SignalButton
                      purchase={purchase}
                      signal="recurring"
                      icon={<Repeat2 size={15} />}
                      onToggle={onToggleSignal}
                    />
                    {onUpdatePurchase ? (
                      <button
                        className="signal-button"
                        type="button"
                        onClick={() => setEditor({ mode: 'edit', purchase })}
                        aria-label={`Redigera ${purchase.merchant}`}
                      >
                        <Pencil aria-hidden="true" size={15} />
                        <span>Redigera</span>
                      </button>
                    ) : null}
                    {onCreateRecurringFromPurchase ? (
                      <button
                        className="signal-button signal-button--convert"
                        type="button"
                        onClick={() => onCreateRecurringFromPurchase(purchase)}
                        disabled={Boolean(purchase.linkedRecurringExpenseId)}
                        aria-label={
                          purchase.linkedRecurringExpenseId
                            ? `Återkommande skapad från ${purchase.merchant}`
                            : `Skapa återkommande från ${purchase.merchant}`
                        }
                      >
                        {purchase.linkedRecurringExpenseId ? (
                          <CheckCircle2 aria-hidden="true" size={15} />
                        ) : (
                          <Repeat2 aria-hidden="true" size={15} />
                        )}
                        <span>{purchase.linkedRecurringExpenseId ? 'Återkommande skapad' : 'Skapa återkommande'}</span>
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
      {editor ? (
        <PurchaseEditor
          editor={editor}
          people={people}
          categories={categories}
          vendors={vendors}
          onClose={() => setEditor(null)}
          onSubmit={(input) => {
            if (editor.mode === 'edit') {
              onUpdatePurchase?.(editor.purchase, input);
            } else {
              onCreatePurchase?.(input);
            }
            setEditor(null);
          }}
        />
      ) : null}
    </section>
  );
}

function PurchaseEditor({
  editor,
  people,
  categories,
  vendors,
  onClose,
  onSubmit
}: {
  editor: PurchaseEditorState;
  people: PersonOption[];
  categories: CategoryOption[];
  vendors: VendorOption[];
  onClose: () => void;
  onSubmit: (input: PurchaseInput) => void;
}) {
  const purchase = editor.purchase;
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(purchase?.date ?? today);
  const [merchant, setMerchant] = useState(purchase?.merchant ?? '');
  const [amount, setAmount] = useState(purchase ? String(purchase.amountMinor / 100).replace('.', ',') : '');
  const [payerPersonId, setPayerPersonId] = useState(purchase?.payerPersonId ?? people[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(purchase?.categoryId ?? categories[0]?.id ?? '');
  const [vendorId, setVendorId] = useState(purchase?.vendorId ?? '');
  const [applyCategoryToSameMerchant, setApplyCategoryToSameMerchant] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !merchant.trim() || !amount.trim() || !payerPersonId) {
      setError('Fyll i datum, handlare, belopp och betalare.');
      return;
    }

    const selectedVendor = vendors.find((vendor) => vendor.id === vendorId);
    onSubmit({
      date,
      merchant,
      amount,
      payerPersonId,
      categoryId: categoryId || undefined,
      vendorId: vendorId || undefined,
      vendorName: selectedVendor?.name,
      applyCategoryToSameMerchant: editor.mode === 'edit' ? applyCategoryToSameMerchant : false,
      signals: purchase?.signals ?? ['review'],
      source: purchase?.source ?? 'manual'
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-editor-title"
        data-trace="DS-CREATION-MODAL-001 / DS-MOBILE-NO-OVERLAP-001 / DS-MERCHANT-CATEGORY-RULE-001"
      >
        <div className="panel__header">
          <div>
            <span className="eyebrow">Enskilt köp</span>
            <h2 id="purchase-editor-title">{editor.mode === 'edit' ? 'Redigera köp' : 'Nytt köp'}</h2>
            <p>Skapa eller korrigera ett lokalt köp utan bankkoppling.</p>
          </div>
          <button className="icon-button icon-button--ghost" type="button" onClick={onClose} aria-label="Stäng köpformulär">
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form className="purchase-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="purchase-date">Datum</label>
              <input id="purchase-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="purchase-merchant">Handlare</label>
              <input
                id="purchase-merchant"
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                placeholder="ICA, Apoteket, Netflix..."
              />
            </div>
            <div className="field">
              <label htmlFor="purchase-amount">Belopp</label>
              <input
                id="purchase-amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="249,90"
              />
            </div>
            <div className="field">
              <label htmlFor="purchase-payer">Betalare</label>
              <select id="purchase-payer" value={payerPersonId} onChange={(event) => setPayerPersonId(event.target.value)}>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="purchase-category">Kategori</label>
              <select id="purchase-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">Ingen kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="purchase-vendor">Leverantör</label>
              <select id="purchase-vendor" value={vendorId} onChange={(event) => setVendorId(event.target.value)}>
                <option value="">Ingen leverantör</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            {editor.mode === 'edit' ? (
              <label className="checkbox-field checkbox-field--wide" htmlFor="purchase-apply-category-rule">
                <input
                  id="purchase-apply-category-rule"
                  type="checkbox"
                  checked={applyCategoryToSameMerchant}
                  onChange={(event) => setApplyCategoryToSameMerchant(event.target.checked)}
                />
                <span>Använd kategori för matchande köp framåt</span>
              </label>
            ) : null}
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="form-actions">
            <button className="icon-button" type="button" onClick={onClose}>
              Avbryt
            </button>
            <button className="icon-button icon-button--primary" type="submit">
              <CheckCircle2 aria-hidden="true" size={17} />
              Spara köp
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SignalButton({
  purchase,
  signal,
  icon,
  onToggle,
  label
}: {
  purchase: Purchase;
  signal: PurchaseSignal;
  icon: ReactNode;
  onToggle: (purchase: Purchase, signal: PurchaseSignal) => void;
  label?: string;
}) {
  const active = purchase.signals.includes(signal);
  const buttonLabel = label ?? signalLabels[signal];
  return (
    <button
      className={`signal-button${active ? ' is-active' : ''}`}
      type="button"
      data-signal={signal}
      onClick={() => onToggle(purchase, signal)}
      aria-pressed={active}
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      {icon}
      <span>{buttonLabel}</span>
    </button>
  );
}

function findName(items: Array<{ id: string; name: string }>, id?: string) {
  return items.find((item) => item.id === id)?.name ?? 'Ej angivet';
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('sv-SE');
}

