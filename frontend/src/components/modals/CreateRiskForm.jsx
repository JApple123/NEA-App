import React, { useState, useEffect } from "react";
import styles from "../styles/CreateModal.module.css";
import { createRisk } from "../../api/risks.js";
import { createTaskRisk } from "../../api/taskRisks.js";
import { getTasks } from "../../api/tasks.js";

const CreateRiskForm = ({ onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    impact: 1,
    likelihood: 1,
    preparedness: 1,
    pre_score: 0,
    post_score: 0,
    date: "",
    task_ids: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch tasks on mount
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

  // Generic input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle task selection
  const handleTaskToggle = (id) => {
    setFormData((prev) => {
      const alreadySelected = prev.task_ids.includes(id);
      const newTaskIds = alreadySelected
        ? prev.task_ids.filter((x) => x !== id)
        : [...prev.task_ids, id];
      return { ...prev, task_ids: newTaskIds };
    });
  };

  // Button group renderer for 1–5 selectors
  const renderButtonGroup = (value, fieldName) => {
    return (
      <div className={styles.buttonGroup}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.taskButton} ${
              Number(value) === n ? styles.taskButtonSelected : ""
            }`}
            onClick={() => setFormData((prev) => ({ ...prev, [fieldName]: n }))}
          >
            {n}
          </button>
        ))}
      </div>
    );
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const preImpact = Number(formData.impact) || 1;
      const preLikelihood = Number(formData.likelihood) || 1;
      const preparedness = Number(formData.preparedness) || 1;

      const riskPayload = {
        name: formData.name || "",
        description: formData.description || "",
        pre_impact: preImpact,
        post_impact: preImpact, // default same as pre_impact
        pre_likelihood: preLikelihood,
        post_likelihood: preLikelihood, // default same as pre_likelihood
        preparedness,
        pre_score: preImpact * preLikelihood, // product saved automatically
        post_score: 0, // can update later if needed
        date: formData.date || new Date().toISOString().split("T")[0],
      };

      const newRisk = await createRisk(riskPayload);
      console.log("Risk created with ID:", newRisk.id);

      // Link tasks to new risk
      for (const taskId of formData.task_ids) {
        try {
          await createTaskRisk({ task_id: taskId, risk_id: newRisk.id });
          console.log(`Linked task ${taskId}`);
        } catch (err) {
          console.error(`Failed to link task ${taskId}:`, err);
        }
      }

      onClose();
    } catch (err) {
      console.error("Failed to create risk or link tasks:", err);
      alert("Failed to create risk. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label>Description</label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formRow}>
        <label>Impact (1–5)</label>
        {renderButtonGroup(formData.impact, "impact")}
      </div>

      <div className={styles.formRow}>
        <label>Likelihood (1–5)</label>
        {renderButtonGroup(formData.likelihood, "likelihood")}
      </div>

      <div className={styles.formRow}>
        <label>Preparedness (1–5)</label>
        {renderButtonGroup(formData.preparedness, "preparedness")}
      </div>

      <div className={styles.formRow}>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formRow}>
        <label>Related Tasks</label>
        <div className={styles.tasksContainer}>
          {tasks.length === 0 && <p>No tasks available</p>}
          {tasks.map((t) => {
            const selected = formData.task_ids.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.taskButton} ${
                  selected ? styles.taskButtonSelected : ""
                }`}
                onClick={() => handleTaskToggle(t.id)}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Risk"}
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateRiskForm;
