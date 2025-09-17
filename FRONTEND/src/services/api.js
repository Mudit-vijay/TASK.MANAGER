import axios from 'axios';

// const BASE_URLS = {
//     AUTH: 'https://task-manager-xp1g.onrender.com/api/v1',
//     TASKS: 'https://task-manager-xp1g.onrender.com/api/v1',
//     GROUPS: 'https://task-manager-xp1g.onrender.com/api/v1'
// };

const BASE_URLS = {
    AUTH: 'http://localhost:8080/api/v1',
    TASKS: 'http://localhost:8080/api/v1',
    GROUPS: 'http://localhost:8080/api/v1'
};


const createApiInstance = (baseURL) => {
    return axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

const authApi = createApiInstance(BASE_URLS.AUTH);
const tasksApi = createApiInstance(BASE_URLS.TASKS);
const groupsApi = createApiInstance(BASE_URLS.GROUPS);

export const authService = {
    login: async (credentials) => {
        const response = await authApi.post('/login', credentials);
        return response;
    },

    createUser: async (userData) => {

        const response = await authApi.post('/createUser', userData);
        return response.data;
    }
};

export const groupService = {
    getGroups: async () => {

        const response = await groupsApi.get("/groups", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        return response;
    },
    createGroups: async (name, state) => {


        const response = await groupsApi.post(
            '/group/create',
            { name, completed: state },  // Request body
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            }
        );
        return response.data;
    },

    updateGroup: async (groupId, body) => {
        console.log(groupId)
        console.log("comes here in update group")
        console.log(body)
        const response = await groupsApi.put(`/group/${groupId}/update`, { body },

            {
                headers: {
                    Authorization: `Beares ${localStorage.getItem("token")}`,
                }
            }
        );
        return response.data;
    },
    deleteGroup: async (id) => {
        console.log("comes here")
        console.log(id)
        const response = await groupsApi.delete(`/group/${id}`);
        return response.data;
    }
};

export const taskSERVICES = {
    getALLTASKS: async (groupId) => {
        console.log("request comes in taskmanager api services")
        const response = await tasksApi.get(`/task/${groupId}`);
        return response.data;
    },
    createTASK: async (groupId, name) => {
        console.log("comes here")
        console.log(groupId, name)
        const response = await tasksApi.post(`/task/${groupId}/task/create`, {
            name,
        });
        return response.data;
    },
    updateTASK: async (groupId, taskId, name) => {
        console.log("Comes in service update task task manager", groupId, taskId, name)
        const response = await tasksApi.put(`/task/${groupId}/task/${taskId}`, {
            name
        });
        return response.data;
    },
    deleteTASK: async (groupId, taskId) => {
        console.log("comes in delete task" + groupId + taskId)
        const response = await tasksApi.delete(`/task/${groupId}/task/${taskId}`);
        return response.data;
    }
};

export default {
    authApi,
    tasksApi,
    groupsApi
};
