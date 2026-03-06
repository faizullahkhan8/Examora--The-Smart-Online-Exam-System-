import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-(--bg-base)">
            <AdminSidebar />
            <main className="flex-1 h-full overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;