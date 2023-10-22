import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import loadingReducer from "./loadingSlice";
import notificationReducer from "./notificationSlice";
import postReducer from "./postSlice";
// IMPORT 4 SLICES

const store = configureStore({
    reducer: {
        auth: authReducer,
        loading: loadingReducer,
        notification: notificationReducer,
        post: postReducer
    }
})
export default store;

// "ReturnType<typeof store.getState>"
export type RootState = ReturnType<typeof store.getState>;

// "typeof store.dispatch"
export type AppDispatch = typeof store.dispatch;

// SOURCE: https://redux.js.org/usage/usage-with-typescript

