import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tools } from '../mock';
import * as Icons from 'lucide-react';
import { Button } from './ui/button';

export default function ToolLayout() {
  const { slug } = useParams();
  const tool = tools.find(t => t.slug === slug);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!tool) {
    return <div className="p-8 text-center">Tool not found. <Link to="/" className="text-primary underline">Go back</Link></div>;
  }

  const Icon = Icons[tool.icon] || Icons.Tool;

  const handleProcess = () => {
    setIsProcessing(true);
    setIsDone(false);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-muted rounded-lg">
              <Icon className="w-8 h-8 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground border">
              <Icons.ShieldCheck className="w-3.5 h-3.5" />
              100% Client-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground border">
              <Icons.EyeOff className="w-3.5 h-3.5" />
              No Upload
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-muted/10 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
            {!isDone ? (
              <div className="text-center space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Icons.UploadCloud className="w-10 h-10 mb-2 opacity-50" />
                    <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm">Works locally in your browser. Files never leave your device.</p>
                  </div>
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
                    "Run Tool (Mock)"
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Icons.Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Success!</h3>
                  <p className="text-muted-foreground">Your files have been processed successfully.</p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setIsDone(false)}>
                    Process Another
                  </Button>
                  <Button className="gap-2">
                    <Icons.Download className="w-4 h-4" />
                    Download Result
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border bg-card rounded-lg p-4">
              <Icons.Zap className="w-5 h-5 mb-2 text-muted-foreground" />
              <h4 className="font-medium text-sm mb-1">Instant Processing</h4>
              <p className="text-xs text-muted-foreground">Done directly in your browser using WebAssembly.</p>
            </div>
            <div className="border bg-card rounded-lg p-4">
              <Icons.Lock className="w-5 h-5 mb-2 text-muted-foreground" />
              <h4 className="font-medium text-sm mb-1">Absolute Privacy</h4>
              <p className="text-xs text-muted-foreground">No servers, no tracking, completely offline capable.</p>
            </div>
            <div className="border bg-card rounded-lg p-4">
              <Icons.WifiOff className="w-5 h-5 mb-2 text-muted-foreground" />
              <h4 className="font-medium text-sm mb-1">Works Offline</h4>
              <p className="text-xs text-muted-foreground">Once loaded, you can disconnect your internet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}