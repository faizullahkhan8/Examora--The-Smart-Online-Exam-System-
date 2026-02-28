import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/auth.slice";
import { baseQuery } from "./services/BaseQuery";

const store = configureStore({
    reducer: {
        auth: authSlice,
        [baseQuery.reducerPath]: baseQuery.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseQuery.middleware),
});

export default store;
