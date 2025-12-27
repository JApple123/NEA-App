function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Calculates expected % progress of a project
// Mean average of time-based expected task progress and milestone completion
function calculateExpectedProgress(tasks, milestones) {
  const noTasks = !tasks || tasks.length === 0;
  const noMilestones = !milestones || milestones.length === 0;

  // --- TASK EXPECTED PROGRESS ---
  let expectedTaskProgress = 0;
  if (!noTasks) {
    let totalDuration = 0;
    let weightedExpectedSum = 0;
    const now = new Date();

    tasks.forEach(task => {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);
      const duration = (endDate - startDate) / (1000 * 60 * 60 * 24); // duration in days

      let expectedTaskProgressForThis = 0;
      if (now < startDate) {
        expectedTaskProgressForThis = 0;
      } else if (now > endDate) {
        expectedTaskProgressForThis = 1; // 100%
      } else {
        const elapsed = (now - startDate) / (1000 * 60 * 60 * 24);
        expectedTaskProgressForThis = clamp(elapsed / duration, 0, 1);
      }

      totalDuration += duration;
      weightedExpectedSum += expectedTaskProgressForThis * duration;
    });

    expectedTaskProgress = totalDuration > 0
      ? (weightedExpectedSum / totalDuration) * 100
      : 0;
  }

  // --- MILESTONE EXPECTED PROGRESS ---
  let milestoneProgress = 0;
  if (!noMilestones) {
    const completedMilestones = milestones.filter(m => m.complete === 1).length;
    milestoneProgress = (completedMilestones / milestones.length) * 100;
  }

  // --- FINAL COMBINED EXPECTED PROGRESS ---
  if (noTasks && noMilestones) return 0;
  if (noTasks) return Math.round(milestoneProgress);
  if (noMilestones) return Math.round(expectedTaskProgress);

  const combinedExpectedProgress = (expectedTaskProgress + milestoneProgress) / 2;
  return Math.round(combinedExpectedProgress);
}

export { calculateExpectedProgress };