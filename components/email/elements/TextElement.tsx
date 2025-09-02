"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";

interface TextElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected?: boolean;
  isPreview?: boolean;
}

interface TextContent {
  heading: string;
  paragraphs: string[];
}

// Extract only text content from HTML elements
const extractTextContent = (html: string): TextContent => {
  if (!html) return { heading: "", paragraphs: [] };
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find heading (h1, h2, h3, etc.)
  const headingElement = doc.querySelector('h1, h2, h3, h4, h5, h6');
  const heading = headingElement?.textContent?.trim() || "";
  
  // Find all paragraphs
  const paragraphElements = doc.querySelectorAll('p');
  const paragraphs = Array.from(paragraphElements)
    .map(p => p.textContent?.trim() || "")
    .filter(text => text.length > 0);
  
  return { heading, paragraphs };
};

// Update HTML with new text content while preserving all styling
const updateHTMLWithText = (originalHTML: string, textContent: TextContent): string => {
  if (!originalHTML) return originalHTML;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalHTML, 'text/html');
  
  // Update heading if it exists
  const headingElement = doc.querySelector('h1, h2, h3, h4, h5, h6');
  if (headingElement && textContent.heading) {
    headingElement.textContent = textContent.heading;
  }
  
  // Update paragraphs
  const paragraphElements = doc.querySelectorAll('p');
  
  // Update existing paragraphs
  paragraphElements.forEach((p, index) => {
    if (index < textContent.paragraphs.length) {
      // Process variables in text
      const processedText = textContent.paragraphs[index]
        .replace(/{first_name}/g, '<span style="color: #2563eb; font-weight: 600;">{first_name}</span>')
        .replace(/{last_name}/g, '<span style="color: #2563eb; font-weight: 600;">{last_name}</span>');
      
      p.innerHTML = processedText;
    } else {
      // Remove extra paragraphs
      p.remove();
    }
  });
  
  // Add new paragraphs if needed
  if (textContent.paragraphs.length > paragraphElements.length) {
    const container = doc.body.firstElementChild;
    if (container) {
      // Get style from existing paragraph or create default
      const existingP = doc.querySelector('p');
      const defaultStyle = existingP?.getAttribute('style') || 
        'font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 12px 0;';
      
      for (let i = paragraphElements.length; i < textContent.paragraphs.length; i++) {
        const newP = doc.createElement('p');
        newP.setAttribute('style', defaultStyle);
        
        const processedText = textContent.paragraphs[i]
          .replace(/{first_name}/g, '<span style="color: #2563eb; font-weight: 600;">{first_name}</span>')
          .replace(/{last_name}/g, '<span style="color: #2563eb; font-weight: 600;">{last_name}</span>');
        
        newP.innerHTML = processedText;
        container.appendChild(newP);
      }
    }
  }
  
  return doc.body.innerHTML;
};

export default function TextElement({ element, onUpdate, isPreview = false }: TextElementProps) {
  const [textContent, setTextContent] = useState<TextContent>(() => 
    extractTextContent(element.content || "")
  );
  
  const debouncedUpdate = useRef<NodeJS.Timeout | null>(null);

  const updateElement = useCallback((newTextContent: TextContent) => {
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current);
    }
    
    debouncedUpdate.current = setTimeout(() => {
      const newHTML = updateHTMLWithText(element.content || "", newTextContent);
      onUpdate({ content: newHTML });
    }, 300);
  }, [element.content, onUpdate]);

  const handleHeadingChange = (newHeading: string) => {
    const updated = { ...textContent, heading: newHeading };
    setTextContent(updated);
    updateElement(updated);
  };

  const handleParagraphChange = (index: number, newText: string) => {
    const updated = { 
      ...textContent, 
      paragraphs: textContent.paragraphs.map((p, i) => i === index ? newText : p)
    };
    setTextContent(updated);
    updateElement(updated);
  };

  const addParagraph = () => {
    const updated = { 
      ...textContent, 
      paragraphs: [...textContent.paragraphs, ""] 
    };
    setTextContent(updated);
  };

  const removeParagraph = (index: number) => {
    const updated = { 
      ...textContent, 
      paragraphs: textContent.paragraphs.filter((_, i) => i !== index)
    };
    setTextContent(updated);
    updateElement(updated);
  };

  const insertVariable = (variable: string, type: 'heading' | 'paragraph', index?: number) => {
    if (type === 'heading') {
      handleHeadingChange(textContent.heading + `{${variable}}`);
    } else if (type === 'paragraph' && index !== undefined) {
      handleParagraphChange(index, textContent.paragraphs[index] + `{${variable}}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current);
      }
    };
  }, []);

  // Preview mode - just render the HTML
  if (isPreview) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: element.content || "" }}
      />
    );
  }

  // Edit mode - show only input fields for text content
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 mb-4">
        <Label className="text-sm font-medium">Redigera textinnehåll</Label>
        <p className="text-xs text-gray-500">
          Ändra endast texten. All styling och formatering behålls automatiskt.
        </p>
      </div>

      {/* Heading Input */}
      {textContent.heading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Rubrik</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-3 w-3 mr-1" />
                  Variabel
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertVariable("first_name", "heading")}
                    className="w-full justify-start text-xs"
                  >
                    {"{first_name}"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertVariable("last_name", "heading")}
                    className="w-full justify-start text-xs"
                  >
                    {"{last_name}"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Input
            value={textContent.heading}
            onChange={(e) => handleHeadingChange(e.target.value)}
            placeholder="Ange rubriktext..."
            className="font-medium"
          />
        </div>
      )}

      {/* Paragraph Inputs */}
      {textContent.paragraphs.map((paragraph, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              {textContent.paragraphs.length === 1 ? "Text" : `Text ${index + 1}`}
            </Label>
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-3 w-3 mr-1" />
                    Variabel
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertVariable("first_name", "paragraph", index)}
                      className="w-full justify-start text-xs"
                    >
                      {"{first_name}"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertVariable("last_name", "paragraph", index)}
                      className="w-full justify-start text-xs"
                    >
                      {"{last_name}"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {textContent.paragraphs.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeParagraph(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Ta bort
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={paragraph}
            onChange={(e) => handleParagraphChange(index, e.target.value)}
            placeholder="Ange text..."
            className="min-h-20 resize-none"
            rows={3}
          />
        </div>
      ))}

      {/* Add Paragraph Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={addParagraph}
        className="w-full"
      >
        Lägg till textavsnitt
      </Button>

      {/* Preview */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-sm">Förhandsvisning</Label>
        <div className="border rounded-md p-4 bg-gray-50 min-h-16">
          <div 
            dangerouslySetInnerHTML={{ __html: element.content || "" }}
          />
        </div>
      </div>
    </div>
  );
}