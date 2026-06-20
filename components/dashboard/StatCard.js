export default function StatCard({ label, value, icon: Icon, color, subtext }) {
  const colors = {
    green:  { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-600" },
    blue:   { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-600"    },
    red:    { bg: "bg-red-50",     text: "text-red-700",     icon: "text-red-600"     },
    gray:   { bg: "bg-gray-50",    text: "text-gray-700",    icon: "text-gray-600"    },
  }
  const c = colors[color] || colors.gray
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}>
            <Icon className={`w-4 h-4 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-semibold ${c.text}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  )
}