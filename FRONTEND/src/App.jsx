import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/authentication/Login";
import Dashboard from "../temp/phase_ii_ui";
import GroupView from "../temp/groupView";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";
import OAuthSuccess from "../temp/hack";
import PersonalTasks from "./components/task-manager/PersonalTasks.jsx";
import AuditLogs from "./components/task-manager/AuditLogs.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/oauth-success/:token" element={<OAuthSuccess />} />
          <Route
            path="/taskManager"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/group/:id"
            element={<ProtectedRoute><GroupView /></ProtectedRoute>}
          />
          <Route path="/personal" element={<ProtectedRoute><PersonalTasks /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
