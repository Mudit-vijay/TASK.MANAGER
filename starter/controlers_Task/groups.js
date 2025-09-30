import mongoose from "mongoose";
import Group from "../models/Group.js";
import jwt from "jsonwebtoken";

export const getAllGroups = async (req, res) => {
    console.log("request received");
    const token = req.headers["authorization"]; // lowercase!
    console.log(token)

    try {
        const decoded = jwt.verify(token, process.env.JWT);
        console.log(decoded)
        const userID = decoded.id
        console.log(userID)
        const groups = await Group.find({ user: userID }).populate("tasks");
        res.status(200).json(groups);
    } catch (err) {
        console.log(err);
        console.log("comes in get group error")
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

export const createGroup = async (req, res) => {
    console.log("comes in create group")
    const token = req.headers['authorization'];
    console.log("loggin token")
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT);
    const user_id = decoded.id;
    const existingGroup = await Group.findOne({
        user: user_id,
        name: req.body.name
    });
    if (existingGroup) {
        return res.status(400).json({ message: "Group already exists with that name" });
    }
    try {
        const group = await Group.create({ ...req.body, user: user_id });
        console.log(group)
        res.status(201).json({ msg: "Group created successfully", group });
    } catch (err) {
        handleUpdateGroup
        return res.status(400).json({ message: "Group already exists with that name" });
    }
};

export const updateGroup = async (req, res) => {
    console.log("comes in update group")
    const groupId = req.params.groupId;
    console.log("logging out req body")
    console.log(req.body)
    const name = req.body.body
    // console.log(req.body)
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        console.log("in first if")
        return res.status(400).json({ msg: "Invalid group ID format" });
    }
    console.log("comes in update group 2")
    const token = req.headers['authorization'];
    console.log("loggin token")
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT);
    const user_id = decoded.id;
    const existingGroup = await Group.findOne({
        user: user_id,
        name: req.body.name
    });
    if (existingGroup) {
        return res.status(400).json({ message: "Group already exists with that name" });
    }
    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { name },
            { new: true }  // so it returns the updated document
        );
        console.log("pura ho gya")
        console.log(updatedGroup)
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

