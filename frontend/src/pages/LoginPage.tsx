import { useState } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    FormControlLabel,
    Checkbox,
    Link,
} from "@mui/material";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--bg-base) p-4">
            <Paper
                elevation={0}
                className="w-full max-w-md p-10 bg-(--bg-surface) border border-(--ui-border) rounded-2xl"
            >
                <Box className="mb-8 text-center">
                    <Typography variant="h4" className="font-bold text-(--text-primary) mb-2">
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" className="text-(--text-secondary)">
                        Secure login for Examora smart sessions.
                    </Typography>
                </Box>

                <form className="flex flex-col gap-5">
                    <TextField
                        fullWidth
                        label="Email"
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

                    <Box className="flex items-center justify-between -mt-2">
                        <FormControlLabel
                            control={<Checkbox checked={formData.rememberMe} name="rememberMe" onChange={handleChange} sx={{ color: "var(--brand-primary)" }} />}
                            label={<Typography variant="body2" className="text-(--text-primary)">Remember me</Typography>}
                        />
                        <Link href="#" variant="body2" className="text-(--brand-primary) hover:text-(--text-primary) no-underline font-medium">
                            Forgot password?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        className="py-3 mt-2 normal-case text-lg font-medium shadow-none"
                        sx={{ backgroundColor: "var(--brand-primary)", "&:hover": { backgroundColor: "var(--text-secondary)" } }}
                    >
                        Sign In
                    </Button>

                    <Typography variant="body2" className="text-center text-(--text-secondary) mt-4">
                        New to Examora?{" "}
                        <Link href="/register" className="text-(--brand-primary) no-underline font-semibold">
                            Create Account
                        </Link>
                    </Typography>
                </form>
            </Paper>
        </div>
    );
};

export default LoginPage;