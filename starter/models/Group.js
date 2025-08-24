import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true
    }
});

const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);

export default Group;
