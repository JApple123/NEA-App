import React, { useState, useEffect } from "react";
import styles from "../styles/TasksList.module.css";
import { getTasks } from "../../api/tasks";
import { getProjects } from "../../api/projects";
import { getRisks } from "../../api/risks";
import { getTaskRisks } from "../../api/taskRisks";
import TaskViewerModal from "../modals/TaskViewerModal.jsx";
import ProgressBar from "./ProgressBar";

// Risk score calculation exactly as per your logic
function calculateTaskRiskScore(taskId, taskRisks, risks) {
  const taskTaskRisks = taskRisks.filter((rt) => rt.task_id === taskId);
  if (taskTaskRisks.length === 0) {
    return 0;
  }
  let totalRiskScore = 0;
  taskTaskRisks.forEach((rt) => {
    const risk = risks.find((r) => r.id === rt.risk_id);
    if (!risk) return;

    const likelihood = risk.pre_likelihood ?? 0;
    const impact = risk.pre_impact ?? 0;
    const preparedness = risk.preparedness ?? 0;
    const riskDate = new Date(risk.date);
    const proximityMs = riskDate - Date.now();
    const proximity = isNaN(proximityMs)
      ? 1
      : Math.max(proximityMs / (1000 * 60 * 60 * 24), 1);

    const score =
      likelihood *
      impact *
      (preparedness > 0 ? 1 / preparedness : 1) *
      (1 / proximity);

    totalRiskScore += score;
  });
  return totalRiskScore;
}

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskRisks, setTaskRisks] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks, projects, taskRisks, and risks concurrently
        const [taskData, projectData, taskRisksData, risksData] =
          await Promise.all([
            getTasks().catch((err) => {
              console.error("Error fetching tasks:", err);
              return [];
            }),
            getProjects().catch((err) => {
              console.error("Error fetching projects:", err);
              return [];
            }),
            getTaskRisks().catch((err) => {
              console.error("Error fetching taskRisks:", err);
              return [];
            }),
            getRisks().catch((err) => {
              console.error("Error fetching risks:", err);
              return [];
            }),
          ]);

        setTasks(taskData || []);
        setProjects(projectData || []);
        setTaskRisks(taskRisksData || []);
        setRisks(risksData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load task data");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [])
  

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    await fetchData();
    handleCloseModal();
  };
  const handleDelete = async () => {
    await fetchData();
    handleCloseModal();
  }



  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (tasks.length === 0) {
    return <div className={styles.empty}>No tasks found.</div>;
  }

  const sortedTasks = [...tasks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={styles.taskList}>
      <div className={styles.taskHeader}>
        <div className={styles.headerName}>Task Name</div>
        <div className={styles.headerProgress}>Progress</div>
        <div className={styles.headerStart}>Start Date</div>
        <div className={styles.headerEnd}>End Date</div>
        <div className={styles.headerRiskScore}>Risk Score</div>
        <div className={styles.headerProject}>Project</div>
      </div>
      <div className={styles.tasksContainer}>
        {sortedTasks.map((task) => {
          const riskScore = calculateTaskRiskScore(task.id, taskRisks, risks);
          const project = projects.find((p) => p.id === task.project_id);

          return (
            <div 
              key={task.id}
              className={styles.taskRow}
              onClick={() => handleOpenModal(task)}
              style={{ cursor: "pointer" }}
            >

              <div className={styles.taskName}>{task.name}</div>
              <div className={styles.taskProgress}>
                <ProgressBar progress={task.progress || 0} />
              </div>
              <div className={styles.taskStart}>
                {task.start_date
                  ? new Date(task.start_date).toLocaleDateString()
                  : "—"}
              </div>
              <div className={styles.taskEnd}>
                {task.end_date
                  ? new Date(task.end_date).toLocaleDateString()
                  : "—"}
              </div>
              <div className={styles.taskRisk}>{riskScore.toFixed(2)}</div>
              <div className={styles.taskProject}>
                {project ? project.name : "Unassigned"}
              </div>
            </div>
          );
        })}

        {/* Modal */}
        {isModalOpen && selectedTask && (
          <TaskViewerModal
          isOpen={isModalOpen}
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default TasksList;
