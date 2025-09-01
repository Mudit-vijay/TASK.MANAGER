const express = require('express');
const axios = require('axios');
const api = require('../api.js'); // adjust as needed
const app = express.Router();  // <

app.use(express.json());  // To parse JSON body

// ✅ Get all group
//you have to send the user id to access all the groups 
app.get('/group/:token', async (req, res) => {
console.log(req)
console.log("request received on geteway");
const {token}=req.params;
console.log("token="+token)
  try {
      const response = await api.groupapi.get(`/groups/${token}`, );
    console.log(response.data);
    res.json(response.data);   // use .data here
  } catch (err) {
    console.error("Gateway error:", err.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
});


// ✅ Create a group
app.post('/group/create', async (req, res) => {
    console.log("cerate a groups 1")
    const user_id = req.params;
    console.log("cerate a groups 2")
    try {
        const response = await api.groupapi.post(`/groups}`,{
            withCredentials:true,
            headers:{
                'Content-Type':'application/json',
            },
        },req.body);
        //console.log(response);//.data
        console.log(response);
        res.status(200).json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Update a group
app.put('/group/:groupId/update', async (req, res) => {
    console.log("update a groups1");
    const { groupId } = req.params;
    console.log("update a groups2");
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
    console.log("delete a group 1")
    const { groupId } = req.params;
    console.log("delete a group 2")
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




