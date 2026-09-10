import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import { SvgNode } from '../../types/svg';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  ChevronsUpDown,
  ChevronsDownUp,
  Hash,
} from 'lucide-react';

export const StructureTree: React.FC = () => {
  const {
    activeDoc,
    selectedNodeId,
    hoveredNodeId,
    hiddenNodeIds,
    expandedNodeIds,
    selectNode,
    hoverNode,
    toggleNodeVisibility,
    toggleNodeExpanded,
    expandAllNodes,
    collapseAllNodes,
    isTreeCollapsed,
    treeWidth,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const selectedRowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected node into view
  useEffect(() => {
    if (selectedNodeId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedNodeId]);

  const query = searchQuery.trim().toLowerCase();

  const renderNode = (node: SvgNode) => {
    const isSelected = node.lensId === selectedNodeId;
    const isHovered = node.lensId === hoveredNodeId;
    const isHidden = hiddenNodeIds.has(node.lensId);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodeIds.has(node.lensId);

    // Search matching logic
    const matchesSearch =
      !query ||
      node.tagName.toLowerCase().includes(query) ||
      (node.id && node.id.toLowerCase().includes(query)) ||
      (node.className && node.className.toLowerCase().includes(query));

    return (
      <div key={node.lensId} className="flex flex-col">
        <div
          ref={isSelected ? selectedRowRef : undefined}
          onClick={(e) => {
            e.stopPropagation();
            selectNode(node.lensId);
          }}
          onMouseEnter={() => hoverNode(node.lensId)}
          onMouseLeave={() => hoverNode(null)}
          style={{ paddingLeft: `${node.depth * 14 + 6}px` }}
          className={`group flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer select-none transition-colors ${
            isSelected
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : isHovered
              ? 'bg-zinc-100 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
          } ${!matchesSearch && query ? 'opacity-30' : ''}`}
        >
          {/* Left: Expand toggle, Tag, ID */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpanded(node.lensId);
                }}
                className="p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-500 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={12} strokeWidth={1.5} />
                ) : (
                  <ChevronRight size={12} strokeWidth={1.5} />
                )}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            {/* Tag badge */}
            <span className="font-mono text-[11px] px-1 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 shrink-0">
              {node.tagName}
            </span>

            {/* ID or Class name */}
            {node.id && (
              <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 truncate flex items-center gap-0.5">
                <Hash size={9} strokeWidth={1.5} className="shrink-0 opacity-70" />
                <span className="truncate">{node.id}</span>
              </span>
            )}
            {!node.id && node.className && (
              <span className="font-mono text-[10px] text-zinc-500 truncate">
                .{node.className}
              </span>
            )}
          </div>

          {/* Right: Child count & Visibility Toggle */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {hasChildren && (
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                {node.children.length}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeVisibility(node.lensId);
              }}
              className={`p-1 rounded transition-colors ${
                isHidden
                  ? 'text-red-500 opacity-100'
                  : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title={isHidden ? 'Show element' : 'Hide element'}
            >
              {isHidden ? (
                <EyeOff size={12} strokeWidth={1.5} />
              ) : (
                <Eye size={12} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Children (if expanded) */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (isTreeCollapsed || !activeDoc) return null;

  return (
    <aside
      style={{ width: `${treeWidth}px` }}
      className="h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 select-none z-10"
    >
      {/* Top Tree Header */}
      <div className="h-9 px-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Structure
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAllNodes}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Expand All"
          >
            <ChevronsUpDown size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={collapseAllNodes}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Collapse to Root"
          >
            <ChevronsDownUp size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="relative flex items-center">
          <Search
            size={12}
            strokeWidth={1.5}
            className="absolute left-2.5 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Filter elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-1.5 no-scrollbar">
        {renderNode(activeDoc.rootNode)}
      </div>
    </aside>
  );
};
