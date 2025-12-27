import React, { useState, useEffect } from 'react';
import styles from '../styles/ProjectsCard.module.css';
import { getProjects } from '../../api/projects.js';
import { getTasks } from '../../api/tasks.js';
import { getMilestones } from "../../api/milestones";
import { calculateProjectProgress } from '../../utils/calculateProjectProgress.js';
import { getProjectStatus } from '../../utils/getProjectStatus.js';
import ProgressBar from '../jsx/ProgressBar.jsx';


const ProjectsCard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "Dashboard";
  });


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both projects and tasks concurrently
      const [projectData, taskData, milestoneData] = await Promise.all([
        getProjects().catch(err => {
          console.error('Error fetching projects:', err);
          return [];
        }),
        getTasks().catch(err => {
          console.error('Error fetching tasks:', err);
          return [];
        }),
        getMilestones().catch(err =>{
          console.error('Error fetching tasks.', err);
          return [];
        
        }),
      ]);
      
      setProjects(projectData || []);
      setTasks(taskData || []);
      setMilestones(milestoneData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load project data');
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
    <span className={`${styles.statusBadge} ${statusClass}`}>
      {label}
    </span>
  );
};



  if (loading) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Projects</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Projects</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={styles.dashboardCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Projects</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.emptyContainer}>
            <p className={styles.emptyMessage}>No projects found.</p>
          </div>
        </div>
      </div>
    );
  }


  const getSortedProjects = (projects) => {
    return projects;
  };

  const sortedProjects = getSortedProjects(projects);
  const displayProjects = sortedProjects.slice(0, 3);

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Projects</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.projectsHeader}>
          <div className={styles.headerName}>NAME</div>
          <div className={styles.headerProgress}>PROGRESS</div>
          <div className={styles.headerStatus}>STATUS</div>
          <div className={styles.headerOwner}>OWNER</div>
        </div>
        <div className={styles.projectsList}>
          {displayProjects.map(project => {
            const projectTasks = tasks.filter(
              (task) => task.project_id === project.id
            );
            const projectMilestones = milestones.filter(
              (m) => m.project_id === project.id
            );
  
            // Calculate progress based on tasks
            const progress = calculateProjectProgress(
              projectTasks,
              projectMilestones
            );
            // Determine status based on progress and project timeline
            const status = getProjectStatus(projectTasks, projectMilestones);

            return (
              <div key={project.id} className={styles.projectRow}>
                <div className={styles.projectName}>{project.name}</div>
                <div className={styles.projectProgress}>
                  <ProgressBar progress={progress} />
                </div>
                <div className={styles.projectStatus}>
                  <StatusIndicator status={status} />
                </div>
                <div className={styles.projectOwner}>{project.owner}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.seeAllContainer}>
          <a href="/viewer/projects" className={styles.seeAllButton}
          onClick={(e) => {
            setCurrentPage('Viewer');
          }}>
            See All Projects
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard;