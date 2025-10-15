# Sub-Plan 1: Navigation & Layout System

**Priority**: High (Foundation)  
**Estimated Complexity**: Medium  
**Dependencies**: None  
**Affects**: Core navigation experience

## Overview

Transform the fixed desktop sidebar into a responsive navigation system with a mobile hamburger menu. The hamburger menu
will use the same glass-morphism styling as the navigation bar and include status indicators and theme controls.

## Files to Modify

1. `apps/overview/src/components/tabs/OverviewTab.tsx` - Main layout with sidebar
2. `apps/overview/src/components/ui/DashboardLayout.tsx` - Header with status/theme
3. Create: `apps/overview/src/components/ui/MobileMenu.tsx` - New hamburger menu component

## Current State

### OverviewTab.tsx (lines 280-314)

```typescript
<aside className='w-64 fixed left-0 top-[72px] h-[calc(100vh-72px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-colors duration-300'>
  <div className='p-4'>
    <h3 className='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 transition-colors duration-300'>
      Sections
    </h3>
    <nav className='space-y-1'>
      {sidebarSections.map(section => (
        <button onClick={() => scrollToSection(section.id)}>
          {/* Navigation items */}
        </button>
      ))}
    </nav>
  </div>
</aside>
```

### DashboardLayout.tsx (lines 215-254)

Header shows status indicators and theme toggle on all screen sizes.

## Target State

### Mobile (< 768px)

- Hide fixed sidebar
- Show hamburger button in top-left
- Header shows only logo and hamburger
- Status/theme moved into hamburger menu

### Tablet/Desktop (≥ 768px)

- Show fixed sidebar as current
- Hide hamburger button
- Header shows all controls as current

## Implementation Steps

### Step 1: Create MobileMenu Component

Create `apps/overview/src/components/ui/MobileMenu.tsx`:

```typescript
'use client';

import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { RefreshDataPopover } from './RefreshDataPopover';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useGBQData } from '../../providers/GBQDataProvider';

interface MobileMenuProps {
  sections: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function MobileMenu({ sections, activeSection, onSectionClick }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveredLastUpdate, setIsHoveredLastUpdate] = useState(false);
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);

  const { isConnected, lastUpdated, isLoading, refreshData } = useGBQData();

  // Close menu on section click
  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsOpen(false);
  };

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const showPopover = isHoveredLastUpdate || isPopoverHovered;

  return (
    <>
      {/* Hamburger Button - Fixed top-left */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        ) : (
          <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-[55] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`
          md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] z-[60]
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
          border-r border-slate-200/50 dark:border-slate-700/50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto
        `}
      >
        {/* Header space for close button */}
        <div className="h-16" />

        {/* Status Section */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            System Status
          </h3>

          {/* Last Update */}
          <div
            className="mb-3 relative"
            onMouseEnter={() => setIsHoveredLastUpdate(true)}
            onMouseLeave={() => setIsHoveredLastUpdate(false)}
          >
            <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Update</div>
              <div className="font-medium">{formatLastUpdated(lastUpdated)}</div>
            </div>
            <RefreshDataPopover
              onRefresh={refreshData}
              isHovered={showPopover}
              onPopoverHover={setIsPopoverHovered}
            />
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : isConnected ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-slate-600 dark:text-slate-300">
              {isLoading ? 'Fetching Data...' : isConnected ? 'Data Fetched' : 'Fetching Failed'}
            </span>
          </div>

          {/* Theme Toggle */}
          <div className="mt-3 flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
            <span className="text-sm text-slate-600 dark:text-slate-300">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Sections
          </h3>
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-3 text-sm rounded-md transition-all duration-200
                    ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{section.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
```

### Step 2: Update OverviewTab.tsx

Modify `apps/overview/src/components/tabs/OverviewTab.tsx`:

1. Import the new MobileMenu component:

```typescript
import { MobileMenu } from '../ui/MobileMenu';
```

2. Replace the sidebar and content wrapper (lines 279-378):

```typescript
return (
  <div className='flex relative'>
    {/* Mobile Menu */}
    <MobileMenu
      sections={sidebarSections}
      activeSection={activeSection}
      onSectionClick={scrollToSection}
    />

    {/* Desktop Sidebar Navigation */}
    <aside className='hidden md:block w-64 fixed left-0 top-[72px] h-[calc(100vh-72px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-colors duration-300'>
      <div className='p-4'>
        <h3 className='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 transition-colors duration-300'>
          Sections
        </h3>
        <nav className='space-y-1'>
          {sidebarSections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                type='button'
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-200
                  ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}>
                <div className='flex items-center'>
                  <Icon className='h-4 w-4 mr-3' />
                  <span>{section.label}</span>
                </div>
                {!!isActive && <ChevronRight className='h-4 w-4' />}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>

    {/* Main Content */}
    <div className='flex-1 md:ml-64 px-4 md:px-6 py-6 md:py-8'>
      {/* Sections remain the same */}
    </div>
  </div>
);
```

### Step 3: Update DashboardLayout.tsx

Modify `apps/overview/src/components/ui/DashboardLayout.tsx` to hide status/theme on mobile:

Replace the header controls section (lines 215-254) with:

```typescript
{/* Right side controls - hide on mobile */}
<div className='hidden md:flex items-center space-x-4 px-6'>
  <div
    className='relative'
    onMouseEnter={() => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsHoveredLastUpdate(true);
    }}
    onMouseLeave={() => {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveredLastUpdate(false);
      }, 150);
    }}>
    <div className='text-sm text-slate-600 dark:text-slate-300 font-body bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors duration-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700'>
      Last Update: {formatLastUpdated(lastUpdatedDate)}
    </div>
    <RefreshDataPopover
      onRefresh={refreshData}
      isHovered={showPopover}
      onPopoverHover={setIsPopoverHovered}
    />
  </div>
  {/* GBQ Connection Status */}
  <div className='flex items-center space-x-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4 transition-colors duration-300'>
    {isLoading ? (
      <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />
    ) : isConnected ? (
      <CheckCircle className='w-4 h-4 text-green-500' />
    ) : (
      <AlertCircle className='w-4 h-4 text-red-500' />
    )}
    <div className='text-sm text-slate-600 dark:text-slate-300 font-body transition-colors duration-300'>
      {isLoading ? 'Fetching Data...' : isConnected ? 'Data Fetched' : 'Fetching Failed'}
    </div>
  </div>
  {/* Theme Toggle */}
  <ThemeToggle />
</div>
```

Also update the logo section (lines 82-214) to add left padding on mobile for hamburger:

```typescript
<div className='flex items-center space-x-4 pl-16 md:pl-[30px] pr-6'>
  {/* Logo SVG */}
</div>
```

## Testing Checklist

- [ ] Hamburger button appears on mobile (< 768px)
- [ ] Hamburger button hidden on desktop (≥ 768px)
- [ ] Menu slides in/out smoothly
- [ ] Menu has correct glass-morphism styling (blur/transparency)
- [ ] Menu overlay darkens background
- [ ] Clicking overlay closes menu
- [ ] Pressing Escape closes menu
- [ ] Status indicators show in mobile menu
- [ ] Theme toggle works in mobile menu
- [ ] Last update with refresh popover works in mobile menu
- [ ] Navigation items scroll to correct sections
- [ ] Active section highlights correctly
- [ ] Menu closes after selecting a section
- [ ] Body scroll locked when menu open
- [ ] Desktop sidebar still works as before
- [ ] Desktop header shows all controls
- [ ] Touch targets are at least 44x44px
- [ ] Dark mode works properly
- [ ] Transitions are smooth

## Edge Cases

1. **Long section names**: Ensure text wraps or truncates appropriately
2. **Many sections**: Menu should scroll if needed
3. **Rapid toggling**: Prevent animation glitches with proper state management
4. **Small screens (< 320px)**: Menu should use max-w-[85vw] to not cover entire screen

## Performance Notes

- Use CSS transforms for slide animation (GPU accelerated)
- Prevent body scroll when menu open
- Clean up event listeners on unmount
- Debounce resize events if needed

## Accessibility

- Hamburger button has aria-label
- Menu can be closed with Escape key
- Touch targets meet minimum size (44x44px)
- Focus management when opening/closing menu
- Proper semantic HTML (nav, button elements)
