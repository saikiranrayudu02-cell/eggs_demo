'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, ShieldCheck, ArrowRight, Loader } from 'lucide-react';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, summary, refreshCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  // Address States
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // New Address Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Simulated Payment Modal Overlay States
  const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [simulatedPaymentId, setSimulatedPaymentId] = useState('');
  const [simulatingStatus, setSimulatingStatus] = useState<'idle' | 'processing'>('idle');

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const json = await res.json();
      if (json.success) {
        setAddresses(json.data);
        const defaultAddr = json.data.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (json.data.length > 0) {
          setSelectedAddressId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !house || !city || !state || !pincode) {
      showToast('Please fill in required fields', 'warning');
      return;
    }
    setAddressLoading(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, house, street, area, city, state, pincode, isDefault: true })
      });
      const json = await res.json();
      setAddressLoading(false);

      if (json.success) {
        showToast('Address added and set as default!', 'success');
        // Clear fields
        setFullName('');
        setPhone('');
        setHouse('');
        setStreet('');
        setArea('');
        setCity('');
        setState('');
        setPincode('');
        setShowAddressForm(false);
        // Refresh list
        await fetchAddresses();
      } else {
        showToast(json.message || 'Failed to add address', 'error');
      }
    } catch (err) {
      setAddressLoading(false);
      showToast('Server error.', 'error');
    }
  };

  // Place Order Submit
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'warning');
      return;
    }
    if (items.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: selectedAddressId, paymentMethod })
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.message || 'Failed to create order', 'error');
        setPlacingOrder(false);
        return;
      }

      const order = json.data;
      setCreatedOrder(order);

      if (paymentMethod === 'COD') {
        // COD succeeds immediately
        showToast('Order placed successfully (Cash on Delivery)!', 'success');
        await refreshCart();
        setPlacingOrder(false);
        router.push(`/order-success?orderId=${order.id}`);
      } else {
        // Online Payment - trigger payment order in DB, and show simulator
        const payRes = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
        const payJson = await payRes.json();
        setPlacingOrder(false);

        if (payJson.success) {
          // Open simulator
          setSimulatedPaymentId(payJson.data.id);
          setShowPaymentSimulator(true);
        } else {
          showToast(payJson.message || 'Payment initiation failed', 'error');
        }
      }
    } catch (err) {
      setPlacingOrder(false);
      showToast('Server error. Try again.', 'error');
    }
  };

  // Simulate verification success or failure
  const handleSimulatePayment = async (status: 'success' | 'failure') => {
    if (!createdOrder) return;
    setSimulatingStatus('processing');
    
    // Simulate slight lag to mimic gateway response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: simulatedPaymentId,
          razorpay_payment_id: `pay_sim_${Math.random().toString(36).substr(2, 9)}`,
          success: status === 'success'
        })
      });
      const json = await res.json();
      setSimulatingStatus('idle');

      if (json.success) {
        showToast('Simulated Payment Verified! Thank you.', 'success');
        setShowPaymentSimulator(false);
        await refreshCart();
        router.push(`/order-success?orderId=${createdOrder.id}`);
      } else {
        showToast(json.message || 'Simulated payment transaction failed.', 'error');
        setShowPaymentSimulator(false);
      }
    } catch (err) {
      setSimulatingStatus('idle');
      showToast('Signature verification server error.', 'error');
    }
  };

  if (!user) return null;

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Secure Checkout</h1>

        <div className={styles.mainGrid}>
          {/* Left panel: Address & Payment */}
          <div className={styles.checkoutDetails}>
            {/* Step 1: Delivery Address */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <MapPin className={styles.sectionIcon} size={22} />
                <h2>1. Delivery Address</h2>
              </div>

              {/* Address selector */}
              {!showAddressForm && (
                <div className={styles.addressSection}>
                  <div className={styles.addressList}>
                    {addresses.map((addr) => (
                      <label 
                        key={addr.id} 
                        className={`${styles.addressLabel} ${selectedAddressId === addr.id ? styles.selectedAddress : ''}`}
                      >
                        <input
                          type="radio"
                          name="addressId"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className={styles.radioInput}
                        />
                        <div className={styles.addressInfo}>
                          <p className={styles.fullName}>{addr.fullName} {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}</p>
                          <p className={styles.phoneText}>📞 {addr.phone}</p>
                          <p className={styles.houseText}>{addr.house}, {addr.street}</p>
                          <p className={styles.cityText}>{addr.area ? `${addr.area}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {addresses.length === 0 && (
                    <p className={styles.noAddress}>No saved addresses found. Please add a new delivery address.</p>
                  )}

                  <button 
                    onClick={() => setShowAddressForm(true)} 
                    className={styles.addAddressToggleBtn}
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* Address add form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className={styles.addressForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Receiver Full Name *</label>
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ravi Kumar" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Contact Phone Number *</label>
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>House / Flat / Block No *</label>
                      <input type="text" required value={house} onChange={(e) => setHouse(e.target.value)} placeholder="Flat 402, 4th Floor" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Street Name / Landmark</label>
                      <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Koramangala 8th Block" />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Area / Locality</label>
                      <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Near City Park" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Pincode *</label>
                      <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="560095" />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>City *</label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State *</label>
                      <input type="text" required value={state} onChange={(e) => setState(e.target.value)} placeholder="Karnataka" />
                    </div>
                  </div>

                  <div className={styles.formButtons}>
                    <button type="button" onClick={() => setShowAddressForm(false)} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" disabled={addressLoading} className={styles.saveBtn}>
                      {addressLoading ? 'Saving...' : 'Save & Set Default'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <CreditCard className={styles.sectionIcon} size={22} />
                <h2>2. Choose Payment Method</h2>
              </div>
              <div className={styles.paymentList}>
                <label className={`${styles.paymentLabel} ${paymentMethod === 'COD' ? styles.selectedPayment : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className={styles.radioInput}
                  />
                  <div className={styles.paymentInfo}>
                    <p className={styles.paymentTitle}>Cash on Delivery (COD)</p>
                    <p className={styles.paymentDesc}>Pay with cash when eggs are safely delivered to your doorstep.</p>
                  </div>
                </label>

                <label className={`${styles.paymentLabel} ${paymentMethod === 'ONLINE' ? styles.selectedPayment : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className={styles.radioInput}
                  />
                  <div className={styles.paymentInfo}>
                    <p className={styles.paymentTitle}>Simulated Online Payment</p>
                    <p className={styles.paymentDesc}>Pay securely via mock payment portal (supports credit cards/netbanking).</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right panel: Summary & Place Order button */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Review Your Order</h3>
              
              {/* Items Breakdown list */}
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemName}>
                      <span>{item.name}</span>
                      <span className={styles.summaryItemQty}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.summaryItemPrice}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr />

              {/* Totals */}
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Items Subtotal</span>
                  <span>₹{summary.subtotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>{summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee}`}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Discount Coupon</span>
                  <span>-₹{summary.discount}</span>
                </div>
                <hr />
                <div className={`${styles.summaryRow} ${styles.finalRow}`}>
                  <span>Grand Total</span>
                  <span>₹{summary.total}</span>
                </div>
              </div>

              {/* Secure badge */}
              <div className={styles.secureBadge}>
                <ShieldCheck size={16} />
                <span>Secure SSL Checkouts</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || items.length === 0 || !selectedAddressId}
                className={styles.placeOrderBtn}
              >
                {placingOrder ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOCK ONLINE PAYMENT SIMULATOR MODAL */}
        {showPaymentSimulator && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <span className={styles.modalLogo}>🥚 EggCart Gateway</span>
                <span className={styles.modalMode}>TESTING SIMULATOR</span>
              </div>

              <div className={styles.modalBody}>
                <h3>Simulated Online Payment Gate</h3>
                <p className={styles.transactionMeta}>
                  Transaction amount: <strong>₹{summary.total}</strong> <br />
                  Order ID: <code>{createdOrder?.orderNumber}</code> <br />
                  Mock Payee: <code>{simulatedPaymentId}</code>
                </p>

                <div className={styles.mockCardForm}>
                  <label>Simulated Card Details</label>
                  <input type="text" disabled placeholder="4111 2222 3333 4444" className={styles.simInput} />
                  <div className={styles.mockCardRow}>
                    <input type="text" disabled placeholder="12 / 29" className={styles.simInput} />
                    <input type="text" disabled placeholder="***" className={styles.simInput} />
                  </div>
                </div>

                {simulatingStatus === 'processing' ? (
                  <div className={styles.simulatingLoader}>
                    <Loader className={styles.spinnerIcon} size={28} />
                    <p>Contacting mock banking gateway. Do not refresh...</p>
                  </div>
                ) : (
                  <div className={styles.simulationControls}>
                    <button 
                      onClick={() => handleSimulatePayment('success')} 
                      className={styles.simSuccessBtn}
                    >
                      ✓ Simulate Success
                    </button>
                    <button 
                      onClick={() => handleSimulatePayment('failure')} 
                      className={styles.simFailureBtn}
                    >
                      ✕ Simulate Failure
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
