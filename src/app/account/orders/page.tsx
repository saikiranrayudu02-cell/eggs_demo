'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import { ShoppingBag, Eye, Calendar, DollarSign, Activity } from 'lucide-react';
import styles from './Orders.module.css';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchOrders();
  }, [user]);

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for status styling pills
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'PREPARING': return styles.statusPreparing;
      case 'OUT_FOR_DELIVERY': return styles.statusOutForDelivery;
      case 'DELIVERED': return styles.statusDelivered;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  if (!user) return null;

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <div className={styles.accountHeader}>
          <h1>My Account</h1>
          <p>Welcome back, <strong>{user.name}</strong> • Account: <code>{user.role}</code></p>
        </div>

        <div className={styles.accountLayout}>
          {/* Sidebar Menu */}
          <aside className={styles.sidebar}>
            <Link href="/account/orders" className={`${styles.sideLink} ${styles.activeLink}`}>
              <ShoppingBag size={18} />
              <span>Order History</span>
            </Link>
            <Link href="/account/profile" className={styles.sideLink}>
              <span>Profile Settings</span>
            </Link>
          </aside>

          {/* Main Area */}
          <div className={styles.mainContent}>
            <h2>Order History</h2>
            
            {loading ? (
              <div className={styles.loadingWrapper}>
                {[1, 2].map(i => <div key={i} className={`${styles.skeletonRow} skeleton`}></div>)}
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <ShoppingBag size={48} className={styles.emptyIcon} />
                <h3>No Orders Found</h3>
                <p>You haven't placed any egg orders yet.</p>
                <Link href="/products" className={styles.shopBtn}>Browse Catalog</Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.headerInfo}>
                        <span className={styles.orderNo}>{order.orderNumber}</span>
                        <span className={styles.orderDate}>
                          <Calendar size={14} />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <span className={`${styles.statusPill} ${getStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.itemsSummary}>
                        <p className={styles.itemsTitle}>Items Summary:</p>
                        <p className={styles.itemsListText}>
                          {order.items.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                        </p>
                      </div>
                      <div className={styles.priceSummary}>
                        <span className={styles.priceLabel}>Grand Total:</span>
                        <span className={styles.priceVal}>₹{order.total}</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.paymentStatusRow}>
                        <span>Payment Status:</span>
                        <strong className={order.paymentStatus === 'PAID' ? styles.paidText : ''}>{order.paymentStatus}</strong>
                      </div>
                      <Link href={`/account/orders/${order.id}`} className={styles.viewBtn}>
                        <Eye size={16} />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
