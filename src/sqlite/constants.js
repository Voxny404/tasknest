const dotenv = require('dotenv');
dotenv.config();

const DEFAULT_TASK_STATES = [
  "open", 
  "in-progress", 
  "closed", 
  "on-hold", 
  "waiting-for-review", 
  "completed", 
  "backlog", 
  "blocked", 
  "ready-for-testing", 
  "in-testing", 
  "under-investigation", 
  "escalated", 
  "reopened", 
  "archived", 
  "planned", 
  "in-design", 
  "deferred", 
  "in-review", 
  "done", 
  "waiting-for-approval", 
  "scheduled", 
  "in-preparation", 
  "pre-production", 
  "in-production", 
  "pending", 
  "ready-for-release", 
  "released", 
  "under-development", 
  "under-design", 
  "testing-failed", 
  "testing-passed", 
  "waiting-for-feedback", 
  "needs-information", 
  "resolved", 
  "resolved-but-not-verified", 
  "verified", 
  "cancelled", 
  "follow-up", 
  "in-progress-awaiting-response", 
  "under-evaluation"
];

const DEFAULT_PRIORITY_LEVELS = [
  "low", 
  "medium", 
  "high", 
  "critical", 
  "urgent", 
  "normal", 
  "important", 
  "routine", 
  "major", 
  "minor", 
  "essential", 
  "emergency"
];

const DEFAULT_CATEGORIES = [
  "frontend",
  "backend",
  "extension",
  "api",
  "database",
  "devops",
  "design",
  "testing",
  "security",
  "documentation",
  "performance",
  "research",
  "mobile",
  "ui/ux",
  "integration",
  "bug-fix",
  "feature-implementation",
  "refactoring",
  "technical-debt",
  "user-feedback",
  "user-story",
  "api-integration",
  "server",
  "deployment",
  "onboarding",
  "accessibility",
  "compliance",
  "scalability",
  "automation",
  "business-logic",
  "cloud",
  "analytics",
  "localization",
  "payment",
  "third-party",
  "seo",
  "content-management",
  "product-management",
  "customer-support",
  "marketing",
  "sales",
  "legal",
  "partnerships",
  "training",
  "audit",
  "legal-compliance",
  "community",
  "scripting",
  "data-migration",
  "monitoring",
  "other"
];

const DEFAULT_TYPES = [
  "bug",
  "feature",
  "task",
  "improvement",
  "refactor",
  "research",
  "maintenance",
  "documentation",
  "test",
  "deployment",
  "design",
  "code-review",
  "security",
  "support",
  "optimization",
  "analytics",
  "setup",
  "meeting",
  "integration",
  "planning",
  "migration",
  "training",
  "qa",
  "configuration",
  "troubleshooting",
  "research-spike",
  "hotfix",
  "rollback",
  "prototype",
  "demo",
  "onboarding",
  "offboarding",
  "legal",
  "compliance",
  "data-entry",
  "localization",
  "monitoring",
  "performance",
  "backup"
];

const AVAILABLE_ROLES = [
    "admin",
    "mayDeleteUsers",
    "mayCreateUsers",
    "mayCreateTasks",
    "mayEditTasks",
    "mayDeleteTasks",
    "mayEditUserRole"

]

function mergeUniqueDefaults(defaults, envVar) {
  const envValue = process.env[envVar];

  let extraValues = [];
  if (envValue && envValue.trim() !== '') {
    // If the environment variable is defined and non-empty, split and clean up values
    extraValues = envValue.split(',').map(v => v.trim()).filter(Boolean);
  } else if (envValue === undefined) {
    console.warn(`Warning: Environment variable '${envVar}' is not defined. Using default values only.`);
  } else {
    console.warn(`Warning: Environment variable '${envVar}' is empty. Using default values only.`);
  }

  // Put extraValues at the top, followed by defaults
  return Array.from(new Set([...extraValues, ...defaults]));  // Merges the extra values first
}

const TASK_STATES = mergeUniqueDefaults(DEFAULT_TASK_STATES, 'ADDITIONAL_TASK_STATES');
const PRIORITY_LEVELS = mergeUniqueDefaults(DEFAULT_PRIORITY_LEVELS, 'ADDITIONAL_PRIORITY_LEVELS');
const CATEGORIES = mergeUniqueDefaults(DEFAULT_CATEGORIES, 'ADDITIONAL_CATEGORIES');
const TYPES = mergeUniqueDefaults(DEFAULT_TYPES, 'ADDITIONAL_TYPES');

module.exports = {
    TASK_STATES,
    PRIORITY_LEVELS,
    AVAILABLE_ROLES,
    CATEGORIES,
    TYPES
};
