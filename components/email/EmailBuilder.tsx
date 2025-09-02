"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Smartphone,
  Monitor
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmailElement, EmailTemplate } from "@/data/emailTemplates";
import ElementsAndSettings from "./ElementsAndSettings";
import TextElement from "./elements/TextElement";
import ImageElement from "./elements/ImageElement";
import ButtonElement from "./elements/ButtonElement";
import DividerElement from "./elements/DividerElement";
import SocialElement from "./elements/SocialElement";

interface EmailBuilderProps {
  template: EmailTemplate | null;
  elements: EmailElement[];
  onElementsChange: (elements: EmailElement[]) => void;
}

interface SortableElementProps {
  element: EmailElement;
  isSelected: boolean;
  onElementClick: (id: string) => void;
}

function SortableElement({
  element,
  isSelected,
  onElementClick
}: SortableElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onElementClick(element.id);
  };

  const commonProps = {
    element,
    onUpdate: () => {}, // No updates in preview mode
    isSelected: false, // Always false in preview
    isPreview: true // Always true in preview
  };

  let ElementComponent;
  switch (element.type) {
    case "text":
      ElementComponent = <TextElement {...commonProps} />;
      break;
    case "image":
      ElementComponent = <ImageElement {...commonProps} />;
      break;
    case "button":
      ElementComponent = <ButtonElement {...commonProps} />;
      break;
    case "divider":
      ElementComponent = <DividerElement {...commonProps} />;
      break;
    case "social":
      ElementComponent = <SocialElement {...commonProps} />;
      break;
    default:
      return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-2 hover:ring-blue-200 hover:ring-offset-1'
      }`}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Element Content */}
      <div className="p-2">
        {ElementComponent}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br">
          {element.type}
        </div>
      )}
    </div>
  );
}

export default function EmailBuilder({ 
  elements, 
  onElementsChange 
}: EmailBuilderProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) || null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleElementAdd = useCallback((newElement: Partial<EmailElement>) => {
    const elementWithId = {
      ...newElement,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
    } as EmailElement;
    onElementsChange([...elements, elementWithId]);
    setSelectedElementId(elementWithId.id);
  }, [elements, onElementsChange]);

  const handleElementUpdate = useCallback((id: string, updates: Partial<EmailElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(newElements);
  }, [elements, onElementsChange]);

  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId === selectedElementId ? null : elementId);
  };

  const handleElementDelete = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    onElementsChange(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [elements, onElementsChange, selectedElementId]);

  const handleElementDuplicate = useCallback((id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
      };
      const elementIndex = elements.findIndex(el => el.id === id);
      const newElements = [
        ...elements.slice(0, elementIndex + 1),
        duplicatedElement,
        ...elements.slice(elementIndex + 1)
      ];
      onElementsChange(newElements);
      setSelectedElementId(duplicatedElement.id);
    }
  }, [elements, onElementsChange]);

  const handleElementMove = useCallback((id: string, direction: "up" | "down") => {
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;

    const newIndex = direction === "up" ? elementIndex - 1 : elementIndex + 1;
    if (newIndex < 0 || newIndex >= elements.length) return;

    const newElements = [...elements];
    [newElements[elementIndex], newElements[newIndex]] = [newElements[newIndex], newElements[elementIndex]];
    onElementsChange(newElements);
  }, [elements, onElementsChange]);

  const handleElementClose = () => {
    setSelectedElementId(null);
  };

  const canMoveUp = selectedElement ? elements.findIndex(el => el.id === selectedElement.id) > 0 : false;
  const canMoveDown = selectedElement ? elements.findIndex(el => el.id === selectedElement.id) < elements.length - 1 : false;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = elements.findIndex((element) => element.id === active.id);
      const newIndex = elements.findIndex((element) => element.id === over?.id);

      onElementsChange(arrayMove(elements, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-row gap-4 h-full">
      {/* Email Preview */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Förhandsvisning</h3>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="size-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className={`p-4 ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
              <div className="bg-white border rounded-lg overflow-hidden">
                {elements.length === 0 ? (
                  <div className="p-12 text-center">
                    <Eye className="size-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Ditt e-postmeddelande är tomt</h3>
                    <p className="text-sm text-gray-600">
                      Lägg till element från biblioteket för att börja bygga ditt meddelande
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={elements.map(el => el.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-0">
                        {elements.map((element) => (
                          <SortableElement
                            key={element.id}
                            element={element}
                            isSelected={selectedElementId === element.id}
                            onElementClick={handleElementClick}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    {/* GDPR Footer */}
                    <div className="border-t p-4 bg-gray-50 text-xs text-gray-500 text-center">
                      <p>
                        Du får detta meddelande eftersom du har samtyckt till att ta emot e-post från oss.
                      </p>
                      <p className="mt-1">
                        <a href="#" className="text-blue-600 hover:underline">
                          Avregistrera dig här
                        </a>
                        {" | "}
                        <a href="/legal/integritetspolicy" className="text-blue-600 hover:underline">
                          Integritetspolicy
                        </a>
                      </p>
                    </div>
                  </DndContext>
                )}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Elements and Settings Combined Panel */}
      <div className="w-80 flex-shrink-0">
        <ElementsAndSettings
          selectedElement={selectedElement}
          onElementUpdate={handleElementUpdate}
          onElementAdd={handleElementAdd}
          onElementDelete={handleElementDelete}
          onElementDuplicate={handleElementDuplicate}
          onElementMove={handleElementMove}
          onElementClose={handleElementClose}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          className="h-full"
        />
      </div>
    </div>
  );
}