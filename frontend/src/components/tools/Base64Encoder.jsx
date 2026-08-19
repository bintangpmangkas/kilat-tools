import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function Base64Encoder() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [fileOutput, setFileOutput] = useState(null);
  
  const fileInputRef = useRef(null);

  // TEXT MODE
  const handleTextAction = () => {
    try {
      if (mode === 'encode') {
        // Handle utf-8 encoding safely
        setOutputText(btoa(unescape(encodeURIComponent(inputText))));
      } else {
        setOutputText(decodeURIComponent(escape(atob(inputText.trim()))));
      }
    } catch (e) {
      setOutputText('Error: Invalid input string for this operation.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // FILE MODE
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      if (mode === 'encode') {
        reader.onload = (evt) => {
          setFileOutput({ type: 'string', data: evt.target.result });
        };
        reader.readAsDataURL(file);
      } else {
        // Decode file (expecting a txt file with base64 string)
        reader.onload = (evt) => {
          try {
            let base64str = evt.target.result.trim();
            // Try to extract mime type if data URI
            let mime = 'application/octet-stream';
            if (base64str.startsWith('data:')) {
              const match = base64str.match(/^data:([^;]+);base64,/);
              if (match) {
                mime = match[1];
                base64str = base64str.replace(/^data:[^;]+;base64,/, '');
              }
            }
            
            const byteString = atob(base64str);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: mime });
            const url = URL.createObjectURL(blob);
            setFileOutput({ type: 'file', url, mime });
          } catch (err) {
            setFileOutput({ type: 'error', data: 'Error decoding file. Ensure it contains a valid Base64 string.' });
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col min-h-[600px]">
      <div className="border-b px-4 flex gap-4 bg-muted/30">
        <button 
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'text' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => { setActiveTab('text'); setOutputText(''); setFileOutput(null); }}
        >
          Text
        </button>
        <button 
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'file' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => { setActiveTab('file'); setOutputText(''); setFileOutput(null); }}
        >
          File
        </button>
      </div>

      <div className="p-4 border-b bg-muted/10 flex justify-center gap-2">
        <Button 
          variant={mode === 'encode' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => { setMode('encode'); setOutputText(''); setFileOutput(null); }}
        >
          Encode
        </Button>
        <Button 
          variant={mode === 'decode' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => { setMode('decode'); setOutputText(''); setFileOutput(null); }}
        >
          Decode
        </Button>
      </div>

      <div className="flex-1 p-6">
        {activeTab === 'text' ? (
          <div className="flex flex-col h-full gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium mb-2 flex justify-between">
                <span>Input</span>
                {inputText && <span className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => setInputText('')}>Clear</span>}
              </label>
              <textarea
                className="flex-1 min-h-[150px] border rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground custom-scrollbar"
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleTextAction} className="w-full sm:w-auto min-w-[200px]">
                {mode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
              </Button>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium mb-2 flex justify-between">
                <span>Output</span>
                {outputText && <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => copyToClipboard(outputText)}>Copy All</span>}
              </label>
              <textarea
                readOnly
                className="flex-1 min-h-[150px] border rounded-md p-3 text-sm font-mono bg-muted/30 text-foreground custom-scrollbar focus:outline-none"
                value={outputText}
                placeholder="Result will appear here"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto space-y-8">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer w-full text-center"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Icons.FileUp className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-medium text-foreground">Click to upload {mode === 'encode' ? 'a File (e.g. image)' : 'a Text file containing Base64'}</p>
                <p className="text-sm">Processed locally in browser.</p>
              </div>
            </div>

            {fileOutput && (
              <div className="w-full">
                <h3 className="font-medium text-sm mb-3">Result</h3>
                {fileOutput.type === 'error' && (
                  <p className="text-destructive text-sm">{fileOutput.data}</p>
                )}
                
                {fileOutput.type === 'string' && (
                  <div className="space-y-3">
                    <textarea
                      readOnly
                      className="w-full h-32 border rounded-md p-3 text-xs font-mono bg-muted/30 text-foreground custom-scrollbar"
                      value={fileOutput.data}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full" onClick={() => copyToClipboard(fileOutput.data)}>
                        <Icons.Copy className="w-4 h-4 mr-2" /> Copy Base64
                      </Button>
                    </div>
                  </div>
                )}
                
                {fileOutput.type === 'file' && (
                  <div className="space-y-4 text-center p-6 border rounded-lg bg-muted/10">
                    <p className="text-sm">Successfully decoded! Mime: <span className="font-mono">{fileOutput.mime}</span></p>
                    {fileOutput.mime.startsWith('image/') ? (
                      <img src={fileOutput.url} alt="Decoded" className="max-h-48 mx-auto border shadow-sm rounded" />
                    ) : (
                      <Icons.File className="w-16 h-16 mx-auto text-muted-foreground" />
                    )}
                    <Button onClick={() => {
                      const a = document.createElement('a');
                      a.href = fileOutput.url;
                      const ext = fileOutput.mime.split('/')[1] || 'bin';
                      a.download = `decoded_file.${ext}`;
                      a.click();
                    }}>
                      <Icons.Download className="w-4 h-4 mr-2" /> Download File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}