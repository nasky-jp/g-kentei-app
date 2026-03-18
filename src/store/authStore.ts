import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialize: () => Promise<() => void>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  onLogin: ((userId: string) => void) | null
  onLogout: (() => void) | null
  setCallbacks: (onLogin: (userId: string) => void, onLogout: () => void) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  loading: true,
  onLogin: null,
  onLogout: null,

  setCallbacks: (onLogin, onLogout) => {
    set({ onLogin, onLogout })
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null
    set({ session: data.session, user, loading: false })

    // 初回ロード時にログイン済みならonLoginを呼ぶ
    if (user) {
      get().onLogin?.(user.id)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[authStore] onAuthStateChange', event, session?.user?.id)
      const prevUser = get().user
      const nextUser = session?.user ?? null
      set({ session, user: nextUser })

      if (event === 'SIGNED_IN' && nextUser && prevUser?.id !== nextUser.id) {
        get().onLogin?.(nextUser.id)
      } else if (event === 'SIGNED_OUT') {
        get().onLogout?.()
      }
    })

    return () => subscription.unsubscribe()
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
  },
}))
