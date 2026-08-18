import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResults([]);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    const newResults = [];
    
    try {
      for (const file of files) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        
        const compressedFile = await imageCompression(file, options);
        newResults.push({
          originalName: file.name,
          originalSize: file.size,
          compressedSize: compressedFile.size,
          file: compressedFile,
          url: URL.createObjectURL(compressedFile)
        });
      }
      setResults(newResults);
    } catch (error) {
      console.error(error);
      alert('Failed to compress images.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {results.length === 0 ? (
          <>
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Icons.Minimize className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-medium text-foreground">Click to select Images for Compression</p>
                <p className="text-sm">Compress images without losing quality.</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="text-left bg-muted/30 p-4 rounded-md border text-sm">
                <p className="font-medium mb-2">Selected Images ({files.length}):</p>
                <ul className="space-y-1 text-muted-foreground">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`}>• {f.name} - {(f.size / 1024 / 1024).toFixed(2)} MB</li>
                  ))}
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
                  Compressing...
                </span>
              ) : (
                "Compress Images"
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium">Compression Complete</h3>
            
            <div className="text-left bg-muted/30 p-4 rounded-md border text-sm space-y-3">
              {results.map((res, i) => (
                <div key={`${res.originalName}-${i}`} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div className="truncate pr-4">
                    <p className="font-medium truncate">{res.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(res.originalSize / 1024).toFixed(1)} KB → {(res.compressedSize / 1024).toFixed(1)} KB 
                      <span className="text-green-500 ml-2">
                        (-{Math.round((1 - res.compressedSize / res.originalSize) * 100)}%)
                      </span>
                    </p>
                  </div>
                  <Button size="sm" onClick={() => {
                    const a = document.createElement('a');
                    a.href = res.url;
                    a.download = `compressed_${res.originalName}`;
                    a.click();
                  }}>Download</Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => {
              setFiles([]);
              setResults([]);
            }}>
              Process More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}