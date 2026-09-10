import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../../state/AppContext';
import { BoundingBox } from '../../types/svg';
import { getElementBoundingBox } from '../../core/geometry';

export const Canvas: React.FC = () => {
  const {
    activeDoc,
    selectedNodeId,
    hoveredNodeId,
    hiddenNodeIds,
    canvasState,
    selectNode,
    hoverNode,
    setZoom,
    setPan,
    setCursorPos,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBBox, setSelectedBBox] = useState<BoundingBox | null>(null);
  const [hoveredBBox, setHoveredBBox] = useState<BoundingBox | null>(null);

  // Apply hidden nodes visibility & attributes to the rendered SVG
  useEffect(() => {
    if (!svgWrapperRef.current) return;
    const svgEl = svgWrapperRef.current.querySelector('svg');
    if (!svgEl) return;

    // Reset all previous visibility and selection marks
    const allLensElements = svgEl.querySelectorAll('[data-lens-id]');
    allLensElements.forEach((el) => {
      const id = el.getAttribute('data-lens-id');
      if (id && hiddenNodeIds.has(id)) {
        (el as HTMLElement | SVGElement).style.visibility = 'hidden';
      } else {
        (el as HTMLElement | SVGElement).style.visibility = 'visible';
      }

      if (id === selectedNodeId) {
        el.setAttribute('data-lens-selected', 'true');
      } else {
        el.removeAttribute('data-lens-selected');
      }

      if (id === hoveredNodeId && id !== selectedNodeId) {
        el.setAttribute('data-lens-hovered', 'true');
      } else {
        el.removeAttribute('data-lens-hovered');
      }
    });

    // Compute bounding boxes for selected element
    if (selectedNodeId) {
      const targetEl = svgEl.querySelector(`[data-lens-id="${selectedNodeId}"]`);
      if (targetEl instanceof SVGGraphicsElement) {
        const box = getElementBoundingBox(targetEl);
        setSelectedBBox(box || null);
      } else {
        setSelectedBBox(null);
      }
    } else {
      setSelectedBBox(null);
    }

    // Compute bounding box for hovered element
    if (hoveredNodeId && hoveredNodeId !== selectedNodeId) {
      const targetEl = svgEl.querySelector(`[data-lens-id="${hoveredNodeId}"]`);
      if (targetEl instanceof SVGGraphicsElement) {
        const box = getElementBoundingBox(targetEl);
        setHoveredBBox(box || null);
      } else {
        setHoveredBBox(null);
      }
    } else {
      setHoveredBBox(null);
    }
  }, [selectedNodeId, hoveredNodeId, hiddenNodeIds, activeDoc]);

  // Handle Wheel Zoom (centered at mouse cursor)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.05), 40);
        // Adjust pan to zoom towards mouse position
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
          y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
        }));
        return nextZoom;
      });
    },
    [setZoom, setPan]
  );

  // Handle Mouse Down (start pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if left click or middle click
    if (e.button === 0 || e.button === 1) {
      // If clicked directly on canvas background (or space is pressed)
      const target = e.target as HTMLElement;
      const isElement = target.closest('[data-lens-id]');
      if (!isElement || e.button === 1 || e.altKey || e.shiftKey) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - canvasState.pan.x,
          y: e.clientY - canvasState.pan.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Pan dragging
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Coordinate tracking
    if (!svgWrapperRef.current) return;
    const svgEl = svgWrapperRef.current.querySelector('svg');
    if (svgEl) {
      const ctm = svgEl.getScreenCTM();
      if (ctm) {
        const inverse = ctm.inverse();
        const pt = svgEl.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(inverse);
        setCursorPos({
          x: Math.round(svgP.x * 10) / 10,
          y: Math.round(svgP.y * 10) / 10,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setCursorPos(null);
    hoverNode(null);
  };

  // Canvas Click: Element Selection or Deselection
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    const target = e.target as Element;
    const lensEl = target.closest('[data-lens-id]');
    if (lensEl) {
      e.stopPropagation();
      const id = lensEl.getAttribute('data-lens-id');
      selectNode(id);
    } else {
      selectNode(null);
    }
  };

  // Canvas MouseOver: Hover node detection
  const handleMouseOver = (e: React.MouseEvent) => {
    const target = e.target as Element;
    const lensEl = target.closest('[data-lens-id]');
    if (lensEl) {
      const id = lensEl.getAttribute('data-lens-id');
      hoverNode(id);
    } else {
      hoverNode(null);
    }
  };

  // Background style helper
  const getBgClass = () => {
    switch (canvasState.background) {
      case 'dark':
        return 'bg-zinc-950';
      case 'charcoal':
        return 'bg-zinc-900';
      case 'light':
        return 'bg-zinc-50';
      case 'checkerboard':
        return 'bg-checkerboard-dark';
      default:
        return 'bg-zinc-950';
    }
  };

  if (!activeDoc) return null;

  return (
    <div
      id="svg-canvas-viewport"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      className={`relative flex-1 h-full overflow-hidden select-none transition-colors duration-150 ${getBgClass()} ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Background Grid Pattern (optional toggle) */}
      {canvasState.showGrid && (
        <div
          className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-60"
          style={{
            backgroundPosition: `${canvasState.pan.x}px ${canvasState.pan.y}px`,
            backgroundSize: `${24 * canvasState.zoom}px ${24 * canvasState.zoom}px`,
          }}
        />
      )}

      {/* Transform Container */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${canvasState.pan.x}px, ${canvasState.pan.y}px, 0) scale(${canvasState.zoom})`,
          left: '50%',
          top: '50%',
        }}
      >
        {/* Origin / Coordinate System Marker (optional toggle) */}
        {canvasState.showCoordinates && (
          <div className="absolute -left-12 -top-12 pointer-events-none z-10">
            <div className="w-24 h-[1px] bg-sky-500/40 absolute top-12 left-0" />
            <div className="h-24 w-[1px] bg-sky-500/40 absolute left-12 top-0" />
            <span className="absolute left-14 top-13 text-[9px] font-mono text-sky-400 select-none">
              (0, 0)
            </span>
          </div>
        )}

        {/* The SVG Container */}
        <div
          ref={svgWrapperRef}
          className={`relative ${canvasState.showOutlines ? 'svg-outline-mode' : ''}`}
          dangerouslySetInnerHTML={{ __html: activeDoc.sanitizedSource }}
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Non-destructive Bounding Box Overlays */}
        {canvasState.showBounds && selectedBBox && (
          <div
            className="absolute pointer-events-none border border-sky-500/90 z-20"
            style={{
              left: `calc(-50% + ${selectedBBox.x}px)`,
              top: `calc(-50% + ${selectedBBox.y}px)`,
              width: `${selectedBBox.width}px`,
              height: `${selectedBBox.height}px`,
            }}
          >
            {/* Corner Anchors */}
            <div className="w-1.5 h-1.5 bg-white border border-sky-600 absolute -top-1 -left-1" />
            <div className="w-1.5 h-1.5 bg-white border border-sky-600 absolute -top-1 -right-1" />
            <div className="w-1.5 h-1.5 bg-white border border-sky-600 absolute -bottom-1 -left-1" />
            <div className="w-1.5 h-1.5 bg-white border border-sky-600 absolute -bottom-1 -right-1" />

            {/* Dimension Tag */}
            <div className="absolute -top-5 left-0 px-1 py-0.2 bg-sky-600 text-white font-mono text-[9px] rounded-xs whitespace-nowrap opacity-90">
              {Math.round(selectedBBox.width)} x {Math.round(selectedBBox.height)}
            </div>
          </div>
        )}

        {/* Hover Bounding Box */}
        {canvasState.showBounds && hoveredBBox && !selectedBBox && (
          <div
            className="absolute pointer-events-none border border-dashed border-sky-400/60 z-10"
            style={{
              left: `calc(-50% + ${hoveredBBox.x}px)`,
              top: `calc(-50% + ${hoveredBBox.y}px)`,
              width: `${hoveredBBox.width}px`,
              height: `${hoveredBBox.height}px`,
            }}
          />
        )}
      </div>

      {/* Bottom Status Bar: Live Coordinates & Dimension Info */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 pointer-events-none">
        {canvasState.cursorPos && (
          <div className="px-2 py-0.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded shadow-xs">
            X: {canvasState.cursorPos.x} &nbsp; Y: {canvasState.cursorPos.y}
          </div>
        )}
        {activeDoc.viewBox && (
          <div className="hidden sm:block px-2 py-0.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded shadow-xs">
            ViewBox: {activeDoc.viewBox.minX} {activeDoc.viewBox.minY}{' '}
            {activeDoc.viewBox.width} {activeDoc.viewBox.height}
          </div>
        )}
      </div>
    </div>
  );
};
