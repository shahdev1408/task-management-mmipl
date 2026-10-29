"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (with Backdrop overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Body */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
            <Sidebar 
              onNavigate={() => setMobileOpen(false)} 
              isMobile={true} 
              onClose={() => setMobileOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-5 md:p-6 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
