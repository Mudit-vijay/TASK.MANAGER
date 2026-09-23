import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { taskSERVICES } from "../../services/api";
import GanttChart from "./GanttChart";

const toMinutes = value => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function PersonalTasks() {
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState("");

  const refreshTasks = () => taskSERVICES.getPersonalTasks().then(setTasks);

  useEffect(() => {
    taskSERVICES.getPersonalTasks()
      .then(setTasks)
      .catch(err => setError(err.response?.data?.msg || "Could not load your tasks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    taskSERVICES.getLatestPersonalSchedule()
      .then(setSchedule)
      .catch(() => setSchedule(null));
  }, []);

  const generate = async () => {
    const startTime = toMinutes(workStart);
    const endTime = toMinutes(workEnd);
    if (endTime <= startTime) {
      setError("End time must be later than start time.");
      return;
    }
    setScheduling(true);
    setError("");
    try {
      await taskSERVICES.schedulePersonalTasks({
        startTime,
        endTime,
        totalHours: endTime - startTime
      });
      setSchedule(await taskSERVICES.getLatestPersonalSchedule());
    } catch (err) {
      setError(err.response?.data?.msg || "Could not schedule your tasks.");
    } finally {
      setScheduling(false);
    }
  };

  const complete = async task => {
    setError("");
    try {
      await taskSERVICES.completeAssignedTask(task.groupId?._id || task.groupId, task._id);
      await refreshTasks();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not complete task.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/taskManager" className="text-indigo-400 text-sm">← Dashboard</Link>
            <h1 className="text-3xl font-bold mt-2">My assigned tasks</h1>
          </div>
          <Link to="/audit" className="text-indigo-400 text-sm">Audit log</Link>
        </header>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
          <h2 className="font-semibold">Personal schedule</h2>
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-sm">Start <input type="time" value={workStart} onChange={event => setWorkStart(event.target.value)} className="block mt-1 bg-slate-800 border border-slate-600 rounded p-2" /></label>
            <label className="text-sm">End <input type="time" value={workEnd} onChange={event => setWorkEnd(event.target.value)} className="block mt-1 bg-slate-800 border border-slate-600 rounded p-2" /></label>
            <button onClick={generate} disabled={scheduling || loading || tasks.length === 0} className="bg-indigo-600 disabled:opacity-50 rounded px-5 py-2 font-semibold">
              {scheduling ? "Scheduling…" : "Schedule my tasks"}
            </button>
          </div>
          {error && <p role="alert" className="text-red-400">{error}</p>}
          {schedule && <div className="space-y-2">
            <h3 className="font-medium">Saved schedule · {new Date(schedule.createdAt).toLocaleString()}</h3>
            <GanttChart scheduledTasks={schedule.tasks} startTime={schedule.constraints?.startTime || 0} />
          </div>}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Assigned to me</h2>
          {loading && <p>Loading tasks…</p>}
          {!loading && tasks.length === 0 && <p className="text-slate-400">No tasks are assigned to you.</p>}
          {tasks.map(task => (
            <article key={task._id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex justify-between gap-4"><h3 className="font-semibold">{task.name}</h3><span>{task.priority}</span></div>
              <p className="text-sm text-slate-400">{task.groupId?.name || "Group"} · {task.completed ? "Completed" : "Pending"}</p>
              {(task.dependency || []).length > 0 && <p className="text-sm text-amber-300 mt-2">Depends on: {task.dependency.map(dep => dep.name).join(", ")}</p>}
              {!task.completed && <button onClick={() => complete(task)} className="mt-3 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold">Mark complete</button>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
