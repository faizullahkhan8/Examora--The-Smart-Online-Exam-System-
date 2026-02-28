import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="flex">
            <AdminSidebar />
            <main className="flex-1 w-full min-h-screen">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout