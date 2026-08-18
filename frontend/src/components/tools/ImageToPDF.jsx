import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function ImageToPDF() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue; // skip unsupported
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images_to_pdf.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to create PDF. Make sure files are JPG or PNG.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          multiple 
          accept="image/jpeg, image/png" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <div 
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icons.Image className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium text-foreground">Click to select Images</p>
            <p className="text-sm">Select JPG/PNG files to convert into a single PDF.</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="text-left bg-muted/30 p-4 rounded-md border text-sm">
            <p className="font-medium mb-2">Selected Images ({files.length}):</p>
            <ul className="space-y-1 text-muted-foreground">
              {files.map((f, i) => <li key={`${f.name}-${i}`}>• {f.name}</li>)}
            </ul>
          </div>
        )}

        <Button 
          onClick={handleProcess} 
          disabled={isProcessing || files.length === 0}
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
              Converting...
            </span>
          ) : (
            "Convert to PDF"
          )}
        </Button>
      </div>
    </div>
  );
}