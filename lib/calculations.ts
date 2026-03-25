import { InvoiceItem } from "./types";

export function calculateSubtotal(items: InvoiceItem[], hourlyRate: number): number {
  const totalHours = items.reduce((sum, item) => sum + item.hoursWorked, 0);
  return totalHours * hourlyRate;
}

export function calculateGST(subtotal: number, gstRate: number): number {
  return subtotal * (gstRate / 100);
}

export function calculateTotal(subtotal: number, gstAmount: number): number {
  return subtotal + gstAmount;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${timestamp}-${random}`;
}

export function calculateTotalHours(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.hoursWorked, 0);
}
