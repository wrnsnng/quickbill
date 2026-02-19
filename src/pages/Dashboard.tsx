import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { Invoice, DashboardStats } from '../types';
import { 
  getInvoices, 
  getSettings, 
  formatCurrency,
  isOverdue 
} from '../utils/storage';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOutstanding: 0,
    paidThisMonth: 0,
    overdueCount: 0,
    totalInvoices: 0,
  });
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const loadedInvoices = getInvoices();
    const settings = getSettings();
    setCurrency(settings.defaultCurrency);
    
    // Sort by created date, newest first
    loadedInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setInvoices(loadedInvoices);

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalOutstanding = 0;
    let paidThisMonth = 0;
    let overdueCount = 0;

    loadedInvoices.forEach(invoice => {
      const total = invoice.lineItems.reduce((sum, item) => 
        sum + item.quantity * item.rate, 0
      ) * (1 + invoice.taxPercentage / 100);

      if (invoice.status === 'paid') {
        if (invoice.paidAt && new Date(invoice.paidAt) >= startOfMonth) {
          paidThisMonth += total;
        }
      } else if (isOverdue(invoice)) {
        overdueCount++;
        totalOutstanding += total;
      } else if (invoice.status === 'sent') {
        totalOutstanding += total;
      }
    });

    setStats({
      totalOutstanding,
      paidThisMonth,
      overdueCount,
      totalInvoices: loadedInvoices.length,
    });
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return styles.statusDraft;
      case 'sent': return styles.statusSent;
      case 'paid': return styles.statusPaid;
      case 'overdue': return styles.statusOverdue;
      default: return styles.statusDraft;
    }
  };

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of your invoices and payments</p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Outstanding</span>
            <div className={`${styles.statIcon} ${styles.statIconOutstanding}`}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.statValue}>
            {formatCurrency(stats.totalOutstanding, currency)}
          </div>
          <div className={styles.statSubtext}>Awaiting payment</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Paid This Month</span>
            <div className={`${styles.statIcon} ${styles.statIconPaid}`}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className={styles.statValue}>
            {formatCurrency(stats.paidThisMonth, currency)}
          </div>
          <div className={styles.statSubtext}>Revenue collected</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Overdue</span>
            <div className={`${styles.statIcon} ${styles.statIconOverdue}`}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.overdueCount}</div>
          <div className={styles.statSubtext}>
            {stats.overdueCount === 1 ? 'Invoice' : 'Invoices'} past due
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Invoices</span>
            <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
              <FileText size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalInvoices}</div>
          <div className={styles.statSubtext}>All time</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Recent Invoices */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Invoices</h2>
            <Link to="/invoices" className={styles.viewAllLink}>
              View all →
            </Link>
          </div>
          
          {recentInvoices.length > 0 ? (
            <ul className={styles.invoiceList}>
              {recentInvoices.map(invoice => {
                const total = invoice.lineItems.reduce((sum, item) => 
                  sum + item.quantity * item.rate, 0
                ) * (1 + invoice.taxPercentage / 100);
                
                const status = isOverdue(invoice) && invoice.status !== 'paid' 
                  ? 'overdue' 
                  : invoice.status;

                return (
                  <li key={invoice.id} className={styles.invoiceItem}>
                    <div className={styles.invoiceInfo}>
                      <div className={styles.invoiceAvatar}>
                        {getInitials(invoice.clientName)}
                      </div>
                      <div className={styles.invoiceDetails}>
                        <div className={styles.invoiceClient}>
                          {invoice.clientName}
                        </div>
                        <div className={styles.invoiceNumber}>
                          {invoice.invoiceNumber}
                        </div>
                      </div>
                    </div>
                    <div className={styles.invoiceMeta}>
                      <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                        {status}
                      </span>
                      <span className={styles.invoiceDue}>
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                      <span className={styles.invoiceAmount}>
                        {formatCurrency(total, currency)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FileText size={32} />
              </div>
              <h3 className={styles.emptyTitle}>No invoices yet</h3>
              <p className={styles.emptyText}>
                Create your first invoice to get started
              </p>
              <Link to="/invoices/new" className={styles.createButton}>
                <Plus size={18} />
                Create Invoice
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
          </div>
          <div className={styles.quickActions}>
            <Link to="/invoices/new" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>
                <Plus size={20} />
              </div>
              <span className={styles.quickActionText}>Create New Invoice</span>
            </Link>
            <Link to="/invoices" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>
                <FileText size={20} />
              </div>
              <span className={styles.quickActionText}>View All Invoices</span>
            </Link>
            <Link to="/clients" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>
                <Users size={20} />
              </div>
              <span className={styles.quickActionText}>Manage Clients</span>
            </Link>
            <Link to="/settings" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>
                <Settings size={20} />
              </div>
              <span className={styles.quickActionText}>Update Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
