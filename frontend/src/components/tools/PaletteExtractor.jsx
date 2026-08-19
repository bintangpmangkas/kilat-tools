import React, { useState, useRef } from 'react';
import { getColor, getPalette } from 'colorthief';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function ColorPaletteExtractor() {
  const [imageSrc, setImageSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [dominant, setDominant] = useState(null);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageSrc(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = async () => {
    if (imgRef.current) {
      try {
        const domColor = await getColor(imgRef.current);
        const pal = await getPalette(imgRef.current, { colorCount: 8 });
        
        // Convert Color objects to RGB arrays using .array() method
        const domColorRgb = domColor ? domColor.array() : [0, 0, 0];
        const palRgb = Array.isArray(pal) ? pal.map(color => color.array()) : [];
        
        setDominant(domColorRgb);
        setPalette(palRgb);
      } catch (err) {
        console.error("Failed to extract colors:", err);
      }
    }
  };

  const rgbToHex = (r, g, b) => {
    if (r === undefined || g === undefined || b === undefined) return '#000000';
    return '#' + [r, g, b].map(x => {
      const hex = Number(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
            <Icons.Upload className="w-4 h-4 mr-2" /> {imageSrc ? 'Change Image' : 'Upload Image'}
          </Button>
          
          <div className="bg-muted/30 border rounded-lg p-2 min-h-[300px] flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Upload preview" 
                crossOrigin="anonymous"
                className="max-w-full max-h-[400px] object-contain rounded"
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <Icons.Image className="w-12 h-12 mb-2 opacity-20" />
                <p>Image preview will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 space-y-6">
          <h3 className="font-medium text-lg border-b pb-2">Extracted Palette</h3>
          
          {!dominant ? (
            <p className="text-muted-foreground text-sm italic">Upload an image to see its colors.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Dominant Color</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-full border shadow-sm"
                    style={{ backgroundColor: `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})` }}
                  />
                  <div className="space-y-1">
                    <p className="font-mono text-sm cursor-pointer hover:underline" onClick={() => copyToClipboard(rgbToHex(dominant[0], dominant[1], dominant[2]))}>
                      {rgbToHex(dominant[0], dominant[1], dominant[2]).toUpperCase()}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => copyToClipboard(`rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`)}>
                      rgb({dominant[0]}, {dominant[1]}, {dominant[2]})
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Color Palette</p>
                <div className="grid grid-cols-2 gap-3">
                  {palette.map((color, i) => {
                    const hex = rgbToHex(color[0], color[1], color[2]).toUpperCase();
                    return (
                      <div key={i} className="flex items-center gap-2 bg-muted/20 p-2 rounded border">
                        <div 
                          className="w-8 h-8 rounded border shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: hex }}
                          onClick={() => copyToClipboard(hex)}
                          title="Click to copy HEX"
                        />
                        <div className="overflow-hidden">
                          <p className="font-mono text-xs truncate cursor-pointer hover:underline" onClick={() => copyToClipboard(hex)}>{hex}</p>
                          <p className="font-mono text-[10px] text-muted-foreground truncate cursor-pointer hover:underline" onClick={() => copyToClipboard(`rgb(${color.join(', ')})`)}>rgb({color.join(',')})</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}