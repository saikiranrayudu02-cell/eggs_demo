'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { Plus, Edit2, Archive, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import styles from './AdminProducts.module.css';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editProductId, setEditProductId] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eggType, setEggType] = useState('WHITE');
  const [packSize, setPackSize] = useState('12');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditProductId(null);
    setName('');
    setDescription('');
    setEggType('WHITE');
    setPackSize('12');
    setPrice('');
    setStock('100');
    setLowStockThreshold('10');
    setImageUrl('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setModalMode('edit');
    setEditProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setEggType(p.eggType);
    setPackSize(p.packSize.toString());
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setLowStockThreshold(p.lowStockThreshold.toString());
    setImageUrl(p.imageUrl);
    setIsActive(p.isActive);
    setShowModal(true);
  };

  // Form Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !packSize) {
      showToast('Name, price and pack size are required', 'warning');
      return;
    }

    setSaving(true);
    const body = {
      name,
      description,
      eggType,
      packSize: parseInt(packSize),
      price: parseFloat(price),
      stock: parseInt(stock),
      lowStockThreshold: parseInt(lowStockThreshold),
      imageUrl: imageUrl || undefined,
      isActive
    };

    try {
      let res;
      if (modalMode === 'create') {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`/api/admin/products/${editProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      const json = await res.json();
      setSaving(false);

      if (json.success) {
        showToast(
          modalMode === 'create' ? 'Product created successfully!' : 'Product updated successfully!',
          'success'
        );
        setShowModal(false);
        await fetchProducts();
      } else {
        showToast(json.message || 'Action failed', 'error');
      }
    } catch (err) {
      setSaving(false);
      showToast('Server error.', 'error');
    }
  };

  // Archive (Soft Delete) Product
  const handleArchiveProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to deactivate/archive this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Product archived successfully', 'success');
        await fetchProducts();
      } else {
        showToast(json.message || 'Archiving failed', 'error');
      }
    } catch (e) {
      showToast('Server error.', 'error');
    }
  };

  return (
    <div className={styles.adminProducts}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1>Egg Products</h1>
          <p>Create, update, and toggle active catalog products displayed to customers.</p>
        </div>
        <button onClick={openCreateModal} className={styles.addBtn}>
          <Plus size={18} />
          <span>Add New Egg Product</span>
        </button>
      </div>

      {/* Table list */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Pack Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.loadingCell}>
                    <span className={styles.spinner}></span>
                    <p>Fetching product catalog...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>No products available in catalog.</td>
                </tr>
              ) : (
                products.map(p => {
                  const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p.id} className={styles.tableRow}>
                      <td className={styles.nameCol}>
                        <div className={styles.productCell}>
                          <span className={styles.eggEmoji}>🥚</span>
                          <div className={styles.productText}>
                            <strong>{p.name}</strong>
                            <span className={styles.slugText}>{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.typeBadge}>{p.eggType}</span>
                      </td>
                      <td>Pack of {p.packSize}</td>
                      <td><strong>₹{p.price}</strong></td>
                      <td>
                        <div className={styles.stockCell}>
                          <span className={isOut ? styles.outText : isLow ? styles.lowText : styles.healthyText}>
                            {p.stock} units
                          </span>
                          {isLow && <AlertTriangle size={14} className={styles.warningIcon} />}
                          {isOut && <AlertTriangle size={14} className={styles.errorIcon} />}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusLabel} ${p.isActive ? styles.activeLabel : styles.inactiveLabel}`}>
                          {p.isActive ? (
                            <>
                              <Eye size={12} />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              <span>Inactive</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button onClick={() => openEditModal(p)} className={styles.editBtn} title="Edit Product">
                            <Edit2 size={14} />
                          </button>
                          {p.isActive && (
                            <button onClick={() => handleArchiveProduct(p.id)} className={styles.archiveBtn} title="Archive Product">
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL DRAWER OVERLAY */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>{modalMode === 'create' ? 'Add New Egg Product' : 'Modify Egg Product'}</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}><XButton /></button>
            </div>

            <form onSubmit={handleSaveProduct} className={styles.modalForm}>
              {/* Product Name */}
              <div className={styles.formGroup}>
                <label htmlFor="name">Product Display Name *</label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="e.g. Farm Brown Eggs (Pack of 12)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label htmlFor="desc">Description / Nutrient details</label>
                <textarea
                  id="desc"
                  rows={3}
                  placeholder="e.g. fresh cage-free farm brown eggs rich in yolk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                ></textarea>
              </div>

              {/* Egg Type & Pack Size */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="eggType">Egg Shell Category *</label>
                  <select
                    id="eggType"
                    value={eggType}
                    onChange={(e) => setEggType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="WHITE">WHITE</option>
                    <option value="BROWN">BROWN</option>
                    <option value="COUNTRY">COUNTRY</option>
                    <option value="ORGANIC">ORGANIC</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="packSize">Pack size (Eggs count) *</label>
                  <input
                    type="number"
                    id="packSize"
                    required
                    min={1}
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="price">Unit Price (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    required
                    min={0}
                    placeholder="115"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="stock">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock"
                    required
                    min={0}
                    placeholder="120"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Low Stock Threshold & Image URL */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="threshold">Low Stock Alert Threshold *</label>
                  <input
                    type="number"
                    id="threshold"
                    required
                    min={1}
                    placeholder="10"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="imageUrl">Product Image URL</label>
                  <input
                    type="text"
                    id="imageUrl"
                    placeholder="/images/brown-eggs-12.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Availability Active Checkbox */}
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="isActive">Display this product in Customer Website Catalog (Active)</label>
              </div>

              {/* Form Buttons */}
              <div className={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : 'Save Egg Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Close SVG helper
function XButton() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
