import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

const PRESET_RATIOS = [
  { name: '1:1', value: 1 },
  { name: '4:3', value: 4 / 3 },
  { name: '16:9', value: 16 / 9 },
  { name: '3:2', value: 3 / 2 },
  { name: '9:16', value: 9 / 16 },
  { name: '1.91:1', value: 1.91 / 1 },
];

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [mode, setMode] = useState('free'); // 'free', 'custom', 'preset'
  const [aspectRatio, setAspectRatio] = useState(NaN);
  
  // Custom Dimension inputs
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageSrc(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    if (mode === 'free') {
      cropper.setAspectRatio(NaN);
    } else if (mode === 'preset') {
      cropper.setAspectRatio(aspectRatio);
    } else if (mode === 'custom') {
      const w = parseFloat(customW);
      const h = parseFloat(customH);
      if (w > 0 && h > 0) {
        cropper.setAspectRatio(w / h);
      } else {
        cropper.setAspectRatio(NaN);
      }
    }
  }, [mode, aspectRatio, customW, customH]);

  const handleDownload = (format) => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    let canvasOptions = {};
    if (mode === 'custom') {
      const w = parseInt(customW, 10);
      const h = parseInt(customH, 10);
      if (w > 0 && h > 0) {
        canvasOptions = {
          width: w,
          height: h,
          imageSmoothingQuality: 'high',
        };
      }
    }

    const canvas = cropper.getCroppedCanvas(canvasOptions);
    if (!canvas) return;
    
    // For JPEG, fill transparent background with white
    if (format === 'jpeg') {
      const newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;
      const ctx = newCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      ctx.drawImage(canvas, 0, 0);
      
      const url = newCanvas.toDataURL('image/jpeg', 0.95);
      triggerDownload(url, 'jpeg');
    } else {
      const url = canvas.toDataURL('image/png');
      triggerDownload(url, 'png');
    }
  };

  const triggerDownload = (url, ext) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropped_${fileName.split('.')[0] || 'image'}.${ext}`;
    a.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setMode('free');
    setCustomW('');
    setCustomH('');
    setAspectRatio(NaN);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-[350px] bg-card border rounded-lg shadow-sm p-6 space-y-6 flex-shrink-0">
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
          <Icons.Upload className="w-4 h-4 mr-2" /> {imageSrc ? 'Change Image' : 'Select Image'}
        </Button>
        
        {imageSrc && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm border-b pb-2">Crop Mode</h3>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={mode === 'free' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setMode('free')}
                >
                  <Icons.Maximize className="w-4 h-4 mr-2" /> Free Crop
                </Button>
                <Button 
                  variant={mode === 'preset' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => { setMode('preset'); setAspectRatio(1); }}
                >
                  <Icons.LayoutTemplate className="w-4 h-4 mr-2" /> Preset Ratio
                </Button>
                <Button 
                  variant={mode === 'custom' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setMode('custom')}
                >
                  <Icons.Scaling className="w-4 h-4 mr-2" /> Custom Dimensions
                </Button>
              </div>
            </div>

            {mode === 'preset' && (
              <div className="space-y-3 pt-2">
                <h3 className="font-medium text-sm text-muted-foreground">Select Ratio</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_RATIOS.map(r => (
                    <Button
                      key={r.name}
                      variant={aspectRatio === r.value ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setAspectRatio(r.value)}
                    >
                      {r.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'custom' && (
              <div className="space-y-3 pt-2">
                <h3 className="font-medium text-sm text-muted-foreground">Exact Output Size (px)</h3>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 800"
                      value={customW}
                      onChange={(e) => setCustomW(e.target.value)}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                  <Icons.X className="w-3 h-3 text-muted-foreground mt-5" />
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Height</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 600"
                      value={customH}
                      onChange={(e) => setCustomH(e.target.value)}
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">Crop box will lock to this aspect ratio, and the final download will be exactly this size.</p>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium mb-2">Export</p>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" size="sm" onClick={() => handleDownload('png')}>
                  <Icons.Download className="w-4 h-4" /> PNG
                </Button>
                <Button variant="outline" className="flex-1 gap-2" size="sm" onClick={() => handleDownload('jpeg')}>
                  <Icons.Download className="w-4 h-4" /> JPG
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-card border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center min-h-[400px]">
          {!imageSrc ? (
            <div className="text-muted-foreground flex flex-col items-center">
              <Icons.Crop className="w-12 h-12 mb-4 opacity-20" />
              <p>Image preview will appear here</p>
            </div>
          ) : (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded border overflow-hidden p-2">
              <Cropper
                src={imageSrc}
                style={{ height: '600px', width: '100%' }}
                initialAspectRatio={NaN}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                checkOrientation={false}
              />
            </div>
          )}
        </div>
        {imageSrc && (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              Clear Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
