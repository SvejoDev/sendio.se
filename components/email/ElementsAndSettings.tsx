"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailElement } from "@/data/emailTemplates";
import ElementLibrary from "./ElementLibrary";
import StylePanel from "./elements/StylePanel";
import { Layout, Settings } from "lucide-react";

interface ElementsAndSettingsProps {
  selectedElement: EmailElement | null;
  onElementUpdate: (id: string, updates: Partial<EmailElement>) => void;
  onElementAdd: (element: Partial<EmailElement>) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementMove: (id: string, direction: "up" | "down") => void;
  onElementClose: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
}

export default function ElementsAndSettings({
  selectedElement,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
  onElementDuplicate,
  onElementMove,
  onElementClose,
  canMoveUp,
  canMoveDown,
  className = ""
}: ElementsAndSettingsProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "settings">("elements");

  // Auto-switch to settings tab when an element is selected
  useEffect(() => {
    if (selectedElement) {
      setActiveTab("settings");
    }
  }, [selectedElement]);

  return (
    <Card className={`h-full ${className}`}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "elements" | "settings")} className="h-full flex flex-col">
        <div className="p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="elements" className="flex items-center gap-2">
              <Layout className="size-4" />
              Element
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!selectedElement}>
              <Settings className="size-4" />
              Inställningar
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="elements" className="h-full m-0">
            <ElementLibrary onElementAdd={onElementAdd} />
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0">
            <div className="h-full">
              {selectedElement ? (
                <StylePanel
                  selectedElement={selectedElement}
                  onElementUpdate={onElementUpdate}
                  onElementDelete={onElementDelete}
                  onElementDuplicate={onElementDuplicate}
                  onElementMove={onElementMove}
                  onClose={onElementClose}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-500 p-6">
                  <div>
                    <Settings className="size-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-medium mb-2">Ingen element vald</h3>
                    <p className="text-sm">
                      Klicka på ett element i förhandsvisningen för att redigera det
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}