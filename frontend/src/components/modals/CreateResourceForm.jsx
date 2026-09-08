import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import { createResource } from "../../api/resources";
import { getTeams } from "../../api/teams";
import styles from "../styles/CreateModal.module.css";

const CreateResouceForm = ({ onClose }) => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    role: "",
    teamId: "",
    description: "",
  });

  useEffect(() => {
    async function fetchTeams() {
      try {
        const data = await getTeams();
        setTeams(data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    }
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        capacity: formData.capacity,
        role: formData.role,
        teamId: formData.teamId,
        description: formData.description,
      };
      console.log("Sending resource data:", payload);
      await createProject(payload);
      console.log("Resource created successfully");
      onClose();
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Project name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>Capacity</label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>role</label>
        <input
          type="string"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>Team</label>
        <select
          name="teamId"
          value={formData.teamId}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select an team</option>
          {teams.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <label>Description</label>
        <textarea
          name="description"
          placeholder="Project description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>Create Resource</button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default CreateResouceForm;