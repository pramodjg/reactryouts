//components/AuthenticatedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthenticatedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        // Redirect to dashboard page with return url
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthenticatedRoute;