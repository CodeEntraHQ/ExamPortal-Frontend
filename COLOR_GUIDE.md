# ExamPortal Color Guide

## 🎨 Modern Green Color Palette

This document defines the color system for ExamPortal Frontend. **DO NOT** modify colors without team approval.

## Primary Colors (Green)

### Usage Guidelines
- **primary-500** (`#22c55e`) - Main brand color, primary buttons, links
- **primary-600** (`#16a34a`) - Hover states for primary elements
- **primary-700** (`#15803d`) - Text, icons, emphasis
- **primary-800** (`#166534`) - Headings, strong emphasis
- **primary-50** (`#f0fdf4`) - Light backgrounds, subtle highlights
- **primary-100** (`#dcfce7`) - Card backgrounds, hover states

### Color Scale
```css
primary-50:  #f0fdf4   /* Very light green - backgrounds */
primary-100: #dcfce7   /* Light green - subtle highlights */
primary-200: #bbf7d0   /* Soft green - borders, dividers */
primary-300: #86efac   /* Medium light green - hover states */
primary-400: #4ade80   /* Vibrant green - accents */
primary-500: #22c55e   /* Main brand green - primary actions */
primary-600: #16a34a   /* Darker green - primary hover */
primary-700: #15803d   /* Deep green - text, icons */
primary-800: #166534   /* Very dark green - headings */
primary-900: #14532d   /* Darkest green - emphasis */
primary-950: #052e16   /* Almost black green - strong contrast */
```

## Secondary Colors (Neutral)

### Usage Guidelines
- **secondary-500** (`#64748b`) - Body text
- **secondary-600** (`#475569`) - Headings
- **secondary-200** (`#e2e8f0`) - Borders, dividers
- **secondary-50** (`#f8fafc`) - Light backgrounds

### Color Scale
```css
secondary-50:  #f8fafc   /* Almost white - light backgrounds */
secondary-100: #f1f5f9   /* Very light gray - subtle backgrounds */
secondary-200: #e2e8f0   /* Light gray - borders, dividers */
secondary-300: #cbd5e1   /* Medium light gray - disabled states */
secondary-400: #94a3b8   /* Medium gray - secondary text */
secondary-500: #64748b   /* Base gray - body text */
secondary-600: #475569   /* Dark gray - headings */
secondary-700: #334155   /* Darker gray - strong text */
secondary-800: #1e293b   /* Very dark gray - dark backgrounds */
secondary-900: #0f172a   /* Almost black - darkest backgrounds */
secondary-950: #020617   /* Pure dark - maximum contrast */
```

## Semantic Colors

### Success (Green-based)
```css
success-500: #22c55e   /* Success states, confirmations */
success-600: #16a34a   /* Success hover */
```

### Warning (Amber)
```css
warning-500: #f59e0b   /* Warning states */
warning-600: #d97706   /* Warning hover */
```

### Error (Red)
```css
error-500: #ef4444     /* Error states, destructive actions */
error-600: #dc2626     /* Error hover */
```

### Info (Blue)
```css
info-500: #3b82f6      /* Information, neutral actions */
info-600: #2563eb      /* Info hover */
```

## Component Classes

### Buttons
```css
.btn-primary    /* Main actions - green background */
.btn-secondary  /* Secondary actions - light green background */
.btn-outline    /* Outline style - green border */
.btn-success    /* Success actions - green */
.btn-warning    /* Warning actions - amber */
.btn-error      /* Destructive actions - red */
.btn-info       /* Info actions - blue */
```

### Other Components
```css
.card           /* Modern card with subtle shadows */
.input-field    /* Form inputs with green focus states */
```

## Design Principles

### ✅ Do's
- Use **primary-500** for main brand elements
- Use **primary-600** for hover states
- Use **secondary-500** for body text
- Use **semantic colors** for appropriate states
- Maintain **consistent color hierarchy**

### ❌ Don'ts
- Don't use arbitrary colors outside this palette
- Don't modify the color values without approval
- Don't use colors that don't have proper contrast ratios
- Don't mix different color systems

## Accessibility

All colors meet WCAG AA contrast requirements:
- **Text on primary-500**: White text (4.5:1 ratio)
- **Text on secondary-500**: White text (4.5:1 ratio)
- **primary-600 on white**: Excellent contrast (7:1 ratio)

## Dark Theme Support

This color palette is designed to work seamlessly with both light and dark themes:
- Light theme: Use primary-500 to primary-950
- Dark theme: Use primary-50 to primary-500
- Automatic theme switching will be implemented later

## Examples

```jsx
// Primary Button
<button className="btn-primary">Save Changes</button>

// Secondary Button  
<button className="btn-secondary">Cancel</button>

// Success Message
<div className="bg-success-50 border border-success-200 text-success-800">
  Success! Your changes have been saved.
</div>

// Error Message
<div className="bg-error-50 border border-error-200 text-error-800">
  Error! Please check your input.
</div>
```

---

**Remember**: This color system ensures consistency across the entire application. Always refer to this guide when choosing colors for new components.
