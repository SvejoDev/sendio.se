"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Contact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

interface VariablePreviewProps {
  onContactChange?: (contact: Contact) => void;
  className?: string;
}

const sampleContacts: Contact[] = [
  { firstName: "Johan", lastName: "Svensson", email: "johan@exempel.se", phoneNumber: "+46701234567" },
  { firstName: "Anna", lastName: "Andersson", email: "anna@foretag.se", phoneNumber: "+46709876543" },
  { firstName: "Erik", lastName: "Nilsson", email: "erik.nilsson@gmail.com", phoneNumber: "+46732468135" },
  { firstName: "", lastName: "Johansson", email: "info@butik.se", phoneNumber: "+46708642097" },
  { firstName: "Maria", lastName: "", email: "maria@exempel.com", phoneNumber: "" }
];

export default function VariablePreview({
  onContactChange,
  className = ""
}: VariablePreviewProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("0");
  const [customContact, setCustomContact] = useState<Contact>(sampleContacts[0]);
  const [isCustom, setIsCustom] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (onContactChange) {
        onContactChange(customContact);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialMount.current && onContactChange) {
      onContactChange(customContact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customContact]);

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      setSelectedPreset(value);
    } else {
      setIsCustom(false);
      setSelectedPreset(value);
      const contact = sampleContacts[parseInt(value)];
      setCustomContact(contact);
    }
  };

  const handleCustomFieldChange = (field: keyof Contact, value: string) => {
    setCustomContact(prev => ({ ...prev, [field]: value }));
  };

  const randomizeContact = () => {
    const randomIndex = Math.floor(Math.random() * sampleContacts.length);
    setSelectedPreset(randomIndex.toString());
    setIsCustom(false);
    setCustomContact(sampleContacts[randomIndex]);
  };

  const getVariableDisplay = (value: string | undefined, fallback: string) => {
    return value || `{${fallback}}`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <h3 className="font-medium">Förhandsvisning med kontaktdata</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={randomizeContact}
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Slumpa
          </Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Välj eller anpassa en exempelkontakt för att se hur variablerna ersätts i ditt meddelande.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="preset">Välj exempelkontakt</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sampleContacts.map((contact, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {contact.firstName || "(Inget förnamn)"} {contact.lastName || "(Inget efternamn)"} - {contact.email}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Anpassa egen kontakt...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <Label htmlFor="firstName" className="text-xs">Förnamn</Label>
                <Input
                  id="firstName"
                  value={customContact.firstName}
                  onChange={(e) => handleCustomFieldChange("firstName", e.target.value)}
                  placeholder="Johan"
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs">Efternamn</Label>
                <Input
                  id="lastName"
                  value={customContact.lastName}
                  onChange={(e) => handleCustomFieldChange("lastName", e.target.value)}
                  placeholder="Svensson"
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={customContact.email}
                  onChange={(e) => handleCustomFieldChange("email", e.target.value)}
                  placeholder="johan@exempel.se"
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Telefon</Label>
                <Input
                  id="phone"
                  value={customContact.phoneNumber}
                  onChange={(e) => handleCustomFieldChange("phoneNumber", e.target.value)}
                  placeholder="+46701234567"
                  className="mt-1 h-8"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="text-xs font-medium text-gray-600 mb-2">Så här kommer variablerna att ersättas:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white px-1.5 py-0.5 rounded border text-blue-600">
                  {"{first_name}"}
                </code>
                <span className="text-gray-500">→</span>
                <span className="font-medium">
                  {getVariableDisplay(customContact.firstName, "first_name")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white px-1.5 py-0.5 rounded border text-blue-600">
                  {"{last_name}"}
                </code>
                <span className="text-gray-500">→</span>
                <span className="font-medium">
                  {getVariableDisplay(customContact.lastName, "last_name")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}