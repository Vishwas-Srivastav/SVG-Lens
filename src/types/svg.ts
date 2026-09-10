export interface SvgNode {
  lensId: string;
  tagName: string;
  id?: string;
  className?: string;
  attributes: Record<string, string>;
  children: SvgNode[];
  parentId: string | null;
  depth: number;
  sourceLineStart?: number;
  sourceLineEnd?: number;
  textContent?: string;
  isVisible: boolean;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementMetrics {
  bbox?: BoundingBox;
  pathLength?: number;
  pathCommandsCount?: number;
  pathCommandsBreakdown?: Record<string, number>;
  transform?: string;
}

export interface SvgDocumentStats {
  totalElements: number;
  tagCounts: Record<string, number>;
  pathCount: number;
  groupCount: number;
  textCount: number;
  imageCount: number;
  defsCount: number;
  colorPalette: string[];
}

export interface SvgDocument {
  id: string;
  name: string;
  sizeBytes: number;
  rawSource: string;
  sanitizedSource: string;
  rootNode: SvgNode;
  nodeMap: Record<string, SvgNode>;
  viewBox: { minX: number; minY: number; width: number; height: number } | null;
  dimensions: { width: string; height: string };
  stats: SvgDocumentStats;
}

export type CanvasBackgroundMode = 'dark' | 'charcoal' | 'light' | 'checkerboard';

export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  background: CanvasBackgroundMode;
  showGrid: boolean;
  showCoordinates: boolean;
  showBounds: boolean;
  showOutlines: boolean;
  cursorPos: { x: number; y: number } | null;
}
