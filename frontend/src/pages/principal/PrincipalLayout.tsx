import { Outlet } from "react-router-dom";
import PrincipalSidebar from "../../components/principal/PrincipalSidebar";

const PrincipalLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-(--bg-base)">
            <PrincipalSidebar />
            <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default PrincipalLayout;
