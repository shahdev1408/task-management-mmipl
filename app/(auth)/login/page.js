"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn, AlertCircle, ClipboardList } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", {
      email:    form.email.trim(),
      password: form.password.trim(),
      redirect: false,
    })
    if (res?.error) {
      setLoading(false)
      setError("Invalid email or password")
    } else {
      // Direct window location avoids Next.js router cache stall
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Task Management</h1>
              <p className="text-xs text-gray-500">Sign in to your account</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="supervisor@mmipl.in" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Quick Login Role Selectors */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2.5">Quick Login by Role:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ email: "supervisor@mmipl.in", password: "password123" })}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 transition-colors text-center"
              >
                <span className="text-xs font-bold">Supervisor</span>
                <span className="text-[10px] text-purple-600 opacity-80">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "manager@mmipl.in", password: "password123" })}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-colors text-center"
              >
                <span className="text-xs font-bold">Manager</span>
                <span className="text-[10px] text-blue-600 opacity-80">Delegation</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "executor@mmipl.in", password: "password123" })}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 transition-colors text-center"
              >
                <span className="text-xs font-bold">Executor</span>
                <span className="text-[10px] text-emerald-600 opacity-80">My Tasks</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-center text-gray-400">
              Default password: <span className="font-mono text-gray-600 font-medium">password123</span>
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline font-medium">Register</Link>
          </p>

        </div>
      </div>
    </div>
  )
}