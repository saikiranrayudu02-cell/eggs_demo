'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { Mail, Phone, Calendar } from 'lucide-react';
import styles from './AdminCustomers.module.css';

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        const json = await res.json();
        if (json.success) {
          setCustomers(json.data);
        } else {
          showToast(json.message || 'Failed to fetch customers', 'error');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div className={styles.adminCustomers}>
      <div className={styles.pageHeader}>
        <h1>Customers Directory</h1>
        <p>Browse registered customer contact details, total order counts, and cumulative account spends.</p>
      </div>

      {/* Customers Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Registration Date</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingCell}>
                    <span className={styles.spinner}></span>
                    <p>Fetching directories...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>No registered customers found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className={styles.tableRow}>
                    <td className={styles.nameCol}>
                      <strong>{c.name}</strong>
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <span>✉ {c.email}</span>
                        <span>📞 {c.phone}</span>
                      </div>
                    </td>
                    <td className={styles.dateCol}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={styles.countBadge}>{c.orderCount} orders</span>
                    </td>
                    <td>
                      <strong className={styles.spendText}>₹{c.spending.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${c.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                        {c.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
