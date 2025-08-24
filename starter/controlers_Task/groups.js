const express = require('express');
const Group = require('.././models/Group');


const getAllGroups = async (req, res) => {
    try {
        const userID=req.user.id
        console.log(userID);
        const groups = await Group.findById(userID).populate('tasks');
        console.log(groups);
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

const createGroup = async (req, res) => {
    const groupData = req.body;
    try {
        const group = await Group.create(groupData);
        res.status(201).json({ msg: 'Group created successfully', group });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const updateGroup = async (req, res) => {
    const groupId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ msg: 'Invalid group ID format' });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        res.status(200).json({ group });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

const deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: `Group not found` });
        }
        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ msg: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

module.exports = {
    getAllGroups,
    createGroup,
    updateGroup,
    deleteGroup,
};
