import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function WatermarkStamp() {
  const [imageSrc, setImageSrc] = useState(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#000000');
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageSrc(evt.target.result);
        setResult(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Apply watermark
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Rotate and draw
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillText(watermarkText, 0, 0);
        
        // Reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1.0;
        
        setResult(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageSrc;
    }
  }, [imageSrc, watermarkText, opacity, fontSize, color, canvasRef]);

  const handleDownload = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result;
      a.download = 'watermarked.jpg';
      a.click();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-card border rounded-lg shadow-sm p-6 space-y-6">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        
        <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
          <Icons.Upload className="w-4 h-4 mr-2" /> Select Image
        </Button>
        
        {imageSrc && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Watermark Text</label>
              <input 
                type="text" 
                value={watermarkText} 
                onChange={e => setWatermarkText(e.target.value)} 
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                <span>Opacity</span>
                <span className="text-muted-foreground">{Math.round(opacity * 100)}%</span>
              </label>
              <input 
                type="range" 
                min="0.05" max="1" step="0.05" 
                value={opacity} 
                onChange={e => setOpacity(parseFloat(e.target.value))} 
                className="w-full accent-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                <span>Font Size</span>
                <span className="text-muted-foreground">{fontSize}px</span>
              </label>
              <input 
                type="range" 
                min="12" max="200" step="2" 
                value={fontSize} 
                onChange={e => setFontSize(parseInt(e.target.value))} 
                className="w-full accent-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none bg-background text-foreground" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="md:w-[60%] flex flex-col gap-4">
        <div className="bg-card border rounded-lg shadow-sm p-2 flex flex-col items-center justify-center min-h-[400px]">
          {!imageSrc ? (
            <div className="text-muted-foreground flex flex-col items-center">
              <Icons.Image className="w-12 h-12 mb-2 opacity-20" />
              <p>Preview will appear here</p>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded border overflow-hidden">
              {/* Invisible canvas used for rendering */}
              <canvas ref={canvasRef} className="hidden" />
              {result && (
                <img src={result} alt="Watermarked" className="max-w-full max-h-[500px] object-contain" />
              )}
            </div>
          )}
        </div>
        
        {result && (
          <Button onClick={handleDownload} className="w-full py-6">
            <Icons.Download className="w-5 h-5 mr-2" /> Download Image
          </Button>
        )}
      </div>
    </div>
  );
}