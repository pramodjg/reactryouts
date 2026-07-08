// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

// Create the context that will hold auth state and actions.
// No default value is passed so we can detect misuse (see useAuth below).
const AuthContext = createContext();

/**
 * Custom hook to access the AuthContext.
 * Throws an error if used outside of an AuthProvider so that
 * misuse is caught early during development instead of silently
 * returning `undefined`.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

/**
 * AuthProvider wraps the app (or a subtree) and supplies
 * authentication state (`user`, `loading`) and actions
 * (`login`, `logout`, `refreshUser`) to all descendants via context.
 */
export const AuthProvider = ({ children }) => {
    // Currently authenticated user object, or null if not logged in.
    const [user, setUser] = useState(null);

    // True while we're verifying the existing session on initial load.
    // Prevents UI from flashing a "logged out" state before we know
    // whether a valid session actually exists.
    const [loading, setLoading] = useState(true);

    // On mount, check whether the user already has a valid session
    // (e.g. via an HTTP-only cookie) by asking the server.
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Ask the backend if the current session/cookie is still valid.
                const userData = await authService.checkAuthStatus();

                if (userData) {
                    setUser(userData);
                }
                // If userData is null/undefined, user stays null (logged out).
            } catch (error) {
                console.error("Auth initialization error:", error);
                // Intentionally NOT logging the user out here — a network
                // error or transient server issue doesn't necessarily mean
                // the session/cookie is invalid, so we avoid forcing a logout.
            } finally {
                // Whether it succeeded or failed, we're done checking.
                setLoading(false);
            }
        };

        initializeAuth();
    }, []); // Empty deps: run once on mount only.

    /**
     * Logs the user in with the given credentials.
     * Updates context state on success; rethrows on failure so the
     * calling component (e.g. a login form) can handle/display the error.
     */
    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            return userData;
        } catch (error) {
            // Re-throw so the UI layer can show a validation/error message.
            throw error;
        }
    };

    /**
     * Logs the user out. Always clears local user state, even if the
     * server-side logout call fails, so the UI reflects "logged out"
     * immediately and doesn't get stuck.
     */
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
        }
    };

    /**
     * Re-reads the current user from the locally stored/decoded token
     * (without hitting the server) and syncs it into context state.
     * Useful after a token refresh or when user data may have changed
     * client-side (e.g. token was updated by an interceptor).
     */
    const refreshUser = () => {
        const userData = authService.getCurrentUser();
        setUser(userData);
        return userData;
    };

    // Value exposed to consumers of this context.
    const value = {
        user,
        login,
        logout,
        refreshUser,
        loading,
        // Considered authenticated only if BOTH the user object exists
        // AND a valid access token is present — guards against stale
        // state where one is set but the other isn't.
        isAuthenticated: !!user && !!authService.getAccessToken(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};