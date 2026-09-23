import Group from "../models/Group.js";
import { groupRole, isGroupManager } from "./membership.js";

const loadGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        req.group = group;
        next();
    } catch (error) {
        return res.status(400).json({ msg: "Invalid group ID" });
    }
};

export const requireGroupMember = [
    loadGroup,
    (req, res, next) => {
        if (!groupRole(req.group, req.user)) {
            return res.status(403).json({ msg: "You do not have access to this group." });
        }
        next();
    }
];

export const requireGroupManager = [
    loadGroup,
    (req, res, next) => {
        if (!isGroupManager(req.group, req.user)) {
            return res.status(403).json({ msg: "Only a group owner or admin can perform this action." });
        }
        next();
    }
];

export const requireGroupOwner = [
    loadGroup,
    (req, res, next) => {
        if (String(req.group.user) !== String(req.user.id)) {
            return res.status(403).json({ msg: "Only the group owner can perform this action." });
        }
        next();
    }
];
