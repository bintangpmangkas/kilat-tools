import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ImageToPDF() {
  const [activeTab, setActiveTab] = useState('img2pdf'); // 'img2pdf' or 'pdf2img'
  
  // Img2Pdf State
  const [imageFiles, setImageFiles] = useState([]);
  const imgInputRef = useRef(null);
  
  // Pdf2Img State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfOutputFormat, setPdfOutputFormat] = useState('png'); // 'png' or 'jpeg'
  const pdfInputRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers for Image to PDF ---
  const handleImgFileChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const processImg2Pdf = async () => {
    if (imageFiles.length === 0) return;
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of imageFiles) {
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
      triggerDownload(blob, 'images_to_pdf.pdf');
    } catch (error) {
      console.error(error);
      alert('Failed to create PDF. Make sure files are JPG or PNG.');
    }
    
    setIsProcessing(false);
  };

  // --- Handlers for PDF to Image ---
  const handlePdfFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const processPdf2Img = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const numPages = pdf.numPages;
      const images = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        // Use a reasonable scale for image output
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Fill white background (useful for transparent PDFs if converting to JPEG or generally good for PDF)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        const mimeType = `image/${pdfOutputFormat}`;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.95));
        images.push({ blob, pageNum: i });
      }
      
      const baseName = pdfFile.name.replace(/\.[^/.]+$/, "");
      
      if (images.length === 1) {
        triggerDownload(images[0].blob, `${baseName}_page_1.${pdfOutputFormat}`);
      } else {
        // Zip them up
        const zip = new JSZip();
        images.forEach(img => {
          zip.file(`${baseName}_page_${img.pageNum}.${pdfOutputFormat}`, img.blob);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        triggerDownload(zipBlob, `${baseName}_images.zip`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to extract images from PDF.');
    }
    setIsProcessing(false);
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col min-h-[500px]">
      <div className="border-b px-4 flex gap-4 bg-muted/30">
        <button 
          className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'img2pdf' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('img2pdf')}
        >
          Image to PDF
        </button>
        <button 
          className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pdf2img' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('pdf2img')}
        >
          PDF to Image
        </button>
      </div>

      <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center">
        {activeTab === 'img2pdf' ? (
          <div className="text-center space-y-6 max-w-xl mx-auto w-full">
            <input 
              type="file" 
              multiple 
              accept="image/jpeg, image/png" 
              ref={imgInputRef} 
              onChange={handleImgFileChange} 
              className="hidden" 
            />
            
            <div 
              onClick={() => imgInputRef.current.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Icons.Image className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-medium text-foreground">Click to select Images</p>
                <p className="text-sm">Select JPG/PNG files to convert into a single PDF.</p>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="text-left bg-muted/30 p-4 rounded-md border text-sm max-h-[150px] overflow-y-auto custom-scrollbar">
                <p className="font-medium mb-2 sticky top-0 bg-muted/30 pt-1">Selected Images ({imageFiles.length}):</p>
                <ul className="space-y-1 text-muted-foreground">
                  {imageFiles.map((f, i) => <li key={`${f.name}-${i}`}>• {f.name}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <Button 
                onClick={processImg2Pdf} 
                disabled={isProcessing || imageFiles.length === 0}
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
        ) : (
          <div className="text-center space-y-6 max-w-xl mx-auto w-full">
            <input 
              type="file" 
              accept="application/pdf" 
              ref={pdfInputRef} 
              onChange={handlePdfFileChange} 
              className="hidden" 
            />
            
            {!pdfFile ? (
              <div 
                onClick={() => pdfInputRef.current.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Icons.FileText className="w-10 h-10 mb-2 opacity-50" />
                  <p className="font-medium text-foreground">Click to select PDF file</p>
                  <p className="text-sm">Extract every page of a PDF into JPG or PNG images.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-left">
                <div className="bg-muted/30 p-4 rounded-md border text-sm flex justify-between items-center">
                  <div className="truncate pr-4">
                    <p className="font-medium">Selected PDF:</p>
                    <p className="text-muted-foreground truncate">{pdfFile.name}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPdfFile(null)}>Change</Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Output Format</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={pdfOutputFormat === 'png' ? 'default' : 'outline'}
                      onClick={() => setPdfOutputFormat('png')}
                      className="flex-1"
                    >
                      PNG
                    </Button>
                    <Button 
                      variant={pdfOutputFormat === 'jpeg' ? 'default' : 'outline'}
                      onClick={() => setPdfOutputFormat('jpeg')}
                      className="flex-1"
                    >
                      JPG
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={processPdf2Img} 
                    disabled={isProcessing}
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Icons.Loader2 className="w-4 h-4 animate-spin" />
                        Extracting Images...
                      </span>
                    ) : (
                      "Convert to Images (ZIP)"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}