import React, { useState, useEffect } from "react";
import styles from "../styles/CreateModal.module.css";
import { updateRisk, deleteRisk } from "../../api/risks.js";
import { getTasks } from "../../api/tasks.js";
import { createTaskRisk, deleteTaskRisk, getTaskRisks } from "../../api/taskRisks.js";

const RiskViewerModal = ({ isOpen, risk, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({ ...risk, task_ids: [] });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalTaskIds, setOriginalTaskIds] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showOpenClass, setShowOpenClass] = useState(false);

  // Handle mounting, fade-in, fade-out
  useEffect(() => {
    if (isOpen && risk) {
      setIsVisible(true);
      const openTimeout = setTimeout(() => setShowOpenClass(true), 10);
      return () => clearTimeout(openTimeout);
    } else if (isVisible) {
      setShowOpenClass(false);
      const closeTimeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(closeTimeout);
    }
  }, [isOpen, risk]);

  // Fetch all tasks on mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err);
      }
    }
    fetchTasks();
  }, []);

  // Initialize modal form data and fetch linked tasks
  useEffect(() => {
    if (isOpen && risk) {
      // Initialize immediately with the risk data
      setFormData({ ...risk, task_ids: [] });

      // Then fetch linked tasks asynchronously
      async function fetchLinkedTasks() {
        try {
          const taskRisks = await getTaskRisks();
          const linkedTaskIds = taskRisks
            .filter((tr) => tr.risk_id === risk.id)
            .map((tr) => Number(tr.task_id));

          setFormData((prev) => ({ ...prev, task_ids: linkedTaskIds }));
          setOriginalTaskIds(linkedTaskIds);
        } catch (err) {
          console.error("Failed to fetch linked tasks:", err);
          setOriginalTaskIds([]);
        }
      }
      fetchLinkedTasks();
    }
  }, [isOpen, risk]);

  if (!isVisible) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectorChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: Number(value) }));
  };

  const renderButtonGroup = (fieldName, currentValue) => (
    <div className={styles.buttonGroup}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.taskButton} ${
            currentValue === n ? styles.taskButtonSelected : ""
          }`}
          onClick={() => handleSelectorChange(fieldName, n)}
        >
          {n}
        </button>
      ))}
    </div>
  );

  const handleTaskToggle = (taskId) => {
    setFormData((prev) => {
      const alreadySelected = prev.task_ids.includes(Number(taskId));
      const newTaskIds = alreadySelected
        ? prev.task_ids.filter((id) => id !== Number(taskId))
        : [...prev.task_ids, Number(taskId)];
      return { ...prev, task_ids: newTaskIds };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const preImpact = Number(formData.pre_impact ?? 1);
      const preLikelihood = Number(formData.pre_likelihood ?? 1);
      const preparedness = Number(formData.preparedness ?? 1);

      const payload = {
        name: formData.name || "",
        description: formData.description || "",
        pre_impact: preImpact,
        post_impact: Number(formData.post_impact ?? preImpact),
        pre_likelihood: preLikelihood,
        post_likelihood: Number(formData.post_likelihood ?? preLikelihood),
        preparedness: preparedness,
        pre_score: preImpact * preLikelihood,
        post_score: Number(formData.post_score ?? 0),
        date: formData.date || new Date().toISOString().split("T")[0],
      };

      await updateRisk(formData.id, payload);

      const newTaskIds = formData.task_ids;

      // Tasks to add
      const toAdd = newTaskIds.filter((id) => !originalTaskIds.includes(id));
      for (const taskId of toAdd) {
        try {
          await createTaskRisk({ task_id: taskId, risk_id: formData.id });
        } catch (err) {
          console.error(`Failed to link task ${taskId}:`, err);
        }
      }

      // Tasks to remove
      const toRemove = originalTaskIds.filter((id) => !newTaskIds.includes(id));
      for (const taskId of toRemove) {
        try {
          await deleteTaskRisk({ task_id: taskId, risk_id: formData.id });
        } catch (err) {
          console.error(`Failed to unlink task ${taskId}:`, err);
        }
      }

      if (onSave) onSave();
      handleClose();
    } catch (err) {
      console.error("Error saving risk:", err);
      alert("Failed to save risk. Make sure all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;
    setLoading(true);
    try {
      await deleteRisk(formData.id);
      if (onDelete) onDelete();
      handleClose();
    } catch (err) {
      console.error("Error deleting risk:", err);
      alert("Failed to delete risk.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowOpenClass(false);
    setTimeout(() => onClose(), 300);
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
        <h2 className={styles.modalTitle}>View / Edit Risk</h2>

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
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <label>Impact (1–5)</label>
            {renderButtonGroup("pre_impact", formData.pre_impact)}
          </div>

          <div className={styles.formRow}>
            <label>Likelihood (1–5)</label>
            {renderButtonGroup("pre_likelihood", formData.pre_likelihood)}
          </div>

          <div className={styles.formRow}>
            <label>Preparedness (1–5)</label>
            {renderButtonGroup("preparedness", formData.preparedness)}
          </div>

          <div className={styles.formRow}>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={
                formData.date
                  ? new Date(formData.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <label>Related Tasks</label>
            <div className={styles.tasksContainer}>
              {tasks.length === 0 && <p>No tasks available</p>}
              {tasks.map((t) => {
                const selected = formData.task_ids.includes(Number(t.id));
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.taskButton} ${
                      selected ? styles.taskButtonSelected : ""
                    }`}
                    onClick={() => handleTaskToggle(t.id)}
                    disabled={loading}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
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

export default RiskViewerModal;
