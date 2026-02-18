import { useState } from "react";
import {
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Paper,
    Typography,
    Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

const roles = [
    { label: "Student", value: "student" },
    { label: "Teacher", value: "teacher" },
    { label: "HOD", value: "hod" },
    { label: "Admin", value: "admin" },
];

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--bg-base) p-4">
            <Paper
                elevation={0}
                className="w-full max-w-lg p-10 bg-(--bg-surface) border border-(--ui-border) rounded-2xl"
            >
                <Box className="mb-8">
                    <Typography variant="h4" className="font-bold text-(--text-primary) mb-2">
                        Examora
                    </Typography>
                    <Typography variant="body2" className="text-(--text-secondary)">
                        Create an account to access the smart proctoring dashboard.
                    </Typography>
                </Box>

                <form className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "var(--ui-border)" } } }}
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "var(--ui-border)" } } }}
                        />
                    </div>

                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "var(--ui-border)" } } }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "var(--ui-border)" } } }}
                    />

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: "var(--text-secondary)" }}>User Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            label="User Role"
                            onChange={handleChange}
                            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--ui-border)" } }}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        className="py-3 mt-2 normal-case text-lg font-medium shadow-none bg-(--brand-primary) hover:bg-(--text-secondary)"
                        sx={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        Register Account
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default RegisterPage;