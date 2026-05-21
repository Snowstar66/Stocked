import type { AppState, ExpenseAttachment, RecurringExpense } from '../domain/types';
import { createExportPayload, serializeAppStateExport } from './localStore';

interface ZipEntry {
  path: string;
  bytes: Uint8Array;
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

export function createZipPackage(state: AppState, now = new Date()): Blob {
  const entries: ZipEntry[] = [
    {
      path: 'context.json',
      bytes: encodeUtf8(serializeAppStateExport(state, now))
    },
    {
      path: 'README.txt',
      bytes: encodeUtf8(
        [
          'CostTracker3 lokal backup',
          '',
          'context.json innehaller hela appens lokala state.',
          'attachments/ innehaller bilagor som finns sparade lokalt i utgifter.',
          'Ingen data har skickats till konto, bank eller moln nar filen skapades.'
        ].join('\n')
      )
    },
    ...collectAttachmentEntries(state.recurringExpenses)
  ];

  return new Blob([toBlobPart(buildZip(entries))], { type: 'application/zip' });
}

export function createPdfReport(state: AppState, now = new Date()): Blob {
  const wallet = state.wallets.find((item) => item.id === state.activeWalletId) ?? state.wallets[0];
  const expenses = wallet ? state.recurringExpenses.filter((expense) => expense.walletId === wallet.id) : state.recurringExpenses;
  const purchases = wallet ? state.purchases.filter((purchase) => purchase.walletId === wallet.id) : state.purchases;
  const monthlyTotalMinor = expenses
    .filter((expense) => expense.status === 'active')
    .reduce((sum, expense) => sum + expense.amountMinor, 0);
  const lines = [
    'CostTracker3 rapport',
    `Exporterad: ${formatDateTime(now)}`,
    `Planbok: ${wallet?.name ?? 'Okand'}`,
    `Aktiva aterkommande utgifter: ${expenses.filter((expense) => expense.status === 'active').length}`,
    `Manadstotal: ${formatMoney(monthlyTotalMinor)}`,
    `Kop: ${purchases.length}`,
    `Bilagor: ${expenses.reduce((sum, expense) => sum + (expense.attachments?.length ?? 0), 0)}`,
    '',
    'Storsta aterkommande poster:',
    ...expenses
      .filter((expense) => expense.status === 'active')
      .sort((left, right) => right.amountMinor - left.amountMinor)
      .slice(0, 8)
      .map((expense) => `${expense.name}: ${formatMoney(expense.amountMinor)}`),
    '',
    'Rapporten ar en lokal sammanfattning, inte bokforingsunderlag.'
  ];

  return new Blob([toBlobPart(buildPdf(lines))], { type: 'application/pdf' });
}

export function createHandoffHtml(state: AppState, now = new Date()): Blob {
  const payload = JSON.stringify(createExportPayload(state, now), null, 2);
  const escapedPayload = payload.replace(/</g, '\\u003c');
  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>CostTracker3 datahandoff</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; line-height: 1.5; color: #182230; }
    main { max-width: 760px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #d7dde5; padding: 16px; border-radius: 8px; background: #f8fafc; }
  </style>
</head>
<body>
  <main>
    <h1>CostTracker3 datahandoff</h1>
    <p>Den har filen innehaller en lokal JSON-backup inbaddad i HTML. Importera filen i appens Data-vy for att lasa tillbaka den.</p>
    <script id="costtracker3-app-state-export" type="application/json">${escapedPayload}</script>
    <pre>${escapeHtml(payload)}</pre>
  </main>
</body>
</html>
`;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

export function createPortableFileName(kind: 'zip' | 'pdf' | 'handoff' | 'data', date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  if (kind === 'zip') {
    return `mina-utgifter-backup-${stamp}.zip`;
  }
  if (kind === 'pdf') {
    return `mina-utgifter-rapport-${stamp}.pdf`;
  }
  if (kind === 'handoff') {
    return `mina-utgifter-handoff-${stamp}.html`;
  }
  return `mina-utgifter-datafil-${stamp}.json`;
}

function collectAttachmentEntries(expenses: RecurringExpense[]): ZipEntry[] {
  return expenses.flatMap((expense) =>
    (expense.attachments ?? []).map((attachment) => ({
      path: `attachments/${sanitizeFilePart(expense.name)}-${sanitizeFilePart(attachment.id)}-${sanitizeFilePart(attachment.name)}`,
      bytes: decodeDataUrl(attachment)
    }))
  );
}

function decodeDataUrl(attachment: ExpenseAttachment): Uint8Array {
  const [, metadata = '', content = ''] = attachment.dataUrl.match(/^data:([^,]*),(.*)$/) ?? [];
  if (metadata.includes(';base64')) {
    return binaryStringToBytes(atob(content));
  }
  return encodeUtf8(decodeURIComponent(content));
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encodeUtf8(entry.path);
    const crc = crc32(entry.bytes);
    const localHeader = concatBytes(
      le32(0x04034b50),
      le16(20),
      le16(0),
      le16(0),
      le16(0),
      le16(0),
      le32(crc),
      le32(entry.bytes.length),
      le32(entry.bytes.length),
      le16(nameBytes.length),
      le16(0),
      nameBytes
    );
    const centralHeader = concatBytes(
      le32(0x02014b50),
      le16(20),
      le16(20),
      le16(0),
      le16(0),
      le16(0),
      le16(0),
      le32(crc),
      le32(entry.bytes.length),
      le32(entry.bytes.length),
      le16(nameBytes.length),
      le16(0),
      le16(0),
      le16(0),
      le16(0),
      le32(0),
      le32(offset),
      nameBytes
    );

    localParts.push(localHeader, entry.bytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + entry.bytes.length;
  }

  const centralDirectory = concatBytes(...centralParts);
  const endOfCentralDirectory = concatBytes(
    le32(0x06054b50),
    le16(0),
    le16(0),
    le16(entries.length),
    le16(entries.length),
    le32(centralDirectory.length),
    le32(offset),
    le16(0)
  );

  return concatBytes(...localParts, centralDirectory, endOfCentralDirectory);
}

function buildPdf(lines: string[]): Uint8Array {
  const textCommands = lines
    .flatMap((line, index) => [
      index === 0 ? 'BT /F1 18 Tf 56 780 Td' : index === 1 ? '/F1 10 Tf 0 -24 Td' : '0 -17 Td',
      `(${escapePdf(line)}) Tj`
    ])
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${textCommands.length + 3} >>\nstream\n${textCommands}\nET\nendstream`
  ];
  const chunks = ['%PDF-1.4\n'];
  const offsets = [0];
  let length = chunks[0].length;

  objects.forEach((object, index) => {
    offsets.push(length);
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    chunks.push(chunk);
    length += chunk.length;
  });

  const xrefOffset = length;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    `startxref\n${xrefOffset}`,
    '%%EOF'
  ].join('\n');

  return encodeUtf8(`${chunks.join('')}${xref}`);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function le16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function le32(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]);
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function binaryStringToBytes(value: string): Uint8Array {
  return Uint8Array.from(value, (char) => char.charCodeAt(0));
}

function sanitizeFilePart(value: string): string {
  return value.trim().replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'file';
}

function escapePdf(value: string): string {
  return value.replace(/[()\\]/g, (match) => `\\${match}`).replace(/[^\x20-\x7e]/g, '?');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

function formatMoney(amountMinor: number): string {
  return `${new Intl.NumberFormat('sv-SE').format(amountMinor / 100)} SEK`;
}
