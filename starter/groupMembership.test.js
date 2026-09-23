import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Group from "./models/Group.js";
import Task from "./models/tasks.js";
import AuditLog from "./models/AuditLogs.js";
import { groupRole } from "./middlewares/membership.js";
import { createGroups, getAllGroups } from "./controlers_Task/groups.js";
import { createtask, deletetask } from "./controlers_Task/tasks.js";

const response = () => ({
    statusCode: 200,
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; }
});

test("membership is independent for each group, including legacy email groups", () => {
    const groupA = { user: "owner", memberUsers: [{ user: "alice", role: "ADMIN" }, { user: "bob", role: "MEMBER" }] };
    const groupB = { user: "other", members: ["Alice@Example.com", "carol@example.com"] };
    assert.equal(groupRole(groupA, { id: "alice", email: "alice@example.com" }), "ADMIN");
    assert.equal(groupRole(groupA, { id: "bob", email: "bob@example.com" }), "MEMBER");
    assert.equal(groupRole(groupB, { id: "alice", email: "alice@example.com" }), "MEMBER");
    assert.equal(groupRole(groupB, { id: "bob", email: "bob@example.com" }), null);
});

test("group listing returns multiple memberships without mixing their roles", async () => {
    const originalFind = Group.find;
    try {
        Group.find = query => {
            assert.equal(query.$or[1]["memberUsers.user"], "alice");
            assert.equal(query.$or[2].members.test("ALICE@EXAMPLE.COM"), true);
            assert.equal(query.$or[2].members.test("alice@exampleXcom"), false);
            return Promise.resolve([
                { user: "alice", memberUsers: [], members: [], toObject() { return { _id: "a" }; } },
                { user: "bob", memberUsers: [{ user: "alice", role: "ADMIN" }], members: [], toObject() { return { _id: "b" }; } }
            ]);
        };
        const res = response();
        await getAllGroups({ user: { id: "alice", email: "alice@example.com" } }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body.map(group => group.myRole), ["OWNER", "ADMIN"]);
    } finally {
        Group.find = originalFind;
    }
});

test("group creation resolves two member accounts and retains their separate roles", async () => {
    const originalCollection = mongoose.connection.collection;
    const originalCreate = Group.create;
    const users = [
        { _id: "alice", email: "alice@example.com" },
        { _id: "bob", email: "bob@example.com" }
    ];
    let saved;
    try {
        mongoose.connection.collection = () => ({
            find() { return { collation() { return { toArray: async () => users }; } }; }
        });
        Group.create = async value => { saved = value; return value; };
        const res = response();
        await createGroups({
            user: { id: "owner", email: "owner@example.com" },
            body: { name: "Team", workspaceType: "Team", members: [
                { email: "ALICE@example.com", role: "ADMIN" },
                { email: "bob@example.com", role: "MEMBER" }
            ] }
        }, res);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(saved.members, ["alice@example.com", "bob@example.com"]);
        assert.deepEqual(saved.memberUsers, [
            { user: "alice", role: "ADMIN" }, { user: "bob", role: "MEMBER" }
        ]);
    } finally {
        mongoose.connection.collection = originalCollection;
        Group.create = originalCreate;
    }
});

test("admin can assign to a member of this group but not a member of another group", async () => {
    const originalCollection = mongoose.connection.collection;
    const originalFindById = Group.findById;
    const originalCreate = Task.create;
    const originalAuditCreate = AuditLog.create;
    const ownerId = "000000000000000000000001";
    const groupId = "000000000000000000000002";
    const memberId = "000000000000000000000003";
    const otherGroupMemberId = "000000000000000000000004";
    let savedTask;
    try {
        Group.findById = async () => ({ user: ownerId, members: ["member@example.com"],
            memberUsers: [{ user: memberId, role: "MEMBER" }] });
        mongoose.connection.collection = () => ({
            findOne: async query => String(query._id) === memberId
                ? { _id: memberId, name: "Member", email: "member@example.com" }
                : { _id: otherGroupMemberId, name: "Other", email: "other@example.com" }
        });
        Task.create = async value => { savedTask = value; return { ...value, _id: "new-task" }; };
        AuditLog.create = async () => ({});

        const valid = response();
        await createtask({ params: { groupId }, user: { id: ownerId },
            body: { name: "Assigned work", dependency: [], assignedTo: memberId } }, valid);
        assert.equal(valid.statusCode, 201);
        assert.equal(savedTask.assignedTo, memberId);

        const invalid = response();
        await createtask({ params: { groupId }, user: { id: ownerId },
            body: { name: "Wrong group", dependency: [], assignedTo: otherGroupMemberId } }, invalid);
        assert.equal(invalid.statusCode, 400);
    } finally {
        mongoose.connection.collection = originalCollection;
        Group.findById = originalFindById;
        Task.create = originalCreate;
        AuditLog.create = originalAuditCreate;
    }
});

test("group task deletion cannot delete a task from another group", async () => {
    const originalGroupFind = Group.findById;
    const originalDelete = Task.findOneAndDelete;
    const originalUpdate = Task.updateMany;
    let deleteQuery;
    let cascadeCalled = false;
    try {
        Group.findById = async () => ({ _id: "authorized-group" });
        Task.findOneAndDelete = async query => {
            deleteQuery = query;
            return null;
        };
        Task.updateMany = async () => { cascadeCalled = true; };
        const res = response();
        await deletetask({ params: { groupId: "authorized-group", taskId: "other-group-task" } }, res);
        assert.deepEqual(deleteQuery, { _id: "other-group-task", groupId: "authorized-group" });
        assert.equal(res.statusCode, 404);
        assert.equal(cascadeCalled, false);
    } finally {
        Group.findById = originalGroupFind;
        Task.findOneAndDelete = originalDelete;
        Task.updateMany = originalUpdate;
    }
});
