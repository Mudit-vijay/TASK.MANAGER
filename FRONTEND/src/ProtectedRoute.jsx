import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "./services/api";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    authService.me()
      .then(() => active && setStatus("authenticated"))
      .catch(() => active && setStatus("anonymous"));
    return () => { active = false; };
  }, []);

  if (status === "loading") return null;
  return status === "authenticated" ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
