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
  id?: string;
  description: string;
  hoursWorked: number;
  hourlyRate?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status: string;
  paid: boolean;
  dueDate: string;
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