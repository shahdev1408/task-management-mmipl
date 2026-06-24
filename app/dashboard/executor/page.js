"use client"
import { useEffect, useState } from "react"
import {
  CheckCircle2, AlertTriangle, Package,
  RefreshCw, Calendar, Paperclip, X, Upload,
  PlayCircle, ChevronUp
} from "lucide-react"
import StatCard from "@/components/dashboard/StatCard"
import Badge from "@/components/ui/Badge"

const TABS = [
  { key: "allotted",  label: "Allotted",  color: "gray"  },
  { key: "onHand",    label: "On-Hand",   color: "blue"  },
  { key: "completed", label: "Completed", color: "green" },
  { key: "delayed",   label: "Delayed",   color: "red"   },
]

const TAB_COLORS = {
  gray:  { border: "border-gray-500 text-gray-700",     badge: "bg-gray-100 text-gray-700"    },
  blue:  { border: "border-indigo-500 text-indigo-700", badge: "bg-indigo-100 text-indigo-700"},
  green: { border: "border-emerald-500 text-emerald-700", badge: "bg-emerald-100 text-emerald-700"},
  red:   { border: "border-red-500 text-red-700",       badge: "bg-red-100 text-red-700"      },
}

function MsgBox({ msg }) {
  if (!msg.text) return null
  const cls = msg.type === "success"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : msg.type === "warning"
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-red-50 border-red-200 text-red-700"
  return <div className={`text-xs px-3 py-2.5 rounded-lg border ${cls}`}>{msg.text}</div>
}

export default function ExecutorDashboard() {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState("allotted")
  const [submitting, setSubmitting] = useState(null)
  const [scheduling, setScheduling] = useState(null)
  const [schedDate, setSchedDate]   = useState("")
  const [form, setForm]             = useState({ status: "SUCCESSFUL", remark: "", file: null })
  const [msg, setMsg]               = useState({ text: "", type: "" })
  const [uploading, setUploading]   = useState(false)

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/dashboard/executor")
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function acceptTask(id, scheduledDate) {
    const date = scheduledDate || new Date().toISOString()
    await fetch(`/api/subtasks/${id}/accept`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ scheduledDate: date }),
    })
    setScheduling(null)
    load()
  }

  async function submitTask(id) {
    setMsg({ text: "", type: "" })
    if (!form.remark || form.remark.trim().length < 10) {
      setMsg({ text: "Remark must be at least 10 characters.", type: "error" })
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append("submissionStatus", form.status)
    fd.append("remark", form.remark)
    if (form.file) fd.append("file", form.file)
    const res  = await fetch(`/api/subtasks/${id}/submit`, { method: "POST", body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.warning || !res.ok) {
      setMsg({ text: json.message || json.error || "Something went wrong", type: "warning" })
    } else {
      setMsg({ text: "Submitted successfully!", type: "success" })
      setTimeout(() => {
        setSubmitting(null)
        setForm({ status: "SUCCESSFUL", remark: "", file: null })
        setMsg({ text: "", type: "" })
        setActiveTab("completed")
        load()
      }, 1000)
    }
  }

  function resetForm() {
    setSubmitting(null)
    setForm({ status: "SUCCESSFUL", remark: "", file: null })
    setMsg({ text: "", type: "" })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  )

  const currentList = data[activeTab] || []

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your assigned sub-tasks</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Allotted"  value={data.counts.allotted}  icon={Package}       color="gray"  subtext="Pending acceptance"   />
        <StatCard label="On-Hand"   value={data.counts.onHand}    icon={PlayCircle}    color="blue"  subtext="Accepted, in progress" />
        <StatCard label="Completed" value={data.counts.completed} icon={CheckCircle2}  color="green" subtext="Submitted"             />
        <StatCard label="Delayed"   value={data.counts.delayed}   icon={AlertTriangle} color="red"   subtext="Past due date"         />
      </div>

      {data.dueSoon?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">
              Due in next 2 working days — {data.dueSoon.length} task{data.dueSoon.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-1.5">
            {data.dueSoon.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-sm text-amber-900 font-medium">{s.name}</span>
                  <span className="text-xs text-amber-600">· {s.activity?.task?.project?.code}</span>
                </div>
                <span className="text-xs text-amber-700 font-medium">
                  {s.dueDate ? new Date(s.dueDate).toLocaleDateString("en-IN") : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        <div className="flex border-b border-gray-100">
          {TABS.map(t => {
            const count  = data.counts[t.key] || 0
            const active = activeTab === t.key
            const c      = TAB_COLORS[t.color]
            return (
              <button key={t.key}
                onClick={() => { setActiveTab(t.key); resetForm() }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  active ? `${c.border} bg-gray-50` : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                {t.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? c.badge : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                {activeTab === "completed" && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {currentList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {activeTab === "allotted"  && <Package className="w-8 h-8 text-gray-200" />}
                      {activeTab === "onHand"    && <PlayCircle className="w-8 h-8 text-gray-200" />}
                      {activeTab === "completed" && <CheckCircle2 className="w-8 h-8 text-gray-200" />}
                      {activeTab === "delayed"   && <AlertTriangle className="w-8 h-8 text-gray-200" />}
                      <p className="text-sm text-gray-400">
                        {activeTab === "allotted"  && "No allotted tasks yet"}
                        {activeTab === "onHand"    && "No tasks accepted yet — go to Allotted tab"}
                        {activeTab === "completed" && "No completed tasks yet"}
                        {activeTab === "delayed"   && "No delayed tasks 🎉"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {currentList.map(s => (
                <tbody key={s.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      {s.remark && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{s.remark}</p>
                      )}
                      {s.attachmentPath && (
                        <a
                          href={s.attachmentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-0.5"
                        >
                          <Paperclip className="w-3 h-3" />
                          Open Attachment
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{s.activity?.task?.project?.code}</td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {s.dueDate ? new Date(s.dueDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3.5"><Badge status={s.status}>{s.status}</Badge></td>

                    {activeTab === "completed" && (
                      <td className="px-4 py-3.5">
                        {s.rating
                          ? <span className="text-amber-400 text-sm">{"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}</span>
                          : <span className="text-xs text-gray-300">Not rated yet</span>
                        }
                      </td>
                    )}

                    <td className="px-4 py-3.5">
                      {activeTab === "allotted" && scheduling !== s.id && (
                        <button onClick={() => { setScheduling(s.id); setSchedDate("") }}
                          className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                          <PlayCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                      )}
                      {activeTab === "onHand" && (
                        <button onClick={() => { setSubmitting(submitting === s.id ? null : s.id); setMsg({ text: "", type: "" }) }}
                          className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                          {submitting === s.id
                            ? <><ChevronUp className="w-3.5 h-3.5" /> Cancel</>
                            : <><CheckCircle2 className="w-3.5 h-3.5" /> Submit</>
                          }
                        </button>
                      )}
                      {activeTab === "delayed" && (
                        <button onClick={() => { setActiveTab("onHand"); setSubmitting(s.id) }}
                          className="flex items-center gap-1.5 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Submit late
                        </button>
                      )}
                      {activeTab === "completed" && <span className="text-xs text-gray-300">—</span>}
                    </td>
                  </tr>

                  {activeTab === "allotted" && scheduling === s.id && (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-gray-700 font-medium">Schedule completion date:</span>
                          <input type="date" value={schedDate}
                            onChange={e => setSchedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                          <button
                            onClick={() => acceptTask(s.id, schedDate ? new Date(schedDate).toISOString() : null)}
                            disabled={!schedDate}
                            className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                            Confirm Accept
                          </button>
                          <button onClick={() => setScheduling(null)}
                            className="text-xs text-gray-400 hover:text-gray-600">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {submitting === s.id && activeTab === "onHand" && (
                    <tr>
                      <td colSpan={6} className="px-5 py-5 bg-indigo-50 border-b border-indigo-100">
                        <div className="max-w-xl space-y-4">

                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">
                              Submitting: <span className="text-indigo-700">{s.name}</span>
                            </p>
                            <button onClick={resetForm}>
                              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>

                          <MsgBox msg={msg} />

                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">Submission status</p>
                            <div className="flex gap-2">
                              {["SUCCESSFUL", "PARTIAL", "REGRET"].map(st => (
                                <button key={st} onClick={() => setForm(f => ({ ...f, status: st }))}
                                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                                    form.status === st
                                      ? st === "SUCCESSFUL" ? "bg-emerald-600 text-white border-emerald-600"
                                      : st === "PARTIAL"    ? "bg-amber-500 text-white border-amber-500"
                                      :                       "bg-red-500 text-white border-red-500"
                                      : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                                  }`}>
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-700">Remark *</p>
                              <span className={`text-xs ${form.remark.length < 10 ? "text-red-400" : "text-emerald-600"}`}>
                                {form.remark.length} / 10 min
                              </span>
                            </div>
                            <textarea rows={3} value={form.remark}
                              onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                              placeholder="Describe what you completed in detail..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white" />
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Attachment <span className="text-gray-400 font-normal">(optional)</span>
                            </p>
                            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-white transition-colors bg-white">
                              <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  {form.file ? form.file.name : "Click to upload file"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {form.file ? `${(form.file.size / 1024).toFixed(1)} KB` : "PDF, image, ZIP, Word, Excel — any type"}
                                </p>
                              </div>
                              {form.file && (
                                <button type="button"
                                  onClick={e => { e.preventDefault(); setForm(f => ({ ...f, file: null })) }}
                                  className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <input type="file" className="hidden"
                                onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))} />
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => submitTask(s.id)} disabled={uploading}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors">
                              {uploading
                                ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Submit</>
                              }
                            </button>
                            <button onClick={resetForm}
                              className="text-xs border border-gray-200 bg-white px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                              Cancel
                            </button>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}