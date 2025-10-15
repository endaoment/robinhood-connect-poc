# Sub-Plan 2: Hero & Program Overview Section

**Priority**: High (High visual impact)  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plan 1 (for consistent spacing)  
**Affects**: First visible content, sets tone for entire page

## Overview

Make the TotalPlatformValueHero and ProgramOverviewSection fully responsive. These are the first components users see,
so they need to work perfectly on all screen sizes while maintaining visual impact.

## Files to Modify

1. `apps/overview/src/components/ui/TotalPlatformValueHero.tsx`
2. `apps/overview/src/components/ui/stats/ProgramOverviewSection.tsx`

## Current Issues

### TotalPlatformValueHero

- Fixed flex-row layout doesn't stack on mobile
- Large text (text-5xl) may overflow on small screens
- Legend items may wrap awkwardly
- Horizontal bar may be too small to read percentages

### ProgramOverviewSection

- Grid cols hardcoded (2xl:grid-cols-4)
- Metric cards may be too cramped on mobile
- Chart cards in 4-column grid too narrow on tablet
- Click handlers need larger touch targets

## Target Responsive Behavior

### TotalPlatformValueHero

- **Mobile (< 640px)**: Stack vertically, compact legend, smaller text
- **Tablet (640-1024px)**: Stack vertically, full legend
- **Desktop (≥ 1024px)**: Side-by-side layout as current

### ProgramOverviewSection

- **Mobile (< 768px)**:
  - Metrics: 1 column (default for metrics WITH change indicators)
  - Exception: 2 columns if metrics have NO change/performance indicators and there are 2+ consecutive ones
  - Charts: 1 column
- **Tablet (768-1024px)**: 2 columns for metrics and charts
- **Desktop (≥ 1024px)**: 5 columns for metrics, 2 for charts
- **Large Desktop (≥ 1280px)**: 5 columns for metrics, 4 for charts

## Implementation Steps

### Step 1: Update TotalPlatformValueHero.tsx

Replace the return statement (lines 93-181):

```typescript
return (
  <div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 md:p-8 mb-6 md:mb-8 text-white'>
    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
      {/* Left side - Title and Total */}
      <div className='flex-shrink-0'>
        <h2 className='text-base md:text-lg font-semibold text-white/90 mb-2'>Total Impact</h2>
        <p
          className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight'
          style={{
            animation: 'pulse-glow 10s ease-in-out infinite',
          }}>
          {formattedTotal}
        </p>
        <p className='text-xs md:text-sm text-white/80 mt-2'>
          All impact generated to date by Endaoment donors
        </p>
      </div>
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
          }
        }
      `}</style>

      {/* Right side - Stacked bar and legend */}
      <div className='flex-1 lg:mt-6'>
        {/* Legend - Responsive layout */}
        <div className='flex flex-wrap gap-3 md:gap-4 justify-start lg:justify-center mb-4'>
          {componentsWithPercentage.map((component, index) => (
            <div
              key={index}
              className='flex items-center gap-2 flex-shrink-0 cursor-pointer transition-all duration-300 min-w-[140px] sm:min-w-0'
              style={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                textShadow: hoveredIndex === index ? '0 0 2px rgba(255, 255, 255, 0.2)' : 'none',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(index)}
              onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 2000)}
            >
              <div
                className='w-3 h-3 rounded-sm flex-shrink-0 transition-all duration-300'
                style={{
                  backgroundColor: component.color,
                  transform: hoveredIndex === index ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: hoveredIndex === index ? `0 0 2px ${component.color}` : 'none',
                }}
              />
              <span className='text-xs sm:text-sm font-bold text-white whitespace-nowrap transition-all duration-300'>
                {formatCompactCurrency(component.value)}
              </span>
              <span
                className='text-xs sm:text-sm text-white whitespace-nowrap transition-all duration-300'
                style={{
                  fontWeight: hoveredIndex === index ? '700' : '400',
                }}
              >
                {component.label}
              </span>
            </div>
          ))}
        </div>

        {/* Horizontal stacked bar */}
        <div>
          <div className='h-10 md:h-12 bg-white/10 rounded-md overflow-hidden flex shadow-lg'>
            {componentsWithPercentage.map((component, index) => (
              <div
                key={index}
                className='flex items-center justify-center transition-all duration-300 cursor-pointer'
                style={{
                  width: `${component.percentage}%`,
                  backgroundColor: component.color,
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                  filter: hoveredIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                  boxShadow: hoveredIndex === index ? `0 0 3px ${component.color}` : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(index)}
                onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 2000)}
                title={`${component.label}: ${component.percentage.toFixed(1)}%`}
              >
                {/* Show percentage if segment is wide enough */}
                {component.percentage > 10 && (
                  <span className='text-xs font-semibold text-white hidden sm:inline'>
                    {component.percentage.toFixed(1)}%
                  </span>
                )}
                {/* Show only on larger segments on mobile */}
                {component.percentage > 15 && (
                  <span className='text-xs font-semibold text-white sm:hidden'>
                    {component.percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

### Step 2: Update ProgramOverviewSection.tsx

#### Modify the metric cards grid (lines 200-228)

```typescript
<div className='grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5'>
  <MetricCard
    title='YTD Donations'
    value={donationsData.ytdDonated}
    change={donationsData.ytdDonatedChange}
    icon={DollarSign}
    prefix='$'
  />
  <MetricCard
    title='YTD Grants'
    value={grantsData.ytdGranted}
    change={grantsData.ytdGrantedChange}
    icon={Activity}
    prefix='$'
  />
  <MetricCard
    title='YTD Protocol Fees'
    value={portfoliosData.ytdProtocolRevenue || 0}
    change={portfoliosData.ytdProtocolRevenueChange}
    icon={TrendingUp}
    prefix='$'
  />
  <MetricCard
    title='12mo. Platform Fees'
    value={portfoliosData.rrr || 140000}
    icon={TrendingUp}
    prefix='$'
  />
  <MetricCard
    title='Platform Fee BPS'
    value={(portfoliosData.blendedFeeBps || 0).toFixed(2)}
    icon={TrendingUp}
  />
</div>
```

#### Modify the chart cards grid (lines 229-360)

```typescript
<div className='grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4'>
  <Card
    className='overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
    onClick={() => scrollToSection('funds')}
  >
    <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
      <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
        Fund Status Distribution
      </CardTitle>
      <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
        Current status breakdown of all funds
      </CardDescription>
    </CardHeader>
    <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30'>
      <div className='w-full aspect-square'>
        {openFundsData.statusDistribution.length > 0 ? (
          <Chart
            key={`fund-status-${theme}`}
            options={pieChartOptions(processedStatusDistribution, 'Fund Status')}
            series={processedStatusDistribution.map(item => item.value)}
            type='donut'
            height='100%'
          />
        ) : (
          <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
            No data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>

  <Card
    className='overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
    onClick={() => scrollToSection('portfolios')}
  >
    <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
      <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
        Portfolio Distribution
      </CardTitle>
      <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
        Asset allocation across portfolio types
      </CardDescription>
    </CardHeader>
    <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30'>
      <div className='w-full aspect-square'>
        {portfoliosData.distribution.length > 0 ? (
          (() => {
            const portfolioChartData = processedPortfolioDistribution.map(item => ({
              name: item.name,
              amount: item.amount || 0,
              color: item.color,
              logoUrl: item.logoUrl || null,
            }));
            return (
              <Chart
                key={`portfolio-dist-${theme}`}
                options={assetPieChartOptions(portfolioChartData)}
                series={portfolioChartData.map(item => item.amount)}
                type='donut'
                height='100%'
              />
            );
          })()
        ) : (
          <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
            No data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>

  <Card
    className='overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
    onClick={() => scrollToSection('donations')}
  >
    <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
      <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
        Donations by Asset Type
      </CardTitle>
      <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
        Breakdown of donations by asset class
      </CardDescription>
    </CardHeader>
    <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30'>
      <div className='w-full aspect-square'>
        {donationsData.assetBreakdown.length > 0 ? (
          <Chart
            key={`donations-asset-${theme}`}
            options={assetPieChartOptions(processedAssetBreakdown)}
            series={processedAssetBreakdown.map(item => item.amount)}
            type='donut'
            height='100%'
          />
        ) : (
          <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
            No data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>

  <Card
    className='overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
    onClick={() => scrollToSection('grants')}
  >
    <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
      <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
        Grant Restrictions
      </CardTitle>
      <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
        Unrestricted vs restricted grant distribution
      </CardDescription>
    </CardHeader>
    <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30'>
      <div className='w-full aspect-square'>
        {grantsData.restrictionsBreakdown.length > 0 ? (
          <Chart
            key={`grants-restrictions-${theme}`}
            options={assetPieChartOptions(processedGrantRestrictionsBreakdown)}
            series={processedGrantRestrictionsBreakdown.map(item => item.amount)}
            type='donut'
            height='100%'
          />
        ) : (
          <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
            No data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</div>
```

### Step 3: Add Touch Feedback

Add touch feedback for better mobile UX. The `active:scale-[0.98]` class already provides this.

## Chart Options Adjustments (Optional Enhancement)

If charts are too cramped on mobile, consider updating `apps/overview/src/utils/chartOptions.ts` to adjust legend
position and font sizes based on viewport:

```typescript
// Example adjustment in pieChartOptions function
legend: {
  position: window.innerWidth < 768 ? 'bottom' : 'right',
  fontSize: window.innerWidth < 768 ? '12px' : '14px',
}
```

However, this requires adding a resize listener or using a responsive chart wrapper.

## Testing Checklist

### TotalPlatformValueHero

- [ ] Text scales appropriately on all screen sizes
- [ ] Layout stacks vertically on mobile (< 1024px)
- [ ] Layout is side-by-side on desktop (≥ 1024px)
- [ ] Legend items wrap nicely on mobile
- [ ] Legend items don't overflow container
- [ ] Bar percentages show/hide based on segment width
- [ ] Mobile shows percentages only on segments > 15%
- [ ] Desktop shows percentages on segments > 10%
- [ ] Touch hover works (shows for 2s after touch)
- [ ] Mouse hover works on desktop
- [ ] Animation runs smoothly
- [ ] Padding is appropriate on all sizes

### ProgramOverviewSection

- [ ] Metric cards in 1 column on mobile (< 768px)
- [ ] Metric cards in 2 columns on tablet (768-1024px)
- [ ] Metric cards in 5 columns on large desktop (≥ 1024px)
- [ ] Chart cards in 1 column on mobile (< 768px)
- [ ] Chart cards in 2 columns on tablet (768-1280px)
- [ ] Chart cards in 4 columns on xl screens (≥ 1280px)
- [ ] Charts fill full card width (aspect-square working)
- [ ] Charts maintain perfect circular proportions
- [ ] Cards are clickable/tappable with visual feedback
- [ ] Active scale animation works on touch
- [ ] Charts are readable on mobile (not constrained to 200px)
- [ ] Card padding is appropriate at all sizes (p-4 md:p-6)
- [ ] Text sizes scale correctly (text-base md:text-lg, text-xs md:text-sm)
- [ ] No horizontal overflow
- [ ] Gaps between cards are consistent
- [ ] Skeleton loading states match responsive grids

## Edge Cases

1. **Very narrow screens (320px)**: Ensure legend items don't break layout
2. **Very long currency values**: formatCompactCurrency should handle this
3. **No data states**: Empty state messages should be visible
4. **Loading states**: Skeletons already handled, ensure they're responsive
5. **Touch and mouse simultaneously**: Should handle both interaction types

## Performance Notes

- Charts may need time to render on mobile
- Consider showing a loading spinner for charts on slow devices
- Touch event handlers should be passive where possible
- Avoid layout shifts during chart rendering (fixed heights help)

## Accessibility

- Touch targets are already adequate (whole card is clickable)
- Ensure hover states work with keyboard navigation
- Color-only information (bar segments) also has labels
- Loading states have appropriate ARIA labels

## Implementation Lessons Learned

### Critical Discoveries

1. **Chart Sizing with aspect-square**:

   - Using `w-full aspect-square` instead of fixed heights (e.g., `h-[300px] md:h-[350px]`) makes charts properly fill
     their containers
   - This maintains perfect circular proportions for donut charts at all screen sizes
   - Charts scale naturally with container width

2. **Chart Options Width Constraints**:

   - ApexCharts has responsive breakpoints that can override container sizing
   - The `responsive` array in chart options had `chart: { width: 200 }` at 480px breakpoint
   - **Must remove fixed width constraints** and only keep legend adjustments in responsive options:

     ```typescript
     responsive: [
       {
         breakpoint: 480,
         options: {
           legend: {
             position: 'bottom',
             fontSize: '12px',
           },
         },
       },
     ];
     ```

3. **Skeleton Loading States**:

   - Skeletons must match the responsive patterns of their real components
   - Use same grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5` for metrics
   - Chart skeletons should also use `aspect-square` for consistent sizing
   - Responsive padding: `p-4 md:p-6` matches real components

4. **Logo and Header Sizing**:

   - SVG logos need responsive width classes, not fixed width/height attributes
   - Use: `w-32 sm:w-40 md:w-48 lg:w-52 h-auto`
   - Text sizing should follow same breakpoints: `text-xs sm:text-sm md:text-base`
   - Spacing needs responsive adjustment: `space-x-2 sm:space-x-3 md:space-x-4`

5. **Metric Card Mobile Columns**:
   - **Rule**: Metrics WITH change/performance indicators should be `grid-cols-1` on mobile
   - **Exception**: Metrics WITHOUT change indicators CAN be `grid-cols-2` on mobile IF there are 2+ consecutive ones
   - **Reasoning**: Change indicators (percentage badges) need horizontal space; crowding them in 2 columns makes them
     hard to read
   - **Current ProgramOverviewSection**: Uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-5` because all 5 metrics have
     change indicators

### Step 4: Update Chart Options (Critical!)

Update `apps/overview/src/utils/chartOptions.ts`:

```typescript
// In pieChartOptions function (line ~288)
responsive: [
  {
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        fontSize: '12px',
      },
      // Remove: chart: { width: 200 }
    },
  },
],

// In assetPieChartOptions function (line ~645)
responsive: [
  {
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        fontSize: '12px',
      },
      // Remove: chart: { width: 200 }
    },
  },
],
```

### Step 5: Update Skeleton Components

1. **SkeletonMetricCard.tsx**:

   - Change padding from `p-6` to `p-4 md:p-6`
   - Make skeleton elements responsive: `h-3 md:h-4`, `w-20 md:w-24`

2. **SkeletonCard.tsx**:

   - Remove `height` prop parameter (no longer needed)
   - Use `aspect-square` for chart skeleton container
   - Make padding and text sizes responsive

3. **TotalPlatformValueHero loading state**:
   - Must match the responsive layout: `flex-col lg:flex-row`
   - Use responsive padding: `p-6 md:p-8`
   - Scale skeleton sizes: `h-10 sm:h-12 md:h-14`

### Step 6: Update Loading States in ProgramOverviewSection

Ensure the skeleton grid matches the actual component grid:

```typescript
// In isLoading block
<div className='grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-8'>
  <SkeletonMetricCard />
  <SkeletonMetricCard />
  <SkeletonMetricCard />
  <SkeletonMetricCard />
  <SkeletonMetricCard />
</div>
<div className='grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4'>
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</div>
```

## Common Pitfalls to Avoid

1. **Don't use fixed pixel heights for charts** - Use `aspect-square` instead
2. **Don't forget to remove chart width constraints** in chartOptions.ts
3. **Don't forget to update skeleton loading states** to match responsive grids
4. **Don't use fixed width/height on SVGs** - Use responsive width classes with `h-auto`
5. **Don't forget responsive padding** - Use `p-4 md:p-6` pattern consistently
6. **Don't forget the 5th metric card** in loading skeleton (easy to miss!)
