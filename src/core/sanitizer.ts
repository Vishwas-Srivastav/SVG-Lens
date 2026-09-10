/**
 * Security sanitizer for SVG XML content.
 * Prevents XSS, script execution, and untrusted external resource access
 * while fully preserving all valid visual SVG markup.
 */

const FORBIDDEN_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'meta',
  'link',
  'base',
]);

const DANGEROUS_URI_SCHEMES = /^(javascript|vbscript|data:text\/html):/i;

export function sanitizeSvgXml(rawSvgString: string): {
  cleanXml: string;
  doc: XMLDocument;
  error?: string;
} {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(rawSvgString, 'image/svg+xml');

  // Check for XML parsing error element
  const parserError = parsedDoc.querySelector('parsererror');
  if (parserError) {
    return {
      cleanXml: '',
      doc: parsedDoc,
      error: parserError.textContent || 'Failed to parse SVG markup as valid XML.',
    };
  }

  const svgElement = parsedDoc.querySelector('svg');
  if (!svgElement) {
    return {
      cleanXml: '',
      doc: parsedDoc,
      error: 'Root element is not an <svg> tag.',
    };
  }

  // Recursive sanitization of all nodes
  sanitizeNode(svgElement);

  const serializer = new XMLSerializer();
  const cleanXml = serializer.serializeToString(svgElement);

  return {
    cleanXml,
    doc: parsedDoc,
  };
}

function sanitizeNode(element: Element): void {
  // Check and remove forbidden tags
  const children = Array.from(element.children);
  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    if (FORBIDDEN_TAGS.has(tagName)) {
      child.remove();
      continue;
    }

    // Sanitize child recursively
    sanitizeNode(child);
  }

  // Sanitize attributes
  const attributes = Array.from(element.attributes);
  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase();
    const attrVal = attr.value.trim();

    // 1. Strip all event handlers (e.g. onclick, onload, onerror)
    if (attrName.startsWith('on')) {
      element.removeAttribute(attr.name);
      continue;
    }

    // 2. Disallow dangerous URI schemes in href / xlink:href / src
    if (attrName === 'href' || attrName === 'xlink:href' || attrName === 'src') {
      if (DANGEROUS_URI_SCHEMES.test(attrVal)) {
        element.removeAttribute(attr.name);
        continue;
      }
    }

    // 3. Sanitize inline style attributes against CSS expressions or javascript:
    if (attrName === 'style') {
      const sanitizedStyle = attrVal
        .replace(/expression\s*\([^)]*\)/gi, '')
        .replace(/url\s*\(\s*["']?javascript:[^)]*["']?\)/gi, '');
      if (sanitizedStyle !== attrVal) {
        element.setAttribute(attr.name, sanitizedStyle);
      }
    }
  }
}
