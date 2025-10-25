/**
 * Client-side polyfills
 * 
 * CRITICAL: This file must be imported FIRST in layout.tsx
 * before any other imports that use decorators.
 * 
 * Purpose:
 * - Loads reflect-metadata polyfill for class-validator/class-transformer decorators
 * - Ensures Reflect.getMetadata is available in browser environment
 * 
 * Why needed:
 * - NestJS-style DTOs use decorators that require Reflect API
 * - Next.js doesn't include reflect-metadata by default
 * - Must load before any decorated classes are imported
 */

import 'reflect-metadata'

