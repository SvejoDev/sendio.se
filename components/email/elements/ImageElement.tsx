"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image as ImageIcon,
  Link,
  Maximize2,
  Minimize2,
  Upload,
  X
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";
import ImageUpload from "@/components/email/ImageUpload";

interface ImageElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected: boolean;
  isPreview?: boolean;
  onImageClick?: () => void;
}

export default function ImageElement({ 
  element, 
  onUpdate, 
  isSelected, 
  isPreview = false,
  onImageClick 
}: ImageElementProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const elementWidth = typeof element.width === 'string' ? parseInt(element.width) || 100 : (element.width || 100);
  const [imageWidth, setImageWidth] = useState(elementWidth);
  const [hasLink, setHasLink] = useState(!!element.url);
  const [linkUrl, setLinkUrl] = useState(element.url || "");
  const [altText, setAltText] = useState(element.alt || "");

  // Update element when local state changes
  const updateImageSettings = (updates: {
    width?: number;
    url?: string;
    alt?: string;
  }) => {
    const newWidth = updates.width !== undefined ? updates.width : imageWidth;
    const newUrl = updates.url !== undefined ? updates.url : linkUrl;
    const newAlt = updates.alt !== undefined ? updates.alt : altText;

    setImageWidth(newWidth);
    setLinkUrl(newUrl);
    setAltText(newAlt);

    onUpdate({
      width: newWidth,
      url: hasLink ? newUrl : undefined,
      alt: newAlt
    });
  };

  // Preview mode - just render the image
  if (isPreview) {
    const imageElement = (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={element.src} 
        alt={element.alt || ""} 
        className="max-w-full h-auto"
        style={{ 
          width: `${element.width || 100}%`,
          maxHeight: "400px",
          objectFit: "contain"
        }}
      />
    );

    return (
      <div className={`text-${element.alignment || "center"}`}>
        {element.url ? (
          <a 
            href={element.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
      </div>
    );
  }

  // Edit mode but not selected - show image with hover overlay
  if (!isSelected) {
    return (
      <div className={`text-${element.alignment || "center"}`}>
        <div className="relative inline-block group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={element.src} 
            alt={element.alt || ""} 
            className="max-w-full h-auto block cursor-pointer"
            style={{ 
              width: `${element.width || 100}%`,
              maxHeight: "300px",
              objectFit: "contain"
            }}
            onClick={onImageClick}
          />
          {/* Replace Image Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.();
              }}
              className="gap-2 pointer-events-auto"
            >
              <ImageIcon className="h-4 w-4" />
              Byt bild
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full edit mode with all controls
  return (
    <div className="space-y-4 p-4">
      {/* Current Image Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="text-center">
          {element.src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={element.src}
                alt={altText || ""}
                className="max-w-full h-auto max-h-32 mx-auto rounded border bg-white"
                style={{ width: `${imageWidth}%` }}
              />
              <p className="text-xs text-gray-500 mt-2 truncate max-w-full">
                {element.src.split('/').pop()}
              </p>
            </>
          ) : (
            <div className="py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Ingen bild vald</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowImageUpload(true)}
          className="flex-1 gap-2"
          variant={element.src ? "outline" : "default"}
        >
          <Upload className="h-4 w-4" />
          {element.src ? "Byt bild" : "Ladda upp bild"}
        </Button>
        {element.src && (
          <Button
            onClick={() => {
              onUpdate({ src: undefined, alt: undefined });
              setAltText("");
            }}
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Manual URL Input */}
      <div>
        <Label htmlFor="imageSrc" className="text-xs">Eller ange bild-URL direkt</Label>
        <Input
          id="imageSrc"
          value={element.src || ""}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="mt-1 text-sm"
        />
      </div>

      {/* Image Settings */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Bildinställningar
        </Label>

        {/* Alt Text */}
        <div className="mb-4">
          <Label htmlFor="altText" className="text-xs">Alt-text (för tillgänglighet)</Label>
          <Input
            id="altText"
            value={altText}
            onChange={(e) => updateImageSettings({ alt: e.target.value })}
            placeholder="Beskrivning av bilden"
            className="mt-1 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Visas om bilden inte kan laddas
          </p>
        </div>

        {/* Width Control */}
        <div className="mb-4">
          <Label htmlFor="imageWidth" className="text-xs">
            Bredd: {imageWidth}%
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateImageSettings({ width: Math.max(25, imageWidth - 25) })}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Slider
              id="imageWidth"
              min={25}
              max={100}
              step={5}
              value={[imageWidth]}
              onValueChange={(value) => updateImageSettings({ width: value[0] })}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateImageSettings({ width: Math.min(100, imageWidth + 25) })}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-1 mt-2">
            {[25, 50, 75, 100].map(size => (
              <Button
                key={size}
                variant={imageWidth === size ? "default" : "outline"}
                size="sm"
                onClick={() => updateImageSettings({ width: size })}
                className="flex-1 h-7 text-xs"
              >
                {size}%
              </Button>
            ))}
          </div>
        </div>

        {/* Alignment */}
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
                  onClick={() => onUpdate({ alignment: align as "left" | "center" | "right" })}
                  className="h-8 flex-1"
                >
                  <Icon className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Link Settings */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="hasLink" className="text-xs font-medium">
              Lägg till länk
            </Label>
            <Switch
              id="hasLink"
              checked={hasLink}
              onCheckedChange={(checked) => {
                setHasLink(checked);
                if (!checked) {
                  onUpdate({ url: undefined });
                  setLinkUrl("");
                } else if (linkUrl) {
                  onUpdate({ url: linkUrl });
                }
              }}
            />
          </div>
          
          {hasLink && (
            <div>
              <Label htmlFor="linkUrl" className="text-xs">Länk-URL</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => updateImageSettings({ url: e.target.value })}
                    placeholder="https://example.com"
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bilden blir klickbar och öppnar länken
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={(imageData) => {
          onUpdate({
            src: imageData.src,
            alt: imageData.alt || altText
          });
          setAltText(imageData.alt || altText);
          setShowImageUpload(false);
        }}
        currentSrc={element.src}
        currentAlt={altText}
      />
    </div>
  );
}