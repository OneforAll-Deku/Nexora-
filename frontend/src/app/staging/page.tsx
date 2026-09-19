'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';
import { BatchDropzone } from '@/components/dropzone/BatchDropzone';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function StagingPage() {
  return (
    <ERPLayout>
      <div className="space-y-6 font-body">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
            <UploadCloud className="w-4 h-4" />
            <span>Multimodal Document Ingestion Queue</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Batch Document Ingestion</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Drop PDF invoices, paper receipts, or scanned images. Directly streamed to Cloudflare R2 and parsed via BYOK Gemini &amp; OpenRouter AI with automatic fraud, duplicate, and statistical $Z$-score price surge detection.
          </p>
        </div>

        <BatchDropzone />
      </div>
    </ERPLayout>
  );
}
