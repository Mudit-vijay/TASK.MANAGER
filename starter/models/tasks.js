import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "must provide name"],
        trim: true,
        maxlength: [100, "name can't be more than 100 characters"],
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Crucial'],
        default: 'Medium'
    },
    deadline: {
        type: Date
    },
    estimated_duration: {
        type: Number, // duration in minutes
        default: 0
    },
    dependency: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ],
    preferred_work_time: {
        type: String, // e.g., 'Morning', 'Afternoon', or specific timeframe
        trim: true
    },
    tags: [
        {
            type: String,
            trim: true
        }
    ],
    // userId is retained while existing task documents are migrated. New code uses
    // createdBy and assignedTo so creator and assignee are never conflated.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: [true, "must provide userId"],
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: [true, "must provide createdBy"],
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: [true, "must provide assignedTo"],
        index: true
    },
    userName: {
        type: String,
        required: [true, "must provide userName"]
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: [true, "must provide groupId"],
        index: true
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;