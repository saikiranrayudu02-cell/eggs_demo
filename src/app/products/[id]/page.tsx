'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, MessageSquare } from 'lucide-react';
import styles from './ProductDetails.module.css';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      if (json.success) {
        setProduct(json.data);
      } else {
        showToast('Product not found', 'error');
        router.push('/products');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please log in to purchase products.', 'warning');
      return;
    }
    if (!product || product.stock <= 0) return;

    setAdding(true);
    const ok = await addToCart(product.id, quantity);
    setAdding(false);
    if (ok) {
      setQuantity(1); // Reset
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to post a review.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Review submitted successfully!', 'success');
        setReviewComment('');
        // Reload details to show the new review
        fetchProductDetails();
      } else {
        showToast(json.message || 'Failed to submit review.', 'error');
      }
    } catch (e) {
      showToast('Server error.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className={styles.loadingContainer}>
          <div className={`${styles.skeletonImage} skeleton`}></div>
          <div className={styles.skeletonDetails}>
            <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ height: '24px', width: '30%', marginBottom: '24px' }}></div>
            <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '32px' }}></div>
            <div className="skeleton" style={{ height: '48px', width: '40%' }}></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) return null;

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;
  const avgRating = product.reviews.length > 0
    ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : '0.0';

  return (
    <CustomerLayout>
      <div className={styles.container}>
        {/* Back Link */}
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        {/* Product Grid */}
        <div className={styles.mainGrid}>
          {/* Image visual */}
          <div className={styles.imageSection}>
            <div className={styles.mockImageBg}>
              <div className={`${styles.eggIcon} ${styles[product.eggType.toLowerCase()]}`}>🥚</div>
            </div>
            {isOutOfStock && <span className={styles.outOfStockBadge}>Out of Stock</span>}
          </div>

          {/* Text details */}
          <div className={styles.detailsSection}>
            <span className={styles.category}>{product.eggType} EGGS</span>
            <h1 className={styles.title}>{product.name}</h1>
            
            {/* Rating Stars Summary */}
            <div className={styles.ratingSummary}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i <= Math.round(parseFloat(avgRating)) ? 'currentColor' : 'none'} 
                    className={styles.starIcon} 
                  />
                ))}
              </div>
              <span className={styles.ratingText}>({avgRating} / 5.0 based on {product.reviews.length} reviews)</span>
            </div>

            {/* Price Box */}
            <div className={styles.priceBox}>
              <span className={styles.price}>₹{product.price}</span>
              <span className={styles.packSize}>Pack size: {product.packSize} Eggs</span>
            </div>

            {/* Stock status indicator */}
            <div className={styles.stockStatus}>
              {isOutOfStock ? (
                <span className={`${styles.statusPill} ${styles.redPill}`}>🔴 Temporarily Unavailable</span>
              ) : isLowStock ? (
                <span className={`${styles.statusPill} ${styles.orangePill}`}>🟡 Low Stock: Only {product.stock} packs left</span>
              ) : (
                <span className={`${styles.statusPill} ${styles.greenPill}`}>🟢 In Stock: Ready to ship</span>
              )}
            </div>

            {/* Description */}
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {!isOutOfStock && (
              <div className={styles.cartActionBox}>
                <div className={styles.quantitySelector}>
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                  <span className={styles.qtyText}>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>+</button>
                </div>
                <button 
                  onClick={handleAddToCart} 
                  disabled={adding}
                  className={styles.addBtn}
                >
                  {adding ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart — ₹{product.price * quantity}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>
            <MessageSquare size={22} className={styles.sectionTitleIcon} />
            <span>Customer Feedback</span>
          </h2>

          <div className={styles.reviewsLayout}>
            {/* Reviews List */}
            <div className={styles.reviewsList}>
              {product.reviews.length === 0 ? (
                <div className={styles.emptyReviews}>
                  <p>No reviews yet for this product. Be the first to share your experience!</p>
                </div>
              ) : (
                product.reviews.map((r: any) => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewerName}>{r.userName}</span>
                      <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} fill={i <= r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className={styles.reviewComment}>{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <h3>Submit Your Feedback</h3>
                
                {/* Rating selection */}
                <div className={styles.formGroup}>
                  <label>Your Rating:</label>
                  <div className={styles.ratingSelect}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setReviewRating(i)}
                        className={styles.starSelectBtn}
                      >
                        <Star size={24} fill={i <= reviewRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment input */}
                <div className={styles.formGroup}>
                  <label htmlFor="comment">Your Comment:</label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write details about egg yolk texture, freshness, taste..."
                    required
                    className={styles.textarea}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingReview} 
                  className={styles.submitReviewBtn}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className={styles.loginToReview}>
                <p>Please <Link href="/login">login</Link> to submit product reviews.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
