// Small color utilities shared by the invitation template & CMS preview.
// They keep text readable on any theme by reasoning about contrast.

export function hexToRgb(hex) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const int = parseInt(h, 16);
  if (Number.isNaN(int) || h.length !== 6) return { r: 15, g: 23, b: 42 };
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// WCAG relative luminance (0 = black, 1 = white)
export function relLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// Contrast ratio between two colors (1 = identical, 21 = black vs white)
export function contrastRatio(a, b) {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// Best black/white text color for a solid background
export function contrastOn(bg) {
  return contrastRatio(bg, "#ffffff") >= contrastRatio(bg, "#0f172a") ? "#ffffff" : "#0f172a";
}

// Use the accent color for a highlight when it stands out enough against the
// surface; otherwise fall back to the regular text color so it stays readable.
export function pickHighlight(accent, surface, text) {
  return contrastRatio(accent, surface) >= 2.2 ? accent : text;
}
