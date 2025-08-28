"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Upload, Crop } from "lucide-react";
import ImageCropper from "@/components/ui/image-cropper";

interface ImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageData: { src: string; alt: string }) => void;
  currentSrc?: string;
  currentAlt?: string;
}


export default function ImageUpload({ 
  isOpen, 
  onClose, 
  onImageSelect, 
  currentSrc, 
  currentAlt 
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentSrc || "");
  const [altText, setAltText] = useState(currentAlt || "");
  const [showCropper, setShowCropper] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const handleUrlInput = (url: string) => {
    setPreview(url);
  };


  const handleSave = () => {
    if (preview) {
      onImageSelect({
        src: preview,
        alt: altText
      });
      onClose();
      setSelectedFile(null);
      setPreview("");
      setAltText("");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
    setPreview(currentSrc || "");
    setAltText(currentAlt || "");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Byt bild</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Ladda upp från dator</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Släpp bilden här...</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      Dra och släpp en bild här, eller klicka för att välja
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, GIF, WebP - Max 10MB
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* URL Input */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Använd bild-URL</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Bild-URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={preview.startsWith('data:') ? '' : preview}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Klistra in länken till en bild från internet
                </p>
              </div>
            </Card>
          </div>

          {/* Preview and Cropping */}
          {preview && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Förhandsvisning</h3>
                {!showCropper && selectedFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCropper(true)}
                    className="gap-2"
                  >
                    <Crop className="h-4 w-4" />
                    Beskär bild
                  </Button>
                )}
              </div>

              <div className="relative max-w-2xl mx-auto">                
                  <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-80 mx-auto rounded-lg"
                    />
                  </div>
              </div>

              <ImageCropper
                isOpen={showCropper}
                onClose={() => setShowCropper(false)}
                onCropComplete={(croppedData) => {
                  setPreview(croppedData.src);
                  setAltText(croppedData.alt);
                  setShowCropper(false);
                }}
                initialImage={preview}
              />
            </Card>
          )}

          {/* Alt Text */}
          {preview && (
            <Card className="p-6">
              <h3 className="font-medium mb-4">Bildtext</h3>
              <div>
                <Label htmlFor="altText">Alt-text (viktigt för tillgänglighet)</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Beskriv vad som visas i bilden..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Alt-text hjälper användare med skärmläsare att förstå bildens innehåll
                </p>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={handleClose}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={!preview}>
              Spara bild
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}