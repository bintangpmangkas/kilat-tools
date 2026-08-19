import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function WordCounter() {
  const [text, setText] = useState('');
  const stats = React.useMemo(() => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    
    // Reading time (200 wpm)
    const readingTime = Math.ceil(words.length / 200);
    // Speaking time (130 wpm)
    const speakingTime = Math.ceil(words.length / 130);

    // Top words (naive implementation, excluding common stopwords)
    const stopwords = new Set(['the','and','to','of','a','in','i','is','that','it','on','you','this','for','but','with','are','have','be','at','or','as','was','so','if','out','not','my','we','by','all','they','one','about','can','which','there','their','from','what','would','up','will','has','just','like','no','do']);
    
    const wordCounts = {};
    words.forEach(w => {
      const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.length > 2 && !stopwords.has(lower)) {
        wordCounts[lower] = (wordCounts[lower] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      words: words.length,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      topWords
    };
  }, [text]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Words" value={stats.words} />
        <StatCard title="Characters" value={stats.chars} />
        <StatCard title="Sentences" value={stats.sentences} />
        <StatCard title="Paragraphs" value={stats.paragraphs} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[500px]">
        <div className="flex-1 bg-card border rounded-lg shadow-sm flex flex-col">
          <div className="border-b px-4 py-3 bg-muted/30 flex justify-between items-center">
            <h3 className="text-sm font-medium">Text Input</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setText('')} className="h-8 px-2">Clear</Button>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(text)} className="h-8 px-2 gap-2">
                <Icons.Copy className="w-3.5 h-3.5" />
                Copy
              </Button>
            </div>
          </div>
          <textarea
            className="flex-1 w-full resize-none p-4 bg-transparent focus:outline-none custom-scrollbar text-sm leading-relaxed"
            placeholder="Paste your text here to see real-time statistics..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64 space-y-6 flex flex-col">
          <div className="bg-card border rounded-lg shadow-sm p-4 space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">Time Estimates</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Icons.BookOpen className="w-4 h-4"/> Reading</span>
                <span className="font-medium">{stats.readingTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Icons.Mic className="w-4 h-4"/> Speaking</span>
                <span className="font-medium">{stats.speakingTime} min</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg shadow-sm p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-medium border-b pb-2 mb-3">Top Keywords</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 text-sm">
              {stats.topWords.length > 0 ? (
                stats.topWords.map(([word, count]) => (
                  <div key={word} className="flex justify-between items-center">
                    <span className="truncate pr-2">{word}</span>
                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs text-center pt-4">No words yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-card border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold font-mono">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{title}</div>
    </div>
  );
}