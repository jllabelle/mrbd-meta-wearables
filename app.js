const API_URL = "https://script.google.com/macros/s/AKfycby9w3l5iWe4YvdlO8B1wwQHwDgiSE1y8FKDOTPOD4cKbFhX9sJYw00rhLaKvRXk-iFzhQ/exec";

let groceries = [];
let screen = "stores";
let selectedIndex = 0;
let selectedStore = null;

async function loadGroceries() {
  const status = document.getElementById("status");

  try {
    status.textContent = "Loading...";
    const response = await fetch(API_URL);
    groceries = await response.json();

    status.textContent = "";
    selectedIndex = 0;
    render();
  } catch (error) {
    status.textContent = "Error loading list";
    console.error(error);
  }
}

function getStores() {
  const storeMap = {};

  groceries.forEach((grocery) => {
    if (!storeMap[grocery.store]) {
      storeMap[grocery.store] = 0;
    }
    storeMap[grocery.store]++;
  });

  return Object.keys(storeMap).map((store) => ({
    store,
    count: storeMap[store],
  }));
}

function render() {
  if (screen === "stores") {
    renderStores();
  } else {
    renderShoppingList();
  }
}

function renderStores() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  document.querySelector("h1").textContent = "Choose Store";

  const stores = getStores();

  stores.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "item";
    if (index === selectedIndex) item.classList.add("selected");

    item.textContent = `${entry.store} (${entry.count})`;
    list.appendChild(item);
  });
}

function renderShoppingList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  document.querySelector("h1").textContent = selectedStore;

  const storeItems = groceries.filter((g) => g.store === selectedStore);

  let lastAisle = "";

  storeItems.forEach((grocery, index) => {
    if (grocery.aisle !== lastAisle) {
      const aisle = document.createElement("div");
      aisle.className = "aisle";
      aisle.textContent = grocery.aisle.toUpperCase();
      list.appendChild(aisle);
      lastAisle = grocery.aisle;
    }

    const item = document.createElement("div");
    item.className = "item";
    if (index === selectedIndex) item.classList.add("selected");

    item.textContent = `${grocery.qty} x ${grocery.item}`;
    list.appendChild(item);
  });
}

async function markBought(grocery) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        listId: grocery.listId,
        status: "Bought",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      alert("Update failed: " + result.error);
      return;
    }

    await loadGroceries();

    screen = "shopping";
    selectedIndex = 0;
    render();

  } catch (error) {
    console.error("Error updating item", error);
    alert("Error updating item");
  }
}

document.addEventListener("keydown", async (event) => {
  if (event.key === "r" || event.key === "R") {
    await loadGroceries();
    return;
  }

  if (screen === "stores") {
    const stores = getStores();

    if (event.key === "ArrowDown") {
      selectedIndex = Math.min(selectedIndex + 1, stores.length - 1);
      render();
    }

    if (event.key === "ArrowUp") {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      render();
    }

    if (event.key === "Enter") {
      selectedStore = stores[selectedIndex].store;
      screen = "shopping";
      selectedIndex = 0;
      render();
    }

    return;
  }

  if (screen === "shopping") {
    const storeItems = groceries.filter((g) => g.store === selectedStore);

    if (event.key === "Backspace") {
      screen = "stores";
      selectedIndex = 0;
      selectedStore = null;
      render();
      return;
    }

    if (event.key === "ArrowDown") {
      selectedIndex = Math.min(selectedIndex + 1, storeItems.length - 1);
      render();
    }

    if (event.key === "ArrowUp") {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      render();
    }

    if (event.key === "Enter") {
      await markBought(storeItems[selectedIndex]);
    }
  }
});

loadGroceries();