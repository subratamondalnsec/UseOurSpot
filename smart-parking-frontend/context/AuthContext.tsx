"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Define the shape of our User object
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the shape of our Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token and user in localStorage on initial load
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(storedToken);
        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Set state
    setToken(newToken);
    setUser(newUser);

    // Set localStorage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    // Set cookie (so middleware can also access it if needed)
    document.cookie = `token=${newToken}; path=/; max-age=604800; SameSite=Lax`;

    // Set default axios header
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Clear axios header
    delete axios.defaults.headers.common["Authorization"];

    // Use router to redirect after logout
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
