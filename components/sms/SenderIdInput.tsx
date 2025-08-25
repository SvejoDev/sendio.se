"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";

type SenderIdInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SenderIdInput({ value, onChange }: SenderIdInputProps) {
  const { valid, message } = useMemo(() => {
    const regex = /^[A-Za-zÅÄÖåäö0-9]{1,11}$/;
    const ok = regex.test(value);
    return {
      valid: ok,
      message: ok ? "" : "Avsändare måste vara 1-11 tecken, a-ö, A-Ö, 0-9",
    };
  }, [value]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Avsändare (Sender ID)</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 11))}
        placeholder="Ex. SendioSE"
      />
      {!valid && value.length > 0 && (
        <div className="text-xs text-destructive">{message}</div>
      )}
    </div>
  );
}
