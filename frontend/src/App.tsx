import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

// ─── Admin
import AdminLayout from "./pages/admin/adminLayout";
import Dashboard from "./pages/admin/AdminDashboard";
import Institutes from "./pages/admin/Institutes";
import Messanger from "./pages/admin/Messanger";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";

// ─── Principal
import PrincipalLayout from "./pages/principal/PrincipalLayout";
import PrincipalDashboard from "./pages/principal/PrincipalDashboard";
import Departments from "./pages/principal/Departments";
import HODManagement from "./pages/principal/HODManagement";
import AcademicSessions from "./pages/principal/AcademicSessions";
import InstituteProfile from "./pages/principal/InstituteProfile";
import Analytics from "./pages/principal/Analytics";
import PrincipalMessanger from "./pages/principal/Messanger";
import PrincipalNotifications from "./pages/principal/Notifications";

// ─── Route Guards
import { RequireRole } from "./components/guards/RouteGuards";

const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },

    // ─── Admin Routes (role=admin only) ──────────────────────────────────────
    {
        element: <RequireRole allowedRoles={["admin"]} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: "/admin/dashboard", element: <Dashboard /> },
                    { path: "/admin/institutes", element: <Institutes /> },
                    { path: "/admin/messanger", element: <Messanger /> },
                    { path: "/admin/users", element: <Users /> },
                    { path: "/admin/audit-logs", element: <AuditLogs /> },
                    { path: "/admin/notifications", element: <Notifications /> },
                    { path: "/admin/settings", element: <Settings /> },
                ],
            },
        ],
    },

    // ─── Principal Routes (role=principal only) ───────────────────────────────
    {
        element: <RequireRole allowedRoles={["principal"]} />,
        children: [
            {
                element: <PrincipalLayout />,
                children: [
                    { path: "/principal/dashboard", element: <PrincipalDashboard /> },
                    { path: "/principal/departments", element: <Departments /> },
                    { path: "/principal/hods", element: <HODManagement /> },
                    { path: "/principal/sessions", element: <AcademicSessions /> },
                    { path: "/principal/institute", element: <InstituteProfile /> },
                    { path: "/principal/analytics", element: <Analytics /> },
                    { path: "/principal/messenger", element: <PrincipalMessanger /> },
                    { path: "/principal/notifications", element: <PrincipalNotifications /> },
                ],
            },
        ],
    },

    {
        path: "/auth/admin/register",
        element: <RegisterPage />,
    },
]);

export default AppRouter;
