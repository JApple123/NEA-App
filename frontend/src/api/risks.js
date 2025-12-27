export async function getRisks() {
  const response = await fetch("http://localhost:8888/api/risks");
  if (!response.ok) throw new Error('Failed to fetch risks');
  const data = await response.json();
  return data.map(r => ({ ...r, id: r.risk_id }));
}


// src/api/risks.js
export async function createRisk(riskData) {
  const response = await fetch("http://localhost:8888/api/risks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(riskData),
  });

  if (!response.ok) throw new Error("Failed to create risk");

  const data = await response.json();

  if (!data.id) throw new Error("Risk created but no ID returned from backend");

  return { ...riskData, id: data.id }; 
}

export async function updateRisk(riskId, riskData) {
  const response = await fetch(`http://localhost:8888/api/risks/${riskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(riskData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update risk: ${errorText}`);
  }

  const data = await response.json();

  return {
    ...riskData,
    id: data.id || data.risk_id || riskId,
  };
}

// Delete a risk
export async function deleteRisk(riskId) {
  const response = await fetch(`http://localhost:8888/api/risks/${riskId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete risk: ${errorText}`);
  }

  return true;
}