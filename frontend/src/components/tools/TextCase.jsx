import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function TextCase() {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('case');

  // Case functions
  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  const toTitleCase = () => setText(
    text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  const toSentenceCase = () => setText(
    text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
  );
  const toCamelCase = () => setText(
    text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
  );
  const toPascalCase = () => {
    const camel = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    setText(camel.charAt(0).toUpperCase() + camel.slice(1));
  };
  const toSnakeCase = () => setText(
    text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || ''
  );
  const toKebabCase = () => setText(
    text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || ''
  );

  // List functions
  const getLines = () => text.split('\n');
  const setLines = (lines) => setText(lines.join('\n'));
  
  const addNumbers = () => setLines(getLines().map((line, i) => `${i + 1}. ${line}`));
  const addBullets = () => setLines(getLines().map(line => `• ${line}`));
  const removeList = () => setLines(getLines().map(line => line.replace(/^[\d]+\.\s*|^[•-]\s*/, '')));
  const sortAZ = () => setLines([...getLines()].sort((a, b) => a.localeCompare(b)));
  const sortZA = () => setLines([...getLines()].sort((a, b) => b.localeCompare(a)));
  const removeDuplicates = () => setLines([...new Set(getLines())]);
  const removeEmpty = () => setLines(getLines().filter(line => line.trim() !== ''));
  const trimLines = () => setLines(getLines().map(line => line.trim()));

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text_formatted.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-[600px]">
      <div className="border-b px-4 flex gap-4 bg-muted/30">
        <button 
          className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'case' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('case')}
        >
          Text Case
        </button>
        <button 
          className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'list' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('list')}
        >
          List Formatter
        </button>
      </div>

      <div className="p-4 border-b flex flex-wrap gap-2 bg-muted/10">
        {activeTab === 'case' ? (
          <>
            <Button variant="outline" size="sm" onClick={toUpperCase}>UPPERCASE</Button>
            <Button variant="outline" size="sm" onClick={toLowerCase}>lowercase</Button>
            <Button variant="outline" size="sm" onClick={toTitleCase}>Title Case</Button>
            <Button variant="outline" size="sm" onClick={toSentenceCase}>Sentence case</Button>
            <Button variant="outline" size="sm" onClick={toCamelCase}>camelCase</Button>
            <Button variant="outline" size="sm" onClick={toPascalCase}>PascalCase</Button>
            <Button variant="outline" size="sm" onClick={toSnakeCase}>snake_case</Button>
            <Button variant="outline" size="sm" onClick={toKebabCase}>kebab-case</Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={addNumbers}>1. 2. 3.</Button>
            <Button variant="outline" size="sm" onClick={addBullets}>• Bullets</Button>
            <Button variant="outline" size="sm" onClick={removeList}>Remove List</Button>
            <Button variant="outline" size="sm" onClick={sortAZ}>Sort A→Z</Button>
            <Button variant="outline" size="sm" onClick={sortZA}>Sort Z→A</Button>
            <Button variant="outline" size="sm" onClick={removeDuplicates}>Remove Duplicates</Button>
            <Button variant="outline" size="sm" onClick={removeEmpty}>Remove Empty</Button>
            <Button variant="outline" size="sm" onClick={trimLines}>Trim Lines</Button>
          </>
        )}
      </div>

      <textarea
        className="flex-1 w-full resize-none p-4 bg-transparent focus:outline-none custom-scrollbar font-mono text-sm leading-relaxed"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="border-t p-4 bg-muted/10 flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex gap-4">
          <span>{text.length} chars</span>
          <span>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
          <span>{text.split('\n').length} lines</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setText('')}>Clear</Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            <Icons.Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-2">
            <Icons.Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}