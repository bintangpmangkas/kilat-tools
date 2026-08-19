import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('The quick brown fox jumps over the lazy dog.\n\nPhone: 123-456-7890\nEmail: test@example.com\nDate: 2026-08-17');
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const newMatches = [];
      let match;
      
      // Prevent infinite loops with empty match string if g flag is present
      if (flags.includes('g')) {
        let loopLimit = 1000;
        while ((match = regex.exec(testString)) !== null && loopLimit > 0) {
          if (match[0].length === 0) {
            regex.lastIndex++; // avoid infinite loop on empty match
          }
          newMatches.push({
            index: match.index,
            length: match[0].length,
            text: match[0],
            groups: match.slice(1)
          });
          loopLimit--;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          newMatches.push({
            index: match.index,
            length: match[0].length,
            text: match[0],
            groups: match.slice(1)
          });
        }
      }
      
      setMatches(newMatches);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  // Generate highlighted text logic
  const renderHighlightedText = () => {
    if (!pattern || error || matches.length === 0) return testString;

    let result = [];
    let lastIndex = 0;

    matches.forEach((m, i) => {
      // Add text before match
      if (m.index > lastIndex) {
        result.push(<span key={`text-${i}`}>{testString.slice(lastIndex, m.index)}</span>);
      }
      // Add highlighted match (alternate colors for consecutive matches)
      result.push(
        <span key={`match-${i}`} className={i % 2 === 0 ? "bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-sm px-[1px]" : "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-sm px-[1px]"} title={`Match ${i+1}`}>
          {m.text}
        </span>
      );
      lastIndex = m.index + m.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      result.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
    }

    return result;
  };

  const toggleFlag = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-[700px]">
      <div className="p-6 border-b space-y-4 bg-muted/10">
        <div>
          <label className="text-sm font-medium mb-1 block">Regular Expression</label>
          <div className="flex font-mono text-lg bg-background border rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden">
            <div className="pl-3 py-2 text-muted-foreground select-none flex items-center bg-muted/30 border-r">/</div>
            <input 
              type="text" 
              className="flex-1 bg-transparent px-2 py-2 focus:outline-none"
              placeholder="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
            <div className="px-2 py-2 text-muted-foreground select-none flex items-center bg-muted/30 border-l">/</div>
            <input 
              type="text" 
              className="w-16 bg-transparent px-2 py-2 focus:outline-none text-primary"
              placeholder="flags"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-xs mt-2 font-mono flex items-center gap-1"><Icons.XCircle className="w-3 h-3"/> {error}</p>}
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Common Flags:</p>
          <div className="flex gap-2">
            <button onClick={() => toggleFlag('g')} className={`px-2 py-1 text-xs font-mono rounded border ${flags.includes('g') ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-muted'}`}>g (global)</button>
            <button onClick={() => toggleFlag('i')} className={`px-2 py-1 text-xs font-mono rounded border ${flags.includes('i') ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-muted'}`}>i (ignore case)</button>
            <button onClick={() => toggleFlag('m')} className={`px-2 py-1 text-xs font-mono rounded border ${flags.includes('m') ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-muted'}`}>m (multiline)</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-r">
          <div className="p-2 border-b bg-muted/5 text-xs font-medium text-muted-foreground">Test String</div>
          <textarea
            className="flex-1 w-full resize-none p-4 bg-transparent focus:outline-none custom-scrollbar font-mono text-sm leading-relaxed text-foreground"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            spellCheck={false}
          />
        </div>
        
        <div className="flex-1 flex flex-col bg-muted/5">
          <div className="p-2 border-b bg-muted/10 text-xs font-medium text-muted-foreground flex justify-between items-center">
            <span>Match Results</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{matches.length} matches</span>
          </div>
          <div className="flex-1 p-4 font-mono text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap break-words custom-scrollbar">
            {renderHighlightedText()}
          </div>
        </div>
      </div>
    </div>
  );
}