import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const COMPRESSION_LEVELS = {
  light: { label: 'Light', quality: 0.85, scale: 2.0 },
  medium: { label: 'Medium', quality: 0.60, scale: 1.5 },
  aggressive: { label: 'Aggressive', quality: 0.30, scale: 1.0 },
};

export default function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF using PDF.js to render pages to images
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const newPdfDoc = await PDFDocument.create();
      
      const level = COMPRESSION_LEVELS[compressionLevel];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: level.scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        // Compress as JPEG
        const jpegDataUrl = canvas.toDataURL('image/jpeg', level.quality);
        const imageBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
        
        const embeddedImage = await newPdfDoc.embedJpg(imageBytes);
        const newPage = newPdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }
      
      const pdfBytes = await newPdfDoc.save({ useObjectStreams: true });
      
      const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const compressedUrl = URL.createObjectURL(compressedBlob);
      
      setResult({
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        url: compressedUrl,
        name: file.name
      });
      
    } catch (error) {
      console.error(error);
      alert('Failed to compress PDF. The file might be corrupted or encrypted.');
    }
    
    setIsProcessing(false);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12 flex flex-col items-center min-h-[500px]">
      <div className="w-full max-w-xl space-y-8 text-center">
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {!result ? (
          <>
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer w-full"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Icons.FileArchive className="w-12 h-12 mb-2 opacity-50" />
                <p className="font-medium text-foreground text-lg">Click to select PDF File</p>
                <p className="text-sm">Compress PDF size completely offline.</p>
              </div>
            </div>

            {file && (
              <div className="space-y-4">
                <div className="text-left bg-muted/30 p-4 rounded-md border text-sm flex items-center justify-between">
                  <div className="truncate pr-4">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-muted-foreground">{formatSize(file.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                    <Icons.X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium">Compression Level</label>
                  <div className="flex gap-2">
                    {Object.entries(COMPRESSION_LEVELS).map(([key, config]) => (
                      <Button
                        key={key}
                        variant={compressionLevel === key ? 'default' : 'outline'}
                        onClick={() => setCompressionLevel(key)}
                        className="flex-1"
                        size="sm"
                      >
                        {config.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                onClick={handleProcess} 
                disabled={isProcessing || !file}
                size="lg"
                className="w-full sm:w-auto min-w-[250px]"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Compressing PDF...
                  </span>
                ) : (
                  "Compress PDF"
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground italic max-w-sm mx-auto">
              Kompresi agresif dapat menurunkan kualitas visual dokumen secara signifikan.
            </p>
          </>
        ) : (
          <div className="space-y-8 py-6">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check className="w-10 h-10" />
            </div>
            
            <div>
              <h3 className="text-2xl font-medium mb-2">Compression Complete</h3>
              <p className="text-muted-foreground">Your PDF is ready for download.</p>
            </div>

            <div className="bg-muted/10 border p-6 rounded-xl flex items-center justify-around max-w-md mx-auto relative overflow-hidden">
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Original</p>
                <p className="text-xl font-mono opacity-60">{formatSize(result.originalSize)}</p>
              </div>
              
              <Icons.ArrowRight className="w-5 h-5 text-muted-foreground opacity-50" />
              
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Compressed</p>
                <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatSize(result.compressedSize)}
                </p>
              </div>

              {/* Decorative progress bar background if compressed */}
              {result.compressedSize < result.originalSize && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-emerald-500" 
                  style={{ width: `${(result.compressedSize / result.originalSize) * 100}%` }}
                />
              )}
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-4">
                {result.compressedSize < result.originalSize 
                  ? `Saved ${Math.round((1 - (result.compressedSize / result.originalSize)) * 100)}% of file size!` 
                  : "This PDF is already highly optimized."}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" size="lg" onClick={() => { setFile(null); setResult(null); }}>
                  Compress Another
                </Button>
                <Button size="lg" className="gap-2" onClick={() => {
                  const a = document.createElement('a');
                  a.href = result.url;
                  a.download = `compressed_${result.name}`;
                  a.click();
                }}>
                  <Icons.Download className="w-4 h-4" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}