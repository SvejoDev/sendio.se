"use client";

import { Button } from "@/components/ui/button";

type VariableInserterProps = {
  onInsert: (variable: string) => void;
  className?: string;
};

export function VariableInserter({
  onInsert,
  className,
}: VariableInserterProps) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground mb-2">Infoga variabler</div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onInsert("{first_name}")}
        >
          first_name
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onInsert("{last_name}")}
        >
          last_name
        </Button>
      </div>
    </div>
  );
}
