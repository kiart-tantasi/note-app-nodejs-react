import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    main: false
}

const loadingSlice = createSlice({
    name: "loading",
    initialState: initialState,
    reducers: {
        turnOnIsLoading(state) {
            state.main = true;
        },
        turnOffIsLoading(state) {
            state.main = false;
        }
    }
});

export const loadingActions = loadingSlice.actions;
const loadingReducer = loadingSlice.reducer;
export default loadingReducer;