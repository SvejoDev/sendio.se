"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TestSenderProps = {
  message: string;
};

export function TestSender({ message }: TestSenderProps) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<
    null | { kind: "ok" } | { kind: "error"; msg: string }
  >(null);

  const ensureDraft = useMutation(api.sms.ensureDraftCampaign);
  const sendTest = useAction(api.smsAction.sendTest);
  const [busy, setBusy] = useState(false);

  const onSend = async () => {
    setStatus(null);
    if (!phone.trim()) {
      setStatus({ kind: "error", msg: "Ange ditt nummer i korrekt format" });
      return;
    }
    try {
      setBusy(true);
      const campaignId = await ensureDraft({ type: "sms" });
      const res = await sendTest({ campaignId, message, phoneNumber: phone });
      if (res.success) setStatus({ kind: "ok" });
      else setStatus({ kind: "error", msg: res.error ?? "Misslyckades" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Misslyckades";
      setStatus({ kind: "error", msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Se hur ditt sms kommer se ut genom att skicka till dig själv
      </div>
      <div className="flex gap-2">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ditt nummer i korrekt format, t.ex. +46701234567"
        />
        <Button onClick={onSend} disabled={busy}>
          Skicka
        </Button>
      </div>
      {status?.kind === "ok" && (
        <Alert>
          <AlertDescription>Test‑sms skickat!</AlertDescription>
        </Alert>
      )}
      {status?.kind === "error" && (
        <Alert>
          <AlertDescription>{status.msg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
