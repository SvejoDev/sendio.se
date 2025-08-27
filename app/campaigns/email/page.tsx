"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TemplateSelector from "@/components/email/TemplateSelector";
import EmailBuilder from "@/components/email/EmailBuilder";
import { ArrowLeft, Send, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmailTemplate, EmailElement } from "@/data/emailTemplates";

interface EmailContent {
  subject: string;
  fromName: string;
  replyTo: string;
  template: EmailTemplate | null;
  elements: EmailElement[];
}

export default function CreateEmailCampaign() {
  const router = useRouter();
  const [step, setStep] = useState<"template" | "build" | "preview">("template");
  const [emailContent, setEmailContent] = useState<EmailContent>({
    subject: "",
    fromName: "",
    replyTo: "",
    template: null,
    elements: []
  });

  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailContent(prev => ({
      ...prev,
      template,
      elements: template.elements
    }));
    setStep("build");
  };

  const handleContentUpdate = (elements: EmailElement[]) => {
    setEmailContent(prev => ({ ...prev, elements }));
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Skapa e-postkampanj
              </h1>
              <p className="text-sm text-gray-600">
                Välj mall, anpassa innehåll och skicka professionella e-postmeddelanden
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {step === "template" && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Välj e-postmall</h2>
              <p className="text-gray-600">
                Börja med en professionell mall och anpassa efter dina behov
              </p>
            </div>
            <TemplateSelector onTemplateSelect={handleTemplateSelect} />
          </div>
        )}

        {step === "build" && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Anpassa ditt meddelande</h2>
                  <p className="text-gray-600">
                    Redigera innehåll och lägg till element för att skapa det perfekta meddelandet
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("preview")}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Förhandsgranska
                  </Button>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Fortsätt till betalning
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Email Settings */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="font-medium mb-4">E-postinställningar</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Ämnesrad</Label>
                      <Input
                        id="subject"
                        value={emailContent.subject}
                        onChange={(e) => setEmailContent(prev => ({ 
                          ...prev, 
                          subject: e.target.value 
                        }))}
                        placeholder="Skriv din ämnesrad..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromName">Avsändarnamn</Label>
                      <Input
                        id="fromName"
                        value={emailContent.fromName}
                        onChange={(e) => setEmailContent(prev => ({ 
                          ...prev, 
                          fromName: e.target.value 
                        }))}
                        placeholder="Ditt företagsnamn"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="replyTo">Svar-till e-post</Label>
                      <Input
                        id="replyTo"
                        type="email"
                        value={emailContent.replyTo}
                        onChange={(e) => setEmailContent(prev => ({ 
                          ...prev, 
                          replyTo: e.target.value 
                        }))}
                        placeholder="info@dittforetag.se"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Email Builder */}
              <div className="lg:col-span-3">
                <EmailBuilder
                  template={emailContent.template}
                  elements={emailContent.elements}
                  onElementsChange={handleContentUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Förhandsgranska kampanj</h2>
                  <p className="text-gray-600">
                    Se hur ditt e-postmeddelande kommer att se ut för mottagarna
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("build")}
                  >
                    Redigera
                  </Button>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Fortsätt till betalning
                  </Button>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <div className="border rounded-lg p-4 bg-white max-w-2xl mx-auto">
                <div className="border-b pb-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Från:</strong> {emailContent.fromName || "Ditt företag"} &lt;noreply@sendio.se&gt;
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Ämne:</strong> {emailContent.subject || "Ämnesrad"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Svar-till:</strong> {emailContent.replyTo || "info@dittforetag.se"}
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  {emailContent.elements.map((element, index) => (
                    <div key={index} className="mb-4">
                      {element.type === "text" && (
                        <div dangerouslySetInnerHTML={{ __html: element.content || "" }} />
                      )}
                      {element.type === "image" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={element.src} 
                          alt={element.alt || ""} 
                          className="max-w-full h-auto"
                        />
                      )}
                      {element.type === "button" && (
                        <div className="text-center my-6">
                          <a
                            href={element.url}
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            style={{
                              backgroundColor: element.backgroundColor || "#2563eb",
                              color: element.textColor || "#ffffff"
                            }}
                          >
                            {element.text}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* GDPR Footer */}
                <div className="border-t pt-4 mt-6 text-xs text-gray-500 text-center">
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
                  <p className="mt-2">
                    {emailContent.fromName || "Ditt företag"} • Sverige
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}