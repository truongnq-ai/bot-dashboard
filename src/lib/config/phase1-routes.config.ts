/**
 * Phase 1 Allowed Routes Configuration
 * 
 * Defines which routes are accessible in Phase 1.
 * Routes not in this list will be blocked by middleware.
 */

// Exact match routes
const PHASE1_ALLOWED_ROUTES = [
  '/dashboard',
  '/profile',
  '/content/chapters',
  '/content/skills',
  '/content/questions',
  '/content/exercises',
  '/content/exercises/create',
  '/users/students',
  '/users/parents',
  '/users/admins',
] as const;

// Pattern-based routes (dynamic segments)
// Order matters: more specific patterns should come first
const PHASE1_ALLOWED_PATTERNS = [
  /^\/content\/exercises\/[^/]+\/edit$/,    // /content/exercises/[id]/edit (must come before [id] pattern)
  /^\/content\/questions\/[^/]+$/,         // /content/questions/[id]
  /^\/content\/exercises\/[^/]+$/,        // /content/exercises/[id]
] as const;

/**
 * Check if a route is allowed in Phase 1
 */
export function isPhase1AllowedRoute(pathname: string): boolean {
  // Check exact match first
  if (PHASE1_ALLOWED_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // Explicitly block known non-Phase 1 routes that might match patterns
  // This prevents routes like /content/exercises/create-from-json from matching the [id] pattern
  if (pathname === '/content/exercises/create-from-json') {
    return false;
  }
  
  // Block /review routes (e.g., /content/exercises/123/review)
  if (pathname.endsWith('/review')) {
    return false;
  }
  
  // Block /ai-quality and /system routes
  if (pathname.startsWith('/ai-quality') || pathname.startsWith('/system')) {
    return false;
  }
  
  // Block /users/trial
  if (pathname === '/users/trial') {
    return false;
  }
  
  // Block /content/prompt-templates
  if (pathname === '/content/prompt-templates') {
    return false;
  }
  
  // Check pattern match (order matters - specific patterns first)
  return PHASE1_ALLOWED_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Get list of blocked route prefixes (for reference)
 */
export const PHASE1_BLOCKED_PREFIXES = [
  '/users/trial',
  '/content/exercises/create-from-json',
  '/content/exercises/',
  '/content/prompt-templates',
  '/ai-quality',
  '/system',
] as const;

