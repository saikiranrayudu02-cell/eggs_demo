'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    packSize: number;
    eggType: string;
    imageUrl: string;
    stock: number;
    lowStockThreshold: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation to details page
    if (!user) {
      showToast('Please login to place an order.', 'warning');
      return;
    }
    if (isOutOfStock) return;
    
    setLoading(true);
    await addToCart(product.id, 1);
    setLoading(false);
  };

  // Convert egg type to display text
  const eggTypeLabel = product.eggType.charAt(0) + product.eggType.slice(1).toLowerCase();

  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      {/* Product Image */}
      <div className={styles.imageContainer}>
        {/* Mocked Egg SVG drawing instead of broken uploader images */}
        <div className={styles.mockImageBg}>
          <div className={`${styles.eggIcon} ${styles[product.eggType.toLowerCase()]}`}>🥚</div>
        </div>

        {/* Stock Badges */}
        {isOutOfStock && <span className={`${styles.badge} ${styles.outOfStock}`}>Out of Stock</span>}
        {!isOutOfStock && isLowStock && <span className={`${styles.badge} ${styles.lowStock}`}>Low Stock ({product.stock})</span>}
        <span className={styles.categoryBadge}>{eggTypeLabel}</span>
      </div>

      {/* Product Info */}
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>
        
        <div className={styles.meta}>
          <span className={styles.packSize}>Pack of {product.packSize}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.currency}>₹</span>
            <span className={styles.price}>{product.price}</span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || loading}
            className={`${styles.addBtn} ${isOutOfStock ? styles.disabled : ''}`}
            aria-label="Add to Cart"
          >
            {loading ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
