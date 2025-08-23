"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Sendio
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              SMS och e‑postmarknadsföring utan abonnemang. Transparent
              prissättning och GDPR‑efterlevnad för svenska och europeiska
              företag.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" asChild>
                <a
                  href="mailto:johan.svensson@svejo.se"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  johan.svensson@svejo.se
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Produkt
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#funktioner" className="hover:text-foreground/90">
                  Funktioner
                </Link>
              </li>
              <li>
                <Link href="/#priser" className="hover:text-foreground/90">
                  Priser
                </Link>
              </li>
              <li>
                <Link
                  href="/#sa-fungerar-det"
                  className="hover:text-foreground/90"
                >
                  Så fungerar det
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Företag
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Om Sendio
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Säkerhet & GDPR
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Juridiskt
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Integritetspolicy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Villkor
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground/90">
                  Databehandlaravtal (DPA)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col items-start justify-between gap-4 pb-10 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            © {year} Sendio. Alla rättigheter förbehållna.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground/90">
              Integritet
            </Link>
            <Link href="/" className="hover:text-foreground/90">
              Cookies
            </Link>
            <Link href="/" className="hover:text-foreground/90">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
