"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ParsedSheet = { name: string; rows: Array<Array<string>> };

export default function FileUploader({
  onParsed,
}: {
  onParsed: (data: {
    sheets: Array<ParsedSheet>;
    activeSheetIndex: number;
  }) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<Array<ParsedSheet>>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setFileName(file.name);
      setParsing(true);

      try {
        const ext = file.name.toLowerCase().split(".").pop();
        if (ext === "csv") {
          const text = await file.text();
          const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
          const rows = result.data as Array<Array<string>>;
          const parsed = [{ name: "Sheet1", rows }];
          setSheets(parsed);
          setActiveSheetIndex(0);
          onParsed({ sheets: parsed, activeSheetIndex: 0 });
        } else if (ext === "xlsx" || ext === "xls") {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const parsed: Array<ParsedSheet> = workbook.SheetNames.map((name) => {
            const ws = workbook.Sheets[name];
            const rawRows = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              blankrows: false,
              defval: "",
            }) as Array<Array<any>>;

            // Normalize all cells to strings to ensure type safety
            const rows: Array<Array<string>> = rawRows.map((row) =>
              row.map((cell) => {
                if (cell === null || cell === undefined) {
                  return "";
                }
                return String(cell);
              }),
            );

            return { name, rows };
          });
          setSheets(parsed);
          setActiveSheetIndex(0);
          // If there's exactly one sheet, call onParsed immediately like CSV
          if (parsed.length === 1) {
            onParsed({ sheets: parsed, activeSheetIndex: 0 });
          }
          // Do not auto-fire onParsed if multiple sheets; user should choose first
        } else {
          throw new Error("Endast CSV eller Excel-filer stöds");
        }
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Fel vid tolkning av filen");
      } finally {
        setParsing(false);
      }
    },
    [onParsed],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const hasMultipleSheets = useMemo(() => sheets.length > 1, [sheets]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted"
      >
        <input {...getInputProps()} />
        <p className="text-sm">
          {isDragActive
            ? "Släpp filen här..."
            : "Dra & släpp CSV/Excel, eller klicka för att välja"}
        </p>
        {fileName && <p className="text-muted">Vald fil: {fileName}</p>}
      </div>
      {parsing && <div className="text-sm">Laddar fil...</div>}

      {sheets.length > 0 && (
        <div className="space-y-3">
          {hasMultipleSheets && (
            <div className="flex items-center gap-2">
              <Label>Välj blad</Label>
              <select
                className="w-64 border rounded px-2 py-1 bg-background"
                value={String(activeSheetIndex)}
                onChange={(e) => setActiveSheetIndex(Number(e.target.value))}
              >
                {sheets.map((s, idx) => (
                  <option key={s.name} value={String(idx)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onParsed({ sheets, activeSheetIndex })}
              disabled={sheets.length === 0}
            >
              Fortsätt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
