import { createSlice } from "@reduxjs/toolkit";

interface IAuthOptions {
    id: string;
    name: string;
    email: string;
    role: string;
}

const initialState: IAuthOptions = {
    id: "",
    name: "",
    email: "",
    role: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
        },
        clearAuth: (state) => {
            state.id = "";
            state.name = "";
            state.email = "";
            state.role = "";
        },
    },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
