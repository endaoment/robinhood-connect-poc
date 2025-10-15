# Sub-Plan 6: Grants Section Responsiveness

**Priority**: Medium  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plans 1-5  
**Affects**: GrantsSection with quarterly data, NTEE breakdown, and restrictions

## Overview

Make the GrantsSection fully responsive, including metric cards, quarterly breakdown table, NTEE category pie chart, and
restrictions breakdown chart.

## Files to Modify

1. `apps/overview/src/components/ui/stats/GrantsSection.tsx`

## Current Issues

- Multiple metric cards grid needs responsive breakpoints
- Quarterly table needs horizontal scroll on mobile
- Three cards (table + 2 charts) may not stack well
- Chart sizing needs mobile optimization

## Target Responsive Behavior

### Metrics Grid

- **Mobile (< 640px)**: 2 columns
- **Tablet (640-1024px)**: 2 columns
- **Desktop (≥ 1024px)**: 4 columns

### Data Cards Layout

- **Mobile (< 768px)**: Stack all 3 cards vertically
- **Tablet (768-1024px)**: 2 columns (table spans full width or wraps)
- **Desktop (≥ 1024px)**: 3 columns side-by-side

## Implementation Steps

### Step 1: Update GrantsSection.tsx

The structure should be similar to DonationsSection. Create responsive layout:

```typescript
export function GrantsSection({ grantsData, barChartOptions, isLoading = false }: GrantsSectionProps) {
  // Existing helper functions...

  if (isLoading) {
    return (
      <section id='grants' className='scroll-mt-24'>
        <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
          Grants Overview
        </h2>
        <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3'>
          <SkeletonTable />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </section>
    );
  }

  const ytdAvg = grantsData.ytdCount > 0 ? Math.round(grantsData.ytdGranted / grantsData.ytdCount) : 0;

  return (
    <section id='grants' className='scroll-mt-24'>
      <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
        Grants Overview
      </h2>

      {/* First Row - Lifetime Metrics */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard title='Total Granted' value={grantsData.totalGranted} icon={DollarSign} prefix='$' />
        <MetricCard title='Total Grants' value={grantsData.totalGrants} icon={Activity} />
        <MetricCard title='Average Grant' value={grantsData.avgGrant} icon={BarChart3} prefix='$' />
        <MetricCard title='Median Grant' value={grantsData.medGrant} icon={PieChart} prefix='$' />
      </div>

      {/* Second Row - YTD Metrics */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard
          title='YTD Granted'
          value={grantsData.ytdGranted}
          change={grantsData.ytdGrantedChange}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='YTD Grant Count'
          value={grantsData.ytdCount}
          change={grantsData.ytdCountChange}
          icon={Activity}
        />
        <MetricCard
          title='YTD Avg Grant'
          value={ytdAvg}
          change={grantsData.ytdAvgChange}
          icon={BarChart3}
          prefix='$'
        />
        <MetricCard
          title='YTD Median'
          value={grantsData.ytdMedian}
          change={grantsData.ytdMedChange}
          icon={PieChart}
          prefix='$'
        />
      </div>

      {/* Quarterly Table and Charts - Responsive 3-Column Layout */}
      <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3'>
        {/* Quarterly Breakdown Table */}
        <Card className='overflow-hidden shadow-lg flex flex-col max-h-[500px] md:max-h-[600px]'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Quarterly Breakdown
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Grant metrics by quarter
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0 flex-1 flex flex-col min-h-0'>
            {grantsData.quarterlyData.length > 0 ? (
              <div className='overflow-x-auto flex-1'>
                <Table containerClassName='min-w-full'>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border-b-2 border-slate-200/50 dark:border-slate-700/50'>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-left whitespace-nowrap min-w-[100px]'>
                        Quarter
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right whitespace-nowrap min-w-[120px]'>
                        Granted
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right whitespace-nowrap min-w-[90px]'>
                        Count
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right whitespace-nowrap min-w-[100px]'>
                        Average
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right whitespace-nowrap min-w-[100px]'>
                        Median
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='bg-white/30 dark:bg-slate-900/30'>
                    {grantsData.quarterlyData.map(quarter => {
                      const heatmapColor = getHeatmapColor(quarter.granted || 0);
                      return (
                        <TableRow
                          key={quarter.quarter}
                          style={{ backgroundColor: heatmapColor }}
                          className='border-b border-slate-100 dark:border-slate-700 transition-all duration-200 hover:brightness-95 dark:hover:brightness-110 hover:shadow-sm group'
                        >
                          <TableCell className='font-semibold text-slate-800 dark:text-slate-200 py-3 md:py-4 px-4 md:px-6 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap text-sm'>
                            {quarter.quarter}
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 whitespace-nowrap text-sm'>
                            <span className='bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent font-bold'>
                              {formatCurrency(quarter.granted || 0)}
                            </span>
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 whitespace-nowrap text-sm'>
                            {quarter.count.toLocaleString()}
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 whitespace-nowrap text-sm'>
                            {formatCurrency(quarter.avg)}
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 whitespace-nowrap text-sm'>
                            {formatCurrency(quarter.median)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='flex items-center justify-center flex-1 text-slate-400 dark:text-slate-500 p-6'>
                No quarterly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* NTEE Category Breakdown Chart */}
        <Card className='overflow-hidden shadow-lg flex flex-col max-h-[500px] md:max-h-[600px]'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Grants by NTEE Category
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Distribution by nonprofit category
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-800/30'>
            <div className='h-full'>
              {grantsData.nteeBreakdown.length > 0 ? (
                <PaginatedAssetChart
                  data={grantsData.nteeBreakdown.map(item => ({
                    name: `${item.nteeCode}: ${item.nteeDescription}`,
                    amount: item.amount,
                    color: item.color,
                  }))}
                  itemsPerPage={10}
                  chartOptions={barChartOptions}
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                  No NTEE data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Restrictions Breakdown Chart */}
        <Card className='overflow-hidden shadow-lg flex flex-col max-h-[500px] md:max-h-[600px]'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Grant Restrictions
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Unrestricted vs restricted grants
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30 flex-1'>
            <div className='h-full'>
              {grantsData.restrictionsBreakdown.length > 0 ? (
                <Chart
                  key={`restrictions-${theme}`}
                  options={assetPieChartOptions(
                    grantsData.restrictionsBreakdown.map(item => ({
                      name: item.restrictionType,
                      amount: item.amount,
                      color: item.color,
                    }))
                  )}
                  series={grantsData.restrictionsBreakdown.map(item => item.amount)}
                  type='donut'
                  height='100%'
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                  No restrictions data available
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

### Step 2: Add Heatmap Color Helper

If not already present, add the heatmap color function similar to DonationsSection:

```typescript
// Calculate min and max for heatmap
const grantedValues = grantsData.quarterlyData.map(q => q.granted || 0).filter(v => v > 0);
const minGranted = grantedValues.length > 0 ? Math.min(...grantedValues) : 0;
const maxGranted = grantedValues.length > 0 ? Math.max(...grantedValues) : 0;

const getHeatmapColor = (value: number): string => {
  if (!value || maxGranted === minGranted) return '';
  const normalized = (value - minGranted) / (maxGranted - minGranted);
  const opacity = 0.15 + normalized * 0.3;
  return `rgba(59, 130, 246, ${opacity})`; // blue-500 for grants
};
```

## Testing Checklist

### Layout

- [ ] Section header scales appropriately
- [ ] Lifetime metrics in 2 columns on mobile, 4 on desktop
- [ ] YTD metrics in 2 columns on mobile, 4 on desktop
- [ ] Three cards stack vertically on mobile
- [ ] Three cards in 3 columns on desktop (≥ 1024px)
- [ ] Gaps consistent at all sizes

### Quarterly Table

- [ ] Table scrolls horizontally on narrow screens
- [ ] All 5 columns visible
- [ ] Headers aligned with data
- [ ] Heatmap colors visible (blue theme)
- [ ] Heatmap works in both themes
- [ ] Hover effects work
- [ ] Touch scrolling smooth
- [ ] Currency values formatted
- [ ] Gradient text on granted column
- [ ] Empty state shows when no data

### NTEE Category Chart

- [ ] Bar chart renders correctly
- [ ] Pagination works
- [ ] NTEE codes and descriptions visible
- [ ] Colors distinguishable
- [ ] Tooltips work
- [ ] Chart height appropriate
- [ ] Works in both themes
- [ ] Empty state shows when no data

### Restrictions Chart

- [ ] Pie chart renders correctly
- [ ] Two categories visible (Unrestricted/Restricted)
- [ ] Legend positioned appropriately
- [ ] Colors distinguishable
- [ ] Tooltips work
- [ ] Percentages visible
- [ ] Works in both themes
- [ ] Empty state shows when no data

### Metric Cards

- [ ] Values format correctly
- [ ] Change indicators colored correctly
- [ ] Icons visible
- [ ] Currency shows $ prefix
- [ ] No overflow

### General

- [ ] No horizontal scroll (except table)
- [ ] Loading skeletons match layout
- [ ] Dark mode works
- [ ] Smooth transitions
- [ ] Scroll-to-section works

## Edge Cases

1. **No quarterly data**: Empty state for table
2. **No NTEE data**: Empty state for chart
3. **Single restriction type**: Chart should still render
4. **Many NTEE categories**: Pagination handles gracefully
5. **Very large grant amounts**: Currency formatting handles properly
6. **Zero grants in a quarter**: Shows $0 appropriately

## Performance Considerations

- Multiple charts on same screen may be heavy
- Consider lazy loading charts when not in viewport
- Quarterly table may have many rows
- Pagination in NTEE chart helps performance
- Heatmap calculations should be memoized

## Accessibility

- All tables have semantic HTML
- Headers clearly labeled
- Charts have descriptive titles
- Empty states have clear messages
- Heatmap doesn't rely solely on color
- Pagination controls keyboard accessible
- Touch-friendly scroll areas
- Color contrasts meet WCAG standards

## Optional Enhancements

### Responsive 3-Column Grid Alternatives

For tablets (768-1024px), consider:

- Option A: Table full width, charts in 2 columns below
- Option B: All 3 cards in single column
- Option C: Table + one chart side-by-side, third chart below

Test which works best for readability. The current plan uses single column stacking on mobile and tablet, 3 columns on
desktop.
