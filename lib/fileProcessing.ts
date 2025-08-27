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
        const normalizedPhone = normalizePhoneForValidation(phone);

        if (!email && !phone) {
            errors.push({ rowIndex: i, reason: "Måste innehålla e‑post eller telefon" });
            continue;
        }

        if (email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
            errors.push({ rowIndex: i, reason: "Ogiltig e‑postadress" });
            continue;
        }

        if (normalizedPhone) {
            const allowedPrefixes = ["+46", "+45", "+47", "+358", "+49"];
            const hasAllowedPrefix = allowedPrefixes.some((p) => normalizedPhone.startsWith(p));
            if (!hasAllowedPrefix || !isPossiblePhoneNumber(normalizedPhone)) {
                errors.push({ rowIndex: i, reason: "Ogiltigt internationellt telefonnummer" });
                continue;
            }
        }

        valid.push({
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: email || undefined,
            phoneNumber: normalizedPhone || undefined,
        });
    }

    return { valid, invalid: errors };
}


// Remove invisible formatting characters (zero-width, bidi controls, NBSP),
// collapse to digits and a single leading plus if present anywhere.
function normalizePhoneForValidation(input: string): string {
    if (!input) return "";
    const s = input
        .normalize("NFKC")
        // Remove common invisible/control chars that sneak in from spreadsheets or messaging apps
        .replace(/[\u200B-\u200D\u2060\uFEFF\u00A0\u200E\u200F\u202A-\u202E]/g, "")
        // Remove all whitespace
        .replace(/\s+/g, "");
    const hadPlus = s.includes("+");
    const digits = s.replace(/\D/g, "");
    return hadPlus && digits.length > 0 ? "+" + digits : digits;
}


