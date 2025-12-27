export async function getTasks() {
  const response = await fetch("http://localhost:8888/api/tasks");
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  return data.map(t => ({ ...t, id: t.task_id }));
}


export async function createTask(taskData) {
  const response = await fetch("http://localhost:8888/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Failed to create task");

  const data = await response.json();
  return { ...data, id: data.task_id };
}

export async function updateTask(taskId, taskData) {
  try {
    const response = await fetch(`http://localhost:8888/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData), // send payload as-is
    });

    if (!response.ok) {
      const errorText = await response.text(); // get backend error message
      console.error("Update task failed:", errorText);
      throw new Error("Failed to update task");
    }

    const data = await response.json();
    return { ...data, id: data.task_id };
  } catch (err) {
    console.error("Error in updateTask:", err);
    throw err; // rethrow so component can handle it
  }
}

export async function deleteTask(id) {
  const response = await fetch(`http://localhost:8888/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete task");

  return true; // can just return true for success
}