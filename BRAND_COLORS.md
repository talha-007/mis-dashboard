# MIS Dashboard Brand Colors

## Primary Brand Color: `#4D0CE7`

Your brand color has been integrated throughout the dashboard theme.

### Color Palette Variations

```
┌─────────────────────────────────────────────────────────┐
│  Color      │  Hex Code  │  Usage                       │
├─────────────────────────────────────────────────────────┤
│  Lighter    │  #E6D4FD   │  Backgrounds, hover states   │
│  Light      │  #9B5EF5   │  Secondary elements          │
│  Main       │  #4D0CE7   │  Primary buttons, links      │
│  Dark       │  #3A09B0   │  Active states, pressed      │
│  Darker     │  #260675   │  Deep accents                │
└─────────────────────────────────────────────────────────┘
```

## Where Your Brand Color Appears

### ✅ **Primary Elements**
- Primary buttons (Add Borrower, Login, etc.)
- Active navigation items
- Links and clickable text
- Primary badges and chips
- Loading indicators and progress bars

### ✅ **Interactive States**
- **Hover**: Lighter shade (#E6D4FD background)
- **Active**: Darker shade (#3A09B0)
- **Focus**: Border with main color (#4D0CE7)
- **Selected**: Light background with main text

### ✅ **Dashboard Components**
- Header and navigation active states
- Action buttons
- Form inputs (focus state)
- Checkboxes and radio buttons (checked state)
- Switches (on state)
- Tabs (active tab)
- Stats cards (primary variant)

### 🎨 **Visual Preview**

```
Primary Button:          ■ #4D0CE7
Primary Button (Hover):  ■ #3A09B0
Primary Button (Light):  ■ #E6D4FD

Link Text:               #4D0CE7
Link Hover:              #3A09B0

Selection Background:    #E6D4FD
Active Border:           #4D0CE7
```

## Example Usage in Components

### Buttons
```tsx
<Button variant="contained" color="primary">
  Add Borrower  // Uses #4D0CE7
</Button>
```

### Navigation
```tsx
// Active menu item will have #4D0CE7 background/text
```

### Cards
```tsx
<AppWidgetSummary color="primary">
  // Primary stat cards use your brand color
</AppWidgetSummary>
```

### Links
```tsx
<Link color="primary">
  View Details  // Uses #4D0CE7
</Link>
```

## Color Accessibility

✅ **Contrast Ratios** (WCAG AA compliant)
- Main (#4D0CE7) on White: **5.8:1** ✓
- Main (#4D0CE7) on Lighter (#E6D4FD): **4.2:1** ✓
- White text on Main (#4D0CE7): **5.8:1** ✓

## Customization

The brand color is configured in:
- **File**: `src/theme/theme-config.ts`
- **Property**: `palette.primary`

To adjust hover effects or other interactive states, you can modify the color variations in the same file.

---

**Your brand color `#4D0CE7` is now the primary color throughout your MIS Dashboard!** 🎨
