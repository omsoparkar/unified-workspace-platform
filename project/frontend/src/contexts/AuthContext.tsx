'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Organization, Membership } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  activeOrg: Organization | null;
  memberships: Membership[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, orgName: string) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setActiveOrg(data.activeOrg);
      setMemberships(data.memberships || []);
      if (data.activeOrg) {
        localStorage.setItem('activeOrgId', data.activeOrg.id);
      }
    } catch (err) {
      console.error('Auth refresh failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('activeOrgId');
      setUser(null);
      setActiveOrg(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('token', data.accessToken);
      if (data.activeOrg) {
        localStorage.setItem('activeOrgId', data.activeOrg.id);
      }
      setUser(data.user);
      setActiveOrg(data.activeOrg);
      setMemberships(data.memberships || []);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, orgName: string) => {
    setIsLoading(true);
    try {
      const data = await authService.register({ email, password, fullName, orgName });
      localStorage.setItem('token', data.accessToken);
      if (data.activeOrg) {
        localStorage.setItem('activeOrgId', data.activeOrg.id);
      }
      setUser(data.user);
      setActiveOrg(data.activeOrg);
      setMemberships(data.memberships || []);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrg = async (orgId: string) => {
    try {
      const res = await authService.switchOrg(orgId);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      localStorage.setItem('activeOrgId', res.activeOrg.id);
      setActiveOrg(res.activeOrg);
      await fetchCurrentUser();
    } catch (err) {
      console.error('Org switch failed:', err);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout request errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('activeOrgId');
      setUser(null);
      setActiveOrg(null);
      setMemberships([]);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        memberships,
        isLoading,
        login,
        register,
        switchOrg,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
