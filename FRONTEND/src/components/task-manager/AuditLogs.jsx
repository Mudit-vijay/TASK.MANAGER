import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { groupService } from "../../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    groupService.getAuditLogs()
      .then(setLogs)
      .catch(err => setError(err.response?.data?.msg || "Could not load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/taskManager" className="text-indigo-400 text-sm">← Dashboard</Link>
      <h1 className="text-3xl font-bold">Audit log</h1>
      {loading && <p>Loading audit log…</p>}
      {error && <p role="alert" className="text-red-400">{error}</p>}
      {!loading && !error && logs.length === 0 && <p className="text-slate-400">No activity recorded yet.</p>}
      <div className="space-y-3">
        {logs.map(log => <article key={log._id} className="rounded-xl border border-slate-700 bg-slate-900 p-4 flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="font-semibold">{log.details?.scope === "PERSONAL" ? "Personal" : "Group"} {log.action.toLowerCase()}</h2>
            <p className="text-sm text-slate-400">{log.details?.outcome || "Recorded"} · {log.details?.taskCount ?? log.details?.pendingTaskCount ?? 0} tasks</p>
          </div>
          <time className="text-sm text-slate-400" dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString()}</time>
        </article>)}
      </div>
    </div>
  </main>;
}
