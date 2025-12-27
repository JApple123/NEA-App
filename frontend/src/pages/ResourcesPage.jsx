import React from 'react';
import { Outlet } from 'react-router-dom';
import ResourcesTimline from '../components/jsx/ResourcesTimeline.jsx';
import styles from './ResourcesPage.module.css';

const ResourcesPage = () => {
  return (
    <div className={styles.resourcesPage}>
      <ResourcesTimline />
      <Outlet />
    </div>
)
};
  
export default ResourcesPage;