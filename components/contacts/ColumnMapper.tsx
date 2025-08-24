"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SheetData = { name: string; rows: Array<Array<string>> };

export default function ColumnMapper({
  fileData,
  mapping,
  onChangeMapping,
  onNext,
}: {
  fileData: { sheets: Array<SheetData>; activeSheetIndex: number };
  mapping: {
    firstName?: number;
    lastName?: number;
    email?: number;
    phone?: number;
  };
  onChangeMapping: (m: {
    firstName?: number;
    lastName?: number;
    email?: number;
    phone?: number;
  }) => void;
  onNext: () => void;
}) {
  const activeSheet = fileData.sheets[fileData.activeSheetIndex];
  const header = useMemo(
    () => (activeSheet.rows[0] ?? []).map((c) => String(c ?? "")),
    [activeSheet],
  );
  const previewRows = useMemo(
    () => activeSheet.rows.slice(0, 15),
    [activeSheet],
  );
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const selectedCols = useMemo(
    () =>
      new Set(
        [
          mapping.firstName,
          mapping.lastName,
          mapping.email,
          mapping.phone,
        ].filter((v) => v !== undefined) as number[],
      ),
    [mapping],
  );

  const fields: Array<{ key: keyof typeof mapping; label: string }> = [
    { key: "firstName", label: "Förnamn" },
    { key: "lastName", label: "Efternamn" },
    { key: "email", label: "E‑post" },
    { key: "phone", label: "Telefon" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-2">
            <Label className="w-32">{field.label}</Label>
            <select
              className="w-full border rounded px-2 py-1 bg-background"
              value={
                mapping[field.key] !== undefined
                  ? String(mapping[field.key])
                  : ""
              }
              onChange={(e) =>
                onChangeMapping({
                  ...mapping,
                  [field.key]: Number(e.target.value),
                })
              }
              onMouseLeave={() => setHoverCol(null)}
            >
              <option value="" disabled>
                Välj kolumn
              </option>
              {header.map((name, idx) => (
                <option
                  key={`${name}-${idx}`}
                  value={String(idx)}
                  onMouseEnter={() => setHoverCol(idx)}
                >
                  {name || `Kolumn ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="overflow-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {header.map((h, idx) => (
                <th
                  key={`h-${idx}`}
                  className={`px-3 py-2 text-left sticky top-0 bg-background ${hoverCol === idx ? "bg-primary/10" : ""} ${selectedCols.has(idx) ? "ring-1 ring-primary/40" : ""}`}
                  onMouseEnter={() => setHoverCol(idx)}
                  onMouseLeave={() => setHoverCol(null)}
                >
                  {h || `Kolumn ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.slice(1).map((row, rIdx) => (
              <tr key={`r-${rIdx}`} className="border-t">
                {header.map((_, cIdx) => (
                  <td
                    key={`c-${rIdx}-${cIdx}`}
                    className={`px-3 py-2 whitespace-nowrap ${hoverCol === cIdx ? "bg-primary/5" : ""} ${selectedCols.has(cIdx) ? "bg-primary/5" : ""}`}
                    onMouseEnter={() => setHoverCol(cIdx)}
                    onMouseLeave={() => setHoverCol(null)}
                  >
                    {String(row[cIdx] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Nästa</Button>
      </div>
    </div>
  );
}
