"use client";

import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";

interface AutoSaveIndicatorProps {
  lastSaved?: number;
  hasUnsavedChanges: boolean;
  onForceSave?: () => void;
}

export default function AutoSaveIndicator({ 
  lastSaved, 
  hasUnsavedChanges,
  onForceSave 
}: AutoSaveIndicatorProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!lastSaved && !hasUnsavedChanges) {
      setDisplayText("");
      return;
    }

    if (hasUnsavedChanges) {
      setDisplayText("Osparade ändringar...");
      return;
    }

    if (lastSaved) {
      const now = Date.now();
      const diff = now - lastSaved;
      
      if (diff < 10000) {
        setDisplayText("Sparat");
      } else if (diff < 60000) {
        setDisplayText(`Sparat ${Math.floor(diff / 1000)}s sedan`);
      } else if (diff < 3600000) {
        setDisplayText(`Sparat ${Math.floor(diff / 60000)}min sedan`);
      } else {
        setDisplayText(`Sparat ${Math.floor(diff / 3600000)}h sedan`);
      }
    }

    const interval = setInterval(() => {
      if (lastSaved && !hasUnsavedChanges) {
        const now = Date.now();
        const diff = now - lastSaved;
        
        if (diff < 10000) {
          setDisplayText("Sparat");
        } else if (diff < 60000) {
          setDisplayText(`Sparat ${Math.floor(diff / 1000)}s sedan`);
        } else if (diff < 3600000) {
          setDisplayText(`Sparat ${Math.floor(diff / 60000)}min sedan`);
        } else {
          setDisplayText(`Sparat ${Math.floor(diff / 3600000)}h sedan`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSaved, hasUnsavedChanges]);

  if (!displayText) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {hasUnsavedChanges ? (
        <>
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-amber-600">{displayText}</span>
          {onForceSave && (
            <button
              onClick={onForceSave}
              className="text-blue-600 hover:text-blue-700 underline ml-1"
            >
              Spara nu
            </button>
          )}
        </>
      ) : (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">{displayText}</span>
        </>
      )}
    </div>
  );
}