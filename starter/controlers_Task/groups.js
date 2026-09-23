import mongoose from "mongoose";
import Group from "../models/Group.js";
import Task from "../models/tasks.js";
import axios from "axios";
import AuditLog from "../models/AuditLogs.js";
import ScheduleRun from "../models/ScheduleRun.js";
import { groupRole, normalizeEmail } from "../middlewares/membership.js";


export const getAllGroups = async (req, res) => {
    try {
        const userID = req.user.id;
        const userEmail = normalizeEmail(req.user.email);
        const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, character => `\\${character}`);
        const groups = await Group.find({
            $or: [
                { user: userID },
                { "memberUsers.user": userID },
                { members: new RegExp(`^${escapedEmail}$`, "i") }
            ]
        });
        res.status(200).json(groups.map(group => ({
            ...group.toObject(),
            myRole: groupRole(group, req.user)
        })));
    } catch (err) {
        console.error("Error in getAllGroups:", err.message);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

export const createGroups = async (req, res) => {
    const { name, description, workspaceType, members } = req.body;

    try {
        const userId = req.user.id;
        const requested = Array.isArray(members) ? members : [];
        const normalized = requested.map(member => ({
            email: normalizeEmail(typeof member === "string" ? member : member?.email),
            role: typeof member === "string" ? "MEMBER" : member?.role || "MEMBER"
        })).filter(member => member.email);
        if (normalized.some(member => !/^\S+@\S+\.\S+$/.test(member.email) || !["ADMIN", "MEMBER"].includes(member.role))) {
            return res.status(400).json({ msg: "Each group member needs a valid email and role." });
        }
        if (new Set(normalized.map(member => member.email)).size !== normalized.length) {
            return res.status(400).json({ msg: "A person can only be added once to a group." });
        }
        const ownerEmail = normalizeEmail(req.user.email);
        if (normalized.some(member => member.email === ownerEmail)) {
            return res.status(400).json({ msg: "The group owner is already a member." });
        }
        const users = normalized.length === 0 ? [] : await mongoose.connection.collection("customers")
            .find({ email: { $in: normalized.map(member => member.email) } }, { projection: { _id: 1, email: 1 } })
            .collation({ locale: "en", strength: 2 }).toArray();
        const byEmail = new Map(users.map(user => [normalizeEmail(user.email), user]));
        if (normalized.some(member => !byEmail.has(member.email))) {
            return res.status(400).json({ msg: "Every group member must have an account before being added." });
        }
        const newGroup = await Group.create({ 
            name, 
            description, 
            user: userId,
            workspaceType: workspaceType || "Personal",
            members: normalized.map(member => member.email),
            memberUsers: normalized.map(member => ({ user: byEmail.get(member.email)._id, role: member.role }))
        });
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateGroup = async (req, res) => {
    const groupId = req.params.groupId;
    const name = req.body.body || req.body.name; // Handling both structures
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ msg: "Invalid group ID format" });
    }

    try {
        const user_id = req.user.id;
        
        const existingGroup = await Group.findOne({
            user: user_id,
            name: name,
            _id: { $ne: groupId } // Exclude current group
        });
        
        if (existingGroup) {
            return res.status(400).json({ message: "Group already exists with that name" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { name },
            { new: true }  // so it returns the updated document
        );
        res.status(200).json({ group: updatedGroup });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        await Group.findByIdAndDelete(req.params.groupId);
        // Note: You should ideally also delete all tasks associated with this group here,
        // or rely on a Mongoose pre-remove hook / event listener.
        res.status(200).json({ msg: "Group deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export const getAllGroupsAdmin = async (req, res) => {
    try {
        const groups = await Group.find({}).populate('user', 'name email');
        res.status(200).json(groups);
    } catch (err) {
        console.error("Error in getAllGroupsAdmin:", err.message);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

export const deleteGroupAdmin = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        await Group.findByIdAndDelete(req.params.groupId);
        res.status(200).json({ msg: "Group deleted successfully by Admin" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

/** Computes a relative deadline in minutes from now. */
const computeRelativeDeadline = (deadlineDate, nowInMinutes) => {
    const taskDeadline = deadlineDate
        ? Math.floor(new Date(deadlineDate).getTime() / 60000)
        : (nowInMinutes + 1440); // Default: 24 hours from now
    return Math.max(0, taskDeadline - nowInMinutes);
};

const hasDependencyCycle = (tasks) => {
    const byId = new Map(tasks.map(task => [String(task._id), task]));
    const visiting = new Set();
    const visited = new Set();
    const visit = (taskId) => {
        if (visiting.has(taskId)) return true;
        if (visited.has(taskId)) return false;
        visiting.add(taskId);
        const task = byId.get(taskId);
        for (const dependency of task?.dependency || []) {
            const dependencyId = String(dependency._id || dependency);
            if (!byId.has(dependencyId) || visit(dependencyId)) return true;
        }
        visiting.delete(taskId);
        visited.add(taskId);
        return false;
    };
    return [...byId.keys()].some(visit);
};

export const getGroupMembers = async (req, res) => {
    try {
        const group = req.group || await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        const memberEmails = [...new Set((group.members || []).map(normalizeEmail).filter(Boolean))];
        const memberIds = (group.memberUsers || []).map(member => member.user);
        const users = await mongoose.connection.collection("customers").find({
            $or: [
                { _id: { $in: [group.user, ...memberIds] } },
                { email: { $in: memberEmails } }
            ]
        }, { projection: { _id: 1, name: 1, email: 1 } }).collation({ locale: "en", strength: 2 }).toArray();

        const members = users.map(user => ({
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: groupRole(group, { id: user._id, email: user.email })
        }));
        res.status(200).json({ members });
    } catch (err) {
        res.status(500).json({ msg: "Could not load group members." });
    }
};

export const getAuditLogs = async (req, res) => {
    try {
        const ownedGroups = await Group.find({
            $or: [{ user: req.user.id }, { memberUsers: { $elemMatch: { user: req.user.id, role: "ADMIN" } } }]
        }).distinct("_id");
        const logs = await AuditLog.find({
            $or: [
                { performedBy: req.user.id },
                { groupId: { $in: ownedGroups } }
            ]
        }).sort({ createdAt: -1 }).limit(200).lean();
        res.status(200).json({ logs });
    } catch (err) {
        res.status(500).json({ msg: "Could not load audit logs." });
    }
};

const toPositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export const scheduleGroupTasks = async (req, res) => {
    const { groupId } = req.params;
    
    try {
        const tasks = await Task.find({ groupId })
            .populate('dependency', '_id name priority estimated_duration deadline completed');
        
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for this group" });
        }

        if (hasDependencyCycle(tasks)) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: req.user.id, groupId,
                details: { scope: "GROUP", outcome: "CIRCULAR_DEPENDENCY" }
            });
            return res.status(409).json({ message: "Cannot schedule a group with circular dependencies." });
        }

        const pendingTasks = tasks.filter(task => !task.completed);
        if (pendingTasks.length === 0) {
            await AuditLog.create({
                action: "SCHEDULE", performedBy: req.user.id, groupId,
                details: { scope: "GROUP", outcome: "NO_PENDING_TASKS", pendingTaskCount: 0 }
            });
            return res.status(200).json([]);
        }

        const nowInMinutes = Math.floor(Date.now() / 60000);

        const formattedTasks = pendingTasks.map(t => {
            const relativeDeadline = computeRelativeDeadline(t.deadline, nowInMinutes);
            
            return {
                taskId: t._id.toString(),
                name: t.name,
                description: t.description || "",
                priority: t.priority || "Medium",
                estimated_duration: t.estimated_duration || 30,
                completed: false,
                deadline: relativeDeadline,
                taskDependency: (t.dependency || [])
                    .filter(dep => !dep.completed)
                    .map(dep => ({ taskId: String(dep._id), taskDependency: [] })),
                userId: 0,
                userName: t.userName || "User",
                groupId: groupId.toString()
            };
        });

        const startTime = toPositiveInteger(req.body.startTime, 0);
        const endTime = toPositiveInteger(req.body.endTime, 1440);
        const totalHours = toPositiveInteger(req.body.totalHours, endTime - startTime);
        if (endTime <= startTime || totalHours <= 0) {
            return res.status(400).json({ message: "Scheduling time range must be positive." });
        }

        const schedulerKey = process.env.SCHEDULER_API_KEY;
        if (!schedulerKey || schedulerKey.length < 32) {
            return res.status(503).json({ message: "Scheduler service is not configured." });
        }
        const schedulerUrl = process.env.SCHEDULER_SERVICE_URL || "https://algorithm-scheduler.onrender.com";
        const response = await axios.post(`${schedulerUrl}/api/v1/scheduler/generate`, {
            tasks: formattedTasks,
            constraints: {
                startTime, 
                endTime, 
                totalDays: 7,
                totalWeeks: 1,
                totalHours 
            },
            policy: { 
                optimizationGoal: "EARLIEST_DEADLINE",
                priorityMultiplier: 1.0,
                deadlineMultiplier: 1.0,
                dependencyMultiplier: 1.0
            },
            algorithmType: "branchAndBound"
        }, { timeout: 15000, headers: { "X-Scheduler-Key": schedulerKey } });

        if (!Array.isArray(response.data) || response.data.length !== pendingTasks.length) {
            await AuditLog.create({
                action: "SCHEDULE",
                performedBy: req.user.id,
                groupId,
                details: { scope: "GROUP", outcome: "INFEASIBLE", pendingTaskCount: pendingTasks.length }
            });
            return res.status(422).json({ message: "No feasible schedule exists for every pending task." });
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
            scope: "GROUP",
            groupId,
            requestedBy: req.user.id,
            taskIds: pendingTasks.map(task => task._id),
            constraints: { startTime, endTime, totalHours },
            algorithmType: "branchAndBound",
            entries
        });
        await AuditLog.create({
            action: "SCHEDULE",
            performedBy: req.user.id,
            groupId,
            details: { scope: "GROUP", outcome: "SCHEDULED", scheduleRunId: scheduleRun._id, taskCount: entries.length }
        });

        res.status(200).json(response.data);
    } catch (err) {
        console.error("Scheduling error:", err.message);
        
        const status = err.response?.status === 400 ? 422 : 502;
        res.status(status).json({ message: "Scheduler service could not create a schedule." });
    }
};
