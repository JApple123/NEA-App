// Calculates overall % progress of a project
// Weighted mean of: (1) task progress and (2) milestone completion
export function calculateProjectProgress(projectTasks, projectMilestones) {
  // Handle edge cases
  const noTasks = !projectTasks || projectTasks.length === 0;
  const noMilestones = !projectMilestones || projectMilestones.length === 0;

  // --- TASK PROGRESS ---
  let taskProgress = 0;
  if (!noTasks) {
    let totalDuration = 0;
    let weightedProgressSum = 0;

    projectTasks.forEach(task => {
      const duration = task.duration || 1;  // fallback 1 day
      const progress = task.progress || 0;  // 0-100
      totalDuration += duration;
      weightedProgressSum += (progress / 100) * duration;
    });

    taskProgress = totalDuration > 0
      ? (weightedProgressSum / totalDuration) * 100
      : 0;
  }

  // --- MILESTONE PROGRESS ---
  let milestoneProgress = 0;
  if (!noMilestones) {
    const completedMilestones = projectMilestones.filter(m => m.complete === 1).length;
    milestoneProgress = (completedMilestones / projectMilestones.length) * 100;
  }

  // --- FINAL COMBINED PROGRESS ---
  if (noTasks && noMilestones) return 0;
  if (noTasks) return Math.round(milestoneProgress);
  if (noMilestones) return Math.round(taskProgress);

  const combinedProgress = (taskProgress + milestoneProgress) / 2;
  return Math.round(combinedProgress);
}