import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import HODSidebar from "../../components/hod/HODSidebar";

const HODLayout = () => (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
        <HODSidebar />
        <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Outlet />
        </Box>
    </Box>
);

export default HODLayout;
