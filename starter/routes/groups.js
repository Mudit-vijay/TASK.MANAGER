const express = require("express");
const router = express.Router();

const {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup
} = require('../controlers_Task/groups');
const Authmiddleware = require("../middlewares/authmiddleware.js");
router.route('/groups')
    .get(Authmiddleware,getAllGroups)
    .post(Authmiddleware,createGroup);

router.route('/groups/:groupId')
    .patch(Authmiddleware,updateGroup)
    .delete(Authmiddleware,deleteGroup);

module.exports = router;
