import type { Invoice, Client, Settings } from '../types';

const STORAGE_KEYS = {
  invoices: 'quickbill_invoices',
  clients: 'quickbill_clients',
  settings: 'quickbill_settings',
};

const defaultSettings: Settings = {
  businessName: 'My Business',
  businessEmail: '',
  businessAddress: '',
  defaultCurrency: 'USD',
  defaultTaxPercentage: 0,
  defaultPaymentTerms: 14,
};

// Invoices
export const getInvoices = (): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.invoices);
  return data ? JSON.parse(data) : [];
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
  updateClientFromInvoice(invoice);
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
};

export const markInvoiceAsPaid = (id: string): void => {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === id);
  if (invoice) {
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
  }
};

export const markInvoiceAsSent = (id: string): void => {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === id);
  if (invoice) {
    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
  }
};

// Clients
export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.clients);
  return data ? JSON.parse(data) : [];
};

export const updateClientFromInvoice = (invoice: Invoice): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.email.toLowerCase() === invoice.clientEmail.toLowerCase());
  
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (invoice.taxPercentage / 100);
  const total = subtotal + tax;
  
  if (existingIndex >= 0) {
    const client = clients[existingIndex];
    client.totalInvoices += 1;
    client.totalBilled += total;
    client.lastInvoiceDate = invoice.createdAt;
    if (invoice.clientAddress) client.address = invoice.clientAddress;
  } else {
    clients.push({
      id: crypto.randomUUID(),
      name: invoice.clientName,
      email: invoice.clientEmail,
      address: invoice.clientAddress,
      totalInvoices: 1,
      totalBilled: total,
      lastInvoiceDate: invoice.createdAt,
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
};

// Settings
export const getSettings = (): Settings => {
  const data = localStorage.getItem(STORAGE_KEYS.settings);
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const count = invoices.length + 1;
  return `INV-${year}-${count.toString().padStart(4, '0')}`;
};

// Calculate invoice totals
export const calculateInvoiceTotals = (lineItems: { quantity: number; rate: number }[], taxPercentage: number) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (taxPercentage / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Check if invoice is overdue
export const isOverdue = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid') return false;
  return new Date(invoice.dueDate) < new Date();
};
