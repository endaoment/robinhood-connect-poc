# Sub-Plan 4: Portfolios Section Responsiveness

**Priority**: Medium  
**Estimated Complexity**: Medium  
**Dependencies**: Sub-Plans 1-3  
**Affects**: PortfoliosSection with asset distribution and trade data

## Overview

Make the PortfoliosSection fully responsive, including metric cards, asset distribution pie chart, and portfolio trades
table. Focus on making the table horizontally scrollable on mobile.

## Files to Modify

1. `apps/overview/src/components/ui/stats/PortfoliosSection.tsx`
2. Possibly: `apps/overview/src/components/ui/Table.tsx` (if horizontal scroll not already supported)

## Current Issues

- Grid layouts may not stack appropriately
- Tables may overflow on narrow screens
- Multiple columns of metric cards need responsive breakpoints
- Chart sizing needs adjustment for mobile

## Target Responsive Behavior

### Metrics Grid

- **Mobile (< 640px)**: 2 columns
- **Tablet (640-1024px)**: 3 columns
- **Desktop (≥ 1024px)**: 4 columns

### Charts & Tables

- **Mobile (< 768px)**: Stack vertically, horizontal scroll for table
- **Desktop (≥ 768px)**: Side-by-side layout where appropriate

### Table

- Horizontal scroll wrapper on mobile
- Sticky first column (optional enhancement)
- Minimum column widths to prevent squashing

## Implementation Steps

### Step 1: Update PortfoliosSection.tsx

Find the file and update with responsive patterns:

```typescript
export function PortfoliosSection({
  portfoliosData,
  portfolioTrades,
  pieChartOptions,
  isLoading = false,
}: PortfoliosSectionProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <section id='portfolios' className='scroll-mt-24'>
        <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
          Portfolios Overview
        </h2>
        <div className='grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6 md:mb-8'>
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2'>
          <SkeletonChart />
          <SkeletonTable />
        </div>
      </section>
    );
  }

  return (
    <section id='portfolios' className='scroll-mt-24'>
      <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
        Portfolios Overview
      </h2>

      {/* Metric Cards - Responsive Grid */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard
          title='Total Portfolio Assets'
          value={portfoliosData.totalAssets}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='Idle USDC'
          value={portfoliosData.idleUSD}
          icon={Wallet}
          prefix='$'
        />
        <MetricCard
          title='Portfolio Efficiency'
          value={portfoliosData.portfolioEfficiency}
          icon={TrendingUp}
          suffix='%'
        />
        <MetricCard
          title='Available Portfolios'
          value={portfoliosData.availablePortfolios}
          icon={PieChart}
        />
        <MetricCard
          title='Total Trade Volume'
          value={portfoliosData.totalTradeVolume}
          icon={Activity}
          prefix='$'
        />
        <MetricCard
          title='Avg. Trade Size'
          value={portfoliosData.avgTradeSize}
          icon={BarChart3}
          prefix='$'
        />
        <MetricCard
          title='Total Protocol Revenue'
          value={portfoliosData.totalRevenue}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='Crypto Exposure'
          value={portfoliosData.cryptoExposure}
          icon={TrendingUp}
          suffix='%'
        />
      </div>

      {/* Asset Distribution and Trades - Responsive Layout */}
      <div className='grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2'>
        {/* Asset Distribution Pie Chart */}
        <Card className='overflow-hidden shadow-lg flex flex-col'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Asset Distribution
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Breakdown of portfolio assets by type
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/30 flex-1'>
            <div className='h-[350px] sm:h-[400px]'>
              {portfoliosData.distribution.length > 0 ? (
                <Chart
                  key={`portfolio-distribution-${theme}`}
                  options={pieChartOptions(
                    portfoliosData.distribution,
                    'Portfolio Assets',
                    {
                      label: 'Total Assets',
                      value: portfoliosData.totalAssets,
                      format: 'currency',
                    }
                  )}
                  series={portfoliosData.distribution.map(item => item.value)}
                  type='donut'
                  height='100%'
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-400 dark:text-slate-500'>
                  No asset distribution data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Portfolio Trades - Table with Horizontal Scroll */}
        <Card className='overflow-hidden shadow-lg flex flex-col'>
          <CardHeader className='bg-slate-100 dark:bg-slate-800/50'>
            <CardTitle className='text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 font-title'>
              Recent Portfolio Trades
            </CardTitle>
            <CardDescription className='text-xs md:text-sm text-slate-600 dark:text-slate-400 font-body'>
              Latest 20 trades across all portfolios
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0 flex-1 flex flex-col min-h-0'>
            {portfolioTrades && portfolioTrades.length > 0 ? (
              <div className='overflow-x-auto flex-1'>
                <Table containerClassName='min-w-full'>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border-b-2 border-slate-200/50 dark:border-slate-700/50'>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-4 px-4 md:px-6 text-left whitespace-nowrap'>
                        Date
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-4 px-4 md:px-6 text-left whitespace-nowrap'>
                        Portfolio
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-4 px-4 md:px-6 text-left whitespace-nowrap'>
                        Type
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-4 px-4 md:px-6 text-right whitespace-nowrap'>
                        Amount
                      </TableHead>
                      <TableHead className='font-bold text-slate-700 dark:text-slate-300 py-4 px-4 md:px-6 text-right whitespace-nowrap'>
                        Fee
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className='bg-white/30 dark:bg-slate-900/30'>
                    {portfolioTrades.slice(0, 20).map((trade, index) => (
                      <TableRow
                        key={index}
                        className='border-b border-slate-100 dark:border-slate-700 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      >
                        <TableCell className='font-medium text-slate-800 dark:text-slate-200 py-3 md:py-4 px-4 md:px-6 whitespace-nowrap text-sm'>
                          {new Date(trade.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 whitespace-nowrap text-sm'>
                          {trade.portfolioName}
                        </TableCell>
                        <TableCell className='py-3 md:py-4 px-4 md:px-6 whitespace-nowrap text-sm'>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              trade.tradeType === 'BUY'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}
                          >
                            {trade.tradeType}
                          </span>
                        </TableCell>
                        <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium whitespace-nowrap text-sm'>
                          {formatCurrency(trade.amount)}
                        </TableCell>
                        <TableCell className='text-slate-700 dark:text-slate-300 py-3 md:py-4 px-4 md:px-6 text-right font-medium whitespace-nowrap text-sm'>
                          {formatCurrency(trade.fee)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='flex items-center justify-center flex-1 text-slate-400 dark:text-slate-500 p-6'>
                No trade data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

### Step 2: Ensure Table Component Supports Horizontal Scroll

Verify `apps/overview/src/components/ui/Table.tsx` has proper scroll support:

```typescript
// In Table.tsx, ensure the container has overflow handling:
export function Table({ children, containerClassName }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', containerClassName)}>
      <table className='w-full'>
        {children}
      </table>
    </div>
  );
}
```

### Step 3: Add Mobile-Specific Table Styles

Consider reducing padding on mobile in the table cells:

- Desktop: `px-6 py-4`
- Mobile: `px-4 py-3`

This is already included in the implementation above with `px-4 md:px-6` and `py-3 md:py-4`.

## Testing Checklist

### Layout

- [ ] Section header scales appropriately
- [ ] Metric cards in 2 columns on mobile
- [ ] Metric cards in 3 columns on tablet
- [ ] Metric cards in 4 columns on desktop
- [ ] Chart and table stack vertically on mobile
- [ ] Chart and table side-by-side on desktop
- [ ] Gaps are consistent at all sizes

### Asset Distribution Chart

- [ ] Chart renders correctly at all sizes
- [ ] Legend positioned appropriately (bottom on mobile)
- [ ] Tooltip works on hover/touch
- [ ] Colors distinguishable in both themes
- [ ] Chart height appropriate for container
- [ ] Empty state shows when no data

### Trades Table

- [ ] Table scrolls horizontally on narrow screens
- [ ] All columns visible (no hidden data)
- [ ] Headers stay aligned with data
- [ ] Date format readable
- [ ] Trade type badges colored correctly
- [ ] Currency values formatted properly
- [ ] Hover state works on desktop
- [ ] No double scrollbars
- [ ] Padding appropriate on mobile
- [ ] Text sizes readable
- [ ] Empty state shows when no data

### Metric Cards

- [ ] Values format correctly (compact when needed)
- [ ] Icons visible
- [ ] Percentages show with % suffix
- [ ] Currency shows $ prefix
- [ ] No overflow

### General

- [ ] No horizontal scroll (except table)
- [ ] Loading skeletons match layout
- [ ] Dark mode works
- [ ] Smooth transitions
- [ ] Scroll-to-section works

## Edge Cases

1. **No trades**: Empty state message should be clear
2. **Very long portfolio names**: Should truncate or wrap
3. **Large numbers**: Currency formatting should handle millions/billions
4. **Small trade amounts**: Should show decimal places
5. **Many asset types**: Pie chart legend may need scrolling

## Performance Considerations

- Table with 20 rows should render quickly
- Consider virtualization if showing more rows
- Chart rendering may take time on low-end devices
- Horizontal scroll should be smooth (use native overflow)

## Accessibility

- Table has semantic HTML (thead, tbody, th, td)
- Headers clearly labeled
- Trade type badges use color and text
- Empty states have clear messages
- Horizontal scroll indicated (shadows/fade on edges optional)
- Touch-friendly scroll area

## Optional Enhancements

### Sticky First Column in Table

For better mobile UX, make the date column sticky:

```css
/* In TableCell for first column */
.sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
}
```

### Scroll Shadows

Add visual indicator when table is scrollable:

```typescript
// Use a scroll shadow component or CSS gradient overlay
```

These enhancements are optional and can be added after basic responsiveness is confirmed working.
