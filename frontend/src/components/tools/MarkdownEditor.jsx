import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(() => {
    return localStorage.getItem('kilat_markdown_draft') || '# Hello Markdown\n\nStart typing here...';
  });
  const [view, setView] = useState('split'); // split, write, preview

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('kilat_markdown_draft', markdown);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [markdown]);

  const rawHtml = marked.parse(markdown);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  const handleDownload = (ext) => {
    let content = markdown;
    let type = 'text/markdown';
    
    if (ext === 'html') {
      content = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Document</title>\n</head>\n<body>\n${sanitizedHtml}\n</body>\n</html>`;
      type = 'text/html';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => setMarkdown(evt.target.result);
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-[700px]">
      <div className="border-b p-2 flex justify-between items-center bg-muted/30">
        <div className="flex gap-1">
          <input type="file" accept=".md,.txt" id="md-upload" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="md-upload">
            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
              <span><Icons.Upload className="w-4 h-4 mr-2" /> Upload .md</span>
            </Button>
          </label>
        </div>

        <div className="flex bg-muted rounded-md p-1">
          <button 
            className={`px-3 py-1 text-xs rounded-sm font-medium ${view === 'write' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setView('write')}
          >
            Write
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-sm font-medium hidden sm:block ${view === 'split' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setView('split')}
          >
            Split
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-sm font-medium ${view === 'preview' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setView('preview')}
          >
            Preview
          </button>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setMarkdown('')}>
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {(view === 'write' || view === 'split') && (
          <textarea
            className={`flex-1 w-full h-full resize-none p-6 bg-transparent focus:outline-none custom-scrollbar font-mono text-sm leading-relaxed ${view === 'split' ? 'border-r sm:block hidden' : ''}`}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            spellCheck="false"
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div 
            className="flex-1 w-full h-full overflow-y-auto p-6 bg-transparent custom-scrollbar prose prose-zinc dark:prose-invert max-w-none prose-sm sm:prose-base prose-pre:bg-muted prose-pre:text-foreground prose-a:text-primary"
            /* eslint-disable-next-line react/no-danger */
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        )}
      </div>

      <div className="border-t p-3 bg-muted/10 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {markdown.length} chars · {markdown.split(/\s+/).filter(w => w.length > 0).length} words
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownload('md')}>
            <Icons.Download className="w-4 h-4 mr-2" /> .md
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('html')}>
            <Icons.Download className="w-4 h-4 mr-2" /> .html
          </Button>
        </div>
      </div>
    </div>
  );
}