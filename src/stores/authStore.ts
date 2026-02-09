import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'currency'>>) => Promise<{ success: boolean; error?: string }>
  fetchProfile: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true })

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Failed to get session:', error)
            set({ isLoading: false, isInitialized: true })
            return
          }

          if (session?.user) {
            set({ user: session.user, session })
            await get().fetchProfile()
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event)

            if (event === 'SIGNED_IN' && session?.user) {
              set({ user: session.user, session })
              await get().fetchProfile()
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, profile: null })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session })
            }
          })

          set({ isLoading: false, isInitialized: true })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ isLoading: false, isInitialized: true, error: 'Failed to initialize auth' })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          if (data.user && data.session) {
            set({ user: data.user, session: data.session })
            await get().fetchProfile()
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      signUp: async (email: string, password: string, displayName?: string) => {
        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
              },
            },
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          // Check if email confirmation is required
          if (data.user && !data.session) {
            set({ isLoading: false })
            return { success: true, error: 'Please check your email to confirm your account' }
          }

          if (data.user && data.session) {
            set({ user: data.user, session: data.session })
            await get().fetchProfile()
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })
          await supabase.auth.signOut()
          set({ user: null, session: null, profile: null, isLoading: false })
        } catch (error) {
          console.error('Sign out error:', error)
          set({ isLoading: false })
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            // Profile might not exist yet for new users
            if (error.code === 'PGRST116') {
              console.log('Profile not found, will be created on first access')
              return
            }
            console.error('Failed to fetch profile:', error)
            return
          }

          set({ profile: data })
        } catch (error) {
          console.error('Fetch profile error:', error)
        }
      },

      updateProfile: async (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'currency'>>) => {
        const { user } = get()
        if (!user) {
          return { success: false, error: 'Not authenticated' }
        }

        try {
          set({ isLoading: true, error: null })

          const { data, error } = await supabase
            .from('user_profiles')
            .update(updates as never)
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          set({ profile: data as UserProfile, isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Profile update failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: () => ({
        // Only persist minimal state, session is managed by Supabase
      }),
    }
  )
)
