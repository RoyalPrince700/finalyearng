# FinalYearNG Design System

A comprehensive design system inspired by ChatGPT, providing consistent styling and reusable components for the FinalYearNG platform.

## 🎨 Design Philosophy

- **ChatGPT-inspired**: Clean, minimal design with black primary colors
- **Consistent spacing**: 8px scale for all spacing and sizing
- **Typography-first**: Starting with 16px body text in a readable scale
- **Accessibility-focused**: High contrast ratios and clear interaction states

## 🎯 Color Palette

### Primary Colors (Black Scale)
```css
primary-50: #f9f9f9  /* Lightest gray */
primary-100: #f3f3f3
primary-200: #e8e8e8
primary-300: #d1d1d1
primary-400: #a8a8a8
primary-500: #7a7a7a
primary-600: #5c5c5c
primary-700: #404040
primary-800: #2a2a2a
primary-900: #1a1a1a  /* Darkest - primary button color */
```

### Neutral Colors (Text & Background)
```css
neutral-50: #ffffff  /* Pure white */
neutral-100: #fafafa
neutral-200: #f5f5f5
neutral-300: #f0f0f0
neutral-400: #d1d1d1
neutral-500: #9ca3af
neutral-600: #6b7280
neutral-700: #4b5563
neutral-800: #374151
neutral-900: #111827  /* Dark text */
```

### Accent Colors (Links & Highlights)
```css
accent-500: #3b82f6  /* Blue for links */
accent-600: #2563eb  /* Darker blue for hover */
```

### Status Colors
```css
success: #10b981  /* Green */
warning: #f59e0b  /* Orange */
error: #ef4444   /* Red */
```

## 📏 Spacing Scale (8px increments)

All spacing uses multiples of 8px for consistency:
- `space-1`: 4px (0.25rem)
- `space-2`: 8px (0.5rem)
- `space-3`: 12px (0.75rem)
- `space-4`: 16px (1rem)
- `space-5`: 20px (1.25rem)
- `space-6`: 24px (1.5rem)
- `space-8`: 32px (2rem)
- `space-12`: 48px (3rem)
- `space-16`: 64px (4rem)

## 📝 Typography Scale

Starting with 16px for body text:
- `text-xs`: 12px (0.75rem) - Small labels
- `text-sm`: 14px (0.875rem) - Form labels, secondary text
- `text-base`: 16px (1rem) - Body text, paragraphs
- `text-lg`: 18px (1.125rem) - Large body text
- `text-xl`: 20px (1.25rem) - Section headings
- `text-2xl`: 24px (1.5rem) - Page headings
- `text-3xl`: 30px (1.875rem) - Hero headings
- `text-4xl`: 36px (2.25rem) - Large headings

## 🔘 Button Components

### Primary Button (Black)
```jsx
<button className="btn btn-primary">
  Primary Action
</button>
```

### Secondary Button (Light Gray)
```jsx
<button className="btn btn-secondary">
  Secondary Action
</button>
```

### Ghost Button (Transparent)
```jsx
<button className="btn btn-ghost">
  Ghost Action
</button>
```

### Danger Button (Red)
```jsx
<button className="btn btn-danger">
  Delete Action
</button>
```

### Success Button (Green)
```jsx
<button className="btn btn-success">
  Success Action
</button>
```

## 📝 Form Components

### Input Field
```jsx
<input
  type="text"
  className="input"
  placeholder="Enter text..."
/>
```

### Textarea
```jsx
<textarea
  className="textarea"
  rows={4}
  placeholder="Enter longer text..."
/>
```

### Form Container
```jsx
<div className="form-container">
  <div className="form-group">
    <label className="label">Field Label</label>
    <input className="input" />
  </div>
</div>
```

## 📋 Layout Components

### Card
```jsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

### Message Bubbles (ChatGPT Style)
```jsx
{/* User message */}
<div className="message-bubble message-user">
  User message content
</div>

{/* Assistant message */}
<div className="message-bubble message-assistant">
  Assistant response content
</div>
```

## 🏷️ Status Components

### Alerts
```jsx
<div className="alert alert-error">Error message</div>
<div className="alert alert-success">Success message</div>
<div className="alert alert-warning">Warning message</div>
<div className="alert alert-info">Info message</div>
```

### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-secondary">Secondary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
```

## 👤 Avatar Components

```jsx
{/* Small avatar */}
<div className="avatar">JD</div>

{/* Large avatar */}
<div className="avatar avatar-lg">JD</div>
```

## 🧭 Navigation Components

```jsx
{/* Navigation link */}
<a href="#" className="nav-link">Dashboard</a>

{/* Active navigation link */}
<a href="#" className="nav-link nav-link-active">Dashboard</a>
```

## 📱 Responsive Design

The design system is fully responsive with mobile-first approach:

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

## 🎭 Dark Mode Support

The design system is ready for dark mode implementation. Simply add `dark:` prefixes to classes when implementing dark mode:

```jsx
<button className="btn btn-primary dark:bg-white dark:text-black">
  Dark Mode Button
</button>
```

## 🚀 Usage Guidelines

### Consistent Spacing
Always use the spacing scale:
```jsx
<div className="space-y-4"> {/* 16px vertical spacing */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Typography Hierarchy
Use semantic text sizes:
```jsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<p className="text-base">Body text content</p>
```

### Color Usage
- Use `primary-900` for primary actions and important text
- Use `neutral-700` for body text
- Use `neutral-500` for secondary/muted text
- Use accent colors sparingly for links and highlights

### Component Composition
Build complex UIs by composing components:
```jsx
<div className="card">
  <div className="flex items-center space-x-3 mb-4">
    <div className="avatar">JD</div>
    <div>
      <h3 className="text-lg font-medium">John Doe</h3>
      <p className="text-sm text-neutral-500">Student</p>
    </div>
  </div>
  <button className="btn btn-primary w-full">View Profile</button>
</div>
```

## 🔧 Customization

To customize the design system, modify the `tailwind.config.js` file:

1. **Colors**: Add new color palettes in the `colors` object
2. **Spacing**: Extend the spacing scale if needed
3. **Typography**: Add new font sizes or weights
4. **Components**: Add new component classes in `index.css`

## 📋 Migration Guide

When updating existing components:

1. Replace `bg-blue-*` with `bg-primary-*`
2. Replace `text-gray-*` with `text-neutral-*`
3. Update button classes to use new button variants
4. Use consistent spacing classes (`space-x-2`, `space-y-4`, etc.)

## 🎯 Best Practices

- Always use design system components over custom styles
- Maintain consistent spacing using the 8px scale
- Use semantic color names (`primary`, `neutral`, `accent`)
- Test components in both light and dark modes
- Ensure proper contrast ratios for accessibility
- Use responsive utilities for mobile-first design

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
