# Mobile-Responsive Overview App - Implementation Overview

## Project Context

The Endaoment Overview App is an internal dashboard for viewing program statistics, fund data, donations, grants, and
payouts. Currently optimized for desktop with a fixed sidebar navigation, it needs to be fully mobile-responsive while
maintaining all functionality.

## Goals

1. **Mobile-First Responsive Design**: Support screens from 320px to 2560px+
2. **Touch-Friendly Interactions**: Minimum 44x44px touch targets, appropriate spacing
3. **Performance**: Maintain fast load times, optimize charts and images for mobile
4. **Consistent UX**: Same functionality across all screen sizes with appropriate adaptations
5. **Visual Consistency**: Maintain design language and branding across breakpoints

## Technical Stack

- **Framework**: Next.js 14+ (React 18+)
- **Styling**: Tailwind CSS with custom dark mode support
- **Charts**: ApexCharts (with react-apexcharts)
- **Maps**: react-map-gl with Mapbox GL
- **Icons**: lucide-react

## Design System Standards

### Breakpoints (Tailwind)

```css
sm:  640px  /* Small tablets, large phones */
md:  768px  /* Tablets */
lg:  1024px /* Small laptops */
xl:  1280px /* Desktops */
2xl: 1536px /* Large desktops */
```

### Mobile-First Approach

- Start with mobile layout (320px minimum width)
- Add complexity and features at larger breakpoints
- Use `min-width` media queries (Tailwind default)
- Test at: 320px, 375px, 768px, 1024px, 1440px

### Color System

```css
/* Light Mode */
Background: slate-50 to slate-100 (gradient)
Cards: white with slate-100 headers
Text: slate-800 (primary), slate-600 (secondary)
Borders: slate-200

/* Dark Mode */
Background: slate-900 to slate-800 (gradient)
Cards: slate-800 with slate-800 headers
Text: slate-100 (primary), slate-300 (secondary)
Borders: slate-700

/* Accent Colors */
Primary: indigo-600
Secondary: purple-600
Success: green-500/emerald-500
Warning: amber-500
Error: red-500
```

### Glass Morphism (Navigation)

```css
bg-white/80 dark:bg-slate-900/80
backdrop-blur-sm
border-slate-200/50 dark:border-slate-700/50
transition-colors duration-300
```

### Typography

- **Primary Font (Headings)**: GT Haptik (font-title)
- **Body Font**: System fonts (font-body)
- **Font Scales**: Use Tailwind's type scale (text-sm to text-5xl)

### Spacing

- **Touch Targets**: Minimum 44x44px
- **Card Padding**: `p-4` mobile, `p-6` desktop
- **Grid Gaps**: `gap-4` mobile, `gap-6` desktop, `gap-8` large desktop
- **Section Spacing**: `mb-6` mobile, `mb-8` desktop

### Component Patterns

#### Cards

```tsx
<Card className='overflow-hidden shadow-lg'>
  <CardHeader className='bg-slate-100 dark:bg-slate-800'>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className='p-4 md:p-6'>{/* Content */}</CardContent>
</Card>
```

#### Metric Cards

- **Grid considerations**:
  - Default: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
  - Exception: If metrics have NO change/performance indicators AND there are 2+ consecutive metrics without them, can
    use `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
  - Metrics WITH change indicators need more space on mobile → single column
- Auto-format currency (compact on mobile if needed)
- Show change indicators with color coding

#### Charts

- **Use aspect-square for full-width charts**: `w-full aspect-square` instead of fixed heights
- **Remove width constraints from chart options**: ApexCharts responsive config should NOT include
  `chart: { width: 200 }`
- Legend position: bottom on mobile (via responsive options)
- Font sizes: Scale down legend on mobile (fontSize: '12px')
- Chart height prop: Use `height='100%'` to fill container

#### Tables

- Horizontal scroll wrapper on mobile
- Sticky headers
- Minimum column widths
- Consider card view alternative for very narrow screens

### Z-Index Scale

```css
z-0:   Base content
z-10:  Elevated cards
z-40:  Modal overlays
z-50:  Navigation/Header (sticky)
z-[60]: Mobile menu
z-[999]: Tooltips
z-[1000-1001]: Map popups
```

## File Structure

```
apps/overview/src/
├── components/
│   ├── tabs/
│   │   └── OverviewTab.tsx          # Main tab with sidebar + sections
│   └── ui/
│       ├── DashboardLayout.tsx       # Header with logo, status, theme
│       ├── TotalPlatformValueHero.tsx
│       ├── MetricCard.tsx
│       ├── Card.tsx
│       ├── Table.tsx
│       ├── PayoutZipBubbleMap.tsx
│       └── stats/
│           ├── ProgramOverviewSection.tsx
│           ├── OpenFundsSection.tsx
│           ├── PortfoliosSection.tsx
│           ├── DonationsSection.tsx
│           ├── GrantsSection.tsx
│           ├── PayoutsSection.tsx
│           └── PaginatedAssetChart.tsx
├── providers/
│   ├── GBQDataProvider.tsx
│   └── ThemeProvider.tsx
└── utils/
    └── chartOptions.ts
```

## Key Components to Modify

### Navigation System

- **DashboardLayout.tsx**: Header with logo, status indicators, theme toggle
- **OverviewTab.tsx**: Fixed sidebar (desktop) → Hamburger menu (mobile)

### Layout Components

- **OverviewTab.tsx**: Main layout with sidebar + content area
- All section components need responsive grid adjustments

### Data Display

- **MetricCard.tsx**: Already has responsive value formatting
- **Card.tsx**: May need padding adjustments
- **Table.tsx**: Needs horizontal scroll wrapper
- **PaginatedAssetChart.tsx**: Chart sizing adjustments

### Interactive Components

- **PayoutZipBubbleMap.tsx**: Responsive height, touch interactions, popup sizing
- All charts: Legend positioning, font sizes, label management

## Implementation Strategy

### Phase 1: Foundation (Sub-Plans 1-2)

Establish core responsive patterns and high-impact hero section

### Phase 2: Data Sections (Sub-Plans 3-7)

Systematically make each major section mobile-friendly

### Phase 3: Polish (Sub-Plan 8)

Refine shared components and final adjustments

## Testing Checklist

For each sub-plan, verify:

- [ ] Works at 320px, 375px, 768px, 1024px, 1440px
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll (except intentional table scrolls)
- [ ] Charts render correctly and are readable
- [ ] Dark mode works properly
- [ ] Transitions are smooth
- [ ] All interactive elements accessible via touch
- [ ] Text remains readable (not too small)
- [ ] Images/logos scale appropriately
- [ ] Navigation works seamlessly

## Common Patterns

### Responsive Grid Pattern

```tsx
// 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
```

### Responsive Padding

```tsx
<div className="p-4 md:p-6 lg:p-8">
```

### Responsive Text

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

### Hide/Show at Breakpoints

```tsx
<div className="hidden md:block"> {/* Desktop only */}
<div className="md:hidden"> {/* Mobile only */}
```

### Responsive Flex

```tsx
<div className="flex flex-col md:flex-row gap-4">
```

### Skeleton Loading States

```tsx
// Always match the responsive grid of the real component
<div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
  <SkeletonMetricCard />
</div>

// Use aspect-square for chart skeletons too
<div className="w-full aspect-square">
  <Skeleton className="w-3/4 aspect-square rounded-full" />
</div>
```

## Performance Considerations

1. **Lazy Load Charts**: Charts can be heavy, consider lazy loading on mobile
2. **Image Optimization**: Use Next.js Image component, appropriate sizes
3. **Minimize Layout Shifts**: Reserve space for loading content
4. **Debounce Resize**: If listening to resize events
5. **Touch Optimization**: Use passive event listeners where appropriate

## Accessibility

- Maintain semantic HTML structure
- Ensure keyboard navigation works
- Keep color contrast ratios (WCAG AA minimum)
- Touch targets meet minimum size requirements
- Provide loading states for async content

## Critical Warnings & Lessons Learned

### Chart Sizing Issues

⚠️ **ApexCharts has hidden responsive constraints** that can break your layout:

- Charts may have `chart: { width: 200 }` in responsive options at 480px breakpoint
- This MUST be removed - only keep legend adjustments in responsive config
- Use `w-full aspect-square` on containers, NOT fixed pixel heights
- Always set chart `height='100%'` to fill the aspect-square container

### Skeleton Loading States

⚠️ **Skeletons must exactly match component responsive patterns**:

- Use identical grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5`
- Use identical padding: `p-4 md:p-6`
- Use `aspect-square` for chart skeletons
- Don't forget to update when changing component layouts

### Logo and SVG Sizing

⚠️ **SVG elements need special handling**:

- Remove fixed `width` and `height` attributes
- Use responsive width classes: `w-32 sm:w-40 md:w-48 lg:w-52 h-auto`
- Always include `h-auto` to maintain aspect ratio
- Text sizing must follow same breakpoints

## Notes for AI Agents

When implementing these plans:

1. Read this OVERVIEW.md first to understand context
2. Read "Critical Warnings" section above - these are non-obvious gotchas
3. Follow the established patterns and standards
4. Test thoroughly at multiple breakpoints (320px, 375px, 768px, 1024px, 1440px)
5. Maintain dark mode compatibility
6. Keep existing functionality intact
7. Use mobile-first approach (start small, add complexity)
8. Refer to existing components for styling patterns
9. Maintain TypeScript types and interfaces
10. **Always update skeleton loading states when changing component layouts**
