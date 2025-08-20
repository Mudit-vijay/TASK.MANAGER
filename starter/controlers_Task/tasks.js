const Group = require('../models/Group');
const Task = require('../models/tasks');

const getAllTaskks = async (req, res) => {
    const { groupId } = req.params;
    try {
        const task = await Group.findById(groupId);
        if (!task) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        const tasks = await Task.find({ _id: { $in: group.tasks } });

        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const createtask = async (req, res) => {
    const { groupId } = req.params;
    const taskd = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        const newTask = await Task.create(taskd);
        group.tasks.push(newTask._id);
        await group.save();

        res.status(200).json({ msg: 'Task created successfully', task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const updatetask = async (req, res) => {
    const { taskId } = req.params;
    const updatedData = req.body;

    try {
        const updated = await Task.findByIdAndUpdate(taskId, updatedData, { new: true });
        if (!updated) {
            return res.status(404).json({ msg: `Task not found with id: ${taskId}` });
        }

        res.status(200).json({ msg: 'Task updated', task: updated });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const deletetask = async (req, res) => {
    const { groupId, taskId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found` });
        }

        group.tasks = group.tasks.filter(id => id.toString() !== taskId);
        await group.save();

        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ msg: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

module.exports = {
    getAllTaskks,
    createtask,
    updatetask,
    deletetask
};
