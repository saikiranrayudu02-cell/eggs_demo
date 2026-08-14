'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { ShieldCheck, Truck, ShieldAlert, Award, Star } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          // Select White 12, Brown 12, Country 12 as featured
          const featured = json.data.filter((p: any) =>
            p.slug === 'white-eggs-12' || p.slug === 'brown-eggs-12' || p.slug === 'country-eggs-12'
          );
          setFeaturedProducts(featured.length > 0 ? featured : json.data.slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <CustomerLayout>
      <div className={styles.home}>
        {/* Hero Section */}
        <section className={styles.hero}>
          {/* Premium Background Elements */}
          <div className={styles.heroBackground}>
            <div className={styles.gridOverlay}></div>
            <div className={styles.glowGreen}></div>
            <div className={styles.glowAmber}></div>
          </div>

          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <span className={styles.pulseDot}></span>
              📍 Delivery in Kovvur &amp; Rajahmundry • 🥚 30 Eggs for ₹480/-
            </span>
            <h1 className={styles.heroTitle}>
              Fresh Farm Eggs. <br />
              <span className={styles.highlight}>Delivered to Your Door.</span>
            </h1>
            <p className={styles.heroText}>
              Collected daily from SV Farms, Kovvur. 30 eggs tray at just ₹480/-. Special discounts on bulk orders!
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/products" className={styles.primaryCta}>Order Fresh Eggs</Link>
              <a href="https://wa.me/916309149473?text=Hi%20SV%20Farms,%20I%20want%20to%20order%20eggs!" target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
                WhatsApp Order <span className={styles.arrow}>→</span>
              </a>
            </div>

            {/* Social Proof Row */}
            <div className={styles.heroSocialProof}>
              <div className={styles.socialStat}>
                <span className={styles.statNumber}>₹480/-</span>
                <span className={styles.statLabel}>30 Eggs Tray</span>
              </div>
              <div className={styles.socialDivider} />
              <div className={styles.socialStat}>
                <span className={styles.statNumber}>Kovvur &amp; RJY</span>
                <span className={styles.statLabel}>Express Delivery</span>
              </div>
              <div className={styles.socialDivider} />
              <div className={styles.socialStat}>
                <span className={styles.statNumber}>Bulk Deals</span>
                <span className={styles.statLabel}>Special Discounts</span>
              </div>
            </div>
          </div>

          <div className={styles.heroImageWrapper}>
            <div className={styles.heroEggIllustration}>
              {/* Orbital Rings */}
              <div className={styles.orbitalRing1}></div>
              <div className={styles.orbitalRing2}></div>

              {/* Floating micro cards */}
              <div className={`${styles.floatingCard} ${styles.cardLeft}`}>
                <span className={styles.cardIcon}>🚚</span>
                <span className={styles.cardText}>Kovvur &amp; Rajahmundry</span>
              </div>
              <div className={`${styles.floatingCard} ${styles.cardRight}`}>
                <span className={styles.cardIcon}>🏷️</span>
                <span className={styles.cardText}>₹480 RS per tray</span>
              </div>

              <div className={styles.glassOrb}></div>
              <span className={styles.heroEgg}>🥚</span>
              <div className={styles.eggShadow}></div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefits}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose EggCart?</h2>
            <p>We pride ourselves on offering the highest quality farm-fresh eggs.</p>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={`${styles.iconBg} ${styles.greenBg}`}>
                <ShieldCheck size={28} className={styles.benefitIcon} />
              </div>
              <h3>100% Farm Fresh</h3>
              <p>Collected daily from healthy, cage-free pasture-raised chickens.</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.iconBg} ${styles.yellowBg}`}>
                <Truck size={28} className={styles.benefitIcon} />
              </div>
              <h3>Express Delivery</h3>
              <p>Safe, temperature-controlled delivery directly to your kitchen in 24 hours.</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.iconBg} ${styles.blueBg}`}>
                <Award size={28} className={styles.benefitIcon} />
              </div>
              <h3>Rich Nutrition</h3>
              <p>Higher Omega-3, vitamins, and a rich, golden yolk you will love.</p>
            </div>
          </div>
        </section>

        {/* Featured Products Catalog Section */}
        <section className={styles.featured}>
          <div className={styles.sectionHeader}>
            <h2>Featured Egg Selections</h2>
            <p>Our top-rated handpicked eggs, available in multiple pack sizes.</p>
          </div>

          {loading ? (
            <div className={styles.loaderGrid}>
              {[1, 2, 3].map(i => (
                <div key={i} className={`${styles.skeletonCard} skeleton`}></div>
              ))}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className={styles.viewAllWrapper}>
            <Link href="/products" className={styles.viewAllBtn}>Browse Full Shop Catalog</Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <h2>How It Works</h2>
            <p>Simple and convenient fresh egg ordering flow.</p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Select Egg Type</h3>
              <p>Browse our catalog of premium white, rich brown, or country eggs.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Choose Pack Size</h3>
              <p>Pick from packs of 6, 12, or bulk 30-egg trays based on your weekly needs.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Express Checkout</h3>
              <p>Select Cash on Delivery or pay online. We collect fresh and deliver to you.</p>
            </div>
          </div>
        </section>

        {/* Reviews Testimonials Section */}
        <section className={styles.reviews}>
          <div className={styles.sectionHeader}>
            <h2>Love from Our Customers</h2>
            <p>Here is what real egg lovers say about our fresh quality.</p>
          </div>
          <div className={styles.reviewsGrid}>
            <div className={styles.reviewCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className={styles.reviewText}>
                "The egg yolks are a dark orange, which is a sign of high quality. The delivery is always on time, and none of the eggs were broken!"
              </p>
              <h4 className={styles.reviewerName}>Ananya R.</h4>
              <span className={styles.reviewerMeta}>Verified Buyer</span>
            </div>
            <div className={styles.reviewCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className={styles.reviewText}>
                "Been buying the Country Eggs pack of 12 for 3 months now. They are perfect for my children. Excellent customer service!"
              </p>
              <h4 className={styles.reviewerName}>Vikram S.</h4>
              <span className={styles.reviewerMeta}>Subscription Member</span>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className={styles.cta}>
          <div className={styles.ctaBox}>
            <h2>Ready to Taste Fresh Farm Eggs?</h2>
            <p>Join over 1,200+ families receiving fresh nutrition delivered weekly.</p>
            <Link href="/products" className={styles.ctaBtn}>Place Your Order Now</Link>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
