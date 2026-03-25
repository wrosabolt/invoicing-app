"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from "@/lib/types";
import { getCompanySettings, saveCompanySettings } from "@/lib/storage";

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  abn: z.string().min(1, "ABN is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    { message: "Hourly rate must be a positive number" }
  ),
  gstRate: z.string().min(1, "GST rate is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100,
    { message: "GST must be between 0-100%" }
  ),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: "",
      address: "",
      email: "",
      phone: "",
      abn: "",
      hourlyRate: "0",
      gstRate: "10",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const settings = getCompanySettings();
      reset({
        ...settings,
        hourlyRate: String(settings.hourlyRate),
        gstRate: String(settings.gstRate),
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: SettingsFormData) => {
    setIsLoading(true);

    const settings: CompanySettings = {
      ...data,
      hourlyRate: Number(data.hourlyRate),
      gstRate: Number(data.gstRate),
    };

    saveCompanySettings(settings);
    setIsLoading(false);
    onClose();
    onSave?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Settings" size="default">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName" required>
              Company Name
            </Label>
            <Input
              id="companyName"
              {...register("companyName")}
              error={!!errors.companyName}
              placeholder="Your Company Name"
            />
            {errors.companyName && (
              <p className="text-xs text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abn" required>
              ABN
            </Label>
            <Input
              id="abn"
              {...register("abn")}
              error={!!errors.abn}
              placeholder="12 345 678 901"
            />
            {errors.abn && (
              <p className="text-xs text-red-500">{errors.abn.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" required>
            Address
          </Label>
          <Input
            id="address"
            {...register("address")}
            error={!!errors.address}
            placeholder="123 Business Street, Melbourne VIC 3000"
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              placeholder="billing@company.com.au"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" required>
              Phone
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              error={!!errors.phone}
              placeholder="+61 4 1234 5678"
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-4">Billing Defaults</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" required>
                Hourly Rate (AUD)
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                {...register("hourlyRate")}
                error={!!errors.hourlyRate}
                placeholder="150.00"
              />
              {errors.hourlyRate && (
                <p className="text-xs text-red-500">{errors.hourlyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstRate" required>
                GST Rate (%)
              </Label>
              <Input
                id="gstRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register("gstRate")}
                error={!!errors.gstRate}
                placeholder="10"
              />
              {errors.gstRate && (
                <p className="text-xs text-red-500">{errors.gstRate.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
