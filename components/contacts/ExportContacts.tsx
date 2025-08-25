"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ExportContacts() {
  const data = useQuery(api.contacts.exportAll, {});

  const handleDownload = () => {
    const rows = data ?? [];
    const headers = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "unsubscribedSms",
      "unsubscribedEmail",
      "unsubscribed",
      "createdAt",
    ];

    // Helper function to safely format cell values
    const formatCell = (value: unknown): string => {
      const stringValue = String(value);

      // Mitigate CSV injection by prefixing dangerous characters
      const csvInjectionPrefix = /^[=+\-@]/.test(stringValue) ? "'" : "";

      // Escape internal quotes and wrap in double quotes
      const escapedValue = stringValue.replace(/"/g, '""');

      return `"${csvInjectionPrefix}${escapedValue}"`;
    };

    // Helper function to safely format dates
    const formatDate = (dateValue: string | number): string => {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '""'; // Return empty string for invalid dates
      }
      return formatCell(date.toISOString());
    };

    const csvRows = rows.map((r) =>
      [
        formatCell(r.firstName ?? ""),
        formatCell(r.lastName ?? ""),
        formatCell(r.email ?? ""),
        formatCell(r.phoneNumber ?? ""),
        formatCell(r.unsubscribedSms ? "true" : "false"),
        formatCell(r.unsubscribedEmail ? "true" : "false"),
        formatCell(r.unsubscribed ? "true" : "false"),
        formatDate(r.createdAt),
      ].join(","),
    );

    // Create CSV with UTF-8 BOM and CRLF line breaks
    const csv =
      "\uFEFF" + // UTF-8 BOM
      [headers.join(",")].concat(csvRows).join("\r\n"); // Windows/Excel-friendly line breaks

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    a.download = `contacts_export_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={!data}>
      Exportera
    </Button>
  );
}
