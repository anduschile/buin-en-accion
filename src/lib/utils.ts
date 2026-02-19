import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeTrafficLevel(level: string): 'low' | 'medium' | 'high' {
  const l = level?.toLowerCase() || ''
  if (['high', 'alto', 'critical'].includes(l)) return 'high'
  if (['medium', 'medio', 'moderate'].includes(l)) return 'medium'
  return 'low'
}
