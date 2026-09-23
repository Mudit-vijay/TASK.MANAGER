import express from "express";
import {
    getAllGroups,
    createGroups,
    updateGroup,
    deleteGroup,
    getAllGroupsAdmin,
    deleteGroupAdmin,
    scheduleGroupTasks,
    getGroupMembers,
    getAuditLogs
} from "../controlers_Task/groups.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import { requireGroupOwner, requireGroupManager } from "../middlewares/groupAccess.js";
import { requireGroupMember } from "../middlewares/groupAccess.js";
import { getLatestGroupSchedule } from "../controlers_Task/scheduleViews.js";

const router = express.Router();

router.use(authMiddleware);

// ✅ Admin Routes
router.route('/admin/all')
    .get(checkAdmin, getAllGroupsAdmin);

router.route('/admin/:groupId')
    .delete(checkAdmin, deleteGroupAdmin);

router.route("/groups")
    .get(getAllGroups)
    .post(createGroups);

router.route("/audit")
    .get(getAuditLogs);

router.route("/groups/:groupId/members")
    .get(requireGroupManager, getGroupMembers);

router.route("/groups/:groupId")
    .patch(requireGroupOwner, updateGroup)
    .delete(requireGroupOwner, deleteGroup);

router.route("/groups/:groupId/schedule")
    .post(requireGroupManager, scheduleGroupTasks);

router.route("/groups/:groupId/schedule/latest")
    .get(requireGroupMember, getLatestGroupSchedule);

export default router;
