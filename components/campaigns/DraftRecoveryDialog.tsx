"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Trash2 } from "lucide-react";

interface DraftRecoveryDialogProps {
  isOpen: boolean;
  onRecover: () => void;
  onDiscard: () => void;
  lastSaved?: number;
}

export default function DraftRecoveryDialog({
  isOpen,
  onRecover,
  onDiscard,
  lastSaved
}: DraftRecoveryDialogProps) {
  const formatLastSaved = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return "mindre än en minut sedan";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minuter sedan`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} timmar sedan`;
    } else {
      return `${Math.floor(diff / 86400000)} dagar sedan`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Återställ utkast
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Osparat utkast hittades</h4>
              <p className="text-sm text-blue-700 mt-1">
                Vi hittade ett osparat utkast av din e-postkampanj som sparades automatiskt{" "}
                {lastSaved ? formatLastSaved(lastSaved) : ""}.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Vad vill du göra?</h4>
            <p className="text-sm text-gray-600">
              Du kan återställa ditt tidigare arbete eller börja om från början.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={onRecover} className="gap-2">
              <FileText className="h-4 w-4" />
              Återställ utkast
            </Button>
            <Button 
              variant="outline" 
              onClick={onDiscard}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Börja om från början
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}