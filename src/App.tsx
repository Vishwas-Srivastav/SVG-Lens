import React, { useEffect } from 'react';
import { useApp } from './state/AppContext';
import { Header } from './components/Header/Header';
import { Canvas } from './components/Canvas/Canvas';
import { StructureTree } from './components/Tree/StructureTree';
import { Inspector } from './components/Inspector/Inspector';
import { SourceViewer } from './components/Source/SourceViewer';
import { DropZone } from './components/EmptyState/DropZone';

export const App: React.FC = () => {
  const {
    documents,
    activeDoc,
    openSvgFile,
    selectNode,
    setZoom,
    fitToView,
    toggleSource,
  } = useApp();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: deselect element
      if (e.key === 'Escape') {
        selectNode(null);
      }

      // Cmd / Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '0') {
          e.preventDefault();
          const container = document.getElementById('svg-canvas-viewport');
          if (container) {
            fitToView(container.clientWidth, container.clientHeight);
          }
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom((z) => z * 1.2);
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom((z) => z * 0.8);
        } else if (e.key === 'u' || e.key === 's') {
          if (activeDoc) {
            e.preventDefault();
            toggleSource();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNode, setZoom, fitToView, toggleSource, activeDoc]);

  // Window-level drag & drop for dropping files anywhere
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        openSvgFile(files[0]);
      }
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [openSvgFile]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <Header />

      {documents.length === 0 ? (
        <DropZone />
      ) : (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Main 3-Panel Inspection Workspace */}
          <div className="flex flex-1 min-h-0 relative overflow-hidden">
            <StructureTree />
            <Canvas />
            <Inspector />
          </div>

          {/* Bottom Collapsible Source Panel */}
          <SourceViewer />
        </div>
      )}
    </div>
  );
};
