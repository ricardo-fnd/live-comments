'use server'

import { setAdminSession, clearAdminSession, isAdminSession } from '../lib/session.js'

export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const expectedUser = process.env.LIVE_COMMENTS_ADMIN_USERNAME
  const expectedPass = process.env.LIVE_COMMENTS_ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) {
    return { success: false, error: 'Admin credentials not configured on server' }
  }

  if (username !== expectedUser || password !== expectedPass) {
    return { success: false, error: 'Invalid credentials' }
  }

  await setAdminSession()
  return { success: true }
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession()
}

export async function checkAdminSession(): Promise<boolean> {
  return isAdminSession()
}
