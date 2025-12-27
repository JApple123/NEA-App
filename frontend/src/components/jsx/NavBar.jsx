import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "../styles/NavBar.module.css";
import CreateModal from "../modals/CreateModal.jsx";

const Navbar = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("currentPage");
    return saved === null ? "Dashboard" : saved;
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={() => setCurrentPage("Dashboard")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/viewer"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={() => setCurrentPage("Viewer")}
          >
            Viewer
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/resources"
            className={({ isActive }) => (isActive ? styles.active : "")}
            onClick={() => setCurrentPage("Resources")}
          >
            Resources
          </NavLink>
        </li>
      </ul>

      <button
        className={styles.newButton}
        onClick={() => {
          setShowModal(true);
          console.log("Opening Create Modal");
        }}
      >
        New
      </button>

      {/* Modal mounted here */}
      <CreateModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </nav>
  );
};

export default Navbar;
