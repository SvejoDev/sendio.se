"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Removed sender input; we use the composer’s sender implicitly

type TestSenderProps = {
  message: string;
  senderId?: string;
};

export function TestSender({ message, senderId }: TestSenderProps) {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      const res = await sendTest({
        campaignId,
        message,
        phoneNumber: phone,
        firstName,
        lastName,
        senderId,
      });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ditt nummer i korrekt format, t.ex. +46701234567"
        />
        {/* Removed SenderIdInput */}
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Förnamn (för att testa {first_name})"
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Efternamn (för att testa {last_name})"
        />
      </div>
      <div>
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
