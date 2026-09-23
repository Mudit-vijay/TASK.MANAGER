import mongoose from "mongoose";
import axios from "axios";
import Group from "../models/Group.js";
import Task from "../models/tasks.js";
import AuditLog from "../models/AuditLogs.js";
import ScheduleRun from "../models/ScheduleRun.js";
import { groupRole } from "../middlewares/membership.js";

const getAssignableUser = async (group, requestedUserId, currentUserId) => {
    const candidateId = requestedUserId || currentUserId;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) return null;
    const user = await mongoose.connection.collection("customers").findOne(
        { _id: new mongoose.Types.ObjectId(candidateId) },
        { projection: { _id: 1, name: 1, email: 1 } }
    );
    if (!user) return null;
    return groupRole(group, { id: user._id, email: user.email }) ? user : null;
};

const hasCircularDependency = (tasks, targetTaskId, nextDependencies) => {
    const dependencyMap = new Map(tasks.map(task => [
        String(task._id),
        (task.dependency || []).map(dependency => String(dependency._id || dependency))
    ]));
    if (targetTaskId) dependencyMap.set(String(targetTaskId), nextDependencies.map(String));

    const visiting = new Set();
    const visited = new Set();
    const visit = (taskId) => {
        if (visiting.has(taskId)) return true;
        if (visited.has(taskId)) return false;
        visiting.add(taskId);
        for (const dependencyId of dependencyMap.get(taskId) || []) {
            if (visit(dependencyId)) return true;
        }
        visiting.delete(taskId);
        visited.add(taskId);
        return false;
    };

    return [...dependencyMap.keys()].some(visit);
};

const getAllTaskks = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        // Fetch tasks and resolve dependency references into usable objects
        const tasks = await Task.find({ groupId: groupId })
            .populate('dependency', '_id name priority estimated_duration deadline completed');

        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const createtask = async (req, res) => {
    const { groupId } = req.params;
    const taskData = req.body;

    try {
        const user_id = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found with id: ${groupId}` });
        }

        // Validate that every dependency ID actually exists within this group
        if (taskData.dependency && Array.isArray(taskData.dependency) && taskData.dependency.length > 0) {
            const depTasks = await Task.find({
                _id: { $in: taskData.dependency },
                groupId: groupId
            });
            if (depTasks.length !== taskData.dependency.length) {
                return res.status(400).json({ msg: "One or more dependency tasks not found in this group." });
            }
        }

        const { name, description, priority, deadline, estimated_duration, dependency, preferred_work_time, tags, assignedTo } = taskData;
        const assignee = await getAssignableUser(group, assignedTo, user_id);
        if (!assignee) {
            return res.status(400).json({ msg: "The assignee must be an active member of this group." });
        }

        const newTask = await Task.create({
            name,
            description,
            priority,
            deadline,
            estimated_duration,
            dependency: dependency || [],
            preferred_work_time,
            tags,
            groupId: groupId,
            userId: user_id,
            createdBy: user_id,
            assignedTo: assignee._id,
            userName: assignee.name || assignee.email
        });

        await AuditLog.create({
            action: "CREATE", performedBy: user_id, groupId,
            taskId: newTask._id, targetUserId: assignee._id,
            details: { assignedTo: String(assignee._id) }
        });

        res.status(201).json({ msg: "Task created successfully", task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const updatetask = async (req, res) => {
    const { taskId, groupId } = req.params;
    const updatedData = req.body;

    try {
        const currentTask = await Task.findOne({ _id: taskId, groupId });
        if (!currentTask) {
            return res.status(404).json({ msg: `Task not found with id: ${taskId}` });
        }

        // If updating dependencies, validate the complete graph rather than only
        // direct self-references. A cycle must never reach the scheduler.
        if (Array.isArray(updatedData.dependency)) {
            // Prevent self-dependency
            if (updatedData.dependency.includes(taskId)) {
                return res.status(400).json({ msg: "A task cannot depend on itself." });
            }

            const depTasks = await Task.find({
                _id: { $in: updatedData.dependency },
                groupId: currentTask.groupId
            });
            if (depTasks.length !== updatedData.dependency.length) {
                return res.status(400).json({ msg: "One or more dependency tasks not found in this group." });
            }

            const groupTasks = await Task.find({ groupId }).select("_id dependency");
            if (hasCircularDependency(groupTasks, taskId, updatedData.dependency)) {
                return res.status(400).json({ msg: "Dependencies cannot form a cycle." });
            }
        }

        if (updatedData.completed === true && !currentTask.completed) {
            const dependencyIds = Array.isArray(updatedData.dependency) ? updatedData.dependency : currentTask.dependency || [];
            const unresolvedCount = dependencyIds.length === 0 ? 0 : await Task.countDocuments({
                _id: { $in: dependencyIds },
                completed: { $ne: true }
            });
            if (unresolvedCount > 0) {
                return res.status(409).json({ msg: "Complete every dependency before completing this task." });
            }
        }

        let assignee = null;
        if (updatedData.assignedTo) {
            const group = await Group.findById(groupId);
            assignee = await getAssignableUser(group, updatedData.assignedTo, req.user.id);
            if (!assignee) {
                return res.status(400).json({ msg: "The assignee must be an active member of this group." });
            }
        }

        const allowedFields = ["name", "description", "priority", "deadline", "estimated_duration", "dependency", "preferred_work_time", "tags", "completed"];
        const safeUpdates = Object.fromEntries(allowedFields.filter(field => Object.hasOwn(updatedData, field)).map(field => [field, updatedData[field]]));
        if (assignee) {
            safeUpdates.assignedTo = assignee._id;
            safeUpdates.userName = assignee.name || assignee.email;
        }
        const updated = await Task.findByIdAndUpdate(taskId, safeUpdates, { new: true, runValidators: true });
        if (assignee && String(currentTask.assignedTo || currentTask.userId) !== String(assignee._id)) {
            await AuditLog.create({
                action: "ASSIGN", performedBy: req.user.id, groupId,
                taskId, targetUserId: assignee._id,
                details: { previousAssigneeId: String(currentTask.assignedTo || currentTask.userId) }
            });
        }
        if (updatedData.completed === true && !currentTask.completed) {
            await AuditLog.create({ action: "COMPLETE", performedBy: req.user.id, groupId, taskId });
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

        // Cascade: remove this task from the dependency array of every other task in the group
        await Task.updateMany(
            { groupId: groupId, dependency: taskId },
            { $pull: { dependency: taskId } }
        );

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

        // Cascade: remove deleted task from all dependency arrays globally
        await Task.updateMany(
            { dependency: taskId },
            { $pull: { dependency: taskId } }
        );

        res.status(200).json({ msg: "Task deleted by Admin" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const completeAssignedTask = async (req, res) => {
    const { groupId, taskId } = req.params;
    try {
        const task = await Task.findOne({ _id: taskId, groupId });
        if (!task) return res.status(404).json({ msg: "Task not found" });
        const assigneeId = task.assignedTo || task.userId;
        if (String(assigneeId) !== String(req.user.id)) {
            return res.status(403).json({ msg: "Only the assignee can complete this task." });
        }
        if (task.completed) return res.status(200).json({ task });
        const unresolved = await Task.countDocuments({ _id: { $in: task.dependency || [] }, completed: { $ne: true } });
        if (unresolved > 0) return res.status(409).json({ msg: "Complete every dependency first." });
        const updated = await Task.findByIdAndUpdate(taskId, { completed: true }, { new: true });
        await AuditLog.create({ action: "COMPLETE", performedBy: req.user.id, groupId, taskId });
        return res.status(200).json({ task: updated });
    } catch (err) {
        return res.status(500).json({ msg: "Could not complete task." });
    }
};

const getPersonalTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({
            $or: [{ assignedTo: userId }, { assignedTo: { $exists: false }, userId }]
        })
            .populate("groupId", "name workspaceType")
            .populate("dependency", "_id name completed priority deadline estimated_duration");
        res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ msg: "Could not load personal tasks." });
    }
};

const schedulePersonalTasks = async (req, res) => {
    const userId = req.user.id;
    try {
        const tasks = await Task.find({
            completed: { $ne: true },
            $or: [{ assignedTo: userId }, { assignedTo: { $exists: false }, userId }]
        }).populate("dependency", "_id completed");
        if (tasks.length === 0) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: userId,
                details: { scope: "PERSONAL", outcome: "NO_PENDING_TASKS", pendingTaskCount: 0 }
            });
            return res.status(200).json([]);
        }

        const taskIds = new Set(tasks.map(task => String(task._id)));
        if (hasCircularDependency(tasks, null, [])) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: userId,
                details: { scope: "PERSONAL", outcome: "CIRCULAR_DEPENDENCY" }
            });
            return res.status(409).json({ msg: "Personal tasks contain circular dependencies." });
        }
        const blocked = tasks.filter(task => (task.dependency || []).some(
            dependency => !dependency.completed && !taskIds.has(String(dependency._id))
        ));
        if (blocked.length > 0) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: userId,
                details: { scope: "PERSONAL", outcome: "BLOCKED", blockedTaskIds: blocked.map(task => task._id) }
            });
            return res.status(409).json({
                msg: "Some tasks depend on unfinished work assigned to another person.",
                blockedTaskIds: blocked.map(task => task._id)
            });
        }

        const startTime = Number(req.body?.startTime ?? 0);
        const endTime = Number(req.body?.endTime ?? 1440);
        const totalHours = Number(req.body?.totalHours ?? (endTime - startTime));
        if (![startTime, endTime, totalHours].every(Number.isInteger) ||
            startTime < 0 || endTime <= startTime || totalHours <= 0) {
            return res.status(400).json({ msg: "Scheduling time range must be positive whole minutes." });
        }

        const schedulerUrl = process.env.SCHEDULER_SERVICE_URL || "https://algorithm-scheduler.onrender.com";
        const now = Math.floor(Date.now() / 60000);
        const formattedTasks = tasks.map(task => ({
            taskId: String(task._id),
            name: task.name,
            description: task.description || "",
            priority: task.priority || "Medium",
            estimated_duration: task.estimated_duration || 30,
            completed: false,
            deadline: task.deadline
                ? Math.max(0, Math.floor(new Date(task.deadline).getTime() / 60000) - now)
                : 1440,
            taskDependency: (task.dependency || [])
                .filter(dependency => !dependency.completed)
                .map(dependency => ({ taskId: String(dependency._id), taskDependency: [] })),
            userId: 0,
            userName: task.userName || "User",
            groupId: String(task.groupId)
        }));

        const response = await axios.post(`${schedulerUrl}/api/v1/scheduler/generate`, {
            tasks: formattedTasks,
            constraints: { startTime, endTime, totalDays: 7, totalWeeks: 1, totalHours },
            policy: {
                optimizationGoal: "EARLIEST_DEADLINE",
                priorityMultiplier: 1,
                deadlineMultiplier: 1,
                dependencyMultiplier: 1
            },
            algorithmType: "branchAndBound"
        }, { timeout: 15000 });

        if (!Array.isArray(response.data) || response.data.length !== tasks.length) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: userId,
                details: { scope: "PERSONAL", outcome: "INFEASIBLE", pendingTaskCount: tasks.length }
            });
            return res.status(422).json({ msg: "No feasible personal schedule exists for every pending task." });
        }

        const entries = response.data.map(entry => ({
            taskId: entry.task?.taskId,
            name: entry.task?.name,
            priority: entry.task?.priority,
            dependencyIds: (entry.task?.taskDependency || []).map(dependency => dependency.taskId),
            startTime: entry.startTime,
            endTime: entry.endTime
        }));
        const scheduleRun = await ScheduleRun.create({
            scope: "PERSONAL", requestedBy: userId,
            taskIds: tasks.map(task => task._id),
            constraints: { startTime, endTime, totalHours },
            algorithmType: "branchAndBound", entries
        });
        await AuditLog.create({
            action: "SCHEDULE", performedBy: userId,
            details: { scope: "PERSONAL", outcome: "SCHEDULED", scheduleRunId: scheduleRun._id, taskCount: entries.length }
        });
        return res.status(200).json(response.data);
    } catch (err) {
        console.error("Personal scheduling error:", err.message);
        return res.status(502).json({ msg: "Scheduler service could not create a personal schedule." });
    }
};

export {
    getAllTaskks,
    createtask,
    updatetask,
    completeAssignedTask,
    deletetask,
    getAllTasksAdmin,
    deleteTaskAdmin,
    getPersonalTasks,
    schedulePersonalTasks
};
