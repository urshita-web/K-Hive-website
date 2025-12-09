import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => usersApi.getUserProfile(userId),
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};