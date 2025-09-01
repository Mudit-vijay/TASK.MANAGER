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
const tasksApi = createApiInstance(`${BASE_URLS.TASKS}/createtask`);
const groupsApi = createApiInstance(BASE_URLS.GROUPS);

export const authService = {
    login: async (credentials) => {//use spread operators here for merge request of two different groups so that two different id can be passed through one request body  
        console.log("request chali login ki");
        const response = await authApi.post('/login', credentials);
        console.log("request chali login ki 2");
        console.log(response);
        return response
    },

    createUser: async (userData) => {
        console.log("request chali");
        const response = await authApi.post('/createUser', userData);
        return response.data;
    }
};

export const groupService = {
    getGroups: async () => {
        const response = await groupsApi.get('/group');
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
        const response = await groupsApi.post( `/group/${groupId}/update`, {
            name
        });
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
        const response = await (`/task/${groupId}/task/create`, {
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
        const response = await groupsApi.delete(`/task/${groupId}/task/${taskId}`)
        return response.data;
    }
}

export default {
    authApi,
    tasksApi,
    groupsApi
};


