import type { Profile } from './database'

export type UserRole = 'admin' | 'analyst' | 'supervisor'

export interface AuthState {
  user: import('@supabase/supabase-js').User | null
  profile: Profile | null
  loading: boolean
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
