import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function DataCleaner() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  // Operations
  const [opts, setOpts] = useState({
    trim: true,
    removeEmptyRows: true,
    removeDuplicates: false
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          if (rawData.length > 0) {
            setHeaders(Object.keys(rawData[0]));
            setData(rawData);
            setResults(null);
          }
        } catch (err) {
          console.error(err);
          alert('Failed to read file. Please ensure it is a valid Excel or CSV file.');
        }
      };
      reader.readAsBinaryString(selected);
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let cleaned = [...data];
      let stats = {
        original: data.length,
        trimmed: 0,
        removedEmpty: 0,
        removedDuplicates: 0,
        final: 0
      };

      if (opts.trim) {
        cleaned = cleaned.map(row => {
          let newRow = {};
          let modified = false;
          Object.keys(row).forEach(key => {
            if (typeof row[key] === 'string') {
              const trimmed = row[key].trim();
              if (trimmed !== row[key]) modified = true;
              newRow[key] = trimmed;
            } else {
              newRow[key] = row[key];
            }
          });
          if (modified) stats.trimmed++;
          return newRow;
        });
      }

      if (opts.removeEmptyRows) {
        const initLength = cleaned.length;
        cleaned = cleaned.filter(row => Object.values(row).some(v => v !== null && v !== undefined && v !== ''));
        stats.removedEmpty = initLength - cleaned.length;
      }

      if (opts.removeDuplicates) {
        const initLength = cleaned.length;
        const seen = new Set();
        cleaned = cleaned.filter(row => {
          const str = JSON.stringify(row);
          if (seen.has(str)) return false;
          seen.add(str);
          return true;
        });
        stats.removedDuplicates = initLength - cleaned.length;
      }

      stats.final = cleaned.length;
      setResults({ data: cleaned, stats });
      setIsProcessing(false);
    }, 500); // simulate some work
  };

  const downloadFile = (format) => {
    if (!results || !results.data) return;
    
    const ws = XLSX.utils.json_to_sheet(results.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");
    
    if (format === 'csv') {
      XLSX.writeFile(wb, "cleaned_data.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(wb, "cleaned_data.xlsx", { bookType: "xlsx" });
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {!data.length ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Icons.Table className="w-10 h-10 mb-2 opacity-50" />
              <p className="font-medium text-foreground">Click to select CSV or Excel File</p>
              <p className="text-sm">Clean and format your spreadsheet data locally.</p>
            </div>
          </div>
        ) : !results ? (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{file?.name}</h3>
                <p className="text-sm text-muted-foreground">{data.length} rows detected.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setData([]); setFile(null); }}>
                Change File
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border rounded p-4 space-y-3">
                <h4 className="font-medium text-sm">Select Operations</h4>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={opts.trim} onChange={e => setOpts({...opts, trim: e.target.checked})} />
                  Trim extra spaces in text
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={opts.removeEmptyRows} onChange={e => setOpts({...opts, removeEmptyRows: e.target.checked})} />
                  Remove empty rows
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={opts.removeDuplicates} onChange={e => setOpts({...opts, removeDuplicates: e.target.checked})} />
                  Remove exact duplicate rows
                </label>
              </div>

              <div className="border rounded p-4 overflow-hidden flex flex-col">
                <h4 className="font-medium text-sm mb-2">Data Preview</h4>
                <div className="flex-1 overflow-auto text-xs whitespace-nowrap bg-muted/20 p-2 rounded">
                  <table className="w-full">
                    <thead>
                      <tr>{headers.map(h => <th key={h} className="text-left font-semibold px-2 py-1 border-b">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {headers.map(h => <td key={h} className="px-2 py-1 border-b border-muted">{row[h]?.toString().substring(0, 20) || ''}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length > 5 && <div className="text-muted-foreground text-center mt-2 italic">... and {data.length - 5} more rows</div>}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleProcess} disabled={isProcessing} size="lg" className="min-w-[200px]">
                {isProcessing ? <><Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Clean Data'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Cleaning Complete!</h3>
              <p className="text-muted-foreground">Your data has been processed.</p>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg border max-w-sm mx-auto text-sm space-y-2 text-left">
              <div className="flex justify-between border-b pb-1"><span>Original Rows:</span> <span>{results.stats.original}</span></div>
              {opts.trim && <div className="flex justify-between border-b pb-1 text-muted-foreground"><span>Rows Trimmed:</span> <span>{results.stats.trimmed}</span></div>}
              {opts.removeEmptyRows && <div className="flex justify-between border-b pb-1 text-muted-foreground"><span>Empty Removed:</span> <span>{results.stats.removedEmpty}</span></div>}
              {opts.removeDuplicates && <div className="flex justify-between border-b pb-1 text-muted-foreground"><span>Duplicates Removed:</span> <span>{results.stats.removedDuplicates}</span></div>}
              <div className="flex justify-between font-medium pt-1"><span>Final Rows:</span> <span>{results.stats.final}</span></div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => { setResults(null); setData([]); setFile(null); }}>
                Clean Another
              </Button>
              <Button className="gap-2" onClick={() => downloadFile('csv')}>
                <Icons.Download className="w-4 h-4" /> CSV
              </Button>
              <Button className="gap-2" onClick={() => downloadFile('xlsx')}>
                <Icons.Download className="w-4 h-4" /> Excel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}