import Group from "../models/Group.js";
import Task from "../models/tasks.js";
import jwt from "jsonwebtoken";

const getAllTaskks = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        // Fetch tasks using the foreign key
        const tasks = await Task.find({ groupId: groupId });

        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const createtask = async (req, res) => {
    const { groupId } = req.params;
    const taskData = req.body;

    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT);
        const user_id = decoded.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        // Create the task with relations
        const newTask = await Task.create({
            ...taskData,
            groupId: groupId,
            userId: user_id,
            userName: taskData.userName || "Unknown User" // Fallback if frontend misses it
        });

        res.status(201).json({ msg: "Task created successfully", task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const updatetask = async (req, res) => {
    const { taskId } = req.params;
    // Updated data could be the whole body or nested in 'a' based on previous code. Assuming req.body now.
    const updatedData = req.body; 

    try {
        const updated = await Task.findByIdAndUpdate(taskId, updatedData, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ msg: `Task not found with id: ${taskId}` });
        }

        res.status(200).json({ msg: "Task updated", task: updated });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const deletetask = async (req, res) => {
    const { groupId, taskId } = req.params;
    
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: "Group not found" });
        }

        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
             return res.status(404).json({ msg: "Task not found" });
        }

        res.status(200).json({ msg: "Task deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const getAllTasksAdmin = async (req, res) => {
    try {
        const tasks = await Task.find({}).populate('groupId', 'name');
        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const deleteTaskAdmin = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }
        res.status(200).json({ msg: "Task deleted by Admin" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export {
    getAllTaskks,
    createtask,
    updatetask,
    deletetask,
    getAllTasksAdmin,
    deleteTaskAdmin
};
