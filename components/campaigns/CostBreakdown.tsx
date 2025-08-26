"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSek } from "@/lib/utils";
import type { CountryBreakdown } from "@/hooks/usePricing";

export function CostBreakdown({
  breakdown,
  totalSek,
  recipients,
}: {
  breakdown: Array<CountryBreakdown>;
  totalSek: number;
  recipients: number;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Kostnadsöversikt</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Land</TableHead>
            <TableHead className="text-right">Antal mottagare</TableHead>
            <TableHead className="text-right">Pris / SMS</TableHead>
            <TableHead className="text-right">Delsumma</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Inga mottagare valda med giltiga telefonnummer.
              </TableCell>
            </TableRow>
          )}
          {breakdown.map((row) => (
            <TableRow key={row.countryCode}>
              <TableCell>{row.countryName}</TableCell>
              <TableCell className="text-right">{row.count}</TableCell>
              <TableCell className="text-right">
                {formatSek(row.unitPriceSek)}
              </TableCell>
              <TableCell className="text-right">
                {formatSek(row.subtotalSek)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Totalt</TableCell>
            <TableCell className="text-right font-medium">
              {recipients}
            </TableCell>
            <TableCell className="text-right" />
            <TableCell className="text-right font-semibold">
              {formatSek(totalSek)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
