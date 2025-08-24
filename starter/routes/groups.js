import express from "express";
import {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup,
} from "../controlers_Task/groups.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

router.route("/groups")
    .get(authMiddleware, getAllGroups)
    .post(authMiddleware, createGroup);

router.route("/groups/:groupId")
    .patch(authMiddleware, updateGroup)
    .delete(authMiddleware, deleteGroup);

export default router;
