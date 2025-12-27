import React from 'react';
import { Outlet } from 'react-router-dom';
import RisksList from '../components/jsx/RisksList.jsx';
import styles from './RisksViewer.module.css';

const RisksViewer = () => {
  return (
    <div className={styles.risksViewer}>
      <RisksList />
      <Outlet />
    </div>
  )
};
  
export default RisksViewer;