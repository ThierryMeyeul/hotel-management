import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";

interface RoleRouteProps {
    children: JSX.Element;
    requiredRole: string | string[]; // accept single role or array of roles
}

export default function RoleRoute({ children, requiredRole }: RoleRouteProps) {
    const { user } = useAuth();

    const location = useLocation();

    if (!user) {
        // redirect to login and keep current location to come back after login
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowed.includes(user!.role)) {
        return <Navigate to="/not-authorized" replace />;
    }

    return children;
}