import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

const UNITS = {
  length: { base: 'm', rates: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, mile: 1609.34 } },
  weight: { base: 'kg', rates: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, oz: 0.0283495, lb: 0.453592 } },
  data: { base: 'b', rates: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 } }
};

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [val1, setVal1] = useState('1');
  const [unit1, setUnit1] = useState('m');
  const [val2, setVal2] = useState('');
  const [unit2, setUnit2] = useState('cm');

  useEffect(() => {
    // Set default units when category changes
    const cats = Object.keys(UNITS[category].rates);
    setUnit1(cats[2] || cats[0]);
    setUnit2(cats[1] || cats[cats.length - 1]);
  }, [category]);

  useEffect(() => {
    convert(val1, unit1, unit2, false);
  }, [val1, unit1, unit2, category]);

  const convert = (value, fromUnit, toUnit, reverse) => {
    if (!value || isNaN(value)) {
      if (reverse) setVal1('');
      else setVal2('');
      return;
    }

    const rates = UNITS[category].rates;
    const baseValue = parseFloat(value) * rates[fromUnit];
    const converted = baseValue / rates[toUnit];
    
    // Format to avoid long decimals
    const formatted = Number.isInteger(converted) ? converted.toString() : converted.toFixed(6).replace(/\.?0+$/, '');

    if (reverse) {
      setVal1(formatted);
    } else {
      setVal2(formatted);
    }
  };

  const handleSwap = () => {
    setUnit1(unit2);
    setUnit2(unit1);
    setVal1(val2);
    setVal2(val1);
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex gap-2 p-1 bg-muted rounded-md overflow-x-auto custom-scrollbar">
          {Object.keys(UNITS).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-sm capitalize whitespace-nowrap transition-colors ${category === cat ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="space-y-2">
            <select 
              className="w-full border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={unit1}
              onChange={(e) => setUnit1(e.target.value)}
            >
              {Object.keys(UNITS[category].rates).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input 
              type="number" 
              className="w-full border rounded-md p-4 text-2xl font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwap} className="rounded-full h-12 w-12 border shadow-sm">
              <Icons.ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="space-y-2">
            <select 
              className="w-full border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={unit2}
              onChange={(e) => setUnit2(e.target.value)}
            >
              {Object.keys(UNITS[category].rates).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input 
              type="number" 
              className="w-full border rounded-md p-4 text-2xl font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-muted/30"
              value={val2}
              onChange={(e) => {
                setVal2(e.target.value);
                convert(e.target.value, unit2, unit1, true);
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">Formulas are calculated locally in real-time.</p>
        </div>
      </div>
    </div>
  );
}