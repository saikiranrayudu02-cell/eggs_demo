'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useToast } from '@/components/ToastProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import styles from './OrderSuccess.module.css';

import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get('orderId');
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderIdParam) {
        showToast('No order ID provided', 'warning');
        router.push('/');
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderIdParam}`);
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
        } else {
          showToast('Order not found', 'error');
          router.push('/');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderIdParam]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className={styles.loadingWrapper}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '24px' }}></div>
          <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '16px' }}></div>
          <div className="skeleton" style={{ width: '320px', height: '80px' }}></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) return null;

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <div className={styles.successCard}>
          {/* Checkmark icon */}
          <div className={styles.checkIconWrapper}>
            <CheckCircle className={styles.checkIcon} size={64} />
          </div>

          <h1 className={styles.title}>Order Confirmed!</h1>
          <p className={styles.subtitle}>
            Thank you for shopping with us. Your eggs are being prepared for packaging.
          </p>

          {/* Details Box */}
          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Order Number:</span>
              <strong className={styles.orderNo}>{order.orderNumber}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Grand Total:</span>
              <strong className={styles.totalAmt}>₹{order.total}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Payment Mode:</span>
              <span className={styles.pill}>{order.paymentStatus === 'COD' ? 'Cash on Delivery' : 'Online Paid'}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Estimated Delivery:</span>
              <span className={styles.deliveryEst}>Today evening or tomorrow morning</span>
            </div>
          </div>

          {/* Additional info tips */}
          <div className={styles.tipsBox}>
            <div className={styles.tipItem}>
              <Calendar size={18} className={styles.tipIcon} />
              <span>Deliveries run daily from 7:00 AM to 8:00 PM.</span>
            </div>
            <div className={styles.tipItem}>
              <CreditCard size={18} className={styles.tipIcon} />
              <span>A digital invoice was sent to <code>{userEmailPlaceholder(order.userId)}</code>.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <Link href={`/account/orders/${order.id}`} className={styles.trackBtn}>
              <span>Track Your Order</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/products" className={styles.shopBtn}>
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <CustomerLayout>
        <div className={styles.loadingWrapper}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '24px' }}></div>
          <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '16px' }}></div>
          <div className="skeleton" style={{ width: '320px', height: '80px' }}></div>
        </div>
      </CustomerLayout>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

// Temporary helper to display email placeholder
function userEmailPlaceholder(userId: number) {
  if (userId === 2) return 'ravi@gmail.com';
  return 'customer@eggstore.com';
}

