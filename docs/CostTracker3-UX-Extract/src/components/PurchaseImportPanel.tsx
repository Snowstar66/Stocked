import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { parsePurchaseImportFile } from '../domain/purchaseFileImport';
import { parsePurchaseCsv, type PurchaseCsvPreview, type PurchaseCsvRow } from '../domain/purchases';
import { formatMoney } from './TimelineView';

interface PurchaseImportPanelProps {
  onImportPurchases: (rows: PurchaseCsvRow[]) => { importedCount: number; skippedDuplicateCount: number } | void;
  quickActionRequest?: { id: number } | null;
  statusRole?: boolean;
}

export function PurchaseImportPanel({ onImportPurchases, quickActionRequest, statusRole = true }: PurchaseImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledQuickActionId = useRef<number | null>(null);
  const [rawCsv, setRawCsv] = useState('datum;handlare;belopp\n2026-05-07;ICA;249,90');
  const [filePreview, setFilePreview] = useState<PurchaseCsvPreview | null>(null);
  const [fileName, setFileName] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [message, setMessage] = useState('Klistra in enkel CSV med datum, handlare och belopp.');
  const csvPreview = useMemo(() => parsePurchaseCsv(rawCsv), [rawCsv]);
  const preview = filePreview ?? csvPreview;

  useEffect(() => {
    if (!quickActionRequest || handledQuickActionId.current === quickActionRequest.id) {
      return;
    }

    handledQuickActionId.current = quickActionRequest.id;
    fileInputRef.current?.focus();
  }, [quickActionRequest]);

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      setFileName('');
      setFilePreview(null);
      return;
    }

    setIsReadingFile(true);
    setFileName(file.name);
    setMessage(`Läser ${file.name} lokalt...`);
    const nextPreview = await parsePurchaseImportFile(file);
    setFilePreview(nextPreview);
    setIsReadingFile(false);

    if (nextPreview.rows.length === 0) {
      setMessage(nextPreview.ignoredRows[0]?.reason ?? 'Inga giltiga köprader hittades i filen.');
      return;
    }

    setMessage(`${nextPreview.rows.length} köprader hittades i ${file.name}. Granska förhandsvisningen innan import.`);
  }

  function handleImport() {
    if (preview.rows.length === 0) {
      setMessage('Inga giltiga köprader hittades.');
      return;
    }

    const result = onImportPurchases(preview.rows);
    const importedCount = result?.importedCount ?? preview.rows.length;
    const skippedDuplicateCount = result?.skippedDuplicateCount ?? 0;
    const duplicateMessage =
      skippedDuplicateCount > 0 ? ` ${skippedDuplicateCount} dubblett${skippedDuplicateCount === 1 ? '' : 'er'} hoppades över.` : '';
    setMessage(`${importedCount} köp importerades lokalt.${duplicateMessage}`);
  }

  return (
    <article className="data-card data-card--wide purchase-import" data-trace="DS-DEDUPE-001 / DS-CSV-001">
      <h3>Importera enskilda köp</h3>
      <p>För sällanjobb: importera CSV, XLSX eller textbaserad Mastercard-PDF lokalt. Originalfilen sparas inte.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="purchase-file">Importfil</label>
          <input
            ref={fileInputRef}
            id="purchase-file"
            type="file"
            accept=".csv,.txt,.xlsx,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              void handleFileChange(event.currentTarget.files?.[0]);
            }}
          />
          <small>Stöd: CSV, XLSX och Mastercard-PDF. All tolkning sker i webbläsaren.</small>
        </div>
        <div className="field">
          <label htmlFor="purchase-csv">Klistra in CSV</label>
          <textarea
            id="purchase-csv"
            value={rawCsv}
            rows={6}
            onChange={(event) => {
              setRawCsv(event.target.value);
              setFileName('');
              setFilePreview(null);
            }}
          />
        </div>
      </div>
      <dl className="detail-list detail-list--compact">
        <div>
          <dt>Giltiga rader</dt>
          <dd>{preview.rows.length}</dd>
        </div>
        <div>
          <dt>Ignorerade</dt>
          <dd>{preview.ignoredRows.length}</dd>
        </div>
        <div>
          <dt>Importsumma</dt>
          <dd>{formatMoney(preview.totalMinor)}</dd>
        </div>
        <div>
          <dt>Källa</dt>
          <dd>{fileName || 'Klistrad CSV'}</dd>
        </div>
      </dl>
      {preview.ignoredRows.length > 0 ? <p className="error-text">{preview.ignoredRows[0].reason}</p> : null}
      <div className="form-actions form-actions--left">
        <button className="icon-button icon-button--primary" type="button" onClick={handleImport} disabled={isReadingFile}>
          <Upload aria-hidden="true" size={17} />
          {isReadingFile ? 'Läser fil' : 'Importera köp'}
        </button>
      </div>
      <p role={statusRole ? 'status' : undefined} aria-live="polite">
        {message}
      </p>
    </article>
  );
}
