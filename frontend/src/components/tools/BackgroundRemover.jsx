import React, { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResultUrl(null);
      setProgress(0);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const config = {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
        fetchArgs: {
          mode: 'cors',
          credentials: 'omit'
        },
        debug: true
      };
      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error('Background removal error:', error);
      alert('Failed to remove background: ' + (error.message || 'Unknown error'));
    }
    
    setIsProcessing(false);
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
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Icons.Scissors className="w-10 h-10 mb-2 opacity-50" />
                    <p className="font-medium text-foreground">Click to select an Image</p>
                    <p className="text-sm">First run will download a ~30MB AI model locally.</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground border text-left">
                  <Icons.Info className="w-4 h-4 inline-block mr-1 mb-0.5" />
                  <strong>Disclaimer:</strong> Currently, this tool is best suited for removing solid blank spaces or simple backgrounds from logos and graphics (not complex photos).
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative max-w-md mx-auto rounded-lg overflow-hidden border">
                  <img src={preview} alt="Preview" className="w-full h-auto" />
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-md hover:bg-black/70"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
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
                      Processing...
                    </span>
                  ) : (
                    "Remove Background"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Result</h3>
            <div className="max-w-md mx-auto rounded-lg overflow-hidden border bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2QxZDVkYiIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2QxZDVkYiIvPgo8L3N2Zz4=')]">
              <img src={resultUrl} alt="Background removed" className="w-full h-auto" />
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => {
                setFile(null);
                setPreview(null);
                setResultUrl(null);
              }}>
                Process Another
              </Button>
              <Button className="gap-2" onClick={() => {
                const a = document.createElement('a');
                a.href = resultUrl;
                a.download = `transparent_${file.name.split('.')[0]}.png`;
                a.click();
              }}>
                <Icons.Download className="w-4 h-4" />
                Download PNG
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}