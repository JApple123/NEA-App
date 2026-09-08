export async function getTeams() {
  const response = await fetch("http:localhost:3000/api/teams");
  if (!response.ok) throw new Error("Failed to fetch teams");
  const data = await response.json();
  return data.map(r => ({ ...r, id: r.resource_id }));

}

export async function createTeam(teamData) {
  const response = await fetch("http://localhost:3000/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamData),
  });

  if (!response.ok) throw new Error("Failed to create team");

  const data = await response.json();
  return { ...data, id: data.team_id };
}

export async function updateTeam(teamId, teamData) {
  try {
    const response = await fetch(`http://localhost:3000/api/resources/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData), // send payload as-is
    });

    if (!response.ok) {
      const errorText = await response.text(); // get backend error message
      console.error("Update team failed:", errorText);
      throw new Error("Failed to update team");
    }

    const data = await response.json();
    return { ...data, id: data.team_id };
  } catch (err) {
    console.error("Error in updateTeam:", err);
    throw err; // rethrow so component can handle it
  }
}

export async function deleteTeam(id) {
  const response = await fetch(`http://localhost:3000/api/resources/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete team");

  return true; // can just return true for success
}