import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function QRGenerator() {
  const [data, setData] = useState('https://emergent.sh');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotType, setDotType] = useState('square');
  const [cornerType, setCornerType] = useState('square');
  const [logoFile, setLogoFile] = useState(null);
  
  const qrRef = useRef(null);
  const qrCode = useRef(null);
  const fileInputRef = useRef(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: data || ' ',
      image: logoFile,
      dotsOptions: {
        color: color,
        type: dotType
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornerType,
        color: color
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10
      },
      qrOptions: {
        errorCorrectionLevel: logoFile ? 'H' : 'Q'
      }
    });
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: data || ' ',
        image: logoFile,
        dotsOptions: { color: color, type: dotType },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: cornerType, color: color },
        qrOptions: { errorCorrectionLevel: logoFile ? 'H' : 'Q' }
      });
    }
  }, [data, color, bgColor, dotType, cornerType, logoFile]);

  useEffect(() => {
    if (qrRef.current && qrCode.current) {
      while (qrRef.current.firstChild) {
        qrRef.current.removeChild(qrRef.current.firstChild);
      }
      qrCode.current.append(qrRef.current);
    }
  }, [data, color, bgColor, dotType, cornerType, logoFile]);

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoFile(url);
    }
  };

  const downloadQR = (ext) => {
    if (qrCode.current) {
      qrCode.current.download({ extension: ext, name: 'kilat_qr' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-card border rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">QR Content</label>
          <textarea
            className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
            rows={3}
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter URL, text, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">QR Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="border rounded px-2 py-1 text-sm w-full bg-background text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="border rounded px-2 py-1 text-sm w-full bg-background text-foreground" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dot Pattern</label>
            <select 
              className="w-full border rounded-md p-2 text-sm bg-background"
              value={dotType}
              onChange={(e) => setDotType(e.target.value)}
            >
              <option value="square">Square</option>
              <option value="dots">Dots</option>
              <option value="rounded">Rounded</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Corner Shape</label>
            <select 
              className="w-full border rounded-md p-2 text-sm bg-background"
              value={cornerType}
              onChange={(e) => setCornerType(e.target.value)}
            >
              <option value="square">Square</option>
              <option value="dot">Dot</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Center Logo</label>
          <div className="flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
              <Icons.Upload className="w-4 h-4 mr-2" /> Upload Logo
            </Button>
            {logoFile && (
              <Button variant="ghost" size="sm" onClick={() => setLogoFile(null)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                Remove Logo
              </Button>
            )}
          </div>
          {logoFile && <p className="text-xs text-muted-foreground mt-2">Error correction automatically set to Level H to ensure readability.</p>}
        </div>
      </div>

      <div className="md:w-80 flex flex-col gap-4">
        <div className="bg-card border rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[350px]">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6" ref={qrRef} />
          
          <div className="flex gap-2 w-full">
            <Button className="flex-1" onClick={() => downloadQR('png')}>Download PNG</Button>
            <Button variant="outline" onClick={() => downloadQR('svg')}>SVG</Button>
          </div>
        </div>
      </div>
    </div>
  );
}