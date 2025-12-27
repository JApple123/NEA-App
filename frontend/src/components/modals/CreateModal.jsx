import React, { useState, useEffect } from "react";
import styles from "../styles/CreateModal.module.css";
import CreateProjectForm from "./CreateProjectForm.jsx";
import CreateTaskForm from "./CreateTaskForm.jsx";
import CreateMilestoneForm from "./CreateMilestoneForm.jsx";
import CreateRiskForm from "./CreateRiskForm.jsx";

const CreateModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("project");
  const [isVisible, setIsVisible] = useState(false);
  const [showOpenClass, setShowOpenClass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // mount the modal
      // small delay to allow CSS transition
      const openTimeout = setTimeout(() => setShowOpenClass(true), 10);
      return () => clearTimeout(openTimeout);
    } else {
      // remove open class to trigger fade out
      setShowOpenClass(false);
      // wait for CSS transition before unmounting
      const closeTimeout = setTimeout(() => setIsVisible(false), 300); // match CSS
      return () => clearTimeout(closeTimeout);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${showOpenClass ? styles.open : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className={styles.modalTabs}>
          {["project", "task", "milestone", "risk"].map((t) => (
            <button
              key={t}
              className={`${styles.tabButton} ${
                activeTab === t ? styles.active : ""
              }`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Form */}
        <div className={styles.modalBody}>
          {activeTab === "project" && <CreateProjectForm onClose={onClose} />}
          {activeTab === "task" && <CreateTaskForm onClose={onClose} />}
          {activeTab === "milestone" && (
            <CreateMilestoneForm onClose={onClose} />
          )}
          {activeTab === "risk" && <CreateRiskForm onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
