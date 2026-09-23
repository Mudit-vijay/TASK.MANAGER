import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../src/services/api";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { token } = useParams(); // Read from path parameter instead
  
  useEffect(() => {
    const handleOAuth = async () => {
      if (!token) return;
      try {
        await authService.OauthCreation(token);
        navigate(`/taskManager`);
      } catch {
        navigate('/');
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
