import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: [
                'CREATE',
                'UPDATE',
                'DELETE',
                'ASSIGN',
                'UNASSIGN',
                'COMPLETE',
                'SCHEDULE',
                'GROUP_CREATE',
                'GROUP_UPDATE',
                'USER_ADD',
                'USER_REMOVE'
            ]
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'customer',
            required: true
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        },

        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'customer'
        },

        details: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
);

const AuditLog =
    mongoose.models.AuditLog ||
    mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
