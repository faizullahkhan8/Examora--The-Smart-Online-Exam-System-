import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/adminLayout";
import Institutes from "./pages/admin/Institutes";
import Messanger from "./pages/admin/Messanger";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";

const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    // admin pages
    {
        element: <AdminLayout />,
        children: [
            {
                path: "/admin/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/admin/institutes",
                element: <Institutes />,
            },
            {
                path: "/admin/messanger",
                element: <Messanger />,
            },
            {
                path: "/admin/users",
                element: <Users />,
            },
            {
                path: "/admin/audit-logs",
                element: <AuditLogs />,
            },
            {
                path: "/admin/notifications",
                element: <Notifications />,
            },
            {
                path: "/admin/settings",
                element: <Settings />,
            },
        ],
    },
    {
        path: "/auth/admin/register",
        element: <RegisterPage />,
    },
]);

export default AppRouter;
