import { useState, useRef } from 'react';
import { Check, Upload, Zap } from 'lucide-react';
import type { Settings } from '../types';
import { getSettings, saveSettings } from '../utils/storage';
import styles from './Settings.module.css';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo: undefined }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <div className={styles.settingsCard}>
        {/* Business Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Business Information</h2>
          
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Business Logo</label>
              <div className={styles.logoUpload}>
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Business logo" 
                    className={styles.logoPreview}
                  />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <Zap size={32} />
                  </div>
                )}
                <div className={styles.logoActions}>
                  <button 
                    className={styles.logoButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} style={{ marginRight: 'var(--space-2)' }} />
                    Upload Logo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.logoInput}
                  />
                  {settings.logo && (
                    <button 
                      className={styles.removeLogo}
                      onClick={removeLogo}
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Business Name</label>
              <input
                type="text"
                className={styles.input}
                value={settings.businessName}
                onChange={e => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="My Business"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Business Email</label>
              <input
                type="email"
                className={styles.input}
                value={settings.businessEmail}
                onChange={e => setSettings(prev => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="hello@mybusiness.com"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Business Address</label>
              <textarea
                className={styles.textarea}
                value={settings.businessAddress}
                onChange={e => setSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                placeholder="123 Main St\nCity, State 12345\nCountry"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Default Invoice Settings</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Default Currency</label>
              <select
                className={styles.select}
                value={settings.defaultCurrency}
                onChange={e => setSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Default Tax (%)</label>
              <input
                type="number"
                className={styles.input}
                value={settings.defaultTaxPercentage}
                onChange={e => setSettings(prev => ({ ...prev, defaultTaxPercentage: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Default Payment Terms (days)</label>
              <input
                type="number"
                className={styles.input}
                value={settings.defaultPaymentTerms}
                onChange={e => setSettings(prev => ({ ...prev, defaultPaymentTerms: parseInt(e.target.value) || 14 }))}
                min="1"
                max="365"
              />
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Plan</h2>
          
          <div className={styles.planCard}>
            <div className={styles.planInfo}>
              <h3>Free Plan</h3>
              <p>5 invoices per month • Basic features</p>
            </div>
            <button className={styles.upgradeButton}>
              Upgrade to Pro — $9/mo
            </button>
          </div>
        </div>

        {/* Save */}
        <div className={styles.saveSection}>
          {saved && (
            <span className={styles.successMessage}>
              <Check size={16} />
              Settings saved
            </span>
          )}
          <button 
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
