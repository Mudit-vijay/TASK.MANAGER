import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/authentication/Login";
import NavBar from "./components/layout/NavBar";
import Diskspace from "../temp/phase_ii_ui";
import Groupspace from "../temp/groupView";
import ProtectedRoute from "./ProtectedRoute"; // Import the protected route
import "./App.css";
import OAuthSuccess from "../temp/hack";
import Otpverification from "./components/auth/Otpverification.jsx";
const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/oauth-success/:token" element={<OAuthSuccess />} />
          <Route path="/verifyotp" element={<Otpverification />} />
          <Route
            path="/taskManager"
            element={
                <NavBar />
            }
          />
          <Route
            path="/group/:id"
            element={
                <Groupspace />
            }
          />
          <Route
            path="/phase2/:id"
            element={
              <ProtectedRoute>
                <Diskspace />
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
