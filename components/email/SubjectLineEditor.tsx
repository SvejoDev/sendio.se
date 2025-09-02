"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Variable, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubjectLineEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  className?: string;
}

export default function SubjectLineEditor({
  value,
  onChange,
  placeholder = "Skriv din ämnesrad...",
  label = "Ämnesrad",
  maxLength = 150,
  className = ""
}: SubjectLineEditorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const variables = [
    { 
      key: "{first_name}", 
      label: "Förnamn", 
      description: "Mottagarens förnamn",
      example: "Johan"
    },
    { 
      key: "{last_name}", 
      label: "Efternamn", 
      description: "Mottagarens efternamn",
      example: "Svensson"
    }
  ];

  const insertVariable = (variable: string) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = value.substring(0, start) + variable + value.substring(end);
      
      onChange(newValue);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        input.focus();
        const newPosition = start + variable.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
    setIsPopoverOpen(false);
  };

  // Count characters and show warning if approaching limit
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  // Preview with sample data
  const previewText = value
    .replace(/{first_name}/gi, "Johan")
    .replace(/{last_name}/gi, "Svensson");

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="subject">{label}</Label>
          <div className="flex items-center gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-7"
                >
                  <Variable className="h-3 w-3" />
                  Variabler
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tillgängliga variabler</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Klicka på en variabel för att infoga den i ämnesraden
                    </p>
                  </div>
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <button
                        key={variable.key}
                        onClick={() => insertVariable(variable.key)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm text-blue-600 group-hover:text-blue-700">
                              {variable.key}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {variable.description}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            ex: {variable.example}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <span className={`text-xs ${isOverLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-gray-500"}`}>
              {charCount}/{maxLength}
            </span>
          </div>
        </div>

        <div className="relative">
          <Input
            ref={inputRef}
            id="subject"
            type="text"
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                onChange(e.target.value);
              }
            }}
            placeholder={placeholder}
            className={isOverLimit ? "border-red-500 focus:ring-red-500" : ""}
          />
        </div>

        {/* Preview */}
        {value && (
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              <span>Förhandsvisning med exempeldata:</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {previewText}
            </div>
            {value.includes("{") && value.includes("}") && (
              <div className="flex flex-wrap gap-1 mt-2">
                {value.match(/{[^}]+}/g)?.map((variable, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {isOverLimit && (
          <div className="text-xs text-red-500">
            Ämnesraden är för lång. Vissa e-postklienter kan klippa av texten.
          </div>
        )}
        {isNearLimit && !isOverLimit && (
          <div className="text-xs text-orange-500">
            Du närmar dig maxgränsen för ämnesraden.
          </div>
        )}
      </div>
    </div>
  );
}