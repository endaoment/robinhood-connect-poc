# Sub-Plan 5: Donations Section Responsiveness

**Priority**: Medium  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plans 1-4  
**Affects**: DonationsSection with quarterly data table and asset breakdown chart

## Overview

Make the DonationsSection fully responsive, including metric cards, quarterly breakdown table with heatmap, and
paginated asset breakdown bar chart.

## Files to Modify

1. `apps/overview/src/components/ui/stats/DonationsSection.tsx`
2. `apps/overview/src/components/ui/stats/PaginatedAssetChart.tsx` (verify responsiveness)

## Current Issues

- Quarterly table has 5 columns that may be cramped on mobile
- Table needs horizontal scroll on narrow screens
- Metric cards grid needs responsive breakpoints
- Bar chart may need height adjustment

## Target Responsive Behavior

### Metrics Grid

- **Mobile (< 640px)**: 2 columns
- **Tablet (640-1024px)**: 2 columns
- **Desktop (≥ 1024px)**: 4 columns

### Table & Chart

- **Mobile (< 768px)**: Stack vertically, table with horizontal scroll
- **Desktop (≥ 768px)**: Side-by-side 2-column layout

### Table Columns

- Keep all 5 columns (Quarter, Donated, Count, Average, Median)
- Horizontal scroll on mobile
- Minimum column widths to prevent text wrapping

## Implementation Steps

### Step 1: Update DonationsSection.tsx

The file is already provided in the context. Update with responsive patterns:

```typescript
export function DonationsSection({ donationsData, barChartOptions, isLoading = false }: DonationsSectionProps) {
  // Existing helper functions remain...

  if (isLoading) {
    return (
      <section id='donations' className='scroll-mt-24'>
        <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
          Donations Overview
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
        <div className='grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2'>
          <SkeletonTable />
          <SkeletonChart />
        </div>
      </section>
    );
  }

  const ytdAvg = donationsData.ytdCount > 0 ? Math.round(donationsData.ytdDonated / donationsData.ytdCount) : 0;

  // Heatmap functions remain the same...

  return (
    <section id='donations' className='scroll-mt-24'>
      <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
        Donations Overview
      </h2>

      {/* First Row - Lifetime Metrics */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard title='Total Donated' value={donationsData.totalDonated} icon={DollarSign} prefix='$' />
        <MetricCard title='Total Donation Events' value={donationsData.totalDonations} icon={Activity} />
        <MetricCard title='Average Donation' value={donationsData.avgDonation} icon={BarChart3} prefix='$' />
        <MetricCard title='Median Donation' value={donationsData.medDonation} icon={PieChart} prefix='$' />
      </div>

      {/* Second Row - YTD Metrics */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard
          title='YTD Donated'
          value={donationsData.ytdDonated}
          change={donationsData.ytdDonatedChange}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='YTD Donation Events'
          value={donationsData.ytdCount}
          change={donationsData.ytdCountChange}
          icon={Activity}
        />
        <MetricCard
          title='YTD Avg Gift'
          value={ytdAvg}
          change={donationsData.ytdAvgChange}
          icon={BarChart3}
          prefix='$'
        />
        <MetricCard
          title='YTD Median'
          value={donationsData.ytdMedian}
          change={donationsData.ytdMedChange}
          icon={PieChart}
          prefix='$'
        />
      </div>

      {/* Quarterly Table and Asset Chart - Responsive Layout */}
      <div className='grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2'>
        {/* Quarterly Breakdown Table with Horizontal Scroll */}
        <Card className='overflow-hidden shadow-lg flex flex-col max-h-[500px] md:max-h-[600px]'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Quarterly Breakdown
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Donation metrics by quarter
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0 flex-1 flex flex-col min-h-0'>
            {donationsData.quarterlyData.length > 0 ? (
              <div className='overflow-x-auto flex-1'>
                <Table containerClassName='min-w-full'>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border-b-2 border-slate-200/50 dark:border-slate-700/50'>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-left whitespace-nowrap min-w-[100px]'>
                        Quarter
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right whitespace-nowrap min-w-[120px]'>
                        Donated
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
                    {donationsData.quarterlyData.map(quarter => {
                      const heatmapColor = getHeatmapColor(quarter.donated || 0);
                      return (
                        <TableRow
                          key={quarter.quarter}
                          style={{ backgroundColor: heatmapColor }}
                          className='border-b border-slate-100 dark:border-slate-700 transition-all duration-200 hover:brightness-95 dark:hover:brightness-110 hover:shadow-sm group'
                        >
                          <TableCell className='font-semibold text-slate-800 dark:text-slate-200 py-3 md:py-4 px-4 md:px-6 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap text-sm'>
                            {quarter.quarter}
                          </TableCell>
                          <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 whitespace-nowrap text-sm'>
                            <span className='bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-bold'>
                              {formatCurrency(quarter.donated || 0)}
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

        {/* Asset Breakdown Bar Chart */}
        <Card className='overflow-hidden shadow-lg flex flex-col max-h-[500px] md:max-h-[600px]'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Donations by Asset Type
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Breakdown of donations by asset class (sorted by amount)
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 flex-1 min-h-0'>
            <div className='h-full'>
              <PaginatedAssetChart
                data={donationsData.assetBreakdown}
                itemsPerPage={15}
                chartOptions={barChartOptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

### Step 2: Verify PaginatedAssetChart Responsiveness

Check `apps/overview/src/components/ui/stats/PaginatedAssetChart.tsx` to ensure:

1. Chart height is responsive
2. Pagination controls work on mobile
3. Bar labels don't overlap on narrow screens

If needed, add responsive height:

```typescript
<div className='h-[300px] sm:h-[400px] md:h-[450px]'>
  <Chart {...props} height='100%' />
</div>
```

And ensure pagination buttons have adequate touch targets:

```typescript
<button className='min-w-[44px] min-h-[44px] px-3 py-2 ...'>
```

## Testing Checklist

### Layout

- [ ] Section header scales appropriately
- [ ] Lifetime metrics in 2 columns on mobile, 4 on desktop
- [ ] YTD metrics in 2 columns on mobile, 4 on desktop
- [ ] Table and chart stack vertically on mobile
- [ ] Table and chart side-by-side on desktop
- [ ] Gaps consistent at all sizes

### Quarterly Table

- [ ] Table scrolls horizontally on narrow screens
- [ ] All 5 columns visible (no hidden data)
- [ ] Headers aligned with data
- [ ] Minimum column widths prevent squashing
- [ ] Heatmap colors visible
- [ ] Heatmap works in both themes
- [ ] Hover state works on desktop
- [ ] Touch scrolling smooth on mobile
- [ ] No double scrollbars
- [ ] Quarter labels readable
- [ ] Currency values formatted correctly
- [ ] Gradient text effect on donated column
- [ ] Empty state shows when no data

### Asset Breakdown Chart

- [ ] Chart renders at appropriate height
- [ ] Pagination controls visible and tappable
- [ ] Bar labels readable
- [ ] Bar colors distinguishable
- [ ] Tooltips work on hover/touch
- [ ] Asset logos visible (if shown)
- [ ] Works in both light and dark mode
- [ ] Empty state shows when no data

### Metric Cards

- [ ] Values format correctly
- [ ] Change indicators show with correct colors
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

1. **No quarterly data**: Empty state should show
2. **Many quarters**: Table should scroll smoothly
3. **Very large donation amounts**: Currency formatting handles millions/billions
4. **Many asset types**: Pagination should handle gracefully
5. **Single asset type**: Chart should still render
6. **Zero values**: Should show $0 not error

## Performance Considerations

- Quarterly table may have many rows (years of data)
- Consider showing recent N quarters by default with "show all" option
- Heatmap color calculations should be memoized
- Bar chart pagination prevents rendering too many bars at once
- Horizontal scroll should use native overflow (GPU accelerated)

## Accessibility

- Table has semantic HTML structure
- Headers clearly labeled
- Heatmap doesn't rely solely on color (values still visible)
- Pagination controls keyboard accessible
- Empty states have clear messages
- Horizontal scroll indicated (shadows optional)
- Touch-friendly scroll area for table

## Optional Enhancements

### Sticky Table Headers

Make headers sticky during vertical scroll:

```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: inherit;
}
```

### Scroll Indicators

Add visual cues for horizontal scroll:

- Fade/shadow on right edge when not scrolled to end
- Fade/shadow on left edge when scrolled past start

These are optional and can be added for better UX after basic functionality works.
