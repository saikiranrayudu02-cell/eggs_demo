'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { Search, Eye, MapPin, CreditCard, Box, X } from 'lucide-react';
import styles from './AdminOrders.module.css';

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected Order Drawer Details
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [drawerOrder, setDrawerOrder] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Status Update Form States
  const [statusVal, setStatusVal] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, selectedStatus]);

  // Fetch drawer order details when selectedOrderId changes
  useEffect(() => {
    async function fetchDrawerDetails() {
      if (!selectedOrderId) {
        setDrawerOrder(null);
        return;
      }
      setDrawerLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${selectedOrderId}`);
        const json = await res.json();
        if (json.success) {
          setDrawerOrder(json.data);
          setStatusVal(json.data.orderStatus);
          setStatusNote('');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDrawerLoading(false);
      }
    }
    fetchDrawerDetails();
  }, [selectedOrderId]);

  // Update status handler
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !statusVal) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal, note: statusNote })
      });
      const json = await res.json();
      setUpdating(false);

      if (json.success) {
        showToast('Order status updated successfully!', 'success');
        // Refresh orders lists & drawer
        await fetchOrders();
        // Refresh drawer details
        setDrawerOrder(json.data);
        setStatusVal(json.data.orderStatus);
        setStatusNote('');
      } else {
        showToast(json.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      setUpdating(false);
      showToast('Server error.', 'error');
    }
  };

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.adminOrders}>
      <div className={styles.pageHeader}>
        <h1>Order Logs</h1>
        <p>Monitor customer checkout logs, payment status, and prepare egg deliveries.</p>
      </div>

      {/* Control Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders (No, Name, Phone)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Status Filters */}
        <div className={styles.tabsRow}>
          {[
            { value: '', label: 'All Orders' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PREPARING', label: 'Preparing' },
            { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`${styles.tabBtn} ${selectedStatus === tab.value ? styles.activeTab : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.ordersLayout}>
        {/* Table list */}
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Grand Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loadingCell}>
                      <span className={styles.spinner}></span>
                      <p>Fetching logs...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>No matching orders found.</td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr 
                      key={o.id} 
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`${styles.tableRow} ${selectedOrderId === o.id ? styles.activeRow : ''}`}
                    >
                      <td className={styles.orderNoCol}>{o.orderNumber}</td>
                      <td>
                        <div className={styles.customerCell}>
                          <span>{o.customerName}</span>
                          <span className={styles.subtext}>{o.customerPhone}</span>
                        </div>
                      </td>
                      <td><strong>₹{o.total}</strong></td>
                      <td>
                        <span className={`${styles.paymentBadge} ${o.paymentStatus === 'PAID' ? styles.paidBadge : ''}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusPill} ${getStatusClass(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className={styles.dateCol}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className={styles.actionViewBtn} onClick={(e) => { e.stopPropagation(); setSelectedOrderId(o.id); }}>
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic sliding details drawer */}
        {selectedOrderId && (
          <div className={styles.detailsDrawer}>
            <div className={styles.drawerHeader}>
              <h3>Order Details</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedOrderId(null)}>
                <X size={20} />
              </button>
            </div>

            {drawerLoading ? (
              <div className={styles.drawerLoading}>
                <span className={styles.spinner}></span>
                <p>Loading details...</p>
              </div>
            ) : drawerOrder ? (
              <div className={styles.drawerBody}>
                {/* Meta details */}
                <div className={styles.drawerSection}>
                  <p>Order ID: <strong>{drawerOrder.orderNumber}</strong></p>
                  <p>Date: {formatDate(drawerOrder.createdAt)}</p>
                </div>

                {/* Customer Details */}
                <div className={styles.drawerSection}>
                  <h4>👤 Customer Info</h4>
                  <p>Name: <strong>{drawerOrder.customerName}</strong></p>
                  <p>Phone: {drawerOrder.customerPhone}</p>
                  <p>Email: {drawerOrder.customerEmail}</p>
                </div>

                {/* Address */}
                <div className={styles.drawerSection}>
                  <h4><MapPin size={16} /> Delivery Address</h4>
                  <p className={styles.boldText}>{drawerOrder.address?.fullName}</p>
                  <p>{drawerOrder.address?.house}, {drawerOrder.address?.street}</p>
                  <p>{drawerOrder.address?.area && `${drawerOrder.address.area}, `}{drawerOrder.address?.city}, {drawerOrder.address?.state} - {drawerOrder.address?.pincode}</p>
                </div>

                {/* Items */}
                <div className={styles.drawerSection}>
                  <h4><Box size={16} /> Ordered Items</h4>
                  <div className={styles.itemsList}>
                    {drawerOrder.items.map((it: any) => (
                      <div key={it.id} className={styles.itemRow}>
                        <span>{it.productName} <strong>x{it.quantity}</strong></span>
                        <span>₹{it.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                  <hr className={styles.divider} />
                  <div className={styles.totalRow}>
                    <span>Grand Total:</span>
                    <strong>₹{drawerOrder.total}</strong>
                  </div>
                </div>

                {/* Payment info */}
                <div className={styles.drawerSection}>
                  <h4><CreditCard size={16} /> Payment</h4>
                  <p>Provider: <strong>{drawerOrder.payment?.provider}</strong></p>
                  <p>Status: <strong>{drawerOrder.payment?.status}</strong></p>
                  {drawerOrder.payment?.providerPaymentId && (
                    <p className={styles.subtext}>Transaction ID: <code>{drawerOrder.payment.providerPaymentId}</code></p>
                  )}
                </div>

                {/* Status update form */}
                <form onSubmit={handleUpdateStatus} className={styles.statusUpdateForm}>
                  <h4>⚙ Update Order Status</h4>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Next Stage:</label>
                    <select
                      id="status"
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="note">Update Note:</label>
                    <input
                      type="text"
                      id="note"
                      placeholder="e.g. loaded in delivery vehicle"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className={styles.noteInput}
                    />
                  </div>

                  <button type="submit" disabled={updating} className={styles.updateBtn}>
                    {updating ? 'Updating...' : 'Save Status Update'}
                  </button>
                </form>
              </div>
            ) : (
              <p className={styles.drawerError}>Error loading details.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
