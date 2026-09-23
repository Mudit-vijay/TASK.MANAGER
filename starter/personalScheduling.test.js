import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import Task from "./models/tasks.js";
import AuditLog from "./models/AuditLogs.js";
import ScheduleRun from "./models/ScheduleRun.js";
import { schedulePersonalTasks } from "./controlers_Task/tasks.js";

const makeResponse = () => ({
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
});

test("personal scheduling rejects unfinished cross-assignee dependencies", async () => {
    const originalFind = Task.find;
    const originalPost = axios.post;
    const originalCreate = AuditLog.create;
    let schedulerCalled = false;
    let audit;
    try {
        Task.find = () => ({ populate: async () => [{
            _id: "a", dependency: [{ _id: "external", completed: false }]
        }] });
        axios.post = async () => { schedulerCalled = true; };
        AuditLog.create = async value => { audit = value; };
        const response = makeResponse();
        await schedulePersonalTasks({ user: { id: "owner" }, body: {} }, response);
        assert.equal(response.statusCode, 409);
        assert.equal(schedulerCalled, false);
        assert.equal(audit.details.outcome, "BLOCKED");
    } finally {
        Task.find = originalFind;
        axios.post = originalPost;
        AuditLog.create = originalCreate;
    }
});

test("personal scheduling sends eligible dependencies and records the run", async () => {
    const originalFind = Task.find;
    const originalPost = axios.post;
    const originalAuditCreate = AuditLog.create;
    const originalRunCreate = ScheduleRun.create;
    const originalUrl = process.env.SCHEDULER_SERVICE_URL;
    const originalKey = process.env.SCHEDULER_API_KEY;
    const calls = [];
    const audits = [];
    let savedRun;
    try {
        process.env.SCHEDULER_SERVICE_URL = "http://localhost:9001";
        process.env.SCHEDULER_API_KEY = "test-only-scheduler-key-long-enough-123";
        const taskA = { _id: "a", name: "First", priority: "High", estimated_duration: 30,
            dependency: [], groupId: "g", userName: "User" };
        const taskB = { _id: "b", name: "Second", priority: "Medium", estimated_duration: 30,
            dependency: [{ _id: "a", completed: false }], groupId: "g", userName: "User" };
        Task.find = query => {
            assert.equal(query.$or[0].assignedTo, "owner");
            return { populate: async () => [taskA, taskB] };
        };
        axios.post = async (...args) => {
            calls.push(args);
            return { data: [
                { task: { taskId: "a" }, startTime: 0, endTime: 30 },
                { task: { taskId: "b" }, startTime: 30, endTime: 60 }
            ] };
        };
        ScheduleRun.create = async value => { savedRun = value; return { _id: "run" }; };
        AuditLog.create = async value => { audits.push(value); };

        const response = makeResponse();
        await schedulePersonalTasks({ user: { id: "owner" }, body: { startTime: 540, endTime: 1020, totalHours: 480 } }, response);
        assert.equal(response.statusCode, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0][2].headers["X-Scheduler-Key"], "test-only-scheduler-key-long-enough-123");
        assert.deepEqual(calls[0][1].tasks[1].taskDependency.map(dep => dep.taskId), ["a"]);
        assert.equal(savedRun.scope, "PERSONAL");
        assert.equal(audits[0].details.outcome, "SCHEDULED");
    } finally {
        Task.find = originalFind;
        axios.post = originalPost;
        AuditLog.create = originalAuditCreate;
        ScheduleRun.create = originalRunCreate;
        if (originalUrl === undefined) delete process.env.SCHEDULER_SERVICE_URL;
        else process.env.SCHEDULER_SERVICE_URL = originalUrl;
        if (originalKey === undefined) delete process.env.SCHEDULER_API_KEY;
        else process.env.SCHEDULER_API_KEY = originalKey;
    }
});
