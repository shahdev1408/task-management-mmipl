export default function StatCard({ label, value, icon: Icon, color, subtext }) {
  const colors = {
    green:  { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-600" },
    blue:   { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-600"    },
    red:    { bg: "bg-red-50",     text: "text-red-700",     icon: "text-red-600"     },
    gray:   { bg: "bg-gray-50",    text: "text-gray-700",    icon: "text-gray-600"    },
  }
  const c = colors[color] || colors.gray
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-5">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate mr-2">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-2xl sm:text-3xl font-semibold tracking-tight ${c.text}`}>{value}</p>
      {subtext && <p className="text-[11px] sm:text-xs text-gray-400 mt-1 truncate">{subtext}</p>}
    </div>
  )
}