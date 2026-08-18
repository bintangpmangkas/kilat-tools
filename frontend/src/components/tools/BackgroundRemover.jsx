import React from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export default function BackgroundRemover() {
  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 lg:p-12">
      <div className="text-center space-y-6 max-w-md mx-auto py-12">
        <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Clock className="w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-bold">Coming Soon</h3>
        
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-lg border border-amber-500/20 text-sm leading-relaxed text-center">
          <Icons.AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-80" />
          Mohon maaf, saat ini fitur Background Remover belum tersedia di versi ini karena keterbatasan deployment pada emergent.sh. Fitur ini akan segera hadir bulan depan.
        </div>

        <div className="pt-6">
          <Button asChild variant="outline">
            <Link to="/">
              <Icons.ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}