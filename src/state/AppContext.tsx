import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SvgDocument, CanvasState, CanvasBackgroundMode } from '../types/svg';
import { parseSvgContent } from '../core/parser';

interface AppContextType {
  documents: SvgDocument[];
  activeDocId: string | null;
  activeDoc: SvgDocument | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  hiddenNodeIds: Set<string>;
  expandedNodeIds: Set<string>;
  canvasState: CanvasState;
  isDarkMode: boolean;
  isTreeCollapsed: boolean;
  isInspectorCollapsed: boolean;
  isSourceOpen: boolean;
  treeWidth: number;
  inspectorWidth: number;
  sourceHeight: number;
  // Actions
  loadSvgContent: (content: string, name?: string) => boolean;
  openSvgFile: (file: File) => Promise<boolean>;
  closeDocument: (id: string) => void;
  setActiveDocId: (id: string) => void;
  selectNode: (lensId: string | null) => void;
  hoverNode: (lensId: string | null) => void;
  toggleNodeVisibility: (lensId: string) => void;
  toggleNodeExpanded: (lensId: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  setZoom: (updater: number | ((prev: number) => number)) => void;
  setPan: (updater: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetView: () => void;
  fitToView: (containerWidth: number, containerHeight: number) => void;
  setCanvasBackground: (mode: CanvasBackgroundMode) => void;
  toggleGrid: () => void;
  toggleCoordinates: () => void;
  toggleBounds: () => void;
  toggleOutlines: () => void;
  setCursorPos: (pos: { x: number; y: number } | null) => void;
  toggleDarkMode: () => void;
  toggleTree: () => void;
  toggleInspector: () => void;
  toggleSource: () => void;
  setTreeWidth: (w: number) => void;
  setInspectorWidth: (w: number) => void;
  setSourceHeight: (h: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<SvgDocument[]>([]);
  const [activeDocId, setActiveDocIdState] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(new Set());
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Panel sizing and visibility
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [treeWidth, setTreeWidth] = useState(270);
  const [inspectorWidth, setInspectorWidth] = useState(320);
  const [sourceHeight, setSourceHeight] = useState(240);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Canvas
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    background: 'dark',
    showGrid: false,
    showCoordinates: false,
    showBounds: true,
    showOutlines: false,
    cursorPos: null,
  });

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Sync theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadSvgContent = useCallback(
    (content: string, name = 'artwork.svg'): boolean => {
      const result = parseSvgContent(content, name);
      if (result.error || !result.doc) {
        alert(`Error loading SVG: ${result.error || 'Invalid SVG content'}`);
        return false;
      }

      setDocuments((prev) => {
        const next = [...prev, result.doc!];
        return next;
      });
      setActiveDocIdState(result.doc.id);
      setSelectedNodeId(null);
      setHoveredNodeId(null);
      setHiddenNodeIds(new Set());

      // Auto expand root and its first level children
      const initialExpanded = new Set<string>();
      initialExpanded.add(result.doc.rootNode.lensId);
      result.doc.rootNode.children.forEach((c) => initialExpanded.add(c.lensId));
      setExpandedNodeIds(initialExpanded);

      // Reset canvas
      setCanvasState((prev) => ({
        ...prev,
        zoom: 1,
        pan: { x: 0, y: 0 },
      }));

      return true;
    },
    []
  );

  const openSvgFile = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        return loadSvgContent(text, file.name);
      } catch (err) {
        console.error('Failed to read file:', err);
        return false;
      }
    },
    [loadSvgContent]
  );

  const closeDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (activeDocId === id) {
          const nextActive = next.length > 0 ? next[next.length - 1].id : null;
          setActiveDocIdState(nextActive);
        }
        return next;
      });
      setSelectedNodeId(null);
    },
    [activeDocId]
  );

  const setActiveDocId = useCallback((id: string) => {
    setActiveDocIdState(id);
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setHiddenNodeIds(new Set());
  }, []);

  const selectNode = useCallback(
    (lensId: string | null) => {
      setSelectedNodeId(lensId);
      if (lensId && activeDoc) {
        // Expand all ancestor nodes up to root
        let curr = activeDoc.nodeMap[lensId];
        const toExpand: string[] = [];
        while (curr && curr.parentId) {
          toExpand.push(curr.parentId);
          curr = activeDoc.nodeMap[curr.parentId];
        }
        if (toExpand.length > 0) {
          setExpandedNodeIds((prev) => {
            const next = new Set(prev);
            toExpand.forEach((id) => next.add(id));
            return next;
          });
        }
      }
    },
    [activeDoc]
  );

  const hoverNode = useCallback((lensId: string | null) => {
    setHoveredNodeId(lensId);
  }, []);

  const toggleNodeVisibility = useCallback((lensId: string) => {
    setHiddenNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(lensId)) {
        next.delete(lensId);
      } else {
        next.add(lensId);
      }
      return next;
    });
  }, []);

  const toggleNodeExpanded = useCallback((lensId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(lensId)) {
        next.delete(lensId);
      } else {
        next.add(lensId);
      }
      return next;
    });
  }, []);

  const expandAllNodes = useCallback(() => {
    if (!activeDoc) return;
    const all = new Set(Object.keys(activeDoc.nodeMap));
    setExpandedNodeIds(all);
  }, [activeDoc]);

  const collapseAllNodes = useCallback(() => {
    if (!activeDoc) return;
    const rootOnly = new Set<string>();
    rootOnly.add(activeDoc.rootNode.lensId);
    setExpandedNodeIds(rootOnly);
  }, [activeDoc]);

  const setZoom = useCallback((updater: number | ((prev: number) => number)) => {
    setCanvasState((prev) => {
      const nextZoom = typeof updater === 'function' ? updater(prev.zoom) : updater;
      const clamped = Math.min(Math.max(nextZoom, 0.05), 50);
      return { ...prev, zoom: Math.round(clamped * 1000) / 1000 };
    });
  }, []);

  const setPan = useCallback(
    (updater: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
      setCanvasState((prev) => ({
        ...prev,
        pan: typeof updater === 'function' ? updater(prev.pan) : updater,
      }));
    },
    []
  );

  const resetView = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: 1,
      pan: { x: 0, y: 0 },
    }));
  }, []);

  const fitToView = useCallback(
    (containerWidth: number, containerHeight: number) => {
      if (!activeDoc) return;
      let svgW = 300;
      let svgH = 300;

      if (activeDoc.viewBox) {
        svgW = activeDoc.viewBox.width;
        svgH = activeDoc.viewBox.height;
      } else {
        const parsedW = parseFloat(activeDoc.dimensions.width);
        const parsedH = parseFloat(activeDoc.dimensions.height);
        if (!isNaN(parsedW) && parsedW > 0) svgW = parsedW;
        if (!isNaN(parsedH) && parsedH > 0) svgH = parsedH;
      }

      const padding = 48;
      const availableW = Math.max(containerWidth - padding * 2, 50);
      const availableH = Math.max(containerHeight - padding * 2, 50);

      const scaleW = availableW / svgW;
      const scaleH = availableH / svgH;
      const fitZoom = Math.min(scaleW, scaleH, 5);

      setCanvasState((prev) => ({
        ...prev,
        zoom: Math.round(fitZoom * 100) / 100,
        pan: { x: 0, y: 0 },
      }));
    },
    [activeDoc]
  );

  const setCanvasBackground = useCallback((mode: CanvasBackgroundMode) => {
    setCanvasState((prev) => ({ ...prev, background: mode }));
  }, []);

  const toggleGrid = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleCoordinates = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, showCoordinates: !prev.showCoordinates }));
  }, []);

  const toggleBounds = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, showBounds: !prev.showBounds }));
  }, []);

  const toggleOutlines = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, showOutlines: !prev.showOutlines }));
  }, []);

  const setCursorPos = useCallback((pos: { x: number; y: number } | null) => {
    setCanvasState((prev) => ({ ...prev, cursorPos: pos }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const toggleTree = useCallback(() => setIsTreeCollapsed((prev) => !prev), []);
  const toggleInspector = useCallback(() => setIsInspectorCollapsed((prev) => !prev), []);
  const toggleSource = useCallback(() => setIsSourceOpen((prev) => !prev), []);

  return (
    <AppContext.Provider
      value={{
        documents,
        activeDocId,
        activeDoc,
        selectedNodeId,
        hoveredNodeId,
        hiddenNodeIds,
        expandedNodeIds,
        canvasState,
        isDarkMode,
        isTreeCollapsed,
        isInspectorCollapsed,
        isSourceOpen,
        treeWidth,
        inspectorWidth,
        sourceHeight,
        loadSvgContent,
        openSvgFile,
        closeDocument,
        setActiveDocId,
        selectNode,
        hoverNode,
        toggleNodeVisibility,
        toggleNodeExpanded,
        expandAllNodes,
        collapseAllNodes,
        setZoom,
        setPan,
        resetView,
        fitToView,
        setCanvasBackground,
        toggleGrid,
        toggleCoordinates,
        toggleBounds,
        toggleOutlines,
        setCursorPos,
        toggleDarkMode,
        toggleTree,
        toggleInspector,
        toggleSource,
        setTreeWidth,
        setInspectorWidth,
        setSourceHeight,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
