import React, { useState, useEffect } from "react";
import styles from "../styles/MilestonesList.module.css";
import { getProjects } from "../../api/projects";
import { getMilestones } from "../../api/milestones";
import MilestoneViewerModal from "../modals/MilestoneViewerModal.jsx";

const MilestonesList = () => {
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch milestones and projects
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [milestoneData, projectData] = await Promise.all([
        getMilestones(),
        getProjects(),
      ]);
      setMilestones(milestoneData || []);
      setProjects(projectData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedMilestone(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    // Refetch data after save
    await fetchData();
    handleCloseModal();
  };

  const handleDelete = async () => {
    // Refetch data after delete
    await fetchData();
    handleCloseModal();
  };

  if (loading)
    return <div className={styles.loading}>Loading milestones...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (milestones.length === 0)
    return <div className={styles.empty}>No milestones found.</div>;

  return (
    <div className={styles.milestoneList}>
      
      <div className={styles.milestoneHeader}>
        <div className={styles.headerName}>NAME</div>
        <div className={styles.headerStatus}>STATUS</div>
        <div className={styles.headerStart}>DATE</div>
        <div className={styles.headerOwner}>OWNER</div>
        <div className={styles.headerProject}>PROJECT</div>
      </div>

    
      {milestones.map((milestone) => {
        const isComplete = milestone.complete === 1;
        const project = projects.find((p) => p.id === milestone.project_id);
        return (
          <div
            key={milestone.deliverable_id}
            className={styles.milestoneRows}
            onClick={() => handleOpenModal(milestone)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.milestoneName}>{milestone.name}</div>
            <div className={styles.milestoneStatus}>
              <span
                className={styles.statusIndicator}
                style={{ backgroundColor: isComplete ? "green" : "red" }}
              ></span>
            </div>
            <div className={styles.milestoneStart}>
              {new Date(milestone.end_date).toLocaleDateString()}
            </div>
            <div className={styles.milestoneOwner}>{milestone.owner}</div>
            <div className={styles.milestoneProject}>
              {project ? project.name : "Unassigned"}
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {isModalOpen && selectedMilestone && (
        <MilestoneViewerModal
          isOpen={isModalOpen}
          milestone={selectedMilestone}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default MilestonesList;