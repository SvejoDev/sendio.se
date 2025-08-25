"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";

export type ContactRow = {
  id: Id<"contacts">;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  unsubscribed: boolean;
};

export default function ContactTable({
  contacts,
  onEdit,
  onDelete,
}: {
  contacts: Array<ContactRow>;
  onEdit: (c: ContactRow) => void;
  onDelete: (id: Id<"contacts">) => void;
}) {
  return (
    <div className="overflow-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-3 py-2 whitespace-nowrap">Namn</th>
            <th className="text-left px-3 py-2 whitespace-nowrap">E‑post</th>
            <th className="text-left px-3 py-2 whitespace-nowrap">Telefon</th>
            <th className="text-left px-3 py-2 whitespace-nowrap">
              Validering
            </th>
            <th className="text-left px-3 py-2 whitespace-nowrap">Status</th>
            <th className="text-right px-3 py-2 whitespace-nowrap">Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-muted">
                Inga kontakter hittades.
              </td>
            </tr>
          )}
          {contacts.map((c) => {
            const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
            return (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{name || "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.email || "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.phoneNumber || "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.email || c.phoneNumber ? (
                    <Badge variant="secondary">Giltig</Badge>
                  ) : (
                    <Badge variant="destructive">Ogiltig</Badge>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {c.unsubscribed ? (
                    <Badge variant="destructive">Avregistrerad</Badge>
                  ) : (
                    <Badge variant="secondary">Aktiv</Badge>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(c)}
                    >
                      Redigera
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(c.id)}
                    >
                      Radera
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
