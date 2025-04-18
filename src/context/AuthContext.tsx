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
    console.log('AuthContext - Checking initial auth state...');
    const storedUser = localStorage.getItem('user');
    console.log('AuthContext - Stored user data:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthContext - Setting initial user data:', userData);
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.profile?.is_admin || false);
      } catch (error) {
        console.error('AuthContext - Error parsing stored user data:', error);
        // Clear invalid stored data
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthContext - No stored user data found');
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.profile?.is_admin || false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      await userService.logoutUser();
    } finally {
      console.log('Clearing auth state...');
      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      localStorage.removeItem('user');
      console.log('Auth state cleared:', { user: null, isLoggedIn: false, isAdmin: false });
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