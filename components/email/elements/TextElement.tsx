"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  User
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";

interface TextElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected: boolean;
  isPreview?: boolean;
}

interface ParsedContent {
  title: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  italic: boolean;
  underline: boolean;
  color: string;
}

export default function TextElement({ element, onUpdate, isSelected, isPreview = false }: TextElementProps) {
  const [parsedContent, setParsedContent] = useState<ParsedContent>(() => {
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
    
    // Extract styling from first text element
    const firstElement = titleElement || textElements[0];
    const style = firstElement ? window.getComputedStyle(firstElement) : null;
    
    return { 
      title, 
      text,
      fontSize: parseInt(style?.fontSize || "16"),
      fontFamily: style?.fontFamily || "Inter, sans-serif",
      fontWeight: style?.fontWeight || "400",
      italic: style?.fontStyle === "italic",
      underline: style?.textDecoration?.includes("underline") || false,
      color: style?.color || "#374151"
    };
  });

  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debouncedUpdate = useRef<NodeJS.Timeout | null>(null);

  const updateContent = useCallback((updates: Partial<ParsedContent>) => {
    const newContent = { ...parsedContent, ...updates };
    setParsedContent(newContent);
    
    // Clear existing timeout
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current);
    }
    
    // Debounced HTML update
    debouncedUpdate.current = setTimeout(() => {
      const { title, text, fontSize, fontFamily, fontWeight, italic, underline, color } = newContent;
      
      let html = '<div style="padding: 20px;">';
      
      // Add title if present
      if (title) {
        const titleStyle = `
          font-size: ${Math.round(fontSize * 1.5)}px;
          font-family: ${fontFamily};
          font-weight: ${parseInt(fontWeight) > 400 ? "600" : fontWeight};
          font-style: ${italic ? "italic" : "normal"};
          text-decoration: ${underline ? "underline" : "none"};
          color: ${color};
          margin: 0 0 16px 0;
          line-height: 1.2;
        `.replace(/\s+/g, ' ').trim();
        
        html += `<h2 style="${titleStyle}">${title}</h2>`;
      }
      
      // Add paragraphs
      const textLines = text.split('\n').filter(line => line.trim());
      if (textLines.length > 0) {
        const paragraphStyle = `
          font-size: ${fontSize}px;
          font-family: ${fontFamily};
          font-weight: ${fontWeight};
          font-style: ${italic ? "italic" : "normal"};
          text-decoration: ${underline ? "underline" : "none"};
          color: ${color};
          line-height: 1.6;
          margin: 0 0 12px 0;
        `.replace(/\s+/g, ' ').trim();
        
        textLines.forEach(line => {
          // Replace variables with styled placeholders
          const processedLine = line
            .replace(/{first_name}/g, '<span style="color: #2563eb; font-weight: 600;">{first_name}</span>')
            .replace(/{last_name}/g, '<span style="color: #2563eb; font-weight: 600;">{last_name}</span>');
          
          html += `<p style="${paragraphStyle}">${processedLine}</p>`;
        });
      }
      
      html += '</div>';
      
      onUpdate({ content: html });
    }, 300);
  }, [parsedContent, onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current);
      }
    };
  }, []);

  const insertVariable = (variable: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = parsedContent.text;
      const newText = text.substring(0, start) + `{${variable}}` + text.substring(end);
      updateContent({ text: newText });
      
      // Reset cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + variable.length + 2;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
    setShowVariableMenu(false);
  };

  // Preview mode - just render the content
  if (isPreview) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: element.content || "" }} 
        className="prose max-w-none"
        style={{ textAlign: element.alignment || "left" }}
      />
    );
  }

  // Edit mode - show all controls
  if (!isSelected) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: element.content || "" }} 
        className="prose max-w-none"
        style={{ textAlign: element.alignment || "left" }}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Typography Controls */}
      <div className="border-b pb-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
          Typografi
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Font Family */}
          <div>
            <Label htmlFor="fontFamily" className="text-xs">Typsnitt</Label>
            <Select 
              value={parsedContent.fontFamily}
              onValueChange={(value) => updateContent({ fontFamily: value })}
            >
              <SelectTrigger id="fontFamily" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="Georgia, serif">Georgia</SelectItem>
                <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                <SelectItem value="Courier New, monospace">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <Label htmlFor="fontSize" className="text-xs">
              Storlek: {parsedContent.fontSize}px
            </Label>
            <Slider
              id="fontSize"
              min={12}
              max={32}
              step={1}
              value={[parsedContent.fontSize]}
              onValueChange={(value) => updateContent({ fontSize: value[0] })}
              className="mt-2"
            />
          </div>
        </div>

        {/* Text Style Buttons */}
        <div className="flex gap-2 mt-3">
          <div className="flex gap-1">
            <Button
              variant={parseInt(parsedContent.fontWeight) > 400 ? "default" : "outline"}
              size="sm"
              onClick={() => updateContent({ 
                fontWeight: parseInt(parsedContent.fontWeight) > 400 ? "400" : "600" 
              })}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              variant={parsedContent.italic ? "default" : "outline"}
              size="sm"
              onClick={() => updateContent({ italic: !parsedContent.italic })}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              variant={parsedContent.underline ? "default" : "outline"}
              size="sm"
              onClick={() => updateContent({ underline: !parsedContent.underline })}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex gap-1">
            {/* Color Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: parsedContent.color }}
                  />
                  <Palette className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="textColor" className="text-xs">Textfärg</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="textColor"
                        type="color"
                        value={parsedContent.color}
                        onChange={(e) => updateContent({ color: e.target.value })}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={parsedContent.color}
                        onChange={(e) => updateContent({ color: e.target.value })}
                        placeholder="#374151"
                        className="flex-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#FFFFFF",
                      "#DC2626", "#EA580C", "#FACC15", "#16A34A", "#2563EB", "#7C3AED", "#DB2777"
                    ].map(color => (
                      <button
                        key={color}
                        className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateContent({ color })}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Content Editing */}
      <div>
        <Label htmlFor="title" className="text-xs">Rubrik (valfri)</Label>
        <Input
          id="title"
          value={parsedContent.title}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="Ange rubrik..."
          className="mt-1 text-sm"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="text" className="text-xs">Innehåll</Label>
          <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <User className="h-3 w-3" />
                Infoga variabel
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1">
              <button
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                onClick={() => insertVariable("first_name")}
              >
                {"{first_name}"} - Förnamn
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                onClick={() => insertVariable("last_name")}
              >
                {"{last_name}"} - Efternamn
              </button>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea
          ref={textareaRef}
          id="text"
          value={parsedContent.text}
          onChange={(e) => updateContent({ text: e.target.value })}
          rows={6}
          className="mt-1 text-sm font-mono"
          placeholder="Skriv ditt innehåll här... Använd {first_name} och {last_name} för personalisering."
        />
        <p className="text-xs text-gray-500 mt-1">
          Tips: Använd Enter för ny rad. Variabler: {"{first_name}"}, {"{last_name}"}
        </p>
      </div>
      
      {/* Alignment */}
      <div>
        <Label className="text-xs">Justering</Label>
        <div className="flex gap-1 mt-1">
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
            return (
              <Button
                key={align}
                variant={element.alignment === align ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({ alignment: align as "left" | "center" | "right" })}
                className="h-8 flex-1"
              >
                <Icon className="h-3 w-3" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}