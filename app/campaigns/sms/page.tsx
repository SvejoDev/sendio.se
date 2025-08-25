"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageComposer } from "@/components/sms/MessageComposer";

export default function SmsCampaignPage() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Skapa SMS‑kampanj</h1>
      <Card>
        <CardHeader>
          <CardTitle>Meddelande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MessageComposer />
        </CardContent>
      </Card>
    </main>
  );
}
