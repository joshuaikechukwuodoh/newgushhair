/**
 * Cart Logic for Guss Hairs
 */
import { Product } from './api';

export interface CartItem extends Product {
  quantity: number;
}

let cart: CartItem[] = JSON.parse(localStorage.getItem('guss_hairs_cart') || '[]');

export function getCart(): CartItem[] {
  return cart;
}

export function saveCart() {
  localStorage.setItem('guss_hairs_cart', JSON.stringify(cart));
}

export function addToCart(product: Product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
}

export function removeFromCart(productId: string) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

export function updateQuantity(productId: string, action: 'inc' | 'dec') {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (action === 'inc') {
      item.quantity += 1;
    } else if (action === 'dec' && item.quantity > 1) {
      item.quantity -= 1;
    } else if (action === 'dec' && item.quantity === 1) {
      removeFromCart(productId);
    }
  }
  saveCart();
}

export function calculateTotal(): number {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function clearCart() {
  cart = [];
  saveCart();
}

export function generateWhatsAppLink(phoneNumber: string): string {
  if (cart.length === 0) return '';

  let message = "Hello Guss Hairs, I want to order:\n\n";
  cart.forEach(item => {
    message += `- ${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}\n`;
  });
  message += `\n*Grand Total: ₦${calculateTotal().toLocaleString()}*`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
