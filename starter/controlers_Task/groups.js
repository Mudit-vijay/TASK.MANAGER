import mongoose from "mongoose";
import Group from "../models/Group.js";

export const getAllGroups = async (req, res) => {
    console.log("request received");
    const token=req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        console.log(decoded)
        const groups = await Group.find({ user: userID }).populate("tasks");
        res.status(200).json(groups);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

export const createGroup = async (req, res) => {
    try {
        const group = await Group.create({ ...req.body, user: req.user.id });
        res.status(201).json({ msg: "Group created successfully", group });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export const updateGroup = async (req, res) => {
    const groupId = req.params.groupId;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ msg: "Invalid group ID format" });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        res.status(200).json({ group });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        await Group.findByIdAndDelete(req.params.groupId);
        res.status(200).json({ msg: "Group deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};

