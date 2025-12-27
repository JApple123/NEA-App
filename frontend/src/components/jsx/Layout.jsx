// src/components/jsx/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import CreateModal from '../modals/CreateModal.jsx';   // adjust path if needed
import styles from '../styles/Layout.module.css';

const Layout = () => {
  // Modal state
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('project'); // 'project', 'task', 'milestone', or 'risk'

  // Function passed down to NavBar
  const openModal = (type = 'project') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <div className={styles.layout}>
      {/* Pass handler to NavBar */}
      <NavBar onOpenModal={openModal} />

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Render global modal above everything */}
      <CreateModal
        isOpen={isModalOpen}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Layout;