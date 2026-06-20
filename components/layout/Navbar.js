"use client"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { LogOut, Bell, X, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react"

export default function Navbar() {
  const { data: session }           = useSession()
  const [notifs, setNotifs]         = useState([])
  const [open, setOpen]             = useState(false)
  const [loading, setLoading]       = useState(false)
  const ref                         = useRef(null)

  async function loadNotifs() {
    setLoading(true)
    const res  = await fetch("/api/notifications")
    const json = await res.json()
    setNotifs(Array.isArray(json) ? json : [])
    setLoading(false)
  }

  useEffect(() => {
  if (session) loadNotifs()
  const interval = setInterval(() => {
    if (session) loadNotifs()
  }, 30000)
  return () => clearInterval(interval)
}, [session])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const iconMap = {
    error:   <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle   className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />,
    info:    <Info          className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2  className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />,
  }

  const bgMap = {
    error:   "bg-red-50",
    warning: "bg-amber-50",
    info:    "bg-blue-50",
    success: "bg-emerald-50",
  }

  const unread = notifs.length

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <span className="text-sm text-gray-500">
        Welcome back, <span className="font-medium text-gray-900">{session?.user?.name}</span>
      </span>

      <div className="flex items-center gap-3">

        {/* Bell with dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => { setOpen(o => !o); if (!open) loadNotifs() }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {loading && (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">Loading...</div>
                )}
                {!loading && notifs.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">
                    No notifications 🎉
                  </div>
                )}
                {!loading && notifs.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${bgMap[n.type] || "bg-white"}`}>
                    {iconMap[n.type]}
                    <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={loadNotifs}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

      </div>
    </header>
  )
}