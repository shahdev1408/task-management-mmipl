"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, ChevronDown, ChevronRight, RefreshCw, Trash2 } from "lucide-react"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [open, setOpen]           = useState({})
  const [deleting, setDeleting]   = useState(null)
  const [error, setError]         = useState("")

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/templates")
    const json = await res.json()
    setTemplates(Array.isArray(json) ? json : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteTemplate(id) {
    if (!confirm("Delete this template? This cannot be undone.")) return
    setDeleting(id)
    setError("")
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
    setDeleting(null)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error || "Failed to delete")
    } else {
      load()
    }
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
          <h1 className="text-xl font-semibold text-gray-900">Task Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{templates.length} templates</p>
        </div>
        <Link href="/templates/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Template
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => setOpen(o => ({ ...o, [t.id]: !o[t.id] }))}
                className="flex items-center gap-3 flex-1 text-left">
                {open[t.id]
                  ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{t.activities.length} activities</span>
                <button
                  onClick={() => deleteTemplate(t.id)}
                  disabled={deleting === t.id}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {open[t.id] && (
              <div className="px-5 pb-4 border-t border-gray-100">
                {t.activities.map((a, ai) => (
                  <div key={a.id} className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-semibold">{ai + 1}</span>
                      <p className="text-sm font-medium text-gray-800">{a.name}</p>
                      <span className="text-xs text-gray-400">· {a.estimatedDays}d</span>
                      {a.prePerson  && <span className="text-xs text-gray-400">· Pre: {a.prePerson}</span>}
                      {a.postPerson && <span className="text-xs text-gray-400">· Post: {a.postPerson}</span>}
                    </div>
                    <div className="ml-7 space-y-1">
                      {a.subTasks.map((s, si) => (
                        <div key={s.id} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 flex items-center justify-center">{si + 1}</span>
                          <span>{s.name}</span>
                          <span className="text-gray-400">· {s.defaultDays}d</span>
                          {s.precedenceType !== "NONE" && (
                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{s.precedenceType}</span>
                          )}
                          {s.attachmentRequired && (
                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">📎 {s.attachmentRequired}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {templates.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">No templates yet</p>
            <Link href="/templates/create" className="text-sm text-indigo-600 hover:underline">
              Create your first template →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}