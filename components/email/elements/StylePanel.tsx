"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit3, 
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings,
  X
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";
import TextElement from "./TextElement";
import ImageElement from "./ImageElement";
import ButtonElement from "./ButtonElement";
import DividerElement from "./DividerElement";
import SocialElement from "./SocialElement";

interface StylePanelProps {
  selectedElement: EmailElement | null;
  onElementUpdate: (id: string, updates: Partial<EmailElement>) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementMove: (id: string, direction: "up" | "down") => void;
  onClose: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function StylePanel({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementMove,
  onClose,
  canMoveUp,
  canMoveDown
}: StylePanelProps) {
  if (!selectedElement) {
    return (
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium">Inställningar</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Välj ett element</h3>
            <p className="text-sm text-gray-600">
              Klicka på ett element i förhandsvisningen för att redigera det
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const getElementTypeName = (type: string) => {
    switch (type) {
      case "text": return "Text";
      case "image": return "Bild";
      case "button": return "Knapp";
      case "divider": return "Avdelare";
      case "social": return "Sociala medier";
      default: return type;
    }
  };

  const renderElementEditor = () => {
    const commonProps = {
      element: selectedElement,
      onUpdate: (updates: Partial<EmailElement>) => onElementUpdate(selectedElement.id, updates),
      isSelected: true,
      isPreview: false
    };

    switch (selectedElement.type) {
      case "text":
        return <TextElement {...commonProps} />;
      case "image":
        return <ImageElement {...commonProps} />;
      case "button":
        return <ButtonElement {...commonProps} />;
      case "divider":
        return <DividerElement {...commonProps} />;
      case "social":
        return <SocialElement {...commonProps} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Ingen redigerare tillgänglig för denna elementtyp
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header with element type and actions */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium capitalize flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            {getElementTypeName(selectedElement.type)}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions Bar */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementMove(selectedElement.id, "up")}
            disabled={!canMoveUp}
            className="flex-1 h-8 text-xs"
          >
            <ChevronUp className="h-3 w-3 mr-1" />
            Upp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementMove(selectedElement.id, "down")}
            disabled={!canMoveDown}
            className="flex-1 h-8 text-xs"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Ner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementDuplicate(selectedElement.id)}
            className="flex-1 h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Kopiera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Är du säker på att du vill ta bort detta element?")) {
                onElementDelete(selectedElement.id);
                onClose();
              }
            }}
            className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Radera
          </Button>
        </div>
      </div>

      {/* Element-specific editor */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="h-full">
          {renderElementEditor()}
        </div>
      </ScrollArea>
    </Card>
  );
}