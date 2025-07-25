import { useUserAuth } from './use-user-auth';

export const useRoleAccess = () => {
  const { userProfile, user, loading } = useUserAuth();

  const isUser = userProfile?.role === 'user';
  const isAdmin = userProfile?.role === 'admin';
  const isOwner = userProfile?.role === 'owner';
  
  // Admin includes both admin and owner
  const hasAdminAccess = isAdmin || isOwner;
  const hasOwnerAccess = isOwner;

  return {
    user,
    userProfile,
    loading,
    isUser,
    isAdmin,
    isOwner,
    hasAdminAccess,
    hasOwnerAccess,
    isAuthenticated: !!user && !!userProfile
  };
};
