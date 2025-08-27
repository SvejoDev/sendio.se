"use client";

import React, { useRef, useState } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Crop as CropIcon, RotateCw, Download, X } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageData: { src: string; alt: string }) => void;
  initialImage?: string;
  aspectRatio?: number;
}

export default function ImageCropper({
  isOpen,
  onClose,
  onCropComplete,
  initialImage,
  aspectRatio
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef('');

  const [imgSrc, setImgSrc] = useState(initialImage || '');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function handleCropComplete(crop: PixelCrop) {
    setCompletedCrop(crop);
  }

  async function getCroppedImg(
    image: HTMLImageElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
  ) {
    const canvas = canvasRef.current;
    if (!canvas || !crop.width || !crop.height) {
      throw new Error('Canvas or crop dimensions not available');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );
    ctx.restore();
  }

  function handleSaveCrop() {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    getCroppedImg(imgRef.current, completedCrop, scale, rotate)
      .then(() => {
        const canvas = canvasRef.current!;
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob');
            return;
          }

          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          blobUrlRef.current = URL.createObjectURL(blob);

          onCropComplete({
            src: blobUrlRef.current,
            alt: 'Cropped image'
          });

          // Clean up
          setImgSrc('');
          setCrop(undefined);
          setCompletedCrop(undefined);
          onClose();
        });
      })
      .catch((err) => {
        console.error('Error cropping image:', err);
      });
  }

  function handleCancel() {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Beskär bild
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imgSrc && (
            <div className="space-y-4">
              <Label htmlFor="image-upload">Välj bild att beskära</Label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}

          {imgSrc && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Proportion:</Label>
                  <Button
                    variant={aspect === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(undefined)}
                  >
                    Fri
                  </Button>
                  <Button
                    variant={aspect === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(1)}
                  >
                    1:1
                  </Button>
                  <Button
                    variant={aspect === 4/3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(4/3)}
                  >
                    4:3
                  </Button>
                  <Button
                    variant={aspect === 16/9 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(16/9)}
                  >
                    16:9
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotate(prev => prev + 90)}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotera
                </Button>
              </div>

              <div className="relative max-h-96 overflow-hidden rounded-lg border">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => handleCropComplete(convertToPixelCrop(c, imgRef.current!.width, imgRef.current!.height))}
                  aspect={aspect}
                  className="max-h-96"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxHeight: '24rem'
                    }}
                    onLoad={onImageLoad}
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Avbryt
                </Button>
                <Button 
                  onClick={handleSaveCrop}
                  disabled={!completedCrop}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Använd beskärning
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for crop processing */}
        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
          }}
        />
      </DialogContent>
    </Dialog>
  );
}