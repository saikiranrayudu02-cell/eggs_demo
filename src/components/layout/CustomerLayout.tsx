import React from 'react';
import Navbar from './Navbar';
import styles from './CustomerLayout.module.css';
import { Phone, MapPin, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutWrapper}>
      {/* Top Announcement Bar */}
      <div className={styles.topAnnouncement}>
        <div className={styles.announcementContainer}>
          <span>🚚 Delivery in <strong>Kovvur</strong> &amp; <strong>Rajahmundry</strong></span>
          <span className={styles.dot}>•</span>
          <span>🥚 30 Eggs Tray: <strong>₹480/-</strong></span>
          <span className={styles.dot}>•</span>
          <span>🏷️ <strong>Special Discounts on Bulk Orders!</strong></span>
          <span className={styles.dot}>•</span>
          <a href="https://wa.me/916309149473" target="_blank" rel="noopener noreferrer" className={styles.topLink}>
            <Phone size={13} /> Call/WhatsApp: <strong>6309149473</strong>
          </a>
        </div>
      </div>

      <Navbar />

      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Floating WhatsApp & Instagram Buttons */}
      <div className={styles.floatingContact}>
        <a 
          href="https://www.instagram.com/sv_farms_kovvur?igsh=OTd4YW15YWdzcDNj" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.instaBtn}
          title="Follow SV Farms Kovvur on Instagram"
        >
          <InstagramIcon size={22} />
        </a>
        <a 
          href="https://wa.me/916309149473?text=Hi%20SV%20Farms,%20I%20want%20to%20order%20fresh%20eggs!" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.waBtn}
          title="Order via WhatsApp (6309149473)"
        >
          <MessageCircle size={22} />
          <span className={styles.waTooltip}>Order on WhatsApp</span>
        </a>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerLogo}>🥚 SV Farms EggCart</h3>
            <p className={styles.footerDesc}>
              Fresh farm eggs collected daily in Kovvur. Delivering 100% natural, nutrient-rich eggs straight to your kitchen in Kovvur &amp; Rajahmundry.
            </p>
            <div className={styles.socialRow}>
              <a href="https://www.instagram.com/sv_farms_kovvur?igsh=OTd4YW15YWdzcDNj" target="_blank" rel="noopener noreferrer" className={styles.socialBadge}>
                <InstagramIcon size={16} />
                <span>@sv_farms_kovvur</span>
              </a>
            </div>
          </div>
          <div className={styles.footerSection}>
            <h4>Products &amp; Pricing</h4>
            <ul>
              <li><a href="/products">30 Eggs Tray — <strong>₹480/-</strong></a></li>
              <li><a href="/products">White &amp; Brown Eggs</a></li>
              <li><a href="/products">Country Eggs</a></li>
              <li><span className={styles.highlightText}>🏷️ Special Discounts on Bulk Orders!</span></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Delivery Areas</h4>
            <ul>
              <li>🚚 Kovvur</li>
              <li>🚚 Rajahmundry</li>
              <li>
                <a href="https://goo.gl/maps/EqugjKNZ6ZVHKWQD9?g_st=aw" target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
                  📍 Google Maps Location <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact SV Farms</h4>
            <p>
              <a href="https://wa.me/916309149473" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                📱 WhatsApp: <strong>6309149473</strong>
              </a>
            </p>
            <p>📞 Phone: <strong>+91 6309149473</strong></p>
            <p>
              <a href="https://www.instagram.com/sv_farms_kovvur?igsh=OTd4YW15YWdzcDNj" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                📸 Instagram: <strong>@sv_farms_kovvur</strong>
              </a>
            </p>
            <p>
              <a href="https://goo.gl/maps/EqugjKNZ6ZVHKWQD9?g_st=aw" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                📍 Location: Kovvur, AP
              </a>
            </p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} SV Farms EggCart. Delivery available in Kovvur &amp; Rajahmundry.</p>
        </div>
      </footer>
    </div>
  );
}
