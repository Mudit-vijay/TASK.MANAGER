import mongoose from "mongoose";

const ScheduleEntrySchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    name: String,
    priority: String,
    dependencyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true }
}, { _id: false });

const ScheduleRunSchema = new mongoose.Schema({
    scope: { type: String, enum: ["GROUP", "PERSONAL"], required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "customer", required: true, index: true },
    taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true }],
    constraints: {
        startTime: Number,
        endTime: Number,
        totalHours: Number
    },
    algorithmType: { type: String, enum: ["backtracking", "branchAndBound"], required: true },
    entries: [ScheduleEntrySchema]
}, { timestamps: true });

const ScheduleRun = mongoose.models.ScheduleRun || mongoose.model("ScheduleRun", ScheduleRunSchema);

export default ScheduleRun;
