import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: {isLoggedIn: boolean; userName: string} = {
    isLoggedIn: false,
    userName: ""
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        logIn(state) {
            state.isLoggedIn = true;
        },
        logOut(state) {
            state.isLoggedIn = false;
        },
        setUserName(state, action: PayloadAction<string>) {
            state.userName = action.payload;            
        }
    }
})

export const authActions = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;