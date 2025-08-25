"use client";

import { useMemo } from "react";

const AVREG_PREFIX = "\n\nAvreg ";
const AVREG_PATH = "/u/"; // Short path as used by the Next route

export type CharacterCounterProps = {
  message: string;
  tokenLength?: number; // default 10 chars based on generateShortToken()
};

// GSM-7 reference sets
const GSM7_BASIC: Set<string> = new Set([
  "@",
  "£",
  "$",
  "¥",
  "è",
  "é",
  "ù",
  "ì",
  "ò",
  "Ç",
  "\n",
  "Ø",
  "ø",
  "\r",
  "Å",
  "å",
  "Δ",
  "_",
  "Φ",
  "Γ",
  "Λ",
  "Ω",
  "Π",
  "Ψ",
  "Σ",
  "Θ",
  "Ξ",
  " ",
  "!",
  '"',
  "#",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Ä",
  "Ö",
  "Ñ",
  "Ü",
  "§",
  "ä",
  "ö",
  "ñ",
  "ü",
  "à",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
]);
const GSM7_EXTENDED: Set<string> = new Set([
  "^",
  "{",
  "}",
  "\\",
  "[",
  "~",
  "]",
  "|",
  "€",
]);

function gsm7Length(text: string): number {
  let len = 0;
  for (const ch of text) {
    if (GSM7_EXTENDED.has(ch)) len += 2;
    else if (GSM7_BASIC.has(ch)) len += 1;
    else return -1;
  }
  return len;
}

function getEncodingAndLength(text: string): {
  encoding: "GSM-7" | "UCS-2";
  length: number;
} {
  const glen = gsm7Length(text);
  if (glen >= 0) return { encoding: "GSM-7", length: glen };
  const ulen = Array.from(text).length;
  return { encoding: "UCS-2", length: ulen };
}

function computeSegments(encoding: "GSM-7" | "UCS-2", length: number) {
  if (encoding === "GSM-7") {
    if (length <= 160)
      return { segments: 1, perSegment: 160, remainingInSegment: 160 - length };
    const segments = Math.ceil(length / 153);
    const used = length % 153 === 0 ? 153 : length % 153;
    return { segments, perSegment: 153, remainingInSegment: 153 - used };
  }
  if (length <= 70)
    return { segments: 1, perSegment: 70, remainingInSegment: 70 - length };
  const segments = Math.ceil(length / 67);
  const used = length % 67 === 0 ? 67 : length % 67;
  return { segments, perSegment: 67, remainingInSegment: 67 - used };
}

export function CharacterCounter({
  message,
  tokenLength = 10,
}: CharacterCounterProps) {
  const { encoding, length, seg } = useMemo(() => {
    const fullLink = `https://sendio.se${AVREG_PATH}${"x".repeat(tokenLength)}`;
    const full = `${message}${AVREG_PREFIX}${fullLink}`;
    const { encoding, length } = getEncodingAndLength(full);
    const seg = computeSegments(encoding, length);
    return { encoding, length, seg };
  }, [message, tokenLength]);

  return (
    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
      <div>Encoding: {encoding}</div>
      <div className="text-right">Tecken: {length}</div>
      <div>
        Segment: {seg.segments} × {seg.perSegment}
      </div>
      <div className="text-right">
        Återstår i segment: {Math.max(0, seg.remainingInSegment)}
      </div>
    </div>
  );
}

export function buildSmsPreview(message: string, token: string) {
  return `${message}${AVREG_PREFIX}https://sendio.se${AVREG_PATH}${token}`;
}
