/**
 * UI Rendering for Guss Hairs
 */
import { Product } from './api';
import { CartItem, calculateTotal, getCart } from './cart';

export function renderProducts(products: Product[], container: HTMLElement, onAddToCart: (p: Product) => void) {
  let html = '';
  products.forEach((product, index) => {
    html += `
      <div class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
        <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerpolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">${product.name}</h3>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">${product.description}</p>
          <div class="mt-auto flex items-center justify-between">
            <span class="text-xl font-serif font-bold italic text-gray-900">₦${product.price.toLocaleString()}</span>
            <button 
              data-id="${product.id}"
              class="add-to-cart-btn bg-black text-white px-4 py-2 rounded-full text-sm font-serif font-bold italic hover:bg-gray-800 active:scale-95 transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    // Insert banner every 6 products (if not the last one)
    if ((index + 1) % 6 === 0 && index !== products.length - 1) {
      const bannerIndex = (index + 1) / 6;
      const bannerContent = [
        {
          title: "Join the Royalty Club",
          desc: "Subscribe to our newsletter and get exclusive access to new arrivals and secret sales.",
          btn: "Join Now",
          image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1200"
        },
        {
          title: "Premium Bundle Deals",
          desc: "Save up to 15% when you buy 3 or more bundles. Quality hair that lasts for years.",
          btn: "Shop Deals",
          image: "https://images.unsplash.com/photo-1516914915600-896acb9c0373?auto=format&fit=crop&q=80&w=1200"
        },
        {
          title: "Custom Wig Services",
          desc: "Get your dream wig hand-crafted by our expert stylists. Perfect fit guaranteed.",
          btn: "Book Service",
          image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=1200"
        }
      ][(bannerIndex - 1) % 3];

      html += `
        <div class="col-span-full my-12">
          <div class="product-banner relative h-64 md:h-80 rounded-[2rem] overflow-hidden bg-black text-white flex items-center justify-center group/banner shadow-2xl">
            <img src="${bannerContent.image}" class="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover/banner:scale-110" referrerpolicy="no-referrer" />
            <div class="absolute inset-0 banner-gradient z-[5]"></div>
            <div class="relative z-10 text-center px-8">
              <span class="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-serif font-bold italic uppercase tracking-widest mb-4">Special Promotion</span>
              <h3 class="text-3xl md:text-5xl font-script mb-4">${bannerContent.title}</h3>
              <p class="text-sm md:text-lg font-serif font-bold italic text-gray-300 max-w-xl mx-auto">${bannerContent.desc}</p>
              <button class="mt-8 px-10 py-4 bg-white text-black rounded-full text-sm font-serif font-bold italic hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">${bannerContent.btn}</button>
            </div>
          </div>
        </div>
      `;
    }
  });
  container.innerHTML = html;

  // Add event listeners
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id') || '';
      const product = products.find(p => p.id === id);
      if (product) onAddToCart(product);
    });
  });
}

export function renderCart(
  container: HTMLElement, 
  onUpdateQty: (id: string, action: 'inc' | 'dec') => void,
  onRemove: (id: string) => void
) {
  const cart = getCart();
  const total = calculateTotal();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p class="text-gray-500 mt-1">Looks like you haven't added any hair yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="space-y-4">
      ${cart.map(item => `
        <div class="flex items-center gap-4 py-4 border-bottom border-gray-100 last:border-0">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" referrerpolicy="no-referrer" />
          <div class="flex-grow">
            <h4 class="font-medium text-gray-900">${item.name}</h4>
            <p class="text-sm font-serif font-bold italic text-gray-500">₦${item.price.toLocaleString()}</p>
          </div>
          <div class="flex items-center gap-2">
            <button data-id="${item.id}" class="qty-dec w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">-</button>
            <span class="w-6 text-center font-medium">${item.quantity}</span>
            <button data-id="${item.id}" class="qty-inc w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">+</button>
          </div>
          <div class="text-right min-w-[80px]">
            <p class="font-serif font-bold italic">₦${(item.price * item.quantity).toLocaleString()}</p>
            <button data-id="${item.id}" class="remove-item text-xs font-serif font-bold italic text-red-500 hover:underline mt-1">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mt-8 pt-6 border-t border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <span class="text-gray-500 font-serif font-bold italic">Grand Total</span>
        <span class="text-2xl font-serif font-bold italic text-gray-900">₦${total.toLocaleString()}</span>
      </div>
    </div>
  `;

  // Event listeners
  container.querySelectorAll('.qty-inc').forEach(btn => {
    btn.addEventListener('click', () => onUpdateQty(btn.getAttribute('data-id')!, 'inc'));
  });
  container.querySelectorAll('.qty-dec').forEach(btn => {
    btn.addEventListener('click', () => onUpdateQty(btn.getAttribute('data-id')!, 'dec'));
  });
  container.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => onRemove(btn.getAttribute('data-id')!));
  });
}

export function showNotification(message: string) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-2';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    <span class="text-sm font-medium">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
