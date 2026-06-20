export default function Badge({ status, children }) {
  const colors = {
    COMPLETED:  "bg-emerald-100 text-emerald-800",
    ONGOING:    "bg-blue-100 text-blue-800",
    DELAYED:    "bg-red-100 text-red-800",
    ALLOTTED:   "bg-purple-100 text-purple-800",
    SUCCESSFUL: "bg-emerald-100 text-emerald-800",
    PARTIAL:    "bg-amber-100 text-amber-800",
    REGRET:     "bg-red-100 text-red-800",
  }
  const key = (status || children || "").toString().toUpperCase()
  const cls = colors[key] || "bg-gray-100 text-gray-800"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}