import React, { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { CanvasBackgroundMode } from '../../types/svg';
import {
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Grid3X3,
  Crosshair,
  BoxSelect,
  Layers,
  Sun,
  Moon,
  Code2,
  PanelLeft,
  PanelRight,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    documents,
    activeDocId,
    setActiveDocId,
    closeDocument,
    openSvgFile,
    canvasState,
    setZoom,
    resetView,
    fitToView,
    setCanvasBackground,
    toggleGrid,
    toggleCoordinates,
    toggleBounds,
    toggleOutlines,
    isDarkMode,
    toggleDarkMode,
    isTreeCollapsed,
    isInspectorCollapsed,
    isSourceOpen,
    toggleTree,
    toggleInspector,
    toggleSource,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      openSvgFile(file);
      e.target.value = '';
    }
  };

  const handleFit = () => {
    // Fit to canvas viewport container
    const container = document.getElementById('svg-canvas-viewport');
    if (container) {
      fitToView(container.clientWidth, container.clientHeight);
    } else {
      fitToView(800, 600);
    }
  };

  return (
    <header className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-3 gap-2 shrink-0 select-none z-20">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".svg,image/svg+xml"
        className="hidden"
      />

      {/* Left: Branding & Files */}
      <div className="flex items-center gap-3 min-w-0 overflow-x-auto no-scrollbar">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 pr-1 shrink-0">
          <svg
            className="w-5 h-5 text-zinc-900 dark:text-zinc-100"
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
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            SVG Lens
          </span>
        </div>

        {/* Open Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded transition-colors shrink-0"
          title="Open SVG File"
        >
          <FolderOpen size={14} strokeWidth={1.5} />
          <span>Open</span>
        </button>

        {/* Multi-file Tabs */}
        {documents.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[320px] md:max-w-[450px]">
            {documents.map((doc) => {
              const isActive = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer shrink-0 max-w-[160px] border ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 font-medium'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border-transparent'
                  }`}
                >
                  <span className="truncate">{doc.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeDocument(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-opacity"
                    title="Close file"
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Controls: Canvas, Overlays, Layout & Theme */}
      <div className="flex items-center gap-1 shrink-0">
        {documents.length > 0 && (
          <>
            {/* Zoom Controls */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setZoom((z) => z * 0.8)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={resetView}
                className="px-1.5 py-0.5 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors min-w-[42px] text-center"
                title="Reset zoom to 100%"
              >
                {Math.round(canvasState.zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => z * 1.25)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleFit}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ml-0.5"
                title="Fit to Screen"
              >
                <Maximize2 size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={resetView}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Reset View"
              >
                <RotateCcw size={13} strokeWidth={1.5} />
              </button>
            </div>

            {/* Canvas Overlays Group */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={toggleGrid}
                className={`p-1 rounded transition-colors ${
                  canvasState.showGrid
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
                title="Toggle Grid"
              >
                <Grid3X3 size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggleCoordinates}
                className={`p-1 rounded transition-colors ${
                  canvasState.showCoordinates
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
                title="Toggle Coordinates & Axes"
              >
                <Crosshair size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggleBounds}
                className={`p-1 rounded transition-colors ${
                  canvasState.showBounds
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
                title="Toggle Element Bounds"
              >
                <BoxSelect size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggleOutlines}
                className={`p-1 rounded transition-colors ${
                  canvasState.showOutlines
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
                title="Toggle Outlines (Wireframe)"
              >
                <Layers size={13} strokeWidth={1.5} />
              </button>
            </div>

            {/* Canvas Background Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
              {(['dark', 'charcoal', 'light', 'checkerboard'] as CanvasBackgroundMode[]).map((bg) => (
                <button
                  key={bg}
                  onClick={() => setCanvasBackground(bg)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded capitalize transition-colors ${
                    canvasState.background === bg
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  title={`Canvas background: ${bg}`}
                >
                  {bg === 'checkerboard' ? 'check' : bg}
                </button>
              ))}
            </div>

            {/* Source Panel Toggle */}
            <button
              onClick={toggleSource}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors border ${
                isSourceOpen
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-transparent'
              }`}
              title="Toggle Source Viewer"
            >
              <Code2 size={13} strokeWidth={1.5} />
              <span className="hidden lg:inline text-[11px]">Source</span>
            </button>
          </>
        )}

        {/* Panel Visibility Toggles */}
        {documents.length > 0 && (
          <div className="flex items-center gap-0.5 ml-1 border-l border-zinc-200 dark:border-zinc-800 pl-1.5">
            <button
              onClick={toggleTree}
              className={`p-1.5 rounded transition-colors ${
                !isTreeCollapsed
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title={isTreeCollapsed ? 'Show Structure Tree' : 'Hide Structure Tree'}
            >
              <PanelLeft size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={toggleInspector}
              className={`p-1.5 rounded transition-colors ${
                !isInspectorCollapsed
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title={isInspectorCollapsed ? 'Show Inspector' : 'Hide Inspector'}
            >
              <PanelRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors ml-1"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  );
};
