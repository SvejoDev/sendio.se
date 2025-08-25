"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContactTable from "@/components/contacts/ContactTable";
import ContactForm from "@/components/contacts/ContactForm";
import DeleteConfirmation from "@/components/contacts/DeleteConfirmation";
import ExportContacts from "@/components/contacts/ExportContacts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type UnsubFilter = "all" | "only" | "active";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [unsubFilter, setUnsubFilter] = useState<UnsubFilter>("all");
  const [pageSize, setPageSize] = useState(20);

  // Simple cursor stack to support prev/next
  const [cursors, setCursors] = useState<Array<string | null>>([null]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const currentCursor = useMemo(
    () => cursors[cursorIndex] ?? null,
    [cursors, cursorIndex],
  );

  const result = useQuery(api.contacts.listPaginated, {
    paginationOpts: { numItems: pageSize, cursor: currentCursor },
    unsubscribed: unsubFilter,
    search: search.trim() || undefined,
  });

  const [openForm, setOpenForm] = useState(false);
  const [editContact, setEditContact] = useState<{
    id: Id<"contacts">;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    unsubscribed: boolean;
  } | null>(null);

  const [deleteId, setDeleteId] = useState<Id<"contacts"> | null>(null);

  const page = result?.page ?? [];
  const isDone = result?.isDone ?? true;
  const continueCursor = result?.continueCursor ?? null;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <Card className="shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kontakter</CardTitle>
            <div className="flex items-center gap-2">
              <ExportContacts />
              <Button
                onClick={() => {
                  setEditContact(null);
                  setOpenForm(true);
                }}
              >
                Lägg till kontakt
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Sök namn, e‑post eller telefon"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <select
                className="w-full border rounded px-2 py-2 bg-background"
                value={unsubFilter}
                onChange={(e) => setUnsubFilter(e.target.value as UnsubFilter)}
              >
                <option value="all">Alla</option>
                <option value="active">Endast aktiva</option>
                <option value="only">Endast avregistrerade</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <select
                className="w-full border rounded px-2 py-2 bg-background"
                value={String(pageSize)}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={String(n)}>
                    {n} per sida
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">{page.length} visade</Badge>
            {unsubFilter !== "all" && (
              <Badge variant="outline">Filter: {unsubFilter}</Badge>
            )}
          </div>

          <ContactTable
            contacts={page.map((c) => ({
              id: c._id,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              phoneNumber: c.phoneNumber,
              unsubscribed: c.unsubscribed,
            }))}
            onEdit={(c) => {
              setEditContact(c);
              setOpenForm(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              disabled={cursorIndex === 0}
              onClick={() => setCursorIndex((i) => Math.max(0, i - 1))}
            >
              Föregående
            </Button>
            <Button
              variant="outline"
              disabled={continueCursor === null || isDone}
              onClick={() => {
                if (continueCursor) {
                  const next = [
                    ...cursors.slice(0, cursorIndex + 1),
                    continueCursor,
                  ];
                  setCursors(next);
                  setCursorIndex(cursorIndex + 1);
                }
              }}
            >
              Nästa
            </Button>
          </div>

          <ContactForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            initial={editContact ?? undefined}
          />

          <DeleteConfirmation
            contactId={deleteId}
            onClose={() => setDeleteId(null)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
