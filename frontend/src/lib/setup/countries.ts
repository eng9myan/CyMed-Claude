/**
 * CyMed Country Bundles
 *
 * Each country bundle wires up the regulatory + financial infrastructure for
 * that jurisdiction in one click. Bundles include:
 *   - Chart of accounts template
 *   - Tax codes (VAT/GST/sales tax)
 *   - Social security / pension registry
 *   - Medical insurance integration
 *   - E-invoicing integration
 *   - Banking integration
 *   - Currency and language defaults
 *
 * Adding a new country = add one entry below. All UI is auto-generated.
 */

export type IntegrationStatus = 'pre-built' | 'oauth-ready' | 'coming-soon';

export interface Integration {
  id: string;
  name: string;
  category: 'einvoice' | 'tax' | 'social-security' | 'medical-insurance' | 'procurement' | 'banking' | 'health-info';
  description: string;
  status: IntegrationStatus;
  authType: 'oauth2' | 'api-key' | 'certificate' | 'username-password' | 'manual';
  fields: { key: string; label: string; type: 'text' | 'password' | 'file' | 'select'; required: boolean; help?: string; options?: string[] }[];
  website?: string;
  setupTime: string;
}

export interface Country {
  iso2: string;
  name: string;
  flag: string;
  currency: { code: string; symbol: string; name: string };
  language: string;
  // Pre-loaded data templates
  chartOfAccounts: string;
  taxRegime: string;
  fiscalYearStart: string; // MM-DD
  workingWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  publicHolidaysSource: string;
  socialSecuritySystem?: { name: string; employerRate: string; employeeRate: string; ceiling?: string };
  endOfServiceRule?: string;
  // Integrations available for this country
  integrations: Integration[];
}

// ── Integration definitions (reusable) ──────────────────────────────────────

const NUPCO: Integration = {
  id: 'nupco',
  name: 'NUPCO — Saudi Medical Procurement',
  category: 'procurement',
  description: 'National Unified Procurement Company. Connect for catalog-driven medical procurement, contract pricing, and ministry compliance.',
  status: 'oauth-ready',
  authType: 'oauth2',
  fields: [
    { key: 'client_id',     label: 'NUPCO Client ID',     type: 'text',     required: true,  help: 'Issued by nupco.com supplier portal' },
    { key: 'client_secret', label: 'NUPCO Client Secret', type: 'password', required: true },
    { key: 'facility_id',   label: 'Facility ID (CR)',    type: 'text',     required: true,  help: 'Commercial registration of your facility' },
    { key: 'env',           label: 'Environment',         type: 'select',   required: true,  options: ['Sandbox', 'Production'] },
  ],
  website: 'https://www.nupco.com',
  setupTime: '~10 minutes',
};

const ZATCA: Integration = {
  id: 'zatca',
  name: 'ZATCA — Saudi E-Invoicing (Phase 2)',
  category: 'einvoice',
  description: 'Zakat, Tax and Customs Authority. Real-time clearance and reporting of invoices via Fatoora platform. Required for all VAT-registered Saudi businesses.',
  status: 'pre-built',
  authType: 'certificate',
  fields: [
    { key: 'vat_number',    label: 'VAT Registration Number',  type: 'text', required: true, help: '15-digit Saudi VAT TIN ending in 03' },
    { key: 'csr',           label: 'CSR (Certificate Signing Request)', type: 'file', required: true, help: 'Generated via Fatoora portal' },
    { key: 'otp',           label: 'OTP from Fatoora Portal',  type: 'text', required: true },
    { key: 'env',           label: 'Environment',              type: 'select', required: true, options: ['Sandbox', 'Simulation', 'Production'] },
    { key: 'production_csid',label: 'Production CSID (after clearance)', type: 'text', required: false },
  ],
  website: 'https://zatca.gov.sa',
  setupTime: '~30 minutes',
};

const JOFOTARA: Integration = {
  id: 'jofotara',
  name: 'JoFotara — Jordan E-Invoicing',
  category: 'einvoice',
  description: 'Jordan ISTD electronic invoicing platform. UBL 2.1 compliant submission with real-time clearance for VAT-registered Jordanian businesses.',
  status: 'pre-built',
  authType: 'api-key',
  fields: [
    { key: 'client_id',     label: 'JoFotara Client ID',        type: 'text',     required: true, help: 'Issued by ISTD after onboarding' },
    { key: 'secret_key',    label: 'JoFotara Secret Key',       type: 'password', required: true },
    { key: 'taxpayer_id',   label: 'Taxpayer National Number',  type: 'text',     required: true },
    { key: 'activity_code', label: 'Activity Code',             type: 'text',     required: true, help: 'Sector classification per ISTD' },
    { key: 'env',           label: 'Environment',               type: 'select',   required: true, options: ['Sandbox', 'Production'] },
  ],
  website: 'https://www.istd.gov.jo',
  setupTime: '~15 minutes',
};

const GOSI: Integration = {
  id: 'gosi',
  name: 'GOSI — General Organization for Social Insurance',
  category: 'social-security',
  description: 'Automated employee registration, monthly contribution calculation, and WPS-compatible salary file submission for Saudi labor compliance.',
  status: 'pre-built',
  authType: 'api-key',
  fields: [
    { key: 'employer_no',   label: 'GOSI Employer Number',  type: 'text',     required: true },
    { key: 'api_key',       label: 'Mudad API Key',         type: 'password', required: true, help: 'Obtained via Mudad portal' },
    { key: 'wps_bank',      label: 'WPS Bank',              type: 'select',   required: true, options: ['Al Rajhi', 'SABB', 'Riyad Bank', 'SNB', 'Banque Saudi Fransi', 'Arab National Bank'] },
    { key: 'wps_iban',      label: 'WPS IBAN',              type: 'text',     required: true },
  ],
  website: 'https://www.gosi.gov.sa',
  setupTime: '~10 minutes',
};

const NPHIES: Integration = {
  id: 'nphies',
  name: 'NPHIES — Saudi National Platform for Health Information Exchange',
  category: 'medical-insurance',
  description: 'Real-time insurance eligibility verification, pre-authorization, and claim submission. Required for all Saudi healthcare facilities.',
  status: 'pre-built',
  authType: 'certificate',
  fields: [
    { key: 'provider_license',  label: 'CHI Provider License',     type: 'text',     required: true, help: 'Council of Health Insurance license number' },
    { key: 'cert',              label: 'mTLS Client Certificate',  type: 'file',     required: true },
    { key: 'cert_password',     label: 'Certificate Password',     type: 'password', required: true },
    { key: 'env',               label: 'Environment',              type: 'select',   required: true, options: ['Test', 'Pre-Prod', 'Production'] },
  ],
  website: 'https://nphies.sa',
  setupTime: '~20 minutes',
};

const SFDA: Integration = {
  id: 'sfda',
  name: 'SFDA RSD — Saudi Drug Registry',
  category: 'procurement',
  description: 'Real-time SFDA drug code validation, manufacturer/HCP licensing checks, recall notifications. Pre-required for pharmacy operations.',
  status: 'pre-built',
  authType: 'api-key',
  fields: [
    { key: 'license_no',  label: 'SFDA Pharmacy License',  type: 'text',     required: true },
    { key: 'api_key',     label: 'SFDA Open API Key',      type: 'password', required: true },
  ],
  website: 'https://www.sfda.gov.sa',
  setupTime: '~5 minutes',
};

const MUDAD: Integration = {
  id: 'mudad',
  name: 'Mudad — Saudi Wage Protection',
  category: 'social-security',
  description: 'SAMA-mandated WPS salary file submission, employee bank verification, and Ajeer freelancer integration.',
  status: 'pre-built',
  authType: 'api-key',
  fields: [
    { key: 'establishment_no', label: 'Establishment Number', type: 'text',     required: true },
    { key: 'api_key',          label: 'Mudad API Key',        type: 'password', required: true },
  ],
  website: 'https://mudad.com.sa',
  setupTime: '~10 minutes',
};

// ── International integrations (sampled) ────────────────────────────────────

const HMRC_VAT: Integration = {
  id: 'hmrc-vat',
  name: 'HMRC Making Tax Digital — UK',
  category: 'tax',
  description: 'UK VAT digital submission per MTD requirements. Quarterly returns via HMRC API.',
  status: 'oauth-ready', authType: 'oauth2',
  fields: [
    { key: 'vat_number', label: 'VAT Number', type: 'text', required: true },
    { key: 'env',        label: 'Environment',type: 'select', required: true, options: ['Sandbox', 'Production'] },
  ],
  website: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
  setupTime: '~10 minutes',
};

const IRS_AFFORDABLE: Integration = {
  id: 'irs-aca',
  name: 'IRS ACA Reporting — USA',
  category: 'tax',
  description: 'Affordable Care Act 1094-B / 1095-B / 1095-C reporting via IRS AIR system. Required for US healthcare employers.',
  status: 'oauth-ready', authType: 'username-password',
  fields: [
    { key: 'ein',       label: 'EIN',          type: 'text',     required: true },
    { key: 'tcc',       label: 'TCC Code',     type: 'text',     required: true, help: 'IRS Transmitter Control Code' },
    { key: 'username',  label: 'IRS Username', type: 'text',     required: true },
    { key: 'password',  label: 'IRS Password', type: 'password', required: true },
  ],
  website: 'https://www.irs.gov/aca',
  setupTime: '~30 minutes',
};

const FRANCE_FEC: Integration = {
  id: 'fr-fec',
  name: 'France FEC — Fichier Écritures Comptables',
  category: 'tax',
  description: 'French tax administration accounting file format. DGFiP-compliant export of journal entries.',
  status: 'pre-built', authType: 'manual',
  fields: [
    { key: 'siret', label: 'SIRET', type: 'text', required: true },
  ],
  website: 'https://www.impots.gouv.fr',
  setupTime: '~5 minutes',
};

const FRANCE_PDP: Integration = {
  id: 'fr-pdp',
  name: 'Chorus Pro / PDP — France E-Invoicing',
  category: 'einvoice',
  description: 'French B2B e-invoicing via Plateforme de Dématérialisation Partenaire. Required for all B2B from 2026.',
  status: 'pre-built', authType: 'api-key',
  fields: [
    { key: 'pdp_id',     label: 'PDP Operator ID', type: 'text', required: true },
    { key: 'api_key',    label: 'PDP API Key',     type: 'password', required: true },
  ],
  website: 'https://chorus-pro.gouv.fr',
  setupTime: '~20 minutes',
};

const ITALY_SDI: Integration = {
  id: 'it-sdi',
  name: 'Sistema di Interscambio (SdI) — Italy',
  category: 'einvoice',
  description: 'Italian Revenue Agency mandatory e-invoicing exchange system. FatturaPA XML.',
  status: 'pre-built', authType: 'certificate',
  fields: [
    { key: 'vat',  label: 'Partita IVA',     type: 'text', required: true },
    { key: 'cert', label: 'mTLS Certificate',type: 'file', required: true },
  ],
  website: 'https://www.agenziaentrate.gov.it',
  setupTime: '~15 minutes',
};

const SPAIN_TBAI: Integration = {
  id: 'es-tbai',
  name: 'TicketBAI / SII / Verifactu — Spain',
  category: 'einvoice',
  description: 'Spanish e-invoicing — TBAI for Basque Country, SII for VAT real-time, Verifactu for national.',
  status: 'pre-built', authType: 'certificate',
  fields: [
    { key: 'nif',     label: 'NIF',             type: 'text', required: true },
    { key: 'region',  label: 'Region',          type: 'select', required: true, options: ['Common Territory', 'Bizkaia', 'Gipuzkoa', 'Araba'] },
    { key: 'cert',    label: 'AEAT Certificate',type: 'file', required: true },
  ],
  website: 'https://www.agenciatributaria.es',
  setupTime: '~20 minutes',
};

const EGYPT_ETA: Integration = {
  id: 'eg-eta',
  name: 'ETA — Egypt E-Invoicing',
  category: 'einvoice',
  description: 'Egyptian Tax Authority real-time e-invoicing platform.',
  status: 'pre-built', authType: 'certificate',
  fields: [
    { key: 'taxpayer_id', label: 'Taxpayer Activity ID', type: 'text', required: true },
    { key: 'cert',        label: 'eSeal Certificate',    type: 'file', required: true },
    { key: 'env',         label: 'Environment',          type: 'select', required: true, options: ['Preprod', 'Production'] },
  ],
  website: 'https://invoicing.eta.gov.eg',
  setupTime: '~15 minutes',
};

const UAE_FTA: Integration = {
  id: 'ae-fta',
  name: 'FTA — UAE Federal Tax Authority',
  category: 'tax',
  description: 'UAE VAT, Corporate Tax filing, and Phase 2 e-invoicing (effective 2026).',
  status: 'oauth-ready', authType: 'oauth2',
  fields: [
    { key: 'trn', label: 'TRN', type: 'text', required: true, help: 'Tax Registration Number' },
    { key: 'env', label: 'Environment', type: 'select', required: true, options: ['Sandbox', 'Production'] },
  ],
  website: 'https://www.tax.gov.ae',
  setupTime: '~15 minutes',
};

const INDIA_GST: Integration = {
  id: 'in-gst',
  name: 'GST + E-Invoice + E-Way Bill — India',
  category: 'einvoice',
  description: 'GSTN portal integration, IRP e-invoice clearance, and E-Way Bill generation.',
  status: 'pre-built', authType: 'api-key',
  fields: [
    { key: 'gstin',   label: 'GSTIN',         type: 'text',     required: true },
    { key: 'api_key', label: 'GSP API Key',   type: 'password', required: true },
  ],
  website: 'https://einvoice1.gst.gov.in',
  setupTime: '~10 minutes',
};

const GERMANY_X_RECHNUNG: Integration = {
  id: 'de-xrechnung',
  name: 'XRechnung — Germany',
  category: 'einvoice',
  description: 'German federal e-invoicing standard for B2G and (from 2027) B2B.',
  status: 'pre-built', authType: 'manual',
  fields: [
    { key: 'leitweg_id', label: 'Leitweg-ID', type: 'text', required: true },
  ],
  website: 'https://xeinkauf.de',
  setupTime: '~10 minutes',
};

const PEPPOL: Integration = {
  id: 'peppol',
  name: 'PEPPOL Network',
  category: 'einvoice',
  description: 'Pan-European Public Procurement OnLine — cross-border B2G/B2B e-invoicing covering 40+ countries.',
  status: 'pre-built', authType: 'api-key',
  fields: [
    { key: 'access_point', label: 'PEPPOL Access Point', type: 'select', required: true, options: ['Storecove', 'Tickstar', 'Pagero', 'B2BRouter'] },
    { key: 'api_key',      label: 'Access Point API Key', type: 'password', required: true },
    { key: 'peppol_id',    label: 'Your PEPPOL ID',     type: 'text', required: true },
  ],
  website: 'https://peppol.org',
  setupTime: '~15 minutes',
};

// ── Country bundles ─────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [

  // ── GCC ──
  {
    iso2: 'SA', name: 'Saudi Arabia', flag: '🇸🇦',
    currency: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    language: 'ar', chartOfAccounts: 'Saudi GAAP + IFRS', taxRegime: 'VAT 15% (ZATCA)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Saudi MHRSD calendar (Hijri)',
    socialSecuritySystem: { name: 'GOSI', employerRate: '11.75%', employeeRate: '9.75%', ceiling: 'SAR 45,000/mo' },
    endOfServiceRule: 'Saudi Labour Law Article 84',
    integrations: [ZATCA, GOSI, MUDAD, NPHIES, NUPCO, SFDA],
  },
  {
    iso2: 'AE', name: 'United Arab Emirates', flag: '🇦🇪',
    currency: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    language: 'ar', chartOfAccounts: 'IFRS', taxRegime: 'VAT 5% + Corporate Tax 9%',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'UAE Cabinet calendar',
    socialSecuritySystem: { name: 'GPSSA (UAE Nationals)', employerRate: '12.5%', employeeRate: '5%' },
    endOfServiceRule: 'UAE Labour Law (gratuity)',
    integrations: [UAE_FTA, PEPPOL],
  },
  {
    iso2: 'JO', name: 'Jordan', flag: '🇯🇴',
    currency: { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar' },
    language: 'ar', chartOfAccounts: 'Jordan GAAP', taxRegime: 'Sales Tax 16% (ISTD)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Jordan MoL calendar',
    socialSecuritySystem: { name: 'SSC Jordan', employerRate: '14.25%', employeeRate: '7.5%' },
    endOfServiceRule: 'Jordan Labour Law Art. 32',
    integrations: [JOFOTARA],
  },
  {
    iso2: 'BH', name: 'Bahrain', flag: '🇧🇭',
    currency: { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
    language: 'ar', chartOfAccounts: 'IFRS', taxRegime: 'VAT 10% (NBR)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Bahrain MoL calendar',
    socialSecuritySystem: { name: 'SIO Bahrain', employerRate: '12%', employeeRate: '7%' },
    endOfServiceRule: 'Bahrain Labour Law',
    integrations: [],
  },
  {
    iso2: 'KW', name: 'Kuwait', flag: '🇰🇼',
    currency: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
    language: 'ar', chartOfAccounts: 'IFRS', taxRegime: 'No VAT (corporate tax foreign only)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Kuwait MSAL calendar',
    socialSecuritySystem: { name: 'PIFSS', employerRate: '11.5%', employeeRate: '8%' },
    endOfServiceRule: 'Kuwait Labour Law',
    integrations: [],
  },
  {
    iso2: 'QA', name: 'Qatar', flag: '🇶🇦',
    currency: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
    language: 'ar', chartOfAccounts: 'IFRS', taxRegime: 'No VAT (planned 2026)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Qatar MADLSA calendar',
    socialSecuritySystem: { name: 'GRSIA (Nationals)', employerRate: '14%', employeeRate: '7%' },
    endOfServiceRule: 'Qatar Labour Law',
    integrations: [],
  },
  {
    iso2: 'OM', name: 'Oman', flag: '🇴🇲',
    currency: { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
    language: 'ar', chartOfAccounts: 'IFRS', taxRegime: 'VAT 5% (OTA)',
    fiscalYearStart: '01-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Oman MoL calendar',
    socialSecuritySystem: { name: 'PASI', employerRate: '11.5%', employeeRate: '7%' },
    endOfServiceRule: 'Oman Labour Law',
    integrations: [],
  },

  // ── MENA ──
  {
    iso2: 'EG', name: 'Egypt', flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
    language: 'ar', chartOfAccounts: 'Egyptian Accounting Standards', taxRegime: 'VAT 14% (ETA)',
    fiscalYearStart: '07-01', workingWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    publicHolidaysSource: 'Egypt MoMa calendar',
    socialSecuritySystem: { name: 'NOSI', employerRate: '18.75%', employeeRate: '11%' },
    endOfServiceRule: 'Egypt Labour Law',
    integrations: [EGYPT_ETA],
  },

  // ── Europe ──
  {
    iso2: 'GB', name: 'United Kingdom', flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
    language: 'en', chartOfAccounts: 'UK GAAP (FRS 102) / IFRS', taxRegime: 'VAT 20% (HMRC)',
    fiscalYearStart: '04-06', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'UK Bank Holidays',
    socialSecuritySystem: { name: 'NI (National Insurance)', employerRate: '13.8%', employeeRate: '12% (up to UEL)' },
    endOfServiceRule: 'UK Employment Rights Act (statutory)',
    integrations: [HMRC_VAT, PEPPOL],
  },
  {
    iso2: 'FR', name: 'France', flag: '🇫🇷',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    language: 'fr', chartOfAccounts: 'Plan Comptable Général (PCG)', taxRegime: 'TVA 20% (DGFiP)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Jours fériés français',
    socialSecuritySystem: { name: 'URSSAF / Sécurité sociale', employerRate: '~42%', employeeRate: '~22%' },
    endOfServiceRule: 'Code du travail (indemnité légale)',
    integrations: [FRANCE_FEC, FRANCE_PDP, PEPPOL],
  },
  {
    iso2: 'DE', name: 'Germany', flag: '🇩🇪',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    language: 'de', chartOfAccounts: 'SKR03 / SKR04', taxRegime: 'Umsatzsteuer 19% (BMF)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Bundesländer (per state)',
    socialSecuritySystem: { name: 'Sozialversicherung (TK/AOK/etc.)', employerRate: '~21%', employeeRate: '~21%' },
    endOfServiceRule: 'BGB §622 (notice periods)',
    integrations: [GERMANY_X_RECHNUNG, PEPPOL],
  },
  {
    iso2: 'IT', name: 'Italy', flag: '🇮🇹',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    language: 'it', chartOfAccounts: 'Codice civile + OIC', taxRegime: 'IVA 22% (Agenzia Entrate)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Italian national holidays',
    socialSecuritySystem: { name: 'INPS', employerRate: '~33%', employeeRate: '~9%' },
    endOfServiceRule: 'TFR (Trattamento di Fine Rapporto)',
    integrations: [ITALY_SDI, PEPPOL],
  },
  {
    iso2: 'ES', name: 'Spain', flag: '🇪🇸',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    language: 'es', chartOfAccounts: 'PGC 2008', taxRegime: 'IVA 21% (AEAT)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Calendario laboral (por comunidad)',
    socialSecuritySystem: { name: 'Seguridad Social', employerRate: '~30%', employeeRate: '~6%' },
    endOfServiceRule: 'Indemnización por despido',
    integrations: [SPAIN_TBAI, PEPPOL],
  },
  {
    iso2: 'NL', name: 'Netherlands', flag: '🇳🇱',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    language: 'nl', chartOfAccounts: 'RGS (Referentie Grootboekschema)', taxRegime: 'BTW 21% (Belastingdienst)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'NL national holidays',
    socialSecuritySystem: { name: 'Sociale verzekeringen', employerRate: '~24%', employeeRate: '~28%' },
    endOfServiceRule: 'Transitievergoeding',
    integrations: [PEPPOL],
  },

  // ── Americas ──
  {
    iso2: 'US', name: 'United States', flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    language: 'en', chartOfAccounts: 'US GAAP', taxRegime: 'Sales tax (per state) + Federal',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Federal + state',
    socialSecuritySystem: { name: 'FICA (SS + Medicare)', employerRate: '7.65%', employeeRate: '7.65%' },
    endOfServiceRule: 'At-will (no statutory severance)',
    integrations: [IRS_AFFORDABLE],
  },
  {
    iso2: 'CA', name: 'Canada', flag: '🇨🇦',
    currency: { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
    language: 'en', chartOfAccounts: 'IFRS / ASPE', taxRegime: 'GST 5% + PST (per province)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Federal + provincial',
    socialSecuritySystem: { name: 'CPP + EI', employerRate: '6.5%', employeeRate: '6.5%' },
    endOfServiceRule: 'ESA (Employment Standards Act, per province)',
    integrations: [],
  },
  {
    iso2: 'BR', name: 'Brazil', flag: '🇧🇷',
    currency: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    language: 'pt', chartOfAccounts: 'Plano Contábil CPC', taxRegime: 'ICMS + ISS + PIS/COFINS',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Feriados federais e estaduais',
    socialSecuritySystem: { name: 'INSS', employerRate: '~20%', employeeRate: '~11%' },
    endOfServiceRule: 'FGTS + multa rescisória',
    integrations: [],
  },

  // ── Asia-Pacific ──
  {
    iso2: 'IN', name: 'India', flag: '🇮🇳',
    currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    language: 'en', chartOfAccounts: 'Schedule III + Ind AS', taxRegime: 'GST 5/12/18/28% (GSTN)',
    fiscalYearStart: '04-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    publicHolidaysSource: 'Central + state',
    socialSecuritySystem: { name: 'EPF + ESIC', employerRate: '12% + 3.25%', employeeRate: '12% + 0.75%' },
    endOfServiceRule: 'Gratuity Act (5 years +)',
    integrations: [INDIA_GST],
  },
  {
    iso2: 'AU', name: 'Australia', flag: '🇦🇺',
    currency: { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
    language: 'en', chartOfAccounts: 'AASB / IFRS', taxRegime: 'GST 10% (ATO)',
    fiscalYearStart: '07-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'National + state',
    socialSecuritySystem: { name: 'Superannuation (11.5%)', employerRate: '11.5%', employeeRate: '0%' },
    endOfServiceRule: 'Fair Work Act (long service leave)',
    integrations: [PEPPOL],
  },
  {
    iso2: 'SG', name: 'Singapore', flag: '🇸🇬',
    currency: { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
    language: 'en', chartOfAccounts: 'SFRS', taxRegime: 'GST 9% (IRAS)',
    fiscalYearStart: '01-01', workingWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    publicHolidaysSource: 'Singapore MOM calendar',
    socialSecuritySystem: { name: 'CPF', employerRate: '17%', employeeRate: '20%' },
    endOfServiceRule: 'Employment Act',
    integrations: [PEPPOL],
  },
];

export function getCountry(iso2: string): Country | undefined {
  return COUNTRIES.find(c => c.iso2 === iso2.toUpperCase());
}
