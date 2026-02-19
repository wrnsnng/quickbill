export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  lineItems: LineItem[];
  taxPercentage: number;
  dueDate: string;
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
  paidAt?: string;
  sentAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address?: string;
  totalInvoices: number;
  totalBilled: number;
  lastInvoiceDate?: string;
}

export interface Settings {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  logo?: string;
  defaultCurrency: string;
  defaultTaxPercentage: number;
  defaultPaymentTerms: number;
}

export interface DashboardStats {
  totalOutstanding: number;
  paidThisMonth: number;
  overdueCount: number;
  totalInvoices: number;
}
