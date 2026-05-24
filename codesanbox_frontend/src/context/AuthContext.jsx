import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:3000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("codesandbox_user");
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("codesandbox_token") || null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Synchronize token and user in local storage
  useEffect(() => {
    if (token) {
      localStorage.setItem("codesandbox_token", token);
    } else {
      localStorage.removeItem("codesandbox_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("codesandbox_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("codesandbox_user");
    }
  }, [user]);

  // Login handler
  const login = async (emailid, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailid, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Zod validation errors
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.join(", "));
        }
        throw new Error(data.message || "Failed to log in");
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (username, emailid, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, emailid, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Zod validation errors
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.join(", "));
        }
        throw new Error(data.message || "Failed to register");
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    localStorage.removeItem("codesandbox_token");
    localStorage.removeItem("codesandbox_user");
  };

  // Authenticated fetch wrapper for future requests
  const authFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout();
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        signup,
        logout,
        authFetch,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
