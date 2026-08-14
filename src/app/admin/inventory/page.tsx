'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { RefreshCw, Save, Check } from 'lucide-react';
import styles from './AdminInventory.module.css';

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Store edited quantities: { [productId]: quantityString }
  const [editedQuantities, setEditedQuantities] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const json = await res.json();
      if (json.success) {
        setInventory(json.data);
        // Initialize edited quantities mapping
        const qtyMap: Record<number, string> = {};
        json.data.forEach((item: any) => {
          qtyMap[item.productId] = item.quantity.toString();
        });
        setEditedQuantities(qtyMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQtyChange = (productId: number, val: string) => {
    // Only allow positive integers
    if (val === '' || /^\d+$/.test(val)) {
      setEditedQuantities(prev => ({ ...prev, [productId]: val }));
    }
  };

  const handleSaveStock = async (productId: number) => {
    const qtyStr = editedQuantities[productId];
    if (qtyStr === '') {
      showToast('Stock quantity cannot be empty', 'warning');
      return;
    }

    const quantity = parseInt(qtyStr);
    setSavingId(productId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      const json = await res.json();
      setSavingId(null);

      if (json.success) {
        showToast('Stock levels restocked successfully!', 'success');
        // Refresh
        await fetchInventory();
      } else {
        showToast(json.message || 'Failed to update stock', 'error');
      }
    } catch (err) {
      setSavingId(null);
      showToast('Server error.', 'error');
    }
  };

  return (
    <div className={styles.adminInventory}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1>Stock Manager</h1>
          <p>Monitor egg tray inventories, configure warning thresholds, and trigger instant restocks.</p>
        </div>
        <button onClick={fetchInventory} className={styles.refreshBtn}>
          <RefreshCw size={16} />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Stock table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Shell Category</th>
                <th>Current Inventory</th>
                <th>Restock Action</th>
                <th>Low-Stock Alert Level</th>
                <th>Status</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingCell}>
                    <span className={styles.spinner}></span>
                    <p>Calculating stock levels...</p>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>No inventory items registered.</td>
                </tr>
              ) : (
                inventory.map(item => {
                  const hasChanged = item.quantity.toString() !== editedQuantities[item.productId];
                  const isSaving = savingId === item.productId;
                  return (
                    <tr key={item.id} className={styles.tableRow}>
                      <td className={styles.nameCol}>
                        <strong>{item.name}</strong>
                      </td>
                      <td>
                        <span className={styles.typeBadge}>{item.eggType}</span>
                      </td>
                      <td>
                        <strong className={styles.currentQty}>{item.quantity} packs</strong>
                      </td>
                      <td>
                        {/* Inline restock editor form */}
                        <div className={styles.restockForm}>
                          <input
                            type="text"
                            value={editedQuantities[item.productId] ?? ''}
                            onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                            className={styles.stockInput}
                          />
                          <button
                            onClick={() => handleSaveStock(item.productId)}
                            disabled={!hasChanged || isSaving}
                            className={`${styles.saveBtn} ${hasChanged ? styles.activeSaveBtn : ''}`}
                            title="Save stock level"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      </td>
                      <td>Alert below {item.lowStockThreshold} packs</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          item.status.includes('Out') ? styles.outBadge : 
                          item.status.includes('Low') ? styles.lowBadge : styles.healthyBadge
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className={styles.dateCol}>
                        {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
