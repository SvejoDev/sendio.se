"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Marknadsföring utan månadsabonnemang
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Skicka SMS och e‑postkampanjer och betala bara när du skickar. 100%
            transparent prissättning, byggt för svensk/europeisk GDPR.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signin?flow=signUp">Skapa företagskonto</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signin">Logga in</Link>
            </Button>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            GDPR‑efterlevnad • Svenskt fokus • Snabbt att komma igång
          </div>
        </div>
      </div>
    </section>
  );
}
