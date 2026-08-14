'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, User, Phone, ArrowRight } from 'lucide-react';
import styles from '../Auth.module.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (phone.length < 10) {
      showToast('Enter a valid 10-digit phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        showToast('Registration successful! Welcome to EggCart.', 'success');
        login(json.data);
      } else {
        showToast(json.message || 'Registration failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Network error, please try again.', 'error');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Logo Link */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoEmoji}>🥚</span>
        <span className={styles.logoText}>EggCart</span>
      </Link>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Create Account</h2>
          <p>Register today to order fresh farm eggs directly to your door.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <div className={styles.inputBox}>
              <User className={styles.inputIcon} size={18} />
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ravi Kumar"
                className={styles.input}
              />
            </div>
          </div>

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

          {/* Phone Input */}
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <div className={styles.inputBox}>
              <Phone className={styles.inputIcon} size={18} />
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className={styles.input}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputBox}>
              <KeyRound className={styles.inputIcon} size={18} />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className={styles.input}
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.inputBox}>
              <KeyRound className={styles.inputIcon} size={18} />
              <input
                type="password"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
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
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
