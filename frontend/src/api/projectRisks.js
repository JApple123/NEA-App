export async function getProjectRisks() {
  const response = await fetch("http://localhost:8888/api/projectrisks");
  if (!response.ok) throw new Error('Failed to fetch project risks');
  const data = await response.json();
  return data.map(p => ({ ...p, id: p.project_id }));
}

