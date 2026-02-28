import { useState } from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Typography,
    Box,
} from "@mui/material";
import {
    LayoutDashboard,
    Building2,
    BookOpen,
    Users,
    CalendarDays,
    BarChart3,
    BellIcon,
    MessageSquare,
    LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../features/auth/auth.slice";

const drawerWidth = 260;

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, url: "/principal/dashboard" },
    { label: "Institute Profile", icon: Building2, url: "/principal/institute" },
    { label: "Departments", icon: BookOpen, url: "/principal/departments" },
    { label: "HOD Management", icon: Users, url: "/principal/hods" },
    { label: "Academic Sessions", icon: CalendarDays, url: "/principal/sessions" },
    { label: "Analytics", icon: BarChart3, url: "/principal/analytics" },
    { label: "Notifications", icon: BellIcon, url: "/principal/notifications" },
    { label: "Messenger", icon: MessageSquare, url: "/principal/messenger" },
];

const PrincipalSidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        setLoggingOut(true);
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
            {/* Logo / Header */}
            <Toolbar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text-on-dark)" }}>
                        Examora
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--brand-active)" }}>
                        Principal Panel
                    </Typography>
                </Box>
            </Toolbar>

            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />

            {/* Menu */}
            <List sx={{ mt: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url ||
                        location.pathname.startsWith(item.url + "/");

                    return (
                        <ListItemButton
                            component={Link}
                            to={item.url}
                            key={item.label}
                            sx={{
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                backgroundColor: isActive ? "var(--brand-primary)" : "transparent",
                                "&:hover": { transform: "scale(1.01)" },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? "var(--text-on-dark)" : "var(--brand-active)",
                                    minWidth: 36,
                                }}
                            >
                                <Icon size={20} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: "var(--text-on-dark)",
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Spacer + Logout */}
            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />
            <List>
                <ListItemButton
                    onClick={handleLogout}
                    disabled={loggingOut}
                    sx={{
                        mx: 1,
                        mb: 1,
                        borderRadius: 2,
                        "&:hover": { transform: "scale(1.01)" },
                    }}
                >
                    <ListItemIcon sx={{ color: "var(--status-danger)", minWidth: 36 }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--status-danger)",
                        }}
                    />
                </ListItemButton>
            </List>
        </Drawer>
    );
};

export default PrincipalSidebar;
