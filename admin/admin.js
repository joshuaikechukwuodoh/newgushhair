import { genUploader } from "uploadthing/client";

const TOKEN_KEY = "guss_admin_token";

let token = localStorage.getItem(TOKEN_KEY);
let productsCache = [];
const { uploadFiles } = genUploader({ url: "/api/uploadthing" });

const queryProcedures = new Set([
  "admin.alreadyExists",
  "admin.getAdmins",
  "admin.getAdminById",
  "getItems",
  "getItemById",
  "getOrders",
  "getSettings",
]);

const loginOverlay = document.getElementById("login-overlay");
const appContainer = document.getElementById("app-container");
const authError = document.getElementById("auth-error");
const setupBtn = document.getElementById("setup-btn");
const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");

async function trpc(procedure, input, protectedCall = false) {
  const isQuery = queryProcedures.has(procedure);
  const url = new URL(`/trpc/${procedure}`, window.location.origin);
  if (isQuery && input !== undefined) {
    url.searchParams.set("input", JSON.stringify(input));
  }

  const headers = { "Content-Type": "application/json" };
  if (protectedCall && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, isQuery
    ? { method: "GET", headers: protectedCall ? headers : undefined }
    : {
        method: "POST",
        headers,
        body: input === undefined ? undefined : JSON.stringify(input),
      });
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || "API request failed");
  }
  return payload.result?.data;
}

function showApp() {
  loginOverlay.classList.add("hidden");
  appContainer.classList.remove("hidden");
}

function showLogin(message = "") {
  loginOverlay.classList.remove("hidden");
  appContainer.classList.add("hidden");
  if (message) {
    authError.textContent = message;
    authError.classList.remove("hidden");
  }
}

async function refreshAdminSetupState() {
  try {
    const exists = await trpc("admin.alreadyExists", {});
    setupBtn.classList.toggle("hidden", exists);
  } catch {
    setupBtn.classList.add("hidden");
  }
}

async function login() {
  authError.classList.add("hidden");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const result = await trpc("admin.login", { email, password });
  token = result.token;
  localStorage.setItem(TOKEN_KEY, token);
  showApp();
  await initDashboard();
}

async function createFirstAdmin() {
  authError.classList.add("hidden");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  await trpc("admin.register", { email, password });
  showToast("Admin created. Sign in now.");
  await refreshAdminSetupState();
}

document.getElementById("login-btn").onclick = () => login().catch((error) => showLogin(error.message));
setupBtn.onclick = () => createFirstAdmin().catch((error) => showLogin(error.message));
document.getElementById("logout-btn").onclick = () => {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  showLogin();
};

window.showSection = (sectionId) => {
  document.querySelectorAll("section").forEach((section) => section.classList.add("hidden"));
  document.getElementById(`section-${sectionId}`).classList.remove("hidden");
  document.querySelectorAll(".sidebar-item").forEach((item) => item.classList.remove("active"));
  document.getElementById(`nav-${sectionId}`).classList.add("active");
};

async function initDashboard() {
  const [products, orders, settings] = await Promise.all([
    trpc("getItems"),
    trpc("getOrders", undefined, true),
    trpc("getSettings"),
  ]);

  productsCache = products;
  document.getElementById("stat-products").innerText = String(products.length);
  document.getElementById("stat-orders").innerText = String(orders.length);
  document.getElementById("stat-pending").innerText = String(orders.filter((order) => order.status === "Pending").length);
  renderProducts(products);
  renderOrders(orders);
  renderSettings(settings);
}

window.openProductModal = (id = null) => {
  productForm.reset();
  document.getElementById("prod-id").value = id || "";
  document.getElementById("modal-title").innerText = id ? "Edit Product" : "Add New Product";
  document.getElementById("prod-file").value = "";
  updateProdPreview("");

  if (id) {
    const product = productsCache.find((item) => item.id === id);
    if (product) {
      document.getElementById("prod-name").value = product.name || "";
      document.getElementById("prod-price").value = product.price || "";
      document.getElementById("prod-category").value = product.category || "Wigs";
      document.getElementById("prod-imageUrl").value = product.image || "";
      document.getElementById("prod-description").value = product.description || "";
      updateProdPreview(product.image || "");
    }
  }

  productModal.classList.remove("hidden");
};

window.closeProductModal = () => productModal.classList.add("hidden");

productForm.onsubmit = async (event) => {
  event.preventDefault();
  const id = document.getElementById("prod-id").value;
  const data = {
    name: document.getElementById("prod-name").value,
    price: String(document.getElementById("prod-price").value),
    category: document.getElementById("prod-category").value,
    image: document.getElementById("prod-imageUrl").value,
    description: document.getElementById("prod-description").value,
  };

  try {
    if (id) {
      await trpc("updateItem", { id, ...data }, true);
      showToast("Product updated");
    } else {
      await trpc("createItem", data, true);
      showToast("Product added");
    }
    closeProductModal();
    await initDashboard();
  } catch (error) {
    showToast(error.message);
  }
};

window.deleteProduct = async (id) => {
  if (!confirm("Delete this product?")) return;
  await trpc("deleteItem", { id }, true);
  showToast("Product deleted");
  await initDashboard();
};

function renderProducts(products) {
  const tbody = document.getElementById("products-table-body");
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-neutral-400 italic">No products found.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map((product) => `
    <tr class="hover:bg-neutral-50 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center gap-4">
          <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer">
          <div><p class="font-bold">${product.name}</p><p class="text-xs text-neutral-400 line-clamp-1">${product.description}</p></div>
        </div>
      </td>
      <td class="px-6 py-4"><span class="px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold">${product.category}</span></td>
      <td class="px-6 py-4 font-bold">NGN ${Number(product.price || 0).toLocaleString()}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <button onclick="openProductModal('${product.id}')" class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">Edit</button>
          <button onclick="deleteProduct('${product.id}')" class="p-2 hover:bg-red-50 text-red-600 rounded-lg">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.updateOrderStatus = async (id, status) => {
  await trpc("updateOrderStatus", { id, status }, true);
  showToast(`Order ${status}`);
  await initDashboard();
};

function renderOrders(orders) {
  const tbody = document.getElementById("orders-table-body");
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-neutral-400 italic">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((order) => `
    <tr class="hover:bg-neutral-50 transition-colors">
      <td class="px-6 py-4 font-medium">${order.customerName}</td>
      <td class="px-6 py-4">${Array.isArray(order.items) ? `${order.items.length} item(s)` : "Order"} - NGN ${Number(order.totalAmount || 0).toLocaleString()}</td>
      <td class="px-6 py-4">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${order.status === "Pending" ? "bg-amber-100 text-amber-600" : order.status === "Delivered" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}">
          ${order.status}
        </span>
      </td>
      <td class="px-6 py-4">
        <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-xs font-bold bg-neutral-100 border-none rounded-lg px-2 py-1 outline-none">
          <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function renderSettings(settings = {}) {
  document.getElementById("set-siteName").value = settings?.siteName || "";
  document.getElementById("set-whatsapp").value = settings?.whatsapp || "";
  document.getElementById("set-email").value = settings?.email || "";
  document.getElementById("set-address").value = settings?.address || "";
  document.getElementById("set-heroImage").value = settings?.heroImage || "";
  document.getElementById("set-bannerText").value = settings?.bannerText || "";
  document.getElementById("set-advertText").value = settings?.advertText || "";
  updateHeroPreview(settings?.heroImage || "");

  const bannersContainer = document.getElementById("banners-container");
  bannersContainer.innerHTML = "";
  const banners = Array.isArray(settings?.banners) && settings.banners.length > 0 ? settings.banners : [{}];
  banners.forEach((banner) => addBannerRow(banner.text || "", banner.imageUrl || ""));
}

window.addBannerRow = (text = "", url = "") => {
  const container = document.getElementById("banners-container");
  const div = document.createElement("div");
  div.className = "banner-row flex gap-2 items-start bg-neutral-50 p-3 rounded-xl border border-neutral-100";
  div.innerHTML = `
    <div class="flex-1 space-y-2">
      <input class="banner-text w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg outline-none" placeholder="Banner Text" value="${text}">
      <input class="banner-url w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg outline-none" placeholder="Image URL" value="${url}">
    </div>
    <button onclick="this.parentElement.remove()" class="p-2 text-neutral-400 hover:text-red-500">Remove</button>
  `;
  container.appendChild(div);
};

window.saveSettings = async () => {
  const bannerRows = document.querySelectorAll(".banner-row");
  const banners = Array.from(bannerRows).map((row) => ({
    text: row.querySelector(".banner-text").value,
    imageUrl: row.querySelector(".banner-url").value,
  })).filter((banner) => banner.imageUrl || banner.text);

  await trpc("updateSettings", {
    siteName: document.getElementById("set-siteName").value,
    whatsapp: document.getElementById("set-whatsapp").value,
    email: document.getElementById("set-email").value,
    address: document.getElementById("set-address").value,
    heroImage: document.getElementById("set-heroImage").value,
    bannerText: document.getElementById("set-bannerText").value,
    advertText: document.getElementById("set-advertText").value,
    banners,
  }, true);
  showToast("Settings saved");
};

async function uploadImageToUploadThing(file) {
  if (!token) {
    throw new Error("Sign in before uploading images");
  }

  const [uploaded] = await uploadFiles("imageUploader", {
    files: [file],
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return uploaded?.ufsUrl || uploaded?.url || uploaded?.serverData?.url;
}

function handleFileUpload(fileInput, urlInput, callback = null) {
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast("Image too large (max 4MB)");
      fileInput.value = "";
      return;
    }

    try {
      showToast("Uploading image...");
      const imageUrl = await uploadImageToUploadThing(file);
      if (!imageUrl) throw new Error("Upload completed without an image URL");

      urlInput.value = imageUrl;
      if (callback) callback(imageUrl);
      showToast("Image uploaded");
    } catch (error) {
      showToast(error.message || "Image upload failed");
    } finally {
      fileInput.value = "";
    }
  };
}

function updateHeroPreview(url) {
  const preview = document.getElementById("hero-preview");
  const container = document.getElementById("hero-preview-container");
  if (url) {
    preview.src = url;
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
  }
}

function updateProdPreview(url) {
  const preview = document.getElementById("prod-preview");
  const container = document.getElementById("prod-preview-container");
  if (url) {
    preview.src = url;
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
  }
}

handleFileUpload(document.getElementById("prod-file"), document.getElementById("prod-imageUrl"), updateProdPreview);
handleFileUpload(document.getElementById("set-file"), document.getElementById("set-heroImage"), updateHeroPreview);
document.getElementById("set-heroImage").oninput = (event) => updateHeroPreview(event.target.value);
document.getElementById("prod-imageUrl").oninput = (event) => updateProdPreview(event.target.value);

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3000);
}

if (token) {
  showApp();
  initDashboard().catch((error) => {
    localStorage.removeItem(TOKEN_KEY);
    token = null;
    showLogin(error.message);
  });
} else {
  refreshAdminSetupState();
}
