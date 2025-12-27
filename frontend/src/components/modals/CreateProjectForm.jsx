// src/components/modals/CreateProjectForm.jsx
import React, { useState } from "react";
import { createProject } from "../../api/projects";
import styles from "../styles/CreateModal.module.css";

const CreateProjectForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    owner: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🟢 Sending project data:", formData);
      await createProject(formData);
      console.log("✅ Project created successfully");
      onClose();
    } catch (error) {
      console.error("❌ Error creating project:", error);
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
        <label>Start Date</label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>End Date</label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>Owner</label>
        <input
          type="text"
          name="owner"
          placeholder="Owner name"
          value={formData.owner}
          onChange={handleChange}
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
        <button type="submit" className={styles.submitButton} >
                  Create Project
                </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
        
      </div>
    </form>
  );
};

export default CreateProjectForm;
