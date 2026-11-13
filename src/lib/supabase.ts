import { createClient } from '@supabase/supabase-js'

const getStored = (key: string) => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null
  } catch {
    return null
  }
}

const sanitizeUrl = (raw: string) => {
  let u = raw.trim()
  if (u.endsWith('/rest/v1/')) u = u.slice(0, -9)
  if (u.endsWith('/rest/v1')) u = u.slice(0, -8)
  if (u.endsWith('/')) u = u.slice(0, -1)
  return u
}

const envUrl = sanitizeUrl((import.meta.env.VITE_SUPABASE_URL as string) || '')
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

const activeUrl = sanitizeUrl(getStored('ISOPAN_SUPABASE_URL') || envUrl || 'https://placeholder.supabase.co')
const activeKey = getStored('ISOPAN_SUPABASE_ANON_KEY') || envKey || 'placeholder-anon-key'

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(activeUrl) &&
    !activeUrl.toLowerCase().includes('tu_proyecto') &&
    !activeUrl.toLowerCase().includes('placeholder') &&
    Boolean(activeKey) &&
    !activeKey.toLowerCase().includes('placeholder')
  )
}

export const getSupabaseConfig = () => ({
  url: activeUrl,
  key: activeKey,
  isConfigured: isSupabaseConfigured(),
})

export const setSupabaseConfig = (url: string, key?: string) => {
  if (typeof window !== 'undefined') {
    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`
    }
    if (!cleanUrl.includes('.supabase.co') && !cleanUrl.includes('://')) {
      cleanUrl = `https://${cleanUrl}.supabase.co`
    }
    localStorage.setItem('ISOPAN_SUPABASE_URL', cleanUrl)
    if (key && key.trim()) {
      localStorage.setItem('ISOPAN_SUPABASE_ANON_KEY', key.trim())
    }
    window.location.reload()
  }
}

export const supabase = createClient(activeUrl, activeKey)
