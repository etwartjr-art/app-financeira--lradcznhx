import { useAuth as useOriginalAuth } from '@/hooks/use-auth'

export function useAuth() {
  const { user, currentUser, loading, signIn, signUp, signOut } = useOriginalAuth()

  return {
    user: currentUser || user,
    currentUser: currentUser || user,
    isLoading: loading,
    error: null,
    login: signIn,
    signup: signUp,
    logout: signOut,
  }
}
