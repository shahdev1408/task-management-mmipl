"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, ClipboardList, FolderKanban,
  ChevronRight, Clock, Settings, FolderOpen, Users, CheckSquare, X, LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

const navByRole = {
  SUPERVISOR: [
    { href: "/dashboard/supervisor", label: "Dashboard",      icon: LayoutDashboard },
    { href: "/dashboard/manager",    label: "Manager view",   icon: Users           },
    { href: "/dashboard/executor",   label: "Executor view",  icon: CheckSquare     },
    { href: "/templates",            label: "Templates",      icon: ClipboardList   },
    { href: "/projects",             label: "Projects",       icon: FolderOpen      },
    { href: "/delegation/new",       label: "Delegate",       icon: FolderKanban    },
    { href: "/history",              label: "Audit Trail",    icon: Clock           },
    { href: "/settings",             label: "Settings",       icon: Settings        },
  ],
  MANAGER: [
    { href: "/dashboard/manager",    label: "Dashboard",      icon: LayoutDashboard },
    { href: "/dashboard/executor",   label: "Executor view",  icon: CheckSquare     },
    { href: "/templates",            label: "Templates",      icon: ClipboardList   },
    { href: "/delegation/new",       label: "Delegate",       icon: FolderKanban    },
    { href: "/settings",             label: "Settings",       icon: Settings        },
  ],
  EXECUTOR: [
    { href: "/dashboard/executor",   label: "My Tasks",       icon: LayoutDashboard },
    { href: "/settings",             label: "Settings",       icon: Settings        },
  ],
}

export default function Sidebar({ onNavigate, isMobile = false, onClose }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role  = session?.user?.role
  const links = navByRole[role] || []

  return (
    <aside className={isMobile ? "w-full h-full bg-white flex flex-col" : "w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col"}>
      <div className="px-4 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">TaskFlow</span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
          return (
            <Link key={href} href={href} prefetch={true}
              onClick={() => onNavigate?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session?.user?.name || "User"}</p>
              <p className="text-[10px] uppercase font-semibold text-indigo-600">{role}</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}