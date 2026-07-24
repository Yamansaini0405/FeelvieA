import { createContext, useContext, useState, useCallback } from "react";
import { login as loginRequest } from "../api/auth";
import { TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");

  const login = useCallback(async (email, password) => {
    setIsAuthenticating(true);
    setAuthError("");
    try {
      const response = await loginRequest(email, password);
      const receivedToken =
        response.data?.token ||
        response.data?.access ||
        response.data?.access_token;

      if (!receivedToken) {
        throw new Error("No token returned from server.");
      }

      localStorage.setItem(TOKEN_KEY, receivedToken);
      setToken(receivedToken);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Check your details and try again.";
      setAuthError(message);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = {
    token,
    isAuthenticated: Boolean(token),
    isAuthenticating,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
