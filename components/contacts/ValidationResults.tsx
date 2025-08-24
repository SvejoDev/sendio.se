"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateContacts } from "@/lib/fileProcessing";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type SheetData = { name: string; rows: Array<Array<string>> };

export default function ValidationResults({
  fileData,
  mapping,
}: {
  fileData: { sheets: Array<SheetData>; activeSheetIndex: number };
  mapping: {
    firstName?: number;
    lastName?: number;
    email?: number;
    phone?: number;
  };
}) {
  const sheet = fileData.sheets[fileData.activeSheetIndex];
  const [submitting, setSubmitting] = useState(false);
  const importContacts = useMutation(api.contacts.replaceImport);

  const { valid, invalid } = useMemo(
    () => validateContacts(sheet.rows, mapping),
    [sheet, mapping],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="text-sm">Giltiga poster: {valid.length}</div>
        <div className="text-sm text-red-600">
          Ogiltiga poster: {invalid.length}
        </div>
      </div>

      {invalid.length > 0 && (
        <div className="border rounded p-3 max-h-64 overflow-auto">
          <ul className="list-disc pl-5 text-sm">
            {invalid.slice(0, 100).map((e, idx) => (
              <li key={idx}>
                Rad {e.rowIndex + 1}: {e.reason}
              </li>
            ))}
            {invalid.length > 100 && <li>… och fler</li>}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          disabled={valid.length === 0 || submitting}
          onClick={async () => {
            try {
              setSubmitting(true);
              await importContacts({ contacts: valid });
              alert("Importen slutförd. Din kontaktlista har ersatts.");
            } catch (e) {
              console.error(e);
              alert("Importen misslyckades");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Importerar…" : "Importera"}
        </Button>
      </div>
    </div>
  );
}
