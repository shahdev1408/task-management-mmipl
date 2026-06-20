"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

const newSubTask = () => ({ name: "", description: "", defaultDays: 1, precedenceType: "NONE", attachmentRequired: "" })
const newActivity = () => ({ name: "", description: "", estimatedDays: 1, subTasks: [newSubTask()] })

export default function CreateTemplatePage() {
  const router = useRouter()
  const [name, setName]             = useState("")
  const [description, setDesc]      = useState("")
  const [activities, setActivities] = useState([newActivity()])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  function updateActivity(ai, field, value) {
    setActivities(prev => prev.map((a, i) => i === ai ? { ...a, [field]: value } : a))
  }

  function updateSubTask(ai, si, field, value) {
    setActivities(prev => prev.map((a, i) => {
      if (i !== ai) return a
      const updatedSubs = a.subTasks.map((s, j) => j === si ? { ...s, [field]: value } : s)
      // Auto-calculate estimated days from sum of subtask days
      const totalDays = updatedSubs.reduce((sum, s) => sum + (parseInt(s.defaultDays) || 0), 0)
      return { ...a, subTasks: updatedSubs, estimatedDays: totalDays || 1 }
    }))
  }

  function addActivity() {
    setActivities(prev => [...prev, newActivity()])
  }

  function removeActivity(ai) {
    setActivities(prev => prev.filter((_, i) => i !== ai))
  }

  function addSubTask(ai) {
    setActivities(prev => prev.map((a, i) => {
      if (i !== ai) return a
      const updatedSubs = [...a.subTasks, newSubTask()]
      const totalDays = updatedSubs.reduce((sum, s) => sum + (parseInt(s.defaultDays) || 0), 0)
      return { ...a, subTasks: updatedSubs, estimatedDays: totalDays || 1 }
    }))
  }

  function removeSubTask(ai, si) {
    setActivities(prev => prev.map((a, i) => {
      if (i !== ai) return a
      const updatedSubs = a.subTasks.filter((_, j) => j !== si)
      const totalDays = updatedSubs.reduce((sum, s) => sum + (parseInt(s.defaultDays) || 0), 0)
      return { ...a, subTasks: updatedSubs, estimatedDays: totalDays || 1 }
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (!name.trim()) return setError("Template name is required")
    if (activities.some(a => !a.name.trim())) return setError("All activities must have a name")
    setLoading(true)
    const res = await fetch("/api/templates", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, description, activities }),
    })
    setLoading(false)
    if (res.ok) router.push("/templates")
    else {
      const json = await res.json()
      setError(json.error || "Something went wrong")
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create Template</h1>
        <p className="text-sm text-gray-500 mt-0.5">Define task structure once, reuse for any project</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Template details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Website Development" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={description} onChange={e => setDesc(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional description" />
          </div>
        </div>

        {activities.map((activity, ai) => (
          <div key={ai} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold">{ai + 1}</span>
                <span className="text-sm font-semibold text-gray-900">Activity {ai + 1}</span>
              </div>
              {activities.length > 1 && (
                <button type="button" onClick={() => removeActivity(ai)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Activity name *</label>
                  <input value={activity.name} onChange={e => updateActivity(ai, "name", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Design Phase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estimated days
                    <span className="text-indigo-500 ml-1 font-normal">(auto from subtasks)</span>
                  </label>
                  <input type="number" min="1" value={activity.estimatedDays} readOnly
                    className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700">Sub-tasks</label>
                  <button type="button" onClick={() => addSubTask(ai)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                    <Plus className="w-3 h-3" /> Add sub-task
                  </button>
                </div>

                <div className="space-y-2">
                  {activity.subTasks.map((sub, si) => (
                    <div key={si} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-600 text-xs flex items-center justify-center flex-shrink-0">{si + 1}</span>
                        <input value={sub.name} onChange={e => updateSubTask(ai, si, "name", e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          placeholder="Sub-task name" />
                        {activity.subTasks.length > 1 && (
                          <button type="button" onClick={() => removeSubTask(ai, si)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Days</label>
                          <input type="number" min="1" value={sub.defaultDays}
                            onChange={e => updateSubTask(ai, si, "defaultDays", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Precedence</label>
                          <select value={sub.precedenceType}
                            onChange={e => updateSubTask(ai, si, "precedenceType", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                            <option value="NONE">None</option>
                            <option value="START">Start</option>
                            <option value="END">End</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Attachment required</label>
                          <input value={sub.attachmentRequired}
                            onChange={e => updateSubTask(ai, si, "attachmentRequired", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            placeholder="e.g. PDF, ZIP" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addActivity}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Activity
        </button>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
            {loading ? "Saving..." : "Save Template"}
          </button>
          <button type="button" onClick={() => router.push("/templates")}
            className="border border-gray-200 text-gray-600 text-sm px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}