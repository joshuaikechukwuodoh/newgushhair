/**
 * Main Application Logic for Guss Hairs
 */
import { createOrder, fetchProducts, Product } from './api';
import { addToCart, updateQuantity, removeFromCart, getCart, generateWhatsAppLink, calculateTotal } from './cart';
import { renderProducts, renderCart, showNotification } from './ui';

const WHATSAPP_NUMBER = "+2347013339219"; // Updated vendor number with country code

async function init() {
  const productGrid = document.getElementById('product-grid')!;
  const loadingState = document.getElementById('loading')!;
  const cartToggle = document.getElementById('cart-toggle')!;
  const cartModal = document.getElementById('cart-modal')!;
  const cartClose = document.getElementById('cart-close')!;
  const cartOverlay = document.getElementById('cart-overlay')!;
  const cartPanel = document.getElementById('cart-panel')!;
  const cartItemsContainer = document.getElementById('cart-items')!;
  const cartCount = document.getElementById('cart-count')!;
  const checkoutBtn = document.getElementById('checkout-btn')!;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
  const homeLink = document.getElementById('home-link')!;
  const shopAllLink = document.getElementById('shop-all-link')!;
  const aboutLink = document.getElementById('about-link')!;
  const logoLink = document.getElementById('logo-link')!;
  const heroSection = document.getElementById('hero-section')!;
  const shopSection = document.getElementById('shop-section')!;
  const aboutSection = document.getElementById('about-section')!;
  const contactLink = document.getElementById('contact-link')!;
  const contactSection = document.getElementById('contact-section')!;
  const contactForm = document.getElementById('contact-form') as HTMLFormElement;

  // Mobile Menu Elements
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle')!;
  const mobileMenu = document.getElementById('mobile-menu')!;
  const mobileMenuContent = document.getElementById('mobile-menu-content')!;
  const mobileMenuClose = document.getElementById('mobile-menu-close')!;
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const accordionBtns = document.querySelectorAll('.mobile-menu-accordion-btn');

  let allProducts: Product[] = [];

  const showShop = () => {
    aboutSection.classList.add('hidden');
    contactSection.classList.add('hidden');
    heroSection.classList.remove('hidden');
    shopSection.classList.remove('hidden');
  };

  const showAbout = () => {
    heroSection.classList.add('hidden');
    shopSection.classList.add('hidden');
    contactSection.classList.add('hidden');
    aboutSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showContact = () => {
    heroSection.classList.add('hidden');
    shopSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    contactSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFilteredProducts = (category: string) => {
    showShop();
    const filtered = category === 'All Products' 
      ? allProducts 
      : allProducts.filter(p => p.category === category);
    
    renderProducts(filtered, productGrid, (product: Product) => {
      addToCart(product);
      updateUI();
      showNotification(`${product.name} added to cart!`);
    });
  };

  // 1. Fetch and Render Products
  try {
    allProducts = await fetchProducts();
    loadingState.classList.add('hidden');
    productGrid.classList.remove('hidden');
    
    // Initial render
    renderFilteredProducts('All Products');

    // Filter listener
    categoryFilter.addEventListener('change', (e) => {
      const selectedCategory = (e.target as HTMLSelectElement).value;
      renderFilteredProducts(selectedCategory);
    });

    // Shop All link listener
    shopAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      categoryFilter.value = 'All Products';
      renderFilteredProducts('All Products');
      document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Home link listener
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      categoryFilter.value = 'All Products';
      renderFilteredProducts('All Products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // About link listener
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAbout();
    });

    // Contact link listener
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      showContact();
    });

    // Contact form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      showNotification(`Thank you ${name}! Your message has been sent.`);
      contactForm.reset();
    });

    // Logo link listener
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      categoryFilter.value = 'All Products';
      renderFilteredProducts('All Products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Wig sub-category listeners
    document.querySelectorAll('.wig-sub-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showShop();
        const type = (e.currentTarget as HTMLElement).getAttribute('data-wig-type');
        
        categoryFilter.value = 'Wigs';
        
        if (type === 'All') {
          renderFilteredProducts('Wigs');
        } else {
          const filtered = allProducts.filter(p => p.category === 'Wigs' && p.subCategory === type);
          renderProducts(filtered, productGrid, (product: Product) => {
            addToCart(product);
            updateUI();
            showNotification(`${product.name} added to cart!`);
          });
        }
        
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Bundle sub-category listeners
    document.querySelectorAll('.bundle-sub-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showShop();
        const type = (e.currentTarget as HTMLElement).getAttribute('data-bundle-type');
        
        categoryFilter.value = 'Bundles';
        
        if (type === 'All') {
          renderFilteredProducts('Bundles');
        } else {
          const filtered = allProducts.filter(p => p.category === 'Bundles' && p.subCategory === type);
          renderProducts(filtered, productGrid, (product: Product) => {
            addToCart(product);
            updateUI();
            showNotification(`${product.name} added to cart!`);
          });
        }
        
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

  } catch (error) {
    console.error("Failed to load products", error);
    loadingState.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load products. Please refresh.</p>`;
  }

  // 2. Cart Modal Logic
  const openCart = () => {
    cartModal.classList.remove('hidden');
    setTimeout(() => {
      cartOverlay.classList.remove('opacity-0');
      cartPanel.classList.remove('translate-x-full');
    }, 10);
    updateUI();
  };

  const closeCart = () => {
    cartOverlay.classList.add('opacity-0');
    cartPanel.classList.add('translate-x-full');
    setTimeout(() => {
      cartModal.classList.add('hidden');
    }, 500);
  };

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // 3. Mobile Menu Logic
  const openMobileMenu = () => {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenu.classList.remove('opacity-0');
      mobileMenuContent.classList.remove('-translate-x-full');
    }, 10);
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.add('opacity-0');
    mobileMenuContent.classList.add('-translate-x-full');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 300);
  };

  mobileMenuToggle.addEventListener('click', openMobileMenu);
  mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  // Accordion Logic
  accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling as HTMLElement;
      const icon = btn.querySelector('svg')!;
      
      const isOpen = !content.classList.contains('hidden');
      
      // Close all other accordions (optional, but cleaner)
      accordionBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.nextElementSibling?.classList.add('hidden');
          otherBtn.querySelector('svg')?.classList.remove('rotate-180');
        }
      });

      if (isOpen) {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
      } else {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
      }
    });
  });

  // Mobile Nav Link Logic
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (e.currentTarget as HTMLElement).getAttribute('data-target');
      const wigType = (e.currentTarget as HTMLElement).getAttribute('data-wig-type');
      const bundleType = (e.currentTarget as HTMLElement).getAttribute('data-bundle-type');

      closeMobileMenu();

      if (target === 'home') {
        categoryFilter.value = 'All Products';
        renderFilteredProducts('All Products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'shop') {
        categoryFilter.value = 'All Products';
        renderFilteredProducts('All Products');
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'about') {
        showAbout();
      } else if (target === 'contact') {
        showContact();
      } else if (wigType) {
        showShop();
        categoryFilter.value = 'Wigs';
        if (wigType === 'All') {
          renderFilteredProducts('Wigs');
        } else {
          const filtered = allProducts.filter(p => p.category === 'Wigs' && p.subCategory === wigType);
          renderProducts(filtered, productGrid, (product: Product) => {
            addToCart(product);
            updateUI();
            showNotification(`${product.name} added to cart!`);
          });
        }
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (bundleType) {
        showShop();
        categoryFilter.value = 'Bundles';
        if (bundleType === 'All') {
          renderFilteredProducts('Bundles');
        } else {
          const filtered = allProducts.filter(p => p.category === 'Bundles' && p.subCategory === bundleType);
          renderProducts(filtered, productGrid, (product: Product) => {
            addToCart(product);
            updateUI();
            showNotification(`${product.name} added to cart!`);
          });
        }
        document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 4. UI Update Helper
  function updateUI() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count.toString();
    
    renderCart(
      cartItemsContainer,
      (id, action) => {
        updateQuantity(id, action);
        updateUI();
      },
      (id) => {
        removeFromCart(id);
        updateUI();
      }
    );
  }

  // 4. Checkout Logic
  checkoutBtn.addEventListener('click', async () => {
    const cart = getCart();
    if (cart.length === 0) {
      showNotification("Your cart is empty!");
      return;
    }

    const customerName = window.prompt("Enter your name");
    if (!customerName) return;

    const customerPhone = window.prompt("Enter your phone number") || undefined;
    const customerAddress = window.prompt("Enter your delivery address") || undefined;

    try {
      await createOrder({
        customerName,
        customerPhone,
        customerAddress,
        totalAmount: String(calculateTotal()),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      showNotification("Order saved. Opening WhatsApp...");
    } catch (error) {
      console.error("Failed to save order", error);
      showNotification("Could not save order, opening WhatsApp.");
    }

    const link = generateWhatsAppLink(WHATSAPP_NUMBER);
    if (link) {
      window.open(link, '_blank');
    }
  });

  // 5. Hero Slider Logic
  const slidesWrapper = document.getElementById('hero-slides-wrapper');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  let currentSlide = 0;
  let slideInterval: any;

  const goToSlide = (index: number) => {
    if (slidesWrapper) {
      slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    }

    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active', 'bg-white');
        dot.classList.remove('bg-white/30');
      } else {
        dot.classList.remove('active', 'bg-white');
        dot.classList.add('bg-white/30');
      }
    });

    currentSlide = index;
  };

  const nextSlideFunc = () => {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    goToSlide(next);
  };

  const prevSlideFunc = () => {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    goToSlide(prev);
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    slideInterval = setInterval(nextSlideFunc, 5000);
  };

  const stopAutoPlay = () => {
    if (slideInterval) clearInterval(slideInterval);
  };

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlideFunc();
      startAutoPlay();
    });
    prevBtn.addEventListener('click', () => {
      prevSlideFunc();
      startAutoPlay();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startAutoPlay();
    });
  });

  // Initialize slider
  if (slides.length > 0) {
    goToSlide(0);
    startAutoPlay();
  }

  // Initial UI sync
  updateUI();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
