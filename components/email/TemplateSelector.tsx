"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMAIL_TEMPLATES, EmailTemplate, getTemplatesByCategory } from "@/data/emailTemplates";
import { Mail, Megaphone, Bell, Calendar, Eye, Palette } from "lucide-react";

interface TemplateSelectorProps {
  onTemplateSelect: (template: EmailTemplate) => void;
}

const categoryIcons = {
  newsletter: Mail,
  promotional: Megaphone,
  announcement: Bell,
  event: Calendar
};

const categoryLabels = {
  newsletter: "Nyhetsbrev",
  promotional: "Kampanj",
  announcement: "Meddelande",
  event: "Evenemang"
};

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const getTemplates = () => {
    if (selectedCategory === "all") return EMAIL_TEMPLATES;
    return getTemplatesByCategory(selectedCategory);
  };

  const TemplatePreview = ({ template }: { template: EmailTemplate }) => {
    return (
      <div className="border rounded-lg p-4 bg-white max-w-md mx-auto max-h-96 overflow-y-auto">
        <div className="text-xs text-gray-600 mb-2">
          <strong>Förhandsgranskning:</strong>
        </div>
        <div className="prose prose-sm max-w-none">
          {template.elements.map((element, index) => (
            <div key={index} className="mb-2 text-xs">
              {element.type === "text" && (
                <div dangerouslySetInnerHTML={{ __html: element.content || "" }} />
              )}
              {element.type === "button" && (
                <div className="text-center my-3">
                  <span
                    className="inline-block px-3 py-1 rounded text-white text-xs"
                    style={{
                      backgroundColor: element.backgroundColor || "#2563eb",
                      color: element.textColor || "#ffffff"
                    }}
                  >
                    {element.text}
                  </span>
                </div>
              )}
              {element.type === "divider" && (
                <hr className="my-3 border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            <Eye className="h-4 w-4" />
            Alla mallar
          </TabsTrigger>
          {Object.entries(categoryLabels).map(([category, label]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <TabsTrigger key={category} value={category} className="gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTemplates().map((template) => {
              const CategoryIcon = categoryIcons[template.category];
              return (
                <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {/* Template Preview Mockup */}
                    <div className="absolute inset-4 bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div 
                        className="h-8 border-b flex items-center px-2"
                        style={{ backgroundColor: template.colors.primary + "10" }}
                      >
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-300"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-300"></div>
                          <div className="w-2 h-2 rounded-full bg-green-300"></div>
                        </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        {/* Simulate email content */}
                        <div 
                          className="h-3 rounded"
                          style={{ backgroundColor: template.colors.primary, width: "60%" }}
                        ></div>
                        <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                        
                        <div 
                          className="h-6 rounded mt-2"
                          style={{ backgroundColor: template.colors.primary + "20" }}
                        ></div>
                        
                        <div className="space-y-1 mt-2">
                          <div className="h-1 bg-gray-200 rounded w-full"></div>
                          <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                          <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                        </div>
                        
                        <div 
                          className="h-4 rounded mt-2 mx-auto"
                          style={{ 
                            backgroundColor: template.colors.primary,
                            width: "40%"
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 gap-1 bg-white/90 backdrop-blur-sm"
                    >
                      <CategoryIcon className="h-3 w-3" />
                      {categoryLabels[template.category]}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-3 w-3 text-gray-400" />
                      <div className="flex gap-1">
                        {Object.entries(template.colors).slice(0, 3).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Förhandsgranska
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onTemplateSelect(template)}
                        className="flex-1"
                        style={{ backgroundColor: template.colors.primary }}
                      >
                        Välj mall
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {getTemplates().length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Inga mallar hittades
              </h3>
              <p className="text-gray-600">
                Det finns inga mallar i denna kategori för tillfället.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <TemplatePreview template={previewTemplate} />
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Stäng
              </Button>
              <Button
                onClick={() => {
                  onTemplateSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
                style={{ backgroundColor: previewTemplate.colors.primary }}
              >
                Välj denna mall
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}