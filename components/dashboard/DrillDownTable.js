
import { BarChart3, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import Badge from '@/components/ui/Badge'

export default function DrillDownTable({ title, icon: Icon = BarChart3, data, type = 'project' }) {
  const [expandedRow, setExpandedRow] = useState(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#2DAFB9]" />
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 w-10"></th>
              <th className="px-6 py-4">{type === 'project' ? 'Project' : 'User'}</th>
              <th className="px-4 py-4 text-center">Completed</th>
              <th className="px-4 py-4 text-center">Ongoing</th>
              <th className="px-4 py-4 text-center">Delayed</th>
              <th className="px-6 py-4">Completion Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => {
              const isExpanded = expandedRow === row.id
              const pct = row.total ? Math.round((row.completed / row.total) * 100) : 0

              return (
                <React.Fragment key={row.id}>
                  <tr 
                    onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-gray-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{row.code || row.name}</span>
                      {row.code && <span className="text-gray-500 ml-2">{row.name}</span>}
                    </td>
                    <td className="px-4 py-4 text-center"><Badge status="COMPLETED">{row.completed}</Badge></td>
                    <td className="px-4 py-4 text-center"><Badge status="ONGOING">{row.ongoing}</Badge></td>
                    <td className="px-4 py-4 text-center"><Badge status="DELAYED">{row.delayed}</Badge></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#2DAFB9] to-[#0099FF] rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Drill-Down Data (Placeholder for detailed row expansion) */}
                  {isExpanded && (
                    <tr className="bg-blue-50/20">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="text-xs text-gray-500 pl-10 border-l-2 border-[#2DAFB9]/30 ml-4 py-2">
                           View detailed task ledger for {row.name}...
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                  No tracking data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}