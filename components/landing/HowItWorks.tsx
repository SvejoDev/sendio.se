"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    title: "Registrera",
    desc: "Skapa företagskonto och godkänn Personuppgiftsbiträdesavtal (DPA).",
  },
  {
    title: "Importera kontakter",
    desc: "CSV/Excel med validering – telefon, e‑post och namn.",
  },
  {
    title: "Skapa kampanj",
    desc: "Välj SMS, e‑post eller kombinerat. Förhandsgranska i realtid.",
  },
  {
    title: "Se pris & betala",
    desc: "Exakt kostnad i SEK innan betalning via Stripe.",
  },
  {
    title: "Skicka & följ upp",
    desc: "Direkt eller schemalagt. Följ resultat i realtid.",
  },
];

export default function HowItWorks() {
  return (
    <section id="sa-fungerar-det" className="py-12 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <Badge variant="secondary">Så fungerar det</Badge>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            Från uppladdning till analys på några minuter
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <Card key={s.title}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  Steg {i + 1}
                </div>
                <div className="mt-2 font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
