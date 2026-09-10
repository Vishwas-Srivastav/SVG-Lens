import { SvgDocument, SvgNode, SvgDocumentStats } from '../types/svg';
import { sanitizeSvgXml } from './sanitizer';

let idCounter = 0;

export function parseSvgContent(
  rawContent: string,
  fileName = 'artwork.svg'
): { doc?: SvgDocument; error?: string } {
  const sanitized = sanitizeSvgXml(rawContent);
  if (sanitized.error || !sanitized.cleanXml) {
    return { error: sanitized.error || 'Invalid SVG content.' };
  }

  // Parse again to assign lens-ids and collect tree structure
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(sanitized.cleanXml, 'image/svg+xml');
  const svgEl = xmlDoc.querySelector('svg');

  if (!svgEl) {
    return { error: 'No <svg> root element found.' };
  }

  idCounter = 0;
  const nodeMap: Record<string, SvgNode> = {};
  const tagCounts: Record<string, number> = {};
  const colorsSet = new Set<string>();

  const rootNode = traverseAndBuildNode(
    svgEl,
    null,
    0,
    nodeMap,
    tagCounts,
    colorsSet
  );

  // Parse viewBox
  const viewBoxAttr = svgEl.getAttribute('viewBox');
  let viewBox: { minX: number; minY: number; width: number; height: number } | null = null;
  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      viewBox = { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
    }
  }

  const widthAttr = svgEl.getAttribute('width') || (viewBox ? String(viewBox.width) : '100%');
  const heightAttr = svgEl.getAttribute('height') || (viewBox ? String(viewBox.height) : '100%');

  // Serialize the DOM with data-lens-id attributes included
  const serializer = new XMLSerializer();
  const serializedWithIds = serializer.serializeToString(svgEl);

  // Format clean XML for source viewer and calculate line ranges
  const { formattedSource, lineMap } = formatXmlAndMapLines(sanitized.cleanXml);

  // Associate line ranges to nodes
  for (const lensId in nodeMap) {
    const node = nodeMap[lensId];
    const range = lineMap.get(lensId);
    if (range) {
      node.sourceLineStart = range.start;
      node.sourceLineEnd = range.end;
    }
  }

  const stats: SvgDocumentStats = {
    totalElements: Object.keys(nodeMap).length,
    tagCounts,
    pathCount: tagCounts['path'] || 0,
    groupCount: tagCounts['g'] || 0,
    textCount: tagCounts['text'] || 0,
    imageCount: tagCounts['image'] || 0,
    defsCount: tagCounts['defs'] || 0,
    colorPalette: Array.from(colorsSet).slice(0, 24),
  };

  const document: SvgDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: fileName,
    sizeBytes: new Blob([rawContent]).size,
    rawSource: formattedSource,
    sanitizedSource: serializedWithIds,
    rootNode,
    nodeMap,
    viewBox,
    dimensions: {
      width: widthAttr,
      height: heightAttr,
    },
    stats,
  };

  return { doc: document };
}

function traverseAndBuildNode(
  el: Element,
  parentId: string | null,
  depth: number,
  nodeMap: Record<string, SvgNode>,
  tagCounts: Record<string, number>,
  colorsSet: Set<string>
): SvgNode {
  const lensId = `lens-${idCounter++}`;
  el.setAttribute('data-lens-id', lensId);

  const tagName = el.tagName.toLowerCase();
  tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;

  const attributes: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name === 'data-lens-id') continue;
    attributes[attr.name] = attr.value;

    // Collect colors
    if (
      ['fill', 'stroke', 'stop-color', 'flood-color'].includes(attr.name) &&
      isValidColor(attr.value)
    ) {
      colorsSet.add(normalizeColor(attr.value));
    }
  }

  const node: SvgNode = {
    lensId,
    tagName,
    id: el.getAttribute('id') || undefined,
    className: el.getAttribute('class') || undefined,
    attributes,
    children: [],
    parentId,
    depth,
    isVisible: true,
    textContent:
      tagName === 'text' || tagName === 'tspan'
        ? el.textContent?.trim() || undefined
        : undefined,
  };

  nodeMap[lensId] = node;

  for (const child of Array.from(el.children)) {
    // Only index SVG element children
    if (child instanceof Element) {
      const childNode = traverseAndBuildNode(
        child,
        lensId,
        depth + 1,
        nodeMap,
        tagCounts,
        colorsSet
      );
      node.children.push(childNode);
    }
  }

  return node;
}

function isValidColor(val: string): boolean {
  val = val.trim();
  if (['none', 'transparent', 'inherit', 'currentColor'].includes(val)) {
    return false;
  }
  if (val.startsWith('url(')) {
    return false;
  }
  return true;
}

function normalizeColor(val: string): string {
  val = val.trim().toLowerCase();
  if (/^#[0-9a-f]{3,8}$/i.test(val)) {
    return val.toUpperCase();
  }
  return val;
}

/**
 * Cleanly formats XML with indentation and calculates line ranges for elements.
 */
function formatXmlAndMapLines(xmlString: string): {
  formattedSource: string;
  lineMap: Map<string, { start: number; end: number }>;
} {
  const lineMap = new Map<string, { start: number; end: number }>();
  let formatted = '';
  let indentLevel = 0;
  const indentStr = '  ';

  // Tokenize XML tags and text
  const tokens = xmlString.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) || [];
  const lines: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('</')) {
      // Closing tag
      indentLevel = Math.max(0, indentLevel - 1);
      lines.push(`${indentStr.repeat(indentLevel)}${token}`);
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      lines.push(`${indentStr.repeat(indentLevel)}${token}`);
    } else if (token.startsWith('<?') || token.startsWith('<!')) {
      lines.push(token);
    } else if (token.startsWith('<')) {
      // Opening tag
      lines.push(`${indentStr.repeat(indentLevel)}${token}`);
      indentLevel++;
    } else {
      // Text node
      const text = token.trim();
      if (text) {
        lines.push(`${indentStr.repeat(indentLevel)}${text}`);
      }
    }
  }

  formatted = lines.join('\n');
  return { formattedSource: formatted, lineMap };
}
