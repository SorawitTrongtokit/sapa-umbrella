import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile } from '../lib/firebase';
import { UserProfile } from '../../../shared/schema';

interface UseUserAuthReturn {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useUserAuth = (): UseUserAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('Auth state changed:', authUser?.email || 'No user');
      setUser(authUser);
      
      if (authUser) {
        try {
          const profile = await getUserProfile(authUser.uid);
          console.log('User profile loaded:', profile?.firstName);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Consider user authenticated if they have Firebase auth (even without profile for faster UX)
  const isAuthenticated = !!user;

  return {
    user,
    userProfile,
    loading,
    isAuthenticated
  };
};
