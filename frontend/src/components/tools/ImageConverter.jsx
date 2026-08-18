import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

const FORMATS = ['jpeg', 'png', 'webp', 'bmp'];

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResultUrl(null);
    }
  };

  const handleProcess = () => {
    if (!file || !preview) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      // Fill background for transparent PNG to JPEG conversion
      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        setResultUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
      }, `image/${format}`, quality);
    };
    img.src = preview;
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {!resultUrl ? (
          <>
            {!preview ? (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Icons.Image className="w-10 h-10 mb-2 opacity-50" />
                  <p className="font-medium text-foreground">Click to select an Image</p>
                  <p className="text-sm">Convert images between formats locally.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative max-w-sm mx-auto rounded-lg overflow-hidden border">
                  <img src={preview} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-md hover:bg-black/70"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="max-w-sm mx-auto space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Format</label>
                    <div className="flex gap-2">
                      {FORMATS.map(f => (
                        <Button 
                          key={f} 
                          variant={format === f ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormat(f)}
                          className="flex-1 uppercase"
                        >
                          {f}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {(format === 'jpeg' || format === 'webp') && (
                    <div>
                      <label className="block text-sm font-medium mb-2 flex justify-between">
                        <span>Quality</span>
                        <span className="text-muted-foreground">{Math.round(quality * 100)}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.1" 
                        value={quality} 
                        onChange={e => setQuality(parseFloat(e.target.value))} 
                        className="w-full accent-primary"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleProcess} 
                  disabled={isProcessing}
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Icons.Loader2 className="w-4 h-4 animate-spin" />
                      Converting...
                    </span>
                  ) : (
                    "Convert Image"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Conversion Complete</h3>
            <div className="max-w-sm mx-auto rounded-lg overflow-hidden border bg-muted/20">
              <img src={resultUrl} alt="Result" className="w-full h-auto max-h-[300px] object-contain" />
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => {
                setFile(null);
                setPreview(null);
                setResultUrl(null);
              }}>
                Convert Another
              </Button>
              <Button className="gap-2" onClick={() => {
                const a = document.createElement('a');
                a.href = resultUrl;
                a.download = `converted_${file.name.split('.')[0]}.${format}`;
                a.click();
              }}>
                <Icons.Download className="w-4 h-4" />
                Download {format.toUpperCase()}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}