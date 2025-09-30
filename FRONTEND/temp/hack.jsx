import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../src/services/api";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        localStorage.setItem("token", token);
        console.log("Token stored:", token);

        const res = await authService.OauthCreation(token);
        console.log("comes back");
        console.log(res);
        console.log("printing completed");
        const id = res.data.data.id;
        console.log(id);
        localStorage.removeItem("token");
        localStorage.setItem("token", res.data.data.token);
        // navigate(`/phase2/${id}`);
        navigate(`/taskManager`);
      } catch (err) {
        console.error("OAuth error:", err);
      }
    };

    if (token) {
      handleOAuth();
    }
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Authentication Successful!</h2>
      <p>Redirecting...</p>
    </div>
  );
}

export default OAuthSuccess;
