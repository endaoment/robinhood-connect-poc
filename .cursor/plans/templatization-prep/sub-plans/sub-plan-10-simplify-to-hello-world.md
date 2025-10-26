# Sub-Plan 10: Simplify to Hello World

**Status**: Pending  
**Priority**: High  
**Dependencies**: Sub-Plan 9 (Robinhood content removed)  
**Estimated Complexity**: Medium  
**Location**: blank-poc repository

---

## Context Required

**Note**: This sub-plan is executed in the **blank-poc repository** after SP9.

### Current State (After SP9)

**Directory Structure:**
```
onramp/
├── app/
│   ├── (routes)/
│   │   ├── dashboard/        # Robinhood asset selector - REMOVE
│   │   └── callback/         # Robinhood callback handler - REMOVE
│   ├── api/robinhood/        # POC-only API routes - REMOVE
│   ├── components/
│   │   ├── asset-*.tsx       # Robinhood components - REMOVE
│   │   └── ui/               # shadcn/ui - KEEP
│   ├── hooks/
│   │   └── use-asset-selection.ts  # Robinhood hook - REMOVE
│   └── lib/                  # Frontend utils - KEEP
```

### Target State

**Simplified Structure:**
```
onramp/
├── app/
│   ├── page.tsx              # Hello world landing
│   ├── components/
│   │   └── ui/               # shadcn/ui components (keep)
│   ├── lib/                  # Frontend utilities (keep)
│   ├── globals.css           # Styles (simplified)
│   └── layout.tsx            # Root layout (keep)
```

---

## Objectives

1. Remove Robinhood-specific routes and pages
2. Create simple hello world landing page
3. Remove Robinhood-specific components
4. Keep shared UI components (shadcn/ui)
5. Remove API routes
6. Simplify to minimal functional app
7. Demonstrate template structure without complexity

---

## Precise Implementation Steps

### Step 1: Remove Robinhood Routes

**Action**: Delete dashboard and callback routes

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/app

# Remove route directories
git rm -r "(routes)/dashboard"
git rm -r "(routes)/callback"

# Remove entire routes group if empty
git rm -r "(routes)"

# Verify
ls -la
```

**Validation:**
- [ ] `(routes)/` directory removed
- [ ] No dashboard or callback routes

---

### Step 2: Remove API Routes

**Action**: Delete all POC-only API routes

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/app

# Remove API directory
git rm -r api/

# Verify
ls -la
```

**Validation:**
- [ ] `api/` directory removed
- [ ] No API route files remain

---

### Step 3: Remove Robinhood-Specific Components

**Action**: Delete provider-specific components, keep shared UI

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/app/components

# Remove Robinhood-specific components
git rm asset-card.tsx
git rm asset-icon.tsx
git rm asset-registry-toast.tsx
git rm asset-selector-example.tsx
git rm asset-selector.tsx

# Keep ui/ directory (shadcn/ui components)
# Keep theme-provider.tsx if present

# Verify what remains
ls -la
```

**Expected to Keep:**
- `ui/` - All shadcn/ui components
- `theme-provider.tsx` - If exists

**Validation:**
- [ ] Asset-specific components removed
- [ ] `ui/` directory preserved
- [ ] Only shared components remain

---

### Step 4: Remove Robinhood-Specific Hooks

**Action**: Delete provider-specific hooks

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/app/hooks

# Remove Robinhood hooks
git rm use-asset-selection.ts

# Keep shared hooks
# Keep use-toast.ts or similar if present

# Verify
ls -la
```

**Validation:**
- [ ] Provider-specific hooks removed
- [ ] Shared hooks kept (use-toast, use-mobile, etc.)

---

### Step 5: Remove Robinhood Types

**Action**: Delete provider-specific type definitions

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/app

# Remove types directory if it contains only Robinhood types
if [ -d "types" ]; then
  git rm -r types/
fi

# Verify
ls -la
```

**Validation:**
- [ ] `types/` directory removed if Robinhood-specific

---

### Step 6: Create Hello World Landing Page

**Action**: Create simple, welcoming landing page

**File**: `/Users/rheeger/Code/endaoment/blank-poc/onramp/app/page.tsx`

**Replace with:**
```typescript
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to blank-poc
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A template for rapid API integration POC development with backend migration readiness
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Start</CardTitle>
              <CardDescription>Get up and running in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Clone this template, customize for your provider, and build your integration with production-ready patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏗️ Backend Ready</CardTitle>
              <CardDescription>Migration-ready architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                NestJS modules in <code className="text-xs bg-muted px-1 py-0.5 rounded">libs/</code> designed for direct copy to endaoment-backend.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧩 Shared Components</CardTitle>
              <CardDescription>shadcn/ui included</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Beautiful, accessible components ready to use. Build your UI quickly with best practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📚 Comprehensive Docs</CardTitle>
              <CardDescription>Everything you need</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Architecture, testing, migration guides and more in the <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/</code> directory.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button asChild size="lg">
            <Link href="/docs/QUICK-START.md">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://github.com/endaoment/blank-poc" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Template Info */}
        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>
            Built with Next.js 14, NestJS, shadcn/ui, and Tailwind CSS
          </p>
          <p className="mt-2">
            See{' '}
            <Link href="../TEMPLATE-USAGE.md" className="underline">
              TEMPLATE-USAGE.md
            </Link>{' '}
            for customization guide
          </p>
        </div>
      </div>
    </main>
  )
}
```

**Validation:**
- [ ] Simple, welcoming page
- [ ] Uses shadcn/ui components
- [ ] Links to documentation
- [ ] Template-focused messaging

---

### Step 7: Simplify Root Layout

**Action**: Keep layout simple and generic

**File**: `/Users/rheeger/Code/endaoment/blank-poc/onramp/app/layout.tsx`

**Update to:**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'blank-poc | POC Template',
  description: 'Rapid API integration POC development with backend migration readiness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Validation:**
- [ ] Generic title and description
- [ ] Simple, clean layout
- [ ] Theme provider kept

---

### Step 8: Simplify Global Styles

**Action**: Keep essential styles, remove provider-specific

**File**: `/Users/rheeger/Code/endaoment/blank-poc/onramp/app/globals.css`

**Keep:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Remove:**
- Any Robinhood-specific styles
- Asset-specific styles
- Dashboard-specific styles

**Validation:**
- [ ] Only shadcn/ui theming remains
- [ ] No provider-specific styles

---

### Step 9: Update Next.js Configuration

**Action**: Simplify next.config if needed

**File**: `/Users/rheeger/Code/endaoment/blank-poc/onramp/next.config.mjs`

**Review and Simplify:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove Robinhood-specific configurations
  // Keep essential settings
}

export default nextConfig
```

**Validation:**
- [ ] No provider-specific config
- [ ] Essential config preserved

---

### Step 10: Clean Up Public Assets

**Action**: Remove Robinhood-specific assets

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp/public

# Remove Robinhood assets if any
# Keep:
# - Placeholder images (generic)
# - favicon
# - Essential assets

# Example:
# git rm robinhood-logo.png
# git rm provider-specific-assets/

# Check what remains
ls -la
```

**Validation:**
- [ ] Only generic assets remain
- [ ] No provider-specific images/files

---

### Step 11: Update Package Scripts

**Action**: Ensure dev scripts work with simplified app

**File**: `/Users/rheeger/Code/endaoment/blank-poc/onramp/package.json`

**Verify Scripts:**
```json
{
  "scripts": {
    "dev": "next dev -p 3030",
    "build": "next build",
    "start": "next start -p 3030",
    "lint": "next lint",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

**Validation:**
- [ ] Scripts functional
- [ ] No Robinhood-specific scripts

---

### Step 12: Test Hello World App

**Action**: Verify app runs correctly

**Commands:**
```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# Visit http://localhost:3030
# Should see hello world page
```

**Validation:**
- [ ] App starts without errors
- [ ] Hello world page renders
- [ ] UI components work
- [ ] Theme switching works
- [ ] No console errors

---

## Deliverables Checklist

- [ ] Robinhood routes removed (dashboard, callback)
- [ ] API routes removed
- [ ] Provider-specific components removed
- [ ] shadcn/ui components preserved
- [ ] Provider-specific hooks removed
- [ ] Hello world landing page created
- [ ] Root layout simplified
- [ ] Global styles simplified
- [ ] Public assets cleaned
- [ ] App runs successfully
- [ ] Template-focused messaging

---

## Validation Steps

### Step 1: Directory Structure Check

```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Check app structure
tree app/ -L 2 -I 'node_modules'
```

**Expected Structure:**
```
app/
├── components/
│   ├── ui/              # shadcn/ui (many files)
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts
├── globals.css
├── layout.tsx
├── page.tsx             # Hello world
└── polyfills.ts (if needed)
```

---

### Step 2: Run Development Server

```bash
npm run dev
```

**Expected:**
- Server starts on port 3030
- No errors in console
- Visit http://localhost:3030
- See hello world page

---

### Step 3: Build Test

```bash
npm run build
```

**Expected:**
- Build succeeds
- No errors
- All pages compile

---

### Step 4: Search for Robinhood UI References

```bash
cd /Users/rheeger/Code/endaoment/blank-poc/onramp

# Search app directory for Robinhood
grep -r "robinhood" app/ --exclude-dir=node_modules -i
grep -r "asset" app/components/ --exclude-dir=node_modules -i | grep -v "ui/"
```

**Expected**: No Robinhood or asset-specific references in components (except in ui/)

---

## Backward Compatibility Checkpoint

**N/A** - This is template creation in new repository

---

## Common Issues and Solutions

### Issue 1: UI Components Missing

**Symptom**: Hello world page references missing components

**Solution**:
```bash
# Verify shadcn/ui components exist
ls -la app/components/ui/

# If missing, components may need to be kept
# Check which UI components page.tsx needs:
# - Button
# - Card (CardContent, CardDescription, CardHeader, CardTitle)

# Ensure these exist in ui/ directory
```

---

### Issue 2: Theme Provider Missing

**Symptom**: ThemeProvider not found

**Solution**:
```bash
# Check if theme-provider exists
ls -la app/components/theme-provider.tsx

# If missing, keep from original or create simple version
# Theme provider is useful for template
```

---

### Issue 3: Build Errors

**Symptom**: Next.js build fails

**Solution**:
- Check for broken imports
- Verify all referenced components exist
- Check tsconfig paths
- Run type checking: `npx tsc --noEmit`

---

## Integration Points

### With Sub-Plan 9

SP9 cleaned up libs/, this cleans up app/

**Receives from SP9:**
- Generic provider-api library
- Shared utilities
- Clean backend structure

**Provides:**
- Simplified frontend example
- Hello world demonstration
- Template UI patterns

### With Sub-Plan 11

SP11 will update documentation to match simplified app

**Handoff:**
- Simplified app structure
- Hello world page as example
- Ready for doc updates

---

## Next Steps

After completing this sub-plan:

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "templatization: SP10 - simplify to hello world

   - Removed Robinhood routes and pages
   - Removed API routes
   - Removed provider-specific components
   - Kept shadcn/ui components
   - Created hello world landing page
   - Simplified to minimal functional app
   
   App now serves as clean template example"
   ```

2. **Create Implementation Log**:
   - File: `implementation-logs/YYYYMMDD-HHMM-SP10-COMPLETE.md`
   - Document simplification
   - List removed components
   - Verify app works

3. **Test Thoroughly**:
   - Run dev server
   - Test build
   - Verify UI components
   - Check responsiveness

4. **Proceed to Sub-Plan 11**:
   - Update all documentation
   - Make docs template-focused
   - Remove implementation specifics

---

## Success Criteria

- [ ] All Robinhood routes removed
- [ ] API routes removed
- [ ] Provider-specific components removed
- [ ] shadcn/ui components preserved and working
- [ ] Hello world page welcoming and clear
- [ ] App runs without errors
- [ ] Build succeeds
- [ ] Template-focused messaging
- [ ] Clean, minimal codebase
- [ ] Ready for documentation updates (SP11)

---

**Estimated Time**: 45-60 minutes  
**Complexity**: Medium  
**Risk Level**: 🟢 Low - New repository, reversible changes

