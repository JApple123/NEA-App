export async function getDeliverableTasks() {
  const response = await fetch("http://localhost:8888/api/deliverabletasks");
  if (!response.ok) throw new Error('Failed to fetch deliverable tasks');
  const data = await response.json();
  return data.map(r => ({ ...r, id: `${r.deliverable_id}-${r.task_id}` }));
}
