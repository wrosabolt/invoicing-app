"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsModal } from "@/components/SettingsModal";
import { InvoiceModal } from "@/components/InvoiceModal";
import { Invoice, CompanySettings, InvoiceItem } from "@/lib/types";
import { getCompanySettings } from "@/lib/storage";
import {
  calculateSubtotal,
  calculateGST,
  calculateTotal,
  formatCurrency,
  generateInvoiceNumber,
} from "@/lib/calculations";

const invoiceSchema = z.object({
  clientCompanyName: z.string().min(1, "Client company name is required"),
  clientContactName: z.string().min(1, "Contact name is required"),
  clientAddress: z.string().min(1, "Address is required"),
  clientEmail: z.string().email("Invalid email"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        hoursWorked: z.string().min(1, "Hours is required").refine(
          (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
          { message: "Hours must be a positive number" }
        ),
      })
    )
    .min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientCompanyName: "",
      clientContactName: "",
      clientAddress: "",
      clientEmail: "",
      items: [{ description: "", hoursWorked: "0" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const hourlyRate = companySettings?.hourlyRate || 0;
  const gstRate = companySettings?.gstRate || 10;

  useEffect(() => {
    const settings = getCompanySettings();
    setCompanySettings(settings);
    if (settings.hourlyRate <= 0) {
      setSettingsOpen(true);
    }
  }, []);

  const subtotal = calculateSubtotal(
    (watchedItems as { description: string; hoursWorked: string }[]).map(
      (item) => ({ ...item, hoursWorked: parseFloat(item.hoursWorked) || 0 })
    ),
    hourlyRate
  );
  const gstAmount = calculateGST(subtotal, gstRate);
  const total = calculateTotal(subtotal, gstAmount);

  const onSubmit = (data: InvoiceFormData) => {
    const invoiceItems: InvoiceItem[] = data.items.map((item) => ({
      description: item.description,
      hoursWorked: parseFloat(item.hoursWorked),
    }));

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date(),
      client: {
        companyName: data.clientCompanyName,
        contactName: data.clientContactName,
        address: data.clientAddress,
        email: data.clientEmail,
      },
      items: invoiceItems,
      hourlyRate,
      gstRate,
      subtotal,
      gstAmount,
      total,
    };

    setCreatedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleBack = () => {
    setPreviewOpen(false);
    setCreatedInvoice(null);
  };

  const handleSettingsSaved = () => {
    const settings = getCompanySettings();
    setCompanySettings(settings);
  };

  if (!companySettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientCompanyName" required>
                  Client Company Name
                </Label>
                <Input
                  id="clientCompanyName"
                  {...register("clientCompanyName")}
                  error={!!errors.clientCompanyName}
                  placeholder="Acme Corporation"
                />
                {errors.clientCompanyName && (
                  <p className="text-xs text-red-500">
                    {errors.clientCompanyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientContactName" required>
                  Contact Name
                </Label>
                <Input
                  id="clientContactName"
                  {...register("clientContactName")}
                  error={!!errors.clientContactName}
                  placeholder="John Smith"
                />
                {errors.clientContactName && (
                  <p className="text-xs text-red-500">
                    {errors.clientContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress" required>
                  Address
                </Label>
                <Input
                  id="clientAddress"
                  {...register("clientAddress")}
                  error={!!errors.clientAddress}
                  placeholder="456 Business Ave, Sydney NSW 2000"
                />
                {errors.clientAddress && (
                  <p className="text-xs text-red-500">
                    {errors.clientAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" required>
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...register("clientEmail")}
                  error={!!errors.clientEmail}
                  placeholder="accounts@acme.com.au"
                />
                {errors.clientEmail && (
                  <p className="text-xs text-red-500">
                    {errors.clientEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Work Performed</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", hoursWorked: "0" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`items.${index}.description`} required>
                      Description
                    </Label>
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Consulting services for..."
                      error={!!errors.items?.[index]?.description}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-xs text-red-500">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  <div className="w-32 space-y-2">
                    <Label htmlFor={`items.${index}.hoursWorked`} required>
                      Hours
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.hoursWorked`)}
                      error={!!errors.items?.[index]?.hoursWorked}
                    />
                    {errors.items?.[index]?.hoursWorked && (
                      <p className="text-xs text-red-500">
                        {errors.items[index]?.hoursWorked?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-7"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-xs text-red-500 mt-2">{errors.items.message}</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Invoice Totals</h2>
            <div className="flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">GST ({gstRate}%)</span>
                  <span className="font-medium">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between py-3 bg-slate-900 text-white rounded-md px-4">
                  <span className="font-semibold">Total Payable</span>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Create Invoice
            </Button>
          </div>
        </form>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSaved}
      />

      {createdInvoice && (
        <InvoiceModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onBack={handleBack}
          invoice={createdInvoice}
        />
      )}
    </div>
  );
}
