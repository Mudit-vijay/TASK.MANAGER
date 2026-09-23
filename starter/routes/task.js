import express from "express";
import {
    getAllTaskks,
    createtask,
    updatetask,
    completeAssignedTask,
    deletetask,
    getAllTasksAdmin,
    deleteTaskAdmin,
    getPersonalTasks,
    schedulePersonalTasks
} from "../controlers_Task/tasks.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import { requireGroupMember, requireGroupManager } from "../middlewares/groupAccess.js";
import { getLatestPersonalSchedule } from "../controlers_Task/scheduleViews.js";

const router = express.Router();

// ✅ Admin Routes
router.route('/admin/all')
    .all(authMiddleware)
    .get(checkAdmin, getAllTasksAdmin);

router.route('/admin/:taskId')
    .all(authMiddleware)
    .delete(checkAdmin, deleteTaskAdmin);

router.route('/personal/tasks')
    .all(authMiddleware)
    .get(getPersonalTasks);

router.route('/personal/schedule')
    .all(authMiddleware)
    .post(schedulePersonalTasks);

router.route('/personal/schedule/latest')
    .all(authMiddleware)
    .get(getLatestPersonalSchedule);

// ✅ Requires groupId param
router.route('/:groupId/tasks')
    .all(authMiddleware)
    .get(requireGroupMember, getAllTaskks)
    .post(requireGroupManager, createtask);

router.route('/:groupId/tasks/:taskId/complete')
    .all(authMiddleware)
    .patch(requireGroupMember, completeAssignedTask);

router.route('/:groupId/tasks/:taskId')
    .all(authMiddleware)
    .patch(requireGroupManager, updatetask)
    .delete(requireGroupManager, deletetask);

export default router;
