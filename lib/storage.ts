import { CompanySettings, Invoice, DEFAULT_COMPANY_SETTINGS } from "./types";

const COMPANY_SETTINGS_KEY = "invoicing_company_settings";
const INVOICES_KEY = "invoicing_invoices";

export function getCompanySettings(): CompanySettings {
  if (typeof window === "undefined") return DEFAULT_COMPANY_SETTINGS;

  const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
  if (!stored) return DEFAULT_COMPANY_SETTINGS;

  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: CompanySettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
}

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(INVOICES_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return parsed.map((inv: Invoice) => ({
      ...inv,
      createdAt: new Date(inv.createdAt),
    }));
  } catch {
    return [];
  }
}

export function saveInvoice(invoice: Invoice): void {
  if (typeof window === "undefined") return;

  const invoices = getInvoices();
  invoices.unshift(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(id: string): void {
  if (typeof window === "undefined") return;

  const invoices = getInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}
