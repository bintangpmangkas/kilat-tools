import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function ImageEnhancer() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalImg, setOriginalImg] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpen: 0
  });
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImg(img);
          setImageSrc(evt.target.result);
          setSettings({ brightness: 100, contrast: 100, saturation: 100, sharpen: 0 });
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: parseFloat(value) }));
  };

  // Apply settings to canvas
  useEffect(() => {
    if (!originalImg || !canvasRef.current) return;
    
    // Debounce to keep slider UI responsive
    const timer = setTimeout(() => {
      renderCanvas();
    }, 50);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, originalImg]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = originalImg;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // 1. Apply CSS filters for brightness, contrast, saturation
    ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none'; // reset filter

    // 2. Apply Sharpen Convolution if needed
    if (settings.sharpen > 0) {
      const amount = settings.sharpen;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      
      const kernel = [
        0, -amount, 0,
        -amount, 1 + 4 * amount, -amount,
        0, -amount, 0
      ];

      // Using Uint8ClampedArray for automatic clamping 0-255
      const output = new Uint8ClampedArray(data.length);
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dstOff = (y * w + x) * 4;
          let r = 0, g = 0, b = 0;
          
          // Skip edges for simpler convolution logic
          if (y > 0 && y < h - 1 && x > 0 && x < w - 1) {
              for (let cy = 0; cy < 3; cy++) {
                for (let cx = 0; cx < 3; cx++) {
                  const scy = y + cy - 1;
                  const scx = x + cx - 1;
                  const srcOff = (scy * w + scx) * 4;
                  const wt = kernel[cy * 3 + cx];
                  r += data[srcOff] * wt;
                  g += data[srcOff + 1] * wt;
                  b += data[srcOff + 2] * wt;
                }
              }
              output[dstOff] = r;
              output[dstOff + 1] = g;
              output[dstOff + 2] = b;
              output[dstOff + 3] = data[dstOff + 3]; // alpha
          } else {
              // Copy edges directly
              output[dstOff] = data[dstOff];
              output[dstOff + 1] = data[dstOff + 1];
              output[dstOff + 2] = data[dstOff + 2];
              output[dstOff + 3] = data[dstOff + 3];
          }
        }
      }
      
      // Fast copy back
      imageData.data.set(output);
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const handleDownload = (format) => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL(`image/${format}`, 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced_${fileName.split('.')[0]}.${format}`;
    a.click();
  };

  const handleReset = () => {
    setSettings({ brightness: 100, contrast: 100, saturation: 100, sharpen: 0 });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-[350px] bg-card border rounded-lg shadow-sm p-6 space-y-6 flex-shrink-0">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
          <Icons.Upload className="w-4 h-4 mr-2" /> {imageSrc ? 'Change Image' : 'Select Image'}
        </Button>
        
        {imageSrc && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <h3 className="font-medium text-sm">Adjustments</h3>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2 text-xs">Reset All</Button>
            </div>
            
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium">
                <span>Sharpen <Icons.Info className="w-3 h-3 inline-block ml-1 text-muted-foreground" title="Enhance blurry edges" /></span>
                <span className="text-muted-foreground">{settings.sharpen.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0" max="2" step="0.1" 
                value={settings.sharpen} 
                onChange={e => handleSettingChange('sharpen', e.target.value)} 
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium">
                <span>Brightness</span>
                <span className="text-muted-foreground">{settings.brightness}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="200" step="1" 
                value={settings.brightness} 
                onChange={e => handleSettingChange('brightness', e.target.value)} 
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium">
                <span>Contrast</span>
                <span className="text-muted-foreground">{settings.contrast}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="200" step="1" 
                value={settings.contrast} 
                onChange={e => handleSettingChange('contrast', e.target.value)} 
                className="w-full accent-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-medium">
                <span>Saturation</span>
                <span className="text-muted-foreground">{settings.saturation}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="200" step="1" 
                value={settings.saturation} 
                onChange={e => handleSettingChange('saturation', e.target.value)} 
                className="w-full accent-primary"
              />
            </div>

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
              <Icons.Wand2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Image preview will appear here</p>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded border overflow-hidden p-2">
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[600px] object-contain shadow-sm border bg-white" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}