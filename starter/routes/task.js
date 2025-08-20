const express = require("express");
const router = express.Router();

const {
    getAllTaskks,
    createtask,
    updatetask,
    deletetask
} = require('../controlers_Task/tasks');

// ✅ Requires groupId param
router.route('/:groupId/tasks')
    .get(getAllTaskks)
    .post(createtask);

router.route('/:groupId/tasks/:taskId')
    .patch(updatetask)
    .delete(deletetask);

module.exports = router;
