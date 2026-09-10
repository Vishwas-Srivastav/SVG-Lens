import React, { useState, useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { SAMPLE_SVGS } from '../../core/samples';
import { FolderOpen, Clipboard, ShieldCheck, ArrowRight, X } from 'lucide-react';

export const DropZone: React.FC = () => {
  const { openSvgFile, loadSvgContent } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes('svg') || file.name.endsWith('.svg')) {
        openSvgFile(file);
      } else {
        // Try reading as text anyway
        openSvgFile(file);
      }
    }
  };

  const handlePasteSubmit = () => {
    if (pastedCode.trim()) {
      const success = loadSvgContent(pastedCode.trim(), 'pasted.svg');
      if (success) {
        setIsPasteModalOpen(false);
        setPastedCode('');
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 select-none relative overflow-hidden"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openSvgFile(file);
        }}
        accept=".svg,image/svg+xml"
        className="hidden"
      />

      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Minimal Wordmark / Brand */}
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-6 h-6 text-zinc-900 dark:text-zinc-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
          </svg>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            SVG Lens
          </h1>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8">
          Inspect SVGs visually. Understand what's inside.
        </p>

        {/* Drop Box Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-56 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${
            isDragOver
              ? 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10'
              : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white/60 dark:bg-zinc-900/40'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-3 transition-transform group-hover:scale-105">
            <FolderOpen size={20} strokeWidth={1.5} />
          </div>

          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-1">
            Drop an SVG anywhere
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-4">
            or click to browse your files
          </span>

          <button
            type="button"
            className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium rounded hover:bg-zinc-800 dark:hover:bg-white transition-colors"
          >
            Open SVG
          </button>
        </div>

        {/* Action Link: Paste Markup */}
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <Clipboard size={13} strokeWidth={1.5} />
            <span>or paste SVG markup</span>
          </button>
        </div>

        {/* Sample SVGs Quick Selector */}
        <div className="mt-8 w-full border-t border-zinc-200 dark:border-zinc-800/80 pt-5">
          <span className="text-[10px] uppercase font-mono text-zinc-400 dark:text-zinc-500 block mb-2.5">
            Try a sample SVG
          </span>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_SVGS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSvgContent(sample.content, `${sample.id}.svg`)}
                className="flex flex-col items-start p-2 rounded border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/40 dark:bg-zinc-900/30 text-left transition-colors group"
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white">
                    {sample.name}
                  </span>
                  <ArrowRight
                    size={11}
                    strokeWidth={1.5}
                    className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1">
                  {sample.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-600">
          <ShieldCheck size={13} strokeWidth={1.5} />
          <span>Your SVG stays in your browser. Zero server uploads.</span>
        </div>
      </div>

      {/* Paste Markup Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Paste SVG Markup
              </span>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="<svg ...> ... </svg>"
                rows={10}
                className="w-full p-3 font-mono text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded focus:border-zinc-400 dark:focus:border-zinc-600 outline-none resize-none select-text"
                autoFocus
              />
            </div>

            <div className="h-12 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedCode.trim()}
                className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium rounded hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 transition-colors"
              >
                Inspect SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
