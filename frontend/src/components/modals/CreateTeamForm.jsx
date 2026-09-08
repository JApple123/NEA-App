import React, { useState, useEffect } from "react";
import { createTeam } from "../../api/teams";
import styles from "../styles/CreateModal.module.css";

const CreateTeamForm = ({ onClose }) => {
  const [resources, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    
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
        description: formData.description,
      };
      console.log("Sending team data:", payload);
      await createProject(payload);
      console.log("Team created successfully");
      onClose();
    } catch (error) {
      console.error("Error creating team:", error);
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
        <button type="submit" className={styles.submitButton}>Create Team</button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </div>
      
    </form>
  );
};

export default CreateTeamForm;