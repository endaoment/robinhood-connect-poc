# Sub-Plan 3: Funds Section Responsiveness

**Priority**: Medium  
**Estimated Complexity**: Medium-High  
**Dependencies**: Sub-Plans 1-2  
**Affects**: OpenFundsSection component with complex charts

## Overview

Make the OpenFundsSection fully responsive with appropriate layouts for metric cards, line charts showing fund size over
time, and the treemap visualization of fund balances.

## Files to Modify

1. `apps/overview/src/components/ui/stats/OpenFundsSection.tsx`

## Current Issues

- Grid layout hardcoded for desktop
- Line chart may be too small on mobile
- Treemap requires significant width to be readable
- Multiple metric cards may be cramped
- Chart legends may overlap on narrow screens

## Target Responsive Behavior

### Metrics Grid

- **Mobile (< 640px)**: 2 columns
- **Tablet (≥ 640px)**: 3 columns
- **Desktop (≥ 1024px)**: 4 columns

### Charts

- **Mobile (< 768px)**: Stack vertically, full width each
- **Desktop (≥ 768px)**: Side-by-side 2-column layout

### Chart Heights

- **Mobile**: 300-350px (readable but not overwhelming)
- **Tablet**: 400-450px
- **Desktop**: 500-600px as current

## Implementation Steps

### Step 1: Update OpenFundsSection.tsx Structure

The file should be at `apps/overview/src/components/ui/stats/OpenFundsSection.tsx`. Update the section structure:

```typescript
export function OpenFundsSection({
  openFundsData,
  lineChartOptions,
  lineChartSeries,
  fundTreemapData,
  treemapChartOptions,
  isLoading = false,
}: OpenFundsSectionProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <section id='funds' className='scroll-mt-24'>
        <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
          Open Funds Overview
        </h2>
        <div className='grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6 md:mb-8'>
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 mb-6 md:mb-8'>
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section id='funds' className='scroll-mt-24'>
      <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
        Open Funds Overview
      </h2>

      {/* Metric Cards - Responsive Grid */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard
          title='Total Open Funds'
          value={openFundsData.totalOpen}
          icon={Wallet}
        />
        <MetricCard
          title='Funds Over $10k'
          value={openFundsData.fundsOver10k}
          icon={TrendingUp}
        />
        <MetricCard
          title='Active Funds (30d)'
          value={openFundsData.activeFunds}
          icon={Activity}
        />
        <MetricCard
          title='Dormant Funds'
          value={openFundsData.dormantFunds}
          icon={PauseCircle}
        />
        <MetricCard
          title='Total AUM'
          value={openFundsData.totalAUM}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='Average AUM'
          value={openFundsData.avgAUM}
          icon={BarChart3}
          prefix='$'
        />
        <MetricCard
          title='Largest Fund AUM'
          value={openFundsData.largestFundAUM}
          icon={Crown}
          prefix='$'
        />
        <MetricCard
          title='Funds with Balance'
          value={openFundsData.totalFundsWithBalance}
          icon={PieChart}
        />
      </div>

      {/* Status Distribution Donut */}
      <Card className='overflow-hidden shadow-lg mb-6 md:mb-8'>
        <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
          <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
            Fund Status Distribution
          </CardTitle>
          <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
            Breakdown of funds by current status
          </CardDescription>
        </CardHeader>
        <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30'>
          <div className='h-[300px] sm:h-[350px] md:h-[400px]'>
            {openFundsData.statusDistribution.length > 0 ? (
              <Chart
                key={`fund-status-distribution-${theme}`}
                options={pieChartOptions(
                  openFundsData.statusDistribution,
                  'Fund Status',
                  { label: 'Total Funds', value: openFundsData.totalOpen, format: 'number' }
                )}
                series={openFundsData.statusDistribution.map(item => item.value)}
                type='donut'
                height='100%'
              />
            ) : (
              <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                No status data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Chart and Treemap - Responsive Layout */}
      <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2'>
        {/* Fund Size Over Time - Line Chart */}
        <Card className='overflow-hidden shadow-lg flex flex-col'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Fund Size Distribution Over Time
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Cumulative count of funds by balance tier over time
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30 flex-1'>
            <div className='h-[350px] sm:h-[400px] lg:h-[500px]'>
              {lineChartSeries && lineChartSeries.length > 0 ? (
                <Chart
                  key={`fund-size-line-${theme}`}
                  options={lineChartOptions}
                  series={lineChartSeries}
                  type='line'
                  height='100%'
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                  No time series data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fund Balances Treemap */}
        <Card className='overflow-hidden shadow-lg flex flex-col'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Fund Balances (Top 100)
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Largest funds by total AUM - tap to view details
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30 flex-1'>
            <div className='h-[350px] sm:h-[400px] lg:h-[500px]'>
              {fundTreemapData && fundTreemapData.length > 0 ? (
                <Chart
                  key={`fund-treemap-${theme}`}
                  options={treemapChartOptions(fundTreemapData)}
                  series={[
                    {
                      data: fundTreemapData.map(fund => ({
                        x: fund.fundId,
                        y: fund.totalAUM,
                      })),
                    },
                  ]}
                  type='treemap'
                  height='100%'
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                  No fund balance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

### Step 2: Update Chart Options for Mobile

In `apps/overview/src/utils/chartOptions.ts`, ensure responsive legend positioning:

For `lineChartOptions`, add responsive legend:

```typescript
legend: {
  position: 'bottom', // Always bottom for better mobile experience
  horizontalAlign: 'center',
  fontSize: '12px',
  fontFamily: 'inherit',
  markers: {
    width: 8,
    height: 8,
  },
  itemMargin: {
    horizontal: 8,
    vertical: 4,
  },
}
```

For `treemapChartOptions`, ensure tooltips are readable:

```typescript
tooltip: {
  enabled: true,
  style: {
    fontSize: '12px',
    fontFamily: 'inherit',
  },
  y: {
    formatter: (val: number) => `$${val.toLocaleString()}`,
  },
}
```

### Step 3: Add Responsive Padding to Cards

The cards already use `p-4 md:p-6` pattern, which is good. Ensure consistent usage.

## Testing Checklist

### Layout

- [ ] Section header scales appropriately
- [ ] Metric cards in 2 columns on mobile (< 640px)
- [ ] Metric cards in 3 columns on tablet (640-1024px)
- [ ] Metric cards in 4 columns on desktop (≥ 1024px)
- [ ] Gap spacing is appropriate at all sizes
- [ ] Status distribution donut chart renders correctly
- [ ] Charts stack vertically on mobile
- [ ] Charts side-by-side on desktop

### Line Chart

- [ ] Legend positioned at bottom
- [ ] Legend items wrap nicely on narrow screens
- [ ] All series lines are visible
- [ ] Tooltip shows on hover/touch
- [ ] X-axis labels are readable (not overlapping)
- [ ] Y-axis labels fit in container
- [ ] Chart height appropriate for screen size
- [ ] Zoom/pan controls work on touch (if enabled)

### Treemap Chart

- [ ] Blocks are large enough to tap
- [ ] Labels are readable on visible blocks
- [ ] Tooltip shows fund ID and balance
- [ ] Colors distinguish different funds
- [ ] Works in both light and dark mode
- [ ] Chart height appropriate for screen size
- [ ] No horizontal scroll

### Metric Cards

- [ ] Values format correctly (compact on narrow cards)
- [ ] Icons visible at all sizes
- [ ] Touch targets adequate
- [ ] Text doesn't overflow

### General

- [ ] No horizontal scroll at any breakpoint
- [ ] Loading skeletons match final layout
- [ ] Dark mode works correctly
- [ ] Transitions smooth
- [ ] Scroll-to-section works from navigation

## Edge Cases

1. **Empty data**: Each chart has empty state message
2. **Single data point**: Line chart should handle gracefully
3. **Very long fund IDs**: Treemap labels should truncate
4. **Many fund size tiers**: Line chart legend may need scrolling
5. **Portrait tablets**: Should use mobile layout (< 768px)

## Performance Considerations

- Treemap with 100 items may be heavy on low-end devices
- Consider showing fewer items on mobile (e.g., top 50)
- Line chart with many data points may lag on zoom/pan
- Charts should lazy load or show loading state

## Accessibility

- Chart cards have descriptive titles
- Empty states have clear messages
- Touch targets meet minimum 44x44px
- Color-blind friendly color palette
- Tooltips work with both mouse and touch
