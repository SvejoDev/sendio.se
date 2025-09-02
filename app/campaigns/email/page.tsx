"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import TemplateSelector from "@/components/email/TemplateSelector";
import EmailBuilder from "@/components/email/EmailBuilder";
import ImageUpload from "@/components/email/ImageUpload";
import EmailPreview from "@/components/email/EmailPreview";
import SubjectLineEditor from "@/components/email/SubjectLineEditor";
import AutoSaveIndicator from "@/components/campaigns/AutoSaveIndicator";
import DraftRecoveryDialog from "@/components/campaigns/DraftRecoveryDialog";
import { useAutoSave, AutoSaveData } from "@/hooks/useAutoSave";
import { 
  ArrowLeft, 
  Send, 
  Eye, 
  Image as ImageIcon, 
  Check, 
  Save, 
  TestTube,
  Settings,
  Layout,
  Mail
} from "lucide-react";
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

const steps = [
  { id: "template", name: "Mall", description: "Välj en mall", icon: Layout },
  { id: "configure", name: "Konfiguration", description: "E-postinställningar", icon: Settings },
  { id: "build", name: "Skapa", description: "Bygg ditt meddelande", icon: Mail },
  { id: "review", name: "Granska", description: "Kontrollera och testa", icon: Eye }
] as const;

type StepId = typeof steps[number]["id"];

export default function CreateEmailCampaign() {
  const router = useRouter();
  const { toast } = useToast();
  const sendTestEmail = useAction(api.email.sendTestEmail);
  
  const [currentStep, setCurrentStep] = useState<StepId>("template");
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  
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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previewContact, setPreviewContact] = useState({
    firstName: "Johan",
    lastName: "Svensson",
    email: "johan@exempel.se"
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Auto-save hook
  const { loadData, clearSavedData, hasUnsavedChanges, forceSave, saveCounter } = useAutoSave(
    emailContent,
    "email-campaign-draft",
    3000
  );

  // Memoize hasUnsavedChanges to prevent hydration mismatch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hasUnsaved = useMemo(() => isClient ? hasUnsavedChanges() : false, [hasUnsavedChanges, isClient, saveCounter]);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        setCurrentStep("build");
        setCompletedSteps(new Set(["template", "configure"]));
      }
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearSavedData();
    setShowDraftDialog(false);
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
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
      setCompletedSteps(prev => new Set([...prev, "template"]));
      setCurrentStep("configure");
    }
  };

  const handleSkipImageReplacement = () => {
    if (selectedTemplate) {
      setEmailContent(prev => ({
        ...prev,
        template: selectedTemplate,
        elements: tempElements
      }));
      setCompletedSteps(prev => new Set([...prev, "template"]));
      setCurrentStep("configure");
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
        if (selectedTemplate) {
          setEmailContent(prev => ({
            ...prev,
            template: selectedTemplate,
            elements: updatedElements
          }));
          setCompletedSteps(prev => new Set([...prev, "template"]));
          setCurrentStep("configure");
          setShowImageReplacement(false);
        }
      }
    }
  };

  const handleContentUpdate = (elements: EmailElement[]) => {
    setEmailContent(prev => ({ ...prev, elements }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case "template":
        return emailContent.template !== null;
      case "configure":
        return emailContent.subject.trim() !== "" && emailContent.fromName.trim() !== "";
      case "build":
        return emailContent.elements.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      const currentIndex = steps.findIndex(step => step.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id);
      }
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const isStepAccessible = (stepId: StepId) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    // Allow access to completed steps and current step
    return stepIndex <= currentIndex || completedSteps.has(stepId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "template":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Välj e-postmall</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Börja med en professionell mall och anpassa efter dina behov. 
                Alla mallar är optimerade för mobil och desktop.
              </p>
            </div>
            <TemplateSelector onTemplateSelect={handleTemplateSelect} />
          </div>
        );

      case "configure":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Konfigurera ditt e-postmeddelande</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ange ämnesrad, avsändaruppgifter och andra inställningar för din kampanj.
              </p>
            </div>
            
            <Card className="max-w-4xl mx-auto p-6">
              <div className="space-y-6">
                <div>
                  <SubjectLineEditor
                    value={emailContent.subject}
                    onChange={(value) => setEmailContent(prev => ({ 
                      ...prev, 
                      subject: value 
                    }))}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-gray-500 mt-1">Visas som avsändare i mottagarens inkorg</p>
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
                    <p className="text-xs text-gray-500 mt-1">Valfritt - dit svar skickas</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Förhandsvisning</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Från:</strong> {emailContent.fromName || "Ditt företagsnamn"} &lt;noreply@sendio.se&gt;</div>
                    <div><strong>Ämne:</strong> {emailContent.subject || "Din ämnesrad"}</div>
                    {emailContent.replyTo && <div><strong>Svar-till:</strong> {emailContent.replyTo}</div>}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case "build":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Bygg ditt meddelande</h2>
                <p className="text-gray-600">
                  Dra och släpp element för att skapa ditt perfekta meddelande
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AutoSaveIndicator 
                  lastSaved={emailContent.lastSaved} 
                  hasUnsavedChanges={hasUnsavedChanges()}
                  onForceSave={forceSave}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowEmailPreview(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Förhandsgranska
                </Button>
              </div>
            </div>

            <div className="h-[calc(100vh-280px)]">
              <EmailBuilder
                template={emailContent.template}
                elements={emailContent.elements}
                onElementsChange={handleContentUpdate}
              />
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Granska och testa</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kontrollera att allt ser bra ut och skicka ett test-e-post innan du lanserar kampanjen.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Campaign Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Kampanjöversikt</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mall:</span> {emailContent.template?.name}
                  </div>
                  <div>
                    <span className="text-gray-600">Element:</span> {emailContent.elements.length} st
                  </div>
                  <div>
                    <span className="text-gray-600">Ämnesrad:</span> {emailContent.subject}
                  </div>
                  <div>
                    <span className="text-gray-600">Avsändare:</span> {emailContent.fromName}
                  </div>
                </div>
              </Card>

              {/* Test Email */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Skicka test-e-post</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="din-email@exempel.se"
                      className="w-full"
                    />
                  </div>
                  <Button
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
                          description: "Kontrollera att alla inställningar är ifyllda.",
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
                    <TestTube className="h-4 w-4" />
                    {isSendingTest ? "Skickar..." : "Skicka test"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Få en förhandstitt av hur ditt meddelande kommer att se ut i mottagarens inkorg
                </p>
              </Card>

              {/* Preview Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowEmailPreview(true)}
                  className="gap-2"
                >
                  <Eye className="h-5 w-5" />
                  Förhandsgranska fullständigt meddelande
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 flex-shrink-0">
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
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Skapa e-postkampanj
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const timestamp = forceSave();
                  if (timestamp) {
                    setEmailContent(prev => ({ ...prev, lastSaved: timestamp }));
                  }
                }}
                disabled={!hasUnsaved}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Spara
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.has(step.id);
                const isAccessible = isStepAccessible(step.id);
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => isAccessible && setCurrentStep(step.id)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-blue-100 text-blue-700" 
                          : isCompleted
                          ? "text-green-700 hover:bg-green-50"
                          : isAccessible
                          ? "text-gray-600 hover:bg-gray-100"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isActive
                          ? "border-blue-500 bg-blue-500 text-white"
                          : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300"
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className={`font-medium text-sm ${isActive ? "text-blue-700" : ""}`}>
                          {step.name}
                        </div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentStep !== "template" && (
                <Button variant="outline" onClick={handlePrevStep} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Föregående
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentStep === "review" ? (
                <Button size="lg" className="gap-2">
                  <Send className="h-5 w-5" />
                  Fortsätt till betalning
                </Button>
              ) : (
                <Button 
                  onClick={handleNextStep} 
                  disabled={!canProceedToNextStep()}
                  size="lg"
                  className="gap-2"
                >
                  Nästa
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailPreview
        isOpen={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        subject={emailContent.subject}
        fromName={emailContent.fromName}
        replyTo={emailContent.replyTo}
        elements={emailContent.elements}
        contactSample={previewContact}
      />

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

      <DraftRecoveryDialog
        isOpen={showDraftDialog}
        onRecover={handleRecoverDraft}
        onDiscard={handleDiscardDraft}
        lastSaved={(() => {
          const saved = loadData();
          return saved?.lastSaved;
        })()}
      />

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
                      <Badge variant="secondary">
                        {Math.round(((imageReplacementIndex + 1) / imageElements.length) * 100)}% klart
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Nuvarande bild</h4>
                        <div className="border rounded-lg p-4 text-center bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentImage.src}
                            alt={currentImage.alt || ""}
                            className="max-w-full h-auto max-h-32 mx-auto rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Byt till din bild</h4>
                        <div className="border rounded-lg p-4 text-center bg-gray-50">
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
    </div>
  );
}