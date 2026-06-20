"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  User, Users, KeyRound, Check, X, Pencil,
  ShieldCheck, ShieldOff, RefreshCw, Plus, Eye, EyeOff
} from "lucide-react"

const ROLES = ["SUPERVISOR", "MANAGER", "EXECUTOR"]

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const isSupervisor = session?.user?.role === "SUPERVISOR"
  const [tab, setTab]     = useState("profile")
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [profile, setProfile]   = useState({ name: "", email: "" })
  const [pwForm, setPwForm]     = useState({ currentPassword: "", password: "", confirm: "" })
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" })
  const [pwMsg, setPwMsg]       = useState({ text: "", type: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [showPw, setShowPw]     = useState(false)

  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", role: "EXECUTOR" })
  const [showNewUser, setShowNewUser] = useState(false)
  const [userMsg, setUserMsg]   = useState({ text: "", type: "" })
  const [savingUser, setSavingUser] = useState(false)

  useEffect(() => {
    if (session?.user) setProfile({ name: session.user.name || "", email: session.user.email || "" })
  }, [session])

  async function loadUsers() {
    setLoadingUsers(true)
    const res  = await fetch("/api/users")
    const json = await res.json()
    setUsers(Array.isArray(json) ? json : [])
    setLoadingUsers(false)
  }

  useEffect(() => {
    if (tab === "users" && isSupervisor) loadUsers()
  }, [tab])

  async function saveProfile() {
    setProfileMsg({ text: "", type: "" })
    setSavingProfile(true)
    const res = await fetch(`/api/users/${session.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, email: profile.email }),
    })
    const json = await res.json()
    setSavingProfile(false)
    if (!res.ok) return setProfileMsg({ text: json.error || "Failed", type: "error" })
    setProfileMsg({ text: "Profile updated successfully", type: "success" })
    update({ name: json.name, email: json.email })
  }

  async function savePassword() {
    setPwMsg({ text: "", type: "" })
    if (pwForm.password !== pwForm.confirm) return setPwMsg({ text: "Passwords do not match", type: "error" })
    if (pwForm.password.length < 6) return setPwMsg({ text: "Min 6 characters", type: "error" })
    setSavingPw(true)
    const res = await fetch(`/api/users/${session.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, password: pwForm.password }),
    })
    const json = await res.json()
    setSavingPw(false)
    if (!res.ok) return setPwMsg({ text: json.error || "Failed", type: "error" })
    setPwMsg({ text: "Password changed successfully", type: "success" })
    setPwForm({ currentPassword: "", password: "", confirm: "" })
  }

  async function saveUserEdit() {
    setUserMsg({ text: "", type: "" })
    setSavingUser(true)
    const res = await fetch(`/api/users/${editUser}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    const json = await res.json()
    setSavingUser(false)
    if (!res.ok) return setUserMsg({ text: json.error || "Failed", type: "error" })
    setEditUser(null)
    setEditForm({})
    loadUsers()
    setUserMsg({ text: "User updated", type: "success" })
  }

  async function toggleActive(u) {
    await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    })
    loadUsers()
  }

  async function createUser() {
    setUserMsg({ text: "", type: "" })
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password)
      return setUserMsg({ text: "All fields required", type: "error" })
    setSavingUser(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserForm),
    })
    const json = await res.json()
    if (res.ok && newUserForm.role !== "EXECUTOR") {
      await fetch(`/api/users/${json.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newUserForm.role }),
      })
    }
    setSavingUser(false)
    if (!res.ok) return setUserMsg({ text: json.error || "Failed", type: "error" })
    setShowNewUser(false)
    setNewUserForm({ name: "", email: "", password: "", role: "EXECUTOR" })
    loadUsers()
    setUserMsg({ text: "User created successfully", type: "success" })
  }

  function msgClass(type) {
    return `text-xs px-3 py-2.5 rounded-lg border ${
      type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-red-50 border-red-200 text-red-700"
    }`
  }

  const tabs = [
    { key: "profile", label: "My profile",       icon: User  },
    { key: "password", label: "Change password", icon: KeyRound },
    ...(isSupervisor ? [{ key: "users", label: "User management", icon: Users }] : []),
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and team</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-semibold text-indigo-700">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-5 space-y-4">
            {profileMsg.text && <p className={msgClass(profileMsg.type)}>{profileMsg.text}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button onClick={saveProfile} disabled={savingProfile}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              {savingProfile ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "password" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
          {pwMsg.text && <p className={msgClass(pwMsg.type)}>{pwMsg.text}</p>}
          {[
            { label: "Current password",  key: "currentPassword" },
            { label: "New password",      key: "password"        },
            { label: "Confirm password",  key: "confirm"         },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={pwForm[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={savePassword} disabled={savingPw}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            {savingPw ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {savingPw ? "Saving..." : "Update password"}
          </button>
        </div>
      )}

      {tab === "users" && isSupervisor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{users.length} users</p>
            <div className="flex gap-2">
              <button onClick={loadUsers} className="flex items-center gap-1.5 text-sm text-gray-500 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button onClick={() => setShowNewUser(v => !v)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add user
              </button>
            </div>
          </div>

          {userMsg.text && <p className={msgClass(userMsg.type)}>{userMsg.text}</p>}

          {showNewUser && (
            <div className="bg-white rounded-xl border border-indigo-200 p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-900">New user</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Full name", key: "name",     type: "text",     placeholder: "John Doe"         },
                  { label: "Email",     key: "email",    type: "email",    placeholder: "john@company.com" },
                  { label: "Password",  key: "password", type: "password", placeholder: "Min 6 characters" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={newUserForm[f.key]}
                      onChange={e => setNewUserForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select value={newUserForm.role} onChange={e => setNewUserForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createUser} disabled={savingUser}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  <Check className="w-3.5 h-3.5" /> {savingUser ? "Creating..." : "Create user"}
                </button>
                <button onClick={() => setShowNewUser(false)}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <>
                      <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            u.role === "SUPERVISOR" ? "bg-purple-100 text-purple-700"
                            : u.role === "MANAGER"  ? "bg-blue-100 text-blue-700"
                            :                         "bg-gray-100 text-gray-700"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button onClick={() => { setEditUser(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }) }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => toggleActive(u)}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                              title={u.isActive ? "Deactivate" : "Activate"}>
                              {u.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editUser === u.id && (
                        <tr key={`edit-${u.id}`}>
                          <td colSpan={4} className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <input value={editForm.name || ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input value={editForm.email || ""} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                <select value={editForm.role || "EXECUTOR"} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reset password <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input type="password" placeholder="Leave blank to keep current"
                                  value={editForm.password || ""} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={saveUserEdit} disabled={savingUser}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                                <Check className="w-3 h-3" /> {savingUser ? "Saving..." : "Save"}
                              </button>
                              <button onClick={() => { setEditUser(null); setEditForm({}) }}
                                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}