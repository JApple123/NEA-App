import React from 'react';
import { Outlet } from 'react-router-dom';
import ProjectsList from '../components/jsx/ProjectsList.jsx';
import styles from './ProjectsViewer.module.css';

const ProjectsViewer = () => {
  return (
    <div className={styles.projectsViewer}>
      <ProjectsList />
      <Outlet />
    </div>
  )
};
  
export default ProjectsViewer;