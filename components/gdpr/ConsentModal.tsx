"use client";

import { useEffect, useState } from "react";

export interface ConsentModalProps {
  onAccept?: () => void;
  onDecline?: () => void;
  title?: string;
  description?: string;
}

export default function ConsentModal({
  onAccept,
  onDecline,
  title = "GDPR‑samtycke",
  description = "För att importera kontakter behöver vi ditt samtycke till att behandla personuppgifter i enlighet med vår Integritetspolicy och DPA.",
}: ConsentModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen =
      typeof window !== "undefined" &&
      localStorage.getItem("gdpr_consent_seen");
    if (!seen) setOpen(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("gdpr_consent_seen", "1");
    } catch {
      // ignore
    }
    setOpen(false);
    onAccept?.();
  };

  const decline = () => {
    setOpen(false);
    onDecline?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={decline} />
      <div className="relative z-10 w-[92vw] max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={decline}
            className="h-9 rounded-md border px-3 text-sm"
          >
            Avbryt
          </button>
          <button
            onClick={accept}
            className="h-9 rounded-md bg-primary px-3 text-primary-foreground text-sm"
          >
            Godkänn
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Läs mer i{" "}
          <a className="underline" href="/legal/integritetspolicy">
            Integritetspolicy
          </a>{" "}
          och{" "}
          <a className="underline" href="/legal/dpa">
            DPA
          </a>
          .
        </div>
      </div>
    </div>
  );
}
