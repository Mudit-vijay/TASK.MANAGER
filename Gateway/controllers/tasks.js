const express = require('express');
const axios = require('axios');
const api = require('../api.js'); // adjust as needed
const app = express.Router();  // <
app.use(express.json());  // To parse JSON body

// ✅ Update a task
app.put('/task/:groupId/task/:taskId', async (req, res) => {
    const { groupId, taskId } = req.params;
    try {
        const response = await api.taskapi.put(`/${groupId}/task/${taskId}`, req.body);
        console.log(response.data);
        res.status(200).json({ msg: 'Task update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Create a task
app.post('/task/:groupId/task/create', async (req, res) => {
    const { groupId } = req.params;
    try {
        const response = await api.taskapi.post(`/${groupId}/task`, req.body);
        console.log(response.data);
        res.status(200).json({ msg: 'Task creation successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Get all tasks of a group
app.get('/task/:groupId/tasks', async (req, res) => {
    const { groupId } = req.params;
    try {
        const response = await api.taskapi.get(`/${groupId}/task`);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Delete a task
app.delete('/task/:groupId/task/:taskId', async (req, res) => {
    const { groupId, taskId } = req.params;
    try {
        const response = await api.taskapi.delete(`/${groupId}/task/${taskId}`);
        console.log(response.data);
        res.status(200).json({ msg: 'Task delete successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
module.exports = app
