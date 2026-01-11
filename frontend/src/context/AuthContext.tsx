import { createContext, useContext, useEffect, useState } from "react";
import { getUserInfo } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'DIRECTOR';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize from localStorage when provider mounts
  useEffect(() => {
    try {
      const saved = getUserInfo();
      if (saved) {
        setUser(saved as User);
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore parse errors
      console.warn('Could not read saved user info', e);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}