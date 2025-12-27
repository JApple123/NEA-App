import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import styles from '../styles/ViewerBrowser.module.css';

const ViewerBrowser = () => {

console.log('Rendering ViewerBrowser');

  return (
    <div className={styles.viewerBrowser}> {/* Added wrapper div */}
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="projects" // Changed from "/viewer/projects" to relative path
              className={({ isActive }) =>
                isActive ? styles.navItemActive : styles.navItem
              }
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="tasks" // Changed from "/viewer/tasks" to relative path
              className={({ isActive }) =>
                isActive ? styles.navItemActive : styles.navItem
              }
            >
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink
              to="milestones" // Changed from "/viewer/milestones" to relative path
              className={({ isActive }) =>
                isActive ? styles.navItemActive : styles.navItem
              }
            >
              Milestones
            </NavLink>
          </li>
          <li>
            <NavLink
              to="risks" // Changed from "/viewer/risks" to relative path
              className={({ isActive }) =>
                isActive ? styles.navItemActive : styles.navItem
              }
            >
              Risks
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className={styles.viewerContent}> {/* Changed to use CSS module */}
        <Outlet />
      </div>
    </div>
  );
};

export default ViewerBrowser;