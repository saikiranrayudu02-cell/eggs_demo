'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ProductCard from '@/components/products/ProductCard';
import { Search } from 'lucide-react';
import styles from './Products.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType) params.append('type', selectedType);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedType, sortBy]);

  return (
    <CustomerLayout>
      <div className={styles.container}>
        {/* Banner Section */}
        <section className={styles.banner}>
          <h1>Explore Fresh Farm Eggs</h1>
          <p>Handpicked daily, nutritious selections for your healthy family breakfasts.</p>
        </section>

        {/* Filter Controls Bar */}
        <div className={styles.controlsBar}>
          {/* Search Input */}
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search eggs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Sort Selection */}
          <div className={styles.sortBox}>
            <label htmlFor="sortBy">Sort By:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsRow}>
          {[
            { value: '', label: 'All Eggs' },
            { value: 'WHITE', label: 'White Eggs' },
            { value: 'BROWN', label: 'Brown Eggs' },
            { value: 'COUNTRY', label: 'Country Eggs' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`${styles.tabBtn} ${selectedType === tab.value ? styles.activeTab : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className={styles.catalogSection}>
          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${styles.skeletonCard} skeleton`}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🥚</div>
              <h3>No products found</h3>
              <p>Try adjusting your search query or filters.</p>
              <button 
                onClick={() => { setSearch(''); setSelectedType(''); setSortBy('newest'); }}
                className={styles.resetBtn}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
