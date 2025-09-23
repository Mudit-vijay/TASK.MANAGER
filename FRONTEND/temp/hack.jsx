import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function OAuthSuccess() {
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchToken() {
            try {
                const res = await axios.get("http://localhost:2144/api/stateless-oauth/token", { withCredentials: true });
                console.log("Access token:", res.data.access_token);
                localStorage.setItem("token", res.data.access_token)
                if (res.data.access_token) {
                    navigate("/taskManager");
                }
                else {
                    console.log("not working");

                }
            } catch (err) {
                console.error(err.response?.data || err);
            }
        }
        fetchToken();
    }, []);

    return <h1>OAuth Success! Fetching token...</h1>;
}
