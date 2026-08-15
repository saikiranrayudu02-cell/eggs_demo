'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { Bell, ShoppingCart, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setNotifCount(json.data.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.eggEmoji}>🥚</span>
          <span className={styles.logoText}>EggCart</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/products" className={styles.navLink}>Shop Eggs</Link>
          {user && user.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.navLink} ${styles.adminLink}`}>Admin Dashboard</Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className={styles.actions}>
          {/* Notifications */}
          {user && (
            <div className={styles.dropdownContainer}>
              <button 
                className={styles.actionBtn} 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown && notifCount > 0) markAllRead();
                }}
              >
                <Bell size={22} />
                {notifCount > 0 && <span className={styles.badge}>{notifCount}</span>}
              </button>
              
              {showNotifDropdown && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.dropdownHeader}>
                    <h4>Notifications</h4>
                    {notifCount > 0 && <button onClick={markAllRead}>Mark read</button>}
                  </div>
                  <div className={styles.dropdownList}>
                    {notifications.length === 0 ? (
                      <p className={styles.emptyNotif}>No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`${styles.notifItem} ${!n.isRead ? styles.unread : ''}`}>
                          <p className={styles.notifTitle}>{n.title}</p>
                          <p className={styles.notifMsg}>{n.message}</p>
                          <span className={styles.notifTime}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shopping Cart */}
          <Link href="/cart" className={styles.actionBtn}>
            <ShoppingCart size={22} />
            {totalCartCount > 0 && <span className={styles.badge}>{totalCartCount}</span>}
          </Link>

          {/* User Profile / Access */}
          {user ? (
            <div className={styles.profileMenuContainer}>
              <Link href={user.role === 'ADMIN' ? '/admin' : '/account/orders'} className={styles.profileLink}>
                <div className={styles.avatar}>
                  <User size={18} />
                </div>
                <span className={styles.userName}>{user.name}</span>
                <ChevronDown size={14} />
              </Link>
              <div className={styles.profileDropdown}>
                <Link href="/account/orders" className={styles.dropLink}>My Orders</Link>
                <Link href="/account/profile" className={styles.dropLink}>Profile Settings</Link>
                {user.role === 'ADMIN' && <Link href="/admin" className={styles.dropLink}>Admin Control</Link>}
                <hr className={styles.divider} />
                <button onClick={logout} className={styles.logoutBtn}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginBtn}>Login</Link>
              <Link href="/register" className={styles.registerBtn}>Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {showMobileMenu && (
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileNavLink} onClick={() => setShowMobileMenu(false)}>
            Home
          </Link>
          <Link href="/products" className={styles.mobileNavLink} onClick={() => setShowMobileMenu(false)}>
            Shop Eggs
          </Link>
          {user && user.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.mobileNavLink} ${styles.mobileAdminLink}`} onClick={() => setShowMobileMenu(false)}>
              Admin Dashboard
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
