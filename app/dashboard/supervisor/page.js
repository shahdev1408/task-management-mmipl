"use client"
import { useEffect, useState } from "react"
import {
  CheckCircle2, Clock, AlertTriangle,
  BarChart3, Users, RefreshCw
} from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import Badge from "@/components/ui/Badge"

export default function SupervisorDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState("project")
  const [drillFilter, setDrillFilter] = useState("ALL")

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/dashboard/supervisor")
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  async function runDelayedCheck() {
    const res  = await fetch("/api/cron/mark-delayed", {
      headers: { authorization: "Bearer cron-secret-2024-xyz" }
    })
    const json = await res.json()
    alert(`${json.message} — ${json.updated ?? 0} tasks updated`)
    load()
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  )

  const userStats = [
    ...data.managerStats,
    ...data.executorStats,
  ].filter(u => drillFilter === "ALL" || u.role === drillFilter)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">All projects · All teams</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runDelayedCheck}
            className="flex items-center gap-1.5 text-sm text-red-500 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Mark Overdue
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Completed" value={data.completed} icon={CheckCircle2}  color="green" subtext="All projects" />
        <StatCard label="On-going"  value={data.ongoing}   icon={Clock}         color="blue"  subtext="All projects" />
        <StatCard label="Delayed"   value={data.delayed}   icon={AlertTriangle} color="red"   subtext="Needs attention" />
      </div>

      {/* View toggle — Project wise / User wise */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("project")}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${view === "project" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <BarChart3 className="w-4 h-4" /> Project-wise
        </button>
        <button
          onClick={() => setView("user")}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${view === "user" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <Users className="w-4 h-4" /> User-wise
        </button>
      </div>

      {/* Project-wise table */}
      {view === "project" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Project-wise breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ongoing</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Delayed</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.projectStats.map(p => {
                  const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900">{p.code}</span>
                        <span className="text-gray-500 ml-2">{p.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center"><Badge status="COMPLETED">{p.completed}</Badge></td>
                      <td className="px-4 py-3.5 text-center"><Badge status="ONGOING">{p.ongoing}</Badge></td>
                      <td className="px-4 py-3.5 text-center"><Badge status="DELAYED">{p.delayed}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {data.projectStats.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No projects yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User-wise table */}
      {view === "user" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">User-wise breakdown</h2>
            </div>
            <div className="flex gap-1">
              {["ALL", "MANAGER", "EXECUTOR"].map(f => (
                <button
                  key={f}
                  onClick={() => setDrillFilter(f)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${drillFilter === f ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  {f === "ALL" ? "All" : f === "MANAGER" ? "Managers" : "Executors"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ongoing</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Delayed</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Rating</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {userStats.map(u => {
                  const pct = u.total ? Math.round((u.completed / u.total) * 100) : 0
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                            {u.name[0]}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "MANAGER" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center"><Badge status="COMPLETED">{u.completed}</Badge></td>
                      <td className="px-4 py-3.5 text-center"><Badge status="ONGOING">{u.ongoing}</Badge></td>
                      <td className="px-4 py-3.5 text-center"><Badge status="DELAYED">{u.delayed}</Badge></td>
                      <td className="px-4 py-3.5 text-center text-gray-500">{u.total}</td>
                      <td className="px-4 py-3.5 text-center">
                        {u.avgRating
                          ? <span className="text-amber-500 font-medium text-xs">★ {u.avgRating}</span>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${u.delayed > 0 ? "bg-red-400" : "bg-indigo-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {userStats.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delayed subtasks */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-gray-900">Delayed sub-tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Executor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.delayedSubTasks.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3.5 text-gray-500">{s.activity?.task?.project?.code}</td>
                  <td className="px-4 py-3.5 text-gray-700">{s.executor?.name}</td>
                  <td className="px-4 py-3.5 text-gray-500">
                    {s.dueDate ? new Date(s.dueDate).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3.5"><Badge status="DELAYED">Delayed</Badge></td>
                </tr>
              ))}
              {data.delayedSubTasks.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No delayed tasks 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}