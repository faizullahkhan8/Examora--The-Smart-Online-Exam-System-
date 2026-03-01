import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";

const TeacherLayout = () => (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
        <TeacherSidebar />
        <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Outlet />
        </Box>
    </Box>
);

export default TeacherLayout;
