import React, { useEffect, useState } from "react";
import styles from "../styles/CreateModal.module.css"; // Reuse styling
import { updateProject, deleteProject } from "../../api/projects";

const ProjectViewerModal = ({ isOpen, project, onClose, onDelete, onSave }) => {
  const [editedProject, setEditedProject] = useState({ ...project });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showOpenClass, setShowOpenClass] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setIsVisible(true);
      const openTimeout = setTimeout(() => setShowOpenClass(true), 10);
      return () => clearTimeout(openTimeout); 
    } else if (isVisible) {
      setShowOpenClass(false);
      const closeTimeout = setTimeout(() => setIsVisible(false), 300);
      return() => clearTimeout(closeTimeout);
    }
  }, [isOpen, project]);

  const handleChange = (field, value) => {
    setEditedProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateProject(editedProject.id, editedProject);
      if (onSave) onSave(editedProject);
      handleClose();
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await deleteProject(editedProject.id);
      if (onDelete) onDelete(editedProject.id);
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete project.");
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
          onMouseDown={(e) =>{
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>View / Edit Project</h2>
        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formRow}>
            <label>Name:</label>
            <input
              type="text"
              value={editedProject.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Description:</label>
            <textarea
              value={editedProject.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Owner:</label>
            <input
              type="text"
              value={editedProject.owner || ""}
              onChange={(e) => handleChange("owner", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Start Date:</label>
            <input
              type="date"
              value={editedProject.start_date?.split("T")[0] || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>End Date:</label>
            <input
              type="date"
              value={editedProject.end_date?.split("T")[0] || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
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

export default ProjectViewerModal;