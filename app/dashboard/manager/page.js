"use client"
import { useEffect, useState } from "react"
import {
  CheckCircle2, Clock, AlertTriangle, RefreshCw,
  Star, RotateCcw, UserCheck, ChevronDown, ChevronUp,
  BarChart3, Users
} from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import Badge from "@/components/ui/Badge"

export default function ManagerDashboard() {
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [executors, setExecutors]     = useState([])
  const [reallocModal, setReallocModal] = useState(null)
  const [newExecutorId, setNewExecId] = useState("")
  const [actionMsg, setActionMsg]     = useState("")
  const [expandedAct, setExpandedAct] = useState({})
  const [view, setView]               = useState("activity")

  async function load() {
    setLoading(true)
    const [dashRes, execRes] = await Promise.all([
      fetch("/api/dashboard/manager"),
      fetch("/api/users?role=EXECUTOR"),
    ])
    setData(await dashRes.json())
    setExecutors(await execRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleWithdraw(id) {
    setActionMsg("")
    const res = await fetch(`/api/subtasks/${id}/withdraw`, { method: "POST" })
    if (res.ok) { setActionMsg("✅ Subtask withdrawn"); load() }
    else setActionMsg("❌ Failed to withdraw")
  }

  async function handleReallocate(id) {
    if (!newExecutorId) return
    const res = await fetch(`/api/subtasks/${id}/reallocate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newExecutorId }),
    })
    if (res.ok) { setActionMsg("✅ Reallocated"); setReallocModal(null); setNewExecId(""); load() }
    else setActionMsg("❌ Failed to reallocate")
  }

  async function handleRate(id, rating) {
    await fetch(`/api/subtasks/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your activities and team</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div className={`text-sm px-4 py-3 rounded-lg border ${actionMsg.startsWith("✅") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {actionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Completed" value={data.completed} icon={CheckCircle2}  color="green" />
        <StatCard label="On-going"  value={data.ongoing}   icon={Clock}         color="blue"  />
        <StatCard label="Delayed"   value={data.delayed}   icon={AlertTriangle} color="red"   />
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {[
          { key: "activity", label: "Activity view",  icon: BarChart3 },
          { key: "project",  label: "Project-wise",   icon: BarChart3 },
          { key: "executor", label: "User-wise",       icon: Users     },
        ].map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${view === v.key ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <v.icon className="w-4 h-4" /> {v.label}
          </button>
        ))}
      </div>

      {/* Activity view with subtasks + actions */}
      {view === "activity" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Activities & sub-tasks</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Activity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Done</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Going</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Late</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.activityStats.map(a => (
                <>
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{a.project?.code}</td>
                    <td className="px-4 py-3.5 text-center"><Badge status="COMPLETED">{a.completed}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="ONGOING">{a.ongoing}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="DELAYED">{a.delayed}</Badge></td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setExpandedAct(e => ({ ...e, [a.id]: !e[a.id] }))}
                        className="text-xs text-indigo-600 flex items-center gap-1">
                        {expandedAct[a.id] ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> Subtasks</>}
                      </button>
                    </td>
                  </tr>
                  {expandedAct[a.id] && data.allSubTasks
                    .filter(s => s.activityName === a.name)
                    .map(s => (
                      <tr key={`sub-${s.id}`} className="bg-indigo-50">
                        <td className="pl-10 pr-4 py-2.5 text-xs" colSpan={2}>
                          <span className="font-medium text-gray-800">{s.name}</span>
                          <span className="text-gray-400 ml-2">→ {s.executor?.name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center" colSpan={2}>
                          <Badge status={s.status}>{s.status}</Badge>
                        </td>
                        <td className="px-4 py-2.5" colSpan={2}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <button key={n} onClick={() => handleRate(s.id, n)}>
                                  <Star className={`w-3.5 h-3.5 ${(s.rating||0) >= n ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                                </button>
                              ))}
                            </div>
                            {s.status !== "COMPLETED" && s.status !== "ALLOTTED" && (
                              <button onClick={() => handleWithdraw(s.id)}
                                className="flex items-center gap-1 text-xs text-orange-600 border border-orange-200 px-2 py-1 rounded-lg hover:bg-orange-50">
                                <RotateCcw className="w-3 h-3" /> Withdraw
                              </button>
                            )}
                            <button onClick={() => { setReallocModal(s.id); setNewExecId("") }}
                              className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50">
                              <UserCheck className="w-3 h-3" /> Reallocate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </>
              ))}
              {data.activityStats.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No activities assigned yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Project-wise */}
      {view === "project" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Project-wise breakdown (your scope)</h2>
          </div>
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
              {data.projectStats.map((p, i) => {
                const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{p.code} <span className="text-gray-400 font-normal">{p.name}</span></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="COMPLETED">{p.completed}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="ONGOING">{p.ongoing}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="DELAYED">{p.delayed}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {data.projectStats.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No project data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User-wise (executors under this manager) */}
      {view === "executor" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">User-wise breakdown (your executors)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Executor</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ongoing</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Delayed</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Rating</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.executorStats.map(e => {
                const pct = e.total ? Math.round((e.completed / e.total) * 100) : 0
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {e.name?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center"><Badge status="COMPLETED">{e.completed}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="ONGOING">{e.ongoing}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge status="DELAYED">{e.delayed}</Badge></td>
                    <td className="px-4 py-3.5 text-center">
                      {e.avgRating
                        ? <span className="text-amber-500 font-medium text-xs">★ {e.avgRating}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${e.delayed > 0 ? "bg-red-400" : "bg-indigo-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {data.executorStats.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No executors assigned yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reallocate modal */}
      {reallocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Reallocate subtask</h3>
            <p className="text-xs text-gray-500 mb-3">Select a new executor. Status returns to Allotted.</p>
            <select value={newExecutorId} onChange={e => setNewExecId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4">
              <option value="">Select executor...</option>
              {executors.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => handleReallocate(reallocModal)} disabled={!newExecutorId}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                Confirm
              </button>
              <button onClick={() => { setReallocModal(null); setNewExecId("") }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}