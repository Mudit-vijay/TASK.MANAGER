const axios = require("axios");

const BASEURLS = {
  base1: "https://backend-b-wxdw.onrender.com/api/v1",
  base2: "https://backend-a-tvul.onrender.com/api/v1/task",
  base3: "https://backend-a-tvul.onrender.com/api/v1/group",
};
// const BASEURLS = {
//   base1: "https://backend-b-wxdw.onrender.com/api/v1",
//   base2: "https://backend-a-tvul.onrender.com/api/v1/task",
//   base3: "https://backend-a-tvul.onrender.com/api/v1/group",
// };
// const BASEURLS = {
//   base1: "http://localhost:4282/api/v1",
//   base2: "http://localhost:9000/api/v1/task",
//   base3: "http://localhost:9000/api/v1/group",
// }
const headers = {
  "Content-Type": "application/json",
};

const createAPIinstance = (baseURL) => {
  return axios.create({ baseURL, withCredentials: true, headers: { ...headers } });
};

const authapi = createAPIinstance(BASEURLS.base1);
const taskapi = createAPIinstance(BASEURLS.base2);
const groupapi = createAPIinstance(BASEURLS.base3);

module.exports = { authapi, taskapi, groupapi };


