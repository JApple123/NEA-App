export async function getDeliverableTasks() {
  const response = await fetch("http://localhost:3000/api/milestone-tasks");
  if (!response.ok) throw new Error('Failed to fetch deliverable tasks');
  const data = await response.json();
  return data.map(r => ({ ...r, id: `${r.milestone_id}-${r.task_id}` }));
}

export async function createDeliverableTask({ milestone_id, task_id }) {
  const response = await fetch("http://localhost:3000/api/milestone-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ milestoneId: milestone_id, taskId: task_id }),
  });
  if (!response.ok) throw new Error('Failed to create deliverable task');
  return await response.json();
}

export async function deleteDeliverableTask({ milestone_id, task_id }) {
  const response = await fetch(
    `http://localhost:3000/api/milestone-tasks/${milestone_id}/${task_id}`,
    { method: "DELETE" }
  );
  if (!response.ok) throw new Error('Failed to delete deliverable task');
  return await response.json();
}