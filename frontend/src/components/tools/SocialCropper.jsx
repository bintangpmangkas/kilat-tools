import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

const RATIOS = [
  { name: '1:1 (Square)', value: 1 / 1 },
  { name: '4:5 (Portrait)', value: 4 / 5 },
  { name: '16:9 (Landscape)', value: 16 / 9 },
  { name: '9:16 (Story)', value: 9 / 16 },
];

export default function SocialCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const generateDownload = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const a = document.createElement('a');
      a.href = croppedImage;
      a.download = `cropped_${Date.now()}.jpg`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-8">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {!imageSrc ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Icons.Crop className="w-10 h-10 mb-2 opacity-50" />
              <p className="font-medium text-foreground">Click to select an Image</p>
              <p className="text-sm">Crop your images for various social media platforms locally.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {RATIOS.map(r => (
                <Button 
                  key={r.name}
                  variant={aspect === r.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspect(r.value)}
                >
                  {r.name}
                </Button>
              ))}
            </div>

            <div className="relative w-full h-[400px] bg-muted/30 rounded-lg overflow-hidden border">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="flex items-center gap-4 max-w-md mx-auto">
              <Icons.Minus className="w-4 h-4 text-muted-foreground" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <Icons.Plus className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => setImageSrc(null)}>
                Choose Another
              </Button>
              <Button onClick={generateDownload} className="gap-2">
                <Icons.Download className="w-4 h-4" /> Download Cropped
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function to crop image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg');
  });
}