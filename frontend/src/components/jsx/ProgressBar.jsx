import React, { useState, useEffect } from 'react';
import styles from '../styles/ProgressBar.module.css';


export default function ProgressBar({ progress = 0 }) {
  
  const clampedProgress = Math.max(0, Math.min(100, progress));
      
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className={styles.progressText}>{clampedProgress}%</span>
    </div>
  )
  
};