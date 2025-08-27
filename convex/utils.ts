export type PersonalizationVars = {
    first_name?: string;
    last_name?: string;
};

export function renderMessage(template: string, vars: PersonalizationVars): string {
    const replacements: Record<string, string> = {
        "first_name": vars.first_name ?? "",
        "last_name": vars.last_name ?? "",
    };
    return template.replace(/\{\s*(first_name|last_name)\s*\}/gi, (match, p1) => {
        const key = String(p1).toLowerCase();
        return replacements[key] ?? "";
    });
}

// Encoding detection (mirrors client logic): determine if message requires UCS-2 (e.g., emojis)
const GSM7_BASIC: Set<string> = new Set([
    "@", "£", "$", "¥", "è", "é", "ù", "ì", "ò", "Ç", "\n", "Ø", "ø", "\r", "Å", "å", "Δ", "_", "Φ", "Γ", "Λ", "Ω", "Π", "Ψ", "Σ", "Θ", "Ξ", " ", "!", "\"", "#", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "Ä", "Ö", "Ñ", "Ü", "§", "ä", "ö", "ñ", "ü", "à",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
]);
const GSM7_EXTENDED: Set<string> = new Set(["^", "{", "}", "\\", "[", "~", "]", "|", "€"]);

function isGsm7(text: string): boolean {
    for (const ch of text) {
        if (GSM7_BASIC.has(ch)) continue;
        if (GSM7_EXTENDED.has(ch)) continue; // counted as 2 septets but still GSM-7
        return false;
    }
    return true;
}

export function requiresUcs2(text: string): boolean {
    return !isGsm7(text);
}

// Very small phone normalizer for Swedish defaults.
// - Keeps "+" numbers as-is if numeric
// - Converts leading "00" to "+"
// - If leading "0", assumes Sweden +46 and strips the leading zero
// - If bare 9-11 digits without prefix, assumes Sweden +46
export function normalizePhoneToE164(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const only = trimmed.replace(/[\s\-()]/g, "");
    if (only.startsWith("+")) {
        const rest = only.slice(1);
        if (/^\d{6,14}$/.test(rest)) return "+" + rest;
        return null;
    }
    if (only.startsWith("00")) {
        const rest = only.slice(2);
        if (/^\d{6,14}$/.test(rest)) return "+" + rest;
        return null;
    }
    if (only.startsWith("0")) {
        const rest = only.slice(1).replace(/\D/g, "");
        if (/^\d{6,12}$/.test(rest)) return "+46" + rest;
        return null;
    }
    // Bare digits; assume SE
    if (/^\d{7,12}$/.test(only)) {
        return "+46" + only;
    }
    return null;
}


