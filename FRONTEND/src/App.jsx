import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/authentication/Login";
import NavBar from "./components/layout/NavBar";
import "./App.css";
import { useSelector } from "react-redux";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const state = useSelector((state) => state.auth);
  return state.isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/taskManager" element={<NavBar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
export default App;
              // <ProtectedRoute>
              // </ProtectedRoute>
