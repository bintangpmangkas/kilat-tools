import React, { useState, useRef } from 'react';
import exifr from 'exifr';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function MetadataViewer() {
  const [imageSrc, setImageSrc] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageSrc(evt.target.result);
      };
      reader.readAsDataURL(file);

      try {
        const exifData = await exifr.parse(file, true);
        setMetadata(exifData || {});
      } catch (err) {
        console.error(err);
        setMetadata({});
      }
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp, image/heic, image/avif, image/tiff" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full">
            <Icons.Upload className="w-4 h-4 mr-2" /> Upload Image
          </Button>
          
          <div className="bg-muted/30 border rounded-lg p-2 min-h-[250px] flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt="Preview" 
                className="max-w-full max-h-[300px] object-contain rounded"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <Icons.Info className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Image preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-2/3 space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">EXIF Metadata</h3>
          
          {!imageSrc ? (
            <p className="text-muted-foreground text-sm italic">Upload an image to view its hidden metadata (EXIF).</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-3 rounded border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">File Name</p>
                  <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
                </div>
                <div className="bg-muted/20 p-3 rounded border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">File Size</p>
                  <p className="text-sm font-medium">{formatSize(fileSize)}</p>
                </div>
              </div>

              {metadata && Object.keys(metadata).length > 0 ? (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-2 w-1/3">Property</th>
                        <th className="px-4 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(metadata).map(([key, value]) => {
                        // Skip complex nested objects for simplicity, or stringify them
                        if (typeof value === 'object' && value !== null) {
                          if (value instanceof Date) value = value.toLocaleString();
                          else value = JSON.stringify(value);
                        }
                        return (
                          <tr key={key} className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{key}</td>
                            <td className="px-4 py-2 break-all">{String(value)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-3">
                  <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>No EXIF metadata found in this image. It may have been stripped during a previous export or upload process, or the file format does not support it.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}