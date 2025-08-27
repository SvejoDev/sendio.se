"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Smartphone,
  Monitor,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image
} from "lucide-react";
import { EmailElement, EmailTemplate } from "@/data/emailTemplates";
import ElementLibrary from "./ElementLibrary";
import ImageUpload from "./ImageUpload";


interface EmailBuilderProps {
  template: EmailTemplate | null;
  elements: EmailElement[];
  onElementsChange: (elements: EmailElement[]) => void;
}

interface TextEditorProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
}

function TextEditor({ element, onUpdate }: TextEditorProps) {
  const [parsedContent, setParsedContent] = useState(() => {
    // Parse HTML content to extract structured data
    const content = element.content || "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extract title (h1, h2, h3)
    const titleElement = doc.querySelector('h1, h2, h3');
    const title = titleElement?.textContent || "";
    
    // Extract main text (p tags)
    const textElements = doc.querySelectorAll('p');
    const text = Array.from(textElements).map(p => p.textContent).join('\n') || "";
    
    return { title, text };
  });

  // Debounced update to prevent focus loss
  const debouncedUpdate = useRef<NodeJS.Timeout | null>(null);

  const updateContent = useCallback((updates: { title?: string; text?: string }) => {
    const newContent = { ...parsedContent, ...updates };
    setParsedContent(newContent);
    
    // Clear existing timeout
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current);
    }
    
    // Debounced HTML update
    debouncedUpdate.current = setTimeout(() => {
      const { title, text } = newContent;
      const originalContent = element.content || "";
      
      // Parse original HTML to preserve structure and styling
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalContent, 'text/html');
      
      // Update title while preserving original styling
      const titleElement = doc.querySelector('h1, h2, h3');
      if (titleElement && title) {
        titleElement.textContent = title;
      } else if (title && !titleElement) {
        // Create new title element with original template styling
        const container = doc.querySelector('div') || doc.body;
        const newTitle = doc.createElement('h2');
        newTitle.textContent = title;
        newTitle.setAttribute('style', 'font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;');
        container.insertBefore(newTitle, container.firstChild);
      } else if (!title && titleElement) {
        // Remove title if empty
        titleElement.remove();
      }
      
      // Update text content while preserving original paragraph styling
      const paragraphs = doc.querySelectorAll('p');
      const textLines = text.split('\n').filter(line => line.trim());
      
      // Remove existing paragraphs
      paragraphs.forEach(p => p.remove());
      
      // Add new paragraphs with preserved styling
      if (textLines.length > 0) {
        const container = doc.querySelector('div') || doc.body;
        textLines.forEach(line => {
          const p = doc.createElement('p');
          p.textContent = line;
          // Preserve original paragraph styling or use template default
          p.setAttribute('style', 'font-size: 16px; line-height: 1.6; color: #374151; margin: 0;');
          container.appendChild(p);
        });
      }
      
      // Get the updated HTML content
      const updatedContent = doc.querySelector('div')?.outerHTML || originalContent;
      onUpdate({ content: updatedContent });
    }, 300);
  }, [parsedContent, onUpdate, element.content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Rubrik</Label>
        <Input
          id="title"
          value={parsedContent.title}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="Ange rubrik..."
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="text">Innehåll</Label>
        <Textarea
          id="text"
          value={parsedContent.text}
          onChange={(e) => updateContent({ text: e.target.value })}
          rows={6}
          className="mt-1"
          placeholder="Skriv ditt innehåll här..."
        />
      </div>
      
      <div>
        <Label>Justering</Label>
        <div className="flex gap-1 mt-1">
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
            return (
              <Button
                key={align}
                variant={element.alignment === align ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({ alignment: align as "left" | "center" | "right" })}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EmailBuilder({ elements, onElementsChange }: EmailBuilderProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showImageUpload, setShowImageUpload] = useState(false);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleElementAdd = (newElement: Partial<EmailElement>) => {
    const element: EmailElement = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      type: newElement.type || "text",
      ...newElement
    };
    onElementsChange([...elements, element]);
  };

  const handleElementUpdate = (id: string, updates: Partial<EmailElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(newElements);
  };

  const handleElementDelete = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    onElementsChange(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
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

  const renderElementPreview = (element: EmailElement) => {
    switch (element.type) {
      case "text":
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: element.content || "" }} 
            className="prose max-w-none"
          />
        );
      
      case "image":
        return (
          <div className={`text-${element.alignment || "center"}`}>
            <div className="relative inline-block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={element.src} 
                alt={element.alt || ""} 
                className="max-w-full h-auto block"
                style={{ maxHeight: "300px" }}
              />
              {/* Replace Image Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(element.id);
                    setShowImageUpload(true);
                  }}
                  className="gap-2"
                >
                  <Image className="h-4 w-4" />
                  Byt bild
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "button":
        return (
          <div className={`text-${element.alignment || "center"} my-6`}>
            <span
              className="inline-block px-6 py-3 rounded-md cursor-pointer transition-colors"
              style={{
                backgroundColor: element.backgroundColor || "#2563eb",
                color: element.textColor || "#ffffff"
              }}
            >
              {element.text || "Knapptext"}
            </span>
          </div>
        );
      
      case "divider":
        return <hr className="my-6 border-gray-300" />;
      
      case "social":
        return (
          <div className={`text-${element.alignment || "center"} my-6`}>
            <div className="flex justify-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">f</span>
              </div>
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📷</span>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🐦</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-gray-500 italic">Okänt element</div>;
    }
  };

  const ElementEditor = () => {
    if (!selectedElement) {
      return (
        <div className="p-6 text-center">
          <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Välj ett element</h3>
          <p className="text-sm text-gray-600">
            Klicka på ett element i förhandsvisningen för att redigera det
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-medium capitalize">
            Redigera {selectedElement.type === "text" ? "text" : 
                     selectedElement.type === "image" ? "bild" :
                     selectedElement.type === "button" ? "knapp" :
                     selectedElement.type === "divider" ? "avdelare" :
                     selectedElement.type === "social" ? "sociala medier" : selectedElement.type}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleElementDelete(selectedElement.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {selectedElement.type === "text" && (
          <TextEditor 
            element={selectedElement}
            onUpdate={(updates) => handleElementUpdate(selectedElement.id, updates)}
          />
        )}

        {selectedElement.type === "image" && (
          <div className="space-y-4">
            {/* Current Image Preview */}
            {selectedElement.src && (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedElement.src}
                  alt={selectedElement.alt || ""}
                  className="max-w-full h-auto max-h-32 mx-auto rounded border"
                />
              </div>
            )}
            
            {/* Replace Image Button */}
            <Button
              onClick={() => setShowImageUpload(true)}
              className="w-full gap-2"
              variant={selectedElement.src ? "outline" : "default"}
            >
              <Image className="h-4 w-4" />
              {selectedElement.src ? "Byt bild" : "Lägg till bild"}
            </Button>

            {/* Manual URL Input */}
            <div>
              <Label htmlFor="src">Eller ange bild-URL</Label>
              <Input
                id="src"
                value={selectedElement.src || ""}
                onChange={(e) => handleElementUpdate(selectedElement.id, { src: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="alt">Alt-text</Label>
              <Input
                id="alt"
                value={selectedElement.alt || ""}
                onChange={(e) => handleElementUpdate(selectedElement.id, { alt: e.target.value })}
                placeholder="Beskrivning av bilden"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Justering</Label>
              <div className="flex gap-1 mt-1">
                {(["left", "center", "right"] as const).map((align) => {
                  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                  return (
                    <Button
                      key={align}
                      variant={selectedElement.alignment === align ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleElementUpdate(selectedElement.id, { alignment: align as "left" | "center" | "right" })}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === "button" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="buttonText">Knapptext</Label>
              <Input
                id="buttonText"
                value={selectedElement.text || ""}
                onChange={(e) => handleElementUpdate(selectedElement.id, { text: e.target.value })}
                placeholder="Klicka här"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="url">Länk</Label>
              <Input
                id="url"
                value={selectedElement.url || ""}
                onChange={(e) => handleElementUpdate(selectedElement.id, { url: e.target.value })}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bgColor">Bakgrundsfärg</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bgColor"
                    type="color"
                    value={selectedElement.backgroundColor || "#2563eb"}
                    onChange={(e) => handleElementUpdate(selectedElement.id, { backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={selectedElement.backgroundColor || "#2563eb"}
                    onChange={(e) => handleElementUpdate(selectedElement.id, { backgroundColor: e.target.value })}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="textColor">Textfärg</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={selectedElement.textColor || "#ffffff"}
                    onChange={(e) => handleElementUpdate(selectedElement.id, { textColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={selectedElement.textColor || "#ffffff"}
                    onChange={(e) => handleElementUpdate(selectedElement.id, { textColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Justering</Label>
              <div className="flex gap-1 mt-1">
                {(["left", "center", "right"] as const).map((align) => {
                  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                  return (
                    <Button
                      key={align}
                      variant={selectedElement.alignment === align ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleElementUpdate(selectedElement.id, { alignment: align as "left" | "center" | "right" })}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-row gap-4 h-full">
      {/* Element Library */}
      <div className="w-72 flex-shrink-0">
        <ElementLibrary onElementAdd={handleElementAdd} />
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
                  <div className="space-y-0">
                    {elements.map((element, index) => (
                      <div
                        key={element.id}
                        className={`group relative cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all ${
                          selectedElementId === element.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setSelectedElementId(element.id)}
                      >
                        {/* Element Controls */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementMove(element.id, "up");
                            }}
                            disabled={index === 0}
                            className="h-6 w-6 p-1"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementMove(element.id, "down");
                            }}
                            disabled={index === elements.length - 1}
                            className="h-6 w-6 p-1"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementDelete(element.id);
                            }}
                            className="h-6 w-6 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {renderElementPreview(element)}
                      </div>
                    ))}

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
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Element Settings */}
      <div className="w-72 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium">Inställningar</h3>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <ElementEditor />
          </ScrollArea>
        </Card>
      </div>

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={(imageData) => {
          if (selectedElement?.type === "image") {
            handleElementUpdate(selectedElement.id, {
              src: imageData.src,
              alt: imageData.alt
            });
          }
        }}
        currentSrc={selectedElement?.type === "image" ? selectedElement.src : undefined}
        currentAlt={selectedElement?.type === "image" ? selectedElement.alt : undefined}
      />
    </div>
  );
}