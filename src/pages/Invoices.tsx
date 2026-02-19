import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Check, Send, Trash2, FileText } from 'lucide-react';
import type { Invoice } from '../types';
import { 
  getInvoices, 
  deleteInvoice, 
  markInvoiceAsPaid, 
  markInvoiceAsSent,
  formatCurrency,
  isOverdue 
} from '../utils/storage';
import styles from './Invoices.module.css';

type FilterStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [currency] = useState('USD');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const loaded = getInvoices();
    setInvoices(loaded);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      loadInvoices();
    }
  };

  const handleMarkPaid = (id: string) => {
    markInvoiceAsPaid(id);
    loadInvoices();
  };

  const handleMarkSent = (id: string) => {
    markInvoiceAsSent(id);
    loadInvoices();
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(invoice) && invoice.status !== 'paid';
    return invoice.status === filter;
  }).sort((a, b) => {
    switch (sort) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount-desc':
        return getTotal(b) - getTotal(a);
      case 'amount-asc':
        return getTotal(a) - getTotal(b);
      default:
        return 0;
    }
  });

  function getTotal(invoice: Invoice) {
    return invoice.lineItems.reduce((sum, item) => 
      sum + item.quantity * item.rate, 0
    ) * (1 + invoice.taxPercentage / 100);
  }

  const getStatusClass = (invoice: Invoice) => {
    if (isOverdue(invoice) && invoice.status !== 'paid') {
      return styles.statusOverdue;
    }
    switch (invoice.status) {
      case 'draft': return styles.statusDraft;
      case 'sent': return styles.statusSent;
      case 'paid': return styles.statusPaid;
      default: return styles.statusDraft;
    }
  };

  const getDisplayStatus = (invoice: Invoice) => {
    if (isOverdue(invoice) && invoice.status !== 'paid') {
      return 'overdue';
    }
    return invoice.status;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Invoices</h1>
        <Link to="/invoices/new" className={styles.newButton}>
          <Plus size={18} />
          New Invoice
        </Link>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              className={`${styles.filterButton} ${filter === status ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <select 
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Invoice Table */}
      {filteredInvoices.length > 0 ? (
        <div className={styles.invoiceTable}>
          <div className={styles.tableHeader}>
            <span>Client</span>
            <span>Date</span>
            <span>Due Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          
          {filteredInvoices.map(invoice => {
            const total = getTotal(invoice);
            const status = getDisplayStatus(invoice);
            
            return (
              <div 
                key={invoice.id} 
                className={styles.tableRow}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.clientCell}>
                  <span className={styles.clientName}>{invoice.clientName}</span>
                  <span className={styles.invoiceNumber}>{invoice.invoiceNumber}</span>
                </div>
                <span className={styles.dateCell}>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
                <span className={styles.dateCell}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
                <span className={styles.amountCell}>
                  {formatCurrency(total, currency)}
                </span>
                <div className={styles.statusCell}>
                  <span className={`${styles.statusBadge} ${getStatusClass(invoice)}`}>
                    {status}
                  </span>
                  <div className={styles.rowActions} onClick={e => e.stopPropagation()}>
                    {invoice.status !== 'paid' && (
                      <>
                        {invoice.status === 'draft' && (
                          <button
                            className={styles.actionButton}
                            onClick={() => handleMarkSent(invoice.id)}
                            title="Mark as sent"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        <button
                          className={styles.actionButton}
                          onClick={() => handleMarkPaid(invoice.id)}
                          title="Mark as paid"
                        >
                          <Check size={16} />
                        </button>
                      </>
                    )}
                    <button
                      className={styles.actionButton}
                      onClick={() => handleDelete(invoice.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={40} />
          </div>
          <h3 className={styles.emptyTitle}>
            {filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
          </h3>
          <p className={styles.emptyText}>
            {filter === 'all' 
              ? 'Create your first invoice to get started' 
              : 'Try changing your filters'}
          </p>
          {filter === 'all' && (
            <Link to="/invoices/new" className={styles.newButton}>
              <Plus size={18} />
              Create Invoice
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
