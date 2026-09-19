'use client';

import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Contrast, 
  FileText 
} from 'lucide-react';

interface DocumentViewerProps {
  fileUrl?: string;
  fileName?: string;
}

export function DocumentViewer({ fileUrl, fileName }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const effectiveUrl = fileUrl || '/samples/sample_clean.svg';

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl border border-border shadow-sm overflow-hidden font-body">
      <div className="h-14 bg-secondary/60 border-b border-border px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">
            {fileName || 'Original Document Preview'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setHighContrast(!highContrast)}
            title="High Contrast Mode"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              highContrast ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Contrast className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-secondary/20 relative">
        <div
          className={`transition-transform duration-200 origin-center shadow-md rounded-xl overflow-hidden border border-border/60 ${
            highContrast ? 'contrast-150 grayscale' : ''
          }`}
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            maxWidth: '100%'
          }}
        >
          {effectiveUrl.endsWith('.pdf') ? (
            <iframe
              src={effectiveUrl}
              title="PDF Preview"
              className="w-[680px] h-[880px] border-0 bg-white"
            />
          ) : (
            <img
              src={effectiveUrl}
              alt="Uploaded Invoice"
              className="w-[680px] h-auto object-contain bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
