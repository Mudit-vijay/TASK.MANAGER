import axios from 'axios';
const BASE_URLS = {
    AUTH: 'https://task-manager-xp1g.onrender.com',
    TASKS: 'https://task-manager-xp1g.onrender.com',
    GROUPS: 'https://task-manager-xp1g.onrender.com'
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
const tasksApi = createApiInstance(`${BASE_URLS.TASKS}/createtask`);
const groupsApi = createApiInstance(BASE_URLS.GROUPS);

export const authService = {
    login: async (credentials) => {//use spread operators here for merge request of two different groups so that two different id can be passed through one request body  
        console.log("request chali");
        const response = await authApi.post('/api/v1/login', credentials);
        return response.data;
    },

    createUser: async (userData) => {
        console.log("request chali");
        const response = await authApi.post('/api/v1/createUser', userData);
        return response.data;
    }
};

export const groupService = {
    getGroups: async (groupId) => {
        const response = await groupsApi.get(`/api/v1/group/${groupId}`);
        return response.data;
    },
    createGroups: async (name, state, groupId) => {
        const response = await groupsApi.post(`/group/${groupId}/task/create`, {
            name,
            completed: state
        });
        return response.data;
    },
    updateGroup: async (groupId, taskId, name) => {
        const response = await groupsApi.post(`/api/v1/group/${groupId}/task/${taskId}`, {
            name
        });
        return response.data;
    },
    deleteGroup: async (id) => {
        const response = await groupsApi.delete(`api/v1/group/${id}`);
        return response.data;
    }
};
export const taskSERVICES = {
    getALLTASKS: async (groupId) => {
        const response = await tasksApi.get(`/api/v1/task/${groupId}`);
        return response.data;
    },
    createTASK: async (groupId, name, state) => {
        const response = await (`/api/v1/task/${groupId}/task/create`, {
            name: name,
            completed: state
        });
        return response.data;
    },
    updateTASK: async (groupId, taskId, name) => {
        const response = groupsApi.post(`/task/${groupId}/task/${taskId}`, {
            name: name
        })
        return (await response).data;
    },
    deleteTASK: async (groupId, taskId) => {
        const response = await groupsApi.delete(`/api/v1/task/${groupId}/task/${taskId}`)
        return response.data;
    }
}

export default {
    authApi,
    tasksApi,
    groupsApi
};
