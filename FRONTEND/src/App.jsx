import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/authentication/Login";
import NavBar from "./components/layout/NavBar";
import Diskspace from "../temp/phase_ii_ui";
import ProtectedRoute from "./ProtectedRoute"; // Import the protected route
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/phase2"
            element={
              <ProtectedRoute>
                <Diskspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/taskManager"
            element={
              <ProtectedRoute>
                <NavBar />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
