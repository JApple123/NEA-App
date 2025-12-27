import React, { useState, useEffect } from "react";
import styles from "../styles/CreateModal.module.css";
import { getProjects } from "../../api/projects";
import { updateMilestone, deleteMilestone } from "../../api/milestones";

const MilestoneViewerModal = ({
  isOpen,
  milestone,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({ ...milestone });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showOpenClass, setShowOpenClass] = useState(false);

  // Handle mounting, fade-in, fade-out
  useEffect(() => {
    if (isOpen && milestone) {
      setIsVisible(true);
      const openTimeout = setTimeout(() => setShowOpenClass(true), 10);
      return () => clearTimeout(openTimeout);
    } else if (isVisible) {
      setShowOpenClass(false);
      const closeTimeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(closeTimeout);
    }
  }, [isOpen, milestone, isVisible]);

  // Fetch projects
  useEffect(() => {
    if (!isOpen) return;

    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    }

    fetchProjects();
  }, [isOpen]);

  // Update formData when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({ ...milestone });
      console.log("📋 Milestone loaded:", milestone);
    }
  }, [milestone]);

  if (!isVisible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompletionToggle = (status) => {
    setFormData((prev) => ({
      ...prev,
      complete: status === "complete" ? 1 : 0,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine which ID field to use
      const milestoneId = formData.deliverable_id || formData.id;

      if (!milestoneId) {
        throw new Error("No milestone ID found");
      }

      // Prepare the payload matching the create form structure
      const payload = {
        name: formData.name?.trim() || "",
        description: formData.description?.trim() || "",
        start_date: formData.end_date || null,
        end_date: formData.end_date || null,
        owner: formData.owner?.trim() || "",
        project_id: Number(formData.project_id) || 0,
        complete: Number(formData.complete) || 0,
      };

      console.log("Saving milestone with ID:", milestoneId);
      console.log("Payload being sent:", payload);

      const updated = await updateMilestone(milestoneId, payload);

      console.log("Milestone saved successfully:", updated);

      if (onSave) onSave(updated);
      handleClose();
    } catch (err) {
      console.error("Error saving milestone:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(`Failed to save milestone: ${err.message || "Unknown error"}`);
      alert(
        `Failed to save milestone. ${
          err.message || "Make sure all fields are valid."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this milestone?"))
      return;

    setLoading(true);
    setError(null);

    try {
      const milestoneId = formData.deliverable_id || formData.id;

      if (!milestoneId) {
        throw new Error("No milestone ID found");
      }

      console.log(" Deleting milestone with ID:", milestoneId);

      await deleteMilestone(milestoneId);

      console.log(" Milestone deleted successfully");

      if (onDelete) onDelete(milestoneId);
      handleClose();
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError(`Failed to delete milestone: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowOpenClass(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`${styles.modalOverlay} ${showOpenClass ? styles.open : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>View / Edit Milestone</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formRow}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Project</label>
            <select
              name="project_id"
              value={formData.project_id || ""}
              onChange={handleChange}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={
                formData.end_date
                  ? new Date(formData.end_date).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <label>Owner</label>
            <input
              type="text"
              name="owner"
              value={formData.owner || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <label>Status</label>
            <div className={styles.completionButtons}>
              <button
                type="button"
                className={`${styles.statusButton} ${
                  formData.complete === 1 ? styles.activeComplete : ""
                }`}
                onClick={() => handleCompletionToggle("complete")}
              >
                Complete
              </button>
              <button
                type="button"
                className={`${styles.statusButton} ${
                  formData.complete === 0 ? styles.activeIncomplete : ""
                }`}
                onClick={() => handleCompletionToggle("incomplete")}
              >
                Incomplete
              </button>
            </div>
          </div>

          <div className={styles.formRow}>
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formActions}>
            <div className={styles.leftActions}>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneViewerModal;
