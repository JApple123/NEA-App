export async function getMilestones() {
  const response = await fetch("http://localhost:8888/api/deliverables");
  if (!response.ok) throw new Error("Failed to fetch milestones");
  const data = await response.json();
  return data.map((m) => ({ ...m, id: m.deliverable_id }));
}

export async function createMilestone(milestoneData) {
  const response = await fetch("http://localhost:8888/api/deliverables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(milestoneData),
  });
  if (!response.ok) throw new Error("Failed to create milestone");
  const data = await response.json();
  return { ...data, id: data.deliverable_id };
}

export async function updateMilestone(id, milestoneData) {
  console.log("🔵 API Call - updateMilestone:");
  console.log("  ID:", id);
  console.log("  Data:", milestoneData);
  console.log("  URL:", `http://localhost:8888/api/deliverables/${id}`);
  
  const response = await fetch(`http://localhost:8888/api/deliverables/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(milestoneData),
  });
  
  console.log("📡 Response status:", response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Update milestone error response:", errorText);
    console.error("❌ Response headers:", [...response.headers.entries()]);
    throw new Error(`Failed to update milestone: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log("✅ Update successful, response data:", data);
  return { ...data, id: data.deliverable_id };
}

export async function deleteMilestone(id) {
  const response = await fetch(`http://localhost:8888/api/deliverables/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete milestone");
  return true;
}