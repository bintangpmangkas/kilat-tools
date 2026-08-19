import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const handleFormat = () => {
    if (!input.trim()) {
      setError(null);
      setOutput('');
      return;
    }

    try {
      // Allow single quotes or unquoted keys via loose parsing if standard JSON fails
      // We will just use native JSON.parse for strict validation
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-[700px]">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-medium">JSON Formatter & Validator</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setInput(''); setOutput(''); setError(null); }}>Clear</Button>
          <Button variant="secondary" size="sm" onClick={handleMinify}>Minify</Button>
          <Button size="sm" onClick={handleFormat}>Format</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r">
          <div className="p-2 border-b bg-muted/10 text-xs font-medium text-muted-foreground">Input (Raw)</div>
          <textarea
            className="flex-1 w-full resize-none p-4 bg-transparent focus:outline-none custom-scrollbar font-mono text-sm leading-relaxed"
            placeholder='Paste JSON here...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex-1 flex flex-col relative bg-muted/5">
          <div className="p-2 border-b bg-muted/10 text-xs font-medium text-muted-foreground flex justify-between items-center">
            <span>Output (Formatted)</span>
            {output && <button onClick={copyToClipboard} className="hover:text-foreground text-primary flex items-center gap-1"><Icons.Copy className="w-3 h-3" /> Copy</button>}
          </div>
          
          {error ? (
            <div className="p-6 text-destructive space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Icons.XCircle className="w-5 h-5" /> Invalid JSON
              </div>
              <p className="font-mono text-sm break-all bg-destructive/10 p-3 rounded">{error}</p>
            </div>
          ) : (
            <textarea
              readOnly
              className="flex-1 w-full resize-none p-4 bg-transparent focus:outline-none custom-scrollbar font-mono text-sm leading-relaxed"
              value={output}
              placeholder="Valid JSON output will appear here..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}