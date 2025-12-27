export async function getTaskRisks() {
  const response = await fetch("http://localhost:8888/api/taskrisks");
  if (!response.ok) throw new Error('Failed to fetch task risks');
  const data = await response.json();
  return data.map(r => ({ ...r, id: `${r.task_id}-${r.risk_id}` }));
}


// src/api/taskRisks.js
export async function createTaskRisk({ task_id, risk_id }) {
  const response = await fetch("http://localhost:8888/api/taskRisks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_id, risk_id }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("TaskRisk creation failed response:", errText);
    throw new Error("Failed to create task risk");
  }

  return await response.json();
}

export async function deleteTaskRisk({ task_id, risk_id }) {
  const response = await fetch(
    `http://localhost:8888/api/taskRisks/${task_id}/${risk_id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("TaskRisk deletion failed response:", errText);
    throw new Error("Failed to delete task risk");
  }

  return await response.json();
}