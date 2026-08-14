'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Users, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          showToast(json.message || 'Failed to fetch dashboard', 'error');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }}></div>)}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: '12px', marginTop: '32px' }}></div>
      </div>
    );
  }

  if (!data) return <p>Could not load dashboard data.</p>;

  const { stats, recentOrders, lowStockProducts } = data;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard Overview</h1>

      {/* Metrics Cards Grid */}
      <div className={styles.metricsGrid}>
        {/* Total Revenue */}
        <div className={styles.metricCard}>
          <div className={`${styles.iconBg} ${styles.greenBg}`}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span>Total Revenue</span>
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className={styles.metricCard}>
          <div className={`${styles.iconBg} ${styles.blueBg}`}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span>Total Orders</span>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={styles.metricCard}>
          <div className={`${styles.iconBg} ${styles.yellowBg}`}>
            <Clock size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span>Pending Orders</span>
            <h3>{stats.pendingOrders}</h3>
          </div>
        </div>

        {/* Customers */}
        <div className={styles.metricCard}>
          <div className={`${styles.iconBg} ${styles.purpleBg}`}>
            <Users size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span>Total Customers</span>
            <h3>{stats.totalCustomers}</h3>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Recent Orders Table */}
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" className={styles.viewLink}>
              <span>View All Log</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Placed At</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>No orders placed yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td className={styles.orderNoCol}>
                        <Link href={`/admin/orders?search=${o.orderNumber}`}>{o.orderNumber}</Link>
                      </td>
                      <td>{o.customerName}</td>
                      <td><strong>₹{o.total}</strong></td>
                      <td>
                        <span className={`${styles.statusPill} ${getStatusClass(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className={styles.dateCol}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Feeds Card */}
        <div className={styles.feedCard}>
          <div className={styles.cardHeader}>
            <h3>
              <AlertTriangle className={styles.alertIcon} size={18} />
              <span>Low Stock Alerts</span>
            </h3>
            {stats.lowStockCount > 0 && <span className={styles.alertCountBadge}>{stats.lowStockCount}</span>}
          </div>
          
          <div className={styles.feedList}>
            {lowStockProducts.length === 0 ? (
              <p className={styles.emptyFeed}>All products have healthy stock levels. Excellent!</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className={styles.feedItem}>
                  <div className={styles.feedIcon}>⚠️</div>
                  <div className={styles.feedInfo}>
                    <p className={styles.feedTitle}><strong>{p.name}</strong> is running low.</p>
                    <p className={styles.feedMeta}>
                      Current Stock: <strong className={styles.redText}>{p.stock} packs</strong> • Threshold: {p.threshold} packs
                    </p>
                  </div>
                  <Link href="/admin/inventory" className={styles.restockLink}>Restock</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
