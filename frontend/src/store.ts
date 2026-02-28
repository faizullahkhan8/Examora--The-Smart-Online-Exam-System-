import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import authSlice from "./features/auth/auth.slice";
import { baseQuery } from "./services/BaseQuery";

// ─── Persist only the auth slice ─────────────────────────────────────────────
const authPersistConfig = {
    key: "examora_auth",
    storage,
    whitelist: ["id", "name", "email", "role"],
};

const persistedAuth = persistReducer(authPersistConfig, authSlice);

// ─── Store ────────────────────────────────────────────────────────────────────
const store = configureStore({
    reducer: {
        auth: persistedAuth,
        [baseQuery.reducerPath]: baseQuery.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Required: ignore redux-persist action types in serializability check
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }).concat(baseQuery.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
