const STORAGE_KEY = "stocked.state.v1";
const LEGACY_STORAGE_KEYS = ["matsvinnskollen.state.v1"];
const CATEGORIES = ["Kyl", "Frys", "Skafferi", "Annat"];
const DEFAULT_PLACE_NAME = "Hem";
const MAX_PHOTO_SIZE = 900;
const PHOTO_QUALITY = 0.72;
const OPEN_FOOD_FACTS_ENDPOINT = "https://world.openfoodfacts.org/api/v2/product/";
const OPEN_FOOD_FACTS_FIELDS = "product_name,product_name_sv,generic_name,brands,categories,categories_tags,image_front_small_url,image_small_url,image_url";
const BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];
const ZXING_BROWSER_URL = "https://unpkg.com/@zxing/browser@0.2.0";
const SCAN_COOLDOWN_MS = 1800;

const icons = {
  items:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5"/><path d="M12 12v9"/></svg>',
  date:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M8 13h3M8 16h5"/></svg>',
  soon:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2"/><path d="M21 12a9 9 0 1 1-3.2-6.9"/><path d="M21 4v5h-5"/></svg>',
  shopping:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>'
};

const state = {
  current: loadState(),
  view: "overview",
  pendingPhotoDataUrl: "",
  lastScannedItemId: "",
  barcodeDetector: null,
  barcodeStream: null,
  zxingControls: null,
  zxingReader: null,
  zxingLoadPromise: null,
  recentBarcodeScans: {},
  barcodeScanTimer: 0,
  barcodeBusy: false
};

const elements = {
  nav: document.querySelector(".segmented-nav"),
  viewPanels: [...document.querySelectorAll("[data-view-panel]")],
  placeSelect: document.querySelector("#place-select"),
  placeForm: document.querySelector("#place-form"),
  placeName: document.querySelector("#place-name"),
  placeList: document.querySelector("#place-list"),
  inventoryForm: document.querySelector("#inventory-form"),
  itemName: document.querySelector("#item-name"),
  itemCategory: document.querySelector("#item-category"),
  itemQuantity: document.querySelector("#item-quantity"),
  itemDate: document.querySelector("#item-date"),
  itemPhoto: document.querySelector("#item-photo"),
  itemPhotoPreview: document.querySelector("#item-photo-preview"),
  clearPhoto: document.querySelector("#clear-photo"),
  scanBarcode: document.querySelector("#scan-barcode"),
  manualBarcode: document.querySelector("#manual-barcode"),
  addManualBarcode: document.querySelector("#add-manual-barcode"),
  barcodeScanner: document.querySelector("#barcode-scanner"),
  barcodeVideo: document.querySelector("#barcode-video"),
  barcodeStatus: document.querySelector("#barcode-status"),
  barcodeScannerStatus: document.querySelector("#barcode-scanner-status"),
  stopBarcodeScan: document.querySelector("#stop-barcode-scan"),
  scanResult: document.querySelector("#scan-result"),
  scanResultImage: document.querySelector("#scan-result-image"),
  scanResultTitle: document.querySelector("#scan-result-title"),
  scanResultMeta: document.querySelector("#scan-result-meta"),
  recentScanned: document.querySelector("#recent-scanned"),
  recentScannedName: document.querySelector("#recent-scanned-name"),
  recentScannedNameInput: document.querySelector("#recent-scanned-name-input"),
  recentScannedCategory: document.querySelector("#recent-scanned-category"),
  recentScannedQuantity: document.querySelector("#recent-scanned-quantity"),
  recentScannedDate: document.querySelector("#recent-scanned-date"),
  saveRecentScannedName: document.querySelector("#save-recent-scanned-name"),
  saveRecentScannedCategory: document.querySelector("#save-recent-scanned-category"),
  saveRecentScannedQuantity: document.querySelector("#save-recent-scanned-quantity"),
  saveRecentScannedDate: document.querySelector("#save-recent-scanned-date"),
  undoRecentScanned: document.querySelector("#undo-recent-scanned"),
  clearRecentScanned: document.querySelector("#clear-recent-scanned"),
  shoppingForm: document.querySelector("#shopping-form"),
  shoppingName: document.querySelector("#shopping-name"),
  inventory: document.querySelector("#inventory"),
  soon: document.querySelector("#soon"),
  suggestions: document.querySelector("#suggestions"),
  shopping: document.querySelector("#shopping"),
  audit: document.querySelector("#audit"),
  summary: document.querySelector("#summary"),
  feedback: document.querySelector("#feedback"),
  clearAudit: document.querySelector("#clear-audit"),
  clearData: document.querySelector("#clear-data")
};

for (const category of CATEGORIES) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  elements.itemCategory.append(option);

  const recentOption = document.createElement("option");
  recentOption.value = category;
  recentOption.textContent = category;
  elements.recentScannedCategory.append(recentOption);
}

elements.nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  setView(button.dataset.view);
});

elements.placeSelect.addEventListener("change", () => {
  state.current = { ...state.current, activePlaceId: elements.placeSelect.value };
  saveState(state.current);
  render();
  announce(`Visar ${activePlace().name}.`);
});

elements.placeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = addPlace(state.current, elements.placeName.value);
  applyResult(result, result.error || `Lade till platsen ${result.place.name}.`);
  if (!result.error) elements.placeForm.reset();
});

elements.placeList.addEventListener("click", (event) => {
  const renameButton = event.target.closest("[data-rename-place]");
  const activateButton = event.target.closest("[data-activate-place]");
  if (renameButton) {
    const input = elements.placeList.querySelector(`[data-place-name="${renameButton.dataset.renamePlace}"]`);
    const result = renamePlace(state.current, renameButton.dataset.renamePlace, input?.value);
    applyResult(result, result.error || "Platsen döptes om.");
  }
  if (activateButton) {
    state.current = { ...state.current, activePlaceId: activateButton.dataset.activatePlace };
    saveState(state.current);
    render();
    announce(`Visar ${activePlace().name}.`);
  }
});

elements.itemPhoto.addEventListener("change", async () => {
  const file = elements.itemPhoto.files?.[0];
  if (!file) {
    clearPendingPhoto();
    return;
  }
  if (!file.type.startsWith("image/")) {
    clearPendingPhoto();
    announce("Välj en bildfil.", "error");
    return;
  }
  try {
    state.pendingPhotoDataUrl = await prepareItemPhoto(file);
    renderPhotoPreview();
    announce("Bilden är redo att sparas med varan.");
  } catch {
    clearPendingPhoto();
    announce("Bilden kunde inte läsas. Prova en mindre bild.", "error");
  }
});

elements.clearPhoto.addEventListener("click", () => {
  clearPendingPhoto();
  announce("Bilden togs bort från formuläret.");
});

elements.scanBarcode.addEventListener("click", startBarcodeScan);
elements.addManualBarcode.addEventListener("click", addManualBarcode);
elements.manualBarcode.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addManualBarcode();
});
elements.stopBarcodeScan.addEventListener("click", () => {
  stopBarcodeScan();
  announce("Skanningen avbröts.");
});

elements.saveRecentScannedName.addEventListener("click", saveRecentScannedName);
elements.saveRecentScannedCategory.addEventListener("click", saveRecentScannedCategory);
elements.saveRecentScannedQuantity.addEventListener("click", saveRecentScannedQuantity);
elements.saveRecentScannedDate.addEventListener("click", saveRecentScannedDate);
elements.undoRecentScanned.addEventListener("click", undoRecentScanned);
elements.clearRecentScanned.addEventListener("click", () => {
  state.lastScannedItemId = "";
  renderRecentScanned();
});

elements.inventoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = addItemToActivePlace(state.current, {
    name: elements.itemName.value,
    category: elements.itemCategory.value,
    quantity: elements.itemQuantity.value,
    date: elements.itemDate.value,
    photoDataUrl: state.pendingPhotoDataUrl
  });
  applyResult(result, result.error || `Sparade ${result.item.name} i ${activePlace(result.state).name}.`);
  if (!result.error) {
    elements.inventoryForm.reset();
    clearPendingPhoto();
  }
});

elements.shoppingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = addShoppingItemToActivePlace(state.current, { name: elements.shoppingName.value });
  const warning = result.shoppingItem?.inInventory ? " Liknande vara finns redan på platsen." : "";
  applyResult(result, result.error || `Lade till ${result.shoppingItem.name}.${warning}`);
  if (!result.error) elements.shoppingForm.reset();
});

elements.inventory.addEventListener("click", handleUseItemClick);
elements.soon.addEventListener("click", handleUseItemClick);

elements.shopping.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("[data-toggle-shop]");
  const removeButton = event.target.closest("[data-remove-shop]");
  if (toggleButton) {
    applyResult(toggleShoppingItemInActivePlace(state.current, toggleButton.dataset.toggleShop), "Inköpslistan uppdaterades.");
  }
  if (removeButton) {
    applyResult(removeShoppingItemFromActivePlace(state.current, removeButton.dataset.removeShop), "Inköpsraden togs bort.");
  }
});

elements.clearAudit.addEventListener("click", () => {
  const confirmed = window.confirm("Rensa auditloggen?");
  if (!confirmed) return;
  state.current = { ...state.current, audit: [] };
  saveState(state.current);
  render();
  announce("Auditloggen rensades.");
});

elements.clearData.addEventListener("click", () => {
  const confirmed = window.confirm("Rensa alla platser, varor och inköpslistor i den här webbläsaren?");
  if (!confirmed) return;
  state.current = createInitialState();
  saveState(state.current);
  render();
  announce("All lokal data rensades och en standardplats skapades.");
});

window.addEventListener("pagehide", stopBarcodeScan);

render();

function setView(view) {
  state.view = view;
  for (const button of elements.nav.querySelectorAll("[data-view]")) {
    button.classList.toggle("is-active", button.dataset.view === view);
  }
  for (const panel of elements.viewPanels) {
    panel.classList.toggle("is-active", panel.dataset.viewPanel === view);
  }
  elements.summary.hidden = view === "admin";
}

function handleUseItemClick(event) {
  const button = event.target.closest("[data-use-item]");
  if (!button) return;
  const result = markItemUsedInActivePlace(state.current, button.dataset.useItem);
  applyResult(result, result.error || "Lagret uppdaterades.");
}

function applyResult(result, message) {
  if (result.error) {
    announce(result.error, "error");
    return;
  }
  const previousState = state.current;
  state.current = result.state;
  try {
    saveState(state.current);
  } catch {
    state.current = previousState;
    announce("Kunde inte spara lokalt. Bilden kan vara för stor för webbläsarens lagring.", "error");
    return;
  }
  render();
  announce(message);
}

function render() {
  renderPlaceSelect();
  renderSummary();
  renderInventory();
  renderSoon();
  renderSuggestions();
  renderShopping();
  renderPlaces();
  renderAudit();
  renderRecentScanned();
  setView(state.view);
}

function renderPlaceSelect() {
  const activeId = state.current.activePlaceId;
  elements.placeSelect.innerHTML = "";
  for (const place of state.current.places) {
    const option = document.createElement("option");
    option.value = place.id;
    option.textContent = place.name;
    option.selected = place.id === activeId;
    elements.placeSelect.append(option);
  }
}

function renderSummary() {
  const place = activePlace();
  const datedItems = place.items.filter((item) => item.date).length;
  const usedSoon = soonItems(place.items).length;
  elements.summary.innerHTML = "";
  elements.summary.append(
    metric("Varor", place.items.length, icons.items),
    metric("Med datum", datedItems, icons.date),
    metric("Snart-dags", usedSoon, icons.soon),
    metric("Inköp", place.shopping.filter((item) => !item.checked).length, icons.shopping)
  );
}

function renderInventory() {
  const place = activePlace();
  const groups = groupItemsByCategory(place.items);
  elements.inventory.innerHTML = emptyMessage(groups.length, "Inga varor registrerade ännu.");
  for (const group of groups) {
    const section = document.createElement("section");
    section.className = "inventory-group";
    section.innerHTML = `<div class="filter-bar"><strong>${group.category}</strong><span class="filter-count">${group.items.length} varor</span></div>`;
    const table = document.createElement("table");
    table.className = "timeline-table";
    table.innerHTML = `
      <thead>
        <tr><th>Vara</th><th>Bild</th><th>Antal</th><th>Datum</th><th>Status</th><th></th></tr>
      </thead>
      <tbody></tbody>
    `;
    const body = table.querySelector("tbody");
    for (const item of group.items) {
      const status = itemStatus(item);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><span class="row-title"><strong>${escapeHtml(item.name)}</strong><span>${itemMetaMarkup(item)}</span></span></td>
        <td>${itemPhotoMarkup(item)}</td>
        <td class="amount" data-label="Antal">${item.quantity}</td>
        <td data-label="Datum">${item.date || "Saknas"}</td>
        <td><span class="pill ${status.tone}">${status.label}</span></td>
        <td><button class="icon-button" data-use-item="${item.id}" title="Markera använd" aria-label="Markera ${escapeHtml(item.name)} som använd">✓</button></td>
      `;
      body.append(row);
    }
    section.append(table);
    elements.inventory.append(section);
  }
}

function renderSoon() {
  const items = soonItems(activePlace().items);
  elements.soon.innerHTML = emptyMessage(items.length, "Inga datum inom sju dagar.");
  for (const item of items) {
    const node = document.createElement("article");
    node.className = "month-card";
    node.innerHTML = `
      <div class="month-card__top">
        <div class="month-card__title">${itemPhotoMarkup(item)}<strong>${escapeHtml(item.name)}</strong></div>
        <span class="pill ${item.status.tone}">${dateText(item.daysLeft)}</span>
      </div>
      <ul>
        <li><span>${item.category}<small>${item.quantity} st</small></span><button class="icon-button" data-use-item="${item.id}">Använd</button></li>
      </ul>
    `;
    elements.soon.append(node);
  }
}

function renderSuggestions() {
  const suggestions = generateSuggestions(activePlace().items);
  elements.suggestions.innerHTML = emptyMessage(suggestions.length, "Lägg till några varor för måltidsidéer.");
  for (const suggestion of suggestions) {
    const node = document.createElement("article");
    node.className = "data-card suggestion";
    node.innerHTML = `
      <strong>${escapeHtml(suggestion.title)}</strong>
      <span>${suggestion.items.map(escapeHtml).join(" + ")}</span>
      <small>${escapeHtml(suggestion.reason)} Inte ett livsmedelssäkerhetsråd.</small>
    `;
    elements.suggestions.append(node);
  }
}

function renderShopping() {
  const shopping = activePlace().shopping;
  elements.shopping.innerHTML = emptyMessage(shopping.length, "Inköpslistan är tom.");
  for (const item of shopping) {
    const row = document.createElement("article");
    row.className = `register-row shopping-row ${item.checked ? "checked" : ""}`;
    row.innerHTML = `
      <button class="icon-button" data-toggle-shop="${item.id}" title="Växla inköpt" aria-label="Växla ${escapeHtml(item.name)}">✓</button>
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.inInventory ? "<span>Liknande vara finns på platsen</span>" : "<span>Saknas i platsens lager</span>"}
      </div>
      <button class="icon-button danger-action" data-remove-shop="${item.id}" title="Ta bort" aria-label="Ta bort ${escapeHtml(item.name)}">×</button>
    `;
    elements.shopping.append(row);
  }
}

function renderPlaces() {
  elements.placeList.innerHTML = "";
  for (const place of state.current.places) {
    const row = document.createElement("article");
    row.className = "register-row place-row";
    row.innerHTML = `
      <input data-place-name="${place.id}" value="${escapeHtml(place.name)}" maxlength="48" aria-label="Namn på plats" />
      <span class="place-meta">${place.items.length} varor · ${place.shopping.length} inköp</span>
      <button class="icon-button" data-rename-place="${place.id}" type="button">Spara namn</button>
      <button class="icon-button ${place.id === state.current.activePlaceId ? "is-current" : ""}" data-activate-place="${place.id}" type="button">
        ${place.id === state.current.activePlaceId ? "Aktiv" : "Visa"}
      </button>
    `;
    elements.placeList.append(row);
  }
}

function renderAudit() {
  elements.audit.innerHTML = emptyMessage(state.current.audit.length, "Inga händelser ännu.");
  for (const event of state.current.audit.slice(0, 16)) {
    const row = document.createElement("li");
    row.innerHTML = `<time>${new Date(event.at).toLocaleString("sv-SE")}</time><span>${escapeHtml(event.text)}</span>`;
    elements.audit.append(row);
  }
}

function metric(label, value, icon) {
  const node = document.createElement("article");
  node.className = "status-tile metric";
  node.innerHTML = `<div class="status-tile__icon metric__icon">${icon}</div><div><span>${label}</span><strong>${value}</strong></div>`;
  return node;
}

function emptyMessage(count, text) {
  return count ? "" : `<p class="empty">${text}</p>`;
}

function announce(message, tone = "success") {
  elements.feedback.textContent = message;
  elements.feedback.dataset.tone = tone;
}

function renderPhotoPreview() {
  elements.itemPhotoPreview.hidden = !state.pendingPhotoDataUrl;
  elements.clearPhoto.hidden = !state.pendingPhotoDataUrl;
  elements.itemPhotoPreview.innerHTML = state.pendingPhotoDataUrl
    ? `<img src="${state.pendingPhotoDataUrl}" alt="Vald varubild" /><span>Bild vald</span>`
    : "";
}

async function startBarcodeScan() {
  if (!navigator.mediaDevices?.getUserMedia) {
    announce("Kameran kan inte öppnas i den här webbläsaren.", "error");
    return;
  }

  try {
    stopBarcodeScan();
    state.barcodeStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    elements.barcodeVideo.srcObject = state.barcodeStream;
    elements.barcodeScanner.hidden = false;
    clearScanResult();
    elements.barcodeStatus.textContent = "Kameran är aktiv.";
    elements.barcodeScannerStatus.textContent = "Startar skanning...";
    await elements.barcodeVideo.play();

    if ("BarcodeDetector" in window) {
      state.barcodeDetector = await createBarcodeDetector();
      elements.barcodeScannerStatus.textContent = "Rikta kameran mot streckkoden.";
      state.barcodeScanTimer = window.setInterval(scanBarcodeFrame, 350);
      return;
    }

    const fallbackStarted = await startZxingBarcodeScan();
    if (!fallbackStarted) {
      elements.barcodeScannerStatus.textContent = "Kameran är aktiv. Skriv koden manuellt om skanningen inte startar.";
      announce("Kameran är öppen, men automatisk streckkodsläsning kunde inte startas. Du kan skriva koden manuellt.", "error");
    }
  } catch {
    stopBarcodeScan();
    announce("Kunde inte starta kameran. Kontrollera kamerabehörighet och försök igen.", "error");
  }
}

async function createBarcodeDetector() {
  const Detector = window.BarcodeDetector;
  if (typeof Detector.getSupportedFormats !== "function") return new Detector({ formats: BARCODE_FORMATS });
  const supported = await Detector.getSupportedFormats();
  const formats = BARCODE_FORMATS.filter((format) => supported.includes(format));
  return formats.length > 0 ? new Detector({ formats }) : new Detector();
}

async function startZxingBarcodeScan() {
  const ZXingBrowser = await loadZxingBrowser();
  if (!ZXingBrowser?.BrowserMultiFormatReader || !state.barcodeStream) return false;

  try {
    state.zxingReader = new ZXingBrowser.BrowserMultiFormatReader();
    if (typeof state.zxingReader.decodeFromStream !== "function") return false;
    elements.barcodeScannerStatus.textContent = "Rikta streckkoden mot rutan.";
    state.zxingControls = await state.zxingReader.decodeFromStream(state.barcodeStream, elements.barcodeVideo, (result) => {
      const barcode = cleanBarcode(result?.getText?.() || result?.text);
      if (!barcode || state.barcodeBusy || barcodeInCooldown(barcode)) return;
      state.barcodeBusy = true;
      addScannedBarcode(barcode).finally(() => {
        state.barcodeBusy = false;
      });
    });
    return true;
  } catch {
    return false;
  }
}

async function loadZxingBrowser() {
  if (window.ZXingBrowser) return window.ZXingBrowser;
  if (!state.zxingLoadPromise) {
    state.zxingLoadPromise = loadScript(ZXING_BROWSER_URL).then(() => window.ZXingBrowser);
  }
  return state.zxingLoadPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing && window.ZXingBrowser) {
      resolve();
      return;
    }
    const script = existing || document.createElement("script");
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    if (!existing) {
      script.src = src;
      document.head.append(script);
    }
  });
}

async function scanBarcodeFrame() {
  if (state.barcodeBusy || !state.barcodeDetector || !elements.barcodeVideo.videoWidth) return;
  state.barcodeBusy = true;
  try {
    const matches = await state.barcodeDetector.detect(elements.barcodeVideo);
    const barcode = cleanBarcode(matches[0]?.rawValue);
    if (barcode && !barcodeInCooldown(barcode)) await addScannedBarcode(barcode);
  } catch {
    elements.barcodeScannerStatus.textContent = "Kunde inte läsa bilden. Håll streckkoden stilla i rutan.";
  } finally {
    state.barcodeBusy = false;
  }
}

async function addScannedBarcode(barcode) {
  markBarcodeScan(barcode);
  announce(`Streckkod ${barcode} hittad. Slår upp varan...`);
  elements.barcodeStatus.textContent = `Slår upp ${barcode}...`;
  elements.barcodeScannerStatus.textContent = "Hittad. Lägger till varan...";
  const product = await lookupProductByBarcode(barcode);
  const result = addItemToActivePlace(state.current, {
    name: product.name,
    category: product.category,
    quantity: 1,
    date: "",
    barcode,
    brand: product.brand,
    productImageUrl: product.imageUrl
  });
  const suffix = product.found ? "" : " Produktdata saknades, så streckkoden används som namn.";
  const message = result.merged ? `Ökade antalet för ${result.item.name} från streckkod.` : `Lade till ${result.item.name} från streckkod.${suffix}`;
  applyResult(result, result.error || message);
  if (!result.error) {
    state.lastScannedItemId = result.item.id;
    renderScanResult(result, product, barcode);
    renderRecentScanned();
    elements.barcodeStatus.textContent = "Tillagd. Redo för nästa vara.";
    elements.barcodeScannerStatus.textContent = "Tillagd. Rikta kameran mot nästa streckkod.";
  }
}

function barcodeInCooldown(barcode) {
  const scannedAt = state.recentBarcodeScans[barcode] || 0;
  return Date.now() - scannedAt < SCAN_COOLDOWN_MS;
}

function markBarcodeScan(barcode) {
  state.recentBarcodeScans[barcode] = Date.now();
}

function renderScanResult(result, product, barcode) {
  elements.scanResult.hidden = false;
  elements.scanResult.dataset.tone = result.merged ? "merged" : "added";
  elements.scanResult.querySelector(".scan-result__status").textContent = result.merged ? "Antal ökat" : "Tillagd";
  elements.scanResultTitle.textContent = result.item.name;
  elements.scanResultMeta.textContent = [result.item.brand, result.item.category, `EAN ${barcode}`].filter(Boolean).join(" · ");
  const imageUrl = result.item.photoDataUrl || result.item.productImageUrl || product.imageUrl;
  elements.scanResultImage.hidden = !imageUrl;
  elements.scanResultImage.src = imageUrl || "";
  elements.scanResultImage.alt = imageUrl ? `Bild av ${result.item.name}` : "";
}

function clearScanResult() {
  elements.scanResult.hidden = true;
  elements.scanResultTitle.textContent = "";
  elements.scanResultMeta.textContent = "";
  elements.scanResultImage.hidden = true;
  elements.scanResultImage.src = "";
  elements.scanResultImage.alt = "";
}

async function addManualBarcode() {
  const barcode = cleanBarcode(elements.manualBarcode.value);
  if (!barcode) {
    announce("Ange en giltig streckkod med 6-18 siffror.", "error");
    return;
  }
  elements.manualBarcode.value = "";
  await addScannedBarcode(barcode);
}

function stopBarcodeScan() {
  if (state.barcodeScanTimer) window.clearInterval(state.barcodeScanTimer);
  state.barcodeScanTimer = 0;
  state.barcodeBusy = false;
  if (state.zxingControls?.stop) state.zxingControls.stop();
  if (state.barcodeStream) {
    for (const track of state.barcodeStream.getTracks()) track.stop();
  }
  state.barcodeStream = null;
  state.barcodeDetector = null;
  state.zxingControls = null;
  state.zxingReader = null;
  state.recentBarcodeScans = {};
  elements.barcodeVideo.srcObject = null;
  elements.barcodeScanner.hidden = true;
  elements.barcodeStatus.textContent = "Kamera redo.";
  clearScanResult();
}

async function lookupProductByBarcode(barcode) {
  try {
    const url = `${OPEN_FOOD_FACTS_ENDPOINT}${encodeURIComponent(barcode)}.json?fields=${encodeURIComponent(OPEN_FOOD_FACTS_FIELDS)}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Lookup failed");
    const data = await response.json();
    const product = data?.product;
    const name = cleanText(product?.product_name_sv || product?.product_name || product?.generic_name || product?.brands);
    if (data?.status !== 1 || !name) return fallbackBarcodeProduct(barcode);
    return {
      found: true,
      name,
      brand: cleanText(product?.brands).split(",")[0] || "",
      category: inferCategory(product),
      imageUrl: firstValidProductImageUrl(product?.image_front_small_url, product?.image_small_url, product?.image_url)
    };
  } catch {
    return fallbackBarcodeProduct(barcode);
  }
}

function fallbackBarcodeProduct(barcode) {
  return {
    found: false,
    name: `Streckkod ${barcode}`,
    brand: "",
    category: "Annat",
    imageUrl: ""
  };
}

function firstValidProductImageUrl(...values) {
  return values.find(validProductImageUrl) || "";
}

function inferCategory(product) {
  const categoryText = `${product?.categories_tags?.join(" ") || ""} ${product?.categories || ""}`.toLocaleLowerCase("sv");
  if (/\bfrozen\b|fryst|frys/.test(categoryText)) return "Frys";
  if (/dair|milk|yogurt|cheese|meat|fish|fresh|kyld|kyl|mjölk|ost|yoghurt|kött|fisk/.test(categoryText)) return "Kyl";
  if (/pasta|rice|cereal|flour|bread|canned|jar|oil|snack|dry|skafferi|ris|mjöl|bröd|konserv/.test(categoryText)) return "Skafferi";
  return "Annat";
}

function clearPendingPhoto() {
  state.pendingPhotoDataUrl = "";
  elements.itemPhoto.value = "";
  renderPhotoPreview();
}

async function prepareItemPhoto(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

function itemPhotoMarkup(item) {
  const imageUrl = item.photoDataUrl || item.productImageUrl;
  return imageUrl
    ? `<img class="item-photo-thumb" src="${escapeHtml(imageUrl)}" alt="Bild av ${escapeHtml(item.name)}" loading="lazy" />`
    : '<span class="photo-empty" aria-label="Ingen bild">-</span>';
}

function itemMetaMarkup(item) {
  return [item.category, item.brand, item.barcode ? `EAN ${item.barcode}` : ""].filter(Boolean).map(escapeHtml).join(" &middot; ");
}

function renderRecentScanned() {
  const item =
    !state.barcodeStream && state.lastScannedItemId ? activePlace().items.find((candidate) => candidate.id === state.lastScannedItemId) : null;
  elements.recentScanned.hidden = !item;
  if (!item) {
    elements.recentScannedName.textContent = "";
    elements.recentScannedNameInput.value = "";
    elements.recentScannedCategory.value = "Annat";
    elements.recentScannedQuantity.value = "";
    elements.recentScannedDate.value = "";
    return;
  }
  elements.recentScannedName.textContent = item.name;
  elements.recentScannedNameInput.value = item.name;
  elements.recentScannedCategory.value = item.category;
  elements.recentScannedQuantity.value = item.quantity;
  elements.recentScannedDate.value = item.date || "";
}

function activePlace(nextState = state.current) {
  return nextState.places.find((place) => place.id === nextState.activePlaceId) || nextState.places[0];
}

function updateActivePlace(nextState, updater, auditText, now = new Date()) {
  const place = activePlace(nextState);
  const updatedPlace = updater(place);
  return {
    ...nextState,
    places: nextState.places.map((candidate) => (candidate.id === place.id ? updatedPlace : candidate)),
    audit: [{ at: now.toISOString(), text: `${updatedPlace.name}: ${auditText}` }, ...nextState.audit].slice(0, 120)
  };
}

function loadState(storage = window.localStorage) {
  const stored = storage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => storage.getItem(key)).find(Boolean);
  if (!stored) {
    const initial = createInitialState();
    saveState(initial, storage);
    return initial;
  }
  try {
    return normalizeState(JSON.parse(stored));
  } catch {
    const initial = createInitialState();
    saveState(initial, storage);
    return initial;
  }
}

function saveState(nextState, storage = window.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(nextState)));
}

function createInitialState() {
  const place = createPlace(DEFAULT_PLACE_NAME, {
    items: [
      { id: "demo-1", name: "Yoghurt", category: "Kyl", quantity: 1, date: toIsoDate(addDays(new Date(), 2)) },
      { id: "demo-2", name: "Morötter", category: "Kyl", quantity: 4, date: toIsoDate(addDays(new Date(), 5)) },
      { id: "demo-3", name: "Pasta", category: "Skafferi", quantity: 2, date: "" }
    ],
    shopping: [{ id: "shop-1", name: "Mjölk", checked: false, inInventory: false }]
  });
  return {
    activePlaceId: place.id,
    places: [place],
    audit: [{ at: new Date().toISOString(), text: "Startdata skapades lokalt i webbläsaren." }]
  };
}

function normalizeState(nextState) {
  if (!Array.isArray(nextState?.places)) {
    const migratedPlace = createPlace(DEFAULT_PLACE_NAME, {
      items: Array.isArray(nextState?.items) ? nextState.items : [],
      shopping: Array.isArray(nextState?.shopping) ? nextState.shopping : []
    });
    return {
      activePlaceId: migratedPlace.id,
      places: [migratedPlace],
      audit: Array.isArray(nextState?.audit) ? nextState.audit.slice(0, 120) : []
    };
  }

  const places = nextState.places.map(normalizePlace).filter(Boolean);
  if (places.length === 0) places.push(createPlace(DEFAULT_PLACE_NAME));
  const activePlaceId = places.some((place) => place.id === nextState.activePlaceId) ? nextState.activePlaceId : places[0].id;
  return {
    activePlaceId,
    places,
    audit: Array.isArray(nextState?.audit) ? nextState.audit.slice(0, 120) : []
  };
}

function createPlace(name, data = {}) {
  return {
    id: makeId("place"),
    name: cleanText(name) || DEFAULT_PLACE_NAME,
    items: Array.isArray(data.items) ? data.items.map(normalizeItem).filter(Boolean) : [],
    shopping: Array.isArray(data.shopping) ? data.shopping.map(normalizeShoppingItem).filter(Boolean) : []
  };
}

function normalizePlace(place) {
  const name = cleanText(place?.name);
  if (!name) return null;
  return {
    id: cleanText(place.id) || makeId("place"),
    name,
    items: Array.isArray(place.items) ? place.items.map(normalizeItem).filter(Boolean) : [],
    shopping: Array.isArray(place.shopping) ? place.shopping.map(normalizeShoppingItem).filter(Boolean) : []
  };
}

function addPlace(nextState, name, now = new Date()) {
  const placeName = cleanText(name);
  if (!placeName) return { state: nextState, error: "Ange ett namn på platsen." };
  const place = createPlace(placeName);
  return {
    state: {
      ...nextState,
      activePlaceId: place.id,
      places: [...nextState.places, place],
      audit: [{ at: now.toISOString(), text: `Lade till platsen ${place.name}.` }, ...nextState.audit].slice(0, 120)
    },
    place
  };
}

function renamePlace(nextState, placeId, name, now = new Date()) {
  const placeName = cleanText(name);
  if (!placeName) return { state: nextState, error: "Platsen måste ha ett namn." };
  const place = nextState.places.find((candidate) => candidate.id === placeId);
  if (!place) return { state: nextState, error: "Platsen finns inte längre." };
  return {
    state: {
      ...nextState,
      places: nextState.places.map((candidate) => (candidate.id === placeId ? { ...candidate, name: placeName } : candidate)),
      audit: [{ at: now.toISOString(), text: `Döpte om platsen ${place.name} till ${placeName}.` }, ...nextState.audit].slice(0, 120)
    }
  };
}

function addItemToActivePlace(nextState, input, now = new Date()) {
  const name = cleanText(input.name);
  if (!name) return { state: nextState, error: "Ange ett namn på varan." };
  const barcode = cleanBarcode(input.barcode);
  const quantity = clampQuantity(input.quantity);
  if (barcode) {
    const place = activePlace(nextState);
    const existingItem = place.items.find((candidate) => candidate.barcode === barcode);
    if (existingItem) {
      const nextQuantity = Math.min(99, existingItem.quantity + quantity);
      const mergedItem = {
        ...existingItem,
        quantity: nextQuantity,
        brand: existingItem.brand || cleanText(input.brand),
        productImageUrl:
          existingItem.productImageUrl || (validProductImageUrl(input.productImageUrl) ? input.productImageUrl : ""),
        photoDataUrl: existingItem.photoDataUrl || (validPhotoDataUrl(input.photoDataUrl) ? input.photoDataUrl : "")
      };
      return {
        state: updateActivePlace(
          nextState,
          (candidate) => ({
            ...candidate,
            items: candidate.items.map((item) => (item.id === existingItem.id ? mergedItem : item))
          }),
          `Ökade ${existingItem.name} till ${nextQuantity}.`,
          now
        ),
        item: mergedItem,
        merged: true
      };
    }
  }
  const item = {
    id: makeId("item", now),
    name,
    category: CATEGORIES.includes(input.category) ? input.category : "Annat",
    quantity,
    date: validIsoDate(input.date) ? input.date : "",
    barcode,
    brand: cleanText(input.brand),
    photoDataUrl: validPhotoDataUrl(input.photoDataUrl) ? input.photoDataUrl : "",
    productImageUrl: validProductImageUrl(input.productImageUrl) ? input.productImageUrl : ""
  };
  return {
    state: updateActivePlace(nextState, (place) => ({ ...place, items: [...place.items, item] }), `Lade till ${item.name}.`, now),
    item
  };
}

function markItemUsedInActivePlace(nextState, itemId, now = new Date()) {
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  const nextItems =
    item.quantity > 1
      ? place.items.map((candidate) => (candidate.id === itemId ? { ...candidate, quantity: candidate.quantity - 1 } : candidate))
      : place.items.filter((candidate) => candidate.id !== itemId);
  const action = item.quantity > 1 ? `Minskade ${item.name} med 1.` : `Markerade ${item.name} som använd.`;
  return { state: updateActivePlace(nextState, (candidate) => ({ ...candidate, items: nextItems }), action, now) };
}

function saveRecentScannedDate() {
  if (!state.lastScannedItemId) return;
  const result = updateItemDateInActivePlace(state.current, state.lastScannedItemId, elements.recentScannedDate.value);
  applyResult(result, result.error || `Sparade datum för ${result.item.name}.`);
  if (!result.error) renderRecentScanned();
}

function saveRecentScannedName() {
  if (!state.lastScannedItemId) return;
  const result = updateItemNameInActivePlace(state.current, state.lastScannedItemId, elements.recentScannedNameInput.value);
  applyResult(result, result.error || `Sparade namn för ${result.item.name}.`);
  if (!result.error) renderRecentScanned();
}

function saveRecentScannedCategory() {
  if (!state.lastScannedItemId) return;
  const result = updateItemCategoryInActivePlace(state.current, state.lastScannedItemId, elements.recentScannedCategory.value);
  applyResult(result, result.error || `Sparade kategori för ${result.item.name}.`);
  if (!result.error) renderRecentScanned();
}

function saveRecentScannedQuantity() {
  if (!state.lastScannedItemId) return;
  const result = updateItemQuantityInActivePlace(state.current, state.lastScannedItemId, elements.recentScannedQuantity.value);
  applyResult(result, result.error || `Sparade antal för ${result.item.name}.`);
  if (!result.error) renderRecentScanned();
}

function undoRecentScanned() {
  if (!state.lastScannedItemId) return;
  const result = removeItemUnitInActivePlace(state.current, state.lastScannedItemId);
  applyResult(result, result.error || "Ångrade senaste skanningen.");
  if (!result.error) {
    state.lastScannedItemId = result.removed ? "" : result.item.id;
    renderRecentScanned();
  }
}

function updateItemDateInActivePlace(nextState, itemId, date, now = new Date()) {
  if (!validIsoDate(date)) return { state: nextState, error: "Ange ett giltigt datum." };
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({
        ...candidate,
        items: candidate.items.map((candidateItem) => (candidateItem.id === itemId ? { ...candidateItem, date } : candidateItem))
      }),
      `Satte datum ${date} för ${item.name}.`,
      now
    ),
    item: { ...item, date }
  };
}

function updateItemCategoryInActivePlace(nextState, itemId, category, now = new Date()) {
  if (!CATEGORIES.includes(category)) return { state: nextState, error: "Välj en giltig kategori." };
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({
        ...candidate,
        items: candidate.items.map((candidateItem) => (candidateItem.id === itemId ? { ...candidateItem, category } : candidateItem))
      }),
      `Satte kategori ${category} för ${item.name}.`,
      now
    ),
    item: { ...item, category }
  };
}

function updateItemNameInActivePlace(nextState, itemId, name, now = new Date()) {
  const itemName = cleanText(name);
  if (!itemName) return { state: nextState, error: "Ange ett namn på varan." };
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({
        ...candidate,
        items: candidate.items.map((candidateItem) => (candidateItem.id === itemId ? { ...candidateItem, name: itemName } : candidateItem))
      }),
      `Döpte om ${item.name} till ${itemName}.`,
      now
    ),
    item: { ...item, name: itemName }
  };
}

function updateItemQuantityInActivePlace(nextState, itemId, quantity, now = new Date()) {
  const nextQuantity = clampQuantity(quantity);
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({
        ...candidate,
        items: candidate.items.map((candidateItem) => (candidateItem.id === itemId ? { ...candidateItem, quantity: nextQuantity } : candidateItem))
      }),
      `Satte antal ${nextQuantity} för ${item.name}.`,
      now
    ),
    item: { ...item, quantity: nextQuantity }
  };
}

function removeItemUnitInActivePlace(nextState, itemId, now = new Date()) {
  const place = activePlace(nextState);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state: nextState, error: "Varan finns inte längre i lagret." };
  const nextItems =
    item.quantity > 1
      ? place.items.map((candidate) => (candidate.id === itemId ? { ...candidate, quantity: candidate.quantity - 1 } : candidate))
      : place.items.filter((candidate) => candidate.id !== itemId);
  const action = item.quantity > 1 ? `Ångrade en registrering av ${item.name}.` : `Tog bort ${item.name}.`;
  return {
    state: updateActivePlace(nextState, (candidate) => ({ ...candidate, items: nextItems }), action, now),
    removed: item.quantity <= 1,
    item: { ...item, quantity: Math.max(0, item.quantity - 1) }
  };
}

function addShoppingItemToActivePlace(nextState, input, now = new Date()) {
  const name = cleanText(input.name);
  if (!name) return { state: nextState, error: "Ange vad som ska köpas." };
  const place = activePlace(nextState);
  const inInventory = place.items.some((item) => namesMatch(item.name, name));
  const shoppingItem = { id: makeId("shop", now), name, checked: false, inInventory };
  const auditText = inInventory
    ? `Lade ${name} på inköpslistan och hittade liknande vara.`
    : `Lade ${name} på inköpslistan.`;
  return {
    state: updateActivePlace(nextState, (candidate) => ({ ...candidate, shopping: [...candidate.shopping, shoppingItem] }), auditText, now),
    shoppingItem
  };
}

function toggleShoppingItemInActivePlace(nextState, shoppingId, now = new Date()) {
  const place = activePlace(nextState);
  const shoppingItem = place.shopping.find((item) => item.id === shoppingId);
  if (!shoppingItem) return { state: nextState, error: "Inköpsraden finns inte längre." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({ ...candidate, shopping: candidate.shopping.map((item) => (item.id === shoppingId ? { ...item, checked: !item.checked } : item)) }),
      `${shoppingItem.checked ? "Ångrade" : "Markerade"} ${shoppingItem.name} i inköpslistan.`,
      now
    )
  };
}

function removeShoppingItemFromActivePlace(nextState, shoppingId, now = new Date()) {
  const place = activePlace(nextState);
  const shoppingItem = place.shopping.find((item) => item.id === shoppingId);
  if (!shoppingItem) return { state: nextState, error: "Inköpsraden finns inte längre." };
  return {
    state: updateActivePlace(
      nextState,
      (candidate) => ({ ...candidate, shopping: candidate.shopping.filter((item) => item.id !== shoppingId) }),
      `Tog bort ${shoppingItem.name} från inköpslistan.`,
      now
    )
  };
}

function groupItemsByCategory(items) {
  return CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category).sort(compareItems)
  })).filter((group) => group.items.length > 0);
}

function soonItems(items, today = new Date(), horizonDays = 7) {
  return items
    .filter((item) => item.date)
    .map((item) => ({ ...item, daysLeft: daysBetween(today, item.date), status: itemStatus(item, today) }))
    .filter((item) => item.daysLeft <= horizonDays)
    .sort((a, b) => a.daysLeft - b.daysLeft || a.name.localeCompare(b.name, "sv"));
}

function itemStatus(item, today = new Date()) {
  if (!item.date) return { label: "Utan datum", tone: "neutral" };
  const daysLeft = daysBetween(today, item.date);
  if (daysLeft < 0) return { label: "Datum passerat", tone: "danger" };
  if (daysLeft <= 2) return { label: "Använd snart", tone: "warning" };
  if (daysLeft <= 7) return { label: "Planera in", tone: "notice" };
  return { label: "Lugnt läge", tone: "neutral" };
}

function generateSuggestions(items, today = new Date()) {
  const priorityItems = soonItems(items, today, 14);
  const base = priorityItems.length > 0 ? priorityItems : items;
  const pantry = items.filter((item) => item.category === "Skafferi");
  const freezer = items.filter((item) => item.category === "Frys");
  return base.slice(0, 4).map((priorityItem) => {
    const support = [pantry.find((item) => item.id !== priorityItem.id), freezer.find((item) => item.id !== priorityItem.id)]
      .filter(Boolean)
      .slice(0, 2);
    const names = [priorityItem, ...support].map((item) => item.name);
    return {
      id: `suggestion-${priorityItem.id}`,
      title: suggestionTitle(priorityItem),
      items: names,
      reason: priorityItem.date
        ? `${priorityItem.name} har ett närliggande planeringsdatum.`
        : `${priorityItem.name} finns redan på den valda platsen och kan användas först.`
    };
  });
}

function normalizeItem(item) {
  const name = cleanText(item?.name);
  if (!name) return null;
  return {
    id: cleanText(item.id) || makeId("item"),
    name,
    category: CATEGORIES.includes(item.category) ? item.category : "Annat",
    quantity: clampQuantity(item.quantity),
    date: validIsoDate(item.date) ? item.date : "",
    barcode: cleanBarcode(item.barcode),
    brand: cleanText(item.brand),
    photoDataUrl: validPhotoDataUrl(item.photoDataUrl) ? item.photoDataUrl : "",
    productImageUrl: validProductImageUrl(item.productImageUrl) ? item.productImageUrl : ""
  };
}

function normalizeShoppingItem(item) {
  const name = cleanText(item?.name);
  if (!name) return null;
  return {
    id: cleanText(item.id) || makeId("shop"),
    name,
    checked: Boolean(item.checked),
    inInventory: Boolean(item.inInventory)
  };
}

function compareItems(a, b) {
  if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.date && !b.date) return -1;
  if (!a.date && b.date) return 1;
  return a.name.localeCompare(b.name, "sv");
}

function namesMatch(a, b) {
  const left = cleanText(a).toLocaleLowerCase("sv");
  const right = cleanText(b).toLocaleLowerCase("sv");
  return left === right || left.includes(right) || right.includes(left);
}

function suggestionTitle(item) {
  if (item.category === "Kyl") return `Snabb vardagsrätt med ${item.name}`;
  if (item.category === "Frys") return `Tina och bygg middag kring ${item.name}`;
  if (item.category === "Skafferi") return `Basrätt där ${item.name} får bära måltiden`;
  return `Enkel måltidsidé med ${item.name}`;
}

function dateText(daysLeft) {
  if (daysLeft < 0) return `${Math.abs(daysLeft)} dagar efter datum`;
  if (daysLeft === 0) return "idag";
  if (daysLeft === 1) return "imorgon";
  return `om ${daysLeft} dagar`;
}

function daysBetween(today, isoDate) {
  const start = new Date(toIsoDate(today));
  const end = new Date(isoDate);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function toIsoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function clampQuantity(quantity) {
  const number = Number(quantity);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(99, Math.round(number)));
}

function cleanText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function validIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function validPhotoDataUrl(value) {
  return typeof value === "string" && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

function validProductImageUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && /(^|\.)openfoodfacts\.(org|net)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function cleanBarcode(value) {
  const barcode = String(value ?? "").trim().replace(/[\s-]/g, "");
  return /^[0-9]{6,18}$/.test(barcode) ? barcode : "";
}

function makeId(prefix, now = new Date()) {
  return `${prefix}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
