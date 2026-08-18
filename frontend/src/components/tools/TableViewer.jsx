import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

export default function TableViewer() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          if (file.name.endsWith('.json')) {
            const json = JSON.parse(evt.target.result);
            const arr = Array.isArray(json) ? json : [json];
            if (arr.length > 0) {
              setHeaders(Object.keys(arr[0]));
              setData(arr);
            }
          } else {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const json = XLSX.utils.sheet_to_json(ws);
            if (json.length > 0) {
              setHeaders(Object.keys(json[0]));
              setData(json);
            }
          }
        } catch (err) {
          console.error(err);
          alert('Failed to parse file. Ensure it is valid JSON or CSV/Excel.');
        }
      };
      
      if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    }
  };

  const filteredData = data.filter(row => 
    headers.some(h => String(row[h]).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-[700px]">
      <div className="border-b p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/30">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input type="file" accept=".json,.csv,.xlsx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button onClick={() => fileInputRef.current.click()} size="sm">
            <Icons.Upload className="w-4 h-4 mr-2" /> Load File
          </Button>
          {fileName && <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>}
        </div>
        
        {data.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Icons.Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search table..." 
              className="w-full border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-background">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <Icons.Database className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No Data Loaded</p>
            <p className="text-sm text-center">Load a JSON, CSV, or Excel file to view its contents as an interactive table.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 shadow-sm">
              <tr>
                <th className="px-4 py-3 w-12 text-center border-r">#</th>
                {headers.map(h => (
                  <th key={h} className="px-4 py-3 border-r last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 500).map((row, i) => (
                <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-2 border-r text-muted-foreground text-center text-xs">{i + 1}</td>
                  {headers.map(h => (
                    <td key={h} className="px-4 py-2 border-r last:border-r-0 truncate max-w-[300px]" title={String(row[h] || '')}>
                      {String(row[h] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {data.length > 0 && (
        <div className="border-t p-2 px-4 bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
          <span>Showing {Math.min(filteredData.length, 500)} of {filteredData.length} rows</span>
          {filteredData.length > 500 && <span>(Truncated to 500 rows for performance)</span>}
          <span>{headers.length} columns</span>
        </div>
      )}
    </div>
  );
}