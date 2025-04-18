import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/services/userService';

interface User {
  id: string;
  email: string;
  profile?: {
    is_admin: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.profile?.is_admin || false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.profile?.is_admin || false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    const result = await userService.logoutUser();
    if (result.success) {
      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 