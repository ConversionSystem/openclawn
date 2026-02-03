import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores/userStore'
import { api } from '@/lib/api'

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: clearUser } = useUserStore()
  const queryClient = useQueryClient()

  // Fetch current user
  const { data, isLoading: queryLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: api.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Update store when data changes
  useEffect(() => {
    if (data) {
      setUser(data)
    } else if (error) {
      setUser(null)
    }
    setLoading(queryLoading)
  }, [data, error, queryLoading, setUser, setLoading])

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      window.location.href = '/login'
    },
  })

  const login = () => {
    window.location.href = '/api/auth/google'
  }

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    user,
    isLoading: isLoading || queryLoading,
    isAuthenticated,
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
  }
}
