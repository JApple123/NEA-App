// src/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/jsx/Layout.jsx";
import Dashboard from "./pages/Dashboard";
import ViewerBrowser from "./components/jsx/ViewerBrowser.jsx"; // Ensure this is the correct import path
import ProjectsViewer from "./pages/ProjectsViewer";
import TasksViewer from "./pages/TasksViewer";
import MilestonesViewer from "./pages/MilestonesViewer";
import RisksViewer from "./pages/RisksViewer";
import ResourcesPage from "./pages/ResourcesPage.jsx";

function AppRoutes() {
  console.log("AppRoutes rendering");
  console.log("ViewerBrowser import:", ViewerBrowser);
  console.log("ProjectsViewer import:", ProjectsViewer);

  return (
    <Routes>
      {/* Top-level layout with always-visible NavBar */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* Viewer section */}
        <Route path="viewer" element={<ViewerBrowser />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<ProjectsViewer />} />
          <Route path="tasks" element={<TasksViewer />} />
          <Route path="milestones" element={<MilestonesViewer />} />
          <Route path="risks" element={<RisksViewer />} />
        </Route>
        <Route path="resources" element={<ResourcesPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
