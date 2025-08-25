"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function DeleteConfirmation({
  contactId,
  onClose,
}: {
  contactId: Id<"contacts"> | null;
  onClose: () => void;
}) {
  const remove = useMutation(api.contacts.remove);

  if (!contactId) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bekräfta radering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Denna åtgärd tar bort kontakten permanent i enlighet med GDPR
            (rätten att bli raderad). Är du säker?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await remove({ contactId: contactId as Id<"contacts"> });
                  onClose();
                } catch (e) {
                  console.error(e);
                  alert("Kunde inte radera kontakten");
                }
              }}
            >
              Radera
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
