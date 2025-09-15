import Group from "../models/Group.js";
import Task from "../models/tasks.js";

const getAllTaskks = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
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
    // console.log("comes here")
    const { groupId } = req.params;
    // console.log(groupId)
    const taskd = req.body;
    // console.log(taskd)

    try {
        const group = await Group.findById(groupId);
        // console.log(group)
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        const newTask = await Task.create(taskd);
        group.tasks.push(newTask._id);
        await group.save();
        console.log(group);

        res.status(200).json({ msg: "Task created successfully", task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const updatetask = async (req, res) => {
    console.log("requeset received in update task backend")
    const { taskId } = req.params;
    const updatedData = req.body.a;

    try {
        const updated = await Task.findByIdAndUpdate(taskId, updatedData, { new: true });
        if (!updated) {
            return res.status(404).json({ msg: `Task not found with id: ${taskId}` });
        }

        res.status(200).json({ msg: "Task updated", task: updated });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const deletetask = async (req, res) => {
    console.log("delete request comes in backend")
    const { groupId, taskId } = req.params;
    console.log(groupId, taskId)
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: "Group not found" });
        }

        group.tasks = group.tasks.filter(id => id.toString() !== taskId);
        await group.save();

        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ msg: "Task deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export {
    getAllTaskks,
    createtask,
    updatetask,
    deletetask
};
