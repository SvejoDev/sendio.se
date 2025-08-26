import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Pricing helpers (SEK) ---
export type SupportedCountry = "SE" | "DK" | "NO" | "FI" | "DE";

export const SMS_PRICING_SEK: Record<SupportedCountry, { country: string; prefix: string; costSek: number }> = {
  SE: { country: "Sweden", prefix: "+46", costSek: 1.25 },
  DK: { country: "Denmark", prefix: "+45", costSek: 1.15 },
  NO: { country: "Norway", prefix: "+47", costSek: 1.35 },
  FI: { country: "Finland", prefix: "+358", costSek: 1.75 },
  DE: { country: "Germany", prefix: "+49", costSek: 2.25 },
};

export function detectCountryFromPhone(phone?: string): SupportedCountry | null {
  if (!phone) return null;
  const normalized = phone.replace(/\s|-/g, "");
  if (normalized.startsWith(SMS_PRICING_SEK.FI.prefix)) return "FI";
  if (normalized.startsWith(SMS_PRICING_SEK.SE.prefix)) return "SE";
  if (normalized.startsWith(SMS_PRICING_SEK.DK.prefix)) return "DK";
  if (normalized.startsWith(SMS_PRICING_SEK.NO.prefix)) return "NO";
  if (normalized.startsWith(SMS_PRICING_SEK.DE.prefix)) return "DE";
  return null;
}

export function formatSek(amount: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 }).format(amount);
}
