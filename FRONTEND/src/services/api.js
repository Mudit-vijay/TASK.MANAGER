import axios from 'axios';

const BASE_URLS = {
    AUTH: 'https://task-manager-xp1g.onrender.com/api/v1',
    TASKS: 'https://task-manager-xp1g.onrender.com/api/v1',
    GROUPS: 'https://task-manager-xp1g.onrender.com/api/v1'
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
        console.log("request chali login ki");
        const response = await authApi.post('/login', credentials);
        console.log("request chali login ki 2");
        console.log(response);
        return response;
    },

    createUser: async (userData) => {
        console.log("request chali");
        const response = await authApi.post('/createUser', userData);
        return response.data;
    }
};

export const groupService = {
    getGroups: async (token) => {
        console.log("request received");
        const response = await groupsApi.get('/group', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },
    createGroups: async (name, state) => {
        const response = await groupsApi.post('/group/create', {
            name,
            completed: state
        });
        return response.data;
    },
    updateGroup: async (groupId, name) => {
        const response = await groupsApi.post(`/group/${groupId}/update`, { name });
        return response.data;
    },
    deleteGroup: async (id) => {
        const response = await groupsApi.delete(`/group/${id}`);
        return response.data;
    }
};

export const taskSERVICES = {
    getALLTASKS: async (groupId) => {
        const response = await tasksApi.get(`/task/${groupId}`);
        return response.data;
    },
    createTASK: async (groupId, name, state) => {
        const response = await tasksApi.post(`/task/${groupId}/task/create`, {
            name,
            completed: state
        });
        return response.data;
    },
    updateTASK: async (groupId, taskId, name) => {
        const response = await tasksApi.post(`/task/${groupId}/task/${taskId}`, {
            name
        });
        return response.data;
    },
    deleteTASK: async (groupId, taskId) => {
        const response = await tasksApi.delete(`/task/${groupId}/task/${taskId}`);
        return response.data;
    }
};

export default {
    authApi,
    tasksApi,
    groupsApi
};
