import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setLoading(false);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, setToken, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
