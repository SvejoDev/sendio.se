"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const smsPricing = [
  { country: "Sverige (+46)", price: "1,25 kr / SMS" },
  { country: "Danmark (+45)", price: "1,15 kr / SMS" },
  { country: "Norge (+47)", price: "1,35 kr / SMS" },
  { country: "Finland (+358)", price: "1,75 kr / SMS" },
  { country: "Tyskland (+49)", price: "2,25 kr / SMS" },
];

export default function Pricing() {
  return (
    <section id="priser" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <Badge variant="secondary">Priser</Badge>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            Transparent prissättning utan dolda avgifter
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Betala per kampanj. Se kostnaden i realtid innan betalning. Priser
            nedan i svenska kronor (SEK).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS‑priser</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {smsPricing.map((p) => (
                  <li
                    key={p.country}
                    className="flex items-center justify-between border-b last:border-b-0 py-2"
                  >
                    <span>{p.country}</span>
                    <span className="font-medium">{p.price}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>E‑postpriser</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                34,00 kr per 1 000 e‑post (alla länder). Innehåller spårning av
                öppningar och klick.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
