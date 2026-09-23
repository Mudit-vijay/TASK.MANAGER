import ScheduleRun from "../models/ScheduleRun.js";

const colors = { Crucial: "#ff4d4d", High: "#ffa64d", Medium: "#ffff4d", Low: "#4dff4d" };

const formatRun = run => ({
    id: String(run._id),
    scope: run.scope,
    createdAt: run.createdAt,
    constraints: run.constraints,
    tasks: (run.entries || []).map(entry => ({
        id: String(entry.taskId),
        text: entry.name || "Task",
        priority: entry.priority || "Medium",
        color: colors[entry.priority] || colors.Medium,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.endTime - entry.startTime,
        links: (entry.dependencyIds || []).map(String)
    }))
});

export const getLatestGroupSchedule = async (req, res) => {
    try {
        const run = await ScheduleRun.findOne({ scope: "GROUP", groupId: req.params.groupId })
            .sort({ createdAt: -1 });
        return res.status(200).json({ schedule: run ? formatRun(run) : null });
    } catch (err) {
        return res.status(500).json({ msg: "Could not load group schedule." });
    }
};

export const getLatestPersonalSchedule = async (req, res) => {
    try {
        const run = await ScheduleRun.findOne({ scope: "PERSONAL", requestedBy: req.user.id })
            .sort({ createdAt: -1 });
        return res.status(200).json({ schedule: run ? formatRun(run) : null });
    } catch (err) {
        return res.status(500).json({ msg: "Could not load personal schedule." });
    }
};
