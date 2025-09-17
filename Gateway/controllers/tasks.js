const express = require('express');
const axios = require('axios');
const api = require('../api.js'); // adjust as needed
const app = express.Router();  // <
app.use(express.json());  // To parse JSON body

// ✅ Update a task
app.put('/task/:groupId/task/:taskId', async (req, res) => {
    console.log("comes in gateway of update task")
    const { groupId, taskId } = req.params;
    console.log(groupId, taskId, req.body)
    const a = req.body
    try {
        const response = await api.taskapi.patch(`/${groupId}/tasks/${taskId}`, { a });
        console.log(response.data);
        res.status(200).json({ msg: 'Task update successful' });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Create a task
app.post('/task/:groupId/task/create', async (req, res) => {
    console.log("comes here")
    const { groupId } = req.params;
    console.log(groupId)
    console.log(req.body)
    try {
        console.log("comes in try")
        const response = await api.taskapi.post(`/${groupId}/tasks`, req.body);
        console.log(response.data);
        res.status(200).json({ msg: 'Task creation successful' });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Get all tasks of a group
app.get('/task/:groupId/tasks', async (req, res) => {
    console.log("request comes here")
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
    console.log("delete request comes here")
    const { groupId, taskId } = req.params;
    console.log(groupId, taskId)
    try {
        const response = await api.taskapi.delete(`/${groupId}/tasks/${taskId}`);
        console.log(response.data);
        res.status(200).json({ msg: 'Task delete successful' });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
module.exports = app
