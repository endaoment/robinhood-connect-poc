# Sub-Plan 7: Payouts Section & Map Responsiveness

**Priority**: Medium-High (Map is complex and high-value)  
**Estimated Complexity**: High  
**Dependencies**: Sub-Plans 1-6  
**Affects**: PayoutsSection and PayoutZipBubbleMap component

## Overview

Make the PayoutsSection and the interactive map component fully responsive. The map is particularly challenging as it
includes touch interactions, popups, and dynamic sizing.

## Files to Modify

1. `apps/overview/src/components/ui/stats/PayoutsSection.tsx`
2. `apps/overview/src/components/ui/PayoutZipBubbleMap.tsx`

## Current Issues

- Metric cards grid needs responsive breakpoints
- Map has fixed height calculations that may not work on mobile
- Map popups (org cards and cluster cards) may be too large for mobile
- Touch interactions on map need optimization
- Map controls may be too small for touch

## Target Responsive Behavior

### Metrics Grid

- **Mobile (< 640px)**: 2 columns
- **Tablet (640-1024px)**: 2 columns
- **Desktop (≥ 1024px)**: 4 columns

### Map

- **Mobile**:
  - Height: `calc(100vh - 400px)` min 500px, max 700px
  - Smaller popup cards
  - Larger touch targets for clusters/points
  - Simplified card layouts
- **Tablet**:
  - Height: `calc(100vh - 350px)` min 600px, max 900px
  - Medium popup cards
- **Desktop**:
  - Height: Current clamp(700px, calc(100vh - 500px), 1200px)
  - Full popup cards

## Implementation Steps

### Step 1: Update PayoutsSection.tsx

```typescript
export function PayoutsSection({ payoutsData, isLoading = false }: PayoutsSectionProps) {
  if (isLoading) {
    return (
      <section id='payouts' className='scroll-mt-24'>
        <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
          Payouts Overview
        </h2>
        <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section id='payouts' className='scroll-mt-24'>
      <h2 className='text-xl md:text-2xl font-bold tracking-tight mb-4 md:mb-6 text-slate-800 dark:text-slate-100 font-title'>
        Payouts Overview
      </h2>

      {/* Metric Cards - Responsive Grid */}
      <div className='grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8'>
        <MetricCard
          title='Total Paid Out'
          value={payoutsData.totalPaidOut}
          icon={DollarSign}
          prefix='$'
        />
        <MetricCard
          title='Total Transactions'
          value={payoutsData.totalTransactions}
          icon={Activity}
        />
        <MetricCard
          title='Successful Payouts'
          value={payoutsData.successfulCount}
          icon={CheckCircle}
        />
        <MetricCard
          title='Unique Recipient Orgs'
          value={payoutsData.uniqueRecipientOrgs}
          icon={Building2}
        />
      </div>

      {/* Map Section */}
      <div>
        <h3 className='text-base md:text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100'>
          Recipient Orgs by Location
        </h3>
        <p className='text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4'>
          Interactive map showing organizations that received payouts. Tap clusters to zoom, tap organizations to view details.
        </p>
        <div className='relative'>
          <PayoutZipBubbleMap data={orgPayouts} initialZoom={3.6} />
        </div>
      </div>
    </section>
  );
}
```

### Step 2: Update PayoutZipBubbleMap.tsx

This is a complex component. Key changes needed:

#### A. Responsive Map Height (lines 1163-1169)

Replace the map container div:

```typescript
<div
  className='rounded-lg border border-slate-200 dark:border-slate-700 h-full relative'
  style={{
    zIndex: 1,
    position: 'relative',
    // Responsive height calculation
    height: 'clamp(500px, calc(100vh - 300px), 1200px)',
  }}>
  {/* Map content */}
</div>
```

Update for mobile:

```typescript
<div
  className='rounded-lg border border-slate-200 dark:border-slate-700 h-full relative'
  style={{
    zIndex: 1,
    position: 'relative',
    height: 'min(calc(100vh - 250px), 700px)', // Mobile: shorter, desktop: taller
  }}>
  {/* Map content */}
</div>
```

Or use responsive classes:

```typescript
<div className='rounded-lg border border-slate-200 dark:border-slate-700 relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[900px]'>
```

#### B. Responsive Popup Cards

Update ClusterCard component (lines 1342-1441) for mobile:

```typescript
function ClusterCard({ placeName, count, amount, nteeCodes, theme }: ClusterCardProps) {
  const [hoveredNtee, setHoveredNtee] = useState<string | null>(null);

  return (
    <div
      className='bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 p-4 md:p-5'
      style={{
        zIndex: 1001,
        maxWidth: 'min(320px, 90vw)', // Smaller on mobile
        maxHeight: '85vh',
        overflow: 'visible',
      }}>
      {/* Header */}
      <div className='flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4'>
        <div className='flex-grow'>
          <h3 className='font-bold text-base md:text-xl font-title text-slate-900 dark:text-slate-100 mb-1'>
            {placeName}
          </h3>
          <div className='text-xs md:text-sm text-slate-500 dark:text-slate-400 font-sans'>
            {count} organization{count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Total Payouts */}
        <div className='text-right flex-shrink-0'>
          <div
            className='text-xl md:text-2xl font-bold font-title text-slate-900 dark:text-slate-100'
            style={{ fontFamily: 'var(--font-primary), GT Haptik, sans-serif' }}>
            {amount >= 1000000
              ? `$${(amount / 1000000).toFixed(2)}m`
              : amount >= 1000
                ? `$${(amount / 1000).toFixed(2)}k`
                : `$${amount.toFixed(2)}`}
          </div>
          <div className='text-xs font-semibold font-body text-slate-900 dark:text-slate-100' style={{ opacity: 0.75 }}>
            Total Payouts
          </div>
        </div>
      </div>

      {/* Causes Served */}
      {!!nteeCodes && nteeCodes.length > 0 && (
        <div className='pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700' style={{ overflow: 'visible' }}>
          <div className='text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-2 md:mb-3 font-sans font-semibold'>
            Causes Served
          </div>
          <div className='flex items-center gap-2 flex-wrap' style={{ overflow: 'visible' }}>
            {/* Show fewer icons on mobile */}
            {nteeCodes.slice(0, window.innerWidth < 640 ? 8 : 16).map((ntee, index) => {
              const NTEEImage = NTEECodes[ntee.code as keyof typeof NTEECodes] || NTEECodes.Z;
              return (
                <div
                  key={ntee.code}
                  className='relative'
                  style={{ overflow: 'visible' }}
                  onMouseEnter={() => setHoveredNtee(ntee.code)}
                  onMouseLeave={() => setHoveredNtee(null)}
                  onTouchStart={() => setHoveredNtee(ntee.code)}
                  onTouchEnd={() => setTimeout(() => setHoveredNtee(null), 2000)}>
                  <div className='w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer'>
                    <Image src={NTEEImage} alt={ntee.code} width={32} height={32} className='md:w-10 md:h-10 object-contain' />
                  </div>
                  {hoveredNtee === ntee.code && (
                    <div
                      className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:mb-3 px-2 md:px-3 py-1 md:py-2 text-xs font-medium rounded-md whitespace-nowrap pointer-events-none'
                      style={{
                        zIndex: 9999,
                        backgroundColor: theme === 'dark' ? '#334155' : '#1e293b',
                        color: '#ffffff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      }}>
                      {ntee.description}
                      <div
                        className='absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent'
                        style={{
                          borderTopColor: theme === 'dark' ? '#334155' : '#1e293b',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {nteeCodes.length > (window.innerWidth < 640 ? 8 : 16) && (
              <div className='w-10 h-10 md:w-12 md:h-12 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300'>
                +{nteeCodes.length - (window.innerWidth < 640 ? 8 : 16)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### C. Responsive OrgCard (lines 1444-1587)

Update OrgCard for mobile:

```typescript
function OrgCard({ org, theme }: { org: OrgPayoutMapData; theme: string }) {
  const nteeCode = getNTEEMajorCode(org.nteeCode);
  const NTEEImage = NTEECodes[nteeCode as keyof typeof NTEECodes] || NTEECodes.Z;

  // Truncate mission statement - shorter on mobile
  const maxLength = window.innerWidth < 640 ? 150 : 300;
  const missionStatement = org.description
    ? org.description.length > maxLength
      ? org.description.substring(0, maxLength) + '...'
      : org.description
    : null;

  return (
    <div
      className='bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600'
      style={{
        overflow: 'visible',
        zIndex: 1001,
        minWidth: 'min(300px, 85vw)',
        maxWidth: 'min(380px, 90vw)',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
      {/* NTEE Banner - Shorter on mobile */}
      <div
        className='relative flex items-center justify-center px-4 rounded-t-xl md:rounded-t-2xl'
        style={{
          backgroundImage: theme === 'dark' ? 'none' : 'url(/organizations-header-gradient.jpg)',
          backgroundSize: theme === 'dark' ? undefined : 'cover',
          backgroundPosition: theme === 'dark' ? undefined : 'center',
          height: '7rem', // 112px - shorter than desktop 150px
          overflow: 'visible',
        }}>
        {/* NTEE Icon */}
        <div className='flex-shrink-0'>
          <Image
            src={NTEEImage}
            alt={`NTEE ${nteeCode}`}
            width={64}
            height={64}
            className='md:w-20 md:h-20 opacity-95 drop-shadow-xl'
          />
        </div>
      </div>

      {/* Content with reduced padding on mobile */}
      <div className='px-4 md:px-5 pb-4 md:pb-5 relative' style={{ fontFamily: 'inherit' }}>
        {/* Logo and total - adjusted sizing */}
        <div className='flex items-end gap-3 md:gap-4 -mt-9 md:-mt-11 mb-3 md:mb-4'>
          {/* Org Logo */}
          <div className='w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0 p-1.5 relative z-10'>
            {org.logoUrl ? (
              <Image src={org.logoUrl} alt={org.orgName} width={64} height={64} className='md:w-20 md:h-20 object-contain' />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 flex items-center justify-center rounded-md md:rounded-lg'>
                <span className='text-xl md:text-2xl font-bold text-cyan-600 dark:text-cyan-400'>
                  {org.orgName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Total Payouts */}
          <div className='flex-grow text-right pb-1'>
            <h3 className='text-2xl md:text-3xl font-bold font-title mb-0.5 text-slate-900 dark:text-slate-100'>
              {org.totalPayouts >= 1000000
                ? `$${(org.totalPayouts / 1000000).toFixed(2)}m`
                : org.totalPayouts >= 1000
                  ? `$${(org.totalPayouts / 1000).toFixed(2)}k`
                  : `$${org.totalPayouts.toFixed(2)}`}
            </h3>
            <div
              className='text-xs font-semibold font-body text-slate-900 dark:text-slate-100'
              style={{ opacity: 0.75 }}>
              Total Payouts
            </div>
          </div>
        </div>

        {/* Organization Name */}
        <h4 className='font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1 text-left line-clamp-2'>
          {org.orgName}
        </h4>

        {/* NTEE Category */}
        {!!org.nteeDescription && (
          <p className='text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-2 md:mb-3 font-sans'>
            {org.nteeDescription}
          </p>
        )}

        {/* Mission Statement */}
        {!!missionStatement && (
          <p className='text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 font-sans leading-relaxed'>
            {missionStatement}
          </p>
        )}

        {/* Footer with EIN and Location */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-sans border-t border-slate-200 dark:border-slate-700 pt-2 md:pt-3 mb-2 md:mb-3'>
          <div>
            {!!org.ein && (
              <span className='not-italic'>
                EIN:{' '}
                <em className='not-italic' style={{ color: '#53acde', fontStyle: 'normal' }}>
                  {formatEin(org.ein as any)}
                </em>
              </span>
            )}
          </div>
          <div>
            {!!org.city && !!org.state && (
              <span style={{ color: '#53acde' }}>
                {org.city}, {org.state}
              </span>
            )}
          </div>
        </div>

        {/* View in App Button */}
        <div className='pt-2'>
          <a
            href={`https://app.endaoment.org/orgs/${org.ein ? org.ein : org.orgId}?ref=ov-map`}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full text-white text-sm md:text-base font-semibold py-2.5 md:py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl no-underline'
            style={{ backgroundColor: '#627deb', border: '2px solid #627deb' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#5368d4';
              e.currentTarget.style.borderColor = '#5368d4';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#627deb';
              e.currentTarget.style.borderColor = '#627deb';
            }}>
            View in App
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
```

#### D. Increase Touch Targets for Map Clusters/Points

In the Layer definitions (lines 1256-1280), increase the hit area radius on mobile:

```typescript
<Layer
  id='org-points-hit-area'
  type='circle'
  filter={['!', ['has', 'point_count']]}
  paint={{
    'circle-color': 'transparent',
    'circle-opacity': 0,
    // Larger hit area on mobile
    'circle-radius': ['+', ['get', 'radius'], window.innerWidth < 768 ? 20 : 15],
  }}
/>
```

## Testing Checklist

### Layout

- [ ] Section header scales appropriately
- [ ] Metric cards in 2 columns on mobile, 4 on desktop
- [ ] Map description text readable
- [ ] Map takes appropriate space on all screen sizes

### Map Container

- [ ] Map height appropriate on mobile (500-700px)
- [ ] Map height appropriate on tablet (600-900px)
- [ ] Map height appropriate on desktop (700-1200px)
- [ ] Map doesn't overflow container
- [ ] Rounded corners visible
- [ ] Border visible in both themes

### Map Interactions

- [ ] Pan works with touch
- [ ] Zoom works with pinch
- [ ] Clusters tappable (larger touch targets)
- [ ] Organization points tappable
- [ ] Double-tap to zoom works
- [ ] Zoom controls accessible and tappable
- [ ] No accidental zooms while scrolling page

### Cluster Popups

- [ ] Cards sized appropriately for mobile
- [ ] Cards don't overflow screen
- [ ] Text readable at all sizes
- [ ] NTEE icons appropriate size
- [ ] Fewer icons shown on mobile (8 vs 16)
- [ ] Touch to show tooltip works
- [ ] Cards positioned to stay on screen
- [ ] Close by tapping outside works

### Organization Popups

- [ ] Cards sized for mobile (max 90vw)
- [ ] Banner height shorter on mobile
- [ ] Logo size appropriate
- [ ] Text sizes scale down
- [ ] Mission statement truncated appropriately
- [ ] Footer stacks on very narrow screens
- [ ] View in App button tappable
- [ ] Cards scroll if content too long
- [ ] Cards positioned to stay on screen

### Map Points & Clusters

- [ ] Cluster circles visible
- [ ] Cluster counts readable
- [ ] Organization points visible
- [ ] Touch targets adequate (44x44px minimum)
- [ ] Colors work in both themes
- [ ] Hover states work on desktop
- [ ] Touch states work on mobile

### General

- [ ] No horizontal scroll
- [ ] Loading states work
- [ ] Dark mode works for map and popups
- [ ] Smooth transitions
- [ ] Scroll-to-section works
- [ ] Map legends/controls visible

## Edge Cases

1. **Very small screens (320px)**: Popups at max 90vw
2. **Landscape mobile**: Map height may need adjustment
3. **Many clusters in small area**: Touch targets may overlap
4. **Org cards with long names**: Text should wrap/truncate
5. **No location data**: Empty state or hidden map section

## Performance Considerations

- Map tiles may load slowly on mobile networks
- Consider lower zoom levels by default on mobile
- Reduce number of visible org points on mobile
- Lazy load map component when scrolled into view
- Debounce map move events
- Use passive touch event listeners

## Accessibility

- Map has descriptive title
- Clusters and points have appropriate ARIA labels
- Popup cards have semantic HTML
- Close button/area clearly indicated
- Keyboard navigation for map controls
- Touch targets meet minimum 44x44px
- Color contrast in popups meets WCAG AA
- Map instructions provided for screen readers

## Optional Enhancements

### Responsive Zoom Levels

```typescript
const initialZoom = window.innerWidth < 768 ? 3.0 : 3.6;
```

### Swipe to Close Popup on Mobile

Add swipe gesture to close pinned org card.

### Simplified Mobile View

Consider a list view toggle for mobile users who prefer not to use the map.

These enhancements can be added after basic responsiveness works.
