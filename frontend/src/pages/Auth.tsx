import React, { useRef, useState } from 'react'
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";
import Alert from '../modals/AlertModal';
import Popup from "../modals/Popup";
import CircularProgress from '@mui/material/CircularProgress';
import { FetchOptionsModel } from '../interfaces/interfaces';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { notificationActions } from '../redux-store/notificationSlice';

export default function Auth(props:{onRefreshData: () => void}) {

    // NAVIGATE
    const navigate = useNavigate();

    // STATES
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [ registering, setRegistering ] = useState(false);
    const [alertMessage,setAlertMessage] = useState("");
    const [alertOn, setAlertOn] = useState(false);
    const [pendingLogin, setPendingLogin] = useState(false);
    const [pendingLogout, setPendingLogout] = useState(false);

    // REDUX
    const dispatch = useAppDispatch();
    const trialNotificationIsClosed = useAppSelector(state => state.notification.trialNotificationIsClosed);
    const { isLoggedIn, userName } = useAppSelector(state => state.auth);
    
    // --------------------------- SUBMIT FORM ----------------------------- //
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // ----- FORM VALIDATION ----- //
        const username = usernameRef.current!.value;
        const password = passwordRef.current!.value;
        if (!username || !password) {
            setAlertMessage("โปรดระบุ username และ password");
            setAlertOn(true);
            return;
        }

        const options: FetchOptionsModel = {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username:username, password:password}),
            credentials: "include"
        }
        // ----- REGISTER ----- //
        if (registering) {
            setPendingLogin(true);
            fetch("/api/register", options)
            .then(res => {
                if (res.ok) {
                    console.log("registered successfully");
                    usernameRef.current!.value = "";
                    passwordRef.current!.value = "";
                    setPendingLogin(false);
                    setAlertMessage("ลงทะเบียนสำเร็จ");
                    setAlertOn(true);
                    setRegistering(false);
                } else if (res.status === 403) {
                    setPendingLogin(false);
                    setAlertMessage("username นี้ถูกใช้งานแล้ว");
                    setAlertOn(true);
                } else {
                    setPendingLogin(false);
                    setAlertMessage("การลงทะเบียนล้มเหลว");
                    setAlertOn(true);
                }
            })
        // ----- LOGIN ----- //
        } else if (!registering) {
            setPendingLogin(true);
            fetch("/api/login", options)
            .then(res => {
                if (res.ok) {
                    console.log("logged in successfully");
                    props.onRefreshData();
                    navigate("/posts",{ replace: true });
                } else if (res.status === 401) {
                    setPendingLogin(false);
                    setAlertMessage("username หรือ password ไม่ถูกต้อง");
                    setAlertOn(true);
                } else {
                    setPendingLogin(false);
                    setAlertMessage("การเข้าสู่ระบบล้มเหลว");
                    setAlertOn(true);
                }
            })
            .catch((err) => {
                setPendingLogin(false);
                console.log(err.message);
            });
        }
    }
    // --------------------------------------------------------------------- //

    // LOGOUT
    function handleLogOut() {
        setPendingLogout(true);
        fetch("/api/logout", {credentials:"include", method:"POST"})
        .then(res => {
          if (res.ok) {
            console.log("logged out successfully");
            props.onRefreshData();
          } else {
            props.onRefreshData();
            throw new Error("failed logging out.")
          }
        })
        .catch(err => console.log(err.message));
    }

    function closeModal() {
        setAlertOn(false);
    }
    
    // PRESS "ENTER" TO GO FROM USERNAME INPUT TO PASSWORD INPUT
    function handleUsernameKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            passwordRef.current!.focus();
        }
    }
    
    // PRESS "ENTER" OR "ESC" TO CLOSE MODAL
    window.onkeydown = (e) => {
        if (alertOn === true) {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                closeModal();
            }
        }
    }

    const publicDomain = process.env.REACT_APP_API_DOMAIN;

    // IF NOT LOGGED IN, SHOW LOGIN / REGISTER FORM
    if (!isLoggedIn) {
        return (
            <>

            {/* ALERT MODAL */}
            {alertOn && <Alert message={alertMessage} onClose={closeModal} />}

            {/* TRIAL NOTIFICATION (WHEN OFFLINE) */}
            {!trialNotificationIsClosed &&
            <Popup 
                onClick={() => dispatch(notificationActions.closeTrialNotification())}
                mainText="ทดลองใช้งาน username = admin"
                extraText="password = my_password_123"
            />}

            {/* MAIN CONTENT */}
            <div className={styles.mainAuth}>

                {/* BUTTON TO CHANGE FORM TYPE (LOGIN || REGISTER) */}
                <button
                    className={`${styles.toggleAuth} ${styles["two-buttons"]}`}
                    onClick={() => setRegistering(!registering)}
                >
                ต้องการ{(registering) ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
                </button>

                <br/><br/>

                {/* FORM */}
                <form onSubmit={handleSubmit}>

                    {/* USERNAME */}
                    <label htmlFor="username" className={styles.labelUsernamePassword}>username</label>
                    <br/>
                    <input type="text" ref={usernameRef} name="username" autoComplete="off" onKeyDown={handleUsernameKeyDown} />
                    <br/><br/>

                    {/* PASSWORD */}
                    <label htmlFor="password" className={styles.labelUsernamePassword}>password</label>
                    <br/>
                    <input type="password" ref={passwordRef} name="password" autoComplete="off" />
                    <br/><br/>

                    {/* SUBMIT BUTTON OR SPINNER */}
                    {!pendingLogin ?

                    // BUTTON (REGISTER || LOGIN)
                    <button 
                        className={`${styles.submitAuth} ${styles["two-buttons"]}`}
                        type="submit"
                    >
                    {(registering) ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
                    </button> :

                    // SPINNER (WHEN PENDING)
                    <CircularProgress size={25} color="inherit" className={styles["spinner-ui"]} />

                    }
                    {publicDomain !== undefined && (
                        <>
                            <br/><br/>
                            <button
                                type="button"
                                className={styles.googleAuth}>
                                <a
                                className={styles.googleA}
                                href={`${process.env.REACT_APP_API_DOMAIN}/api/auth/google`}>
                                    เข้าสู่ระบบ/สมัครโดย GOOGLE
                                </a>
                            </button>
                        </>
                    )}

                </form>

            </div>

            </>
        )
    }

    // IF LOGGED IN, SHOW LOG OUT BUTTON
    return (
        <div className={styles.mainAuth}>

            {/* USERNAME */}
            {!pendingLogout && <h1 className={styles.userName}>{userName || ""}</h1>}
            <br/>

            {/* LOGOUT BUTTON || SPINNER */}
            {!pendingLogout ?

            // LOGOUT BUTTON
            <button className={styles.logoutButton} type="button" onClick={handleLogOut}>ออกจากระบบ</button> :

            // SPINNER (WHEN PENDING)
            <CircularProgress color="inherit" className={styles["spinner-ui"]} />
            
            }

            <br/><br/>

        </div>
    )
}
