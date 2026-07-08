// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTokenMonitor } from "../hooks/usetTokenMonitor";
import apiService from "../services/apiService";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Monitor token expiration
    useTokenMonitor();

    useEffect(() => {
        fetchProtectedData();
    }, []);

    const fetchProtectedData = async () => {
        try {
            setLoading(true);
            const response = await apiService.get("/protected-endpoint");
            setData(response.data);
            setError("");
              } catch (error) {
            console.error("Failed to fetch data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.username}!</span>
                    <span className="user-email">({user?.email})</span>
                    <button onClick={fetchProtectedData}>Refresh Data</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}

                <div className="user-details">
                    <h3>User Information (from JWT)</h3>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>

                <div className="data-section">
                    <h2>Protected Data</h2>
                    {data ? (
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    ) : (
                        <p>No data available</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;