import React, { useState, useEffect } from "react";
import { createTask } from "../../api/tasks.js";
import { getProjects } from "../../api/projects.js";
import styles from "../styles/CreateModal.module.css";

const CreateTaskForm = ({ onClose }) => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    duration: "",
    progress: 0,
    description: "",
    project_id: "",
  });

  //  Fetch projects for dropdown
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error(" Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, []);

  //  Helper to safely parse a date string in DD-MM-YY, DD-MM-YYYY, or ISO (YYYY-MM-DD)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // If already in ISO format, just use it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }

    // Handle DD-MM-YYYY or DD-MM-YY
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      let [day, month, year] = parts.map(Number);
      if (year < 100) year += 2000; 
      return new Date(year, month - 1, day); 
    }

    return new Date(dateStr);
  };

  //  Automatically calculate duration based on dates
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = parseDate(formData.start_date);
      const end = parseDate(formData.end_date);

      if (start && end && !isNaN(start) && !isNaN(end)) {
        const diff = Math.max(
          0,
          Math.ceil((end - start) / (1000 * 60 * 60 * 24)) // Convert ms → days
        );
        setFormData((prev) => ({ ...prev, duration: diff }));
      }
    }
  }, [formData.start_date, formData.end_date]);

  //  Smooth slider fill update for progress
  useEffect(() => {
    const range = document.querySelector(
      'input[type="range"][name="progress"]'
    );
    if (range) {
      range.style.setProperty("--progress", `${formData.progress}%`);
    }
  }, [formData.progress]);

  //  Handle user input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "progress") {
      val = Math.round(Number(value)); // Round non-integers
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload in the format backend expects
    const start = parseDate(formData.start_date);
    const end = parseDate(formData.end_date);
    const duration =
      start && end && !isNaN(start) && !isNaN(end)
        ? Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)), 0)
        : 0;

    const taskToSend = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration: duration,
      progress: Math.round(Number(formData.progress)),
      project_id: Number(formData.project_id),
    };

    console.log(" Payload being sent:", JSON.stringify(taskToSend, null, 2));

    try {
      const created = await createTask(taskToSend);
      console.log(" Task created:", created);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        progress: 0,
        project_id: "",
      });
      onClose();
    } catch (error) {
      console.error(" Error creating task:", error);
      alert("Failed to create task. Please check your input.");
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Task name"
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
        <label>Initial Progress</label>
        <div className={styles.progressContainer}>
          <input
            type="range"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
          />
          <input
            type="number"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className={styles.progressNumber}
          />
          <span>%</span>
        </div>
      </div>

      <div className={styles.formRow}>
        <label>Description</label>
        <textarea
          name="description"
          placeholder="Task description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Create Task
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
