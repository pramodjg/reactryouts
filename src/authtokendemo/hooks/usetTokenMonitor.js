// src/hooks/useTokenMonitor.js
import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export const useTokenMonitor = () => {
    const { refreshUser, logout } = useAuth();

    const checkTokenExpiration = useCallback(async () => {
        const token = authService.getAccessToken();

        if (!token) {
            return;
        }

        // Check if token is expired or will expire soon
        if (authService.isTokenExpired(token)) {
            try {
                await authService.refreshToken();
                // Update user data from new token
                refreshUser();
            } catch (error) {
                console.error("Token refresh failed:", error);
                logout();
            }
        }
    }, [refreshUser, logout]);

    useEffect(() => {
        // Check token expiration every 5 minutes
        const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

        // Check immediately on mount
        checkTokenExpiration();

        // Listen for focus events to check token when user returns to tab
        const handleFocus = () => {
            checkTokenExpiration();
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", handleFocus);
        };
    }, [checkTokenExpiration]);

    return { checkTokenExpiration };
};