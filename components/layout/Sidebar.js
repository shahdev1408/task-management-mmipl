"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, ClipboardList, FolderKanban,
  ChevronRight, Clock, Settings, FolderOpen
} from "lucide-react"

const navByRole = {
  SUPERVISOR: [
    { href: "/dashboard/supervisor", label: "Dashboard",   icon: LayoutDashboard },
    { href: "/templates",            label: "Templates",   icon: ClipboardList   },
    { href: "/projects",             label: "Projects",    icon: FolderOpen      },
    { href: "/delegation/new",       label: "Delegate",    icon: FolderKanban    },
    { href: "/history",              label: "Audit Trail", icon: Clock           },
    { href: "/settings",             label: "Settings",    icon: Settings        },
  ],
  MANAGER: [
    { href: "/dashboard/manager",    label: "Dashboard",   icon: LayoutDashboard },
    { href: "/templates",            label: "Templates",   icon: ClipboardList   },
    { href: "/delegation/new",       label: "Delegate",    icon: FolderKanban    },
    { href: "/settings",             label: "Settings",    icon: Settings        },
  ],
  EXECUTOR: [
    { href: "/dashboard/executor",   label: "My Tasks",    icon: LayoutDashboard },
    { href: "/settings",             label: "Settings",    icon: Settings        },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role  = session?.user?.role
  const links = navByRole[role] || []

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (pathname.startsWith(href + "/") && href !== "/")
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}