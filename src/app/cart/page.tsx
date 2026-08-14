'use client';

import React from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import styles from './Cart.module.css';

export default function CartPage() {
  const { user } = useAuth();
  const { items, summary, loading, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  const handleQtyChange = async (productId: number, currentQty: number, change: number, stockLimit: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      // Remove item
      await removeItem(productId);
      return;
    }
    if (newQty > stockLimit) {
      showToast(`Cannot increase. Only ${stockLimit} packs available in stock.`, 'warning');
      return;
    }
    await updateQuantity(productId, newQty);
  };

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Shopping Cart</h1>

        {!user ? (
          <div className={styles.authPrompt}>
            <div className={styles.lockIcon}>🔒</div>
            <h3>Please Log In</h3>
            <p>You must be signed in to view your shopping cart and place orders.</p>
            <Link href="/login" className={styles.loginBtn}>Sign In Now</Link>
          </div>
        ) : loading && items.length === 0 ? (
          <div className={styles.loadingWrapper}>
            <div className={`${styles.skeletonRow} skeleton`}></div>
            <div className={`${styles.skeletonRow} skeleton`}></div>
            <div className={`${styles.skeletonRow} skeleton`}></div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any fresh farm eggs to your cart yet.</p>
            <Link href="/products" className={styles.shopBtn}>Shop Fresh Eggs</Link>
          </div>
        ) : (
          <div className={styles.mainGrid}>
            {/* Cart Items List */}
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  {/* Egg category mock image visual */}
                  <div className={styles.itemVisual}>
                    <span className={`${styles.eggIcon} ${styles[item.eggType.toLowerCase()]}`}>🥚</span>
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemMeta}>Pack of {item.packSize} Eggs • ₹{item.price} each</p>
                  </div>

                  {/* Quantity controls */}
                  <div className={styles.qtyBox}>
                    <button 
                      onClick={() => handleQtyChange(item.productId, item.quantity, -1, item.stock)}
                      className={styles.qtyBtn}
                    >
                      -
                    </button>
                    <span className={styles.qtyText}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.productId, item.quantity, 1, item.stock)}
                      className={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>

                  {/* Total price for this item */}
                  <div className={styles.totalBox}>
                    <span className={styles.totalPrice}>₹{item.price * item.quantity}</span>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className={styles.removeBtn}
                    aria-label="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary Section */}
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{summary.subtotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>
                    {summary.deliveryFee === 0 ? (
                      <span className={styles.freeDelivery}>FREE</span>
                    ) : (
                      `₹${summary.deliveryFee}`
                    )}
                  </span>
                </div>
                {summary.deliveryFee > 0 && (
                  <p className={styles.deliveryPromo}>
                    💡 Add <strong>₹{300 - summary.subtotal}</strong> more for <strong>FREE Delivery</strong>!
                  </p>
                )}
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span>-₹{summary.discount}</span>
                </div>
                <hr />
                <div className={`${styles.summaryRow} ${styles.finalRow}`}>
                  <span>Grand Total</span>
                  <span>₹{summary.total}</span>
                </div>
              </div>

              <Link href="/checkout" className={styles.checkoutBtn}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>

              <Link href="/products" className={styles.continueLink}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
