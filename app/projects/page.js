"use client"
import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, X, Check, RefreshCw, FolderKanban } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ code: "", name: "", day0: "" })
  const [error, setError]       = useState("")
  const [saving, setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/projects")
    const json = await res.json()
    setProjects(Array.isArray(json) ? json : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(p) {
    setEditing(p.id)
    setForm({ code: p.code, name: p.name, day0: new Date(p.day0).toISOString().split("T")[0] })
    setShowForm(false)
    setError("")
  }

  function startNew() {
    setEditing(null)
    setForm({ code: "", name: "", day0: "" })
    setShowForm(true)
    setError("")
  }

  function cancel() {
    setEditing(null)
    setShowForm(false)
    setError("")
  }

  async function save() {
    setError("")
    setSaving(true)
    const url    = editing ? `/api/projects/${editing}` : "/api/projects"
    const method = editing ? "PATCH" : "POST"
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) return setError(json.error || "Failed to save")
    cancel()
    load()
  }

  async function deleteProject(id) {
    if (!confirm("Delete this project? This cannot be undone.")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} projects</p>
        </div>
        <button onClick={startNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-200 p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">New project</p>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="P001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Website Relaunch" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Day 0 *</label>
              <input type="date" value={form.day0} onChange={e => setForm(p => ({ ...p, day0: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <Check className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={cancel}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Day 0</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <>
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{p.code}</td>
                  <td className="px-4 py-3.5 text-gray-700">{p.name}</td>
                  <td className="px-4 py-3.5 text-gray-500">{new Date(p.day0).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteProject(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editing === p.id && (
                  <tr key={`edit-${p.id}`}>
                    <td colSpan={4} className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                          <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Day 0</label>
                          <input type="date" value={form.day0} onChange={e => setForm(p => ({ ...p, day0: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={save} disabled={saving}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                          <Check className="w-3 h-3" /> {saving ? "Saving..." : "Update"}
                        </button>
                        <button onClick={cancel}
                          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}