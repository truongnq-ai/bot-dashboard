/**
 * Phase 1 Feature Flags Configuration
 * 
 * Defines which features are enabled/disabled in Phase 1.
 * Used to disable business logic outside Phase 1 scope while keeping code intact.
 */

/**
 * Phase 1 Feature Flags
 * 
 * Set to false to disable features not in Phase 1 scope.
 * Code remains but actions are disabled (no-op or read-only).
 */
export const PHASE1_FEATURES = {
  // AI Generation - Enabled for Phase 1 (user confirmed to keep)
  AI_GENERATION: true,
  
  // Exercise Review Workflow - Disabled for Phase 1
  EXERCISE_REVIEW: false,
  
  // AI Quality / Scoring - Disabled for Phase 1
  AI_QUALITY_SCORING: false,
  
  // Prompt Template Management - Disabled for Phase 1
  PROMPT_TEMPLATES: false,
  
  // System Metrics / Health - Disabled for Phase 1
  SYSTEM_METRICS: false,
} as const;

/**
 * Check if a feature is enabled in Phase 1
 */
export function isPhase1FeatureEnabled(feature: keyof typeof PHASE1_FEATURES): boolean {
  return PHASE1_FEATURES[feature] === true;
}

