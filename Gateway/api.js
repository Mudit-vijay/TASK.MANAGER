import axios from "axios";

const BASEURLS = {
  base1: "https://og-taskmanager.onrender.com/api/v1",
  base2: "https://main-backend-4786.onrender.com/api/v1/task",
  base3: "https://main-backend-4786.onrender.com/api/v1/group",
};

const headers = {
  "Content-Type": "application/json",
};

const createAPIinstance = (baseURL) => {
  return axios.create({ baseURL, withCredentials: true, headers: { ...headers } });
};

const authapi = createAPIinstance(BASEURLS.base1);
const taskapi = createAPIinstance(BASEURLS.base2);
const groupapi = createAPIinstance(BASEURLS.base3);

export { authapi, taskapi, groupapi };
