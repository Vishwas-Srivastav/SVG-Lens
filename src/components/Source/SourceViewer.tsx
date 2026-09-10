import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import { Copy, Check, Download, Search, X, WrapText } from 'lucide-react';

export const SourceViewer: React.FC = () => {
  const {
    activeDoc,
    selectedNodeId,
    isSourceOpen,
    toggleSource,
    sourceHeight,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wrapLines, setWrapLines] = useState(false);

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const highlightedLineRef = useRef<HTMLDivElement>(null);

  const selectedNode = selectedNodeId && activeDoc ? activeDoc.nodeMap[selectedNodeId] : null;

  // Split formatted XML into lines
  const lines = useMemo(() => {
    if (!activeDoc) return [];
    return activeDoc.rawSource.split('\n');
  }, [activeDoc]);

  // Determine line number to highlight based on selected node
  const activeLineIndex = useMemo(() => {
    if (!selectedNode || !activeDoc) return -1;

    // 1. Check if node has explicit mapped start line
    if (selectedNode.sourceLineStart !== undefined) {
      return selectedNode.sourceLineStart;
    }

    // 2. Fallback: search for tag with ID or tagName in lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (selectedNode.id && line.includes(`id="${selectedNode.id}"`)) {
        return i;
      }
      if (!selectedNode.id && line.includes(`<${selectedNode.tagName}`)) {
        return i;
      }
    }
    return -1;
  }, [selectedNode, lines, activeDoc]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineIndex >= 0 && highlightedLineRef.current) {
      highlightedLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  const handleCopy = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.rawSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.rawSource], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDoc.name || 'artwork.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isSourceOpen || !activeDoc) return null;

  return (
    <div
      style={{ height: `${sourceHeight}px` }}
      className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 select-none z-20"
    >
      {/* Source Toolbar */}
      <div className="h-8 px-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
            SVG Source
          </span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            {lines.length} lines &bull; {(activeDoc.sizeBytes / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter / Search within code */}
          <div className="relative flex items-center">
            <Search
              size={11}
              strokeWidth={1.5}
              className="absolute left-2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Find in source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6 pr-2 py-0.5 text-[11px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 outline-none w-32 focus:w-44 transition-all"
            />
          </div>

          {/* Wrap Toggle */}
          <button
            onClick={() => setWrapLines((w) => !w)}
            className={`p-1 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors ${
              wrapLines ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''
            }`}
            title="Toggle word wrap"
          >
            <WrapText size={13} strokeWidth={1.5} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded transition-colors text-[11px]"
            title="Copy full SVG markup"
          >
            {copied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} strokeWidth={1.5} />
            )}
            <span>Copy</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded transition-colors text-[11px]"
            title="Download SVG file"
          >
            <Download size={12} strokeWidth={1.5} />
            <span>Download</span>
          </button>

          {/* Close Panel */}
          <button
            onClick={toggleSource}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors ml-1"
            title="Close Source Panel"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-auto font-mono text-[11px] leading-5 select-text p-2 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
      >
        <div className="flex">
          {/* Line Numbers Gutter */}
          <div className="select-none pr-3 text-right text-zinc-400 dark:text-zinc-600 border-r border-zinc-200 dark:border-zinc-800 shrink-0 min-w-[36px]">
            {lines.map((_, i) => (
              <div key={i} className="leading-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Lines */}
          <div className={`pl-3 flex-1 ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}>
            {lines.map((line, i) => {
              const isHighlighted = i === activeLineIndex;
              const matchesSearch =
                searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={i}
                  ref={isHighlighted ? highlightedLineRef : undefined}
                  className={`leading-5 px-1 rounded-xs transition-colors ${
                    isHighlighted
                      ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold'
                      : matchesSearch
                      ? 'bg-amber-500/20'
                      : ''
                  }`}
                >
                  <HighlightedXmlLine text={line} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lightweight, crisp syntax highlighting for XML tags, attributes, and strings
const HighlightedXmlLine: React.FC<{ text: string }> = ({ text }) => {
  // Regex to match XML tokens
  const tokenRegex = /(<\/?[a-zA-Z0-9:-]+)|(\s+[a-zA-Z0-9:-]+(?==))|(=)|("[^"]*")|(\/?>)|([^<>\s="]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const [full, tag, attr, eq, val, close] = match;

    if (tag) {
      parts.push(
        <span key={match.index} className="text-pink-600 dark:text-pink-400 font-medium">
          {tag}
        </span>
      );
    } else if (attr) {
      parts.push(
        <span key={match.index} className="text-amber-600 dark:text-amber-300">
          {attr}
        </span>
      );
    } else if (eq) {
      parts.push(
        <span key={match.index} className="text-zinc-500">
          {eq}
        </span>
      );
    } else if (val) {
      parts.push(
        <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
          {val}
        </span>
      );
    } else if (close) {
      parts.push(
        <span key={match.index} className="text-pink-600 dark:text-pink-400 font-medium">
          {close}
        </span>
      );
    } else {
      parts.push(full);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span>{parts.length > 0 ? parts : text}</span>;
};
