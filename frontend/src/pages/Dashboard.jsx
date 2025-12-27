import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import NavBar from '../components/jsx/NavBar.jsx';
import ProjectsCard from '../components/jsx/ProjectsCard.jsx';
import RisksCard from '../components/jsx/RisksCard.jsx';
import GanttChart from '../components/jsx/GanttChart.jsx';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardColumn}>
        <div className={styles.dashboardRow}>
          <div className={styles.projectsCardWrapper}>
            <ProjectsCard />
          </div>
          <div className={styles.risksCardWrapper}>
            <RisksCard />
          </div>
        </div>
        <div className={styles.ganttChartWrapper}>
          <GanttChart />
        </div>
      </div>
      
    </div>

    
  )
  
}