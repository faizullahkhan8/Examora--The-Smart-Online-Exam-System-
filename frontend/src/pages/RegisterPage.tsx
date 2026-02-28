import { useState } from "react";
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useRegisterMutation } from "../services/auth/auth.service";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuth } from "../features/auth/auth.slice";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "admin", // by default one admin and then admin can create other types of accounts
    });

    const [register, { isLoading, isError, error }] = useRegisterMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await register(formData).unwrap();
        if (response.success) {
            toast.success("Registered successfully.");
            dispatch(setAuth(response.user))
            navigate("/admin/dashboard")
        }

    }

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

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                    {isError && (
                        <Typography className="text-red-500">
                            Something went wrong!
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        size="large"
                        variant="contained"
                        className="py-3 mt-2 normal-case text-lg font-medium shadow-none bg-(--brand-primary) hover:bg-(--text-secondary)"
                        sx={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Register Admin"}
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default RegisterPage;