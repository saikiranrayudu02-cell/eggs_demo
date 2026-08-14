'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import { ShoppingBag, User, Check, AlertTriangle } from 'lucide-react';
import styles from '../orders/Orders.module.css';

export default function AccountProfilePage() {
  const { user, refresh } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        showToast('Profile updated successfully!', 'success');
        refresh(); // update auth context
      } else {
        showToast(json.message || 'Update failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Server error.', 'error');
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
            <Link href="/account/orders" className={styles.sideLink}>
              <ShoppingBag size={18} />
              <span>Order History</span>
            </Link>
            <Link href="/account/profile" className={`${styles.sideLink} ${styles.activeLink}`}>
              <User size={18} />
              <span>Profile Settings</span>
            </Link>
          </aside>

          {/* Main Area */}
          <div className={styles.mainContent}>
            <h2>Profile Settings</h2>

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '500px',
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#F8FAFC'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#F8FAFC'
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#F8FAFC'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'var(--primary-color)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  borderRadius: '30px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
