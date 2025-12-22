import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../src/services/api";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token"); // <-- query param

  useEffect(() => {
    const handleOAuth = async () => {
      if (!token) return;
      try {
        localStorage.setItem("token", token);
        console.log("Token stored:", token);

        const res = await authService.OauthCreation();
        console.log("Backend response:", res);

        const id = res.data.data.id;
        localStorage.setItem("token", res.data.data.token);

        navigate("/taskManager");
      } catch (err) {
        console.error("OAuth error:", err);
      }
    };

    handleOAuth();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Authentication Successful!</h2>
      <p>Redirecting...</p>
    </div>
  );
}

export default OAuthSuccess;
