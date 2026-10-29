"use client"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { LogOut, Bell, X, AlertTriangle, Info, CheckCircle2, AlertCircle, Menu } from "lucide-react"

export default function Navbar({ onOpenMobileMenu }) {
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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 z-20">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">
          Hi, <span className="font-semibold text-gray-900">{session?.user?.name || "User"}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

        {/* Bell with dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => { setOpen(o => !o); if (!open) loadNotifs() }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="fixed inset-x-3 top-14 sm:inset-auto sm:right-0 sm:top-11 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
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

              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-right">
                <button
                  onClick={loadNotifs}
                  className="text-xs text-indigo-600 font-medium hover:underline"
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
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-red-700 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 border border-gray-200 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>

      </div>
    </header>
  )
}