"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Mail,
  Phone,
  Palette
} from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
  icon?: React.ReactNode;
}

interface SocialElementProps {
  element: EmailElement;
  onUpdate: (updates: Partial<EmailElement>) => void;
  isSelected: boolean;
  isPreview?: boolean;
}

const SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, placeholder: "https://facebook.com/dittforetag" },
  { id: "instagram", name: "Instagram", icon: Instagram, placeholder: "https://instagram.com/dittforetag" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/dittforetag" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/dittforetag" },
  { id: "youtube", name: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@dittforetag" },
  { id: "website", name: "Hemsida", icon: Globe, placeholder: "https://dittforetag.se" },
  { id: "email", name: "E-post", icon: Mail, placeholder: "mailto:info@dittforetag.se" },
  { id: "phone", name: "Telefon", icon: Phone, placeholder: "tel:+46812345678" }
];

const ICON_STYLES = [
  { value: "circle", label: "Cirkel", className: "rounded-full" },
  { value: "square", label: "Fyrkant", className: "rounded-none" },
  { value: "rounded", label: "Rundad", className: "rounded-md" }
];

const ICON_SIZES = [
  { value: "sm", label: "Liten", size: 32 },
  { value: "md", label: "Medium", size: 40 },
  { value: "lg", label: "Stor", size: 48 }
];

export default function SocialElement({ 
  element, 
  onUpdate, 
  isSelected, 
  isPreview = false 
}: SocialElementProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    const links = element.socialLinks || [];
    return SOCIAL_PLATFORMS.map(platform => {
      const existing = links.find((l) => l.platform === platform.id);
      return {
        platform: platform.id,
        url: existing?.url || "",
        enabled: existing?.enabled || false
      };
    });
  });

  const [iconStyle, setIconStyle] = useState(element.iconStyle || "circle");
  const [iconSize, setIconSize] = useState(element.iconSize || "md");
  const [iconColor, setIconColor] = useState(element.iconColor || "#374151");
  const [iconBackground, setIconBackground] = useState(element.iconBackground || "#f3f4f6");
  const [useColoredIcons, setUseColoredIcons] = useState(element.useColoredIcons || false);
  const [spacing, setSpacing] = useState(typeof element.spacing === 'number' ? element.spacing : 8);

  const updateSocialLinks = (index: number, updates: Partial<SocialLink>) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], ...updates };
    setSocialLinks(newLinks);
    onUpdate({ socialLinks: newLinks });
  };

  const updateStyle = (updates: Partial<EmailElement>) => {
    onUpdate(updates);
  };

  const getIconSize = () => {
    return ICON_SIZES.find(s => s.value === iconSize)?.size || 40;
  };

  const getIconClass = () => {
    return ICON_STYLES.find(s => s.value === iconStyle)?.className || "rounded-full";
  };

  const getBrandColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: "#1877f2",
      instagram: "#e4405f",
      twitter: "#1da1f2",
      linkedin: "#0077b5",
      youtube: "#ff0000",
      website: "#2563eb",
      email: "#ea580c",
      phone: "#16a34a"
    };
    return colors[platform] || "#374151";
  };

  const renderSocialIcon = (link: SocialLink, size: number = 40) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
    if (!platform) return null;

    const Icon = platform.icon;
    const iconSizeClass = size <= 32 ? "h-4 w-4" : size <= 40 ? "h-5 w-5" : "h-6 w-6";
    
    const bgColor = useColoredIcons ? getBrandColor(link.platform) : iconBackground;
    const fgColor = useColoredIcons ? "#ffffff" : iconColor;

    return (
      <a
        href={link.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center ${getIconClass()} hover:opacity-80 transition-opacity`}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          color: fgColor,
          margin: `0 ${spacing / 2}px`
        }}
        title={platform.name}
      >
        <Icon className={iconSizeClass} />
      </a>
    );
  };

  // Preview mode
  if (isPreview) {
    const enabledLinks = socialLinks.filter(link => link.enabled && link.url);
    if (enabledLinks.length === 0) {
      return null;
    }

    return (
      <div className={`my-6 text-${element.alignment || "center"}`}>
        <div className="inline-flex items-center">
          {enabledLinks.map((link, index) => (
            <span key={index}>
              {renderSocialIcon(link, getIconSize())}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Edit mode but not selected
  if (!isSelected) {
    const enabledLinks = socialLinks.filter(link => link.enabled);
    
    return (
      <div className={`my-6 text-${element.alignment || "center"}`}>
        <div className="inline-flex items-center">
          {enabledLinks.length > 0 ? (
            enabledLinks.map((link, index) => (
              <span key={index}>
                {renderSocialIcon(link, getIconSize())}
              </span>
            ))
          ) : (
            <div className="text-gray-400 text-sm">
              Klicka för att lägga till sociala länkar
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full edit mode
  return (
    <div className="space-y-4 p-4">
      {/* Preview */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className={`text-${element.alignment || "center"}`}>
          <div className="inline-flex items-center">
            {socialLinks.filter(l => l.enabled).length > 0 ? (
              socialLinks
                .filter(link => link.enabled)
                .map((link, index) => (
                  <span key={index}>
                    {renderSocialIcon(link, getIconSize())}
                  </span>
                ))
            ) : (
              <div className="text-gray-400 text-sm">
                Aktivera sociala länkar nedan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Links Configuration */}
      <div>
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Sociala länkar
        </Label>
        
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform, index) => {
            const link = socialLinks[index];
            const Icon = platform.icon;
            
            return (
              <div key={platform.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div 
                    className={`flex-shrink-0 w-10 h-10 ${getIconClass()} flex items-center justify-center`}
                    style={{
                      backgroundColor: useColoredIcons ? getBrandColor(platform.id) : iconBackground,
                      color: useColoredIcons ? "#ffffff" : iconColor
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${platform.id}-enabled`} className="text-sm font-medium">
                        {platform.name}
                      </Label>
                      <Switch
                        id={`${platform.id}-enabled`}
                        checked={link.enabled}
                        onCheckedChange={(checked) => updateSocialLinks(index, { enabled: checked })}
                      />
                    </div>
                    
                    {link.enabled && (
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLinks(index, { url: e.target.value })}
                        placeholder={platform.placeholder}
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Icon Style Settings */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          Ikonstil
        </Label>

        {/* Icon Shape */}
        <div className="mb-4">
          <Label className="text-xs">Form</Label>
          <div className="flex gap-1 mt-1">
            {ICON_STYLES.map(style => (
              <Button
                key={style.value}
                variant={iconStyle === style.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIconStyle(style.value);
                  updateStyle({ iconStyle: style.value });
                }}
                className="flex-1 h-8 text-xs"
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Icon Size */}
        <div className="mb-4">
          <Label className="text-xs">Storlek</Label>
          <div className="flex gap-1 mt-1">
            {ICON_SIZES.map(size => (
              <Button
                key={size.value}
                variant={iconSize === size.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIconSize(size.value);
                  updateStyle({ iconSize: size.value });
                }}
                className="flex-1 h-8 text-xs"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div className="mb-4">
          <Label htmlFor="spacing" className="text-xs">
            Mellanrum: {spacing}px
          </Label>
          <Slider
            id="spacing"
            min={4}
            max={20}
            step={2}
            value={[spacing]}
            onValueChange={(value) => {
              setSpacing(value[0]);
              updateStyle({ spacing: value[0] });
            }}
            className="mt-2"
          />
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
                  onClick={() => updateStyle({ alignment: align as "left" | "center" | "right" })}
                  className="h-8 flex-1"
                >
                  <Icon className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Settings */}
      <div className="border-t pt-4">
        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3 block">
          <Palette className="h-3 w-3 inline mr-1" />
          Färger
        </Label>

        {/* Use Brand Colors Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="useColors" className="text-xs">Använd varumärkesfärger</Label>
            <p className="text-xs text-gray-500 mt-1">
              Använd plattformarnas officiella färger
            </p>
          </div>
          <Switch
            id="useColors"
            checked={useColoredIcons}
            onCheckedChange={(checked) => {
              setUseColoredIcons(checked);
              updateStyle({ useColoredIcons: checked });
            }}
          />
        </div>

        {!useColoredIcons && (
          <>
            {/* Icon Color */}
            <div className="mb-4">
              <Label htmlFor="iconColor" className="text-xs">Ikonfärg</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="iconColor"
                  type="color"
                  value={iconColor}
                  onChange={(e) => {
                    setIconColor(e.target.value);
                    updateStyle({ iconColor: e.target.value });
                  }}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={iconColor}
                  onChange={(e) => {
                    setIconColor(e.target.value);
                    updateStyle({ iconColor: e.target.value });
                  }}
                  placeholder="#374151"
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <Label htmlFor="bgColor" className="text-xs">Bakgrundsfärg</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bgColor"
                  type="color"
                  value={iconBackground}
                  onChange={(e) => {
                    setIconBackground(e.target.value);
                    updateStyle({ iconBackground: e.target.value });
                  }}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={iconBackground}
                  onChange={(e) => {
                    setIconBackground(e.target.value);
                    updateStyle({ iconBackground: e.target.value });
                  }}
                  placeholder="#f3f4f6"
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}