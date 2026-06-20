"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"

export default function DelegationPage() {
  const router  = useRouter()
  const [step, setStep]           = useState(1)
  const [projects, setProjects]   = useState([])
  const [templates, setTemplates] = useState([])
  const [managers, setManagers]   = useState([])
  const [executors, setExecutors] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  const [projectId, setProjectId]   = useState("")
  const [day0, setDay0]             = useState("")
  const [templateId, setTemplateId] = useState("")
  const [activities, setActivities] = useState([])

 useEffect(() => {
  async function loadData() {
    const [projRes, tmplRes, mgrRes, execRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/templates"),
      fetch("/api/users?role=MANAGER"),
      fetch("/api/users?role=EXECUTOR"),
    ])

    const [proj, tmpl, mgr, exec] = await Promise.all([
      projRes.json(),
      tmplRes.json(),
      mgrRes.json(),
      execRes.json(),
    ])

    setProjects(Array.isArray(proj) ? proj : [])
    setTemplates(Array.isArray(tmpl) ? tmpl : [])
    setManagers(Array.isArray(mgr) ? mgr : [])
    setExecutors(Array.isArray(exec) ? exec : [])
  }
  loadData()
}, [])

  useEffect(() => {
    if (!templateId) return
    const t = templates.find(t => t.id === parseInt(templateId))
    if (!t) return
    setActivities(t.activities.map(a => ({
      id:           a.id,
      name:         a.name,
      estimatedDays: a.estimatedDays,
      managerId:    "",
      subTasks:     a.subTasks.map(s => ({
        id:            s.id,
        name:          s.name,
        days:          s.defaultDays,
        precedenceType: s.precedenceType,
        executorId:    "",
      }))
    })))
  }, [templateId, templates])

  function updateActivity(ai, field, value) {
    setActivities(prev => prev.map((a, i) => i === ai ? { ...a, [field]: value } : a))
  }

  function updateSubTask(ai, si, field, value) {
    setActivities(prev => prev.map((a, i) => i !== ai ? a : {
      ...a,
      subTasks: a.subTasks.map((s, j) => j === si ? { ...s, [field]: value } : s)
    }))
  }

  async function handleSubmit() {
    setError("")
    setLoading(true)
    const res = await fetch("/api/tasks", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ projectId, templateId, activities }),
    })
    setLoading(false)
    if (res.ok) {
      router.push("/dashboard/supervisor")
    } else {
      const json = await res.json()
      setError(json.error || "Something went wrong")
    }
  }

  const steps = ["Project & Day 0", "Select Template", "Assign Managers", "Assign Executors"]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Delegate Task</h1>
        <p className="text-sm text-gray-500 mt-0.5">4-step wizard to assign work to your team</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((label, i) => {
          const num    = i + 1
          const active = step === num
          const done   = step > num
          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  done   ? "bg-emerald-500 text-white" :
                  active ? "bg-indigo-600 text-white"  :
                           "bg-gray-100 text-gray-400"
                }`}>
                  {done ? <Check className="w-4 h-4" /> : num}
                </div>
                <span className={`text-xs mt-1 text-center ${active ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > num ? "bg-emerald-400" : "bg-gray-100"}`} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Step 1 — Project & Day 0</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day 0 (Start date)</label>
            <input
              type="date"
              value={day0}
              onChange={e => setDay0(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Step 2 — Select Template</h2>
          {templates.map(t => (
            <label key={t.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
              parseInt(templateId) === t.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={parseInt(templateId) === t.id}
                onChange={e => setTemplateId(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{t.activities.length} activities</p>
              </div>
            </label>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No templates yet. <a href="/templates/create" className="text-indigo-600">Create one first →</a></p>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Step 3 — Assign Managers</h2>
          {activities.map((a, ai) => (
            <div key={ai}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{a.name}</label>
              <select
                value={a.managerId}
                onChange={e => updateActivity(ai, "managerId", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select manager...</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Step 4 — Assign Executors</h2>
            {activities.map((a, ai) => (
              <div key={ai} className="mb-6">
                <p className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center">{ai+1}</span>
                  {a.name}
                </p>
                <div className="space-y-2 ml-7">
                  {a.subTasks.map((s, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-32 truncate">{s.name}</span>
                      <input
                        type="number" min="1"
                        value={s.days}
                        onChange={e => updateSubTask(ai, si, "days", e.target.value)}
                        className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Days"
                      />
                      <select
                        value={s.executorId}
                        onChange={e => updateSubTask(ai, si, "executorId", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select executor...</option>
                        {executors.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={
              (step === 1 && (!projectId || !day0)) ||
              (step === 2 && !templateId) ||
              (step === 3 && activities.some(a => !a.managerId))
            }
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || activities.some(a => a.subTasks.some(s => !s.executorId))}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Delegating..." : "Delegate Task ✓"}
          </button>
        )}
      </div>
    </div>
  )
}