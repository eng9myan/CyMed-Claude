"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, userObj: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem("cymed_token");
    const storedUser = localStorage.getItem("cymed_user");
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } else if (pathname !== "/login" && !pathname.startsWith("/portal")) {
       // Protect routes, but allow portal (which will have its own auth simulation)
       router.push("/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    // Override global fetch to inject token
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      
      if (typeof resource === 'string' && resource.startsWith('http://localhost:8000/api/v1/') && !resource.includes('/auth/token')) {
        config = config || {};
        const headers = new Headers(config.headers || {});
        
        // Only inject if we have a token
        const currentToken = localStorage.getItem("cymed_token");
        if (currentToken) {
          headers.set('Authorization', `Bearer ${currentToken}`);
        }
        
        config.headers = headers;
        args[1] = config;
      }
      
      const response = await originalFetch(...args);
      
      // If unauthorized, logout
      if (response.status === 401 && pathname !== "/login") {
         localStorage.removeItem("cymed_token");
         localStorage.removeItem("cymed_user");
         setToken(null);
         setUser(null);
         router.push("/login");
      }
      
      return response;
    };

    return () => {
       window.fetch = originalFetch;
    };
  }, [pathname, router]);

  const login = (newToken: string, userObj: any) => {
    localStorage.setItem("cymed_token", newToken);
    localStorage.setItem("cymed_user", JSON.stringify(userObj));
    setToken(newToken);
    setUser(userObj);
    router.push("/command_center");
  };

  const logout = () => {
    localStorage.removeItem("cymed_token");
    localStorage.removeItem("cymed_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
