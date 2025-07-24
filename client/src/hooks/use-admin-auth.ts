import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, adminLogin, adminLogout } from '@/lib/firebase';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return await adminLogin(email, password);
  };

  const logout = async () => {
    return await adminLogout();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
