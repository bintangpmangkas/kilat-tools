import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6');
  const [history, setHistory] = useState(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const hexToHsl = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleColorSave = () => {
    if (!history.includes(color)) {
      setHistory([color, ...history].slice(0, 15));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-card border rounded-lg shadow-sm p-6 lg:p-12 space-y-8">
        
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border shadow-inner flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <input 
              type="color" 
              value={color} 
              onChange={handleColorChange}
              onBlur={handleColorSave}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium text-muted-foreground">HEX</span>
              <input 
                type="text" 
                value={color.toUpperCase()} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/i.test(val)) setColor(val);
                }}
                className="flex-1 border rounded p-2 text-center font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(color.toUpperCase())}>
                <Icons.Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium text-muted-foreground">RGB</span>
              <input 
                type="text" 
                readOnly
                value={hexToRgb(color) || ''} 
                className="flex-1 border rounded p-2 text-center font-mono bg-muted/30 focus:outline-none"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`rgb(${hexToRgb(color)})`)}>
                <Icons.Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium text-muted-foreground">HSL</span>
              <input 
                type="text" 
                readOnly
                value={hexToHsl(color) || ''} 
                className="flex-1 border rounded p-2 text-center font-mono bg-muted/30 focus:outline-none"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`hsl(${hexToHsl(color)})`)}>
                <Icons.Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>

      <div className="md:w-64 bg-card border rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="font-medium text-sm border-b pb-2">Recent Colors</h3>
        <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
          {history.map((c, i) => (
            <button
              key={i}
              className="w-10 h-10 rounded-md border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}