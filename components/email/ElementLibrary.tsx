"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Type, 
  Image, 
  MousePointer, 
  Minus, 
  Share2, 
  Plus
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";

interface ElementLibraryProps {
  onElementAdd: (element: Partial<EmailElement>) => void;
}

const elementTypes = [
  {
    type: "text",
    icon: Type,
    name: "Text",
    description: "Lägg till text med formatering",
    defaultElement: {
      type: "text" as const,
      content: `<div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
          Klicka för att redigera denna text. Du kan använda formatering och lägga till variabler som {first_name}.
        </p>
      </div>`,
      alignment: "left" as const
    }
  },
  {
    type: "heading",
    icon: Type,
    name: "Rubrik",
    description: "Lägg till en rubrik",
    defaultElement: {
      type: "text" as const,
      content: `<div style="padding: 20px;">
        <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0;">Din rubrik här</h2>
      </div>`,
      alignment: "left" as const
    }
  },
  {
    type: "image",
    icon: Image,
    name: "Bild",
    description: "Lägg till en bild",
    defaultElement: {
      type: "image" as const,
      src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop",
      alt: "Beskrivning av bild",
      alignment: "center" as const
    }
  },
  {
    type: "button",
    icon: MousePointer,
    name: "Knapp",
    description: "Lägg till en knapp/CTA",
    defaultElement: {
      type: "button" as const,
      text: "Klicka här",
      url: "https://example.com",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
      alignment: "center" as const
    }
  },
  {
    type: "divider",
    icon: Minus,
    name: "Avdelare",
    description: "Lägg till en linje som separerar innehåll",
    defaultElement: {
      type: "divider" as const
    }
  },
  {
    type: "social",
    icon: Share2,
    name: "Sociala medier",
    description: "Lägg till länkar till sociala medier",
    defaultElement: {
      type: "social" as const,
      alignment: "center" as const
    }
  }
];

const quickLayouts = [
  {
    name: "Textblock",
    description: "Rubrik + text",
    elements: [
      {
        type: "text" as const,
        content: `<div style="padding: 20px;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Rubrik</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
            Här kan du skriva ditt innehåll. Använd variabler som {first_name} för personalisering.
          </p>
        </div>`
      }
    ]
  },
  {
    name: "Bild + text",
    description: "Bild med beskrivande text",
    elements: [
      {
        type: "image" as const,
        src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop",
        alt: "Bild"
      },
      {
        type: "text" as const,
        content: `<div style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
            Beskriv vad som visas i bilden ovan och koppla det till ditt meddelande.
          </p>
        </div>`
      }
    ]
  },
  {
    name: "CTA-sektion",
    description: "Text + knapp för att driva handling",
    elements: [
      {
        type: "text" as const,
        content: `<div style="padding: 20px; text-align: center;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Redo att komma igång?</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
            Klicka på knappen nedan för att ta nästa steg.
          </p>
        </div>`
      },
      {
        type: "button" as const,
        text: "Kom igång nu",
        url: "https://example.com",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
        alignment: "center" as const
      }
    ]
  }
];

export default function ElementLibrary({ onElementAdd }: ElementLibraryProps) {
  const handleAddElement = (elementTemplate: Partial<EmailElement>) => {
    const newElement = {
      ...elementTemplate,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
    };
    onElementAdd(newElement);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium">Element</h3>
        <p className="text-sm text-gray-600">Dra eller klicka för att lägga till</p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Basic Elements */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Grundelement</h4>
            <div className="space-y-2">
              {elementTypes.map((element) => {
                const Icon = element.icon;
                return (
                  <Button
                    key={element.type}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                    onClick={() => handleAddElement(element.defaultElement)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{element.name}</div>
                        <div className="text-xs text-gray-500 truncate">{element.description}</div>
                      </div>
                      <Plus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Quick Layouts */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Snabblayouter</h4>
            <div className="space-y-2">
              {quickLayouts.map((layout, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                  onClick={() => {
                    layout.elements.forEach((element, index) => {
                      setTimeout(() => {
                        handleAddElement(element);
                      }, index * 200);
                    });
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{layout.name}</div>
                      <div className="text-xs text-gray-500 truncate">{layout.description}</div>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Tips</h4>
            <div className="space-y-3">
              <div className="text-xs text-gray-600 leading-relaxed bg-blue-50 p-3 rounded-lg">
                <strong className="text-blue-900">Personalisering:</strong> Använd {"{first_name}"} och {"{last_name}"} för att personalisera dina meddelanden.
              </div>
              <div className="text-xs text-gray-600 leading-relaxed bg-green-50 p-3 rounded-lg">
                <strong className="text-green-900">Mobilvänligt:</strong> Håll texten kort och använd stora knappar för bästa mobila upplevelse.
              </div>
              <div className="text-xs text-gray-600 leading-relaxed bg-purple-50 p-3 rounded-lg">
                <strong className="text-purple-900">GDPR:</strong> En avregistreringslänk läggs automatiskt till i slutet av alla e-postmeddelanden.
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}