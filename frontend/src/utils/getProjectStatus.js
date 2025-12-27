import { calculateProjectProgress } from "./calculateProjectProgress";
import { calculateExpectedProgress } from "./calculateExpectedProgress";

export function getProjectStatus(projectTasks, projectMilestones) {
  const noTasks = !projectTasks || projectTasks.length === 0;
  const noMilestones = !projectMilestones || projectMilestones.length === 0;

  if (noTasks && noMilestones) return "No data";

  const actual = calculateProjectProgress(projectTasks, projectMilestones);
  const expected = calculateExpectedProgress(projectTasks, projectMilestones);

  if (expected === 0) {
    // If nothing expected yet but there’s some progress → "Ahead"
    return actual > 0 ? "Ahead" : "Not started";
  }

  const ratio = actual / expected;

  // Logical thresholds:
  // ratio ≥ 1.0  → "Ahead" (doing better than expected)
  // 0.8 ≤ ratio < 1.0 → "On track"
  // ratio < 0.8 → "Behind"
  if (ratio >= 1.0) return "Ahead";
  if (ratio >= 0.8) return "On track";
  return "Behind";
}