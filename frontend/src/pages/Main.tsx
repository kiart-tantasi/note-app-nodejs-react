import React, { useEffect } from 'react';
import AddNote from '../components/AddNote';
import Notes from "../components/Notes";
import Edit from "../components/EditRoute";
import Popup from '../modals/Popup';

import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { notificationActions } from '../redux-store/notificationSlice';
import { useNavigate } from 'react-router-dom';

export default function Main() {
    // REDUX
    const dispatch = useAppDispatch();
    const offlineNotificationIsClosed = useAppSelector(state => state.notification.offlineNotificationIsClosed);

    // NAVIGATE
    const navigate = useNavigate();
    const handleNavigateToAuthPage = () => {
        navigate("/account");
    }

    // POPUP PROPS
    const onConfirmProps = {
        fn: handleNavigateToAuthPage,
        text: "ลองเลย!"
    }

    useEffect(() => {
        console.log("RENDERED.");
    }, [])

    return (
        <React.Fragment>

            {/* POPUP WHEN USING OFFLINE MODE */}
            {!offlineNotificationIsClosed && 
            <Popup 
                onClick={() => dispatch(notificationActions.closeOfflineNotification())}
                mainText="คุณกำลังใช้งานโหมดออฟไลน์"
                extraText="ใช้งานโหมดออนไลน์เพื่อประสิทธิภาพสูงสุด!" 
                onConfirm={onConfirmProps}
            />}

            {/* MAIN CONTENT */}
            <AddNote />
            <Notes />

            {/* FOR EDITING MODE */}
            <Edit />

        </React.Fragment>
    )
}
