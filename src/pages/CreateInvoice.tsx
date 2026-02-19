import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Invoice, LineItem, Settings } from '../types';
import { 
  getInvoices, 
  getSettings, 
  saveInvoice, 
  generateInvoiceNumber,
  calculateInvoiceTotals,
  formatCurrency 
} from '../utils/storage';
import { InvoicePreview } from '../components/InvoicePreview';
import styles from './CreateInvoice.module.css';

export function CreateInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<Settings>(getSettings());
  
  const [invoice, setInvoice] = useState<Invoice>({
    id: crypto.randomUUID(),
    invoiceNumber: generateInvoiceNumber(),
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    lineItems: [
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }
    ],
    taxPercentage: settings.defaultTaxPercentage,
    dueDate: new Date(Date.now() + settings.defaultPaymentTerms * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (id) {
      const existing = getInvoices().find(i => i.id === id);
      if (existing) {
        setInvoice(existing);
      }
    }
    setSettings(getSettings());
  }, [id]);

  const handleSave = () => {
    if (!invoice.clientName || !invoice.clientEmail) {
      alert('Please fill in client name and email');
      return;
    }
    
    if (invoice.lineItems.some(item => !item.description || item.rate <= 0)) {
      alert('Please fill in all line items with description and rate');
      return;
    }

    saveInvoice(invoice);
    navigate('/invoices');
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    
    const link = document.createElement('a');
    link.download = `${invoice.invoiceNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }
      ]
    }));
  };

  const removeLineItem = (id: string) => {
    if (invoice.lineItems.length <= 1) return;
    setInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const { subtotal, tax, total } = calculateInvoiceTotals(invoice.lineItems, invoice.taxPercentage);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {id ? 'Edit Invoice' : 'Create Invoice'}
        </h1>
        <div className={styles.headerActions}>
          <button 
            className={styles.cancelButton}
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save Invoice
          </button>
        </div>
      </header>

      <div className={styles.formLayout}>
        {/* Form */}
        <div className={styles.formSection}>
          {/* Client Info */}
          <h2 className={styles.sectionTitle}>Client Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Client Name *</label>
              <input
                type="text"
                className={styles.input}
                value={invoice.clientName}
                onChange={e => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="John Smith"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Client Email *</label>
              <input
                type="email"
                className={styles.input}
                value={invoice.clientEmail}
                onChange={e => setInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Client Address</label>
              <textarea
                className={styles.textarea}
                value={invoice.clientAddress}
                onChange={e => setInvoice(prev => ({ ...prev, clientAddress: e.target.value }))}
                placeholder="123 Main St, City, Country"
                rows={3}
              />
            </div>
          </div>

          {/* Invoice Details */}
          <h2 className={styles.sectionTitle} style={{ marginTop: 'var(--space-8)' }}>
            Invoice Details
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Invoice Number</label>
              <input
                type="text"
                className={styles.input}
                value={invoice.invoiceNumber}
                onChange={e => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                className={styles.input}
                value={invoice.dueDate}
                onChange={e => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tax Percentage (%)</label>
              <input
                type="number"
                className={styles.input}
                value={invoice.taxPercentage}
                onChange={e => setInvoice(prev => ({ ...prev, taxPercentage: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={invoice.status}
                onChange={e => setInvoice(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className={styles.lineItemsSection}>
            <h2 className={styles.sectionTitle}>Line Items</h2>
            
            {invoice.lineItems.map((item) => (
              <div key={item.id} className={styles.lineItem}>
                <input
                  type="text"
                  className={styles.lineItemInput}
                  placeholder="Description"
                  value={item.description}
                  onChange={e => updateLineItem(item.id, { description: e.target.value })}
                />
                <input
                  type="number"
                  className={styles.lineItemInput}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                  min="1"
                />
                <input
                  type="number"
                  className={styles.lineItemInput}
                  placeholder="Rate"
                  value={item.rate}
                  onChange={e => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <input
                  type="text"
                  className={styles.lineItemInput}
                  value={formatCurrency(item.quantity * item.rate, settings.defaultCurrency)}
                  readOnly
                  style={{ background: 'var(--color-bg)' }}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => removeLineItem(item.id)}
                  disabled={invoice.lineItems.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            <button className={styles.addButton} onClick={addLineItem}>
              <Plus size={16} />
              Add Line Item
            </button>
          </div>

          {/* Totals */}
          <div className={styles.totals}>
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

          {/* Notes */}
          <div className={styles.formGroup} style={{ marginTop: 'var(--space-6)' }}>
            <label className={styles.label}>Notes</label>
            <textarea
              className={styles.textarea}
              value={invoice.notes}
              onChange={e => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Payment terms, bank details, or any other notes..."
              rows={4}
            />
          </div>
        </div>

        {/* Preview */}
        <div className={styles.previewSection}>
          <InvoicePreview 
            ref={previewRef}
            invoice={invoice} 
            settings={settings}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}
