# Sub-Plan 8: Shared Components & Final Polish

**Priority**: Medium (Polish and consistency)  
**Estimated Complexity**: Low-Medium  
**Dependencies**: Sub-Plans 1-7  
**Affects**: Shared components, final adjustments, testing

## Overview

Refine shared components for optimal mobile experience, ensure consistency across all sections, fix any remaining
responsive issues, and perform comprehensive testing across all breakpoints.

## Files to Review/Modify

1. `apps/overview/src/components/ui/MetricCard.tsx` - Already has responsive formatting
2. `apps/overview/src/components/ui/Card.tsx` - Verify padding and spacing
3. `apps/overview/src/components/ui/Table.tsx` - Ensure horizontal scroll pattern
4. `apps/overview/src/utils/chartOptions.ts` - Optimize for mobile
5. Any section components needing final touch-ups

## Shared Component Standards

### MetricCard Component

The MetricCard already has responsive value formatting (lines 26-60). Verify it works well:

#### Current Features (Good):

- ResizeObserver to detect card width
- Automatic value compacting on narrow cards
- Responsive currency formatting
- Smaller suffix for compact values (k, m, b)

#### Potential Enhancements:

```typescript
// In MetricCard.tsx, ensure title also scales
<CardTitle className='text-xs sm:text-sm font-medium font-title text-center leading-tight'>
  {title}
</CardTitle>

// Ensure value text is never too large for container
<h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center break-words'>
  {/* value */}
</h3>

// Make change indicator responsive
<div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
  {change > 0 ? (
    <TrendingUp className='h-4 w-4 sm:h-5 sm:w-5' strokeWidth={2.5} />
  ) : (
    <TrendingDown className='h-4 w-4 sm:h-5 sm:w-5' strokeWidth={2.5} />
  )}
  <span className='text-sm sm:text-base md:text-lg font-bold'>{Math.abs(change)}%</span>
</div>
```

### Card Component

Ensure Card, CardHeader, CardContent have consistent responsive padding:

```typescript
// In Card.tsx components
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-4 md:p-6', className)} // Responsive padding
      {...props}
    />
  )
);

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 md:p-6 pt-0', className)} // Responsive padding
      {...props}
    />
  )
);
```

### Table Component

Ensure proper horizontal scroll support:

```typescript
// In Table.tsx
export function Table({ children, containerClassName, ...props }: TableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 md:mx-0', containerClassName)}>
      <div className='inline-block min-w-full align-middle'>
        <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700' {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

// Ensure cells have appropriate padding
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 md:px-6 py-3 md:py-4 text-sm', // Responsive cell padding
        className
      )}
      {...props}
    />
  )
);
```

## Chart Options Optimization

Update `apps/overview/src/utils/chartOptions.ts` for mobile:

### Responsive Legend Positioning

```typescript
// For pie/donut charts
export function pieChartOptions(data, title, totalOverride): ApexCharts.ApexOptions {
  return {
    // ... existing options
    legend: {
      position: window.innerWidth < 768 ? 'bottom' : 'right',
      horizontalAlign: 'center',
      fontSize: window.innerWidth < 640 ? '11px' : '12px',
      fontFamily: 'inherit',
      markers: {
        width: window.innerWidth < 640 ? 6 : 8,
        height: window.innerWidth < 640 ? 6 : 8,
      },
      itemMargin: {
        horizontal: window.innerWidth < 640 ? 6 : 8,
        vertical: 4,
      },
    },
    // ... rest
  };
}
```

### Responsive Font Sizes

```typescript
// For all chart types
chart: {
  fontFamily: 'inherit',
  toolbar: {
    show: window.innerWidth >= 768, // Hide on mobile
  },
},
dataLabels: {
  style: {
    fontSize: window.innerWidth < 640 ? '10px' : '12px',
  },
},
xaxis: {
  labels: {
    style: {
      fontSize: window.innerWidth < 640 ? '10px' : '12px',
    },
    rotate: window.innerWidth < 640 ? -45 : 0, // Rotate labels on mobile if needed
  },
},
yaxis: {
  labels: {
    style: {
      fontSize: window.innerWidth < 640 ? '10px' : '12px',
    },
  },
},
```

### Responsive Tooltip

```typescript
tooltip: {
  enabled: true,
  style: {
    fontSize: window.innerWidth < 640 ? '11px' : '12px',
  },
  // Ensure tooltip stays within viewport
  fixed: {
    enabled: false,
    position: 'topLeft',
  },
}
```

## Global Adjustments

### Section Headings Consistency

Ensure all section headings use responsive text sizes:

```tsx
<h2 className='text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
```

### Section ID Scroll Offset

Verify all sections have appropriate scroll-mt for the navigation:

```tsx
<section id='section-name' className='scroll-mt-24'>
```

Adjust if header height changes on mobile:

```tsx
<section id='section-name' className='scroll-mt-20 md:scroll-mt-24'>
```

### Loading States

Ensure all skeleton components are responsive:

```typescript
// SkeletonMetricCard should match MetricCard layout
export function SkeletonMetricCard() {
  return (
    <Card className='animate-pulse'>
      <CardHeader className='p-4 md:p-6 pb-2'>
        <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto'></div>
      </CardHeader>
      <CardContent className='p-4 md:p-6'>
        <div className='h-8 md:h-10 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto'></div>
      </CardContent>
    </Card>
  );
}
```

## Touch Target Verification

Ensure all interactive elements meet minimum 44x44px:

### Buttons

```tsx
<button className='min-w-[44px] min-h-[44px] px-4 py-2 ...'>
```

### Icons as Buttons

```tsx
<button className='p-3' aria-label='Descriptive label'>
  <Icon className='h-5 w-5' />
</button>
```

### Links

```tsx
<a className='inline-flex items-center min-h-[44px] px-4 py-2 ...'>
```

## Typography Scale Verification

Check that all text scales appropriately:

```css
/* Headers */
h1: text-2xl md:text-3xl lg:text-4xl
h2: text-xl md:text-2xl lg:text-3xl
h3: text-lg md:text-xl lg:text-2xl
h4: text-base md:text-lg

/* Body */
p: text-sm md:text-base
small: text-xs md:text-sm

/* Captions */
caption: text-xs
```

## Spacing Consistency

Verify consistent spacing across all sections:

```css
/* Section margins */
mb-6 md:mb-8 lg:mb-12

/* Grid gaps */
gap-4 md:gap-6 lg:gap-8

/* Card padding */
p-4 md:p-6 lg:p-8

/* Content padding */
px-4 md:px-6 py-6 md:py-8
```

## Final Testing Checklist

### Viewport Testing

- [ ] 320px width (iPhone SE)
- [ ] 375px width (iPhone 12/13)
- [ ] 390px width (iPhone 14 Pro)
- [ ] 414px width (iPhone Plus models)
- [ ] 768px width (iPad portrait)
- [ ] 1024px width (iPad landscape)
- [ ] 1280px width (Small laptop)
- [ ] 1440px width (Desktop)
- [ ] 1920px width (Large desktop)
- [ ] 2560px+ width (Ultra-wide)

### Orientation Testing

- [ ] Portrait mobile
- [ ] Landscape mobile
- [ ] Portrait tablet
- [ ] Landscape tablet

### Browser Testing

- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari macOS
- [ ] Edge Desktop

### Interaction Testing

- [ ] Touch scrolling smooth
- [ ] No accidental clicks/taps
- [ ] Pinch zoom disabled where appropriate
- [ ] Double-tap zoom works where expected
- [ ] Hover states work on desktop
- [ ] Focus states visible for keyboard nav
- [ ] Swipe gestures don't conflict

### Visual Testing

- [ ] No horizontal overflow
- [ ] No vertical overflow (except intended scroll)
- [ ] Images load and scale properly
- [ ] Charts render correctly
- [ ] Tables scroll horizontally
- [ ] Text readable at all sizes
- [ ] Adequate color contrast
- [ ] Dark mode works everywhere
- [ ] Transitions smooth
- [ ] Loading states appropriate
- [ ] Empty states visible

### Performance Testing

- [ ] Initial load < 3s on 4G
- [ ] Time to interactive < 5s
- [ ] No layout shifts
- [ ] Smooth 60fps scrolling
- [ ] Charts render without blocking
- [ ] Images lazy load
- [ ] No memory leaks

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Alt text for images
- [ ] Color not sole information carrier
- [ ] Touch targets adequate
- [ ] Focus indicators visible
- [ ] Zoom up to 200% works
- [ ] WCAG AA contrast ratios met

## Known Issues to Address

### Issue 1: Chart Resize on Orientation Change

**Problem**: Charts may not resize when device rotates  
**Solution**: Add window resize listener or use ResizeObserver

```typescript
useEffect(() => {
  const handleResize = () => {
    // Force chart update
    setChartKey(prev => prev + 1);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Issue 2: Safari Bounce Scrolling

**Problem**: Page bounces when scrolling past end  
**Solution**: Add CSS to body

```css
body {
  overscroll-behavior: none;
}
```

### Issue 3: iOS Input Zoom

**Problem**: Inputs zoom when focused on iOS  
**Solution**: Set minimum font size

```css
input,
select,
textarea {
  font-size: 16px; /* Prevents iOS zoom */
}
```

### Issue 4: Android Chrome Address Bar

**Problem**: Height calculations off when address bar hides/shows  
**Solution**: Use `dvh` (dynamic viewport height) or calculate properly

```css
/* Use dynamic viewport height */
height: 100dvh;

/* Or calculate with JS */
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
```

## Documentation

Create a `MOBILE_TESTING.md` file documenting:

1. Tested devices and browsers
2. Known issues and workarounds
3. Responsive breakpoints used
4. Touch interaction patterns
5. Performance benchmarks

## Final Verification

Before marking complete, verify:

- [ ] All 8 sub-plans implemented
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All linter warnings addressed
- [ ] Dark mode works everywhere
- [ ] Navigation works from all sections
- [ ] Data loads correctly
- [ ] Charts interactive and readable
- [ ] Tables scrollable where needed
- [ ] Touch targets adequate
- [ ] Performance acceptable
- [ ] Accessibility standards met

## Success Criteria

The Overview App is considered fully mobile-responsive when:

1. ✅ All sections viewable and functional on 320px+ screens
2. ✅ No horizontal scrolling (except intended table scrolls)
3. ✅ All text readable without zooming
4. ✅ All interactive elements easily tappable (44x44px min)
5. ✅ Charts render correctly and are legible
6. ✅ Tables have horizontal scroll with clear indicators
7. ✅ Navigation works smoothly on mobile
8. ✅ Dark mode works consistently
9. ✅ Performance acceptable on mobile networks
10. ✅ Accessibility standards met (WCAG AA)

## Post-Implementation

After all sub-plans completed:

1. Conduct user testing on real devices
2. Gather feedback from team
3. Create list of future enhancements
4. Update documentation
5. Celebrate! 🎉
