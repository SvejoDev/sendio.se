"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, X, User } from "lucide-react";
import { EmailElement } from "@/data/emailTemplates";
import VariablePreview from "./VariablePreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  fromName: string;
  replyTo: string;
  elements: EmailElement[];
  contactSample?: Contact;
}

export default function EmailPreview({
  isOpen,
  onClose,
  subject,
  fromName,
  replyTo,
  elements,
  contactSample
}: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "variables">("desktop");
  const [currentContact, setCurrentContact] = useState<Contact>(contactSample || {
    firstName: "Johan",
    lastName: "Svensson",
    email: "johan@exempel.se"
  });

  // Replace variables in text content
  const replaceVariables = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/{first_name}/gi, currentContact.firstName || "{first_name}")
      .replace(/{last_name}/gi, currentContact.lastName || "{last_name}");
  };

  // Generate HTML from elements
  const renderElement = (element: EmailElement) => {
    switch (element.type) {
      case "text":
        const processedContent = replaceVariables(element.content || "");
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: processedContent }}
            style={{
              textAlign: (element.align as "left" | "center" | "right") || "left",
              fontSize: element.fontSize || "16px",
              color: element.color || "#000000"
            }}
          />
        );

      case "image":
        return (
          <div style={{ textAlign: (element.align as "left" | "center" | "right") || "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={element.src}
              alt={element.alt || ""}
              style={{
                maxWidth: "100%",
                width: element.width || "100%",
                height: "auto"
              }}
            />
          </div>
        );

      case "button":
        return (
          <div style={{ textAlign: (element.align as "left" | "center" | "right") || "center", margin: "20px 0" }}>
            <a
              href={element.url || "#"}
              style={{
                display: "inline-block",
                padding: element.size === "small" ? "8px 16px" : element.size === "large" ? "16px 32px" : "12px 24px",
                backgroundColor: element.backgroundColor || "#2563eb",
                color: element.textColor || "#ffffff",
                textDecoration: "none",
                borderRadius: element.cornerRadius || "6px",
                fontSize: element.size === "small" ? "14px" : element.size === "large" ? "18px" : "16px",
                fontWeight: "600",
                width: element.fullWidth ? "100%" : "auto"
              }}
            >
              {replaceVariables(element.text || "")}
            </a>
          </div>
        );

      case "divider":
        return (
          <hr
            style={{
              border: "none",
              borderTop: `${element.thickness || 1}px ${element.style || "solid"} ${element.color || "#e5e7eb"}`,
              margin: `${element.spacing || 20}px 0`,
              width: `${element.width || 100}%`
            }}
          />
        );

      case "social":
        return (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            {element.platforms?.map((platform, idx) => (
              <a
                key={idx}
                href={platform.url}
                style={{
                  display: "inline-block",
                  margin: "0 8px",
                  fontSize: "24px"
                }}
              >
                {platform.icon}
              </a>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const emailContent = (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Email header */}
      <div style={{ 
        borderBottom: "1px solid #e5e7eb", 
        padding: "16px", 
        backgroundColor: "#f9fafb" 
      }}>
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
          <strong>Från:</strong> {fromName || "Ditt företag"} &lt;noreply@sendio.se&gt;
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
          <strong>Till:</strong> {currentContact.firstName} {currentContact.lastName} &lt;{currentContact.email}&gt;
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
          <strong>Ämne:</strong> {replaceVariables(subject) || "Ämnesrad"}
        </div>
        {replyTo && (
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            <strong>Svar-till:</strong> {replyTo}
          </div>
        )}
      </div>

      {/* Email body */}
      <div style={{ padding: "24px" }}>
        {elements.map((element, index) => (
          <div key={element.id || index}>
            {renderElement(element)}
          </div>
        ))}
      </div>

      {/* GDPR Footer */}
      <div style={{ 
        borderTop: "1px solid #e5e7eb", 
        padding: "24px", 
        backgroundColor: "#f9fafb",
        fontSize: "12px",
        color: "#6b7280",
        textAlign: "center"
      }}>
        <p style={{ marginBottom: "8px" }}>
          Du får detta meddelande eftersom du har samtyckt till att ta emot e-post från oss.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <a href="#unsubscribe" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Avregistrera dig här
          </a>
          {" | "}
          <a href="#privacy" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Integritetspolicy
          </a>
        </p>
        <p>
          {fromName || "Ditt företag"} • Sverige
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Förhandsgranska e-post</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "desktop" | "mobile" | "variables")} className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Mobil
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <User className="h-4 w-4" />
                Kontaktdata
              </TabsTrigger>
            </TabsList>

            <TabsContent value="desktop" className="flex-1 overflow-auto mt-4 px-6 pb-6">
              <Card className="max-w-4xl mx-auto">
                <div className="bg-white">
                  {emailContent}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="flex-1 overflow-auto mt-4 px-6 pb-6">
              <div className="max-w-sm mx-auto">
                <Card className="overflow-hidden">
                  <div className="bg-white" style={{ fontSize: "14px" }}>
                    {emailContent}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="flex-1 overflow-auto mt-4 px-6 pb-6">
              <div className="max-w-2xl mx-auto">
                <VariablePreview
                  onContactChange={setCurrentContact}
                  className="h-full"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}