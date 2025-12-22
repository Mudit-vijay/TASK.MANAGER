const express = require('express');
const api = require('../api.js'); // adjust as needed
const app = express.Router();  // <

app.use(express.json());  // To parse JSON body

// ✅ Get all group
//you have to send the user id to access all the groups 
app.get("/groups", async (req, res) => {
    const authHeader = req.headers["authorization"];  // OR req.get("Authorization")

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        console.log("comes in try")
        const response = await api.groupapi.get('/groups', {
            headers: {
                Authorization: `${token}`
            }
        });
        console.log("printing response")
        console.log(response.data);
        return res.status(200).json(response.data);
    } catch (err) {
        console.log("comes in error")
        res.status(403).json({ message: "Invalid token" });
    }
});



// ✅ Create a group
app.post('/group/create', async (req, res) => {
    console.log("cerate a groups 1")
    const authHeader = req.headers['authorization'];
    console.log(authHeader)
    if (!authHeader) {
        return res.status(401).json({ msg: "token not present" });
    }
    const token = authHeader.split(" ")[1];
    console.log("cerate a groups 2")
    try {
        console.log("comes in try 1")
        const response = await api.groupapi.post(`/groups`,
            req.body, {
            headers: {
                Authorization: `${token}`
            }
        });
        //console.log(response);//.data
        console.log(response.data);
        res.status(200).json(response.data);
    } catch (err) {
        console.log("error")
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// ✅ Update a group
app.put('/group/:groupId/update', async (req, res) => {
    console.log("update a groups1");
    const { groupId } = req.params;
    // const authHeader = req.headers['Authorization']
    const authHeader = req.headers['authorization']
    const token = authHeader.split(" ")[1];
    console.log(token)
    console.log("update a groups2");
    console.log(groupId)
    console.log(req.body);
    try {
        const response = await api.groupapi.patch(`/groups/${groupId}`, req.body, {
            headers: {
                Authorization: `${token}`
            }
        });

        res.status(200).json({ msg: 'Task update successful' });
    } catch (err) {
        // console.error(err);
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





