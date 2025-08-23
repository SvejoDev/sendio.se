"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, ShieldCheck, CreditCard, Zap } from "lucide-react";

const features = [
  {
    title: "Inga abonnemang",
    description:
      "Betala endast när du skickar en kampanj – inga månadskostnader.",
    icon: CreditCard,
  },
  {
    title: "Direkt kostnadsberäkning",
    description: "Se exakta kostnader innan du betalar – full transparens.",
    icon: Calculator,
  },
  {
    title: "GDPR som standard",
    description:
      "Byggt för svenska/EU‑regler med avregistrering och spårbarhet.",
    icon: ShieldCheck,
  },
  {
    title: "Snabbt & enkelt",
    description: "Ladda upp kontakter → Skapa kampanj → Betala → Skicka.",
    icon: Zap,
  },
];

export default function Features() {
  return (
    <section id="funktioner" className="py-12 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <Badge variant="secondary">Varför Sendio?</Badge>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            Enkelt, transparent och efterlevnad i fokus
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Utvecklat för småföretag i Norden och Tyskland – utan krångel och
            utan bindningstid.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <f.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
