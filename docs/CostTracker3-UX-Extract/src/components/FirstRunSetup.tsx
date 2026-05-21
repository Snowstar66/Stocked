import { FormEvent, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type { WalletSetupPayload, WalletTemplate } from './types';

interface FirstRunSetupProps {
  initialWalletName?: string;
  initialPayerName?: string;
  initialTemplate?: WalletTemplate;
  traceIds?: string;
  onSubmit?: (payload: WalletSetupPayload) => void;
  onCreate?: (payload: WalletSetupPayload) => void;
}

interface FirstRunErrors {
  walletName?: string;
  payerName?: string;
}

export function FirstRunSetup({
  initialWalletName = '',
  initialPayerName = '',
  initialTemplate = 'standard',
  traceIds,
  onSubmit,
  onCreate
}: FirstRunSetupProps) {
  const [walletName, setWalletName] = useState(initialWalletName);
  const [payerName, setPayerName] = useState(initialPayerName);
  const [template, setTemplate] = useState<WalletTemplate>(initialTemplate);
  const [errors, setErrors] = useState<FirstRunErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FirstRunErrors = {};
    if (!walletName.trim()) {
      nextErrors.walletName = 'Namnge plånboken innan du fortsätter.';
    }
    if (!payerName.trim()) {
      nextErrors.payerName = 'Lägg till minst en betalare.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      walletName: walletName.trim(),
      payerName: payerName.trim(),
      template
    };

    onSubmit?.(payload);
    onCreate?.(payload);
  }

  return (
    <section
      className="panel empty-state"
      aria-labelledby="first-run-title"
      data-trace={[traceIds, 'DS-CLEAR-EMPTY-STATES-001'].filter(Boolean).join(' / ')}
    >
      <span className="local-badge">
        <ShieldCheck aria-hidden="true" size={16} />
        Lokalt först, inget konto behövs
      </span>

      <div className="panel__header">
        <div>
          <span className="eyebrow">Första start</span>
          <h2 id="first-run-title">Skapa första plånboken</h2>
          <p>Börja med en lokal plånbok och en betalare så tidslinjen får en tydlig ägare.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="wallet-name">Plånboksnamn</label>
            <input
              id="wallet-name"
              value={walletName}
              onChange={(event) => setWalletName(event.target.value)}
              aria-invalid={Boolean(errors.walletName)}
              aria-describedby={errors.walletName ? 'wallet-name-error' : undefined}
              autoComplete="off"
            />
            {errors.walletName ? <small id="wallet-name-error">{errors.walletName}</small> : null}
          </div>

          <div className="field">
            <label htmlFor="payer-name">Första betalaren</label>
            <input
              id="payer-name"
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              aria-invalid={Boolean(errors.payerName)}
              aria-describedby={errors.payerName ? 'payer-name-error' : undefined}
              autoComplete="off"
            />
            {errors.payerName ? <small id="payer-name-error">{errors.payerName}</small> : null}
          </div>

          <div className="field">
            <label htmlFor="wallet-template">Startstruktur</label>
            <select
              id="wallet-template"
              value={template}
              onChange={(event) => setTemplate(event.target.value as WalletTemplate)}
            >
              <option value="standard">Standardkategorier</option>
              <option value="blank">Tom plånbok</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="icon-button icon-button--primary" type="submit">
            <CheckCircle2 aria-hidden="true" size={17} />
            Skapa plånbok
          </button>
        </div>
      </form>
    </section>
  );
}
