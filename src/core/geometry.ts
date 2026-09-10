import { BoundingBox, ElementMetrics } from '../types/svg';

export function getElementBoundingBox(svgElement: SVGGraphicsElement): BoundingBox | undefined {
  try {
    if (typeof svgElement.getBBox === 'function') {
      const bbox = svgElement.getBBox();
      return {
        x: Math.round(bbox.x * 100) / 100,
        y: Math.round(bbox.y * 100) / 100,
        width: Math.round(bbox.width * 100) / 100,
        height: Math.round(bbox.height * 100) / 100,
      };
    }
  } catch {
    // getBBox can throw if element is not rendered (e.g. in defs or display:none)
  }
  return undefined;
}

export function parsePathMetrics(pathEl: SVGPathElement, dAttr?: string): {
  pathLength?: number;
  pathCommandsCount: number;
  pathCommandsBreakdown: Record<string, number>;
} {
  let pathLength: number | undefined;
  try {
    if (typeof pathEl.getTotalLength === 'function') {
      pathLength = Math.round(pathEl.getTotalLength() * 100) / 100;
    }
  } catch {
    // If not connected to DOM or empty path
  }

  const breakdown: Record<string, number> = {};
  let totalCommands = 0;

  if (dAttr) {
    const commandMatches = dAttr.match(/[a-df-z]/gi) || [];
    totalCommands = commandMatches.length;
    for (const cmd of commandMatches) {
      const upper = cmd.toUpperCase();
      breakdown[upper] = (breakdown[upper] || 0) + 1;
    }
  }

  return {
    pathLength,
    pathCommandsCount: totalCommands,
    pathCommandsBreakdown: breakdown,
  };
}

export function extractElementMetrics(
  el: Element | null,
  attributes: Record<string, string>
): ElementMetrics {
  if (!el) return {};

  const metrics: ElementMetrics = {};

  if (el instanceof SVGGraphicsElement) {
    metrics.bbox = getElementBoundingBox(el);
  }

  if (el.tagName.toLowerCase() === 'path' && el instanceof SVGPathElement) {
    const pathInfo = parsePathMetrics(el, attributes['d']);
    metrics.pathLength = pathInfo.pathLength;
    metrics.pathCommandsCount = pathInfo.pathCommandsCount;
    metrics.pathCommandsBreakdown = pathInfo.pathCommandsBreakdown;
  }

  if (attributes['transform']) {
    metrics.transform = attributes['transform'];
  }

  return metrics;
}

export const COMMAND_NAMES: Record<string, string> = {
  M: 'MoveTo',
  L: 'LineTo',
  H: 'Horizontal Line',
  V: 'Vertical Line',
  C: 'Cubic Bézier',
  S: 'Smooth Cubic Bézier',
  Q: 'Quadratic Bézier',
  T: 'Smooth Quadratic Bézier',
  A: 'Elliptical Arc',
  Z: 'Close Path',
};
