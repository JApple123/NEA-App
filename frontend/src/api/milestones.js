export async function getMilestones() {
  const response = await fetch("http://localhost:3000/api/milestones");
  if (!response.ok) throw new Error("Failed to fetch milestones");
  const data = await response.json();
  return data.map((m) => ({ ...m, id: m.milestone_id }));
}

export async function createMilestone(milestoneData) {
  const response = await fetch("http://localhost:3000/api/milestones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(milestoneData),
  });
  if (!response.ok) throw new Error("Failed to create milestone");
  const data = await response.json();
  return { ...data, id: data.milestone_id };
}

export async function updateMilestone(id, milestoneData) {
  const response = await fetch(`http://localhost:3000/api/milestones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(milestoneData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update milestone: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return { ...data, id: data.milestone_id };
}

export async function deleteMilestone(id) {
  const response = await fetch(`http://localhost:3000/api/milestones/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete milestone");
  return true;
}