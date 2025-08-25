"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ContactForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: {
    id: Id<"contacts">;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    unsubscribedSms?: boolean;
    unsubscribedEmail?: boolean;
    unsubscribed: boolean;
  };
}) {
  const add = useMutation(api.contacts.add);
  const update = useMutation(api.contacts.update);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [unsubscribedSms, setUnsubscribedSms] = useState(false);
  const [unsubscribedEmail, setUnsubscribedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(initial?.firstName ?? "");
      setLastName(initial?.lastName ?? "");
      setEmail(initial?.email ?? "");
      setPhoneNumber(initial?.phoneNumber ?? "");
      setUnsubscribedSms(initial?.unsubscribedSms ?? false);
      setUnsubscribedEmail(initial?.unsubscribedEmail ?? false);
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {initial ? "Redigera kontakt" : "Lägg till kontakt"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Förnamn</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label>Efternamn</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>E‑post</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={unsubscribedSms}
                  onChange={(e) => setUnsubscribedSms(e.target.checked)}
                />
                SMS avreg.
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={unsubscribedEmail}
                  onChange={(e) => setUnsubscribedEmail(e.target.checked)}
                />
                E‑post avreg.
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Avbryt
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    if (initial) {
                      await update({
                        contactId: initial.id,
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        email: email || undefined,
                        phoneNumber: phoneNumber || undefined,
                        unsubscribedSms,
                        unsubscribedEmail,
                      });
                    } else {
                      await add({
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        email: email || undefined,
                        phoneNumber: phoneNumber || undefined,
                        unsubscribedSms,
                        unsubscribedEmail,
                      });
                    }
                    onClose();
                  } catch (e) {
                    console.error(e);
                    alert("Kunde inte spara kontakten");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                {submitting ? "Sparar…" : "Spara"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
