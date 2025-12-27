import React, { useState, useEffect } from "react";
import styles from "../styles/GanttChart.module.css";
import { getProjects } from "../../api/projects";
import { getMilestones } from "../../api/milestones";
import ProjectViewerModal from "../modals/ProjectViewerModal";
import MilestoneViewerModal from "../modals/MilestoneViewerModal";

const GanttChart = () => {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for modals
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [projectData, milestonesData] = await Promise.all([
          getProjects().catch((err) => {
            console.error(err);
            return [];
          }),
          getMilestones().catch((err) => {
            console.error(err);
            return [];
          }),
        ]);
        setProjects(projectData || []);
        setMilestones(milestonesData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTimeline = (projectsData) => {
    if (!projectsData || projectsData.length === 0)
      return { startDate: new Date(), endDate: new Date(), totalDays: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = today;
    let maxDate = today;

    projectsData.forEach((project) => {
      if (project.end_date && new Date(project.end_date) > maxDate)
        maxDate = new Date(project.end_date);
      const projectMilestones = milestones.filter(
        (m) => m.project_id === project.id
      );
      projectMilestones.forEach((m) => {
        if (m.end_date && new Date(m.end_date) > maxDate)
          maxDate = new Date(m.end_date);
      });
    });

    const paddingDays = 7;
    maxDate = new Date(maxDate.getTime() + paddingDays * 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((maxDate - startDate) / (24 * 60 * 60 * 1000));
    return { startDate, endDate: maxDate, totalDays };
  };

  const getPositionPercentage = (date, startDate, totalDays) => {
    if (!date) return 0;
    const diffDays = (new Date(date) - startDate) / (24 * 60 * 60 * 1000);
    return Math.max(0, Math.min(100, (diffDays / totalDays) * 100));
  };

  const formatTimelineDate = (date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      date
    );

  const generateTimelineMarkers = (startDate, endDate, totalDays) => {
    const markers = [];
    const maxMarkers = 8; // how many labels you want across the top

    for (let i = 0; i < maxMarkers; i++) {
      // Calculate percentage by evenly distributing markers visually
      const percentage = (i / (maxMarkers - 1)) * 100;
      
      // Calculate the actual date at this percentage of the timeline
      const daysFromStart = (percentage / 100) * totalDays;
      const markerDate = new Date(
        startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000
      );

      markers.push({
        percentage,
        date: markerDate,
        label: formatTimelineDate(markerDate),
      });
    }

    return markers;
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  if (projects.length === 0)
    return (
      <div className={styles.emptyContainer}>
        <p>No projects found.</p>
      </div>
    );

  const displayProjects = projects.slice(0, 3);
  const timeline = calculateTimeline(displayProjects);
  const timelineMarkers = generateTimelineMarkers(
    timeline.startDate,
    timeline.endDate,
    timeline.totalDays
  );

  return (
    <div className={styles.ganttContainer}>
      <div className={styles.timelineHeader}>
        <div className={styles.projectLabelsHeader}>Timeline</div>
        <div className={styles.timelineScale}>
          {timelineMarkers.map((marker, index) => (
            <div
              key={index}
              className={styles.timelineMarker}
              style={{ left: `${marker.percentage}%` }}
            >
              <div className={styles.markerLine} />
              <div className={styles.markerLabel}>{marker.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ganttBody}>
        {displayProjects.map((project, index) => {
          const projectStart = getPositionPercentage(
            project.start_date,
            timeline.startDate,
            timeline.totalDays
          );
          const projectEnd = getPositionPercentage(
            project.end_date,
            timeline.startDate,
            timeline.totalDays
          );
          const projectWidth = Math.max(2, projectEnd - projectStart);
          const projectMilestones = milestones.filter(
            (d) => d.project_id === project.id
          );

          return (
            <div key={project.id || index} className={styles.ganttRow} onClick={() => setSelectedProject(project)}>
              <div className={styles.projectLabel}>
                <div className={styles.projectName}>{project.name}</div>
                <div className={styles.projectOwner}>{project.owner}</div>
              </div>
              <div className={styles.ganttTrack}>
                <div
                  className={styles.projectBar}
                  style={{
                    left: `${projectStart}%`,
                    width: `${projectWidth}%`,
                  }}
                />

                {projectMilestones.map((milestone, milestoneIndex) => {
                  const milestonePosition = getPositionPercentage(
                    milestone.end_date,
                    timeline.startDate,
                    timeline.totalDays
                  );
                  return (
                    <div
                      key={milestone.id || milestoneIndex}
                      className={styles.milestone}
                      style={{ left: `${milestonePosition}%` }}
                      title={milestone.name || "Milestone"}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent project bar click
                        setSelectedMilestone(milestone);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectViewerModal
          isOpen={!!selectedProject}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
      {selectedMilestone && (
        <MilestoneViewerModal
          isOpen={!!selectedMilestone}
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  );
};

export default GanttChart;