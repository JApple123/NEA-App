import React, { useState, useEffect } from "react";
import styles from '../styles/RisksCard.module.css';
import { getRisks } from "../../api/risks";
import { getProjectRisks } from "../../api/projectRisks";
import { getProjects } from "../../api/projects";
import { getTasks } from "../../api/tasks";
import { getTaskRisks } from "../../api/taskRisks"
import RiskViewerModal from "../modals/RiskViewerModal"; // <-- import modal

const RisksCard = () => {
  const [risks, setRisks] = useState([]);
  const [taskRisks, setTaskRisks] = useState([]);
  const [projectRisks, setProjectRisks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [riskData, taskRiskData, projectRiskData, taskData, projectData] =
        await Promise.all([
          getRisks().catch(() => []),
          getTaskRisks().catch(() => []),
          getProjectRisks().catch(() => []),
          getTasks().catch(() => []),
          getProjects().catch(() => []),
        ]);

      setRisks(riskData);
      setTaskRisks(taskRiskData);
      setProjectRisks(projectRiskData);
      setTasks(taskData);
      setProjects(projectData);
    } catch (err) {
      console.error(err);
      setError("Failed to load risk data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    await fetchData();
    setSelectedRisk(null);
  };

  const handleDelete = async () => {
    await fetchData();
    setSelectedRisk(null);
  };

  const getLinkedTasks = (riskId) => {
    const linkedTaskIds = taskRisks
      .filter((tr) => tr.risk_id === riskId)
      .map((tr) => tr.task_id);

    const linkedTasks = tasks.filter((t) => linkedTaskIds.includes(t.id));
    if (linkedTasks.length === 0) return "None";
    return linkedTasks;
  };



  // 🔹 Get all projects linked to a risk (directly + via tasks)
  const getLinkedProjects = (riskId) => {
    // 1️⃣ Projects directly linked to the risk
    const linkedProjectIds = projectRisks
      .filter((pr) => pr.risk_id === riskId)
      .map((pr) => pr.project_id);

    // 2️⃣ Tasks linked to the risk
    const linkedTaskIds = taskRisks
      .filter((tr) => tr.risk_id === riskId)
      .map((tr) => tr.task_id);

    // 3️⃣ Projects from those tasks
    const taskProjects = tasks
      .filter((t) => linkedTaskIds.includes(t.id))
      .map((t) => t.project_id);

    // 4️⃣ Combine both project sets, remove duplicates
    const allProjectIds = [...new Set([...linkedProjectIds, ...taskProjects])];

    // 5️⃣ Get full project objects
    const allProjects = projects.filter((p) => allProjectIds.includes(p.id));

    if (allProjects.length === 0) return "None";

    // 6️⃣ Display format: "ProjectName + X" (X = number of remaining projects)
    if (allProjects.length === 1) {
      return allProjects[0].name;
    } else {
      return `${allProjects[0].name} + ${allProjects.length - 1}`;
    }
  };

  if (loading) return <div className={styles.loading}>Loading risks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (risks.length === 0) return <div className={styles.empty}>No risks found.</div>;

  const displayRisks = risks.slice(0, 3);

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Risks</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.riskHeader}>
          <div className={styles.headerName}>Name</div>
          <div className={styles.headerImpact}>Impact</div>
          <div className={styles.headerLikelihood}>Likelihood</div>
          <div className={styles.headerScore}>Score</div>
          <div className={styles.headerProjects}>Projects</div>
        </div>
        <div className={styles.risksList}>
          {displayRisks.map(risk => {
            const riskProjectRisk = projectRisks.filter(pr => pr.risk_id === risk.id);
            const riskProjects = projects.filter(p => riskProjectRisk.some(rpr => rpr.project_id === p.id));

            return (
              <div
                key={risk.id}
                className={styles.riskRow}
                onClick={() => setSelectedRisk(risk)} // <-- open modal
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.riskName}>{risk.name}</div>
                <div className={styles.riskImpact}>{risk.pre_impact}</div>
                <div className={styles.riskLikelihood}>{risk.pre_likelihood}</div>
                <div className={styles.riskScore}>{risk.pre_score}</div>
                <div className={styles.riskProjects}>{getLinkedProjects(riskProjects)}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.seeAllContainer}>
          <a href="/viewer/risks" className={styles.seeAllButton}>See All Risks</a>
        </div>
      </div>

      {selectedRisk && (
        <RiskViewerModal
          isOpen={!!selectedRisk}
          risk={selectedRisk}
          onClose={() => setSelectedRisk(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default RisksCard;