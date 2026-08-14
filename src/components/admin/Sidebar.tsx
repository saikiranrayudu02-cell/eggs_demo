'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Egg, 
  Boxes, 
  Users, 
  LineChart, 
  LogOut 
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Order Logs', icon: ShoppingBag },
    { href: '/admin/products', label: 'Egg Products', icon: Egg },
    { href: '/admin/inventory', label: 'Stock Manager', icon: Boxes },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <span className={styles.brandEmoji}>🥚</span>
        <div className={styles.brandText}>
          <h3>EggCart</h3>
          <span>ADMIN PORTAL</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className={styles.nav}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className={styles.footer}>
        <button onClick={logout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
