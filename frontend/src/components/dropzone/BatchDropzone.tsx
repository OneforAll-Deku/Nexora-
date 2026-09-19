'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ScanLine, 
  ShieldAlert, 
  Zap, 
  Trash2 
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'queued' | 'uploading' | 'completed' | 'flagged' | 'error';
  progress: number;
  invoiceId?: string;
  errorMsg?: string;
  flagsCount?: number;
  processingTime?: number;
}

export function BatchDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(files).map((f) => ({
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      file: f,
      name: f.name,
      size: f.size,
      status: 'queued',
      progress: 0
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const processFile = async (item: QueuedFile) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q))
    );

    try {
      const progressTimer = setInterval(() => {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id && q.progress < 85 ? { ...q, progress: q.progress + 15 } : q))
        );
      }, 150);

      const result = await apiClient.uploadAndProcess(item.file);
      clearInterval(progressTimer);

      const isFlagged = result.flags_count > 0;
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: isFlagged ? 'flagged' : 'completed',
                progress: 100,
                invoiceId: result.invoice?.id,
                flagsCount: result.flags_count,
                processingTime: result.processing_time_seconds
              }
            : q
        )
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'error', progress: 100, errorMsg: err.message || 'Ingestion failed' }
            : q
        )
      );
    }
  };

  const processAll = async () => {
    setIsProcessingAll(true);
    const pendingItems = queue.filter((q) => q.status === 'queued');
    for (const item of pendingItems) {
      await processFile(item);
    }
    setIsProcessingAll(false);
  };

  const loadSyntheticPreset = async (presetType: 'clean' | 'arithmetic' | 'surge' | 'duplicate') => {
    const presetMap = {
      clean: { name: 'NexaCloud_Invoice_891.pdf', type: 'application/pdf', sampleUrl: '/samples/sample_clean.svg' },
      arithmetic: { name: 'FastShip_Invoice_89022_error.pdf', type: 'application/pdf', sampleUrl: '/samples/sample_arithmetic_error.svg' },
      surge: { name: 'Apex_Surge_Rate_199.pdf', type: 'application/pdf', sampleUrl: '/samples/sample_surge.svg' },
      duplicate: { name: 'Apex_Duplicate_101.pdf', type: 'application/pdf', sampleUrl: '/samples/sample_duplicate.svg' }
    };
    
    const preset = presetMap[presetType];
    const response = await fetch(preset.sampleUrl).catch(() => null);
    const blob = response ? await response.blob() : new Blob(["Simulated PDF Document Content"], { type: preset.type });
    const file = new File([blob], preset.name, { type: preset.type });
    handleFiles([file]);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-8 font-body">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all p-12 text-center flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border bg-background hover:border-accent/50 hover:bg-secondary/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.tiff"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-display font-bold text-foreground">Drag &amp; drop invoices, receipts or scanned PDFs</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Supports multi-file batches (.pdf, .png, .jpg, .tiff) • Direct Cloudflare R2 streaming
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-accent bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
          <ScanLine className="w-3.5 h-3.5" />
          <span>Multimodal OCR powered by Gemini 2.5 &amp; OpenRouter AI</span>
        </div>
      </div>

      <div className="bg-background rounded-3xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Quick Test Invoices (1-Click Test Presets)
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Inject pre-configured sample files with known audit triggers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => loadSyntheticPreset('clean')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-emerald-600">Clean Standard Invoice</p>
              <p className="text-[11px] text-muted-foreground">Zero discrepancies</p>
            </div>
          </button>

          <button
            onClick={() => loadSyntheticPreset('arithmetic')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-rose-600">Arithmetic Mismatch</p>
              <p className="text-[11px] text-muted-foreground">+$100 overbilling typo</p>
            </div>
          </button>

          <button
            onClick={() => loadSyntheticPreset('surge')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-amber-600">Price Surge Anomaly</p>
              <p className="text-[11px] text-muted-foreground">+74.5% (Z &ge; 17.9&sigma;)</p>
            </div>
          </button>

          <button
            onClick={() => loadSyntheticPreset('duplicate')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-purple-600">Duplicate Submission</p>
              <p className="text-[11px] text-muted-foreground">Re-submitted invoice #</p>
            </div>
          </button>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">Staging Queue ({queue.length} files)</h3>
              <p className="text-xs text-muted-foreground">Files queued for multimodal extraction and statistical auditing</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueue([])}
                className="px-4 py-1.5 rounded-full border border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
              >
                Clear Queue
              </button>
              <button
                onClick={processAll}
                disabled={isProcessingAll || queue.every((q) => q.status !== 'queued')}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                {isProcessingAll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Process All Queue</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {queue.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                      <span className="text-xs text-muted-foreground font-mono">({formatBytes(item.size)})</span>
                    </div>

                    {item.status === 'uploading' && (
                      <div className="w-full max-w-xs mt-1.5">
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                          <div
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {item.status === 'flagged' && (
                      <p className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Anomaly detected: {item.flagsCount} discrepancies flagged ({item.processingTime}s)</span>
                      </p>
                    )}

                    {item.status === 'completed' && (
                      <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Extracted cleanly in {item.processingTime}s</span>
                      </p>
                    )}

                    {item.status === 'error' && (
                      <p className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{item.errorMsg}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === 'queued' && (
                    <button
                      onClick={() => processFile(item)}
                      className="px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
                    >
                      Extract
                    </button>
                  )}

                  {(item.status === 'completed' || item.status === 'flagged') && item.invoiceId && (
                    <button
                      onClick={() => router.push(`/review/${item.invoiceId}`)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-xs font-semibold text-accent transition-all cursor-pointer"
                    >
                      <span>Review Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => removeQueueItem(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
