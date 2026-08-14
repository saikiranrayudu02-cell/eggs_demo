'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <span className={styles.spinner}></span>
        <p>Loading Admin Space...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.adminMeta}>
            <span>Role: <strong>{user.role}</strong></span>
            <span>Name: <strong>{user.name}</strong></span>
          </div>
          <a href="/" className={styles.websiteLink}>← Exit to Website</a>
        </header>

        {/* Main Content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
