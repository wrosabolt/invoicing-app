export interface CompanySettings {
  companyName: string;
  address: string;
  email: string;
  phone: string;
  abn: string;
  hourlyRate: number;
  gstRate: number; // Default 10, stored as percentage (e.g., 10 for 10%)
  bankName?: string;
  bsbNumber?: string;
  accountNumber?: string;
}

export interface ClientInfo {
  id?: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  contactName?: string;
  contactEmail?: string;
  contactRole?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  hoursWorked: number;
  hourlyRate?: number;
}

// Input version allows undefined/null during form input
export type InvoiceItemInput = Omit<InvoiceItem, 'description'> & {
  description: string | undefined | null;
};

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
  startDate: string;
  endDate: string;
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
  bankName: "",
  bsbNumber: "",
  accountNumber: "",
};