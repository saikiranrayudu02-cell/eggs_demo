'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import styles from '../Auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        showToast(`Welcome back, ${json.data.name}!`, 'success');
        login(json.data);
      } else {
        showToast(json.message || 'Login failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Network error, please try again.', 'error');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Back to Home Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoEmoji}>🥚</span>
        <span className={styles.logoText}>EggCart</span>
      </Link>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Login to place orders and track delivery statuses.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Input */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputBox}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi@gmail.com"
                className={styles.input}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>
              <span className={styles.forgotLink}>Forgot?</span>
            </div>
            <div className={styles.inputBox}>
              <KeyRound className={styles.inputIcon} size={18} />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            New to EggCart? <Link href="/register">Create an account</Link>
          </p>
          <div className={styles.credentialsTip}>
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: <code>admin@eggstore.com</code> / <code>admin123</code></p>
            <p>Customer: <code>ravi@gmail.com</code> / <code>customer123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
