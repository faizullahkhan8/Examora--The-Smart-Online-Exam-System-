import { Outlet } from "react-router-dom";
import PrincipalSidebar from "../../components/principal/PrincipalSidebar";

const PrincipalLayout = () => {
    return (
        <div className="flex">
            <PrincipalSidebar />
            <main className="flex-1 w-full min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default PrincipalLayout;
