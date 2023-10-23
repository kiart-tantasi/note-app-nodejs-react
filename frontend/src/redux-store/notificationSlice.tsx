import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    offlineNotificationIsClosed: false,
    trialNotificationIsClosed: false,
}

const notificationSlice = createSlice({
    name: "notification",
    initialState: initialState,
    reducers: {
        closeOfflineNotification(state) {
            state.offlineNotificationIsClosed = true;
        },
        openOfflineNotification(state) {
            state.offlineNotificationIsClosed = false;
        },
        closeTrialNotification(state) {
            state.trialNotificationIsClosed = true;
        }
    }
});

export const notificationActions = notificationSlice.actions;
const notificationReducer = notificationSlice.reducer;
export default notificationReducer;