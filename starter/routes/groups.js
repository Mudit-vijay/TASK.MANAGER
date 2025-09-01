import express from "express";
import {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup
} from "../controlers_Task/groups.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

router.route("/groups")
    .get(getAllGroups)
    .post(createGroup);

router.route("/groups/:groupId")
    .patch(updateGroup)
    .delete(deleteGroup);

export default router;
