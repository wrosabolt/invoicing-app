export interface CompanySettings {
  companyName: string;
  address: string;
  email: string;
  phone: string;
  abn: string;
  hourlyRate: number;
  gstRate: number; // Default 10, stored as percentage (e.g., 10 for 10%)
}

export interface ClientInfo {
  id?: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

export interface InvoiceItem {
  description: string;
  hoursWorked: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  client: ClientInfo;
  items: InvoiceItem[];
  hourlyRate: number; // Captured at time of creation
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  total: number;
}

export interface InvoiceFormData {
  client: ClientInfo;
  items: InvoiceItem[];
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: "",
  address: "",
  email: "",
  phone: "",
  abn: "",
  hourlyRate: 0,
  gstRate: 10,
};