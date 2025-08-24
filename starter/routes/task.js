import express from "express";
import {
    getAllTaskks,
    createtask,
    updatetask,
    deletetask
} from "../controlers_Task/tasks.js";

const router = express.Router();

// ✅ Requires groupId param
router.route('/:groupId/tasks')
    .get(getAllTaskks)
    .post(createtask);

router.route('/:groupId/tasks/:taskId')
    .patch(updatetask)
    .delete(deletetask);

export default router;
