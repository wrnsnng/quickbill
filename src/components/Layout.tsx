import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import styles from './Layout.module.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/invoices/new', icon: Plus, label: 'New Invoice' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <NavLink to="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>
              <Zap size={18} fill="currentColor" />
            </div>
            QuickBill
          </NavLink>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <div className={styles.upgradeCard}>
            <div className={styles.upgradeTitle}>Free Plan</div>
            <div className={styles.upgradeText}>5 invoices/month</div>
            <button className={styles.upgradeButton}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <NavLink to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <Zap size={18} fill="currentColor" />
          </div>
          QuickBill
        </NavLink>
        <button 
          className={styles.menuButton}
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${mobileNavOpen ? styles.mobileNavOpen : ''}`}>
        <div className={styles.mobileNavHeader}>
          <NavLink to="/" className={styles.logoLink} onClick={() => setMobileNavOpen(false)}>
            <div className={styles.logoIcon}>
              <Zap size={18} fill="currentColor" />
            </div>
            QuickBill
          </NavLink>
          <button 
            className={styles.closeButton}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <nav className={styles.mobileNavLinks}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
              }
            >
              <Icon size={24} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
        <footer className={styles.footer}>
          <span>QuickBill — Invoicing for freelancers</span>
          <a 
            href="https://common-tools.co" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            More tools at common-tools.co →
          </a>
        </footer>
      </main>
    </div>
  );
}
