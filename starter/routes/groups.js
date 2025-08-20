const express = require("express");
const router = express.Router();

const {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup
} = require('../controlers_Task/groups');

router.route('/groups')
    .get(getAllGroups)
    .post(createGroup);

router.route('/groups/:groupId')
    .patch(updateGroup)
    .delete(deleteGroup);

module.exports = router;
