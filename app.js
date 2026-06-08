const API_URL = "https://script.google.com/macros/s/AKfycby9w3l5iWe4YvdlO8B1wwQHwDgiSE1y8FKDOTPOD4cKbFhX9sJYw00rhLaKvRXk-iFzhQ/exec";

let groceries = [];
let selectedIndex = 0;

async function loadGroceries() {
  const status = document.getElementById("status");

  try {
    const response = await fetch(API_URL);
    groceries = await response.json();

    status.textContent = "";
    render();
  } catch (error) {
    status.textContent = "Error loading list";
    console.error(error);
  }
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let lastStore = "";
  let lastAisle = "";

  groceries.forEach((grocery, index) => {
    if (grocery.store !== lastStore) {
      const store = document.createElement("div");
      store.className = "store";
      store.textContent = grocery.store.toUpperCase();
      list.appendChild(store);
      lastStore = grocery.store;
      lastAisle = "";
    }

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
    if (grocery.done) item.classList.add("done");

    item.textContent = `${grocery.qty} x ${grocery.item}`;
    list.appendChild(item);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    selectedIndex = Math.min(selectedIndex + 1, groceries.length - 1);
    render();
  }

  if (event.key === "ArrowUp") {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    render();
  }

  if (event.key === "Enter") {
    markPurchased(groceries[selectedIndex]);
    }
});

async function markPurchased(grocery) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        listId: grocery.listId,
        status: "Purchased"
      })
    });

    groceries.splice(selectedIndex, 1);

    if (selectedIndex >= groceries.length) {
      selectedIndex = groceries.length - 1;
    }

    render();

  } catch (error) {
    console.error("Error updating item", error);
  }
}

loadGroceries();