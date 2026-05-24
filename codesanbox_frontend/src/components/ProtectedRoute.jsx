import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protects routes that require authentication (e.g. /home)
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-sm">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500"></span>
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protects routes that should only be accessible by unauthenticated users (e.g. / and /signup)
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-sm">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500"></span>
          <span>Checking login...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};
