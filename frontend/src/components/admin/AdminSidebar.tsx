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
    Layers,
    Users,
    FileText,
    Settings,
    LogOut,
    BellIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const drawerWidth = 260;

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
    { label: "Messanger", icon: Layers, url: "/admin/messanger" },
    { label: "Institutes", icon: Building2, url: "/admin/institutes" },
    { label: "Users", icon: Users, url: "/admin/users" },
    { label: "Audit Logs", icon: FileText, url: "/admin/audit-logs" },
    { label: "Notifications", icon: BellIcon, url: "/admin/notifications" },
    { label: "Settings", icon: Settings, url: "/admin/settings" },
];

const AdminSidebar = () => {
    const [activeTab, setActiveTab] = useState("Dashboard");

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
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "var(--text-on-dark)" }}
                    >
                        Examora
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: "var(--brand-active)" }}
                    >
                        Admin Panel
                    </Typography>
                </Box>
            </Toolbar>

            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />

            {/* Menu */}
            <List sx={{ mt: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.label;

                    return (
                        <ListItemButton
                            component={Link}
                            to={item.url}
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            sx={{
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                backgroundColor: isActive
                                    ? "var(--brand-primary)"
                                    : "transparent",
                                "&:hover": {
                                    transform: "scale(1.01)",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive
                                        ? "var(--text-on-dark)"
                                        : "var(--brand-active)",
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
                                    color: isActive
                                        ? "var(--text-on-dark)"
                                        : "var(--text-on-dark)",
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Bottom Section */}
            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ backgroundColor: "var(--ui-divider)" }} />

            <List>
                <ListItemButton
                    sx={{
                        mx: 1,
                        mb: 1,
                        borderRadius: 2,
                        "&:hover": {
                            transform: "scale(1.01)",
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{ color: "var(--status-danger)", minWidth: 36 }}
                    >
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

export default AdminSidebar;
