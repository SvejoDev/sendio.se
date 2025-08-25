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
      "unsubscribed",
      "createdAt",
    ];
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          [
            r.firstName ?? "",
            r.lastName ?? "",
            r.email ?? "",
            r.phoneNumber ?? "",
            r.unsubscribed ? "true" : "false",
            new Date(r.createdAt).toISOString(),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={!data}>
      Exportera
    </Button>
  );
}
