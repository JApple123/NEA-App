import React, { useState, useEffect } from "react";
import { createMilestone } from "../../api/milestones.js";
import { getProjects } from "../../api/projects.js";
import styles from "../styles/CreateModal.module.css";

const CreateMilestoneForm = ({ onClose }) => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    owner: "",
    project_id: "",
    complete: 0, // default to incomplete
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompletionChange = (value) => {
    setFormData((prev) => ({ ...prev, complete: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const milestoneToSend = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      start_date: formData.end_date || null,
      end_date: formData.end_date || null,
      owner: formData.owner.trim(),
      project_id: Number(formData.project_id),
      complete: Number(formData.complete), // ensure it’s numeric (0 or 1)
    };

    try {
      const created = await createMilestone(milestoneToSend);
      console.log("✅ Milestone created:", created);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        owner: "",
        project_id: "",
        complete: 0,
      });
      onClose();
    } catch (error) {
      console.error("❌ Error creating milestone:", error);
      alert("Failed to create milestone. Please try again.");
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Milestone name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>Project</label>
        <select
          name="project_id"
          value={formData.project_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <label>Date</label>
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
          required
        />
      </div>

      {/* ✅ Completion Buttons */}
      <div className={styles.formRow}>
        <label>Status</label>
        <div className={styles.completionButtons}>
          <button
            type="button"
            className={`${styles.statusButton} ${
              formData.complete === 1 ? styles.activeComplete : ""
            }`}
            onClick={() => handleCompletionChange(1)}
          >
            Complete
          </button>
          <button
            type="button"
            className={`${styles.statusButton} ${
              formData.complete === 0 ? styles.activeIncomplete : ""
            }`}
            onClick={() => handleCompletionChange(0)}
          >
            Incomplete
          </button>
        </div>
      </div>

      <div className={styles.formRow}>
        <label>Milestone Description</label>
        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Create Milestone
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateMilestoneForm;
