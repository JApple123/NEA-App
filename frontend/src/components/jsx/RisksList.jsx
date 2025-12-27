import React, { useState, useEffect } from "react";
import styles from "../styles/RisksList.module.css";
import { getRisks } from "../../api/risks";
import { getTaskRisks } from "../../api/taskRisks";
import { getProjectRisks } from "../../api/projectRisks";
import { getTasks } from "../../api/tasks";
import { getProjects } from "../../api/projects";
import RiskViewerModal from "../modals/RiskViewerModal";

const RisksList = () => {
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

  if (loading) return <div className={styles.loading}>Loading risks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (risks.length === 0)
    return <div className={styles.empty}>No risks found.</div>;

  // Get all tasks linked to a risk
  const getLinkedTasks = (riskId) => {
    const linkedTaskIds = taskRisks
      .filter((tr) => tr.risk_id === riskId)
      .map((tr) => tr.task_id);

    const linkedTasks = tasks.filter((t) => linkedTaskIds.includes(t.id));
    if (linkedTasks.length === 0) return "None";
    return linkedTasks;
  };


  const getLinkedProjects = (riskId) => {
 
    const linkedProjectIds = projectRisks
      .filter((pr) => pr.risk_id === riskId)
      .map((pr) => pr.project_id);

    const linkedTaskIds = taskRisks
      .filter((tr) => tr.risk_id === riskId)
      .map((tr) => tr.task_id);

    const taskProjects = tasks
      .filter((t) => linkedTaskIds.includes(t.id))
      .map((t) => t.project_id);

    const allProjectIds = [...new Set([...linkedProjectIds, ...taskProjects])];
    const allProjects = projects.filter((p) => allProjectIds.includes(p.id));
    
    if (allProjects.length === 0) return "None";
    if (allProjects.length === 1) {
      return allProjects[0].name;
    } else {
      return `${allProjects[0].name} + ${allProjects.length - 1}`;
    }
  };

  return (
    <div className={styles.riskList}>
      <div className={styles.riskHeader}>
        <div className={styles.headerName}>Name</div>
        <div className={styles.headerImpact}>Impact</div>
        <div className={styles.headerLikelihood}>Likelihood</div>
        <div className={styles.headerScore}>Score</div>
        <div className={styles.headerDate}>Date</div>
        <div className={styles.headerTasks}>Tasks</div>
        <div className={styles.headerProjects}>Projects</div>
      </div>

      <div className={styles.riskContainer}>
        {risks.map((risk) => (
          <div
            key={risk.id}
            className={styles.riskRow}
            onClick={() => setSelectedRisk(risk)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.riskName}>{risk.name}</div>
            <div className={styles.riskImpact}>{risk.pre_impact}</div>
            <div className={styles.riskLikelihood}>{risk.pre_likelihood}</div>
            <div className={styles.riskScore}>{risk.pre_score}</div>
            <div className={styles.riskDate}>
              {risk.date ? new Date(risk.date).toLocaleDateString() : "-"}
            </div>
            <div className={styles.riskTasks}>
              {getLinkedTasks(risk.id) === "None"
                ? "None"
                : (() => {
                    const linkedTasks = getLinkedTasks(risk.id);
                    return (
                      <span>
                        {linkedTasks[0].name}
                        {linkedTasks.length > 1
                          ? ` + ${linkedTasks.length - 1} more`
                          : ""}
                      </span>
                    );
                  })()}
            </div>
            <div className={styles.riskProjects}>
              {getLinkedProjects(risk.id)}
            </div>
          </div>
        ))}
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

export default RisksList;