"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function UnsubscribePage() {
  const params = useParams();
  const token = String(params?.token ?? "");
  const result = useQuery(api.unsubscribe.resolveToken, { token });
  const apply = useMutation(api.unsubscribe.applyUnsubscribeWithToken);

  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (result && "valid" in result && result.valid) {
      // Default: if arrived from sms/email link, preselect that channel.
      setSms(result.type === "sms");
      setEmail(result.type === "email");
    }
  }, [result]);

  const name = useMemo(() => {
    if (result && "valid" in result && result.valid) {
      const c = result.contact;
      const composed = [c.firstName, c.lastName].filter(Boolean).join(" ");
      return composed || c.email || c.phoneNumber || "";
    }
    return "";
  }, [result]);

  if (!result) {
    return null;
  }

  if (!("valid" in result) || !result.valid) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Länken är ogiltig</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tyvärr kunde vi inte hitta denna avregistreringslänk. Kontrollera
              att du öppnat den senaste länken från meddelandet.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Hantera utskick för {name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={sms}
                onCheckedChange={(v) => setSms(Boolean(v))}
              />
              Sluta ta emot SMS
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={email}
                onCheckedChange={(v) => setEmail(Boolean(v))}
              />
              Sluta ta emot e‑post
            </label>
          </div>
          <Button
            className="w-full"
            disabled={(!sms && !email) || submitted}
            onClick={async () => {
              try {
                setSubmitted(true);
                await apply({ token, sms, email });
              } finally {
                setSubmitted(false);
              }
            }}
          >
            {submitted ? "Sparar…" : "Bekräfta avregistrering"}
          </Button>

          {"valid" in result &&
            result.valid &&
            (result.contact.unsubscribedSms ||
              result.contact.unsubscribedEmail) && (
              <p className="text-xs text-muted-foreground">
                Nuvarande status:{" "}
                {result.contact.unsubscribedSms
                  ? "SMS avregistrerad"
                  : "SMS aktiv"}
                ,{" "}
                {result.contact.unsubscribedEmail
                  ? "E‑post avregistrerad"
                  : "E‑post aktiv"}
              </p>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
