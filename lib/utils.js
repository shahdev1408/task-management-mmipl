// lib/utils.js
import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':  return 'bg-emerald-100 text-emerald-800'
    case 'ONGOING':    return 'bg-blue-100 text-blue-800'
    case 'DELAYED':    return 'bg-red-100 text-red-800'
    case 'ALLOTTED':   return 'bg-purple-100 text-purple-800'
    case 'SUCCESSFUL': return 'bg-emerald-100 text-emerald-800'
    case 'PARTIAL':    return 'bg-amber-100 text-amber-800'
    case 'REGRET':     return 'bg-red-100 text-red-800'
    default:           return 'bg-gray-100 text-gray-800'
  }
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function calcDueDate(day0, offsetDays) {
  const d = new Date(day0)
  d.setDate(d.getDate() + offsetDays)
  return d
}