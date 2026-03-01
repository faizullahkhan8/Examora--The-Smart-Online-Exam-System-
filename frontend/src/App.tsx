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

// ─── HOD
import HODLayout from "./pages/hod/HODLayout";
import HODDashboard from "./pages/hod/HODDashboard";
import HODAcademicSessions from "./pages/hod/HODAcademicSessions";
import FacultyManagement from "./pages/hod/FacultyManagement";
import HODStudents from "./pages/hod/Students";
import HODSubjects from "./pages/hod/Subjects";
import HODExams from "./pages/hod/Exams";
import HODMessanger from "./pages/hod/HODMessanger";
import HODNotifications from "./pages/hod/HODNotifications";

// ─── Teacher
import TeacherLayout from "./pages/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MySubjects from "./pages/teacher/MySubjects";
import ExamPapers from "./pages/teacher/ExamPapers";
import ExamPaperBuilder from "./pages/teacher/ExamPaperBuilder";
import AttendancePage from "./pages/teacher/AttendancePage";
import MaterialsPage from "./pages/teacher/MaterialsPage";
import TeacherMessenger from "./pages/teacher/TeacherMessenger";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";

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

    // ─── HOD Routes (role=hod only) ───────────────────────────────────────────
    {
        element: <RequireRole allowedRoles={["hod"]} />,
        children: [
            {
                element: <HODLayout />,
                children: [
                    { path: "/hod/dashboard", element: <HODDashboard /> },
                    { path: "/hod/sessions", element: <HODAcademicSessions /> },
                    { path: "/hod/faculty", element: <FacultyManagement /> },
                    { path: "/hod/students", element: <HODStudents /> },
                    { path: "/hod/subjects", element: <HODSubjects /> },
                    { path: "/hod/exams", element: <HODExams /> },
                    { path: "/hod/messenger", element: <HODMessanger /> },
                    { path: "/hod/notifications", element: <HODNotifications /> },
                ],
            },
        ],
    },

    // ─── Teacher Routes (role=teacher only) ──────────────────────────────────
    {
        element: <RequireRole allowedRoles={["teacher"]} />,
        children: [
            // Builder is full-screen (no sidebar)
            { path: "/teacher/exam-papers/builder", element: <ExamPaperBuilder /> },
            {
                element: <TeacherLayout />,
                children: [
                    { path: "/teacher/dashboard", element: <TeacherDashboard /> },
                    { path: "/teacher/subjects", element: <MySubjects /> },
                    { path: "/teacher/exam-papers", element: <ExamPapers /> },
                    { path: "/teacher/attendance", element: <AttendancePage /> },
                    { path: "/teacher/materials", element: <MaterialsPage /> },
                    { path: "/teacher/messenger", element: <TeacherMessenger /> },
                    { path: "/teacher/notifications", element: <TeacherNotifications /> },
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

