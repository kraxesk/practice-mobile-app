/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#172033',
    tint: '#FFB547',

    // Core surfaces
    background: '#F7F4EE',
    foreground: '#172033',

    // Cards / elevated surfaces
    card: '#FFFDF8',
    cardForeground: '#172033',

    // Primary action color (buttons, links, active states)
    primary: '#172033',
    primaryForeground: '#FFFDF8',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#ECE8DE',
    secondaryForeground: '#172033',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#ECE8DE',
    mutedForeground: '#788091',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFB547',
    accentForeground: '#172033',

    // Destructive actions (delete, error states)
    destructive: '#D95C54',
    destructiveForeground: '#FFFDF8',

    // Borders and input outlines
    border: '#DED8CA',
    input: '#DED8CA',
    amber: '#FFB547',
    coral: '#FF6F61',
    sage: '#9FB8A3',
    navy: '#172033',
    overlay: 'rgba(23, 32, 51, 0.42)',
  },

  dark: {
    text: '#F7F4EE',
    tint: '#FFB547',
    background: '#111827',
    foreground: '#F7F4EE',
    card: '#1B2639',
    cardForeground: '#F7F4EE',
    primary: '#FFB547',
    primaryForeground: '#172033',
    secondary: '#263247',
    secondaryForeground: '#F7F4EE',
    muted: '#263247',
    mutedForeground: '#AEB7C6',
    accent: '#FFB547',
    accentForeground: '#172033',
    destructive: '#E87970',
    destructiveForeground: '#111827',
    border: '#354158',
    input: '#354158',
    amber: '#FFB547',
    coral: '#FF6F61',
    sage: '#9FB8A3',
    navy: '#F7F4EE',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
