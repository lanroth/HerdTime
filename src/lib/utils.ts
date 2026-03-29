import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VOTER_TOKEN_PREFIX = 'herdtime_voter_'
const ADMIN_TOKEN_PREFIX = 'herdtime_admin_'

export function getVoterToken(pollId: string): string | null {
  return localStorage.getItem(`${VOTER_TOKEN_PREFIX}${pollId}`)
}

export function setVoterToken(pollId: string, token: string): void {
  localStorage.setItem(`${VOTER_TOKEN_PREFIX}${pollId}`, token)
}

export function getAdminToken(pollId: string): string | null {
  return localStorage.getItem(`${ADMIN_TOKEN_PREFIX}${pollId}`)
}

export function setAdminToken(pollId: string, token: string): void {
  localStorage.setItem(`${ADMIN_TOKEN_PREFIX}${pollId}`, token)
}
