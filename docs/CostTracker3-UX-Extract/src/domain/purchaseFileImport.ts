import { parsePurchaseCsv, type IgnoredPurchaseCsvRow, type PurchaseCsvPreview, type PurchaseCsvRow } from './purchases';
import { parseMoneyToMinorUnits } from './validation';

type ZipTextEntries = Record<string, string>;

const XLSX_SHARED_STRINGS = 'xl/sharedStrings.xml';
const XLSX_FIRST_SHEET = 'xl/worksheets/sheet1.xml';

export async function parsePurchaseImportFile(file: File): Promise<PurchaseCsvPreview> {
  const lowerName = file.name.toLocaleLowerCase('sv-SE');

  if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
    return parsePurchaseCsv(await readFileText(file));
  }

  const bytes = await readFileBytes(file);

  if (lowerName.endsWith('.xlsx')) {
    return parsePurchaseXlsx(bytes);
  }

  if (lowerName.endsWith('.pdf')) {
    return parsePurchasePdf(bytes);
  }

  return emptyPreview(`Filtypen stöds inte. Välj CSV, XLSX eller PDF.`);
}

export async function parsePurchaseXlsx(bytes: Uint8Array): Promise<PurchaseCsvPreview> {
  try {
    const entries = await readZipTextEntries(bytes, [XLSX_SHARED_STRINGS, XLSX_FIRST_SHEET]);
    const sharedStrings = parseSharedStrings(entries[XLSX_SHARED_STRINGS] ?? '');
    const rows = parseWorksheetRows(entries[XLSX_FIRST_SHEET] ?? '', sharedStrings);
    return createPreview(rows, []);
  } catch (error) {
    return emptyPreview(error instanceof Error ? error.message : 'XLSX-filen kunde inte läsas.');
  }
}

export async function parsePurchasePdf(bytes: Uint8Array): Promise<PurchaseCsvPreview> {
  try {
    const text = await extractPdfText(bytes);
    const rows = parseMastercardStatementText(text);
    return createPreview(rows, rows.length === 0 ? [{ lineNumber: 1, raw: '', reason: 'Inga köprader hittades i PDF-filen.' }] : []);
  } catch (error) {
    return emptyPreview(error instanceof Error ? error.message : 'PDF-filen kunde inte läsas.');
  }
}

export function parseMastercardStatementText(text: string): PurchaseCsvRow[] {
  const tokens = text
    .split(/\r?\n/)
    .map((token) => token.trim())
    .filter(Boolean);
  const rows: PurchaseCsvRow[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!isShortStatementDate(token)) {
      continue;
    }

    const nextToken = tokens[index + 1] ?? '';
    if (['SALDO', 'TOTALT'].includes(nextToken.toLocaleUpperCase('sv-SE'))) {
      continue;
    }

    const currencyIndex = findNextCurrencyToken(tokens, index + 1, 16);
    if (currencyIndex === -1) {
      continue;
    }

    const bookedDateIndex = findNextDateToken(tokens, currencyIndex + 1, 5);
    if (bookedDateIndex === -1) {
      continue;
    }

    const amountIndex = findNextMoneyToken(tokens, bookedDateIndex + 1, 3);
    if (amountIndex === -1) {
      continue;
    }

    const amountMinor = parseMoneyToMinorUnits(tokens[amountIndex].replace(/\*$/, ''));
    const merchantParts = tokens.slice(index + 1, currencyIndex);
    const currencyToken = tokens[currencyIndex];
    const suffixLength = currencySuffixLength(currencyToken);
    if (currencyToken !== 'SEK' && suffixLength > 0) {
      merchantParts.push(currencyToken.slice(0, -suffixLength));
    }
    const merchant = merchantParts.join(' ').replace(/\s+/g, ' ').trim();
    if (!merchant || amountMinor === null || amountMinor <= 0) {
      continue;
    }

    rows.push({
      date: shortStatementDateToIso(token),
      merchant,
      amountMinor
    });

    index = amountIndex;
  }

  return rows;
}

function createPreview(rows: PurchaseCsvRow[], ignoredRows: IgnoredPurchaseCsvRow[]): PurchaseCsvPreview {
  return {
    rows,
    ignoredRows,
    totalMinor: rows.reduce((sum, row) => sum + row.amountMinor, 0)
  };
}

function emptyPreview(reason: string): PurchaseCsvPreview {
  return createPreview([], [{ lineNumber: 1, raw: '', reason }]);
}

async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return decodeUtf8(await readFileBytes(file));
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === 'function') {
    return new Uint8Array(await file.arrayBuffer());
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function readZipTextEntries(bytes: Uint8Array, wantedNames: string[]): Promise<ZipTextEntries> {
  const wanted = new Set(wantedNames);
  const entries: ZipTextEntries = {};
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    if (readUint32(bytes, offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const flags = readUint16(bytes, offset + 6);
    const method = readUint16(bytes, offset + 8);
    const compressedSize = readUint32(bytes, offset + 18);
    const fileNameLength = readUint16(bytes, offset + 26);
    const extraLength = readUint16(bytes, offset + 28);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;

    if (flags & 0x08) {
      throw new Error('XLSX-filen använder ZIP data descriptors som inte stöds i lokal import.');
    }

    if (dataEnd > bytes.length) {
      throw new Error('XLSX-filen är ofullständig eller skadad.');
    }

    const name = decodeUtf8(bytes.slice(nameStart, nameEnd));
    if (wanted.has(name)) {
      entries[name] = await decodeZipEntry(bytes.slice(dataStart, dataEnd), method);
    }

    offset = dataEnd;
  }

  const missingName = wantedNames.find((name) => !entries[name]);
  if (missingName) {
    throw new Error(`XLSX-filen saknar ${missingName}.`);
  }

  return entries;
}

async function decodeZipEntry(data: Uint8Array, method: number): Promise<string> {
  if (method === 0) {
    return decodeUtf8(data);
  }

  if (method === 8) {
    return decodeUtf8(await decompress(data, 'deflate-raw'));
  }

  throw new Error(`XLSX-filen använder en ZIP-komprimering som inte stöds (${method}).`);
}

function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si\b[\s\S]*?<\/si>/g)].map((match) =>
    [...match[0].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1])).join('')
  );
}

function parseWorksheetRows(xml: string, sharedStrings: string[]): PurchaseCsvRow[] {
  const rows: PurchaseCsvRow[] = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: Record<string, string> = {};
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2];
      const ref = attributes.match(/\br="([A-Z]+)\d+"/)?.[1];
      const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (!ref || value === undefined) {
        continue;
      }

      cells[ref] = attributes.includes(' t="s"') ? (sharedStrings[Number(value)] ?? '') : value;
    }

    const date = excelSerialDateToIso(cells.A);
    const merchant = normalizeSpreadsheetMerchant(cells.C, cells.D);
    const amountMinor = parseSpreadsheetAmount(cells.G);
    if (date && merchant && amountMinor !== null && amountMinor > 0) {
      rows.push({ date, merchant, amountMinor });
    }
  }

  return rows;
}

function normalizeSpreadsheetMerchant(specification?: string, location?: string): string {
  const merchant = (specification ?? '').trim();
  const place = (location ?? '').trim();
  if (!merchant || ['Specifikation', 'Summa köp/uttag', 'Totalt belopp', 'IngÃ¥ende saldo', 'Ingående saldo'].includes(merchant)) {
    return '';
  }

  return place ? `${merchant} ${place}` : merchant;
}

function parseSpreadsheetAmount(value?: string): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace('.', ',');
  return parseMoneyToMinorUnits(normalized);
}

function excelSerialDateToIso(value?: string): string | null {
  if (!value || !/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }

  const serial = Number(value);
  if (!Number.isFinite(serial) || serial <= 0) {
    return null;
  }

  const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const binary = decodeLatin1(bytes);
  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const chunks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = streamPattern.exec(binary))) {
    const rawStream = latin1ToBytes(match[1]);
    let decoded: Uint8Array;
    try {
      decoded = await decompress(rawStream, 'deflate');
    } catch {
      continue;
    }

    chunks.push(extractPdfTextOperators(decodeWindows1252(decoded)));
  }

  return chunks.join('\n');
}

function extractPdfTextOperators(content: string): string {
  const tokens: string[] = [];
  const pattern = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content))) {
    tokens.push(decodePdfLiteral(match[0].replace(/\s*Tj$/, '').slice(1, -1)));
  }

  return tokens.join('\n');
}

function decodePdfLiteral(value: string): string {
  return value
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\([nrtbf()\\])/g, (_, escaped: string) => {
      const replacements: Record<string, string> = {
        n: '\n',
        r: '\r',
        t: '\t',
        b: '\b',
        f: '\f',
        '(': '(',
        ')': ')',
        '\\': '\\'
      };
      return replacements[escaped] ?? escaped;
    });
}

function findNextCurrencyToken(tokens: string[], start: number, maxDistance: number): number {
  const end = Math.min(tokens.length, start + maxDistance);
  for (let index = start; index < end; index += 1) {
    if (currencySuffixLength(tokens[index]) > 0) {
      return index;
    }
  }
  return -1;
}

function currencySuffixLength(value: string): number {
  if (value === 'SEK') {
    return 3;
  }
  if (/^[A-ZÅÄÖ]{2,}SEK$/.test(value)) {
    return 3;
  }
  if (/^[A-ZÅÄÖ]{2,}EK$/.test(value)) {
    return 2;
  }
  return 0;
}

function findNextDateToken(tokens: string[], start: number, maxDistance: number): number {
  const end = Math.min(tokens.length, start + maxDistance);
  for (let index = start; index < end; index += 1) {
    if (isShortStatementDate(tokens[index])) {
      return index;
    }
  }
  return -1;
}

function findNextMoneyToken(tokens: string[], start: number, maxDistance: number): number {
  const end = Math.min(tokens.length, start + maxDistance);
  for (let index = start; index < end; index += 1) {
    if (/^\d+(?:[.,]\d{2})?\*?$/.test(tokens[index])) {
      return index;
    }
  }
  return -1;
}

function isShortStatementDate(value: string): boolean {
  return /^\d{6}$/.test(value);
}

function shortStatementDateToIso(value: string): string {
  return `20${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
}

async function decompress(data: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Din webbläsare saknar stöd för lokal dekomprimering av den här filen.');
  }

  const stream = new Blob([toArrayBuffer(data)]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

function decodeLatin1(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

function decodeWindows1252(bytes: Uint8Array): string {
  return new TextDecoder('windows-1252').decode(bytes);
}

function latin1ToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
