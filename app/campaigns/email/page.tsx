"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import TemplateSelector from "@/components/email/TemplateSelector";
import EmailBuilder from "@/components/email/EmailBuilder";
import ImageUpload from "@/components/email/ImageUpload";
import EmailPreview from "@/components/email/EmailPreview";
import SubjectLineEditor from "@/components/email/SubjectLineEditor";
import VariablePreview from "@/components/email/VariablePreview";
import AutoSaveIndicator from "@/components/campaigns/AutoSaveIndicator";
import DraftRecoveryDialog from "@/components/campaigns/DraftRecoveryDialog";
import { useAutoSave, AutoSaveData } from "@/hooks/useAutoSave";
import { ArrowLeft, Send, Eye, Image as ImageIcon, Check, Save, TestTube } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmailTemplate, EmailElement } from "@/data/emailTemplates";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface EmailContent extends AutoSaveData {
  subject: string;
  fromName: string;
  replyTo: string;
  template: EmailTemplate | null;
  elements: EmailElement[];
  lastSaved: number;
}

export default function CreateEmailCampaign() {
  const router = useRouter();
  const { toast } = useToast();
  const sendTestEmail = useAction(api.email.sendTestEmail);
  const [step, setStep] = useState<"template" | "build" | "preview">("template");
  const [emailContent, setEmailContent] = useState<EmailContent>({
    subject: "",
    fromName: "",
    replyTo: "",
    template: null,
    elements: [],
    lastSaved: 0
  });
  const [showImageReplacement, setShowImageReplacement] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [imageReplacementIndex, setImageReplacementIndex] = useState(0);
  const [tempElements, setTempElements] = useState<EmailElement[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewContact, setPreviewContact] = useState({
    firstName: "Johan",
    lastName: "Svensson",
    email: "johan@exempel.se"
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handlePreviewContactChange = useCallback((contact: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string }) => {
    setPreviewContact({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || ""
    });
  }, []);

  // Auto-save hook
  const { loadData, clearSavedData, hasUnsavedChanges, forceSave } = useAutoSave(
    emailContent,
    "email-campaign-draft",
    3000
  );

  // Check for existing draft on load
  useEffect(() => {
    const saved = loadData();
    if (saved && (saved.subject || saved.fromName || saved.replyTo || saved.elements?.length > 0)) {
      setShowDraftDialog(true);
    }
  }, [loadData]);

  const handleRecoverDraft = () => {
    const saved = loadData();
    if (saved) {
      setEmailContent(saved);
      if (saved.elements?.length > 0) {
        setStep("build");
      }
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearSavedData();
    setShowDraftDialog(false);
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    // Create elements with unique IDs
    const elementsWithUniqueIds = template.elements.map((element, index) => ({
      ...element,
      id: `${template.id}-${element.type}-${index}-${Date.now()}`
    }));

    const hasImages = elementsWithUniqueIds.some(el => el.type === "image");
    
    if (hasImages) {
      setSelectedTemplate(template);
      setTempElements(elementsWithUniqueIds);
      setImageReplacementIndex(0);
      setShowImageReplacement(true);
    } else {
      setEmailContent(prev => ({
        ...prev,
        template,
        elements: elementsWithUniqueIds
      }));
      setStep("build");
    }
  };

  const handleSkipImageReplacement = () => {
    if (selectedTemplate) {
      setEmailContent(prev => ({
        ...prev,
        template: selectedTemplate,
        elements: tempElements
      }));
      setStep("build");
      setShowImageReplacement(false);
    }
  };

  const handleImageReplace = (imageData: { src: string; alt: string }) => {
    const imageElements = tempElements.filter(el => el.type === "image");
    const currentImageElement = imageElements[imageReplacementIndex];
    
    if (currentImageElement) {
      const updatedElements = tempElements.map(el => 
        el.id === currentImageElement.id 
          ? { ...el, src: imageData.src, alt: imageData.alt }
          : el
      );
      setTempElements(updatedElements);

      const nextImageIndex = imageReplacementIndex + 1;
      if (nextImageIndex < imageElements.length) {
        setImageReplacementIndex(nextImageIndex);
      } else {
        // Done with all images
        if (selectedTemplate) {
          setEmailContent(prev => ({
            ...prev,
            template: selectedTemplate,
            elements: updatedElements
          }));
          setStep("build");
          setShowImageReplacement(false);
        }
      }
    }
  };

  const handleContentUpdate = (elements: EmailElement[]) => {
    console.log('📝 Parent updating content with elements:', elements.map(el => `${el.type}(${el.id?.slice(-6) || 'no-id'})`));
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

      <div className="container mx-auto px-4 py-4">
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
          <div className="w-full flex flex-col">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Anpassa ditt meddelande</h2>
                  <p className="text-gray-600">
                    Redigera innehåll och lägg till element för att skapa det perfekta meddelandet
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <AutoSaveIndicator 
                    lastSaved={emailContent.lastSaved} 
                    hasUnsavedChanges={hasUnsavedChanges()}
                    onForceSave={forceSave}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const timestamp = forceSave();
                        if (timestamp) {
                          setEmailContent(prev => ({ ...prev, lastSaved: timestamp }));
                        }
                      }}
                      disabled={!hasUnsavedChanges()}
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Spara
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailPreview(true)}
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
            </div>

            {/* Email Settings Row */}
            <div className="mb-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">E-postinställningar</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <SubjectLineEditor
                        value={emailContent.subject}
                        onChange={(value) => setEmailContent(prev => ({ 
                          ...prev, 
                          subject: value 
                        }))}
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
                  
                  {/* Test Email Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Skicka test-e-post</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="test@exempel.se"
                          className="w-48 h-8"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!testEmailAddress) {
                              toast({
                                title: "Ange e-postadress",
                                description: "Skriv in en e-postadress för att skicka test.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            if (!emailContent.subject || !emailContent.fromName) {
                              toast({
                                title: "Saknar information",
                                description: "Fyll i ämnesrad och avsändarnamn först.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            setIsSendingTest(true);
                            try {
                              const result = await sendTestEmail({
                                toEmail: testEmailAddress,
                                subject: emailContent.subject,
                                fromName: emailContent.fromName,
                                replyTo: emailContent.replyTo,
                                elements: emailContent.elements,
                                testContact: previewContact
                              });
                              
                              if (result.success) {
                                toast({
                                  title: "Test-e-post skickat!",
                                  description: result.message,
                                });
                              } else {
                                toast({
                                  title: "Kunde inte skicka",
                                  description: result.message,
                                  variant: "destructive"
                                });
                              }
                            } catch {
                              toast({
                                title: "Fel uppstod",
                                description: "Kunde inte skicka test-e-post.",
                                variant: "destructive"
                              });
                            } finally {
                              setIsSendingTest(false);
                            }
                          }}
                          disabled={isSendingTest || emailContent.elements.length === 0}
                          className="gap-2"
                        >
                          <TestTube className="h-3 w-3" />
                          {isSendingTest ? "Skickar..." : "Skicka test"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Email Builder Row with Variable Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[700px] mb-8">
              <div className="lg:col-span-3">
                <EmailBuilder
                  template={emailContent.template}
                  elements={emailContent.elements}
                  onElementsChange={handleContentUpdate}
                />
              </div>
              <div className="lg:col-span-1">
                <VariablePreview
                  onContactChange={handlePreviewContactChange}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Preview Modal */}
        <EmailPreview
          isOpen={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          subject={emailContent.subject}
          fromName={emailContent.fromName}
          replyTo={emailContent.replyTo}
          elements={emailContent.elements}
          contactSample={previewContact}
        />

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

      {/* Image Replacement Dialog */}
      {showImageReplacement && tempElements.length > 0 && (
        <Dialog open={showImageReplacement} onOpenChange={() => setShowImageReplacement(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Byt ut mallbilder</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Vill du byta ut bilderna i mallen mot dina egna? Du kan hoppa över detta och använda mallens standardbilder.
              </div>
              
              {(() => {
                const imageElements = tempElements.filter(el => el.type === "image");
                const currentImage = imageElements[imageReplacementIndex];
                
                if (!currentImage) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Bild {imageReplacementIndex + 1} av {imageElements.length}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {Math.round(((imageReplacementIndex + 1) / imageElements.length) * 100)}% klart
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Nuvarande bild</h4>
                        <div className="border rounded-lg p-4 text-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentImage.src}
                            alt={currentImage.alt || ""}
                            className="max-w-full h-auto max-h-32 mx-auto"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Byt till din bild</h4>
                        <div className="border rounded-lg p-4 text-center">
                          <Button 
                            onClick={() => setShowImageUpload(true)}
                            className="gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Välj ny bild
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleSkipImageReplacement}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Hoppa över - använd mallens bilder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={(imageData) => {
          handleImageReplace(imageData);
          setShowImageUpload(false);
        }}
        currentSrc={(() => {
          const imageElements = tempElements.filter(el => el.type === "image");
          return imageElements[imageReplacementIndex]?.src;
        })()}
        currentAlt={(() => {
          const imageElements = tempElements.filter(el => el.type === "image");
          return imageElements[imageReplacementIndex]?.alt;
        })()}
      />

      {/* Draft Recovery Dialog */}
      <DraftRecoveryDialog
        isOpen={showDraftDialog}
        onRecover={handleRecoverDraft}
        onDiscard={handleDiscardDraft}
        lastSaved={(() => {
          const saved = loadData();
          return saved?.lastSaved;
        })()}
      />
    </div>
  );
}