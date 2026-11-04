"use strict";

(() => {
  const header = document.querySelector(".header");
  const desktopNav = header?.querySelector("nav");
  if (!desktopNav) return;
  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open navigation menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "mobile-navigation");
  toggle.innerHTML = "<span></span><span></span><span></span>";
  header.append(toggle);
  const drawer = document.createElement("dialog");
  drawer.id = "mobile-navigation";
  drawer.className = "navigation-drawer";
  drawer.setAttribute("aria-label", "Navigation menu");
  const close = document.createElement("button");
  close.className = "menu-close";
  close.type = "button";
  close.setAttribute("aria-label", "Close navigation menu");
  close.textContent = "×";
  const logo = header.querySelector(".logo-slot").cloneNode(true);
  const nav = desktopNav.cloneNode(true);
  nav.setAttribute("aria-label", "Mobile navigation");
  drawer.append(close, logo, nav);
  document.body.append(drawer);
  toggle.addEventListener("click", () => {
    drawer.showModal();
    toggle.setAttribute("aria-expanded", "true");
  });
  close.addEventListener("click", () => drawer.close());
  drawer.addEventListener("click", (event) => {
    const rect = drawer.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      drawer.close();
    if (event.target.closest("nav a")) drawer.close();
  });
  drawer.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
  matchMedia("(min-width: 641px)").addEventListener("change", (event) => {
    if (event.matches && drawer.open) drawer.close();
  });
})();

(() => {
  if (!document.querySelector("#order-dialog")) return;

  const products = [
    {
      id: "pumpkin",
      name: "Pumpkin Spice",
      description:
        "A cozy fall favorite with creamy pumpkin spice filling and warm notes of cinnamon and autumn spices.",
      featured: true,
      image: "images/PUMPKIN.jpg",
    },
    {
      id: "cookies",
      name: "Cookies and Scream",
      description:
        "A spooky-sweet treat filled with cookies & cream goodness, perfect for your Halloween cravings.",
      featured: true,
      image: "images/CNC.jpg",
    },
    {
      id: "vanilla",
      name: "Madagascar Vanilla",
      description:
        "A classic favorite with silky vanilla cream and a delicate, sweet flavor with a timeless appeal.",
      image: "images/VANILLA.jpg",
    },
    {
      id: "auro",
      name: "Auro",
      description:
        "A rich and creamy chocolate filling made with smooth, decadent cocoa notes and a luxurious finish.",
      image: "images/AURO.jpeg",
    },
    {
      id: "ube",
      name: "Ube",
      description:
        "A Filipino-inspired favorite with a sweet, nutty ube cream and vibrant purple hue.",
      image: "images/UBE.jpg",
    },
    {
      id: "cookie-butter",
      name: "Cookie Butter",
      description:
        "A rich and creamy cookie butter filling with a sweet, caramelized biscuit flavor.",
      image: "images/BISCOFF.jpeg",
    },
    {
      id: "matcha",
      name: "Matcha",
      description:
        "A smooth and creamy matcha filling with a rich, earthy green tea flavor and delicate sweetness.",
      image: "images/MATCHA.png",
    },
  ];
  const cart = new Map();
  const dialog = document.querySelector("#order-dialog");
  const cartView = document.querySelector("#cart-view");
  const detailsView = document.querySelector("#details-view");
  const form = document.querySelector("#order-form");
  let pendingOrderId = null;
  let submitting = false;
  let toastTimer;

  function makePhoto(product) {
    const slot = document.createElement("div");
    slot.className = "photo-slot";
    if (product.image) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;
      slot.append(image);
    } else {
      slot.setAttribute("role", "img");
      slot.setAttribute("aria-label", `${product.name} photo`);
    }
    return slot;
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function renderProducts() {
    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const title = document.createElement("h3");
      title.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description;
      const add = document.createElement("button");
      add.type = "button";
      add.className = "add-button";
      add.textContent = "Add +";
      add.setAttribute("aria-label", `Add ${product.name} to cart`);
      add.addEventListener("click", () => {
        const quantity = cart.get(product.id) || 0;
        if (quantity >= 99) return showToast("Maximum 99 per flavor.");
        cart.set(product.id, quantity + 1);
        pendingOrderId = null;
        updateCount();
        showToast(`${product.name} added to cart`);
      });
      card.append(makePhoto(product), title, description, add);
      document
        .querySelector(
          product.featured ? "#featured-products" : "#menu-products",
        )
        .append(card);
    });
  }

  function updateCount() {
    const count = [...cart.values()].reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
    document.querySelector("#cart-count").textContent = count;
    document
      .querySelector("#open-cart")
      .setAttribute("aria-label", `Open cart, ${count} items`);
  }

  function renderCart() {
    const list = document.querySelector("#cart-items");
    list.replaceChildren();
    document.querySelector("#checkout").disabled = cart.size === 0;
    if (!cart.size) {
      const empty = document.createElement("p");
      empty.className = "empty-cart";
      empty.textContent = "Your cart is empty. Add a few puffs!";
      list.append(empty);
    }
    cart.forEach((quantity, id) => {
      const product = products.find((item) => item.id === id);
      const row = document.createElement("article");
      row.className = "cart-row";
      const summary = document.createElement("div");
      summary.className = "cart-product";
      const copy = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description;
      copy.append(name, description);
      summary.append(makePhoto(product), copy);
      const quantityBox = document.createElement("div");
      quantityBox.className = "quantity-box";
      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const label = document.createElement("span");
      label.className = "qty-label";
      label.textContent = "QTY.";
      const count = document.createElement("span");
      count.textContent = quantity;
      const minus = quantityButton("−", `Decrease ${product.name}`, () =>
        changeQuantity(id, -1),
      );
      const plus = quantityButton("+", `Increase ${product.name}`, () =>
        changeQuantity(id, 1),
      );
      plus.disabled = quantity >= 99;
      controls.append(label, minus, count, plus);
      const remove = quantityButton("Remove", `Remove ${product.name}`, () => {
        cart.delete(id);
        pendingOrderId = null;
        updateCount();
        renderCart();
      });
      remove.className = "remove";
      quantityBox.append(controls, remove);
      row.append(summary, quantityBox);
      list.append(row);
    });
  }

  function quantityButton(text, label, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", action);
    return button;
  }

  function changeQuantity(id, difference) {
    const next = (cart.get(id) || 0) + difference;
    if (next > 99) return;
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    pendingOrderId = null;
    updateCount();
    renderCart();
  }

  function showCart() {
    cartView.hidden = false;
    detailsView.hidden = true;
    dialog.setAttribute("aria-labelledby", "dialog-title");
    renderCart();
  }

  function openCart() {
    showCart();
    dialog.showModal();
  }
  document.querySelector("#open-cart").addEventListener("click", openCart);
  document
    .querySelector("#close-cart")
    .addEventListener("click", () => dialog.close());
  document.querySelector("#back-to-cart").addEventListener("click", showCart);
  document.querySelector("#checkout").addEventListener("click", () => {
    if (!cart.size) return;
    cartView.hidden = true;
    detailsView.hidden = false;
    const title = detailsView.querySelector("h2");
    title.id = "details-title";
    dialog.setAttribute("aria-labelledby", title.id);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.querySelector("#pickup").min = now.toISOString().slice(0, 16);
    document.querySelector("#customer-name").focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !cart.size || !form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const status = document.querySelector("#form-status");
    if (!fields.customerName.trim() || new Date(fields.pickup) <= new Date()) {
      status.textContent =
        "Please enter your name and choose a future pickup time.";
      return;
    }
    // The cart and form work locally. Saving requires the Apps Script deployment.
    if (!window.google?.script?.run) {
      status.textContent =
        "Orders are not connected yet. Open the deployed Google Apps Script web app to submit your order.";
      return;
    }
    submitting = true;
    pendingOrderId ||= crypto.randomUUID();
    const payload = {
      ...fields,
      orderId: pendingOrderId,
      pickup: new Date(fields.pickup).toISOString(),
      items: [...cart].map(([id, quantity]) => ({ id, quantity })),
    };
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    document.querySelector("#back-to-cart").disabled = true;
    status.textContent = "Placing your order…";
    try {
      const result = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .placeOrder(payload);
      });
      if (!result?.success)
        throw new Error("Could not confirm the order. Please try again.");
      cart.clear();
      updateCount();
      form.reset();
      pendingOrderId = null;
      status.textContent = `Thank you! Your order reference is ${result.orderId}.`;
    } catch (error) {
      status.textContent =
        error.message || "Could not save your order. Please try again.";
    } finally {
      submitting = false;
      submit.disabled = false;
      document.querySelector("#back-to-cart").disabled = false;
    }
  });
  dialog.addEventListener("cancel", (event) => {
    if (submitting) event.preventDefault();
  });

  renderProducts();
})();
