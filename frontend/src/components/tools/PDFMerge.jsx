import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function PDFMerge() {
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
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to merge PDFs. Make sure they are valid PDF files.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          multiple 
          accept="application/pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <div 
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icons.FileText className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium text-foreground">Click to select PDF files</p>
            <p className="text-sm">Select multiple files to merge them together.</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="text-left bg-muted/30 p-4 rounded-md border text-sm">
            <p className="font-medium mb-2">Selected Files ({files.length}):</p>
            <ul className="space-y-1 text-muted-foreground">
              {files.map((f, i) => <li key={`${f.name}-${i}`}>• {f.name}</li>)}
            </ul>
          </div>
        )}

        <Button 
          onClick={handleProcess} 
          disabled={isProcessing || files.length < 2}
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
              Merging...
            </span>
          ) : (
            "Merge PDFs"
          )}
        </Button>
      </div>
    </div>
  );
}