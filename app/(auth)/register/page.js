"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ClipboardList, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) return setError("Passwords do not match")
    if (form.password.length < 6) return setError("Password must be at least 6 characters")
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) return setError(json.error || "Registration failed")
    setSuccess(true)
    setTimeout(() => router.push("/login"), 2000)
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
              <h1 className="text-lg font-semibold text-gray-900">Create account</h1>
              <p className="text-xs text-gray-500">Task Management System</p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-sm font-medium text-gray-900">Account created!</p>
              <p className="text-xs text-gray-500">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Full name", key: "name", type: "text", placeholder: "John Doe" },
                  { label: "Email", key: "email", type: "email", placeholder: "you@company.com" },
                  { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
                  { label: "Confirm password", key: "confirm", type: "password", placeholder: "Re-enter password" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} required placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
              </p>
              <p className="mt-2 text-center text-xs text-gray-400">Your account needs supervisor approval to get full access.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}