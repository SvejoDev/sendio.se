"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { EmailElement } from "@/data/emailTemplates";

interface DividerElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected: boolean;
  isPreview?: boolean;
}

const DIVIDER_STYLES = [
  { value: "solid", label: "Heldragen", preview: "solid" as const },
  { value: "dashed", label: "Streckad", preview: "dashed" as const },
  { value: "dotted", label: "Prickad", preview: "dotted" as const },
  { value: "double", label: "Dubbel", preview: "double" as const }
];

export default function DividerElement({ 
  element, 
  onUpdate, 
  isSelected, 
  isPreview = false 
}: DividerElementProps) {
  const [lineStyle, setLineStyle] = useState(element.lineStyle || "solid");
  const [lineWidth, setLineWidth] = useState(element.lineWidth || 1);
  const [lineColor, setLineColor] = useState(element.lineColor || "#e5e7eb");
  const [spacing, setSpacing] = useState(typeof element.spacing === 'number' ? element.spacing : 24);
  const [width, setWidth] = useState(element.width || 100);

  const updateDivider = (updates: Partial<EmailElement>) => {
    onUpdate(updates);
  };

  const getDividerStyle = () => {
    return {
      borderTop: `${lineWidth}px ${lineStyle} ${lineColor}`,
      marginTop: `${spacing}px`,
      marginBottom: `${spacing}px`,
      width: `${width}%`,
      marginLeft: width < 100 ? `${(100 - width) / 2}%` : '0',
      marginRight: width < 100 ? `${(100 - width) / 2}%` : '0'
    };
  };

  // Preview mode - just render the divider
  if (isPreview) {
    return (
      <div className="w-full">
        <hr style={getDividerStyle()} />
      </div>
    );
  }

  // Edit mode but not selected
  if (!isSelected) {
    return (
      <div className="w-full py-2">
        <hr style={getDividerStyle()} />
      </div>
    );
  }

  // Full edit mode with controls
  return (
    <div className="space-y-4 p-4">
      {/* Divider Preview */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="relative">
          <hr style={getDividerStyle()} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-gray-50 px-2 text-xs text-gray-500">
              Avdelare
            </span>
          </div>
        </div>
      </div>

      {/* Style Settings */}
      <div>
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Linjestil
        </Label>

        {/* Line Style */}
        <div className="mb-4">
          <Label htmlFor="lineStyle" className="text-xs">Stil</Label>
          <Select 
            value={lineStyle}
            onValueChange={(value) => {
              setLineStyle(value);
              updateDivider({ lineStyle: value });
            }}
          >
            <SelectTrigger id="lineStyle" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIVIDER_STYLES.map(style => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="flex-1 h-2 border-t-2"
                      style={{ borderTopStyle: style.preview }}
                    />
                    <span className="text-sm">{style.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line Width */}
        <div className="mb-4">
          <Label htmlFor="lineWidth" className="text-xs">
            Tjocklek: {lineWidth}px
          </Label>
          <div className="flex items-center gap-3 mt-1">
            <Slider
              id="lineWidth"
              min={1}
              max={5}
              step={1}
              value={[lineWidth]}
              onValueChange={(value) => {
                setLineWidth(value[0]);
                updateDivider({ lineWidth: value[0] });
              }}
              className="flex-1"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(width => (
                <Button
                  key={width}
                  variant={lineWidth === width ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLineWidth(width);
                    updateDivider({ lineWidth: width });
                  }}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {width}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Line Color */}
        <div className="mb-4">
          <Label htmlFor="lineColor" className="text-xs">Färg</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="lineColor"
              type="color"
              value={lineColor}
              onChange={(e) => {
                setLineColor(e.target.value);
                updateDivider({ lineColor: e.target.value });
              }}
              className="w-12 h-8 p-1"
            />
            <Input
              value={lineColor}
              onChange={(e) => {
                setLineColor(e.target.value);
                updateDivider({ lineColor: e.target.value });
              }}
              placeholder="#e5e7eb"
              className="flex-1 h-8 text-xs"
            />
          </div>
          
          {/* Quick Color Options */}
          <div className="grid grid-cols-8 gap-1 mt-2">
            {[
              "#e5e7eb", // Gray 200
              "#d1d5db", // Gray 300
              "#9ca3af", // Gray 400
              "#6b7280", // Gray 500
              "#374151", // Gray 700
              "#000000", // Black
              "#2563eb", // Blue
              "#ffffff"  // White (for dark backgrounds)
            ].map(color => (
              <button
                key={color}
                className={`w-7 h-7 rounded border-2 hover:scale-110 transition-transform ${
                  color === "#ffffff" ? "border-gray-300" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setLineColor(color);
                  updateDivider({ lineColor: color });
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Layout
        </Label>

        {/* Width */}
        <div className="mb-4">
          <Label htmlFor="width" className="text-xs">
            Bredd: {width}%
          </Label>
          <Slider
            id="width"
            min={10}
            max={100}
            step={10}
            value={[width]}
            onValueChange={(value) => {
              setWidth(value[0]);
              updateDivider({ width: value[0] });
            }}
            className="mt-2"
          />
          <div className="flex gap-1 mt-2">
            {[25, 50, 75, 100].map(w => (
              <Button
                key={w}
                variant={width === w ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setWidth(w);
                  updateDivider({ width: w });
                }}
                className="flex-1 h-7 text-xs"
              >
                {w}%
              </Button>
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div>
          <Label htmlFor="spacing" className="text-xs">
            Avstånd: {spacing}px
          </Label>
          <Slider
            id="spacing"
            min={8}
            max={48}
            step={4}
            value={[spacing]}
            onValueChange={(value) => {
              setSpacing(value[0]);
              updateDivider({ spacing: value[0] });
            }}
            className="mt-2"
          />
          <div className="flex gap-1 mt-2">
            {[8, 16, 24, 32, 48].map(space => (
              <Button
                key={space}
                variant={spacing === space ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSpacing(space);
                  updateDivider({ spacing: space });
                }}
                className="flex-1 h-7 text-xs"
              >
                {space}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avstånd ovanför och nedanför linjen
          </p>
        </div>
      </div>

      {/* Visual Examples */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Snabbval
        </Label>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-auto py-3"
            onClick={() => {
              setLineStyle("solid");
              setLineWidth(1);
              setLineColor("#e5e7eb");
              setWidth(100);
              setSpacing(24);
              updateDivider({
                lineStyle: "solid",
                lineWidth: 1,
                lineColor: "#e5e7eb",
                width: 100,
                spacing: 24
              });
            }}
          >
            <div className="w-full">
              <div className="text-xs text-left mb-2">Enkel</div>
              <hr className="border-gray-300" />
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-auto py-3"
            onClick={() => {
              setLineStyle("solid");
              setLineWidth(2);
              setLineColor("#2563eb");
              setWidth(50);
              setSpacing(32);
              updateDivider({
                lineStyle: "solid",
                lineWidth: 2,
                lineColor: "#2563eb",
                width: 50,
                spacing: 32
              });
            }}
          >
            <div className="w-full">
              <div className="text-xs text-left mb-2">Accent</div>
              <hr className="border-2 border-blue-600 w-1/2 mx-auto" />
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-auto py-3"
            onClick={() => {
              setLineStyle("dotted");
              setLineWidth(1);
              setLineColor("#9ca3af");
              setWidth(100);
              setSpacing(16);
              updateDivider({
                lineStyle: "dotted",
                lineWidth: 1,
                lineColor: "#9ca3af",
                width: 100,
                spacing: 16
              });
            }}
          >
            <div className="w-full">
              <div className="text-xs text-left mb-2">Diskret</div>
              <hr className="border-dotted border-gray-400" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}