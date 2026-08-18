import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function SortablePageItem({ id, page, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-md overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow aspect-[1/1.4] flex flex-col cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="bg-destructive text-destructive-foreground p-1 rounded-full hover:scale-110 transition-transform"
          title="Delete Page"
        >
          <Icons.X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium border shadow-sm">
        {page.label}
      </div>

      <div className="flex-1 w-full flex items-center justify-center bg-muted/20 p-2 pointer-events-none">
        {page.previewUrl ? (
          <img 
            src={page.previewUrl} 
            alt={page.label} 
            className="max-w-full max-h-full object-contain border shadow-sm" 
            draggable="false"
          />
        ) : (
          <Icons.Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

export default function PDFMerge() {
  const [pages, setPages] = useState([]);
  const [sourceFiles, setSourceFiles] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingPreviews(true);
      const newFiles = Array.from(e.target.files);
      const newSourceFiles = { ...sourceFiles };
      let newPages = [...pages];

      try {
        for (const file of newFiles) {
          const fileId = Math.random().toString(36).substring(7);
          const arrayBuffer = await file.arrayBuffer();
          newSourceFiles[fileId] = { file, arrayBuffer, name: file.name };
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;

          for (let i = 1; i <= numPages; i++) {
            const pageId = `${fileId}-page-${i}`;
            const newPage = {
              id: pageId,
              fileId,
              pageIndex: i - 1, // 0-based for pdf-lib
              label: `${file.name} - p${i}`,
              previewUrl: null
            };
            newPages.push(newPage);
          }
          
          // Generate previews asynchronously so UI updates first
          generatePreviews(pdf, fileId, numPages);
        }
        
        setSourceFiles(newSourceFiles);
        setPages(newPages);
      } catch (err) {
        console.error(err);
        alert("Failed to load one or more PDF files.");
      }
      setIsLoadingPreviews(false);
    }
  };

  const generatePreviews = async (pdf, fileId, numPages) => {
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 }); // Lower scale for thumbnails
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setPages(prev => prev.map(p => 
          p.id === `${fileId}-page-${i}` ? { ...p, previewUrl } : p
        ));
      } catch (e) {
        console.error("Preview generation failed for page", i, e);
      }
    }
  };

  const handleProcess = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      // Cache loaded pdf-lib documents to avoid re-parsing the same file multiple times
      const loadedPdfs = {};

      for (const page of pages) {
        const { fileId, pageIndex } = page;
        
        if (!loadedPdfs[fileId]) {
          loadedPdfs[fileId] = await PDFDocument.load(sourceFiles[fileId].arrayBuffer);
        }
        
        const sourcePdf = loadedPdfs[fileId];
        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageIndex]);
        mergedPdf.addPage(copiedPage);
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const handleClear = () => {
    setPages([]);
    setSourceFiles({});
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-8">
      <div className="space-y-6">
        <input 
          type="file" 
          multiple 
          accept="application/pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {pages.length === 0 ? (
          <div 
            onClick={() => !isLoadingPreviews && fileInputRef.current.click()}
            className={`border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors ${isLoadingPreviews ? 'opacity-50 cursor-not-allowed' : 'hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer'} text-center`}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {isLoadingPreviews ? (
                <Icons.Loader2 className="w-10 h-10 mb-2 opacity-50 animate-spin" />
              ) : (
                <Icons.FileText className="w-10 h-10 mb-2 opacity-50" />
              )}
              <p className="font-medium text-foreground">Click to select PDF files</p>
              <p className="text-sm">Merge, reorder, or delete specific pages.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-medium">Page Organizer</h3>
                <p className="text-sm text-muted-foreground">Drag to reorder, click × to delete. {pages.length} pages total.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                  <Icons.Plus className="w-4 h-4 mr-2" /> Add More PDFs
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Clear All
                </Button>
              </div>
            </div>

            <div className="bg-muted/10 border rounded-lg p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={pages.map(p => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pages.map((page) => (
                      <SortablePageItem 
                        key={page.id} 
                        id={page.id} 
                        page={page} 
                        onDelete={handleDelete} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {pages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pages left. Add a PDF to start.</p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleProcess} 
                disabled={isProcessing || pages.length === 0}
                size="lg"
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icons.Download className="w-4 h-4" />
                    Download Merged PDF ({pages.length} pages)
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}