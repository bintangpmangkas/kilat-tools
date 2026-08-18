import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFToTable() {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTableData([]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allRows = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const items = textContent.items;
        
        // Sort items by Y (descending) then X (ascending)
        items.sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) { // 5px threshold for lines
            return yDiff;
          }
          return a.transform[4] - b.transform[4];
        });
        
        let lines = [];
        let currentLineY = null;
        let currentLineItems = [];
        
        items.forEach(item => {
          const y = item.transform[5];
          if (currentLineY === null) {
            currentLineY = y;
            currentLineItems.push(item);
          } else if (Math.abs(currentLineY - y) > 5) {
            lines.push(currentLineItems);
            currentLineY = y;
            currentLineItems = [item];
          } else {
            currentLineItems.push(item);
          }
        });
        if (currentLineItems.length > 0) lines.push(currentLineItems);
        
        const parsedRows = lines.map(rowItems => {
          // Sort items by X coordinate
          rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
          
          let cols = [];
          let currentColStr = "";
          let lastXEnd = null;
          
          rowItems.forEach(item => {
            const x = item.transform[4];
            const width = item.width || (item.str.length * 5); // Rough fallback
            
            // Ignore empty strings
            if (!item.str.trim()) return;
            
            if (lastXEnd === null) {
              currentColStr = item.str;
            } else if (x - lastXEnd > 15) { // Threshold for new column
              cols.push(currentColStr.trim());
              currentColStr = item.str;
            } else {
              currentColStr += (currentColStr.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
            }
            lastXEnd = x + width;
          });
          if (currentColStr.trim()) cols.push(currentColStr.trim());
          
          return cols;
        });
        
        // Filter out single-column rows to focus on tabular data (like invoice lines)
        // But keep them if they might be headers. For now, let's keep rows with >1 columns
        const tabularRows = parsedRows.filter(row => row.length > 1);
        
        allRows = [...allRows, ...tabularRows];
      }
      
      // Normalize columns (pad to max columns)
      const maxCols = Math.max(...allRows.map(r => r.length), 0);
      const normalizedRows = allRows.map(row => {
        const newRow = [...row];
        while (newRow.length < maxCols) newRow.push("");
        return newRow;
      });
      
      setTableData(normalizedRows);
      
    } catch (err) {
      console.error(err);
      alert('Failed to process PDF. Ensure it is a text-based digital PDF.');
    }
    
    setIsProcessing(false);
  };

  const copyToClipboard = () => {
    if (tableData.length === 0) return;
    const tsv = tableData.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    alert('Copied to clipboard!');
  };

  const downloadFile = (format) => {
    if (tableData.length === 0) return;
    
    // Create AoA (Array of Arrays) for XLSX
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Table");
    
    if (format === 'csv') {
      XLSX.writeFile(wb, "extracted_table.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(wb, "extracted_table.xlsx", { bookType: "xlsx" });
    }
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6">
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {tableData.length === 0 ? (
          <>
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Icons.FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-medium text-foreground">Click to select PDF File</p>
                <p className="text-sm">Extract structured tables from digital PDFs.</p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground border">
              <Icons.Info className="w-4 h-4 inline-block mr-1 mb-0.5" />
              Untuk hasil terbaik, gunakan PDF berbasis digital (bukan hasil scan). PDF hasil scan mungkin tidak terbaca dengan akurat.
            </div>

            {file && (
              <div className="text-left bg-muted/30 p-4 rounded-md border text-sm">
                <p className="font-medium">Selected File: <span className="font-normal text-muted-foreground">{file.name}</span></p>
              </div>
            )}

            <Button 
              onClick={handleProcess} 
              disabled={isProcessing || !file}
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  Extracting Table...
                </span>
              ) : (
                "Extract to Table"
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">Extracted Data</h3>
                <p className="text-sm text-muted-foreground">{tableData.length} tabular rows found.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setTableData([]); setFile(null); }}>
                Process Another PDF
              </Button>
            </div>

            <div className="border rounded p-4 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto text-xs bg-muted/20 p-2 rounded max-h-[400px]">
                <table className="w-full">
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 border-r last:border-r-0 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" className="gap-2" onClick={copyToClipboard}>
                <Icons.Copy className="w-4 h-4" /> Copy to Clipboard
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