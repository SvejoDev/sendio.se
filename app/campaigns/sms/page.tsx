"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageComposer } from "@/components/sms/MessageComposer";
import { TestSender } from "@/components/sms/TestSender";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePricing } from "@/hooks/usePricing";
import { CostBreakdown } from "@/components/campaigns/CostBreakdown";

export default function SmsCampaignPage() {
  const contacts = useQuery(api.contacts.list) ?? [];
  const [segments, setSegments] = useState(1);
  const [message, setMessage] = useState("");
  const pricing = usePricing(contacts, segments);
  return (
    <main className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Skapa SMS‑kampanj</h1>
      <Card>
        <CardHeader>
          <CardTitle>Meddelande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MessageComposer
            onChangeText={(t, s) => {
              setSegments(s);
              setMessage(t);
            }}
          />
          <TestSender message={message} />
          <CostBreakdown
            breakdown={pricing.breakdown}
            totalSek={pricing.totalSek}
            recipients={pricing.totalRecipients}
          />
        </CardContent>
      </Card>
    </main>
  );
}
