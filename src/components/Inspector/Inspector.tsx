import React, { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { extractElementMetrics, COMMAND_NAMES } from '../../core/geometry';
import { Copy, Check } from 'lucide-react';

export const Inspector: React.FC = () => {
  const {
    activeDoc,
    selectedNodeId,
    selectNode,
    isInspectorCollapsed,
    inspectorWidth,
  } = useApp();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (isInspectorCollapsed || !activeDoc) return null;

  const selectedNode = selectedNodeId ? activeDoc.nodeMap[selectedNodeId] : null;

  // If node is selected, find the DOM element to extract live bounding box and path length
  let metrics = null;
  if (selectedNode) {
    const liveEl = document.querySelector(`[data-lens-id="${selectedNode.lensId}"]`);
    metrics = extractElementMetrics(liveEl, selectedNode.attributes);
  }

  return (
    <aside
      style={{ width: `${inspectorWidth}px` }}
      className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 select-none overflow-y-auto no-scrollbar z-10"
    >
      {/* Inspector Header */}
      <div className="h-9 px-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {selectedNode ? 'Inspector' : 'Document Info'}
        </span>
        {selectedNode && (
          <button
            onClick={() => selectNode(null)}
            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Deselect
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3 flex flex-col gap-4 text-xs">
        {selectedNode ? (
          /* =========================================================================
             ELEMENT INSPECTOR
             ========================================================================= */
          <>
            {/* ELEMENT TAG HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-0.5">
                  Element
                </span>
                <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  &lt;{selectedNode.tagName}&gt;
                </span>
              </div>
              <button
                onClick={() => {
                  const liveEl = document.querySelector(
                    `[data-lens-id="${selectedNode.lensId}"]`
                  );
                  if (liveEl) {
                    const clone = liveEl.cloneNode(true) as Element;
                    clone.removeAttribute('data-lens-id');
                    clone.removeAttribute('data-lens-selected');
                    clone.removeAttribute('data-lens-hovered');
                    copyToClipboard(clone.outerHTML, 'element-html');
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded transition-colors text-[11px]"
                title="Copy Element SVG Markup"
              >
                {copiedKey === 'element-html' ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} strokeWidth={1.5} />
                )}
                <span>Copy SVG</span>
              </button>
            </div>

            {/* IDENTITY */}
            {(selectedNode.id || selectedNode.className) && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Identity
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 font-mono text-[11px]">
                  {selectedNode.id && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sky-600 dark:text-sky-400">
                          {selectedNode.id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedNode.id!, 'id')}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          {copiedKey === 'id' ? (
                            <Check size={11} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedNode.className && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Class</span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {selectedNode.className}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                Appearance
              </span>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 font-mono text-[11px]">
                {/* Fill */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Fill</span>
                  <div className="flex items-center gap-1.5">
                    {selectedNode.attributes['fill'] &&
                      selectedNode.attributes['fill'] !== 'none' && (
                        <div
                          className="w-3 h-3 rounded-xs border border-zinc-300 dark:border-zinc-700 shrink-0"
                          style={{ backgroundColor: selectedNode.attributes['fill'] }}
                        />
                      )}
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['fill'] || 'default'}
                    </span>
                    {selectedNode.attributes['fill'] && (
                      <button
                        onClick={() =>
                          copyToClipboard(selectedNode.attributes['fill'], 'fill')
                        }
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-0.5"
                      >
                        {copiedKey === 'fill' ? (
                          <Check size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} strokeWidth={1.5} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stroke */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Stroke</span>
                  <div className="flex items-center gap-1.5">
                    {selectedNode.attributes['stroke'] &&
                      selectedNode.attributes['stroke'] !== 'none' && (
                        <div
                          className="w-3 h-3 rounded-xs border border-zinc-300 dark:border-zinc-700 shrink-0"
                          style={{ backgroundColor: selectedNode.attributes['stroke'] }}
                        />
                      )}
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['stroke'] || 'none'}
                    </span>
                  </div>
                </div>

                {/* Stroke Width */}
                {selectedNode.attributes['stroke-width'] && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Stroke Width</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['stroke-width']}
                    </span>
                  </div>
                )}

                {/* Opacity */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Opacity</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {selectedNode.attributes['opacity'] || '1'}
                  </span>
                </div>
              </div>
            </div>

            {/* GEOMETRY (BOUNDING BOX) */}
            {metrics?.bbox && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Geometry
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">X</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {metrics.bbox.x}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Y</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {metrics.bbox.y}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Width</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {metrics.bbox.width}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Height</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {metrics.bbox.height}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAG-SPECIFIC GEOMETRY */}
            {selectedNode.tagName === 'circle' && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Circle Properties
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CX</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['cx'] || '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CY</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['cy'] || '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Radius (R)</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {selectedNode.attributes['r'] || '0'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PATH METRICS */}
            {selectedNode.tagName === 'path' && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Path Metrics
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 font-mono text-[11px]">
                  {metrics?.pathLength !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Total Length</span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {metrics.pathLength} px
                      </span>
                    </div>
                  )}
                  {metrics?.pathCommandsCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Commands</span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {metrics.pathCommandsCount}
                      </span>
                    </div>
                  )}
                  {metrics?.pathCommandsBreakdown && (
                    <div className="mt-1 pt-1.5 border-t border-zinc-200 dark:border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 block mb-1">
                        Commands Breakdown
                      </span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        {Object.entries(metrics.pathCommandsBreakdown).map(
                          ([cmd, count]) => (
                            <div key={cmd} className="flex justify-between">
                              <span className="text-zinc-500">
                                {cmd} ({COMMAND_NAMES[cmd] || cmd})
                              </span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                                {count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TRANSFORM */}
            {selectedNode.attributes['transform'] && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Transform
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 break-all">
                  {selectedNode.attributes['transform']}
                </div>
              </div>
            )}

            {/* RAW ATTRIBUTES TABLE */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                All Attributes ({Object.keys(selectedNode.attributes).length})
              </span>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[11px] overflow-hidden">
                {Object.entries(selectedNode.attributes).map(([attr, val]) => (
                  <div
                    key={attr}
                    className="p-1.5 flex items-start justify-between gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <span className="text-zinc-500 shrink-0 select-text">{attr}</span>
                    <span
                      className="text-zinc-800 dark:text-zinc-200 truncate select-text text-right"
                      title={val}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* =========================================================================
             DOCUMENT OVERVIEW (when nothing selected)
             ========================================================================= */
          <>
            {/* FILE INFO */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                Document
              </span>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2.5 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">File Name</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[170px]">
                    {activeDoc.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">File Size</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {(activeDoc.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Dimensions</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {activeDoc.dimensions.width} x {activeDoc.dimensions.height}
                  </span>
                </div>
                {activeDoc.viewBox && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">ViewBox</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {activeDoc.viewBox.minX} {activeDoc.viewBox.minY}{' '}
                      {activeDoc.viewBox.width} {activeDoc.viewBox.height}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ELEMENT STATISTICS BREAKDOWN */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                Elements ({activeDoc.stats.totalElements})
              </span>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px]">
                {Object.entries(activeDoc.stats.tagCounts).map(([tag, count]) => (
                  <div key={tag} className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-500">&lt;{tag}&gt;</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLOR PALETTE */}
            {activeDoc.stats.colorPalette.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  Color Palette ({activeDoc.stats.colorPalette.length})
                </span>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded p-2 border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5">
                  {activeDoc.stats.colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => copyToClipboard(color, color)}
                      className="group flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                      title={`Click to copy: ${color}`}
                    >
                      <div
                        className="w-3 h-3 rounded-xs border border-zinc-300 dark:border-zinc-600 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 uppercase">
                        {color}
                      </span>
                      {copiedKey === color ? (
                        <Check size={10} className="text-emerald-500" />
                      ) : (
                        <Copy
                          size={10}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
