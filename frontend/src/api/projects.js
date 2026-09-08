export async function getProjects() {
  const response = await fetch("http://localhost:3000/api/projects");
  if (!response.ok) throw new Error('Failed to fetch projects');
  const data = await response.json();
  return data.map(p => ({ ...p, id: p.project_id }));
}

export async function createProject(projectData) {
  const response = await fetch('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return await response.json();
}

//  Update an existing project
export async function updateProject(id, updatedProject) {
  const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedProject),
  });

  if (!response.ok) {
    throw new Error('Failed to update project');
  }

  return await response.json();
}


export async function deleteProject(id) {
  const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }

  return await response.json();
}