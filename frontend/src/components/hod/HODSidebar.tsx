import { useState } from "react";
import {
    Drawer, List, ListItemButton, ListItemIcon,
    ListItemText, Toolbar, Divider, Typography, Box,
} from "@mui/material";
import {
    LayoutDashboard, CalendarDays, Users,
    GraduationCap, BookOpen, FileText,
    BellIcon, MessageSquare, LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../features/auth/auth.slice";

const drawerWidth = 260;

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, url: "/hod/dashboard" },
    { label: "Academic Sessions", icon: CalendarDays, url: "/hod/sessions" },
    { label: "Faculty", icon: Users, url: "/hod/faculty" },
    { label: "Students", icon: GraduationCap, url: "/hod/students" },
    { label: "Subjects", icon: BookOpen, url: "/hod/subjects" },
    { label: "Exams", icon: FileText, url: "/hod/exams" },
    { label: "Notifications", icon: BellIcon, url: "/hod/notifications" },
    { label: "Messenger", icon: MessageSquare, url: "/hod/messenger" },
];

const HODSidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [logging, setLogging] = useState(false);

    const handleLogout = () => {
        setLogging(true);
        dispatch(clearAuth());
        window.location.href = "/";
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    backgroundColor: "var(--bg-sidebar)",
                    color: "var(--text-on-dark)",
                },
            }}
        >
            <Toolbar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text-on-dark)" }}>
                        Examora
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--brand-active)" }}>
                        HOD Panel
                    </Typography>
                </Box>
            </Toolbar>

            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />

            <List sx={{ mt: 1 }}>
                {menuItems.map(({ label, icon: Icon, url }) => {
                    const isActive = location.pathname === url || location.pathname.startsWith(url + "/");
                    return (
                        <ListItemButton
                            key={label}
                            component={Link}
                            to={url}
                            sx={{
                                mx: 1, mb: 0.5, borderRadius: 2,
                                backgroundColor: isActive ? "var(--brand-primary)" : "transparent",
                                "&:hover": { transform: "scale(1.01)" },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive ? "var(--text-on-dark)" : "var(--brand-active)", minWidth: 36 }}>
                                <Icon size={20} />
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: "var(--text-on-dark)" }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />
            <List>
                <ListItemButton
                    onClick={handleLogout}
                    disabled={logging}
                    sx={{ mx: 1, mb: 1, borderRadius: 2, "&:hover": { transform: "scale(1.01)" } }}
                >
                    <ListItemIcon sx={{ color: "var(--status-danger)", minWidth: 36 }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: "var(--status-danger)" }}
                    />
                </ListItemButton>
            </List>
        </Drawer>
    );
};

export default HODSidebar;
