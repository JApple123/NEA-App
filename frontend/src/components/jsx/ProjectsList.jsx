import React, { useState, useEffect } from "react";
import styles from "../styles/ProjectList.module.css";
import { getProjects } from "../../api/projects";
import { getTasks } from "../../api/tasks";
import { getMilestones } from "../../api/milestones";
import { getProjectStatus } from "../../utils/getProjectStatus";
import { calculateProjectProgress } from "../../utils/calculateProjectProgress";
import ProgressBar from "./ProgressBar";
import ProjectViewerModal from "../modals/ProjectViewerModal.jsx";
import { getSortedProjects } from "../../utils/getSortedProjects.js";

const ProjectsList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {

      setLoading(true);
      setError(null);

      const [projectData, taskData, milestoneData] = await Promise.all([
        getProjects().catch(() => []),
        getTasks().catch(() => []),
        getMilestones().catch(() => []),
      ]);

      setProjects(projectData || []);
      setTasks(taskData || []);
      setMilestones(milestoneData || []);
    } catch {
      setError("Failed to load project data");
      setProjects([]);
      setTasks([]);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    await fetchData();
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    await fetchData();
    setSelectedProject(null);
  };

  // const sortSelector = ({ sortMethod = "nearest_end_date" }) => {}; //

  const StatusIndicator = ({ status = "on track" }) => {
    let statusClass = "";
    let label = "";

    switch (status.toLowerCase()) {
      case "ahead":
        statusClass = styles.statusBlue;
        label = "Ahead";
        break;
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

  if (loading) return <div className={styles.loading}>Loading projects...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (projects.length === 0)
    return <div className={styles.empty}>No projects found.</div>;

  const sortedProjects = getSortedProjects(projects);

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
          const projectMilestones = milestones.filter(
            (m) => m.project_id === project.id
          );

          const progress = calculateProjectProgress(
            projectTasks,
            projectMilestones
          );
          const status = getProjectStatus(projectTasks, projectMilestones);

          return (
            <div
              key={project.id}
              className={styles.projectRow}
              onClick={() => setSelectedProject(project)}
              style={{ cursor: "pointer" }}
            >
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

      {selectedProject && (
        <ProjectViewerModal
          isOpen={!!selectedProject}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProjectsList;
