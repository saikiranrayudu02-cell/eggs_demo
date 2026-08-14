'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, CreditCard, Box, Check, Circle } from 'lucide-react';
import styles from './OrderTracking.module.css';

interface OrderTimelineStep {
  status: string;
  title: string;
  desc: string;
  done: boolean;
  active: boolean;
  time?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrderData(json.data);
      } else {
        showToast(json.message || 'Order not found', 'error');
        router.push('/account/orders');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      const interval = setInterval(fetchOrderDetails, 8000); // Poll tracking status every 8s
      return () => clearInterval(interval);
    }
  }, [id]);

  if (!user) return null;

  if (loading) {
    return (
      <CustomerLayout>
        <div className={styles.loadingWrapper}>
          <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '12px' }}></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!orderData) return null;

  // Build the tracking status workflow
  const steps: OrderTimelineStep[] = [
    {
      status: 'PENDING',
      title: 'Order Placed',
      desc: 'We received your order request.',
      done: true,
      active: orderData.orderStatus === 'PENDING',
      time: orderData.statusHistory.find((h: any) => h.status === 'PENDING')?.createdAt
    },
    {
      status: 'CONFIRMED',
      title: 'Order Confirmed',
      desc: 'Admin confirmed availability and price.',
      done: ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.orderStatus),
      active: orderData.orderStatus === 'CONFIRMED',
      time: orderData.statusHistory.find((h: any) => h.status === 'CONFIRMED')?.createdAt
    },
    {
      status: 'PREPARING',
      title: 'Eggs Preparing',
      desc: 'Eggs are being carefully clean-packed.',
      done: ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.orderStatus),
      active: orderData.orderStatus === 'PREPARING',
      time: orderData.statusHistory.find((h: any) => h.status === 'PREPARING')?.createdAt
    },
    {
      status: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      desc: 'Our delivery executive is heading to your address.',
      done: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderData.orderStatus),
      active: orderData.orderStatus === 'OUT_FOR_DELIVERY',
      time: orderData.statusHistory.find((h: any) => h.status === 'OUT_FOR_DELIVERY')?.createdAt
    },
    {
      status: 'DELIVERED',
      title: 'Delivered',
      desc: 'Order handed over successfully.',
      done: orderData.orderStatus === 'DELIVERED',
      active: orderData.orderStatus === 'DELIVERED',
      time: orderData.statusHistory.find((h: any) => h.status === 'DELIVERED')?.createdAt
    }
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isCancelled = orderData.orderStatus === 'CANCELLED';

  return (
    <CustomerLayout>
      <div className={styles.container}>
        {/* Back link */}
        <Link href="/account/orders" className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to History</span>
        </Link>

        {/* Header Summary */}
        <div className={styles.headerCard}>
          <div className={styles.headerMeta}>
            <span className={styles.orderNo}>Order #{orderData.orderNumber}</span>
            <span className={styles.createdAtText}>Placed on {new Date(orderData.createdAt).toLocaleDateString()}</span>
          </div>
          <div className={styles.headerStatusBox}>
            <span className={`${styles.statusLabel} ${isCancelled ? styles.cancelledBadge : ''}`}>
              Status: <strong>{orderData.orderStatus}</strong>
            </span>
          </div>
        </div>

        {/* Cancellation Alert Banner */}
        {isCancelled && (
          <div className={styles.cancelledBanner}>
            <h3>❌ Order Cancelled</h3>
            <p>
              This order was cancelled by the admin. 
              {orderData.statusHistory.find((h: any) => h.status === 'CANCELLED')?.note && (
                <> Reason: <em>"{orderData.statusHistory.find((h: any) => h.status === 'CANCELLED')?.note}"</em></>
              )}
            </p>
          </div>
        )}

        <div className={styles.mainGrid}>
          {/* Timeline tracking section */}
          {!isCancelled && (
            <div className={styles.trackingTimelineCard}>
              <h3>Live Tracking Status</h3>
              
              <div className={styles.timelineList}>
                {steps.map((step, idx) => (
                  <div key={idx} className={`${styles.timelineStep} ${step.done ? styles.stepDone : ''} ${step.active ? styles.stepActive : ''}`}>
                    {/* Line connector */}
                    {idx < steps.length - 1 && <div className={styles.timelineLine}></div>}
                    
                    {/* Node indicator */}
                    <div className={styles.timelineNode}>
                      {step.done ? (
                        <Check size={14} className={styles.checkIcon} />
                      ) : (
                        <Circle size={10} className={styles.circleIcon} />
                      )}
                    </div>

                    {/* Step details */}
                    <div className={styles.timelineDetails}>
                      <div className={styles.stepHeader}>
                        <h4>{step.title}</h4>
                        {step.time && <span className={styles.stepTime}>{formatDate(step.time)}</span>}
                      </div>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details breakdown sidebar */}
          <div className={styles.detailsSidebar}>
            {/* Address */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <MapPin size={18} />
                <h4>Delivery Address</h4>
              </div>
              <p className={styles.boldText}>{orderData.address?.fullName}</p>
              <p>📞 {orderData.address?.phone}</p>
              <p>{orderData.address?.house}, {orderData.address?.street}</p>
              <p>{orderData.address?.area && `${orderData.address.area}, `}{orderData.address?.city}, {orderData.address?.state} - {orderData.address?.pincode}</p>
            </div>

            {/* Payment Details */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <CreditCard size={18} />
                <h4>Payment Details</h4>
              </div>
              <p>Mode: <strong>{orderData.payment?.provider}</strong></p>
              <p>Status: <strong className={orderData.payment?.status === 'SUCCESS' ? styles.successColor : ''}>{orderData.payment?.status}</strong></p>
              {orderData.payment?.providerPaymentId && (
                <p className={styles.paymentIdText}>ID: <code>{orderData.payment.providerPaymentId}</code></p>
              )}
            </div>

            {/* Item list Summary */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <Box size={18} />
                <h4>Ordered Items</h4>
              </div>
              <div className={styles.itemsSummaryList}>
                {orderData.items.map((item: any) => (
                  <div key={item.id} className={styles.itemSummaryRow}>
                    <span>{item.productName} <strong>(x{item.quantity})</strong></span>
                    <span>₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
              <hr className={styles.divider} />
              <div className={styles.totalsRows}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>₹{orderData.subtotal}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Delivery Fee</span>
                  <span>₹{orderData.deliveryFee}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Grand Total</span>
                  <span>₹{orderData.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
