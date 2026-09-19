'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  CheckCircle2, 
  Download, 
  Zap
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { GeminiKeyStatus } from '@/lib/types';
import { ExportModal } from '../export/ExportModal';

export function Header() {
  const [keyStatus, setKeyStatus] = useState<GeminiKeyStatus | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      const status = await apiClient.getKeyStatus();
      setKeyStatus(status);
    } catch {
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 font-body">
        <div className="flex items-center gap-4">
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-background hover:bg-secondary transition-all text-xs shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5 text-accent" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">BYOK:</span>
              <span suppressHydrationWarning className="font-mono text-foreground font-semibold">{keyStatus?.mask || 'Checking...'}</span>
            </div>
            {keyStatus?.is_valid ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Zap className="w-3 h-3" /> Demo Mode
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Master Ledger</span>
          </button>
        </div>
      </header>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  );
}
