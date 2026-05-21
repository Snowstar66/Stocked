import assert from "node:assert/strict";
import {
  activePlace,
  addItem,
  addPlace,
  addShoppingItem,
  clearAllData,
  createInitialState,
  generateSuggestions,
  groupItemsByCategory,
  markItemUsed,
  normalizeState,
  renamePlace,
  soonItems,
  toggleShoppingItem
} from "../app/domain.mjs";

const today = new Date("2026-05-19T08:00:00.000Z");

{
  const state = createInitialState(today);
  assert.equal(state.places.length, 1);
  assert.equal(activePlace(state).name, "Hem");
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
  const result = addItem(emptyPlace, { name: "  Filmjölk  ", category: "Kyl", quantity: 2, date: "2026-05-20" }, today);
  assert.equal(result.error, undefined);
  assert.equal(activePlace(result.state).items[0].name, "Filmjölk");
  assert.equal(activePlace(result.state).items[0].quantity, 2);
  assert.equal(activePlace(result.state).items[0].category, "Kyl");
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
  const toggled = toggleShoppingItem(result.state, result.shoppingItem.id, today);
  assert.equal(activePlace(toggled.state).shopping[0].checked, true);
}

{
  const state = createInitialState(today);
  assert.ok(generateSuggestions(activePlace(state).items, today).length > 0);
  const cleared = clearAllData(today);
  assert.equal(cleared.places.length, 1);
  assert.equal(activePlace(cleared).name, "Hem");
}

console.log("Alla domäntester passerade.");
