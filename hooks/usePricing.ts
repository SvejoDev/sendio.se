"use client";

import { useMemo } from "react";
import { detectCountryFromPhone, formatSek, SMS_PRICING_SEK, type SupportedCountry } from "@/lib/utils";

export type PricingInputContact = {
    phoneNumber?: string;
    unsubscribedSms?: boolean;
};

export type CountryBreakdown = {
    countryCode: SupportedCountry;
    countryName: string;
    unitPriceSek: number;
    count: number;
    subtotalSek: number;
};

export type PricingResult = {
    totalRecipients: number;
    totalSek: number;
    breakdown: Array<CountryBreakdown>;
    formattedTotal: string;
};

export function usePricing(contacts: Array<PricingInputContact>, segmentsPerMessage: number) {
    return useMemo<PricingResult>(() => {
        const map: Record<SupportedCountry, CountryBreakdown> = {
            SE: { countryCode: "SE", countryName: SMS_PRICING_SEK.SE.country, unitPriceSek: SMS_PRICING_SEK.SE.costSek, count: 0, subtotalSek: 0 },
            DK: { countryCode: "DK", countryName: SMS_PRICING_SEK.DK.country, unitPriceSek: SMS_PRICING_SEK.DK.costSek, count: 0, subtotalSek: 0 },
            NO: { countryCode: "NO", countryName: SMS_PRICING_SEK.NO.country, unitPriceSek: SMS_PRICING_SEK.NO.costSek, count: 0, subtotalSek: 0 },
            FI: { countryCode: "FI", countryName: SMS_PRICING_SEK.FI.country, unitPriceSek: SMS_PRICING_SEK.FI.costSek, count: 0, subtotalSek: 0 },
            DE: { countryCode: "DE", countryName: SMS_PRICING_SEK.DE.country, unitPriceSek: SMS_PRICING_SEK.DE.costSek, count: 0, subtotalSek: 0 },
        };

        for (const c of contacts) {
            if (!c.phoneNumber) continue;
            if (c.unsubscribedSms) continue;
            const cc = detectCountryFromPhone(c.phoneNumber);
            if (!cc) continue;
            map[cc].count += 1;
        }

        const breakdown: Array<CountryBreakdown> = [];
        let total = 0;
        let recipients = 0;
        for (const cc of Object.keys(map) as Array<SupportedCountry>) {
            const row = map[cc];
            if (row.count === 0) continue;
            const subtotal = row.count * row.unitPriceSek * Math.max(1, segmentsPerMessage);
            row.subtotalSek = subtotal;
            breakdown.push(row);
            total += subtotal;
            recipients += row.count;
        }

        breakdown.sort((a, b) => a.countryName.localeCompare(b.countryName));
        return { totalRecipients: recipients, totalSek: total, breakdown, formattedTotal: formatSek(total) };
    }, [contacts, segmentsPerMessage]);
}


