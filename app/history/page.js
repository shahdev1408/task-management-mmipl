"use client"
import { useEffect, useState } from "react"
import { RefreshCw, Clock, ArrowRight } from "lucide-react"
import Badge from "@/components/ui/Badge"

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/history")
    const json = await res.json()
    setHistory(Array.isArray(json) ? json : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-0.5">All status changes across the system</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Changed by</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status change</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Note</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {h.subTask?.name}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-gray-800 font-medium">{h.changedBy?.name}</p>
                      <p className="text-xs text-gray-400">{h.changedBy?.role}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Badge status={h.oldStatus}>{h.oldStatus}</Badge>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <Badge status={h.newStatus}>{h.newStatus}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs max-w-xs truncate">
                    {h.note || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(h.changedAt).toLocaleString("en-IN")}
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    No history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}