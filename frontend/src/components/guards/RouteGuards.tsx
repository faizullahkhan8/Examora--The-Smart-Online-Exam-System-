// Route Guard: redirect to login if not authenticated
// Role Guard: redirect to correct dashboard if role doesn't match

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// ─── Requires authentication ──────────────────────────────────────────────────
export const RequireAuth = () => {
    const { id } = useSelector((state: any) => state.auth);
    if (!id) return <Navigate to="/" replace />;
    return <Outlet />;
};

// ─── Requires specific role ───────────────────────────────────────────────────
interface RoleGuardProps {
    allowedRoles: string[];
    redirectTo?: string;
}

export const RequireRole = ({ allowedRoles, redirectTo }: RoleGuardProps) => {
    const { id, role } = useSelector((state: any) => state.auth);

    if (!id) return <Navigate to="/" replace />;

    if (!allowedRoles.includes(role)) {
        // Redirect to the correct default dashboard
        const fallback = redirectTo ?? getDashboardForRole(role);
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
};

// ─── Role → dashboard mapping ─────────────────────────────────────────────────
export function getDashboardForRole(role: string): string {
    switch (role) {
        case "admin":
            return "/admin/dashboard";
        case "principal":
            return "/principal/dashboard";
        case "hod":
            return "/hod/dashboard";
        case "teacher":
            return "/teacher/dashboard";
        case "student":
            return "/student/dashboard";
        default:
            return "/";
    }
}
