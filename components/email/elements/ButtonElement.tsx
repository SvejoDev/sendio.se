"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Palette,
  Type,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";

interface ButtonElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected?: boolean;
  isPreview?: boolean;
}

const BUTTON_STYLES = [
  { value: "filled", label: "Fylld", preview: "bg-blue-600 text-white" },
  { value: "outline", label: "Kontur", preview: "border-2 border-blue-600 text-blue-600" },
  { value: "ghost", label: "Diskret", preview: "text-blue-600 hover:bg-blue-50" }
];

const BUTTON_SIZES = [
  { value: "sm", label: "Liten", padding: "px-4 py-2 text-sm" },
  { value: "md", label: "Medium", padding: "px-6 py-3 text-base" },
  { value: "lg", label: "Stor", padding: "px-8 py-4 text-lg" }
];

const BUTTON_RADIUS = [
  { value: "none", label: "Ingen", radius: "rounded-none" },
  { value: "sm", label: "Liten", radius: "rounded" },
  { value: "md", label: "Medium", radius: "rounded-md" },
  { value: "lg", label: "Stor", radius: "rounded-lg" },
  { value: "full", label: "Pil", radius: "rounded-full" }
];

export default function ButtonElement({ 
  element, 
  onUpdate, 
  isPreview = false 
}: ButtonElementProps) {
  const [buttonText, setButtonText] = useState(element.text || "Klicka här");
  const [buttonUrl, setButtonUrl] = useState(element.url || "");
  const [buttonStyle, setButtonStyle] = useState(element.style || "filled");
  const [buttonSize, setButtonSize] = useState(element.size || "md");
  const [buttonRadius, setButtonRadius] = useState(element.radius || "md");
  const [backgroundColor, setBackgroundColor] = useState(element.backgroundColor || "#2563eb");
  const [textColor, setTextColor] = useState(element.textColor || "#ffffff");
  const [borderColor, setBorderColor] = useState(element.borderColor || "#2563eb");
  const [enableTracking, setEnableTracking] = useState(element.trackClicks !== false);
  const [fullWidth, setFullWidth] = useState(element.fullWidth || false);

  // Sync state with element props when they change
  useEffect(() => {
    setButtonText(element.text || "Klicka här");
    setButtonUrl(element.url || "");
    setButtonStyle(element.style || "filled");
    setButtonSize(element.size || "md");
    setButtonRadius(element.radius || "md");
    setBackgroundColor(element.backgroundColor || "#2563eb");
    setTextColor(element.textColor || "#ffffff");
    setBorderColor(element.borderColor || "#2563eb");
    setEnableTracking(element.trackClicks !== false);
    setFullWidth(element.fullWidth || false);
  }, [element]);

  const updateButton = (updates: Partial<EmailElement>) => {
    onUpdate(updates);
  };

  const getButtonClass = () => {
    const sizeClass = BUTTON_SIZES.find(s => s.value === buttonSize)?.padding || BUTTON_SIZES[1].padding;
    const radiusClass = BUTTON_RADIUS.find(r => r.value === buttonRadius)?.radius || BUTTON_RADIUS[2].radius;
    const widthClass = fullWidth ? "w-full" : "inline-block";
    
    return `${sizeClass} ${radiusClass} ${widthClass} font-medium transition-all hover:opacity-90 cursor-pointer`;
  };

  const getButtonStyle = () => {
    if (buttonStyle === "outline") {
      return {
        backgroundColor: "transparent",
        color: borderColor || "#2563eb",
        border: `2px solid ${borderColor || "#2563eb"}`
      };
    } else if (buttonStyle === "ghost") {
      return {
        backgroundColor: "transparent",
        color: backgroundColor || "#2563eb"
      };
    } else {
      return {
        backgroundColor: backgroundColor || "#2563eb",
        color: textColor || "#ffffff"
      };
    }
  };

  // Preview mode - just render the button
  if (isPreview) {
    return (
      <div className={`my-6 text-${element.alignment || "center"}`}>
        <a
          href={element.url || "#"}
          className={getButtonClass()}
          style={getButtonStyle()}
          target="_blank"
          rel="noopener noreferrer"
          data-track={element.trackClicks !== false ? "true" : "false"}
        >
          {element.text || "Klicka här"}
        </a>
      </div>
    );
  }

  // Full edit mode with controls (when not in preview)
  return (
    <div className="space-y-4 p-4">
      {/* Button Preview */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className={`text-${element.alignment || "center"}`}>
          <span
            className={getButtonClass()}
            style={getButtonStyle()}
          >
            {buttonText}
          </span>
        </div>
      </div>

      {/* Button Text */}
      <div>
        <Label htmlFor="buttonText" className="text-xs flex items-center gap-1">
          <Type className="h-3 w-3" />
          Knapptext
        </Label>
        <Input
          id="buttonText"
          value={buttonText}
          onChange={(e) => {
            setButtonText(e.target.value);
            updateButton({ text: e.target.value });
          }}
          placeholder="Klicka här"
          className="mt-1 text-sm"
        />
      </div>

      {/* Button URL */}
      <div>
        <Label htmlFor="buttonUrl" className="text-xs flex items-center gap-1">
          <Link className="h-3 w-3" />
          Länk-URL
        </Label>
        <div className="relative">
          <Input
            id="buttonUrl"
            value={buttonUrl}
            onChange={(e) => {
              setButtonUrl(e.target.value);
              updateButton({ url: e.target.value });
            }}
            placeholder="https://example.com"
            className="mt-1 pr-10 text-sm"
          />
          <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 mt-0.5" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Länken öppnas i nytt fönster
        </p>
      </div>

      {/* Style & Layout */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Stil & Layout
        </Label>

        {/* Button Style */}
        <div className="mb-4">
          <Label htmlFor="buttonStyle" className="text-xs">Knappstil</Label>
          <Select 
            value={buttonStyle}
            onValueChange={(value) => {
              setButtonStyle(value);
              updateButton({ style: value });
            }}
          >
            <SelectTrigger id="buttonStyle" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUTTON_STYLES.map(style => (
                <SelectItem key={style.value} value={style.value}>
                  <span className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs ${style.preview}`}>
                      Aa
                    </span>
                    {style.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Button Size */}
        <div className="mb-4">
          <Label className="text-xs">Storlek</Label>
          <div className="flex gap-1 mt-1">
            {BUTTON_SIZES.map(size => (
              <Button
                key={size.value}
                variant={buttonSize === size.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setButtonSize(size.value);
                  updateButton({ size: size.value });
                }}
                className="flex-1 h-8 text-xs"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Corner Radius */}
        <div className="mb-4">
          <Label className="text-xs">Hörn</Label>
          <div className="grid grid-cols-5 gap-1 mt-1">
            {BUTTON_RADIUS.map(radius => (
              <Button
                key={radius.value}
                variant={buttonRadius === radius.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setButtonRadius(radius.value);
                  updateButton({ radius: radius.value });
                }}
                className="h-8 text-xs p-0"
                title={radius.label}
              >
                <div className={`w-4 h-3 bg-current ${radius.radius}`} />
              </Button>
            ))}
          </div>
        </div>

        {/* Full Width Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="fullWidth" className="text-xs">Full bredd</Label>
          <Switch
            id="fullWidth"
            checked={fullWidth}
            onCheckedChange={(checked) => {
              setFullWidth(checked);
              updateButton({ fullWidth: checked });
            }}
          />
        </div>

        {/* Alignment */}
        {!fullWidth && (
          <div className="mb-4">
            <Label className="text-xs">Justering</Label>
            <div className="flex gap-1 mt-1">
              {(["left", "center", "right"] as const).map((align) => {
                const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                return (
                  <Button
                    key={align}
                    variant={element.alignment === align ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateButton({ alignment: align as "left" | "center" | "right" })}
                    className="h-8 flex-1"
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          <Palette className="h-3 w-3 inline mr-1" />
          Färger
        </Label>

        {buttonStyle !== "ghost" && (
          <div className="mb-4">
            <Label htmlFor="bgColor" className="text-xs">
              {buttonStyle === "outline" ? "Ramfärg" : "Bakgrundsfärg"}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bgColor"
                type="color"
                value={buttonStyle === "outline" ? borderColor : backgroundColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  if (buttonStyle === "outline") {
                    setBorderColor(newColor);
                    updateButton({ borderColor: newColor });
                  } else {
                    setBackgroundColor(newColor);
                    updateButton({ backgroundColor: newColor });
                  }
                }}
                className="w-12 h-8 p-1"
              />
              <Input
                value={buttonStyle === "outline" ? borderColor : backgroundColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  if (buttonStyle === "outline") {
                    setBorderColor(newColor);
                    updateButton({ borderColor: newColor });
                  } else {
                    setBackgroundColor(newColor);
                    updateButton({ backgroundColor: newColor });
                  }
                }}
                placeholder="#2563eb"
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="textColor" className="text-xs">Textfärg</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="textColor"
              type="color"
              value={buttonStyle === "ghost" ? backgroundColor : (buttonStyle === "outline" ? borderColor : textColor)}
              onChange={(e) => {
                const newColor = e.target.value;
                if (buttonStyle === "ghost") {
                  setBackgroundColor(newColor);
                  updateButton({ backgroundColor: newColor });
                } else if (buttonStyle === "outline") {
                  setBorderColor(newColor);
                  updateButton({ borderColor: newColor });
                } else {
                  setTextColor(newColor);
                  updateButton({ textColor: newColor });
                }
              }}
              className="w-12 h-8 p-1"
            />
            <Input
              value={buttonStyle === "ghost" ? backgroundColor : (buttonStyle === "outline" ? borderColor : textColor)}
              onChange={(e) => {
                const newColor = e.target.value;
                if (buttonStyle === "ghost") {
                  setBackgroundColor(newColor);
                  updateButton({ backgroundColor: newColor });
                } else if (buttonStyle === "outline") {
                  setBorderColor(newColor);
                  updateButton({ borderColor: newColor });
                } else {
                  setTextColor(newColor);
                  updateButton({ textColor: newColor });
                }
              }}
              placeholder={buttonStyle === "filled" ? "#ffffff" : "#2563eb"}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>

        {/* Quick Color Presets */}
        <div>
          <Label className="text-xs mb-2 block">Snabbval</Label>
          <div className="grid grid-cols-5 gap-2">
            {[
              "#2563EB", // Blue
              "#16A34A", // Green  
              "#DC2626", // Red
              "#EA580C", // Orange
              "#7C3AED", // Purple
              "#DB2777", // Pink
              "#FACC15", // Yellow
              "#6B7280", // Gray
              "#000000", // Black
              "#FFFFFF"  // White (with border)
            ].map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                  color === "#FFFFFF" ? "border-gray-300" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (buttonStyle === "filled") {
                    const newTextColor = color === "#FFFFFF" || color === "#FACC15" ? "#000000" : "#FFFFFF";
                    setBackgroundColor(color);
                    setTextColor(newTextColor);
                    updateButton({ 
                      backgroundColor: color,
                      textColor: newTextColor
                    });
                  } else if (buttonStyle === "outline") {
                    setBorderColor(color);
                    updateButton({ borderColor: color });
                  } else if (buttonStyle === "ghost") {
                    setBackgroundColor(color);
                    updateButton({ backgroundColor: color });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="tracking" className="text-xs flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Spåra klick
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Samla in statistik när mottagare klickar
            </p>
          </div>
          <Switch
            id="tracking"
            checked={enableTracking}
            onCheckedChange={(checked) => {
              setEnableTracking(checked);
              updateButton({ trackClicks: checked });
            }}
          />
        </div>
      </div>
    </div>
  );
}