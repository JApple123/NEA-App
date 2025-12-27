import React from 'react';
import { Outlet } from 'react-router-dom';
import MilestonesList from '../components/jsx/MilestonesList.jsx';
import styles from './MilestonesViewer.module.css';

const MilestonesViewer = () => {
  return (
    <div className={styles.milestonesViewer}>
      <MilestonesList />
      <Outlet />
    </div>
  )
};
  
export default MilestonesViewer;