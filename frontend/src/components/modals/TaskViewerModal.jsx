import React, { useState, useEffect } from "react";
import styles from "../styles/CreateModal.module.css";
import { updateTask, deleteTask } from "../../api/tasks";
import { getProjects } from "../../api/projects";

const TaskViewerModal = ({ isOpen, task, onClose, onDelete, onSave }) => {
  const [editedTask, setEditedTask] = useState({ ...task });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showOpenClass, setShowOpenClass] = useState(false);

  // Handle mounting, fade-in, fade-out
  useEffect(() => {
    if (isOpen && task) {
      setIsVisible(true);
      const openTimeout = setTimeout(() => setShowOpenClass(true), 10);
      return () => clearTimeout(openTimeout);
    } else if (isVisible) {
      setShowOpenClass(false);
      const closeTimeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(closeTimeout);
    }
  }, [isOpen, task, isVisible]);

 
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    }

    if (isOpen) fetchProjects();
  }, [isOpen]);


  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isVisible) return null;

  const handleChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: editedTask.name || "",
        description: editedTask.description || "",
        start_date: editedTask.start_date || null,
        end_date: editedTask.end_date || null,
        duration: editedTask.duration || null,
        progress: editedTask.progress ?? 0,
        project_id:
          editedTask.project_id && editedTask.project_id !== ""
            ? Number(editedTask.project_id)
            : null,
      };

      console.log("Updating task with payload:", payload);

      const updatedTask = await updateTask(editedTask.task_id, payload);

      if (onSave) onSave({ ...editedTask, project_id: payload.project_id });

      handleClose();
    } catch (err) {
      console.error("Update task failed:", err);
      setError("Failed to save task. Make sure all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await deleteTask(editedTask.task_id);
      if (onDelete) onDelete(editedTask.task_id);
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete task.");
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
        <h2 className={styles.modalTitle}>View / Edit Task</h2>
        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formRow}>
            <label>Name:</label>
            <input
              type="text"
              value={editedTask.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Project:</label>
            <select
              value={editedTask.project_id ?? ""}
              onChange={(e) =>
                handleChange(
                  "project_id",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Start Date:</label>
            <input
              type="date"
              value={editedTask.start_date?.split("T")[0] || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>End Date:</label>
            <input
              type="date"
              value={editedTask.end_date?.split("T")[0] || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Progress:</label>
            <div className={styles.progressContainer}>
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={editedTask.progress || 0}
                onChange={(e) =>
                  handleChange("progress", Number(e.target.value))
                }
              />
              <input
                type="number"
                name="progress"
                min="0"
                max="100"
                value={editedTask.progress || 0}
                onChange={(e) =>
                  handleChange("progress", Number(e.target.value))
                }
                className={styles.progressNumber}
              />
              <span>%</span>
            </div>
          </div>

          <div className={styles.formRow}>
            <label>Description:</label>
            <textarea
              value={editedTask.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
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

export default TaskViewerModal;