const TASK_STATES = [
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

const PRIORITY_LEVELS = [
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


module.exports = {
    TASK_STATES,
    PRIORITY_LEVELS
};
