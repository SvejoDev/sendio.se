"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Smartphone,
  Monitor,
  Trash2,
  Copy,
  GripVertical
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
import ElementLibrary from "./ElementLibrary";
import StylePanel from "./elements/StylePanel";
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
  index: number;
  isSelected: boolean;
  onElementClick: (id: string) => void;
  onElementUpdate: (id: string, updates: Partial<EmailElement>) => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementMove: (id: string, direction: "up" | "down") => void;
  totalElements: number;
}

function SortableElement({
  element,
  index,
  isSelected,
  onElementClick,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementMove,
  totalElements
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
  };

  const commonProps = {
    element,
    onUpdate: (updates: Partial<EmailElement>) => onElementUpdate(element.id, updates),
    isSelected,
    isPreview: false
  };

  let ElementComponent;
  switch (element.type) {
    case "text":
      ElementComponent = <TextElement {...commonProps} />;
      break;
    case "image":
      ElementComponent = <ImageElement {...commonProps} onImageClick={() => onElementClick(element.id)} />;
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
      ElementComponent = <div className="text-gray-500 italic">Okänt element</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative cursor-pointer transition-all ${
        isDragging 
          ? "opacity-50 z-50" 
          : isSelected 
            ? "ring-2 ring-blue-500 bg-blue-50/30" 
            : "hover:ring-2 hover:ring-blue-300"
      }`}
      onClick={() => onElementClick(element.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing ${
          isSelected ? "opacity-100" : ""
        }`}
      >
        <div className="bg-white shadow-md rounded p-1 border">
          <GripVertical className="h-3 w-3 text-gray-500" />
        </div>
      </div>

      {/* Element Controls */}
      <div className={`absolute top-2 right-2 z-10 flex gap-1 transition-opacity ${
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onElementMove(element.id, "up");
          }}
          disabled={index === 0}
          className="h-6 w-6 p-0 bg-white shadow-md"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onElementMove(element.id, "down");
          }}
          disabled={index === totalElements - 1}
          className="h-6 w-6 p-0 bg-white shadow-md"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onElementDuplicate(element.id);
          }}
          className="h-6 w-6 p-0 bg-white shadow-md"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Är du säker på att du vill ta bort detta element?")) {
              onElementDelete(element.id);
            }
          }}
          className="h-6 w-6 p-0 bg-white shadow-md"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-4">
        {ElementComponent}
      </div>
    </div>
  );
}

export default function EmailBuilder({ elements, onElementsChange }: EmailBuilderProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debug: Track elements changes
  useEffect(() => {
    console.log('🔄 Elements array changed:', elements.map(el => `${el.type}(${el.id?.slice(-6) || 'no-id'})`));
  }, [elements]);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleElementAdd = (newElement: Partial<EmailElement>) => {
    const element: EmailElement = {
      id: newElement.id || Date.now().toString() + Math.random().toString(36).substring(2, 11),
      type: newElement.type || "text",
      ...newElement
    };
    console.log('➕ Adding element:', `${element.type}(${element.id.slice(-6)})`, 'Current count:', elements.length);
    const newElements = [...elements, element];
    console.log('📋 New elements array:', newElements.map(el => `${el.type}(${el.id.slice(-6)})`));
    onElementsChange(newElements);
    setSelectedElementId(element.id); // Auto-select new element
  };

  const handleMultipleElementsAdd = (newElements: Partial<EmailElement>[]) => {
    const elementsToAdd = newElements.map(newElement => ({
      id: newElement.id || Date.now().toString() + Math.random().toString(36).substring(2, 11),
      type: newElement.type || "text",
      ...newElement
    }));
    
    console.log('➕ Adding multiple elements:', elementsToAdd.map(el => `${el.type}(${el.id.slice(-6)})`));
    const finalElements = [...elements, ...elementsToAdd];
    console.log('📋 Final elements array:', finalElements.map(el => `${el.type}(${el.id.slice(-6)})`));
    onElementsChange(finalElements);
  };

  const handleElementUpdate = useCallback((id: string, updates: Partial<EmailElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(newElements);
  }, [elements, onElementsChange]);

  const handleElementDelete = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    onElementsChange(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleElementDuplicate = (id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
      };
      
      const currentIndex = elements.findIndex(el => el.id === id);
      const newElements = [...elements];
      newElements.splice(currentIndex + 1, 0, duplicatedElement);
      
      onElementsChange(newElements);
      setSelectedElementId(duplicatedElement.id);
    }
  };

  const handleElementMove = (id: string, direction: "up" | "down") => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= elements.length) return;

    const newElements = [...elements];
    [newElements[currentIndex], newElements[newIndex]] = [newElements[newIndex], newElements[currentIndex]];
    onElementsChange(newElements);
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId === selectedElementId ? null : elementId);
  };

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
      {/* Element Library */}
      <div className="w-72 flex-shrink-0">
        <ElementLibrary 
          onElementAdd={handleElementAdd} 
          onMultipleElementsAdd={handleMultipleElementsAdd}
        />
      </div>

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
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className={`p-4 ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
              <div className="bg-white border rounded-lg overflow-hidden">
                {elements.length === 0 ? (
                  <div className="p-12 text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                        {elements.map((element, index) => (
                          <SortableElement
                            key={element.id}
                            element={element}
                            index={index}
                            isSelected={selectedElementId === element.id}
                            onElementClick={handleElementClick}
                            onElementUpdate={handleElementUpdate}
                            onElementDelete={handleElementDelete}
                            onElementDuplicate={handleElementDuplicate}
                            onElementMove={handleElementMove}
                            totalElements={elements.length}
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

      {/* Element Settings Panel */}
      <div className="w-80 flex-shrink-0">
        <StylePanel
          selectedElement={selectedElement || null}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
          onElementDuplicate={handleElementDuplicate}
          onElementMove={handleElementMove}
          onClose={() => setSelectedElementId(null)}
          canMoveUp={selectedElement ? elements.findIndex(el => el.id === selectedElement.id) > 0 : false}
          canMoveDown={selectedElement ? elements.findIndex(el => el.id === selectedElement.id) < elements.length - 1 : false}
        />
      </div>
    </div>
  );
}