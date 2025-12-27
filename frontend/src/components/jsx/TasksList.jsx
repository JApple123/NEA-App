import React, { useState, useEffect } from "react";
import styles from "../styles/TasksList.module.css";
import { getProjects } from "../../api/projects";
import { getTasks } from "../../api/tasks";
import { getProjectStatus } from "../../utils/getProjectStatus";
import { calculateProjectProgress } from "../../utils/calculateProjectProgress";
import ProgressBar from "./ProgressBar";

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both projects and tasks concurrently
        const [projectData, taskData] = await Promise.all([
          getProjects().catch((err) => {
            console.error("Error fetching projects:", err);
            return [];
          }),
          getTasks().catch((err) => {
            console.error("Error fetching tasks:", err);
            return [];
          }),
        ]);
        setProjects(projectData || []);
        setTasks(taskData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load project data");
        setProjects([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatusIndicator = ({ status = "on track" }) => {
    let statusClass = "";
    let label = "";
    switch (status.toLowerCase()) {
      case "on track":
        statusClass = styles.statusGreen;
        label = "On Track";
        break;
      case "behind":
        statusClass = styles.statusAmber;
        label = "Behind";
        break;
      case "at risk":
        statusClass = styles.statusRed;
        label = "At Risk";
        break;
      default:
        statusClass = styles.statusGrey;
        label = "Unknown";
    }
    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>{label}</span>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading projects...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (projects.length === 0) {
    return <div className={styles.empty}>No projects found.</div>;
  }

  // TODO: Add sorting logic here
  const getSortedTasks = (projects) => {
    return projects;
  };

  const sortedTasks = getSortedTasks(projects);

  return (
    <div className={styles.projectList}>
      <div className={styles.projectsHeader}>
        <div className={styles.headerName}>NAME</div>
        <div className={styles.headerProgress}>PROGRESS</div>
        <div className={styles.headerStatus}>STATUS</div>
        <div className={styles.headerOwner}>OWNER</div>
      </div>
      <div className={styles.projectsContainer}>
        {sortedProjects.map((project) => {
          const projectTasks = tasks.filter(
            (task) => task.project_id === project.id
          );
          const progress = calculateProjectProgress(projectTasks);
          const status = getProjectStatus(projectTasks);

          return (
            <div key={project.id} className={styles.projectRow}>
              <div className={styles.projectName}>
                <div className={styles.projectTitle}>{project.name}</div>
                <div
                  className={styles.projectDescription}
                  title={project.description}
                >
                  {project.description}
                </div>
              </div>
              <div className={styles.projectProgress}>
                <ProgressBar progress={progress} />
              </div>
              <div className={styles.projectStatus}>
                <StatusIndicator status={status} />
              </div>
              <div className={styles.projectOwner}>
                {project.owner || "Unassigned"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksList;
