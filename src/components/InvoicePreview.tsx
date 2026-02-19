import { forwardRef } from 'react';
import { Printer, Download, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import type { Invoice, Settings } from '../types';
import { formatCurrency, calculateInvoiceTotals } from '../utils/storage';
import styles from './InvoicePreview.module.css';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: Settings;
  onDownload?: () => void;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice, settings, onDownload }, ref) {
    const { subtotal, tax, total } = calculateInvoiceTotals(invoice.lineItems, invoice.taxPercentage);

    const getStatusClass = () => {
      switch (invoice.status) {
        case 'draft': return styles.statusDraft;
        case 'sent': return styles.statusSent;
        case 'paid': return styles.statusPaid;
        case 'overdue': return styles.statusOverdue;
        default: return styles.statusDraft;
      }
    };

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>Preview</span>
          <div className={styles.previewActions}>
            <button 
              className={styles.iconButton}
              onClick={handlePrint}
              title="Print"
            >
              <Printer size={18} />
            </button>
            {onDownload && (
              <button 
                className={styles.iconButton}
                onClick={onDownload}
                title="Download PDF"
              >
                <Download size={18} />
              </button>
            )}
          </div>
        </div>
        
        <div ref={ref} className={styles.invoicePaper}>
          {/* Header */}
          <div className={styles.invoiceHeader}>
            <div className={styles.businessInfo}>
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.businessName}
                  className={styles.businessLogo}
                />
              ) : (
                <div className={styles.businessLogoPlaceholder}>
                  <FileCheck size={28} />
                </div>
              )}
              <div>
                <div className={styles.businessName}>{settings.businessName}</div>
                <div className={styles.businessDetails}>
                  {settings.businessAddress}
                </div>
              </div>
            </div>
            
            <div className={styles.invoiceMeta}>
              <div className={styles.invoiceLabel}>Invoice</div>
              <div className={styles.invoiceNumber}>{invoice.invoiceNumber}</div>
              <div className={styles.invoiceDateRow}>
                <div className={styles.invoiceDateItem}>
                  <div className={styles.invoiceDateLabel}>Issued</div>
                  <div className={styles.invoiceDateValue}>
                    {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className={styles.invoiceDateItem}>
                  <div className={styles.invoiceDateLabel}>Due</div>
                  <div className={styles.invoiceDateValue}>
                    {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className={styles.clientSection}>
            <div className={styles.clientLabel}>Bill To</div>
            <div className={styles.clientName}>{invoice.clientName}</div>
            <div className={styles.clientDetails}>
              {invoice.clientEmail}
              {invoice.clientAddress && (
                <>
                  <br />
                  {invoice.clientAddress}
                </>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className={styles.lineItems}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.description}`}>
                      {item.description}
                    </td>
                    <td className={`${styles.tableCell} ${styles.quantity}`} style={{ textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td className={`${styles.tableCell} ${styles.rate}`} style={{ textAlign: 'right' }}>
                      {formatCurrency(item.rate, settings.defaultCurrency)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.amount}`} style={{ textAlign: 'right' }}>
                      {formatCurrency(item.quantity * item.rate, settings.defaultCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className={styles.totals}>
            <div className={styles.totalsTable}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, settings.defaultCurrency)}</span>
              </div>
              {invoice.taxPercentage > 0 && (
                <div className={styles.totalRow}>
                  <span>Tax ({invoice.taxPercentage}%)</span>
                  <span>{formatCurrency(tax, settings.defaultCurrency)}</span>
                </div>
              )}
              <div className={styles.totalRowGrand}>
                <span>Total</span>
                <span>{formatCurrency(total, settings.defaultCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className={styles.notes}>
              <div className={styles.notesLabel}>Notes</div>
              <div className={styles.notesText}>{invoice.notes}</div>
            </div>
          )}

          {/* Status Badge */}
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <span className={`${styles.statusBadge} ${getStatusClass()}`}>
              {invoice.status === 'paid' && '✓ '}
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
