export async function getProjectRisks() {
  const response = await fetch("http://localhost:3000/api/project-risks");
  if (!response.ok) throw new Error('Failed to fetch project risks');
  const data = await response.json();
  return data.map(p => ({ ...p, id: `${p.project_id}-${p.risk_id}` }));
}

export async function createProjectRisk({ project_id, risk_id }) {
  const response = await fetch("http://localhost:3000/api/project-risks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: project_id, riskId: risk_id }),
  });
  if (!response.ok) throw new Error('Failed to create project risk');
  return await response.json();
}

export async function deleteProjectRisk({ project_id, risk_id }) {
  const response = await fetch(
    `http://localhost:3000/api/project-risks/${project_id}/${risk_id}`,
    { method: "DELETE" }
  );
  if (!response.ok) throw new Error('Failed to delete project risk');
  return await response.json();
}