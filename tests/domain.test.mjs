import assert from "node:assert/strict";
import {
  activePlace,
  addItem,
  addPlace,
  addShoppingItem,
  clearAllData,
  createInitialState,
  groupItemsByCategory,
  LEGACY_STORAGE_KEYS,
  loadState,
  markItemUsed,
  normalizeState,
  renamePlace,
  removeItemUnit,
  soonItems,
  STORAGE_KEY,
  moveShoppingItemToInventory,
  updateItemCategory,
  updateItemDate,
  updateItemName,
  updateItemQuantity
} from "../app/domain.mjs";

const today = new Date("2026-05-19T08:00:00.000Z");

{
  const state = createInitialState(today);
  assert.equal(state.places.length, 1);
  assert.equal(activePlace(state).name, "Hem");
}

{
  const legacyState = createInitialState(today);
  const storage = new Map([[LEGACY_STORAGE_KEYS[0], JSON.stringify(legacyState)]]);
  const fakeStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  };
  const loaded = loadState(fakeStorage);
  assert.equal(STORAGE_KEY, "stocked.state.v1");
  assert.equal(activePlace(loaded).name, "Hem");
}

{
  const migrated = normalizeState({
    items: [{ id: "1", name: "Filmjölk", category: "Kyl", quantity: 2, date: "2026-05-20" }],
    shopping: [],
    audit: []
  });
  assert.equal(migrated.places.length, 1);
  assert.equal(activePlace(migrated).items[0].name, "Filmjölk");
}

{
  let state = createInitialState(today);
  const added = addPlace(state, "Sommarstuga", today);
  assert.equal(added.error, undefined);
  state = added.state;
  assert.equal(state.places.length, 2);
  assert.equal(activePlace(state).name, "Sommarstuga");

  const renamed = renamePlace(state, state.activePlaceId, "Stugan", today);
  assert.equal(activePlace(renamed.state).name, "Stugan");
}

{
  const emptyPlace = addPlace(createInitialState(today), "Källare", today).state;
  const photoDataUrl = "data:image/jpeg;base64,aGVq";
  const result = addItem(
    emptyPlace,
    {
      name: "  Filmjölk  ",
      category: "Kyl",
      quantity: 2,
      date: "2026-05-20",
      barcode: " 0731-234 567 ",
      brand: " Arla ",
      photoDataUrl,
      productImageUrl: "https://images.openfoodfacts.org/images/products/073/123/456/7/front_sv.3.200.jpg"
    },
    today
  );
  assert.equal(result.error, undefined);
  assert.equal(activePlace(result.state).items[0].name, "Filmjölk");
  assert.equal(activePlace(result.state).items[0].quantity, 2);
  assert.equal(activePlace(result.state).items[0].category, "Kyl");
  assert.equal(activePlace(result.state).items[0].barcode, "0731234567");
  assert.equal(activePlace(result.state).items[0].brand, "Arla");
  assert.equal(activePlace(result.state).items[0].photoDataUrl, photoDataUrl);
  assert.equal(
    activePlace(result.state).items[0].productImageUrl,
    "https://images.openfoodfacts.org/images/products/073/123/456/7/front_sv.3.200.jpg"
  );

  const scannedAgain = addItem(result.state, { name: "Filmjölk", category: "Kyl", quantity: 3, barcode: "0731234567" }, today);
  assert.equal(scannedAgain.merged, true);
  assert.equal(activePlace(scannedAgain.state).items.length, 1);
  assert.equal(activePlace(scannedAgain.state).items[0].quantity, 5);

  const missingDetails = normalizeState({
    activePlaceId: "p1",
    places: [{ id: "p1", name: "Hem", items: [{ id: "1", name: "Pasta", category: "Skafferi", quantity: 1, date: "", barcode: "12345678" }], shopping: [] }],
    audit: []
  });
  const enriched = addItem(
    missingDetails,
    {
      name: "Pasta",
      category: "Skafferi",
      quantity: 1,
      barcode: "12345678",
      brand: "Barilla",
      productImageUrl: "https://images.openfoodfacts.org/images/products/123/456/78/front.3.200.jpg"
    },
    today
  );
  assert.equal(enriched.merged, true);
  assert.equal(activePlace(enriched.state).items[0].quantity, 2);
  assert.equal(activePlace(enriched.state).items[0].brand, "Barilla");
  assert.equal(activePlace(enriched.state).items[0].productImageUrl, "https://images.openfoodfacts.org/images/products/123/456/78/front.3.200.jpg");
}

{
  const state = normalizeState({
    activePlaceId: "p1",
    places: [
      {
        id: "p1",
        name: "Hem",
        items: [
          { id: "1", name: "Bildvara", category: "Kyl", quantity: 1, date: "", photoDataUrl: "data:image/png;base64,aGVq" },
          {
            id: "2",
            name: "Felbild",
            category: "Kyl",
            quantity: 1,
            date: "",
            brand: "Okänt",
            barcode: "abc123",
            photoDataUrl: "javascript:alert(1)",
            productImageUrl: "https://example.com/image.jpg"
          }
        ],
        shopping: []
      }
    ],
    audit: []
  });
  assert.equal(activePlace(state).items[0].photoDataUrl, "data:image/png;base64,aGVq");
  assert.equal(activePlace(state).items[1].photoDataUrl, "");
  assert.equal(activePlace(state).items[1].barcode, "");
  assert.equal(activePlace(state).items[1].brand, "Okänt");
  assert.equal(activePlace(state).items[1].productImageUrl, "");
}

{
  const state = normalizeState({
    activePlaceId: "p1",
    places: [
      {
        id: "p1",
        name: "Hem",
        items: [
          { id: "1", name: "Pasta", category: "Skafferi", quantity: 1, date: "" },
          { id: "2", name: "Yoghurt", category: "Kyl", quantity: 1, date: "2026-05-20" },
          { id: "3", name: "Ägg", category: "Kyl", quantity: 6, date: "2026-05-22" }
        ],
        shopping: []
      }
    ],
    audit: []
  });
  assert.deepEqual(
    soonItems(activePlace(state).items, today).map((item) => item.name),
    ["Yoghurt", "Ägg"]
  );
  assert.equal(groupItemsByCategory(activePlace(state).items)[0].category, "Kyl");
}

{
  const state = normalizeState({
    activePlaceId: "p1",
    places: [{ id: "p1", name: "Hem", items: [{ id: "1", name: "Morötter", category: "Kyl", quantity: 2, date: "2026-05-21" }], shopping: [] }],
    audit: []
  });
  const result = markItemUsed(state, "1", today);
  assert.equal(activePlace(result.state).items[0].quantity, 1);
  const dated = updateItemDate(result.state, "1", "2026-05-24", today);
  assert.equal(dated.error, undefined);
  assert.equal(activePlace(dated.state).items[0].date, "2026-05-24");
  const clearedDate = updateItemDate(dated.state, "1", "", today);
  assert.equal(clearedDate.error, undefined);
  assert.equal(activePlace(clearedDate.state).items[0].date, "");
  const badDate = updateItemDate(dated.state, "1", "nästa vecka", today);
  assert.equal(badDate.error, "Ange ett giltigt datum.");
  const categorized = updateItemCategory(dated.state, "1", "Frys", today);
  assert.equal(categorized.error, undefined);
  assert.equal(activePlace(categorized.state).items[0].category, "Frys");
  const badCategory = updateItemCategory(categorized.state, "1", "Garage", today);
  assert.equal(badCategory.error, "Välj en giltig kategori.");
  const renamed = updateItemName(categorized.state, "1", "  Morötter eko  ", today);
  assert.equal(renamed.error, undefined);
  assert.equal(activePlace(renamed.state).items[0].name, "Morötter eko");
  const badName = updateItemName(renamed.state, "1", "   ", today);
  assert.equal(badName.error, "Ange ett namn på varan.");
  const requantified = updateItemQuantity(renamed.state, "1", 12, today);
  assert.equal(requantified.error, undefined);
  assert.equal(activePlace(requantified.state).items[0].quantity, 12);
  const clampedQuantity = updateItemQuantity(requantified.state, "1", 120, today);
  assert.equal(activePlace(clampedQuantity.state).items[0].quantity, 99);
  const decremented = removeItemUnit(state, "1", today);
  assert.equal(decremented.removed, false);
  assert.equal(activePlace(decremented.state).items[0].quantity, 1);
  const removedByUndo = removeItemUnit(dated.state, "1", today);
  assert.equal(removedByUndo.removed, true);
  assert.equal(activePlace(removedByUndo.state).items.length, 0);
  const removed = markItemUsed(result.state, "1", today);
  assert.equal(activePlace(removed.state).items.length, 0);
}

{
  const state = normalizeState({
    activePlaceId: "p1",
    places: [{ id: "p1", name: "Hem", items: [{ id: "1", name: "Mjölk", category: "Kyl", quantity: 1, date: "2026-05-21" }], shopping: [] }],
    audit: []
  });
  const result = addShoppingItem(state, { name: "mjölk" }, today);
  assert.equal(result.shoppingItem.inInventory, true);
  const moved = moveShoppingItemToInventory(result.state, result.shoppingItem.id, today);
  assert.equal(activePlace(moved.state).shopping.length, 0);
  assert.equal(activePlace(moved.state).items[0].quantity, 2);
}

{
  const state = normalizeState({
    activePlaceId: "p1",
    places: [{ id: "p1", name: "Hem", items: [], shopping: [{ id: "s1", name: "Banan", checked: false, inInventory: false }] }],
    audit: []
  });
  const moved = moveShoppingItemToInventory(state, "s1", today);
  assert.equal(activePlace(moved.state).shopping.length, 0);
  assert.equal(activePlace(moved.state).items[0].name, "Banan");
  assert.equal(activePlace(moved.state).items[0].quantity, 1);
}

{
  const state = createInitialState(today);
  const cleared = clearAllData(today);
  assert.equal(cleared.places.length, 1);
  assert.equal(activePlace(cleared).name, "Hem");
}

console.log("Alla domäntester passerade.");
