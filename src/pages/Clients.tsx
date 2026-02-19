import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import type { Client } from '../types';
import { getClients, formatCurrency } from '../utils/storage';
import styles from './Clients.module.css';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalBilled, setTotalBilled] = useState(0);
  const [currency] = useState('USD');

  useEffect(() => {
    const loadedClients = getClients();
    setClients(loadedClients);
    
    const total = loadedClients.reduce((sum, client) => sum + client.totalBilled, 0);
    setTotalBilled(total);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Clients</h1>
        <p className={styles.subtitle}>
          {clients.length} {clients.length === 1 ? 'client' : 'clients'} in your directory
        </p>
      </header>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{clients.length}</div>
          <div className={styles.statLabel}>Total Clients</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {formatCurrency(totalBilled, currency)}
          </div>
          <div className={styles.statLabel}>Total Billed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {clients.length > 0 
              ? Math.round(clients.reduce((sum, c) => sum + c.totalInvoices, 0) / clients.length)
              : 0
            }
          </div>
          <div className={styles.statLabel}>Avg Invoices/Client</div>
        </div>
      </div>

      {/* Client List */}
      {clients.length > 0 ? (
        <div className={styles.clientList}>
          <div className={styles.tableHeader}>
            <span>Client</span>
            <span>Email</span>
            <span>Invoices</span>
            <span>Total Billed</span>
            <span>Last Invoice</span>
          </div>
          
          {clients.map(client => (
            <div key={client.id} className={styles.tableRow}>
              <div className={styles.clientCell}>
                <div className={styles.clientAvatar}>
                  {getInitials(client.name)}
                </div>
                <span className={styles.clientName}>{client.name}</span>
              </div>
              <span className={styles.cellSecondary}>{client.email}</span>
              <span className={styles.cell}>{client.totalInvoices}</span>
              <span className={styles.cell}>
                {formatCurrency(client.totalBilled, currency)}
              </span>
              <span className={styles.cellSecondary}>
                {client.lastInvoiceDate 
                  ? new Date(client.lastInvoiceDate).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Users size={40} />
          </div>
          <h3 className={styles.emptyTitle}>No clients yet</h3>
          <p className={styles.emptyText}>
            Clients are automatically added when you create invoices
          </p>
          <Link to="/invoices/new" className={styles.createButton}>
            <Plus size={18} />
            Create Your First Invoice
          </Link>
        </div>
      )}
    </div>
  );
}
