// services/authService.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Base URL for all auth-related API endpoints
const API_URL = "http://localhost:5173/api/auth/";

// Mock API (currently unused by AuthService below, kept for reference/testing)
// Replace with real endpoint calls, or remove once the real backend is wired up
const api = {
    // JWT Login
    login: async (email, password) => {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (email && password) {
            return {
                data: {
                    id: 1,
                    email,
                    username: "John Doe",
                    accessToken: "mock_jwt_access_token_" + Date.now(),
                    refreshToken: "mock_jwt_refresh_token_" + Date.now(),
                },
            };
        }
        throw new Error("Invalid credentials");
    },
};

/**
 * Handles authentication for the app.
 *
 * Design notes:
 * - The access token lives only in memory (this.accessToken), never in
 *   localStorage/sessionStorage, to reduce exposure to XSS attacks.
 * - The refresh token is expected to be set by the server as an httpOnly
 *   cookie, so it's never directly accessible from JavaScript.
 * - isRefreshing / failedQueue support a "queue requests while refreshing"
 *   pattern, typically used by an axios interceptor: when a request fails
 *   with 401, queue it, trigger a single refresh call, then replay all
 *   queued requests once the new token is available.
 */
class AuthService {
    constructor() {
        // Prevents multiple simultaneous refresh calls
        this.isRefreshing = false;
        // Requests that failed while a token refresh was in progress
        this.failedQueue = [];
        // Access token is kept in memory only (not persisted to storage)
        this.accessToken = null;
    }

    /**
     * Ensures axios sends cookies (e.g. the httpOnly refresh token cookie)
     * with every request by default. Should be called once on app startup.
     */
    configureAxios() {
        axios.defaults.withCredentials = true;
    }

    /**
     * Logs a user in with username/password.
     * On success, stores the access token in memory and returns the
     * decoded user payload. The server is expected to also set the
     * refresh token as an httpOnly cookie in the response.
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise<object|null>} decoded user info from the access token
     */
    async login(username, password) {
        try {
            const response = await axios.post(
                API_URL + "signin",
                { username, password },
                { withCredentials: true } // Include cookies in request
            );

            // Access token should be returned in response body for memory storage
            // Refresh token should be set as httpOnly cookie by server
            if (response.data.accessToken) {
                this.accessToken = response.data.accessToken;
                return this.decodeToken(response.data.accessToken);
            }

            throw new Error("No access token received");
        } catch (error) {
            // Bubble the error up so callers (e.g. login form) can show a message
            throw error;
        }
    }

    /**
     * Logs the user out.
     * Clears all in-memory auth state immediately (so the UI updates right
     * away) and then asynchronously notifies the server to clear the
     * httpOnly refresh token cookie. Logout errors are swallowed since the
     * client-side state is already cleared regardless of server response.
     *
     * @returns {Promise<void>}
     */
    logout() {
        // Clear memory token
        this.accessToken = null;
        this.isRefreshing = false;
        this.failedQueue = [];

        // Call logout endpoint to clear httpOnly cookie
        return axios
            .post(API_URL + "logout", {}, { withCredentials: true })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    }

    /**
     * Registers a new user account.
     *
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<import("axios").AxiosResponse>}
     */
    register(username, email, password) {
        return axios.post(
            API_URL + "signup",
            { username, email, password },
            { withCredentials: true }
        );
    }

    /**
     * Decodes a JWT and returns normalized user info.
     * If no token is passed, falls back to the token currently held in
     * memory. Automatically clears the stored token if it's expired or
     * fails to decode.
     *
     * @param {string|null} token - JWT to decode; defaults to this.accessToken
     * @returns {object|null} decoded user info, or null if invalid/expired/missing
     */
    decodeToken(token = null) {
        const tokenToUse = token || this.accessToken;
        if (!tokenToUse) {
            return null;
        }

        try {
            const decoded = jwtDecode(tokenToUse);

            // Check if token is expired
            const currentTime = Date.now() / 1000; // JWT exp is in seconds
            if (decoded.exp < currentTime) {
                this.accessToken = null;
                return null;
            }

            // Normalize the decoded payload into a consistent shape,
            // since different backends may use different claim names
            return {
                id: decoded.sub || decoded.id,
                username: decoded.username,
                email: decoded.email,
                roles: decoded.roles || [],
                exp: decoded.exp,
                iat: decoded.iat,
            };
        } catch (error) {
            // Malformed/invalid token — treat as logged out
            console.error("Token decode error:", error);
            this.accessToken = null;
            return null;
        }
    }

    /**
     * Convenience accessor for the currently logged-in user, derived from
     * the in-memory access token.
     *
     * @returns {object|null}
     */
    getCurrentUser() {
        return this.decodeToken();
    }

    /**
     * Returns the raw access token currently held in memory.
     * Useful for attaching an Authorization header to requests.
     *
     * @returns {string|null}
     */
    getAccessToken() {
        return this.accessToken;
    }

    /**
     * Checks whether a token is already expired, or will expire within the
     * next 5 minutes. Used to proactively refresh before the token actually
     * expires (avoids failed requests due to timing races).
     *
     * @param {string|null} token - JWT to check; defaults to this.accessToken
     * @returns {boolean} true if expired, about to expire, missing, or invalid
     */
    isTokenExpired(token = null) {
        const tokenToUse = token || this.accessToken;
        if (!tokenToUse) return true;
        try {
            const decoded = jwtDecode(tokenToUse);
            const currentTime = Date.now() / 1000;
            const bufferTime = 5 * 60; // 5 minutes buffer
            return decoded.exp < currentTime + bufferTime;
        } catch (error) {
            // Can't decode -> treat as expired/invalid
            return true;
        }
    }

    /**
     * Requests a new access token using the httpOnly refresh token cookie
     * (sent automatically by the browser via withCredentials).
     * Updates the in-memory access token on success, or clears it on failure.
     *
     * @returns {Promise<string>} the new access token
     */
    async refreshToken() {
        try {
            // Refresh token is sent automatically as httpOnly cookie
            const response = await axios.post(API_URL + "refresh", {}, { withCredentials: true });
            if (response.data.accessToken) {
                this.accessToken = response.data.accessToken;
                return response.data.accessToken;
            }

            throw new Error("No access token in refresh response");
        } catch (error) {
            // Refresh failed, clear memory token
            this.accessToken = null;
            throw error;
        }
    }

    /**
     * Verifies the current session by calling a protected "me" endpoint.
     * If the server issues a fresh access token in the response, it's
     * stored in memory. Useful for validating auth state on app load
     * (e.g. after a page refresh, when memory has been wiped).
     *
     * @returns {Promise<object|null>} decoded user info, or null if not authenticated
     */
    async checkAuthStatus() {
        try {
            const response = await axios.get(API_URL + "me", {
                withCredentials: true,
                headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
            });

            if (response.data.accessToken) {
                this.accessToken = response.data.accessToken;
            }

            return this.decodeToken();
        } catch (error) {
            // Not authenticated, or request failed — clear any stale token
            this.accessToken = null;
            return null;
        }
    }

    /**
     * Resolves or rejects all requests that were queued while a token
     * refresh was in progress. Called once the refresh completes.
     *
     * @param {Error|null} error - if set, rejects all queued requests with this error
     * @param {string|null} token - if error is null, resolves queued requests with this token
     */
    processQueue(error, token = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    /**
     * Adds a pending request's resolve/reject pair to the queue, to be
     * replayed once an in-flight token refresh finishes. Intended to be
     * used from an axios response interceptor when a 401 is hit.
     *
     * @param {Function} resolve
     * @param {Function} reject
     */
    addToQueue(resolve, reject) {
        this.failedQueue.push({ resolve, reject });
    }
}

// Create singleton instance so the whole app shares one auth state
const authService = new AuthService();

// Configure axios globally (enable credentials/cookies on all requests)
authService.configureAxios();

export default authService;