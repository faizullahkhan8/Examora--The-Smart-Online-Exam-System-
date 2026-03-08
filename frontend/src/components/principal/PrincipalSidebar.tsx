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
    BellIcon,
    LogOut,
    MailIcon,
    Video,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../features/auth/auth.slice";
import { useLogoutMutation } from "../../services/auth/auth.service";

const drawerWidth = 260;

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, url: "/principal/dashboard" },
    {
        label: "Institute Profile",
        icon: Building2,
        url: "/principal/institute",
    },
    { label: "Meetings", icon: Video, url: "/principal/meetings" },
    { label: "Departments", icon: BookOpen, url: "/principal/departments" },
    { label: "HOD Management", icon: Users, url: "/principal/hods" },
    {
        label: "Academic Sessions",
        icon: CalendarDays,
        url: "/principal/sessions",
    },
    { label: "Notifications", icon: BellIcon, url: "/principal/notifications" },
    { label: "Messenger", icon: MailIcon, url: "/principal/messenger" },
];

const PrincipalSidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [logoutMutation, { isLoading: loggingOut }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutMutation({}).unwrap();
        } catch (error) {
        } finally {
            dispatch(clearAuth());
            window.location.href = "/";
        }
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
                    borderRight: "1px solid var(--ui-divider)",
                },
            }}
        >
            <Toolbar sx={{ px: 3, py: 2 }}>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "var(--text-on-dark)",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Examora
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "var(--brand-active)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                        }}
                    >
                        Principal Panel
                    </Typography>
                </Box>
            </Toolbar>

            <Divider
                sx={{ backgroundColor: "var(--ui-divider)", opacity: 0.5 }}
            />

            <List sx={{ mt: 2, px: 2 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.url);

                    return (
                        <ListItemButton
                            component={Link}
                            to={item.url}
                            key={item.label}
                            sx={{
                                mb: 0.5,
                                borderRadius: "8px",
                                backgroundColor: isActive
                                    ? "var(--brand-primary)"
                                    : "transparent",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    backgroundColor: isActive
                                        ? "var(--brand-primary)"
                                        : "rgba(255,255,255,0.05)",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive
                                        ? "var(--text-on-dark)"
                                        : "var(--brand-active)",
                                    minWidth: 40,
                                }}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 700 : 500,
                                    color: "var(--text-on-dark)",
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider
                sx={{ backgroundColor: "var(--ui-divider)", opacity: 0.5 }}
            />

            <List sx={{ px: 2, py: 2 }}>
                <ListItemButton
                    onClick={handleLogout}
                    disabled={loggingOut}
                    sx={{
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{ color: "var(--status-danger)", minWidth: 40 }}
                    >
                        <LogOut size={20} strokeWidth={2.5} />
                    </ListItemIcon>
                    <ListItemText
                        primary={loggingOut ? "Logging out..." : "Logout"}
                        primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--status-danger)",
                        }}
                    />
                </ListItemButton>
            </List>
        </Drawer>
    );
};

export default PrincipalSidebar;
