const express = require('express');
const axios = require('axios');
const api = require('../api.js'); // adjust as needed
const app = express.Router();  // <

app.use(express.json());  // To parse JSON body

// ✅ Get all group
//you have to send the user id to access all the groups 
app.get('/group/:userId', async (req, res) => {//*****url changed
    const user_Id = req.params;
    try {
        const response = await api.groupapi.get(`/groups/${user_Id}`);
        res.json(response);//.data
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Create a group
app.post('/group/createGroup/:user_id', async (req, res) => {
    const user_id = req.params;
    try {
        const response = await api.groupapi.post(`/groups/${user_id}`, req.body);
        //console.log(response);//.data
        res.status(200).json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Update a group
app.put('/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
    try {
        const response = await api.groupapi.put(`/groups/${groupId}`, req.body);
        console.log(response);
        res.status(200).json({ msg: 'Task update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Delete a group
app.delete('/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
    try {
        const response = await api.groupapi.delete(`/groups/${groupId}`);
        console.log(response.data);
        res.status(200).json({ msg: 'Task delete successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
module.exports = app; // <-- export router
