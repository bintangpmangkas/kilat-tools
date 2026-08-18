import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tools } from '../mock';
import * as Icons from 'lucide-react';
import { Button } from './ui/button';

import PDFMerge from './tools/PDFMerge';
import PDFToTable from './tools/PDFToTable';
import ImageToPDF from './tools/ImageToPDF';
import ImageCompressor from './tools/ImageCompressor';
import BackgroundRemover from './tools/BackgroundRemover';
import TextCase from './tools/TextCase';
import WordCounter from './tools/WordCounter';
import DataCleaner from './tools/DataCleaner';
import SocialCropper from './tools/SocialCropper';
import QRGenerator from './tools/QRGenerator';
import MarkdownEditor from './tools/MarkdownEditor';
import UnitConverter from './tools/UnitConverter';
import TableViewer from './tools/TableViewer';
import WatermarkStamp from './tools/WatermarkStamp';
import ImageConverter from './tools/ImageConverter';
import ImageEnhancer from './tools/ImageEnhancer';
import ColorPicker from './tools/ColorPicker';

export default function ToolLayout() {
  const { slug } = useParams();
  const tool = tools.find(t => t.slug === slug);

  if (!tool) {
    return <div className="p-8 text-center">Tool not found. <Link to="/" className="text-primary underline">Go back</Link></div>;
  }

  const Icon = Icons[tool.icon] || Icons.Wrench;

  const getToolComponent = () => {
    switch(tool.slug) {
      case 'pdf-merge': return <PDFMerge />;
      case 'pdf-to-table': return <PDFToTable />;
      case 'image-to-pdf': return <ImageToPDF />;
      case 'image-compressor': return <ImageCompressor />;
      case 'background-remover': return <BackgroundRemover />;
      case 'image-enhancer': return <ImageEnhancer />;
      case 'text-case': return <TextCase />;
      case 'word-counter': return <WordCounter />;
      case 'excel-cleaner': return <DataCleaner />;
      case 'social-cropper': return <SocialCropper />;
      case 'qr-generator': return <QRGenerator />;
      case 'markdown-editor': return <MarkdownEditor />;
      case 'unit-converter': return <UnitConverter />;
      case 'table-viewer': return <TableViewer />;
      case 'watermark': return <WatermarkStamp />;
      case 'image-converter': return <ImageConverter />;
      case 'color-picker': return <ColorPicker />;
      default: return <div className="p-8 text-center text-muted-foreground">Tool under construction.</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-muted rounded-lg border shadow-sm">
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
        <div className="max-w-5xl mx-auto space-y-6">
          
          {getToolComponent()}

          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t mt-8">
            <div className="border bg-card rounded-lg p-4">
              <Icons.Zap className="w-5 h-5 mb-2 text-muted-foreground" />
              <h4 className="font-medium text-sm mb-1">Instant Processing</h4>
              <p className="text-xs text-muted-foreground">Done directly in your browser.</p>
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

          <div className="flex justify-center mt-8 pb-4">
            <a 
              href={`mailto:bepekerja@gmail.com?subject=Bug Report - ${tool.name} - Kilat Tools`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border rounded-full transition-colors"
            >
              <Icons.Bug className="w-4 h-4" />
              Find a bug in this tool? Report issue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}