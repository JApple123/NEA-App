export async function getResources() {
  const response = await fetch("http:localhost:3000/api/resources");
  if (!response.ok) throw new Error("Failed to fetch resources");
  const data = await response.json();
  return data.map(r => ({ ...r, id: r.resource_id }));

}

export async function createResource(resourceData) {
  const response = await fetch("http://localhost:3000/api/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resourceData),
  });

  if (!response.ok) throw new Error("Failed to create resource");

  const data = await response.json();
  return { ...data, id: data.resource_id };
}

export async function updateResource(resourceId, resourceData) {
  try {
    const response = await fetch(`http://localhost:3000/api/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resourceData), // send payload as-is
    });

    if (!response.ok) {
      const errorText = await response.text(); // get backend error message
      console.error("Update resource failed:", errorText);
      throw new Error("Failed to update resource");
    }

    const data = await response.json();
    return { ...data, id: data.resource_id };
  } catch (err) {
    console.error("Error in updateResource:", err);
    throw err; // rethrow so component can handle it
  }
}

export async function deleteResource(id) {
  const response = await fetch(`http://localhost:3000/api/resources/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete resource");

  return true; // can just return true for success
}