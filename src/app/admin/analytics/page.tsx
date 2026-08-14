'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import styles from './AdminAnalytics.module.css';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444'];

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          showToast(json.message || 'Failed to fetch analytics', 'error');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="skeleton" style={{ height: '350px', borderRadius: '12px', marginBottom: '32px' }}></div>
        <div className={styles.skeletonGrid}>
          <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return <p>Could not load analytics charts.</p>;

  const { dailyRevenue, productSales, eggTypeSales } = data;

  return (
    <div className={styles.adminAnalytics}>
      <div className={styles.pageHeader}>
        <h1>Business Analytics</h1>
        <p>Analyze revenue growth charts, category sales distributions, and volume logs.</p>
      </div>

      {/* Revenue Line Chart */}
      <div className={styles.chartCard}>
        <h3>Revenue Trend (Last 7 Days)</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyRevenue} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} unit="₹" />
              <Tooltip 
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
              />
              <Line type="monotone" dataKey="revenue" name="Daily Revenue" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Product Volume Sales Bar Chart */}
        <div className={styles.chartCard}>
          <h3>Product Sales Volume (packs)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productSales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" name="Packs Sold" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Egg Type Pie Chart */}
        <div className={styles.chartCard}>
          <h3>Sales by Egg Category</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={eggTypeSales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eggTypeSales.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
