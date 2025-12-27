import React from 'react';
import { Outlet } from 'react-router-dom';
import TasksList from '../components/jsx/TasksList.jsx';
import styles from './TasksViewer.module.css';

const TasksViewer = () => {
  return (
    <div className={styles.tasksViewer}>
      <TasksList />
      <Outlet />
    </div>
  )
};
  
export default TasksViewer;