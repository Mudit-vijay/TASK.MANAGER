import test from "node:test";
import assert from "node:assert/strict";
import ScheduleRun from "./models/ScheduleRun.js";
import { getLatestGroupSchedule, getLatestPersonalSchedule } from "./controlers_Task/scheduleViews.js";

const response = () => ({
    statusCode: 200,
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; }
});

test("saved schedule view uses snapshot labels and stable task IDs", async () => {
    const originalFindOne = ScheduleRun.findOne;
    const queries = [];
    try {
        ScheduleRun.findOne = query => {
            queries.push(query);
            return { sort: async () => ({
                _id: "run", scope: query.scope, createdAt: new Date(),
                constraints: { startTime: 540 },
                entries: [{ taskId: "task-a", name: "Saved title", priority: "High",
                    dependencyIds: ["task-b"], startTime: 0, endTime: 30 }]
            }) };
        };
        const group = response();
        await getLatestGroupSchedule({ params: { groupId: "group-a" } }, group);
        assert.equal(group.body.schedule.tasks[0].id, "task-a");
        assert.equal(group.body.schedule.tasks[0].text, "Saved title");
        assert.deepEqual(group.body.schedule.tasks[0].links, ["task-b"]);

        const personal = response();
        await getLatestPersonalSchedule({ user: { id: "user-a" } }, personal);
        assert.equal(queries[1].requestedBy, "user-a");
        assert.equal(personal.body.schedule.scope, "PERSONAL");
    } finally {
        ScheduleRun.findOne = originalFindOne;
    }
});
