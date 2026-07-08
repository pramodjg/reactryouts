// components/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login component
 * Renders a login form and authenticates the user via the AuthContext.
 * On success, redirects the user back to the page they originally
 * tried to visit (if any), or to the dashboard by default.
 */
const Login = () => {
    // Holds the controlled values of the email and password inputs
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Stores any error message returned from a failed login attempt
    const [error, setError] = useState("");

    // Tracks whether a login request is currently in progress
    // (used to disable the submit button and show a loading label)
    const [loading, setLoading] = useState(false);

    // Pulls the login function out of the auth context
    const { login } = useAuth();

    // Used to programmatically redirect the user after login
    const navigate = useNavigate();

    // Gives access to the location object, including any state
    // passed when the user was redirected here (e.g. from a protected route)
    const location = useLocation();

    // If the user was redirected to /login from another page,
    // location.state.from.pathname holds that original page.
    // Fall back to "/dashboard" if there's no such state.
    const from = location.state?.from?.pathname || "/dashboard";

    // Updates formData whenever an input value changes.
    // Uses the input's "name" attribute to know which field to update.
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handles form submission: prevents default page reload,
    // calls the login function, and navigates on success.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any previous error and show loading state
        setError("");
        setLoading(true);

        try {
            // Attempt to log in with the provided credentials
            await login(formData.email, formData.password);

            // On success, redirect to the original page (or dashboard),
            // replacing the current history entry so "back" doesn't return to login
            navigate(from, { replace: true });
        } catch (error) {
            // Log the raw error for debugging purposes
            console.log(error);

            // Show a user-friendly error message, falling back to a generic one
            // if the server didn't provide a specific message
            setError(error.response?.data?.message || "Login failed");
        } finally {
            // Reset loading state regardless of success or failure
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>

                {/* Display error message if login failed */}
                {error && <div className="error-message">{error}</div>}

                {/* Email input field */}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        autoComplete={"off"}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Password input field */}
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Submit button, disabled while a login request is in flight */}
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;