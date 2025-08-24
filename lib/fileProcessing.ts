import { isPossiblePhoneNumber } from "libphonenumber-js";

export type Mapping = { firstName?: number; lastName?: number; email?: number; phone?: number };

export type ValidContact = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
};

export function validateContacts(rows: Array<Array<string>>, mapping: Mapping) {
    const errors: Array<{ rowIndex: number; reason: string }> = [];
    const valid: Array<ValidContact> = [];
    const headerOffset = 1; // assume first row is header
    for (let i = headerOffset; i < rows.length; i++) {
        const row = rows[i] ?? [];
        const get = (idx: number | undefined) => (idx === undefined ? "" : String(row[idx] ?? "").trim());
        const firstName = get(mapping.firstName);
        const lastName = get(mapping.lastName);
        const email = get(mapping.email);
        const phone = get(mapping.phone);

        if (!email && !phone) {
            errors.push({ rowIndex: i, reason: "Måste innehålla e‑post eller telefon" });
            continue;
        }

        if (email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
            errors.push({ rowIndex: i, reason: "Ogiltig e‑postadress" });
            continue;
        }

        if (phone) {
            const normalized = phone.replace(/\s+/g, "");
            const allowedPrefixes = ["+46", "+45", "+47", "+358", "+49"];
            const hasAllowedPrefix = allowedPrefixes.some((p) => normalized.startsWith(p));
            if (!hasAllowedPrefix || !isPossiblePhoneNumber(normalized)) {
                errors.push({ rowIndex: i, reason: "Ogiltigt internationellt telefonnummer" });
                continue;
            }
        }

        valid.push({
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: email || undefined,
            phoneNumber: phone || undefined,
        });
    }

    return { valid, invalid: errors };
}


