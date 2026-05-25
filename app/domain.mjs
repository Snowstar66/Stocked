export const STORAGE_KEY = "stocked.state.v1";
export const LEGACY_STORAGE_KEYS = ["matsvinnskollen.state.v1"];
export const CATEGORIES = ["Kyl", "Frys", "Skafferi", "Annat"];
export const DEFAULT_PLACE_NAME = "Hem";

export function createInitialState(now = new Date()) {
  const place = createPlace(DEFAULT_PLACE_NAME, {
    items: [
      { id: "demo-1", name: "Yoghurt", category: "Kyl", quantity: 1, date: toIsoDate(addDays(now, 2)) },
      { id: "demo-2", name: "Morötter", category: "Kyl", quantity: 4, date: toIsoDate(addDays(now, 5)) },
      { id: "demo-3", name: "Pasta", category: "Skafferi", quantity: 2, date: "" }
    ],
    shopping: [{ id: "shop-1", name: "Mjölk", checked: false, inInventory: false }]
  });
  return {
    activePlaceId: place.id,
    places: [place],
    audit: [{ at: now.toISOString(), text: "Startdata skapades lokalt i webbläsaren." }]
  };
}

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return createInitialState();
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

export function saveState(state, storage = globalThis.localStorage) {
  if (!storage) return state;
  storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  return state;
}

export function normalizeState(state) {
  if (!Array.isArray(state?.places)) {
    const migratedPlace = createPlace(DEFAULT_PLACE_NAME, {
      items: Array.isArray(state?.items) ? state.items : [],
      shopping: Array.isArray(state?.shopping) ? state.shopping : []
    });
    return {
      activePlaceId: migratedPlace.id,
      places: [migratedPlace],
      audit: Array.isArray(state?.audit) ? state.audit.slice(0, 120) : []
    };
  }

  const places = state.places.map(normalizePlace).filter(Boolean);
  if (places.length === 0) places.push(createPlace(DEFAULT_PLACE_NAME));
  return {
    activePlaceId: places.some((place) => place.id === state.activePlaceId) ? state.activePlaceId : places[0].id,
    places,
    audit: Array.isArray(state?.audit) ? state.audit.slice(0, 120) : []
  };
}

export function activePlace(state) {
  return state.places.find((place) => place.id === state.activePlaceId) || state.places[0];
}

export function createPlace(name, data = {}) {
  return {
    id: makeId("place"),
    name: cleanText(name) || DEFAULT_PLACE_NAME,
    items: Array.isArray(data.items) ? data.items.map(normalizeItem).filter(Boolean) : [],
    shopping: Array.isArray(data.shopping) ? data.shopping.map(normalizeShoppingItem).filter(Boolean) : []
  };
}

export function addPlace(state, name, now = new Date()) {
  const placeName = cleanText(name);
  if (!placeName) return { state, error: "Ange ett namn på platsen." };
  const place = createPlace(placeName);
  return {
    state: {
      ...state,
      activePlaceId: place.id,
      places: [...state.places, place],
      audit: [{ at: now.toISOString(), text: `Lade till platsen ${place.name}.` }, ...state.audit].slice(0, 120)
    },
    place
  };
}

export function renamePlace(state, placeId, name, now = new Date()) {
  const placeName = cleanText(name);
  if (!placeName) return { state, error: "Platsen måste ha ett namn." };
  const place = state.places.find((candidate) => candidate.id === placeId);
  if (!place) return { state, error: "Platsen finns inte längre." };
  return {
    state: {
      ...state,
      places: state.places.map((candidate) => (candidate.id === placeId ? { ...candidate, name: placeName } : candidate)),
      audit: [{ at: now.toISOString(), text: `Döpte om platsen ${place.name} till ${placeName}.` }, ...state.audit].slice(0, 120)
    }
  };
}

export function addItem(state, input, now = new Date()) {
  const name = cleanText(input.name);
  if (!name) return { state, error: "Ange ett namn på varan." };
  const barcode = cleanBarcode(input.barcode);
  const quantity = clampQuantity(input.quantity);
  if (barcode) {
    const place = activePlace(state);
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
          state,
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
    state: updateActivePlace(state, (place) => ({ ...place, items: [...place.items, item] }), `Lade till ${item.name}.`, now),
    item
  };
}

export function markItemUsed(state, itemId, now = new Date()) {
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  const nextItems =
    item.quantity > 1
      ? place.items.map((candidate) => (candidate.id === itemId ? { ...candidate, quantity: candidate.quantity - 1 } : candidate))
      : place.items.filter((candidate) => candidate.id !== itemId);
  const action = item.quantity > 1 ? `Minskade ${item.name} med 1.` : `Markerade ${item.name} som använd.`;
  return { state: updateActivePlace(state, (candidate) => ({ ...candidate, items: nextItems }), action, now) };
}

export function removeItemUnit(state, itemId, now = new Date()) {
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  const nextItems =
    item.quantity > 1
      ? place.items.map((candidate) => (candidate.id === itemId ? { ...candidate, quantity: candidate.quantity - 1 } : candidate))
      : place.items.filter((candidate) => candidate.id !== itemId);
  const action = item.quantity > 1 ? `Ångrade en registrering av ${item.name}.` : `Tog bort ${item.name}.`;
  return {
    state: updateActivePlace(state, (candidate) => ({ ...candidate, items: nextItems }), action, now),
    removed: item.quantity <= 1,
    item: { ...item, quantity: Math.max(0, item.quantity - 1) }
  };
}

export function updateItemDate(state, itemId, date, now = new Date()) {
  if (!validIsoDate(date)) return { state, error: "Ange ett giltigt datum." };
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      state,
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

export function updateItemCategory(state, itemId, category, now = new Date()) {
  if (!CATEGORIES.includes(category)) return { state, error: "Välj en giltig kategori." };
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      state,
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

export function updateItemName(state, itemId, name, now = new Date()) {
  const itemName = cleanText(name);
  if (!itemName) return { state, error: "Ange ett namn på varan." };
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      state,
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

export function updateItemQuantity(state, itemId, quantity, now = new Date()) {
  const nextQuantity = clampQuantity(quantity);
  const place = activePlace(state);
  const item = place.items.find((candidate) => candidate.id === itemId);
  if (!item) return { state, error: "Varan finns inte längre i lagret." };
  return {
    state: updateActivePlace(
      state,
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

export function addShoppingItem(state, input, now = new Date()) {
  const name = cleanText(input.name);
  if (!name) return { state, error: "Ange vad som ska köpas." };
  const place = activePlace(state);
  const inInventory = place.items.some((item) => namesMatch(item.name, name));
  const shoppingItem = { id: makeId("shop", now), name, checked: false, inInventory };
  const auditText = inInventory
    ? `Lade ${name} på inköpslistan och hittade liknande vara.`
    : `Lade ${name} på inköpslistan.`;
  return {
    state: updateActivePlace(state, (candidate) => ({ ...candidate, shopping: [...candidate.shopping, shoppingItem] }), auditText, now),
    shoppingItem
  };
}

export function toggleShoppingItem(state, shoppingId, now = new Date()) {
  const place = activePlace(state);
  const shoppingItem = place.shopping.find((item) => item.id === shoppingId);
  if (!shoppingItem) return { state, error: "Inköpsraden finns inte längre." };
  return {
    state: updateActivePlace(
      state,
      (candidate) => ({ ...candidate, shopping: candidate.shopping.map((item) => (item.id === shoppingId ? { ...item, checked: !item.checked } : item)) }),
      `${shoppingItem.checked ? "Ångrade" : "Markerade"} ${shoppingItem.name} i inköpslistan.`,
      now
    )
  };
}

export function removeShoppingItem(state, shoppingId, now = new Date()) {
  const place = activePlace(state);
  const shoppingItem = place.shopping.find((item) => item.id === shoppingId);
  if (!shoppingItem) return { state, error: "Inköpsraden finns inte längre." };
  return {
    state: updateActivePlace(
      state,
      (candidate) => ({ ...candidate, shopping: candidate.shopping.filter((item) => item.id !== shoppingId) }),
      `Tog bort ${shoppingItem.name} från inköpslistan.`,
      now
    )
  };
}

export function clearAllData(now = new Date()) {
  return createInitialState(now);
}

export function groupItemsByCategory(items) {
  return CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category).sort(compareItems)
  })).filter((group) => group.items.length > 0);
}

export function soonItems(items, today = new Date(), horizonDays = 7) {
  return items
    .filter((item) => item.date)
    .map((item) => ({ ...item, daysLeft: daysBetween(today, item.date), status: itemStatus(item, today) }))
    .filter((item) => item.daysLeft <= horizonDays)
    .sort((a, b) => a.daysLeft - b.daysLeft || a.name.localeCompare(b.name, "sv"));
}

export function itemStatus(item, today = new Date()) {
  if (!item.date) return { label: "Utan datum", tone: "neutral" };
  const daysLeft = daysBetween(today, item.date);
  if (daysLeft < 0) return { label: "Datum passerat", tone: "danger" };
  if (daysLeft <= 2) return { label: "Använd snart", tone: "warning" };
  if (daysLeft <= 7) return { label: "Planera in", tone: "notice" };
  return { label: "Lugnt läge", tone: "neutral" };
}

export function generateSuggestions(items, today = new Date()) {
  const soon = soonItems(items, today, 14);
  const pantry = items.filter((item) => item.category === "Skafferi");
  const freezer = items.filter((item) => item.category === "Frys");
  const base = soon.length > 0 ? soon : items;
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
        : `${priorityItem.name} finns redan hemma och kan användas först.`
    };
  });
}

export function daysBetween(today, isoDate) {
  const start = new Date(toIsoDate(today));
  const end = new Date(isoDate);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function toIsoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function updateActivePlace(state, updater, auditText, now = new Date()) {
  const place = activePlace(state);
  const updatedPlace = updater(place);
  return {
    ...state,
    places: state.places.map((candidate) => (candidate.id === place.id ? updatedPlace : candidate)),
    audit: [{ at: now.toISOString(), text: `${updatedPlace.name}: ${auditText}` }, ...state.audit].slice(0, 120)
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
